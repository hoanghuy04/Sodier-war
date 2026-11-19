// ---- botwatch ----
// Ported from Ant War (commit 63945dd). Spots accounts that look like bots / AI agents, quarantines them while the owner
// decides, and asks the owner on Telegram (inline URL buttons: Ban / Cho chơi lại).
//
// Flow: every client command is recorded (record) -> a 30 s sweep (sweep) scores each player -> score >= threshold puts the
// player in "pending": connections are dropped, new logins/commands are refused and the player counts as OFFLINE for the
// game (the existing offline logic then plugs the nest by itself in rain and opens it again when they return). The owner
// gets a Telegram message with two buttons. "ban" keeps the lock for good, "clear" lifts it and whitelists the player for
// 7 days (the nest opens again by itself because the player is online again). Nothing is banned without the owner.
import fs from 'node:fs';
import path from 'node:path';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type http from 'node:http';

export type Status = 'pending' | 'banned' | 'cleared';
export interface PlayerState { status: Status; since: number; score: number; reasons: string[]; until?: number; alertedAt?: number; name?: string }
interface Persist { secret: string; players: Record<string, PlayerState>; hours: Record<string, Record<string, number>> }
export interface ConnInfo { ip?: string; ua?: string; origin?: string; local?: boolean; wd?: boolean }
export interface Scored { score: number; reasons: string[]; n: number; cv: number | null; fast: number; types: number; hours24: number }
export interface Button { text: string; url: string }
export interface Opts {
  dir: string;
  now?: () => number;
  threshold?: number;
  /** send a message with URL buttons to the owner; returns when sent (errors are swallowed by the caller) */
  alert?: (html: string, buttons: Button[]) => Promise<void> | void;
  /** public base URL of the server for the Telegram buttons (read on every alert: the tunnel URL changes) */
  baseUrl?: () => string | null;
  nameOf?: (pid: string) => string | undefined;
  /** called when a player gets locked: drop their connections */
  onBlock?: (pid: string, status: Status) => void;
}

/** messages that only look at things (no decision by the player): they do not count as "playing" */
const PASSIVE = new Set(['view', 'ping', 'rooms', 'pick', 'hello']);
export const WINDOW_MS = 30 * 60_000;
const MAX_EVENTS = 3000;
const MIN_N = 40;
const CLEAR_DAYS = 7;
const REALERT_MS = 6 * 3600_000;
const LINK_TTL_MS = 7 * 24 * 3600_000;
const BAD_UA = /headless|puppeteer|playwright|selenium|phantom|python|curl|wget|node|axios|undici|okhttp|go-http|java|httpclient|bot\b|spider|crawl/i;

/** Pure scoring of one player's recent actions. `ev` = [time ms, type] sorted by time. */
export function scoreEvents(ev: [number, string][], hoursActive24: number, conn: ConnInfo[] = [], sameIp = 0): Scored {
  const reasons: string[] = [];
  let score = 0;
  const n = ev.length;
  // ---- connection: scripts and automated browsers ----
  const remote = conn.filter((c) => !c.local);
  if (remote.some((c) => c.wd)) { score += 5; reasons.push('trình duyệt tự động (navigator.webdriver)'); }
  if (remote.some((c) => !c.ua || BAD_UA.test(c.ua))) { score += 6; reasons.push(`User-Agent đáng ngờ: ${remote.find((c) => !c.ua || BAD_UA.test(c.ua))?.ua || '(trống)'}`.slice(0, 120)); }
  if (remote.some((c) => !c.origin)) { score += 4; reasons.push('kết nối WebSocket không có Origin (không phải trình duyệt)'); }
  if (sameIp >= 3) { score += 1; reasons.push(`${sameIp} tài khoản chung một IP`); }
  // ---- presence: awake 24 h a day ----
  if (hoursActive24 >= 22) { score += 3; reasons.push(`có thao tác ở ${hoursActive24}/24 giờ gần nhất (không nghỉ)`); }
  else if (hoursActive24 >= 18) { score += 1; reasons.push(`có thao tác ở ${hoursActive24}/24 giờ gần nhất`); }
  // ---- behaviour: needs enough samples ----
  let cv: number | null = null, fast = 0;
  const types = new Set(ev.map((e) => e[1])).size;
  if (n >= MIN_N) {
    const gaps: number[] = [];
    for (let i = 1; i < n; i++) { const g = ev[i][0] - ev[i - 1][0]; if (g < 120_000) gaps.push(g); }
    if (gaps.length >= MIN_N - 1) {
      const mean = gaps.reduce((s, v) => s + v, 0) / gaps.length;
      const sd = Math.sqrt(gaps.reduce((s, v) => s + (v - mean) ** 2, 0) / gaps.length);
      cv = mean > 0 ? sd / mean : null;
      fast = gaps.filter((g) => g < 150).length / gaps.length;
      if (cv !== null && cv < 0.12) { score += 3; reasons.push(`nhịp lệnh đều tăm tắp (CV ${cv.toFixed(2)}, trung bình ${(mean / 1000).toFixed(1)} s)`); }
      else if (cv !== null && cv < 0.25) { score += 1; reasons.push(`nhịp lệnh khá đều (CV ${cv.toFixed(2)})`); }
      if (fast >= 0.4) { score += 2; reasons.push(`${Math.round(fast * 100)}% lệnh cách nhau dưới 150 ms`); }
    }
    if (n >= 100 && types <= 2) { score += 2; reasons.push(`${n} lệnh nhưng chỉ ${types} loại lệnh`); }
  }
  return { score, reasons, n, cv, fast, types, hours24: hoursActive24 };
}

export class BotWatch {
  readonly threshold: number;
  private readonly file: string;
  private readonly now: () => number;
  private st: Persist;
  private dirty = false;
  private ev = new Map<string, [number, string][]>();
  private conns = new Map<string, ConnInfo[]>();
  private ipOf = new Map<string, string>();
  private lastLog = 0;

  private readonly o: Opts;
  constructor(o: Opts) {
    this.o = o;
    this.threshold = o.threshold ?? 6;
    this.now = o.now ?? Date.now;
    this.file = path.join(o.dir, 'botwatch.json');
    let st: Persist | null = null;
    try { st = JSON.parse(fs.readFileSync(this.file, 'utf8')); } catch { /* first run */ }
    this.st = { secret: st?.secret ?? randomBytes(24).toString('hex'), players: st?.players ?? {}, hours: st?.hours ?? {} };
    if (!st) this.flush();
  }

  // ---------------- recording ----------------
  /** a connection of this player authenticated (headers + webdriver flag from the client) */
  connect(pid: string, info: ConnInfo) {
    const l = this.conns.get(pid) ?? [];
    if (!l.some((c) => c.ua === info.ua && c.origin === info.origin && c.local === info.local && !!c.wd === !!info.wd)) l.push(info);
    this.conns.set(pid, l.slice(-6));
    if (info.ip) this.ipOf.set(pid, info.ip);
  }
  record(pid: string, type: string) {
    if (PASSIVE.has(type)) return;
    const t = this.now();
    let l = this.ev.get(pid);
    if (!l) this.ev.set(pid, (l = []));
    l.push([t, type]);
    if (l.length > MAX_EVENTS) l.splice(0, l.length - MAX_EVENTS);
    const h = String(Math.floor(t / 3600_000));
    const hs = (this.st.hours[pid] ??= {});
    hs[h] = (hs[h] ?? 0) + 1;
    this.dirty = true;
  }

  // ---------------- state ----------------
  stateOf(pid: string) { return this.st.players[pid]; }
  /** locked players cannot connect or send commands and count as offline */
  blocked(pid: string): boolean { const s = this.st.players[pid]; return !!s && (s.status === 'pending' || s.status === 'banned'); }
  message(pid: string): string {
    return this.st.players[pid]?.status === 'banned'
      ? '🚫 Tài khoản này đã bị cấm. Liên hệ chủ server nếu có nhầm lẫn.'
      : '⏳ Tài khoản đang bị tạm khóa vì hoạt động giống bot, chờ chủ server xét. Nếu bạn là người thật hãy nhắn chủ server.';
  }

  private hours24(pid: string, t = this.now()) {
    const cur = Math.floor(t / 3600_000), hs = this.st.hours[pid] ?? {};
    return Object.keys(hs).filter((k) => Number(k) > cur - 24 && Number(k) <= cur).length;
  }
  private sameIp(pid: string) {
    const ip = this.ipOf.get(pid);
    if (!ip) return 0;
    let k = 0;
    for (const v of this.ipOf.values()) if (v === ip) k++;
    return k;
  }
  score(pid: string): Scored {
    const t = this.now(), l = (this.ev.get(pid) ?? []).filter((e) => e[0] > t - WINDOW_MS);
    return scoreEvents(l, this.hours24(pid, t), this.conns.get(pid) ?? [], this.sameIp(pid));
  }

  /** Every ~30 s: score everyone with recent activity, lock the suspicious, remind about pending ones. */
  sweep() {
    const t = this.now();
    for (const pid of new Set([...this.ev.keys(), ...this.conns.keys()])) {
      const l = this.ev.get(pid);
      if (l) { while (l.length && l[0][0] <= t - WINDOW_MS) l.shift(); }
      const s = this.st.players[pid];
      if (s?.status === 'banned' || s?.status === 'pending') continue;
      if (s?.status === 'cleared' && (s.until ?? 0) > t) continue;
      const sc = this.score(pid);
      if (sc.score >= this.threshold) this.lock(pid, sc);
    }
    for (const [pid, s] of Object.entries(this.st.players)) if (s.status === 'pending' && t - (s.alertedAt ?? 0) >= REALERT_MS) void this.sendAlert(pid, s, true);
    // hourly summary for the owner's records
    if (t - this.lastLog >= 3600_000) {
      this.lastLog = t;
      const rows = [...this.ev.keys()].map((pid) => ({ pid, name: this.o.nameOf?.(pid), ...this.score(pid), status: this.st.players[pid]?.status ?? 'ok' })).filter((r) => r.n > 0);
      if (rows.length) try { fs.appendFileSync(path.join(this.o.dir, 'botwatch.jsonl'), JSON.stringify({ at: new Date(t).toISOString(), rows }) + '\n'); } catch { /* disk */ }
    }
    this.prune(t);
    if (this.dirty) this.flush();
  }

  private prune(t: number) {
    const cur = Math.floor(t / 3600_000);
    for (const hs of Object.values(this.st.hours)) for (const k of Object.keys(hs)) if (Number(k) <= cur - 25) delete hs[k];
  }

  private lock(pid: string, sc: Scored) {
    const s: PlayerState = { status: 'pending', since: this.now(), score: sc.score, reasons: sc.reasons, name: this.o.nameOf?.(pid) };
    this.st.players[pid] = s;
    this.flush();
    this.o.onBlock?.(pid, 'pending');
    void this.sendAlert(pid, s, false, sc);
  }

  /** owner decision. Returns a short text for the owner. */
  act(pid: string, act: 'ban' | 'clear'): string | null {
    const name = this.o.nameOf?.(pid);
    if (name === undefined && !this.st.players[pid]) return null;
    const prev = this.st.players[pid];
    if (act === 'ban') {
      this.st.players[pid] = { ...(prev ?? { since: this.now(), score: 0, reasons: [] }), status: 'banned', name: name ?? prev?.name };
      this.flush(); this.o.onBlock?.(pid, 'banned');
      return `Đã BAN ${name ?? pid}. Tài khoản không vào game được nữa.`;
    }
    this.st.players[pid] = { ...(prev ?? { since: this.now(), score: 0, reasons: [] }), status: 'cleared', until: this.now() + CLEAR_DAYS * 86400_000, name: name ?? prev?.name };
    this.ev.delete(pid); this.conns.delete(pid);
    this.flush();
    return `Đã cho ${name ?? pid} chơi lại (không bị gắn cờ trong ${CLEAR_DAYS} ngày).`;
  }

  list() {
    return Object.entries(this.st.players).map(([pid, s]) => ({ pid, ...s }));
  }
  report() {
    return [...new Set([...this.ev.keys(), ...Object.keys(this.st.players)])].map((pid) => ({ pid, name: this.o.nameOf?.(pid), status: this.st.players[pid]?.status ?? 'ok', ...this.score(pid) }));
  }

  // ---------------- signed links for the Telegram buttons ----------------
  sign(pid: string, act: string, exp: number) { return createHmac('sha256', this.st.secret).update(`${pid}|${act}|${exp}`).digest('hex'); }
  verify(pid: string, act: string, exp: number, sig: string) {
    if (!Number.isFinite(exp) || exp < this.now()) return false;
    const a = Buffer.from(this.sign(pid, act, exp)), b = Buffer.from(sig);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  link(base: string, pid: string, act: 'ban' | 'clear') {
    const exp = this.now() + LINK_TTL_MS;
    return `${base.replace(/\/$/, '')}/admin/botwatch/act?pid=${encodeURIComponent(pid)}&act=${act}&exp=${exp}&sig=${this.sign(pid, act, exp)}`;
  }

  private async sendAlert(pid: string, s: PlayerState, reminder: boolean, sc?: Scored) {
    s.alertedAt = this.now(); this.flush();
    if (!this.o.alert) return;
    const esc = (x: string) => x.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
    const name = esc(s.name ?? this.o.nameOf?.(pid) ?? pid);
    const base = this.o.baseUrl?.() ?? null;
    const sc2 = sc ?? this.score(pid);
    const html = [
      `🤖 <b>Sodier War · ${reminder ? 'Nhắc: vẫn chờ quyết định' : 'Nghi là bot'}: ${name}</b>`,
      `Điểm nghi vấn <b>${s.score}</b> (ngưỡng ${this.threshold})`,
      ...s.reasons.map((r) => `• ${esc(r)}`),
      `<pre>${sc2.n} lệnh / 30 phút · ${sc2.types} loại lệnh · ${sc2.hours24}/24 giờ hoạt động</pre>`,
      `🔒 Đã tạm khóa: người này bị ngắt kết nối và không vào game được cho tới khi bạn quyết định.`,
      base ? 'Chọn:' : 'Không có URL công khai nên chưa có nút. Dùng lệnh trên máy chủ: /admin/botwatch?player=' + esc(s.name ?? pid) + '&act=ban|clear',
    ].join('\n');
    const buttons: Button[] = base ? [{ text: '🔨 Ban', url: this.link(base, pid, 'ban') }, { text: '✅ Cho chơi lại', url: this.link(base, pid, 'clear') }] : [];
    try { await this.o.alert(html, buttons); } catch (e) { console.error('botwatch: gửi Telegram lỗi', (e as Error).message); }
  }

  flush() {
    try {
      const tmp = this.file + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(this.st), { mode: 0o600 });
      fs.renameSync(tmp, this.file);
      this.dirty = false;
    } catch (e) { console.error('botwatch: không lưu được', (e as Error).message); }
  }
}

// ---------------- Telegram (Bot API, send only: no polling, so it never fights the plugin's getUpdates) ----------------
export function telegramAlert(opts: { envFile: string; chatId: string }) {
  return async (html: string, buttons: Button[]) => {
    const env = fs.readFileSync(opts.envFile, 'utf8');
    const token = /^TELEGRAM_BOT_TOKEN=(.+)$/m.exec(env)?.[1]?.trim();
    if (!token) throw new Error('thiếu TELEGRAM_BOT_TOKEN');
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: opts.chatId, text: html, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, ...(buttons.length ? { reply_markup: { inline_keyboard: [buttons.map((b) => ({ text: b.text, url: b.url }))] } } : {}) }),
    });
    if (!r.ok) throw new Error(`Telegram ${r.status}`);
  };
}

// ---------------- HTTP ----------------
const page = (title: string, body: string) => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="font:18px system-ui;max-width:420px;margin:12vh auto;padding:0 16px;text-align:center;background:#1a1410;color:#f2e8da">${body}`;
const isLocal = (req: http.IncomingMessage) => !req.headers['cf-connecting-ip'] && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress ?? '');

/**
 * GET  /admin/botwatch[?player=<name|id>&act=ban|clear]  (ANTWAR_ADMIN_KEY or this machine only): scoreboard / act now
 * GET  /admin/botwatch/act?pid&act&exp&sig               signed link from Telegram: shows a confirm page (changes nothing)
 * POST /admin/botwatch/act?pid&act&exp&sig               does it
 */
export function botwatchHttp(w: BotWatch, find: (q: string) => string | undefined, req: http.IncomingMessage, res: http.ServerResponse, url: URL): boolean {
  if (url.pathname === '/admin/botwatch') {
    const key = process.env.SODIER_ADMIN_KEY;
    if (key ? url.searchParams.get('key') !== key : !isLocal(req)) { res.writeHead(403).end(); return true; }
    const q = url.searchParams.get('player'), act = url.searchParams.get('act');
    let done: string | null | undefined;
    if (q && (act === 'ban' || act === 'clear')) { const pid = find(q); done = pid ? w.act(pid, act) : null; }
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }).end(JSON.stringify({ threshold: w.threshold, ...(q ? { result: done ?? 'không tìm thấy người chơi' } : {}), players: w.report() }, null, 2));
    return true;
  }
  if (url.pathname === '/admin/botwatch/act') {
    const pid = url.searchParams.get('pid') ?? '', act = url.searchParams.get('act') ?? '', exp = Number(url.searchParams.get('exp')), sig = url.searchParams.get('sig') ?? '';
    if ((act !== 'ban' && act !== 'clear') || !w.verify(pid, act, exp, sig)) { res.writeHead(403, { 'content-type': 'text/html; charset=utf-8' }).end(page('Hết hạn', '<h2>Liên kết không hợp lệ hoặc đã hết hạn</h2>')); return true; }
    const who = w.stateOf(pid)?.name ?? pid, verb = act === 'ban' ? '🔨 Ban' : '✅ Cho chơi lại';
    if (req.method === 'POST') {
      const msg = w.act(pid, act);
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page('Xong', `<h2>${msg ? '✔ Xong' : 'Không tìm thấy người chơi'}</h2><p>${(msg ?? '').replace(/[<>&]/g, '')}</p>`));
      return true;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(page('Xác nhận', `<h2>${verb}: ${who.replace(/[<>&]/g, '')}</h2><form method="post" action="${req.url!.replace(/"/g, '')}"><button style="font-size:20px;padding:14px 28px;border-radius:10px;border:0;background:${act === 'ban' ? '#c0392b' : '#2e8b57'};color:#fff">${verb}</button></form>`));
    return true;
  }
  return false;
}
// ---- end botwatch ----

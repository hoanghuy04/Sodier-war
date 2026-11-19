// Sodier War server: static files + WebSocket. Several worlds run side by side:
//   • "Thế giới mở" (endless): play forever, respawn after death, no zone, bosses come back every 10 minutes
//   • match rooms created by players: lobby → 20-minute battle-royale matches with the zone
// Each world ticks at 20 Hz and streams 10 snapshots/s to the players inside it.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { WebSocketServer } from 'ws';
import { Game, DT } from './game.js';
import { World } from './world.js';
import { Bots } from './bot.js';
import { BotWatch, botwatchHttp, telegramAlert } from './botwatch.ts';
import { ChunkRenderer, chunksOf } from './chunkr.js';
import { HellManager } from './hell.js';
import { HELL_MODES, HELL_GATE_R, HELL_MAX_RUNS, HELL_MINE_MAX_MIN, PET_REFINE_STEP, PET_REFINE_MAX, petRefineCost } from '../shared/hell.js';
import { petFight, BAG_SIZE as BAG_N, TIERS as ITEM_TIERS, restatItem, RAID_SHARE, RES, RES_INFO, TYPE_CODE, HEROES, JOIN_WINDOW, MATCH_LEN, BOSS_RESPAWN, BOSSES, OFFLINE_RATE, OFFLINE_MAX_MIN, checkinReward, checkinMonth, BAG_SIZE, TIER_INFO, makeItem, CAMPS, heroXpNeed } from '../shared/balance.js';

const ROOT = new URL('../', import.meta.url).pathname;
const VISION = 18, VISION_TOWER = 30, UNIT_VISION = 6, VISION_MINE = 9, VISION_BASE = 30; // tiles (mine / base: owned mines and my Thành trì see around them)
const PORT = +(process.env.PORT ?? 8790);
const SEED = +(process.env.SEED ?? 20261114); // 20261113 = the 384×384 map (20261111: first 256 map, 20261112: 512 map)
const BOT_TARGET = +(process.env.BOTS ?? 4); // armies per world (humans + bots)
const MAX_ROOMS = 12, ROOM_IDLE = 180; // an empty match room disappears after 3 minutes
const DATA = process.env.DATA_DIR ?? ROOT + 'data/';
fs.mkdirSync(DATA, { recursive: true });

// ---------------------------------------------------------------- config (invite code, like Ant War)
const CFG_FILE = DATA + 'config.json';
let cfg = {};
try { cfg = JSON.parse(fs.readFileSync(CFG_FILE, 'utf8')); } catch {}
cfg.invite = process.env.SODIER_INVITE ?? cfg.invite ?? crypto.randomBytes(3).toString('hex');
fs.writeFileSync(CFG_FILE, JSON.stringify(cfg, null, 1));

// ---------------------------------------------------------------- persistence (best scores)
const SCORE_FILE = DATA + 'scores.json';
let scores = {};
try { scores = JSON.parse(fs.readFileSync(SCORE_FILE, 'utf8')); } catch {}
// same safe write as check-ins (async writes could interleave and corrupt the file)
const saveScores = () => { try { fs.writeFileSync(SCORE_FILE + '.tmp', JSON.stringify(scores, null, 1)); fs.renameSync(SCORE_FILE + '.tmp', SCORE_FILE); } catch (e) { console.error('scores save failed:', e.message); } };

// ---------------------------------------------------------------- accounts (name + password, scrypt hashed)
const ACC_FILE = DATA + 'accounts.json';
let accounts = {};
const tickErrAt = new Map();
try { accounts = JSON.parse(fs.readFileSync(ACC_FILE, 'utf8')); } catch {}
const saveAccounts = () => fs.writeFileSync(ACC_FILE, JSON.stringify(accounts, null, 1), { mode: 0o600 });
function hashPw(pw, salt = crypto.randomBytes(16).toString('hex')) { return { salt, hash: crypto.scryptSync(pw, salt, 32).toString('hex') }; }
function checkPw(acc, pw) { const h = Buffer.from(hashPw(pw, acc.salt).hash, 'hex'), k = Buffer.from(acc.hash, 'hex'); return h.length === k.length && crypto.timingSafeEqual(h, k); }
// set or reset a password from the shell: node server/main.js --set-password <name> <password>
if (process.argv[2] === '--set-password') {
  const [, , , name, pw] = process.argv;
  accounts[name.toLowerCase()] = { name, ...hashPw(pw), created: Date.now() }; saveAccounts();
  console.log(`password set for ${name}`); process.exit(0);
}

// ---------------------------------------------------------------- daily check-in (account level, data/checkin.json)
const CI_FILE = DATA + 'checkin.json';
let checkins = {};
try { checkins = JSON.parse(fs.readFileSync(CI_FILE, 'utf8')); } catch (e) {
  // never start from zero silently: try the last good copy
  if (e.code !== 'ENOENT') { console.error('checkin.json unreadable:', e.message); try { checkins = JSON.parse(fs.readFileSync(CI_FILE + '.bak', 'utf8')); } catch {} }
}
// written synchronously through a temp file + rename: two quick writes used to interleave and corrupt the file,
// which then failed to load at the next start (everyone's check-in was "reset")
const saveCheckins = () => {
  try { if (fs.existsSync(CI_FILE)) fs.copyFileSync(CI_FILE, CI_FILE + '.bak'); fs.writeFileSync(CI_FILE + '.tmp', JSON.stringify(checkins, null, 1)); fs.renameSync(CI_FILE + '.tmp', CI_FILE); } catch (e) { console.error('checkin save failed:', e.message); }
};
const vnDay = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
/** calendar of the current month (VN time): days already passed are shown as done, today can be claimed once */
function ciState(name) {
  const c = checkins[accKey(name)] ?? { count: 0, last: '', pending: [] };
  const today = vnDay(), [y, m, d] = today.split('-').map(Number), len = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0 = Sunday
  const mk = today.slice(0, 7), got = c.days?.[mk] ?? (c.last?.startsWith(mk) ? [Number(c.last.slice(8))] : []); // records from before the calendar
  return { t: 'ci', count: c.count, today: c.last === today, day: d, month: m, year: y, len, first, got, pending: c.pending.length, rewards: checkinMonth(len) };
}

// ---------------------------------------------------------------- anti-bot: login throttling per IP, command rate per socket
const attempts = new Map(); // ip -> {n, until}
const ipOf = (req) => String(req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '').split(',')[0].trim();
function throttled(ip) { const a = attempts.get(ip); return a && a.until > Date.now() && a.n >= 6; }
function failed(ip) { const a = attempts.get(ip) ?? { n: 0, until: 0 }; if (a.until < Date.now()) { a.n = 0; } a.n++; a.until = Date.now() + 5 * 60 * 1000; attempts.set(ip, a); }
const createdBy = new Map(); // ip -> [timestamps] of new accounts

// ---------------------------------------------------------------- botwatch (ported from Ant War)
// data/config.json "botwatch": { "enabled": true, "threshold": 6, "tgEnvFile": "<.env with TELEGRAM_BOT_TOKEN>", "chatId": "<owner chat id>" }
// Scores each account's recent commands (rhythm, speed, 24 h presence, command variety) and connection (User-Agent,
// missing Origin, navigator.webdriver). Score >= threshold locks the account until the owner bans or clears it.
const accKey = (name) => String(name ?? '').toLowerCase();
const plainName = (n) => String(n ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
const bw = cfg.botwatch?.enabled === false ? null : new BotWatch({
  dir: DATA, threshold: cfg.botwatch?.threshold,
  nameOf: (pid) => accounts[pid]?.name,
  baseUrl: () => { try { return fs.readFileSync(path.join(DATA, 'public-url.txt'), 'utf8').trim() || null; } catch { return null; } },
  alert: cfg.botwatch?.tgEnvFile && cfg.botwatch?.chatId ? telegramAlert({ envFile: cfg.botwatch.tgEnvFile, chatId: String(cfg.botwatch.chatId) }) : (html) => console.log('botwatch (chưa cấu hình Telegram):', html.replace(/<[^>]+>/g, '')),
  onBlock: (pid, status) => {
    for (const s of [...sessions.values()]) if (accKey(s.name) === pid) { send(s.ws, { t: 'auth-fail', reason: bw.message(pid), blocked: true }); leaveRoom(s); try { s.ws?.close(); } catch {} sessions.delete(s.token); }
    console.log(`botwatch: ${accounts[pid]?.name ?? pid} -> ${status}`);
  },
});
const findAccount = (q) => (accounts[accKey(q)] ? accKey(q) : undefined);

// ---------------------------------------------------------------- static files
// asset version: changes whenever any asset file changes, so browsers never keep stale sprites / atlas
function assetVersion() {
  let v = 0;
  const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else v = Math.max(v, fs.statSync(p).mtimeMs); } };
  try { walk(ROOT + 'client'); walk(ROOT + 'shared'); } catch {} // 14/11/2026: code too, so every deploy makes open tabs reload (force F5)
  return Math.floor(v / 1000).toString(36);
}
const ASSET_V = assetVersion();
const MIME = { '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  if (bw && req.url.startsWith('/admin/botwatch') && botwatchHttp(bw, findAccount, req, res, new URL(req.url, 'http://x'))) return;
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  // open-world chunks re-drawn after clearing trees / rocks, and the raw obstacle map (1 byte per tile) for the client
  const lm = /^\/live\/(\d+)\/(c_\d+_\d+\.png)$/.exec(url);
  if (lm) {
    const f = path.join(DATA, 'map-live', lm[1], lm[2]);
    fs.readFile(f, (err, buf) => { if (err) { res.writeHead(404).end(); return; } res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800, immutable' }); res.end(buf); });
    return;
  }
  if (url === '/obst.bin') { res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'public, max-age=604800, immutable' }); res.end(Buffer.from(world.map.obst.buffer, world.map.obst.byteOffset, world.map.obst.byteLength)); return; }
  let base = ROOT + 'client';
  if (url.startsWith('/shared/')) base = ROOT;
  const file = path.normalize(base + url);
  if (!file.startsWith(ROOT) || file.includes('/data/')) { res.writeHead(403).end(); return; }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404).end('not found'); return; }
    const ext = path.extname(file);
    const cache = url.startsWith('/assets/') && ext !== '.json' ? 'public, max-age=604800, immutable' : 'no-cache';
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': cache });
    fs.createReadStream(file).pipe(res);
  });
});

// ---------------------------------------------------------------- rooms
const world = new World(SEED); // the static map is shared by every room
const hellGate = (() => { const w = world, f = w.nearestFree(w.W - 16, w.H / 2, 40) ?? { x: w.W - 16, y: w.H / 2 }; return { x: Math.round(f.x), y: Math.round(f.y) }; })();
// the gate is a tall solid thing (16/11/2026): its body blocks the way, the stairs in front (west) stay walkable
const HELL_GATE_BODY = { x0: -1, x1: 2, y0: -4, y1: 4 }; // tiles round the centre; the drawn gate is 6 × 10 tiles
for (let y = hellGate.y + HELL_GATE_BODY.y0; y <= hellGate.y + HELL_GATE_BODY.y1; y++) for (let x = hellGate.x + HELL_GATE_BODY.x0; x <= hellGate.x + HELL_GATE_BODY.x1; x++) if (x >= 0 && y >= 0 && x < world.W && y < world.H) world.block[y * world.W + x] = 1;
console.log('hell gate at', hellGate.x, hellGate.y);
const rooms = new Map(); // id -> Room
const sessions = new Map(); // token -> {token, name, ws, room, p}
const send = (ws, msg) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg)); };
const r1 = (v) => Math.round(v * 10) / 10;

class Room {
  constructor({ id, name, mode, by = null, game = null }) {
    this.id = id; this.name = name; this.mode = mode; this.by = by;
    this.game = game ?? new Game(SEED, { mode, world });
    this.bots = new Bots(this.game);
    this.emptySince = Date.now();
    const g = this.game;
    g.onMatchEnd = (M) => {
      if (M.winner) { const p = g.players.get(M.winner.id); if (p && !p.bot) { const sc = (scores[p.name] ??= { best: 0, lives: 0 }); sc.wins = (sc.wins ?? 0) + 1; saveScores(); } }
      this.broadcast({ t: 'end', n: M.n, winner: M.winner, results: M.results, next: Math.round(M.endAt - g.t) });
    };
    g.onMatchStart = (M) => this.broadcast({ t: 'start', n: M.n });
    // a Thành trì falls: 10 % of the owner's stock, whether they are on the map or away (stash)
    g.onRaid = (b, ap, frac = 1) => {
      const here = g.raidFromPlayer(b, ap, frac);
      if (here) return here;
      const kept = stash.get(b.key); if (!kept) return {};
      const got = {};
      const prot = g.protectedFor(b.key);
      for (const r of RES) { const v = Math.floor(Math.max(0, (kept.data.res?.[r] ?? 0) - prot[r]) * RAID_SHARE * frac); if (v <= 0) continue; kept.data.res[r] -= v; got[r] = g.gain(ap, r, v); }
      return got;
    };
    g.onLobby = (M) => this.broadcast({ t: 'lobby', n: M.n });
    g.onDeath = (p) => {
      if (p.bot) return;
      const s = (scores[p.name] ??= { best: 0, lives: 0 });
      s.best = Math.max(s.best, p.deathInfo.score); s.lives++; s.hero = p.heroType;
      p.best = s.best;
      saveScores();
      const sess = this.sessionOf(p);
      if (sess?.ws) send(sess.ws, { t: 'dead', forfeit: !!p.forfeit, info: { ...p.deathInfo, best: s.best, rank: rankOf(p.name) } });
      p.forfeit = false;
    };
  }
  get sessions() { return [...sessions.values()].filter((s) => s.room === this); }
  sessionOf(p) { return [...sessions.values()].find((s) => s.p === p); }
  broadcast(msg) { const t = JSON.stringify(msg); for (const s of this.sessions) if (s.ws?.readyState === 1) s.ws.send(t); }
  humans() { return [...this.game.players.values()].filter((p) => !p.bot); }
  info() {
    const M = this.game.match, g = this.game;
    return { id: this.id, name: this.name, mode: this.mode, by: this.by, phase: M.phase, n: M.n, el: Math.round(g.t - M.start), startIn: M.startAt ? Math.max(0, Math.ceil(M.startAt - g.t)) : 0,
      humans: this.humans().filter((p) => p.connected).map((p) => p.name), alive: [...g.players.values()].filter((p) => p.alive).length };
  }
}
const rankOf = (name) => Object.entries(scores).sort((a, b) => b[1].best - a[1].best).findIndex(([n]) => n === name) + 1;
const ENDLESS_ID = 'world';
// open-world progress of players who are not on the map right now (left, logged out, timed out): account -> {room, data, at}
const stash = new Map();
/** take a player out of a room; in the open world everything they own is kept for when they come back */
function takeOut(room, p) {
  if (room.mode === 'endless' && !p.bot) {
    if (p.alive) {
      const data = room.game.stashPlayer(p);
      if (data) { stash.set(accKey(p.name), { room: room.id, data, at: Date.now() }); console.log(`stash: ${p.name} (${data.units.length} quân)`); }
    }
    // open world: the player stays in the game, away (no hero), so their mines keep their owner and garrison (11/11/2026)
    p.away = true; p.connected = false; p.leftAt = 0;
    return;
  }
  room.game.removePlayer(p);
}

// ---- restore everything (or migrate the old one-world state file)
const STATE_FILE = DATA + 'state.json';
function restoreAll() {
  let d = null;
  try { d = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') console.error('restore failed:', e.message); }
  const list = !d ? [] : d.v === 2 ? d.rooms : [{ id: 'r1', name: 'Phòng 1', mode: 'match', game: d, sessions: d.sessions ?? [] }];
  let migrated = 0;
  for (const q of list) {
    const game = new Game(SEED, { mode: q.mode, world });
    if (!game.restore(q.game)) {
      // a save from another map (seed / size): keep every player's open-world property in the stash, positions and
      // mines excepted (they belong to the old map); they come back at a spawn camp with army, resources and items
      if (q.mode === 'endless') migrated += migratePlayers(q.game);
      for (const s of q.sessions ?? []) { const p = q.game?.players?.find((x) => x.id === s.pid); if (p && !p.bot) sessions.set(s.token, { token: s.token, name: p.name, ws: null, room: null, p: null }); }
      continue;
    }
    const room = new Room({ id: q.id, name: q.name, mode: q.mode, by: q.by, game });
    rooms.set(room.id, room);
    for (const p of game.players.values()) if (!p.bot) { p.connected = false; p.leftAt = game.t + 13 * 60; }
    for (const s of q.sessions ?? []) {
      const p = game.players.get(s.pid);
      if (p && !p.bot) sessions.set(s.token, { token: s.token, name: p.name, ws: null, room, p });
    }
    console.log(`restored room ${room.id} (${room.mode}): t=${Math.round(game.t)}s, ${game.players.size} players, ${game.units.size} units`);
  }
  for (const [k, v] of Object.entries(d?.stash ?? {})) {
    const oldG = d?.rooms?.find((r) => r.id === ENDLESS_ID)?.game;
    if (migrated || (oldG?.mapW ?? 256) !== world.W || (oldG && oldG.seed !== SEED)) {
      let types = null;
      try { types = JSON.parse(fs.readFileSync(`${DATA}mines-${oldG?.seed}.json`, 'utf8')); } catch {}
      v.data.mineTypes = types ? (v.data.mines ?? []).map((i) => types[i]).filter(Boolean) : [];
      v.data.hero.x = null; v.data.hero.y = null; v.data.mines = [];
    }
    if (!stash.has(k)) stash.set(k, v);
  }
  if (migrated) console.log(`map changed: ${migrated} players moved to the stash (army, resources, items kept)`);
  for (const s of d?.idle ?? []) if (!sessions.has(s.token)) sessions.set(s.token, { token: s.token, name: s.name, ws: null, room: null, p: null });
  if (!rooms.has(ENDLESS_ID)) rooms.set(ENDLESS_ID, new Room({ id: ENDLESS_ID, name: 'Thế giới mở', mode: 'endless' }));
}
restoreAll();
// gear v2 (12/11/2026): items of stashed (offline) players
for (const [k, v] of stash.entries()) { const lv = rooms.get(ENDLESS_ID)?.game.heroProg?.get(k)?.lv ?? 1; for (const it of [...Object.values(v.data?.equip ?? {}), ...(v.data?.bag ?? [])]) restatItem(it, lv); } // item levels: the owner's hero level
// ---- cleared trees / rocks: re-drawn map chunks for the open world (server/chunkr.js)
const chunkr = (() => {
  const room = rooms.get(ENDLESS_ID), g = room.game;
  const cr = new ChunkRenderer({ seed: SEED, dir: DATA, staticDir: `${ROOT}client/assets/map/${SEED}/`, W: world.W, getCleared: () => g.cleared,
    onDone: (k, v) => rooms.get(ENDLESS_ID)?.broadcast({ t: 'chunks', v: { [k]: v } }) });
  g.onCleared = (tx, ty, i) => { rooms.get(ENDLESS_ID)?.broadcast({ t: 'cleared', add: [i] }); cr.add(chunksOf(tx, ty)); };
  cr.check();
  return cr;
})();
// ---- Địa Ngục (docs/design/29-dia-nguc.md): the Hell Gate on the east edge, one HellRun per solo player / party
const hell = new HellManager();
// Cổng Địa Ngục: placed and blocked right after the shared world is built, before any Game copies its blocked tiles (world.view)
const hellSess = (run) => run.members.map((m) => sessions.get(m.token)).filter(Boolean);
/** stats of a world hero going down (open-world numbers; the run squashes them) */
function hellMember(g, s) {
  const p = s.p, h = g.units.get(p.hero), pr = g.heroProgOf(p), pet = g.petOf(p), lv = pr?.lv ?? 1;
  const pf = pet ? petFight(pet, lv) : null, refine = 1 + PET_REFINE_STEP * (pr?.petRef?.[pet] ?? 0);
  return { pid: p.id, token: s.token, acc: p.acc, name: p.name, heroType: p.heroType, hp: h.maxHp, atk: h.atk, armor: h.armor, ms: Math.max(0, (h.speed / (2.4 * 1.5)) - 1),
    pet, petHp: pf ? pf.hp * 0.5 * refine : 0, petAtk: pf ? pf.atk * 0.5 * refine : 0, petCd: pf?.cd ?? 1, petRange: pf?.range ?? 1.2 };
}
function hellEnter(s, mode) {
  const room = rooms.get(ENDLESS_ID), g = room?.game, p = s.p;
  const err = (t) => send(s.ws, { t: 'n', kind: 'err', text: t });
  if (!g || s.room !== room || !p?.alive || s.hell) return;
  const h = g.units.get(p.hero); if (!h) return;
  if (Math.hypot(h.x - hellGate.x, h.y - hellGate.y) > HELL_GATE_R + 6) return err('Phải đứng sát Cổng Địa Ngục (rìa phía Đông)');
  if (g.team(p.id).combat) return err('Đang giao chiến, không vào ngục được');
  if ([...hell.runs.values()].filter((r) => !r.ended).length >= HELL_MAX_RUNS) return err('Địa Ngục đang đầy lượt, đợi một chút');
  const M = HELL_MODES[mode | 0]; if (!M) return;
  // a party goes down together: only the leader opens the gate, members near the gate come along
  let list = [s];
  const pt = g.partyOf?.(p);
  if (pt) {
    if (pt.leader !== p.id) return err('Đang trong tổ đội: chỉ trưởng nhóm mở Cổng Địa Ngục');
    list = pt.members.map((id) => [...room.sessions].find((x) => x.p?.id === id)).filter((x) => x && x.ws && x.p?.alive && !x.hell && (() => { const u = g.units.get(x.p.hero); return u && Math.hypot(u.x - hellGate.x, u.y - hellGate.y) < 40; })());
  }
  const members = list.map((x) => hellMember(g, x));
  const run = hell.start(mode | 0, members);
  run.members = members; run.startAt = Date.now();
  for (const x of list) {
    takeOut(room, x.p); // like going offline: army, mines and base are kept (stash)
    x.hell = run.id;
    send(x.ws, { t: 'hell', id: run.id, seed: run.seed, mode: run.mi, you: x.p.id, gate: [hellGate.x, hellGate.y] });
  }
  console.log(`hell: ${run.id} ${M.name} · ${members.map((m) => m.name).join(', ')}`);
}
/** a run ended: everybody comes back to the gate with the rewards */
function hellEnd(run) {
  const room = rooms.get(ENDLESS_ID), g = room?.game; if (!g) return;
  const mins = Math.min(HELL_MINE_MAX_MIN, (Date.now() - run.startAt) / 60000);
  for (const m of run.members) {
    const s = sessions.get(m.token), h = run.heroes.get(m.pid); if (!h) continue;
    const E = h.earned, kept = stash.get(accKey(m.name));
    const res = { gold: Math.round(E.gold), oil: Math.round(E.oil), crystal: Math.round(E.crystal), diamond: Math.round(E.diamond) };
    // mines paid 100 % while down there (max 25 min): the stash gave 50 % offline, here the full rate
    if (kept?.data?.inc) for (const r of RES) res[r] = (res[r] ?? 0) + Math.round((kept.data.inc[r] ?? 0) * mins);
    const p = s?.p ?? [...g.players.values()].find((q) => q.name === m.name && !q.bot);
    let back = false;
    if (s && s.hell === run.id && p && kept && s.ws) {
      p.connected = true; p.away = false;
      if (g.unstashPlayer(p, kept.data, true)) {
        stash.delete(accKey(m.name)); back = true;
        const u = g.units.get(p.hero), f = g.world.nearestFree(hellGate.x - 6, hellGate.y + 1, 6) ?? { x: hellGate.x - 6, y: hellGate.y };
        if (u) { u.x = f.x; u.y = f.y; for (const id of p.units) { const q = g.units.get(id); if (q) { const t = g.slotTarget(p, u, q); q.x = t.x; q.y = t.y; } } }
      }
    }
    if (p) {
      for (const [r, v] of Object.entries(res)) if (v > 0) { if (back) g.gain(p, r, v); else if (kept) kept.data.res[r] = (kept.data.res[r] ?? 0) + v; }
      if (E.xp > 0) g.gainXp(p, Math.round(E.xp));
      const pr = g.heroProgOf(p); if (pr) pr.soul = (pr.soul ?? 0) + Math.round(E.soul);
      const b = g.bases?.get(p.acc);
      for (const tier of E.items) { const it = g.dropItemFor(p, tier); if (back && p.bag.length < BAG_N) p.bag.push(it); else if (b) { b.chest ??= []; b.chest.push(it); } else if (kept) kept.data.bag.push(it); }
      if (b) { b.dust ??= {}; for (const [t, n] of Object.entries(E.dust ?? {})) b.dust[t] = (b.dust[t] ?? 0) + n; }
    }
    if (s) {
      s.hell = null;
      const txt = `${h.result === 'win' ? '🏆 Hạ boss Địa Ngục!' : h.result === 'exit' ? '🚪 Rời Địa Ngục an toàn' : '💀 Gục trong Địa Ngục (giữ 70% thưởng)'} Nhận ${Object.entries(res).filter(([, v]) => v > 0).map(([r, v]) => `${v.toLocaleString('vi')} ${RES_INFO[r].name}`).join(', ')}, ${Math.round(E.xp)} XP, ${Math.round(E.soul)} Than Hồn${E.items.length ? `, ${E.items.length} trang bị` : ''}`;
      send(s.ws, { t: 'hellend', result: h.result, res, xp: Math.round(E.xp), soul: Math.round(E.soul), items: E.items, dust: E.dust, kills: h.kills, lv: h.lv, T: Math.round(run.t), wave: run.wave, mode: run.mi });
      if (back) { if (p) g.notice(p.id, txt, h.result === 'dead' ? 'warn' : 'ok'); sendJoined(s); }
    }
    console.log(`hell end: ${run.id} ${m.name} ${h.result} kills ${h.kills} lv ${h.lv}`);
  }
}
function migratePlayers(gd) {
  let n = 0, types = null;
  try { types = JSON.parse(fs.readFileSync(`${DATA}mines-${gd?.seed}.json`, 'utf8')); } catch {} // mine types of the old map, by index
  const ownedTypes = (pid) => (types ? (gd.mines ?? []).map((m, i) => (m.owner === pid ? types[i] : null)).filter(Boolean) : []);
  for (const p of gd?.players ?? []) {
    if (p.bot || !p.alive) continue;
    const hero = gd.units.find((u) => u.id === p.hero);
    const byId = new Map(gd.units.map((u) => [u.id, u])), units = (p.units ?? []).map((id) => byId.get(id)).filter(Boolean).map((u) => ({ type: u.type, hp: u.hp, buyN: u.buyN, kills: u.kills }));
    stash.set(accKey(p.name), { room: ENDLESS_ID, at: Date.now(), data: {
      v: 1, heroType: p.heroType, hero: { hp: hero?.hp ?? 1, x: null, y: null }, inc: null, units, res: p.res, rings: p.rings, mode: p.mode, equip: p.equip ?? {}, bag: p.bag ?? [],
      score: p.score, stats: p.stats, life: gd.t - p.bornAt, queue: (p.queue ?? []).map((q) => ({ type: q.type, left: Math.max(0, q.readyAt - gd.t), total: q.total, n: q.n })), buyCounter: p.buyCounter, mines: [], mineTypes: ownedTypes(p.id), skillLeft: 0,
    } });
    console.log(`migrate: ${p.name} (${units.length} quân, ${ownedTypes(p.id).length} mỏ)`);
    n++;
  }
  return n;
}
function saveState() {
  const d = { v: 2, rooms: [...rooms.values()].map((r) => ({ id: r.id, name: r.name, mode: r.mode, by: r.by, game: r.game.serialize(), sessions: r.sessions.filter((s) => s.p).map((s) => ({ token: s.token, pid: s.p.id })) })),
    idle: [...sessions.values()].filter((s) => !s.room).map((s) => ({ token: s.token, name: s.name })), stash: Object.fromEntries(stash) };
  fs.writeFileSync(STATE_FILE + '.tmp', JSON.stringify(d));
  fs.renameSync(STATE_FILE + '.tmp', STATE_FILE);
}
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { try { saveState(); console.log('state saved, bye'); } catch (e) { console.error(e); } process.exit(0); });

const mineInfo = world.mines.map((m) => [m.type, +m.x.toFixed(2), +m.y.toFixed(2)]);
const roomsMsg = () => ({ t: 'rooms', list: [...rooms.values()].map((r) => r.info()), online: [...sessions.values()].filter((s) => s.ws).length });

function joinRoom(s, room) {
  if (s.room === room && s.p) return sendJoined(s);
  leaveRoom(s);
  const g = room.game;
  let p = [...g.players.values()].find((q) => !q.bot && q.name === s.name);
  if (!p) p = g.addPlayer(s.name, { best: scores[s.name]?.best ?? 0, heroType: scores[s.name]?.hero });
  const wasAway = !!p.away;
  p.connected = true; p.leftAt = 0; p.away = false;
  // coming back to the open world: everything that was kept is given back
  const kept = stash.get(accKey(s.name));
  if (kept && kept.room === room.id && !p.alive && g.unstashPlayer(p, kept.data, wasAway)) {
    stash.delete(accKey(s.name));
    // offline income: 50 % of what they earned per minute when they left, for the time away (max 24 h)
    const min = Math.min(OFFLINE_MAX_MIN, Math.max(0, (Date.now() - kept.at) / 60000));
    const got = {};
    for (const r of RES) { const v = g.gain(p, r, (kept.data.inc?.[r] ?? 0) * OFFLINE_RATE * min); if (v >= 1) got[r] = Math.floor(v); }
    const txt = Object.entries(got).map(([r, v]) => `${v.toLocaleString('vi')} ${RES_INFO[r].name}`).join(', ');
    if (txt) g.notice(p.id, `Offline ${Math.round(min)} phút: nhận ${txt} (50% tốc độ online)`, 'ok');
    console.log(`unstash: ${s.name}, offline ${Math.round(min)} min`);
  }
  s.room = room; s.p = p; s.invKey = null;
  room.emptySince = 0;
  sendJoined(s);
}
function sendJoined(s) {
  const room = s.room, g = room.game, p = s.p;
  send(s.ws, { t: 'joined', hellGate: room.mode === 'endless' ? [hellGate.x, hellGate.y] : null, hellRuns: [...hell.runs.values()].filter((r) => !r.ended).length, king: g.king ? [g.king.tx, g.king.ty] : null, queen: g.queen ? [g.queen.tx, g.queen.ty] : null, camps: g.camps.map((c) => [c.level, c.x, c.y]), room: { id: room.id, name: room.name, mode: room.mode, by: room.by }, you: p.id, alive: p.alive, hero: p.heroType, best: p.best, death: p.alive ? null : p.deathInfo });
  send(s.ws, playersMsg(room)); send(s.ws, { t: 'm', list: mineState(g) }); send(s.ws, matchMsg(room));
  if (room.mode === 'endless') { send(s.ws, { t: 'bases', list: g.basesInfo(p.acc) }); send(s.ws, { t: 'cleared', list: [...g.cleared] }); send(s.ws, { t: 'chunks', v: chunkr.versions(), all: true }); }
}
/** leave the current room: the hero and army disappear from that world */
function leaveRoom(s) {
  if (!s.room) return;
  if (s.p) takeOut(s.room, s.p);
  if (!s.room.sessions.some((x) => x !== s)) s.room.emptySince = Date.now();
  s.room = null; s.p = null;
}

/** check-in rewards go into the open-world kho / bag (kept until the player is alive there) */
function deliverRewards(s) {
  const c = checkins[accKey(s.name)];
  if (!c?.pending?.length || s.room?.mode !== 'endless' || !s.p?.alive) return;
  const g = s.room.game, p = s.p, h = g.units.get(p.hero);
  const got = [];
  for (const rw of c.pending) {
    if (rw.res) { for (const [r, v] of Object.entries(rw.res)) g.gain(p, r, v); got.push(Object.entries(rw.res).map(([r, v]) => `${v} ${RES_INFO[r].name}`).join(', ')); }
    if (rw.exact) { const it = restatItem({ ...rw.exact, id: g.nextItem++ }, g.heroLvOf(p)); p.bag ??= []; if (p.bag.length < BAG_SIZE) { p.bag.push(it); if (!p.equip?.[it.slot]) g.equipItem(p, it.id); } else if (h) g.dropItem(it, h.x, h.y, 1, p.id); got.push(it.name); }
    if (rw.item) {
      const it = makeItem(g.nextItem++, rw.item, Math.random, undefined, g.heroLvOf(p));
      p.bag ??= [];
      if (p.bag.length < BAG_SIZE) { p.bag.push(it); if (!p.equip?.[it.slot]) g.equipItem(p, it.id); } else if (h) g.dropItem(it, h.x, h.y, 1, p.id);
      got.push(`${it.name} (${TIER_INFO[it.tier].name})`);
    }
  }
  const note = c.pending.find((rw) => rw.note)?.note;
  c.pending = []; saveCheckins();
  g.notice(p.id, `🎁 ${note ?? 'Quà điểm danh'}: ${got.join(' · ')}`, 'ok');
  send(s.ws, ciState(s.name));
}

// ---------------------------------------------------------------- sockets
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 4096 });
wss.on('connection', (ws, req) => {
  const ip = ipOf(req);
  const cf = req.headers['cf-connecting-ip'];
  const conn = { ip, ua: req.headers['user-agent'], origin: req.headers.origin, local: !cf && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress ?? '') };
  let sess = null, bucket = 40, lastFill = Date.now();
  ws.on('message', (buf) => {
    // command rate limit: 40 burst, 25/s refill. Scripts spamming orders get dropped, then disconnected.
    const now = Date.now(); bucket = Math.min(40, bucket + ((now - lastFill) / 1000) * 25); lastFill = now;
    if (--bucket < -60) { try { ws.close(4008, 'too many messages'); } catch {} return; }
    if (bucket < 0) return;
    let c; try { c = JSON.parse(buf); } catch { return; }
    if (!sess) {
      if (c.t !== 'hello') return;
      let name = String(c.name ?? '').trim().slice(0, 18);
      // typing a name without Vietnamese accents ("Hoang") logs into the accented account ("Hoàng")
      if (!accounts[name.toLowerCase()]) { const m = Object.keys(accounts).find((k) => plainName(k) === plainName(name)); if (m) name = accounts[m].name; }
      let s = c.token && sessions.get(c.token);
      if (s && s.name.toLowerCase() !== name.toLowerCase()) s = null;
      if (!s) {
        if (!name) return send(ws, { t: 'auth-fail', reason: 'Nhập tên của bạn' });
        if (throttled(ip)) return send(ws, { t: 'auth-fail', reason: 'Thử sai quá nhiều lần. Đợi 5 phút rồi thử lại.' });
        const pw = String(c.password ?? '');
        if (!pw) return send(ws, { t: 'auth-fail', reason: c.token ? 'Phiên đăng nhập đã hết, nhập mật khẩu' : 'Nhập mật khẩu', needPw: true });
        const acc = accounts[name.toLowerCase()];
        if (acc) { if (!checkPw(acc, pw)) { failed(ip); return send(ws, { t: 'auth-fail', reason: 'Sai mật khẩu', needPw: true }); } }
        else {
          // new accounts need the invite code (anti-bot, like Ant War) and at most 3 per IP per day
          if (String(c.invite ?? '').trim().toLowerCase() !== cfg.invite.toLowerCase()) { failed(ip); return send(ws, { t: 'auth-fail', reason: 'Tên mới: cần mã mời đúng để tạo tài khoản', needInvite: true }); }
          if (pw.length < 3) return send(ws, { t: 'auth-fail', reason: 'Mật khẩu cần ít nhất 3 ký tự', needPw: true });
          if (!/^[\p{L}\p{N} _.-]{2,18}$/u.test(name)) return send(ws, { t: 'auth-fail', reason: 'Tên chỉ gồm chữ, số, khoảng trắng, dấu _ . - (2–18 ký tự)' });
          const recent = (createdBy.get(ip) ?? []).filter((t) => Date.now() - t < 864e5);
          if (recent.length >= 3) return send(ws, { t: 'auth-fail', reason: 'Máy này đã tạo đủ 3 tài khoản hôm nay' });
          createdBy.set(ip, [...recent, Date.now()]);
          accounts[name.toLowerCase()] = { name, ...hashPw(pw), created: Date.now() }; saveAccounts();
          console.log('new account', name, ip);
        }
        const real = accounts[name.toLowerCase()].name;
        s = [...sessions.values()].find((x) => x.name.toLowerCase() === real.toLowerCase());
        if (s) { sessions.delete(s.token); s.token = crypto.randomBytes(12).toString('hex'); sessions.set(s.token, s); }
        else { s = { token: crypto.randomBytes(12).toString('hex'), name: real, ws: null, room: null, p: null }; sessions.set(s.token, s); }
      }
      if (bw?.blocked(accKey(s.name))) return send(ws, { t: 'auth-fail', reason: bw.message(accKey(s.name)), blocked: true });
      bw?.connect(accKey(s.name), { ...conn, wd: !!c.wd });
      if (s.ws && s.ws !== ws) try { send(s.ws, { t: 'kicked' }); s.ws.close(); } catch {}
      s.ws = ws; sess = s;
      if (s.p && !s.hell) { s.p.connected = true; s.p.leftAt = 0; }
      send(ws, { t: 'welcome', av: ASSET_V, name: s.name, token: s.token, seed: SEED, W: world.W, H: world.H, mines: mineInfo, spawns: world.spawns, wins: scores[s.name]?.wins ?? 0, best: scores[s.name]?.best ?? 0 });
      send(ws, roomsMsg());
      send(ws, ciState(s.name));
      if (s.room) sendJoined(s);
      if (s.hell) { const run = hell.runs.get(s.hell); if (run && !run.ended) send(ws, { t: 'hell', id: run.id, seed: run.seed, mode: run.mi, you: s.p?.id, gate: [hellGate.x, hellGate.y] }); else s.hell = null; }
      return;
    }
    if (bw) {
      const k = accKey(sess.name);
      if (bw.blocked(k)) { send(ws, { t: 'auth-fail', reason: bw.message(k), blocked: true }); try { ws.close(); } catch {} return; }
      bw.record(k, String(c.t));
    }
    if (c.t === 'logout') {
      // logging out removes the player from the server right away
      leaveRoom(sess); sessions.delete(sess.token); sess.ws = null; sess = null;
      try { ws.close(); } catch {}
      return;
    }
    if (c.t === 'rooms') return send(ws, roomsMsg());
    if (c.t === 'ci') return send(ws, ciState(sess.name));
    if (c.t === 'checkin') {
      const k = accKey(sess.name), today = vnDay();
      const ci = (checkins[k] ??= { count: 0, last: '', pending: [] });
      if (ci.last === today) return send(ws, { t: 'n', kind: 'err', text: 'Hôm nay bạn đã điểm danh rồi, mai quay lại nhé' });
      const [y, mo, d] = today.split('-').map(Number), len = new Date(Date.UTC(y, mo, 0)).getUTCDate();
      const rw = checkinReward(d, len), mk = today.slice(0, 7);
      ci.count++; ci.last = today; ci.pending.push(rw);
      ((ci.days ??= {})[mk] ??= []).push(d);
      saveCheckins();
      const where = sess.room?.mode === 'endless' && sess.p?.alive ? '' : ' Quà sẽ vào kho khi bạn ở Thế giới mở.';
      send(ws, { t: 'n', kind: 'ok', text: `Điểm danh ngày ${d}/${mo} thành công!${where}` });
      send(ws, ciState(sess.name));
      deliverRewards(sess);
      return;
    }
    if (c.t === 'joinroom') { const r = rooms.get(String(c.id)); if (r) joinRoom(sess, r); return; }
    if (c.t === 'createroom') {
      const matchRooms = [...rooms.values()].filter((r) => r.mode === 'match');
      if (matchRooms.length >= MAX_ROOMS) return send(ws, { t: 'n', kind: 'err', text: 'Đã đủ số phòng, vào một phòng có sẵn nhé' });
      const nm = String(c.name ?? '').trim().slice(0, 24) || `Phòng của ${sess.name}`;
      const id = 'r' + crypto.randomBytes(3).toString('hex');
      const room = new Room({ id, name: nm, mode: 'match', by: sess.name });
      rooms.set(id, room);
      joinRoom(sess, room);
      return;
    }
    if (c.t === 'deleteroom') {
      const r = rooms.get(String(c.id));
      if (!r || r.mode !== 'match') return;
      if (r.by !== sess.name) return send(ws, { t: 'n', kind: 'err', text: 'Chỉ chủ phòng mới xoá được phòng này' });
      for (const x of r.sessions) { leaveRoom(x); send(x.ws, { t: 'left' }); if (x !== sess) send(x.ws, { t: 'n', kind: 'warn', text: `Phòng "${r.name}" đã bị chủ phòng xoá` }); }
      rooms.delete(r.id); console.log('room deleted by owner', r.id, sess.name);
      const lm = JSON.stringify(roomsMsg());
      for (const x of sessions.values()) if (x.ws?.readyState === 1 && !x.room) x.ws.send(lm);
      return;
    }
    // the client finished loading after joining: send again what it may have dropped (inventory, bases, cleared tiles)
    if (c.t === 'resync-inv') { sess.invKey = null; sess.chestV = null; return; } // client saw an item in both bag and chest
    if (c.t === 'resync') { sess.invKey = null; sess.chestV = null; sess.defV = null; sess.questV = null; const room = sess.room, g = room?.game, p = sess.p; if (g?.bases && p) { send(ws, { t: 'bases', list: g.basesInfo(p.acc) }); send(ws, { t: 'cleared', list: [...g.cleared] }); send(ws, { t: 'chunks', v: chunkr.versions(), all: true }); } return; }
    if (c.t === 'leaveroom') { leaveRoom(sess); send(ws, { t: 'left' }); send(ws, roomsMsg()); return; }
    // 15/11/2026: Tổ đội chat, only the members get it
    if (c.t === 'pchat') {
      const text = String(c.text ?? '').slice(0, 140).trim(), g = sess.room?.game, pt = sess.p && g?.partyOf?.(sess.p);
      if (!text) return; if (!pt) return send(ws, { t: 'n', kind: 'err', text: 'Chưa có tổ đội' });
      const ids = new Set(pt.members), msg = JSON.stringify({ t: 'chat', ch: 'party', from: sess.name, color: sess.p?.color ?? '#fff', text });
      for (const x of sess.room.sessions) if (x.p && ids.has(x.p.id) && x.ws?.readyState === 1) x.ws.send(msg);
      return;
    }
    if (c.t === 'chat') { const text = String(c.text ?? '').slice(0, 140).trim(); if (text && sess.room) sess.room.broadcast({ t: 'chat', from: sess.name, color: sess.p?.color ?? '#fff', text }); return; }
    if (!sess.room || !sess.p) return;
    if (c.t === 'hell-enter') { hellEnter(sess, c.mode); return; }
    if (sess.hell) { const run = hell.runs.get(sess.hell); if (run && !run.over && process.env.HELL_TEST && c.t === 'htest-end') { run.finish(c.why ?? 'exit'); return; } if (run && !run.over && typeof c.t === 'string' && c.t[0] === 'h') run.input(sess.p.id, c); return; } // down in Hell: world commands are ignored
    if (c.t === 'pet-refine') { // Than Hồn → Hỏa luyện of the worn pet (docs/design/29 §7.1)
      const g = sess.room.game, pr = g.heroProgOf(sess.p), pet = g.petOf(sess.p); if (!pr || !pet) return send(ws, { t: 'n', kind: 'err', text: 'Chưa đeo thú cưng' });
      pr.petRef ??= {}; const lv = (pr.petRef[pet] ?? 0) + 1; if (lv > PET_REFINE_MAX) return send(ws, { t: 'n', kind: 'err', text: 'Thú cưng đã Hỏa luyện tối đa' });
      const cost = petRefineCost(lv); if ((pr.soul ?? 0) < cost) return send(ws, { t: 'n', kind: 'err', text: `Cần ${cost} Than Hồn (đang có ${Math.floor(pr.soul ?? 0)})` });
      pr.soul -= cost; pr.petRef[pet] = lv; send(ws, { t: 'n', kind: 'ok', text: `🔥 Hỏa luyện cấp ${lv}: thú cưng +${Math.round(lv * PET_REFINE_STEP * 100)}% máu và sát thương` }); return;
    }
    const room = sess.room, game = room.game, p = sess.p;
    if (c.t === 'view') { p.view = { x: +c.x || 0, y: +c.y || 0, w: Math.min(80, +c.w || 40), h: Math.min(60, +c.h || 30) }; return; }
    if (c.t === 'ping') { send(ws, { t: 'pong', id: c.id }); return; }
    // Xem thông tin (14/11/2026): another player's stats and the gear they wear (read only)
    if (c.t === 'pinfo') {
      const q = game.players.get(+c.id); if (!q) return;
      const h = q.alive && game.units.get(q.hero), pr = game.heroProgOf?.(q);
      send(ws, { t: 'pinfo', id: q.id, name: q.name, color: q.color, hero: q.heroType, bot: !!q.bot, alive: !!q.alive, lv: pr?.lv ?? null, title: game.titleOf?.(q) ?? null, pet: game.petOf?.(q) ?? null, score: Math.round(q.score ?? 0),
        hs: h ? [h.maxHp, r1(h.atk), Math.round(h.armor * 100), Math.round((q.speedBonus ?? 0) * 100), Math.round(100 / h.cd) / 100, Math.round((h.ls ?? 0) * 1000) / 10, Math.round((h.dodge ?? 0) * 1000) / 10] : null,
        equip: q.equip ?? {}, army: game.armyList ? game.armyList(q).length : 0 });
      return;
    }
    if (process.env.CHEAT === '1' && cheat(game, p, c)) return;
    // leave the current match (forfeit): the hero falls like a death (loot drops), the player goes back to the room's lobby / hero choice
    // open world: "Rời trận" only goes back to the home page, like going offline (nothing dropped, mines kept)
    if (c.t === 'forfeit' && sess.room?.mode === 'endless') { leaveRoom(sess); send(ws, { t: 'left' }); send(ws, roomsMsg()); return; }
    if (c.t === 'forfeit') { if (p.alive) { p.forfeit = true; game.killPlayer(p, null, 'left'); } return; }
    if (c.t === 'pick') { if (!p.alive && HEROES[c.hero]) p.heroType = c.hero; return; }
    if (c.t === 'startmatch') { if (!p.alive && HEROES[c.hero]) p.heroType = c.hero; game.requestStart(p); return; }
    try { game.cmd(p, c); } catch (e) { console.error('cmd error', c, e); }
  });
  ws.on('close', () => { if (sess && sess.ws === ws) { sess.ws = null; if (sess.p) { sess.p.connected = false; sess.p.leftAt = sess.room.game.t; } } });
});
function cheat(game, p, c) {
  const h = game.units.get(p.hero);
  const tp = (x, y) => { if (!h) return; h.x = x; h.y = y; for (const id of p.units) { const u = game.units.get(id); if (u) { u.x = x; u.y = y; } } p.path = null; };
  if (c.t === 'cheat' && p.alive) {
    for (const r of RES) p.res[r] += 5000;
    if (c.mine != null) { const m = game.mines.find((q) => q.type === c.mine && q.guards.size); if (m) tp(m.x + 7, m.y + 1); }
    if (c.noshield) p.shieldUntil = 0;
    return true;
  }
  if (c.t === 'cheat-boss' && p.alive) { const b = [...game.units.values()].find((u) => u.boss === c.boss); if (b) { tp(b.x + 9, b.y + 2); if (c.hp) b.hp = c.hp; } return true; }
  if (c.t === 'cheat-time') { game.match.start -= +c.s; return true; }
  if (c.t === 'cheat-die' && p.alive) { game.killPlayer(p, null, 'killed'); return true; }
  if (c.t === 'cheat-tp' && p.alive) { tp(+c.x, +c.y); return true; }
  if (c.t === 'cheat-done') { const b = game.baseOf?.(p); if (b) for (const it of b.items) if (it.doneAt > game.t) it.doneAt = game.t; for (const m of game.mines) if (m.upAt) m.upAt = game.t; return true; }
  if (c.t === 'cheat-own' && p.alive) { const h = game.units.get(p.hero), m = game.mines.filter((q) => q.type === (c.mine ?? 'iron')).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0]; for (const id of m.guards) game.units.delete(id); m.guards.clear(); m.owner = p.id; m.holdStart = game.t; m.changed = true; tp(m.x, m.y + 1); return true; }
  if (c.t === 'cheat-items') { p.bag ??= []; const T = c.hi ? ['mythic', 'black'] : ['common', 'common', 'fine', 'uncommon', 'rare', 'epic', 'legendary']; while (p.bag.length < 16) p.bag.push(makeItem(game.nextItem++, T[p.bag.length % T.length], Math.random, undefined, game.heroLvOf(p))); const b = game.baseOf?.(p); if (b) { b.dust = Object.fromEntries(T.map((t) => [t, 20])); if (!c.hi) b.dust.mythic = 0; game.chestTouch?.(b); } return true; }
  if (c.t === 'cheat-quest') { const q = game.questOf?.(p); if (q) { for (const e of q.list) e.got = e.need; q.cnt.monster = 150; q.cnt.boss = 3; q.v++; } return true; }
  if (c.t === 'cheat-raid') { const b = game.baseOf?.(p); if (b) game.onBuildHit({ baseKey: b.key }, null); return true; }
  if (c.t === 'cheat-battle') { const b = game.baseOf?.(p); const other = [...game.bases.values()].find((x) => x.key !== b?.key && x.items.length); if (b && other) { const ap = { acc: other.key, name: other.name, color: other.color, heroType: other.heroType }; game.battleHit(b, ap); game.battleRuin(b, 'thap-cung', ap); game.battleRuin(b, 'tuong', ap); if (c.fall) { game.battleRuin(b, 'thanh-tri', ap); game.battleLoot(b, { iron: 1234, gold: 800 }); } b.battle.defLost = 7; b.battle.enemyKilled = 12; b.battle.traps = 2; b.battle.last = game.t - 31; } return true; }
  if (c.t === 'cheat-die') { const h = game.units.get(p.hero); if (h) { h.hp = 0; h.dead = true; game.killPlayer(p, null, 'killed'); } return true; }
  if (c.t === 'cheat-fire') { const h = game.units.get(p.hero); if (h) { const own = p.units.map((id) => game.units.get(id)).filter(Boolean); const tg = own[0]; game.addFire(tg.x, tg.y, 3, 4, 40, h.team, h); const near = [...game.near(tg.x, tg.y, 3)]; const hp0 = near.map((u) => u.hp); setTimeout(() => { const lost = near.map((u, i) => [u.owner === p.id ? 'own' : 'other', hp0[i] - u.hp]); console.log('FIRETEST', JSON.stringify(lost.reduce((o, [k, v]) => { o[k] = (o[k] ?? 0) + v; return o; }, {}))); }, 3000); } return true; }
  if (c.t === 'cheat-xp') { game.gainXp?.(p, +c.n || 1000); return true; }
  if (c.t === 'cheat-event') { game.endEvent?.(null); game.startEvent?.(c.kind === 'cart' ? 'cart' : 'chief'); return true; }
  if (c.t === 'cheat-tp') { const h = game.units.get(p.hero); if (h) { const f = game.world.nearestFree(+c.x, +c.y, 6) ?? { x: +c.x, y: +c.y }; h.x = f.x; h.y = f.y; p.path = null; for (const id of p.units) { const u = game.units.get(id); if (u) { u.x = f.x; u.y = f.y; } } } return true; }
  if (c.t === 'cheat-res') { for (const r of Object.keys(p.res)) p.res[r] = (p.res[r] ?? 0) + (+c.n || 50000); return true; }
  return false;
}

// ---------------------------------------------------------------- snapshots (per room)
const GARRISON_SHOW = 10;
function unitRow(g, u) {
  const p = u.owner ? g.players.get(u.owner) : null;
  let f = 0;
  if (p && p.shieldUntil > g.t) f |= 1;
  if (u.kind === 'hero') f |= 2;
  if (u.kind === 'guard') f |= 4;
  if (u.rout) f |= 8;
  if (u.fly) f |= 16;
  if (u.stunUntil > g.t) f |= 32;
  if (p && p.skillUntil > g.t) f |= 64;
  if (u.hiddenUntil > g.t || u.invisUntil > g.t) f |= 128; // + Nữ hoàng Băng blizzard (16/11/2026)
  return [u.id, TYPE_CODE[u.type], u.owner, Math.round(u.x * 16), Math.round(u.y * 16), Math.ceil(u.hp), u.maxHp, u.dir, u.act, Math.min(255, Math.round((g.t - u.actT) * 20)), f, u.lv ?? 1];
}
function snapshot(room, sess) {
  const game = room.game, p = sess.p, h = game.units.get(p.hero);
  let v = p.view;
  if (!v) v = h ? { x: h.x - 20, y: h.y - 14, w: 40, h: 28 } : { x: 108, y: 108, w: 40, h: 40 };
  const M = 6, x0 = v.x - M, y0 = v.y - M, x1 = v.x + v.w + M, y1 = v.y + v.h + M;
  const inRect = (x, y) => x >= x0 && y >= y0 && x <= x1 && y <= y1;
  // fog of war: a living player only sees around the hero (VISION, more next to a watchtower) and a little around each soldier
  let inV = inRect, vr = 0;
  const mateIds = new Set(game.partyMembers ? game.partyMembers(p).map((q) => q.id) : [p.id]);
  if (p.alive && h) {
    vr = world.map.towers.some((tw) => Math.hypot(tw.x + 0.5 - h.x, tw.y + 0.5 - h.y) < 3) ? VISION_TOWER : VISION;
    // shared vision (14/11/2026): party mates see what each other sees (heroes, soldiers, mines, Thành trì)
    const mates = game.partyMembers ? game.partyMembers(p).filter((q) => q.alive) : [p];
    const own = mates.flatMap((q) => q.units.map((id) => game.units.get(id)).filter(Boolean));
    // owned mines and my own Thành trì also see around them (only those near the view matter)
    const src = [];
    for (const q of mates) {
      if (q !== p) { const qh = game.units.get(q.hero); if (qh && !qh.dead) src.push([qh.x, qh.y, world.map.towers.some((tw) => Math.hypot(tw.x + 0.5 - qh.x, tw.y + 0.5 - qh.y) < 3) ? VISION_TOWER : VISION]); }
      for (const m of game.mines) if (m.owner === q.id) src.push([m.x, m.y, VISION_MINE]);
      const bb = game.bases && game.baseOf(q), th = bb && game.thOf(bb);
      if (th && th.state !== 'ruin') src.push([th.tx + 1.5, th.ty + 1.5, VISION_BASE]);
    }
    sess.vs = src;
    const near = src.filter(([sx, sy, r]) => sx + r >= x0 && sx - r <= x1 && sy + r >= y0 && sy - r <= y1);
    inV = (x, y) => inRect(x, y) && (Math.hypot(x - h.x, y - h.y) <= vr || near.some(([sx, sy, r]) => Math.hypot(x - sx, y - sy) <= r) || own.some((u) => Math.abs(u.x - x) < UNIT_VISION && Math.abs(u.y - y) < UNIT_VISION && Math.hypot(u.x - x, u.y - y) <= UNIT_VISION));
  }
  const u = [], seen = new Set();
  // other players' mine garrisons stay hidden until something happens there (12/11/2026): fighting, a capture, or my hero close by
  const hh = game.units.get(p.hero), gVis = new Map();
  const garrisonSeen = (q) => {
    let v = gVis.get(q.mine); if (v !== undefined) return v;
    const m = game.mines[q.mine];
    v = !m || !!m.cap || (hh && !hh.dead && Math.hypot(hh.x - m.x, hh.y - m.y) < 16) || [...m.guards].some((id) => { const g = game.units.get(id); return g && (g.foe || game.t - (g.lastHurt ?? -1e9) < 10); });
    gVis.set(q.mine, v); return v;
  };
  // a quiet guard post shows at most 10 of its soldiers (12/11/2026: less clutter); all of them while it fights or is captured
  const gShow = new Map();
  const garrisonShown = (q) => {
    let set = gShow.get(q.mine);
    if (set === undefined) {
      const m = game.mines[q.mine];
      const busy = !m || !!m.cap || m.guards.size <= GARRISON_SHOW || [...m.guards].some((id) => { const g = game.units.get(id); return g && (g.foe || game.t - (g.lastHurt ?? -1e9) < 10); });
      set = busy ? null : new Set([...m.guards].sort((x, y) => x - y).slice(0, GARRISON_SHOW));
      gShow.set(q.mine, set);
    }
    return !set || set.has(q.id);
  };
  for (const q of game.units.values()) {
    if (q.garrison && game.mode === 'endless' && (!garrisonShown(q) || (!mateIds.has(q.owner) && !garrisonSeen(q)))) continue;
    if (q.owner === p.id || inV(q.x, q.y)) { u.push(unitRow(game, q)); seen.add(q.id); }
  }
  const ev = [];
  for (const e of game.events) {
    if (e.to && e.to !== p.id) continue;
    if (e.to === p.id || (e.x != null && inV(e.x, e.y)) || (e.id && seen.has(e.id))) ev.push(e);
  }
  const msg = { t: 's', time: r1(game.t), u, ev };
  if (game.tick % 10 === 0) msg.it = [...game.items.values()].filter((g) => inV(g.x, g.y)).map((g) => ({ id: g.id, x: r1(g.x), y: r1(g.y), item: g.item, owner: g.owner || 0 }));
  const invKey = p.alive ? JSON.stringify([p.equip, p.bag]) : '';
  if (invKey !== sess.invKey) { sess.invKey = invKey; msg.inv = { equip: p.equip ?? {}, bag: p.bag ?? [] }; }
  if (game.tick % 5 === 0 && game.partyInfo) { const pi = game.partyInfo(p); if (pi || sess.hadParty) { msg.party = pi; sess.hadParty = !!pi; } }
  if (game.tick % 10 === 0) { const q = game.questOf?.(p); if (q && sess.questV !== q.v) { sess.questV = q.v; msg.quest = game.questInfo(p); } }
  { const bb = game.bases && p.acc ? game.bases.get(p.acc) : null; if (bb && sess.defV !== (bb.defV ?? 0)) { sess.defV = bb.defV ?? 0; msg.dlog = game.defInfo(bb); } }
  { const bb = game.bases && p.acc ? game.bases.get(p.acc) : null; if (bb && sess.chestV !== (bb.chestV ?? 0)) { sess.chestV = bb.chestV ?? 0; msg.chest = { items: bb.chest ?? [], dust: bb.dust ?? {} }; } }
  if (p.alive) {
    const { inc, mg, n } = game.income(p);
    const counts = {};
    for (const q of game.armyList(p)) counts[q.type] = (counts[q.type] ?? 0) + 1;
    msg.me = {
      res: RES.map((r) => Math.floor(p.res[r])), inc: RES.map((r) => Math.round(inc[r])), mg, mines: n, rings: p.rings, used: game.usedSlots(p), total: 0,
      q: p.queue.map((q) => [q.type, r1(q.readyAt - game.t), q.total]), cd: r1(Math.max(0, p.skillReadyAt - game.t)), sk: r1(Math.max(0, p.skillUntil - game.t)),
      shield: Math.max(0, Math.round(p.shieldUntil - game.t)), combat: game.team(p.id).combat, mode: p.mode, hold: p.hold || (!p.units.length && ((p.stowed?.length ?? 0) || (game.bases && game.baseOf(p)?.garrison.length))) ? 1 : 0, hstep: (() => { if (p.hold || (!p.units.length && ((p.stowed?.length ?? 0) || (game.bases && game.baseOf(p)?.garrison.length)))) return 3; const b = game.bases && game.baseOf(p); if (!b || game.thOf(b)?.state === 'ruin') return 0; return b.garrison.length ? 2 : 1; })(), cap: (() => { const c = game.capOf(p); return c ? RES.map((r) => c[r]) : null; })(), hero: p.hero, counts, score: Math.round(p.score),
      ac: [game.armyCount(p), Number.isFinite(game.armyCap(p)) ? game.armyCap(p) : 0],
      mx: game.heroProgOf(p)?.mx ?? undefined, // extra mine slots bought from the Desert Queen
      cfg: game.heroProgOf(p)?.cfg ?? undefined, // Tự động: { farm, lv, pick }
      pets: game.heroProgOf(p)?.pets ?? undefined, pet: game.heroProgOf(p)?.pet ?? undefined, // Thú cưng
      hl: (() => { const pr = game.heroProgOf(p); return pr ? [pr.lv, Math.floor(pr.xp), heroXpNeed(pr.lv), pr.pts, pr.cap, pr.st.hp ?? 0, pr.st.atk ?? 0, pr.st.as ?? 0, pr.st.ms ?? 0, pr.st.ar ?? 0, pr.st.ls ?? 0, pr.st.dg ?? 0] : null; })(),
      sl: (() => { const pr = game.heroProgOf(p); return pr ? [Math.floor(pr.soul ?? 0), pr.petRef ?? {}] : null; })(), // Than Hồn + Hỏa luyện levels (16/11/2026)
      rc: p.recallAt ? r1(Math.max(0, p.recallAt - game.t)) : 0, vr, vs: (sess.vs ?? []).map(([x, y, r]) => [r1(x), r1(y), r]), hc: Math.max(0, Math.ceil((p.heroChangeAt ?? 0) - game.t)), life: Math.round(game.t - p.bornAt), hs: h ? [h.maxHp, r1(h.atk), Math.round(h.armor * 100), Math.round((p.speedBonus ?? 0) * 100), Math.round(100 / h.cd) / 100, Math.round((h.ls ?? 0) * 1000) / 10, Math.round((h.dodge ?? 0) * 1000) / 10] : null, path: p.path ? p.path.map((w) => [r1(w.x), r1(w.y)]).slice(0, 12) : null, goal: p.goalMine,
    };
  }
  return msg;
}
const mineState = (g) => g.mines.map((m) => [m.owner, m.cap ? m.cap.by : 0, m.cap ? Math.round((m.cap.p / m.cap.T) * 255) : 0, m.guards.size, m.cap?.steal ? 1 : 0, m.owner ? Math.round(g.t - m.holdStart) : 0, m.owner || m.guards.size ? 0 : Math.max(0, Math.round(240 - (g.t - m.emptySince))), m.protectUntil > g.t ? Math.ceil((m.protectUntil - g.t) / 10) * 10 : 0, m.lv ?? 1, m.upAt ? Math.max(1, Math.round(m.upAt - g.t)) : 0, m.upAt ? m.upTotal : 0, m.moved ? Math.round(m.x * 10) / 10 : 0, m.moved ? Math.round(m.y * 10) / 10 : 0]);
function playersMsg(room) {
  const g = room.game;
  const list = [...g.players.values()].map((p) => {
    const h = g.units.get(p.hero);
    return { id: p.id, name: p.name, color: p.color, hero: p.heroType, alive: p.alive, bot: p.bot, away: !!p.away, score: Math.round(p.score), best: p.best,
      mines: g.mines.filter((m) => m.owner === p.id).length, dia: g.mines.some((m) => m.owner === p.id && m.type === 'diamond'),
      units: g.armyList(p).length, mt: g.mines.reduce((o, m) => { if (m.owner === p.id) o[m.type] = (o[m.type] ?? 0) + 1; return o; }, {}), life: p.alive ? Math.round(g.t - p.bornAt) : 0, dragons: p.units.filter((id) => g.units.get(id)?.type === 'rong').length,
      x: h && p.alive ? r1(h.x) : null, y: h && p.alive ? r1(h.y) : null, on: p.bot || p.connected, died: p.diedIn === g.match.n, title: g.titleOf?.(p) ?? undefined, glow: p.glow ?? undefined, pet: g.petOf?.(p) ?? undefined };
  });
  return { t: 'pl', list, ev: g.eventInfo?.() ?? null }; // + the world event (banner, minimap)
}
const c2 = (c) => c && { x: r1(c.x), y: r1(c.y), r: r1(c.r) };
function matchMsg(room) {
  const g = room.game, M = g.match, z = g.zone ?? g.zoneNow();
  return { t: 'mt', mode: room.mode, n: M.n, phase: M.phase, startIn: M.startAt ? Math.max(0, Math.ceil(M.startAt - g.t)) : 0, startedBy: M.startedBy, el: Math.round(g.t - M.start), len: MATCH_LEN, join: JOIN_WINDOW, endIn: M.phase === 'end' ? Math.round(M.endAt - g.t) : 0,
    alive: [...g.players.values()].filter((p) => p.alive).length, cur: room.mode === 'endless' ? null : c2(z.cur), next: c2(z.next), zs: z.state, zin: z.until ? Math.max(0, Math.round(z.until - g.t)) : 0, dmg: z.dmg,
    bosses: [...g.units.values()].filter((u) => u.boss && !u.dead).map((u) => [u.type, r1(u.x), r1(u.y), r1(u.bossHome.x), r1(u.bossHome.y), u.id]),
    respawn: Object.entries(g.bossDead ?? {}).map(([type, at]) => [type, Math.max(0, Math.round(at + BOSS_RESPAWN - g.t)), r1(g.bossSpots?.[type]?.x ?? 0), r1(g.bossSpots?.[type]?.y ?? 0)]), // + where it comes back (minimap blue crown, 13/11/2026)
    cs: g.camps.map((c) => (c.guards.size ? 0 : Math.max(1, Math.round(c.emptySince + CAMPS[c.level].respawn - g.t)))) };
}

// ---------------------------------------------------------------- admin (edit data/admin.json on the server machine)
// { "rich": ["HHD"] } → those players are topped up to 99 999 of every resource (testing)
let admin = { rich: [] }, adminMtime = 0;
function loadAdmin() {
  try { const st = fs.statSync(DATA + 'admin.json'); if (st.mtimeMs !== adminMtime) { adminMtime = st.mtimeMs; admin = JSON.parse(fs.readFileSync(DATA + 'admin.json', 'utf8')); console.log('admin:', JSON.stringify(admin)); } } catch {}
  // { "gifts": { "<name>": [{ "exact": <item>, "res": {...}, "note": "..." }] } } → handed out like check-in rewards, then removed from the file
  if (admin.gifts && Object.keys(admin.gifts).length) {
    for (const [name, list] of Object.entries(admin.gifts)) { const c = (checkins[accKey(name)] ??= { count: 0, last: '', pending: [], days: {} }); (c.pending ??= []).push(...list); console.log('gift queued for', name, list.length); }
    saveCheckins();
    delete admin.gifts;
    try { fs.writeFileSync(DATA + 'admin.json', JSON.stringify(admin, null, 1)); adminMtime = fs.statSync(DATA + 'admin.json').mtimeMs; } catch {}
  }
  // { "reload": true } → every open tab reloads now (force F5 without a restart), then removed
  if (admin.reload) {
    let n = 0; for (const x of sessions.values()) if (x.ws?.readyState === 1) { x.ws.send(JSON.stringify({ t: 'reload' })); n++; }
    console.log('admin: reload sent to', n, 'tabs'); delete admin.reload;
    try { fs.writeFileSync(DATA + 'admin.json', JSON.stringify(admin, null, 1)); adminMtime = fs.statSync(DATA + 'admin.json').mtimeMs; } catch {}
  }
  // { "thlv": { "<name>": 4 } } → that player's Thành trì is raised to this level at once (14/11/2026), then removed
  if (admin.thlv && Object.keys(admin.thlv).length && rooms.size) {
    for (const [name, lv] of Object.entries(admin.thlv)) for (const room of rooms.values()) {
      const g = room.game, b = g?.bases?.get(accKey(name)), th = b && g.thOf(b); if (!th) continue;
      if (th.state === 'up') { th.state = 'ok'; th.doneAt = 0; }
      while (th.lv < Math.min(8, +lv || 0)) g.finishUpgrade(th); // TH_MAX 8 (16/11/2026)
      th.state = 'ok'; g.basesDirty = true; console.log('admin: Thành trì of', name, '→ cấp', th.lv);
    }
    delete admin.thlv;
    try { fs.writeFileSync(DATA + 'admin.json', JSON.stringify(admin, null, 1)); adminMtime = fs.statSync(DATA + 'admin.json').mtimeMs; } catch {}
  }
}
loadAdmin();

// ---------------------------------------------------------------- loop
function tickRoom(room) {
  const game = room.game;
  const humans = room.humans().length;
  // open world: more NPC lords roaming around (they respawn by themselves); match rooms: fill up to BOT_TARGET armies
  if (game.tick % 100 === 0) room.bots.ensure(room.mode === 'endless' ? Math.max(4, 7 - humans) : Math.max(0, BOT_TARGET - humans));
  room.bots.update();
  game.update();
  // disconnected for 2 minutes: the hero leaves the map (the account can come back to the home page)
  for (const s of room.sessions) if (!s.ws && s.p && s.p.leftAt && game.t - s.p.leftAt > 120) leaveRoom(s);
  for (const p of [...game.players.values()]) if (!p.bot && !p.connected && p.leftAt && game.t - p.leftAt > 120 && !room.sessionOf(p)) takeOut(room, p);
  if (game.tick % 2 === 0) {
    for (const s of room.sessions) if (s.ws && s.p && !s.hell) send(s.ws, snapshot(room, s));
    game.events.length = 0;
    for (const n of game.notices) {
      const msg = { t: 'n', text: n.text, kind: n.kind, x: n.x, y: n.y, th: n.th, color: n.color, pinv: n.pinv, pname: n.pname };
      if (n.to == null) room.broadcast(msg);
      else for (const s of room.sessions) if (s.p?.id === n.to) send(s.ws, msg);
    }
    game.notices.length = 0;
  }
  if (game.tick % 10 === 0) {
    room.broadcast(matchMsg(room));
    if (game.bases && (game.basesDirty || game.tick % 100 === 0) && room.mode === 'endless') { game.basesDirty = false; for (const ss of sessions.values()) if (ss.room === room && ss.ws && ss.p) send(ss.ws, { t: 'bases', list: game.basesInfo(ss.p.acc) }); }
    const rows = mineState(game), keys = rows.map((r) => r.join(','));
    room.mineKeys ??= [];
    const d = [];
    keys.forEach((k, i) => { if (room.mineKeys[i] !== k) d.push([i, rows[i]]); });
    room.mineKeys = keys;
    if (d.length) room.broadcast({ t: 'm', d });
  }
  if (game.tick % 20 === 0) {
    room.broadcast(playersMsg(room));
    if (room.mode === 'endless') for (const s of room.sessions) deliverRewards(s);
    const rich = new Set(admin.rich ?? []);
    for (const p of game.players.values()) if (p.alive && rich.has(p.name)) for (const r of RES) p.res[r] = Math.max(p.res[r], 99999);
  }
}
let last = performance.now(), acc = 0, ticks = 0;
setInterval(() => {
  const now = performance.now();
  acc += (now - last) / 1000; last = now;
  if (acc > 0.5) acc = 0.5;
  while (acc >= DT) {
    acc -= DT; ticks++;
    // one bad tick must never take the whole server down (it did on 11/11/2026): log it (once a minute per message) and go on
    for (const room of rooms.values()) {
      try { tickRoom(room); } catch (e) { const k = String(e?.stack ?? e).slice(0, 300); if ((tickErrAt.get(k) ?? 0) < Date.now() - 60_000) { tickErrAt.set(k, Date.now()); console.error('tick error in room', room.id, e); } }
    }
    try {
      hell.update(hellEnd);
      if (ticks % 2 === 0) for (const run of hell.runs.values()) {
        if (run.ended && run.sentEnd) continue;
        const evs = run.events; run.events = [];
        for (const m of run.members ?? []) { const s = sessions.get(m.token); if (!s?.ws || s.hell !== run.id) continue; const v = run.view(m.pid); if (v) { v.ev = evs; send(s.ws, v); } }
        if (run.ended) run.sentEnd = true;
      }
    } catch (e) { const k = String(e?.stack ?? e).slice(0, 300); if ((tickErrAt.get(k) ?? 0) < Date.now() - 60_000) { tickErrAt.set(k, Date.now()); console.error('hell tick error', e); } }
    if (ticks % 40 === 0) {
      // home page: room list; empty match rooms are closed after a while
      const lm = JSON.stringify(roomsMsg());
      for (const s of sessions.values()) if (s.ws?.readyState === 1 && !s.room) s.ws.send(lm);
      for (const [id, r] of rooms) if (r.mode === 'match' && !r.sessions.length && r.emptySince && Date.now() - r.emptySince > ROOM_IDLE * 1000) { rooms.delete(id); console.log('room closed', id); }
      loadAdmin();
    }
    if (ticks % 600 === 0) bw?.sweep();
    if (ticks % 100 === 0) try { saveState(); } catch (e) { console.error('save failed', e.message); }
  }
}, 25);

server.listen(PORT, () => console.log(`Sodier War: http://localhost:${PORT}  (seed ${SEED}) · mã mời: ${cfg.invite}`));

// Hero levels, potential points and the Northern King (docs/design/19-cap-anh-hung.md).
// Installed onto Game.prototype by installHero(Game). Progress is per account (this.heroProg), open world only.
import { LS_CAP, DODGE_CAP, bossXpMult, HERO_CAPS, HERO_UNLOCK, HERO_PTS, HERO_STAT, HERO_RESET_COST, HERO_XP, HOUSING, KING_SIZE, KING_SAFE_R, KING_USE_R, ARMOR_CAP, CAMPS, RES_INFO, heroXpNeed , PALACE_BLOCK, PETS } from '../shared/balance.js';

const fmtCost = (c) => Object.entries(c).map(([r, v]) => `${v} ${RES_INFO[r].name}`).join(', ');

export function installHero(Game) {
  const P = Game.prototype;

  /** progress of a player's account (null in match rooms, for bots and guests) */
  P.heroProgOf = function (p) {
    if (this.mode !== 'endless' || !p?.acc || p.bot) return null;
    this.heroProg ??= new Map();
    let pr = this.heroProg.get(p.acc);
    if (!pr) this.heroProg.set(p.acc, (pr = { lv: 1, xp: 0, pts: 0, st: {}, cap: HERO_CAPS[0] }));
    return pr;
  };
  /** level of the hero unit u (for XP rewards) */
  P.heroLvOf = function (p) { return this.heroProgOf(p)?.lv ?? 1; };
  /** bonuses from the points: { hp, atk, as, ms, ar } as absolute / fractional values */
  P.heroPointBonus = function (p) {
    const st = this.heroProgOf(p)?.st ?? {}, v = (k) => (st[k] ?? 0) * HERO_STAT[k].per;
    return { hp: v('hp'), atk: v('atk'), as: v('as'), ms: v('ms'), ar: v('ar'), ls: v('ls'), dg: v('dg') };
  };
  P.gainXp = function (p, n) {
    const pr = this.heroProgOf(p); if (!pr || !(n >= 0)) return;
    n *= 1 + (PETS[pr.pet]?.bonus?.xp ?? 0); // Thỏ Ngọc +20 %, Tiên Hạc +30 %, Bạch Trạch +40 % XP (13/11/2026)
    p.xpAcc = (p.xpAcc ?? 0) + n; // floating "+X XP" over the hero (flushed in Game.update)
    pr.xp += n;
    const lv0 = pr.lv;
    while (pr.lv < pr.cap && pr.xp >= heroXpNeed(pr.lv)) { pr.xp -= heroXpNeed(pr.lv); pr.lv++; pr.pts += HERO_PTS; }
    if (pr.lv >= pr.cap) pr.xp = Math.min(pr.xp, heroXpNeed(pr.lv)); // at the cap the bar fills up and stops
    if (pr.lv > lv0) {
      const h = this.units.get(p.hero);
      if (h) this.events.push({ k: 'levelup', x: h.x, y: h.y, id: h.id });
      this.notice(p.id, `⭐ Lên cấp ${pr.lv}! +${HERO_PTS * (pr.lv - lv0)} điểm tiềm năng (mở Trang bị để cộng)`, 'ok');
      if (pr.lv >= pr.cap && pr.cap < HERO_CAPS[HERO_CAPS.length - 1]) this.notice(p.id, `🔒 Đạt giới hạn cấp ${pr.cap}. Tới Nhà vua phía Bắc để mở giới hạn sức mạnh`, 'warn');
    }
  };
  /** XP for killing e (a = the killing unit, ap = its player) */
  P.xpFor = function (e) {
    if (e.kind === 'build') {
      if (e.type !== 'thanh-tri') return 0;
      const it = this.bases?.get(e.baseKey)?.items.find((i) => i.id === e.bItem);
      return HERO_XP.th * (it?.lv ?? 1);
    }
    if (e.boss) return Math.round(HERO_XP.boss * bossXpMult(e.lv ?? 1));
    if (e.kind === 'hero') { const vp = this.playerOf(e); return HERO_XP.hero + HERO_XP.heroLv * this.heroLvOf(vp); }
    if (e.ev) return e.type === 'thu-linh' || e.type === 'xe-vang' ? HERO_XP.boss : HERO_XP.camp * 8; // Sự kiện thế giới
    if (e.kind === 'guard' && e.camp != null) return HERO_XP.camp * (this.camps[e.camp]?.level ?? 1);
    if (e.kind === 'guard' && !e.garrison && !e.defender) return HERO_XP.wildGuard;
    return HOUSING[e.type] ?? 1; // soldiers of other players (army, mine garrison, base defenders)
  };
  P.awardKillXp = function (e, a, ap) {
    if (this.mode !== 'endless') return;
    const killer = ap ?? (e.lastHitBy ? this.players.get(e.lastHitBy) : null);
    if (!killer || killer.bot || (e.owner && e.owner === killer.id)) return;
    const n = this.xpFor(e) * (a && a.kind !== 'hero' ? 0.5 : 1);
    if (!(n > 0)) return;
    const camp = e.kind === 'guard' && e.camp != null, list = (e.boss || camp || e.ev) ? this.shareAll(killer) : [killer];
    const f = this.partySplit(list.length); // Tổ đội (14/11/2026): every member anywhere, the XP split evenly
    for (const m of list) this.gainXp(m, n * f);
  };
  /** spend one point */
  P.statAdd = function (p, k) {
    const pr = this.heroProgOf(p); if (!pr || !Object.hasOwn(HERO_STAT, k)) return; // own keys only ('constructor' was probed)
    if (pr.pts <= 0) return this.notice(p.id, 'Hết điểm tiềm năng', 'err');
    const S = HERO_STAT[k], max = S.cap(pr.cap);
    if ((pr.st[k] ?? 0) >= max) return this.notice(p.id, `${S.name} đã đạt tối đa ${max} điểm${pr.cap < HERO_CAPS[HERO_CAPS.length - 1] ? ' (mở giới hạn ở Nhà vua phía Bắc để tăng)' : ''}`, 'err');
    const h = this.units.get(p.hero);
    if (k === 'ar' && h && h.armor + S.per > ARMOR_CAP + 1e-9) return this.notice(p.id, `Giáp đã đạt tối đa ${Math.round(ARMOR_CAP * 100)}%`, 'err');
    if (k === 'ls' && h && (h.ls ?? 0) + S.per > LS_CAP + 1e-9) return this.notice(p.id, `Hút máu đã đạt tối đa ${Math.round(LS_CAP * 100)}%`, 'err');
    if (k === 'dg' && h && (h.dodge ?? 0) + S.per > DODGE_CAP + 1e-9) return this.notice(p.id, `Né đã đạt tối đa ${Math.round(DODGE_CAP * 100)}%`, 'err');
    pr.st[k] = (pr.st[k] ?? 0) + 1; pr.pts--;
    this.applyEquip(p);
  };
  P.statReset = function (p) {
    const pr = this.heroProgOf(p); if (!pr) return;
    const used = Object.values(pr.st).reduce((s, v) => s + v, 0);
    if (!used) return this.notice(p.id, 'Chưa cộng điểm nào', 'err');
    if (!this.pay(p, HERO_RESET_COST)) return this.notice(p.id, `Tẩy điểm cần ${fmtCost(HERO_RESET_COST)}`, 'err');
    pr.pts += used; pr.st = {};
    this.applyEquip(p);
    this.notice(p.id, `Đã tẩy ${used} điểm tiềm năng, cộng lại tuỳ ý`, 'ok');
  };

  // ------------------------------------------------------------------ the Northern King
  /** palace position (top-left tile), found once in the quiet north of the map and saved with the world */
  P.findKing = function () {
    const W = this.world.W, [kw, kh] = KING_SIZE, avoid = [...this.mines, ...this.camps, ...(this.world.spawns ?? []), ...Object.values(this.bossSpots ?? {})];
    for (const b of this.bases?.values() ?? []) { const th = this.thOf(b); if (th) avoid.push({ x: th.tx + 1.5, y: th.ty + 1.5 }); }
    let best = null, bs = -1;
    for (let ty = 8; ty <= 22; ty++) for (let tx = 20; tx <= W - 20 - kw; tx += 2) {
      let ok = true;
      for (let y = ty; y < ty + kh + 2 && ok; y++) for (let x = tx - 1; x < tx + kw + 1 && ok; x++) if (!this.world.walkable(x + 0.5, y + 0.5)) ok = false;
      if (!ok) continue;
      const cx = tx + kw / 2, cy = ty + kh / 2;
      const d = Math.min(...avoid.map((o) => Math.hypot(o.x - cx, o.y - cy))) - Math.abs(cx - W / 2) * 0.12;
      if (d > bs) { bs = d; best = { tx, ty }; }
    }
    return best ?? { tx: Math.floor(W / 2) - 4, ty: 4 };
  };
  P.setupKing = function (pos) {
    if (this.mode !== 'endless') return;
    this.king = pos ?? this.findKing();
    const [kw, kh] = KING_SIZE;
    this.king.x = this.king.tx + kw / 2; this.king.y = this.king.ty + kh / 2;
    // the back two thirds of the palace block the way; the stairs in front stay walkable
    for (let y = Math.max(0, this.king.ty); y < this.king.ty + Math.round(kh * PALACE_BLOCK); y++) for (let x = this.king.tx; x < this.king.tx + kw; x++) this.world.block[y * this.world.W + x] = 1;
  };
  P.unblockKing = function () {
    if (!this.king) return;
    const [kw, kh] = KING_SIZE;
    for (let y = Math.max(0, this.king.ty); y < this.king.ty + Math.round(kh * PALACE_BLOCK); y++) for (let x = this.king.tx; x < this.king.tx + kw; x++) this.world.block[y * this.world.W + x] = 0;
  };
  /** an existing Thành trì too close to the palace (worlds saved before the king existed) */
  P.kingNearBase = function () {
    if (!this.king) return false;
    for (const b of this.bases?.values() ?? []) { const th = this.thOf(b); if (th && Math.hypot(th.tx + 1.5 - this.king.x, th.ty + 1.5 - this.king.y) < 26) return true; }
    return false;
  };
  P.nearKing = function (x, y, r) { return !!this.king && Math.hypot(x - this.king.x, y - this.king.y) <= r; };
  P.inKingPeace = function (u) { return !!this.king && Math.hypot(u.x - this.king.x, u.y - this.king.y) <= KING_SAFE_R; };
  P.kingUnlock = function (p) {
    const err = (m) => { this.notice(p.id, m, 'err'); return false; };
    const pr = this.heroProgOf(p); if (!pr || !this.king) return false;
    const h = this.units.get(p.hero);
    if (!h || !this.nearKing(h.x, h.y, KING_USE_R)) return err('Phải đứng trước cung điện Nhà vua phía Bắc');
    const i = HERO_CAPS.indexOf(pr.cap);
    if (i < 0 || i >= HERO_UNLOCK.length) return err('Đã mở hết giới hạn sức mạnh');
    const U = HERO_UNLOCK[i], b = this.baseOf(p), thl = b ? this.thLevel(b) : 0;
    if (thl < U.th) return err(`Cần Thành trì cấp ${U.th}`);
    if (!this.pay(p, U.cost)) return err(`Không đủ tài nguyên: cần ${fmtCost(U.cost)}`);
    pr.cap = HERO_CAPS[i + 1];
    this.notice(p.id, `👑 Nhà vua đã mở giới hạn sức mạnh: tối đa cấp ${pr.cap}!`, 'ok');
    this.events.push({ k: 'levelup', x: h.x, y: h.y, id: h.id });
    this.gainXp(p, 0); // the full XP bar levels up at once
    return true;
  };
}

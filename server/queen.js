// Nữ hoàng Sa mạc (13/11/2026): a palace in the quiet south (like the Northern King in the north) where a player buys
// extra mine slots above MINE_CAP, per kind, per account (kept in heroProg.mx). Also: giving up a mine you hold.
import { MINE_CAP, MINE_EXTRA_MAX, mineSlotCost, QUEEN_SIZE, QUEEN_SAFE_R, QUEEN_USE_R, RES_INFO , PALACE_BLOCK } from '../shared/balance.js';

const fmtCost = (c) => Object.entries(c).map(([r, v]) => `${v.toLocaleString('vi')} ${RES_INFO[r].name}`).join(', ');

export function installQueen(Game) {
  const P = Game.prototype;
  /** palace position (top-left tile) in the quiet south, away from mines, camps, spawns, bosses, bases and the king */
  P.findQueen = function () {
    const W = this.world.W, H = this.world.H ?? W, [kw, kh] = QUEEN_SIZE;
    const avoid = [...this.mines, ...this.camps, ...(this.world.spawns ?? []), ...Object.values(this.bossSpots ?? {})];
    if (this.king) avoid.push(this.king);
    for (const b of this.bases?.values() ?? []) { const th = this.thOf(b); if (th) avoid.push({ x: th.tx + 1.5, y: th.ty + 1.5 }); }
    let best = null, bs = -1;
    for (let ty = H - 22 - kh; ty <= H - 8 - kh; ty++) for (let tx = 20; tx <= W - 20 - kw; tx += 2) {
      let ok = true;
      for (let y = ty - 2; y < ty + kh && ok; y++) for (let x = tx - 1; x < tx + kw + 1 && ok; x++) if (!this.world.walkable(x + 0.5, y + 0.5)) ok = false;
      if (!ok) continue;
      const cx = tx + kw / 2, cy = ty + kh / 2;
      const d = Math.min(...avoid.map((o) => Math.hypot(o.x - cx, o.y - cy))) - Math.abs(cx - W / 2) * 0.12;
      if (d > bs) { bs = d; best = { tx, ty }; }
    }
    return best ?? { tx: Math.floor(W / 2) - 5, ty: H - 14 };
  };
  P.setupQueen = function (pos) {
    if (this.mode !== 'endless') return;
    this.queen = pos ?? this.findQueen();
    const [kw, kh] = QUEEN_SIZE;
    this.queen.x = this.queen.tx + kw / 2; this.queen.y = this.queen.ty + kh / 2;
    for (let y = Math.max(0, this.queen.ty); y < this.queen.ty + Math.round(kh * PALACE_BLOCK); y++) for (let x = this.queen.tx; x < this.queen.tx + kw; x++) this.world.block[y * this.world.W + x] = 1; // the stairs in front stay walkable
  };
  P.unblockQueen = function () {
    if (!this.queen) return;
    const [kw, kh] = QUEEN_SIZE;
    for (let y = Math.max(0, this.queen.ty); y < this.queen.ty + Math.round(kh * PALACE_BLOCK); y++) for (let x = this.queen.tx; x < this.queen.tx + kw; x++) this.world.block[y * this.world.W + x] = 0;
  };
  P.nearQueen = function (x, y, r) { return !!this.queen && Math.hypot(x - this.queen.x, y - this.queen.y) <= r; };
  P.inQueenPeace = function (u) { return !!this.queen && Math.hypot(u.x - this.queen.x, u.y - this.queen.y) <= QUEEN_SAFE_R; };
  /** extra mine slots bought by the account of player pid */
  P.mineExtra = function (pid, type) { const p = this.players.get(pid); return p && !p.bot ? this.heroProg?.get(p.acc)?.mx?.[type] ?? 0 : 0; };
  P.mineCapOf = function (pid, type) { return MINE_CAP[type] == null ? Infinity : MINE_CAP[type] + this.mineExtra(pid, type); };
  /** buy n extra slots of a mine kind at the palace */
  P.queenUnlock = function (p, type, n) {
    const err = (m) => { this.notice(p.id, m, 'err'); return false; };
    const pr = this.heroProgOf(p); if (!pr || !this.queen) return false;
    if (!MINE_EXTRA_MAX[type]) return err('Loại mỏ không hợp lệ');
    const h = this.units.get(p.hero);
    if (!h || !this.nearQueen(h.x, h.y, QUEEN_USE_R)) return err('Phải đứng trước cung điện Nữ hoàng Sa mạc');
    pr.mx ??= {};
    const have = pr.mx[type] ?? 0, room = MINE_EXTRA_MAX[type] - have;
    n = Math.max(1, Math.min(room, n | 0));
    if (room <= 0) return err(`${RES_INFO[type].mine}: đã mở tối đa +${MINE_EXTRA_MAX[type]}`);
    const cost = {};
    for (let k = have + 1; k <= have + n; k++) for (const [r, v] of Object.entries(mineSlotCost(type, k))) cost[r] = (cost[r] ?? 0) + v;
    if (!this.pay(p, cost)) return err(`Không đủ tài nguyên: cần ${fmtCost(cost)}`);
    pr.mx[type] = have + n;
    this.notice(p.id, `🏜 Nữ hoàng Sa mạc ban thêm ${n} chỗ ${RES_INFO[type].mine}: giữ được tối đa ${this.mineCapOf(p.id, type)}`, 'ok');
    const q = this.queen; this.events.push({ k: 'levelup', x: h.x, y: h.y, id: h.id });
    return true;
  };
  /** give up a mine you hold: it goes back to neutral (its wild guards return after the usual wait), its level stays with it */
  P.mineAbandon = function (p, id) {
    const m = this.mines[id];
    if (!m || m.owner !== p.id) return this.notice(p.id, 'Mỏ này không phải của bạn', 'err');
    if (m.upAt) return this.notice(p.id, 'Mỏ đang nâng cấp, đợi xong rồi bỏ', 'err');
    m.owner = 0; m.cap = null; m.holdStart = 0; m.emptySince = this.t; m.changed = true; m.protectUntil = 0;
    this.clearGarrison(m);
    this.notice(p.id, `Đã bỏ ${RES_INFO[m.type].mine} (${Math.floor(m.x)},${Math.floor(m.y)}): còn ${this.mineCount(p.id, m.type)}/${this.mineCapOf(p.id, m.type)}`, 'ok');
  };
}

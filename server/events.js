// Sự kiện thế giới (13/11/2026): every WORLD_EVENT.every seconds (on the clock, Vietnam time) either
// - Thủ lĩnh quái: a huge monster chief with an escort appears at an open spot for 30 min, or
// - Đoàn xe vàng: a gold cart with bandit escorts crosses the map; whoever breaks the cart takes the gold.
// Rewards go to the killer and their party members close by. One event at a time; the slot is saved so a restart does not repeat it.
import { GUARDS, WORLD_EVENT, RES_INFO, BOSS_LV_CAP } from '../shared/balance.js';

export function installEvents(Game) {
  const P = Game.prototype;
  const slotNow = () => Math.floor((Date.now() / 1000 + 7 * 3600) / WORLD_EVENT.every);
  P.eventTick = function () {
    if (this.mode !== 'endless') return;
    const ev = this.ev;
    if (ev) {
      const left = [...ev.units].map((id) => this.units.get(id)).filter((u) => u && !u.dead);
      if (this.t >= ev.until || !left.length || (ev.kind === 'cart' && !this.units.get(ev.main))) return this.endEvent(ev.kind === 'cart' && this.units.get(ev.main) ? 'Đoàn xe vàng đã đi khỏi, không ai cướp được' : null);
      if (ev.kind === 'cart') this.cartMove(ev);
      return;
    }
    const slot = slotNow();
    if (this.evSlot == null) { this.evSlot = slot; return; } // first run (or an old save): wait for the next slot
    if (slot !== this.evSlot) { this.evSlot = slot; this.startEvent(slot % 2 ? 'cart' : 'chief'); }
  };
  /** an open spot in the middle ring of the map, away from bases, palaces and mines */
  P.eventSpot = function (r0 = 0.25, r1 = 0.6) {
    const W = this.world.W, half = W / 2, rnd = Math.random;
    const bad = [...this.mines, ...[...this.bases.values()].map((b) => { const t = this.thOf(b); return t ? { x: t.tx + 1.5, y: t.ty + 1.5, far: 45 } : null; }).filter(Boolean)];
    if (this.king) bad.push({ x: this.king.x, y: this.king.y, far: 30 }); if (this.queen) bad.push({ x: this.queen.x, y: this.queen.y, far: 30 });
    for (let k = 0; k < 4000; k++) {
      const a = rnd() * Math.PI * 2, r = (r0 + rnd() * (r1 - r0)) * half, x = Math.floor(half + Math.cos(a) * r) + 0.5, y = Math.floor(half + Math.sin(a) * r) + 0.5;
      if (!this.world.walkable(x, y)) continue;
      let open = 0; for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) if (this.world.walkable(x + i, y + j)) open++;
      if (open < 40 || bad.some((o) => Math.hypot(o.x - x, o.y - y) < (o.far ?? 8))) continue;
      return { x, y };
    }
    return null;
  };
  P.addEventUnit = function (ev, type, x, y, main = false) {
    const f = this.world.nearestFree(x, y, 4) ?? { x, y };
    const u = this.addUnit({ owner: 0, kind: 'guard', type, x: f.x, y: f.y, st: GUARDS[type], team: 'ev' + ev.n });
    u.ev = ev.n; u.value = Math.round(GUARDS[type].hp / 3); u.homeX = f.x; u.homeY = f.y; u.evOff = { x: f.x - ev.x, y: f.y - ev.y };
    if (main) ev.main = u.id;
    ev.units.add(u.id);
    return u;
  };
  P.startEvent = function (kind) {
    const E = WORLD_EVENT[kind]; if (!E) return false;
    let ev = { kind, n: (this.evN = (this.evN ?? 0) + 1), units: new Set(), until: this.t + E.life, x: 0, y: 0 };
    if (kind === 'chief') {
      const s = this.eventSpot(); if (!s) return false;
      Object.assign(ev, s); this.ev = ev;
      this.addEventUnit(ev, 'thu-linh', s.x, s.y, true);
      let k = 0; for (const [t, n] of E.escort) for (let i = 0; i < n; i++, k++) { const a = k * 2.4, r = 2 + Math.sqrt(k) * 0.9; this.addEventUnit(ev, t, s.x + Math.cos(a) * r, s.y + Math.sin(a) * r); }
    } else {
      // a route through the middle: from one side of the map to the other
      let a = null, b = null, path = null;
      for (let k = 0; k < 30 && !path; k++) { a = this.eventSpot(0.45, 0.7); b = a && this.eventSpot(0.45, 0.7); if (!a || !b || Math.hypot(a.x - b.x, a.y - b.y) < this.world.W * 0.45) continue; path = this.world.path(a.x, a.y, b.x, b.y, 400000); }
      if (!path) return false;
      Object.assign(ev, { x: a.x, y: a.y, path, seg: 0, to: b });
      this.ev = ev;
      this.addEventUnit(ev, 'xe-vang', a.x, a.y, true);
      let k = 0; for (const [t, n] of E.escort) for (let i = 0; i < n; i++, k++) { const ang = k * 2.4, r = 1.6 + Math.sqrt(k) * 0.8; this.addEventUnit(ev, t, a.x + Math.cos(ang) * r, a.y + Math.sin(ang) * r); }
    }
    const where = `(${Math.floor(ev.x)}, ${Math.floor(ev.y)})`;
    this.notice(null, kind === 'chief' ? `🔥 SỰ KIỆN: Thủ lĩnh quái xuất hiện ở ${where}! Hạ nó trong 30 phút để nhận đồ xịn và kim cương` : `💰 SỰ KIỆN: Đoàn xe vàng đang đi từ ${where}! Phá xe chở vàng để cướp ${E.reward.gold.toLocaleString('vi')} vàng và kim cương`, 'sys');
    for (const p of this.players.values()) if (!p.bot) this.notice(p.id, kind === 'chief' ? `🔥 Thủ lĩnh quái xuất hiện ở ${where} (bấm để tới)` : `💰 Đoàn xe vàng xuất hiện ở ${where} (bấm để tới)`, 'warn', { x: ev.x, y: ev.y });
    return true;
  };
  /** the cart walks its route; the escort keeps formation around it (their "home" moves) */
  P.cartMove = function (ev) {
    const cart = this.units.get(ev.main); if (!cart) return;
    if (this.team('ev' + ev.n).combat) return; // stops to fight
    const step = WORLD_EVENT.cart.speed; // tiles per tick of this function (once a second)
    let left = step;
    while (left > 0 && ev.seg < ev.path.length) {
      const wp = ev.path[ev.seg], d = Math.hypot(wp.x - ev.x, wp.y - ev.y);
      if (d <= left) { ev.x = wp.x; ev.y = wp.y; ev.seg++; left -= d; } else { ev.x += ((wp.x - ev.x) / d) * left; ev.y += ((wp.y - ev.y) / d) * left; left = 0; }
    }
    for (const id of ev.units) { const u = this.units.get(id); if (!u || u.dead) continue; u.homeX = ev.x + (u.evOff?.x ?? 0); u.homeY = ev.y + (u.evOff?.y ?? 0); }
    if (ev.seg >= ev.path.length) ev.until = this.t; // reached the far side: gone
  };
  P.endEvent = function (msg) {
    const ev = this.ev; if (!ev) return;
    for (const id of ev.units) { const u = this.units.get(id); if (u && !u.dead) this.units.delete(id); }
    this.ev = null;
    if (msg) this.notice(null, `⌛ ${msg}`, 'sys');
  };
  /** an event unit died; the main one pays out */
  P.eventKill = function (e, killer) {
    const ev = this.ev; if (!ev || e.ev !== ev.n) return;
    ev.units.delete(e.id);
    if (e.id !== ev.main) return;
    const E = WORLD_EVENT[ev.kind], sh = killer ? this.shareWith(killer, e.x, e.y) : [], all = killer ? this.shareAll(killer) : [], f = this.partySplit(all.length);
    // resources (14/11/2026): every member anywhere, split evenly; items: only members close by
    for (const m of all) if (!sh.includes(m)) { for (const [r, v] of Object.entries(E.reward)) this.gain(m, r, Math.round(v * f)); this.notice(m.id, `${ev.kind === 'chief' ? '🔥 Tổ đội hạ Thủ lĩnh quái' : '💰 Tổ đội cướp Đoàn xe vàng'}: +${Object.entries(E.reward).map(([r, v]) => `${Math.round(v * f).toLocaleString('vi')} ${RES_INFO[r].name}`).join(', ')}`, 'ok'); }
    for (const m of sh) {
      for (const [r, v] of Object.entries(E.reward)) this.gain(m, r, Math.round(v * f));
      for (let k = 0; k < E.nItems; k++) { let r = this.rand(), tier = E.items[E.items.length - 1][0]; for (const [t, pr] of E.items) { if (r < pr) { tier = t; break; } r -= pr; } this.lootTo(this.dropItemFor(m, tier, BOSS_LV_CAP(6)), e.x, e.y, 1.5, m); }
      this.notice(m.id, `${ev.kind === 'chief' ? '🔥 Hạ Thủ lĩnh quái' : '💰 Cướp được Đoàn xe vàng'}: +${Object.entries(E.reward).map(([r, v]) => `${Math.round(v * f).toLocaleString('vi')} ${RES_INFO[r].name}`).join(', ')} và ${E.nItems} món đồ`, 'ok');
    }
    this.notice(null, `${ev.kind === 'chief' ? '🔥' : '💰'} ${killer ? killer.name : 'Ai đó'} đã ${ev.kind === 'chief' ? 'hạ Thủ lĩnh quái' : 'cướp Đoàn xe vàng'}!`, 'sys');
    this.endEvent(null);
  };
  /** for the client banner / minimap: [kind, x, y, seconds left, main hp share] */
  P.eventInfo = function () {
    const ev = this.ev; if (!ev) return null;
    const m = this.units.get(ev.main);
    return [ev.kind, Math.round((m?.x ?? ev.x) * 10) / 10, Math.round((m?.y ?? ev.y) * 10) / 10, Math.max(0, Math.round(ev.until - this.t)), m ? Math.round((m.hp / m.maxHp) * 100) : 0];
  };
}

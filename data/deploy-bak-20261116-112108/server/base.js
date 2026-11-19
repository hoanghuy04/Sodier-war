// Base building in the open world (docs/design/can-cu/): Thành trì + towers, walls, storages.
// Installed onto Game.prototype by installBases(Game). Structures are units of kind 'build' (team 'B:<account>'),
// the layout lives in this.bases (keyed by account, so a base stays when its owner leaves or dies).
import {
  bMaxLv, TH_MAX, UNIT_LV_MAX, HOME_HEROES, HOME_HERO_REST, homeHeroStats, HEAL_PCT, HEAL_R, unitLvLabel,
  GARRISON_DEF, pickShare, UNIT_TH, RES, UNITS, BUILDINGS, TOWN_HALL, BASE_ZONE, BASE_GAP, TH_GAP, STORAGE_BASE, STORE_MULT, RAID_SHARE, RAID_TH_PART, RAID_COOLDOWN, RAID_SHIELD, REPAIR_SHARE,
  OPTIONAL_B, SLOTS, TIERS, TIER_INFO, DUST, FORGE, forgeRate, GRIND_DOUBLE, GRIND_MIN, GRIND_MAX, CHEST_GRID, BAG_SIZE, makeItem, CASTLE_CAP, CASTLE_RANGE, CASTLE_LV_BONUS, CASTLE_CALL_CD, CASTLE_CALL_DUR, HOUSING, UNIT_LV_CAP, unitLvCap, unitLvTh, researchCost, RESEARCH_TIME, NO_BUILDER, B_LEVEL_MULT, BUILD_GEAR, CLEAR, OBST_CLEAR, BOT_RES, BOT_SLOW, buildCost, bLimit, buildTime, buildStats, B_NAME, costValue, RES_INFO, ACT,
} from '../shared/balance.js';

const SIZE = (type) => (type === 'thanh-tri' ? TOWN_HALL.size : BUILDINGS[type].size);
const fmtCost = (c) => Object.entries(c).map(([r, v]) => `${v} ${RES_INFO[r].name}`).join(', ');
const DEFEND_EXTRA = 3; // defenders chase this far outside the base zone

export function installBases(Game) {
  const P = Game.prototype;

  P.initBases = function () { this.bases = new Map(); this.basesDirty = true; this.cleared = new Set(); };
  P.baseOf = function (p) { return p?.acc ? this.bases.get(p.acc) ?? null : null; };
  P.thOf = (b) => b.items.find((i) => i.type === 'thanh-tri');
  P.itemCenter = (it) => { const s = SIZE(it.type); return { x: it.tx + s / 2, y: it.ty + s / 2 }; };
  /** tile rectangle of the base zone [x0, y0, x1, y1] inclusive */
  P.baseZone = function (b) { const th = this.thOf(b); return [th.tx - BASE_ZONE, th.ty - BASE_ZONE, th.tx + 2 + BASE_ZONE, th.ty + 2 + BASE_ZONE]; };
  P.inBaseZone = function (b, x, y, extra = 0) { const [x0, y0, x1, y1] = this.baseZone(b); return x >= x0 - extra && y >= y0 - extra && x < x1 + 1 + extra && y < y1 + 1 + extra; };
  P.setDyn = function (it, v) {
    if (BUILDINGS[it.type]?.trap || BUILDINGS[it.type]?.deco) return; // traps and decorations never block the way
    const s = SIZE(it.type), W = this.world.W; for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) this.world.dyn[(it.ty + j) * W + it.tx + i] = v ? 1 : 0; };
  P.thLevel = function (b) { return this.thOf(b)?.lv ?? 0; };

  // ------------------------------------------------------------------ storage caps
  P.capFor = function (key) {
    const b = key ? this.bases.get(key) : null;
    let k = 1;
    if (b) {
      k = TOWN_HALL.levels[this.thLevel(b) - 1].store;
      for (const it of b.items) if (it.type === 'kho' && it.state !== 'ruin' && it.state !== 'build') k += BUILDINGS.kho.store[it.lv - 1];
    }
    return Object.fromEntries(RES.map((r) => [r, Math.round(STORAGE_BASE[r] * k * STORE_MULT)]));
  };
  /** resources kept safe by the Kho buildings (not lost on death, not raided) */
  P.protectedFor = function (key) {
    const b = key ? this.bases.get(key) : null;
    let k = 0;
    if (b) for (const it of b.items) if (it.type === 'kho' && it.state !== 'ruin' && it.state !== 'build') k += BUILDINGS.kho.store[it.lv - 1];
    return Object.fromEntries(RES.map((r) => [r, Math.round(STORAGE_BASE[r] * k * STORE_MULT)]));
  };
  /** open world: Thành trì level needed for a unit type (0 = free) */
  P.unitLocked = function (p, type) {
    if (this.mode !== 'endless') return 0;
    const need = UNIT_TH[type] ?? 0;
    if (!need) return 0;
    const b = this.baseOf(p), lv = b ? this.thLevel(b) : 0;
    return lv >= need ? 0 : need;
  };
  P.capOf = function (p) { return this.mode === 'endless' && !p.bot ? this.capFor(p.acc) : null; };
  /** add resources respecting the storage cap (what is already above the cap is kept, it just does not grow) */
  P.gain = function (p, r, v, cap = this.capOf(p)) {
    if (!(v > 0)) return 0;
    if (p.bot && this.mode === 'endless') v *= BOT_RES;
    const cur = p.res[r] ?? 0;
    if (!cap) { p.res[r] = cur + v; return v; }
    if (cur >= cap[r]) return 0;
    const add = Math.min(v, cap[r] - cur);
    p.res[r] = cur + add;
    return add;
  };

  // ------------------------------------------------------------------ units for structures
  /** structure stats with the owner's gear share (BUILD_GEAR × what the soldiers get) */
  P.buildStatsOf = function (b, it) {
    const st = buildStats(it.type, it.lv), ag = b?.armyGear;
    if (ag && it.type !== 'nha-tho-xay') { st.hp = Math.round(st.hp * (1 + BUILD_GEAR * (ag.hp ?? 0))); if (st.atk) st.atk = st.atk * (1 + BUILD_GEAR * (ag.atk ?? 0)); }
    return st;
  };
  /** owner's gear changed: re-stat the standing structures */
  P.restatBuildings = function (b) {
    for (const it of b?.items ?? []) { const u = this.units.get(it.uid); if (!u || u.dead || u.kind !== 'build') continue; const st = this.buildStatsOf(b, it), f = u.hp / u.maxHp; u.maxHp = st.hp; u.hp = Math.max(1, st.hp * f); u.atk = st.atk; }
  };
  P.spawnBuildUnit = function (b, it) {
    if (BUILDINGS[it.type]?.trap || BUILDINGS[it.type]?.deco) { it.uid = 0; return null; } // traps / decorations are not units: nobody can hit them
    const st = this.buildStatsOf(b, it), c = this.itemCenter(it);
    const u = this.addUnit({ owner: 0, kind: 'build', type: it.type, x: c.x, y: c.y, st, team: 'B:' + b.key });
    Object.assign(u, { baseKey: b.key, bItem: it.id, body: st.size / 2, atkCls: st.atkCls ?? null, noFly: st.noFly, airOnly: st.airOnly, chain: st.chain, hideR: st.hideR, cone: st.cone, beam: st.beam, beamT: st.beamT, hidden: !!st.hideR, value: Math.round(this.itemValue(it) / 3) });
    if (st.hideR) it.hid = true;
    if (it.state === 'build') u.hp = Math.max(1, u.maxHp * (0.1 + 0.9 * this.itemProg(it)));
    else if (it.hp != null) u.hp = Math.max(1, Math.min(u.maxHp, it.hp));
    it.uid = u.id;
    this.setDyn(it, true);
    // nobody may stand inside a structure
    for (const q of this.near(c.x, c.y, st.size)) if (!q.fly && q.kind !== 'build' && this.world.dynAt(q.x, q.y)) { const f = this.world.nearestFree(q.x, q.y, 6); if (f) { q.x = f.x; q.y = f.y; } }
    return u;
  };
  P.itemValue = function (it) { let v = 0; for (let l = 1; l <= it.lv; l++) v += costValue(buildCost(it.type, l)); return v; };
  P.itemProg = function (it) { return it.total ? Math.max(0, Math.min(1, 1 - (it.doneAt - this.t) / it.total)) : 1; };
  P.busyBuilders = function (b) { return b.items.filter((i) => (i.state === 'build' || i.state === 'up') && i.type !== 'tuong').length + (b.clears?.length ?? 0) + this.mines.filter((m) => m.upAt && m.upBy === b.key).length; };
  /** builders = standing Nhà thợ xây (at least 1; huts no longer depend on the Thành trì level) */
  P.builders = function (b) {
    const huts = b.items.filter((i) => i.type === 'nha-tho-xay' && (i.state === 'ok' || i.state === 'up')).length;
    return Math.max(1, huts);
  };
  /** free Nhà thợ xây the Thành trì level gives (placed by itself near the Thành trì when there is room) */
  P.autoHuts = function (b) {
    const th = this.thOf(b); if (!th || th.state === 'ruin') return 0;
    const want = 1 - b.items.filter((i) => i.type === 'nha-tho-xay').length; // only the first hut is a gift
    if (want <= 0) return 0;
    const [x0, y0, x1, y1] = this.baseZone(b), cx = th.tx + 1, cy = th.ty + 1, spots = [];
    for (let ty = y0; ty <= y1 - 1; ty++) for (let tx = x0; tx <= x1 - 1; tx++) spots.push([tx, ty, Math.hypot(tx + 1 - cx, ty + 1 - cy)]);
    spots.sort((a, c) => a[2] - c[2]);
    let n = 0;
    for (const [tx, ty, d] of spots) {
      if (n >= want) break;
      if (d < 3.5) continue; // leave the ring right around the Thành trì free
      let ok = true;
      for (let j = -1; j <= 2 && ok; j++) for (let i = -1; i <= 2 && ok; i++) if (!this.world.walkable(tx + i + 0.5, ty + j + 0.5)) ok = false; // 1 free tile around it
      if (!ok || this.mines.some((m) => Math.abs(m.x - (tx + 1)) < 3.5 && Math.abs(m.y - (ty + 1)) < 3.5)) continue;
      const it = { id: b.nextItem++, type: 'nha-tho-xay', tx, ty, lv: 1, state: 'ok', doneAt: this.t, total: 0 };
      this.setDyn(it, true);
      if (!this.thReachable(b)) { this.setDyn(it, false); b.nextItem--; continue; }
      this.setDyn(it, false);
      b.items.push(it); this.spawnBuildUnit(b, it); n++;
    }
    if (n) { this.basesDirty = true; this.baseNotice(b, `Có thêm ${n} thợ xây dọn tới ở (Nhà thợ xây miễn phí)`, 'ok'); }
    return n;
  };

  // ------------------------------------------------------------------ placing
  P.canPlace = function (p, type, tx, ty) {
    if (this.mode !== 'endless') return 'Chỉ xây được ở Thế giới mở';
    const h = this.units.get(p.hero);
    if (!p.alive || !h) return 'Cần có tướng trên bản đồ';
    if (!p.acc) return 'Không xây được';
    const s = SIZE(type), b = this.baseOf(p), W = this.world.W;
    if (tx < 1 || ty < 1 || tx + s >= W - 1 || ty + s >= W - 1) return 'Ra ngoài bản đồ';
    for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) if (!this.world.walkable(tx + i + 0.5, ty + j + 0.5)) return 'Chỗ này bị chặn';
    const cx = tx + s / 2, cy = ty + s / 2;
    if (this.mines.some((m) => { const ms = m.type === 'diamond' ? 2 : 1.5; return Math.abs(m.x - cx) < ms + s / 2 && Math.abs(m.y - cy) < ms + s / 2; })) return 'Đè lên mỏ'; // 12/11/2026: only no overlap, no gap
    if (type === 'thanh-tri') {
      if (b) return 'Bạn đã có Thành trì';
      if (Math.hypot(h.x - cx, h.y - cy) > 15) return 'Tướng phải đứng trong 15 ô';
      if (this.king && Math.hypot(cx - this.king.x, cy - this.king.y) < 28) return 'Quá gần cung điện Nhà vua phía Bắc';
      if (this.queen && Math.hypot(cx - this.queen.x, cy - this.queen.y) < 28) return 'Quá gần cung điện Nữ hoàng Sa mạc';
      const half = W / 2;
      if (Math.hypot(cx - half, cy - half) < 0.16 * half + 4) return 'Không xây trong Cao nguyên cổ';
      for (const o of this.bases.values()) { const t = this.thOf(o); if (t && Math.hypot(t.tx + 1.5 - cx, t.ty + 1.5 - cy) < BASE_GAP) return `Quá gần căn cứ của ${o.name} (cần ${BASE_GAP} ô)`; }
      if (this.world.spawns.some((q) => Math.hypot(q.x - cx, q.y - cy) < TH_GAP.spawn)) return `Quá gần trại xuất phát (cần cách ${TH_GAP.spawn} ô)`;
      if (this.camps.some((c) => Math.hypot(c.x - cx, c.y - cy) < TH_GAP.camp)) return `Quá gần bãi quái (cần cách ${TH_GAP.camp} ô)`;
      if (Object.values(this.bossSpots).some((q) => Math.hypot(q.x - cx, q.y - cy) < TH_GAP.boss)) return `Quá gần boss (cần cách ${TH_GAP.boss} ô)`;
      return null;
    }
    if (!b) return 'Cần xây Thành trì trước';
    const th = this.thOf(b);
    if (th.state === 'ruin') return 'Thành trì đang đổ nát, sửa trước đã';
    const lim = bLimit(type, th.lv);
    if (b.items.filter((i) => i.type === type).length >= lim) return lim ? `Đã đủ ${lim} ${B_NAME(type)} (nâng Thành trì để xây thêm)` : `Cần Thành trì cấp cao hơn`;
    if (!NO_BUILDER(type) && this.busyBuilders(b) >= this.builders(b)) return 'Hết thợ xây';
    const [x0, y0, x1, y1] = this.baseZone(b);
    if (tx < x0 || ty < y0 || tx + s - 1 > x1 || ty + s - 1 > y1) return `Phải xây trong vùng căn cứ (${BASE_ZONE} ô quanh Thành trì)`;
    const free = (t) => BUILDINGS[t]?.trap || BUILDINGS[t]?.deco; // these do not block the way, so overlaps are checked by hand
    if (b.items.some((i) => (free(i.type) || free(type)) && tx < i.tx + SIZE(i.type) && i.tx < tx + s && ty < i.ty + SIZE(i.type) && i.ty < ty + s)) return 'Trùng công trình / bẫy khác';
    if (Math.hypot(h.x - (th.tx + 1.5), h.y - (th.ty + 1.5)) > BASE_ZONE + 14) return 'Tướng phải ở gần căn cứ';
    const tmp = { type, tx, ty };
    this.setDyn(tmp, true);
    const ok = this.thReachable(b);
    this.setDyn(tmp, false);
    if (!ok) return 'Không được bịt kín lối vào Thành trì';
    return null;
  };
  /** can a walker get from the edge of the base zone to the Thành trì? (structures already on the dyn layer) */
  P.thReachable = function (b) {
    const [x0, y0, x1, y1] = this.baseZone(b), th = this.thOf(b), W = this.world.W;
    const free = (x, y) => this.world.walkable(x + 0.5, y + 0.5) || (x >= th.tx && x <= th.tx + 2 && y >= th.ty && y <= th.ty + 2);
    const seen = new Set(), q = [];
    for (let y = th.ty - 1; y <= th.ty + 3; y++) for (let x = th.tx - 1; x <= th.tx + 3; x++) {
      if (x >= th.tx && x <= th.tx + 2 && y >= th.ty && y <= th.ty + 2) continue;
      if (this.world.walkable(x + 0.5, y + 0.5)) { seen.add(y * W + x); q.push([x, y]); }
    }
    while (q.length) {
      const [x, y] = q.shift();
      if (x <= x0 || y <= y0 || x >= x1 || y >= y1) return true; // reached the edge of the zone
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = ny * W + nx;
        if (seen.has(k) || !free(nx, ny)) continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return false;
  };
  P.pay = function (p, cost) {
    for (const [r, v] of Object.entries(cost)) if ((p.res[r] ?? 0) < v) return false;
    for (const [r, v] of Object.entries(cost)) p.res[r] -= v;
    return true;
  };
  P.placeBuilding = function (p, type, tx, ty) {
    if (type !== 'thanh-tri' && !BUILDINGS[type]) return;
    tx |= 0; ty |= 0;
    const err = this.canPlace(p, type, tx, ty);
    if (err) return this.notice(p.id, err, 'err');
    const cost = buildCost(type, 1, this.typeCount(this.baseOf(p), type) + 1);
    if (!this.pay(p, cost)) return this.notice(p.id, `Không đủ tài nguyên: cần ${fmtCost(cost)}`, 'err');
    let b = this.baseOf(p);
    if (!b) { b = { key: p.acc, name: p.name, color: p.color, items: [], nextItem: 1, shieldUntil: 0, lastRaid: -1e9, garrison: [], heroType: p.heroType, log: [], hutsV: 1 }; this.bases.set(b.key, b); }
    const total = buildTime(type, 1) * (p.bot ? BOT_SLOW : 1);
    const it = { id: b.nextItem++, type, tx, ty, lv: 1, state: total ? 'build' : 'ok', doneAt: this.t + total, total };
    b.items.push(it);
    this.spawnBuildUnit(b, it);
    this.basesDirty = true;
    this.events.push({ k: 'txt', x: tx + SIZE(type) / 2, y: ty, s: `Đang xây ${B_NAME(type)}` });
    if (total) this.notice(p.id, `Đang xây ${B_NAME(type)} (${total >= 60 ? Math.round(total / 60) + ' phút' : total + ' giây'})`, 'ok');
  };
  P.typeCount = function (b, type) { return b ? b.items.filter((i) => i.type === type).length : 0; };
  P.findItem = function (p, id) { const b = this.baseOf(p); const it = b?.items.find((i) => i.id === (id | 0)); return it ? [b, it] : [null, null]; };
  P.upgradeBuilding = function (p, id, row = false, ids = null) {
    const [b, it] = this.findItem(p, id); if (!it) return;
    // ids: a selection of wall pieces (whole row / column / cluster picked on the client), each goes up one level
    const list = ids && it.type === 'tuong' ? [...new Set(ids.slice(0, 400).map((x) => b.items.find((i) => i.id === (x | 0) && i.type === 'tuong')).filter(Boolean))].sort((a, c) => a.lv - c.lv)
      : row && it.type === 'tuong' ? this.wallRow(b, it) : [it];
    let done = 0, lastErr = null;
    for (const w of list) {
      const err = this.canUpgrade(b, w);
      if (err) { lastErr = err; continue; }
      const cost = buildCost(w.type, w.lv + 1, this.typeCount(b, w.type));
      if (!this.pay(p, cost)) { lastErr = `Không đủ tài nguyên: cần ${fmtCost(cost)}`; break; }
      const total = buildTime(w.type, w.lv + 1) * (p.bot ? BOT_SLOW : 1);
      if (total) Object.assign(w, { state: 'up', doneAt: this.t + total, total });
      else this.finishUpgrade(w);
      done++;
    }
    if (done) { this.quest?.(p, 'upgrade', it.type === 'tuong' ? 1 : done); this.basesDirty = true; this.notice(p.id, it.type === 'tuong' ? `Đã nâng ${done} ${B_NAME(it.type)}` : `Đang nâng ${B_NAME(it.type)} lên cấp ${it.lv + 1}`, 'ok'); }
    else if (lastErr) this.notice(p.id, lastErr, 'err');
  };
  P.finishUpgrade = function (it) {
    it.lv++; it.state = 'ok'; this.basesDirty = true;
    const u = this.units.get(it.uid);
    if (u) { const b = [...this.bases.values()].find((x) => x.items.includes(it)), st = this.buildStatsOf(b, it), f = u.hp / u.maxHp; Object.assign(u, { maxHp: st.hp, hp: st.hp * f, atk: st.atk, range: st.range, cap: st.cap, value: Math.round(this.itemValue(it) / 3) }); }
  };
  P.canUpgrade = function (b, it) {
    if (it.state !== 'ok') return it.state === 'ruin' ? 'Đang đổ nát, sửa trước đã' : it.state === 'used' ? 'Bẫy đang nạp lại' : 'Đang xây hoặc nâng cấp';
    if (BUILDINGS[it.type]?.noLevels) return `${B_NAME(it.type)} không có cấp`;
    if (it.type === 'hoc-vien' && b.research) return 'Học viện đang nghiên cứu, đợi xong rồi nâng';
    if (it.lv >= bMaxLv(it.type, TH_MAX)) return 'Đã đạt cấp tối đa';
    if (it.type !== 'thanh-tri' && it.lv >= bMaxLv(it.type, this.thLevel(b))) { let need = this.thLevel(b) + 1; while (need < TH_MAX && bMaxLv(it.type, need) <= it.lv) need++; return `Cần Thành trì cấp ${need}`; }
    if (!NO_BUILDER(it.type) && this.busyBuilders(b) >= this.builders(b)) return 'Hết thợ xây';
    if (it.type === 'thanh-tri') { const miss = this.thMissing(b); if (miss.length) return `Xây đủ trước: ${miss.join(', ')}`; }
    return null;
  };
  /** buildings the current Thành trì level allows but that are not built yet (walls do not count) */
  P.thMissing = function (b) {
    const max = TOWN_HALL.levels[this.thLevel(b) - 1].max, out = [];
    for (const [type, n] of Object.entries(max)) {
      if (type === 'tuong' || type === 'nha-tho-xay' || OPTIONAL_B.has(type) || BUILDINGS[type]?.homeHero || !n) continue; // traps count too; the Học viện, chest and furnaces are optional
      if (type === 'doanh-trai' && b.key.startsWith('npc:')) continue; // NPC lords have no army limit
      const have = b.items.filter((i) => i.type === type && i.state !== 'build' && i.state !== 'ruin').length;
      if (have < n) out.push(`${B_NAME(type)} ${have}/${n}`);
    }
    // every structure (walls and builder's huts aside) must reach the Thành trì level first (11/11/2026)
    const lv = this.thLevel(b), low = {};
    // 16/11/2026: a structure needs the level it can reach at this Thành trì (traps stop at 5, new defences at 2-3, altars free)
    const need = (t) => Math.min(lv, bMaxLv(t, lv));
    for (const i of b.items) if (i.type !== 'thanh-tri' && i.type !== 'tuong' && !OPTIONAL_B.has(i.type) && !BUILDINGS[i.type]?.noLevels && !BUILDINGS[i.type]?.homeHero && !BUILDINGS[i.type]?.deco && i.state !== 'ruin' && (i.lv < need(i.type) || i.state === 'up' || i.state === 'build')) low[i.type] = (low[i.type] ?? 0) + 1;
    for (const [t, n] of Object.entries(low)) out.push(`${B_NAME(t)} lên cấp ${need(t)} (còn ${n})`);
    return out;
  };
  /** walls of the same level touching this one (4-neighbour) */
  P.wallRow = function (b, w0) {
    const walls = b.items.filter((i) => i.type === 'tuong' && i.lv === w0.lv && i.state === 'ok'), at = new Map(walls.map((w) => [w.tx + ',' + w.ty, w]));
    const out = [w0], seen = new Set([w0]);
    for (let k = 0; k < out.length; k++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = at.get(out[k].tx + dx + ',' + (out[k].ty + dy)); if (n && !seen.has(n)) { seen.add(n); out.push(n); } }
    return out;
  };
  // repairs (11/11/2026): instant and without a builder, like Clash of Clans after a raid; never while the base is being attacked
  P.repairBuilding = function (p, id) { const [b, it] = this.findItem(p, id); if (it) this.repairItems(p, b, [it]); };
  P.repairAll = function (p) { const b = this.baseOf(p); if (b) this.repairItems(p, b, b.items.filter((i) => i.state === 'ruin')); };
  P.repairItems = function (p, b, list) {
    list = list.filter((it) => it.state === 'ruin');
    if (!list.length) return this.notice(p.id, 'Không có công trình nào hỏng', 'err');
    if (this.team('B:' + b.key).combat) return this.notice(p.id, 'Căn cứ đang bị tấn công, đợi hết trận rồi sửa', 'err');
    const free = (it) => { const s = SIZE(it.type); for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) if (!this.world.walkable(it.tx + i + 0.5, it.ty + j + 0.5)) return false; return true; };
    const ok = list.filter(free);
    if (!ok.length) return this.notice(p.id, 'Có gì đó đang chắn chỗ cần sửa', 'err');
    const cost = {};
    for (const it of ok) for (const [r, v] of Object.entries(this.repairCost(it))) cost[r] = (cost[r] ?? 0) + v;
    if (!this.pay(p, cost)) return this.notice(p.id, `Không đủ tài nguyên: cần ${fmtCost(cost)}`, 'err');
    for (const it of ok) { Object.assign(it, { state: 'ok', doneAt: this.t, total: 0, hp: null }); this.spawnBuildUnit(b, it); }
    this.basesDirty = true;
    this.notice(p.id, ok.length > 1 ? `Đã sửa ${ok.length} công trình (${fmtCost(cost)})` : `Đã sửa ${B_NAME(ok[0].type)}`, 'ok');
  };
  P.repairCost = function (it) {
    const c = {};
    for (let l = 1; l <= it.lv; l++) for (const [r, v] of Object.entries(buildCost(it.type, l))) c[r] = (c[r] ?? 0) + v;
    for (const r of Object.keys(c)) c[r] = Math.max(1, Math.round(c[r] * REPAIR_SHARE));
    return c;
  };
  /** walls joined to this one (4-neighbour), any level */
  P.wallGroup = function (b, w0) {
    const at = new Map(b.items.filter((i) => i.type === 'tuong').map((w) => [w.tx + ',' + w.ty, w]));
    const out = [w0], seen = new Set([w0]);
    for (let k = 0; k < out.length; k++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = at.get(out[k].tx + dx + ',' + (out[k].ty + dy)); if (n && !seen.has(n)) { seen.add(n); out.push(n); } }
    return out;
  };
  /**
   * Move structures by (dx, dy) tiles keeping their shape: one building, a hand-picked set, or a whole joined group of walls.
   * Free; the moved towers stop shooting for 3 s. Not while the base is fighting.
   */
const MOVE_RES = ['iron', 'coal', 'gold', 'oil', 'tar'], MOVE_SHARE = 0.2;
  P.moveBuildings = function (p, ids, dx, dy, group = false) {
    const b = this.baseOf(p); if (!b) return;
    dx |= 0; dy |= 0;
    if (!dx && !dy) return;
    let list = [...new Set((Array.isArray(ids) ? ids : [ids]).map((id) => b.items.find((i) => i.id === (id | 0))).filter(Boolean))];
    if (!list.length) return;
    if (group) for (const w of [...list]) if (w.type === 'tuong') for (const g of this.wallGroup(b, w)) if (!list.includes(g)) list.push(g);
    if (list.length > 120) return this.notice(p.id, 'Chọn quá nhiều công trình một lúc', 'err');
    if (this.team('B:' + b.key).combat || this.team(p.id).combat) return this.notice(p.id, 'Đang giao chiến, chưa dời được', 'err');
    const th = this.thOf(b), moveTh = list.includes(th), W = this.world.W;
    if (moveTh && list.length < b.items.length) list = [...b.items]; // the Thành trì takes the whole base with it
    // moving house (12/11/2026): once a day (Vietnam time) and 20 % of the stock from Dầu đen down (sắt, than, vàng, dầu, dầu đen)
    const today = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
    if (moveTh && !p.bot && b.movedDay === today) return this.notice(p.id, 'Hôm nay đã chuyển nhà rồi: mỗi ngày 1 lần, mai (sau 0h) chuyển tiếp được', 'err');
    const live = list.filter((i) => i.state !== 'ruin');
    for (const it of live) this.setDyn(it, false);
    const undo = () => { for (const it of live) this.setDyn(it, true); };
    // check every new footprint
    const nth = moveTh ? { tx: th.tx + dx, ty: th.ty + dy } : th;
    const [x0, y0, x1, y1] = [nth.tx - BASE_ZONE, nth.ty - BASE_ZONE, nth.tx + 2 + BASE_ZONE, nth.ty + 2 + BASE_ZONE];
    for (const it of list) {
      const s = SIZE(it.type), tx = it.tx + dx, ty = it.ty + dy;
      if (tx < 1 || ty < 1 || tx + s >= W - 1 || ty + s >= W - 1) { undo(); return this.notice(p.id, 'Ra ngoài bản đồ', 'err'); }
      if (tx < x0 || ty < y0 || tx + s - 1 > x1 || ty + s - 1 > y1) { undo(); return this.notice(p.id, 'Phải nằm trong vùng căn cứ', 'err'); }
      for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) if (!this.world.walkable(tx + i + 0.5, ty + j + 0.5)) { undo(); return this.notice(p.id, `${B_NAME(it.type)} vướng chỗ bị chặn`, 'err'); }
      const cx = tx + s / 2, cy = ty + s / 2;
      if (this.mines.some((m) => { const ms = m.type === 'diamond' ? 2 : 1.5; return Math.abs(m.x - cx) < ms + s / 2 && Math.abs(m.y - cy) < ms + s / 2; })) { undo(); return this.notice(p.id, 'Đè lên mỏ', 'err'); }
      if (b.items.some((i) => !list.includes(i) && (BUILDINGS[i.type]?.trap || BUILDINGS[it.type]?.trap || BUILDINGS[i.type]?.deco || BUILDINGS[it.type]?.deco) && tx < i.tx + SIZE(i.type) && i.tx < tx + s && ty < i.ty + SIZE(i.type) && i.ty < ty + s)) { undo(); return this.notice(p.id, 'Trùng công trình / bẫy khác', 'err'); }
    }
    // moving the whole base (12/11/2026): anywhere with room for every building; no distance rules to other bases / camps
    if (moveTh) for (const o of this.bases.values()) {
      if (o === b) continue;
      for (const it of list) { const s = SIZE(it.type), tx = it.tx + dx, ty = it.ty + dy; if (o.items.some((i) => i.state !== 'ruin' && tx < i.tx + SIZE(i.type) && i.tx < tx + s && ty < i.ty + SIZE(i.type) && i.ty < ty + s)) { undo(); return this.notice(p.id, `Đè lên căn cứ của ${o.name}`, 'err'); } }
    }
    // place them, then make sure the Thành trì can still be reached
    for (const it of list) { it.tx += dx; it.ty += dy; }
    for (const it of live) this.setDyn(it, true);
    if (!this.thReachable(b)) {
      for (const it of live) this.setDyn(it, false);
      for (const it of list) { it.tx -= dx; it.ty -= dy; }
      undo();
      return this.notice(p.id, 'Không được bịt kín lối vào Thành trì', 'err');
    }
    if (moveTh && !p.bot) {
      const cost = {}; for (const r of MOVE_RES) { const v = Math.floor((p.res[r] ?? 0) * MOVE_SHARE); if (v > 0) { cost[r] = v; p.res[r] -= v; } }
      b.movedDay = today;
      this.notice(p.id, `🏠 Đã chuyển nhà · phí ${Object.keys(cost).length ? fmtCost(cost) : '0'} · lần tiếp theo: ngày mai`, 'ok');
    }
    for (const it of live) {
      const u = this.units.get(it.uid); if (!u) continue;
      const c = this.itemCenter(it); u.x = c.x; u.y = c.y; u.nextAtk = this.t + 3; this.unpair(u);
      for (const q of this.near(c.x, c.y, SIZE(it.type))) if (!q.fly && q.kind !== 'build' && this.world.dynAt(q.x, q.y)) { const f = this.world.nearestFree(q.x, q.y, 6); if (f) { q.x = f.x; q.y = f.y; } }
    }
    this.basesDirty = true;
    this.notice(p.id, list.length > 1 ? `Đã dời ${list.length} công trình` : `Đã dời ${B_NAME(list[0].type)}`, 'ok');
  };
  P.removeBuilding = function (p, id) {
    const [b, it] = this.findItem(p, id); if (!it) return;
    if (it.type === 'thanh-tri') return this.notice(p.id, 'Không phá được Thành trì', 'err');
    const u = this.units.get(it.uid); if (u) { u.dead = true; u.deathT = this.t; this.unpair(u); this.units.delete(u.id); }
    if (it.state !== 'ruin') this.setDyn(it, false);
    b.items = b.items.filter((i) => i !== it);
    this.basesDirty = true;
    if (BUILDINGS[it.type]?.deco) { const c = BUILDINGS[it.type].cost; for (const [r, v] of Object.entries(c)) p.res[r] = (p.res[r] ?? 0) + v; return this.notice(p.id, `Đã cất ${B_NAME(it.type)}, hoàn ${fmtCost(c)}`, 'ok'); }
    this.notice(p.id, `Đã phá bỏ ${B_NAME(it.type)}`, 'ok');
  };

  // ------------------------------------------------------------------ every second
  // ---------------- traps (every 4 ticks) ----------------
  P.trapTick = function () {
    for (const b of this.bases.values()) {
      let src = null;
      for (const it of b.items) {
        const D = BUILDINGS[it.type]; if (!D?.trap || it.state !== 'ok') continue;
        // something of the base that "owns" the blast (kill credit, hostility rules: shield, bots never hit bases…)
        src ??= b.items.map((i) => this.units.get(i.uid)).find((u) => u && !u.dead) ?? null;
        if (!src) break;
        const x = it.tx + 0.5, y = it.ty + 0.5, air = D.trap === 'air';
        const foes = this.near(x, y, D.trigger).filter((u) => u.kind !== 'build' && !!u.fly === air && this.hostile(src, u));
        if (!foes.length) continue;
        if (D.trap === 'spring' && !foes.some((u) => u.kind === 'unit')) continue; // springs ignore heroes
        this.fireTrap(b, it, D, src, x, y, foes);
      }
    }
  };
  P.fireTrap = function (b, it, D, src, x, y, foes) {
    this.battleTrap(b);
    it.state = 'used'; it.rearmAt = this.t + D.rearm; this.basesDirty = true;
    const m = B_LEVEL_MULT[it.lv - 1];
    if (D.trap === 'spring') {
      const th = this.thOf(b), cx = th.tx + 1.5, cy = th.ty + 1.5;
      let room = D.lift[it.lv - 1];
      for (const u of foes.filter((q) => q.kind === 'unit').sort((a, c) => (UNITS[a.type]?.slots ?? 1) - (UNITS[c.type]?.slots ?? 1))) {
        const sl = UNITS[u.type]?.slots ?? 1; if (sl > room) continue;
        room -= sl;
        // thrown out of the base zone, away from the Thành trì
        const a = Math.atan2(u.y - cy, u.x - cx), R = BASE_ZONE + 4;
        const to = this.world.nearestFree(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 6);
        if (!to) continue;
        this.unpair(u); u.x = to.x; u.y = to.y; u.stunUntil = this.t + 1.5;
        const op = this.players.get(u.owner); if (op) op.path = null;
        this.events.push({ k: 'boom', x: u.x, y: u.y, r: 0.8, kind: 'spring' });
      }
      this.events.push({ k: 'boom', x, y, r: 0.9, kind: 'spring' });
      this.events.push({ k: 'txt', x, y: y - 0.5, s: 'Lò xo!' });
      return;
    }
    const dmg = Math.round(D.atk * m), cx = foes[0].x, cy = foes[0].y, ax = D.trap === 'air' ? cx : x, ay = D.trap === 'air' ? cy : y;
    for (const e of this.near(ax, ay, D.aoe)) if (!e.dead && e.kind !== 'build' && !!e.fly === (D.trap === 'air') && this.hostile(src, e)) this.damage(src, e, dmg, { fixed: true });
    this.events.push({ k: 'boom', x: ax, y: ay, r: D.aoe, kind: D.trap === 'air' ? 'airbomb' : 'bomb' });
  };

  // ---------------- Học viện: unit levels (docs/design/can-cu/09-hoc-vien.md) ----------------
  P.academyOf = function (b) { return b?.items.find((i) => i.type === 'hoc-vien') ?? null; };
  /** why this unit cannot be researched now (null = it can) */
  P.researchBlock = function (b, type) {
    if (!Object.hasOwn(UNIT_LV_CAP, type)) return 'Không nâng cấp được loại này';
    const ac = this.academyOf(b);
    if (!ac) return 'Cần xây Học viện';
    if (ac.state === 'ruin') return 'Học viện đang đổ nát, sửa trước đã';
    if (ac.state === 'build') return 'Học viện đang xây';
    if (ac.state === 'up') return 'Học viện đang nâng cấp';
    if (b.research) return 'Học viện đang nghiên cứu loại khác';
    const cur = b.unitLv?.[type] ?? 1, th = this.thLevel(b);
    if (cur >= UNIT_LV_MAX) return 'Đã cấp tối đa';
    if ((UNIT_LV_CAP[type][th - 1] ?? 0) <= cur) { const need = unitLvTh(type, cur + 1); return need ? `Mở khóa ở Thành trì cấp ${need}` : 'Đã cấp tối đa'; }
    if (unitLvCap(type, th, ac.lv) <= cur) return `Cần Học viện cấp ${cur}`;
    return null;
  };
  P.startResearch = function (p, type) {
    const b = this.baseOf(p); if (!b) return this.notice(p.id, 'Cần xây Thành trì và Học viện trước', 'err');
    const err = this.researchBlock(b, type); if (err) return this.notice(p.id, err, 'err');
    const lv = (b.unitLv?.[type] ?? 1) + 1, cost = researchCost(type, lv);
    if (!this.pay(p, cost)) return this.notice(p.id, `Không đủ tài nguyên: cần ${fmtCost(cost)}`, 'err');
    const total = RESEARCH_TIME[lv - 1] * (p.bot ? BOT_SLOW : 1);
    b.research = { unit: type, lv, doneAt: this.t + total, total, cost };
    this.basesDirty = true;
    this.notice(p.id, `Học viện bắt đầu nghiên cứu ${UNITS[type].name} cấp ${unitLvLabel(type, lv)}`, 'ok');
  };
  /** stop the current research: everything paid comes back (storage cap does not apply) */
  P.cancelResearch = function (p) {
    const b = this.baseOf(p), r = b?.research; if (!r) return;
    const cost = r.cost ?? researchCost(r.unit, r.lv);
    for (const [k, v] of Object.entries(cost)) p.res[k] = (p.res[k] ?? 0) + v;
    b.research = null; this.basesDirty = true;
    this.notice(p.id, `Đã hủy nâng ${UNITS[r.unit].name} cấp ${r.lv}, hoàn lại ${fmtCost(cost)}`, 'ok');
  };
  P.researchTick = function (b) {
    const r = b.research, ac = this.academyOf(b);
    if (!ac || ac.state === 'ruin') { r.doneAt += 1; return; } // paused while the Học viện is down
    if (this.t < r.doneAt) return;
    b.research = null; (b.unitLv ??= {})[r.unit] = r.lv; this.basesDirty = true;
    // every soldier of that type gets the new stats at once: army, mine garrisons, base defenders
    const p = [...this.players.values()].find((q) => q.acc === b.key);
    for (const u of this.units.values()) {
      if (u.type !== r.unit || u.dead || !(u.baseKey === b.key || (p && u.owner === p.id))) continue;
      const st = this.unitStats(u.type, p?.heroType ?? b.heroType, r.lv, (p && u.owner === p.id ? p.armyGear : b.armyGear) ?? null), f = u.hp / u.maxHp;
      Object.assign(u, { maxHp: st.hp, hp: Math.max(1, st.hp * f), atk: st.atk, cd: st.cd, armor: st.armor, lv: r.lv });
    }
    this.baseNotice(b, `🎓 ${UNITS[r.unit].name} đã lên cấp ${r.lv}!`, 'ok');
  };

  // ---------------- clearing trees / rocks inside the base zone ----------------
  /** CLEAR kind of the obstacle on a tile, or null (not clearable / already cleared) */
  P.obstAt = function (tx, ty) {
    const W = this.world.W; if (tx < 0 || ty < 0 || tx >= W || ty >= this.world.H) return null;
    const i = ty * W + tx; if (this.cleared.has(i)) return null;
    return OBST_CLEAR[this.world.map.obst[i]] ?? null;
  };
  P.clearObstacle = function (p, tx, ty) {
    tx |= 0; ty |= 0;
    const b = this.baseOf(p), err = (m) => this.notice(p.id, m, 'err');
    if (!b) return err('Cần xây Thành trì trước');
    const kind = this.obstAt(tx, ty); if (!kind) return err('Không có cây / đá để dọn ở đây');
    const [x0, y0, x1, y1] = this.baseZone(b);
    if (tx < x0 || ty < y0 || tx > x1 || ty > y1) return err('Chỉ dọn được trong vùng căn cứ của bạn');
    if ((b.clears ??= []).some((c) => c.tx === tx && c.ty === ty)) return err('Đang dọn chỗ này rồi');
    if (this.busyBuilders(b) >= this.builders(b)) return err('Hết thợ xây');
    const h = this.units.get(p.hero), th = this.thOf(b);
    if (h && Math.hypot(h.x - (th.tx + 1.5), h.y - (th.ty + 1.5)) > BASE_ZONE + 14) return err('Tướng phải ở gần căn cứ');
    const C = CLEAR[kind];
    if (!this.pay(p, C.cost)) return err(`Không đủ tài nguyên: cần ${fmtCost(C.cost)}`);
    const total = C.time * (p.bot ? BOT_SLOW : 1);
    b.clears.push({ tx, ty, kind, doneAt: this.t + total, total });
    this.quest?.(p, 'clear', 1);
    this.basesDirty = true;
    this.notice(p.id, `Thợ xây đang ${C.verb.toLowerCase()} ${C.name.toLowerCase()} (${total} giây)`, 'ok');
  };
  P.finishClear = function (b, c) {
    const i = c.ty * this.world.W + c.tx;
    this.cleared.add(i); this.world.block[i] = 0;
    this.onCleared?.(c.tx, c.ty, i);
    const C = CLEAR[c.kind], [r, chance, lo, hi] = C.reward;
    let msg = `Đã dọn xong ${C.name.toLowerCase()}`;
    if (Math.random() < chance) {
      const v = lo + Math.floor(Math.random() * (hi - lo + 1));
      (b.loot ??= {})[r] = (b.loot[r] ?? 0) + v;
      msg += `, tìm được ${v} ${RES_INFO[r].name}!`;
    }
    this.baseNotice(b, msg, 'ok');
    this.basesDirty = true;
  };
  P.baseTick = function () {
    for (const b of this.bases.values()) {
      if (b.clears?.length) for (const c of [...b.clears]) if (this.t >= c.doneAt) { b.clears.splice(b.clears.indexOf(c), 1); this.finishClear(b, c); }
      if (b.needHuts) { b.needHuts = false; this.autoHuts(b); }
      if (b.research) this.researchTick(b);
      if (b.battle) this.battleTick(b);
      if (b.loot) { const o = [...this.players.values()].find((q) => q.acc === b.key); if (o) { for (const [r, v] of Object.entries(b.loot)) this.gain(o, r, v); b.loot = null; } }
      const tm = this.team('B:' + b.key);
      for (const it of b.items) {
        const u = this.units.get(it.uid);
        if (it.state === 'build') {
          if (u) { const f = 0.1 + 0.9 * this.itemProg(it); u.hp = Math.min(u.maxHp, Math.max(u.hp, u.maxHp * f)); }
          if (this.t >= it.doneAt) { it.state = 'ok'; this.basesDirty = true; this.baseNotice(b, `${B_NAME(it.type)} đã xây xong`); if (it.type === 'thanh-tri') b.needHuts = true; }
        } else if (it.state === 'used') {
          if (this.t >= it.rearmAt) { it.state = 'ok'; it.rearmAt = undefined; this.basesDirty = true; }
        } else if (it.state === 'up' && this.t >= it.doneAt) {
          this.finishUpgrade(it);
          this.baseNotice(b, `${B_NAME(it.type)} đã lên cấp ${it.lv}`, 'ok', it.type === 'thanh-tri' ? { th: it.lv } : {});
        }
        // structures mend slowly out of combat
        if (u && !u.dead && !tm.combat && it.state !== 'build' && u.hp < u.maxHp) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.01);
      }
      // Tướng giữ nhà (16/11/2026): Vua Thành / Nữ hoàng Băng on their altar
      if (this.tick % 10 === 0) for (const it of b.items) if (BUILDINGS[it.type]?.homeHero) this.homeHeroTick(b, it, tm);
      // Hội thành: the troops inside sally out as soon as an enemy of the base walks into the watch range
      if (b.castle?.length && this.tick % 5 === 0) {
        const ca = this.castleOf(b), cu = ca && this.units.get(ca.uid);
        if (cu && !cu.dead && ca.state !== 'ruin' && ca.state !== 'build') {
          const c = this.itemCenter(ca), r = CASTLE_RANGE[ca.lv - 1] ?? 8;
          for (const e of this.near(c.x, c.y, r)) if (this.hostile(cu, e)) { this.releaseCastle(b); break; }
        }
      }
      // 12/11/2026: the soldiers kept in the base also come out as soon as an enemy walks into the base zone (not only on a hit)
      if (b.garrison.length && this.tick % 5 === 0 && this.t - (b.nearT ?? -1e9) >= 20) {
        const th = this.thOf(b), tu = th && th.state !== 'ruin' && this.units.get(th.uid);
        if (tu && !tu.dead) {
          const c = this.itemCenter(th);
          for (const e of this.near(c.x, c.y, (BASE_ZONE + 2) * 1.5)) if (e.kind !== 'build' && !e.dead && this.inBaseZone(b, e.x, e.y) && this.hostile(tu, e)) { b.nearT = this.t; this.releaseGarrison(b); break; }
        }
      }
      // defenders go back inside 10 s after the fight (Hội thành troops into the Hội thành)
      if (!tm.combat && this.t - tm.lastCombat > 10) {
        const back = [...this.units.values()].filter((u) => u.defender && !u.homeHero && u.baseKey === b.key && !u.dead);
        for (const u of back) { (u.castle ? (b.castle ??= []) : b.garrison).push({ type: u.type, hp: u.hp, buyN: u.buyN, kills: u.kills }); this.units.delete(u.id); }
        if (back.length) this.basesDirty = true;
      }
      // the owner's army heals inside the base (3 %/s) when not fighting
      const th = this.thOf(b), p = [...this.players.values()].find((q) => q.acc === b.key && q.alive);
      if (p && th.state !== 'ruin' && !this.team(p.id).combat) {
        for (const id of [p.hero, ...p.units]) { const u = this.units.get(id); if (u && !u.dead && u.hp < u.maxHp && this.inBaseZone(b, u.x, u.y)) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.03); }
      }
      // garrison soldiers heal inside too
      if (!tm.combat) {
        for (const g of b.garrison) { const mx = this.unitStats(g.type, b.heroType, b.unitLv?.[g.type] ?? 1, b.armyGear).hp; g.hp = Math.min(mx, g.hp + mx * 0.03); }
        for (const g of b.castle ?? []) { const mx = this.castleStats(b, g.type).hp; g.hp = Math.min(mx, g.hp + mx * 0.03); }
      }
      // borrowed (Gọi viện binh) troops: back inside when the time is up
      const op = [...this.players.values()].find((q) => q.acc === b.key && q.alive);
      if (op?.borrowUntil && this.t >= op.borrowUntil) this.castleReturn(op, ' (hết thời gian tiếp viện)');
    }
  };
  P.baseNotice = function (b, text, kind = 'ok', extra = {}) {
    const p = [...this.players.values()].find((q) => q.acc === b.key);
    if (p) this.notice(p.id, text, kind, extra);
  };

  // ------------------------------------------------------------------ combat hooks
  /** a structure was hit: alarm the owner, bring the garrison out */
  P.onBuildHit = function (e, a) {
    const b = this.bases.get(e.baseKey); if (!b) return;
    const ap = a ? this.playerOf(a) : null;
    if (ap) this.battleHit(b, ap);
    if (this.t - (b.alarmT ?? -99) > 30) {
      b.alarmT = this.t;
      this.baseNotice(b, `⚔ ${ap ? ap.name : 'Kẻ địch'} đang đánh căn cứ của bạn!`, 'err');
      if (ap) this.baseLog(b, `${ap.name} tấn công căn cứ`);
    }
    if (b.garrison.length && this.thOf(b).state !== 'ruin') this.releaseGarrison(b);
    if (b.castle?.length) this.releaseCastle(b);
  };
  // ------------------------------------------------------------------ Rương đồ / Lò nghiền / Lò rèn (docs/design/20-lo-ren-nghien-ruong.md)
  P.itemOf = (b, type) => b?.items.find((i) => i.type === type && i.state !== 'build' && i.state !== 'ruin') ?? null;
  P.chestCap = function (b) { const c = this.itemOf(b, 'ruong-do'); if (!c) return 0; const [w, h] = CHEST_GRID[c.lv - 1]; return w * h; };
  /** checks shared by the chest / furnaces: base, the building, hero inside the base zone */
  P.atBase = function (p, type, name) {
    const b = this.baseOf(p); if (!b) { this.notice(p.id, 'Cần xây Thành trì trước', 'err'); return null; }
    if (!this.itemOf(b, type)) { this.notice(p.id, `Cần có ${name} (đã xây xong, không đổ nát)`, 'err'); return null; }
    const h = this.units.get(p.hero);
    if (!h || !this.inBaseZone(b, h.x, h.y, 2)) { this.notice(p.id, 'Tướng phải đứng trong căn cứ', 'err'); return null; }
    b.chest ??= []; b.dust ??= {};
    return b;
  };
  P.chestTouch = function (b) { b.chestV = (b.chestV ?? 0) + 1; };
  P.chestPut = function (p, ids) {
    const b = this.atBase(p, 'ruong-do', 'Rương đồ'); if (!b) return;
    const cap = this.chestCap(b); let n = 0;
    for (const id of ids) {
      if (b.chest.length >= cap) { this.notice(p.id, `Rương đầy (${cap} ô): nâng cấp Rương để thêm chỗ`, 'err'); break; }
      const i = (p.bag ?? []).findIndex((it) => it.id === id); if (i < 0) continue;
      b.chest.push(p.bag.splice(i, 1)[0]); n++;
    }
    if (n) this.chestTouch(b);
  };
  P.chestTake = function (p, ids) {
    const b = this.atBase(p, 'ruong-do', 'Rương đồ'); if (!b) return;
    let n = 0; p.bag ??= [];
    for (const id of ids) {
      if (p.bag.length >= BAG_SIZE) { this.notice(p.id, `Túi đầy (${BAG_SIZE} ô)`, 'err'); break; }
      const i = b.chest.findIndex((it) => it.id === id); if (i < 0) continue;
      p.bag.push(b.chest.splice(i, 1)[0]); n++;
    }
    if (n) this.chestTouch(b);
  };
  P.chestSort = function (p) {
    const b = this.atBase(p, 'ruong-do', 'Rương đồ'); if (!b) return;
    const SL = SLOTS;
    b.chest.sort((x, y) => TIERS.indexOf(y.tier) - TIERS.indexOf(x.tier) || SL.indexOf(x.slot) - SL.indexOf(y.slot)); this.chestTouch(b);
  };
  /** an item the player owns that is not worn: from the bag or the chest; { it, from, i } */
  P.findLoose = function (p, b, id) {
    let i = (p.bag ?? []).findIndex((it) => it.id === id); if (i >= 0) return { it: p.bag[i], from: p.bag, i };
    i = (b?.chest ?? []).findIndex((it) => it.id === id); if (i >= 0) return { it: b.chest[i], from: b.chest, i };
    return null;
  };
  P.grind = function (p, ids) {
    const b = this.atBase(p, 'lo-nghien', 'Lò nghiền'); if (!b) return;
    const lv = this.itemOf(b, 'lo-nghien').lv, got = {};
    for (const id of ids.slice(0, 400)) {
      const f = this.findLoose(p, b, id); if (!f) continue;
      f.from.splice(f.i, 1);
      const lo = GRIND_MIN[lv - 1] ?? 1, n = lo + Math.floor(Math.random() * (GRIND_MAX - lo + 1));
      b.dust[f.it.tier] = (b.dust[f.it.tier] ?? 0) + n; got[f.it.tier] = (got[f.it.tier] ?? 0) + n;
    }
    if (!Object.keys(got).length) return;
    this.chestTouch(b);
    this.quest?.(p, 'grind', Object.values(got).length);
    this.notice(p.id, `⚙ Nghiền xong: ${Object.entries(got).map(([t, n]) => `${n} ${DUST[t]}`).join(', ')}`, 'ok');
  };
  /** Lò nghiền · gộp bột (16/11/2026): 9 powders of a tier → 1 of the next tier, free. all: as many times as possible */
  P.dustMix = function (p, tier, all = true) {
    const b = this.atBase(p, 'lo-nghien', 'Lò nghiền'); if (!b) return;
    const ti = TIERS.indexOf(tier); if (ti < 0 || ti >= TIERS.length - 1) return;
    const have = b.dust[tier] ?? 0, k = all ? Math.floor(have / 9) : Math.min(1, Math.floor(have / 9));
    if (!k) return this.notice(p.id, `Cần 9 ${DUST[tier]} để gộp (đang có ${have})`, 'err');
    const up = TIERS[ti + 1];
    b.dust[tier] = have - 9 * k; b.dust[up] = (b.dust[up] ?? 0) + k;
    this.chestTouch(b);
    this.notice(p.id, `⚙ Đã gộp ${9 * k} ${DUST[tier]} → ${k} ${DUST[up]}`, 'ok');
  };
  P.forgeItem = function (p, id) {
    const b = this.atBase(p, 'lo-ren', 'Lò rèn'); if (!b) return;
    const lv = this.itemOf(b, 'lo-ren').lv;
    let it = this.findLoose(p, b, id)?.it, worn = false;
    if (!it) { it = Object.values(p.equip ?? {}).find((q) => q?.id === id); worn = !!it; }
    if (!it) return;
    const ti = TIERS.indexOf(it.tier); if (ti < 0 || ti >= TIERS.length - 1) return this.notice(p.id, 'Đồ này đã ở phẩm chất cao nhất', 'err');
    const F = FORGE[ti];
    if (lv < F.lv) return this.notice(p.id, `Rèn lên ${TIER_INFO[TIERS[ti + 1]].name} cần Lò rèn cấp ${F.lv}`, 'err');
    if ((b.dust[it.tier] ?? 0) < F.dust) return this.notice(p.id, `Cần ${F.dust} ${DUST[it.tier]} (đang có ${b.dust[it.tier] ?? 0})`, 'err');
    if (!this.pay(p, F.cost)) return this.notice(p.id, `Không đủ tài nguyên: cần ${Object.entries(F.cost).map(([r, v]) => `${v} ${RES_INFO[r].name}`).join(', ')}`, 'err');
    b.dust[it.tier] -= F.dust;
    const rate = forgeRate(ti, lv), ok = Math.random() < rate, before = { name: it.name, tier: it.tier, slot: it.slot, lv: it.lv ?? 1 };
    this.quest?.(p, 'forge', 1);
    if (ok) {
      const nw = makeItem(it.id, TIERS[ti + 1], Math.random, it.slot, it.lv ?? 1); // the level stays, the lines are rolled again
      for (const k of Object.keys(it)) delete it[k];
      Object.assign(it, nw);
      if (worn) this.applyEquip(p);
      this.quest?.(p, 'forgeTier', ti + 1);
      this.notice(p.id, `🔥 RÈN THÀNH CÔNG: ${it.name} (${TIER_INFO[it.tier].name})!`, 'ok');
    } else this.notice(p.id, `💨 Rèn thất bại (tỉ lệ ${Math.round(rate * 100)}%): mất bột và tài nguyên, món đồ vẫn còn`, 'warn');
    // the client opens a result dialog (13/11/2026): what it was, what it became, the chance, what was spent
    this.events.push({ k: ok ? 'forgeok' : 'forgefail', to: p.id, id: it.id, rate, from: before, item: { ...it }, dust: F.dust, dustName: DUST[before.tier], cost: F.cost });
    p.invDirty = true; this.chestTouch(b);
  };
  // ------------------------------------------------------------------ Hội thành (docs/design/can-cu/10-hoi-thanh.md)
  /** stats of a Hội thành soldier: research level + CASTLE_LV_BONUS (max 5) */
  P.castleStats = function (b, type) { const ca = this.castleOf(b), bonus = ca ? CASTLE_LV_BONUS[ca.lv - 1] ?? 0 : 0; return this.unitStats(type, b.heroType, Math.min(UNIT_LV_MAX, (b.unitLv?.[type] ?? 1) + bonus), b.armyGear); };
  /** "Gọi viện binh": the troops of the Hội thành appear next to the hero and follow him for CASTLE_CALL_DUR s */
  P.castleCall = function (p) {
    const err = (m) => { this.notice(p.id, m, 'err'); return false; };
    const b = this.baseOf(p), ca = this.castleOf(b), h = this.units.get(p.hero);
    if (!b || !ca || ca.state === 'build') return err('Chưa có Hội thành');
    if (ca.state === 'ruin') return err('Hội thành đang đổ nát, sửa trước đã');
    if (!h || h.dead) return false;
    if (p.borrowUntil > this.t) return err(`Viện binh đang đi cùng tướng, còn ${Math.ceil(p.borrowUntil - this.t)} giây`);
    if (this.t < (b.callAt ?? -1e9) + CASTLE_CALL_CD) return err(`Viện binh còn hồi ${Math.ceil(b.callAt + CASTLE_CALL_CD - this.t)} giây`);
    if (!b.castle?.length) return err(this.castleOut(b).length ? 'Lính Hội thành đang giữ nhà, đợi hết trận' : 'Hội thành chưa có lính (gửi lính vào trước)');
    const list = b.castle; b.castle = []; b.callAt = this.t; p.borrowUntil = this.t + CASTLE_CALL_DUR;
    for (const g of list) {
      if (!UNITS[g.type]) continue;
      const st = this.castleStats(b, g.type), u = this.addUnit({ owner: p.id, kind: 'unit', type: g.type, x: h.x, y: h.y, st });
      Object.assign(u, { hp: Math.max(1, Math.min(u.maxHp, g.hp)), buyN: g.buyN ?? 0, kills: g.kills ?? 0, value: costValue(UNITS[g.type].cost), borrowed: true, lvBonus: CASTLE_LV_BONUS[ca.lv - 1] ?? 0 });
      p.units.push(u.id);
    }
    this.relayout(p);
    for (const id of p.units) { const u = this.units.get(id); if (!u?.borrowed || u.placed) continue; u.placed = true; const t = this.slotTarget(p, h, u), pos = u.fly ? t : this.world.nearestFree(t.x, t.y, 6) ?? { x: h.x, y: h.y }; u.x = pos.x; u.y = pos.y; this.events.push({ k: 'summon', x: u.x, y: u.y, id: u.id }); }
    this.basesDirty = true;
    this.notice(p.id, `📯 ${list.length} lính Hội thành tới tiếp viện (${Math.round(CASTLE_CALL_DUR / 60)} phút rồi tự về)`, 'ok');
    return true;
  };
  /** borrowed troops go back inside (time up, Về thành, Cất binh) */
  P.castleReturn = function (p, why = '') {
    const b = this.baseOf(p); if (!b) return 0;
    let n = 0;
    for (const id of [...p.units]) { const u = this.units.get(id); if (!u?.borrowed || u.dead) continue; this.unpair(u); (b.castle ??= []).push({ type: u.type, hp: u.hp, buyN: u.buyN, kills: u.kills }); this.units.delete(u.id); p.units.splice(p.units.indexOf(id), 1); n++; }
    p.borrowUntil = 0;
    if (n) { this.relayout(p); this.basesDirty = true; this.notice(p.id, `🏰 ${n} lính viện binh đã về Hội thành${why}`, 'ok'); }
    return n;
  };
  P.castleOf = function (b) { return b?.items.find((i) => i.type === 'hoi-thanh') ?? null; };
  P.castleOut = function (b) { return [...this.units.values()].filter((u) => u.castle && u.baseKey === b.key && !u.dead); };
  /** housing used: troops inside plus those out fighting */
  P.castleUsed = function (b) { return [...(b.castle ?? []), ...this.castleOut(b)].reduce((s, g) => s + (HOUSING[g.type] ?? 1), 0); };
  P.releaseCastle = function (b) {
    const ca = this.castleOf(b); if (!ca || ca.state === 'ruin' || ca.state === 'build' || !b.castle?.length) return;
    const c = this.itemCenter(ca), list = b.castle; b.castle = [];
    list.forEach((g, k) => {
      if (!UNITS[g.type]) return;
      const a = Math.PI / 2 + ((k % 7) - 3) * 0.35, r = 2.2 + Math.floor(k / 7) * 0.9; // out of the gate (front side)
      const pos = this.world.nearestFree(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, 5) ?? c;
      const st = this.castleStats(b, g.type); // +1 / +2 levels inside the Hội thành (13/11/2026)
      const u = this.addUnit({ owner: 0, kind: 'guard', type: g.type, x: pos.x, y: pos.y, st, team: 'B:' + b.key });
      Object.assign(u, { baseKey: b.key, defender: true, castle: true, hp: Math.max(1, Math.min(u.maxHp, g.hp)), buyN: g.buyN ?? 0, kills: g.kills ?? 0, value: costValue(UNITS[g.type].cost) });
    });
    this.engage('B:' + b.key);
    this.baseNotice(b, `🏰 Lính Hội thành xông ra giữ nhà (${list.length})`, 'warn');
    this.basesDirty = true;
  };
  /** send n soldiers of a type from the hero's army into the Hội thành */
  P.castlePut = function (p, type, n) {
    const err = (m) => { this.notice(p.id, m, 'err'); return false; };
    const b = this.baseOf(p), ca = this.castleOf(b);
    if (!ca || ca.state === 'build') return err('Chưa có Hội thành (xây xong mới gửi lính được)');
    if (ca.state === 'ruin') return err('Hội thành đang đổ nát, sửa trước đã');
    const h = this.units.get(p.hero); if (!h || !this.inBaseZone(b, h.x, h.y, 2)) return err('Tướng phải đứng trong căn cứ để gửi lính');
    if (this.team('B:' + b.key).combat || this.castleOut(b).length) return err('Lính Hội thành đang giữ nhà, đợi hết trận');
    const cap = CASTLE_CAP[ca.lv - 1], hs = Object.hasOwn(HOUSING, type) ? HOUSING[type] : 0; if (!hs) return false;
    b.castle ??= [];
    let moved = 0;
    for (let k = 0; k < Math.max(1, Math.min(50, n | 0)); k++) {
      if (this.castleUsed(b) + hs > cap) break;
      const u = p.units.map((id) => this.units.get(id)).filter((q) => q && !q.dead && q.type === type).sort((x, y) => y.hp / y.maxHp - x.hp / x.maxHp)[0];
      if (!u) { // 12/11/2026: soldiers kept in the Doanh trại (Cất binh) can be sent too
        const gi = (b.garrison ?? []).findIndex((g) => g.type === type); if (gi < 0) break;
        b.castle.push(b.garrison.splice(gi, 1)[0]); moved++; continue;
      }
      this.unpair(u);
      b.castle.push({ type, hp: u.hp, buyN: u.buyN, kills: u.kills });
      p.units.splice(p.units.indexOf(u.id), 1); this.units.delete(u.id); moved++;
    }
    if (!moved) return err(this.castleUsed(b) + hs > cap ? `Hội thành hết chỗ (${this.castleUsed(b)}/${cap})` : `Không có ${UNITS[type].name} trong đội quân hay doanh trại`);
    this.relayout(p); this.basesDirty = true;
    this.notice(p.id, `Đã gửi ${moved} ${UNITS[type].name} vào Hội thành (${this.castleUsed(b)}/${cap} chỗ)`, 'ok');
    return true;
  };
  /** fill the free room with soldiers from the army, strongest (biggest) first */
  P.castleFill = function (p) {
    const b = this.baseOf(p), ca = this.castleOf(b); if (!ca) return this.castlePut(p, 'dan-quan', 1);
    const quiet = (fn) => { const n0 = this.notice; this.notice = () => {}; try { return fn(); } finally { this.notice = n0; } };
    const before = this.castleUsed(b);
    const types = Object.keys(HOUSING).sort((x, y) => HOUSING[y] - HOUSING[x]);
    let any = false;
    const has = (t) => p.units.some((id) => this.units.get(id)?.type === t) || (b.garrison ?? []).some((g) => g.type === t);
    for (const t of types) if (has(t)) any = quiet(() => this.castlePut(p, t, 50)) || any;
    if (!any) return this.castlePut(p, types.find(has) ?? 'dan-quan', 1); // shows why
    this.notice(p.id, `Đã gửi lính vào Hội thành: ${before} → ${this.castleUsed(b)} / ${CASTLE_CAP[ca.lv - 1]} chỗ`, 'ok');
    return true;
  };
  /** take n soldiers of a type back out of the Hội thành into the hero's army */
  P.castleTake = function (p, type, n) {
    const err = (m) => { this.notice(p.id, m, 'err'); return false; };
    if (!Object.hasOwn(UNITS, type)) return false;
    const b = this.baseOf(p), h = this.units.get(p.hero);
    if (!b?.castle?.length) return err('Hội thành đang trống');
    if (!h || !this.inBaseZone(b, h.x, h.y, 2)) return err('Tướng phải đứng trong căn cứ để rút lính');
    const cap = this.armyCap(p), hs = HOUSING[type] ?? 1; if (this.armyCount(p) + hs > cap) return err(`Doanh trại không đủ chỗ (${this.armyCount(p)}/${cap} chỗ, ${UNITS[type].name} cần ${hs}): không rút thêm được`);
    let got = 0;
    for (let k = 0; k < Math.max(1, Math.min(50, n | 0)); k++) {
      if (this.armyCount(p) + hs > cap) break;
      const i = b.castle.findIndex((g) => g.type === type); if (i < 0) break;
      const [g] = b.castle.splice(i, 1);
      const u = this.addUnit({ owner: p.id, kind: 'unit', type, x: h.x, y: h.y, st: this.unitStats(type, p.heroType, this.unitLv(p.acc, type), p.armyGear) });
      u.hp = Math.max(1, Math.min(u.maxHp, g.hp)); u.buyN = g.buyN ?? 0; u.kills = g.kills ?? 0; u.value = costValue(UNITS[type].cost);
      p.units.push(u.id); got++;
    }
    if (!got) return err(`Không có ${UNITS[type]?.name ?? type} trong Hội thành`);
    this.relayout(p);
    for (const id of p.units) { const u = this.units.get(id); if (!u || u.x !== h.x || u.y !== h.y) continue; const t = this.slotTarget(p, h, u), pos = u.fly ? t : this.world.nearestFree(t.x, t.y, 6) ?? h; u.x = pos.x; u.y = pos.y; }
    this.basesDirty = true;
    this.notice(p.id, `Đã rút ${got} ${UNITS[type].name} khỏi Hội thành`, 'ok');
    return true;
  };
  P.releaseGarrison = function (b) {
    const th = this.thOf(b), c = this.itemCenter(th);
    // older saves keep the whole army inside: only 40 % of it (same mix) comes out to defend, the rest stays in
    // 12/11/2026: "Cất tất cả" keeps the whole army inside too, still only 40 % comes out — once per attack
    const all = b.garrison, part = false; // 14/11/2026: no more 40 % rule, the whole garrison comes out to defend
    if (part) { if (this.t - (b.relT ?? -1e9) < 60) return; b.relT = this.t; }
    const [list, rest] = part ? pickShare(all, GARRISON_DEF) : [all, []];
    if (!list.length) return;
    b.garrison = rest;
    list.forEach((g, k) => {
      if (!UNITS[g.type]) return;
      const a = (k / Math.max(1, list.length)) * Math.PI * 2, r = 2.4 + (k % 3) * 0.8;
      const pos = this.world.nearestFree(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, 5) ?? c;
      const st = this.unitStats(g.type, b.heroType, b.unitLv?.[g.type] ?? 1, b.armyGear);
      const u = this.addUnit({ owner: 0, kind: 'guard', type: g.type, x: pos.x, y: pos.y, st, team: 'B:' + b.key });
      Object.assign(u, { baseKey: b.key, defender: true, hp: Math.max(1, Math.min(u.maxHp, g.hp)), buyN: g.buyN ?? 0, kills: g.kills ?? 0, value: costValue(UNITS[g.type].cost) });
    });
    this.engage('B:' + b.key);
    this.baseNotice(b, `Lính trong căn cứ đã ra giữ nhà (${list.length})`, 'ok');
    this.basesDirty = true;
  };
  P.onBuildKilled = function (e, a) {
    const b = this.bases.get(e.baseKey); if (!b) return;
    const it = b.items.find((i) => i.id === e.bItem); if (!it) return;
    it.state = 'ruin'; it.uid = 0; it.hp = null;
    this.setDyn(it, false);
    this.basesDirty = true;
    const ap = a ? this.playerOf(a) : null;
    this.events.push({ k: 'boom', x: e.x, y: e.y, r: SIZE(it.type) * 0.8, kind: 'slam' });
    if (ap || b.battle) this.battleRuin(b, it.type, ap);
    // 13/11/2026: every Kho holds a part of the raid loot too (not only the Thành trì)
    if (it.type === 'kho') {
      if (!ap || ap.bot || ap.acc === b.key || this.t - b.lastRaid < RAID_COOLDOWN) return;
      b.raidTaken ??= {};
      if (this.t - (b.raidTaken[it.id] ?? -1e9) < RAID_COOLDOWN) return this.notice(ap.id, 'Kho này vừa bị cướp gần đây, trống rỗng', 'warn');
      b.raidTaken[it.id] = this.t;
      const got = (this.onRaid ? this.onRaid(b, ap, this.raidPart(b, it)) : this.raidFromPlayer(b, ap, this.raidPart(b, it))) ?? {};
      this.battleLoot(b, got);
      const txt = Object.entries(got).filter(([, v]) => v >= 1).map(([r, v]) => `${Math.floor(v)} ${RES_INFO[r].name}`).join(', ');
      this.notice(ap.id, txt ? `Phá Kho của ${b.name}: cướp được ${txt}` : `Phá Kho của ${b.name}: kho trống`, 'ok');
      this.baseLog(b, `${ap.name} phá Kho, cướp ${txt || 'không được gì'}`);
      return;
    }
    if (it.type !== 'thanh-tri') return;
    this.baseLog(b, `${ap ? ap.name : 'Kẻ địch'} phá Thành trì`);
    if (ap && !ap.bot && this.t - b.lastRaid >= RAID_COOLDOWN) {
      b.lastRaid = this.t; b.shieldUntil = this.t + RAID_SHIELD;
      const got = (this.onRaid ? this.onRaid(b, ap, this.raidPart(b, it)) : this.raidFromPlayer(b, ap, this.raidPart(b, it))) ?? {};
      b.raidTaken = {}; // the raid is over (shield): every Kho is full again for the next one
      this.battleLoot(b, got);
      const txt = Object.entries(got).filter(([, v]) => v >= 1).map(([r, v]) => `${Math.floor(v)} ${RES_INFO[r].name}`).join(', ');
      this.notice(ap.id, txt ? `Phá Thành trì của ${b.name}: cướp được ${txt}` : `Phá Thành trì của ${b.name}`, 'ok');
      this.notice(null, `🏰 ${ap.name} đã phá Thành trì của ${b.name}!`, 'sys');
      this.baseLog(b, `${ap.name} cướp ${txt || 'không được gì'}`);
    } else if (ap) this.notice(ap.id, `Căn cứ của ${b.name} vừa bị cướp gần đây, không còn gì để lấy`, 'warn');
  };
  /** take a share of the owner's stock when they are in this game (main.js handles stashed owners) */
  /** share of the raid loot (RAID_SHARE of the stock) kept in this structure: Thành trì RAID_TH_PART, the Kho split the rest */
  P.raidPart = function (b, it) {
    const kho = b.items.filter((i) => i.type === 'kho' && i.state !== 'build').length;
    if (!kho) return it.type === 'thanh-tri' ? 1 : 0;
    return it.type === 'thanh-tri' ? RAID_TH_PART : (1 - RAID_TH_PART) / kho;
  };
  P.raidFromPlayer = function (b, ap, frac = 1) {
    const owner = [...this.players.values()].find((q) => q.acc === b.key);
    if (!owner) return null;
    const got = {};
    const prot = this.protectedFor(b.key);
    for (const r of RES) { const v = Math.floor(Math.max(0, (owner.res[r] ?? 0) - prot[r]) * RAID_SHARE * frac); if (v <= 0) continue; owner.res[r] -= v; got[r] = this.gain(ap, r, v); }
    return got;
  };
  P.baseLog = function (b, text) { b.log.push({ t: Date.now(), text }); if (b.log.length > 30) b.log.shift(); };

  // ------------------------------------------------------------------ army inside the base ("Cất binh" with a base)
  P.spawnPointFor = function (p) {
    const b = this.baseOf(p); if (!b) return null;
    const th = this.thOf(b); if (!th || th.state === 'ruin') return null;
    return this.world.nearestFree(th.tx + 1.5, th.ty + 4.5, 6);
  };

  // ------------------------------------------------------------------ save / restore
  P.serializeBases = function () {
    return [...this.bases.values()].map((b) => ({ ...b,
      castle: [...(b.castle ?? []), ...this.castleOut(b).map((u) => ({ type: u.type, hp: u.hp, buyN: u.buyN, kills: u.kills }))],
      garrison: [...b.garrison, ...[...this.units.values()].filter((u) => u.defender && !u.castle && !u.homeHero && u.baseKey === b.key && !u.dead).map((u) => ({ type: u.type, hp: u.hp, buyN: u.buyN, kills: u.kills }))],
      items: b.items.map((it) => { const u = this.units.get(it.uid); return { ...it, uid: 0, hp: u && !u.dead ? Math.round(u.hp) : it.hp ?? null, doneIn: it.doneAt - this.t, doneAt: undefined, rearmIn: it.rearmAt != null ? it.rearmAt - this.t : undefined, rearmAt: undefined }; }),
      clears: (b.clears ?? []).map((c) => ({ ...c, doneIn: c.doneAt - this.t, doneAt: undefined })),
      research: b.research ? { ...b.research, doneIn: b.research.doneAt - this.t, doneAt: undefined } : null, shieldIn: b.shieldUntil - this.t, raidAgo: this.t - b.lastRaid, shieldUntil: undefined, lastRaid: undefined, alarmT: undefined }));
  };
  P.restoreBases = function (list) {
    this.bases = new Map();
    this.world.dyn.fill(0);
    for (const q of list ?? []) {
      const b = { ...q, shieldUntil: this.t + (q.shieldIn ?? 0), lastRaid: this.t - (q.raidAgo ?? 1e9), garrison: q.garrison ?? [], castle: q.castle ?? [], log: q.log ?? [] };
      delete b.shieldIn; delete b.raidAgo;
      b.items = q.items.map((it) => ({ ...it, doneAt: this.t + (it.doneIn ?? 0), doneIn: undefined, rearmAt: it.rearmIn != null ? this.t + it.rearmIn : undefined, rearmIn: undefined }));
      b.clears = (q.clears ?? []).map((c) => ({ ...c, doneAt: this.t + (c.doneIn ?? 0), doneIn: undefined }));
      b.research = q.research ? { ...q.research, doneAt: this.t + (q.research.doneIn ?? 0), doneIn: undefined } : null;
      this.bases.set(b.key, b);
      for (const it of b.items) if (it.state !== 'ruin') this.spawnBuildUnit(b, it);
      if (!b.hutsV) { b.hutsV = 1; b.needHuts = true; } // bases from before Nhà thợ xây: get their free huts once
    }
    this.basesDirty = true;
  };
  /** static description of all bases for clients */
  /** viewer: account key of who gets it (their own traps are included, other people's stay hidden) */
  P.basesInfo = function (viewer = null) {
    return [...this.bases.values()].map((b) => ({
      key: b.key, name: b.name, color: b.color, gw: b.glow ?? undefined, th: this.thLevel(b), shield: Math.max(0, Math.round(b.shieldUntil - this.t)), gar: b.garrison.length, gl: b.garrison.reduce((o, g) => ((o[g.type] = (o[g.type] ?? 0) + 1), o), {}),
      items: b.items.filter((it) => b.key === viewer || !BUILDINGS[it.type]?.trap).map((it) => [it.id, it.type, it.tx, it.ty, it.lv, it.state, it.state === 'build' || it.state === 'up' ? Math.round(it.doneAt - this.t) : it.state === 'used' ? Math.round(it.rearmAt - this.t) : 0, it.total ?? 0, it.uid ?? 0, it.hid ? 1 : 0, it.restUntil > this.t ? Math.round(it.restUntil - this.t) : 0]),
      cl: (b.clears ?? []).map((c) => [c.tx, c.ty, Math.round(c.doneAt - this.t), c.total]),
      ...(b.key === viewer ? { mu: this.mines.filter((m) => m.upAt && m.upBy === b.key).map((m) => this.mines.indexOf(m)), ca: [...(b.castle ?? []).map((g) => g.type), ...this.castleOut(b).map((u) => '!' + u.type)], cc: Math.max(0, Math.ceil((b.callAt ?? -1e9) + CASTLE_CALL_CD - this.t)), cb: (() => { const op = [...this.players.values()].find((q) => q.acc === b.key); return op?.borrowUntil > this.t ? [op.units.filter((id) => this.units.get(id)?.borrowed).length, Math.ceil(op.borrowUntil - this.t)] : null; })(), ul: b.unitLv ?? {}, mvd: b.movedDay === new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10) ? 1 : 0, rs: b.research ? [b.research.unit, b.research.lv, Math.max(0, Math.round(b.research.doneAt - this.t)), b.research.total] : null } : {}),
    }));
  };
  // ---------------- Tướng giữ nhà (16/11/2026, docs/design/28 §5) ----------------
  /** keep the altar's hero on the field: gone while the altar is building / upgrading / ruined or the hero rests */
  P.homeHeroTick = function (b, it, tm) {
    const D = BUILDINGS[it.type], hu = it.heroId ? this.units.get(it.heroId) : null, au = this.units.get(it.uid);
    const ok = it.state === 'ok' && au && !au.dead && !(it.restUntil > this.t);
    if (it.restUntil && it.restUntil <= this.t) { it.restUntil = 0; this.basesDirty = true; this.baseNotice(b, `${HOME_HEROES[D.homeHero].name} đã hồi sức, trở lại giữ nhà`, 'ok'); }
    if (!ok) { if (hu && !hu.dead) { this.unpair(hu); it.heroHp = hu.hp; this.units.delete(hu.id); this.events.push({ k: 'die', id: hu.id }); } it.heroId = 0; return; }
    if (hu && !hu.dead) { if (!tm.combat && hu.hp < hu.maxHp) hu.hp = Math.min(hu.maxHp, hu.hp + hu.maxHp * 0.02 * 0.5); return; }
    if (hu) return; // dying: homeHeroDown takes over
    const c = this.itemCenter(it), st = homeHeroStats(D.homeHero, it.lv), pos = this.world.nearestFree(c.x, c.y + 2.2, 4) ?? { x: c.x, y: c.y + 2.2 };
    const u = this.addUnit({ owner: 0, kind: 'guard', type: D.homeHero, x: pos.x, y: pos.y, st: { ...st, lv: it.lv }, team: 'B:' + b.key });
    Object.assign(u, { baseKey: b.key, defender: true, homeHero: true, altar: it.id, value: 400, slowHit: st.slowHit ?? 0, skill: st.skill, skillCd: st.skillCd, nextSpecial: this.t + 4, aoe: st.aoe ?? 0 });
    if (it.heroHp) u.hp = Math.max(1, Math.min(u.maxHp, it.heroHp));
    it.heroId = u.id;
  };
  /** the hero fell: it rests HOME_HERO_REST s on the altar */
  P.homeHeroDown = function (u) {
    const b = this.bases.get(u.baseKey), it = b?.items.find((i) => i.id === u.altar); if (!it) return;
    it.heroId = 0; it.heroHp = null; it.restUntil = this.t + HOME_HERO_REST; this.basesDirty = true;
    this.baseNotice(b, `${HOME_HEROES[u.type]?.name ?? 'Tướng'} đã gục, nghỉ ${Math.round(HOME_HERO_REST / 60)} phút trên bệ`, 'warn');
  };

}

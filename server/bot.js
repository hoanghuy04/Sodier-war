// "Lãnh chúa máy": simple bots so a small group always has someone to fight.
import { TIERS, UNITS, HERO_ORDER, GUARDS, GUARD_SETS, unitCost, ringCost, RING_SLOTS, CAPTURE_R, TOWN_HALL, BASE_ZONE, buildCost } from '../shared/balance.js';
const BOT_FIELD_MAX = 250; // soldiers following a bot lord (base garrison not counted)

// NPC base layout, offsets from the Thành trì's top-left tile (it covers 0..2)
const PLAN = {
  // 16/11/2026: Thành trì 6–8 structures (no planned spot: the random free-spot search places them)
  'coi-phao': [], 'phong-khong': [], 'no-than': [], 'cot-set': [], 'phao-chum': [], 'hoa-nguc': [], 'be-vua': [], 'be-nu-hoang': [],
  'thap-cung': [[-4, -1], [5, -1], [-4, 3], [5, 3], [0, -4], [-8, 5]],
  'phao-da': [[-4, -5], [5, -5], [-4, 7], [5, 7]],
  'thap-phep': [[-7, 1], [8, 1], [1, -8]],
  kho: [[-1, 4], [3, 4], [-8, -4]],
  'hoi-thanh': [[7, -8], [-8, -8], [7, 8], [-8, 8]],
};
const WALL_RING = (() => { const out = []; for (let x = -10; x <= 12; x++) for (let y = -10; y <= 12; y++) if ((x === -10 || x === 12 || y === -10 || y === 12) && !(y === 12 && (x === 1 || x === 0 || x === 2))) out.push([x, y]); return out; })();
const addCost = (a, b, k = 1) => { const c = { ...a }; for (const [r, v] of Object.entries(b ?? {})) c[r] = (c[r] ?? 0) + v * k; return c; };

const BOT_NAMES = ['Lãnh chúa Sói', 'Lãnh chúa Ưng', 'Lãnh chúa Gấu', 'Lãnh chúa Rắn', 'Lãnh chúa Hổ', 'Lãnh chúa Báo', 'Lãnh chúa Cáo', 'Lãnh chúa Trâu', 'Lãnh chúa Kền Kền'];

export class Bots {
  constructor(game) {
    this.g = game;
    // bots restored from a saved world keep playing
    this.list = [...game.players.values()].filter((p) => p.bot).map((p) => ({ p, next: 0, target: null, respawnAt: p.alive ? 0 : game.t + 2, phase: Math.random() }));
  }
  ensure(n) {
    const g = this.g;
    while (this.list.length < n) {
      const used = new Set(this.list.map((b) => b.p.name));
      const name = BOT_NAMES.find((s) => !used.has(s)) ?? `Lãnh chúa ${this.list.length + 1}`;
      const p = g.addPlayer(name, { bot: true });
      this.list.push({ p, next: 0, target: null, respawnAt: g.t + 2, phase: Math.random() });
    }
    while (this.list.length > n) { const b = this.list.pop(); g.removePlayer(b.p); }
  }
  update() {
    const g = this.g;
    for (const b of this.list) {
      if (g.t < b.next) continue;
      b.next = g.t + 0.8 + b.phase * 0.4;
      const p = b.p;
      if (!p.alive) {
        // open world: NPC lords come back after a random 20–60 s; match rooms: quickly (they only enter during the join window)
        if (!b.respawnAt) b.respawnAt = g.t + (g.mode === 'endless' ? 20 + Math.random() * 40 : 8);
        if (g.t >= b.respawnAt) { b.respawnAt = 0; g.spawnPlayer(p, HERO_ORDER[Math.floor(Math.random() * HERO_ORDER.length)]); }
        continue;
      }
      this.think(b, p);
    }
  }
  /** Lanchester-ish strength: total HP × total DPS */
  strength(list) { let hp = 0, dps = 0; for (const u of list) if (u && !u.dead) { hp += u.hp / (1 - u.armor); dps += u.atk / u.cd; } return hp * dps; }
  armyPower(p) { const g = this.g; return this.strength([p.hero, ...p.units].map((id) => g.units.get(id))); }
  /** what the NPC's base could do next, most wanted first: [{ kind: 'place' | 'up', type, tx, ty, id, row, cost }] */
  baseJobs(p, base, th) {
    const g = this.g, jobs = [];
    // 14/11/2026: a spot is fine even when the hero is away (the bot walks home to build); before this every spot looked
    // blocked while the bot was out, it never went home and the base stayed at Thành trì 1
    const free = (type, tx, ty) => { const e = g.canPlace(p, type, tx, ty); return !e || e === 'Tướng phải ở gần căn cứ'; };
    // ruined buildings (after a raid) first: they block new ones and the Thành trì level-up (14/11/2026)
    const ruin = base.items.filter((i) => i.state === 'ruin' && i.type !== 'tuong');
    if (ruin.length) { const it = ruin.sort((a, c) => (c.type === 'thanh-tri') - (a.type === 'thanh-tri'))[0]; jobs.push({ kind: 'repair', id: it.id, type: it.type, cost: g.repairCost(it) }); }
    if (!g.canUpgrade(base, th)) jobs.push({ kind: 'up', id: th.id, type: 'thanh-tri', cost: buildCost('thanh-tri', th.lv + 1) }); // null = can upgrade
    const max = TOWN_HALL.levels[th.lv - 1].max;
    if (g.busyBuilders(base) < g.builders(base)) for (const [type, spots] of Object.entries(PLAN)) {
      if (base.items.filter((i) => i.type === type).length >= (max[type] ?? 0)) continue;
      let spot = spots.find(([dx, dy]) => free(type, th.tx + dx, th.ty + dy));
      // planned spots taken (walls, decor…): any free spot near the Thành trì (14/11/2026)
      for (let k = 0; !spot && k < 40; k++) { const r = 4 + Math.random() * 10, a = Math.random() * Math.PI * 2, dx = Math.round(Math.cos(a) * r), dy = Math.round(Math.sin(a) * r); if (free(type, th.tx + dx, th.ty + dy)) spot = [dx, dy]; }
      if (spot) jobs.push({ kind: 'place', type, tx: th.tx + spot[0], ty: th.ty + spot[1], cost: buildCost(type, 1) });
    }
    // traps: anywhere free in the zone (no builder needed; the Thành trì needs them all before it can level up)
    for (const type of ['bom', 'lo-xo', 'bom-khi']) {
      if (base.items.filter((i) => i.type === type).length >= (max[type] ?? 0)) continue;
      for (let k = 0; k < 12; k++) {
        const tx = th.tx - 8 + Math.floor(Math.random() * 19), ty = th.ty - 8 + Math.floor(Math.random() * 19);
        if (free(type, tx, ty)) { jobs.push({ kind: 'place', type, tx, ty, cost: buildCost(type, 1) }); break; }
      }
    }
    const up = base.items.filter((i) => i.type !== 'thanh-tri' && i.type !== 'tuong' && !g.canUpgrade(base, i)).sort((a, b) => a.lv - b.lv)[0];
    if (up) jobs.push({ kind: 'up', id: up.id, type: up.type, cost: buildCost(up.type, up.lv + 1) });
    if (base.items.filter((i) => i.type === 'tuong').length < (max.tuong ?? 0)) {
      const spot = WALL_RING.find(([dx, dy]) => { const tx = th.tx + dx, ty = th.ty + dy; return !base.items.some((i) => i.tx === tx && i.ty === ty) && free('tuong', tx, ty); });
      if (spot) jobs.push({ kind: 'place', type: 'tuong', tx: th.tx + spot[0], ty: th.ty + spot[1], cost: buildCost('tuong', 1) });
    }
    const w = base.items.find((i) => i.type === 'tuong' && !g.canUpgrade(base, i));
    if (w) jobs.push({ kind: 'up', id: w.id, type: 'tuong', row: true, cost: buildCost('tuong', w.lv + 1) });
    return jobs;
  }
  /** NPC lords build and grow a base like players (they never attack bases). Returns true while walking home. */
  manageBase(b, p, h) {
    const g = this.g;
    if (g.mode !== 'endless' || g.t < (b.baseAt ?? 0)) return !!b.goingHome;
    b.baseAt = g.t + 2 + Math.random();
    const base = g.baseOf(p);
    if (!base) {
      b.job = { cost: buildCost('thanh-tri', 1) }; // save up for the Thành trì first
      if (!g.canAfford(p, b.job.cost)) return false;
      for (let k = 0; k < 30; k++) {
        const a = Math.random() * Math.PI * 2, r = 4 + Math.random() * 9, tx = Math.floor(h.x + Math.cos(a) * r) - 1, ty = Math.floor(h.y + Math.sin(a) * r) - 1;
        if (!g.canPlace(p, 'thanh-tri', tx, ty)) { g.placeBuilding(p, 'thanh-tri', tx, ty); return false; }
      }
      return false;
    }
    const th = g.thOf(base);
    if (th.state === 'ruin') { // repair the Thành trì: walk home first (14/11/2026: it waited forever when away)
      if (Math.hypot(h.x - th.tx - 1.5, h.y - th.ty - 1.5) < BASE_ZONE + 10) { b.goingHome = false; g.repairBuilding(p, th.id); return false; }
      if (!b.goingHome) { b.goingHome = true; g.cmd(p, { t: 'move', x: th.tx + 1.5, y: th.ty + 5 }); }
      return true;
    }
    const jobs = this.baseJobs(p, base, th), job = jobs.find((j) => g.canAfford(p, j.cost));
    b.job = jobs[0] ?? null; // what it saves money for
    if (!job) { b.goingHome = false; return false; }
    // walls go up whenever the bot is around (cheap); everything else is worth a trip home
    const near = Math.hypot(h.x - (th.tx + 1.5), h.y - (th.ty + 1.5)) < BASE_ZONE + 12;
    if (!near) {
      if (job.type === 'tuong') return false;
      if (!b.goingHome) { b.goingHome = true; g.cmd(p, { t: 'move', x: th.tx + 1.5, y: th.ty + 5 }); }
      return true;
    }
    b.goingHome = false;
    // Hội thành: park a few soldiers inside (cheapest first) when it is empty
    const ca = g.castleOf(base);
    if (ca && ca.state !== 'build' && ca.state !== 'ruin' && !(base.castle?.length) && p.units.length > 6 && g.inBaseZone(base, h.x, h.y, 2)) {
      const t = ['dan-quan', 'kiem-si', 'cung-thu', 'linh-giao'].find((ty) => p.units.some((id) => g.units.get(id)?.type === ty));
      if (t) g.castlePut(p, t, 5);
    }
    if (job.kind === 'repair') g.repairBuilding(p, job.id); else if (job.kind === 'up') g.upgradeBuilding(p, job.id, !!job.row); else g.placeBuilding(p, job.type, job.tx, job.ty);
    g.notices = g.notices.filter((n) => n.to !== p.id); // bots do not need their own messages
    return false;
  }
  think(b, p) {
    const g = this.g, h = g.units.get(p.hero); if (!h) return;
    // 17/11/2026: lords had no army limit; 700-900 soldiers each slowed the whole server. Trim the weakest extras.
    if (p.units.length > BOT_FIELD_MAX) {
      const extra = p.units.map((id) => g.units.get(id)).filter(Boolean).sort((x, y) => (x.value ?? 0) - (y.value ?? 0) || x.hp / x.maxHp - y.hp / y.maxHp).slice(0, p.units.length - BOT_FIELD_MAX);
      const gone = new Set(extra.map((u) => u.id));
      for (const u of extra) { g.unpair(u); g.units.delete(u.id); }
      p.units = p.units.filter((id) => !gone.has(id) && g.units.has(id));
    }
    const home = !g.team(p.id).combat && this.manageBase(b, p, h);
    // shopping: rarest affordable unit first, keep some cheap bodies
    const order = ['rong', 'su-thuu', 'may-ban-da', 'phap-su', 'hiep-si', 'ky-binh', 'cung-thu', 'linh-giao', 'kiem-si', 'dan-quan'];
    const counts = {};
    for (const id of p.units) { const u = g.units.get(id); if (u) counts[u.type] = (counts[u.type] ?? 0) + 1; }
    const reserve = b.job?.cost ? addCost({}, b.job.cost, 0.6) : null; // keep money for the base
    for (const t of order) {
      if (p.units.length >= BOT_FIELD_MAX) break;
      if (g.unitLocked(p, t)) continue;
      if (reserve && !g.canAfford(p, addCost(unitCost(t, p.heroType), reserve))) continue;
      if (t === 'cung-thu' && (counts['cung-thu'] ?? 0) > (counts['kiem-si'] ?? 0) + (counts['linh-giao'] ?? 0) + 2) continue;
      if (t === 'dan-quan' && (counts['dan-quan'] ?? 0) > 12) continue;
      if (g.canAfford(p, unitCost(t, p.heroType))) { g.buy(p, t, false); break; }
    }
    const my = this.armyPower(p);
    const tm = g.team(p.id);
    if (tm.combat) {
      if (g.t >= p.skillReadyAt && p.heroType !== 'kim-ha') {
        const e = g.nearestEnemy(h, 8);
        g.cmd(p, { t: 'skill', x: e?.x, y: e?.y });
      }
      // (no fleeing: NPC lords fight to the end, even when the hero is nearly dead)
      return;
    }
    if (home) return; // walking home to build
    // stay inside the safe zone (the next circle when it is already announced)
    const z = g.zone, safe = z ? (z.next ?? z.cur) : null;
    if (safe && Math.hypot(h.x - safe.x, h.y - safe.y) > safe.r * 0.8) {
      if (!p.path || !b.toZone) { b.toZone = true; const a = Math.atan2(h.y - safe.y, h.x - safe.x), r = safe.r * 0.4; g.cmd(p, { t: 'move', x: safe.x + Math.cos(a) * r, y: safe.y + Math.sin(a) * r }); }
      return;
    }
    b.toZone = false;
    // loot lying around
    let loot = null, ld = 14;
    for (const it of g.items.values()) { if (it.owner && it.owner !== p.id) continue; const d = Math.hypot(it.x - h.x, it.y - h.y); if (d < ld && (!safe || Math.hypot(it.x - safe.x, it.y - safe.y) < safe.r)) { ld = d; loot = it; } }
    if (loot && (p.bag?.length ?? 0) < 16) { if (p.pickTarget !== loot.id) g.cmd(p, { t: 'pickup', id: loot.id }); return; }
    // wear better items from the bag
    for (const it of [...(p.bag ?? [])]) { const cur = p.equip?.[it.slot]; if (!cur || TIERS.indexOf(it.tier) > TIERS.indexOf(cur.tier)) g.equipItem(p, it.id); }
    if (p.heroType === 'kim-ha' && g.t >= p.skillReadyAt && g.mines.filter((m) => m.owner === p.id).length >= 3) g.cmd(p, { t: 'skill' });
    // hunt a weaker enemy army nearby
    for (const q of g.players.values()) {
      if (q === p || !q.alive || q.shieldUntil > g.t || p.shieldUntil > g.t) continue;
      const qh = g.units.get(q.hero); if (!qh) continue;
      if (Math.hypot(qh.x - h.x, qh.y - h.y) < 16 && my > this.armyPower(q) * 1.4) { g.cmd(p, { t: 'chase', id: qh.id }); return; }
    }
    // farm monster camps for items and XP (14/11/2026): about half the time, a camp the army beats easily (not while
    // capturing a mine); they pick the loot up through the block above
    if (g.mode === 'endless' && !g.mines.some((m) => m.cap?.by === p.id)) {
      if (!b.modeUntil || g.t > b.modeUntil) { b.farm = Math.random() < 0.5; b.modeUntil = g.t + 90 + Math.random() * 90; b.farmCamp = null; }
      if (b.farm) {
        let camp = b.farmCamp != null ? g.camps[b.farmCamp] : null;
        if (!camp || !camp.guards.size) {
          camp = null; let cs = -1e9;
          for (const c of g.camps) {
            if (!c.guards.size) continue;
            const d = Math.hypot(c.x - h.x, c.y - h.y); if (d > 60 * (g.world.W / 256)) continue;
            if (this.strength([...c.guards].map((id) => g.units.get(id))) > my * 0.35) continue;
            const sc = c.level * 12 - d; if (sc > cs) { cs = sc; camp = c; }
          }
          b.farmCamp = camp ? camp.id : null;
        }
        if (camp) {
          const gu = [...camp.guards].map((id) => g.units.get(id)).find((u) => u && !u.dead);
          if (gu) { b.target = null; if (p.chase !== gu.id) g.cmd(p, { t: 'chase', id: gu.id }); return; }
        }
      }
    }
    // capturing right now: wait
    const cur = g.mines.find((m) => m.cap?.by === p.id);
    if (cur && Math.hypot(cur.x - h.x, cur.y - h.y) <= CAPTURE_R(cur.type)) return;
    if (p.path && b.target != null && g.mines[b.target].owner !== p.id) return;
    // next mine: close, not mine, guards we can beat
    let best = null, bs = -1e9;
    // monster camps the army cannot beat are no-go areas (walking past one wakes 10 monsters up)
    const danger = g.camps.filter((c) => c.guards.size && this.strength([...c.guards].map((id) => g.units.get(id))) > my * 0.5);
    const risky = (x, y) => danger.some((c) => Math.hypot(c.x - x, c.y - y) < 12);
    for (const m of g.mines) {
      if (m.owner === p.id) continue;
      if (!g.mineRoom(p.id, m.type)) continue; // at the per-player cap for this kind
      if (risky(m.x, m.y)) continue;
      if (safe && Math.hypot(m.x - safe.x, m.y - safe.y) > safe.r * 0.85) continue;
      const d = Math.hypot(m.x - h.x, m.y - h.y);
      if (d > 70 * (g.world.W / 256)) continue;
      const gp = this.strength([...m.guards].map((id) => g.units.get(id)));
      if (gp > my * 0.5) continue;
      if (m.owner) { const o = g.players.get(m.owner); if (o && this.armyPower(o) > my * 0.8) continue; }
      const val = { iron: 1, coal: 1.1, gold: 2.2, oil: 2.4, tar: 3, crystal: 3.5, diamond: 5 }[m.type];
      const s = val * 30 - d - (m.owner ? 10 : 0);
      if (s > bs) { bs = s; best = m; }
    }
    if (best) {
      b.target = best.id;
      if (best.guards.size) { const gu = g.units.get([...best.guards][0]); if (gu) { g.cmd(p, { t: 'chase', id: gu.id }); return; } }
      g.cmd(p, { t: 'mine', id: best.id });
    } else if (!p.path) {
      for (let k = 0; k < 6; k++) {
        const a = Math.random() * Math.PI * 2, x = h.x + Math.cos(a) * 12, y = h.y + Math.sin(a) * 12;
        if (!risky(x, y)) { g.cmd(p, { t: 'move', x, y }); break; }
      }
    }
  }
}

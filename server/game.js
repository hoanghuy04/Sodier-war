// Authoritative simulation (docs/design 03–08). 20 ticks/s. Pure logic: no sockets here.
import {
  RES, RES_INFO, CAPTURE_R, START_RES, BASE_INCOME, SHIELD_SECONDS, GUARD_RESPAWN, LEASH, holdBonus, management, K,
  UNITS, GUARDS, GUARD_SETS, HEROES, heroStats, BOSSES, BOSS_LEASH, MATCH_LEN, JOIN_WINDOW, INTERMISSION, ZONE_PHASES, ZONE_START_R,
  MINE_LV_MAX, UNIT_LV_MAX, HEAL_PCT, HEAL_R, SAPPER_WALL, HOME_HEROES, homeHeroStats, HOME_HERO_REST, BUILDINGS as BLD_ALL,
  MINE_CAP, CAMP_PACK_MULT, CAMP_ATK_MULT, campAtkK, BOSS_REFUND, BOSS_RES_BONUS, ORPHAN_DROP_MULT, SPEED_BONUS_CAP, LS_CAP, DODGE_CAP, HOUSING, SIEGE_MULT, SIEGE_DEF, GARRISON_DEF, pickShare, BOSS_ENRAGE, BASE_ZONE, CAMPS, CAMP_LEASH, OFFLINE_RATE, BOSS_RESPAWN, MINE_ALERT_R, GARRISON, GARRISON_SHARE, GARRISON_MAX, TIERS, SLOTS, BAG_SIZE, ARMOR_CAP, ITEM_TTL, MINE_DROPS, makeItem, equipBonus, gearBonus, restatItem, BOT_DROP, BOSS_SUMMON, BOSS_SUMMON_AT, PET_PAY_TIER, petTier, petFight, PET_REST, BOSS_DROP_A, BOSS_DROP_B, PETS, petBonus, KING_SIZE, CASTLE_RANGE, CASTLE_AURA_ATK, CASTLE_AURA_ARM, BOSS_LV_MAX, bossLvMult, ITEM_LV_MAX, dropLv, CAMP_LV_CAP, BOSS_LV_CAP, MINE_LV_CAP, NO_BARRACKS_CAP, BUILDINGS, MINE_LV_MULT, MINE_UP_TIME, mineUpCost, TIER_INFO, SLOT_INFO, unitCost, ringCost, BOT_SLOW, UNIT_LV_MULT, RING_SLOTS, MAX_RINGS, DRAGON_LIMIT, costValue, VALUE, PLAYER_COLORS, ACT,
} from '../shared/balance.js';
const MINE_PROTECT = 0; // s a dead hero's mines stay protected (0 = off since 12/11/2026, was 600)
const MINE_MOVE_R = 12, MINE_MOVE_CD = 60; // tiles from the mine's original spot; s between two moves
const RECALL_TIME = 8; // s, "Về thành"
export const KNIGHT_TP_CD = 15, KNIGHT_TP_R = 30; // knights blink to a boss on an attack order (14/11/2026)
export const PVP_WAR_S = 20, PVP_WAR_ORDER_S = 30; // seconds a PvP war lasts after the last hit / an attack order (14/11/2026)
export const FORMATION_FACING = process.env.SW_FACING !== '0'; // 13/11/2026: marching formation on (classic ring inside an enemy base)
const FORMATION_PACK = 0.6, FORMATION_PACK_MARCH = 0.72; // marching in the field: a little more room between soldiers
import { layoutRings, TYPE_ORDER, RANGED_IN, FRONT_ORDER } from '../shared/formation.js';
import { installBases } from './base.js';
import { installHero } from './hero.js';
import { installQueen } from './queen.js';
import { installEvents } from './events.js';
import { installQuests } from './quest.js';
import { installDefense } from './defense.js';
import { installParty } from './party.js';
import { World } from './world.js';

export const DT = 0.05;
export const UNIT_REGEN_DELAY = 10; // seconds without combat before soldiers start healing
export const UNIT_REGEN_RATE = 0.04; // share of max HP per second (full heal in 25 s)
export const SPEED_MULT = 1.5; // every unit / hero walks 1.5× the design speed
const CELL = 4;
const RANGED_KINDS = new Set(['arrow', 'orb', 'fireball', 'star']);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const dirOf = (dx, dy) => (Math.round((Math.atan2(dy, dx) * 180) / Math.PI / 45 - 2) % 8 + 8) % 8; // 0 = S, clockwise on screen

const PET_OFF = { x: -2.8, y: 1.3 }; // where a pet's battle form stands next to its hero

export class Game {
  /** opts.mode: 'match' (rooms: lobby, 20-min matches, zone) | 'endless' (open world: respawn, no zone, bosses come back) */
  constructor(seed = 20261111, opts = {}) {
    this.mode = opts.mode ?? 'match';
    this.world = opts.world ?? new World(seed);
    if (this.mode === 'endless') this.world = this.world.view(); // structures block tiles in this game only
    this.seed = seed;
    this.t = 0; this.tick = 0;
    this.nextId = 1;
    this.units = new Map();
    this.players = new Map();
    this.nextPid = 1;
    this.projectiles = [];
    this.fires = [];
    this.delayed = []; // [time, fn]
    this.events = [];
    this.notices = []; // {to|null, text, kind}
    this.teams = new Map(); // team key -> {combat, lastCombat, killedSince}
    this.mines = this.world.mines.map((m) => ({ ...m, owner: 0, holdStart: 0, cap: null, guards: new Set(), emptySince: -1e9, alerted: false, rewardTo: 0, changed: true }));
    this.hash = new Map();
    this.items = new Map(); // ground loot: id -> {id, x, y, item, until}
    this.nextItem = 1;
    this.bossSpots = this.findBossSpots();
    this.camps = this.placeCamps();
    this.initBases();
    this.heroProg = new Map(); this.setupKing(); this.setupQueen();
    this.newMatch(1);
    this.rand = mulberry(seed ^ 0x5eed);
  }

  // ------------------------------------------------------------------ stash: a player leaves the open world but keeps everything
  /** take a living player off the map and return everything needed to bring them back exactly as they were */
  stashPlayer(p) {
    const h = this.units.get(p.hero);
    if (!p.alive || !h) return null;
    const d = {
      v: 1, heroType: p.heroType, hero: { hp: h.hp, x: h.x, y: h.y }, inc: this.income(p).inc,
      units: this.armyList(p, false).map((u) => ({ type: u.type, hp: u.hp, buyN: u.buyN, kills: u.kills })),
      res: { ...p.res }, rings: p.rings, mode: p.mode, equip: p.equip ?? {}, bag: p.bag ?? [], score: p.score, stats: p.stats, life: this.t - p.bornAt,
      queue: p.queue.map((q) => ({ type: q.type, left: Math.max(0, q.readyAt - this.t), total: q.total, n: q.n })), buyCounter: p.buyCounter,
      mines: this.mines.filter((m) => m.owner === p.id).map((m) => m.id), skillLeft: Math.max(0, p.skillReadyAt - this.t),
    };
    this.killPlayer(p, null, 'stash');
    for (const id of [...this.units.keys()]) { const u = this.units.get(id); if (u.owner === p.id && !u.garrison) this.units.delete(id); } // mine garrisons stay
    return d;
  }
  /** bring a stashed player back (on the open-world map) */
  unstashPlayer(p, d, keepRes = false) {
    if (!d || p.alive) return false;
    // keepRes: the player stayed in the game while away, so p.res is the truth (raids / finds while away already applied)
    const res0 = keepRes ? { ...p.res } : null;
    p.alive = false; this.spawnPlayer(p, d.heroType);
    if (!p.alive) return false;
    const h = this.units.get(p.hero);
    const pos = d.hero.x != null ? this.world.nearestFree(d.hero.x, d.hero.y, 6) : null;
    if (pos) { h.x = pos.x; h.y = pos.y; }
    Object.assign(p, { res: res0 ?? { ...p.res, ...d.res }, rings: d.rings ?? 3, mode: d.mode ?? 'type', equip: d.equip ?? {}, bag: d.bag ?? [], score: d.score ?? 0, stats: d.stats ?? p.stats, bornAt: this.t - (d.life ?? 0), buyCounter: d.buyCounter ?? 0, skillReadyAt: this.t + (d.skillLeft ?? 0) });
    this.applyEquip(p);
    h.hp = Math.max(1, Math.min(h.maxHp, d.hero.hp));
    for (const q of d.units ?? []) {
      if (!UNITS[q.type]) continue;
      const u = this.addUnit({ owner: p.id, kind: 'unit', type: q.type, x: h.x, y: h.y, st: this.unitStats(q.type, p.heroType, this.unitLv(p.acc, q.type), p.armyGear) });
      u.hp = Math.max(1, Math.min(u.maxHp, q.hp)); u.buyN = q.buyN ?? 0; u.kills = q.kills ?? 0; u.value = costValue(UNITS[q.type].cost);
      p.units.push(u.id);
    }
    p.queue = (d.queue ?? []).filter((q) => UNITS[q.type]).map((q) => ({ type: q.type, readyAt: this.t + q.left, total: q.total, n: q.n }));
    this.relayout(p);
    for (const id of p.units) { const u = this.units.get(id), t = this.slotTarget(p, h, u); u.x = t.x; u.y = t.y; }
    for (const id of d.mines ?? []) { const m = this.mines[id]; if (m && !m.owner && !m.guards.size && this.mineRoom(p.id, m.type)) { m.owner = p.id; m.holdStart = this.t; m.changed = true; this.spawnGarrison(m, p); } }
    // the map changed while they were away: they get the same kinds of mines back, the nearest free ones to where they stand
    // (entries are a type or { type, lv }: the mine level comes along too, 12/11/2026)
    for (const mt of d.mineTypes ?? []) {
      const type = typeof mt === 'string' ? mt : mt.type, lv = typeof mt === 'string' ? 1 : mt.lv ?? 1;
      if (!this.mineRoom(p.id, type)) continue;
      let best = null, bd = Infinity;
      for (const m of this.mines) { if (m.type !== type || m.owner) continue; const dd = Math.hypot(m.x - h.x, m.y - h.y); if (dd < bd) { bd = dd; best = m; } }
      if (!best) continue;
      if (lv > (best.lv ?? 1)) best.lv = lv;
      for (const id of best.guards) this.units.delete(id);
      best.guards = new Set(); best.cap = null;
      best.owner = p.id; best.holdStart = this.t; best.changed = true; this.spawnGarrison(best, p);
    }
    return true;
  }

  // ------------------------------------------------------------------ save / restore (server restarts keep the world)
  serialize() {
    const r1 = (v) => Math.round(v * 100) / 100;
    const unit = (u) => ({ id: u.id, owner: u.owner, kind: u.kind, type: u.type, x: r1(u.x), y: r1(u.y), hp: r1(u.hp), maxHp: u.maxHp, dir: u.dir, buyN: u.buyN, value: u.value, kills: u.kills, mine: u.mine, camp: u.camp, homeX: u.homeX, homeY: u.homeY, garrison: u.garrison, boss: u.boss, base: u.base, atk: u.atk, armor: u.armor, lv: u.boss ? u.lv : undefined });
    const P = ['id', 'name', 'color', 'bot', 'heroType', 'alive', 'res', 'rings', 'mode', 'shieldUntil', 'bornAt', 'skillReadyAt', 'skillUntil', 'score', 'best', 'stats', 'deathInfo', 'buyCounter', 'hero', 'units', 'queue', 'equip', 'bag', 'speedBonus', 'match', 'wins', 'diedIn', 'heroChangeAt', 'hold', 'stowed', 'away', 'keptRes', 'keptGear', 'party', 'glow'];
    return {
      v: 1, seed: this.seed, t: this.t, tick: this.tick, nextId: this.nextId, nextPid: this.nextPid,
      players: [...this.players.values()].map((p) => Object.fromEntries(P.map((k) => [k, p[k]]))),
      units: [...this.units.values()].filter((u) => !u.dead && u.kind !== 'build' && u.kind !== 'pet' && !u.ev && !u.summon && !u.defender).map(unit), // pet battle forms and event monsters are not saved
      mines: this.mines.map((m) => ({ owner: m.owner, holdStart: m.holdStart, emptySince: Math.max(-1e6, m.emptySince), protectUntil: m.protectUntil > this.t ? m.protectUntil : undefined, lv: m.lv > 1 ? m.lv : undefined, upIn: m.upAt ? m.upAt - this.t : undefined, upTotal: m.upAt ? m.upTotal : undefined, upBy: m.upAt ? m.upBy : undefined, upOwner: m.upAt ? m.upOwner : undefined, upCost: m.upAt ? m.upCost : undefined, ...(m.moved ? { mtx: m.tx, mty: m.ty } : {}) })),
      camps: this.camps.map((c) => ({ emptySince: Math.max(-1e6, c.emptySince) })),
      match: this.match, items: [...this.items.values()], nextItem: this.nextItem, mode: this.mode, bossDead: this.bossDead, garrisonV: 4, campsV: 3, botNerfV: 1, botPurgeV: 1, cleared: this.mode === 'endless' ? [...this.cleared] : undefined, mapW: this.world.W, bases: this.mode === 'endless' ? this.serializeBases() : undefined, king: this.king ? { tx: this.king.tx, ty: this.king.ty } : undefined, evSlot: this.evSlot, queen: this.queen ? { tx: this.queen.tx, ty: this.queen.ty } : undefined, palaceV: 2, heroProg: this.heroProg?.size ? Object.fromEntries(this.heroProg) : undefined, questProg: this.questProg?.size ? Object.fromEntries(this.questProg) : undefined, parties: this.parties?.size ? [...this.parties.values()] : undefined, nextParty: this.nextParty,
    };
  }
  restore(d) {
    if (!d || d.v !== 1 || d.seed !== this.seed || (d.mapW ?? 256) !== this.world.W) return false;
    // botPurgeV 1 (17/11/2026): NPC lords removed from the open world (700-900 soldiers each slowed the server). Once: drop
    // the bot players (their soldiers and mine garrisons are skipped below because the owner is gone), their bases and mines
    if (this.mode === 'endless' && !d.botPurgeV) {
      const gone = new Set(d.players.filter((q) => q.bot).map((q) => q.id));
      d.players = d.players.filter((q) => !q.bot);
      d.bases = (d.bases ?? []).filter((b) => !String(b.key).startsWith('npc:'));
      for (const m of d.mines) if (gone.has(m.owner)) { m.owner = 0; m.emptySince = d.t; delete m.holdStart; }
      console.log(`botPurge: removed ${gone.size} NPC lords and their bases`);
    }
    this.t = d.t; this.tick = d.tick;
    this.units.clear(); this.players.clear(); this.teams.clear();
    for (const m of this.mines) { m.guards = new Set(); m.cap = null; m.changed = true; }
    for (const c of this.camps) { c.guards = new Set(); c.emptySince = -1e9; }
    this.nextPid = 1e9; // temporary ids must never collide with the saved ids
    for (const q of d.players) {
      const p = this.addPlayer(q.name, { bot: q.bot });
      this.players.delete(p.id);
      Object.assign(p, q, { connected: q.bot, leftAt: 0, path: null, chase: 0, dmgBy: new Map(), layout: new Map() });
      this.players.set(p.id, p);
    }
    for (const q of d.units) {
      const p = this.players.get(q.owner);
      const st = q.boss ? BOSSES[q.type] : q.garrison ? this.unitStats(q.type, p?.heroType, this.unitLv(p?.acc, q.type), p?.armyGear) : q.kind === 'guard' ? GUARDS[q.type] : q.kind === 'hero' ? heroStats(q.type) : this.unitStats(q.type, p?.heroType, this.unitLv(p?.acc, q.type), p?.armyGear);
      if (!st || (q.owner && !p)) continue;
      if (q.camp != null && (d.campsV !== 3 || !this.camps[q.camp])) continue; // camps were redesigned: old camp monsters go, new ones spawn
      if (q.kind === 'pet' || (q.kind === 'guard' && !q.boss && q.camp == null && !this.mines[q.mine])) continue; // world-event monsters / pet battle forms (saved by older builds) are not restored
      this.nextId = q.id;
      const u = this.addUnit({ owner: q.owner, kind: q.kind, type: q.type, x: q.x, y: q.y, st, mine: q.kind === 'guard' && !q.boss && q.camp == null ? this.mines[q.mine] : null, team: q.boss ? 'b' + q.type : q.camp != null ? 'c' + q.camp : null });
      Object.assign(u, { hp: q.hp, maxHp: q.maxHp, dir: q.dir, buyN: q.buyN, value: q.value, kills: q.kills, homeX: q.homeX, homeY: q.homeY });
      if (q.base) Object.assign(u, { base: q.base, atk: q.atk ?? u.atk, armor: q.armor ?? u.armor });
      if (q.boss) { const lv = q.lv ?? 1, m = bossLvMult(lv); Object.assign(u, { boss: q.type, bossHome: this.bossSpots[q.type], body: 2.0, nextSpecial: 0, lv, lvMult: m, atk: BOSSES[q.type].atk * m }); if (q.lv == null) { u.maxHp = Math.round(q.maxHp * m); u.hp = Math.round(q.hp * m); } } // saves from before boss levels: level 1
      else if (q.camp != null) { u.camp = q.camp; u.atkK = campAtkK(this.camps[q.camp].level); u.atk = GUARDS[q.type].atk * u.atkK; this.camps[q.camp].guards.add(u.id); }
      else if (q.kind === 'guard') { this.mines[q.mine].guards.add(u.id); if (q.garrison) u.garrison = true; }
    }
    this.nextId = Math.max(d.nextId, ...[...this.units.keys()].map((k) => k + 1));
    this.nextPid = d.nextPid;
    d.mines.forEach((q, i) => { const { upIn, mtx, mty, ...rest } = q; Object.assign(this.mines[i], rest); if (upIn != null) this.mines[i].upAt = this.t + upIn; if (mtx != null) this.placeMine(this.mines[i], mtx, mty, false); }); // guards were saved at their new posts
    if (this.mode === 'endless') { this.restoreBases(d.bases); for (const i of d.cleared ?? []) { this.cleared.add(i); this.world.block[i] = 0; } }
    if (this.mode === 'endless') {
      this.heroProg = new Map(Object.entries(d.heroProg ?? {}));
      this.questProg = new Map(Object.entries(d.questProg ?? {}));
      this.parties = new Map((d.parties ?? []).map((pt) => [pt.id, pt])); this.nextParty = d.nextParty ?? 0;
      // the Northern King keeps his palace; a world saved before him gets one away from the existing bases
      // 13/11/2026 palaces ×4: saves from before keep the same centre (top-left moves out by the size difference)
      const grow = (q) => (q && !(d.palaceV >= 2) ? { tx: Math.max(1, Math.round(q.tx + 5 - KING_SIZE[0] / 2)), ty: Math.max(1, Math.round(q.ty + 3.5 - KING_SIZE[1] / 2)) } : q);
      if (d.king) d.king = grow(d.king); if (d.queen) d.queen = grow(d.queen); d.palaceV = 2; // once, even if the same save is restored twice
      const want = d.king ?? (this.kingNearBase() ? this.findKing() : null);
      if (want && (want.tx !== this.king?.tx || want.ty !== this.king?.ty)) { this.unblockKing(); this.setupKing(want); }
      // Nữ hoàng Sa mạc (13/11/2026): saved spot, or a fresh one in the south (picked after the bases are back)
      this.evSlot = d.evSlot ?? null; // world events: the 2-hour slot already used
      const wq = d.queen ?? this.findQueen();
      if (wq.tx !== this.queen?.tx || wq.ty !== this.queen?.ty) { this.unblockQueen(); this.setupQueen(wq); }
    }
    if (d.camps && d.campsV === 3) d.camps.forEach((q, i) => { if (this.camps[i]) this.camps[i].emptySince = q.emptySince; });
    else for (const c of this.camps) this.spawnCamp(c); // older saves: camps did not exist yet
    this.bossDead = d.bossDead ?? {};
    if (d.match) { this.match = d.match; this.items = new Map((d.items ?? []).map((g) => [g.id, g])); this.nextItem = d.nextItem ?? 1; }
    else { this.match = { n: 1, start: this.t, phase: 'run', endAt: 0, winner: null, results: null, circles: [{ x: this.world.W / 2, y: this.world.H / 2, r: ZONE_START_R }] }; this.spawnBosses(); }
    for (const p of this.players.values()) {
      p.units = (p.units ?? []).filter((id) => this.units.has(id));
      if (p.alive && !this.units.has(p.hero)) p.alive = false;
      if (!p.stowed?.length && !(d.bases ?? []).some((b) => b.key === p.acc && b.garrison?.length)) { p.stowed = []; p.hold = false; } // older saves: "hold" used to mean a tight formation
      if (p.alive) { this.relayout(p); this.applyEquip(p); }
      // 14/11/2026: soldiers / mine garrisons were rebuilt before the bases (Học viện levels) were back → all level 1 after a
      // restart. Re-stat them now that the bases are restored (level, HP, ATK, armour).
      if (this.mode === 'endless') this.applyArmyGear(p);
    }
    // botNerfV 1 (11/11/2026): NPC lords played 24/7 and got far ahead of people; keep 25 % of their army (same mix),
    // stowed / base soldiers and resources once, then they earn 25 % and build / summon 4× slower (BOT_RES, BOT_SLOW)
    if (this.mode === 'endless' && !d.botNerfV) for (const p of this.players.values()) {
      if (!p.bot) continue;
      const keepEvery = (list) => { const keep = Math.round(list.length * 0.25), step = list.length / Math.max(1, keep); return new Set(Array.from({ length: keep }, (_, k) => list[Math.floor(k * step)])); };
      const kept = keepEvery(p.units);
      for (const id of p.units) if (!kept.has(id)) this.units.delete(id);
      p.units = p.units.filter((id) => kept.has(id));
      if (p.stowed?.length) { const k = keepEvery(p.stowed); p.stowed = p.stowed.filter((g) => k.has(g)); }
      const b = this.baseOf(p); if (b?.garrison?.length) { const k = keepEvery(b.garrison); b.garrison = b.garrison.filter((g) => k.has(g)); }
      p.queue = [];
      for (const r of Object.keys(p.res)) p.res[r] = Math.floor(p.res[r] * 0.25);
      if (p.alive) this.relayout(p);
    }
    // garrisonV 2 → 3: garrisons were 75 % of the army; trim each one to 50 % keeping its mix (it stays a snapshot of capture time)
    // garrisonV 3 → 4: 50 % → 20 % (factor 0.4); still a snapshot of capture time
    const trim = d.garrisonV === 2 ? 0.2 / 0.75 : d.garrisonV === 3 ? 0.2 / 0.5 : 1;
    if (trim < 1) for (const m of this.mines) {
      const g = [...m.guards].map((id) => this.units.get(id)).filter((u) => u?.garrison);
      if (!g.length) continue;
      const keep = Math.max(1, Math.round(g.length * trim)), step = g.length / keep;
      const kept = new Set(Array.from({ length: keep }, (_, k) => g[Math.floor(k * step)]));
      for (const u of g) if (!kept.has(u)) { this.units.delete(u.id); m.guards.delete(u.id); }
    }
    for (const m of this.mines) { const o = this.players.get(m.owner); if (o?.alive && !m.guards.size) this.spawnGarrison(m, o); }
    this.enforceMineCaps(); // 12/11/2026: per-player mine caps (MINE_CAP)
    // gear v2: convert every saved item (worn, bag, kept gear, chests, on the ground)
    // item levels (13/11/2026): saved items get their owner's hero level (ground items: 1)
    const accLv = (acc) => this.heroProg?.get(acc)?.lv ?? 1;
    for (const p of this.players.values()) for (const it of [...Object.values(p.equip ?? {}), ...(p.bag ?? []), ...Object.values(p.keptGear?.equip ?? {}), ...(p.keptGear?.bag ?? [])]) restatItem(it, accLv(p.acc));
    for (const g of this.items.values()) restatItem(g.item, 1);
    for (const b of this.bases?.values() ?? []) for (const it of b.chest ?? []) restatItem(it, accLv(b.key));
    return true;
  }

  // ------------------------------------------------------------------ players
  addPlayer(name, opts = {}) {
    const id = this.nextPid++;
    const used = new Set([...this.players.values()].map((p) => p.color));
    const color = PLAYER_COLORS.find((c) => !used.has(c)) ?? PLAYER_COLORS[id % PLAYER_COLORS.length];
    const p = {
      id, name, acc: (opts.bot ? 'npc:' : '') + String(name).toLowerCase(), color, bot: !!opts.bot, hero: 0, heroType: opts.heroType ?? 'thach-lam', alive: false, res: {}, rings: 3, units: [], queue: [],
      shieldUntil: 0, bornAt: 0, mode: 'buy', skillReadyAt: 0, skillUntil: 0, path: null, chase: 0, goalMine: -1, view: null,
      stats: null, score: 0, best: opts.best ?? 0, deathInfo: null, buyCounter: 0, lastCombatT: -99, dmgBy: new Map(), connected: true, leftAt: 0, order: null,
    };
    this.players.set(id, p);
    return p;
  }
  removePlayer(p) { this.partyLeave?.(p, true); if (p.alive) this.killPlayer(p, null, 'left'); else this.releaseMines(p); this.players.delete(p.id); }
  /** mines of one kind held by player pid */
  mineCount(pid, type) { let n = 0; for (const m of this.mines) if (m.owner === pid && m.type === type) n++; return n; }
  /** player pid may take one more mine of this kind (open world only) */
  mineRoom(pid, type) { return this.mode !== 'endless' || MINE_CAP[type] == null || this.mineCount(pid, type) < this.mineCapOf(pid, type); }
  /** free every mine above MINE_CAP (lowest level, most recently taken first): neutral again, guards come back at once */
  enforceMineCaps() {
    if (this.mode !== 'endless') return 0;
    const by = new Map();
    for (const m of this.mines) if (m.owner) { const k = m.owner + ':' + m.type; if (!by.has(k)) by.set(k, []); by.get(k).push(m); }
    const lost = new Map();
    for (const list of by.values()) {
      const cap = this.mineCapOf(list[0].owner, list[0].type); if (cap == null || list.length <= cap) continue; // + slots bought from the Desert Queen
      // upgraded mines (and ones being upgraded) are kept first: free the lowest level, then the most recently taken
      const lvOf = (m) => (m.lv ?? 1) + (m.upAt ? 0.5 : 0);
      list.sort((a, b) => lvOf(a) - lvOf(b) || b.holdStart - a.holdStart);
      for (const m of list.slice(0, list.length - cap)) {
        const o = m.owner, l = lost.get(o) ?? {};
        l[m.type] = (l[m.type] ?? 0) + 1; lost.set(o, l);
        m.owner = 0; m.emptySince = -1e9; m.cap = null; m.changed = true; this.clearGarrison(m);
      }
    }
    for (const [o, l] of lost) {
      const p = this.players.get(o), txt = Object.entries(l).map(([t, n]) => `${n} ${RES_INFO[t].mine}`).join(', ');
      console.log(`mine cap: ${p?.name ?? o} freed ${txt}`);
      if (p) this.notice(p.id, `⛏ Giới hạn mỏ mỗi người: đã trả lại ${txt} cho người chơi khác`, 'warn');
    }
    return lost.size;
  }
  releaseMines(p) { for (const m of this.mines) if (m.owner === p.id) { m.owner = 0; m.emptySince = this.t; m.cap = null; m.changed = true; this.clearGarrison(m); } }

  canJoin(p) { if (this.mode === 'endless') return true; return this.match.phase === 'run' && this.t - this.match.start < JOIN_WINDOW && !(p && p.diedIn === this.match.n); }
  spawnPlayer(p, heroType) {
    if (p.alive) return;
    if (!this.canJoin(p)) {
      if (p.diedIn === this.match.n) this.notice(p.id, 'Bạn đã bị hạ trong ván này. Xem tiếp đến hết ván rồi bắt đầu ván mới.', 'err');
      else if (this.match.phase === 'run') this.notice(p.id, `Ván #${this.match.n} đã đóng cổng. Chờ ván sau ở hàng chờ.`, 'err');
      return;
    }
    p.heroType = HEROES[heroType] ? heroType : 'thach-lam';
    const sp = (this.mode === 'endless' && this.spawnPointFor(p)) || this.pickSpawn();
    const st = heroStats(p.heroType);
    const h = this.addUnit({ owner: p.id, kind: 'hero', type: p.heroType, x: sp.x, y: sp.y, st });
    h.base = { hp: h.maxHp, atk: h.atk, armor: h.armor, cd: h.cd };
    p.equip = {}; p.bag = []; p.speedBonus = 0; p.match = this.match.n;
    if (p.keptGear && this.mode === 'endless') { p.equip = p.keptGear.equip ?? {}; p.bag = p.keptGear.bag ?? []; }
    p.keptGear = null;
    if (!p.glow && this.bases) p.glow = this.baseOf(p)?.glow ?? null; // the outline colour is kept with the base too
    p.hero = h.id; p.alive = true; p.units = []; p.stowed = []; p.queue = []; p.rings = 3;
    if (this.heroProgOf(p)) { this.applyEquip(p); h.hp = h.maxHp; }
    p.hold = !!(this.bases && this.baseOf(p)?.garrison.length); // soldiers left in the base: C brings them out
    // NPC lords in the open world start a little richer so they can found a base (they die more than players)
    const start = p.bot && this.mode === 'endless' ? { iron: 500, coal: 200 } : START_RES;
    p.res = Object.fromEntries(RES.map((r) => [r, Math.max(start[r] ?? 0, Math.floor(p.keptRes?.[r] ?? 0))]));
    if (p.keptRes && Object.values(p.keptRes).some((v) => v >= 1)) this.notice(p.id, `Kho giữ lại: ${RES.filter((r) => p.keptRes[r] >= 1).map((r) => `${Math.floor(p.keptRes[r])} ${RES_INFO[r].name}`).join(', ')}`, 'ok');
    p.keptRes = null;
    p.shieldUntil = this.t + SHIELD_SECONDS; p.bornAt = this.t; p.skillReadyAt = this.t; p.skillUntil = 0;
    p.path = null; p.chase = 0; p.goalMine = -1; p.mode = 'type'; p.layout = new Map(); p.score = 0; p.dmgBy = new Map(); p.deathInfo = null;
    p.stats = { bestMines: 0, bought: 0, killed: 0 };
    this.team(p.id).combat = false;
    this.notice(null, `${p.name} xuất trận (${HEROES[p.heroType].name})`, 'sys');
  }
  pickSpawn() {
    const heroes = [...this.players.values()].filter((p) => p.alive).map((p) => this.units.get(p.hero)).filter(Boolean);
    let best = this.world.spawns[0], bd = -1;
    for (const s of this.world.spawns) {
      const d = heroes.length ? Math.min(...heroes.map((h) => dist(h, s))) : 1000 + this.rand() * 100;
      if (d > bd) { bd = d; best = s; }
    }
    return best;
  }
  team(key) { let t = this.teams.get(key); if (!t) { t = { combat: false, lastCombat: -99, kills: 0 }; this.teams.set(key, t); } return t; }
  notice(to, text, kind = 'sys', extra = {}) { this.notices.push({ to, text, kind, ...extra }); }

  // ------------------------------------------------------------------ units
  addUnit({ owner, kind, type, x, y, st, mine = null, slots = [], team = null }) {
    const u = {
      id: this.nextId++, owner, kind, type, x, y, team: team ?? (kind === 'guard' ? 'g' + mine.id : owner),
      cls: st.cls, hp: st.hp, maxHp: st.hp, atk: st.atk, cd: st.cd, range: st.range, minRange: st.minRange ?? 0, armor: st.armor, speed: st.speed * SPEED_MULT, cap: st.cap ?? 1,
      ranged: st.ranged ?? null, aoe: st.aoe ?? 0, pierce: !!st.pierce, fly: !!st.fly, charge: !!st.charge, breath: !!st.breath, slow: !!st.slow, stomp: !!st.stomp, burn: st.burn ?? null,
      slots, dir: 0, act: ACT.idle, actT: 0, foe: 0, attackers: new Set(), nextAtk: 0, runDist: 0, stunUntil: 0, slowUntil: 0, firstHit: true,
      mine: mine ? mine.id : -1, homeX: x, homeY: y, dead: false, deathT: 0, rout: false, ghostUntil: 0, stuck: 0, value: 0, kills: 0, buyN: 0, moving: false, nextSpecial: 0,
      lastHurt: -99, lv: st.lv ?? 1, ls: st.ls ?? 0, dodge: st.dodge ?? 0,
    };
    this.units.set(u.id, u);
    return u;
  }
  /** researched level of a unit for an account (open world, Học viện); 1 elsewhere */
  unitLv(acc, type) { return this.mode === 'endless' && acc ? this.bases?.get(acc)?.unitLv?.[type] ?? 1 : 1; }
  unitStats(type, heroType, lv = 1, gear = null) {
    const b = UNITS[type], s = { ...b, lv };
    if (lv > 1) { const m = UNIT_LV_MULT[lv - 1] ?? 1; s.hp *= m; s.atk *= m; }
    if (heroType === 'thach-lam' && (b.cls === 'inf' || b.cls === 'spear')) { s.hp *= 1.15; s.atk *= 1.1; }
    if (heroType === 'phong-vu' && b.cls === 'cav') s.atk *= 1.15;
    if (heroType === 'lam-nguyet' && (b.cls === 'ranged' || b.cls === 'magic')) { s.range += 1; s.atk *= 1.15; }
    if (heroType === 'hoa-ky') { if (b.cls === 'fly') s.hp *= 1.15; if (b.cls === 'inf') s.atk *= 0.9; }
    if (gear) { s.hp *= 1 + (gear.hp ?? 0); s.atk *= 1 + (gear.atk ?? 0); s.cd /= 1 + (gear.as ?? 0); s.armor = Math.min(ARMOR_CAP, (s.armor ?? 0) + (gear.armor ?? 0)); s.ls = gear.ls ?? 0; s.dodge = gear.dg ?? 0; }
    s.hp = Math.round(s.hp);
    return s;
  }
  /** a captured mine gets a free garrison in the owner's colours: a copy of 20 % of their army at capture time (max 30) */
  /** rebuild the guard posts of my mines from my current army (id < 0: every mine I hold). Not while the post is
   *  fighting or being captured, and once per 5 minutes per mine (12/11/2026) */
  garrisonRefresh(p, id) {
    const list = id >= 0 ? [this.mines[id]] : this.mines.filter((m) => m.owner === p.id);
    let n = 0, busy = 0, wait = 0, soon = Infinity;
    for (const m of list) {
      if (!m || m.owner !== p.id) continue;
      if (m.cap || [...m.guards].some((g) => this.t - (this.units.get(g)?.lastHurt ?? -1e9) < 15)) { busy++; continue; }
      if (this.t < (m.refAt ?? 0)) { wait++; soon = Math.min(soon, m.refAt - this.t); continue; }
      m.refAt = this.t + 300; this.spawnGarrison(m, p); n++;
    }
    const why = [busy ? `${busy} mỏ đang giao tranh` : '', wait ? `${wait} mỏ vừa cập nhật (chờ ${Math.ceil(soon / 60)} phút)` : ''].filter(Boolean).join(', ');
    if (n) this.notice(p.id, `🛡 Đã cập nhật lính canh ${n} mỏ theo đội quân hiện tại${why ? ` · bỏ qua: ${why}` : ''}`, 'ok');
    else this.notice(p.id, why ? `Chưa cập nhật được: ${why}` : 'Bạn chưa giữ mỏ nào', 'err');
  }
  spawnGarrison(m, p) {
    this.clearGarrison(m);
    const count = {};
    for (const u of this.armyList(p)) count[u.type] = (count[u.type] ?? 0) + 1;
    let list = [];
    for (const [type, n] of Object.entries(count)) for (let k = 0; k < Math.round(n * GARRISON_SHARE); k++) list.push(type);
    if (!list.length) for (const [type, n] of GARRISON[m.type] ?? []) for (let k = 0; k < n; k++) list.push(type);
    if (list.length > GARRISON_MAX) { // keep the mix: take evenly across the list
      const step = list.length / GARRISON_MAX; list = Array.from({ length: GARRISON_MAX }, (_, k) => list[Math.floor(k * step)]);
    }
    // rings around the mine: ranged soldiers inside, the rest outside
    list.sort((a, b) => (UNITS[a].ranged ? 0 : 1) - (UNITS[b].ranged ? 0 : 1));
    const R0 = CAPTURE_R(m.type) - 0.4;
    list.forEach((type, k) => {
      const ring = Math.floor(k / 10), inRing = Math.min(10, list.length - ring * 10);
      const a = ((k % 10) / inRing) * Math.PI * 2 + 0.9 + ring * 0.3, R = R0 + ring * 1.4;
      const pos = this.world.nearestFree(m.x + Math.cos(a) * R, m.y + Math.sin(a) * R, 4) ?? { x: m.x + Math.cos(a) * R, y: m.y + Math.sin(a) * R };
      const u = this.addUnit({ owner: p.id, kind: 'guard', type, x: pos.x, y: pos.y, st: this.unitStats(type, p.heroType, this.unitLv(p.acc, type), p.armyGear), mine: m });
      u.garrison = true; u.dir = dirOf(Math.cos(a), Math.sin(a)); u.value = Math.round(costValue(UNITS[type].cost) / 2);
      m.guards.add(u.id);
    });
    m.changed = true;
  }
  /** the garrison leaves when the mine changes hands or its owner leaves */
  clearGarrison(m) {
    for (const id of [...m.guards]) { const u = this.units.get(id); if (u?.garrison) { this.unpair(u); this.units.delete(id); m.guards.delete(id); } }
  }
  // ---- monster camps (farming equipment)
  placeCamps() {
    const W = this.world, rng = mulberry(this.seed ^ 0xca39), out = [];
    const open = (x, y) => { let n = 0; for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) if (i * i + j * j <= 9 && W.walkable(x + i, y + j)) n++; return n; };
    const far = (x, y) => out.every((c) => Math.hypot(c.x - x, c.y - y) >= 14) && this.mines.every((m) => Math.hypot(m.x - x, m.y - y) >= 9)
      && Object.values(this.bossSpots).every((b) => Math.hypot(b.x - x, b.y - y) >= 12) && W.spawns.every((s) => Math.hypot(s.x - x, s.y - y) >= 14);
    for (const [lv, C] of Object.entries(CAMPS)) {
      let placed = 0, tries = 0;
      const want = Math.round(C.n * (W.W / 256) ** 2); // counts in balance.js are for a 256 map
      while (placed < want && tries++ < 6000 * (W.W / 256) ** 2) {
        const half = W.W / 2, a = rng() * Math.PI * 2, r = (C.r[0] + rng() * (C.r[1] - C.r[0])) * half;
        const x = Math.floor(half + Math.cos(a) * r) + 0.5, y = Math.floor(half + Math.sin(a) * r) + 0.5;
        if (!W.walkable(x, y) || open(x, y) < 24 || !far(x, y)) continue;
        out.push({ id: out.length, level: +lv, x, y, guards: new Set(), emptySince: -1e9 });
        placed++;
      }
    }
    return out;
  }
  spawnCamp(c) {
    const list = [];
    for (const [g, n] of CAMPS[c.level].pack) for (let k = 0; k < (n > 1 ? n * CAMP_PACK_MULT : n); k++) list.push(g);
    list.forEach((g, k) => {
      // a sunflower spiral: big monsters first (centre), spacing by size (a bit tighter since the packs are ×3)
      const a = k * 2.39996, r = list.length > 1 ? (c.level >= 7 ? 1.35 : c.level >= 5 ? 1.1 : 0.8) * 0.8 * Math.sqrt(k + 0.3) : 0;
      const pos = this.world.nearestFree(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, 3) ?? c;
      const u = this.addUnit({ owner: 0, kind: 'guard', type: g, x: pos.x, y: pos.y, st: { ...GUARDS[g], atk: GUARDS[g].atk * campAtkK(c.level) }, team: 'c' + c.id }); u.atkK = campAtkK(c.level);
      u.camp = c.id; u.dir = dirOf(Math.cos(a), Math.sin(a)); u.value = Math.round(GUARDS[g].hp / 3);
      c.guards.add(u.id);
    });
  }
  spawnGuards(m) {
    const set = GUARD_SETS[m.type]; if (!set) return;
    const list = [];
    for (const [g, n] of set.list) for (let k = 0; k < n; k++) list.push(g);
    const R = CAPTURE_R(m.type) - 0.3;
    list.forEach((g, k) => {
      const a = (k / list.length) * Math.PI * 2 + 0.4;
      const r = g === 'golem' ? R - 0.6 : R;
      const pos = this.world.nearestFree(m.x + Math.cos(a) * r, m.y + Math.sin(a) * r, 4) ?? { x: m.x + Math.cos(a) * r, y: m.y + Math.sin(a) * r };
      const u = this.addUnit({ owner: 0, kind: 'guard', type: g, x: pos.x, y: pos.y, st: GUARDS[g], mine: m });
      u.dir = dirOf(Math.cos(a), Math.sin(a));
      u.value = Math.round(GUARDS[g].hp / 3);
      m.guards.add(u.id);
    });
    m.changed = true;
  }

  // ------------------------------------------------------------------ commands
  cmd(p, c) {
    if (c.t === 'spawn') return this.spawnPlayer(p, c.hero);
    if (!p.alive) return;
    const h = this.units.get(p.hero); if (!h) return;
    switch (c.t) {
      case 'move': { p.autoPauseUntil = this.t + 10; p.autoWalk = false; p.upGoal = null; p.chase = 0; p.chaseGoal = 0; p.goalMine = -1; this.orderMove(p, h, +c.x, +c.y); break; }
      case 'mine': {
        const m = this.mines[c.id | 0]; if (!m) return;
        p.autoPauseUntil = this.t + 10; p.autoWalk = false; p.upGoal = null; p.chase = 0; p.goalMine = m.id;
        if (m.guards.size && !m.owner) this.provoke(p, 'g' + m.id); // capturing a guarded mine = attacking its guards
        if (m.owner && m.owner !== p.id && !this.sameParty?.(p.id, m.owner) && !p.afkSafe) this.war(p.id, m.owner, PVP_WAR_ORDER_S); // 14/11/2026: an order on someone's mine = war with its owner (garrison included)
        const spot = this.captureSpot(m, h);
        if (spot) this.orderMove(p, h, spot.x, spot.y);
        break;
      }
      case 'chase': {
        const e = this.units.get(c.id | 0);
        if (!e || e.dead || e.team === h.team) return;
        if (e.baseKey && this.partyOf?.(p)) return this.notice(p.id, 'Đang trong tổ đội không đánh được căn cứ người khác: rời tổ đội trước', 'err');
        if (e.owner && e.owner !== p.id && (e.bossSafe || h.bossSafe)) return this.notice(p.id, '👑 Cơ chế bảo vệ người chơi khi đánh boss thế giới: quanh boss đang giao chiến không đánh được người chơi khác', 'err');
        if ((e.owner && e.owner !== p.id) || e.baseKey) {
          if (p.afkSafe) return this.notice(p.id, '🛡 Cơ chế bảo vệ người chơi treo máy: đang bật Tự động đánh nên không đánh được người chơi khác. Tắt tự động (Cài đặt) để đánh', 'err');
          const ep = e.owner && this.players.get(e.owner);
          if (ep?.afkSafe && (e.kind === 'hero' || e.kind === 'unit')) return this.notice(p.id, `🛡 ${ep.name} đang treo máy (cơ chế bảo vệ người chơi treo máy): không đánh được`, 'err');
        }
        if (e.kind !== 'guard') p.shieldUntil = Math.min(p.shieldUntil, this.t);
        if (e.owner && e.owner !== p.id) this.war(p.id, e.owner, PVP_WAR_ORDER_S); // attack order on a player: war (both sides fight)
        if (e.baseKey) this.warBase(p.id, e.baseKey, PVP_WAR_ORDER_S); // attack order on a base: war with the base and its owner
        // 14/11/2026: an attack order on a boss sends the Hiệp sĩ (knights) in first: they blink next to it so the boss
        // locks onto them instead of the archers / mages (once every KNIGHT_TP_CD s, knights within KNIGHT_TP_R tiles)
        if ((e.boss || e.ev) && !(p.knightTpAt > this.t)) {
          const ks = p.units.map((id) => this.units.get(id)).filter((u) => u && !u.dead && u.type === 'hiep-si' && !u.garrison && dist(u, e) <= KNIGHT_TP_R && dist(u, e) > 2.5);
          if (ks.length) {
            p.knightTpAt = this.t + KNIGHT_TP_CD;
            const r0 = (e.body ?? 1) * 0.8 + 1.1, a0 = Math.atan2(h.y - e.y, h.x - e.x);
            ks.forEach((u, k) => {
              const a = a0 + (k - (ks.length - 1) / 2) * Math.min(0.5, 2.6 / ks.length), f = this.world.nearestFree(e.x + Math.cos(a) * r0, e.y + Math.sin(a) * r0, 3);
              if (!f) return;
              this.events.push({ k: 'summon', x: u.x, y: u.y, id: u.id });
              this.unpair(u); u.x = f.x; u.y = f.y; u.path = null; u.dir = dirOf(e.x - u.x, e.y - u.y);
              this.events.push({ k: 'summon', x: u.x, y: u.y, id: u.id });
              if (this.hostile(u, e) && e.attackers.size < (e.cap ?? 99)) { u.foe = e.id; e.attackers.add(u.id); }
            });
            this.engage(h.team); this.engage(e.team);
            const near = ks.filter((u) => dist(u, e) < r0 + 1.5); if (near.length && (!e.foe || !this.units.get(e.foe) || this.units.get(e.foe).type !== 'hiep-si')) { if (e.foe) this.unpair(e); e.foe = near[0].id; near[0].attackers.add(e.id); }
            this.notice(p.id, `🛡 ${ks.length} Hiệp sĩ dịch chuyển lên đỡ đòn boss`, 'ok');
          }
        }
        this.provoke(p, e.team);
        p.autoPauseUntil = this.t + 10; p.autoWalk = false; p.upGoal = null; p.chase = e.id; p.chaseGoal = 0; p.breach = 0; p.goalMine = -1; p.repathAt = 0;
        break;
      }
      case 'stop': p.autoPauseUntil = this.t + 10; p.autoWalk = false; p.upGoal = null; p.chase = 0; p.chaseGoal = 0; p.goalMine = -1; p.path = null; break;
      case 'changehero': {
        // switch the main character in place: army, resources, mines and items stay; hero passives apply at once
        const ht = String(c.hero);
        if (!HEROES[ht] || ht === p.heroType) return;
        if (this.team(p.id).combat) { this.notice(p.id, 'Đang giao tranh, chưa đổi nhân vật được', 'err'); return; }
        if ((p.heroChangeAt ?? 0) > this.t) { this.notice(p.id, `Đổi nhân vật lại sau ${Math.ceil(p.heroChangeAt - this.t)} giây`, 'err'); return; }
        const st = heroStats(ht), frac = h.hp / h.maxHp;
        p.heroType = ht; h.type = ht;
        Object.assign(h, { cls: st.cls, atk: st.atk, cd: st.cd, range: st.range, armor: st.armor, speed: st.speed * SPEED_MULT, cap: st.cap ?? 3, ranged: st.ranged ?? null, aoe: st.aoe ?? 0, pierce: !!st.pierce, maxHp: st.hp });
        h.base = { hp: st.hp, atk: st.atk, armor: st.armor, cd: st.cd };
        h.hp = st.hp * frac;
        this.applyEquip(p);
        for (const id of p.units) {
          const u = this.units.get(id); if (!u || u.dead) continue;
          const s2 = this.unitStats(u.type, ht, this.unitLv(p.acc, u.type), p.armyGear), f = u.hp / u.maxHp;
          Object.assign(u, { maxHp: s2.hp, hp: Math.max(1, s2.hp * f), atk: s2.atk, cd: s2.cd, armor: s2.armor, range: s2.range, lv: s2.lv });
        }
        p.skillUntil = 0; p.skillReadyAt = Math.max(p.skillReadyAt, this.t + 20); p.heroChangeAt = this.t + 120;
        this.events.push({ k: 'summon', x: h.x, y: h.y, id: h.id });
        this.notice(p.id, `Đã đổi sang ${HEROES[ht].name} · ${HEROES[ht].title}`, 'ok');
        break;
      }
      case 'pullback': {
        // drop every current target and regroup around the hero for 4 s
        p.pullBackUntil = this.t + 4; p.chase = 0;
        for (const id of p.units) { const u = this.units.get(id); if (u) this.unpair(u); }
        this.notice(p.id, 'Rút quân: cả đội bỏ mục tiêu, về đội hình', 'ok');
        this.events.push({ k: 'txt', x: h.x, y: h.y, s: 'Rút quân!' });
        break;
      }
      case 'hold': {
        // "Cất binh": the whole army leaves the map (only the hero walks); pressing again brings it back around the hero
        // the "army is stowed" flag can get lost (e.g. leaving and coming back): soldiers kept in the base or stowed still count
        if (!p.hold && !p.units.length && ((p.stowed?.length ?? 0) || (this.baseOf(p)?.garrison.length ?? 0))) p.hold = true;
        // 14/11/2026: one button, two steps — cất tất cả ↔ xuất binh; also in the middle of a fight (no more 40 % step)
        if (!p.hold) {
          if (!p.units.length) { this.notice(p.id, 'Chưa có lính để cất', 'warn'); break; }
          const home = this.stowArmy(p, 1);
          this.notice(p.id, home ? 'Đã cất tất cả lính vào căn cứ giữ nhà. Bấm C lần nữa để xuất binh' : 'Đã cất binh: chỉ còn tướng trên bản đồ. Bấm C để xuất binh', 'ok');
        } else {
          if (!this.unstowArmy(p, h)) break;
          this.notice(p.id, 'Xuất binh: cả đội đã ra quanh tướng', 'ok');
        }
        this.events.push({ k: 'summon', x: h.x, y: h.y, id: h.id });
        break;
      }
      case 'base-place': this.placeBuilding(p, String(c.type), +c.x, +c.y); break;
      case 'base-up': this.upgradeBuilding(p, c.id, !!c.row, Array.isArray(c.ids) ? c.ids : null); break;
      case 'base-repair': this.repairBuilding(p, c.id); break;
      case 'base-repairall': this.repairAll(p); break;
      case 'mine-up': this.mineUp(p, c.id | 0); break;
      case 'garrison-refresh': this.garrisonRefresh(p, c.id == null ? -1 : c.id | 0); break;
      case 'mine-move': this.mineMove(p, c.id | 0, +c.x, +c.y); break;
      case 'stat-add': this.statAdd(p, String(c.k)); break;
      case 'stat-reset': this.statReset(p); break;
      case 'king-unlock': this.kingUnlock(p); break;
      case 'queen-unlock': this.queenUnlock(p, String(c.type), +c.n || 1); break;
      case 'mine-abandon': this.mineAbandon(p, c.id | 0); break;
      case 'castle-call': this.castleCall?.(p); break;
      case 'pet-buy': this.petBuy(p, String(c.id)); break;
      case 'pet-use': this.petUse(p, c.id ? String(c.id) : null); break;
      case 'auto-cfg': { // 13/11/2026: auto fight monsters (camps up to level lv) and the lowest quality the bag takes
        const pr = this.heroProgOf(p); if (!pr) break;
        pr.cfg = { farm: !!c.farm, lv: Math.max(1, Math.min(10, c.lv | 0 || 3)), pick: Math.max(0, Math.min(TIERS.length - 1, c.pick | 0)), home: Math.max(0, Math.min(500, c.home | 0)), store: !!c.store, lvMin: Math.max(1, Math.min(10, c.lvMin | 0 || 1)) };
        if (pr.cfg.lvMin > pr.cfg.lv) pr.cfg.lvMin = pr.cfg.lv;
        if (pr.cfg.farm) p.autoPauseUntil = 0;
        p.afkSafe = pr.cfg.farm && p.connected;
        this.notice(p.id, pr.cfg.farm ? '🛡 Tự động đánh: BẬT · cơ chế bảo vệ người chơi treo máy: không đánh / không bị người chơi khác đánh' : '🤖 Tự động đánh: TẮT', 'ok');
        break;
      }
      case 'castle-put': this.castlePut(p, String(c.unit), +c.n || 1); break;
      case 'castle-fill': this.castleFill(p); break;
      case 'castle-take': this.castleTake(p, String(c.unit), +c.n || 1); break;
      case 'dismiss-type': this.dismiss(p, String(c.unit), +c.n || 1); break; // Doanh trại "−" (the old 'dismiss' below = one unit, 30 % back)
      case 'research': this.startResearch(p, String(c.unit)); break;
      case 'research-cancel': this.cancelResearch(p); break;
      case 'base-remove': this.removeBuilding(p, c.id); break;
      case 'base-clear': this.clearObstacle(p, +c.x, +c.y); break;
      case 'base-move': this.moveBuildings(p, c.ids ?? c.id, +c.dx, +c.dy, !!c.group); break;
      case 'recall': {
        // "Về thành": after 8 s the hero and the whole army appear at the Thành trì; being attacked breaks it
        if (this.mode !== 'endless') break;
        if (p.recallAt) { p.recallAt = 0; this.notice(p.id, 'Đã hủy về thành', 'warn'); break; }
        const b = this.baseOf(p), th = b && this.thOf(b);
        if (!th || th.state === 'ruin' || th.state === 'build') { this.notice(p.id, 'Cần Thành trì còn đứng để về thành', 'err'); break; }
        if (this.team(p.id).combat) { this.notice(p.id, 'Đang giao tranh, không về thành được', 'err'); break; }
        p.recallAt = this.t + RECALL_TIME; p.recallHp = h.hp; p.autoPauseUntil = this.t + RECALL_TIME + 10;
        if (p.chase && this.units.get(p.chase)?.camp != null) p.chase = 0; // auto fight: drop the monster, stand still for the recall
        this.notice(p.id, `Đang về thành… ${RECALL_TIME} giây (bị tấn công là hủy)`, 'ok');
        break;
      }
      case 'regroup': {
        // stuck soldiers: everyone appears at once in formation around the hero (15 s cooldown)
        if (this.t < (p.regroupAt ?? 0)) { this.notice(p.id, `Tập hợp lại sau ${Math.ceil(p.regroupAt - this.t)} giây`, 'warn'); break; }
        p.regroupAt = this.t + 15; p.chase = 0; p.pullBackUntil = this.t + 1.5;
        for (const id of p.units) {
          const u = this.units.get(id); if (!u || u.dead) continue;
          this.unpair(u);
          const t = this.slotTarget(p, h, u), pos = this.world.nearestFree(t.x, t.y, 6) ?? { x: h.x, y: h.y };
          u.x = pos.x; u.y = pos.y; u.stuck = 0; u.ghostUntil = 0; u.path = null; u.moving = false;
        }
        this.events.push({ k: 'summon', x: h.x, y: h.y, id: h.id });
        this.notice(p.id, 'Tập hợp: cả đội về ngay đội hình quanh tướng', 'ok');
        break;
      }
      case 'buy': { const n = Math.max(1, Math.min(10, c.n | 0)); for (let k = 0; k < n; k++) if (!this.buy(p, c.type, k === 0)) break; break; }
      case 'ring': this.buyRing(p); break;
      case 'mode': if (!this.team(p.id).combat) { p.mode = p.mode === 'buy' ? 'type' : 'buy'; this.relayout(p); } break;
      case 'dismiss': {
        const u = this.units.get(c.id | 0);
        if (!u || u.owner !== p.id || u.kind !== 'unit' || u.dead) return;
        const cost = unitCost(u.type, p.heroType);
        for (const [r, v] of Object.entries(cost)) this.gain(p, r, Math.floor(v * 0.3));
        this.removeUnit(u); this.relayout(p);
        break;
      }
      case 'skill': this.useSkill(p, h, c); break;
      case 'equip': this.equipItem(p, c.id | 0); break;
      case 'unequip': if (SLOTS.includes(c.slot)) this.unequipItem(p, c.slot); break;
      case 'dropitem': this.discardItem(p, c.id | 0); break;
      case 'chest-put': this.chestPut(p, (Array.isArray(c.ids) ? c.ids : [c.id]).map((x) => x | 0)); break;
      case 'chest-take': this.chestTake(p, (Array.isArray(c.ids) ? c.ids : [c.id]).map((x) => x | 0)); break;
      case 'chest-sort': this.chestSort(p); break;
      case 'grind': this.grind(p, (Array.isArray(c.ids) ? c.ids : [c.id]).map((x) => x | 0)); break;
      case 'forge': this.forgeItem(p, c.id | 0); break;
      case 'dustmix': this.dustMix?.(p, String(c.tier ?? ''), c.all !== false); break;
      case 'set-glow': { const c0 = String(c.c ?? '').toLowerCase(); if (c0 && !/^#[0-9a-f]{6}$/.test(c0)) break; p.glow = c0 || null; const b = this.baseOf(p); if (b) { b.glow = p.glow; this.basesDirty = true; } this.notice(p.id, c0 ? `Đã đổi màu viền đội: ${c0}` : 'Đã bỏ màu viền riêng (dùng màu người chơi)', 'ok'); break; }
      case 'party-invite': this.partyInvite(p, c.id); break;
      case 'party-accept': this.partyAccept(p, c.from, c.yes !== false); break;
      case 'party-leave': this.partyLeave(p); break;
      case 'party-kick': this.partyKick(p, c.id); break;
      case 'quest-claim': this.questClaim(p, c.i | 0); break;
      case 'quest-reroll': this.questReroll(p, c.i | 0); break;
      case 'ach-claim': this.achClaim(p, String(c.k)); break;
      case 'title-set': this.titleSet(p, c.k ? String(c.k) : null); break;
      case 'pickup': {
        const g = this.items.get(c.id | 0); if (!g) return;
        if (g.owner && g.owner !== p.id) { this.notice(p.id, `Đồ này là chiến lợi phẩm của ${this.players.get(g.owner)?.name ?? 'người khác'}, bạn không nhặt được`, 'err'); return; }
        p.pickTarget = g.id; p.chase = 0; p.goalMine = -1;
        if (Math.hypot(g.x - h.x, g.y - h.y) > 1.2) this.orderMove(p, h, g.x, g.y);
        break;
      }
    }
  }
  orderMove(p, h, x, y) {
    x = Math.max(1, Math.min(this.world.W - 1, x)); y = Math.max(1, Math.min(this.world.H - 1, y));
    const path = this.world.path(h.x, h.y, x, y);
    p.path = path; p.order = { x, y, t: this.t };
  }
  captureSpot(m, h) {
    const R = CAPTURE_R(m.type);
    let best = null, bd = 1e9;
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      for (const r of [R - 0.7, R - 1.0]) {
        const x = m.x + Math.cos(a) * r, y = m.y + Math.sin(a) * r;
        if (!this.world.walkable(x, y)) continue;
        const d = Math.hypot(x - h.x, y - h.y);
        if (d < bd) { bd = d; best = { x, y }; }
      }
    }
    return best;
  }
  canAfford(p, cost) { return Object.entries(cost).every(([r, v]) => (p.res[r] ?? 0) >= v); }
  pay(p, cost) { for (const [r, v] of Object.entries(cost)) p.res[r] -= v; }
  /** formation size in slot units (informational: there is no cap) */
  usedSlots(p) {
    let n = 0;
    for (const u of this.armyList(p)) n += UNITS[u.type]?.slots ?? 1;
    for (const q of p.queue) n += UNITS[q.type].slots;
    return n;
  }
  /** how many soldiers the player may own (open world: the Doanh trại; elsewhere and for bots: no limit) */
  armyCap(p) {
    if (this.mode !== 'endless' || !p?.acc || p.bot) return Infinity;
    const b = this.baseOf(p); let n = 0;
    if (b) for (const it of b.items) if (it.type === 'doanh-trai' && it.state !== 'build') n += BUILDINGS['doanh-trai'].barracks[it.lv - 1] ?? 0;
    return Math.max(NO_BARRACKS_CAP, n);
  }
  /** soldiers owned: on the map, kept (stowed / base) and in the summon queue (the Hội thành has its own room) */
  /** room used in the Doanh trại (12/11/2026: by housing, like the Hội thành: dân quân 1 … rồng 8), army + kept + queue */
  armyCount(p) { let n = 0; for (const u of this.armyList(p)) n += HOUSING[u.type] ?? 1; for (const q of p.queue) n += HOUSING[q.type] ?? 1; return n; }
  buy(p, type, report = true) {
    const def = UNITS[type]; if (!def) return false;
    { const cap = this.armyCap(p), used = this.armyCount(p), hs = HOUSING[type] ?? 1; if (used + hs > cap) { if (report) this.notice(p.id, `Doanh trại không đủ chỗ: đang dùng ${used}/${cap} chỗ, ${def.name} cần ${hs} chỗ. Xây thêm hoặc nâng cấp Doanh trại`, 'err'); return false; } }
    const need = this.unitLocked(p, type);
    if (need) { if (report) this.notice(p.id, `${def.name} cần Thành trì cấp ${need}`, 'err'); return false; }
    const cost = unitCost(type, p.heroType, this.unitLv(p.acc, type));
    if (!this.canAfford(p, cost)) {
      if (report) { const miss = Object.entries(cost).filter(([r, v]) => p.res[r] < v).map(([r, v]) => `${Math.ceil(v - p.res[r])} ${RES_INFO[r].name}`); this.notice(p.id, `Thiếu ${miss.join(', ')}`, 'err'); }
      return false;
    }
    this.pay(p, cost);
    this.quest(p, 'summon', 1);
    let time = def.summon;
    if (type === 'rong' && p.heroType === 'hoa-ky') time = 6;
    if (this.team(p.id).combat) time *= 2;
    if (p.bot && this.mode === 'endless') time *= BOT_SLOW;
    p.queue.push({ type, readyAt: this.t + time, total: time, n: ++p.buyCounter });
    p.stats.bought += costValue(cost);
    return true;
  }
  buyRing(p) {
    if (p.rings >= MAX_RINGS) return;
    const cost = ringCost(p.rings + 1, p.heroType);
    if (!this.canAfford(p, cost)) { this.notice(p.id, `Thiếu tài nguyên để mở vòng ${p.rings + 1}`, 'err'); return; }
    this.pay(p, cost); p.rings++;
    this.notice(p.id, `Đã mở vòng ${p.rings}: tối đa ${RING_SLOTS(p.rings)} ô`, 'ok');
  }
  /** recompute formation offsets (hexagon rings sized by unit; by type or by purchase order) */
  recallTick() {
    for (const p of this.players.values()) {
      if (!p.recallAt) continue;
      const h = this.units.get(p.hero);
      if (!p.alive || !h) { p.recallAt = 0; continue; }
      if (this.team(p.id).combat || h.hp < (p.recallHp ?? 0) - 0.5) { p.recallAt = 0; p.storeOnArrive = false; this.notice(p.id, 'Về thành bị ngắt: bạn đang bị tấn công', 'err'); continue; }
      p.recallHp = Math.max(p.recallHp ?? 0, h.hp);
      if (this.t < p.recallAt) continue;
      p.recallAt = 0;
      const b = this.baseOf(p), th = b && this.thOf(b);
      if (!th || th.state === 'ruin') { this.notice(p.id, 'Thành trì đã bị phá, không về được', 'err'); continue; }
      const to = this.world.nearestFree(th.tx + 1.5, th.ty + 4.2, 8); if (!to) continue;
      this.events.push({ k: 'summon', x: h.x, y: h.y, id: h.id });
      this.unpair(h); h.x = to.x; h.y = to.y; p.path = null; p.chase = 0; p.goalMine = -1;
      for (const id of p.units) {
        const u = this.units.get(id); if (!u || u.dead) continue;
        this.unpair(u);
        const t = this.slotTarget(p, h, u), pos = u.fly ? t : this.world.nearestFree(t.x, t.y, 6) ?? { x: h.x, y: h.y };
        u.x = pos.x; u.y = pos.y; u.path = null; u.moving = false; u.stuck = 0;
      }
      this.events.push({ k: 'summon', x: h.x, y: h.y, id: h.id });
      // 13/11/2026: home = full health at once; troops borrowed from the Hội thành go back inside
      this.castleReturn?.(p);
      h.hp = h.maxHp; for (const id of p.units) { const u = this.units.get(id); if (u && !u.dead) u.hp = u.maxHp; }
      this.notice(p.id, 'Đã về thành · hồi đầy máu cho tướng và quân', 'ok');
      if (p.storeOnArrive) { // full bag → straight into the Rương đồ
        p.storeOnArrive = false;
        const n0 = p.bag?.length ?? 0; this.chestPut?.(p, (p.bag ?? []).map((it) => it.id)); const n = n0 - (p.bag?.length ?? 0);
        if (n) this.notice(p.id, `🎒 Đã cất ${n} món vào Rương đồ`, 'ok');
        if ((p.bag?.length ?? 0) >= BAG_SIZE) { p.storeBlockUntil = this.t + 600; this.notice(p.id, '🎒 Rương đầy: không cất thêm được, 10 phút nữa mới tự về cất lại', 'warn'); }
      }
    }
  }
  /** take every soldier off the map, keeping type / hp / kills ("Cất binh") */
  stowArmy(p, share = GARRISON_DEF) {
    this.castleReturn?.(p); // troops borrowed from the Hội thành go back there, not into the Doanh trại
    // with a standing Thành trì the army goes into the base (it defends it); otherwise it is simply kept off the map
    const b = this.baseOf(p), home = b && this.thOf(b)?.state !== 'ruin' ? b : null;
    if (home) { home.heroType = p.heroType; if (!home.garrison.length) home.garrisonV = 1; home.garrisonAll = share >= 1; } // an empty base starts a 40 % garrison
    const into = home ? home.garrison : (p.stowed = [...(p.stowed ?? [])]);
    // a base keeps GARRISON_DEF (40 %) of the army, the same mix of types (12/11/2026); the other 60 % stay with the hero
    const all = p.units.map((id) => this.units.get(id)).filter((u) => u && !u.dead);
    const [list, stay] = home && share < 1 ? pickShare(all, share) : [all, []];
    const keep = stay.map((u) => u.id);
    for (const u of list) {
      this.unpair(u);
      into.push({ type: u.type, hp: u.hp, buyN: u.buyN, kills: u.kills });
      this.units.delete(u.id);
    }
    p.units = keep; p.hold = !keep.length;
    if (keep.length) this.relayout(p);
    if (home) this.basesDirty = true;
    return !!home;
  }
  /** Doanh trại "−" (13/11/2026): send n soldiers of a type home for good, no refund. Order: following the hero (lowest HP
   *  first), kept off the map, kept in the base, base defenders standing outside */
  dismiss(p, type, n = 1) {
    if (!UNITS[type]) return 0;
    n = Math.max(1, Math.min(50, n | 0));
    let done = 0;
    const onMap = p.units.map((id) => this.units.get(id)).filter((u) => u && !u.dead && u.type === type).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    for (const u of onMap) { if (done >= n) break; this.unpair(u); this.units.delete(u.id); p.units = p.units.filter((id) => id !== u.id); done++; }
    const cut = (list) => { for (let i = list.length - 1; i >= 0 && done < n; i--) if (list[i].type === type) { list.splice(i, 1); done++; } };
    if (p.stowed) cut(p.stowed);
    const b = this.baseOf(p);
    if (b) {
      const before = done; cut(b.garrison);
      for (const u of [...this.units.values()]) { if (done >= n) break; if (u.defender && !u.castle && !u.homeHero && !u.dead && u.baseKey === b.key && u.type === type) { this.unpair(u); this.units.delete(u.id); done++; } }
      if (done > before) this.basesDirty = true;
    }
    if (!done) { this.notice(p.id, `Không có ${UNITS[type].name} nào để bỏ`, 'err'); return 0; }
    if (p.units.length) this.relayout(p);
    if (!p.units.length) p.hold = !!((b && b.garrison.length) || p.stowed?.length);
    this.notice(p.id, `Đã bỏ ${done} ${UNITS[type].name} (không hoàn tài nguyên)`, 'ok');
    return done;
  }
  /** put the stowed soldiers back in formation around the hero */
  unstowArmy(p, h) {
    const b = this.baseOf(p), list = [...(p.stowed ?? [])];
    if (b && (b.garrison.length || [...this.units.values()].some((u) => u.defender && !u.castle && !u.homeHero && u.baseKey === b.key))) {
      // 11/11/2026: soldiers kept in the base come out next to the hero wherever he is (no need to walk home)
      // 14/11/2026: also during a fight at home (the soldiers still inside come out; those already defending stay)
      list.push(...b.garrison); b.garrison = []; b.garrisonAll = false; this.basesDirty = true;
    }
    p.stowed = list;
    for (const q of p.stowed ?? []) {
      if (!UNITS[q.type]) continue;
      const u = this.addUnit({ owner: p.id, kind: 'unit', type: q.type, x: h.x, y: h.y, st: this.unitStats(q.type, p.heroType, this.unitLv(p.acc, q.type), p.armyGear) });
      u.hp = Math.max(1, Math.min(u.maxHp, q.hp)); u.buyN = q.buyN ?? 0; u.kills = q.kills ?? 0; u.value = costValue(UNITS[q.type].cost);
      p.units.push(u.id);
    }
    p.stowed = []; p.hold = !!(b && b.garrison.length);
    this.relayout(p);
    for (const id of p.units) {
      const u = this.units.get(id), t = this.slotTarget(p, h, u);
      const pos = u.fly ? t : this.world.nearestFree(t.x, t.y, 6) ?? { x: h.x, y: h.y };
      u.x = pos.x; u.y = pos.y;
    }
    return true;
  }
  /** soldiers on the map plus stowed ones: [{type}] */
  armyList(p, withBase = true) {
    const out = [...p.units.map((id) => this.units.get(id)).filter((u) => u && !u.dead), ...(p.stowed ?? [])];
    const b = withBase && this.baseOf(p);
    if (b) out.push(...b.garrison, ...[...this.units.values()].filter((u) => u.defender && !u.castle && !u.homeHero && u.baseKey === b.key && !u.dead));
    return out;
  }
  relayout(p) {
    const list = p.units.map((id) => this.units.get(id)).filter((u) => u && !u.dead);
    // ranged inside, melee outside in both modes; inside each group: by type or by purchase order
    const grp = (u) => (RANGED_IN.has(u.type) ? 0 : 1);
    if (p.mode === 'type') list.sort((a, b) => grp(a) - grp(b) || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || a.buyN - b.buyN);
    else list.sort((a, b) => grp(a) - grp(b) || a.buyN - b.buyN);
    let offs = layoutRings(list.map((u) => u.type), p.mode === 'type', list.map(grp));
    const pack = p.face != null ? FORMATION_PACK_MARCH : FORMATION_PACK;
    offs = offs.map((o) => ({ ...o, x: o.x * pack, y: o.y * pack }));
    // 13/11/2026: facing the hero's heading, the same hexagon slots go front → back by FRONT_ORDER
    if (p.face != null) {
      const dx = Math.cos(p.face), dy = Math.sin(p.face);
      const slots = offs.map((o) => ({ o, d: o.x * dx + o.y * dy })).sort((a, c) => c.d - a.d);
      const ord = list.map((_, i) => i).sort((i, j) => FRONT_ORDER.indexOf(list[i].type) - FRONT_ORDER.indexOf(list[j].type) || list[i].buyN - list[j].buyN);
      const re = new Array(list.length); ord.forEach((ui, k) => (re[ui] = slots[k].o)); offs = re;
    }
    p.layout = new Map(list.map((u, i) => [u.id, offs[i]]));
    p.units = list.map((u) => u.id);
  }
  useSkill(p, h, c) {
    if (this.t < p.skillReadyAt) return;
    const sk = HEROES[p.heroType].skill;
    p.skillReadyAt = this.t + sk.cd;
    p.skillUntil = this.t + sk.dur;
    const ev = { k: 'skill', hero: p.heroType, id: h.id, x: h.x, y: h.y };
    if (p.heroType === 'phong-vu') {
      for (const id of p.units) { const u = this.units.get(id); if (u) this.unpair(u); }
      this.unpair(h);
    }
    if (p.heroType === 'lam-nguyet') {
      let x = +c.x, y = +c.y;
      if (!Number.isFinite(x)) { x = h.x; y = h.y - 3; }
      const d = Math.hypot(x - h.x, y - h.y);
      if (d > 8) { x = h.x + ((x - h.x) * 8) / d; y = h.y + ((y - h.y) * 8) / d; }
      ev.x = x; ev.y = y;
      this.delayed.push([this.t + 1, () => {
        for (const e of this.near(x, y, 2.5)) if (!e.dead && this.hostile(h, e)) this.damage(h, e, 120, { pierce: true, fixed: true });
        this.events.push({ k: 'boom', x, y, r: 2.5, kind: 'star' });
      }]);
    }
    this.events.push(ev);
    this.notice(p.id, `Kỹ năng: ${sk.name}`, 'ok');
  }


  // ------------------------------------------------------------------ bosses (docs/design/15.3)
  findBossSpots() {
    const W = this.world, out = {};
    const open = (x, y) => { let n = 0; for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) if (i * i + j * j <= 16 && W.walkable(x + i, y + j)) n++; return n; };
    const c = W.W / 2, d = 46 * (W.W / 256); // 4 bosses evenly around the centre, at the same relative distance on any map size
    const target = { center: [c, c], N: [c, c - d], E: [c + d, c], S: [c, c + d], W: [c - d, c] };
    for (const [type, B] of Object.entries(BOSSES)) {
      const [tx, ty] = target[B.at];
      let best = { x: tx + 0.5, y: ty + 0.5 }, bs = -1;
      for (let j = -9; j <= 9; j++) for (let i = -9; i <= 9; i++) {
        const x = tx + i + 0.5, y = ty + j + 0.5;
        if (!W.walkable(x, y) || this.mines.some((m) => Math.hypot(m.x - x, m.y - y) < 6)) continue;
        const sc = open(x, y) * 10 - Math.hypot(i, j);
        if (sc > bs) { bs = sc; best = { x, y }; }
      }
      out[type] = best;
    }
    return out;
  }
  spawnBosses(only = null) {
    for (const [type, B] of Object.entries(BOSSES)) {
      if (only && type !== only) continue;
      const home = this.bossSpots[type];
      const lv = 1 + Math.floor(Math.random() * BOSS_LV_MAX), m = bossLvMult(lv);
      const u = this.addUnit({ owner: 0, kind: 'guard', type, x: home.x, y: home.y, st: { ...B, speed: B.speed, hp: Math.round(B.hp * m), atk: B.atk * m }, team: 'b' + type });
      u.boss = type; u.bossHome = home; u.body = 2.0; u.value = Math.round((B.hp * m) / 4); u.nextSpecial = 0; u.lv = lv; u.lvMult = m;
      if (only) this.notice(null, `👑 Boss ${B.name} cấp ${lv} đã xuất hiện trở lại!`, 'sys');
    }
  }
  bossSkill(g) {
    const B = BOSSES[g.type];
    const foes = this.near(g.x, g.y, 9).filter((e) => this.hostile(g, e) && this.inGuardZone(g, e));
    if (!foes.length) return false;
    g.nextSpecial = this.t + B.skillCd;
    g.act = ACT.skill; g.actT = this.t; g.moving = false;
    const near1 = foes.reduce((a, e) => (dist(g, e) < dist(g, a) ? e : a));
    g.dir = dirOf(near1.x - g.x, near1.y - g.y);
    const hit = (x, y, r, dmg, o = {}) => { dmg *= g.lvMult ?? 1; for (const e of this.near(x, y, r)) if (this.hostile(g, e)) { this.damage(g, e, dmg, { fixed: true, ...o }); if (o.stun) e.stunUntil = this.t + o.stun; if (o.push && !e.dead) { const d = dist(g, e) || 1, nx = e.x + ((e.x - g.x) / d) * o.push, ny = e.y + ((e.y - g.y) / d) * o.push; if (this.world.walkable(nx, ny)) { e.x = nx; e.y = ny; } } } };
    switch (B.skill) {
      case 'slam': this.delayed.push([this.t + 0.5, () => { if (g.dead) return; hit(g.x, g.y, 4.5, 160, { stun: 1 }); this.events.push({ k: 'boom', x: g.x, y: g.y, r: 4.5, kind: 'slam' }); }]); break;
      case 'whirl': this.delayed.push([this.t + 0.4, () => { if (g.dead) return; hit(g.x, g.y, 3.8, 150, { push: 1 }); this.events.push({ k: 'boom', x: g.x, y: g.y, r: 3.8, kind: 'whirl' }); }]); break;
      case 'tar': {
        const a = Math.atan2(near1.y - g.y, near1.x - g.x);
        this.delayed.push([this.t + 0.5, () => { if (g.dead) return; for (let k = 0; k < 5; k++) { const d = 1.8 + k * 1.1, sp = (k % 2 ? 0.35 : -0.35) * (k / 4); this.addFire(g.x + Math.cos(a + sp) * d, g.y + Math.sin(a + sp) * d, 1.3, 4, 25, g.team, g); } this.events.push({ k: 'boom', x: g.x + Math.cos(a) * 3, y: g.y + Math.sin(a) * 3, r: 3, kind: 'tar' }); }]);
        break;
      }
      case 'storm': {
        const pts = [];
        // 14/11/2026: crystals fall on RANDOM enemies of the fight (not always the back line), 9 of them
        const pool = foes.filter((e) => e.kind !== 'build');
        for (let k = 0; k < 9; k++) { const e = pool[Math.floor(this.rand() * pool.length)] ?? near1, j = k < 5 ? 0.3 : 1.5; pts.push([e.x + (this.rand() - 0.5) * j * 2, e.y + (this.rand() - 0.5) * j * 2]); }
        for (const [x, y] of pts) this.events.push({ k: 'warn', x, y, r: 1.3, dur: 0.9 });
        this.delayed.push([this.t + 0.9, () => { if (g.dead) return; for (const [x, y] of pts) { hit(x, y, 1.3, 140, { pierce: true }); this.events.push({ k: 'boom', x, y, r: 1.3, kind: 'star' }); } }]);
        break;
      }
      case 'burrow': {
        // 14/11/2026: burrows under a RANDOM enemy inside its lair (it used to pick the densest spot = always the archers)
        const inLair = foes.filter((e) => e.kind !== 'build' && Math.hypot(e.x - g.bossHome.x, e.y - g.bossHome.y) < BOSS_LEASH);
        const best = inLair[Math.floor(this.rand() * inLair.length)] ?? near1;
        const tx = best.x, ty = best.y;
        this.events.push({ k: 'warn', x: tx, y: ty, r: 2.5, dur: 1 });
        g.hiddenUntil = this.t + 1; this.unpair(g);
        this.delayed.push([this.t + 1, () => { if (g.dead) return; g.x = tx; g.y = ty; hit(tx, ty, 2.5, 250); this.addFire(tx, ty, 2, 4, 20, g.team, g); this.events.push({ k: 'boom', x: tx, y: ty, r: 2.5, kind: 'burrow' }); }]);
        break;
      }
    }
    this.events.push({ k: 'bskill', id: g.id, x: g.x, y: g.y, s: B.skill });
    return true;
  }

  // ------------------------------------------------------------------ items (docs/design/16)
  /** owner: player id who may pick it up (monster loot), 0 = anyone (loot from a fallen player) */
  dropItem(item, x, y, spread = 1, owner = 0) {
    const a = this.rand() * Math.PI * 2, r = this.rand() * spread;
    let ix = x + Math.cos(a) * r, iy = y + Math.sin(a) * r;
    const f = this.world.nearestFree(ix, iy, 4); if (f) { ix = f.x + (this.rand() - 0.5) * 0.6; iy = f.y + (this.rand() - 0.5) * 0.6; }
    const g = { id: item.id, x: ix, y: iy, item, until: this.t + ITEM_TTL, owner };
    this.items.set(item.id, g);
    this.events.push({ k: 'loot', x: ix, y: iy, tier: item.tier });
  }
  /** monster / boss loot goes straight into the killer's bag (12/11/2026); a full bag (or no human killer) drops it */
  /** a new item of this quality whose level follows the player who earned it (−6 … +2, at most cap) */
  dropItemFor(p, tier, cap = ITEM_LV_MAX) { return makeItem(this.nextItem++, tier, this.rand, undefined, dropLv(p && !p.bot ? this.heroLvOf(p) : 1, cap, this.rand)); }
  lootTo(item, x, y, spread, killer) {
    const h = killer && !killer.bot && killer.alive ? this.units.get(killer.hero) : null;
    const pick = killer && !killer.bot ? this.heroProgOf(killer)?.cfg?.pick ?? 0 : 0;
    if (h && TIERS.indexOf(item.tier) < pick) return this.dropItem(item, x, y, spread, killer.id); // below the chosen quality: left on the ground
    if (!h || (killer.bag ??= []).length >= BAG_SIZE) {
      if (h && (!killer.fullWarned || this.t - killer.fullWarned > 5)) { killer.fullWarned = this.t; this.notice(killer.id, `Túi đồ đầy (${BAG_SIZE} ô): ${item.name} rơi ra đất`, 'err'); }
      return this.dropItem(item, x, y, spread, killer?.id ?? 0);
    }
    killer.bag.push(item);
    this.notice(killer.id, `Đã nhặt: ${item.name} (${TIER_INFO[item.tier].name})`, 'loot', { color: TIER_INFO[item.tier].color });
    this.events.push({ k: 'loot', x, y, tier: item.tier });
    if (!killer.equip?.[item.slot]) this.equipItem(killer, item.id, true);
  }
  pickups() {
    for (const [id, g] of this.items) if (g.until <= this.t) this.items.delete(id);
    for (const p of this.players.values()) {
      if (!p.alive) continue;
      const h = this.units.get(p.hero); if (!h) continue;
      if (!p.pickTarget) continue;
      const g0 = this.items.get(p.pickTarget);
      if (!g0) { p.pickTarget = 0; continue; }
      for (const [id, g] of [[p.pickTarget, g0]]) {
        if (Math.hypot(g.x - h.x, g.y - h.y) > 1.6) continue;
        p.pickTarget = 0;
        if (g.owner && g.owner !== p.id) { this.notice(p.id, `Đồ này là chiến lợi phẩm của ${this.players.get(g.owner)?.name ?? 'người khác'}`, 'err'); continue; }
        p.bag ??= [];
        if (p.bag.length >= BAG_SIZE) { if (!p.fullWarned || this.t - p.fullWarned > 5) { p.fullWarned = this.t; this.notice(p.id, `Túi đồ đầy (${BAG_SIZE} ô). Vứt bớt đồ để nhặt.`, 'err'); } continue; }
        p.bag.push(g.item); this.items.delete(id);
        this.notice(p.id, `Nhặt được ${g.item.name} (${TIER_INFO[g.item.tier].name})`, 'ok');
        // auto-equip into an empty slot
        if (!p.equip?.[g.item.slot]) this.equipItem(p, g.item.id);
      }
    }
  }
  equipItem(p, id, quiet = false) {
    p.bag ??= []; p.equip ??= {};
    const i = p.bag.findIndex((it) => it.id === id); if (i < 0) return;
    const it = p.bag[i];
    const hl = this.heroLvOf(p);
    if (!p.bot && this.heroProgOf(p) && (it.lv ?? 1) > hl) { if (!quiet) this.notice(p.id, `Cần tướng cấp ${it.lv} để mặc ${it.name} (đang cấp ${hl})`, 'err'); return; } // item levels (13/11/2026)
    const old = p.equip[it.slot];
    p.bag.splice(i, 1);
    if (old) p.bag.push(old);
    p.equip[it.slot] = it;
    this.applyEquip(p);
  }
  unequipItem(p, slot) {
    p.equip ??= {}; p.bag ??= [];
    const it = p.equip[slot]; if (!it) return;
    if (p.bag.length >= BAG_SIZE) { this.notice(p.id, 'Túi đồ đầy', 'err'); return; }
    p.equip[slot] = null; p.bag.push(it); this.applyEquip(p);
  }
  discardItem(p, id) {
    const h = this.units.get(p.hero); if (!h) return;
    p.bag ??= []; p.equip ??= {};
    let it = null;
    const i = p.bag.findIndex((q) => q.id === id);
    if (i >= 0) { it = p.bag[i]; p.bag.splice(i, 1); }
    else for (const sl of SLOTS) if (p.equip[sl]?.id === id) { it = p.equip[sl]; p.equip[sl] = null; }
    if (!it) return;
    this.applyEquip(p);
    const g = { id: it.id, x: h.x + 1.6, y: h.y + 0.6, item: it, until: this.t + ITEM_TTL };
    this.items.set(it.id, g);
  }
  /** hero stats = base × equipment */
  applyEquip(p) {
    const h = this.units.get(p.hero); if (!h) return;
    h.base ??= { hp: h.maxHp, atk: h.atk, armor: h.armor, cd: h.cd };
    h.base.cd ??= heroStats(h.type)?.cd ?? h.cd;
    for (const it of Object.values(p.equip ?? {})) restatItem(it, this.heroLvOf?.(p) ?? 1); // older saves
    const g = gearBonus(p.equip), b = g.hero, pt = this.heroPointBonus(p); // potential points (docs/design/19-cap-anh-hung.md)
    const pb = petBonus(this.petOf(p)); // Thú cưng (13/11/2026): the bonus counts for the hero AND the whole army
    b.hpPct += pb.hp ?? 0; b.armor += pb.armor ?? 0; b.atk += pb.atk ?? 0; b.ls = (b.ls ?? 0) + (pb.ls ?? 0); b.speed += pb.speed ?? 0;
    b.as = (b.as ?? 0) + (pb.as ?? 0); b.dg = (b.dg ?? 0) + (pb.dg ?? 0); // Bạch Hổ / Côn Bằng tốc đánh, Cửu Vĩ Hồ né đòn
    for (const k of ['atk', 'hp', 'armor', 'ls', 'as', 'dg']) if (pb[k]) g.army[k] = Math.round(((g.army[k] ?? 0) + pb[k]) * 1000) / 1000;
    const frac = h.hp / h.maxHp;
    h.maxHp = Math.round((h.base.hp + pt.hp) * (1 + b.hpPct) + b.hp);
    h.hp = Math.max(1, Math.round(h.maxHp * frac));
    h.atk = (h.base.atk + pt.atk) * (1 + b.atk);
    h.armor = Math.min(ARMOR_CAP, h.base.armor + b.armor + pt.ar);
    h.cd = h.base.cd / (1 + pt.as + (b.as ?? 0));
    h.ls = Math.min(LS_CAP, (b.ls ?? 0) + (pt.ls ?? 0)); h.dodge = Math.min(DODGE_CAP, (b.dg ?? 0) + (pt.dg ?? 0)); // lifesteal / dodge (12/11/2026)
    p.speedBonus = Math.min(SPEED_BONUS_CAP, b.speed + pt.ms); // at most +100 % (12/11/2026: full black gear stacked +140 %)
    // gear v2 (docs/design/23-chi-so-trang-bi.md): the soldiers get a share of the hero's gear + set bonuses
    const ag = g.army, changed = JSON.stringify(ag) !== JSON.stringify(p.armyGear ?? null);
    p.armyGear = ag;
    const base = this.bases && this.baseOf?.(p); if (base) base.armyGear = ag;
    if (changed) this.applyArmyGear(p);
  }
  /** re-stat every soldier of p (army, mine garrisons, base defenders) for the current army gear bonus */
  applyArmyGear(p) {
    const b = this.bases && this.baseOf?.(p);
    for (const u of this.units.values()) {
      if (u.dead || !UNITS[u.type]) continue;
      const mineU = u.owner === p.id && (u.kind === 'unit' || u.garrison), baseU = b && u.baseKey === b.key && u.defender;
      if (!mineU && !baseU) continue;
      const st = mineU ? this.unitStats(u.type, p.heroType, Math.min(UNIT_LV_MAX, this.unitLv(p.acc, u.type) + (u.lvBonus ?? 0)), p.armyGear) : u.castle ? this.castleStats(b, u.type) : this.unitStats(u.type, b.heroType, b.unitLv?.[u.type] ?? 1, b.armyGear);
      const f = u.hp / u.maxHp;
      Object.assign(u, { maxHp: st.hp, hp: Math.max(1, st.hp * f), atk: st.atk, cd: st.cd, armor: st.armor, ls: st.ls ?? 0, dodge: st.dodge ?? 0, lv: st.lv ?? u.lv });
    }
    if (b) this.restatBuildings?.(b); // structures get BUILD_GEAR × the share too (13/11/2026)
  }

  // ------------------------------------------------------------------ matches & zone (docs/design/15)
  /** reset the world and wait in the lobby until someone presses Start */
  newMatch(n) {
    this.units.clear(); this.items.clear(); this.fires = []; this.projectiles = []; this.delayed = []; this.teams.clear();
    for (const m of this.mines) { m.owner = 0; m.holdStart = 0; m.cap = null; m.guards = new Set(); m.emptySince = -1e9; m.changed = true; }
    for (const m of this.mines) if (GUARD_SETS[m.type]) this.spawnGuards(m);
    this.spawnBosses();
    for (const c of this.camps) { c.guards = new Set(); c.emptySince = -1e9; this.spawnCamp(c); }
    this.bossDead = {};
    this.match = { n, start: this.t, phase: this.mode === 'endless' ? 'run' : 'lobby', endless: this.mode === 'endless', startAt: 0, startedBy: null, endAt: 0, winner: null, results: null, circles: [{ x: this.world.W / 2, y: this.world.H / 2, r: ZONE_START_R }] };
  }
  /** a player in the lobby pressed Start: the match begins after a short countdown */
  requestStart(p) {
    const M = this.match;
    if (M.phase !== 'lobby' || M.startAt) return;
    M.startAt = this.t + 3; M.startedBy = p.name;
    this.notice(null, `▶ ${p.name} bấm Bắt đầu: ván #${M.n} bắt đầu sau 3 giây!`, 'sys');
  }
  beginMatch() {
    const M = this.match;
    M.phase = 'run'; M.start = this.t; M.startAt = 0; M.circles = [{ x: this.world.W / 2, y: this.world.H / 2, r: ZONE_START_R }];
    const heroes = Object.keys(HEROES);
    for (const p of this.players.values()) if (!p.alive && (p.bot || p.connected)) this.spawnPlayer(p, p.bot ? heroes[Math.floor(this.rand() * heroes.length)] : p.heroType);
    this.notice(null, `⚔ Ván #${M.n} bắt đầu!`, 'sys');
    this.onMatchStart?.(M);
  }
  zoneNow() {
    const M = this.match, el = this.t - M.start, C = M.circles;
    if (M.phase !== 'run' || this.mode === 'endless') return { cur: C[0], next: null, dmg: 0, state: 'wait', until: 0 };
    let cur = C[0], next = null, dmg = 0, state = 'wait', until = ZONE_PHASES[0][1];
    for (let i = 0; i < ZONE_PHASES.length; i++) {
      const [warn, s0, s1, R, d] = ZONE_PHASES[i];
      if (el >= warn && !C[i + 1]) C[i + 1] = this.pickCircle(C[i], R, i === ZONE_PHASES.length - 1);
      if (el < warn) { until = s0; break; }
      next = C[i + 1];
      if (el < s0) { state = 'wait'; until = s0; cur = C[i]; dmg = i ? ZONE_PHASES[i - 1][4] : 0; break; }
      if (el < s1) { const k = (el - s0) / (s1 - s0); cur = { x: C[i].x + (C[i + 1].x - C[i].x) * k, y: C[i].y + (C[i + 1].y - C[i].y) * k, r: C[i].r + (C[i + 1].r - C[i].r) * k }; state = 'shrink'; until = s1; dmg = d; break; }
      cur = C[i + 1]; dmg = d; state = 'done'; next = null; until = 0;
    }
    return { cur, next, dmg, state, until: until ? M.start + until : 0 };
  }
  pickCircle(prev, R, final) {
    for (let k = 0; k < 80; k++) {
      const a = this.rand() * Math.PI * 2, d = this.rand() * Math.max(0, prev.r - R) * 0.9;
      const MW = this.world.W;
      const x = Math.max(R + 4, Math.min(MW - R - 4, prev.x + Math.cos(a) * d)), y = Math.max(R + 4, Math.min(MW - R - 4, prev.y + Math.sin(a) * d));
      if (Math.hypot(x - prev.x, y - prev.y) + R > prev.r + 0.5) continue;
      if (final && !this.world.walkable(x, y)) continue;
      return { x, y, r: R };
    }
    return { x: prev.x, y: prev.y, r: R };
  }
  zoneDamage() {
    const z = this.zoneNow(); this.zone = z;
    if (!z.dmg) return;
    for (const u of [...this.units.values()]) {
      if (u.dead || !u.owner || u.rout) continue;
      if (Math.hypot(u.x - z.cur.x, u.y - z.cur.y) <= z.cur.r) continue;
      u.hp -= u.maxHp * z.dmg * 0.5; u.lastHurt = this.t;
      if (u.hp <= 0) { if (u.kind === 'hero') { const p = this.playerOf(u); u.hp = 0; u.dead = true; u.deathT = this.t; u.act = ACT.death; u.actT = this.t; this.events.push({ k: 'die', id: u.id }); if (p) this.killPlayer(p, null, 'zone'); } else this.kill(u, null); }
    }
  }
  matchTick() {
    const M = this.match, el = this.t - M.start;
    if (this.mode === 'endless') {
      // open world: dead bosses come back after BOSS_RESPAWN (not on top of players)
      for (const [type, at] of Object.entries(this.bossDead)) {
        if (this.t - at < BOSS_RESPAWN) continue;
        const home = this.bossSpots[type];
        // only a hero / army on the spot delays it (not mine garrisons), and at most 2 minutes (13/11/2026: bosses stayed dead)
        if (this.t - at < BOSS_RESPAWN + 120 && this.near(home.x, home.y, 6).some((u) => u.owner && (u.kind === 'hero' || u.kind === 'unit') && !u.garrison)) continue;
        delete this.bossDead[type]; this.spawnBosses(type);
        this.notice(null, `👑 Boss ${BOSSES[type].name} đã hồi sinh!`, 'sys');
      }
      return;
    }
    if (M.phase === 'lobby') { if (M.startAt && this.t >= M.startAt) this.beginMatch(); return; }
    if (M.phase === 'run') {
      const alive = [...this.players.values()].filter((p) => p.alive);
      const humansAlive = alive.some((p) => !p.bot);
      const someoneCanJoin = el < JOIN_WINDOW && [...this.players.values()].some((p) => !p.bot && p.connected && !p.alive && p.diedIn !== M.n);
      // over when: time is up, one army left, or no human is playing any more (nobody wants to watch bots for 15 minutes)
      if (el >= MATCH_LEN || (el >= JOIN_WINDOW && alive.length <= 1) || (el > 20 && !humansAlive && !someoneCanJoin)) this.endMatch(alive);
    } else if (M.phase === 'end' && this.t >= M.endAt) {
      for (const p of this.players.values()) if (p.alive) this.killPlayer(p, null, 'reset');
      for (const p of this.players.values()) { p.deathInfo = null; p.score = 0; }
      this.newMatch(M.n + 1);
      this.onLobby?.(this.match);
    }
  }
  endMatch(alive) {
    const M = this.match;
    const ranked = [...this.players.values()].filter((p) => p.alive || p.deathInfo || p.score > 0)
      .sort((a, b) => (b.alive - a.alive) || (b.score - a.score));
    const winner = alive.length ? alive.slice().sort((a, b) => b.score - a.score)[0] : null;
    M.phase = 'end'; M.endAt = this.t + INTERMISSION; M.winner = winner ? { id: winner.id, name: winner.name, hero: winner.heroType } : null;
    M.results = ranked.map((p, i) => ({ rank: i + 1, id: p.id, name: p.name, color: p.color, hero: p.heroType, alive: p.alive, score: Math.round(p.score), units: p.units.length, mines: this.mines.filter((m) => m.owner === p.id).length, bot: p.bot }));
    this.notice(null, winner ? `🏆 ${winner.name} thắng trận #${M.n}!` : `Trận #${M.n} kết thúc, không ai sống sót.`, 'sys');
    this.onMatchEnd?.(M);
  }

  // ------------------------------------------------------------------ helpers
  rebuildHash() {
    this.hash.clear();
    for (const u of this.units.values()) {
      if (u.dead) continue;
      const k = (Math.floor(u.y / CELL) << 8) | Math.floor(u.x / CELL);
      let a = this.hash.get(k); if (!a) this.hash.set(k, (a = [])); a.push(u);
    }
  }
  near(x, y, r) {
    const out = [];
    const x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL), y0 = Math.floor((y - r) / CELL), y1 = Math.floor((y + r) / CELL);
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      const a = this.hash.get((cy << 8) | cx); if (!a) continue;
      for (const u of a) if (!u.dead && (u.x - x) ** 2 + (u.y - y) ** 2 <= r * r) out.push(u);
    }
    return out;
  }
  playerOf(u) { return u.owner ? this.players.get(u.owner) : null; }
  shielded(u) { const p = this.playerOf(u); return !!p && p.shieldUntil > this.t; }
  // PvP only on a signal (14/11/2026): two players' armies passing by leave each other alone; they fight once one side
  // orders an attack on the other (chase), while a mine of one is being captured by the other, and while they keep
  // hitting each other (every hit refreshes it). Not saved: after a restart everyone is at peace again.
  warKey(a, b) { a = String(a); b = String(b); return a < b ? a + '|' + b : b + '|' + a; } // a side is a player id or 'b:<base key>'
  war(a, b, s = PVP_WAR_S) { if (!a || !b || a === b) return; this.wars ??= new Map(); const k = this.warKey(a, b), u = this.t + s; if (!(this.wars.get(k) >= u)) this.wars.set(k, u); }
  /** war between player id `pid` and a base (and its owner, when that player is in the world) */
  warBase(pid, key, s = PVP_WAR_S) { this.war(pid, 'b:' + key, s); for (const q of this.players.values()) if (q.acc === key && q.id !== pid) { this.war(pid, q.id, s); break; } }
  atWar(a, b) { return !!this.wars && this.wars.get(this.warKey(a, b)) > this.t; }
  /** can a and b fight each other at all */
  hostile(a, b) {
    if (a.team === b.team || a.dead || b.dead) return false;
    if (a.owner && b.owner && a.owner !== b.owner && this.parties?.size && this.sameParty(a.owner, b.owner)) return false; // Tổ đội
    if ((a.bossSafe || b.bossSafe) && a.owner && b.owner && a.owner !== b.owner) return false; // world boss fight: no PvP around it
    // 13/11/2026 "cơ chế bảo vệ người chơi treo máy": a hero / army with auto fight on neither hits nor gets hit by other players
    if (a.owner !== b.owner && (a.owner || b.owner)) {
      const pa = a.owner && this.players.get(a.owner), pb = b.owner && this.players.get(b.owner);
      if (pa?.afkSafe && (a.kind === 'hero' || a.kind === 'unit' || a.kind === 'pet') && (b.owner || b.baseKey)) return false;
      if (pb?.afkSafe && (b.kind === 'hero' || b.kind === 'unit' || b.kind === 'pet') && (a.owner || a.baseKey)) return false;
    }
    if (this.king && (this.inKingPeace(a) || this.inKingPeace(b))) return false; // peace around the Northern King
    if (this.queen && (this.inQueenPeace(a) || this.inQueenPeace(b))) return false; // and around the Desert Queen
    // the garrison of a protected mine (owner died less than 10 min ago) neither fights nor can be hit
    if ((a.garrison && a.mine?.protectUntil > this.t) || (b.garrison && b.mine?.protectUntil > this.t)) return false;
    // wild monsters, bosses and mine guards are neutral: they only fight the players who attacked them or ordered an attack
    const wa = a.kind === 'guard' && !a.owner && !a.baseKey, wb = b.kind === 'guard' && !b.owner && !b.baseKey;
    if (wa || wb) {
      if (wa && wb) return false;
      const m = wa ? a : b, o = wa ? b : a;
      if (!o.owner || !this.teams.get(m.team)?.aggro?.has(o.owner)) return false;
    }
    if (a.baseKey || b.baseKey) { // structures and base defenders
      const s = a.baseKey ? a : b, o = s === a ? b : a;
      if (o.baseKey || (o.kind === 'guard' && !o.baseKey) || !o.owner || o.rout) return false; // wild monsters, mine guards leave bases alone
      const op = this.players.get(o.owner);
      if (!op || op.bot || op.acc === s.baseKey || op.shieldUntil > this.t) return false;
      if (this.parties?.size && this.partyOf(op)) return false; // Tổ đội is for bosses / monsters: no raiding while in a party (12/11/2026, no ganging up)
      if (!this.atWar(op.id, 'b:' + s.baseKey)) return false; // 14/11/2026: walking past a base starts no fight; an attack order or a hit does
      return !(this.bases.get(s.baseKey)?.shieldUntil > this.t);
    }
    if (a.kind === 'guard' && b.kind === 'guard') return false;
    if (a.owner && a.owner === b.owner) return false;
    if (a.owner && b.owner && (this.shielded(a) || this.shielded(b))) return false;
    if (a.rout || b.rout) return false;
    // two players' armies (heroes, soldiers, pets and, 14/11/2026, mine garrisons too): only while at war
    if (a.owner && b.owner && a.owner !== b.owner && !this.atWar(a.owner, b.owner)) return false;
    return true;
  }
  guardHome(g) { if (g.homeHero) return { x: g.homeX, y: g.homeY }; if (g.summon && g.orphanHome) return g.orphanHome; if (g.summon) { const m = this.units.get(g.master); return m?.bossHome ?? (m ? { x: m.x, y: m.y } : g); } if (g.ev) return { x: g.homeX - (g.evOff?.x ?? 0), y: g.homeY - (g.evOff?.y ?? 0) }; if (g.baseKey) { const b = this.bases.get(g.baseKey), th = b && this.thOf(b); return th ? this.itemCenter(th) : g; } return g.boss ? g.bossHome : g.camp != null ? this.camps[g.camp] : this.mines[g.mine] ?? g; }
  guardZoneR(g) { if (g.summon) return BOSS_LEASH + 2; if (g.ev) return 11; if (g.baseKey) return BASE_ZONE + 1.5 + 3; return g.boss ? BOSS_LEASH : g.camp != null ? CAMP_LEASH : this.mines[g.mine] ? CAPTURE_R(this.mines[g.mine].type) + LEASH : 0; }
  inGuardZone(g, e) { const c = this.guardHome(g); return Math.hypot(e.x - c.x, e.y - c.y) <= this.guardZoneR(g); }
  /** may `e` be engaged by melee pairing (Hộ giá rule for heroes) */
  pairable(e) {
    if (e.hidden || e.invisUntil > this.t) return false;
    if (e.kind !== 'hero') return true;
    const p = this.playerOf(e); if (!p) return true;
    let melee = 0;
    for (const id of p.units) { const u = this.units.get(id); if (!u || u.dead || u.ranged) continue; melee++; if (!u.foe) return false; }
    return true;
  }
  shootable(e) {
    if (e.hidden || e.invisUntil > this.t) return false; // Cột sét ẩn underground, Nữ hoàng Băng in her blizzard (16/11/2026)
    if (e.kind !== 'hero') return true;
    const p = this.playerOf(e); if (!p) return true;
    return !!e.foe || e.attackers.size > 0 || p.units.length < 5;
  }
  heroOf(u) { const p = this.playerOf(u); return p ? this.units.get(p.hero) : null; }
  teamSpeed(p) {
    const h = this.units.get(p.hero); if (!h) return 2;
    let s = h.speed;
    for (const id of p.units) { const u = this.units.get(id); if (u && !u.dead) s = Math.min(s, u.speed); }
    if (p.heroType === 'phong-vu') s *= 1.12;
    s *= 1 + (p.speedBonus ?? 0);
    if (p.heroType === 'phong-vu' && p.skillUntil > this.t) s *= 1.6;
    if (h.slowUntil > this.t) s *= 0.8;
    if (h.roarSlow) s *= 0.8;
    return s * this.world.speedAt(h.x, h.y);
  }
  slotTarget(p, h, u) {
    const o = p.layout?.get(u.id) ?? (u.kind === 'pet' ? PET_OFF : { x: 0, y: 0 }); // the pet's battle form keeps ~2.4 tiles off the hero (13/11/2026: it stood on the hero)
    let x = h.x + o.x, y = h.y + o.y;
    if (!u.fly && !this.world.walkable(x, y)) { const f = this.world.nearestFree(x, y, 3); if (f) { x = f.x; y = f.y; } }
    return { x, y };
  }
  /** move unit toward (tx, ty) at speed; ground collision with sliding, ghost mode when stuck */
  step(u, tx, ty, speed, arrive = 0.05) {
    const dx = tx - u.x, dy = ty - u.y, d = Math.hypot(dx, dy);
    if (d <= arrive) { u.moving = false; return true; }
    let v = speed * DT;
    if (d < 1) v = Math.min(v, Math.max(d * 0.35, speed * DT * 0.4));
    v = Math.min(v, d);
    const nx = u.x + (dx / d) * v, ny = u.y + (dy / d) * v;
    u.dir = dirOf(dx, dy); u.moving = true;
    const ghost = u.fly || u.ghostUntil > this.t;
    if ((ghost && (u.fly || !this.world.dynAt(nx, ny))) || this.world.walkable(nx, ny)) { u.x = nx; u.y = ny; u.stuck = 0; } // nothing walks through walls
    else if (this.world.walkable(nx, u.y)) u.x = nx;
    else if (this.world.walkable(u.x, ny)) u.y = ny;
    else { u.stuck += DT; if (u.stuck > 1.2) { u.ghostUntil = this.t + 2.5; u.stuck = 0; } }
    u.runDist += v;
    return false;
  }

  /**
   * Walk toward (tx, ty) like step(), but ground units route around obstacles:
   * straight line when it is clear, otherwise a short A* path (re-planned when the goal moves or every ~1 s).
   * If a unit makes no progress for 2.5 s it walks through obstacles for a moment so it never stays stuck.
   */
  moveTo(u, tx, ty, speed, arrive = 0.05) {
    if (u.fly) return this.step(u, tx, ty, speed, arrive);
    const d = Math.hypot(tx - u.x, ty - u.y);
    if (d <= arrive) { u.upath = null; u.moving = false; return true; }
    // progress watchdog
    if (d < (u.progD ?? 1e9) - 0.3 || d < 1.2) { u.progD = d; u.progT = this.t; }
    else if (this.t - (u.progT ?? this.t) > 2.5) { u.ghostUntil = this.t + 2; u.progD = d; u.progT = this.t; u.upath = null; }
    if (u.ghostUntil > this.t || d < 0.8) { u.upath = null; return this.step(u, tx, ty, speed, arrive); }
    // line of sight is checked every few ticks (cheap enough, but no need every tick)
    if (!u.upath && (this.tick + u.id) % 3 === 0) u.losOk = this.world.lineFree(u.x, u.y, tx, ty);
    if (!u.upath && u.losOk !== false) return this.step(u, tx, ty, speed, arrive);
    const g = u.upathGoal;
    if (!u.upath || this.t >= u.repathAt || !g || Math.hypot(g.x - tx, g.y - ty) > 1.5) {
      u.upath = this.world.path(u.x, u.y, tx, ty, 3000);
      u.upathGoal = { x: tx, y: ty }; u.repathAt = this.t + 0.8 + this.rand() * 0.6;
      if (!u.upath || !u.upath.length) { u.upath = null; u.losOk = true; return this.step(u, tx, ty, speed, arrive); }
      u.upath[u.upath.length - 1] = { x: tx, y: ty };
    }
    const wp = u.upath[0];
    const last = u.upath.length === 1;
    if (this.step(u, wp.x, wp.y, speed, last ? arrive : 0.25)) {
      u.upath.shift();
      if (!u.upath.length) { u.upath = null; u.losOk = undefined; return true; }
    }
    // the rest of the way is clear again: drop the path
    if (u.upath && (this.tick + u.id) % 6 === 0 && this.world.lineFree(u.x, u.y, tx, ty)) { u.upath = null; u.losOk = true; }
    return false;
  }

  // ------------------------------------------------------------------ main loop
  update() {
    this.t += DT; this.tick++;
    const t = this.t;
    for (let i = this.delayed.length - 1; i >= 0; i--) if (this.delayed[i][0] <= t) { const f = this.delayed[i][1]; this.delayed.splice(i, 1); f(); }
    this.rebuildHash();
    for (const p of this.players.values()) if (p.alive) this.updateQueue(p);
    if (this.tick % 5 === 0) this.updateAuras();
    for (const p of this.players.values()) if (p.alive) this.moveHero(p);
    if (this.tick % 20 === 7 && this.mode === 'endless') this.autoFarmTick();
    if (this.tick % 20 === 11 && this.mode === 'endless') this.eventTick(); // Sự kiện thế giới
    if (this.tick % 10 === 6 && this.mode === 'endless') this.petTick(); // Thú cưng: battle form
    if (this.tick % 5 === 2) this.bossSummonTick(); // boss minions at 75 / 50 / 25 % HP (14/11/2026)
    if (this.tick % 8 === 4) for (const p of this.players.values()) if (p.xpAcc >= 1) { // "+X XP" floats over the hero
      const h = this.units.get(p.hero); if (h && !h.dead) this.events.push({ k: 'xp', id: h.id, x: h.x, y: h.y, v: Math.round(p.xpAcc), o: p.id });
      p.xpAcc = 0;
    }
    if (FORMATION_FACING && this.tick % 10 === 3) for (const p of this.players.values()) { // the formation faces where the hero walks
      if (!p.alive || !p.units.length || !p.path?.length || this.team(p.id).combat) continue;
      const h = this.units.get(p.hero); if (!h) continue;
      // inside an enemy base the army fights in the classic ring (ranged inside): keeps the base balance as tuned
      if (this.bases?.size && [...this.bases.values()].some((b) => b.key !== p.acc && this.thOf(b) && this.inBaseZone(b, h.x, h.y, 6))) { if (p.face != null) { p.face = null; this.relayout(p); } continue; }
      const tg = (p.chase && this.units.get(p.chase)) || p.path[p.path.length - 1], ang = Math.atan2(tg.y - h.y, tg.x - h.x); // where the march ends, not the next corner
      if (Math.hypot(tg.x - h.x, tg.y - h.y) < 4) continue;
      const q = Math.round(ang / (Math.PI / 6)) * (Math.PI / 6); // 12 headings (30°)
      if (p.face != null && Math.abs(Math.atan2(Math.sin(q - p.face), Math.cos(q - p.face))) < 0.01) continue;
      if (p.face != null && Math.abs(Math.atan2(Math.sin(q - p.face), Math.cos(q - p.face))) < Math.PI / 4 + 0.01) continue; // small turns: keep the order
      if (this.t - (p.faceAt ?? -9) < 3) continue;
      p.face = q; p.faceAt = this.t; this.relayout(p);
    }
    if (this.tick % 10 === 0) for (const p of this.players.values()) if (p.upGoal && p.alive) { // walking to a mine to upgrade it
      const g = p.upGoal, m = this.mines[g.id], h = this.units.get(p.hero);
      if (!m || !h || m.owner !== p.id || this.t > g.until) p.upGoal = null;
      else if (Math.hypot(h.x - m.x, h.y - m.y) <= CAPTURE_R(m.type) + 1.5) { p.upGoal = null; this.mineUp(p, g.id); }
    }
    this.contacts();
    if (this.tick % 5 === 0) {
      for (const p of this.players.values()) { const h = p.alive && this.units.get(p.hero); p.retreating = !!h && h.moving && !!p.path && this.team(p.id).combat && this.isRetreating(p, h); }
      this.combatState(); this.pairing();
    }
    for (const u of this.units.values()) if (!u.dead) this.act(u);
    this.updateProjectiles();
    this.healTick();
    this.updateFires();
    this.cleanup();
    if (this.tick % 2 === 0) this.updateMines();
    if (this.tick % 20 === 0) { this.economy(); this.guardRespawn(); this.matchTick(); if (this.bases.size) this.baseTick(); }
    if (this.tick % 4 === 2 && this.bases?.size) this.trapTick();
    if (this.mode === 'endless') this.recallTick();
    if (this.tick % 10 === 0) this.zoneDamage();
    if (this.tick % 5 === 0) this.pickups();
    for (const p of this.players.values()) if (p.alive) { this.heroRegen(p); this.unitRegen(p); }
  }

  updateQueue(p) {
    const h = this.units.get(p.hero);
    for (let i = p.queue.length - 1; i >= 0; i--) {
      const q = p.queue[i];
      if (q.readyAt > this.t) continue;
      p.queue.splice(i, 1);
      const st = this.unitStats(q.type, p.heroType, this.unitLv(p.acc, q.type), p.armyGear);
      const u = this.addUnit({ owner: p.id, kind: 'unit', type: q.type, x: h.x, y: h.y, st });
      u.buyN = q.n; u.value = costValue(UNITS[q.type].cost);
      p.units.push(u.id);
      if (p.hold) { this.stowArmy(p, 1); if (!p.units.includes(u.id)) continue; } // army is stowed: the new soldier joins it off the map (if the base has room)
      this.relayout(p);
      const o = p.layout.get(u.id) ?? { x: 0, y: 0 };
      let x = h.x + o.x, y = h.y + o.y;
      if (q.type === 'rong') { x -= 10; y -= 8; }
      else if (!UNITS[q.type].fly && !this.world.walkable(x, y)) { const f = this.world.nearestFree(x, y, 4); if (f) { x = f.x; y = f.y; } }
      u.x = x; u.y = y;
      this.events.push({ k: 'summon', x, y, id: u.id });
      if (q.type === 'rong') this.notice(null, `🐉 ${p.name} đã triệu hồi Rồng!`, 'sys');
    }
  }
  updateAuras() {
    // Dragon "Uy long" (−10% ATK to ground enemies within 4) and Hỏa Kỳ "Long hống" (−30% ATK, −20% speed within 5 of her flyers)
    for (const u of this.units.values()) { u.aura = 1; u.roarSlow = false; u.cAtk = 0; u.cArm = 0; u.bossSafe = false; }
    // 13/11/2026 "bảo vệ khi đánh boss thế giới": around a boss that is being fought (BOSS_LEASH + 4), players do not fight each other
    if (this.mode === 'endless') for (const g of this.units.values()) {
      if (!g.boss || g.dead || !this.team(g.team).combat) continue;
      for (const u of this.near(g.x, g.y, BOSS_LEASH + 4)) if (u.owner) u.bossSafe = true;
    }
    // Hội thành (13/11/2026): the owner's soldiers, hero and base defenders inside its watch range fight better
    if (this.bases?.size) for (const b of this.bases.values()) {
      const ca = this.castleOf?.(b); if (!ca || ca.state === 'ruin' || ca.state === 'build') continue;
      const c = this.itemCenter(ca), R = CASTLE_RANGE[ca.lv - 1], atk = CASTLE_AURA_ATK[ca.lv - 1], arm = CASTLE_AURA_ARM[ca.lv - 1];
      const op = [...this.players.values()].find((q) => q.acc === b.key && q.alive);
      for (const u of this.near(c.x, c.y, R)) if (!u.dead && u.kind !== 'build' && ((op && u.owner === op.id) || (u.defender && u.baseKey === b.key))) { u.cAtk = atk; u.cArm = arm; }
    }
    for (const d of this.units.values()) {
      if (d.dead || !d.fly) continue;
      const p = this.playerOf(d);
      const roar = p && p.heroType === 'hoa-ky' && p.skillUntil > this.t;
      if (d.type !== 'rong' && !roar) continue;
      for (const e of this.near(d.x, d.y, roar ? 5 : 4)) {
        if (!this.hostile(d, e)) continue;
        if (d.type === 'rong' && !e.fly && dist(d, e) <= 4) e.aura = Math.min(e.aura, 0.9);
        if (roar) { e.aura = Math.min(e.aura, 0.7 * (d.type === 'rong' && !e.fly ? 0.9 : 1)); e.roarSlow = true; }
      }
    }
  }
  moveHero(p) {
    const h = this.units.get(p.hero);
    if (!h || h.dead) return;
    if (p.chase) {
      let e = this.units.get(p.chase);
      if ((!e || e.dead) && p.chaseGoal && p.chase === p.breach) { p.chase = p.chaseGoal; p.chaseGoal = 0; p.breach = 0; p.repathAt = 0; e = this.units.get(p.chase); } // wall down: back to the real target
      if (!e || e.dead) { p.chase = 0; p.chaseGoal = 0; }
      else if (dist(h, e) < Math.max(1.2, h.range) + (e.body ?? 0)) p.path = null;
      else if (this.t >= (p.repathAt ?? 0)) {
        p.path = this.world.path(h.x, h.y, e.x, e.y, 80000); p.repathAt = this.t + 0.5;
        if (!p.path && e.baseKey) this.breachTo(p, h, e); // 13/11/2026: shut in by walls → break the first structure on the way
      }
    }
    if (h.stunUntil > this.t) return;
    if (p.path && p.path.length) {
      const wp = p.path[0];
      const sp = this.teamSpeed(p);
      if (this.step(h, wp.x, wp.y, sp, 0.15)) p.path.shift();
      if (!p.path.length) { p.path = null; h.moving = false; }
      if (h.foe || h.attackers.size) this.retreatCheck(p, h);
    } else h.moving = false;
  }
  /** Boss minions (14/11/2026): when a boss (or the world-event chief) falls below 75 / 50 / 25 % HP it calls a wave of its
   *  own minions around itself (BOSS_SUMMON); they fight on the boss's side, give a little XP, drop nothing, are not saved,
   *  and vanish when the boss dies or calms down. A boss healed back to full can call them again. */
  bossSummonTick() {
    for (const u of this.units.values()) {
      if (u.kind === 'guard' && u.summon) { // clean-up of minions whose boss is gone or resting
        const m = this.units.get(u.master);
        const calm = !this.team(u.team).combat ? this.t - (this.team(u.team).lastCombat ?? 0) : 0;
        if (u.orphan) { if (!u.dead && calm > BOSS_RESPAWN) { this.unpair(u); this.units.delete(u.id); } continue; } // boss fallen: they stay like a camp (gone after 10 calm minutes)
        if (!u.dead && (!m || m.dead || calm > 8)) { this.unpair(u); this.units.delete(u.id); }
        continue;
      }
      const S = BOSS_SUMMON[u.boss ? u.type : u.ev && u.type === 'thu-linh' ? 'thu-linh' : ''];
      if (!S || u.dead) continue;
      const f = u.hp / u.maxHp;
      if (f > 0.95) { u.sumDone = 0; continue; } // healed: the waves can come again
      const k = BOSS_SUMMON_AT.filter((t) => f <= t).length; // waves due
      while ((u.sumDone ?? 0) < k) {
        const w = u.sumDone ?? 0; u.sumDone = w + 1;
        const G = GUARDS[S.type], m = 1 + ((u.lvMult ?? 1) - 1) * 0.5, n = S.n[w] ?? S.n[S.n.length - 1]; // half the boss level bonus
        const ev = u.ev ? this.ev : null;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, r = 2.5 + Math.random() * 1.5;
          const p = this.world.nearestFree(u.x + Math.cos(a) * r, u.y + Math.sin(a) * r, 3) ?? { x: u.x, y: u.y };
          const v = this.addUnit({ owner: 0, kind: 'guard', type: S.type, x: p.x, y: p.y, st: { ...G, hp: Math.round(G.hp * m), atk: G.atk * m }, team: u.team });
          v.summon = true; v.master = u.id; v.value = Math.round(G.hp / 4); v.homeX = u.x; v.homeY = u.y;
          if (u.ev) { v.ev = u.ev; ev?.units?.add(v.id); }
          this.events.push({ k: 'summon', x: v.x, y: v.y, id: v.id });
        }
        this.events.push({ k: 'bskill', s: 'summon', x: u.x, y: u.y });
        this.notice(null, `👹 ${BOSSES[u.type]?.name ?? GUARDS[u.type]?.name ?? 'Boss'} còn ${Math.round(BOSS_SUMMON_AT[w] * 100)}% máu: gọi ${n} ${G.name}!`, 'sys');
      }
    }
  }
  /** Thú cưng battle form (13/11/2026): when the hero's team fights, the pet turns big next to the hero and fights on its own;
   *  6 s after the fight it turns small again. Beaten: rests PET_REST s. Not a soldier: no housing, not in the formation */
  petTick() {
    for (const p of this.players.values()) {
      if (p.petUnit && !this.units.get(p.petUnit)) { p.petUnit = 0; p.petRestUntil = this.t + PET_REST; } // already swept away after dying
      const id = this.petOf(p), h = p.alive && this.units.get(p.hero), u = p.petUnit && this.units.get(p.petUnit);
      if (u && (u.dead || !id || u.type !== id || !h || h.dead)) { if (u.dead) p.petRestUntil = this.t + PET_REST; else this.units.delete(u.id); p.petUnit = 0; if (u.dead && h) this.notice(p.id, `🐾 ${PETS[u.type]?.name ?? 'Thú cưng'} kiệt sức, ${PET_REST} giây nữa mới hoá chiến được`, 'warn'); continue; }
      if (!id || !h || h.dead) continue;
      const tm = this.team(p.id);
      if (u) { if (!tm.combat && this.t - tm.lastCombat > 6) { this.units.delete(u.id); p.petUnit = 0; } continue; }
      if (!tm.combat || this.t < (p.petRestUntil ?? 0)) continue;
      const st0 = petFight(id, this.heroLvOf(p)), rf = 1 + 0.04 * (this.heroProgOf(p)?.petRef?.[id] ?? 0), st = { ...st0, hp: Math.round(st0.hp * rf), atk: st0.atk * rf }, f = this.world.nearestFree(h.x + PET_OFF.x, h.y + PET_OFF.y, 3) ?? { x: h.x, y: h.y }; // Hỏa luyện +4%/cấp (docs/design/29 §7.1)
      const v = this.addUnit({ owner: p.id, kind: 'pet', type: id, x: f.x, y: f.y, st: { ...st, speed: st.speed } });
      v.pet = true; v.value = 0; p.petUnit = v.id;
      this.events.push({ k: 'summon', x: v.x, y: v.y, id: v.id });
    }
  }
  /** Thú cưng (13/11/2026): owned + worn per account (heroProg.pets / heroProg.pet) */
  petOf(p) { return p && !p.bot ? this.heroProgOf(p)?.pet ?? null : null; }
  petBuy(p, id) {
    const pr = this.heroProgOf(p), P = PETS[id]; if (!pr || !P) return;
    pr.pets ??= [];
    if (pr.pets.includes(id)) return this.notice(p.id, `Đã có ${P.name}`, 'err');
    // price: one item of the pet's tier (Tím / Cam / Đen, 13/11/2026) of the pet's slot (bag first, then the Rương đồ), the lowest level one
    const T = petTier(id), b = this.baseOf?.(p), pools = [p.bag ?? [], b?.chest ?? []];
    let best = null; for (const list of pools) for (const it of list) if (it.slot === P.pay && it.tier === T && (!best || (it.lv ?? 1) < (best.it.lv ?? 1))) best = { list, it };
    if (!best) return this.notice(p.id, `Cần 1 món ${TIER_INFO[T].name} ô ${SLOT_INFO[P.pay].name} (trong túi hoặc Rương đồ) để đổi ${P.name}`, 'err');
    best.list.splice(best.list.indexOf(best.it), 1); if (best.list !== p.bag) this.chestTouch?.(b);
    pr.pets.push(id); pr.pet = id; this.applyEquip(p);
    this.notice(p.id, `🐾 Đổi ${best.it.name} (${TIER_INFO[T].name}, lv ${best.it.lv ?? 1}) lấy ${P.name}: đang đi theo tướng (${P.text})`, 'ok');
  }
  petUse(p, id) {
    const pr = this.heroProgOf(p); if (!pr) return;
    if (id && !pr.pets?.includes(id)) return this.notice(p.id, 'Chưa có thú cưng này (mua trong Shop)', 'err');
    pr.pet = id; this.applyEquip(p);
    this.notice(p.id, id ? `🐾 ${PETS[id].icon} ${PETS[id].name} đi theo tướng (${PETS[id].text})` : '🐾 Đã cho thú cưng về nghỉ', 'ok');
  }
  /** Tự động đánh quái (13/11/2026): an idle hero with auto on goes for the nearest camp of level ≤ cfg.lv (80 tiles),
   *  rests below 35 % HP until 85 %, and waits 10 s after any order of the player */
  autoFarmTick() {
    for (const p of this.players.values()) {
      p.afkSafe = !!(p.alive && !p.bot && p.connected && this.heroProgOf(p)?.cfg?.farm);
      if (!p.alive || p.bot || !p.connected) continue;
      const cfg = this.heroProgOf(p)?.cfg; if (!cfg) continue;
      const h = this.units.get(p.hero); if (!h || h.dead) continue;
      // full bag (13/11/2026): go home (Về thành) and put everything in the Rương đồ, then carry on
      if (cfg.store && (p.bag?.length ?? 0) >= BAG_SIZE && !p.recallAt && this.t >= (p.storeBlockUntil ?? 0)) {
        const b = this.baseOf(p), th = b && this.thOf(b);
        if (!th || th.state === 'ruin' || th.state === 'build' || !this.itemOf(b, 'ruong-do')) { p.storeBlockUntil = this.t + 300; this.notice(p.id, '🎒 Túi đầy nhưng chưa có Thành trì / Rương đồ để cất', 'warn'); }
        else if (!this.team(p.id).combat) {
          if (p.chase && this.units.get(p.chase)?.camp != null) p.chase = 0;
          p.recallAt = this.t + RECALL_TIME; p.recallHp = h.hp; p.storeOnArrive = true; p.autoPauseUntil = this.t + RECALL_TIME + 10;
          this.notice(p.id, `🎒 Túi đầy (${BAG_SIZE} món): tự về thành cất đồ vào Rương`, 'ok');
          continue;
        } else if (p.chase && this.units.get(p.chase)?.camp != null && cfg.farm) { /* finish this fight first */ }
      }
      if (!cfg.farm) continue;
      // Tự động đánh (13/11/2026): the hero casts its skill whenever it is ready: in a fight (Lam Nguyệt aims at the nearest
      // enemy), Kim Hạ once 3+ mines are held (as the bots do)
      if (this.t >= p.skillReadyAt && !p.recallAt && HEROES[p.heroType]?.skill) {
        if (p.heroType === 'kim-ha') { if (this.mines.filter((m) => m.owner === p.id).length >= 3) this.useSkill(p, h, {}); }
        else if (this.team(p.id).combat) { const e = this.nearestEnemy(h, 8); if (e) this.useSkill(p, h, { x: e.x, y: e.y }); }
      }
      if (this.t < (p.autoPauseUntil ?? 0) || p.upGoal || p.recallAt) continue; // never walk off during Về thành
      // fewer soldiers than cfg.home: stop, go home (Về thành) and stay there, auto off
      if (cfg.home > 0 && p.units.filter((id) => { const u = this.units.get(id); return u && !u.dead; }).length < cfg.home) {
        if (p.recallAt) continue;
        if (p.chase && this.units.get(p.chase)?.camp != null) p.chase = 0;
        const b = this.baseOf(p), th = b && this.thOf(b);
        if (!th || th.state === 'ruin' || th.state === 'build') { cfg.farm = false; this.notice(p.id, `🤖 Quân dưới ${cfg.home}: tắt tự động đánh (không có Thành trì để về)`, 'warn'); continue; }
        if (this.team(p.id).combat) continue; // wait for the fight to end, then go
        p.recallAt = this.t + RECALL_TIME; p.recallHp = h.hp; p.autoHome = true;
        cfg.farm = false;
        this.notice(p.id, `🤖 Quân còn dưới ${cfg.home}: tự về thành và nghỉ (đã tắt tự động đánh)`, 'warn');
        continue;
      }
      const f = h.hp / h.maxHp;
      if (f < 0.35) p.autoRest = true; else if (f >= 0.85) p.autoRest = false;
      if (p.autoRest) { if (p.chase && this.units.get(p.chase)?.camp != null) p.chase = 0; continue; }
      const cur = p.chase && this.units.get(p.chase); if (cur && !cur.dead) continue;
      if (p.path?.length && !p.autoWalk) continue; // walking somewhere the player chose
      // 16/11/2026: the nearest camp of the chosen levels wherever it is (it looked only 80 tiles round, so a hero far from
      // the level 7–10 camps in the middle just stood there)
      let best = null, bd = Infinity;
      for (const c of this.camps) { if (c.level > cfg.lv || c.level < (cfg.lvMin ?? 1) || !c.guards.size) continue; const d = Math.hypot(c.x - h.x, c.y - h.y); if (d < bd) { bd = d; best = c; } }
      if (!best) { if (this.t >= (p.autoNoCampAt ?? 0)) { p.autoNoCampAt = this.t + 120; this.notice(p.id, `🤖 Chưa có bãi quái cấp ${cfg.lvMin ?? 1}–${cfg.lv} nào còn quái (đang chờ hồi sinh)`, 'warn'); } continue; }
      let e = null, ed = Infinity;
      for (const id of best.guards) { const u = this.units.get(id); if (!u || u.dead) continue; const d = Math.hypot(u.x - h.x, u.y - h.y); if (d < ed) { ed = d; e = u; } }
      if (!e) continue;
      this.provoke(p, e.team); p.chase = e.id; p.chaseGoal = 0; p.goalMine = -1; p.repathAt = 0; p.autoWalk = true;
    }
  }
  /** the chase target is walled in: walk to the first structure on the shortest way through and attack it, then go on */
  breachTo(p, h, e) {
    const r = this.world.pathThrough(h.x, h.y, e.x, e.y); if (!r) return;
    const blk = this.near(r.hit.x, r.hit.y, 3).find((u) => u.kind === 'build' && !u.dead && Math.abs(u.x - r.hit.x) <= (u.body ?? 0.5) + 0.01 && Math.abs(u.y - r.hit.y) <= (u.body ?? 0.5) + 0.01);
    if (!blk || blk.id === e.id || !this.hostile(h, blk)) { if (r.pts.length) p.path = r.pts.slice(-40); return; }
    if (!p.chaseGoal) p.chaseGoal = e.id;
    p.chase = blk.id; p.breach = blk.id; p.repathAt = 0;
    p.path = r.pts.length ? [r.pts[r.pts.length - 1]] : null;
    if (r.pts.length > 1) { const w = this.world.path(h.x, h.y, r.pts[r.pts.length - 1].x, r.pts[r.pts.length - 1].y, 80000); if (w) p.path = w; }
  }
  retreatCheck(p, h) {
    // hero walked away from its duel: break off (one free hit on the back unless Thần tốc)
    const f = this.units.get(h.foe);
    if (f && dist(h, f) > 2.2) this.breakOff(h, p);
  }
  breakOff(u, p) {
    const clean = p && p.heroType === 'phong-vu' && p.skillUntil > this.t;
    const f = this.units.get(u.foe);
    if (f && !clean && !f.ranged && dist(u, f) < f.range + 1.2) this.damage(f, u, f.atk * 1.5, {});
    this.unpair(u);
  }
  unpair(u) {
    const f = this.units.get(u.foe);
    if (f) { f.attackers.delete(u.id); if (f.foe === u.id) f.foe = 0; }
    for (const id of u.attackers) { const a = this.units.get(id); if (a && a.foe === u.id) a.foe = 0; }
    u.attackers.clear(); u.foe = 0;
  }

  contacts() {
    // touching (≤ 1.2 tiles) puts both sides into combat
    for (const u of this.units.values()) {
      if (u.dead || u.rout) continue;
      const ut = this.team(u.team);
      for (const e of this.near(u.x, u.y, 1.2)) {
        if (!this.hostile(u, e)) continue;
        if (u.kind === 'guard' && !this.inGuardZone(u, e)) continue;
        if (e.kind === 'guard' && !this.inGuardZone(e, u)) continue;
        this.engage(u.team); this.engage(e.team);
        break;
      }
      // guards notice intruders inside their mine ring
      if (u.kind === 'guard' && !ut.combat && this.tick % 5 === 0) {
        // base defenders have no mine (their home is the Thành trì): a missing mine here crashed the server (11/11/2026)
        const c = this.guardHome(u), m = this.mines[u.mine], r = u.boss ? 7 : u.ev ? 6 : u.camp != null ? 4.5 : u.baseKey ? BASE_ZONE + 1.5 : m ? CAPTURE_R(m.type) + 1.5 : 0;
        if (c && r) for (const e of this.near(c.x, c.y, r)) if (this.hostile(u, e)) { this.engage(u.team); break; }
      }
    }
  }
  /** player p picks a fight with a monster team (camp, boss, mine guards): both sides may now attack each other */
  provoke(p, key) { if (!p) return; const tm = this.team(key); tm.aggro ??= new Set(); for (const m of this.partyMembers?.(p) ?? [p]) tm.aggro.add(m.id); }
  engage(key) { const t = this.team(key); if (!t.combat) { t.combat = true; t.kills = 0; } t.lastCombat = this.t; }
  combatState() {
    for (const [key, tm] of this.teams) {
      if (!tm.combat) continue;
      const members = this.membersOf(key);
      let close = false;
      for (const u of members) {
        const r = u.boss ? 7 : u.kind === 'guard' ? 3 : 6;
        for (const e of this.near(u.x, u.y, r)) {
          if (!this.hostile(u, e)) continue;
          if (u.kind === 'guard' && !this.inGuardZone(u, e)) continue;
          close = true; break;
        }
        if (close) break;
      }
      if (close) tm.lastCombat = this.t;
      else if (this.t - tm.lastCombat > 2) this.endCombat(key, tm, members);
    }
  }
  membersOf(key) {
    if (typeof key === 'string' && key[0] === 'B') return [...this.units.values()].filter((u) => u.team === key && !u.dead);
    if (typeof key === 'string' && key[0] === 'c') return [...this.camps[+key.slice(1)].guards].map((id) => this.units.get(id)).filter((u) => u && !u.dead);
    if (typeof key === 'string' && key[0] === 'b') return [...this.units.values()].filter((u) => u.team === key && !u.dead);
    // world-event monsters ('ev' + n, 14/11/2026: they fell into the mine branch below and threw on every combat check,
    // which aborted the rest of the tick: no economy / camp respawn / boss respawn / base tick while an event team existed)
    if (typeof key === 'string' && key.startsWith('ev')) return [...this.units.values()].filter((u) => u.team === key && !u.dead);
    if (typeof key === 'string') { const m = this.mines[+key.slice(1)]; if (!m) return []; return [...m.guards].map((id) => this.units.get(id)).filter((u) => u && !u.dead); }
    const p = this.players.get(key); if (!p || !p.alive) return [];
    return [this.units.get(p.hero), ...p.units.map((id) => this.units.get(id))].filter((u) => u && !u.dead);
  }
  endCombat(key, tm, members) {
    tm.combat = false; tm.aggro = null; // monsters calm down: they are neutral again
    for (const u of members) {
      this.unpair(u);
      if (tm.kills > 0 && u.kind !== 'guard') { u.act = ACT.victory; u.actT = this.t; }
      if (u.kind === 'guard' && !u.defender) { u.hp = u.maxHp; }
    }
    if (typeof key === 'number') { const p = this.players.get(key); if (p) this.relayout(p); }
  }

  /** the order the army follows (12/11/2026): attack order (p.chase) → only that target; capture order on a guarded mine →
   *  only its guards. null = no order, fight the nearest as usual. Only the hero's army obeys it (not mine garrisons). */
  focusOf(p, u) {
    if (!p || u.kind !== 'unit') return null;
    if (p.chase) { const e = this.units.get(p.chase); if (e && !e.dead) return (x) => x.id === e.id; }
    if (p.goalMine >= 0) { const m = this.mines[p.goalMine]; if (m && m.guards.size && m.owner !== p.id) return (x) => m.guards.has(x.id); }
    return null;
  }
  pairing() {
    const cand = [];
    for (const u of this.units.values()) {
      // 14/11/2026: a (melee) boss always swings at the NEAREST enemy, re-checked every few ticks (knights in front soak it)
      if (u.boss && !u.dead && !u.ranged && this.tick % 3 === 0 && this.team(u.team).combat) {
        let ne = null, nd = 1e9;
        for (const e of this.near(u.x, u.y, 9)) { if (e.kind === 'build' || !this.hostile(u, e) || !this.pairable(e) || !this.inGuardZone(u, e)) continue; const d = dist(u, e); if (d < nd) { nd = d; ne = e; } }
        if (ne) { if (ne.id !== u.foe) { const of = this.units.get(u.foe); if (of) of.attackers.delete(u.id); u.foe = ne.id; ne.attackers.add(u.id); } continue; }
      }
      if (u.dead || u.rout || u.foe || u.ranged || u.kind === 'hero' || u.kind === 'build') continue;
      const tm = this.team(u.team); if (!tm.combat) continue;
      if (u.attackers.size) { const a = [...u.attackers][0]; u.foe = a; continue; }
      const p = this.playerOf(u);
      const h = p ? this.units.get(p.hero) : null;
      if (p && (p.retreating || p.pullBackUntil > this.t)) continue;
      const pr = p ? Math.max(8, this.engageR(p, u)) : 8, fo = this.focusOf(p, u);
      for (const e of this.near(u.x, u.y, pr)) {
        if (!this.hostile(u, e) || e.attackers.size >= e.cap || !this.pairable(e)) continue;
        if (fo && !fo(e)) continue;
        if (u.kind === 'guard' && !this.inGuardZone(u, e)) continue;
        if (e.kind === 'guard' && !this.inGuardZone(e, u)) continue;
        if (h && dist(h, e) > pr + 3) continue;
        cand.push([dist(u, e), u, e]);
      }
    }
    cand.sort((a, b) => a[0] - b[0]);
    for (const [, a, e] of cand) {
      if (a.foe || e.attackers.size >= e.cap || e.dead) continue;
      if (e.kind === 'hero' && !this.pairable(e)) continue;
      a.foe = e.id; e.attackers.add(a.id); a.firstHit = true;
      if (!e.foe && !e.ranged && e.kind !== 'hero' && e.kind !== 'build') { e.foe = a.id; a.attackers.add(e.id); e.firstHit = true; }
    }
  }
  isRetreating(p, h) {
    // hero heading away from the nearest enemy
    if (!p.path || !p.path.length) return false;
    const goal = p.path[p.path.length - 1];
    let ne = null, nd = 1e9;
    for (const e of this.near(h.x, h.y, 8)) if (this.hostile(h, e)) { const d = dist(h, e); if (d < nd) { nd = d; ne = e; } }
    if (!ne) return false;
    return Math.hypot(goal.x - ne.x, goal.y - ne.y) > nd + 3;
  }

  // ------------------------------------------------------------------ per-unit behaviour
  act(u) {
    const t = this.t;
    if (u.act !== ACT.idle && u.act !== ACT.walk && u.act !== ACT.death && !(u.boss && u.act === ACT.hit)) {
      const dur = u.act === ACT.attack ? 0.35 : u.act === ACT.hit ? 0.25 : u.act === ACT.skill ? 1.2 : 1.6;
      if (t - u.actT > dur) u.act = ACT.idle;
    }
    if (u.rout) return;
    if (u.kind === 'build') return this.actBuild(u);
    if (u.kind === 'guard') return this.actGuard(u);
    const p = this.playerOf(u); if (!p) return;
    const h = this.units.get(p.hero);
    const tm = this.team(u.team);
    if (u.kind === 'hero') return this.actHero(u, p);
    if (u.stunUntil > t) return;
    let mv = false;
    const R = this.engageR(p, u);
    const pulled = p.pullBackUntil > t; // "Rút quân": no targets for a few seconds, everyone back to the formation
    const fo = this.focusOf(p, u);
    if (u.healer && u.foe) this.unpair(u); // Y sư: never fights, stays with the formation
    if (u.foe) {
      const f = this.units.get(u.foe);
      if (!f || f.dead) { u.foe = 0; }
      else if (pulled) this.unpair(u);
      else if (fo && !fo(f) && f.foe !== u.id) this.unpair(u); // an order came in: leave this fight (unless it is hitting me)
      else if (dist(u, h) > R + 4 || p.retreating) { this.breakOff(u, p); }
      else { mv = this.fightMelee(u, f); this.setWalk(u, mv); return; }
    }
    if (u.ranged && !pulled) this.tryShoot(u, tm.combat);
    // in combat every unit picks a target inside (its formation distance + attack range + 2) and fights it;
    // it only holds its place when nothing is that close (or the hero is pulling back)
    if (tm.combat && !p.retreating && !pulled && u.sapper) { // Công binh: straight for the closest enemy wall / structure
      const w = this.sapperTarget(u, Math.max(R + 6, 18));
      if (w && (!fo || fo(w) || w.type === 'tuong')) { mv = this.fightMelee(u, w); this.setWalk(u, mv); return; }
    }
    if (tm.combat && !p.retreating && !pulled && !u.healer) {
      if (!u.ranged) {
        const e = this.engageTarget(u, h, R, (e) => this.pairable(e) && (!fo || fo(e)), 'm');
        if (e) { mv = this.fightMelee(u, e); if (!mv) u.runDist = 0; this.setWalk(u, mv); return; }
        // every enemy close by already has its fill of attackers: walk around the crowd to a free side of the nearest
        // enemy and fight there instead of standing still at the back (12/11/2026)
        const e2 = this.flankTarget(u, h, fo ? Math.max(R + 6, 24) : Math.max(R + 6, 12), fo, false, 'f');
        if (e2) { mv = this.flankMelee(u, e2); if (!mv) u.runDist = 0; this.setWalk(u, mv); return; }
      } else if (this.t >= u.nextAtk - 0.05 || u.chasing) {
        const e = fo ? this.flankTarget(u, h, Math.max(R + 6, 24), (x) => fo(x) && this.shootable(x) && !(u.ranged === 'fireball' && x.fly), true, 'rf') : this.engageTarget(u, h, R, (e) => this.shootable(e) && !(u.ranged === 'fireball' && e.fly), 're');
        if (e && dist(u, e) > u.range * 0.9) {
          u.chasing = true;
          mv = !this.moveTo(u, e.x, e.y, u.speed * (u.slowUntil > t ? 0.8 : 1) * (u.roarSlow ? 0.8 : 1), u.range * 0.85);
          this.setWalk(u, mv); return;
        }
        u.chasing = false;
        if (e) { u.dir = dirOf(e.x - u.x, e.y - u.y); u.moving = false; this.setWalk(u, false); return; }
      } else if (this.engageTarget(u, h, R, (e) => this.shootable(e), 'rw')) { u.moving = false; this.setWalk(u, false); return; }
    }
    u.chasing = false;
    // formation: follow the hero
    if (!tm.combat || pulled || h.moving || dist(u, h) > R + 3 || (u.kind === 'pet' && dist(u, h) < 1.3)) { // a pet never idles on top of its hero
      const tg = this.slotTarget(p, h, u);
      const sp = tm.combat ? u.speed : this.teamSpeed(p) * 1.3 + (dist(u, tg) > 3 ? 1.5 : 0);
      mv = !this.moveTo(u, tg.x, tg.y, sp * (u.slowUntil > t ? 0.8 : 1) * (u.roarSlow ? 0.8 : 1));
      if (!mv && !h.moving) u.dir = h.dir;
    } else u.moving = false;
    if (tm.combat && !u.moving && !u.foe) { const e = this.nearestEnemy(u, 8); if (e) u.dir = dirOf(e.x - u.x, e.y - u.y); }
    if (!mv) u.runDist = 0;
    this.setWalk(u, mv);
  }
  /** how far a unit reaches out for targets in combat: its distance from the hero in the formation + its range + 2 */
  engageR(p, u) {
    const o = p.layout?.get(u.id);
    return (o ? Math.hypot(o.x, o.y) : 2) + u.range + 2;
  }
  /** nearest hostile enemy within R of the unit and not too far from the own hero */
  engageTarget(u, h, R, ok, slot = null) {
    const pass = (e) => this.hostile(u, e) && ok(e) && !(e.kind === 'guard' && !this.inGuardZone(e, u)) && dist(h, e) <= R + 3;
    return slot ? this.memoTarget(u, slot, R, pass) : this.scanTarget(u, R, pass);
  }
  /** closest unit within R that passes */
  scanTarget(u, R, pass) {
    let best = null, bd = 1e9;
    for (const e of this.near(u.x, u.y, R)) { if (!pass(e)) continue; const d = dist(u, e); if (d < bd) { bd = d; best = e; } }
    return best;
  }
  /** 17/11/2026 perf: in a big army one search looks at 400-700 units, every soldier did it every tick (the server lagged).
   *  Search again 4-7 times a second (staggered by id); in between keep the last target while it is still valid. */
  memoTarget(u, slot, R, pass) {
    const m = (u.tgtMemo ??= {}), c = m[slot];
    if (c && this.tick < c.until) {
      if (!c.id) return null;
      const e = this.units.get(c.id);
      if (e && !e.dead && dist(u, e) <= R && pass(e)) return e;
    }
    const e = this.scanTarget(u, R, pass);
    m[slot] = { id: e?.id ?? 0, until: this.tick + 3 + (u.id % 3) };
    return e;
  }
  setWalk(u, mv) { if (u.act === ACT.idle || u.act === ACT.walk) u.act = mv ? ACT.walk : ACT.idle; }
  nearestEnemy(u, r, pred = () => true) {
    let best = null, bd = 1e9;
    for (const e of this.near(u.x, u.y, r)) {
      if (!this.hostile(u, e) || !pred(e)) continue;
      const d = dist(u, e); if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  fightMelee(u, f) {
    const d = dist(u, f), reach = u.range + (f.body ?? (f.cap > 2 ? 0.8 : 0.3));
    if (d > reach) {
      // big targets get attackers spread around them
      let tx = f.x, ty = f.y;
      if (f.cap > 1) { const k = [...f.attackers].indexOf(u.id), a = (k / f.cap) * Math.PI * 2; tx = f.x + Math.cos(a) * (reach * 0.8); ty = f.y + Math.sin(a) * (reach * 0.8); }
      else if (f.foe === u.id) { tx = (u.x + f.x) / 2 + (u.x - f.x) / d * (reach * 0.45); ty = (u.y + f.y) / 2 + (u.y - f.y) / d * (reach * 0.45); }
      this.moveTo(u, tx, ty, u.speed * (u.slowUntil > this.t ? 0.8 : 1) * (u.roarSlow ? 0.8 : 1), 0.05);
      return true;
    }
    u.dir = dirOf(f.x - u.x, f.y - u.y); u.moving = false;
    if (this.t >= u.nextAtk && u.stunUntil <= this.t) { if (u.breath) this.breath(u, f); else this.meleeHit(u, f); }
    return false;
  }
  /** nearest enemy for a melee unit with nothing to do; unlike engageTarget it may be a camp monster whose zone the unit is
   *  still outside of (the unit walks in to fight) */
  flankTarget(u, h, R, only = null, ranged = false, slot = null) {
    const pass = (e) => this.hostile(u, e) && (ranged || (this.pairable(e) && !(u.noFly && e.fly))) && !(e.kind === 'build' && !only) && (!only || only(e)) && dist(h, e) <= R + 3;
    return slot ? this.memoTarget(u, slot, R, pass) : this.scanTarget(u, R, pass);
  }
  /** an unpaired melee unit goes to its own spot around f (spread by unit id so a crowd fans out) and hits when it is there */
  flankMelee(u, f) {
    const reach = u.range + (f.body ?? (f.cap > 2 ? 0.8 : 0.3)), d = dist(u, f);
    if (d <= reach) {
      u.dir = dirOf(f.x - u.x, f.y - u.y); u.moving = false;
      if (this.t >= u.nextAtk && u.stunUntil <= this.t) { if (u.breath) this.breath(u, f); else this.meleeHit(u, f); }
      return false;
    }
    const a = Math.atan2(u.y - f.y, u.x - f.x) + (((u.id * 0.618) % 1) - 0.5) * 2.6;
    const tx = f.x + Math.cos(a) * reach * 0.85, ty = f.y + Math.sin(a) * reach * 0.85;
    this.moveTo(u, tx, ty, u.speed * (u.slowUntil > this.t ? 0.8 : 1) * (u.roarSlow ? 0.8 : 1), 0.1);
    return true;
  }
  meleeHit(u, f) {
    const rage = u.boss && u.hp < u.maxHp * BOSS_ENRAGE.at;
    if (rage && !u.enraged) { u.enraged = true; this.events.push({ k: 'txt', x: u.x, y: u.y - 2, s: 'CUỒNG NỘ!' }); }
    u.nextAtk = this.t + u.cd / (rage ? BOSS_ENRAGE.speed : 1); u.act = ACT.attack; u.actT = this.t;
    let atk = u.atk;
    const extra = {};
    if (u.charge && u.runDist >= 3) { atk *= 2; extra.crit = true; this.events.push({ k: 'txt', x: u.x, y: u.y, s: 'Xung phong!' }); }
    u.runDist = 0;
    if (u.type === 'linh-giao' && f.cls === 'cav' && u.firstHit) f.stunUntil = this.t + 0.5;
    if (u.slow) f.slowUntil = this.t + 2;
    u.firstHit = false;
    if (u.ranged === 'arrow') atk *= 0.5; // archer dagger
    if (u.sapper) return this.sapperBlast(u, f); // Công binh: one blast, then gone
    this.damage(u, f, atk, extra);
    // Voi chiến / Vua Thành: every hit splashes the enemies around the target
    if (u.trample || (u.homeHero && u.aoe)) {
      for (const q of this.near(f.x, f.y, u.aoe || 1.2)) if (q !== f && !q.dead && !q.fly && this.hostile(u, q)) this.damage(u, q, atk * 0.6);
      if (this.t - (u.stompFx ?? -9) > 1.5) { u.stompFx = this.t; this.events.push({ k: 'boom', x: f.x, y: f.y, r: u.aoe || 1.2, kind: 'stomp' }); }
    }
    // specials
    if (u.stomp && this.t >= u.nextSpecial) {
      u.nextSpecial = this.t + 6;
      for (const e of this.near(u.x, u.y, 2)) if (this.hostile(u, e) && !e.fly) this.damage(u, e, 50 * (u.atkK ?? 1), { fixed: true }); // camp monsters: scaled like their attack
      this.events.push({ k: 'boom', x: u.x, y: u.y, r: 2, kind: 'stomp' });
    }
  }
  tryShoot(u, inCombat) {
    if (this.t < u.nextAtk) return;
    if (u.attackers.size && u.ranged === 'arrow' && u.kind !== 'build') {
      // archer pinned by melee: fights back with a dagger
      const f = this.units.get([...u.attackers][0]);
      if (f && dist(u, f) < 1.3) { u.dir = dirOf(f.x - u.x, f.y - u.y); this.meleeHit(u, f); return; }
    }
    if (u.ranged === 'fireball' && u.attackers.size) return;
    const range = u.range;
    let target = null;
    const fo = this.focusOf(this.playerOf(u), u);
    if (fo) { // an order: shoot only at it
      for (const e of this.near(u.x, u.y, range)) if (fo(e) && this.hostile(u, e) && this.shootable(e) && !(e.fly && (u.noFly || u.ranged === 'fireball' || u.ranged === 'rock')) && !(u.airOnly && !e.fly) && dist(u, e) >= (u.minRange || 0) && (!target || dist(u, e) < dist(u, target))) target = e;
    } else if (u.ranged === 'fireball' || u.ranged === 'rock' || u.ranged === 'scatter') target = this.bestBlast(u, range, u.ranged === 'scatter');
    else {
      let best = null, bs = -1e9;
      for (const e of this.near(u.x, u.y, range)) {
        if (!this.hostile(u, e) || !this.shootable(e)) continue;
        if (u.noFly && e.fly) continue;
        if (u.airOnly && !e.fly) continue;
        if (u.minRange && dist(u, e) < u.minRange) continue;
        if (u.kind === 'guard' && !this.inGuardZone(u, e)) continue;
        if (e.kind === 'guard' && !this.inGuardZone(e, u) && !this.team(e.team).combat) continue;
        const d = dist(u, e);
        let s = -d;
        if (e.foe && this.units.get(e.foe)?.team === u.team) s += 6;
        if (K(u.atkCls ?? u.cls, e.cls) >= 1.3) s += 3;
        if (s > bs) { bs = s; best = e; }
      }
      target = best;
    }
    if (!target) return;
    const slow = u.attackers.size && u.ranged === 'orb' ? 1.3 : 1;
    u.nextAtk = this.t + u.cd * slow; u.act = ACT.attack; u.actT = this.t;
    u.dir = dirOf(target.x - u.x, target.y - u.y);
    this.engage(u.team);
    if (u.ranged === 'zap') return this.zap(u, target);
    const tx = target.x, ty = target.y;
    const dur = u.ranged === 'fireball' || u.ranged === 'rock' || u.ranged === 'scatter' ? 0.9 : u.ranged === 'arrow' ? 0.25 + dist(u, target) * 0.03 : 0.35;
    const pr = { kind: u.ranged, from: u.id, team: u.team, owner: u.owner ?? 0, x0: u.x, y0: u.y, tx, ty, target: target.id ?? 0, t1: this.t + dur };
    this.projectiles.push(pr);
    this.events.push({ k: 'proj', kind: u.ranged, x: u.x, y: u.y, x1: tx, y1: ty, dur, fly: u.fly ? 1 : 0 });
  }
  /** Vua Thành "Nộ Vương": stun around 3 tiles for 2 s + heal 25 %; Nữ hoàng Băng "Bão Tuyết": invisible 3 s + a ×3 bolt */
  homeHeroSkill(g) {
    if (g.skill === 'fury') {
      const foes = this.near(g.x, g.y, 3).filter((q) => !q.dead && q.kind !== 'build' && this.hostile(g, q));
      if (!foes.length) return false;
      for (const q of foes) { q.stunUntil = Math.max(q.stunUntil ?? 0, this.t + 2); this.damage(g, q, g.atk * 0.5); }
      g.hp = Math.min(g.maxHp, g.hp + g.maxHp * 0.25);
      this.events.push({ k: 'boom', x: g.x, y: g.y, r: 3, kind: 'stomp' }, { k: 'txt', x: g.x, y: g.y - 2, s: 'NỘ VƯƠNG!' });
    } else if (g.skill === 'blizzard') {
      const e = this.nearestEnemy(g, g.range, (q) => !q.dead && this.shootable(q)); if (!e) return false;
      g.invisUntil = this.t + 3; this.unpair(g);
      for (const q of this.near(e.x, e.y, 1.2)) if (!q.dead && this.hostile(g, q)) { this.damage(g, q, g.atk * 3, { pierce: true }); q.slowUntil = this.t + 4; }
      this.events.push({ k: 'boom', x: e.x, y: e.y, r: 1.2, kind: 'orb' }, { k: 'txt', x: g.x, y: g.y - 2, s: 'BÃO TUYẾT!' });
    } else return false;
    g.nextSpecial = this.t + (g.skillCd ?? 20); g.act = ACT.skill; g.actT = this.t;
    return true;
  }
  bestBlast(u, range, flyOk = false) {
    let best = null, bn = 0;
    for (const e of this.near(u.x, u.y, range)) {
      if (!this.hostile(u, e) || (e.fly && !flyOk) || !this.shootable(e)) continue;
      if (dist(u, e) < (u.minRange || 0)) continue;
      const n = this.near(e.x, e.y, 1.5).filter((q) => this.hostile(u, q) && !q.fly).length;
      if (n > bn) { bn = n; best = e; }
    }
    return best;
  }
  breath(u, f) {
    // cone 3 tiles, 50°, up to 3 targets (its duel partners first)
    u.nextAtk = this.t + u.cd; u.act = ACT.attack; u.actT = this.t;
    const ang = Math.atan2(f.y - u.y, f.x - u.x);
    u.dir = dirOf(f.x - u.x, f.y - u.y);
    const hits = [];
    for (const e of this.near(u.x, u.y, 3.6)) {
      if (!this.hostile(u, e)) continue;
      let da = Math.abs(Math.atan2(e.y - u.y, e.x - u.x) - ang); if (da > Math.PI) da = Math.PI * 2 - da;
      if (da > (25 * Math.PI) / 180 && dist(u, e) > 1) continue;
      hits.push([u.attackers.has(e.id) || e.id === f.id ? -1 : dist(u, e), e]);
    }
    hits.sort((a, b) => a[0] - b[0]);
    for (const [, e] of hits.slice(0, 3)) { this.damage(u, e, u.atk, {}); if (!e.fly) this.addFire(e.x, e.y, 0.8, 2, 6, u.team, u); }
    this.events.push({ k: 'breath', id: u.id, x: u.x, y: u.y, a: ang });
    // wing buffet every 10 s
    if (this.t >= u.nextSpecial && u.attackers.size) {
      u.nextSpecial = this.t + 10;
      for (const id of u.attackers) {
        const e = this.units.get(id); if (!e || e.fly) continue;
        const d = dist(u, e) || 1;
        const nx = e.x + ((e.x - u.x) / d), ny = e.y + ((e.y - u.y) / d);
        if (this.world.walkable(nx, ny)) { e.x = nx; e.y = ny; }
        e.stunUntil = this.t + 0.4;
      }
      this.events.push({ k: 'boom', x: u.x, y: u.y, r: 2, kind: 'wing' });
    }
  }
  actHero(h, p) {
    if (h.stunUntil > this.t) return;
    const lam = !!h.ranged;
    if (this.t >= h.nextAtk) {
      if (lam) {
        const e = this.nearestEnemy(h, h.range, (e) => this.shootable(e) || e.kind !== 'hero');
        if (e) {
          h.nextAtk = this.t + h.cd; h.act = ACT.attack; h.actT = this.t; h.dir = dirOf(e.x - h.x, e.y - h.y);
          this.engage(h.team);
          this.projectiles.push({ kind: 'star', from: h.id, team: h.team, x0: h.x, y0: h.y, tx: e.x, ty: e.y, target: e.id, t1: this.t + 0.35 });
          this.events.push({ k: 'proj', kind: 'star', x: h.x, y: h.y, x1: e.x, y1: e.y, dur: 0.35 });
        }
      } else {
        let f = this.units.get(h.foe);
        if (!f || f.dead || dist(h, f) > h.range + 0.4) f = this.units.get([...h.attackers][0]);
        if (!f || f.dead || dist(h, f) > h.range + 0.4) f = this.nearestEnemy(h, h.range + 0.3);
        if (f && !f.dead && dist(h, f) <= h.range + 0.4) { h.dir = dirOf(f.x - h.x, f.y - h.y); this.meleeHit(h, f); }
      }
    }
    this.setWalk(h, h.moving);
  }
  actBuild(u) {
    if (!u.atk) return;
    const b = this.bases.get(u.baseKey), it = b?.items.find((i) => i.id === u.bItem);
    if (!it || it.state === 'build') return; // still being built: does not shoot yet
    // Cột sét ẩn (16/11/2026): underground until an enemy comes within hideR, back down 20 s after the last one left
    if (u.hideR) {
      if (this.tick % 5 === 0) {
        const near = this.nearestEnemy(u, u.hideR, (e) => !e.dead && e.kind !== 'build');
        if (near) { u.seenT = this.t; if (u.hidden) { u.hidden = false; it.hid = false; this.basesDirty = true; this.events.push({ k: 'boom', x: u.x, y: u.y, r: 1, kind: 'orb' }); } }
        else if (!u.hidden && this.t - (u.seenT ?? -99) > 20) { u.hidden = true; it.hid = true; this.basesDirty = true; this.unpair(u); }
      }
      if (u.hidden) return;
    }
    if (u.beam) return this.beamTick(u);
    this.tryShoot(u, true);
  }
  /** Cột sét: instant bolt, then jumps to `chain` more enemies close to each other (−30 % per jump) */
  zap(u, e) {
    let cur = e, dmg = u.atk;
    const hit = new Set([e.id]), pts = [[+u.x.toFixed(2), +u.y.toFixed(2)], [+e.x.toFixed(2), +e.y.toFixed(2)]];
    this.damage(u, e, dmg, { pierce: true });
    for (let k = 0; k < (u.chain || 0); k++) {
      dmg *= 0.7; let nx = null, nd = 2.6;
      for (const q of this.near(cur.x, cur.y, 2.6)) if (!hit.has(q.id) && !q.dead && q.kind !== 'build' && this.hostile(u, q) && this.shootable(q)) { const d = dist(cur, q); if (d < nd) { nd = d; nx = q; } }
      if (!nx) break;
      hit.add(nx.id); this.damage(u, nx, dmg, { pierce: true }); pts.push([+nx.x.toFixed(2), +nx.y.toFixed(2)]); cur = nx;
    }
    this.events.push({ k: 'zap', pts });
  }
  /** Tháp Hỏa Ngục: a beam on one target, damage ×1 → ×beam over beamT s while it stays on it (atk = damage / s) */
  beamTick(u) {
    if (this.t < u.nextAtk) return;
    u.nextAtk = this.t + 0.25;
    let e = u.beamTo ? this.units.get(u.beamTo) : null;
    if (!e || e.dead || !this.hostile(u, e) || !this.shootable(e) || dist(u, e) > u.range + (e.body ?? 0)) {
      e = null; let bs = -1e9;
      for (const q of this.near(u.x, u.y, u.range)) { if (q.dead || !this.hostile(u, q) || !this.shootable(q)) continue; const s = (q.maxHp ?? 0) - dist(u, q) * 10; if (s > bs) { bs = s; e = q; } }
      u.beamTo = e?.id ?? 0; u.beamT0 = this.t;
    }
    if (!e) return;
    const k = 1 + (u.beam - 1) * Math.min(1, (this.t - u.beamT0) / (u.beamT || 4));
    u.act = ACT.attack; u.actT = this.t; u.dir = dirOf(e.x - u.x, e.y - u.y);
    this.engage(u.team);
    this.damage(u, e, u.atk * 0.25 * k, { pierce: true });
    this.events.push({ k: 'beam', id: u.id, to: e.id, s: +k.toFixed(1) });
  }
  /** Công binh: the keg blows up (walls ×SAPPER_WALL, other structures ×2 through damage(), soldiers ×1), the sapper is gone */
  sapperBlast(u, f) {
    const x = f.x, y = f.y;
    u.nextAtk = this.t + 9;
    for (const q of this.near(x, y, u.aoe || 1.5)) if (!q.dead && !q.fly && this.hostile(u, q)) this.damage(u, q, u.atk * (q.type === 'tuong' ? SAPPER_WALL / SIEGE_DEF : 1));
    this.events.push({ k: 'boom', x, y, r: u.aoe || 1.5, kind: 'fireball' });
    if (!u.dead) this.kill(u, null);
  }
  /** Công binh target: the closest enemy wall, else the closest enemy structure */
  sapperTarget(u, R) {
    let w = null, wd = 1e9, b = null, bd = 1e9;
    for (const e of this.near(u.x, u.y, R)) {
      if (e.kind !== 'build' || e.dead || e.hidden || !this.hostile(u, e)) continue;
      const d = dist(u, e);
      if (e.type === 'tuong') { if (d < wd) { wd = d; w = e; } } else if (d < bd) { bd = d; b = e; }
    }
    return w ?? b;
  }
  /** Y sư: every second, every hurt friend within HEAL_R gets the best heal around it (healers do not stack) */
  healTick() {
    if (this.tick % 20) return;
    const best = new Map();
    for (const u of this.units.values()) {
      if (u.dead || !u.healer) continue;
      const pct = HEAL_PCT[Math.min(HEAL_PCT.length, u.lv ?? 1) - 1] ?? HEAL_PCT[0];
      let any = false;
      for (const q of this.near(u.x, u.y, HEAL_R)) {
        if (q.dead || q.team !== u.team || q.kind === 'build' || q.hp >= q.maxHp) continue;
        const v = pct * (q.kind === 'hero' ? 0.5 : 1); any = true;
        if (v > (best.get(q) ?? 0)) best.set(q, v);
      }
      if (any) this.events.push({ k: 'heal', x: +u.x.toFixed(2), y: +u.y.toFixed(2), r: HEAL_R });
    }
    for (const [q, v] of best) q.hp = Math.min(q.maxHp, q.hp + q.maxHp * v);
  }
  actGuard(g) {
    const m = this.guardHome(g);
    const tm = this.team(g.team);
    if (g.stunUntil > this.t || g.hiddenUntil > this.t) return;
    if (g.homeHero && tm.combat && this.t >= g.nextSpecial && this.homeHeroSkill(g)) return;
    if (g.boss && tm.combat && this.t >= g.nextSpecial && this.bossSkill(g)) return;
    if (g.boss && g.act === ACT.skill) return;
    if (g.foe) {
      const f = this.units.get(g.foe);
      if (!f || f.dead || !this.inGuardZone(g, f) || Math.hypot(g.x - m.x, g.y - m.y) > this.guardZoneR(g)) this.unpair(g);
      else { const mv = this.fightMelee(g, f); this.setWalk(g, mv); return; }
    }
    if (g.ranged) this.tryShoot(g, tm.combat);
    if (!tm.combat || !g.foe) {
      const mv = !this.moveTo(g, g.homeX, g.homeY, g.speed * 0.8, 0.1);
      if (!mv && !tm.combat) g.dir = dirOf(g.homeX - m.x, g.homeY - m.y);
      if (!mv && tm.combat) { const e = this.nearestEnemy(g, 8); if (e) g.dir = dirOf(e.x - g.x, e.y - g.y); }
      this.setWalk(g, mv);
    }
  }
  /** soldiers heal slowly once their army has been out of combat for 10 s (and they were not hurt for 10 s) */
  unitRegen(p) {
    const tm = this.team(p.id);
    if (tm.combat || this.t - tm.lastCombat < UNIT_REGEN_DELAY) return;
    for (const id of p.units) {
      const u = this.units.get(id);
      if (!u || u.dead || u.hp >= u.maxHp || this.t - u.lastHurt < UNIT_REGEN_DELAY) continue;
      u.hp = Math.min(u.maxHp, u.hp + u.maxHp * UNIT_REGEN_RATE * DT);
    }
  }
  heroRegen(p) {
    const h = this.units.get(p.hero); if (!h || h.dead) return;
    const rg = petBonus(this.petOf(p)).regen; // Phượng Hoàng Con: the hero and every soldier, also in a fight
    if (rg) for (const id of [p.hero, ...p.units]) { const u = this.units.get(id); if (u && !u.dead && u.hp < u.maxHp) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * rg * DT); }
    if (this.team(p.id).combat || this.t - h.lastHurt < 5 || h.hp >= h.maxHp) return;
    let rate = 0.02;
    for (const w of this.world.wells) if (Math.hypot(w.x - h.x, w.y - h.y) <= 2.5) { rate *= 3; break; }
    h.hp = Math.min(h.maxHp, h.hp + h.maxHp * rate * DT);
  }

  // ------------------------------------------------------------------ damage, projectiles, fire
  damage(a, e, base, { pierce = false, crit = false, fixed = false } = {}) {
    if (a.owner && e.owner && a.owner !== e.owner) this.war(a.owner, e.owner); // still fighting: keep the war going
    else if (a.owner && e.baseKey) this.warBase(a.owner, e.baseKey); else if (e.owner && a.baseKey) this.warBase(e.owner, a.baseKey);
    if (e.kind === 'build' && a.kind === 'unit') base *= SIEGE_MULT[a.type] ?? SIEGE_DEF; // soldiers break structures faster (12/11/2026)
    if (e.dead || e.hidden) return;
    if (a.slowHit && e.kind !== 'build') e.slowUntil = this.t + 2; // Nữ hoàng Băng
    // dodge (12/11/2026): the whole hit is missed; "Né!" shows for heroes (and a few soldiers)
    if (e.dodge > 0 && !fixed && e.kind !== 'build' && this.rand() < e.dodge) {
      if (this.t - (e.dodgeTxt ?? -9) > (e.kind === 'hero' ? 0.4 : 3)) { e.dodgeTxt = this.t; this.events.push({ k: 'txt', x: e.x, y: e.y - 0.6, s: 'Né!' }); }
      this.engage(e.team); this.engage(a.team);
      return;
    }
    let dmg = base;
    if (!fixed) {
      dmg *= K(a.atkCls ?? a.cls, e.cls) * (a.aura ?? 1) * (1 + (a.cAtk ?? 0)) * (1 - (e.cArm ?? 0)); // Hội thành aura
    }
    const ep = this.playerOf(e);
    if (!(pierce || a.pierce)) dmg *= 1 - e.armor;
    if (ep && ep.heroType === 'thach-lam' && ep.skillUntil > this.t) dmg *= 0.7;
    dmg *= 0.9 + this.rand() * 0.2;
    dmg = Math.max(1, Math.floor(dmg));
    e.hp -= dmg; e.lastHurt = this.t;
    if (a.ls > 0 && !a.dead && a.hp < a.maxHp) a.hp = Math.min(a.maxHp, a.hp + dmg * a.ls); // lifesteal
    if (a.owner) e.lastHitBy = a.owner;
    if (e.act === ACT.idle || e.act === ACT.walk) { e.act = ACT.hit; e.actT = this.t; }
    const k = !fixed && K(a.atkCls ?? a.cls, e.cls) >= 1.5;
    if (e.kind === 'build' && a.owner) this.onBuildHit(e, a);
    this.events.push({ k: 'dmg', id: e.id, x: e.x, y: e.y, v: dmg, c: crit || k ? 1 : 0 });
    if (a.owner && e.kind === 'guard' && !e.owner && !e.baseKey) this.provoke(this.playerOf(a), e.team);
    this.engage(e.team); this.engage(a.team);
    if (e.kind === 'hero' && a.owner) { const ap = this.playerOf(a); if (ap) ep.dmgBy.set(ap.id, (ep.dmgBy.get(ap.id) ?? 0) + dmg); }
    if (e.kind === 'hero') e.lastHitBy = a.owner;
    if (e.boss && a.owner) { const bp = this.playerOf(a); if (bp) this.quest(bp, 'bossdmg', dmg); }
    if (e.hp <= 0) this.kill(e, a);
  }
  kill(e, a) {
    if (!e.dead && this.bases?.size) this.battleKill(e, a);
    if (!e.dead) this.awardKillXp(e, a, a ? this.playerOf(a) : null); // hero XP (docs/design/19-cap-anh-hung.md)
    e.hp = 0; e.dead = true; e.deathT = this.t; e.act = ACT.death; e.actT = this.t;
    this.unpair(e);
    if (e.kind === 'build') { const ap = a ? this.playerOf(a) : null; if (ap) ap.score += e.value / 10; this.events.push({ k: 'die', id: e.id }); return this.onBuildKilled(e, a); }
    if (e.defender) { this.events.push({ k: 'die', id: e.id }); if (e.homeHero) this.homeHeroDown(e); return; }
    // soldiers lost to a boss (or its minions): remembered on the boss, refunded in part when it falls (14/11/2026)
    if (a && e.kind === 'unit' && e.owner && UNITS[e.type]) {
      const bo = a.boss ? a : a.summon ? this.units.get(a.master) : null;
      if (bo && !bo.dead) { bo.losses ??= {}; const L = (bo.losses[e.owner] ??= {}), op = this.players.get(e.owner); for (const [r, v] of Object.entries(unitCost(e.type, op?.heroType, e.lv ?? 1))) L[r] = (L[r] ?? 0) + v; }
    }
    const ap = a ? this.playerOf(a) : null;
    if (a) { a.kills++; this.team(a.team).kills++; }
    if (ap && ap.stats) ap.stats.killed += e.value;
    if (ap) ap.score += e.value / 10;
    this.events.push({ k: 'die', id: e.id });
    { const vp = e.boss ? null : this.playerOf(e) ?? (e.garrison && this.mines[e.mine]?.owner ? this.players.get(this.mines[e.mine].owner) : null); if (ap && vp && vp.id !== ap.id) this.quest(ap, 'pvp', 1); }
    if (e.boss) {
      const B = BOSSES[e.type];
      const killer = ap ?? (e.lastHitBy ? this.players.get(e.lastHitBy) : null);
      // every drop slot rolls on its own table (12/11/2026: no more guaranteed epic / legendary)
      const roll = (tbl) => { let r = this.rand(); for (const [t, pr] of tbl) { if (r < pr) return t; r -= pr; } return tbl[tbl.length - 1][0]; };
      const sh = this.shareWith(killer, e.x, e.y); // Tổ đội: every member close by gets the same tiers
      const cap = BOSS_LV_CAP(Math.min(BOSS_LV_MAX, (e.lv ?? 1) + (e.type === 'golem-kim-cuong' ? 1 : 0))); // item level ceiling by boss level
      const bl = Math.min(BOSS_LV_MAX, (e.lv ?? 1) + (e.type === 'golem-kim-cuong' ? 1 : 0)) - 1; // drop tables by boss level (13/11/2026)
      const tbl = (row) => row.map((p, i) => [TIERS[i], p]).filter(([, p]) => p > 0);
      [BOSS_DROP_A[bl], BOSS_DROP_B[bl], BOSS_DROP_B[bl]].forEach((row, k) => { let t = tbl(row); if (k === 0 && e.type === 'golem-kim-cuong') t = [['black', 0.005], ...t]; const tier = roll(t); if (killer?.bot && !sh.some((m) => !m.bot) && this.rand() >= BOT_DROP) return; if (sh.length) this.shareLoot(sh, tier, e.x, e.y, 2.2, killer, cap); else this.lootTo(this.dropItemFor(killer, tier, cap), e.x, e.y, 2.2, killer); });
      if (this.mode === 'endless') this.bossDead[e.type] = this.t;
      // 14/11/2026: its minions stay and fight on; they now drop loot like camp monsters of a matching level
      { const cl = Math.min(10, Math.min(BOSS_LV_MAX, (e.lv ?? 1) + (e.type === 'golem-kim-cuong' ? 1 : 0)) + 2);
        for (const v of this.units.values()) if (v.summon && v.master === e.id && !v.dead) { v.orphan = true; v.orphanAt = this.t; v.orphanHome = e.bossHome ?? { x: e.x, y: e.y }; v.lootCamp = cl; } }
      for (const m of sh) this.quest(m, 'boss', 1);
      // resources: a refund of the soldiers each player lost here + a level bonus split in the party
      if (this.mode === 'endless' && killer) {
        const all = this.shareAll(killer), lvl = Math.min(BOSS_LV_MAX, (e.lv ?? 1) + (e.type === 'golem-kim-cuong' ? 1 : 0)), f = this.partySplit(all.length);
        const who = new Set([...all, ...Object.keys(e.losses ?? {}).map((id) => this.players.get(+id)).filter((q) => q && q.alive && (q === killer || all.includes(q)))]);
        for (const m of who) {
          const got = {}, add = (r, v) => { v = Math.round(v); if (v > 0) { const g = this.gain(m, r, v); if (g > 0) got[r] = (got[r] ?? 0) + Math.round(g); } };
          for (const [r, v] of Object.entries(e.losses?.[m.id] ?? {})) add(r, v * BOSS_REFUND);
          if (all.includes(m)) for (const [r, v] of Object.entries(BOSS_RES_BONUS)) add(r, v * lvl * f);
          const txt = Object.entries(got).map(([r, v]) => `${v.toLocaleString('vi')} ${RES_INFO[r].name}`).join(', ');
          if (txt) this.notice(m.id, `👑 Thưởng hạ ${B.name}: +${txt}${e.losses?.[m.id] ? ` (gồm hoàn ${Math.round(BOSS_REFUND * 100)}% quân đã mất)` : ''}`, 'ok');
        }
      }
      this.notice(null, `👑 ${killer ? killer.name : 'Ai đó'} đã hạ boss ${B.name}! Đồ xịn vào túi người kết liễu.`, 'sys');
      this.notice(null, `👑 ${killer ? killer.name : 'Ai đó'} hạ thành công boss ${B.name}!`, 'ok');
      this.events.push({ k: 'boom', x: e.x, y: e.y, r: 4, kind: 'slam' });
    } else if (e.kind === 'guard' && e.ev) { // Sự kiện thế giới
      this.eventKill(e, ap ?? (e.lastHitBy ? this.players.get(e.lastHitBy) : null));
    } else if (e.kind === 'guard' && e.summon) { // a boss minion: no loot while its boss lives; after the boss falls, camp-monster loot
      if (e.orphan && e.lootCamp) {
        const killer = ap ?? (e.lastHitBy ? this.players.get(e.lastHitBy) : null), C = CAMPS[e.lootCamp], G = GUARDS[C.pack[0][0]];
        const sh = this.shareWith(killer, e.x, e.y);
        // 14/11/2026: one roll, at most ONE item per minion (not ×items, not one per party member): a random member close by gets it
        if (killer && G.loot && this.rand() < (G.drop ?? 0) * ORPHAN_DROP_MULT * (1 + (petBonus(this.petOf(killer)).loot ?? 0)) * (killer.bot ? BOT_DROP : 1)) {
          let r = this.rand(), tier = G.loot[G.loot.length - 1][0];
          for (const [t, pr] of G.loot) { if (r < pr) { tier = t; break; } r -= pr; }
          const to = sh.length ? sh[Math.floor(this.rand() * sh.length)] : killer;
          this.lootTo(this.dropItemFor(to, tier, CAMP_LV_CAP(e.lootCamp)), e.x, e.y, 0.8, to);
        }
        for (const m of sh) this.quest(m, 'monster', 1);
      }
    } else if (e.kind === 'guard' && e.camp != null) {
      const c = this.camps[e.camp], C = CAMPS[c.level];
      c.guards.delete(e.id);
      const killer = ap ?? (e.lastHitBy ? this.players.get(e.lastHitBy) : null);
      const sh = this.shareWith(killer, e.x, e.y);
      for (const m of sh) this.quest(m, 'monster', 1);
      // every monster rolls its own loot
      const G = GUARDS[e.type];
      for (let k = 0; k < (G.items ?? 1); k++) {
        if (!G.loot || this.rand() >= (G.drop ?? 0) * (1 + (petBonus(this.petOf(killer)).loot ?? 0)) * (killer?.bot ? BOT_DROP : 1)) continue; // Mèo Thần Tài · NPC lords half
        let r = this.rand(), tier = G.loot[G.loot.length - 1][0];
        for (const [t, pr] of G.loot) { if (r < pr) { tier = t; break; } r -= pr; }
        if (sh.length) this.shareLoot(sh, tier, e.x, e.y, 0.8, killer, CAMP_LV_CAP(c.level), this.partyShare(sh.length)); else this.lootTo(this.dropItemFor(killer, tier, CAMP_LV_CAP(c.level)), e.x, e.y, 0.8, killer);
      }
      if (!c.guards.size) {
        c.emptySince = this.t;
        const all = this.shareAll(killer); // resources (14/11/2026): every member anywhere, split evenly
        for (const m of all) {
          const rk = (1 + (petBonus(this.petOf(m)).res ?? 0)) * this.partySplit(all.length); for (const [r, v] of Object.entries(C.res)) this.gain(m, r, Math.round(v * rk)); // Lạc Đà Vàng · party share
          this.notice(m.id, `Dọn sạch bãi quái cấp ${c.level}${m !== killer ? ' (tổ đội)' : ''}: +${Object.entries(C.res).map(([r, v]) => `${Math.round(v * rk)} ${RES_INFO[r].name}`).join(', ')}`, 'ok');
        }
      }
    } else if (e.kind === 'guard' && e.garrison) {
      const m = this.mines[e.mine];
      m.guards.delete(e.id); m.changed = true;
      if (!m.guards.size && m.owner) { const o = this.players.get(m.owner); if (o) this.notice(o.id, `⚠ Đồn lính ở ${RES_INFO[m.type].mine} (${Math.floor(m.x)},${Math.floor(m.y)}) đã bị hạ hết!`, 'warn', { x: m.x, y: m.y }); }
    } else if (e.kind === 'guard') {
      const m = this.mines[e.mine];
      m.guards.delete(e.id); m.changed = true;
      if (m.guards.size === 0 && ap) {
        const rw = GUARD_SETS[m.type].reward;
        for (const [r, v] of Object.entries(rw)) this.gain(ap, r, v);
        this.notice(ap.id, `Hạ hết lính canh ${RES_INFO[m.type].mine}: +${Object.entries(rw).map(([r, v]) => `${v} ${RES_INFO[r].name}`).join(', ')}`, 'ok');
        m.emptySince = this.t;
        const tbl = MINE_DROPS[m.type];
        if (tbl && !(ap.bot && this.rand() >= BOT_DROP)) { let r = this.rand(), tier = tbl[tbl.length - 1][0]; for (const [t, pr] of tbl) { if (r < pr) { tier = t; break; } r -= pr; } this.lootTo(this.dropItemFor(ap, tier, MINE_LV_CAP[m.type] ?? 30), m.x, m.y + 2, 1, ap); }
      }
    } else if (e.kind === 'hero') {
      const p = this.playerOf(e);
      if (p) this.killPlayer(p, ap, 'killed');
    }
  }
  killPlayer(p, killer, why) {
    const h = this.units.get(p.hero);
    if (why !== 'reset') this.castleReturn?.(p, ' (tướng ngã, viện binh rút về)'); // 13/11/2026
    p.alive = false;
    if (why !== 'reset' && why !== 'stash' && this.mode !== 'endless') p.diedIn = this.match.n;
    if (h && !h.dead) { h.dead = true; h.deathT = this.t; h.act = ACT.death; h.actT = this.t; this.unpair(h); this.events.push({ k: 'die', id: h.id }); }
    for (const id of p.units) {
      const u = this.units.get(id); if (!u || u.dead) continue;
      this.unpair(u); u.rout = true; u.dead = true; u.deathT = this.t; u.act = ACT.death; u.actT = this.t;
      this.events.push({ k: 'rout', id: u.id });
    }
    // open world: a hero that dies keeps its mines (their garrison stays and defends them) until it respawns (11/11/2026)
    const keepMines = this.mode === 'endless' && why !== 'reset' && why !== 'left'; // leaving / offline (stash) keeps them too
    if (!keepMines) this.releaseMines(p);
    // a hero that really died: its mines are protected for 10 minutes (time to rebuild an army; 11/11/2026)
    // (12/11/2026: the 10-minute protection after death was turned off at the owner's request; MINE_PROTECT kept for later)
    else if (why !== 'stash' && MINE_PROTECT > 0) for (const m of this.mines) if (m.owner === p.id) { m.protectUntil = this.t + MINE_PROTECT; m.changed = true; }
    // open world (12/11/2026): players keep their gear through death (it comes back on the next hero), NPC lords still drop it
    const keepGear = this.mode === 'endless' && !p.bot && why !== 'reset';
    if (keepGear && why !== 'stash') p.keptGear = { equip: p.equip ?? {}, bag: p.bag ?? [] };
    // everything the hero carried falls on the ground
    if (h && !keepGear && why !== 'reset' && why !== 'stash') for (const it of [...Object.values(p.equip ?? {}).filter(Boolean), ...(p.bag ?? [])]) this.dropItem(it, h.x, h.y, 1.8);
    // NPC lords carry extra loot: 1–2 random pieces (uncommon..epic) for whoever brings them down
    if (h && p.bot && why !== 'reset' && why !== 'stash') {
      const n = 1 + (this.rand() < 0.5 ? 1 : 0);
      for (let k = 0; k < n; k++) { const r = this.rand(), tier = r < 0.45 ? 'uncommon' : r < 0.85 ? 'rare' : 'epic'; this.dropItem(this.dropItemFor(killer, tier), h.x, h.y, 2, killer?.id ?? 0); }
    }
    p.equip = {}; p.bag = [];
    for (const m of this.mines) if (m.cap?.by === p.id) { m.cap = null; m.changed = true; }
    // loot: 25 % of the stock to whoever dealt the damage; the part kept safe in Kho is not lootable and stays with the player
    const total = [...p.dmgBy.values()].reduce((s, v) => s + v, 0);
    const prot = this.mode === 'endless' ? this.protectedFor(p.acc) : null;
    if (why !== 'stash' && why !== 'reset') p.keptRes = prot ? Object.fromEntries(RES.map((r) => [r, Math.min(p.res[r] ?? 0, prot[r])])) : null;
    if (why !== 'stash' && why !== 'reset') for (const [pid, d] of p.dmgBy) {
      const k = this.players.get(pid); if (!k || !k.alive) continue;
      for (const r of RES) this.gain(k, r, Math.floor(Math.max(0, (p.res[r] ?? 0) - (prot?.[r] ?? 0)) * 0.25 * (d / total)));
    }
    const alive = Math.round(this.t - p.bornAt);
    p.deathInfo = { killer: killer ? killer.name : null, killerId: killer ? killer.id : 0, why, alive, bestMines: p.stats?.bestMines ?? 0, bought: Math.round(p.stats?.bought ?? 0), killed: Math.round(p.stats?.killed ?? 0), score: Math.round(p.score), hero: p.heroType };
    p.best = Math.max(p.best, Math.round(p.score));
    p.units = []; p.stowed = []; p.hold = !!(this.bases && this.baseOf(p)?.garrison.length); p.queue = []; p.path = null; p.chase = 0;
    const hn = HEROES[p.heroType];
    if (why === 'reset' || why === 'stash') { /* silent */ }
    else if (killer) this.notice(null, `⚔ ${killer.name} đã hạ ${p.name} (${hn.title})`, 'sys');
    else if (why === 'left') this.notice(null, `${p.name} đã rời trận`, 'sys');
    else if (why === 'zone') this.notice(null, `☠ ${p.name} gục ngoài bo`, 'sys');
    if (why !== 'reset' && why !== 'stash') this.onDeath?.(p);
  }
  removeUnit(u) {
    this.unpair(u);
    this.units.delete(u.id);
    const p = this.playerOf(u);
    if (p) p.units = p.units.filter((id) => id !== u.id);
  }
  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      if (pr.t1 > this.t) continue;
      this.projectiles.splice(i, 1);
      const a = this.units.get(pr.from) ?? { cls: 'ranged', team: pr.team, aura: 1, atk: 0, owner: pr.owner ?? 0, pierce: false };
      const atk = a.atk;
      if (pr.kind === 'arrow') { const e = this.units.get(pr.target); if (e && !e.dead) this.damage(a, e, atk); }
      else if (pr.kind === 'orb' || pr.kind === 'star') {
        const e = this.units.get(pr.target); const x = e && !e.dead ? e.x : pr.tx, y = e && !e.dead ? e.y : pr.ty;
        for (const q of this.near(x, y, a.aoe || 1)) if (this.hostile(a, q) && (q.kind !== 'hero' || this.shootable(q) || q === e)) this.damage(a, q, atk, { pierce: true });
        this.events.push({ k: 'boom', x, y, r: a.aoe || 1, kind: pr.kind });
      } else if (pr.kind === 'rock') {
        for (const q of this.near(pr.tx, pr.ty, a.aoe || 1.2)) if (this.hostile(a, q) && !q.fly) this.damage(a, q, atk);
        this.events.push({ k: 'boom', x: pr.tx, y: pr.ty, r: a.aoe || 1.2, kind: 'rock' });
      } else if (pr.kind === 'scatter') { // Pháo chùm: blast + shrapnel cone behind the impact (hits flyers too)
        for (const q of this.near(pr.tx, pr.ty, a.aoe || 1.2)) if (this.hostile(a, q)) this.damage(a, q, atk);
        const ang = Math.atan2(pr.ty - pr.y0, pr.tx - pr.x0), L = a.cone || 4;
        for (const q of this.near(pr.tx, pr.ty, L)) {
          if (q.dead || !this.hostile(a, q)) continue;
          const dx = q.x - pr.tx, dy = q.y - pr.ty, d = Math.hypot(dx, dy); if (d < 0.4 || d > L) continue;
          let da = Math.abs(Math.atan2(dy, dx) - ang); if (da > Math.PI) da = 2 * Math.PI - da;
          if (da < 0.55) this.damage(a, q, atk * 0.5);
        }
        this.events.push({ k: 'boom', x: pr.tx, y: pr.ty, r: a.aoe || 1.2, kind: 'rock' });
        this.events.push({ k: 'cone', x: pr.tx, y: pr.ty, a: +ang.toFixed(2), r: L });
      } else if (pr.kind === 'fireball') {
        for (const q of this.near(pr.tx, pr.ty, 1.5)) if (this.hostile(a, q) && !q.fly) this.damage(a, q, atk);
        this.addFire(pr.tx, pr.ty, 1.5, 3, 8, pr.team, a);
        this.events.push({ k: 'boom', x: pr.tx, y: pr.ty, r: 1.5, kind: 'fireball' });
      }
    }
    // dragons: breath instead of projectiles
    for (const u of this.units.values()) {
      if (u.dead || !u.breath || u.foe || u.rout || this.t < u.nextAtk || u.stunUntil > this.t) continue;
      const f = this.units.get(u.foe) ?? this.nearestEnemy(u, u.range, (e) => this.pairable(e) || e.kind !== 'hero');
      if (f && !f.dead && dist(u, f) <= u.range + 0.5) this.breath(u, f);
    }
  }
  /** burning ground: hurts only the enemies of whoever lit it (12/11/2026: catapult fire was burning its own army) */
  addFire(x, y, r, dur, dps, team, src = null) { this.fires.push({ x, y, r, until: this.t + dur, dps, team, src: { team, owner: src?.owner ?? 0, kind: src?.kind ?? 'unit', baseKey: src?.baseKey, garrison: src?.garrison, mine: src?.mine, dead: false, rout: false } }); this.events.push({ k: 'fire', x, y, r, dur }); }
  updateFires() {
    if (this.tick % 10 !== 0) { this.fires = this.fires.filter((f) => f.until > this.t); return; }
    for (const f of this.fires) for (const u of this.near(f.x, f.y, f.r)) if (!u.fly && !u.dead && (f.src ? this.hostile(f.src, u) : u.team !== f.team)) {
      u.hp -= f.dps * 0.5; u.lastHurt = this.t;
      if (u.hp <= 0) this.kill(u, null);
    }
    this.fires = this.fires.filter((f) => f.until > this.t);
  }
  cleanup() {
    for (const u of [...this.units.values()]) if (u.dead && this.t - u.deathT > (u.rout ? 1.6 : 1.2)) {
      this.units.delete(u.id);
      const p = this.playerOf(u);
      if (p && u.kind === 'unit') { p.units = p.units.filter((id) => id !== u.id); if (!this.team(p.id).combat) this.relayout(p); }
    }
  }

  // ------------------------------------------------------------------ mines & economy
  updateMines() {
    const dt = DT * 2;
    if (this.tick % 20 === 0) this.mineAlerts();
    if (this.tick % 1200 === 0) this.enforceMineCaps(); // every minute: anything that slipped past the capture check
    // mine upgrades finish for whoever holds the mine then (docs/design/can-cu/11-nang-cap-mo.md)
    // the mine changed hands while upgrading: the builder goes home, half the price comes back (12/11/2026)
    if (this.tick % 10 === 0) for (const m of this.mines) if (m.upAt && m.upOwner && m.owner !== m.upOwner) {
      const o = this.players.get(m.upOwner), back = {};
      for (const [r, v] of Object.entries(m.upCost ?? {})) back[r] = Math.floor(v / 2);
      if (o) { for (const [r, v] of Object.entries(back)) this.gain(o, r, v); this.notice(o.id, `⚠ ${RES_INFO[m.type].mine} bị chiếm: dừng nâng cấp, thợ xây về nhà (hoàn ${Object.entries(back).map(([r, v]) => `${v} ${RES_INFO[r].name}`).join(', ')})`, 'warn', { x: m.x, y: m.y }); }
      m.upAt = 0; m.upTotal = 0; m.upBy = undefined; m.upOwner = undefined; m.upCost = undefined; m.changed = true; this.basesDirty = true;
    }
    if (this.tick % 10 === 0) for (const m of this.mines) if (m.upAt && this.t >= m.upAt) {
      m.lv = (m.lv ?? 1) + 1; m.upAt = 0; m.upTotal = 0; m.upBy = undefined; m.upOwner = undefined; m.upCost = undefined; m.changed = true; this.basesDirty = true;
      if (m.owner) this.notice(m.owner, `⛏ ${RES_INFO[m.type].mine} đã lên cấp ${m.lv} (sản lượng ×${MINE_LV_MULT[m.lv - 1]})`, 'ok');
    }
    for (const m of this.mines) {
      const R = CAPTURE_R(m.type);
      const inside = this.near(m.x, m.y, R);
      const heroes = inside.filter((u) => u.kind === 'hero');
      const players = new Set(inside.filter((u) => u.owner && !u.rout).map((u) => u.owner));
      let who = 0;
      // the capture runs while the capturer's hero stands inside the circle, even if the army is fighting nearby;
      // it needs no guards / garrison left and no other player inside the circle
      if (heroes.length === 1 && players.size === 1 && m.guards.size === 0) {
        const p = this.players.get(heroes[0].owner);
        if (p && p.alive && p.id !== m.owner && !(m.protectUntil > this.t) && p.afkSafe && m.owner) { if (!(m.fullWarn?.[p.id] > this.t)) { (m.fullWarn ??= {})[p.id] = this.t + 20; this.notice(p.id, '🛡 Đang bật Tự động đánh (bảo vệ treo máy): không chiếm mỏ của người khác', 'err'); } }
        else if (p && p.alive && p.id !== m.owner && !(m.protectUntil > this.t) && (!m.owner || p.goalMine === m.id || p.bot)) { // 14/11/2026: someone's mine is only taken on an order
          if (this.mineRoom(p.id, m.type)) who = p.id;
          else if (!(m.fullWarn?.[p.id] > this.t)) { (m.fullWarn ??= {})[p.id] = this.t + 20; this.notice(p.id, `Đã đủ ${this.mineCapOf(p.id, m.type)} ${RES_INFO[m.type].mine} (giới hạn mỗi người), không chiếm thêm được. Bỏ bớt mỏ hoặc mở thêm chỗ ở Nữ hoàng Sa mạc (phía Nam)`, 'err'); }
        }
      }
      // contested: the capturer's hero is still inside but an enemy is too → the bar holds instead of draining
      const holding = !who && m.cap && heroes.some((h) => h.owner === m.cap.by);
      // a capture under way is a signal: the capturer is at war with the owner and with anyone else standing in the circle
      if (m.cap && (who || holding)) { if (m.owner) this.war(m.cap.by, m.owner, 6); for (const o of players) if (o !== m.cap.by) this.war(m.cap.by, o, 6); }
      if (who) {
        const p = this.players.get(who);
        if (!m.cap || m.cap.by !== who) {
          const T = RES_INFO[m.type].capture[m.owner ? 1 : 0] * (p.heroType === 'kim-ha' ? 0.65 : 1);
          m.cap = { by: who, p: m.cap && m.cap.by === who ? m.cap.p : 0, T, steal: !!m.owner };
          m.alerted = false;
        }
        m.cap.p += dt;
        if (m.owner && !m.alerted) {
          m.alerted = true;
          this.notice(m.owner, `⚠ ${RES_INFO[m.type].mine} (${Math.floor(m.x)},${Math.floor(m.y)}) đang bị ${p.name} chiếm!`, 'warn', { x: m.x, y: m.y });
        }
        if (m.cap.steal && m.owner && m.cap.p >= m.cap.T / 2) {
          const old = this.players.get(m.owner);
          m.owner = 0; m.emptySince = this.t; this.clearGarrison(m);
          if (old) this.notice(old.id, `Mất ${RES_INFO[m.type].mine} vào tay ${p.name}`, 'warn', { x: m.x, y: m.y });
        }
        if (m.cap.p >= m.cap.T) {
          m.owner = who; m.holdStart = this.t; m.cap = null;
          this.spawnGarrison(m, this.players.get(who));
          this.notice(who, `Đã chiếm ${RES_INFO[m.type].mine}`, 'ok');
          { const wp = this.players.get(who); if (wp) this.quest(wp, 'mine', 1); }
          this.events.push({ k: 'captured', mine: m.id, x: m.x, y: m.y });
        }
        m.changed = true;
      } else if (m.cap && !holding) {
        m.cap.p -= dt / 3;
        if (m.cap.p <= 0) m.cap = null;
        m.changed = true;
      }
    }
  }
  /** warn mine owners when an enemy hero comes close (once per mine every 30 s) */
  mineAlerts() {
    for (const m of this.mines) {
      if (!m.owner || (m.alertAt && this.t - m.alertAt < 30)) continue;
      const owner = this.players.get(m.owner); if (!owner || owner.bot) continue;
      const e = this.near(m.x, m.y, MINE_ALERT_R).find((u) => u.kind === 'hero' && u.owner !== m.owner && !u.dead);
      if (!e) continue;
      m.alertAt = this.t;
      const who = this.players.get(e.owner);
      this.notice(m.owner, `⚠ ${who?.name ?? 'Kẻ địch'} đang tiến gần ${RES_INFO[m.type].mine} (${Math.floor(m.x)},${Math.floor(m.y)}) của bạn!`, 'warn', { x: m.x, y: m.y });
      this.events.push({ k: 'alert', mine: m.id, to: m.owner });
    }
  }
  // ---- moving a mine (12/11/2026): the owner may move it up to MINE_MOVE_R tiles from where the map put it ----
  /** footprint tiles of a mine centred on tile (tx, ty) */
  mineFoot(m, tx = m.tx, ty = m.ty) { const h = m.type === 'diamond' ? [-2, 1] : [-1, 1], out = []; for (let j = h[0]; j <= h[1]; j++) for (let i = h[0]; i <= h[1]; i++) out.push((ty + j) * this.world.W + tx + i); return out; }
  /** why the mine cannot go to tile (tx, ty) (null = it can) */
  mineMoveError(m, tx, ty) {
    const W = this.world.W, ox = m.otx ?? m.tx, oy = m.oty ?? m.ty;
    if (Math.hypot(tx - ox, ty - oy) > MINE_MOVE_R) return `Chỉ dời được trong ${MINE_MOVE_R} ô quanh vị trí gốc`;
    if (tx < 4 || ty < 4 || tx > W - 5 || ty > W - 5) return 'Ra ngoài bản đồ';
    return null; // 12/11/2026: anywhere within the radius, nothing else is checked (owner's wish)
  }
  /** put the mine on tile (tx, ty): tiles, centre, guards' posts (they walk there) */
  placeMine(m, tx, ty, guards = true) {
    // the old tiles get back what the map had there (a tree stays a tree), unless another mine covers them
    const others = new Set(this.mines.filter((q) => q !== m).flatMap((q) => this.mineFoot(q)));
    for (const i of this.mineFoot(m)) { const o = this.world.map.obst[i]; this.world.block[i] = others.has(i) || (o !== 0 && o !== 6 && o !== 16 && !this.cleared?.has(i)) ? 1 : 0; }
    for (const i of this.mineFoot(m, tx, ty)) this.world.block[i] = 1;
    const nx = m.type === 'diamond' ? tx : tx + 0.5, ny = m.type === 'diamond' ? ty : ty + 0.5, dx = nx - m.x, dy = ny - m.y;
    m.otx ??= m.tx; m.oty ??= m.ty;
    m.tx = tx; m.ty = ty; m.x = nx; m.y = ny; m.changed = true; m.moved = true;
    if (guards) for (const id of m.guards) { const g = this.units.get(id); if (g) { g.homeX += dx; g.homeY += dy; } }
  }
  mineMove(p, id, tx, ty) {
    const err = (s) => { this.notice(p.id, s, 'err'); return false; };
    const m = this.mines[id]; if (!m || this.mode !== 'endless') return false;
    if (m.owner !== p.id) return err('Chỉ chủ mỏ mới dời được');
    tx |= 0; ty |= 0;
    const e = this.mineMoveError(m, tx, ty); if (e) return err(e);
    this.placeMine(m, tx, ty); m.movedAt = this.t;
    this.events.push({ k: 'minemove', id, x: m.x, y: m.y });
    this.notice(p.id, `✥ Đã dời ${RES_INFO[m.type].mine}: lính giữ mỏ đang đi sang chỗ mới`, 'ok');
    return true;
  }
  /** the owner upgrades a mine (hero inside its ring, Thành trì high enough) */
  mineUp(p, id) {
    const err = (m) => { this.notice(p.id, m, 'err'); return false; };
    const m = this.mines[id]; if (!m || this.mode !== 'endless') return false;
    if (m.owner !== p.id) return err('Chỉ chủ mỏ mới nâng cấp được');
    const lv = m.lv ?? 1; if (lv >= MINE_LV_MAX) return err('Mỏ đã cấp tối đa');
    if (m.upAt) return err('Mỏ đang nâng cấp');
    const b = this.baseOf(p), thl = b ? this.thLevel(b) : 0;
    if (thl < lv + 1) return err(`Cần Thành trì cấp ${lv + 1} để nâng mỏ lên cấp ${lv + 1}`);
    const h = this.units.get(p.hero);
    if (!b) return err('Cần có căn cứ (Thành trì) để có thợ xây');
    if (this.busyBuilders(b) >= this.builders(b)) return err('Hết thợ xây: đợi thợ làm xong hoặc xây thêm Nhà thợ xây');
    const cost = mineUpCost(m.type, lv + 1);
    if (!h) return false;
    // 14/11/2026: upgraded from anywhere (the hero no longer walks there)
    p.upGoal = null;
    if (!this.pay(p, cost)) return err(`Không đủ tài nguyên: cần ${Object.entries(cost).map(([r, v]) => `${v} ${RES_INFO[r].name}`).join(', ')}`);
    m.upTotal = MINE_UP_TIME[lv]; m.upAt = this.t + m.upTotal; m.upBy = b.key; m.upOwner = p.id; m.upCost = cost; m.changed = true; this.basesDirty = true; // one builder of this base works there
    this.notice(p.id, `⛏ Đang nâng ${RES_INFO[m.type].mine} lên cấp ${lv + 1} (${Math.round(m.upTotal / 60)} phút)`, 'ok');
    return true;
  }
  income(p) {
    const inc = Object.fromEntries(RES.map((r) => [r, 0]));
    const kim = p.heroType === 'kim-ha';
    for (const [r, v] of Object.entries(BASE_INCOME)) inc[r] += v * (kim ? 2 : 1);
    const owned = this.mines.filter((m) => m.owner === p.id);
    const mg = management(owned.length, p.heroType);
    const boost = (kim ? 1.2 : 1) * (kim && p.skillUntil > this.t ? 2 : 1);
    const pr = 1 + (petBonus(this.petOf(p)).res ?? 0); // Lạc Đà Vàng
    for (const m of owned) inc[m.type] += RES_INFO[m.type].rate * (1 + holdBonus(this.t - m.holdStart)) * mg * boost * pr * (MINE_LV_MULT[(m.lv ?? 1) - 1] ?? 1);
    return { inc, mg, n: owned.length };
  }
  economy() {
    for (const p of this.players.values()) {
      if (!p.alive) continue;
      const { inc, n } = this.income(p);
      const k = !p.bot && !p.connected ? OFFLINE_RATE : 1; // disconnected but still on the map: half speed
      const cap = this.capOf(p); // open world: storage cap (docs/design/can-cu/04)
      for (const r of RES) this.gain(p, r, (inc[r] / 60) * k, cap);
      p.stats.bestMines = Math.max(p.stats.bestMines, n);
      if (!p.bot && this.mode === 'endless') this.questLive(p, n);
      if (!p.bot && p.connected && this.mode === 'endless' && (p.onlineS = (p.onlineS ?? 0) + 1) % 60 === 0) this.quest(p, 'online', 1);
      for (const m of this.mines) if (m.owner === p.id) p.score += RES_INFO[m.type].score / 60;
    }
  }
  guardRespawn() {
    for (const c of this.camps) {
      if (c.guards.size || this.t - c.emptySince < CAMPS[c.level].respawn) continue;
      // 13/11/2026: a player waiting in the camp (auto-farm) kept it empty forever ("hồi sau 0:01"): after a 10 s grace
      // the monsters come back anyway
      if (this.t - c.emptySince < CAMPS[c.level].respawn + 10 && this.near(c.x, c.y, 6).some((u) => u.owner)) continue;
      this.spawnCamp(c);
    }
    for (const m of this.mines) {
      if (!GUARD_SETS[m.type] || m.owner || m.guards.size || m.cap) continue;
      if (this.t - m.emptySince >= GUARD_RESPAWN) {
        // do not drop guards on top of players
        if (this.t - m.emptySince < GUARD_RESPAWN + 60 && this.near(m.x, m.y, CAPTURE_R(m.type) + 2).some((u) => u.owner)) continue; // at most 60 s late
        this.spawnGuards(m);
      }
    }
  }
}

installBases(Game);
installHero(Game);
installQueen(Game);
installEvents(Game);
installQuests(Game);
installDefense(Game);
installParty(Game);

function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

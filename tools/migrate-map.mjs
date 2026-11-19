// Move the open world to a new map (12/11/2026): every player's base is moved (same layout) to a random spot away from
// the edge and the centre, far from the other bases; players go to the stash with army, resources, items and their
// mines' kinds + levels (they get the nearest free mines of the same kinds when they log in). Bots start over.
// Usage: SEED=<new seed> node tools/migrate-map.mjs <old state.json> <new state.json> [<old mines-<seed>.json>]
import fs from 'node:fs';
import { World } from '../server/world.js';
import { Game } from '../server/game.js';
import { BASE_ZONE, BUILDINGS, TOWN_HALL, OBST_CLEAR } from '../shared/balance.js';

const [, , OLD, OUT, TYPES] = process.argv;
const SEED = +process.env.SEED;
if (!OLD || !OUT || !SEED) { console.error('usage: SEED=… node tools/migrate-map.mjs old.json new.json [mines-old.json]'); process.exit(1); }
const d = JSON.parse(fs.readFileSync(OLD, 'utf8'));
const oldG = d.rooms.find((r) => r.id === 'world')?.game;
if (!oldG) { console.error('no open world in', OLD); process.exit(1); }
const types = JSON.parse(fs.readFileSync(TYPES ?? `${OLD.replace(/[^/]*$/, '')}mines-${oldG.seed}.json`, 'utf8'));
const world = new World(SEED), g = new Game(SEED, { mode: 'endless', world });
const W = world.W, SIZE = (t) => (t === 'thanh-tri' ? TOWN_HALL.size : BUILDINGS[t].size);
let seed = SEED; const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

// ---- 1. bases: random spots, ring between 35 % and 82 % of the half-width, ≥ 80 tiles apart ----
// zone boxes must stay clear of camps, spawn camps, bosses and the King; mines may sit in the zone (buildings never cover them),
// just not right next to the Thành trì
const avoid = [...g.camps.map((c) => ({ x: c.x, y: c.y, r: 0 })), ...world.spawns.map((s) => ({ x: s.x, y: s.y, r: 2 })),
  ...Object.values(g.bossSpots ?? {}).map((b) => ({ x: b.x, y: b.y, r: 8 })), ...(g.king ? [{ x: g.king.x, y: g.king.y, r: 24 }] : [])];
const nearMine = (cx, cy) => g.mines.some((m) => Math.hypot(m.x - cx, m.y - cy) < 7);
const placed = [], out = [], cleared = new Set();
const human = (oldG.bases ?? []).filter((b) => !b.key.startsWith('npc:'));
for (const b of human) {
  const th = b.items.find((i) => i.type === 'thanh-tri'); if (!th) continue;
  // gather valid spots, then take the one farthest from the bases already placed (spread over the whole map)
  let best = null, cands = [];
  for (let k = 0; k < 20000 && cands.length < 60; k++) {
    const a = rand() * Math.PI * 2, r = (0.35 + rand() * 0.47) * (W / 2);
    const tx = Math.round(W / 2 + Math.cos(a) * r) - 1, ty = Math.round(W / 2 + Math.sin(a) * r) - 1, cx = tx + 1.5, cy = ty + 1.5;
    if (tx - BASE_ZONE < 12 || ty - BASE_ZONE < 12 || tx + 3 + BASE_ZONE > W - 12 || ty + 3 + BASE_ZONE > W - 12) continue;
    if (placed.some((p) => Math.hypot(p.x - cx, p.y - cy) < 80)) continue;
    if (avoid.some((o) => Math.abs(o.x - cx) < BASE_ZONE + 2 + o.r && Math.abs(o.y - cy) < BASE_ZONE + 2 + o.r) || nearMine(cx, cy)) continue;
    // every building tile must be ground or a tree / rock the builders clear (no water, chasm, ruins…)
    let ok = true; const clr = [];
    for (const it of b.items) { const s = SIZE(it.type); for (let j = 0; j < s && ok; j++) for (let i = 0; i < s && ok; i++) {
      const x = tx + (it.tx - th.tx) + i, y = ty + (it.ty - th.ty) + j; if (x < 1 || y < 1 || x >= W - 1 || y >= W - 1) { ok = false; break; }
      const idx = y * W + x; if (!world.block[idx]) continue;
      if (OBST_CLEAR[world.map.obst[idx]]) clr.push(idx); else ok = false;
    } }
    if (ok) cands.push({ tx, ty, clr });
  }
  const far = (c) => Math.min(Infinity, ...placed.map((p) => Math.hypot(p.x - c.tx - 1.5, p.y - c.ty - 1.5)));
  for (const c of cands) if (!best || far(c) > far(best)) best = c;
  if (!best) { console.error('no spot for', b.key); continue; }
  placed.push({ x: best.tx + 1.5, y: best.ty + 1.5 });
  for (const i of best.clr) cleared.add(i);
  const dx = best.tx - th.tx, dy = best.ty - th.ty;
  out.push({ ...b, items: b.items.map((it) => ({ ...it, tx: it.tx + dx, ty: it.ty + dy })), clears: [] });
  console.log(`base ${b.name}: (${th.tx},${th.ty}) → (${best.tx},${best.ty}), ${best.clr.length} trees / rocks cleared`);
}
for (const i of cleared) { g.cleared.add(i); world.block[i] = 0; g.world.block[i] = 0; }
g.restoreBases(out);
for (const i of cleared) g.world.block[i] = 0;
g.heroProg = new Map(Object.entries(oldG.heroProg ?? {}));

// ---- 2. players → stash, with their mines' kinds and levels ----
const minesOf = (pid) => (oldG.mines ?? []).map((m, i) => (m.owner === pid && types[i] ? { type: types[i], lv: m.lv ?? 1 } : null)).filter(Boolean);
const stash = {};
const byId = new Map(oldG.units.map((u) => [u.id, u]));
for (const p of oldG.players) {
  if (p.bot || !p.alive) continue;
  const hero = byId.get(p.hero), units = (p.units ?? []).map((id) => byId.get(id)).filter(Boolean).map((u) => ({ type: u.type, hp: u.hp, buyN: u.buyN, kills: u.kills }));
  stash[p.name.toLowerCase()] = { room: 'world', at: Date.now(), data: {
    v: 1, heroType: p.heroType, hero: { hp: hero?.hp ?? 1, x: null, y: null }, inc: null, units: [...units, ...(p.stowed ?? [])], res: p.res, rings: p.rings, mode: p.mode, equip: p.equip ?? {}, bag: p.bag ?? [],
    score: p.score, stats: p.stats, life: oldG.t - p.bornAt, queue: (p.queue ?? []).map((q) => ({ type: q.type, left: Math.max(0, q.readyAt - oldG.t), total: q.total, n: q.n })), buyCounter: p.buyCounter,
    mines: [], mineTypes: minesOf(p.id), skillLeft: 0 } };
  console.log(`player ${p.name}: ${units.length + (p.stowed?.length ?? 0)} soldiers, ${minesOf(p.id).length} mines`);
}
for (const [k, v] of Object.entries(d.stash ?? {})) {
  if (stash[k]) continue;
  const mt = (v.data.mines ?? []).map((i) => (types[i] ? { type: types[i], lv: oldG.mines?.[i]?.lv ?? 1 } : null)).filter(Boolean);
  stash[k] = { ...v, data: { ...v.data, hero: { ...(v.data.hero ?? {}), x: null, y: null }, mines: [], mineTypes: [...(v.data.mineTypes ?? []), ...mt] } };
  console.log(`stashed ${k}: ${v.data.units?.length ?? 0} soldiers, ${mt.length} mines`);
}
const sessions = d.rooms.flatMap((r) => (r.sessions ?? []).map((s) => ({ token: s.token, name: r.game?.players?.find((x) => x.id === s.pid)?.name })).filter((s) => s.name));
const nd = { v: 2, rooms: [{ id: 'world', name: 'Thế giới mở', mode: 'endless', game: g.serialize(), sessions: [] }], idle: [...(d.idle ?? []), ...sessions], stash };
fs.writeFileSync(OUT, JSON.stringify(nd));
fs.writeFileSync(OUT.replace(/[^/]*$/, '') + `mines-${SEED}.json`, JSON.stringify(world.mines.map((m) => m.type))); // for the next map change
console.log(`new map ${SEED} (${W}×${W}): ${out.length} bases, ${Object.keys(stash).length} players kept → ${OUT}`);

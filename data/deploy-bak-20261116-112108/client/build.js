// Base building on the client (docs/design/can-cu/05): drawing structures and walls, placing / moving ghosts,
// the building shop tab and the info panel of a selected structure.
import { play } from './audio.js';
import { S, now } from './state.js';
import { PALACE_SCALE, STORE_MULT, QUEEN_SIZE, QUEEN_SAFE_R, OPTIONAL_B, KING_SIZE, KING_SAFE_R, CASTLE_CAP, CASTLE_RANGE, HOUSING, UNIT_LV_CAP, UNIT_LV_MULT, unitLvCap, unitLvTh, researchCost, RESEARCH_TIME, REPAIR_SHARE, NO_BUILDER, CLEAR, OBST_CLEAR, BUILDINGS, TOWN_HALL, BASE_ZONE, BASE_GAP, TH_GAP, buildCost, bLimit, extraMult, buildTime, buildStats, B_NAME, RES, RES_INFO, costValue, UNIT_TH, UNITS , bMaxLv, TH_MAX, UNIT_LV_MAX, unitLvLabel, HOME_HEROES, homeHeroStats } from '/shared/balance.js';
/** sheet row of a structure: its level (or the closest lower drawn level), ruin, hidden (Cột sét) — 16/11/2026, sheets go to lv8 */
export function bRow(a, lv, ruin = false, hid = false) {
  const R = a?.rows; if (!R) return 0;
  if (ruin) return R.ruin ?? 5;
  if (hid && R.hidden != null) return R.hidden;
  for (let l = Math.max(1, lv); l >= 1; l--) if (R['lv' + l] != null) return R['lv' + l];
  return 0;
}
const wallLv = (A, lv) => Math.max(0, Math.min(A.pieces.length - 1, lv - 1));
import { thumb, skinOf, drawUnit, drawOutline, teamTint } from './sprites.js';

const T = 16;
export const SIZE = (type) => (type === 'thanh-tri' ? TOWN_HALL.size : BUILDINGS[type].size);
const BSPR = { atlas: null, img: {} };
const WORKER = { meta: null, img: null, icons: null };
const TRAPS = { meta: null, img: null };
const DECO = { meta: null, img: null }; // decorations sheet (tools/spriteimport/deco.mjs): type → [x, y, w, h, ax, ay] // hand-drawn traps: [armed, used] per type // builder sprites (walk 8 dirs, work: chop / mine / build) + axe / pickaxe icons
export async function loadBuildings(av = '') {
  const q = '?v=' + av;
  BSPR.atlas = await (await fetch('/assets/buildings/atlas.json' + q, { cache: 'no-store' })).json();
  try { WORKER.meta = await (await fetch('/assets/builder/builder.json' + q)).json(); const i = new Image(); i.src = '/assets/builder/builder.png' + q; await i.decode(); WORKER.img = i; } catch {}
  try { const i = new Image(); i.src = '/assets/items/don.png' + q; await i.decode(); WORKER.icons = i; } catch {}
  try { DECO.meta = await (await fetch('/assets/buildings/deco.json' + q)).json(); const i = new Image(); i.src = '/assets/buildings/deco.png' + q; await i.decode(); DECO.img = i; } catch {}
  try { TRAPS.meta = await (await fetch('/assets/buildings/traps.json' + q)).json(); const i = new Image(); i.src = '/assets/buildings/traps.png' + q; await i.decode(); TRAPS.img = i; } catch {}
  await Promise.all(Object.keys(BSPR.atlas).map((t) => new Promise((res) => { const i = new Image(); i.onload = () => { BSPR.img[t] = i; res(); }; i.onerror = res; i.src = `/assets/buildings/${t}.png${q}`; })));
  const g = document.getElementById('bshopgrid'); if (g) g.dataset.built = ''; // redraw the shop cards with the sprites
}

// ------------------------------------------------------------ trees / rocks (clearing in the base zone)
/** raw obstacle map (1 byte per tile, tools/mapgen/gen.mjs O) */
export async function loadObst(av = '') {
  try { S.obst = new Uint8Array(await (await fetch('/obst.bin?v=' + av)).arrayBuffer()); } catch { S.obst = null; }
}
export function setCleared(m) { if (m.list) S.cleared = new Set(m.list); else for (const i of m.add ?? []) (S.cleared ??= new Set()).add(i); }
/** CLEAR kind of the obstacle on a tile (null: none / not clearable / already cleared) */
export function obstAt(tx, ty) {
  if (!S.obst || tx < 0 || ty < 0 || tx >= S.W || ty >= S.H) return null;
  const i = ty * S.W + tx; if (S.cleared?.has(i)) return null;
  return OBST_CLEAR[S.obst[i]] ?? null;
}
/** a clearable obstacle under world point (x, y) inside my own base zone → selection */
export function obstPick(x, y) {
  const b = S.myBase, z = b && zoneOf(b); if (!z || S.room?.mode !== 'endless') return null;
  // trees are drawn up to ~1.5 tiles above their tile: also try the tile below the pointer
  for (const [tx, ty] of [[Math.floor(x), Math.floor(y)], [Math.floor(x), Math.floor(y + 0.8)], [Math.floor(x), Math.floor(y + 1.5)]]) {
    if (tx < z[0] || ty < z[1] || tx > z[2] || ty > z[3]) continue;
    if (obstAt(tx, ty)) return { k: 'obst', tx, ty };
  }
  return null;
}
export function obstInfoHtml(sel) {
  const kind = obstAt(sel.tx, sel.ty), b = S.myBase;
  const job = b?.clears.find((c) => c.tx === sel.tx && c.ty === sel.ty);
  if (!kind && !job) return null;
  const C = CLEAR[kind ?? 'tree'], [r, ch, lo, hi] = C.reward;
  let html = `<div class="nm"><b>${C.name}</b></div><div class="muted">Trong vùng căn cứ của bạn. Dọn xong thì ô này trống mãi, xây nhà được.</div>`;
  html += `<table class="ist"><tr><td>Giá</td><td>${fmtCost(C.cost)}</td></tr><tr><td>Thời gian</td><td>${fmtT(C.time)} · 1 thợ xây</td></tr><tr><td>Có thể tìm thấy</td><td>${lo}–${hi} ${RES_INFO[r].name} (${Math.round(ch * 100)}%)</td></tr></table>`;
  if (job) html += `<div class="muted">Thợ xây đang ${C.verb.toLowerCase()}… còn ${fmtT(Math.max(0, job.doneAt - now()))}</div>`;
  else {
    const have = S.me ? Object.fromEntries(RES.map((q, i) => [q, S.me.res[i]])) : {};
    const poor = Object.entries(C.cost).some(([q, v]) => (have[q] ?? 0) < v), noB = b && busy(b) >= builders(b);
    html += `<button id="b-clear" ${poor || noB ? 'disabled' : ''}>${noB ? 'Hết thợ xây' : poor ? 'Thiếu tài nguyên' : `<i class="dico${C.verb === 'Đập' ? ' k1' : ''}"></i> ${C.verb} · ${fmtCost(C.cost)}`}</button>`;
  }
  return html;
}
export function wireObstInfo(sel, send, on) { on('b-clear', () => send({ t: 'base-clear', x: sel.tx, y: sel.ty })); }
/** clearing jobs (all bases) and the selected obstacle */
function drawClears(ctx, sx, sy, z, s, vis) {
  const tn = now();
  if (S.sel?.k === 'obst') { ctx.strokeStyle = '#ffe26a'; ctx.lineWidth = Math.max(1, s); ctx.strokeRect(sx(S.sel.tx) + 0.5, sy(S.sel.ty) + 0.5, T * z - 1, T * z - 1); }
  for (const bb of S.bases ?? []) for (const c of bb.clears ?? []) {
    if (!vis(c.tx + 0.5, c.ty + 0.5, 3)) continue;
    const x = sx(c.tx + 0.5), top = sy(c.ty) - 30 * s, k = Math.max(0, Math.min(1, 1 - (c.doneAt - tn) / c.total)), w = 24 * s;
    ctx.fillStyle = '#1b1726'; ctx.fillRect(x - w / 2 - 1, top - 1, w + 2, 4 * s + 2); ctx.fillStyle = '#f0c030'; ctx.fillRect(x - w / 2, top, w * k, 4 * s);
    if (WORKER.icons) { const k2 = obstAt(c.tx, c.ty) === 'rock' ? 1 : 0, sz = Math.round(10 * s); ctx.drawImage(WORKER.icons, k2 * 32, 0, 32, 32, Math.round(x - w / 2 - sz - 2), Math.round(top - sz / 2 + 2 * s), sz, sz); }
    if (bb.key === myKey()) { ctx.font = `600 ${Math.max(10, 5 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(fmtT(Math.max(0, c.doneAt - tn)), x, top - 3 * s); }
  }
}

// ------------------------------------------------------------ data from the server
export function setBases(list) {
  const t = now();
  S.bases = list.map((b) => ({ ...b, items: b.items.map(([id, type, tx, ty, lv, state, left, total, uid, hid, rest]) => ({ id, type, tx, ty, lv, state, doneAt: t + left, total, uid, key: b.key, hid: !!hid, restAt: rest ? t + rest : 0 })),
    clears: (b.cl ?? []).map(([tx, ty, left, total]) => ({ tx, ty, doneAt: t + left, total })) }));
  const me = myKey();
  const prev = new Map((S.myBase?.items ?? []).map((i) => [i.id, i.state]));
  S.myBase = S.bases.find((b) => b.key === me) ?? null;
  if (prev.size && S.myBase) for (const it of S.myBase.items) { // build / upgrade finished (14/11/2026): a sound for the owner
    const was = prev.get(it.id); if (it.state !== 'ok' || !was || was === 'ok' || it.type === 'tuong') continue;
    if (was === 'build') play('build_done'); else if (was === 'up') play('upgrade_done');
  }
  if (S.myBase) S.myBase._at = performance.now() / 1000; // for the Hội thành call countdowns (cc / cb are seconds at this moment)
  S.baseGlow = new Map(S.bases.map((b) => [b.key, b.gw || b.color]));
  // Học viện: researched unit levels and the research going on (only sent for my own base)
  S.unitLv = S.myBase?.ul ?? {};
  const rs = S.myBase?.rs; S.research = rs ? { unit: rs[0], lv: rs[1], doneAt: t + rs[2], total: rs[3] } : null;
  if (document.getElementById('lab')) renderLab();
  if (S.sel?.k === 'build' && !findItem(S.sel.key, S.sel.id)) S.sel = null;
  S.wallAt = new Map(); for (const b of S.bases) for (const it of b.items) if (it.type === 'tuong' && it.state !== 'ruin') S.wallAt.set(it.tx + ',' + it.ty, it);
}
export const myKey = () => (S.account?.name ?? '').toLowerCase();
export const thOf = (b) => b?.items.find((i) => i.type === 'thanh-tri');
export function findItem(key, id) { const b = S.bases?.find((q) => q.key === key); return b?.items.find((i) => i.id === id) ?? null; }
function zoneOf(b) { const th = thOf(b); return th ? [th.tx - BASE_ZONE, th.ty - BASE_ZONE, th.tx + 2 + BASE_ZONE, th.ty + 2 + BASE_ZONE] : null; }
/** the structure whose footprint covers world point (x, y) */
export function buildingAt(x, y) {
  for (const b of S.bases ?? []) for (const it of b.items) { const s = SIZE(it.type); if (x >= it.tx && y >= it.ty && x < it.tx + s && y < it.ty + s) return it; }
  return null;
}
const tileOf = (w, s) => ({ tx: Math.floor(w.x - (s - 1) / 2), ty: Math.floor(w.y - (s - 1) / 2) });

// ------------------------------------------------------------ placing & moving
/** start placing a new structure of this type */
export function startPlace(type) { S.build = { mode: 'place', type }; S.sel = null; if (S.mobile) { S.mouse.x = innerWidth / 2; S.mouse.y = innerHeight / 2; } }
/** start moving structures; `start` = the tile that is "held" (the ghost then follows the pointer straight away) */
export function startMove(ids, group, start = null) {
  const items = ids.map((id) => findItem(myKey(), id)).filter(Boolean);
  if (!items.length) return;
  let list = items;
  if (group) { const set = new Set(items); for (const w of items) if (w.type === 'tuong') for (const g of wallGroup(w)) set.add(g); list = [...set]; }
  if (list.some((i) => i.type === 'thanh-tri')) list = [...S.myBase.items];
  const a = list[0];
  S.build = { mode: 'move', ids: list.map((i) => i.id), items: list, anchor: { tx: a.tx, ty: a.ty }, start: start ?? { tx: a.tx + Math.floor(SIZE(a.type) / 2), ty: a.ty + Math.floor(SIZE(a.type) / 2) } };
  if (S.mobile) { S.mouse.x = innerWidth / 2; S.mouse.y = innerHeight / 2; }
}
export function cancelBuild() { S.build = null; }
/** press on one of my structures and drag it (like Clash of Clans): returns true when a move started */
export function dragStart(w0) {
  const bt = buildingAt(w0.x, w0.y);
  if (!bt || bt.key !== myKey()) return false;
  const ids = bt.type === 'tuong' && S.selWalls?.has(bt.id) && S.selWalls.size > 1 ? [...S.selWalls] : [bt.id];
  S.sel = { k: 'build', key: bt.key, id: bt.id };
  startMove(ids, false, { tx: Math.floor(w0.x), ty: Math.floor(w0.y) });
  if (S.build) S.build.drag = true;
  return !!S.build;
}
/** the straight run of my wall pieces through w0 along (dx, dy) */
export function wallLine(w0, dx, dy) {
  const at = new Map((S.myBase?.items ?? []).filter((i) => i.type === 'tuong').map((w) => [w.tx + ',' + w.ty, w])), out = [w0];
  for (const s of [1, -1]) for (let k = 1; ; k++) { const w = at.get(w0.tx + dx * k * s + ',' + (w0.ty + dy * k * s)); if (!w) break; out.push(w); }
  return out;
}
export function wallGroup(w0) {
  const walls = S.myBase?.items.filter((i) => i.type === 'tuong') ?? [], at = new Map(walls.map((w) => [w.tx + ',' + w.ty, w]));
  const out = [w0], seen = new Set([w0]);
  for (let k = 0; k < out.length; k++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = at.get(out[k].tx + dx + ',' + (out[k].ty + dy)); if (n && !seen.has(n)) { seen.add(n); out.push(n); } }
  return out;
}
/** quick client-side check (the server has the final word: it also knows trees, rocks and water) */
function placeError(type, tx, ty, ignore = null) {
  const s = SIZE(type), b = S.myBase;
  if (tx < 1 || ty < 1 || tx + s >= S.W - 1 || ty + s >= S.H - 1) return 'Ra ngoài bản đồ';
  for (const m of S.mines) { const ms = m.type === 'diamond' ? 2 : 1.5; if (Math.abs(m.x - (tx + s / 2)) < ms + s / 2 && Math.abs(m.y - (ty + s / 2)) < ms + s / 2) return 'Đè lên mỏ'; }
  for (const bb of S.bases ?? []) for (const it of bb.items) {
    if (it.state === 'ruin' || ignore?.has(it)) continue;
    const q = SIZE(it.type);
    if (tx < it.tx + q && it.tx < tx + s && ty < it.ty + q && it.ty < ty + s) return 'Trùng công trình khác';
  }
  // trees, rocks, water, chasms… (a cleared tile is free); same rule as the server's walkable()
  if (S.obst) for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) {
    const k = (ty + j) * S.W + tx + i, o = S.obst[k];
    if (o && o !== 6 && o !== 16 && !S.cleared?.has(k)) return OBST_CLEAR[o] ? `Có ${CLEAR[OBST_CLEAR[o]].name.toLowerCase()} ở đây: bấm vào nó để dọn trước` : 'Chỗ này bị chặn (nước, vực, nhà…)';
  }
  const cx = tx + s / 2, cy = ty + s / 2, h = S.me && S.byId.get(S.me.hero);
  if (type === 'thanh-tri') {
    if (b && !ignore) return 'Bạn đã có Thành trì';
    const near = (list, r) => (list ?? []).some((q) => Math.hypot(q.x - cx, q.y - cy) < r);
    if (ignore) return null; // moving the whole base: room is enough (12/11/2026)
    for (const o of S.bases ?? []) { const t = o !== b && thOf(o); if (t && Math.hypot(t.tx + 1.5 - cx, t.ty + 1.5 - cy) < BASE_GAP) return `Quá gần căn cứ của ${o.name} (cần cách ${BASE_GAP} ô)`; }
    if (h && Math.hypot(h.x - cx, h.y - cy) > 15) return 'Tướng phải đứng trong 15 ô';
    if (Math.hypot(cx - S.W / 2, cy - S.H / 2) < 0.16 * (S.W / 2) + 4) return 'Không xây trong Cao nguyên cổ';
    if (near(S.spawns, TH_GAP.spawn)) return `Quá gần trại xuất phát (cần cách ${TH_GAP.spawn} ô)`;
    if (near(S.camps, TH_GAP.camp)) return `Quá gần bãi quái (cần cách ${TH_GAP.camp} ô)`;
    return null;
  }
  if (!b) return 'Cần xây Thành trì trước';
  const th = thOf(b);
  if (!ignore && h && th && Math.hypot(h.x - (th.tx + 1.5), h.y - (th.ty + 1.5)) > BASE_ZONE + 14) return 'Tướng phải ở gần căn cứ';
  if (ignore && [...ignore].some((i) => i.type === 'thanh-tri')) return null; // the whole base moves with its zone
  const z = zoneOf(b);
  if (tx < z[0] || ty < z[1] || tx + s - 1 > z[2] || ty + s - 1 > z[3]) return 'Ngoài vùng căn cứ';
  return null;
}
export function placeInfo(type) {
  const b = S.myBase, th = thOf(b), me = S.me;
  const n0 = b ? b.items.filter((i) => i.type === type).length : 0;
  const cost = buildCost(type, 1, n0 + 1), have = me ? Object.fromEntries(RES.map((r, i) => [r, me.res[i]])) : {};
  const miss = Object.entries(cost).filter(([r, v]) => (have[r] ?? 0) < v);
  let lim = null, n = 0, reason = null;
  if (type === 'thanh-tri') { if (b) reason = 'Đã có Thành trì'; }
  else if (!b) reason = 'Cần Thành trì';
  else {
    lim = bLimit(type, th.lv); n = n0;
    if (th.state === 'ruin') reason = 'Thành trì đang đổ nát';
    else if (n >= lim) reason = lim ? `Đã đủ ${lim}` : `🔒 Mở khóa ở Thành trì cấp ${TOWN_HALL.levels.findIndex((l) => l.max[type] > 0) + 1}`;
    else if (!NO_BUILDER(type) && busy(b) >= builders(b)) reason = 'Hết thợ xây';
  }
  if (!reason && miss.length) reason = 'Thiếu tài nguyên';
  return { cost, miss, lim, n, reason, rise: extraMult(type, n0 + 1) };
}
const busy = (b) => b.items.filter((i) => (i.state === 'build' || i.state === 'up') && i.type !== 'tuong').length + (b.clears?.length ?? 0) + (b.mu?.length ?? 0); // mine upgrades take a builder too
const hutsOf = (b) => b.items.filter((i) => i.type === 'nha-tho-xay' && (i.state === 'ok' || i.state === 'up'));
/** builders = standing Nhà thợ xây, at least 1, at most what the Thành trì level allows (same rule as the server) */
const builders = (b) => Math.max(1, hutsOf(b).length); // one per hut, max 5 huts at any Thành trì level
/** my builders for the top bar: {free, total} or null without a base */
/** what my builders are doing, for the 🔨 hover card: [{ icon, name, k (0..1), left (s) }] */
export function builderJobs() {
  const b = S.myBase; if (!b) return [];
  const tn = now(), out = [], prog = (doneAt, total) => ({ k: total ? Math.max(0, Math.min(1, 1 - (doneAt - tn) / total)) : 1, left: Math.max(0, doneAt - tn) });
  for (const it of b.items) if ((it.state === 'build' || it.state === 'up') && it.type !== 'tuong' && it.total) out.push({ icon: it.state === 'up' ? '⬆' : '🔨', name: it.state === 'up' ? `${B_NAME(it.type)} → cấp ${it.lv + 1}` : `Xây ${B_NAME(it.type)}`, ...prog(it.doneAt, it.total) });
  for (const c of b.clears ?? []) out.push({ icon: obstAt(c.tx, c.ty) === 'rock' ? '⛏' : '🪓', name: obstAt(c.tx, c.ty) === 'rock' ? 'Đập đá' : 'Chặt cây', ...prog(c.doneAt, c.total) });
  for (const i of b.mu ?? []) { const m = S.mines?.[i]; if (m?.upAt) out.push({ icon: '⛰', name: `${RES_INFO[m.type].mine} → cấp ${(m.lv ?? 1) + 1}`, ...prog(m.upAt, m.upTotal) }); }
  return out.sort((x, y) => x.left - y.left);
}
export const fmtLeft = (sec) => fmtT(sec);
export function builderCount() { const b = S.myBase; if (!b || !thOf(b)) return null; const n = builders(b); return { free: Math.max(0, n - busy(b)), total: n }; }

/** left button down on the map while building: returns true when it was handled */
export function buildDown(w, e, send) {
  const B = S.build; if (!B) return false;
  if (B.mode === 'place') {
    const s = SIZE(B.type), { tx, ty } = tileOf(w, s);
    if (placeError(B.type, tx, ty)) return true;
    send({ t: 'base-place', type: B.type, x: tx, y: ty });
    B.last = tx + ',' + ty; B.painting = B.type === 'tuong';
    if (B.type !== 'tuong' && !e.shiftKey) S.build = null;
    return true;
  }
  if (B.mode === 'move') {
    const { tx, ty } = tileOf(w, 1);
    if (!B.start) { B.start = { tx, ty }; return true; }
    const dx = tx - B.start.tx, dy = ty - B.start.ty;
    if (dx || dy) send({ t: 'base-move', ids: B.ids, dx, dy });
    S.build = null;
    return true;
  }
  return false;
}
/** mouse moved with the button held: walls are painted tile by tile */
export function buildDrag(w, send) {
  const B = S.build; if (!B || B.mode !== 'place' || !B.painting) return;
  const { tx, ty } = tileOf(w, 1), k = tx + ',' + ty;
  if (k === B.last) return;
  B.last = k;
  if (!placeError('tuong', tx, ty) && !placeInfo('tuong').reason) send({ t: 'base-place', type: 'tuong', x: tx, y: ty });
}
export function buildUp() { if (S.build) S.build.painting = false; }

// ------------------------------------------------------------ drawing
const WALL_COL = [
  { top: '#a8784a', front: '#6a4424', line: '#4a2e18', cap: null },
  { top: '#b8844a', front: '#7a4e2a', line: '#4a2e18', cap: '#d8b070' },
  { top: '#a4a4ae', front: '#62626e', line: '#3e3e48', cap: null },
  { top: '#a4a4ae', front: '#62626e', line: '#3e3e48', cap: '#f0a040' },
  { top: '#eeeef4', front: '#b4b4c0', line: '#86869a', cap: '#e8b830' },
];
/** ground layer: base zone, foundations, ghosts */
export function drawBaseGround(ctx, sx, sy, z, s, t, vis) {
  if (!S.bases) return;
  // own base zone: always faint, clear while building
  const b = S.myBase, zn = b && zoneOf(b);
  if (zn && (S.build || (S.sel?.k === 'build' && S.sel.key === b.key) || vis(zn[0] + 9, zn[1] + 9, 12))) {
    ctx.save(); ctx.setLineDash([6 * s, 4 * s]); ctx.lineDashOffset = -t * 8;
    ctx.strokeStyle = S.build ? '#ffe26acc' : '#ffe26a44'; ctx.lineWidth = Math.max(1, s * (S.build ? 1.5 : 1));
    ctx.strokeRect(sx(zn[0]), sy(zn[1]), (zn[2] - zn[0] + 1) * T * z, (zn[3] - zn[1] + 1) * T * z); ctx.restore();
    if (S.build) { ctx.fillStyle = '#ffe26a10'; ctx.fillRect(sx(zn[0]), sy(zn[1]), (zn[2] - zn[0] + 1) * T * z, (zn[3] - zn[1] + 1) * T * z); }
  }
  for (const bb of S.bases) for (const it of bb.items) {
    if (BUILDINGS[it.type]?.trap) { if (vis(it.tx + 0.5, it.ty + 0.5, 2)) { ctx.globalAlpha = it.state === 'ok' ? 0.9 : 0.45; drawTrap(ctx, it.type, sx(it.tx + 0.5), sy(it.ty + 0.6), s, it.state === 'used', it.lv); ctx.globalAlpha = 1; if (S.sel?.k === 'build' && S.sel.id === it.id && S.sel.key === bb.key) { ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, s); ctx.strokeRect(sx(it.tx) + 0.5, sy(it.ty) + 0.5, T * z - 1, T * z - 1); } } continue; }
    if (it.type === 'tuong') continue;
    const sz = SIZE(it.type); if (!vis(it.tx + sz / 2, it.ty + sz / 2, sz + 2)) continue;
    const x = sx(it.tx), y = sy(it.ty), w = sz * T * z;
    // no dark foundation under buildings (looked like a black shadow); the footprint shows only while placing / moving
    if (!S.build) continue;
    ctx.strokeStyle = bb.color; ctx.globalAlpha = 0.6; ctx.lineWidth = Math.max(1, s); ctx.strokeRect(x + 0.5, y + 0.5, w - 1, w - 1); ctx.globalAlpha = 1;
  }
  const B = S.build; if (!B) return;
  const w = { x: (S.mouse.x / z + S.cam.x) / T, y: (S.mouse.y / z + S.cam.y) / T };
  const ghost = (type, tx, ty, ok) => {
    const sz = SIZE(type), x = sx(tx), y = sy(ty), ww = sz * T * z;
    ctx.fillStyle = ok ? '#3ee06b55' : '#ff4a4a55'; ctx.fillRect(x, y, ww, ww);
    ctx.strokeStyle = ok ? '#3ee06b' : '#ff4a4a'; ctx.lineWidth = Math.max(1, s); ctx.strokeRect(x + 0.5, y + 0.5, ww - 1, ww - 1);
    const st = buildStats(type, 1); if (type === 'hoi-thanh') st.range = CASTLE_RANGE[0];
    if (st.range && ok) { ctx.strokeStyle = '#ffffff55'; ctx.setLineDash([3 * s, 3 * s]); ctx.beginPath(); ctx.ellipse(x + ww / 2, y + ww / 2, st.range * T * z, st.range * T * z, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  };
  if (B.mode === 'place') {
    const { tx, ty } = tileOf(w, SIZE(B.type)), err = placeError(B.type, tx, ty) ?? placeInfo(B.type).reason;
    ghost(B.type, tx, ty, !err);
    const msg = S.mobile ? err : (err ? err : `${B_NAME(B.type)} · chuột trái: đặt${B.type === 'tuong' ? ' (giữ chuột kéo để xây cả hàng)' : ' · Shift: đặt tiếp'} · chuột phải / Esc: thôi`);
    S.buildTip = msg ? [msg, err ? '#ff8a8a' : '#e8e0c8'] : null; // drawn last, above the buildings (drawBaseTop)
  } else {
    const { tx, ty } = tileOf(w, 1), st = B.start ?? { tx, ty }, dx = B.start ? tx - st.tx : 0, dy = B.start ? ty - st.ty : 0;
    const ignore = new Set(B.items);
    let bad = null;
    for (const it of B.items) { const e = placeError(it.type, it.tx + dx, it.ty + dy, ignore); if (e && e !== 'Bạn đã có Thành trì') { bad = e; break; } }
    for (const it of B.items) ghost(it.type, it.tx + dx, it.ty + dy, !bad);
    const msg = S.mobile ? bad : (bad ?? (B.drag ? `Thả chuột để đặt ${B.items.length} công trình` : 'Chuột trái: đặt xuống · chuột phải / Esc: thôi'));
    S.buildTip = msg ? [msg, bad ? '#ff8a8a' : '#e8e0c8'] : null;
  }
}
function tip(ctx, x, y, text, col) {
  ctx.font = '600 13px "SWDigits", "Pixelify Sans", monospace'; ctx.textAlign = 'left';
  const w = ctx.measureText(text).width + 12;
  const cx = Math.max(6, Math.min(ctx.canvas.width - w - 6, x)), cy = Math.max(6, Math.min(ctx.canvas.height - 26, y));
  ctx.fillStyle = '#1b1726dd'; ctx.fillRect(cx, cy, w, 20); ctx.fillStyle = col; ctx.fillText(text, cx + 6, cy + 14);
}
/** structures (and the builders walking / working) to be y-sorted with units: [y, 3, item] */
export function pushBaseSprites(list, vis) {
  for (const bb of S.bases ?? []) for (const it of bb.items) { const sz = SIZE(it.type); if (!BUILDINGS[it.type]?.trap && vis(it.tx + sz / 2, it.ty + sz / 2, sz + 4)) list.push([it.ty + sz - (it.type === 'tuong' ? 0.2 - it.tx * 1e-5 : 0.4), 3, it]); }
  if (WORKER.meta && WORKER.img) for (const bb of S.bases ?? []) for (const w of workers(bb)) if (vis(w.x, w.y, 3)) list.push([w.y, 3, w]);
  for (const bb of S.bases ?? []) for (const sd of campSoldiers(bb)) if (vis(sd.x, sd.y, 2)) list.push([sd.key, 3, sd]); // after the yard sprite
  for (const w of labWalkers()) if (vis(w.x, w.y, 2)) list.push([w.y, 3, w]);
}
/** the unit being researched strolls around the Học viện (3 of them, random-looking loops) */
const GDIR = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];
function labWalkers() {
  const ac = S.research && S.myBase?.items.find((i) => i.type === 'hoc-vien' && i.state !== 'build' && i.state !== 'ruin');
  if (!ac || !UNITS[S.research.unit]) return [];
  const t = now(), sz = SIZE('hoc-vien'), cx = ac.tx + sz / 2, cy = ac.ty + sz / 2, out = [];
  for (let k = 0; k < 3; k++) {
    const pos = (tt) => { const a = tt * (0.22 + k * 0.05) * (k % 2 ? 1 : -1) + k * 2.1, r = sz / 2 + 1.3 + Math.sin(tt * 0.5 + k * 1.7) * 0.6 + Math.sin(tt * 1.3 + k) * 0.25; return [cx + Math.cos(a) * r * 1.15, cy + 0.4 + Math.sin(a) * r * 0.85]; };
    const [x, y] = pos(t), [x2, y2] = pos(t + 0.1), ang = Math.atan2(y2 - y, x2 - x); // facing where it walks
    const dir = GDIR.indexOf(['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'][((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8]);
    out.push({ soldier: true, walker: true, type: S.research.unit, team: 'blue', x, y, dir, pose: Math.floor(t * 6 + k) % 2 ? 'walk' : 'idle', lv: Math.max(1, S.research.lv - 1) });
  }
  return out;
}
/** soldiers kept in the base (phím C) stand in rows inside the Doanh trại yards (12/11/2026) */
const CAMP_ORDER = ['rong', 'su-thuu', 'may-ban-da', 'hiep-si', 'ky-binh', 'phap-su', 'cung-thu', 'linh-giao', 'kiem-si', 'dan-quan'];
function campSoldiers(bb) {
  const camps = bb.items.filter((i) => i.type === 'doanh-trai' && i.state !== 'build' && i.state !== 'ruin');
  if (!camps.length || !bb.gl) return [];
  const list = CAMP_ORDER.flatMap((t) => Array(bb.gl[t] ?? 0).fill(t)), out = [], PER = 50, team = bb.key === myKey() ? 'blue' : 'red';
  // shared out evenly between the yards, every yard gets the same mix (12/11/2026: no longer all in the first one)
  camps.forEach((c, k) => {
    list.filter((_, i) => i % camps.length === k).slice(0, PER).forEach((type, j) => {
      // the open ground of the yard (tents at the back, gate wall in front): 10 columns × 5 rows of small soldiers
      const col = j % 10, row = Math.floor(j / 10), sz = SIZE('doanh-trai');
      const y = c.ty + sz * 0.6 + row * sz * 0.075;
      out.push({ soldier: true, type, team, x: c.tx + sz * 0.13 + col * sz * 0.078 + (row % 2) * sz * 0.03, y, key: c.ty + sz - 0.4 + y * 1e-3, ph: j * 0.37 });
    });
  });
  return out;
}
const WALK_SPEED = 2.2; // tiles / s
const DIR8 = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
/** where every builder of a base is right now: walking from his hut to a job, working there, or idle at his door */
function workers(bb) {
  const th = thOf(bb); if (!th) return [];
  const huts = hutsOf(bb), homes = huts.length ? huts.map((h) => ({ x: h.tx + 1, y: h.ty + 2.15, hut: h })) : [{ x: th.tx + 1.5, y: th.ty + 3.2 }];
  const tn = now(), out = [], jobs = [];
  for (const it of bb.items) if ((it.state === 'build' || it.state === 'up') && it.type !== 'tuong' && it.total) jobs.push({ x: it.tx - 0.35, y: it.ty + SIZE(it.type) * 0.75, start: it.doneAt - it.total, act: 'build' });
  for (const id of bb.mu ?? []) { const m = S.mines?.[id]; if (m?.upAt) jobs.push({ x: m.x - 1.7, y: m.y + 1.1, start: m.upAt - m.upTotal, act: 'mine' }); } // upgrading a mine: pickaxe work
  for (const c of bb.clears ?? []) jobs.push({ x: c.tx - 0.45, y: c.ty + 0.85, start: c.doneAt - c.total, act: obstAt(c.tx, c.ty) === 'rock' ? 'mine' : 'chop' });
  jobs.sort((a, b) => a.start - b.start);
  const used = new Set();
  jobs.slice(0, homes.length).forEach((j, k) => {
    const home = homes[k % homes.length]; used.add(home);
    const d = Math.hypot(j.x - home.x, j.y - home.y), el = tn - j.start, walkT = d / WALK_SPEED;
    if (el < walkT) {
      const f = Math.max(0, el / walkT), a = Math.atan2(j.y - home.y, j.x - home.x);
      out.push({ worker: true, x: home.x + (j.x - home.x) * f, y: home.y + (j.y - home.y) * f, pose: 'walk', dir: DIR8[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8], f: Math.floor(tn * 6) % 2 });
    } else out.push({ worker: true, x: j.x, y: j.y, pose: j.act, f: Math.floor(tn * 7 + k) % 4 });
  });
  for (const h of homes) if (!used.has(h)) out.push({ worker: true, x: h.x + 0.6, y: h.y + 0.15, pose: 'idle', dir: 'S' });
  return out;
}
function drawWorker(ctx, w, sx, sy, s) {
  const M = WORKER.meta, r = w.pose === 'walk' ? M.walk[w.dir][1 + w.f] : w.pose === 'idle' ? M.walk[w.dir][0] : M.work[w.pose][w.f];
  const [x, y, fw, fh, ax, ay] = r, px = sx(w.x), py = sy(w.y);
  ctx.drawImage(WORKER.img, x, y, fw, fh, Math.round(px - ax * s), Math.round(py - ay * s), Math.round(fw * s), Math.round(fh * s));
}
/** the Northern King's palace (docs/design/19-cap-anh-hung.md) with its peace ring and name */
export function drawKing(ctx, sx, sy, z, s, t) {
  const K = S.king; if (!K) return;
  const a = BSPR.atlas?.['nha-vua'], img = BSPR.img['nha-vua'];
  const x = sx(K.tx + KING_SIZE[0] / 2), y = sy(K.ty + KING_SIZE[1]);
  ctx.save(); ctx.strokeStyle = '#ffd23a55'; ctx.lineWidth = Math.max(1, s); ctx.setLineDash([5 * s, 4 * s]); ctx.lineDashOffset = -t * 5;
  ctx.beginPath(); ctx.ellipse(sx(K.x), sy(K.y), KING_SAFE_R * T * z, KING_SAFE_R * T * z, 0, 0, 7); ctx.stroke(); ctx.restore();
  const ps = s * PALACE_SCALE;
  if (a && img) ctx.drawImage(img, 0, 0, a.size[0], a.size[1], Math.round(x - a.anchor[0] * ps), Math.round(y - a.anchor[1] * ps), Math.round(a.size[0] * ps), Math.round(a.size[1] * ps));
  const top = y - (a ? a.anchor[1] * ps : 120 * ps) - 6 * s;
  ctx.font = `700 ${Math.max(12, 7 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726';
  ctx.strokeText('👑 Nhà vua phía Bắc', x, top); ctx.fillStyle = '#ffd23a'; ctx.fillText('👑 Nhà vua phía Bắc', x, top);
  ctx.font = `600 ${Math.max(10, 5 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.strokeText('Vùng hoà bình · mở giới hạn sức mạnh', x, top + 12 * s); ctx.fillStyle = '#e8dcc8'; ctx.fillText('Vùng hoà bình · mở giới hạn sức mạnh', x, top + 12 * s);
}
/** the Desert Queen's palace (13/11/2026): imported art 'nu-hoang' when it exists, else a tent camp drawn here */
function tipi(ctx, x, y, w, h, body, stripe, s) {
  ctx.fillStyle = '#1b1726'; ctx.beginPath(); ctx.moveTo(x, y - h - s); ctx.lineTo(x + w / 2 + s, y + s); ctx.lineTo(x - w / 2 - s, y + s); ctx.fill();
  ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + w / 2, y); ctx.lineTo(x - w / 2, y); ctx.fill();
  ctx.fillStyle = stripe; ctx.fillRect(Math.round(x - w * 0.32), Math.round(y - h * 0.42), Math.round(w * 0.64), Math.max(1, Math.round(2 * s)));
  ctx.fillRect(Math.round(x - w * 0.22), Math.round(y - h * 0.62), Math.round(w * 0.44), Math.max(1, Math.round(s)));
  ctx.fillStyle = '#5a2a1a'; ctx.beginPath(); ctx.moveTo(x, y - h * 0.3); ctx.lineTo(x + w * 0.12, y); ctx.lineTo(x - w * 0.12, y); ctx.fill();
  ctx.fillStyle = '#7a4a2a'; ctx.fillRect(Math.round(x - 3 * s), Math.round(y - h - 6 * s), Math.max(1, s), 7 * s); ctx.fillRect(Math.round(x + 2 * s), Math.round(y - h - 5 * s), Math.max(1, s), 6 * s);
}
export function drawQueen(ctx, sx, sy, z, s, t) {
  const Q = S.queen; if (!Q) return;
  const a = BSPR.atlas?.['nu-hoang'], img = BSPR.img['nu-hoang'];
  const x = sx(Q.tx + QUEEN_SIZE[0] / 2), y = sy(Q.ty + QUEEN_SIZE[1]);
  ctx.save(); ctx.strokeStyle = '#ffb04a55'; ctx.lineWidth = Math.max(1, s); ctx.setLineDash([5 * s, 4 * s]); ctx.lineDashOffset = -t * 5;
  ctx.beginPath(); ctx.ellipse(sx(Q.x), sy(Q.y), QUEEN_SAFE_R * T * z, QUEEN_SAFE_R * T * z, 0, 0, 7); ctx.stroke(); ctx.restore();
  let top;
  const ps = s * PALACE_SCALE;
  if (a && img) { ctx.drawImage(img, 0, 0, a.size[0], a.size[1], Math.round(x - a.anchor[0] * ps), Math.round(y - a.anchor[1] * ps), Math.round(a.size[0] * ps), Math.round(a.size[1] * ps)); top = y - a.anchor[1] * ps - 6 * s; }
  else {
    const u = T * z; // placeholder camp until the art arrives
    tipi(ctx, x - 3.4 * u, y - 1.2 * u, 3 * u, 4 * u, '#d88a3a', '#2a6a8a', s);
    tipi(ctx, x + 3.4 * u, y - 1.2 * u, 3 * u, 4 * u, '#d88a3a', '#2a6a8a', s);
    tipi(ctx, x, y - 2.2 * u, 5 * u, 7 * u, '#e8a040', '#c03a2a', s);
    for (const dx of [-1.6, 1.6]) { const fx = x + dx * u, fy = y - 0.6 * u, f = Math.sin(t * 9 + dx) * s; ctx.fillStyle = '#5a3a2a'; ctx.fillRect(fx - 2 * s, fy, 4 * s, 2 * s); ctx.fillStyle = '#ffb02a'; ctx.fillRect(fx - 1.5 * s, fy - 4 * s + f, 3 * s, 4 * s); ctx.fillStyle = '#fff2a0'; ctx.fillRect(fx - 0.5 * s, fy - 2 * s + f, s, 2 * s); }
    top = y - 9.4 * u;
  }
  ctx.font = `700 ${Math.max(12, 7 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726';
  ctx.strokeText('🏜 Nữ hoàng Sa mạc', x, top); ctx.fillStyle = '#ffb04a'; ctx.fillText('🏜 Nữ hoàng Sa mạc', x, top);
  ctx.font = `600 ${Math.max(10, 5 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.strokeText('Vùng hoà bình · mở giới hạn mỏ', x, top + 12 * s); ctx.fillStyle = '#e8dcc8'; ctx.fillText('Vùng hoà bình · mở giới hạn mỏ', x, top + 12 * s);
}
export function drawBaseSprite(ctx, it, sx, sy, z, s, t) {
  if (it.worker) return drawWorker(ctx, it, sx, sy, s);
  if (it.walker) return drawUnit(ctx, skinOf(it.type, it.lv), 'blue', it.pose, it.dir, sx(it.x), sy(it.y), s * 0.6 * (it.type === 'rong' ? 0.55 : UNITS[it.type]?.slots > 1 ? 0.8 : 1));
  if (it.soldier) return drawUnit(ctx, skinOf(it.type, it.team === 'blue' ? S.unitLv?.[it.type] ?? 1 : 1), it.team, Math.floor(t * 1.5 + it.ph) % 7 === 0 ? 'walk' : 'idle', 0, sx(it.x), sy(it.y) + (Math.round(Math.sin(t * 3 + it.ph) * 0.6) * s), s * 0.6 * (it.type === 'rong' ? 0.55 : UNITS[it.type]?.slots > 1 ? 0.8 : 1)); // ×0.6 so the rows fit in the yard
  const sel = S.sel?.k === 'build' && S.sel.key === it.key && (S.sel.id === it.id || S.selWalls?.has(it.id));
  const moving = S.build?.mode === 'move' && S.build.items.includes(it);
  if (moving) ctx.globalAlpha = 0.35;
  if (BUILDINGS[it.type]?.deco) { // small sprite standing at the bottom centre of its footprint
    const sz = SIZE(it.type); drawDeco(ctx, it.type, sx(it.tx + sz / 2), sy(it.ty + sz) - 2 * s, s, S.baseGlow?.get(it.key));
    if (sel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1, s); ctx.strokeRect(sx(it.tx) + 0.5, sy(it.ty) + 0.5, sz * T * z - 1, sz * T * z - 1); }
    ctx.globalAlpha = 1; return;
  }
  if (it.type === 'tuong') drawWall(ctx, it, sx, sy, z, s, sel);
  else {
    const a = BSPR.atlas?.[it.type], img = teamTint(BSPR.img[it.type], S.baseGlow?.get(it.key));
    if (a && img) {
      const [cw, ch] = a.size, [ox, oy] = a.anchor, sz = SIZE(it.type);
      const row = bRow(a, it.lv, it.state === 'ruin', it.hid);
      const x = sx(it.tx + sz / 2), y = sy(it.ty + sz * 0.72);
      if (it.state === 'build') ctx.globalAlpha *= 0.55;
      if (it.state !== 'ruin' && !moving) drawOutline(ctx, img, 0, row * ch, cw, ch, Math.round(x - ox * s), Math.round(y - oy * s), Math.round(cw * s), Math.round(ch * s), S.baseGlow?.get(it.key), Math.max(1, Math.round(s * 0.6)));
      ctx.drawImage(img, 0, row * ch, cw, ch, Math.round(x - ox * s), Math.round(y - oy * s), Math.round(cw * s), Math.round(ch * s));
      ctx.globalAlpha = moving ? 0.35 : 1;
      if (it.state === 'build') scaffold(ctx, x, y, cw * s, ch * s, oy * s, s);
      if (sel) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, s); ctx.strokeRect(sx(it.tx) + 1, sy(it.ty) + 1, sz * T * z - 2, sz * T * z - 2); }
    }
  }
  ctx.globalAlpha = 1;
}
// walls like Clash of Clans: every tile is a pillar; a short wall section joins it to a wall tile on its right and below
function block(ctx, x, y, w, d, h, c, s, lv) {
  // footprint (x, y, w, d) on the ground, raised by h: top face then front face
  ctx.fillStyle = c.top; ctx.fillRect(x, y - h, w, d);
  ctx.fillStyle = c.front; ctx.fillRect(x, y + d - h, w, h);
  ctx.fillStyle = c.line;
  const l = Math.max(1, Math.round(s * 0.5));
  if (lv <= 2) for (let k = 1; k * 4 * s < w; k++) ctx.fillRect(x + k * 4 * s, y + d - h, l, h); // logs
  else { ctx.fillRect(x, y + d - h / 2, w, l); for (let k = 1; k * 6 * s < w; k++) ctx.fillRect(x + k * 6 * s - ((k % 2) * 3 * s), y + d - h, l, h / 2); } // bricks
  if (c.cap) { ctx.fillStyle = c.cap; ctx.fillRect(x, y + d - h, w, Math.max(1, s)); }
  ctx.strokeStyle = '#1b1726'; ctx.lineWidth = l; ctx.strokeRect(x + 0.5, y - h + 0.5, w - 1, d + h - 1);
}
/** a short joined wall (3 pillars) from the hand-drawn pieces, for the shop card / dialogs; null until loaded */
function wallPic(lv = 1, k = 1) {
  const A = BSPR.atlas?.tuong, img = BSPR.img.tuong; if (!A?.pieces || !img) return null;
  const P = A.pieces[wallLv(A, lv)], pr = P[0], j = P[1], step = 32, H = Math.max(pr[3], j[3]) + 2, Wd = step * 2 + Math.max(pr[2], j[2] - step);
  const c = document.createElement('canvas'); c.width = Math.round(Wd * k); c.height = Math.round(H * k);
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const put = (r, px, py) => x.drawImage(img, r[0], r[1], r[2], r[3], Math.round(px * k), Math.round(py * k), Math.round(r[2] * k), Math.round(r[3] * k));
  for (let i = 0; i < 3; i++) { put(pr, i * step, H - pr[3]); if (i < 2) put(j, i * step, H - j[3]); }
  return c;
}
/** one wall pillar (the user's 1-post model) at a level, for dialogs; ruin = the rubble piece */
function wallPost(lv = 1, k = 1, ruin = false) {
  const A = BSPR.atlas?.tuong, img = BSPR.img.tuong; if (!A?.pieces || !img) return null;
  const r = A.pieces[wallLv(A, lv)][ruin ? 3 : 0], c = document.createElement('canvas');
  c.width = Math.round(r[2] * k); c.height = Math.round(r[3] * k);
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(img, r[0], r[1], r[2], r[3], 0, 0, c.width, c.height);
  return c;
}
/** hand-drawn wall pieces (pillar, join right, join down, rubble): a pillar in every tile, joins toward neighbours */
function drawWallArt(ctx, it, x, y, w, s, sel) {
  const A = BSPR.atlas.tuong, img = BSPR.img.tuong, P = A.pieces[wallLv(A, it.lv)], at = S.wallAt ?? new Map();
  const put = (r, px, py) => ctx.drawImage(img, r[0], r[1], r[2], r[3], Math.round(px), Math.round(py), Math.round(r[2] * s), Math.round(r[3] * s));
  const cx = x + w / 2, base = y + w * 0.86; // pillar foot inside the tile
  if (it.state === 'ruin') { const r = P[3]; put(r, cx - (r[2] * s) / 2, base - r[3] * s); return; }
  if (it.state === 'build') ctx.globalAlpha *= 0.55;
  const pr = P[0], pl = cx - (pr[2] * s) / 2, ptop = base - pr[3] * s;
  ctx.fillStyle = '#0004'; ctx.fillRect(pl, base - 2 * s, pr[2] * s, 4 * s);
  if (at.get(it.tx + ',' + (it.ty + 1))) { const r = P[2]; put(r, cx - (r[2] * s) / 2, ptop); }
  put(pr, pl, ptop);
  if (at.get(it.tx + 1 + ',' + it.ty)) { const r = P[1]; put(r, pl, base - r[3] * s); }
  if (sel) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, s); ctx.strokeRect(pl - 1, ptop - 1, pr[2] * s + 2, pr[3] * s + 2); }
  ctx.globalAlpha = 1;
}
function drawWall(ctx, it, sx, sy, z, s, sel) {
  const x = sx(it.tx), y = sy(it.ty), w = T * z;
  if (BSPR.atlas?.tuong?.pieces && BSPR.img.tuong) return drawWallArt(ctx, it, x, y, w, s, sel);
  if (it.state === 'ruin') { ctx.fillStyle = '#4a4a52'; for (let k = 0; k < 4; k++) ctx.fillRect(x + ((k * 7) % 11) * w / 16, y + w * 0.4 + ((k * 5) % 7) * w / 16, w / 4, w / 6); ctx.fillStyle = '#6a6a72'; ctx.fillRect(x + w * 0.35, y + w * 0.5, w / 5, w / 8); return; }
  const c = WALL_COL[Math.min(WALL_COL.length, it.lv) - 1], at = S.wallAt ?? new Map(); // levels 6–8: the last colour set until the art is loaded
  const P = Math.round(w * 0.62), o = (w - P) / 2, H = Math.round(w * 0.6), J = Math.round(w * 0.42), jh = Math.round(H * 0.82), jo = (w - J) / 2;
  if (it.state === 'build') ctx.globalAlpha *= 0.55;
  ctx.fillStyle = '#0004'; ctx.fillRect(x + o, y + o + P - Math.round(w * 0.06), P, Math.round(w * 0.14));
  const R = at.get(it.tx + 1 + ',' + it.ty), D = at.get(it.tx + ',' + (it.ty + 1));
  // join toward the tile below first (it runs toward the viewer, behind the next pillar)
  if (D) block(ctx, x + jo, y + o + P / 2, J, w - P / 2 + o, jh, c, s, it.lv);
  block(ctx, x + o, y + o, P, P, H, c, s, it.lv);
  if (R) block(ctx, x + o + P - 1, y + jo + (P - J) / 2, w - P + 2, J, jh, c, s, it.lv);
  // tips: sharpened logs (wood), a small gold knob on marble pillars
  if (it.lv <= 2) { ctx.fillStyle = c.top; for (let k = 0; k < 3; k++) { const px = x + o + (k + 0.5) * (P / 3); ctx.beginPath(); ctx.moveTo(px - P / 7, y + o - H + 1); ctx.lineTo(px, y + o - H - P / 5); ctx.lineTo(px + P / 7, y + o - H + 1); ctx.fill(); } }
  if (it.lv === 5) { ctx.fillStyle = '#e8b830'; ctx.fillRect(x + w / 2 - 2 * s, y + o - H - 3 * s, 4 * s, 3 * s); }
  if (sel) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, s); ctx.strokeRect(x + o - 1, y + o - H - 1, P + 2, P + H + 2); }
  ctx.globalAlpha = 1;
}
function scaffold(ctx, x, y, w, h, oy, s) {
  ctx.strokeStyle = '#8a5a32'; ctx.lineWidth = Math.max(1, s);
  const x0 = x - w * 0.4, x1 = x + w * 0.4, y0 = y - oy * 0.95, y1 = y;
  for (let k = 0; k <= 3; k++) { const xx = x0 + ((x1 - x0) * k) / 3; ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx, y1); ctx.stroke(); }
  for (let k = 0; k <= 4; k++) { const yy = y0 + ((y1 - y0) * k) / 4; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x1, y0); ctx.stroke();
}
/** bars, labels and progress on top of everything */
export function drawBaseTop(ctx, sx, sy, z, s, t, vis) {
  const tn = now();
  drawClears(ctx, sx, sy, z, s, vis);
  // Học viện researching: blue bar + countdown above it
  const ac = S.research && S.myBase?.items.find((i) => i.type === 'hoc-vien');
  if (ac && vis(ac.tx + 1, ac.ty + 1, 4)) {
    const x = sx(ac.tx + 1), top = sy(ac.ty + 0.4) - 40 * s, k = Math.max(0, Math.min(1, 1 - (S.research.doneAt - tn) / S.research.total)), w = 30 * s;
    ctx.fillStyle = '#1b1726'; ctx.fillRect(x - w / 2 - 1, top - 1, w + 2, 4 * s + 2); ctx.fillStyle = '#9a6aff'; ctx.fillRect(x - w / 2, top, w * k, 4 * s);
    ctx.font = `600 ${Math.max(10, 5 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(`🎓 ${UNITS[S.research.unit].name} ${S.research.lv} · ${fmtT(Math.max(0, S.research.doneAt - tn))}`, x, top - 3 * s);
  }
  // Hội thành selected: its watch range
  if (S.sel?.k === 'build') { const it = findItem(S.sel.key, S.sel.id); if (it?.type === 'hoi-thanh' && it.state !== 'build') { const r = CASTLE_RANGE[it.lv - 1] * T * z, c = 1.5; ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.beginPath(); ctx.ellipse(sx(it.tx + c), sy(it.ty + c), r, r, 0, 0, 7); ctx.fillStyle = '#ff9a4a14'; ctx.fill(); ctx.strokeStyle = '#ffb04a'; ctx.lineWidth = Math.max(2, s * 1.5); ctx.setLineDash([6 * s, 4 * s]); ctx.lineDashOffset = -t * 6; ctx.stroke(); ctx.restore(); } }
  if (S.build && S.buildTip) tip(ctx, S.mouse.x + 16, S.mouse.y + 20, S.buildTip[0], S.buildTip[1]);
  for (const bb of S.bases ?? []) for (const it of bb.items) {
    const sz = SIZE(it.type); if (!vis(it.tx + sz / 2, it.ty + sz / 2, sz + 2)) continue;
    const x = sx(it.tx + sz / 2), top = it.type === 'tuong' ? sy(it.ty) - 12 * s : sy(it.ty + sz * 0.72) - (BSPR.atlas?.[it.type]?.anchor[1] ?? 60) * s - 6 * s;
    const u = it.uid && S.byId.get(it.uid);
    if ((it.state === 'build' || it.state === 'up') && it.total) {
      const k = Math.max(0, Math.min(1, 1 - (it.doneAt - tn) / it.total)), w = Math.max(24, sz * 14) * s;
      ctx.fillStyle = '#1b1726'; ctx.fillRect(x - w / 2 - 1, top - 1, w + 2, 4 * s + 2); ctx.fillStyle = it.state === 'up' ? '#4aa8ff' : '#f0c030'; ctx.fillRect(x - w / 2, top, w * k, 4 * s);
      if (it.type !== 'tuong' && it.doneAt - tn > 0) { ctx.font = `600 ${Math.max(10, 5 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(`${it.state === 'up' ? '⬆ ' : '🔨 '}${fmtT(it.doneAt - tn)}`, x, top - 3 * s); }
    } else if (u && u.hp < u.maxHp) {
      const w = Math.max(16, sz * 14) * s;
      ctx.fillStyle = '#1b1726'; ctx.fillRect(x - w / 2 - 1, top - 1, w + 2, 3 * s + 2);
      ctx.fillStyle = bb.key === myKey() ? '#3ee06b' : '#ff4a4a'; ctx.fillRect(x - w / 2, top, (w * u.hp) / u.maxHp, 3 * s);
    }
    if (it.type === 'thanh-tri') {
      ctx.font = `600 ${Math.max(11, 6 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726';
      const label = `🏰 ${bb.name} · cấp ${it.lv}${bb.shield ? ' · 🛡' : ''}${it.state === 'ruin' ? ' · đổ nát' : ''}`;
      ctx.strokeText(label, x, top - 14 * s); ctx.fillStyle = bb.color; ctx.fillText(label, x, top - 14 * s);
    }
  }
}
const fmtT = (sec) => (sec >= 60 ? `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}` : `${Math.ceil(sec)}s`);

// ------------------------------------------------------------ shop tab
export function renderBuildShop(grid, buyFn, only = null) {
  const thNeed = (t) => (t === 'thanh-tri' ? 0 : TOWN_HALL.levels.findIndex((l) => l.max[t] > 0) + 1 || 99);
  // every building is listed (16/11/2026), in unlock order; the locked ones are greyed with the Thành trì level that opens them
  const base = ['thanh-tri', 'thap-cung', 'phao-da', 'thap-phep', 'tuong', 'kho', 'doanh-trai', 'hoi-thanh', 'ruong-do', 'lo-nghien', 'lo-ren', 'hoc-vien', 'nha-tho-xay', 'bom', 'lo-xo', 'bom-khi'];
  const types = only ?? [...base, ...Object.keys(BUILDINGS).filter((k) => !BUILDINGS[k].deco && !base.includes(k))].map((t, i) => [t, i]).sort((a, b) => thNeed(a[0]) - thNeed(b[0]) || a[1] - b[1]).map(([t]) => t);
  if (grid.dataset.built !== '1') {
    grid.dataset.built = '1'; grid.innerHTML = '';
    for (const type of types) {
      const c = document.createElement('div'); c.className = 'card bcard'; c.dataset.type = type;
      const st = buildStats(type, 1), d = type === 'thanh-tri' ? 'Tim căn cứ. Mở khóa số lượng công trình, thợ xây và sức chứa tài nguyên. Tướng chết xuất trận lại ở đây.' : BUILDINGS[type].desc;
      c.title = d;
      c.innerHTML = `<div class="sp"></div><div class="nm">${B_NAME(type)}</div><div class="cls">${SIZE(type)}×${SIZE(type)} ô · ${buildTime(type, 1) ? 'xây ' + fmtT(buildTime(type, 1)) : 'xây ngay'}</div><div class="cost"></div><div class="stats">${BUILDINGS[type]?.deco ? `Trang trí · ${BUILDINGS[type].size > 1 ? "món lớn" : "món nhỏ"}` : trapLine(type, 1) ?? `Máu ${st.hp}${st.atk ? ` · ATK ${st.atk} · tầm ${st.range}` : ''}`}</div><div class="lim"></div><button>XÂY</button>`;
      const a = BSPR.atlas?.[type], img = BSPR.img[type];
      if (a?.size && img) { const cv = document.createElement('canvas'), k = Math.min(1, 80 / a.size[1]); cv.width = Math.round(a.size[0] * k); cv.height = Math.round(a.size[1] * k); const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0, a.size[0], a.size[1], 0, 0, cv.width, cv.height); c.querySelector('.sp').appendChild(cv); }
      else if (BUILDINGS[type]?.deco) { const cv = decoPic(type, BUILDINGS[type].size > 1 ? 1.5 : 2); if (cv) c.querySelector('.sp').appendChild(cv); }
      else if (BUILDINGS[type]?.trap) { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; drawTrap(x, type, 32, 44, 1.8, false); c.querySelector('.sp').appendChild(cv); }
      else if (type === 'tuong') { const wp = wallPic(1, 1); if (wp) c.querySelector('.sp').appendChild(wp); else c.querySelector('.sp').innerHTML = '<div style="width:44px;height:30px;margin:20px auto 0;background:linear-gradient(#a8784a 0 45%,#6a4424 45%);border:2px solid #1b1726"></div>'; }
      c.querySelector('button').onclick = () => { const need = buildNeeds(type); if (need.length) return showNeed(`Chưa xây được ${B_NAME(type)}`, need); buyFn(type); };
      grid.appendChild(c);
    }
  }
  const me = S.me; if (!me) return;
  const have = Object.fromEntries(RES.map((r, i) => [r, me.res[i]]));
  for (const c of grid.children) {
    const type = c.dataset.type, inf = placeInfo(type);
    c.querySelector('.cost').innerHTML = Object.entries(inf.cost).map(([r, v]) => `<span class="${have[r] < v ? 'miss' : ''}"><i class="ic" data-r="${r}" title="${RES_INFO[r].name}" style="--c:${RES_INFO[r].color}"></i>${v}</span>`).join('');
    c.querySelector('.lim').textContent = inf.lim == null ? '' : inf.lim === Infinity ? `Đã xây ${inf.n} · không giới hạn${inf.rise > 1 ? ` · giá ×${inf.rise.toFixed(2).replace(/\.?0+$/, '')}` : ''}` : `Đã xây ${inf.n} / ${inf.lim}`;
    const locked = !!inf.reason?.startsWith('🔒'); c.classList.toggle('locked', locked); if (locked) c.querySelector('.lim').textContent = '';
    const b = c.querySelector('button'); b.disabled = locked; b.classList.toggle('lack', !!inf.reason); b.textContent = inf.reason ?? 'XÂY';
  }
}

// ------------------------------------------------------------ info panel
export function buildInfoHtml(sel) {
  const it = findItem(sel.key, sel.id); if (!it) return null;
  const bb = S.bases.find((b) => b.key === sel.key), mine = bb.key === myKey(), st = buildStats(it.type, it.lv), u = it.uid && S.byId.get(it.uid);
  if (BUILDINGS[it.type]?.deco) {
    const p = decoPic(it.type, 2);
    return `<h3>${B_NAME(it.type)}</h3><div class="muted">Đồ trang trí · <span style="color:${bb.color}">${mine ? 'Căn cứ của bạn' : 'Căn cứ của ' + bb.name}</span></div>${p ? `<div style="text-align:center;margin:6px 0"><img src="${p.toDataURL()}" style="image-rendering:pixelated"></div>` : ''}<div class="muted">${BUILDINGS[it.type].desc}</div>`
      + (mine ? `<button id="b-move">✥ Dời (hoặc nháy đúp)</button><button id="b-sell">📦 Cất lại · hoàn ${fmtCost(BUILDINGS[it.type].cost)}</button>` : '');
  }
  const nsel = S.selWalls?.size ?? 0;
  let html = `<h3>${B_NAME(it.type)}${it.type === 'tuong' && nsel > 1 ? ` (${nsel} đoạn)` : ''}</h3><div class="muted">Cấp ${it.lv} · <span style="color:${bb.color}">${mine ? 'Căn cứ của bạn' : 'Căn cứ của ' + bb.name}</span>${it.state === 'ruin' ? ' · <b style="color:#ff8a8a">đổ nát</b>' : it.state === 'build' ? ' · đang xây' : it.state === 'up' ? ' · đang nâng cấp' : ''}</div>
    <table><tr><td>Máu</td><td>${u ? Math.ceil(u.hp) + ' / ' : ''}${st.hp}</td></tr><tr><td>Giáp</td><td>${Math.round(st.armor * 100)}%</td></tr>${st.atk ? `<tr><td>Sát thương</td><td>${st.atk} / ${st.cd}s</td></tr><tr><td>Tầm</td><td>${st.range} ô</td></tr>` : ''}`;
  if (it.type === 'thanh-tri') {
    const L = TOWN_HALL.levels[it.lv - 1];
    html += `<tr><td>Thợ xây</td><td>${busy(bb)} bận / ${builders(bb)} (tối đa 5 nhà)</td></tr><tr><td>Lính trong căn cứ</td><td>${bb.gar}</td></tr>${bb.shield ? `<tr><td>Khiên</td><td>${fmtT(bb.shield)}</td></tr>` : ''}`;
  }
  if (it.type === 'nha-tho-xay') html += `<tr><td>Thợ xây</td><td>1 người ở đây</td></tr>`;
  if (it.type === 'hoc-vien' && mine) html += `<tr><td>Nghiên cứu</td><td>${S.research ? `${UNITS[S.research.unit].name} cấp ${unitLvLabel(S.research.unit, S.research.lv)} · ${fmtT(Math.max(0, S.research.doneAt - now()))}` : 'đang rảnh'}</td></tr>`;
  if (BUILDINGS[it.type]?.trap) html += `<tr><td>Bẫy</td><td>${trapLine(it.type, it.lv)}</td></tr><tr><td>Trạng thái</td><td>${it.state === 'used' ? `đã nổ · nạp lại ${fmtT(Math.max(0, it.doneAt - now()))}` : it.state === 'ok' ? 'sẵn sàng (địch không thấy)' : '…'}</td></tr>`;
  if (it.type === 'hoi-thanh') {
    if (mine) { const c = castleInfo(it); html += `<tr><td>Sức chứa</td><td>${c.used} / ${c.cap} chỗ</td></tr><tr><td>Tầm canh</td><td>${CASTLE_RANGE[it.lv - 1]} ô</td></tr><tr><td>Bên trong</td><td>${c.list || 'trống'}${c.out ? ` · <b style="color:#ffb04a">${c.out} đang ra trận</b>` : ''}</td></tr>`; }
    else html += `<tr><td>Bên trong</td><td>không rõ (có thể có lính phục kích)</td></tr>`;
  }
  if (it.type === 'doanh-trai') html += `<tr><td>Sức chứa</td><td>${BUILDINGS['doanh-trai'].barracks[it.lv - 1]} chỗ${it.lv < bMaxLv('doanh-trai', TH_MAX) ? ` (cấp ${it.lv + 1}: ${BUILDINGS['doanh-trai'].barracks[it.lv]})` : ''}</td></tr>${mine && S.me?.ac?.[1] ? `<tr><td>Đang dùng</td><td>${S.me.ac[0]} / ${S.me.ac[1]} chỗ</td></tr>` : ''}<tr><td>Lính đang cất</td><td>${Object.values(bb.gl ?? {}).reduce((a, n) => a + n, 0)}</td></tr>`;
  if (it.type === 'kho') html += `<tr><td>Sức chứa</td><td>+${Math.round(BUILDINGS.kho.store[it.lv - 1] * STORE_MULT * 100)}%</td></tr>`;
  if (BUILDINGS[it.type]?.homeHero) { const H = HOME_HEROES[BUILDINGS[it.type].homeHero], hs = homeHeroStats(BUILDINGS[it.type].homeHero, it.lv), rest = it.restAt > now();
    html += `<tr><td>Tướng</td><td>${H.name} cấp ${it.lv}</td></tr><tr><td>Máu / ST</td><td>${hs.hp.toLocaleString('vi')} / ${hs.atk}</td></tr><tr><td>Trạng thái</td><td>${rest ? `<b style="color:#ffb04a">đang nghỉ · ${fmtT(it.restAt - now())}</b>` : it.state === 'up' ? 'đang luyện (không ra trận)' : 'đang giữ nhà'}</td></tr>`; }
  if (BUILDINGS[it.type]?.hideR) html += `<tr><td>Trạng thái</td><td>${it.hid ? 'đang ẩn dưới đất' : '<b style="color:#ffb04a">đã trồi lên</b>'}</td></tr>`;
  if (BUILDINGS[it.type]?.unlockTh) html += `<tr><td>Cấp tối đa</td><td>${bMaxLv(it.type, thOf(bb)?.lv ?? 1)} (TH hiện tại) / ${bMaxLv(it.type, TH_MAX)}</td></tr>`;
  html += '</table>';
  if (!mine) { if (S.alive && it.uid && it.state !== 'ruin') html += `<button id="b-attack">Tấn công</button>`; return html; }
  if (it.type === 'thanh-tri' && it.lv < TH_MAX) {
    const N = TOWN_HALL.levels[it.lv];
    html += `<div class="muted">Cấp ${it.lv + 1}: Tháp cung ${N.max['thap-cung']}, Pháo đá ${N.max['phao-da']}, Tháp phép ${N.max['thap-phep']}, Tường ${N.max.tuong}, Kho ${N.max.kho}, sức chứa ×${Math.round(N.store * STORE_MULT * 100) / 100}</div>`;
  }
  if (it.state === 'ok' && it.lv < bMaxLv(it.type, TH_MAX) && !BUILDINGS[it.type]?.noLevels) {
    const c = buildCost(it.type, it.lv + 1, bb.items.filter((i) => i.type === it.type).length), lack = upgradeNeeds(it).length;
    html += `<button id="b-up" class="${lack ? 'lack' : ''}">⬆ Nâng cấp ${it.lv + 1} · ${fmtCost(c)}${buildTime(it.type, it.lv + 1) ? ' · ' + fmtT(buildTime(it.type, it.lv + 1)) : ''}${lack ? ' <small class="lackt">(còn thiếu, bấm để xem)</small>' : ''}</button>`;
  }
  if (it.type === 'tuong') {
    // pick a whole row / column / cluster of wall pieces, then upgrade or move them together
    const h = wallLine(it, 1, 0), v = wallLine(it, 0, 1), g = wallGroup(it);
    html += `<div class="wsel"><button id="b-wh" title="Chọn cả hàng ngang">↔ Hàng ngang (${h.length})</button><button id="b-wv" title="Chọn cả hàng dọc">↕ Hàng dọc (${v.length})</button><button id="b-wg" title="Chọn cả cụm tường nối liền">▦ Cả cụm (${g.length})</button></div>`;
    if (nsel > 1) {
      const thl = thOf(bb)?.lv ?? 1, sel = [...S.selWalls].map((id) => findItem(bb.key, id)).filter((w) => w && w.state === 'ok' && w.lv < thl && w.lv < TH_MAX), tot = {};
      for (const w of sel) for (const [r, x] of Object.entries(buildCost('tuong', w.lv + 1))) tot[r] = (tot[r] ?? 0) + x;
      html += `<button id="b-upsel" ${sel.length ? '' : 'disabled'}>${sel.length ? `⬆ Nâng ${sel.length} đoạn đã chọn · ${fmtCost(tot)}` : `Các đoạn đã chọn đã tối đa (cần Thành trì cấp cao hơn)`}</button>`;
    }
  }
  if (it.state === 'ruin') html += `<button id="b-repair">🔧 Sửa ngay · ${fmtCost(repairCost(it))}</button>`;
  if (it.type === 'thanh-tri' && S.room?.mode === 'endless') html += `<button id="b-dlog" class="copen">📖 Nhật ký phòng thủ</button>`;
  if (it.type === 'hoc-vien') html += `<button id="b-lab" class="lab-open">⚔ Nâng cấp quân</button>`;
  if (it.type === 'doanh-trai') html += `<button id="b-camp" class="copen">⛺ Xem chi tiết quân</button>`;
  if (it.state !== 'build' && it.state !== 'ruin') { if (it.type === 'ruong-do') html += `<button id="b-craft" data-m="chest" class="copen">📦 Mở rương</button>`; if (it.type === 'lo-nghien') html += `<button id="b-craft" data-m="grind" class="copen">⚙ Nghiền đồ</button>`; if (it.type === 'lo-ren') html += `<button id="b-craft" data-m="forge" class="copen">🔨 Rèn đồ</button>`; }
  if (it.type === 'hoi-thanh' && it.state !== 'build') html += castleControls(it);
  { const n = myRuins().length; if (n > 1 || (n === 1 && it.state !== 'ruin')) html += `<button id="b-repairall">🔧 Sửa tất cả (${n} công trình hỏng)</button>`; }
  if (it.type === 'thanh-tri' && mine && S.room?.mode === 'endless') {
    const have = S.me ? Object.fromEntries(RES.map((r, i) => [r, S.me.res[i]])) : {}, fee = Object.fromEntries(['iron', 'coal', 'gold', 'oil', 'tar'].map((r) => [r, Math.floor((have[r] ?? 0) * 0.2)]).filter(([, v]) => v > 0));
    html += S.myBase?.mvd ? `<button id="b-move" disabled>🏠 Hôm nay đã chuyển nhà (mai chuyển tiếp)</button>` : `<button id="b-move">🏠 Chuyển nhà (cả căn cứ)</button><div class="muted">1 lần / ngày · phí 20% sắt, than, vàng, dầu, dầu đen đang có (bây giờ ≈ ${fmtCost(fee) || '0'}). Kéo Thành trì tới chỗ mới đủ rộng.</div>`;
  } else html += `<button id="b-move">✥ Dời${nsel > 1 ? ` ${nsel} đoạn đã chọn` : ''}</button>`;
  if (it.type === 'tuong') html += `${nsel > 1 ? '<button id="b-wclear">✕ Bỏ chọn</button>' : ''}<div class="muted">Nháy đúp vào tường = cầm cả hàng (hoặc cả nhóm đã chọn) để dời. Shift + chuột trái để chọn thêm từng đoạn.</div>`;
  if (it.type === 'thanh-tri') html += `<div class="muted">Dời Thành trì thì cả căn cứ dời theo.</div>`;
  else html += `<button id="b-remove">🗑 Phá bỏ (không hoàn tiền)</button>`;
  return html;
}
// ------------------------------------------------------------ Hội thành (docs/design/can-cu/10-hoi-thanh.md)
function castleInfo(it) {
  const ca = S.myBase?.ca ?? [], inside = {}, cap = CASTLE_CAP[it.lv - 1];
  let used = 0, out = 0;
  for (const s of ca) { const t = s.replace('!', ''); used += HOUSING[t] ?? 1; if (s[0] === '!') out++; else inside[t] = (inside[t] ?? 0) + 1; }
  const list = Object.entries(inside).map(([t, n]) => `${UNITS[t].name} ×${n}`).join(', ');
  return { used, cap, out, inside, list };
}
function castleControls(it) {
  const c = castleInfo(it), army = {};
  for (const u of S.view ?? []) if (u.owner === S.you && UNITS[u.type] && !(u.flags & 6)) army[u.type] = (army[u.type] ?? 0) + 1;
  const free = c.cap - c.used, types = Object.keys(HOUSING).filter((t) => army[t] || c.inside[t]);
  if (!types.length) return `<div class="muted castle-hint">Đội quân đang trống. Mang lính về căn cứ rồi bấm Gửi để cất vào Hội thành (Rồng 8 chỗ, Sư thứu 7, Máy bắn đá 6, Hiệp sĩ 5, Kỵ binh 4, Pháp sư 3, Kiếm sĩ / Lính giáo 2, Dân quân / Cung thủ 1).</div>`;
  const row = (t) => {
    const h = HOUSING[t], a = army[t] ?? 0, i = c.inside[t] ?? 0;
    const put = (n) => `<button id="b-cput-${t}-${n}" ${a && free >= h && !c.out ? '' : 'disabled'}>Gửi ${n}</button>`;
    const take = (n) => `<button id="b-ctake-${t}-${n}" ${i ? '' : 'disabled'}>Rút ${n}</button>`;
    return `<div class="crow"><span>${UNITS[t].name} <small>${h} chỗ · đội ${a} · trong ${i}</small></span>${put(1)}${put(5)}${take(1)}${take(5)}</div>`;
  };
  return `<div class="castle"><button id="b-copen" class="copen">🏰 Chọn lính gửi vào Hội thành</button><button id="b-cfill" class="cfill" ${free > 0 && Object.keys(army).length && !c.out ? '' : 'disabled'}>⤵ Gửi lấp đầy (lính to trước)</button><div class="muted">Còn ${free} chỗ. Tướng phải đứng trong căn cứ.</div></div>`;
}
function repairCost(it) {
  const c = {};
  for (let l = 1; l <= it.lv; l++) for (const [r, v] of Object.entries(buildCost(it.type, l))) c[r] = (c[r] ?? 0) + v;
  for (const r of Object.keys(c)) c[r] = Math.max(1, Math.round(c[r] * REPAIR_SHARE));
  return c;
}
// ------------------------------------------------------------ Học viện: unit upgrade dialog (wooden)
let labSend = null;
/** why a unit cannot be researched now (client copy of server/base.js researchBlock); null = it can */
function labBlock(type) {
  const b = S.myBase, ac = b?.items.find((i) => i.type === 'hoc-vien'), th = thOf(b)?.lv ?? 0;
  if (!ac) return 'Cần xây Học viện';
  if (ac.state === 'ruin') return 'Học viện đang đổ nát';
  if (ac.state === 'build') return 'Học viện đang xây';
  if (ac.state === 'up') return 'Học viện đang nâng cấp';
  const cur = S.unitLv?.[type] ?? 1;
  if (cur >= UNIT_LV_MAX) return 'Đã cấp tối đa';
  if ((UNIT_LV_CAP[type]?.[th - 1] ?? 0) <= cur) { const need = unitLvTh(type, cur + 1); return need ? `🔒 Mở khóa ở Thành trì cấp ${need}` : 'Đã cấp tối đa'; }
  if (unitLvCap(type, th, ac.lv) <= cur) return `Cần Học viện cấp ${cur}`;
  if (S.research) return 'Đang nghiên cứu loại khác';
  return null;
}
export function showLab(send) {
  labSend = send;
  const box = document.getElementById('lab') ?? Object.assign(document.createElement('div'), { id: 'lab' });
  box.className = 'thup'; document.body.appendChild(box);
  renderLab();
  clearInterval(box._t); box._t = setInterval(() => { if (!document.getElementById('lab')) clearInterval(box._t); else renderLab(); }, 1000);
}
function renderLab() {
  const box = document.getElementById('lab'); if (!box) return;
  const th = thOf(S.myBase)?.lv ?? 0, ac = S.myBase?.items.find((i) => i.type === 'hoc-vien');
  const have = S.me ? Object.fromEntries(RES.map((r, i) => [r, S.me.res[i]])) : {}, tn = now();
  const cards = Object.keys(UNIT_LV_CAP).map((type) => {
    const u = UNITS[type], cur = S.unitLv?.[type] ?? 1, cap = ac ? unitLvCap(type, th, ac.lv) : 1, open = (UNIT_TH[type] ?? 0) <= th;
    const m0 = UNIT_LV_MULT[cur - 1], m1 = UNIT_LV_MULT[Math.min(UNIT_LV_MAX - 1, cur)];
    const busy = S.research?.unit === type;
    let foot;
    if (!open) foot = `<div class="lab-lock">Mở quân ở Thành trì cấp ${UNIT_TH[type]}</div>`;
    else if (busy) { const k = Math.max(0, Math.min(1, 1 - (S.research.doneAt - tn) / S.research.total)); foot = `<div class="lab-bar"><i style="width:${k * 100}%"></i><span>Đang nghiên cứu · ${fmtT(Math.max(0, S.research.doneAt - tn))}</span></div><button class="lab-cancel" data-u="${type}">✖ Hủy nâng cấp (hoàn tài nguyên)</button>`; }
    else {
      const why = labBlock(type);
      if (cur >= UNIT_LV_MAX || (UNIT_LV_CAP[type]?.[TH_MAX - 1] ?? 0) <= cur) foot = `<div class="lab-lock">Đã cấp tối đa</div>`;
      else {
        const cost = researchCost(type, cur + 1), poor = Object.entries(cost).some(([r, v]) => (have[r] ?? 0) < v);
        foot = `<div class="lab-cost">${Object.entries(cost).map(([r, v]) => `<span class="${(have[r] ?? 0) < v ? 'miss' : ''}"><i class="ic" data-r="${r}" style="--c:${RES_INFO[r].color}"></i>${v.toLocaleString('vi')}</span>`).join('')} · ⏱ ${fmtT(RESEARCH_TIME[cur])}</div>`
          + `<button class="lab-go" data-u="${type}" ${why || poor ? 'disabled' : ''}>${why ?? (poor ? 'Thiếu tài nguyên' : `⬆ Lên cấp ${unitLvLabel(type, cur + 1)}`)}</button>`;
      }
    }
    return `<div class="lab-card ${open ? '' : 'off'} ${busy ? 'busy' : ''}"><div class="lab-pics"><div class="lab-pic" data-u="${type}" data-s="${skinOf(type, cur)}"></div>${cur < UNIT_LV_MAX && skinOf(type, cur + 1) !== skinOf(type, cur) ? `<span class="lab-arr">➜</span><div class="lab-pic" data-u="${type}" data-s="${skinOf(type, cur + 1)}"></div>` : ''}</div><div class="lab-r"><b>${u.name}</b>
      <small>Cấp ${unitLvLabel(type, cur)} / tối đa ${open ? unitLvLabel(type, cap) : '–'}</small>
      ${open && cur < UNIT_LV_MAX && cur < (UNIT_LV_CAP[type]?.[TH_MAX - 1] ?? 0) ? `<div class="lab-st">Máu ${Math.round(u.hp * m0)} → <b>${Math.round(u.hp * m1)}</b> · ATK ${Math.round(u.atk * m0)} → <b>${Math.round(u.atk * m1)}</b></div>` : `<div class="lab-st">Máu ${Math.round(u.hp * m0)} · ATK ${Math.round(u.atk * m0)}</div>`}${foot}</div></div>`;
  }).join('');
  const key = cards + (S.research ? Math.floor((S.research.doneAt - tn)) : '');
  if (box.dataset.k === key) return; box.dataset.k = key;
  box.innerHTML = `<div class="thup-box lab-box"><div class="thup-title">🎓 Học viện · nâng cấp quân</div>
    <div class="muted lab-hint">Học viện cấp ${ac?.lv ?? 0} · Thành trì cấp ${th}. Nâng xong áp dụng ngay cho mọi lính loại đó. Mỗi lúc nghiên cứu 1 loại.</div>
    <div class="lab-grid">${cards}</div><button class="thup-ok lab-close">Đóng</button></div>`;
  for (const el of box.querySelectorAll('.lab-pic')) el.appendChild(thumb(el.dataset.s, 'idle', 0, el.dataset.u === 'rong' ? 0.45 : UNITS[el.dataset.u].slots > 1 ? 0.7 : 1));
  for (const el of box.querySelectorAll('.lab-go')) el.onclick = () => labSend?.({ t: 'research', unit: el.dataset.u });
  for (const el of box.querySelectorAll('.lab-cancel')) el.onclick = () => labSend?.({ t: 'research-cancel' });
  box.querySelector('.lab-close').onclick = () => { clearInterval(box._t); box.remove(); };
  box.onclick = (e) => { if (e.target === box) { clearInterval(box._t); box.remove(); } };
}
/** my ruined structures (after a raid) */
export function myRuins() { return (S.myBase?.items ?? []).filter((i) => i.state === 'ruin'); }
/** wooden dialog: repair every ruined structure at once, with the total price */
export function showRepairAll(send) {
  const ruins = myRuins(); if (!ruins.length) return;
  const tot = {}, byType = {};
  for (const it of ruins) { for (const [r, v] of Object.entries(repairCost(it))) tot[r] = (tot[r] ?? 0) + v; byType[it.type] = (byType[it.type] ?? 0) + 1; }
  const have = S.me ? Object.fromEntries(RES.map((r, i) => [r, S.me.res[i]])) : {}, poor = Object.entries(tot).some(([r, v]) => (have[r] ?? 0) < v);
  const pic = (type) => { const a = BSPR.atlas?.[type], img = BSPR.img[type]; if (!a?.size || !img) return ''; const c = document.createElement('canvas'), h = 40, k = h / a.size[1]; c.width = Math.round(a.size[0] * k); c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(img, 0, (a.rows?.ruin ?? 5) * a.size[1], a.size[0], a.size[1], 0, 0, c.width, c.height); return c.toDataURL(); };
  const box = document.getElementById('thup') ?? Object.assign(document.createElement('div'), { id: 'thup' });
  box.className = 'thup';
  box.innerHTML = `<div class="thup-box"><div class="thup-title">🔧 Sửa tất cả công trình?</div>
    <div class="thup-list">${Object.entries(byType).map(([t, n]) => { const im = t === 'tuong' ? '' : pic(t); return `<div class="thup-row">${im ? `<img src="${im}">` : t === 'tuong' && wallPost(1, 1.2) ? `<img src="${wallPost(1, 1.2).toDataURL()}">` : '<span class="thup-ic">🏚</span>'}<div><b>${n} ${B_NAME(t)}</b><small>đổ nát</small></div></div>`; }).join('')}</div>
    <div class="thup-cost">Tổng giá: ${Object.entries(tot).map(([r, v]) => `<span style="${(have[r] ?? 0) < v ? 'color:#c0281e' : ''}">${v.toLocaleString('vi')} ${RES_INFO[r].name}</span>`).join(', ')}<br><small>Sửa xong ngay, không tốn thợ xây</small></div>
    <div class="thup-btns"><button class="thup-no">Để sau</button><button class="thup-ok" ${poor ? 'disabled' : ''}>${poor ? 'Thiếu tài nguyên' : '🔧 Sửa tất cả'}</button></div></div>`;
  document.body.appendChild(box);
  box.querySelector('.thup-ok').onclick = () => { box.remove(); send({ t: 'base-repairall' }); };
  box.querySelector('.thup-no').onclick = () => box.remove();
}
/** a price as HTML: every resource you do not have enough of is shown in red */
const fmtCost = (c) => Object.entries(c).map(([r, v]) => `<span class="rc${(S.me?.res?.[RES.indexOf(r)] ?? Infinity) < v ? ' miss' : ''}">${v.toLocaleString('vi')} ${RES_INFO[r].name}</span>`).join(', ');
export function wireBuildInfo(sel, send, on0, refresh = null) {
  const it = findItem(sel.key, sel.id); if (!it) return;
  // 12/11/2026: pressing a button closes the panel; not the wall pickers / +1 +5 troop buttons (they are pressed in a row)
  const KEEP = /^b-(w[hvg]|wclear|cput-|ctake-)/;
  const on = (id, f) => on0(id, KEEP.test(id) ? f : () => { f(); if (S.sel?.k === 'build' && S.sel.id === it.id) { S.sel = null; S.selWalls = null; } refresh?.(); });
  on('b-attack', () => send({ t: 'chase', id: it.uid }));
  on('b-up', () => { const need = upgradeNeeds(it); if (need.length) return showNeed(`Chưa nâng được ${B_NAME(it.type)} lên cấp ${it.lv + 1}`, need); it.type === 'thanh-tri' ? showThDialog(it.lv + 1, { confirm: () => send({ t: 'base-up', id: it.id }), cost: buildCost('thanh-tri', it.lv + 1), time: buildTime('thanh-tri', it.lv + 1) }) : send({ t: 'base-up', id: it.id }); });
  const pick = (list) => { S.selWalls = new Set(list.map((w) => w.id)); S.sel = { k: 'build', key: it.key, id: it.id }; refresh?.(); };
  on('b-wh', () => pick(wallLine(it, 1, 0)));
  on('b-wv', () => pick(wallLine(it, 0, 1)));
  on('b-wg', () => pick(wallGroup(it)));
  on('b-wclear', () => pick([it]));
  on('b-upsel', () => send({ t: 'base-up', id: it.id, ids: [...(S.selWalls ?? [])] }));
  on('b-repair', () => send({ t: 'base-repair', id: it.id }));
  on('b-repairall', () => showRepairAll(send));
  on('b-lab', () => showLab(send));
  on('b-cfill', () => send({ t: 'castle-fill' }));
  on('b-copen', () => window.dispatchEvent(new Event('opencastle')));
  on('b-camp', () => window.dispatchEvent(new Event('opencamp')));
  on('b-dlog', () => window.dispatchEvent(new CustomEvent('opendlog')));
  on('b-craft', () => window.dispatchEvent(new CustomEvent('opencraft', { detail: document.getElementById('b-craft').dataset.m })));
  for (const type of Object.keys(HOUSING)) for (const n of [1, 5]) { on(`b-cput-${type}-${n}`, () => send({ t: 'castle-put', unit: type, n })); on(`b-ctake-${type}-${n}`, () => send({ t: 'castle-take', unit: type, n })); }
  on('b-move', () => startMove(S.selWalls?.size > 1 ? [...S.selWalls] : [it.id], false));
  on('b-sell', () => { send({ t: 'base-remove', id: it.id }); S.sel = null; });
  on('b-remove', () => { if (confirm(`Phá bỏ ${B_NAME(it.type)}? Không được hoàn tiền.`)) { send({ t: 'base-remove', id: it.id }); S.sel = null; } });
}
export { costValue };

/** buildings allowed at the current Thành trì level that are not built yet (walls do not count) */
export function thMissing(b) { return thMissingList(b).map((m) => (m.kind === 'count' ? `${B_NAME(m.type)} ${m.have}/${m.need}` : `${B_NAME(m.type)} lên cấp ${m.lv} (còn ${m.left})`)); }
/** what the Thành trì still needs before it can level up: [{ kind: 'count', type, have, need } | { kind: 'level', type, lv, left }] */
export function thMissingList(b) {
  const th = thOf(b); if (!th) return [];
  const out = [];
  for (const [type, n] of Object.entries(TOWN_HALL.levels[th.lv - 1].max)) {
    if (type === 'tuong' || type === 'nha-tho-xay' || OPTIONAL_B.has(type) || !n) continue;
    const have = b.items.filter((i) => i.type === type && i.state !== 'build' && i.state !== 'ruin').length;
    if (have < n) out.push({ kind: 'count', type, have, need: n });
  }
  // every structure (walls and huts aside) must reach the Thành trì level first (same rule as the server)
  const lv = th.lv, low = {};
  for (const i of b.items) if (i.type !== 'thanh-tri' && i.type !== 'tuong' && !OPTIONAL_B.has(i.type) && !BUILDINGS[i.type]?.noLevels && i.state !== 'ruin' && (i.lv < lv || i.state === 'up' || i.state === 'build')) low[i.type] = (low[i.type] ?? 0) + 1;
  for (const [t, n] of Object.entries(low)) out.push({ kind: 'level', type: t, lv, left: n });
  return out;
}
// ------------------------------------------------------------ "what is missing" dialog: buttons stay clickable, a click shows the list (12/11/2026)
function bPic(type, lv = 1, h = 44) {
  if (BUILDINGS[type]?.deco) return decoPic(type)?.toDataURL() ?? '';
  if (BUILDINGS[type]?.trap) return trapPic(type, lv);
  if (type === 'tuong') return wallPost(lv, 1.2)?.toDataURL() ?? '';
  const a = BSPR.atlas?.[type], img = BSPR.img[type]; if (!a?.size || !img) return '';
  const c = document.createElement('canvas'), k = h / a.size[1]; c.width = Math.round(a.size[0] * k); c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(img, 0, bRow(a, lv) * a.size[1], a.size[0], a.size[1], 0, 0, c.width, c.height); return c.toDataURL();
}
/** rows for the resources of a price you do not have enough of */
export function resNeeds(cost) {
  const out = [];
  for (const [r, v] of Object.entries(cost)) {
    const have = Math.floor(S.me?.res?.[RES.indexOf(r)] ?? 0); if (have >= v) continue;
    out.push({ icon: `<i class="ic big" data-r="${r}" style="--c:${RES_INFO[r].color}"></i>`, text: `Thiếu ${(v - have).toLocaleString('vi')} ${RES_INFO[r].name}`, sub: `đang có ${have.toLocaleString('vi')} / cần ${v.toLocaleString('vi')}` });
  }
  return out;
}
function builderNeed(b, type) {
  if (!b || NO_BUILDER(type) || busy(b) < builders(b)) return [];
  return [{ img: bPic('nha-tho-xay'), text: 'Hết thợ xây', sub: `${busy(b)}/${builders(b)} thợ đang bận · đợi xong việc hoặc xây thêm Nhà thợ xây` }];
}
/** everything that stops this structure from going up one level */
export function upgradeNeeds(it) {
  const b = S.bases.find((q) => q.key === it.key), out = [], thl = thOf(b)?.lv ?? 1;
  if (it.type === 'thanh-tri') for (const m of thMissingList(b)) out.push(m.kind === 'count'
    ? { img: bPic(m.type, 1), text: `Xây thêm ${m.need - m.have} ${B_NAME(m.type)}`, sub: `đang có ${m.have} / cần ${m.need}` }
    : { img: bPic(m.type, m.lv), text: `${B_NAME(m.type)} lên cấp ${m.lv}`, sub: `còn ${m.left} cái chưa đủ cấp ${m.lv}` });
  else if (it.lv >= thl) out.push({ img: bPic('thanh-tri', it.lv + 1), text: `Thành trì cấp ${it.lv + 1}`, sub: `${B_NAME(it.type)} không được cao cấp hơn Thành trì (đang cấp ${thl})` });
  out.push(...builderNeed(b, it.type), ...resNeeds(buildCost(it.type, it.lv + 1, b.items.filter((i) => i.type === it.type).length)));
  return out;
}
/** everything that stops building a new structure of this type */
export function buildNeeds(type) {
  const b = S.myBase, th = thOf(b), inf = placeInfo(type), out = [];
  if (type === 'thanh-tri') { if (b) out.push({ img: bPic('thanh-tri'), text: 'Bạn đã có Thành trì', sub: 'mỗi người chỉ có 1 căn cứ' }); }
  else if (!b) out.push({ img: bPic('thanh-tri'), text: 'Cần xây Thành trì trước', sub: 'mọi công trình nằm trong vùng căn cứ' });
  else {
    if (th.state === 'ruin') out.push({ img: bPic('thanh-tri', th.lv), text: 'Thành trì đang đổ nát', sub: 'sửa Thành trì trước' });
    if (inf.n >= inf.lim && BUILDINGS[type]?.deco) out.push({ img: bPic(type), text: `Đã đặt đủ ${inf.lim} ${B_NAME(type)}`, sub: th.lv < 5 ? 'nâng Thành trì để đặt thêm' : 'đã tối đa' });
    else if (inf.n >= inf.lim) { const need = TOWN_HALL.levels.findIndex((l, k) => k >= th.lv && (l.max[type] ?? 0) > inf.n) + 1; out.push({ img: bPic('thanh-tri', Math.max(need, th.lv + 1)), text: inf.lim ? `Đã đủ ${inf.lim} ${B_NAME(type)}` : `Cần Thành trì cấp ${need}`, sub: need > 0 ? `Thành trì cấp ${need} cho xây ${TOWN_HALL.levels[need - 1].max[type] ?? '?'} cái` : 'đã tối đa' }); }
    out.push(...builderNeed(b, type));
  }
  out.push(...resNeeds(inf.cost));
  return out;
}
export function showNeed(title, rows) {
  const box = document.getElementById('needdlg') ?? Object.assign(document.createElement('div'), { id: 'needdlg' });
  box.className = 'thup';
  box.innerHTML = `<div class="thup-box"><div class="thup-title">⚠ ${title}</div><div class="thup-sub">Còn thiếu</div>
    <div class="thup-list">${rows.map((r) => `<div class="thup-row">${r.img ? `<img src="${r.img}">` : `<span class="thup-ic">${r.icon ?? ''}</span>`}<div><b>${r.text}</b><small>${r.sub ?? ''}</small></div></div>`).join('')}</div>
    <button class="thup-ok">Đã hiểu</button></div>`;
  document.body.appendChild(box);
  box.querySelector('.thup-ok').onclick = () => box.remove();
  box.onclick = (e) => { if (e.target === box) box.remove(); };
}
/** a decoration sprite, (x, y) = bottom centre on screen, s = screen px per sprite px */
function drawDeco(ctx, type, x, y, s, team = null) {
  const fr = DECO.meta?.[type]; if (!fr || !DECO.img) { ctx.fillStyle = '#c8a24a'; ctx.fillRect(x - 4 * s, y - 8 * s, 8 * s, 8 * s); return; }
  const [fx, fy, fw, fh, ax, ay] = fr; ctx.drawImage(team ? teamTint(DECO.img, team) : DECO.img, fx, fy, fw, fh, Math.round(x - ax * s), Math.round(y - ay * s), Math.round(fw * s), Math.round(fh * s));
}
function decoPic(type, k = 1.6) { const fr = DECO.meta?.[type]; if (!fr || !DECO.img) return null; const c = document.createElement('canvas'); c.width = Math.round(fr[2] * k); c.height = Math.round(fr[3] * k); const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(DECO.img, fr[0], fr[1], fr[2], fr[3], 0, 0, c.width, c.height); return c; }
/** one-line description of a trap at a level (null for other structures) */
function trapLine(type, lv) {
  const D = BUILDINGS[type]; if (!D?.trap) return null;
  const m = [1, 1.6, 2.2, 2.8, 3.4][lv - 1];
  return D.trap === 'spring' ? `Hất ${D.lift[lv - 1]} ô quân bộ ra ngoài căn cứ` : D.trap === 'air' ? `${Math.round(D.atk * m)} sát thương quân bay · vùng ${D.aoe} ô` : `${Math.round(D.atk * m)} sát thương quân bộ · vùng ${D.aoe} ô`;
}
/** a trap picture for dialogs (data URL; '' until the sprites are loaded) */
function trapPic(type, lv = 1) { if (!TRAPS.img) return ''; const c = document.createElement('canvas'); c.width = 48; c.height = 48; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; drawTrap(x, type, 24, 28, 1.4, false, lv); return c.toDataURL(); }
/** placeholder trap art (code-drawn until the hand-drawn sprites arrive); (x, y) = centre of the tile on screen */
function drawTrap(ctx, type, x, y, s, used, lv = 1) {
  // traps.json: [level 1, used, level 2, level 3, level 4, level 5] (old sheets only have the first two)
  const M = TRAPS.meta?.[type], fr = TRAPS.img && M && (used ? M[1] : (lv > 1 && M[lv]) || M[0]);
  if (fr) { const [fx, fy, fw, fh, ax, ay] = fr; ctx.drawImage(TRAPS.img, fx, fy, fw, fh, Math.round(x - ax * s), Math.round(y + 10 * s - ay * s), Math.round(fw * s), Math.round(fh * s)); return; }
  const R = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x + a * s), Math.round(y + b * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))); };
  if (used) { ctx.fillStyle = '#1b172666'; ctx.beginPath(); ctx.ellipse(x, y, 6 * s, 3.5 * s, 0, 0, 7); ctx.fill(); }
  if (type === 'bom') {
    ctx.fillStyle = '#1b1726'; ctx.beginPath(); ctx.arc(x, y - 3 * s, 5 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a3a4a'; ctx.beginPath(); ctx.arc(x, y - 3 * s, 4 * s, 0, 7); ctx.fill();
    R(-2.5, -6, 1.5, 1.5, '#8a8aa0'); R(-1, -9.5, 2, 2, '#7a5a3a'); if (!used) R(0.5, -11, 1.5, 1.5, '#ffb030');
  } else if (type === 'lo-xo') {
    R(-5, -2, 10, 4, '#1b1726'); R(-4.5, -1.5, 9, 3, '#8a8a96');
    for (let k = 0; k < 3; k++) R(-3.5, -5 - k * 2.2, 7, 1.2, '#c8c8d0');
    R(-4.5, -10, 9, 2.5, used ? '#5a5a66' : '#c84a3a'); R(-4.5, -10, 9, 0.8, '#ff8a6a');
  } else {
    R(-1.5, -12, 3, 9, '#1b1726'); R(-1, -11.5, 2, 8, '#d84a4a'); R(-1, -11.5, 1, 8, '#ff8a8a');
    R(-3.5, -5, 2.5, 3, '#8a8a96'); R(1, -5, 2.5, 3, '#8a8a96'); R(-0.5, -13.5, 1, 2, used ? '#5a5a66' : '#ffd23a');
  }
}
/** wooden dialog: what the new Thành trì level unlocks */
/** opts.confirm: show it before the upgrade ("Nâng Thành trì lên cấp N?") with the new look, the price and OK / cancel */
export function showThDialog(lv, opts = {}) {
  const L = TOWN_HALL.levels[lv - 1], P = TOWN_HALL.levels[lv - 2];
  if (!L || !P) return;
  const rows = [];
  const pic = (type) => { const a = BSPR.atlas?.[type], img = BSPR.img[type]; if (!a || !img) return ''; const c = document.createElement('canvas'); const h = 44, k = h / a.size[1]; c.width = Math.round(a.size[0] * k); c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; const row = bRow(a, BUILDINGS[type]?.unlockTh ? 1 : lv) * a.size[1]; x.drawImage(img, 0, row, a.size[0], a.size[1], 0, 0, c.width, c.height); return c.toDataURL(); };
  for (const type of Object.keys(BUILDINGS)) {
    const d = (L.max[type] ?? 0) - (P.max[type] ?? 0);
    if (d > 0 && BUILDINGS[type]?.trap) { rows.push({ img: trapPic(type), icon: type === 'lo-xo' ? '🌀' : type === 'bom-khi' ? '🎈' : '💣', text: `+${d} ${B_NAME(type)}`, sub: P.max[type] ? `tối đa ${L.max[type]}` : 'công trình mới' }); continue; }
    if (d > 0) rows.push({ img: type === 'tuong' ? wallPost(lv, 1.2)?.toDataURL() : pic(type), wall: type === 'tuong', text: `${P.max[type] ? '+' + d : '🆕'} ${B_NAME(type)}`, sub: P.max[type] ? `tối đa ${L.max[type]}` : `công trình mới · tối đa ${L.max[type]}` });
  }
  rows.push({ img: pic('thanh-tri'), text: `Công trình lên tới cấp ${lv}`, sub: 'nâng cấp tháp, pháo, kho, tường' });
  rows.push({ icon: '📦', text: `Sức chứa ×${L.store}`, sub: `trước đây ×${P.store}` });
  const units = Object.keys(UNIT_TH).filter((t) => UNIT_TH[t] === lv);
  const box = document.getElementById('thup') ?? Object.assign(document.createElement('div'), { id: 'thup' });
  box.className = 'thup';
  const ask = !!opts.confirm, big = ask ? (() => { const a = BSPR.atlas?.['thanh-tri'], img = BSPR.img['thanh-tri']; if (!a || !img) return ''; const c = document.createElement('canvas'), h = 120, k = h / a.size[1]; c.width = Math.round(a.size[0] * k); c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(img, 0, bRow(a, lv) * a.size[1], a.size[0], a.size[1], 0, 0, c.width, c.height); return c.toDataURL(); })() : '';
  box.innerHTML = `<div class="thup-box thdlg"><div class="thup-title">🏰 ${ask ? `Nâng Thành trì lên cấp ${lv}?` : `Thành trì lên cấp ${lv}!`}</div>
    ${big ? `<div class="thup-big"><img src="${big}"><small>Diện mạo mới · ${L.hp.toLocaleString('vi')} máu</small></div><div class="thup-sub">Sẽ mở khóa</div>` : ''}
    <div class="thup-list">${rows.map((r) => `<div class="thup-row">${r.img ? `<img src="${r.img}">` : r.wall ? '<span class="thup-wall"></span>' : `<span class="thup-ic">${r.icon ?? ''}</span>`}<div><b>${r.text}</b><small>${r.sub}</small></div></div>`).join('')}</div>
    ${units.length ? `<div class="thup-sub">Quân mới mở</div><div class="thup-units">${units.map((t) => `<div class="thup-unit" data-u="${t}"><span></span><b>${UNITS[t].name}</b></div>`).join('')}</div>` : ''}
    ${ask ? `<div class="thup-cost">Giá: ${fmtCost(opts.cost)} · thời gian ${fmtT(opts.time)}</div><div class="thup-btns"><button class="thup-no">Để sau</button><button class="thup-ok">⬆ Nâng cấp</button></div>` : '<button class="thup-ok">Tuyệt vời!</button>'}</div>`;
  document.body.appendChild(box);
  for (const el of box.querySelectorAll('.thup-unit')) el.querySelector('span').appendChild(thumb(el.dataset.u, 'idle', 0, el.dataset.u === 'rong' ? 0.5 : 1));
  box.querySelector('.thup-ok').onclick = () => { box.remove(); opts.confirm?.(); };
  const no = box.querySelector('.thup-no'); if (no) no.onclick = () => box.remove();
}

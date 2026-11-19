// Địa Ngục client (docs/design/29-dia-nguc.md): draws a run from the server's 'h' packets, the HUD, the skill cards.
// The arena is rebuilt here from the run seed (shared/hell.js), so only the moving things come over the network.
import { S, now } from './state.js';
import { drawUnit, SPR } from './sprites.js';
import { drawPetHell, heroSkillFx } from './render.js';
import { HELL_MODES, HELL_SKILLS, HELL_ULT, hellArena, HELL_MON, HELL_ELITES, HELL_BOSSES, HELL_EVO } from '/shared/hell.js';
import { RES_INFO, TIER_INFO, HEROES } from '/shared/balance.js';

const MON_TYPES = [...Object.keys(HELL_MON), ...HELL_ELITES.map((e) => e.id), ...Object.keys(HELL_BOSSES)];
const H = { on: false };
export const hellState = H;
let send = () => {};
export function hellInit(sendFn) { send = sendFn; }

// ---------------------------------------------------------------- assets
const A = { ready: false, json: null, img: {}, mon: {} };
function loadImg(src) { return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = `/assets/hell/${src}?v=${S.av ?? ''}`; }); }
function split(img, ch) { // tall sheets are cut in parts (canvas size limits)
  if (!img || img.height <= 4096) return { img, per: 1e9 };
  const per = Math.max(1, Math.floor(4096 / ch)), rows = Math.round(img.height / ch), parts = [];
  for (let r = 0; r < rows; r += per) { const n = Math.min(per, rows - r), c = document.createElement('canvas'); c.width = img.width; c.height = n * ch; c.getContext('2d').drawImage(img, 0, r * ch, img.width, n * ch, 0, 0, img.width, n * ch); parts.push(c); }
  return { parts, per };
}
async function loadAssets() {
  if (A.loading) return A.loading;
  A.loading = (async () => {
    const j = await fetch(`/assets/hell/hell.json?v=${S.av ?? ''}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
    if (!j) return;
    A.json = j;
    const jobs = [];
    for (const [id, m] of Object.entries(j.monsters)) jobs.push(loadImg(m.src).then((i) => { A.mon[id] = { m, ...split(i, m.size[1]) }; }));
    for (const [id, f] of Object.entries(j.fx)) jobs.push(loadImg(f.src).then((i) => { A.img[id] = i; }));
    for (const [id, g] of Object.entries(j.grids)) jobs.push(loadImg(g.src).then((i) => { A.img[id] = i; }));
    jobs.push(loadImg(j.ground.src).then((i) => { A.img.ground = i; }));
    jobs.push(loadImg(j.gate.src).then((i) => { A.img.gate = i; }));
    await Promise.all(jobs);
    A.ready = true;
  })();
  return A.loading;
}
export function hellGateImg() { if (!A.loading) loadAssets(); return A.img.gate ? { img: A.img.gate, ...A.json.gate } : null; }
function cell(grid, k) { const g = A.json?.grids[grid]; return g ? { img: A.img[grid], r: g.rects?.[k] ?? [(k % g.cols) * g.cell[0], Math.floor(k / g.cols) * g.cell[1], g.cell[0], g.cell[1]], g } : null; }
function drawCell(ctx, grid, k, x, y, s, ax = 0.5, ay = 1) { const c = cell(grid, k); if (!c?.img) return; const [rx, ry, rw, rh] = c.r; ctx.drawImage(c.img, rx, ry, rw, rh, Math.round(x - rw * s * ax), Math.round(y - rh * s * ay), Math.round(rw * s), Math.round(rh * s)); }
const iconCache = new Map();
/** a skill icon as a data URL: icon-ky-nang (0–39), icon-ky-nang-2 (40–49, 16/11/2026) or the skill's emoji until that sheet is drawn */
export function hellIconURL(k, size = 32, emo = '') {
  const key = k + ':' + size + ':' + emo + ':' + !!A.ready; if (iconCache.has(key)) return iconCache.get(key);
  const c = k >= 40 ? cell('icon-ky-nang-2', k - 40) : cell('icon-ky-nang', k);
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
  if (c?.img) { const [rx, ry, rw, rh] = c.r, k2 = Math.min(size / rw, size / rh); x.drawImage(c.img, rx, ry, rw, rh, (size - rw * k2) / 2, (size - rh * k2) / 2, rw * k2, rh * k2); }
  else if (emo) { x.font = `${Math.round(size * 0.78)}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(emo, size / 2, size / 2 + 1); }
  else return '';
  const u = cv.toDataURL(); if (A.ready) iconCache.set(key, u); return u;
}
const skIcon = (id, size, me) => { const E = me?.evo?.[id] && HELL_EVO[id]; return E ? hellIconURL(E.icon, size) : hellIconURL(HELL_SKILLS[id]?.icon ?? 0, size, HELL_SKILLS[id]?.emo); };
const skName = (id, me) => (me?.evo?.[id] && HELL_EVO[id] ? '✨ ' + HELL_EVO[id].name : HELL_SKILLS[id]?.name ?? id);

// ---------------------------------------------------------------- enter / leave
export function hellStart(m) {
  Object.assign(H, { on: true, id: m.id, seed: m.seed, mi: m.mode, you: m.you, arena: hellArena(m.seed), snap: null, prev: null, recvT: 0, fx: [], texts: [], mons: new Map(), z: 2, cam: { x: 0, y: 0 }, keys: {}, mouse: null, lastMove: [0, 0], lastSendT: 0, end: null, banner: null });
  loadAssets().then(() => { cardKey = ''; });
  buildDom();
  document.body.classList.add('in-hell');
}
export function hellStop() { document.getElementById('hellpause')?.remove(); H.on = false; document.body.classList.remove('in-hell'); document.getElementById('hellhud')?.remove(); document.getElementById('hellcards')?.remove(); document.getElementById('hellend')?.remove(); }
export function hellEnd(m) { H.end = m; renderEnd(); }

// ---------------------------------------------------------------- packets
export function hellPacket(m) {
  const t = now();
  H.prev = H.snap; H.prevT = H.recvT; H.snap = m; H.recvT = t;
  for (const row of m.mons) { const [id, ti, x, y] = row; const o = H.mons.get(id); if (o) { o.px = o.x; o.py = o.y; o.x = x / 16; o.y = y / 16; o.t = t; o.row = row; } else H.mons.set(id, { id, x: x / 16, y: y / 16, px: x / 16, py: y / 16, t, row, born: t }); }
  const live = new Set(m.mons.map((r) => r[0])); for (const id of H.mons.keys()) if (!live.has(id)) H.mons.delete(id);
  for (const e of m.ev ?? []) onEvent(e, t);
  renderHud();
}
function onEvent(e, t) {
  const me = e.pid === H.you;
  switch (e.k) {
    case 'sk': H.fx.push({ k: 'sk', s: e.s, pid: e.pid, evo: e.evo, x: e.x, y: e.y, a: e.a ?? 0, r: e.r, len: e.len, arc: e.arc, n: e.n, t0: t, dur: e.s === 'tia-pha-ma' ? e.dur ?? 1.5 : 0.45 }); break;
    case 'zap': H.fx.push({ k: 'zap', pts: e.pts, t0: t, dur: 0.35, seed: Math.random() * 99 }); break;
    case 'boom': H.fx.push({ k: 'boom', x: e.x, y: e.y, r: e.r ?? 1, c: e.c, t0: t, dur: 0.5 }); break;
    case 'line': H.fx.push({ k: 'line', x: e.x, y: e.y, a: e.a, len: e.len, w: e.w, t0: t, dur: e.t ?? 1 }); break;
    case 'mdie': H.fx.push({ k: 'die', x: e.x, y: e.y, type: e.type, t0: t, dur: 0.6 }); break;
    case 'hhit': if (me) H.hurtT = t; break;
    case 'heal': if (me) H.fx.push({ k: 'healfx', t0: t, dur: 0.8 }); break;
    case 'lvup': if (me) H.lvT = t; break;
    case 'banner': H.banner = { s: e.s, t0: t }; break;
    case 'chest': if (me) H.banner = { s: `📦 Rương Ngục: 1 trang bị ${TIER_INFO[e.tier]?.name ?? e.tier} + lên cấp kỹ năng`, t0: t }; break;
    case 'down': H.fx.push({ k: 'boom', x: e.x, y: e.y, r: 1.5, c: 'down', t0: t, dur: 0.8 }); break;
    case 'ult': H.fx.push({ k: 'ult', hero: e.hero, pid: e.pid, x: e.x, y: e.y, t0: t, dur: 12 }); break; // the open-world Q art, kept while it plays
  }
}

// ---------------------------------------------------------------- input
const DIR_KEYS = { w: [0, -1], a: [-1, 0], s: [0, 1], d: [1, 0], ArrowUp: [0, -1], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowRight: [1, 0] };
export function hellKey(e, down) {
  if (!H.on) return false;
  const k = e.key?.length === 1 ? e.key.toLowerCase() : e.key;
  if (DIR_KEYS[k]) { H.keys[k] = down; e.preventDefault(); return true; }
  if (!down) return true;
  const me = H.snap?.me;
  if (me?.cards && /^[1-4]$/.test(k)) { pick(+k - 1); return true; }
  if (k === 'q') { send({ t: 'hult' }); return true; }
  if (k === 'p' || k === 'Escape') { togglePause(); return true; }
  if (k === 'e' && H.snap?.exit) { send({ t: 'hexit' }); return true; }
  if (k === 'r' && me?.cards) { send({ t: 'hpick', reroll: 1 }); return true; }
  return true;
}
export function hellMouse(type, e) {
  if (!H.on) return false;
  if (type === 'down' && e.button === 2) H.mouse = { x: e.clientX, y: e.clientY };
  else if (type === 'move' && H.mouse) H.mouse = { x: e.clientX, y: e.clientY };
  else if (type === 'up' && e.button === 2) H.mouse = null;
  else if (type === 'down' && e.button === 0) H.mouse = { x: e.clientX, y: e.clientY, left: true };
  else if (type === 'up' && e.button === 0 && H.mouse?.left) H.mouse = null;
  return true;
}
export function hellWheel(e) { if (!H.on) return false; H.z = Math.max(1.5, Math.min(3, H.z + (e.deltaY < 0 ? 0.25 : -0.25))); return true; }
function moveInput(W, Hh) {
  let x = 0, y = 0;
  for (const [k, v] of Object.entries(H.keys)) if (v) { x += DIR_KEYS[k][0]; y += DIR_KEYS[k][1]; }
  if (!x && !y && H.mouse) { x = H.mouse.x - W / 2; y = H.mouse.y - Hh / 2; if (Math.hypot(x, y) < 12) x = y = 0; }
  if (!x && !y && S.joy) { x = S.joy.x; y = S.joy.y; }
  const l = Math.hypot(x, y); if (l) { x /= l; y /= l; }
  const t = now();
  if ((Math.abs(x - H.lastMove[0]) > 0.05 || Math.abs(y - H.lastMove[1]) > 0.05) && t - H.lastSendT > 0.06) { H.lastMove = [x, y]; H.lastSendT = t; send({ t: 'hmove', x: +x.toFixed(2), y: +y.toFixed(2) }); }
}

// ---------------------------------------------------------------- drawing
const TILE_OF = { 0: 0, 5: 3, 4: 4, 6: 2, 3: 23, 2: 1 };
const DIR_OF = (a) => (((Math.round((a - Math.PI / 2) / (Math.PI / 4)) % 8) + 8) % 8);
const FX_OF = { // skill → [sheet, row]
  'w-thach-lam': ['fx-01', 0], 'w-kim-ha': ['fx-01', 2], 'w-phong-vu': ['fx-02', 0], 'w-lam-nguyet': ['fx-02', 2], 'w-hoa-ky': ['fx-03', 0],
  'luoi-liem': ['fx-03', 2], 'loi-cham': ['fx-04', 0], 'bua-tran-ta': ['fx-04', 2], 'phi-dao': ['fx-05', 0], 'ngu-kiem': ['fx-05', 2], 'ho-lo': ['fx-06', 0],
  'bang-tien': ['fx-06', 2], 'chuong-dong': ['fx-06', 3], 'dia-chan': ['fx-07', 0], 'quat-ba-tieu': ['fx-07', 1], 'thien-loi': ['fx-07', 2], 'la-bua': ['fx-07', 3],
};
const BOOM_OF = { mine: ['fx-12', 1, 4], moon: ['fx-02', 3], vein: ['fx-01', 3], hex: ['fx-09', 0], ingot: ['fx-10', 2], rain: ['fx-10', 2], sulfur: ['fx-08', 3], star: ['fx-02', 2], ice: ['fx-06', 2], bua: ['fx-07', 3], meteor: ['fx-10', 2], holo: ['fx-06', 0], fire: ['fx-08', 1], rock: ['fx-10', 0], cage: ['fx-09', 0], spin: ['fx-10', 4] };
const PROJ_OF = { cuoc: ['fx-01', 2, 2], sao: ['fx-02', 2, 2], dao: ['fx-05', 0, 1], kiem: ['fx-05', 2, 2], bua: ['fx-07', 3, 1] };
function fxFrame(ctx, sheet, row, f, x, y, s, a = 0, alpha = 1) {
  const F = A.json?.fx[sheet], img = A.img[sheet]; if (!F || !img || !F.rows[row]) return;
  const [oy, h] = F.rows[row], fr = Math.max(0, Math.min(7, f | 0));
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); if (a) ctx.rotate(a);
  ctx.drawImage(img, fr * F.w, oy, F.w, h, Math.round(-F.w * s / 2), Math.round(-h * s / 2), Math.round(F.w * s), Math.round(h * s));
  ctx.restore();
}
export function drawHell(ctx, W, Hh) {
  const t = now(), snap = H.snap;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#1a0d0e'; ctx.fillRect(0, 0, W, Hh);
  if (!snap || !A.ready) { ctx.fillStyle = '#ffb02a'; ctx.font = '20px "Pixelify Sans", monospace'; ctx.textAlign = 'center'; ctx.fillText('Đang mở Cổng Địa Ngục…', W / 2, Hh / 2); return; }
  moveInput(W, Hh);
  const TS = 16 * H.z, s = TS / 32;
  // interpolation factor between the two last packets (10 / s)
  const k = Math.min(1.3, (t - H.recvT) / 0.1);
  const meRow = snap.heroes.find((r) => r[0] === H.you), prevMe = H.prev?.heroes.find((r) => r[0] === H.you);
  const lerp = (a, b) => (b == null ? a : b + (a - b) * k);
  const heroPos = (r, pr) => [lerp(r[2], pr?.[2]), lerp(r[3], pr?.[3])];
  let [cx, cy] = meRow ? heroPos(meRow, prevMe) : [256, 256];
  if (meRow && (meRow[8] || meRow[9])) { const alive = snap.heroes.find((r) => !r[8] && !r[9]); if (alive) [cx, cy] = [alive[2], alive[3]]; }
  H.cam.x += (cx * TS - W / 2 - H.cam.x) * 0.25; H.cam.y += (cy * TS - Hh / 2 - H.cam.y) * 0.25;
  if (!H.camInit) { H.cam.x = cx * TS - W / 2; H.cam.y = cy * TS - Hh / 2; H.camInit = true; }
  const sx = (x) => Math.round(x * TS - H.cam.x), sy = (y) => Math.round(y * TS - H.cam.y);
  // ground
  const Ar = H.arena, G = A.json.ground, gimg = A.img.ground, gt = G.tile;
  const x0 = Math.max(0, Math.floor(H.cam.x / TS)), y0 = Math.max(0, Math.floor(H.cam.y / TS)), x1 = Math.min(Ar.W - 1, Math.ceil((H.cam.x + W) / TS)), y1 = Math.min(Ar.W - 1, Math.ceil((H.cam.y + Hh) / TS));
  const lavaF = G.lava.first + (Math.floor(t * 6) % G.lava.frames), ac = Ar.altar;
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const v = Ar.t[ty * Ar.W + tx];
    let ti = v === 1 ? lavaF : TILE_OF[v] ?? 0;
    if (v === 2 && (tx < 3 || ty < 3 || tx >= Ar.W - 3 || ty >= Ar.W - 3)) ti = 20;
    if (Math.hypot(tx - ac[0], ty - ac[1]) < 3.2) ti = 22;
    if (v === 0 && ((tx * 7 + ty * 13) % 23 === 0)) ti = 6;
    ctx.drawImage(gimg, (ti % G.cols) * gt, Math.floor(ti / G.cols) * gt, gt, gt, tx * TS - H.cam.x, ty * TS - H.cam.y, TS + 0.5, TS + 0.5);
  }
  // sorted sprites: decorations, braziers, monsters, heroes, pets
  const list = [];
  const inV = (x, y, m = 3) => x > x0 - m && x < x1 + m && y > y0 - m && y < y1 + m;
  for (const [x, y, kind, vr] of Ar.deco) if (inV(x, y)) list.push({ y: y + 0.5, d: () => drawCell(ctx, 'vat-the-1', vr * 6 + kind, sx(x + 0.5), sy(y + 0.9), s) });
  for (const [x, y] of Ar.braziers) if (inV(x, y)) list.push({ y: y + 0.5, d: () => drawCell(ctx, 'vat-the-2', 0, sx(x + 0.5), sy(y + 1), s * 0.5) });
  list.push({ y: ac[1] - 1, d: () => drawCell(ctx, 'vat-the-2', snap.exit ? 8 : 3, sx(ac[0]), sy(ac[1] + 1.4), s) });
  // zones (on the ground, under everyone)
  for (const [, x, y, r, kind, warn] of snap.zones) {
    if (!inV(x, y)) continue;
    ctx.save();
    if (warn > 0) { ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 18); ctx.fillStyle = '#ff2a1a'; ctx.beginPath(); ctx.ellipse(sx(x), sy(y), r * TS, r * TS * 0.6, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 0.9; ctx.strokeStyle = '#ffd0b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(sx(x), sy(y), r * TS, r * TS * 0.6, 0, 0, 7); ctx.stroke(); }
    else if (kind === 'mine' && A.img['fx-12']) { ctx.globalAlpha = 1; fxFrame(ctx, 'fx-12', 1, Math.floor(t * 6 + x) % 4, sx(x), sy(y) - 2 * s, s * 0.32); }
    else if (kind === 'mine') { const X = sx(x), Y = sy(y); ctx.globalAlpha = 1; ctx.fillStyle = '#1b1726'; ctx.beginPath(); ctx.ellipse(X, Y, 7 * s, 4 * s, 0, 0, 7); ctx.fill(); ctx.fillStyle = Math.sin(t * 8 + x) > 0 ? '#ffd23a' : '#ff7a1a'; ctx.beginPath(); ctx.ellipse(X, Y - 1 * s, 3 * s, 2 * s, 0, 0, 7); ctx.fill(); }
    else if (kind === 'holo') { ctx.globalAlpha = 0.6; ctx.strokeStyle = '#6aff8a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(sx(x), sy(y), r * TS * (0.6 + 0.4 * Math.sin(t * 8)), r * TS * 0.6 * (0.6 + 0.4 * Math.sin(t * 8)), 0, 0, 7); ctx.stroke(); }
    else { ctx.globalAlpha = 0.45; ctx.fillStyle = kind === 'acid' ? '#c8e040' : kind === 'mark' ? '#ffd23a' : '#ff6a1a'; ctx.beginPath(); ctx.ellipse(sx(x), sy(y), r * TS, r * TS * 0.6, 0, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  // warning lines (charges, sweeps, boss waves)
  for (const f of H.fx) if (f.k === 'line') { const p = (t - f.t0) / f.dur; if (p > 1) continue; ctx.save(); ctx.translate(sx(f.x), sy(f.y)); ctx.rotate(f.a); ctx.globalAlpha = 0.25 + 0.3 * Math.sin(t * 20); ctx.fillStyle = '#ff2a1a'; ctx.fillRect(0, -f.w * TS / 2, f.len * TS, f.w * TS); ctx.restore(); }
  // gems / hearts: crisp colours on the red floor; hearts ripple
  for (const [, x, y, v] of snap.gems) {
    if (!inV(x, y)) continue;
    const X = sx(x), Y = sy(y);
    if (v === 3) { for (let r = 0; r < 2; r++) { const ph = (t * 1.2 + r / 2) % 1; ctx.globalAlpha = 1 - ph; ctx.strokeStyle = '#ff7a9a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(X, Y, (6 + ph * 20) * s, (3 + ph * 10) * s, 0, 0, 7); ctx.stroke(); } ctx.globalAlpha = 1; heart(ctx, X, Y - 10 * s, 7 * s); continue; }
    const col = ['#4ae86a', '#4aa8ff', '#ffd23a'][v], r = (v === 2 ? 8 : v === 1 ? 6 : 4.5) * s; // small green, medium blue, big gold (owner 16/11/2026)
    ctx.fillStyle = '#1b1726'; ctx.beginPath(); ctx.moveTo(X, Y - r - 1.5); ctx.lineTo(X + r + 1.5, Y); ctx.lineTo(X, Y + r + 1.5); ctx.lineTo(X - r - 1.5, Y); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(X, Y - r); ctx.lineTo(X + r, Y); ctx.lineTo(X, Y + r); ctx.lineTo(X - r, Y); ctx.fill();
  }
  for (const o of H.mons.values()) {
    const kk = Math.min(1.3, (t - o.t) / 0.1), x = o.x + (o.x - o.px) * (kk - 1) * 0, ix = o.px + (o.x - o.px) * Math.min(1, kk), iy = o.py + (o.y - o.py) * Math.min(1, kk);
    if (!inV(ix, iy)) continue;
    list.push({ y: iy, d: () => drawMon(ctx, o, sx(ix), sy(iy), s, t) });
  }
  for (const r of snap.heroes) {
    if (r[9]) continue;
    const pr = H.prev?.heroes.find((q) => q[0] === r[0]), [hx, hy] = heroPos(r, pr);
    list.push({ y: hy, d: () => drawHero(ctx, r, sx(hx), sy(hy), s, t) });
    if (r[12]) { const [ptype, px, py, pact] = r[12], ppr = pr?.[12]; const X = lerp(px, ppr?.[1]), Y = lerp(py, ppr?.[2]); list.push({ y: Y, d: () => drawPetHell(ctx, { id: -r[0], type: ptype, owner: r[0], dir: DIR_OF(Math.atan2(hy - Y, hx - X)), act: pact ? 2 : 0, age: 0 }, sx(X), sy(Y), s, t) }); }
  }
  list.sort((a, b) => a.y - b.y);
  for (const o of list) o.d();
  // projectiles + enemy shots
  for (const [, kind, x, y, a] of snap.proj) {
    if (kind === 'ghost' && A.img['fx-12']) { const X = sx(x), Y = sy(y) - 14 * s; ctx.save(); if (Math.cos(a) < 0) { ctx.translate(X, 0); ctx.scale(-1, 1); ctx.translate(-X, 0); } fxFrame(ctx, 'fx-12', 2, Math.floor(t * 10) % 6, X, Y, s * 0.4, 0, 0.85); ctx.restore(); continue; }
    if (kind === 'cau' && A.img['fx-12']) { fxFrame(ctx, 'fx-12', 3, Math.floor(t * 12) % 6, sx(x), sy(y) - 12 * s, s * 0.35); continue; }
    if (kind === 'ghost') { const X = sx(x), Y = sy(y); ctx.save(); ctx.globalAlpha = 0.75; if (Math.cos(a) < 0) { ctx.translate(X, 0); ctx.scale(-1, 1); ctx.translate(-X, 0); } drawCell(ctx, 'vat-pham', 15, X, Y + 4 * s, s * 0.5); ctx.restore(); continue; }
    if (kind === 'cau') { const X = sx(x), Y = sy(y) - 12 * s, R = 9 * s; ctx.fillStyle = '#7a4aff'; ctx.beginPath(); ctx.arc(X, Y, R, 0, 7); ctx.fill(); ctx.fillStyle = '#e8d8ff'; ctx.beginPath(); ctx.arc(X, Y, R * 0.55, 0, 7); ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; for (let q = 0; q < 3; q++) { const b = t * 20 + q * 2.1; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X + Math.cos(b) * R * 1.6, Y + Math.sin(b * 1.3) * R * 1.6); ctx.stroke(); } continue; }
    const P = PROJ_OF[kind]; if (P) fxFrame(ctx, P[0], P[1], P[2] + (Math.floor(t * 12) % 2), sx(x), sy(y) - 10 * s, s * 0.45, kind === 'cuoc' ? t * 14 : a); }
  for (const [, x, y, kind] of snap.shots) {
    if (kind === 'orb') fxFrame(ctx, 'fx-08', 2, 2 + (Math.floor(t * 10) % 2), sx(x), sy(y) - 12 * s, s * 0.35);
    else if (kind === 'hook') fxFrame(ctx, 'fx-09', 1, 3, sx(x), sy(y) - 10 * s, s * 0.35);
    else fxFrame(ctx, 'fx-10', 3, 2, sx(x), sy(y) - 10 * s, s * 0.3);
  }
  // effects
  drawFx(ctx, sx, sy, s, TS, t, snap);
  // texts are drawn by the HUD; edges darken (hell air)
  const gr = ctx.createRadialGradient(W / 2, Hh / 2, Math.min(W, Hh) * 0.35, W / 2, Hh / 2, Math.max(W, Hh) * 0.7);
  gr.addColorStop(0, 'rgba(40,0,0,0)'); gr.addColorStop(1, 'rgba(40,0,0,0.55)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, Hh);
  if (H.hurtT && t - H.hurtT < 0.25) { ctx.fillStyle = `rgba(255,0,0,${0.25 * (1 - (t - H.hurtT) / 0.25)})`; ctx.fillRect(0, 0, W, Hh); }
  // embers
  ctx.fillStyle = '#ffb02a';
  for (let i = 0; i < 40; i++) { const ex = ((i * 97 + t * 20 * (1 + (i % 3))) % W), ey = Hh - ((i * 53 + t * 40 * (1 + (i % 2))) % Hh); ctx.globalAlpha = 0.5; ctx.fillRect(ex, ey, 2, 2); }
  ctx.globalAlpha = 1;
  if (H.banner && t - H.banner.t0 < 3.5) { ctx.font = `700 ${Math.round(22)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#1b1726'; ctx.globalAlpha = Math.min(1, 3.5 - (t - H.banner.t0)); ctx.strokeText(H.banner.s, W / 2, 120); ctx.fillStyle = '#ffd070'; ctx.fillText(H.banner.s, W / 2, 120); ctx.globalAlpha = 1; }
}
function heart(ctx, x, y, r) {
  ctx.fillStyle = '#1b1726'; ctx.beginPath(); ctx.arc(x - r * 0.5, y, r * 0.62, 0, 7); ctx.arc(x + r * 0.5, y, r * 0.62, 0, 7); ctx.moveTo(x - r * 1.1, y + r * 0.15); ctx.lineTo(x, y + r * 1.25); ctx.lineTo(x + r * 1.1, y + r * 0.15); ctx.fill();
  ctx.fillStyle = '#ff3a5a'; ctx.beginPath(); ctx.arc(x - r * 0.5, y, r * 0.5, 0, 7); ctx.arc(x + r * 0.5, y, r * 0.5, 0, 7); ctx.moveTo(x - r * 0.95, y + r * 0.15); ctx.lineTo(x, y + r * 1.05); ctx.lineTo(x + r * 0.95, y + r * 0.15); ctx.fill();
  ctx.fillStyle = '#ffd0d8'; ctx.fillRect(x - r * 0.75, y - r * 0.3, r * 0.3, r * 0.3);
}
function drawMon(ctx, o, x, y, s, t) {
  const [, ti, , , hp, act, dir10, size, flag] = o.row, type = MON_TYPES[ti], M = A.mon[type];
  if (!M?.m) { ctx.fillStyle = '#c03020'; ctx.fillRect(x - 6 * s, y - 14 * s, 12 * s, 14 * s); return; }
  const a = M.m, dir = DIR_OF(dir10 / 10), st = act === 2 ? 'attack' : act === 3 ? 'hit' : act === 5 && a.states.death ? 'death' : act === 6 && a.states.skill ? 'skill' : act === 1 ? (Math.floor(t * 6 + o.id) % 2 ? 'walk' : 'idle') : 'idle';
  const S2 = a.states[st] ?? a.states.idle, row = S2.row + dir, [cw, ch] = a.size, [ox, oy] = a.anchor;
  const k = s * (size === 2 ? 0.7 : size === 3 ? 0.45 : 1) * (flag === 1 ? 1 + 0.12 * Math.sin(t * 30) : 1);
  if (flag === 2) { ctx.globalAlpha = 0.5; ctx.fillStyle = '#3a1a10'; ctx.beginPath(); ctx.ellipse(x, y, 20 * s, 8 * s, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; return; }
  const img = M.parts ? M.parts[Math.floor(row / M.per)] : M.img, fy = (M.parts ? row % M.per : row) * ch;
  if (img) ctx.drawImage(img, 0, fy, cw, ch, Math.round(x - ox * k), Math.round(y - oy * k), Math.round(cw * k), Math.round(ch * k));
  if (flag === 1) { ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 25); ctx.strokeStyle = '#ffee6a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 12 * k, 5 * k, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
  const big = HELL_ELITES.some((e) => e.id === type) || HELL_BOSSES[type];
  if (hp < 100 && !big) { const w = 14 * s, yy = y - oy * k - 3; ctx.fillStyle = '#1b1726'; ctx.fillRect(x - w / 2 - 1, yy - 1, w + 2, 4); ctx.fillStyle = '#ff5a3a'; ctx.fillRect(x - w / 2, yy, (w * hp) / 100, 2); }
}
function drawHero(ctx, r, x, y, s, t) {
  const [pid, type, , , hp, maxHp, face, moving, dead, , lv, name, , liem, bua, ult, revive, evo = 0] = r;
  if (bua) { ctx.save(); ctx.globalAlpha = 0.55; fxFrame(ctx, 'fx-04', evo & 4 ? 3 : 2, Math.floor(t * 8) % 8, x, y, s * bua * 32 / 110); ctx.restore(); } // Kim Cang Trận: the vajra ring
  ctx.globalAlpha = dead ? 0.35 : 1;
  const c = pid === H.you ? '#3ee06b' : '#7ad0ff'; ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, 1.5 * s); ctx.beginPath(); ctx.ellipse(x, y, 11 * s, 5 * s, 0, 0, 7); ctx.stroke();
  if (SPR.atlas?.[type]) drawUnit(ctx, type, 'blue', dead ? 'death' : moving ? (Math.floor(t * 8) % 2 ? 'walk' : 'idle') : 'idle', DIR_OF(face), x, y, s);
  ctx.globalAlpha = 1;
  if (evo & 2) { const a = t * 2.4; fxFrame(ctx, 'fx-03', 1, Math.floor(t * 12) % 8, x + Math.cos(a) * 3 * 32 * s, y + Math.sin(a) * 3 * 32 * s * 0.75 - 14 * s, s * 0.6, a + Math.PI / 2); } // Roi Long Hỏa
  if (liem) { const [n, R] = liem; for (let k = 0; k < n; k++) { const a = t * 3.2 + (k / n) * Math.PI * 2; fxFrame(ctx, 'fx-03', evo & 1 ? 3 : 2, Math.floor(t * 14 + k) % 8, x + Math.cos(a) * R * 32 * s, y + Math.sin(a) * R * 32 * s * 0.75 - 8 * s, s * 0.35); } }
  if (ult === 'shield') { ctx.globalAlpha = 0.4; ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.ellipse(x, y - 18 * s, 16 * s, 24 * s, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
  // bars + name
  const w = 30 * s, yy = y - 58 * s; ctx.fillStyle = '#1b1726'; ctx.fillRect(x - w / 2 - 1, yy - 1, w + 2, 5 * s + 2); ctx.fillStyle = pid === H.you ? '#3ee06b' : '#7ad0ff'; ctx.fillRect(x - w / 2, yy, Math.max(0, (w * hp) / maxHp), 5 * s);
  ctx.font = `600 ${Math.max(11, 6 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726'; const label = `${name} · ${lv}`; ctx.strokeText(label, x, yy - 4); ctx.fillStyle = '#fff'; ctx.fillText(label, x, yy - 4);
  if (dead && revive) { ctx.fillStyle = '#ffd070'; ctx.fillRect(x - w / 2, yy + 7 * s, (w * revive) / 30, 3 * s); }
}
function drawFx(ctx, sx, sy, s, TS, t, snap) {
  H.fx = H.fx.filter((f) => t - f.t0 < f.dur);
  for (const f of H.fx) {
    const p = (t - f.t0) / f.dur, fr = p * 8;
    switch (f.k) {
      case 'sk': {
        if (f.s === 'tia-pha-ma' && A.img['fx-12']) { // the Purge Beam art, turned as it sweeps
          const hr = snap.heroes.find((q) => q[0] === f.pid), hx = hr ? hr[2] : f.x, hy = hr ? hr[3] : f.y, L = f.len * TS, k = L / 125, fr2 = p < 0.1 ? 1 : p > 0.9 ? 6 + (p > 0.95 ? 1 : 0) : 2 + (Math.floor(t * 12) % 4);
          for (let q = 0; q < (f.n ?? 1); q++) { const a = f.a + p * Math.PI * 2 + q * Math.PI; fxFrame(ctx, 'fx-12', 0, fr2, sx(hx) + Math.cos(a) * L * 0.42, sy(hy) - 14 * s + Math.sin(a) * L * 0.42 * 0.75, k, a); }
          break;
        }
        if (f.s === 'tia-pha-ma') { // a beam sweeping once round the hero
          const hr = snap.heroes.find((q) => q[0] === f.pid), hx = hr ? hr[2] : f.x, hy = hr ? hr[3] : f.y;
          for (let q = 0; q < (f.n ?? 1); q++) { const a = f.a + p * Math.PI * 2 + q * Math.PI, X = sx(hx), Y = sy(hy) - 14 * s, ex = X + Math.cos(a) * f.len * TS, ey = Y + Math.sin(a) * f.len * TS * 0.75;
            for (const [col, wd] of [['#ffcf4a', 9], ['#fff6c0', 4], ['#ffffff', 1.5]]) { ctx.strokeStyle = col; ctx.lineWidth = wd * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(ex, ey); ctx.stroke(); } }
          break;
        }
        if (f.s === 'bang-phong' && A.img['fx-12']) { fxFrame(ctx, 'fx-12', 4, fr, sx(f.x), sy(f.y), (f.r * TS * 2) / 130); break; }
        if (f.s === 'bang-phong') { fxFrame(ctx, 'fx-06', 2, fr, sx(f.x), sy(f.y) - 20 * s, s * 0.5); ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(sx(f.x), sy(f.y), f.r * TS * p, f.r * TS * p * 0.6, 0, 0, 7); ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1; break; }
        if (f.evo && HELL_EVO[f.s]) { const [sh, row] = HELL_EVO[f.s].fx; fxFrame(ctx, sh, row, fr, sx(f.x) + Math.cos(f.a) * f.len * TS / 2, sy(f.y) - 10 * s + Math.sin(f.a) * f.len * TS / 2, s * f.len * 0.3, f.a); break; } // Thạch Kiếm Phá Sơn, Vó Ngựa Sấm Rền
        const F = FX_OF[f.s]; if (!F) break;
        if (f.s === 'w-thach-lam' || f.s === 'quat-ba-tieu') fxFrame(ctx, F[0], F[1], fr, sx(f.x) + Math.cos(f.a) * (f.r ?? f.len ?? 2) * TS * 0.45, sy(f.y) - 12 * s + Math.sin(f.a) * (f.r ?? f.len ?? 2) * TS * 0.45, s * (f.r ?? f.len ?? 2) * 0.5, f.a);
        else if (f.s === 'w-phong-vu' || f.s === 'w-hoa-ky' || f.s === 'dia-chan') fxFrame(ctx, F[0], F[1], fr, sx(f.x) + Math.cos(f.a) * f.len * TS / 2, sy(f.y) - 10 * s + Math.sin(f.a) * f.len * TS / 2, s * f.len * 0.32, f.a);
        else if (f.s === 'chuong-dong') { fxFrame(ctx, F[0], F[1], fr, sx(f.x), sy(f.y) - 30 * s, s * 0.5); ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#ffcf6a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(sx(f.x), sy(f.y), f.r * TS * p, f.r * TS * p * 0.6, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
        else fxFrame(ctx, F[0], F[1], fr, sx(f.x), sy(f.y) - 16 * s, s * 0.55);
        break;
      }
      case 'zap': { // chain lightning (16/11/2026): jagged bolts re-rolled every frame, side forks, 3 light layers, a spark on every target
        const P = f.pts.map(([x, y], i) => [sx(x), sy(y) - (i ? 14 : 18) * s]);
        const jag = (ax, ay, bx, by, n, amp, seed) => { const out = [[ax, ay]], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; for (let q = 1; q < n; q++) { const u = q / n, w = (Math.sin(seed * 12.9898 + q * 78.233 + Math.floor(t * 30) * 3.1) * 43758.5453) % 1; out.push([ax + dx * u + nx * w * amp, ay + dy * u + ny * w * amp]); } out.push([bx, by]); return out; };
        const paths = [];
        for (let i = 1; i < P.length; i++) {
          const [ax, ay] = P[i - 1], [bx, by] = P[i], L = Math.hypot(bx - ax, by - ay), main = jag(ax, ay, bx, by, Math.max(4, Math.round(L / (10 * s))), 9 * s, f.seed + i);
          paths.push([main, 1]);
          const m = main[Math.floor(main.length / 2)], fa = Math.atan2(by - ay, bx - ax) + (i % 2 ? 0.9 : -0.9); // a short fork
          paths.push([jag(m[0], m[1], m[0] + Math.cos(fa) * L * 0.3, m[1] + Math.sin(fa) * L * 0.3, 3, 6 * s, f.seed + i * 7), 0.5]);
        }
        ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (const [col, wd, al] of [['#6a2aff', 13, 0.35], ['#c08aff', 6, 0.85], ['#ffffff', 2.4, 1]]) {
          ctx.strokeStyle = col; ctx.globalAlpha = al * (1 - p * 0.8);
          for (const [pts, k] of paths) { ctx.lineWidth = wd * s * k; ctx.beginPath(); pts.forEach(([x, y], q) => (q ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
        }
        ctx.restore();
        for (let i = 1; i < P.length; i++) { // impact sparks
          ctx.globalAlpha = 1 - p; ctx.fillStyle = '#ffffff'; const [x, y] = P[i], r = (5 + 3 * Math.sin(t * 50 + i)) * s;
          ctx.beginPath(); for (let q = 0; q < 8; q++) { const a = (q / 8) * Math.PI * 2, rr = q % 2 ? r * 0.35 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.fill();
          ctx.fillStyle = '#c08aff'; ctx.beginPath(); ctx.arc(x, y, r * 0.3, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = 1; break;
      }
      case 'boom': { const B = BOOM_OF[f.c]; if (B) fxFrame(ctx, B[0], B[1], B[2] ? B[2] + p * (8 - B[2]) : fr, sx(f.x), sy(f.y) - 10 * s, s * Math.max(0.4, f.r * 0.5)); else { ctx.globalAlpha = 1 - p; ctx.strokeStyle = f.c === 'down' ? '#ffffff' : '#ffb02a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(sx(f.x), sy(f.y), f.r * TS * (0.4 + p * 0.6), f.r * TS * 0.6 * (0.4 + p * 0.6), 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; } break; }
      case 'die': fxFrame(ctx, 'fx-08', 1, fr, sx(f.x), sy(f.y) - 10 * s, s * 0.3, 0, 0.8); break;
      case 'ult': {
        { const hr = snap.heroes.find((q) => q[0] === f.pid), X = sx(hr ? hr[2] : f.x), Y = sy(hr ? hr[3] : f.y), live = { 'thach-lam': 6, 'phong-vu': 5 }[f.hero] ?? 0;
          if (!heroSkillFx(ctx, f.hero, t - f.t0, X, Y, H.z, live)) f.t0 = -99; } // done: drop it next frame
        if (t - f.t0 > 1) break;
        ctx.globalAlpha = 1 - (t - f.t0); ctx.strokeStyle = '#ffe26a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(sx(f.x), sy(f.y), 6 * TS * (t - f.t0), 6 * TS * (t - f.t0) * 0.6, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; break; }
      case 'healfx': { const me = snap.heroes.find((r) => r[0] === H.you); if (me) { ctx.globalAlpha = 1 - p; ctx.strokeStyle = '#6aff8a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(sx(me[2]), sy(me[3]), 30 * s * (0.5 + p), 14 * s * (0.5 + p), 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; } break; }
    }
  }
}

// ---------------------------------------------------------------- HUD (DOM)
let cardKey = '';
function buildDom() {
  document.getElementById('hellhud')?.remove();
  const d = document.createElement('div'); d.id = 'hellhud';
  d.innerHTML = `<div class="hh-top"><span class="hh-mode"></span><b class="hh-wave"></b><span class="hh-time"></span></div>
    <div class="hh-boss hidden"><b></b><div class="hh-bb"><i></i></div></div>
    <div class="hh-xp"><i></i><span></span></div>
    <div class="hh-left"><div class="hh-hp"><i></i><span></span></div><div class="hh-stats"></div></div>
    <div class="hh-skills"></div>
    <div class="hh-btns"><button class="hh-pause" title="Tạm dừng (P) · chỉ khi chơi một mình">⏸ Tạm dừng</button><button class="hh-ult" title="Chiêu cuối (Q)">Q</button><button class="hh-exit hidden" title="Rời Địa Ngục (E) khi đứng ở Tế đàn">🚪 Thoát (E)</button><button class="hh-quit" title="Ra ngoài ngay, tính là thua: giữ 70% thưởng đã kiếm">🏳 Bỏ cuộc</button></div>
    <div class="hh-help">Chuột phải giữ / WASD: di chuyển · tướng tự đánh · Q: chiêu cuối · 1–4: chọn thẻ</div>`;
  document.body.appendChild(d);
  d.querySelector('.hh-ult').onclick = () => send({ t: 'hult' });
  d.querySelector('.hh-pause').onclick = () => togglePause();
  d.querySelector('.hh-exit').onclick = () => send({ t: 'hexit' });
  const q = d.querySelector('.hh-quit'); // two clicks: the first one asks (16/11/2026)
  q.onclick = () => {
    if (q.dataset.sure) { send({ t: 'hquit' }); q.disabled = true; q.textContent = 'Đang ra…'; return; }
    q.dataset.sure = '1'; q.classList.add('sure'); q.textContent = '⚠ Bấm lần nữa: bỏ cuộc (thua, giữ 70%)';
    clearTimeout(q._t); q._t = setTimeout(() => { delete q.dataset.sure; q.classList.remove('sure'); q.textContent = '🏳 Bỏ cuộc'; }, 3000);
  };
}
const fmtT = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
function renderHud() {
  const d = document.getElementById('hellhud'), sn = H.snap; if (!d || !sn) return;
  const me = sn.me, M = HELL_MODES[H.mi], hero = sn.heroes.find((r) => r[0] === H.you);
  d.querySelector('.hh-mode').textContent = `Địa Ngục · ${M.name}`;
  d.querySelector('.hh-wave').textContent = sn.phase === 'boss' ? 'BOSS' : `Vòng ${Math.min(sn.wave, sn.waves)} / ${sn.waves}`;
  d.querySelector('.hh-time').textContent = fmtT(sn.T) + (sn.paused ? ' · tạm dừng' : '');
  d.querySelector('.hh-xp i').style.width = `${Math.min(100, (me.xp / me.need) * 100)}%`;
  d.querySelector('.hh-xp span').textContent = `Cấp ${me.lv}`;
  if (hero) { d.querySelector('.hh-hp i').style.width = `${Math.max(0, (hero[4] / hero[5]) * 100)}%`; d.querySelector('.hh-hp span').textContent = `${Math.max(0, hero[4])} / ${hero[5]}`; }
  d.querySelector('.hh-stats').innerHTML = `☠ ${me.kills.toLocaleString('vi')} · <span style="color:${RES_INFO.gold.color}">vàng ${me.earned.gold}</span> · 🔥 Than Hồn ${me.earned.soul} · 📦 ${me.earned.items}`;
  const bb = d.querySelector('.hh-boss');
  if (sn.boss) { bb.classList.remove('hidden'); bb.querySelector('b').textContent = sn.boss[3]; bb.querySelector('i').style.width = `${(sn.boss[1] / sn.boss[2]) * 100}%`; } else bb.classList.add('hidden');
  const ult = d.querySelector('.hh-ult'); ult.textContent = me.ult > 0 ? `Q ${me.ult}s` : `Q · ${HELL_ULT[hero?.[1]]?.name ?? ''}`; ult.classList.toggle('ready', !me.ult);
  d.querySelector('.hh-exit').classList.toggle('hidden', !sn.exit);
  if (sn.exit) d.querySelector('.hh-exit').textContent = `🚪 Thoát ở Tế đàn (E) · ${sn.exit}s`;
  const sk = [...me.act.map((id) => [id, 'act']), ...me.pas.map((id) => [id, 'pas'])];
  const key = sk.map(([id]) => id + me.skills[id] + (me.evo?.[id] ? 'e' : '')).join() + A.ready;
  if (d.dataset.sk !== key) { d.dataset.sk = key; d.querySelector('.hh-skills').innerHTML = sk.map(([id, sl]) => `<div class="hh-sk ${sl}${me.evo?.[id] ? ' evo' : ''}" title="${skName(id, me)} cấp ${me.skills[id]}: ${me.evo?.[id] ? HELL_EVO[id].text : HELL_SKILLS[id].texts.slice(0, me.skills[id]).join(' ')}"><img src="${skIcon(id, 28, me)}"><b>${me.evo?.[id] ? '✨' : me.skills[id]}</b></div>`).join(''); }
  renderCards(me);
  renderPause(sn); d.querySelector('.hh-pause').disabled = sn.heroes.length > 1;
}
function renderCards(me) {
  let box = document.getElementById('hellcards');
  if (!me.cards) { box?.remove(); cardKey = ''; return; }
  const tm = box?.querySelector('.hc-time'); if (tm) { tm.textContent = `⏱ ${me.cardsLeft ?? ''}s`; tm.classList.toggle('low', (me.cardsLeft ?? 99) <= 5); }
  const key = JSON.stringify(me.cards) + me.rerolls + me.skips + A.ready;
  if (key === cardKey && box) return; cardKey = key;
  if (!box) { box = document.createElement('div'); box.id = 'hellcards'; document.body.appendChild(box); }
  box.innerHTML = `<div class="hc-title">⭐ Lên cấp ${me.lv}! Chọn 1 kỹ năng <span class="hc-time"></span></div><div class="hc-sub">Quái vẫn đánh trong lúc chọn · hết giờ sẽ chọn ngẫu nhiên</div><div class="hc-row">${me.cards.map((c, i) => `<div class="hc-card ${c.slot ?? ''} ${c.filler ? 'filler' : c.isNew ? '' : 'up'}" data-i="${i}">${c.filler || c.isNew ? '' : '<div class="hc-upb">⬆ NÂNG CẤP</div>'}
      <div class="hc-key">${i + 1}</div><img src="${hellIconURL(c.icon, 48, HELL_SKILLS[c.id]?.emo)}"><b>${c.name}</b><small>${c.filler ? '' : c.isNew ? '<span class="hc-new">MỚI</span>' : `<span class="hc-lv">Cấp ${c.L - 1} → ${c.L}</span>`} · ${c.slot === 'pas' ? 'Nội tại' : c.slot === 'act' ? 'Chủ động' : ''}</small><p>${c.text}</p></div>`).join('')}</div>
    <div class="hc-btns"><button class="hc-reroll" ${me.rerolls ? '' : 'disabled'}>🔄 Đổi bài (${me.rerolls}) · R</button><button class="hc-skip" ${me.skips ? '' : 'disabled'}>⏭ Bỏ qua (${me.skips})</button></div>`;
  box.querySelectorAll('.hc-card').forEach((el) => (el.onclick = () => pick(+el.dataset.i)));
  box.querySelector('.hc-reroll').onclick = () => send({ t: 'hpick', reroll: 1 });
  box.querySelector('.hc-skip').onclick = () => send({ t: 'hpick', skip: 1 });
  const tm2 = box.querySelector('.hc-time'); if (tm2) tm2.textContent = `⏱ ${me.cardsLeft ?? ''}s`;
}
// ⏸ pause (solo, 16/11/2026): the server freezes the run; this panel offers Tiếp tục / Bỏ cuộc
function togglePause() { const sn = H.snap; if (!sn || sn.heroes.length > 1) return; send({ t: 'hpause', on: !sn.paused }); }
function renderPause(sn) {
  let box = document.getElementById('hellpause');
  if (!sn.paused) { box?.remove(); return; }
  if (box) return;
  box = document.createElement('div'); box.id = 'hellpause';
  box.innerHTML = `<div class="hp-box"><div class="hp-title">⏸ Tạm dừng</div><small>Quái và đồng hồ đang đứng yên</small><button class="hp-go">▶ Tiếp tục (P)</button><button class="hp-quit">🏳 Bỏ cuộc (thua, giữ 70% thưởng)</button></div>`;
  document.body.appendChild(box);
  box.querySelector('.hp-go').onclick = () => send({ t: 'hpause', on: false });
  box.querySelector('.hp-quit').onclick = () => { send({ t: 'hquit' }); box.remove(); };
}
function pick(i) { send({ t: 'hpick', i }); }
function renderEnd() {
  const m = H.end; if (!m) return;
  document.getElementById('hellcards')?.remove();
  const box = document.createElement('div'); box.id = 'hellend'; box.className = 'thup';
  const res = Object.entries(m.res ?? {}).filter(([, v]) => v > 0).map(([r, v]) => `<span class="qrw"><i class="ic" data-r="${r}" style="--c:${RES_INFO[r].color}"></i>${v.toLocaleString('vi')} ${RES_INFO[r].name}</span>`).join('');
  box.innerHTML = `<div class="thup-box"><div class="thup-title">${m.result === 'win' ? '🏆 Đã hạ boss Địa Ngục!' : m.result === 'exit' ? '🚪 Rời Địa Ngục an toàn' : '💀 Gục trong Địa Ngục'}</div>
    <div class="thup-sub">${HELL_MODES[m.mode]?.name} · ${fmtT(m.T)} · vòng ${m.wave} · cấp ${m.lv} · hạ ${m.kills.toLocaleString('vi')} quái${m.result === 'dead' ? ' · giữ 70% thưởng' : ''}</div>
    <div class="hend-res">${res}</div><div class="hend-res">⭐ ${m.xp.toLocaleString('vi')} XP tướng · 🔥 ${m.soul} Than Hồn${m.items.length ? ` · 📦 ${m.items.map((t) => `<b style="color:${TIER_INFO[t]?.color}">${TIER_INFO[t]?.name}</b>`).join(', ')}` : ''}</div>
    <small class="muted">Trang bị vào túi đồ (đầy thì vào Rương đồ). Than Hồn dùng để Hỏa luyện thú cưng.</small>
    <button class="thup-ok">Về Thế giới mở</button></div>`;
  document.body.appendChild(box);
  box.querySelector('.thup-ok').onclick = () => { box.remove(); hellStop(); };
}

/** the Hell Gate in the open world (tile coords of its centre), with its vortex */
export function drawHellGate(ctx, sx, sy, s, t, gx, gy) {
  const G = hellGateImg(); if (!G?.img) return;
  const x = sx(gx), y = sy(gy + 5), k = s;
  ctx.drawImage(G.img, 0, 0, G.size[0], G.size[1], Math.round(x - G.anchor[0] * k), Math.round(y - G.anchor[1] * k), Math.round(G.size[0] * k), Math.round(G.size[1] * k));
  // the vortex in the opening (the gate faces west): the round vortex squashed sideways
  const F = A.json?.fx['fx-11'], img = A.img['fx-11'];
  if (F && img) { const [oy, h] = F.rows[3], fr = Math.floor(t * 8) % 8; ctx.save(); ctx.globalAlpha = 0.9; ctx.translate(x - 8 * k, y - G.anchor[1] * k * 0.52); ctx.scale(0.42, 1); ctx.drawImage(img, fr * F.w, oy, F.w, h, Math.round(-F.w * k * 0.38), Math.round(-h * k * 0.38), Math.round(F.w * k * 0.76), Math.round(h * k * 0.76)); ctx.restore(); }
  const top = y - G.anchor[1] * k - 6 * s;
  ctx.font = `700 ${Math.max(12, 7 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726';
  ctx.strokeText('🔥 Cổng Địa Ngục', x, top); ctx.fillStyle = '#ff7a3a'; ctx.fillText('🔥 Cổng Địa Ngục', x, top);
  ctx.font = `600 ${Math.max(10, 5 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.strokeText('Bấm vào cổng để xuống ngục', x, top + 12 * s); ctx.fillStyle = '#e8dcc8'; ctx.fillText('Bấm vào cổng để xuống ngục', x, top + 12 * s);
}

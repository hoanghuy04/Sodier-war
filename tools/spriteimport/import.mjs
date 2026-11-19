// Import an AI-generated sprite sheet (magenta background, 8 direction columns × N animation rows)
// into clean game sprites: cut cells, drop the background, snap to the real pixel grid, align feet, recolour for the red team.
// Usage: node tools/spriteimport/import.mjs <sheet.png> <unit-id> [rows=idle,walk,attack,hit,victory,death] [targetHeight=46]
import fs from 'node:fs';
import { Px, savePng, mix } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';
import { saveGif } from '../unitgen/gif.mjs';

// --no-team: keep the original colours (heroes are unique; their team is shown by a ground ring in game)
const NO_TEAM = process.argv.includes('--no-team');
const [, , file, unit, rowArg, hArg] = process.argv.filter((a) => a !== '--no-team');
const TEAMS = NO_TEAM ? ['blue'] : ['blue', 'red'];
const ROWS = (rowArg ?? 'idle,walk,attack,hit,victory,death').split(',');
const TARGET_H = +(hArg ?? 46);
const out = new URL('../../docs/design/assets/units-ai/', import.meta.url).pathname;
// column order in the generated sheets (↓ ↘ → ↗ ↑ ↖ ← ↙) and the game atlas order (clockwise from ↓)
const SHEET_DIRS = ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW'];
const GAME_DIRS = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];

const img = readPng(file);
const W = img.w, H = img.h;
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];

// ---------- 1. background mask: magenta, its purple drop shadow and pink fringes ----------
function isBg(v) {
  const [r, g, b] = rgb(v);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (mx < 40) return false; // near-black outline, keep
  const s = (mx - mn) / mx;
  let h = 0;
  if (mx !== mn) { if (mx === r) h = ((g - b) / (mx - mn)) * 60; else if (mx === g) h = (2 + (b - r) / (mx - mn)) * 60; else h = (4 + (r - g) / (mx - mn)) * 60; }
  if (h < 0) h += 360;
  return h > 282 && h < 328 && s > 0.38;
}
const fg = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) fg[i] = isBg(img.d[i]) ? 0 : 1;
// remove a 1px ring of fringe pixels that touch the background and are pinkish
for (let pass = 0; pass < 2; pass++) {
  const kill = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (!fg[i]) continue;
    if (fg[i - 1] && fg[i + 1] && fg[i - W] && fg[i + W]) continue;
    const [r, g, b] = rgb(img.d[i]);
    if (r > 120 && b > 110 && g < Math.min(r, b) * 0.7) kill.push(i);
  }
  for (const i of kill) fg[i] = 0;
}

// ---------- 2. connected parts, row bands, cells ----------
const comp = new Int32Array(W * H).fill(-1), parts = [];
for (let s = 0; s < W * H; s++) {
  if (!fg[s] || comp[s] >= 0) continue;
  const q = [s]; comp[s] = parts.length;
  let x0 = W, y0 = H, x1 = 0, y1 = 0, sx = 0, sy = 0;
  for (let k = 0; k < q.length; k++) {
    const i = q[k], x = i % W, y = (i / W) | 0;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); sx += x; sy += y;
    for (let j = -1; j <= 1; j++) for (let d = -1; d <= 1; d++) {
      const nx = x + d, ny = y + j, ni = ny * W + nx;
      if (nx >= 0 && ny >= 0 && nx < W && ny < H && fg[ni] && comp[ni] < 0) { comp[ni] = parts.length; q.push(ni); }
    }
  }
  parts.push({ id: parts.length, n: q.length, x0, y0, x1, y1, cx: sx / q.length, cy: sy / q.length });
}
// beams / fire that bridge two neighbouring cells: split at the column boundary when both sides are substantial
const colW = W / 8;
for (const p of parts.slice()) {
  const c0 = Math.floor(p.x0 / colW), c1 = Math.floor(p.x1 / colW);
  if (c0 === c1) continue;
  const frag = new Map();
  for (let y = p.y0; y <= p.y1; y++) for (let x = p.x0; x <= p.x1; x++) {
    if (comp[y * W + x] !== p.id) continue;
    const c = Math.floor(x / colW);
    if (!frag.has(c)) frag.set(c, []);
    frag.get(c).push(y * W + x);
  }
  const keep = [...frag.entries()].filter(([, l]) => l.length > 400 && l.length >= 0.2 * p.n);
  if (keep.length < 2) continue;
  const biggest = keep.reduce((a, b) => (b[1].length > a[1].length ? b : a))[0];
  const owner = new Map([[biggest, p.id]]); // column → part id
  const nextId = parts.length;
  const fresh = keep.filter(([c]) => c !== biggest).map(([c], k) => ({ id: nextId + k, c }));
  for (const f of fresh) owner.set(f.c, f.id);
  // small fragments go to the nearest kept column
  const nearestKept = (c) => [...owner.keys()].reduce((a, b) => (Math.abs(b - c) < Math.abs(a - c) ? b : a));
  const stats = new Map();
  for (const [c, l] of frag) {
    const id = owner.get(nearestKept(c));
    for (const i of l) {
      comp[i] = id;
      const x = i % W, y = (i / W) | 0;
      const s = stats.get(id) ?? { n: 0, x0: W, y0: H, x1: 0, y1: 0, sx: 0, sy: 0 };
      s.n++; s.x0 = Math.min(s.x0, x); s.x1 = Math.max(s.x1, x); s.y0 = Math.min(s.y0, y); s.y1 = Math.max(s.y1, y); s.sx += x; s.sy += y;
      stats.set(id, s);
    }
  }
  for (const f of fresh) parts.push({ id: f.id });
  for (const [id, s] of stats) Object.assign(parts[id], { n: s.n, x0: s.x0, y0: s.y0, x1: s.x1, y1: s.y1, cx: s.sx / s.n, cy: s.sy / s.n });
}
const big = parts.filter((p) => p.n > 400);
// row bands from the big parts' vertical centres
big.sort((a, b) => a.cy - b.cy);
const bands = [];
for (const p of big) { const b = bands.find((b) => Math.abs(b.cy - p.cy) < 45); if (b) { b.list.push(p); b.cy = b.list.reduce((a, q) => a + q.cy, 0) / b.list.length; } else bands.push({ cy: p.cy, list: [p] }); }
bands.sort((a, b) => a.cy - b.cy);
// extra bands (smoke columns, loose effects) → merge the sparsest one into its nearest neighbour
while (bands.length > ROWS.length) {
  const k = bands.reduce((m, b, i) => (b.list.length < bands[m].list.length ? i : m), 0);
  const nb = k === 0 ? 1 : k === bands.length - 1 ? k - 1 : Math.abs(bands[k - 1].cy - bands[k].cy) < Math.abs(bands[k + 1].cy - bands[k].cy) ? k - 1 : k + 1;
  bands[nb].list.push(...bands[k].list);
  bands.splice(k, 1);
}
if (bands.length !== ROWS.length) console.warn(`found ${bands.length} rows, expected ${ROWS.length}`);
const colOf = (x) => Math.max(0, Math.min(7, Math.floor(x / (W / 8))));
const rowOf = (y) => { let best = 0; bands.forEach((b, k) => { if (Math.abs(b.cy - y) < Math.abs(bands[best].cy - y)) best = k; }); return best; };
const cells = Array.from({ length: bands.length }, () => Array.from({ length: 8 }, () => []));
for (const p of parts) if (p.n >= 12) cells[rowOf(p.cy)][colOf(p.cx)].push(p);

// ---------- 3. palette (k-means on sprite pixels) ----------
const sample = [];
for (let i = 0; i < W * H; i += 7) if (fg[i]) sample.push(rgb(img.d[i]));
let pal = Array.from({ length: 40 }, (_, k) => sample[Math.floor((k / 40) * sample.length)]);
for (let it = 0; it < 10; it++) {
  const acc = pal.map(() => [0, 0, 0, 0]);
  for (const c of sample) { let bi = 0, bd = 1e9; pal.forEach((p, k) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; bi = k; } }); const a = acc[bi]; a[0] += c[0]; a[1] += c[1]; a[2] += c[2]; a[3]++; }
  pal = acc.map((a, k) => (a[3] ? [a[0] / a[3], a[1] / a[3], a[2] / a[3]] : pal[k]));
}
const nearest = (c) => { let bi = 0, bd = 1e9; pal.forEach((p, k) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (d < bd) { bd = d; bi = k; } }); return bi; };
const palHex = pal.map((p) => '#' + p.map((v) => Math.round(v).toString(16).padStart(2, '0')).join(''));

// ---------- 4. scale: idle height → TARGET_H ----------
const bbox = (list) => list.reduce((a, p) => [Math.min(a[0], p.x0), Math.min(a[1], p.y0), Math.max(a[2], p.x1), Math.max(a[3], p.y1)], [W, H, 0, 0]);
const idleRow = Math.max(0, ROWS.indexOf('idle'));
const hs = cells[idleRow].map((l) => { const b = bbox(l); return b[3] - b[1] + 1; }).sort((a, b) => a - b);
const F = hs[hs.length >> 1] / TARGET_H; // source px per art px
console.log(`${unit}: ${bands.length} rows, scale ${F.toFixed(2)} src px per art px, ${parts.length} parts`);

function cellSprite(r, c) {
  const list = cells[r][c];
  if (!list.length) return null;
  const main = list.reduce((a, p) => (p.n > a.n ? p : a));
  const [x0, y0, x1, y1] = bbox(list);
  // feet: mean x of the main part's lowest 10% rows
  let fx = 0, fn = 0;
  for (let y = Math.round(main.y1 - (main.y1 - main.y0) * 0.1); y <= main.y1; y++) for (let x = main.x0; x <= main.x1; x++) if (comp[y * W + x] === main.id) { fx += x; fn++; }
  const ax = fx / fn, ay = main.y1 + 1;
  const ow = Math.ceil((x1 - x0 + 1) / F) + 2, oh = Math.ceil((y1 - y0 + 1) / F) + 2;
  const p = new Px(ow, oh);
  const sx0 = ax - Math.round((ax - x0) / F + 1) * F, sy0 = ay - Math.round((ay - y0) / F + 1) * F;
  for (let j = 0; j < oh; j++)
    for (let i = 0; i < ow; i++) {
      const counts = new Map(); let opaque = 0, total = 0;
      for (let y = Math.floor(sy0 + j * F); y < sy0 + (j + 1) * F; y++)
        for (let x = Math.floor(sx0 + i * F); x < sx0 + (i + 1) * F; x++) {
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          total++;
          const k = y * W + x;
          if (!fg[k] || !list.some((q) => q.id === comp[k])) continue;
          opaque++;
          const ci = nearest(rgb(img.d[k]));
          counts.set(ci, (counts.get(ci) ?? 0) + 1);
        }
      if (!total || opaque / total < 0.45) continue;
      // darkest colour wins ties so 1px outlines survive the downscale
      let best = -1, bc = -1;
      for (const [ci, n] of counts) { const lum = pal[ci][0] * 0.3 + pal[ci][1] * 0.59 + pal[ci][2] * 0.11; const sc = n + (lum < 50 ? 0.6 * n : 0); if (sc > bc) { bc = sc; best = ci; } }
      p.set(i, j, palHex[best]);
    }
  const anchor = [Math.round((ax - sx0) / F), Math.round((ay - sy0) / F)];
  return { p, anchor };
}

// ---------- 5. team recolour: blue cloth → red ----------
function toRed(p) {
  const q = new Px(p.w, p.h); q.d.set(p.d);
  for (let i = 0; i < q.d.length; i++) {
    const v = q.d[i]; if (!(v & 255)) continue;
    const [r, g, b] = rgb(v), mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx === b && b - r > 50 && (mx - mn) / mx > 0.52) q.d[i] = (((b << 24) | (Math.round(g * 0.6) << 16) | (Math.round(r * 0.7) << 8) | 255) >>> 0);
  }
  return q;
}

// ---------- 6. outputs ----------
const sprites = {}; // anim -> gameDir -> {p, anchor}
ROWS.forEach((anim, r) => { if (r >= bands.length) return; sprites[anim] = {}; SHEET_DIRS.forEach((d, c) => { const s = cellSprite(r, c); if (s) sprites[anim][d] = s; }); });
let cw = 0, chUp = 0, chDown = 0;
for (const a of Object.values(sprites)) for (const s of Object.values(a)) { cw = Math.max(cw, 2 * Math.max(s.anchor[0], s.p.w - s.anchor[0])); chUp = Math.max(chUp, s.anchor[1]); chDown = Math.max(chDown, s.p.h - s.anchor[1]); }
cw += 4; const ch = chUp + chDown + 4, ox = cw >> 1, oy = chUp + 2;
const anims = Object.keys(sprites);
const frameOf = (anim, d, team = 'blue') => {
  const s = sprites[anim]?.[d]; const f = new Px(cw, ch);
  if (!s) return f;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (((x - ox) / 9) ** 2 + ((y - oy) / 3) ** 2 <= 1) f.set(x, y, '#0000004a'); // ground shadow
  f.blit(team === 'red' ? toRed(s.p) : s.p, ox - s.anchor[0], oy - s.anchor[1]);
  return f;
};
fs.mkdirSync(out + 'gif', { recursive: true });
for (const team of TEAMS) {
  const sheet = new Px(cw, ch * anims.length * 8);
  anims.forEach((a, ai) => GAME_DIRS.forEach((d, di) => sheet.blit(frameOf(a, d, team), 0, (ai * 8 + di) * ch)));
  savePng(sheet, `${out}${unit}${team === 'red' ? '-do' : ''}.png`);
}
const atlas = fs.existsSync(out + 'atlas.json') ? JSON.parse(fs.readFileSync(out + 'atlas.json', 'utf8')) : {};
atlas[unit] = { size: [cw, ch], anchor: [ox, oy], dirs: GAME_DIRS, states: Object.fromEntries(anims.map((a, i) => [a, { row: i * 8, frames: 1 }])), source: file.split('/').pop(), artScale: +F.toFixed(2), teamRecolor: !NO_TEAM };
fs.writeFileSync(out + 'atlas.json', JSON.stringify(atlas, null, 1));
// review board: rows = animations, columns = sheet direction order, blue then red
{
  const S2 = 3, board = new Px(cw * 8 * S2 + 16, (ch * anims.length * TEAMS.length) * S2 + 16, '#232733');
  TEAMS.forEach((team, t) => anims.forEach((a, ai) => SHEET_DIRS.forEach((d, c) => board.blit(frameOf(a, d, team).scaled(S2), 8 + c * cw * S2, 8 + (t * anims.length + ai) * ch * S2))));
  savePng(board, `${out}${unit}-xem.png`);
}
// GIFs: 8 directions, each animation shown as a short pose sequence (one key pose per animation for now)
const seq = { walk: ['idle', 'walk', 'idle', 'walk'], attack: ['idle', 'attack', 'attack', 'idle'], victory: ['idle', 'victory', 'victory'], death: ['hit', 'death', 'death', 'death'] };
for (const [name, list] of Object.entries(seq)) {
  const fr = list.filter((a) => sprites[a]).map((a) => { const g = new Px(cw * 4, ch * 2); GAME_DIRS.forEach((d, i) => g.blit(frameOf(a, d), (i % 4) * cw, Math.floor(i / 4) * ch)); return g; });
  if (fr.length) saveGif(fr, `${out}gif/${unit}-${name}.gif`, { delay: 30, scale: 2 });
}
console.log(`cell ${cw}×${ch}, anchor ${ox},${oy}, anims: ${anims.join(', ')} → ${out}`);

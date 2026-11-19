// Import a hero skill effect sheet (docs/design/samples/army/prompts/skills/*.md): 8 frames per row on magenta.
// Rows are found by the empty magenta bands between them; each row is cut in 8 equal columns. JPEG-safe magenta keying
// (Telegram photos), the pinkish fringe left by the compression is dropped next to the background.
// Usage: node tools/spriteimport/fx.mjs <in.png> <hero id> [rows]  → client/assets/fx/<hero id>.png + fx/dir.json entry
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const [, , file, name, wantRows] = process.argv;
const OUT = new URL('../../client/assets/fx/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const img = readPng(file), W = img.w, H = img.h, COLS = 8, CW = Math.floor(W / COLS);
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
// background: close to pure magenta
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 175 && b > 175 && g < 100 && Math.abs(r - b) < 70; };
// pink fringe (magenta mixed into the effect by JPEG / scaling): only removed when it touches the background
const isPink = (v) => { const [r, g, b] = rgb(v); return r > 150 && b > 140 && g < 0.72 * Math.min(r, b) && r > b - 60; };
const bg = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) bg[i] = isBg(img.d[i]) ? 1 : 0;
for (let pass = 0; pass < 2; pass++) {
  const nb = bg.slice();
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (bg[i]) continue; if ((bg[i - 1] || bg[i + 1] || bg[i - W] || bg[i + W]) && isPink(img.d[i])) nb[i] = 1; }
  bg.set(nb);
}
// speckles: lone pixels with ≤1 solid neighbour
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (bg[i]) continue; let n = 0; for (const k of [i - 1, i + 1, i - W, i + W, i - W - 1, i - W + 1, i + W - 1, i + W + 1]) if (!bg[k]) n++; if (n <= 1) bg[i] = 1; }
// rows: bands of solid pixels separated by (almost) empty lines
const cnt = new Int32Array(H); for (let y = 0; y < H; y++) { let n = 0; for (let x = 0; x < W; x++) if (!bg[y * W + x]) n++; cnt[y] = n; }
let bands = [], y0 = -1;
for (let y = 0; y <= H; y++) { const on = y < H && cnt[y] > 2; if (on && y0 < 0) y0 = y; if (!on && y0 >= 0) { bands.push([y0, y]); y0 = -1; } }
// merge bands split by a short gap (sparkles above a frame)
const merged = [];
for (const b of bands) { const l = merged[merged.length - 1]; if (l && b[0] - l[1] < 10) l[1] = b[1]; else merged.push([...b]); }
bands = merged.filter(([a, b]) => b - a >= 12);
if (wantRows && bands.length !== +wantRows) {
  // too many: merge the smallest gaps until the count matches
  while (bands.length > +wantRows) { let bi = 1, bg2 = 1e9; for (let k = 1; k < bands.length; k++) { const g = bands[k][0] - bands[k - 1][1]; if (g < bg2) { bg2 = g; bi = k; } } bands[bi - 1][1] = bands[bi][1]; bands.splice(bi, 1); }
}
// too few (an effect crossing the gap, e.g. a falling meteor): split the tallest band at its emptiest line
while (wantRows && bands.length < +wantRows) {
  let bi = 0; for (let k = 1; k < bands.length; k++) if (bands[k][1] - bands[k][0] > bands[bi][1] - bands[bi][0]) bi = k;
  const [a, b] = bands[bi], lo = a + Math.floor((b - a) * 0.2), hi = b - Math.floor((b - a) * 0.2); let cy = lo;
  for (let y = lo; y < hi; y++) if (cnt[y] < cnt[cy]) cy = y;
  bands.splice(bi, 1, [a, cy], [cy + 1, b]);
}
const PAD = 2, rows = bands.map(([a, b]) => [Math.max(0, a - PAD), Math.min(H, b + PAD)]);
const outH = rows.reduce((s, [a, b]) => s + (b - a), 0), o = new Px(CW * COLS, outH);
const meta = { w: CW, rows: [] };
let oy = 0;
for (const [a, b] of rows) {
  for (let y = a; y < b; y++) for (let x = 0; x < CW * COLS; x++) { const i = y * W + x; if (!bg[i]) o.d[(oy + y - a) * o.w + x] = img.d[i] | 255; }
  meta.rows.push([oy, b - a]); oy += b - a;
}
savePng(o, OUT + name + '.png');
const dj = OUT + 'dir.json', dir = fs.existsSync(dj) ? JSON.parse(fs.readFileSync(dj, 'utf8')) : {};
dir[name] = { ...meta, v: Date.now() % 1e7 };
fs.writeFileSync(dj, JSON.stringify(dir));
console.log(name, `${o.w}×${o.h}`, 'rows', meta.rows.map(([y, h]) => h).join(','));

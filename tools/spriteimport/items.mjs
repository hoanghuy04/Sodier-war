// Import the hand-drawn equipment icon sheet (docs/design/samples/items/): 6 columns (weapon, helmet, armor, boots,
// ring, amulet) × 5 rows (common … legendary) on magenta → client/assets/items/items.png (48 px cells, same layout).
// Usage: node tools/spriteimport/items.mjs <sheet.png> [outName=items] [cols=6] [rows=5] [cell=48]
// (also used for the 7 resource icons: … tai-nguyen.png res 7 1 32)
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const [, , FILE, NAME = 'items', COLS = '6', ROWS = '5', CELLA = '48'] = process.argv;
const NC = +COLS, NR = +ROWS, CELL = +CELLA, FIT = Math.round(CELL * 0.92);
const OUT = new URL('../../client/assets/items/', import.meta.url).pathname;
const img = readPng(FILE);
const { w: W, h: H } = img;
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 120 && b > 120 && g < 0.62 * Math.min(r, b) && Math.abs(r - b) < 110; };
const solid = new Uint8Array(W * H).fill(1);
{
  const q = [], push = (i) => { if (solid[i] && isBg(img.d[i])) { solid[i] = 0; q.push(i); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W); }
}
// enclosed holes (inside a ring, between legs…) that are still pure background magenta
for (let i = 0; i < W * H; i++) { const [r, g, b] = rgb(img.d[i]); if (r > 205 && b > 205 && g < 80) solid[i] = 0; }
// rows / columns: the drawing is a regular grid, so cut it into equal cells
// (JPG noise can bridge two rows: raise the "row has ink" threshold until the expected number of rows shows up)
const rowN = Array.from({ length: H }, (_, y) => { let n = 0; for (let x = 0; x < W; x++) n += solid[y * W + x]; return n; });
let bands = [];
for (const th of [2, 8, 15, 25, 40]) {
  bands = [];
  for (let y = 0; y < H; y++) if (rowN[y] > th) { const s = y; while (y < H && rowN[y] > th) y++; if (y - s > 10) bands.push([s, y - 1]); }
  if (bands.length === NR) break;
}
if (bands.length !== NR) { // JPG noise can join the rows: the sheet is a regular grid, so cut it into equal rows instead
  console.warn(`expected ${NR} rows, found ${bands.length}: using equal rows`);
  bands.length = 0; for (let r = 0; r < NR; r++) bands.push([Math.floor((r * H) / NR), Math.floor(((r + 1) * H) / NR) - 1]);
}
function shrink([x0, y0, x1, y1], k) {
  const fw = Math.max(1, Math.round((x1 - x0 + 1) * k)), fh = Math.max(1, Math.round((y1 - y0 + 1) * k)), out = new Px(fw, fh);
  for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
    const sx0 = Math.floor(x0 + tx / k), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / k)), sy0 = Math.floor(y0 + ty / k), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / k));
    let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
    for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) { n++; const i = y * W + x; if (!solid[i]) continue; s++; const [R, G, B] = rgb(img.d[i]); r += R; g += G; b += B; if (R + G + B < 150) dark++; }
    if (!n || s / n < 0.45) continue;
    if (dark / s > 0.5) { out.set(tx, ty, '#1b1726'); continue; }
    const q = (v) => Math.min(255, Math.round(v / s / 8) * 8);
    out.d[ty * fw + tx] = ((q(r) << 24) | (q(g) << 16) | (q(b) << 8) | 255) >>> 0;
  }
  return out;
}
const sheet = new Px(CELL * NC, CELL * NR);
bands.forEach(([y0, y1], row) => {
  const cw = W / NC;
  for (let col = 0; col < NC; col++) {
    const cx0 = Math.floor(col * cw), cx1 = Math.floor((col + 1) * cw) - 1;
    let a = 1e9, b = 1e9, c = -1, d = -1;
    for (let y = y0; y <= y1; y++) for (let x = cx0; x <= cx1; x++) if (solid[y * W + x]) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
    if (c < 0) continue;
    const k = FIT / Math.max(c - a + 1, d - b + 1), icon = shrink([a, b, c, d], k);
    sheet.blit(icon, col * CELL + Math.floor((CELL - icon.w) / 2), row * CELL + Math.floor((CELL - icon.h) / 2));
  }
});
fs.mkdirSync(OUT, { recursive: true });
savePng(sheet, OUT + NAME + '.png');
console.log(`${NAME}: ${NC}×${NR} icons`, CELL + 'px');

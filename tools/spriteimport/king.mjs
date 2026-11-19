// Import the Northern King's palace (one image on magenta, docs/design/samples/buildings/prompts/09-nha-vua.md)
// → client/assets/buildings/nha-vua.png + its atlas.json entry (anchor = middle of the front edge of the footprint).
// Usage: node tools/spriteimport/king.mjs <sheet.png> [targetWidth=256] [name=nha-vua]   (nu-hoang: the Desert Queen, 13/11/2026)
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const [, , file, wArg, nameArg] = process.argv;
const NAME = nameArg ?? 'nha-vua';
const TARGET_W = +(wArg ?? 256), OUT = new URL('../../client/assets/buildings/', import.meta.url).pathname;
const img = readPng(file), W = img.w, H = img.h;
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 120 && b > 120 && g < 0.62 * Math.min(r, b) && Math.abs(r - b) < 110; };
const m = new Uint8Array(W * H).fill(1), q = [];
const push = (i) => { if (m[i] && isBg(img.d[i])) { m[i] = 0; q.push(i); } };
for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W); }
let x0 = W, y0 = H, x1 = -1, y1 = -1;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (m[y * W + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
const k = TARGET_W / (x1 - x0 + 1), fw = Math.round((x1 - x0 + 1) * k), fh = Math.round((y1 - y0 + 1) * k), o = new Px(fw, fh);
for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
  const sx0 = Math.floor(x0 + tx / k), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / k)), sy0 = Math.floor(y0 + ty / k), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / k));
  let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
  for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) {
    n++; if (!m[y * W + x]) continue;
    const [R, G, B] = rgb(img.d[y * W + x]);
    if (R > 130 && B > 110 && G < 0.7 * Math.min(R, B)) continue; // magenta JPEG fringe
    s++; r += R; g += G; b += B; if (R + G + B < 150) dark++;
  }
  if (!n || s / n < 0.45) continue;
  if (dark / s > 0.5) { o.set(tx, ty, '#1b1726'); continue; }
  const qn = (v) => Math.min(255, Math.round(v / s / 8) * 8);
  o.d[ty * fw + tx] = ((qn(r) << 24) | (qn(g) << 16) | (qn(b) << 8) | 255) >>> 0;
}
savePng(o, OUT + NAME + '.png');
const A = JSON.parse(fs.readFileSync(OUT + 'atlas.json', 'utf8'));
A[NAME] = { size: [fw, fh], anchor: [Math.round(fw / 2), fh - 4], rows: { lv1: 0 }, tiles: 8, source: 'import' };
fs.writeFileSync(OUT + 'atlas.json', JSON.stringify(A));
console.log(NAME, fw, '×', fh);

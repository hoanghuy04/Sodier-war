// Import the builder worker sheets (docs/design/samples/clearing/):
//   tho-xay-di.png  : 8 direction columns (S, SE, E, NE, N, NW, W, SW) × 3 rows (idle, walk A, walk B)
//   tho-xay-lam.png : 4 frame columns × 3 rows (chop, mine, hammer), facing right
// → client/assets/builder/builder.png + builder.json { walk: {DIR: [idle, walkA, walkB]}, work: {chop|mine|build: [f1..f4]} }
// every frame = [x, y, w, h, ax, ay] (ax, ay = feet point inside the frame).
// Usage: node tools/spriteimport/builder.mjs <walk.png> <work.png> [targetHeight=30]
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const [, , WALK, WORK, HT = '30'] = process.argv;
const OUT = new URL('../../client/assets/builder/', import.meta.url).pathname;
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 120 && b > 120 && g < 0.62 * Math.min(r, b) && Math.abs(r - b) < 110; };

/** cut a grid sheet into cells: { img, mask, box } per cell (background flooded from each cell border) */
function cells(file, cols, rows) {
  const img = readPng(file), W = img.w, H = img.h, out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x0 = Math.round((c * W) / cols), x1 = Math.round(((c + 1) * W) / cols) - 1, y0 = Math.round((r * H) / rows), y1 = Math.round(((r + 1) * H) / rows) - 1;
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1, m = new Uint8Array(cw * ch).fill(1), q = [];
    const at = (x, y) => img.d[(y0 + y) * W + x0 + x];
    const push = (i) => { if (m[i] && isBg(at(i % cw, (i / cw) | 0))) { m[i] = 0; q.push(i); } };
    for (let x = 0; x < cw; x++) { push(x); push((ch - 1) * cw + x); }
    for (let y = 0; y < ch; y++) { push(y * cw); push(y * cw + cw - 1); }
    while (q.length) { const i = q.pop(), x = i % cw, y = (i / cw) | 0; if (x > 0) push(i - 1); if (x < cw - 1) push(i + 1); if (y > 0) push(i - cw); if (y < ch - 1) push(i + cw); }
    for (let i = 0; i < cw * ch; i++) { const [R, G, B] = rgb(at(i % cw, (i / cw) | 0)); if (R > 205 && B > 205 && G < 80) m[i] = 0; }
    // drop specks: keep pixels with ≥3 solid neighbours
    const k = m.slice();
    for (let y = 1; y < ch - 1; y++) for (let x = 1; x < cw - 1; x++) { const i = y * cw + x; if (!m[i]) continue; let n = 0; for (let j = -1; j <= 1; j++) for (let l = -1; l <= 1; l++) n += m[i + j * cw + l]; if (n < 4) k[i] = 0; }
    let a = 1e9, b = 1e9, cc = -1, d = -1;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (k[y * cw + x]) { a = Math.min(a, x); b = Math.min(b, y); cc = Math.max(cc, x); d = Math.max(d, y); }
    // feet: centre of the solid pixels in the lowest 8 % of the sprite
    let fx = 0, fn = 0; const fy0 = d - Math.max(2, Math.round((d - b) * 0.08));
    for (let y = fy0; y <= d; y++) for (let x = a; x <= cc; x++) if (k[y * cw + x]) { fx += x; fn++; }
    out.push({ at, mask: k, cw, box: [a, b, cc, d], feet: [fn ? fx / fn : (a + cc) / 2, d] });
  }
  return out;
}
function shrink(cell, k) {
  const [x0, y0, x1, y1] = cell.box, fw = Math.max(1, Math.round((x1 - x0 + 1) * k)), fh = Math.max(1, Math.round((y1 - y0 + 1) * k)), out = new Px(fw, fh);
  for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
    const sx0 = Math.floor(x0 + tx / k), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / k)), sy0 = Math.floor(y0 + ty / k), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / k));
    let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
    for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) {
      n++; if (!cell.mask[y * cell.cw + x]) continue;
      s++; const [R, G, B] = rgb(cell.at(x, y)); r += R; g += G; b += B; if (R + G + B < 150) dark++;
    }
    if (!n || s / n < 0.45) continue;
    if (dark / s > 0.5) { out.set(tx, ty, '#1b1726'); continue; }
    const q = (v) => Math.min(255, Math.round(v / s / 8) * 8);
    out.d[ty * fw + tx] = ((q(r) << 24) | (q(g) << 16) | (q(b) << 8) | 255) >>> 0;
  }
  return { px: out, ax: Math.round((cell.feet[0] - x0) * k), ay: fh - 1 };
}
const walk = cells(WALK, 8, 3), work = cells(WORK, 4, 3);
// one scale for both sheets: the idle-facing-down builder is HT px tall
const ref = walk[0].box[3] - walk[0].box[1] + 1, k = +HT / ref;
// the work sheet may be drawn at another size: scale it so its body height (row 3, frame 4 = hammer at rest) matches
const workRef = work[11].box[3] - work[11].box[1] + 1, kw = (+HT * 1.05) / workRef;
const frames = [...walk.map((c) => shrink(c, k)), ...work.map((c) => shrink(c, kw))];
// pack in one row-major sheet
const cw = Math.max(...frames.map((f) => f.px.w)) + 1, chh = Math.max(...frames.map((f) => f.px.h)) + 1, PER = 12;
const sheet = new Px(cw * PER, chh * Math.ceil(frames.length / PER));
const rect = frames.map((f, i) => { const x = (i % PER) * cw, y = Math.floor(i / PER) * chh; sheet.blit(f.px, x, y); return [x, y, f.px.w, f.px.h, f.ax, f.ay]; });
const DIRS = ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW'];
const meta = { walk: {}, work: {} };
DIRS.forEach((d, c) => { meta.walk[d] = [0, 1, 2].map((r) => rect[r * 8 + c]); });
['chop', 'mine', 'build'].forEach((name, r) => { meta.work[name] = [0, 1, 2, 3].map((c) => rect[24 + r * 4 + c]); });
fs.mkdirSync(OUT, { recursive: true });
savePng(sheet, OUT + 'builder.png');
fs.writeFileSync(OUT + 'builder.json', JSON.stringify(meta));
console.log('builder: walk 8×3 + work 4×3, scale', k.toFixed(3), kw.toFixed(3), 'cell', cw, chh);

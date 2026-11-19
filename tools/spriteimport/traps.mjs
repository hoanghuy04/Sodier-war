// Import the hand-drawn trap sheet (docs/design/samples/buildings/sprite-pixels/bay.png): 3 columns (bomb, spring, air bomb)
// × 2 rows (armed, used) on magenta → client/assets/buildings/traps.png + traps.json { bom: [armed, used], ... }
// every frame = [x, y, w, h, ax, ay] (ax, ay = foot point). Usage: node tools/spriteimport/traps.mjs <sheet.png> [bombWidth=28]
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const [, , FILE, BW = '28'] = process.argv;
const OUT = new URL('../../client/assets/buildings/', import.meta.url).pathname;
const TYPES = ['bom', 'lo-xo', 'bom-khi'];
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 120 && b > 120 && g < 0.62 * Math.min(r, b) && Math.abs(r - b) < 110; };
const img = readPng(FILE), W = img.w, H = img.h;
const cells = [];
for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
  const x0 = Math.round((c * W) / 3), x1 = Math.round(((c + 1) * W) / 3) - 1, y0 = Math.round((r * H) / 2), y1 = Math.round(((r + 1) * H) / 2) - 1;
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, m = new Uint8Array(cw * ch).fill(1), q = [];
  const at = (x, y) => img.d[(y0 + y) * W + x0 + x];
  const push = (i) => { if (m[i] && isBg(at(i % cw, (i / cw) | 0))) { m[i] = 0; q.push(i); } };
  for (let x = 0; x < cw; x++) { push(x); push((ch - 1) * cw + x); }
  for (let y = 0; y < ch; y++) { push(y * cw); push(y * cw + cw - 1); }
  while (q.length) { const i = q.pop(), x = i % cw, y = (i / cw) | 0; if (x > 0) push(i - 1); if (x < cw - 1) push(i + 1); if (y > 0) push(i - cw); if (y < ch - 1) push(i + cw); }
  for (let i = 0; i < cw * ch; i++) { const [R, G, B] = rgb(at(i % cw, (i / cw) | 0)); if (R > 205 && B > 205 && G < 80) m[i] = 0; }
  const k = m.slice();
  for (let y = 1; y < ch - 1; y++) for (let x = 1; x < cw - 1; x++) { const i = y * cw + x; if (!m[i]) continue; let n = 0; for (let j = -1; j <= 1; j++) for (let l = -1; l <= 1; l++) n += m[i + j * cw + l]; if (n < 4) k[i] = 0; }
  let a = 1e9, b = 1e9, cc = -1, d = -1;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (k[y * cw + x]) { a = Math.min(a, x); b = Math.min(b, y); cc = Math.max(cc, x); d = Math.max(d, y); }
  cells.push({ at, mask: k, cw, box: [a, b, cc, d] });
}
function shrink(cell, f) {
  const [x0, y0, x1, y1] = cell.box, fw = Math.max(1, Math.round((x1 - x0 + 1) * f)), fh = Math.max(1, Math.round((y1 - y0 + 1) * f)), o = new Px(fw, fh);
  for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
    const sx0 = Math.floor(x0 + tx / f), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / f)), sy0 = Math.floor(y0 + ty / f), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / f));
    let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
    for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) {
      n++; if (!cell.mask[y * cell.cw + x]) continue;
      const [R, G, B] = rgb(cell.at(x, y)); if (R > 130 && B > 110 && G < 0.7 * Math.min(R, B)) continue;
      s++; r += R; g += G; b += B; if (R + G + B < 150) dark++;
    }
    if (!n || s / n < 0.45) continue;
    if (dark / s > 0.5) { o.set(tx, ty, '#1b1726'); continue; }
    const q = (v) => Math.min(255, Math.round(v / s / 8) * 8);
    o.d[ty * fw + tx] = ((q(r) << 24) | (q(g) << 16) | (q(b) << 8) | 255) >>> 0;
  }
  return o;
}
// one scale for the whole sheet: the armed bomb (with its dirt) is BW sprite px wide (a tile is 32)
const f = +BW / (cells[0].box[2] - cells[0].box[0] + 1);
const frames = cells.map((c) => shrink(c, f));
const cw = Math.max(...frames.map((p) => p.w)) + 1, ch = Math.max(...frames.map((p) => p.h)) + 1;
const sheet = new Px(cw * 3, ch * 2), meta = {};
frames.forEach((p, i) => { const c = i % 3, r = Math.floor(i / 3), x = c * cw, y = r * ch; sheet.blit(p, x, y); (meta[TYPES[c]] ??= [])[r] = [x, y, p.w, p.h, Math.round(p.w / 2), p.h - 1]; });
fs.mkdirSync(OUT, { recursive: true });
savePng(sheet, OUT + 'traps.png');
fs.writeFileSync(OUT + 'traps.json', JSON.stringify(meta));
console.log('traps: scale', f.toFixed(3), JSON.stringify(meta));

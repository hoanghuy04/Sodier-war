// Import a pet sheet (4 frames × N rows on magenta, any size, e.g. a Telegram JPG converted to PNG) → client/assets/pets/<id>.png
// with 128 px cells (normal form) or 256 px cells (battle form, -chien). Same scale and translation for every cell, so the
// bob / steps of the animation are kept. Usage: node tools/spriteimport/pet.mjs <sheet.png> <id> [cell=128] [rows=2]
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const [, , file, id, cellArg, rowsArg] = process.argv;
const CELL = +(cellArg ?? 128), ROWS = +(rowsArg ?? 2), COLS = 4, OUT = new URL('../../client/assets/pets/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const img = readPng(file), W = img.w, H = img.h, cw = W / COLS, ch = H / ROWS;
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 110 && b > 110 && g < 0.6 * Math.min(r, b); };
// background = magenta connected to the cell borders (so magenta-ish pixels inside the sprite survive)
const keep = new Uint8Array(W * H).fill(1);
for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < COLS; cx++) {
  const x0 = Math.round(cx * cw), y0 = Math.round(cy * ch), x1 = Math.round((cx + 1) * cw), y1 = Math.round((cy + 1) * ch), q = [];
  const push = (x, y) => { const i = y * W + x; if (keep[i] && isBg(img.d[i])) { keep[i] = 0; q.push(i); } };
  for (let x = x0; x < x1; x++) { push(x, y0); push(x, y1 - 1); } for (let y = y0; y < y1; y++) { push(x0, y); push(x1 - 1, y); }
  while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; if (x > x0) push(x - 1, y); if (x < x1 - 1) push(x + 1, y); if (y > y0) push(x, y - 1); if (y < y1 - 1) push(x, y + 1); }
}
// bounding boxes in cell coordinates
let bw = 0, bh = 0, minTop = Infinity, maxBot = -Infinity, cxSum = 0, n = 0; const boxes = [];
for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < COLS; cx++) {
  let a = Infinity, b = Infinity, c = -1, d = -1;
  for (let y = Math.round(cy * ch); y < Math.round((cy + 1) * ch); y++) for (let x = Math.round(cx * cw); x < Math.round((cx + 1) * cw); x++) if (keep[y * W + x]) { const lx = x - cx * cw, ly = y - cy * ch; a = Math.min(a, lx); c = Math.max(c, lx); b = Math.min(b, ly); d = Math.max(d, ly); }
  if (c < 0) continue;
  boxes.push([a, c]); bw = Math.max(bw, c - a + 1); bh = Math.max(bh, d - b + 1); minTop = Math.min(minTop, b); maxBot = Math.max(maxBot, d); cxSum += (a + c) / 2; n++;
}
const midX = cxSum / n, base = CELL - Math.round(CELL * 0.08);
// one scale for every cell, small enough that EVERY frame fits around the shared centre / baseline (13/11/2026: frames
// leaning to one side ran out of the cell and were cut off)
const half = Math.max(...boxes.map(([a, c]) => Math.max(midX - a, c - midX + 1)));
const k = Math.min((CELL * 0.86) / Math.max(bw, maxBot - minTop + 1), (CELL / 2 - 2) / half, (base - 2) / (maxBot - minTop + 1));
const o = new Px(CELL * COLS, CELL * ROWS);
for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < COLS; cx++) for (let ty = 0; ty < CELL; ty++) for (let tx = 0; tx < CELL; tx++) {
  // output pixel → source rectangle (area average of the kept pixels)
  const lx0 = midX + (tx - CELL / 2) / k, lx1 = midX + (tx + 1 - CELL / 2) / k, ly0 = maxBot + (ty - base) / k, ly1 = maxBot + (ty + 1 - base) / k;
  let s = 0, m = 0, r = 0, g = 0, bb = 0, dark = 0;
  for (let y = Math.floor(ly0); y < Math.max(Math.floor(ly0) + 1, Math.floor(ly1)); y++) for (let x = Math.floor(lx0); x < Math.max(Math.floor(lx0) + 1, Math.floor(lx1)); x++) {
    if (x < 0 || y < 0 || x >= cw || y >= ch) { m++; continue; }
    const gx = Math.round(cx * cw + x), gy = Math.round(cy * ch + y); if (gx >= W || gy >= H) { m++; continue; }
    m++; const i = gy * W + gx; if (!keep[i]) continue;
    const [R, G, B] = rgb(img.d[i]); if (R > 150 && B > 130 && G < 0.7 * Math.min(R, B)) continue; // magenta JPEG fringe
    s++; r += R; g += G; bb += B; if (R + G + B < 150) dark++;
  }
  if (!m || s / m < 0.45) continue;
  if (dark / s > 0.5) { o.set(cx * CELL + tx, cy * CELL + ty, '#1b1726'); continue; }
  const qn = (v) => Math.min(255, Math.round(v / s / 4) * 4);
  o.d[(cy * CELL + ty) * o.w + cx * CELL + tx] = ((qn(r) << 24) | (qn(g) << 16) | (qn(bb) << 8) | 255) >>> 0;
}
savePng(o, OUT + id + '.png');
console.log(id, `${o.w}×${o.h}`, 'scale', k.toFixed(3));

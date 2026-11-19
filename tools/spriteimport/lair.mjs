// Import a boss lair picture (docs/design/samples/army/prompts/bosses/21-hang-boss.md): magenta background removed
// (connected to the border), stray bits of neighbouring pictures dropped (only the biggest piece is kept), cropped.
// Usage: node tools/spriteimport/lair.mjs <in.png> <out name>   → client/assets/lairs/<out name>.png
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const [, , file, name] = process.argv;
const OUT = new URL('../../client/assets/lairs/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const img = readPng(file), W = img.w, H = img.h;
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 110 && b > 110 && g < 0.6 * Math.min(r, b); };
// background = magenta reachable from the border
const keep = new Uint8Array(W * H).fill(1), q = [];
const push = (i) => { if (keep[i] && isBg(img.d[i])) { keep[i] = 0; q.push(i); } };
for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); } for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W); }
// pieces: keep the biggest (8-neighbour), drop the rest
const lab = new Int32Array(W * H).fill(-1), sizes = [], edge = [];
for (let i = 0; i < W * H; i++) {
  if (!keep[i] || lab[i] >= 0) continue;
  const id = sizes.length, st = [i]; lab[i] = id; let n = 0, e = false;
  while (st.length) { const j = st.pop(); n++; const x = j % W, y = (j / W) | 0; if (x === 0 || y === 0 || x === W - 1 || y === H - 1) e = true;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const k = ny * W + nx; if (keep[k] && lab[k] < 0) { lab[k] = id; st.push(k); } } }
  sizes.push(n); edge.push(e);
}
const big = sizes.indexOf(Math.max(...sizes));
// keep the lair and its loose bits (smoke, floating shards); drop pieces touching the border (bits of the next picture)
const ok = sizes.map((n, k) => k === big || (!edge[k] && n >= 12));
let x0 = W, y0 = H, x1 = -1, y1 = -1;
for (let i = 0; i < W * H; i++) if (lab[i] >= 0 && ok[lab[i]]) { const x = i % W, y = (i / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
const o = new Px(x1 - x0 + 1, y1 - y0 + 1);
for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
  const i = y * W + x; if (lab[i] < 0 || !ok[lab[i]]) continue;
  const [r, g, b] = rgb(img.d[i]), nearBg = (x > 0 && !keep[i - 1]) || (x < W - 1 && !keep[i + 1]) || (y > 0 && !keep[i - W]) || (y < H - 1 && !keep[i + W]);
  if ((nearBg && r > 150 && b > 130 && g < 0.7 * Math.min(r, b)) || (r > 228 && b > 228 && g < 55 && Math.abs(r - b) < 30)) continue; // + pure magenta pockets enclosed by smoke etc. // magenta fringe (only on the edge: purple tar / crystals inside stay)
  o.d[(y - y0) * o.w + (x - x0)] = img.d[i] | 255;
}
savePng(o, OUT + name + '.png');
console.log(name, `${o.w}×${o.h}`, 'dropped pieces', ok.filter((v) => !v).length);

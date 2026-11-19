// Import ONE row of equipment icons whose pieces overlap in x (e.g. the black tier, docs/design/samples/items/prompt-trang-bi-den.md):
// the pieces are split by connected components instead of equal columns, then appended as a new row to items.png.
// Usage: node tools/spriteimport/itemrow.mjs <row.png> <count> [cell=48]
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const [, , FILE, COUNT, CELLA = '48'] = process.argv;
const N = +COUNT, CELL = +CELLA, FIT = Math.round(CELL * 0.92);
const OUT = new URL('../../client/assets/items/', import.meta.url).pathname;
const img = readPng(FILE), { w: W, h: H } = img;
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 120 && b > 120 && g < 0.62 * Math.min(r, b) && Math.abs(r - b) < 110; };
const solid = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) solid[i] = isBg(img.d[i]) ? 0 : 1;
// connected components (8-neighbour)
const lab = new Int32Array(W * H).fill(-1), comps = [];
for (let s = 0; s < W * H; s++) {
  if (!solid[s] || lab[s] >= 0) continue;
  const c = { id: comps.length, px: [], x0: W, y0: H, x1: 0, y1: 0 }, q = [s]; lab[s] = c.id;
  while (q.length) {
    const i = q.pop(), x = i % W, y = (i / W) | 0; c.px.push(i);
    c.x0 = Math.min(c.x0, x); c.x1 = Math.max(c.x1, x); c.y0 = Math.min(c.y0, y); c.y1 = Math.max(c.y1, y);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx; if (solid[j] && lab[j] < 0) { lab[j] = c.id; q.push(j); }
    }
  }
  comps.push(c);
}
comps.sort((a, b) => b.px.length - a.px.length);
const big = comps.slice(0, N), small = comps.slice(N).filter((c) => c.px.length >= 6);
if (big.length < N || big[N - 1].px.length < 200) { console.error('expected', N, 'pieces, sizes', comps.slice(0, N + 2).map((c) => c.px.length)); process.exit(1); }
// small bits (sparkles, flames) join the nearest piece
const dist = (a, b) => Math.max(0, a.x0 - b.x1, b.x0 - a.x1) + Math.max(0, a.y0 - b.y1, b.y0 - a.y1);
for (const c of small) {
  const t = big.reduce((m, b) => (dist(c, b) < dist(c, m) ? b : m));
  if (dist(c, t) > 30) continue;
  t.px.push(...c.px); t.x0 = Math.min(t.x0, c.x0); t.x1 = Math.max(t.x1, c.x1); t.y0 = Math.min(t.y0, c.y0); t.y1 = Math.max(t.y1, c.y1);
}
big.sort((a, b) => a.x0 + a.x1 - (b.x0 + b.x1));
const row = new Px(CELL * N, CELL);
big.forEach((c, col) => {
  const mine = new Uint8Array(W * H); for (const i of c.px) mine[i] = 1;
  const k = FIT / Math.max(c.x1 - c.x0 + 1, c.y1 - c.y0 + 1);
  const fw = Math.max(1, Math.round((c.x1 - c.x0 + 1) * k)), fh = Math.max(1, Math.round((c.y1 - c.y0 + 1) * k)), o = new Px(fw, fh);
  for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
    const sx0 = Math.floor(c.x0 + tx / k), sx1 = Math.max(sx0 + 1, Math.floor(c.x0 + (tx + 1) / k)), sy0 = Math.floor(c.y0 + ty / k), sy1 = Math.max(sy0 + 1, Math.floor(c.y0 + (ty + 1) / k));
    let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
    for (let y = sy0; y < Math.min(sy1, c.y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, c.x1 + 1); x++) { n++; const i = y * W + x; if (!mine[i]) continue; s++; const [R, G, B] = rgb(img.d[i]); r += R; g += G; b += B; if (R + G + B < 60) dark++; }
    if (!n || s / n < 0.45) continue;
    if (dark / s > 0.6) { o.set(tx, ty, '#1b1726'); continue; }
    const q = (v) => Math.min(255, Math.round(v / s / 8) * 8);
    o.d[ty * fw + tx] = ((q(r) << 24) | (q(g) << 16) | (q(b) << 8) | 255) >>> 0;
  }
  row.blit(o, col * CELL + Math.floor((CELL - fw) / 2), Math.floor((CELL - fh) / 2));
});
// append under the existing sheet
const old = readPng(OUT + 'items.png'), sheet = new Px(Math.max(old.w, row.w), old.h + CELL);
for (let y = 0; y < old.h; y++) for (let x = 0; x < old.w; x++) sheet.d[y * sheet.w + x] = old.d[y * old.w + x];
for (let y = 0; y < CELL; y++) for (let x = 0; x < row.w; x++) sheet.d[(old.h + y) * sheet.w + x] = row.d[y * row.w + x];
savePng(sheet, OUT + 'items.png');
console.log(`items.png: +1 row of ${N} → ${sheet.w}×${sheet.h}`);

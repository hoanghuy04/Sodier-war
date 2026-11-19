// Import the hand-drawn mines sheet (docs/design/samples/mines/): one row of 7 cells
// (iron, coal, gold, oil, tar, crystal, diamond) on magenta → client/assets/mines/<type>.png (+ -own / -enemy / -hover
// outlines) and mines.json. Images are stored at 2× density; mines.json gives their size in world pixels (16 per tile).
// Usage: node tools/spriteimport/mines.mjs <sheet.png>
import fs from 'node:fs';
import { Px, savePng, outline } from '../mapgen/core.mjs';
import { OWN } from '../mapgen/scene.mjs';
import { readPng } from './png.mjs';

const TYPES = ['iron', 'coal', 'gold', 'oil', 'tar', 'crystal', 'diamond'];
const WORLD_W = { diamond: 68 }; // world px wide (3×3 mines ~54, the 4×4 temple ~68)
const OUT = new URL('../../client/assets/mines/', import.meta.url).pathname;
const img = readPng(process.argv[2]);
const { w: W, h: H } = img;
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 120 && b > 120 && g < 0.62 * Math.min(r, b) && Math.abs(r - b) < 110; };
// background flooded in from the border (magenta-like colours inside the drawing stay)
const solid = new Uint8Array(W * H).fill(1);
{
  const q = [], push = (i) => { if (solid[i] && isBg(img.d[i])) { solid[i] = 0; q.push(i); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W); }
}
// enclosed holes (inside a ring, between legs…) that are still pure background magenta
for (let i = 0; i < W * H; i++) { const [r, g, b] = rgb(img.d[i]); if (r > 205 && b > 205 && g < 80) solid[i] = 0; }
const colHas = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = 0; y < H; y++) n += solid[y * W + x]; return n > 3; });
const runs = [];
for (let x = 0; x < W; x++) if (colHas[x]) { const s = x; while (x < W && colHas[x]) x++; if (x - s > 20) runs.push([s, x - 1]); }
if (runs.length !== 7) { console.error('expected 7 mines, found', runs.length, runs); process.exit(1); }
function shrink([x0, y0, x1, y1], k) {
  const fw = Math.round((x1 - x0 + 1) * k), fh = Math.round((y1 - y0 + 1) * k), out = new Px(fw, fh);
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
fs.mkdirSync(OUT, { recursive: true });
const meta = {};
runs.forEach(([x0, x1], i) => {
  const t = TYPES[i];
  let y0 = H, y1 = 0; for (let y = 0; y < H; y++) for (let x = x0; x <= x1; x++) if (solid[y * W + x]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const ww = WORLD_W[t] ?? 54, k = (ww * 2) / (x1 - x0 + 1);
  const art = shrink([x0, y0, x1, y1], k);
  savePng(art, `${OUT}${t}.png`);
  savePng(outline(art, OWN.own[0], OWN.own[1], 4), `${OUT}${t}-own.png`);
  savePng(outline(art, OWN.enemy[0], OWN.enemy[1], 4), `${OUT}${t}-enemy.png`);
  savePng(outline(art, '#ffffff', '#9a9a9a', 4), `${OUT}${t}-hover.png`);
  const w = art.w / 2, h = art.h / 2, big = t === 'diamond';
  const cx = big ? 0 : 8, bottom = big ? 48 : 32;
  meta[t] = { w, h, dx: Math.round(cx - w / 2), dy: Math.round(bottom - h), hd: 2 };
  console.log(t, `${art.w}×${art.h}`);
});
fs.writeFileSync(OUT + 'mines.json', JSON.stringify(meta));

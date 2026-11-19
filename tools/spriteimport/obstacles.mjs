// Import the hand-drawn map obstacles (docs/design/samples/clearing/sprite-pixels/chuong-ngai-*.png) into the map art:
// trees / rocks used by tools/mapgen/scene.mjs instead of the procedural ones → tools/mapgen/obstacles/{obstacles.png, obstacles.json}.
// Every sheet: rows of sprites on magenta. Rows with 5 sprites = oak, pine, snowy pine, palm, dead tree (3 variants per sheet);
// a row with 9 sprites = small oak, small pine, small snowy pine, flowering cactus, charred tree, cactus, grey, red, snowy boulder.
// Usage: node tools/spriteimport/obstacles.mjs <sheet.png> [<sheet2.png> …]
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const OUT = new URL('../mapgen/obstacles/', import.meta.url).pathname;
// sprite height in map pixels (16 per tile) of a full-size sprite of each kind (row 1 of a sheet)
const TARGET = { oak: 30, pine: 30, snowpine: 30, palm: 30, dead: 27, charred: 26, cactus: 21, rockGrey: 15, rockRed: 17, rockSnow: 15 };
const ROW5 = ['oak', 'pine', 'snowpine', 'palm', 'dead'];
const ROW9 = ['oak', 'pine', 'snowpine', 'cactus', 'charred', 'cactus', 'rockGrey', 'rockRed', 'rockSnow'];
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 120 && b > 120 && g < 0.62 * Math.min(r, b) && Math.abs(r - b) < 110; };

const out = {}; // kind → [Px]
for (const file of process.argv.slice(2)) {
  const img = readPng(file), W = img.w, H = img.h, m = new Uint8Array(W * H).fill(1), q = [];
  const push = (i) => { if (m[i] && isBg(img.d[i])) { m[i] = 0; q.push(i); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W); }
  for (let i = 0; i < W * H; i++) { const [R, G, B] = rgb(img.d[i]); if (R > 205 && B > 205 && G < 80) m[i] = 0; }
  const k = m.slice();
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (!m[i]) continue; let n = 0; for (let j = -1; j <= 1; j++) for (let l = -1; l <= 1; l++) n += m[i + j * W + l]; if (n < 4) k[i] = 0; }
  // horizontal bands, then sprites = runs of columns inside a band
  const rowHas = Array.from({ length: H }, (_, y) => { let n = 0; for (let x = 0; x < W; x++) n += k[y * W + x]; return n > 1; });
  const bands = [];
  for (let y = 0; y < H; y++) if (rowHas[y]) { const s = y; while (y < H && rowHas[y]) y++; if (y - s > 20) bands.push([s, y - 1]); }
  const scale = {}; // kind → scale from this sheet's first row
  for (const [by0, by1] of bands) {
    const colHas = Array.from({ length: W }, (_, x) => { for (let y = by0; y <= by1; y++) if (k[y * W + x]) return true; return false; });
    const runs = [];
    for (let x = 0; x < W; x++) if (colHas[x]) { const s = x; while (x < W && colHas[x]) x++; if (x - s > 12) runs.push([s, x - 1]); }
    const kinds = runs.length === 5 ? ROW5 : runs.length === 9 ? ROW9 : null;
    if (!kinds) { console.error(file, 'band', by0, by1, ': expected 5 or 9 sprites, found', runs.length); continue; }
    runs.forEach(([x0, x1], c) => {
      let y0 = 1e9, y1 = -1;
      for (let y = by0; y <= by1; y++) for (let x = x0; x <= x1; x++) if (k[y * W + x]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      const kind = kinds[c], h = y1 - y0 + 1;
      const f = scale[kind] ?? (scale[kind] = TARGET[kind] / h); // later rows keep the first row's scale: smaller variants stay smaller
      (out[kind] ??= []).push(shrink(img, k, W, [x0, y0, x1, y1], f));
    });
  }
}
function shrink(img, mask, W, [x0, y0, x1, y1], k) {
  const fw = Math.max(1, Math.round((x1 - x0 + 1) * k)), fh = Math.max(1, Math.round((y1 - y0 + 1) * k)), o = new Px(fw, fh);
  for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
    const sx0 = Math.floor(x0 + tx / k), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / k)), sy0 = Math.floor(y0 + ty / k), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / k));
    let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
    for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) {
      n++; if (!mask[y * W + x]) continue;
      const [R, G, B] = rgb(img.d[y * W + x]);
      if (R > 130 && B > 110 && G < 0.7 * Math.min(R, B)) continue; // magenta fringe from the JPEG: not part of the sprite
      s++; r += R; g += G; b += B; if (R + G + B < 150) dark++;
    }
    if (!n || s / n < 0.45) continue;
    if (dark / s > 0.5) { o.set(tx, ty, '#1b1726'); continue; }
    const q = (v) => Math.min(255, Math.round(v / s / 8) * 8);
    o.d[ty * fw + tx] = ((q(r) << 24) | (q(g) << 16) | (q(b) << 8) | 255) >>> 0;
  }
  return o;
}
// pack: one row per kind
const kinds = Object.keys(out), cw = Math.max(...kinds.flatMap((kd) => out[kd].map((p) => p.w))) + 1, ch = Math.max(...kinds.flatMap((kd) => out[kd].map((p) => p.h))) + 1;
const ncol = Math.max(...kinds.map((kd) => out[kd].length));
const sheet = new Px(cw * ncol, ch * kinds.length), meta = {};
kinds.forEach((kd, r) => { meta[kd] = out[kd].map((p, c) => { sheet.blit(p, c * cw, r * ch); return [c * cw, r * ch, p.w, p.h]; }); });
fs.mkdirSync(OUT, { recursive: true });
savePng(sheet, OUT + 'obstacles.png');
fs.writeFileSync(OUT + 'obstacles.json', JSON.stringify(meta));
console.log(Object.entries(meta).map(([kd, l]) => `${kd} ${l.length}`).join(', '));

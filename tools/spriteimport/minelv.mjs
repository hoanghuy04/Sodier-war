// Import the mine upgrade art (docs/design/samples/mines/prompt-mo-cap.md): one sheet on magenta with the 7 mines × levels 2..5,
// read left to right, top to bottom (iron 2..5, coal 2..5, gold, oil, tar, crystal, diamond)
// → client/assets/mines/<type>-l<lv>.png (+ -own / -enemy / -hover outlines), merged into mines.json.
// Usage: node tools/spriteimport/minelv.mjs <sheet.png>
import fs from 'node:fs';
import { Px, savePng, outline } from '../mapgen/core.mjs';
import { OWN } from '../mapgen/scene.mjs';
import { readPng } from './png.mjs';

const TYPES = ['iron', 'coal', 'gold', 'oil', 'tar', 'crystal', 'diamond'];
const WORLD_W = { diamond: 68 };
const OUT = new URL('../../client/assets/mines/', import.meta.url).pathname;
const img = readPng(process.argv[2]), { w: W, h: H } = img;
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 190 && b > 170 && g < 110 && g < 0.5 * Math.min(r, b) && Math.abs(r - b) < 70; }; // strict: purple crystals are not background
const solid = new Uint8Array(W * H).fill(1);
{
  const q = [], push = (i) => { if (solid[i] && isBg(img.d[i])) { solid[i] = 0; q.push(i); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W); }
}
for (let i = 0; i < W * H; i++) { const [r, g, b] = rgb(img.d[i]); if (r > 205 && b > 205 && g < 80) solid[i] = 0; }
// horizontal bands, then sprites = runs of columns inside each band
const rowHas = Array.from({ length: H }, (_, y) => { let n = 0; for (let x = 0; x < W; x++) n += solid[y * W + x]; return n > 3; });
const bands = [];
for (let y = 0; y < H; y++) if (rowHas[y]) { const s = y; while (y < H && rowHas[y]) y++; if (y - s > 30) bands.push([s, y - 1]); }
const boxes = [];
for (const [by0, by1] of bands) {
  const colHas = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = by0; y <= by1; y++) n += solid[y * W + x]; return n > 3; });
  for (let x = 0; x < W; x++) if (colHas[x]) {
    const s = x; while (x < W && colHas[x]) x++; if (x - s <= 20) continue;
    let y0 = H, y1 = 0; for (let y = by0; y <= by1; y++) for (let xx = s; xx < x; xx++) if (solid[y * W + xx]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    boxes.push([s, y0, x - 1, y1]);
  }
}
if (boxes.length !== 28) { console.error('expected 28 mines (7 × levels 2..5), found', boxes.length, bands); process.exit(1); }
function shrink([x0, y0, x1, y1], k, purple = false) {
  const fw = Math.round((x1 - x0 + 1) * k), fh = Math.round((y1 - y0 + 1) * k), out = new Px(fw, fh);
  for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
    const sx0 = Math.floor(x0 + tx / k), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / k)), sy0 = Math.floor(y0 + ty / k), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / k));
    let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
    for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) {
      n++; const i = y * W + x; if (!solid[i]) continue;
      const [R, G, B] = rgb(img.d[i]); if (R > (purple ? 200 : 130) && B > (purple ? 180 : 110) && G < (purple ? 0.45 : 0.7) * Math.min(R, B) && Math.abs(R - B) < (purple ? 60 : 255)) continue; // magenta JPEG fringe
      s++; r += R; g += G; b += B; if (R + G + B < 150) dark++;
    }
    if (!n || s / n < 0.45) continue;
    if (dark / s > 0.5) { out.set(tx, ty, '#1b1726'); continue; }
    const q = (v) => Math.min(255, Math.round(v / s / 8) * 8);
    out.d[ty * fw + tx] = ((q(r) << 24) | (q(g) << 16) | (q(b) << 8) | 255) >>> 0;
  }
  return out;
}
const meta = JSON.parse(fs.readFileSync(OUT + 'mines.json', 'utf8'));
boxes.forEach((bx, i) => {
  const t = TYPES[Math.floor(i / 4)], lv = 2 + (i % 4), id = `${t}-l${lv}`;
  // as tall as the level-1 mine (they are drawn wider), never more than 25 % wider than it
  const L1 = meta[t], bw = bx[2] - bx[0] + 1, bh = bx[3] - bx[1] + 1;
  const k = Math.min((L1.h * 2) / bh, (L1.w * 2 * 1.25) / bw);
  const art = shrink(bx, k, t === 'crystal' || t === 'tar');
  // pink JPEG fringe on the outer edge: strongly magenta pixels touching transparency go (purple crystals are less saturated)
  for (let pass = 0; pass < 2; pass++) {
    const kill = [];
    for (let y = 0; y < art.h; y++) for (let x = 0; x < art.w; x++) {
      const v = art.d[y * art.w + x]; if (!(v & 255)) continue;
      const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const X = x + dx, Y = y + dy; return X < 0 || Y < 0 || X >= art.w || Y >= art.h || !(art.d[Y * art.w + X] & 255); });
      if (!edge) continue;
      const [R, G, B] = rgb(v); if (R > 120 && B > 100 && G < 0.42 * Math.min(R, B)) kill.push(y * art.w + x);
    }
    for (const i of kill) art.d[i] = 0;
  }
  savePng(art, `${OUT}${id}.png`);
  savePng(outline(art, OWN.own[0], OWN.own[1], 4), `${OUT}${id}-own.png`);
  savePng(outline(art, OWN.enemy[0], OWN.enemy[1], 4), `${OUT}${id}-enemy.png`);
  savePng(outline(art, '#ffffff', '#9a9a9a', 4), `${OUT}${id}-hover.png`);
  const w = art.w / 2, h = art.h / 2, big = t === 'diamond', cx = big ? 0 : 8, bottom = big ? 48 : 32;
  meta[id] = { w, h, dx: Math.round(cx - w / 2), dy: Math.round(bottom - h), hd: 2 };
});
fs.writeFileSync(OUT + 'mines.json', JSON.stringify(meta));
console.log('mine levels:', boxes.length, 'sprites');

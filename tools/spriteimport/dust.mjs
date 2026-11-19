// Import the 7 powder pouches (docs/design/samples/items/prompts/bot.md): one row on magenta, white → red
// → client/assets/items/dust.png (7 cells of 40 px, same order as TIERS). Usage: node tools/spriteimport/dust.mjs <sheet.png>
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';
const OUT = new URL('../../client/assets/items/', import.meta.url).pathname, S = 40;
const img = readPng(process.argv[2]), W = img.w, H = img.h;
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 190 && b > 170 && g < 110 && Math.abs(r - b) < 70; };
const fg = (x, y) => !isBg(img.d[y * W + x]);
const cols = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = 0; y < H; y++) n += fg(x, y); return n > 3; });
const runs = []; for (let x = 0; x < W; x++) if (cols[x]) { const s = x; while (x < W && cols[x]) x++; if (x - s > 20) runs.push([s, x - 1]); }
if (runs.length !== 7) { console.error('expected 7 pouches, found', runs.length); process.exit(1); }
const sheet = new Px(S * 7, S);
runs.forEach(([x0, x1], i) => {
  let y0 = H, y1 = 0; for (let y = 0; y < H; y++) for (let x = x0; x <= x1; x++) if (fg(x, y)) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const k = (S - 2) / Math.max(x1 - x0 + 1, y1 - y0 + 1), fw = Math.round((x1 - x0 + 1) * k), fh = Math.round((y1 - y0 + 1) * k), o = new Px(fw, fh);
  for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
    const sx0 = Math.floor(x0 + tx / k), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / k)), sy0 = Math.floor(y0 + ty / k), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / k));
    let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
    for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) { n++; if (!fg(x, y)) continue; const [R, G, B] = rgb(img.d[y * W + x]); s++; r += R; g += G; b += B; if (R + G + B < 150) dark++; }
    if (!n || s / n < 0.45) continue;
    if (dark / s > 0.5) { o.set(tx, ty, '#1b1726'); continue; }
    const q = (v) => Math.min(255, Math.round(v / s / 8) * 8);
    o.d[ty * fw + tx] = ((q(r) << 24) | (q(g) << 16) | (q(b) << 8) | 255) >>> 0;
  }
  sheet.blit(o, i * S + ((S - fw) >> 1), S - fh - 1);
});
savePng(sheet, OUT + 'dust.png');
console.log('dust icons 7');

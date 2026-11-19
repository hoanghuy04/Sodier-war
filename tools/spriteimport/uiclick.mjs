// Import the cursor + click-marker sheet (docs/design/samples/ui/prompts/01-chuot-va-hieu-ung-click.md):
// row 1 = 4 cursors (move, move pressed, attack, attack pressed); rows 2-3 = 8 frames of the green (move) and red (attack)
// click marker, the click point at the centre of each cell. Frames 6-8 fade into the background in the drawing, so only
// frames 1-5 are kept (the game fades frame 5 itself).
// → client/assets/ui/cursor-*.png (32 px, hotspot top-left) + click.png / click.json { move: [...], attack: [...] }
// Usage: node tools/spriteimport/uiclick.mjs <sheet.png>
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const OUT = new URL('../../client/assets/ui/', import.meta.url).pathname;
const img = readPng(process.argv[2]), W = img.w, H = img.h;
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 190 && b > 170 && g < 110 && Math.abs(r - b) < 70; };
const fg = (x, y) => !isBg(img.d[y * W + x]);
const rowHas = Array.from({ length: H }, (_, y) => { let n = 0; for (let x = 0; x < W; x++) n += fg(x, y); return n > 2; });
const bands = []; for (let y = 0; y < H; y++) if (rowHas[y]) { const s = y; while (y < H && rowHas[y]) y++; if (y - s > 12) bands.push([s, y - 1]); }
if (bands.length !== 3) { console.error('expected 3 rows, found', bands.length, bands); process.exit(1); }
function crop(x0, y0, x1, y1) { // tight box of the foreground in this area
  let a = x1, b = y1, c = x0, d = y0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (fg(x, y)) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  return [a, b, c, d];
}
function shrink([x0, y0, x1, y1], k) {
  const fw = Math.max(1, Math.round((x1 - x0 + 1) * k)), fh = Math.max(1, Math.round((y1 - y0 + 1) * k)), o = new Px(fw, fh);
  for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
    const sx0 = Math.floor(x0 + tx / k), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / k)), sy0 = Math.floor(y0 + ty / k), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / k));
    let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
    for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) { n++; if (!fg(x, y)) continue; const [R, G, B] = rgb(img.d[y * W + x]); s++; r += R; g += G; b += B; if (R + G + B < 150) dark++; }
    if (!n || s / n < 0.4) continue;
    if (dark / s > 0.5) { o.set(tx, ty, '#1b1726'); continue; }
    const q = (v) => Math.min(255, Math.round(v / s / 8) * 8);
    o.d[ty * fw + tx] = ((q(r) << 24) | (q(g) << 16) | (q(b) << 8) | 255) >>> 0;
  }
  return o;
}
// ---- cursors: 4 sprites in row 1, each scaled to 32 px tall, hotspot = the tip (top-left of the sprite)
{
  const [y0, y1] = bands[0], cols = Array.from({ length: W }, (_, x) => { for (let y = y0; y <= y1; y++) if (fg(x, y)) return true; return false; });
  const runs = []; for (let x = 0; x < W; x++) if (cols[x]) { const s = x; while (x < W && cols[x]) x++; if (x - s > 12) runs.push([s, x - 1]); }
  ['move', 'move-down', 'attack', 'attack-down'].forEach((n, i) => { const bx = crop(runs[i][0], y0, runs[i][1], y1); savePng(shrink(bx, 28 / (bx[3] - bx[1] + 1)), `${OUT}cursor-${n}.png`); });
}
// ---- click markers: 8 cells per row, keep frames 1-5; anchor = the cell centre (the click point)
const cellW = W / 8, K = 0.24, frames = { move: [], attack: [] };
[['move', bands[1]], ['attack', bands[2]]].forEach(([n, [y0, y1]]) => {
  const cy = (y0 + y1) / 2;
  for (let c = 0; c < 5; c++) {
    const bx = crop(Math.round(c * cellW), y0, Math.round((c + 1) * cellW) - 1, y1), p = shrink(bx, K);
    frames[n].push({ p, ax: Math.round(((c + 0.5) * cellW - bx[0]) * K), ay: Math.round((cy - bx[1]) * K) });
  }
});
const all = [...frames.move, ...frames.attack], cw = Math.max(...all.map((f) => f.p.w)) + 1, ch = Math.max(...all.map((f) => f.p.h)) + 1;
const sheet = new Px(cw * 5, ch * 2), meta = {};
['move', 'attack'].forEach((n, r) => { meta[n] = frames[n].map((f, c) => { sheet.blit(f.p, c * cw, r * ch); return [c * cw, r * ch, f.p.w, f.p.h, f.ax, f.ay]; }); });
savePng(sheet, OUT + 'click.png');
fs.writeFileSync(OUT + 'click.json', JSON.stringify(meta));
console.log('cursors 4, click frames', meta.move.length, meta.attack.length);

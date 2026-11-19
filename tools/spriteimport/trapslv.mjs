// Import the trap level sheets (docs/design/samples/buildings/prompts/07-bay-cap.md): one sheet per trap, 6 sprites in a row
// (level 1..5, used) on magenta → client/assets/buildings/traps.png + traps.json { bom: [lv1, used, lv2, lv3, lv4, lv5], … }
// (index 0 = armed level 1, 1 = used, as the old sheet; 2..5 = levels 2..5). Frame = [x, y, w, h, ax, ay].
// Usage: node tools/spriteimport/trapslv.mjs <bom.png> <lo-xo.png> <bom-khi.png>
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const OUT = new URL('../../client/assets/buildings/', import.meta.url).pathname;
const TYPES = ['bom', 'lo-xo', 'bom-khi'], L1W = { bom: 28, 'lo-xo': 26, 'bom-khi': 20 }; // level-1 width in sprite px (a tile is 32)
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 190 && b > 170 && g < 110 && g < 0.5 * Math.min(r, b) && Math.abs(r - b) < 70; };
const frames = {};
process.argv.slice(2).forEach((file, t) => {
  const img = readPng(file), W = img.w, H = img.h, m = new Uint8Array(W * H).fill(1), q = [];
  const push = (i) => { if (m[i] && isBg(img.d[i])) { m[i] = 0; q.push(i); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W); }
  const colHas = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = 0; y < H; y++) n += m[y * W + x]; return n > 3; });
  const runs = [];
  for (let x = 0; x < W; x++) if (colHas[x]) { const s = x; while (x < W && colHas[x]) x++; if (x - s > 15) runs.push([s, x - 1]); }
  if (runs.length !== 6) { console.error(file, ': expected 6 sprites, found', runs.length); process.exit(1); }
  const boxes = runs.map(([x0, x1]) => { let y0 = H, y1 = 0; for (let y = 0; y < H; y++) for (let x = x0; x <= x1; x++) if (m[y * W + x]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; });
  const f = L1W[TYPES[t]] / (boxes[0][2] - boxes[0][0] + 1); // one scale per sheet: level 5 stays bigger than level 1
  const shrink = ([x0, y0, x1, y1]) => {
    const fw = Math.max(1, Math.round((x1 - x0 + 1) * f)), fh = Math.max(1, Math.round((y1 - y0 + 1) * f)), o = new Px(fw, fh);
    for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
      const sx0 = Math.floor(x0 + tx / f), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / f)), sy0 = Math.floor(y0 + ty / f), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / f));
      let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
      for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) {
        n++; const i = y * W + x; if (!m[i]) continue;
        const [R, G, B] = rgb(img.d[i]); if (R > 190 && B > 170 && G < 0.45 * Math.min(R, B)) continue; // magenta fringe
        s++; r += R; g += G; b += B; if (R + G + B < 150) dark++;
      }
      if (!n || s / n < 0.45) continue;
      if (dark / s > 0.5) { o.set(tx, ty, '#1b1726'); continue; }
      const qn = (v) => Math.min(255, Math.round(v / s / 8) * 8);
      o.d[ty * fw + tx] = ((qn(r) << 24) | (qn(g) << 16) | (qn(b) << 8) | 255) >>> 0;
    }
    return o;
  };
  const sp = boxes.map(shrink); // lv1..lv5, used
  frames[TYPES[t]] = [sp[0], sp[5], sp[1], sp[2], sp[3], sp[4]];
});
const all = Object.values(frames).flat(), cw = Math.max(...all.map((p) => p.w)) + 1, ch = Math.max(...all.map((p) => p.h)) + 1;
const sheet = new Px(cw * 6, ch * TYPES.length), meta = {};
TYPES.forEach((t, r) => { meta[t] = frames[t].map((p, c) => { sheet.blit(p, c * cw, r * ch); return [c * cw, r * ch, p.w, p.h, Math.round(p.w / 2), p.h - 1]; }); });
savePng(sheet, OUT + 'traps.png');
fs.writeFileSync(OUT + 'traps.json', JSON.stringify(meta));
console.log('trap levels:', Object.entries(meta).map(([t, l]) => `${t} ${l.length}`).join(', '));

// Import the decoration sheets (docs/design/samples/buildings/prompts/14-trang-tri.md, 20 pieces drawn on magenta in 8
// pictures of 2–3) → client/assets/buildings/deco.png + deco.json { type: [x, y, w, h, ax, ay] } (anchor = bottom centre).
// Decorations are drawn SMALL (12/11/2026: "càng nhỏ càng tốt"): 1×1 pieces fit 24×34 sprite px, 2×2 pieces 42×50 (a tile is 32).
// Usage: node tools/spriteimport/deco.mjs <dir with 1.png … 8.png>
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const OUT = new URL('../../client/assets/buildings/', import.meta.url).pathname;
// picture → pieces left to right
const PICS = [
  ['tt-duoc', 'tt-co', 'tt-den'], ['tt-bui-hoa', 'tt-chau-cay'],
  ['tt-thung', 'tt-hinh-nom', 'tt-gia-vu-khi'], ['tt-lua-trai', 'tt-cot-da'],
  ['tt-dai-phun', 'tt-tuong-anh-hung', 'tt-anh-dao'], ['tt-cong-hoa', 'tt-luong-hoa'],
  ['tt-tuong-rong', 'tt-ao-ca', 'tt-bia'], ['tt-den-pha-le', 'tt-leu'],
];
const BIG = new Set(['tt-dai-phun', 'tt-tuong-anh-hung', 'tt-anh-dao', 'tt-cong-hoa', 'tt-luong-hoa', 'tt-tuong-rong', 'tt-ao-ca', 'tt-bia', 'tt-den-pha-le', 'tt-leu']);
const BOX = { small: [24, 34], big: [42, 50] };
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const magenta = (R, G, B) => R > 170 && B > 150 && G < 0.55 * Math.min(R, B);
const isBg = (v) => { const [r, g, b] = rgb(v); return magenta(r, g, b); };
const dir = process.argv[2];
const frames = {};
PICS.forEach((names, k) => {
  const img = readPng(`${dir}/${k + 1}.png`), W = img.w, H = img.h, m = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) m[i] = isBg(img.d[i]) ? 0 : 1; // JPG: every magenta-ish pixel is background (also inside arches)
  const colHas = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = 0; y < H; y++) n += m[y * W + x]; return n > 4; });
  let runs = [];
  for (let x = 0; x < W; x++) if (colHas[x]) { const s = x; while (x < W && colHas[x]) x++; runs.push([s, x - 1]); }
  // merge runs separated by tiny gaps (petals, sparkles), keep the wide ones
  const merged = [];
  for (const r of runs) { const last = merged[merged.length - 1]; if (last && r[0] - last[1] < 12) last[1] = r[1]; else merged.push([...r]); }
  runs = merged.filter(([a, b]) => b - a > 30);
  if (runs.length !== names.length) { console.error(`${k + 1}.png: expected ${names.length} pieces, found ${runs.length}`, runs); process.exit(1); }
  runs.forEach(([x0, x1], j) => {
    let y0 = H, y1 = 0; for (let y = 0; y < H; y++) for (let x = x0; x <= x1; x++) if (m[y * W + x]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const [bw, bh] = BIG.has(names[j]) ? BOX.big : BOX.small, f = Math.min(bw / (x1 - x0 + 1), bh / (y1 - y0 + 1));
    const fw = Math.max(1, Math.round((x1 - x0 + 1) * f)), fh = Math.max(1, Math.round((y1 - y0 + 1) * f)), o = new Px(fw, fh);
    for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
      const sx0 = Math.floor(x0 + tx / f), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / f)), sy0 = Math.floor(y0 + ty / f), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / f));
      let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
      for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) {
        n++; const i = y * W + x; if (!m[i]) continue;
        const [R, G, B] = rgb(img.d[i]); s++; r += R; g += G; b += B; if (R + G + B < 150) dark++;
      }
      if (!n || s / n < 0.45) continue;
      if (dark / s > 0.5) { o.set(tx, ty, '#1b1726'); continue; }
      const qn = (v) => Math.min(255, Math.round(v / s / 8) * 8);
      o.d[ty * fw + tx] = ((qn(r) << 24) | (qn(g) << 16) | (qn(b) << 8) | 255) >>> 0;
    }
    frames[names[j]] = o;
  });
});
const list = Object.entries(frames), cols = 10, cw = Math.max(...list.map(([, p]) => p.w)) + 1, ch = Math.max(...list.map(([, p]) => p.h)) + 1;
const sheet = new Px(cw * cols, ch * Math.ceil(list.length / cols)), meta = {};
list.forEach(([t, p], i) => { const x = (i % cols) * cw, y = Math.floor(i / cols) * ch; sheet.blit(p, x, y); meta[t] = [x, y, p.w, p.h, Math.round(p.w / 2), p.h - 1]; });
savePng(sheet, OUT + 'deco.png');
fs.writeFileSync(OUT + 'deco.json', JSON.stringify(meta));
console.log('decorations:', list.map(([t, p]) => `${t} ${p.w}×${p.h}`).join(', '));

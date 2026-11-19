// Import a pet's 8-direction animation sheets (docs/design/samples/pets/prompts: 2 forms × 30 frames × 8 directions).
// Usage: node tools/spriteimport/pet8.mjs <folder with the PNG sheets> <pet id>
// Each sheet: 8 rows (directions: down, down-right, right, up-right, up, up-left, left, down-left) × N frame columns,
// magenta background, any cell size. The animation is recognised from the file name (idle / walk / run / attack …).
// Output: client/assets/pets/<id>/<anim>.png (8 rows × N cells of 128 px for the small form, 192 px for the battle form)
// and the frame counts in client/assets/pets/dir.json, which the client reads to pick these sheets over the old ones.
import fs from 'node:fs';
import path from 'node:path';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const [, , dir, id] = process.argv;
if (!dir || !id) { console.error('usage: pet8.mjs <folder> <pet id>'); process.exit(1); }
const ROOT = new URL('../../client/assets/pets/', import.meta.url).pathname;
// [anim key, frames, form] by file-name keyword (battle files contain "chien")
const SMALL = [['transform', 'bien-hinh', 6], ['idle', 'dung', 4], ['walk', 'di', 6], ['hit', 'trung', 2], ['happy', 'vui', 6], ['rest', 'nghi', 6]];
const BIG = [['idle', 'chien-dung', 4], ['run', 'chien-chay', 6], ['attack', 'chien-danh', 6], ['hit', 'chien-trung', 2], ['skill', 'chieu', 6], ['defeat', 'chien-guc', 6]];
const CELL = { small: 128, big: 192 };
const { PETS } = await import('../../shared/balance.js');
const FLY = !!PETS[id]?.fight?.fly;

const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.png$/i.test(f)) files.push(p); } })(dir);
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 110 && b > 110 && g < 0.6 * Math.min(r, b); };
const manifest = fs.existsSync(ROOT + 'dir.json') ? JSON.parse(fs.readFileSync(ROOT + 'dir.json')) : {};
const out = { small: {}, big: {} };
fs.mkdirSync(ROOT + id, { recursive: true });

for (const file of files) {
  const name = path.basename(file).toLowerCase();
  if (/tong-quan|overview/.test(name)) continue; // the step-1 design sheet
  const form = /chien|battle/.test(name.replace(/transform/, '')) ? 'big' : 'small';
  const hit = (form === 'big' ? BIG : SMALL).find(([kw]) => name.includes(kw));
  if (!hit) { console.log('skip (unknown animation):', name); continue; }
  const [, key] = hit, ROWS = 8, OC = CELL[form];
  const img = readPng(file), W = img.w, H = img.h, cols = +(process.env.COLS ?? 0) || Math.max(1, Math.round(W / (H / ROWS))), cw = W / cols, ch = H / ROWS; // COLS=n for non-square cells // square cells: the frame count follows the width (1 = a 'Bước 1' pose)
  // background = magenta connected to the cell borders (magenta-ish pixels inside the sprite survive)
  const keep = new Uint8Array(W * H).fill(1);
  for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < cols; cx++) {
    const x0 = Math.round(cx * cw), y0 = Math.round(cy * ch), x1 = Math.round((cx + 1) * cw), y1 = Math.round((cy + 1) * ch), q = [];
    const push = (x, y) => { const i = y * W + x; if (keep[i] && isBg(img.d[i])) { keep[i] = 0; q.push(i); } };
    for (let x = x0; x < x1; x++) { push(x, y0); push(x, y1 - 1); } for (let y = y0; y < y1; y++) { push(x0, y); push(x1 - 1, y); }
    while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; if (x > x0) push(x - 1, y); if (x < x1 - 1) push(x + 1, y); if (y > y0) push(x, y - 1); if (y < y1 - 1) push(x, y + 1); }
  }
  // each source cell → one OC×OC cell (area average of the kept pixels; keeps the artist's framing and baseline)
  // square cells: the whole cell → OC×OC. Wide cells (a row is short): the row height → 0.9 × OC, the output cells as
  // wide as needed so wings are not cut (the client reads the cell width from the sheet)
  const sq = Math.abs(cw - ch) < 0.15 * ch, k = sq ? OC / Math.max(cw, ch) : (OC * 0.9) / ch, OW = sq ? OC : Math.ceil(cw * k);
  const o = new Px(OW * cols, OC * ROWS);
  for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < cols; cx++) for (let ty = 0; ty < OC; ty++) for (let tx = 0; tx < OW; tx++) {
    const sx0 = cx * cw + (tx - OW / 2) / k + cw / 2, sy0 = cy * ch + (ty - OC) / k + ch, sx1 = sx0 + 1 / k, sy1 = sy0 + 1 / k;
    let s = 0, m = 0, r = 0, g = 0, b = 0;
    for (let y = Math.floor(sy0); y < Math.max(Math.floor(sy0) + 1, Math.floor(sy1)); y++) for (let x = Math.floor(sx0); x < Math.max(Math.floor(sx0) + 1, Math.floor(sx1)); x++) {
      m++; if (x < cx * cw || y < cy * ch || x >= (cx + 1) * cw || y >= (cy + 1) * ch || x >= W || y >= H) continue;
      const i = y * W + x; if (!keep[i]) continue;
      const [R, G, B] = rgb(img.d[i]); if (R > 150 && B > 130 && G < 0.7 * Math.min(R, B)) continue; // magenta fringe
      s++; r += R; g += G; b += B;
    }
    if (!m || s / m < 0.45) continue;
    const qn = (v) => Math.min(255, Math.round(v / s / 8) * 8); // fewer colours: much smaller PNGs
    o.d[(cy * OC + ty) * o.w + cx * OW + tx] = ((qn(r) << 24) | (qn(g) << 16) | (qn(b) << 8) | 255) >>> 0;
  }
  // drop specks: in each cell keep only the pieces of at least 6 % of the biggest one (bits of the next row's sprite)
  for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < cols; cx++) {
    const x0 = cx * OW, y0 = cy * OC, lab = new Int32Array(OW * OC).fill(-1), sizes = [];
    for (let i = 0; i < OW * OC; i++) {
      if (lab[i] >= 0 || !(o.d[(y0 + ((i / OW) | 0)) * o.w + x0 + (i % OW)] & 255)) continue;
      const id2 = sizes.length, st = [i]; lab[i] = id2; let n = 0;
      while (st.length) { const j = st.pop(); n++; const x = j % OW, y = (j / OW) | 0;
        for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) { if (nx < 0 || ny < 0 || nx >= OW || ny >= OC) continue; const q = ny * OW + nx; if (lab[q] < 0 && o.d[(y0 + ny) * o.w + x0 + nx] & 255) { lab[q] = id2; st.push(q); } } }
      sizes.push(n);
    }
    const big = Math.max(0, ...sizes);
    for (let i = 0; i < OW * OC; i++) if (lab[i] >= 0 && sizes[lab[i]] < big * 0.06) o.d[(y0 + ((i / OW) | 0)) * o.w + x0 + (i % OW)] = 0;
  }
  // flying pets: every frame centred on the same point (the artist's frames bob up and down a lot; the game adds its own
  // gentle hover), so switching frames or sheets never jerks (13/11/2026)
  if (FLY) for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < cols; cx++) {
    let a = 1e9, b = 1e9, c = -1, d = -1; const x0 = cx * OW, y0 = cy * OC;
    for (let y = 0; y < OC; y++) for (let x = 0; x < OW; x++) if (o.d[(y0 + y) * o.w + x0 + x] & 255) { a = Math.min(a, x); c = Math.max(c, x); b = Math.min(b, y); d = Math.max(d, y); }
    if (c < 0) continue;
    const dx = Math.round(OW / 2 - (a + c) / 2), dy = Math.round(OC * 0.55 - (b + d) / 2), tmp = new Uint32Array(OW * OC);
    for (let y = 0; y < OC; y++) for (let x = 0; x < OW; x++) { const sx = x - dx, sy = y - dy; if (sx >= 0 && sy >= 0 && sx < OW && sy < OC) tmp[y * OW + x] = o.d[(y0 + sy) * o.w + x0 + sx]; }
    for (let y = 0; y < OC; y++) for (let x = 0; x < OW; x++) o.d[(y0 + y) * o.w + x0 + x] = tmp[y * OW + x];
  }
  savePng(o, `${ROOT}${id}/${key}.png`);
  out[form][key] = cols;
  console.log(id, form, key.padEnd(12), `${cols}×8`, `${o.w}×${o.h}`, `from ${W}×${H}`);
}
manifest[id] = { ...(manifest[id] ?? {}), v: Date.now() % 1e9, cell: CELL, small: { ...(manifest[id]?.small ?? {}), ...out.small }, big: { ...(manifest[id]?.big ?? {}), ...out.big } };
fs.writeFileSync(ROOT + 'dir.json', JSON.stringify(manifest, null, 1));
console.log('dir.json updated:', id, JSON.stringify(manifest[id]));

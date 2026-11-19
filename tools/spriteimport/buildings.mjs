// Import a hand-drawn / AI building sheet (docs/design/samples/buildings/): one row of 6 cells = level 1..5 + ruin
// on a magenta background → client/assets/buildings/<type>.png (rows: lv1..5, ruin) + its atlas.json entry.
// Usage: node tools/spriteimport/buildings.mjs <sheet.png|jpg> <type> [targetWidth]
// PNG is read directly; JPG (Telegram photos) is decoded with a headless Chromium (playwright-core).
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const [, , file, type, wArg] = process.argv;
const TILES = { tuong: 1, 'thanh-tri': 3, 'hoi-thanh': 3, 'nha-vua': 8, 'doanh-trai': 7, 'ruong-do': 2, 'lo-nghien': 2, 'lo-ren': 3, 'thap-cung': 2, 'phao-da': 2, 'thap-phep': 2, kho: 2, 'nha-tho-xay': 2, 'hoc-vien': 2 }[type];
if (!file || !TILES) { console.error('usage: buildings.mjs <sheet> <thanh-tri|thap-cung|phao-da|thap-phep|kho|tuong> [targetWidth]'); process.exit(1); }
const TARGET_W = +(wArg ?? TILES * 32 + 4); // sprite px; one map tile = 32 sprite px
const OUT = new URL('../../client/assets/buildings/', import.meta.url).pathname;

async function load(f) {
  if (/\.png$/i.test(f)) return readPng(f);
  const PW = '/home/huy/Main/unisage-web/node_modules/.pnpm/playwright-core@1.62.1/node_modules/playwright-core/index.mjs';
  const { chromium } = await import(PW);
  const b = await chromium.launch(), pg = await b.newPage();
  const data = fs.readFileSync(f).toString('base64');
  const r = await pg.evaluate(async (src) => {
    const i = new Image(); i.src = src; await i.decode();
    const c = document.createElement('canvas'); c.width = i.width; c.height = i.height;
    const x = c.getContext('2d'); x.drawImage(i, 0, 0);
    return { w: i.width, h: i.height, d: Array.from(x.getImageData(0, 0, i.width, i.height).data) };
  }, 'data:image/jpeg;base64,' + data);
  await b.close();
  const px = new Px(r.w, r.h);
  for (let k = 0; k < r.w * r.h; k++) px.d[k] = ((r.d[k * 4] << 24) | (r.d[k * 4 + 1] << 16) | (r.d[k * 4 + 2] << 8) | 255) >>> 0;
  return px;
}
const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
/** magenta background and its JPEG fringe */
const isBg = (v) => { const [r, g, b] = rgb(v); return r > 120 && b > 120 && g < 0.62 * Math.min(r, b) && Math.abs(r - b) < 110; };

const img = await load(file);
const { w: W, h: H } = img;
// background = magenta flooded in from the image border; magenta-like colours inside the outlines (glowing orbs,
// violet windows) are part of the drawing and stay
const solid = new Uint8Array(W * H).fill(1);
{
  const q = [];
  const push = (i) => { if (solid[i] && isBg(img.d[i])) { solid[i] = 0; q.push(i); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (q.length) {
    const i = q.pop(), x = i % W, y = (i / W) | 0;
    if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W);
  }
}
// drop tiny specks (JPEG noise): a solid pixel needs at least 3 solid neighbours
const clean = solid.slice();
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (!solid[i]) continue; let n = 0; for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) n += solid[i + j * W + k]; if (n < 4) clean[i] = 0; }
const bboxOf = (x0, x1, y0, y1) => { let a = 1e9, b = 1e9, c = -1, d = -1; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (clean[y * W + x]) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; };
/** downscale a source box by k (majority mask + average colour, dark blocks → outline) */
function shrink([x0, y0, x1, y1], k) {
  const fw = Math.max(1, Math.round((x1 - x0 + 1) * k)), fh = Math.max(1, Math.round((y1 - y0 + 1) * k)), out = new Px(fw, fh);
  for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
    const sx0 = Math.floor(x0 + tx / k), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / k)), sy0 = Math.floor(y0 + ty / k), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / k));
    let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
    for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) {
      n++; const i = y * W + x; if (!clean[i]) continue;
      s++; const [R, G, B] = rgb(img.d[i]); r += R; g += G; b += B; if (R + G + B < 150) dark++;
    }
    if (!n || s / n < 0.45) continue;
    if (dark / s > 0.5) { out.set(tx, ty, '#1b1726'); continue; }
    const q = (v) => Math.min(255, Math.round(v / s / 8) * 8);
    out.d[ty * fw + tx] = ((q(r) << 24) | (q(g) << 16) | (q(b) << 8) | 255) >>> 0;
  }
  return out;
}
if (type === 'tuong') {
  // 4 columns (pillar, join right, join down, rubble) × 5 rows (levels); every row is scaled so its pillar is 20 px wide
  const rowHas = Array.from({ length: H }, (_, y) => { let n = 0; for (let x = 0; x < W; x++) n += clean[y * W + x]; return n > 2; });
  const bands = [];
  for (let y = 0; y < H; y++) if (rowHas[y]) { const s0 = y; while (y < H && rowHas[y]) y++; if (y - s0 > 12) bands.push([s0, y - 1]); }
  if (bands.length !== 5) { console.error('expected 5 rows, found', bands.length); process.exit(1); }
  const PILLAR_W = +(wArg ?? 20), pieces = [];
  for (const [by0, by1] of bands) {
    const ch2 = Array.from({ length: W }, (_, x) => { for (let y = by0; y <= by1; y++) if (clean[y * W + x]) return true; return false; });
    const cols = [];
    for (let x = 0; x < W; x++) if (ch2[x]) { const s0 = x; while (x < W && ch2[x]) x++; if (x - s0 > 12) cols.push([s0, x - 1]); }
    if (cols.length !== 4) { console.error('expected 4 pieces in a row, found', cols.length); process.exit(1); }
    const boxes = cols.map(([x0, x1]) => bboxOf(x0, x1, by0, by1));
    const k = PILLAR_W / (boxes[0][2] - boxes[0][0] + 1);
    pieces.push(boxes.map((b) => shrink(b, k)));
  }
  const cw = Math.max(...pieces.flat().map((f) => f.w)) + 1, ch = Math.max(...pieces.flat().map((f) => f.h)) + 1;
  const sheet = new Px(cw * 4, ch * 5), rects = [];
  pieces.forEach((row, r) => { rects.push(row.map((f, c) => { sheet.blit(f, c * cw, r * ch); return [c * cw, r * ch, f.w, f.h]; })); });
  fs.mkdirSync(OUT, { recursive: true });
  savePng(sheet, `${OUT}tuong.png`);
  const atlasFile = OUT + 'atlas.json', atlas = fs.existsSync(atlasFile) ? JSON.parse(fs.readFileSync(atlasFile, 'utf8')) : {};
  atlas.tuong = { pieces: rects, tiles: 1, source: 'import' }; // pieces[level-1] = [pillar, right, down, rubble] as [x, y, w, h]
  fs.writeFileSync(atlasFile, JSON.stringify(atlas, null, 1));
  console.log('tuong: 5 levels × 4 pieces, pillar', PILLAR_W, 'px');
  process.exit(0);
}
// cells = runs of columns that contain sprite pixels
const colHas = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = 0; y < H; y++) n += clean[y * W + x]; return n > 2; });
const runs = [];
for (let x = 0; x < W; x++) if (colHas[x]) { const s = x; while (x < W && colHas[x]) x++; if (x - s > 12) runs.push([s, x - 1]); }
// a building without levels (Nhà thợ xây): 2 cells = building + ruin, used for every level
if (runs.length === 2) runs.splice(1, 0, runs[0], runs[0], runs[0], runs[0]);
if (runs.length !== 6) { console.error(`expected 6 (or 2) cells, found ${runs.length}:`, runs); process.exit(1); }
// one common scale from the level-1 width (all levels share the footprint)
const boxes = runs.map(([x0, x1]) => { let y0 = H, y1 = 0; for (let y = 0; y < H; y++) for (let x = x0; x <= x1; x++) if (clean[y * W + x]) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; });
const ref = Math.max(...boxes.slice(0, 5).map((b) => b[2] - b[0] + 1));
const k = TARGET_W / ref;
// downscale: each target pixel = majority mask + average colour of its solid source pixels
const frames = boxes.map(([x0, y0, x1, y1]) => {
  const fw = Math.ceil((x1 - x0 + 1) * k), fh = Math.ceil((y1 - y0 + 1) * k), out = new Px(fw, fh);
  for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
    const sx0 = Math.floor(x0 + tx / k), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / k)), sy0 = Math.floor(y0 + ty / k), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / k));
    let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
    for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) {
      n++; const i = y * W + x; if (!clean[i]) continue;
      s++; const [R, G, B] = rgb(img.d[i]); r += R; g += G; b += B; if (R + G + B < 150) dark++;
    }
    if (!n || s / n < 0.45) continue;
    // keep outlines crisp: a block that is mostly dark becomes the outline colour
    if (dark / s > 0.5) { out.set(tx, ty, '#1b1726'); continue; }
    const q = (v) => Math.min(255, Math.round(v / s / 8) * 8);
    out.d[ty * fw + tx] = ((q(r) << 24) | (q(g) << 16) | (q(b) << 8) | 255) >>> 0;
  }
  return out;
});
// sheet: one row per frame, bottoms aligned, centred
const cw = Math.max(...frames.map((f) => f.w)) + 2, ch = Math.max(...frames.map((f) => f.h)) + 2;
const sheet = new Px(cw, ch * 6);
frames.forEach((f, r) => sheet.blit(f, Math.floor((cw - f.w) / 2), r * ch + ch - 1 - f.h));
fs.mkdirSync(OUT, { recursive: true });
savePng(sheet, `${OUT}${type}.png`);
// the drawing code puts the anchor at 72 % of the footprint depth: the sprite bottom lands on the footprint's front edge
const atlasFile = OUT + 'atlas.json', atlas = fs.existsSync(atlasFile) ? JSON.parse(fs.readFileSync(atlasFile, 'utf8')) : {};
atlas[type] = { size: [cw, ch], anchor: [Math.round(cw / 2), Math.round(ch - 1 - 0.28 * TILES * 32)], rows: { lv1: 0, lv2: 1, lv3: 2, lv4: 3, lv5: 4, ruin: 5 }, tiles: TILES, source: 'import' };
fs.writeFileSync(atlasFile, JSON.stringify(atlas, null, 1));
console.log(`${type}: ${runs.length} cells, scale ${k.toFixed(3)}, cell ${cw}×${ch}`);

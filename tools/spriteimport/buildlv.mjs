// Add levels 6, 7, 8 to an imported building: the sheet is one row of 3 cells (lv6, lv7, lv8) on magenta.
// Rows 0..5 of client/assets/buildings/<type>.png (lv1..5, ruin) are kept as they are, lv6..8 become rows 6..8.
// Scale: every new frame gets the SAME footprint width as the existing lv5 frame (base = widest row span of the
// main part in its bottom 35 %); the new art may be taller. --common: one scale (widest new base → lv5 base). The cell grows if needed (old frames stay bottom-aligned, centred).
// Walls (tuong): 3 rows (lv6..8) × 4 cells [pillar, join right, join down, rubble], the same layout as tuong.jpg,
// scaled so the pillar is 20 px wide like levels 1..5, appended as pieces[5..7]. The sheet's cell 2 is
// pillar + wall + pillar: only the wall section between the pillars is kept as "join right" (see bridge();
// --full-join keeps the whole cell like levels 1..5 do). "join down" = cell 3 (a tall narrow pillar, like levels 1..5).
// Usage: node tools/spriteimport/buildlv.mjs <sheet.jpg|png> <type> [--common] [--base=N] [--height=F]   (re-running replaces rows 6..8)
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';
import { loadImage, closeBrowser, keyMagenta, shrinkBox, cellRuns, boxOf, baseWidth, backup, dropPinkSpecks } from './key.mjs';

const [, , file, type] = process.argv;
const TILES = { tuong: 1, 'thanh-tri': 3, 'hoi-thanh': 3, 'doanh-trai': 7, 'thap-cung': 2, 'phao-da': 2, 'thap-phep': 2, kho: 2, 'hoc-vien': 2, 'lo-ren': 3 }[type]; // hoc-vien, lo-ren: one picture for 6–8 (16/11/2026), tripled by tile3.mjs
if (!file || !TILES) { console.error('usage: buildlv.mjs <sheet> <thanh-tri|thap-cung|phao-da|thap-phep|kho|hoi-thanh|doanh-trai|tuong>'); process.exit(1); }
const OUT = new URL('../../client/assets/buildings/', import.meta.url).pathname;
const atlasFile = OUT + 'atlas.json', atlas = JSON.parse(fs.readFileSync(atlasFile, 'utf8'));
const old = atlas[type];
if (!old) { console.error('no atlas entry for', type); process.exit(1); }

const img = await loadImage(file); await closeBrowser();
const { w: W, h: H } = img;
const { mask } = keyMagenta(img, { pocket: 15 });
const prev = readPng(`${OUT}${type}.png`);
backup(`${OUT}${type}.png`); backup(atlasFile);

if (type === 'tuong') {
  // row bands (lv6, lv7, lv8), each with 4 pieces
  const rowHas = Array.from({ length: H }, (_, y) => { let n = 0; for (let x = 0; x < W; x++) n += mask[y * W + x]; return n > 2; });
  const bands = [];
  for (let y = 0; y < H; y++) if (rowHas[y]) { const s0 = y; while (y < H && rowHas[y]) y++; if (y - s0 > 40) bands.push([s0, y - 1]); }
  if (bands.length !== 3) { console.error('expected 3 rows, found', bands.length, bands); process.exit(1); }
  const PILLAR_W = 20, OV = 2, FULL_JOIN = process.argv.includes('--full-join'), pieces = [];
  for (const [by0, by1] of bands) {
    const cols = cellRuns(mask, W, H, by0, by1);
    if (cols.length !== 4) { console.error('expected 4 pieces in a row, found', cols.length, cols); process.exit(1); }
    const boxes = cols.map(([x0, x1]) => boxOf(mask, W, x0, x1, by0, by1));
    const k = PILLAR_W / (boxes[0][2] - boxes[0][0] + 1);
    const row = boxes.map((b) => dropPinkSpecks(shrinkBox(img, mask, b, k)));
    if (!FULL_JOIN) row[1] = bridge(boxes[1], row[0].h);
    pieces.push(row);
  }
  /**
   * "join right" = only the wall section between the two pillars of cell 2. The client draws this piece from the
   * pillar's left edge (x = 0) after the pillar, and the next pillar (32 px to the right) is drawn after it, so the
   * section goes to x = 20-OV .. 32+OV (transparent on the left) and never covers either pillar.
   * Cell 2 is scaled by its OWN pillar width (the AI drew it a bit smaller than cell 1).
   */
  function bridge([x0, y0, x1, y1], pillarH) {
    // top profile: first row of a ≥ 6 px vertical run (thin lightning arcs do not count)
    const top = [];
    for (let x = x0; x <= x1; x++) { let t = y1; for (let y = y0; y <= y1 - 5; y++) { let ok = 1; for (let q = 0; q < 6; q++) if (!mask[(y + q) * W + x]) { ok = 0; break; } if (ok) { t = y; break; } } top.push(t); }
    const n = top.length, mid = top.slice(Math.round(n * 0.35), Math.round(n * 0.65)).sort((a, b) => a - b), plateau = mid[mid.length >> 1];
    const peak = Math.min(...top), thr = plateau - 0.15 * (plateau - peak);
    let l = Math.round(n * 0.1); while (l < n / 2 && top[l] < thr) l++;
    let r = n - 1 - Math.round(n * 0.1); while (r > n / 2 && top[r] < thr) r--;
    // vertical scale: cell 2's pillars get the height of the cell-1 pillar (so the wall keeps its height relative to them)
    const ky = pillarH / (y1 - peak + 1), secW = r - l + 1, span = 32 - PILLAR_W + 2 * OV;
    // horizontal: same scale, unless the section would be narrower than the gap between two pillars (then stretch)
    const kx = Math.max(ky, span / secW);
    const sx0 = x0 + l + (secW - span / kx) / 2; // centre crop of the section (the wall pattern repeats)
    const out = new Px(PILLAR_W - OV + span, Math.round((y1 - peak + 1) * ky));
    // sample with separate x / y scales (majority mask + average colour like shrinkBox)
    for (let ty = 0; ty < out.h; ty++) for (let tx = 0; tx < span; tx++) {
      const ax = sx0 + tx / kx, bx = sx0 + (tx + 1) / kx, ay = peak + ty / ky, by = peak + (ty + 1) / ky;
      let m = 0, s2 = 0, R = 0, G = 0, B = 0, dark = 0;
      for (let y = Math.floor(ay); y < Math.max(Math.floor(ay) + 1, Math.floor(by)); y++) for (let x = Math.floor(ax); x < Math.max(Math.floor(ax) + 1, Math.floor(bx)); x++) {
        if (y > y1) continue; m++; const i = y * W + x; if (!mask[i]) continue;
        s2++; const v = img.d[i], rr = v >>> 24, gg = (v >>> 16) & 255, bb = (v >>> 8) & 255; R += rr; G += gg; B += bb; if (rr + gg + bb < 150) dark++;
      }
      if (!m || s2 / m < 0.45) continue;
      if (dark / s2 > 0.5) { out.set(PILLAR_W - OV + tx, ty, '#1b1726'); continue; }
      const q = (v) => Math.min(255, Math.round(v / s2 / 8) * 8);
      out.d[ty * out.w + PILLAR_W - OV + tx] = ((q(R) << 24) | (q(G) << 16) | (q(B) << 8) | 255) >>> 0;
    }
    keepBig(out);
    console.log(`  bridge: cell-2 pillar ${l}/${n - 1 - r} src px wide, section ${secW} src px → ${span} px (x ${kx.toFixed(3)}, y ${ky.toFixed(3)})`);
    return out;
  }
  /** keep the main part of a piece (drops loose lightning arcs above the wall) */
  function keepBig(p) {
    const lab = new Int32Array(p.w * p.h).fill(-1), sizes = [];
    for (let s0 = 0; s0 < p.w * p.h; s0++) {
      if (lab[s0] >= 0 || !(p.d[s0] & 255)) continue;
      const q = [s0]; lab[s0] = sizes.length;
      for (let k = 0; k < q.length; k++) { const i = q[k], x = i % p.w, y = (i / p.w) | 0; for (let j = -1; j <= 1; j++) for (let d = -1; d <= 1; d++) { const nx = x + d, ny = y + j, ni = ny * p.w + nx; if (nx >= 0 && ny >= 0 && nx < p.w && ny < p.h && lab[ni] < 0 && (p.d[ni] & 255)) { lab[ni] = sizes.length; q.push(ni); } } }
      sizes.push(q.length);
    }
    const big = Math.max(...sizes);
    for (let i = 0; i < p.w * p.h; i++) if (lab[i] >= 0 && sizes[lab[i]] < 0.25 * big) p.d[i] = 0;
  }
  // old rows keep their rects; the new rows go below them with their own cell size
  const oldRects = old.pieces.slice(0, 5), oldH = Math.max(...oldRects.flat().map((r) => r[1] + r[3])) + 1;
  const oldCw = oldRects[0][1][0]; // x of column 1
  const cw = Math.max(oldCw, ...pieces.flat().map((f) => f.w + 1)), ch = Math.max(...pieces.flat().map((f) => f.h + 1));
  const sheet = new Px(Math.max(oldCw * 4, cw * 4), oldH + ch * 3);
  for (let y = 0; y < Math.min(prev.h, oldH); y++) for (let x = 0; x < prev.w; x++) sheet.d[y * sheet.w + x] = prev.d[y * prev.w + x];
  const rects = oldRects.slice();
  pieces.forEach((row, r) => rects.push(row.map((f, c) => { const x = c * cw, y = oldH + r * ch; sheet.blit(f, x, y); return [x, y, f.w, f.h]; })));
  savePng(sheet, `${OUT}tuong.png`);
  atlas.tuong = { ...old, pieces: rects };
  fs.writeFileSync(atlasFile, JSON.stringify(atlas, null, 1));
  console.log('tuong: levels 6..8 appended as pieces[5..7]:', JSON.stringify(rects.slice(5)));
  process.exit(0);
}

// ---------- normal building ----------
const runs = cellRuns(mask, W, H);
if (runs.length !== 3) { console.error('expected 3 cells, found', runs.length, runs); process.exit(1); }
const boxes = runs.map(([x0, x1]) => boxOf(mask, W, x0, x1, 0, H - 1));
const [ocw, och] = old.size;
// existing lv5 frame (row 4) footprint, measured on its alpha
const lv5 = baseWidth((x, y) => (prev.get(x, 4 * och + y) & 255) > 0, 0, 0, ocw - 1, och - 1);
const bases = boxes.map((b) => baseWidth((x, y) => mask[y * W + x], ...b));
// every level keeps the lv5 footprint: each frame is scaled so its own base width = the lv5 base width
// (--common: one scale for all three, from the widest base, like buildings.mjs)
// --base=N: aim for another footprint width (sprite px) instead of the lv5 one, e.g. to make squat new towers taller
const target = +(process.argv.find((a) => a.startsWith('--base='))?.slice(7) ?? lv5.base);
const kMin = target / Math.max(...bases.map((b) => b.base));
let ks = bases.map((b) => (process.argv.includes('--common') ? kMin : target / b.base));
// --height=F: scale each frame so its whole height = F × the lv5 frame's whole height (grander levels, wider footprint)
const HF = process.argv.find((a) => a.startsWith('--height='));
if (HF) {
  let t = 1e9, bt = -1; for (let y = 0; y < och; y++) for (let x = 0; x < ocw; x++) if (prev.get(x, 4 * och + y) & 255) { t = Math.min(t, y); bt = y; }
  ks = boxes.map((b) => (+HF.slice(9) * (bt - t + 1)) / (b[3] - b[1] + 1));
}
const frames = boxes.map((b, i) => dropPinkSpecks(shrinkBox(img, mask, b, ks[i])));
// placement: centred on the main part (not on floating sparks / clouds), frame bottom on the cell bottom (as buildings.mjs)
const place = bases.map((b, i) => ({ cx: ((b.main[0] + b.main[2] + 1) / 2 - boxes[i][0]) * ks[i] }));
let cw = ocw, ch = och;
frames.forEach((f, i) => { const { cx } = place[i]; cw = Math.max(cw, 2 * Math.ceil(Math.max(cx, f.w - cx)) + 2); ch = Math.max(ch, f.h + 2); });
if ((cw - ocw) % 2) cw++; // keep the old frames exactly centred
const sheet = new Px(cw, ch * 9), dx = (cw - ocw) / 2, dy = ch - och;
for (let r = 0; r < 6; r++) for (let y = 0; y < och; y++) for (let x = 0; x < ocw; x++) sheet.d[(r * ch + dy + y) * cw + dx + x] = prev.d[(r * och + y) * ocw + x];
frames.forEach((f, i) => {
  const p = place[i], r = 6 + i;
  const x = Math.round(cw / 2 - p.cx), y = r * ch + ch - 1 - f.h;
  // clip to the cell (rows must not bleed into each other)
  for (let j = 0; j < f.h; j++) for (let q = 0; q < f.w; q++) { const v = f.d[j * f.w + q]; if (!v) continue; const X = x + q, Y = y + j; if (X < 0 || X >= cw || Y < r * ch || Y >= (r + 1) * ch) continue; sheet.d[Y * cw + X] = v; }
});
savePng(sheet, `${OUT}${type}.png`);
atlas[type] = { ...old, size: [cw, ch], anchor: [Math.round(cw / 2), Math.round(ch - 1 - 0.28 * TILES * 32)], rows: { lv1: 0, lv2: 1, lv3: 2, lv4: 3, lv5: 4, ruin: 5, lv6: 6, lv7: 7, lv8: 8 }, tiles: TILES, source: 'import' };
fs.writeFileSync(atlasFile, JSON.stringify(atlas, null, 1));
console.log(`${type}: lv5 base ${lv5.base}px, new bases ${bases.map((b) => b.base).join('/')} src px → scale ${ks.map((k) => k.toFixed(3)).join('/')}; frames ${frames.map((f) => f.w + '×' + f.h).join(', ')}; cell ${ocw}×${och} → ${cw}×${ch}`);

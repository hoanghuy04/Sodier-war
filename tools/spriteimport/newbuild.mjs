// Import a NEW building sheet (one row of cells on magenta) → client/assets/buildings/<type>.png + atlas entry.
// Like buildings.mjs, but any number of cells with named rows, and the border-flood keying of key.mjs
// (violet / magenta-ish art inside the outlines survives).
// Usage: node tools/spriteimport/newbuild.mjs <sheet.jpg|png> <type> <tiles> <row names, e.g. lv1,lv2,lv3,ruin> [--deep=names] [--paint=x0,y0,x1,y1]
//   scale: TARGET_W = tiles*32+4 sprite px for the widest cell that is not ruin / hidden (one common scale)
//   ruin / hidden cells get a deeper keying (deepKey: pink ground shadow between the rubble)
//   --deep=lv1,lv2|all: deeper keying for more cells (art without pink / violet parts, shaded magenta pockets)
//   --paint: repaint a source rectangle row by row with the median colour of its bright pixels (garbled AI text)
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { loadImage, closeBrowser, keyMagenta, shrinkBox, cellRuns, boxOf, baseWidth, backup, dropPinkSpecks, rgb, deepKey } from './key.mjs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const [file, type, tilesArg, rowArg] = args;
const TILES = +tilesArg, ROWS = (rowArg ?? '').split(',').filter(Boolean);
if (!file || !type || !TILES || !ROWS.length) { console.error('usage: newbuild.mjs <sheet> <type> <tiles> <lv1,lv2,...,ruin> [--paint=x0,y0,x1,y1]'); process.exit(1); }
const OUT = new URL('../../client/assets/buildings/', import.meta.url).pathname;

const img = await loadImage(file); await closeBrowser();
const { w: W, h: H } = img;
for (const a of process.argv.filter((a) => a.startsWith('--paint='))) {
  const [x0, y0, x1, y1] = a.slice(8).split(',').map(Number);
  for (let y = y0; y <= y1; y++) {
    const row = []; for (let x = x0; x <= x1; x++) row.push(img.d[y * W + x]);
    const lum = (v) => { const [r, g, b] = rgb(v); return r * 0.3 + g * 0.59 + b * 0.11; };
    const sorted = row.slice().sort((p, q) => lum(p) - lum(q)), bright = sorted.slice(Math.floor(sorted.length * 0.5));
    const med = bright[bright.length >> 1];
    for (let x = x0; x <= x1; x++) if (lum(img.d[y * W + x]) < lum(med) * 0.85) img.d[y * W + x] = med;
  }
}
const { mask } = keyMagenta(img, { pocket: 15 });
const runs = cellRuns(mask, W, H);
if (runs.length !== ROWS.length) { console.error(`expected ${ROWS.length} cells, found ${runs.length}:`, runs); process.exit(1); }
let boxes = runs.map(([x0, x1]) => boxOf(mask, W, x0, x1, 0, H - 1));
// ruin / hidden cells have no glowing crystals: key them deeper (pink ground shadow between the rubble)
const DEEP = (process.argv.find((a) => a.startsWith('--deep='))?.slice(7) ?? '').split(',');
boxes.forEach((b, i) => { if (/^(ruin|hidden)$/.test(ROWS[i]) || DEEP.includes(ROWS[i]) || DEEP.includes('all')) deepKey(img, mask, b); });
boxes = runs.map(([x0, x1]) => boxOf(mask, W, x0, x1, 0, H - 1));
const ref = Math.max(...boxes.filter((_, i) => !/^(ruin|hidden)$/.test(ROWS[i])).map((b) => b[2] - b[0] + 1));
const k = (TILES * 32 + 4) / ref;
const frames = boxes.map((b) => dropPinkSpecks(shrinkBox(img, mask, b, k)));
// centred on the main part (not on floating sparks), frame bottom on the cell bottom
const cxs = boxes.map((b) => { const m = baseWidth((x, y) => mask[y * W + x], ...b).main; return ((m[0] + m[2] + 1) / 2 - b[0]) * k; });
let cw = 0, ch = 0;
frames.forEach((f, i) => { cw = Math.max(cw, 2 * Math.ceil(Math.max(cxs[i], f.w - cxs[i])) + 2); ch = Math.max(ch, f.h + 2); });
const sheet = new Px(cw, ch * frames.length);
frames.forEach((f, r) => sheet.blit(f, Math.round(cw / 2 - cxs[r]), r * ch + ch - 1 - f.h));
backup(`${OUT}${type}.png`); backup(OUT + 'atlas.json');
savePng(sheet, `${OUT}${type}.png`);
const atlasFile = OUT + 'atlas.json', atlas = JSON.parse(fs.readFileSync(atlasFile, 'utf8'));
atlas[type] = { size: [cw, ch], anchor: [Math.round(cw / 2), Math.round(ch - 1 - 0.28 * TILES * 32)], rows: Object.fromEntries(ROWS.map((n, i) => [n, i])), tiles: TILES, source: 'import' };
fs.writeFileSync(atlasFile, JSON.stringify(atlas, null, 1));
console.log(`${type}: ${frames.length} cells (${ROWS.join(',')}), scale ${k.toFixed(3)}, frames ${frames.map((f) => f.w + '×' + f.h).join(', ')}, cell ${cw}×${ch}`);

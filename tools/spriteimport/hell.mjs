// Import the Hell mode sheets (docs/design/samples/hell/sprite-pixels/*.jpg, prompts in ../prompts/) into
// client/assets/hell/ + one manifest client/assets/hell/hell.json.
// Usage: node tools/spriteimport/hell.mjs [mon|fx|grid|ground|gate ...]   (no argument = everything)
//   mon    → hell/mon/<id>.png (via importjpg.mjs --no-team, review boards in docs/design/assets/hell-ai/)
//   fx     → hell/fx/<fx-NN>.png
//   grid   → hell/vat-pham.png, icon-ky-nang.png, the-ky-nang.png, vat-the-1.png, vat-the-2.png
//   ground → hell/ground.png (32 px tiles) + ground16.png
//   gate   → hell/cong-dia-nguc.png
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';
import { loadImage, closeBrowser, keyMagenta, shrinkBox, boxOf, dropPinkSpecks, rgb, looseBg, deepKey, depink } from './key.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const SRC = ROOT + 'docs/design/samples/hell/sprite-pixels/', OUT = ROOT + 'client/assets/hell/', AI = ROOT + 'docs/design/assets/hell-ai/';
const MAN = OUT + 'hell.json';
fs.mkdirSync(OUT + 'mon', { recursive: true }); fs.mkdirSync(OUT + 'fx', { recursive: true }); fs.mkdirSync(AI, { recursive: true });
const man = fs.existsSync(MAN) ? JSON.parse(fs.readFileSync(MAN, 'utf8')) : {};
const stages = process.argv.slice(2).length ? process.argv.slice(2) : ['mon', 'fx', 'grid', 'ground', 'gate'];
const save = () => fs.writeFileSync(MAN, JSON.stringify(man, null, 1));

// ---------------------------------------------------------------- monsters
const R5 = 'idle,walk,attack,hit,death', R7 = 'idle,walk,attack,skill,hit,roar,death';
const MONS = [
  ...['quy-tro', 'doi-than', 'sau-dung-nham', 'cot-than', 'nhay-dung-nham', 'qua-lua', 'bo-luu-huynh', 'den-oan-hon'].map((id) => [id, id, R5, 40, 'swarm']),
  ...['khuyen-bazan', 'ke-keo-xich', 'thay-cung-sung', 've-binh-nguc'].map((id) => [id, id, R5, 50, 'medium']),
  ...['cu-nham', 'hoa-te'].map((id) => [id, id, R5, 64, 'big']),
  ...['cai-nguc', 'phu-thuy-huyet', 'lo-ren-song', 'ret-dung-nham'].map((id) => [id, id, R5, 80, 'elite']),
  ['quy-vuong-nham', 'boss-quy-vuong-nham', R7, 130, 'boss'], ['mau-hau-tro', 'boss-mau-hau-tro', R7, 130, 'boss'], ['nguc-chu', 'boss-nguc-chu', R7, 130, 'boss'],
];
if (stages.includes('mon')) {
  man.monsters ??= {};
  const only = process.env.ONLY?.split(',');
  for (const [id, file, rows, h, kind] of MONS) {
    if (only && !only.includes(id)) continue;
    execFileSync('node', [ROOT + 'tools/spriteimport/importjpg.mjs', SRC + file + '.jpg', id, rows, String(h), '--no-team', '--depink', '--out=' + AI], { stdio: 'inherit' });
    fs.copyFileSync(AI + id + '.png', OUT + 'mon/' + id + '.png');
    const a = JSON.parse(fs.readFileSync(AI + 'atlas.json', 'utf8'))[id];
    man.monsters[id] = { ...a, src: 'mon/' + id + '.png', kind, teamRecolor: false };
    save();
  }
}

// ---------------------------------------------------------------- effects
const promptRows = (name) => [...fs.readFileSync(ROOT + `docs/design/samples/hell/prompts/${name}.md`, 'utf8').matchAll(/^Row (\d+)[^"\n]*"([^"]+)"/gm)].map((m) => m[2]);
/** "colour to alpha" against the background colour B: a semi-transparent shadow / ring over magenta becomes a translucent pixel */
function c2a(v, B) {
  const c = rgb(v);
  let a = 0;
  for (let k = 0; k < 3; k++) a = Math.max(a, B[k] > 127 ? (B[k] - c[k]) / B[k] : (c[k] - B[k]) / (255 - B[k]));
  a = Math.min(1, a);
  if (a < 0.12) return 0;
  const F = c.map((x, k) => Math.max(0, Math.min(255, Math.round((x - (1 - a) * B[k]) / a))));
  return ((F[0] << 24) | (F[1] << 16) | (F[2] << 8) | Math.round(a * 255)) >>> 0;
}
// magenta-tinted pixels are see-through (colour-to-alpha). Hell effects (08-11) have no violet art: hue 285-340;
// the hero effects (01-07) have violet lightning / stars (hue < 290): only hue 292-340 there
const C2A = ['fx-08', 'fx-09', 'fx-10', 'fx-11'];
if (stages.includes('fx')) {
  man.fx ??= {};
  for (let n = 1; n <= 16; n++) { // fx-12: the 5 actives added 16/11/2026; fx-13..16: 12 actives + passives (17/11/2026)
    const id = 'fx-' + String(n).padStart(2, '0'); if (process.env.ONLY && !process.env.ONLY.split(',').includes(id)) continue;
    const names = promptRows(id);
    const img = await loadImage(SRC + id + '.jpg'), W = img.w, H = img.h, COLS = 8, CW = Math.floor(W / COLS);
    const { mask, bg: B } = keyMagenta(img, { pocket: 15 });
    const px = new Uint32Array(W * H);
    for (let i = 0; i < W * H; i++) if (mask[i]) px[i] = isPinkishOrDark(img.d[i], C2A.includes(id) ? 285 : 292) ? c2a(img.d[i], B) : (img.d[i] | 255) >>> 0;
    if (id === 'fx-16') seeThrough(img, px, W, H); // the barrier dome was filled violet: make its inside glassy (17/11/2026)
    // rows: bands of solid pixels separated by empty lines (as fx.mjs), then forced to the prompt's row count
    const cnt = new Int32Array(H); for (let y = 0; y < H; y++) { let c = 0; for (let x = 0; x < W; x++) if ((px[y * W + x] & 255) > 40) c++; cnt[y] = c; }
    let bands = [], y0 = -1;
    for (let y = 0; y <= H; y++) { const on = y < H && cnt[y] > 2; if (on && y0 < 0) y0 = y; if (!on && y0 >= 0) { bands.push([y0, y]); y0 = -1; } }
    const merged = []; for (const b of bands) { const l = merged[merged.length - 1]; if (l && b[0] - l[1] < 10) l[1] = b[1]; else merged.push([...b]); }
    bands = merged.filter(([a, b]) => b - a >= 12);
    while (bands.length > names.length) { let bi = 1, g = 1e9; for (let k = 1; k < bands.length; k++) { const gg = bands[k][0] - bands[k - 1][1]; if (gg < g) { g = gg; bi = k; } } bands[bi - 1][1] = bands[bi][1]; bands.splice(bi, 1); }
    while (bands.length < names.length) {
      let bi = 0; for (let k = 1; k < bands.length; k++) if (bands[k][1] - bands[k][0] > bands[bi][1] - bands[bi][0]) bi = k;
      const [a, b] = bands[bi], lo = a + Math.floor((b - a) * 0.2), hi = b - Math.floor((b - a) * 0.2); let cy = lo;
      for (let y = lo; y < hi; y++) if (cnt[y] < cnt[cy]) cy = y;
      bands.splice(bi, 1, [a, cy], [cy + 1, b]);
    }
    const rows = bands.map(([a, b]) => [Math.max(0, a - 2), Math.min(H, b + 2)]);
    const o = new Px(CW * COLS, rows.reduce((s, [a, b]) => s + b - a, 0)), meta = [];
    let oy = 0;
    for (const [a, b] of rows) { for (let y = a; y < b; y++) for (let x = 0; x < CW * COLS; x++) o.d[(oy + y - a) * o.w + x] = px[y * W + x]; meta.push([oy, b - a]); oy += b - a; }
    savePng(o, OUT + 'fx/' + id + '.png');
    man.fx[id] = { src: 'fx/' + id + '.png', w: CW, frames: COLS, rows: meta, names };
    console.log(id, `${o.w}×${o.h}`, 'rows', meta.map((r) => r[1]).join(','), names.join(' | '));
  }
  await closeBrowser(); save();
}
/** fx-16 row 1 (Spirit Barrier, top quarter of the sheet): violet / lavender fill (hue 225–300) becomes 30 % see-through so the
 *  hero shows inside; elsewhere violet-magenta blends left in ellipse floors (hue 285+) go see-through too */
function seeThrough(img, px, W, H) { let n = 0;
  for (let i = 0; i < W * H; i++) {
    if (!(px[i] & 255)) continue;
    const [r, g, b] = rgb(img.d[i]), mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx === mn) continue;
    let h = mx === r ? ((g - b) / (mx - mn)) * 60 : mx === g ? (2 + (b - r) / (mx - mn)) * 60 : (4 + (r - g) / (mx - mn)) * 60; if (h < 0) h += 360;
    const sat = (mx - mn) / mx, y = (i / W) | 0;
    if (y < H / 4 && h > 225 && h < 300 && sat > 0.3) { px[i] = (((r << 24) | (g << 16) | (b << 8)) >>> 0) + 77; n++; }
    else if (h >= 285 && h < 340 && sat > 0.4) px[i] = 0;
  }
  return n;
}
/** magenta-tinted (hue 285–340, incl. dark magenta shadows and red glow blended with magenta) */
function isPinkishOrDark(v, h0 = 285) {
  const [r, g, b] = rgb(v), mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx < 40 || mx === mn) return false;
  let h = mx === r ? ((g - b) / (mx - mn)) * 60 : mx === g ? (2 + (b - r) / (mx - mn)) * 60 : (4 + (r - g) / (mx - mn)) * 60; if (h < 0) h += 360;
  return h > h0 && h < 340 && (mx - mn) / mx > 0.55; // greyish-pink metal (chains) stays opaque
}

// ---------------------------------------------------------------- grids (items, icons, card frames, objects)
/** sprite parts of a cols×rows sheet: connected parts assigned to the cell holding their centre → per-cell bbox + mask */
function gridCells(img, mask, cols, rows) {
  const { w: W, h: H } = img, lab = new Int32Array(W * H).fill(-1), cellOf = [];
  for (let s = 0; s < W * H; s++) {
    if (!mask[s] || lab[s] >= 0) continue;
    const q = [s], id = cellOf.length; lab[s] = id; let sx = 0, sy = 0;
    for (let k = 0; k < q.length; k++) { const i = q[k], x = i % W, y = (i / W) | 0; sx += x; sy += y; for (let j = -1; j <= 1; j++) for (let d = -1; d <= 1; d++) { const nx = x + d, ny = y + j, ni = ny * W + nx; if (nx >= 0 && ny >= 0 && nx < W && ny < H && mask[ni] && lab[ni] < 0) { lab[ni] = id; q.push(ni); } } }
    cellOf.push(q.length < 6 ? -1 : Math.min(rows - 1, Math.floor(sy / q.length / (H / rows))) * cols + Math.min(cols - 1, Math.floor(sx / q.length / (W / cols))));
  }
  return Array.from({ length: cols * rows }, (_, c) => {
    const m = new Uint8Array(W * H); let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let i = 0; i < W * H; i++) if (lab[i] >= 0 && cellOf[lab[i]] === c) { m[i] = 1; const x = i % W, y = (i / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return { m, box: [x0, y0, x1, y1], w: x1 - x0 + 1, h: y1 - y0 + 1 };
  });
}
/** pack frames in a grid (cell = biggest frame + 2), each frame centred horizontally; align: 'bottom' | 'center' */
function packGrid(frames, cols, align = 'center', fixed = null) {
  const cw = fixed?.[0] ?? Math.max(...frames.map((f) => f.w)) + 2, ch = fixed?.[1] ?? Math.max(...frames.map((f) => f.h)) + 2, rows = Math.ceil(frames.length / cols);
  const sheet = new Px(cw * cols, ch * rows), rects = [];
  frames.forEach((f, i) => { const x = (i % cols) * cw + Math.floor((cw - f.w) / 2), y = Math.floor(i / cols) * ch + (align === 'bottom' ? ch - 1 - f.h : Math.floor((ch - f.h) / 2)); sheet.blit(f, x, y); rects.push([x, y, f.w, f.h]); });
  return { sheet, rects, cell: [cw, ch] };
}
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\(.*?\)/g, '').trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
if (stages.includes('grid')) {
  man.grids ??= {};
  const P = (n) => fs.readFileSync(ROOT + `docs/design/samples/hell/prompts/${n}.md`, 'utf8');
  const quoted = (line) => [...line.matchAll(/\d+ "([^"]+)"/g)].map((m) => m[1]);
  const vp = P('vat-pham').split('\n').filter((l) => /^Row [12]/.test(l)).flatMap(quoted);
  const chestFrames = ['closed', 'shaking', 'lid cracks', 'lid flies open', 'loot pops out', 'light shrinks', 'open glowing', 'open empty'].map((s) => 'Chest opening: ' + s);
  const icons = [...P('icon-ky-nang').matchAll(/^\| (\d) \| (\d) \| (.+?) \|$/gm)].map((m) => m[3]);
  const icons2 = [...P('icon-ky-nang-2').matchAll(/^\| (\d) \| (\d) \| (.+?) \|$/gm)].map((m) => m[3]);
  const icons3 = [...P('icon-ky-nang-3').matchAll(/^\| (\d) \| (\d) \| (.+?) \| \d+ \|$/gm)].map((m) => m[3]);
  const cards = [...P('the-ky-nang').matchAll(/^Column \d "([^"]+)"/gm)].map((m) => m[1]);
  const v1kinds = [...P('vat-the-1').matchAll(/^\d "([^"]+)"/gm)].map((m) => m[1]), v1vars = ['Variant A', 'Variant B', 'Variant C'];
  const v2kinds = [...P('vat-the-2').matchAll(/^Column \d "([^"]+)" \(([^)]+)\)/gm)].map((m) => [m[1], m[2]]);
  const v2states = ['intact', 'broken']; // row 1 / row 2 (lava vent / altar: dormant / active)
  const JOBS = [
    { id: 'vat-pham', depink: true, cols: 8, rows: 3, names: [...vp, ...chestFrames], fit: 'common', size: 24, align: 'center' },
    { id: 'icon-ky-nang', cols: 8, rows: 5, names: icons, fit: 'each', size: 30, cell: [32, 32] },
    { id: 'icon-ky-nang-2', cols: 5, rows: 2, names: icons2, fit: 'each', size: 30, cell: [32, 32] }, // skills 40–49 (16/11/2026)
    { id: 'icon-ky-nang-3', depink: true, cols: 4, rows: 5, names: icons3, fit: 'each', size: 30, cell: [32, 32] }, // skills 50–69 (17/11/2026)
    { id: 'the-ky-nang', cols: 5, rows: 1, names: cards, fit: 'commonW', size: 96, align: 'bottom' },
    { id: 'vat-the-1', depink: true, cols: 6, rows: 3, names: v1vars.flatMap((v) => v1kinds.map((k) => `${k} ${v}`)), fit: 'ref', ref: 5, size: 64, align: 'bottom' },
    { id: 'vat-the-2', depink: true, cols: 5, rows: 2, names: [0, 1].flatMap((r) => v2kinds.map(([k]) => `${k} ${k === 'Lava vent' || k === 'Altar' ? ['dormant', 'active'][r] : v2states[r]}`)), fit: 'refW', ref: 3, size: 3 * 32 + 4, align: 'bottom', extra: { footprint: v2kinds.map(([, f]) => f) } },
  ];
  for (const J of JOBS) {
    if (process.env.ONLY && !process.env.ONLY.split(',').includes(J.id)) continue;
    const img = await loadImage(SRC + J.id + '.jpg'), { mask } = keyMagenta(img, { pocket: 15 });
    if (J.depink) depink(img, mask); // hell objects / items never contain pink: magenta bleed in bones, glows
    const cells = gridCells(img, mask, J.cols, J.rows);
    const ks = cells.map((c) => {
      if (J.fit === 'each') return J.size / Math.max(c.w, c.h);
      if (J.fit === 'common') return J.size / Math.max(...cells.map((q) => Math.max(q.w, q.h)));
      if (J.fit === 'commonW') return J.size / Math.max(...cells.map((q) => q.w));
      if (J.fit === 'ref') return J.size / cells[J.ref].h;
      if (J.fit === 'refW') return J.size / cells[J.ref].w;
    });
    const frames = cells.map((c, i) => shrinkBox(img, c.m, c.box, ks[i]));
    const { sheet, rects, cell } = packGrid(frames, J.cols, J.align, J.cell);
    savePng(sheet, OUT + J.id + '.png');
    man.grids[J.id] = { src: J.id + '.png', cols: J.cols, rows: J.rows, cell, rects, names: J.names.slice(0, cells.length), ids: J.names.slice(0, cells.length).map(slug), ...(J.extra ?? {}) };
    console.log(J.id, `${sheet.w}×${sheet.h}`, 'cell', cell.join('×'), 'names', J.names.length, '/', cells.length, 'scale', [...new Set(ks.map((k) => k.toFixed(3)))].slice(0, 3).join(','));
  }
  await closeBrowser(); save();
}

// ---------------------------------------------------------------- ground tiles (not on magenta)
if (stages.includes('ground')) {
  const img = await loadImage(SRC + 'nen-dia-nguc.jpg'); await closeBrowser();
  const P = fs.readFileSync(ROOT + 'docs/design/samples/hell/prompts/nen-dia-nguc.md', 'utf8').split('\n').filter((l) => /^Row [123]/.test(l));
  const q = (l) => [...l.matchAll(/\d+ "([^"]+)"/g)].map((m) => m[1]);
  const names = [...q(P[0]), ...Array.from({ length: 8 }, (_, i) => `Flowing lava ${i + 1}`), ...q(P[2])];
  const CW = img.w / 8, CH = img.h / 3, M = 3; // skip the thin dark gutters between the swatches
  for (const T of [32, 16]) {
    const sheet = new Px(T * 8, T * 3);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) {
      const x0 = c * CW + M, y0 = r * CH + M, sw = CW - 2 * M, sh = CH - 2 * M;
      for (let ty = 0; ty < T; ty++) for (let tx = 0; tx < T; tx++) { // area average
        let R = 0, G = 0, B = 0, n = 0;
        for (let y = Math.floor(y0 + (ty * sh) / T); y < Math.floor(y0 + ((ty + 1) * sh) / T); y++) for (let x = Math.floor(x0 + (tx * sw) / T); x < Math.floor(x0 + ((tx + 1) * sw) / T); x++) { const v = rgb(img.d[y * img.w + x]); R += v[0]; G += v[1]; B += v[2]; n++; }
        sheet.d[(r * T + ty) * sheet.w + c * T + tx] = ((Math.round(R / n) << 24) | (Math.round(G / n) << 16) | (Math.round(B / n) << 8) | 255) >>> 0;
      }
    }
    savePng(sheet, OUT + (T === 32 ? 'ground.png' : 'ground16.png'));
  }
  man.ground = { src: 'ground.png', src16: 'ground16.png', tile: 32, tile16: 16, cols: 8, rows: 3, names, ids: names.map(slug), lava: { first: 8, frames: 8 } };
  save(); console.log('ground: 24 tiles,', names.join(' | '));
}

// ---------------------------------------------------------------- Hell Gate (vertical, facing west)
if (stages.includes('gate')) {
  const img = await loadImage(SRC + 'cong-dia-nguc.jpg'); await closeBrowser();
  const { mask } = keyMagenta(img, { pocket: 15 });
  depink(img, mask);
  const box = boxOf(mask, img.w, 0, img.w - 1, 0, img.h - 1), TW = 6 * 32 + 4, k = TW / (box[2] - box[0] + 1);
  const f = shrinkBox(img, mask, box, k), cw = f.w + 2, ch = f.h + 4, sheet = new Px(cw, ch);
  sheet.blit(f, 1, ch - 4 - f.h + 1);
  savePng(sheet, OUT + 'cong-dia-nguc.png');
  // anchor: bottom centre of the footprint, like the palace entries (nha-vua / nu-hoang) in buildings/atlas.json
  man.gate = { src: 'cong-dia-nguc.png', size: [cw, ch], anchor: [Math.round(cw / 2), ch - 4], tiles: [6, 10], facing: 'W' };
  save(); console.log('gate', cw + '×' + ch, 'scale', k.toFixed(3));
}

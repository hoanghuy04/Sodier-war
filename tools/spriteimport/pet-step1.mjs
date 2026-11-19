// Split a "Bước 1" pet sheet (8 columns = directions × 6 rows = poses, one pose per cell) into one-frame animation
// sheets (8 rows × 1 column) named like the full sheets, ready for pet8.mjs.
// Usage: node tools/spriteimport/pet-step1.mjs <sheet.png> <small|big> <out folder>
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';
const [, , file, form, out] = process.argv;
const NAMES = form === 'big' ? ['chien-battle-idle', 'chien-run', 'chien-attack', 'chien-hit', 'chien-skill', 'chien-defeated'] : ['idle', 'walk', 'transform-start', 'hit', 'happy', 'rest'];
const img = readPng(file), cw = img.w / 8, ch = img.h / 6, c = Math.round(Math.min(cw, ch));
fs.mkdirSync(out, { recursive: true });
NAMES.forEach((nm, r) => {
  const o = new Px(c, c * 8); o.d.fill(0xff00ffff);
  for (let d = 0; d < 8; d++) for (let y = 0; y < c; y++) for (let x = 0; x < c; x++) {
    const sx = Math.round(d * cw + (cw - c) / 2 + x), sy = Math.round(r * ch + (ch - c) + y); // keep the bottom (baseline)
    if (sx < img.w && sy < img.h) o.d[(d * c + y) * c + x] = img.d[sy * img.w + sx];
  }
  savePng(o, `${out}/${form === 'big' ? 'x-' : ''}${nm}.png`);
});
console.log(file, form, `${img.w}×${img.h}`, 'cell', c);

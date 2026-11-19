// Minimal animated GIF89a encoder (global palette, LZW), no dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { hex } from '../mapgen/core.mjs';

function flatten(frames, bg) {
  const B = hex(bg);
  return frames.map((f) => {
    const d = new Uint32Array(f.d.length);
    for (let i = 0; i < d.length; i++) {
      const v = f.d[i], a = (v & 255) / 255;
      if (a >= 1) { d[i] = v >>> 8; continue; }
      const ch = (s) => Math.round(((v >>> s) & 255) * a + ((B >>> s) & 255) * (1 - a));
      d[i] = (ch(24) << 16) | (ch(16) << 8) | ch(8);
    }
    return d;
  });
}
function palette(flat) {
  for (let shift = 0; shift <= 4; shift++) {
    const mask = (0xff << shift) & 0xff, m = (mask << 16) | (mask << 8) | mask;
    const map = new Map();
    for (const d of flat) for (const v of d) { const q = v & m; if (!map.has(q)) { map.set(q, map.size); if (map.size > 256) break; } }
    if (map.size <= 256) return { map, m };
  }
  throw new Error('too many colours');
}
function lzw(idx, minCode) {
  const clear = 1 << minCode, eoi = clear + 1;
  let size = minCode + 1, next = eoi + 1, dict = new Map();
  const out = []; let cur = 0, bits = 0;
  const emit = (c) => { cur |= c << bits; bits += size; while (bits >= 8) { out.push(cur & 255); cur >>>= 8; bits -= 8; } };
  emit(clear);
  let prefix = idx[0];
  for (let i = 1; i < idx.length; i++) {
    const k = idx[i], key = prefix * 256 + k;
    const hit = dict.get(key);
    if (hit !== undefined) { prefix = hit; continue; }
    emit(prefix);
    if (next === 4096) { emit(clear); dict = new Map(); size = minCode + 1; next = eoi + 1; }
    else { if (next >= 1 << size) size++; dict.set(key, next++); }
    prefix = k;
  }
  emit(prefix); emit(eoi);
  if (bits > 0) out.push(cur & 255);
  return out;
}
/** frames: Px[] same size. delay in centiseconds. */
export function saveGif(frames, file, { delay = 12, bg = '#2a2e3a', scale = 1 } = {}) {
  const fr = scale > 1 ? frames.map((f) => f.scaled(scale)) : frames;
  const w = fr[0].w, h = fr[0].h;
  const flat = flatten(fr, bg);
  const { map, m } = palette(flat);
  let bitsN = 1; while (1 << bitsN < Math.max(2, map.size)) bitsN++;
  const minCode = Math.max(2, bitsN);
  const bytes = [];
  const u16 = (v) => bytes.push(v & 255, (v >> 8) & 255);
  bytes.push(...Buffer.from('GIF89a')); u16(w); u16(h);
  bytes.push(0x80 | 0x70 | (bitsN - 1), 0, 0);
  const pal = [...map.keys()];
  for (let i = 0; i < 1 << bitsN; i++) { const v = pal[i] ?? 0; bytes.push((v >> 16) & 255, (v >> 8) & 255, v & 255); }
  bytes.push(0x21, 0xff, 11, ...Buffer.from('NETSCAPE2.0'), 3, 1, 0, 0, 0);
  for (const d of flat) {
    bytes.push(0x21, 0xf9, 4, 0x04, delay & 255, (delay >> 8) & 255, 0, 0);
    bytes.push(0x2c); u16(0); u16(0); u16(w); u16(h); bytes.push(0);
    const idx = new Uint8Array(d.length);
    for (let i = 0; i < d.length; i++) idx[i] = map.get(d[i] & m);
    bytes.push(minCode);
    const data = lzw(idx, minCode);
    for (let i = 0; i < data.length; i += 255) { const n = Math.min(255, data.length - i); bytes.push(n); for (let j = 0; j < n; j++) bytes.push(data[i + j]); }
    bytes.push(0);
  }
  bytes.push(0x3b);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(bytes));
}

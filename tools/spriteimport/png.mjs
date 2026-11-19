import fs from 'node:fs'; import zlib from 'node:zlib';
import { Px } from '../mapgen/core.mjs';
export function readPng(file) {
  const b = fs.readFileSync(file); let p = 8, w, h, ct, idat = [];
  while (p < b.length) { const len = b.readUInt32BE(p), t = b.toString('ascii', p + 4, p + 8), d = b.subarray(p + 8, p + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; } if (t === 'IDAT') idat.push(d); p += 12 + len; }
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = ct === 6 ? 4 : 3, stride = w * bpp, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)]; for (let x = 0; x < stride; x++) {
    const v = raw[y * (stride + 1) + 1 + x], a = x >= bpp ? out[y * stride + x - bpp] : 0, u = y ? out[(y - 1) * stride + x] : 0, c = x >= bpp && y ? out[(y - 1) * stride + x - bpp] : 0;
    let r = v; if (f === 1) r += a; else if (f === 2) r += u; else if (f === 3) r += (a + u) >> 1; else if (f === 4) { const pp = a + u - c, pa = Math.abs(pp - a), pb = Math.abs(pp - u), pc = Math.abs(pp - c); r += pa <= pb && pa <= pc ? a : pb <= pc ? u : c; }
    out[y * stride + x] = r & 255; } }
  const px = new Px(w, h); for (let i = 0; i < w * h; i++) px.d[i] = bpp === 4 && out[i * 4 + 3] === 0 ? 0 : ((out[i * bpp] << 24) | (out[i * bpp + 1] << 16) | (out[i * bpp + 2] << 8) | 255) >>> 0; // keep fully transparent pixels empty
  return px;
}

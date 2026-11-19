// Pixel canvas, noise and PNG export (no dependencies). Same ideas as Ant War's packages/art/src/core.mjs.
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const HEX = new Map();
/** '#rrggbb' or '#rrggbbaa' -> 0xRRGGBBAA. Numbers pass through. */
export function hex(c) {
  if (c == null) return 0;
  if (typeof c === 'number') return c;
  let v = HEX.get(c);
  if (v === undefined) {
    const n = parseInt(c.slice(1, 7), 16);
    const a = c.length > 7 ? parseInt(c.slice(7, 9), 16) : 255;
    v = ((n << 8) | a) >>> 0;
    HEX.set(c, v);
  }
  return v;
}

export function mix(a, b, t) {
  const pa = parseInt(a.slice(1, 7), 16), pb = parseInt(b.slice(1, 7), 16);
  const ch = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return '#' + ((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0');
}

function blend(dst, src) {
  const a = (src & 255) / 255;
  if (a >= 1 || !dst) return src;
  const ch = (s) => Math.round(((src >>> s) & 255) * a + ((dst >>> s) & 255) * (1 - a));
  return ((ch(24) << 24) | (ch(16) << 16) | (ch(8) << 8) | 255) >>> 0;
}

export class Px {
  constructor(w, h, fill = null) {
    this.w = w; this.h = h;
    this.d = new Uint32Array(w * h);
    if (fill) this.d.fill(hex(fill));
  }
  set(x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (c == null || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const v = hex(c);
    const i = y * this.w + x;
    this.d[i] = (v & 255) === 255 ? v : blend(this.d[i], v);
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.d[y * this.w + x];
  }
  /** Multiply RGB by f (shadows, f < 1) or lighten toward white (f > 1). */
  shade(x, y, f) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = y * this.w + x, v = this.d[i];
    if (!v) return;
    const ch = (s) => {
      const c = (v >>> s) & 255;
      return Math.max(0, Math.min(255, Math.round(f <= 1 ? c * f : c + (255 - c) * (f - 1))));
    };
    this.d[i] = ((ch(24) << 24) | (ch(16) << 16) | (ch(8) << 8) | (v & 255)) >>> 0;
  }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); }
  line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  ellipse(cx, cy, rx, ry, c) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x - cx) / (rx + 0.35), ny = (y - cy) / (ry + 0.35);
        if (nx * nx + ny * ny <= 1) this.set(x, y, c);
      }
  }
  /** Darken an ellipse (soft shadow on whatever is already drawn). */
  shadow(cx, cy, rx, ry, f = 0.72) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const nx = (x - cx) / (rx + 0.35), ny = (y - cy) / (ry + 0.35);
        const d = nx * nx + ny * ny;
        if (d <= 1) this.shade(x, y, d > 0.7 && ((x + y) & 1) ? (1 + f) / 2 : f);
      }
  }
  blit(src, dx, dy) {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const v = src.d[y * src.w + x];
        if (v & 255) this.set(dx + x, dy + y, v);
      }
  }
  scaled(s) {
    const p = new Px(this.w * s, this.h * s);
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) p.d[y * p.w + x] = this.d[((y / s) | 0) * this.w + ((x / s) | 0)];
    return p;
  }
}

/** Ring of `t` px around the opaque pixels of `src` (for the green/red ownership outline). */
export function outline(src, outer, inner, t = 2, minPart = 24) {
  const p = new Px(src.w + 2 * t, src.h + 2 * t);
  // keep only opaque pixels that belong to a big connected part (skips smoke, light rays, floating shards)
  const keep = new Uint8Array(src.w * src.h), seen = new Uint8Array(src.w * src.h);
  const op = (i) => (src.d[i] & 255) >= 200;
  for (let s = 0; s < keep.length; s++) {
    if (seen[s] || !op(s)) continue;
    const part = [s]; seen[s] = 1;
    for (let h = 0; h < part.length; h++) {
      const i = part[h], x = i % src.w, y = (i / src.w) | 0;
      for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) {
        const nx = x + k, ny = y + j, ni = ny * src.w + nx;
        if (nx < 0 || ny < 0 || nx >= src.w || ny >= src.h || seen[ni] || !op(ni)) continue;
        seen[ni] = 1; part.push(ni);
      }
    }
    if (part.length >= minPart) for (const i of part) keep[i] = 1;
  }
  const solid = (x, y) => x >= 0 && y >= 0 && x < src.w && y < src.h && keep[y * src.w + x] === 1;
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++) {
      const sx = x - t, sy = y - t;
      if (solid(sx, sy)) continue;
      let near = 99;
      for (let j = -t; j <= t; j++) for (let i = -t; i <= t; i++) if (solid(sx + i, sy + j)) near = Math.min(near, Math.max(Math.abs(i), Math.abs(j)));
      if (near <= t) p.set(x, y, near === 1 ? inner : outer);
    }
  return p;
}

export function noise(x, y, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export function smooth(x, y, scale, seed = 0) {
  const X = x / scale, Y = y / scale;
  const x0 = Math.floor(X), y0 = Math.floor(Y);
  const s = (t) => t * t * (3 - 2 * t);
  const u = s(X - x0), v = s(Y - y0);
  const a = noise(x0, y0, seed), b = noise(x0 + 1, y0, seed), c = noise(x0, y0 + 1, seed), d = noise(x0 + 1, y0 + 1, seed);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}
/** gradient (Perlin) noise in [0, 1]: no flat plateaus, so thresholds never trace the lattice (12/11/2026) */
export function perlin(x, y, scale, seed = 0) {
  const X = x / scale, Y = y / scale, x0 = Math.floor(X), y0 = Math.floor(Y), fx = X - x0, fy = Y - y0;
  const f = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const g = (ix, iy, dx, dy) => { const a = noise(ix, iy, seed) * Math.PI * 2; return Math.cos(a) * dx + Math.sin(a) * dy; };
  const u = f(fx), v = f(fy);
  const n00 = g(x0, y0, fx, fy), n10 = g(x0 + 1, y0, fx - 1, fy), n01 = g(x0, y0 + 1, fx, fy - 1), n11 = g(x0 + 1, y0 + 1, fx - 1, fy - 1);
  const n = (n00 * (1 - u) + n10 * u) * (1 - v) + (n01 * (1 - u) + n11 * u) * v; // about [-0.7, 0.7]
  return Math.max(0, Math.min(1, 0.5 + n * 0.75));
}
export function fbmP(x, y, scale, seed = 0) {
  return perlin(x, y, scale, seed) * 0.55 + perlin(x, y, scale / 2.1, seed + 1) * 0.28 + perlin(x, y, scale / 4.3, seed + 2) * 0.17;
}
export function fbm(x, y, scale, seed = 0) {
  return smooth(x, y, scale, seed) * 0.6 + smooth(x, y, scale / 2, seed + 1) * 0.28 + smooth(x, y, scale / 4, seed + 2) * 0.12;
}
/** F2 - F1 of a jittered grid: small values sit on cell borders (cracks, stone joints). */
export function worley(x, y, cell, seed = 0) {
  const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
  let d1 = 1e9, d2 = 1e9;
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const gx = cx + i, gy = cy + j;
      const fx = (gx + noise(gx, gy, seed)) * cell, fy = (gy + noise(gx, gy, seed + 1)) * cell;
      const d = Math.hypot(x - fx, y - fy);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
  return d2 - d1;
}

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- PNG ----------
const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
export function savePng(px, file, scale = 1) {
  const img = scale > 1 ? px.scaled(scale) : px;
  const raw = Buffer.alloc((img.w * 4 + 1) * img.h);
  for (let y = 0; y < img.h; y++) {
    raw[y * (img.w * 4 + 1)] = 0;
    for (let x = 0; x < img.w; x++) {
      const v = img.d[y * img.w + x], o = y * (img.w * 4 + 1) + 1 + x * 4;
      raw[o] = v >>> 24; raw[o + 1] = (v >>> 16) & 255; raw[o + 2] = (v >>> 8) & 255; raw[o + 3] = v & 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(img.w, 0); ihdr.writeUInt32BE(img.h, 4); ihdr[8] = 8; ihdr[9] = 6;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]));
}

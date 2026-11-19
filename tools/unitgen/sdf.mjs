// Tiny SDF ray-marcher that renders chibi 3D "paper dolls" straight to pixel art.
// World: X east, Y south (toward the viewer), Z up. Camera looks from the south, 30° above the ground.
import { Px } from '../mapgen/core.mjs';

// ---------- vectors ----------
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
// 3×3 matrices stored as columns [c0, c1, c2]
export const mv = (M, v) => [M[0][0] * v[0] + M[1][0] * v[1] + M[2][0] * v[2], M[0][1] * v[0] + M[1][1] * v[1] + M[2][1] * v[2], M[0][2] * v[0] + M[1][2] * v[1] + M[2][2] * v[2]];
export const mtv = (M, v) => [dot(M[0], v), dot(M[1], v), dot(M[2], v)];
export const mm = (A, B) => [mv(A, B[0]), mv(A, B[1]), mv(A, B[2])];
export const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export const rotX = (a) => [[1, 0, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]];
export const rotY = (a) => [[Math.cos(a), 0, -Math.sin(a)], [0, 1, 0], [Math.sin(a), 0, Math.cos(a)]];
export const rotZ = (a) => [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
/** Basis whose local z axis points along `dir` (for cylinders, discs, blades). */
export function basisZ(dir, upHint = [0, 0, 1]) {
  const z = norm(dir);
  let x = cross(Math.abs(dot(upHint, z)) > 0.95 ? [0, 1, 0] : upHint, z);
  x = norm(x);
  const y = cross(z, x);
  return [x, y, z];
}

// ---------- primitives (model space) ----------
// mat: material key, g: group id (for inner outlines), clip: {p, n} keeps the side where dot(x - p, n) < 0
export const ell = (c, r, mat, g, R = I3, extra = {}) => ({ k: 'ell', c, r, R, mat, g, ...extra });
export const sph = (c, r, mat, g, extra = {}) => ({ k: 'ell', c, r: [r, r, r], R: I3, mat, g, ...extra });
export const cone = (a, b, r1, r2, mat, g, extra = {}) => ({ k: 'rc', a, b, r1, r2, mat, g, ...extra });
export const box = (c, h, mat, g, R = I3, rr = 0.3, extra = {}) => ({ k: 'box', c, h, R, rr, mat, g, ...extra });
export const cyl = (c, dir, r, h, mat, g, extra = {}) => ({ k: 'cyl', c, R: basisZ(dir), r, h, mat, g, ...extra });

function boundOf(p) {
  switch (p.k) {
    case 'ell': return { c: p.c, r: Math.max(...p.r) };
    case 'rc': return { c: lerp(p.a, p.b, 0.5), r: len(sub(p.b, p.a)) / 2 + Math.max(p.r1, p.r2) };
    case 'box': return { c: p.c, r: len(p.h) + p.rr };
    case 'cyl': return { c: p.c, r: Math.hypot(p.r, p.h) };
  }
}

/** Move a model-space primitive into world space with p_w = A p + o. */
export function xform(p, A, o) {
  const P = (v) => add(mv(A, v), o);
  const q = { ...p };
  if (p.c) q.c = P(p.c);
  if (p.a) { q.a = P(p.a); q.b = P(p.b); }
  if (p.R) q.R = mm(A, p.R);
  if (p.clip) q.clip = { p: P(p.clip.p), n: mv(A, p.clip.n) };
  q.A = A; q.o = o;
  return q;
}

function sdRoundCone(p, a, b, r1, r2) {
  const ba = sub(b, a), l2 = dot(ba, ba);
  if (l2 < 1e-6) return len(sub(p, a)) - Math.max(r1, r2);
  const rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  const pa = sub(p, a), y = dot(pa, ba), z = y - l2;
  const xv = sub(mul(pa, l2), mul(ba, y)), x2 = dot(xv, xv);
  const y2 = y * y * l2, z2 = z * z * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
  return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}
export function sdf(p, x) {
  let d;
  switch (p.k) {
    case 'ell': {
      const q = mtv(p.R, sub(x, p.c));
      const k0 = Math.hypot(q[0] / p.r[0], q[1] / p.r[1], q[2] / p.r[2]);
      const k1 = Math.hypot(q[0] / (p.r[0] * p.r[0]), q[1] / (p.r[1] * p.r[1]), q[2] / (p.r[2] * p.r[2]));
      d = k1 < 1e-9 ? -Math.min(...p.r) : (k0 * (k0 - 1)) / k1;
      break;
    }
    case 'rc': d = sdRoundCone(x, p.a, p.b, p.r1, p.r2); break;
    case 'box': {
      const q = mtv(p.R, sub(x, p.c)).map((v, i) => Math.abs(v) - p.h[i]);
      d = Math.hypot(Math.max(q[0], 0), Math.max(q[1], 0), Math.max(q[2], 0)) + Math.min(Math.max(q[0], q[1], q[2]), 0) - p.rr;
      break;
    }
    case 'cyl': {
      const q = mtv(p.R, sub(x, p.c));
      const dx = Math.hypot(q[0], q[1]) - p.r, dz = Math.abs(q[2]) - p.h;
      d = Math.min(Math.max(dx, dz), 0) + Math.hypot(Math.max(dx, 0), Math.max(dz, 0));
      break;
    }
  }
  if (p.clip) d = Math.max(d, dot(sub(x, p.clip.p), p.clip.n));
  return d;
}

// ---------- camera ----------
const U = [0, -0.5, Math.sqrt(3) / 2]; // screen up
const Wv = [0, Math.sqrt(3) / 2, 0.5]; // toward the camera
export const project = (v) => [v[0], 0.5 * v[1] - (Math.sqrt(3) / 2) * v[2]];
const LIGHT = norm([-0.55, 0.45, 0.75]);

/**
 * Render world-space primitives into a Px.
 * mats: { key: { ramp:[dark, mid, light, hi], spec?, emissive?, pattern?(pm, pl, n) -> key|color|null } }
 */
export function render(prims, mats, w, h, ox, oy, { outline = '#1b1726', flash = false, patterns = {}, scale = 1 } = {}) {
  const K = scale;
  const px = new Px(w, h);
  const depth = new Float32Array(w * h).fill(-1e9), gid = new Int32Array(w * h).fill(-1), darkOf = new Array(w * h);
  const ps = prims.map((p) => ({ ...p, bd: boundOf(p) }));
  for (const p of ps) { const [sx, sy] = project(p.bd.c); p.sx = sx * K + ox; p.sy = sy * K + oy; p.br = p.bd.r * K; }
  const groups = new Map();
  for (let j = 0; j < h; j++) {
    const rowC = ps.filter((p) => Math.abs(j + 0.5 - p.sy) <= p.br + 1);
    if (!rowC.length) continue;
    for (let i = 0; i < w; i++) {
      const X = (i + 0.5 - ox) / K, syr = (j + 0.5 - oy) / K;
      const cand = rowC.filter((p) => Math.hypot(i + 0.5 - p.sx, j + 0.5 - p.sy) <= p.br + 0.8);
      if (!cand.length) continue;
      const base = [X, -syr * U[1], -syr * U[2]];
      let sMax = -1e9, sMin = 1e9;
      for (const p of cand) { const sc = dot(sub(p.bd.c, base), Wv); sMax = Math.max(sMax, sc + p.bd.r); sMin = Math.min(sMin, sc - p.bd.r); }
      let s = sMax, hit = null;
      for (let it = 0; it < 64 && s > sMin; it++) {
        const x = add(base, mul(Wv, s));
        let d = 1e9, who = null;
        for (const p of cand) { const v = sdf(p, x); if (v < d) { d = v; who = p; } }
        if (d < 0.05) { hit = { p: who, x }; break; }
        s -= Math.max(d * 0.8, 0.03);
      }
      if (!hit) continue;
      const { p, x } = hit, e = 0.2;
      const n = norm([sdf(p, add(x, [e, 0, 0])) - sdf(p, sub(x, [e, 0, 0])), sdf(p, add(x, [0, e, 0])) - sdf(p, sub(x, [0, e, 0])), sdf(p, add(x, [0, 0, e])) - sdf(p, sub(x, [0, 0, e]))]);
      let matKey = p.mat, mat = mats[matKey];
      if (!mat) throw new Error('no material ' + matKey);
      let fixed = null;
      const patFn = p.pattern ? patterns[p.pattern] : mat.pattern;
      if (patFn) {
        const pm = mtv(p.A, sub(x, p.o));
        const pl = p.R ? mtv(p.R, sub(x, p.c)) : (p.a ? [len(sub(x, p.a)), 0, 0] : [0, 0, 0]);
        const r = patFn(pm, pl, n, p);
        if (r) { if (r[0] === '#') fixed = r; else { matKey = r; mat = mats[r]; } }
      }
      const ndl = dot(n, LIGHT);
      let ti = mat.emissive ? (ndl > 0.3 ? 3 : ndl > -0.3 ? 2 : 1) : ndl > 0.8 ? 3 : ndl > 0.42 ? 2 : ndl > 0.02 ? 1 : 0;
      let col = fixed ?? mat.ramp[ti];
      if (!fixed && mat.spec) { const hv = norm(add(LIGHT, Wv)); if (dot(n, hv) > 0.93) col = mat.spec; }
      if (flash) col = '#ffffff';
      const k = j * w + i;
      px.set(i, j, col);
      depth[k] = dot(x, Wv);
      if (!groups.has(p.g)) groups.set(p.g, groups.size);
      gid[k] = groups.get(p.g);
      darkOf[k] = flash ? '#d8d8e8' : fixed ? mat.ramp[0] : mat.ramp[0];
    }
  }
  // inner lines: the farther pixel at a boundary between two groups gets its darkest tone
  const inner = [];
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const k = j * w + i;
      if (gid[k] < 0) continue;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = i + di, nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= w || nj >= h) continue;
        const nk = nj * w + ni;
        if (gid[nk] >= 0 && gid[nk] !== gid[k] && depth[nk] > depth[k] + 0.8) { inner.push(k); break; }
      }
    }
  for (const k of inner) px.set(k % w, (k / w) | 0, darkOf[k]);
  // outer silhouette
  if (outline) {
    const solid = (i, j) => i >= 0 && j >= 0 && i < w && j < h && gid[j * w + i] >= 0;
    const edge = [];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (!solid(i, j) && (solid(i + 1, j) || solid(i - 1, j) || solid(i, j + 1) || solid(i, j - 1))) edge.push([i, j]);
    for (const [i, j] of edge) px.set(i, j, outline);
  }
  return px;
}

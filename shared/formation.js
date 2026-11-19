// Hexagon formation (docs/design/07): ring k has 6k slots, slot 0 of each ring is the top vertex, then clockwise.
export const SLOT_D = 1.5;

export function slotOffset(index, d = SLOT_D) {
  let k = 1;
  while (3 * k * (k + 1) <= index) k++;
  const r = index - 3 * k * (k - 1);
  const i = Math.floor(r / k), j = r % k;
  const corner = (n) => {
    const a = ((-90 + 60 * (n % 6)) * Math.PI) / 180;
    return { x: k * d * Math.cos(a), y: k * d * Math.sin(a) };
  };
  const a = corner(i), b = corner(i + 1);
  return { x: a.x + ((b.x - a.x) * j) / k, y: a.y + ((b.y - a.y) * j) / k };
}
export const ringOf = (index) => { let k = 1; while (3 * k * (k + 1) <= index) k++; return k; };

/**
 * Place units (in order) into slots. Each item needs `slots` contiguous indices inside one ring.
 * Returns an array of slot lists (or null when it doesn't fit). Skipped odd slots stay free for 1-slot units bought later.
 */
export function allocate(sizes, total) {
  const used = new Uint8Array(total);
  return sizes.map((n) => {
    const r = findFree(used, n, total);
    if (r) for (const s of r) used[s] = 1;
    return r;
  });
}
export function findFree(used, n, total) {
  for (let s = 0; s + n <= total; s++) {
    let ok = true;
    const ring = ringOf(s);
    for (let k = 0; k < n; k++) if (used[s + k] || ringOf(s + k) !== ring) { ok = false; break; }
    if (ok) return Array.from({ length: n }, (_, k) => s + k);
  }
  return null;
}
export function slotsCenter(list) {
  let x = 0, y = 0;
  for (const s of list) { const o = slotOffset(s); x += o.x; y += o.y; }
  return { x: x / list.length, y: y / list.length };
}

// ---------------------------------------------------------------------------------------------
// Sized hexagon rings (current layout). Every unit takes an arc on a hexagon ring as wide as its
// sprite; a ring grows when it holds big units, the next ring starts outside it. Units of a ring
// are spread evenly, the first one on the top vertex, then clockwise. No capacity limit.
export const UNIT_W = { 'dan-quan': 1.5, 'kiem-si': 1.5, 'linh-giao': 1.5, 'cung-thu': 1.5, 'phap-su': 1.5, 'ky-binh': 1.9, 'hiep-si': 1.9, 'may-ban-da': 2.4, 'su-thuu': 2.8, rong: 3.8 };
/** ranged units (arrows, orbs, fireballs) always stand inside, melee outside (11/11/2026) */
export const RANGED_IN = new Set(['cung-thu', 'phap-su', 'may-ban-da']);
/** 13/11/2026: marching order, front → back (the formation turns to the hero's heading; tanks lead, siege trails) */
export const FRONT_ORDER = ['hiep-si', 'ky-binh', 'kiem-si', 'linh-giao', 'dan-quan', 'su-thuu', 'rong', 'cung-thu', 'phap-su', 'may-ban-da'];
/** inner → outer when sorted by unit type */
export const TYPE_ORDER = ['cung-thu', 'phap-su', 'may-ban-da', 'linh-giao', 'kiem-si', 'dan-quan', 'ky-binh', 'hiep-si', 'su-thuu', 'rong'];

function hexPoint(R, s) {
  // point at perimeter distance s (clockwise from the top vertex) on a pointy-top hexagon of circumradius R
  const P = 6 * R;
  s = ((s % P) + P) % P;
  const i = Math.floor(s / R), f = (s - i * R) / R;
  const a0 = ((-90 + 60 * i) * Math.PI) / 180, a1 = ((-90 + 60 * (i + 1)) * Math.PI) / 180;
  return { x: R * (Math.cos(a0) + (Math.cos(a1) - Math.cos(a0)) * f), y: R * (Math.sin(a0) + (Math.sin(a1) - Math.sin(a0)) * f) };
}
/**
 * types: unit types in placement order → offsets [{x, y, ring}] in the same order.
 * newRingOnType: start a new ring when the type changes and the current ring is at least half full.
 */
export function layoutRings(types, newRingOnType = false, groups = null) {
  const rings = [];
  const radius = (k, maxW) => (k === 0 ? 0.75 + 0.55 * maxW : rings[k - 1].R + 0.55 * (rings[k - 1].maxW + maxW));
  let cur = null;
  const ringOfUnit = [];
  types.forEach((t, idx) => {
    const w = UNIT_W[t] ?? 1.5;
    if (cur && newRingOnType && types[idx - 1] !== t && cur.sumW >= 6 * cur.R * 0.5) cur = null;
    if (cur && groups && groups[idx - 1] !== groups[idx]) cur = null; // ranged / melee never share a ring
    if (cur) {
      const k = rings.length - 1, maxW = Math.max(cur.maxW, w), R = radius(k, maxW);
      if (cur.sumW + w <= 6 * R + 1e-6) { cur.items.push(idx); cur.sumW += w; cur.maxW = maxW; cur.R = R; ringOfUnit[idx] = k; return; }
    }
    cur = { items: [idx], sumW: w, maxW: w, R: 0 };
    rings.push(cur);
    cur.R = radius(rings.length - 1, w);
    ringOfUnit[idx] = rings.length - 1;
  });
  const out = new Array(types.length);
  rings.forEach((r, k) => {
    const P = 6 * r.R, scale = P / r.sumW;
    let cum = 0;
    const w0 = UNIT_W[types[r.items[0]]] ?? 1.5;
    for (const idx of r.items) {
      const w = UNIT_W[types[idx]] ?? 1.5;
      const p = hexPoint(r.R, (cum + w / 2 - w0 / 2) * scale);
      out[idx] = { x: p.x, y: p.y, ring: k };
      cum += w;
    }
  });
  return out;
}

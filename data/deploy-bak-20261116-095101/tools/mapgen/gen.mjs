// Sodier War world generation: 384×384 tiles (2.25× the first 256×256 map), 10 biomes, no rivers, no mountains.
import { fbm, fbmP, smooth, noise, rng } from './core.mjs';

// the 512 map (seed ≥ 20261114, 12/11/2026): bigger, gradient-noise climate (no straight biome borders). Pick it with SEED=… in the env.
export const NEW_MAP = +(process.env.SEED ?? 20261114) >= 20261114;
export const W = NEW_MAP ? 512 : 384, H = W;
const MINE_SCALE = NEW_MAP ? (W / 384) ** 2 * 0.85 : 1; // more mines on the bigger map (a bit thinner)
const K = W / 256; // size factor against the original 256 map (distances ×K, counts ×K²)
export const B = { MEADOW: 0, STEPPE: 1, FOREST: 2, PINE: 3, TUNDRA: 4, DESERT: 5, BADLANDS: 6, SWAMP: 7, ASH: 8, CORE: 9, HELL: 10, HELLB: 11 };
export const BIOME_INFO = [
  { id: 'meadow', name: 'Đồng cỏ', speed: 1.0 },
  { id: 'steppe', name: 'Thảo nguyên khô', speed: 1.0 },
  { id: 'forest', name: 'Rừng lá rộng', speed: 0.85 },
  { id: 'pine', name: 'Rừng thông', speed: 0.85 },
  { id: 'tundra', name: 'Đồng tuyết', speed: 0.85 },
  { id: 'desert', name: 'Sa mạc', speed: 0.9 },
  { id: 'badlands', name: 'Hoang mạc đá đỏ', speed: 0.9 },
  { id: 'swamp', name: 'Đầm lầy', speed: 0.75 },
  { id: 'ash', name: 'Vùng tro cháy', speed: 0.9 },
  { id: 'core', name: 'Cao nguyên cổ', speed: 1.0 },
  { id: 'hell', name: 'Đất Ngục', speed: 1.0 }, // around the Hell Gate (16/11/2026)
  { id: 'hellb', name: 'Sân gạch Ngục', speed: 1.0 },
];
/** Obstacles / features on a tile. ICE is walkable (slow); everything else except NONE blocks ground units. */
export const O = { NONE: 0, TREE: 1, PINE: 2, BOULDER: 3, CACTUS: 4, WATER: 5, ICE: 6, CHASM: 7, HOUSE: 8, WELL: 9, PILLAR: 10, DEADTREE: 11, CHARRED: 12, PALM: 13, TOWER: 14, WALL: 15, MINE: 16 };
export const blocks = (o) => o !== O.NONE && o !== O.ICE;

export const MINES = {
  iron: { name: 'Sắt', count: 99, r: [0.55, 1.0], pref: ['meadow', 'steppe', 'badlands', 'tundra'], size: 3 },
  coal: { name: 'Than', count: 77, r: [0.5, 1.0], pref: ['forest', 'pine', 'meadow', 'tundra'], size: 3 },
  gold: { name: 'Vàng', count: 50, r: [0.32, 0.8], pref: ['desert', 'badlands', 'steppe'], size: 3 },
  oil: { name: 'Dầu', count: 36, r: [0.28, 0.68], pref: ['desert', 'swamp', 'steppe'], size: 3 },
  tar: { name: 'Dầu đen', count: 23, r: [0.2, 0.55], pref: ['swamp', 'badlands', 'steppe'], size: 3 },
  crystal: { name: 'Pha lê', count: 18, r: [0.16, 0.5], pref: ['forest', 'pine', 'swamp', 'tundra'], size: 3 },
  diamond: { name: 'Kim cương', count: 6, r: [0, 0.14], pref: ['core'], size: 4 },
};

const CORE_R = 0.16;

/** Distance from (px, py) to segment ab, and the position t along it. */
export function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L));
  return [Math.hypot(px - ax - dx * t, py - ay - dy * t), t];
}
/** Half-width of a path at index k (tapered paths are thin at both ends). */
export function halfWidth(path, k) {
  if (!path.taper) return path.w;
  const u = k / (path.pts.length - 1);
  return path.w * Math.sqrt(Math.max(0, Math.sin(Math.PI * u)));
}
/** Call fn(tileIndex) for every tile whose centre lies within the path's width (+ extra). */
export function stampPath(path, fn, extra = 0) {
  const P = path.pts;
  for (let k = 0; k + 1 < P.length; k++) {
    const [ax, ay] = P[k], [bx, by] = P[k + 1];
    const r = Math.ceil(path.w + extra + 1);
    for (let y = Math.floor(Math.min(ay, by)) - r; y <= Math.ceil(Math.max(ay, by)) + r; y++)
      for (let x = Math.floor(Math.min(ax, bx)) - r; x <= Math.ceil(Math.max(ax, bx)) + r; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const [d, t] = segDist(x + 0.5, y + 0.5, ax, ay, bx, by);
        if (d <= halfWidth(path, k + t) + extra) fn(y * W + x);
      }
  }
}
/** Moving-average smoothing so A* staircases become curves. */
function smoothPts(pts, win = 4, passes = 3) {
  let p = pts;
  for (let n = 0; n < passes; n++)
    p = p.map((_, i) => {
      let sx = 0, sy = 0, c = 0;
      for (let j = Math.max(0, i - win); j <= Math.min(p.length - 1, i + win); j++) { sx += p[j][0]; sy += p[j][1]; c++; }
      return i === 0 || i === p.length - 1 ? p[i] : [sx / c, sy / c];
    });
  return p;
} // r < CORE_R is the ancient plateau (≈ 20 tiles)

export function generate(seed = 20261111) {
  const R = rng(seed);
  const N = W * H;
  const idx = (x, y) => y * W + x;
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const rOf = (x, y) => Math.hypot(x + 0.5 - W / 2, y + 0.5 - H / 2) / (W / 2);

  // ---- 1. climate fields: north cold, south hot; moisture is free noise ----
  const temp = new Float32Array(N), moist = new Float32Array(N);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      // value noise has flat spots along its lattice lines, so a biome threshold there gives a straight border;
      // a rotated, domain-warped lookup bends every border into a natural curve
      if (NEW_MAP) {
        // gradient noise + a two-level domain warp; the north→south gradient uses the warped y too, so no border runs straight
        const w1x = (fbmP(x, y, 90, seed + 31) - 0.5) * 70, w1y = (fbmP(x, y, 90, seed + 37) - 0.5) * 70;
        const wx = x + w1x + (fbmP(x + w1x, y + w1y, 34, seed + 41) - 0.5) * 26, wy = y + w1y + (fbmP(x + w1x, y + w1y, 34, seed + 47) - 0.5) * 26;
        const rx = wx * 0.8 - wy * 0.6, ry = wx * 0.6 + wy * 0.8;
        const fine = (fbmP(rx, ry, 14, seed + 43) - 0.5) * 0.12;
        temp[idx(x, y)] = 0.5 * (Math.max(0, Math.min(H, wy)) / H) + 0.5 * fbmP(rx, ry, 150, seed + 11) + fine;
        moist[idx(x, y)] = fbmP(ry, -rx, 120, seed + 23) + fine * 0.8;
        continue;
      }
      const wx = x + (fbm(x, y, 48, seed + 31) - 0.5) * 60, wy = y + (fbm(x, y, 48, seed + 37) - 0.5) * 60;
      const rx = wx * 0.8 - wy * 0.6, ry = wx * 0.6 + wy * 0.8;
      const fine = (fbm(rx, ry, 16, seed + 43) - 0.5) * 0.1; // small wiggles so no border runs straight for long
      temp[idx(x, y)] = 0.55 * (y / H) + 0.45 * fbm(rx, ry, 70 * 1.5, seed + 11) + fine;
      moist[idx(x, y)] = fbm(ry, -rx, 56 * 1.5, seed + 23) + fine * 0.8;
    }

  // ---- 2. biomes by rank so shares are stable for any seed ----
  const biome = new Uint8Array(N);
  const open = [];
  for (let i = 0; i < N; i++) if (rOf(i % W, (i / W) | 0) >= CORE_R) open.push(i); else biome[i] = B.CORE;
  const q = (arr, key, p) => { const s = arr.map((i) => key[i]).sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  const tCold = q(open, temp, 0.17), tHot = q(open, temp, 0.79);
  const cold = open.filter((i) => temp[i] < tCold), hot = open.filter((i) => temp[i] >= tHot);
  const mid = open.filter((i) => temp[i] >= tCold && temp[i] < tHot);
  const mCold = q(cold, moist, 0.5);
  for (const i of cold) biome[i] = moist[i] >= mCold ? B.PINE : B.TUNDRA;
  const mHot = q(hot, moist, 0.6);
  for (const i of hot) biome[i] = moist[i] < mHot ? B.DESERT : B.BADLANDS;
  const mSw = q(mid, moist, 0.87), mFo = q(mid, moist, 0.62), mSt = q(mid, moist, 0.24);
  for (const i of mid) biome[i] = moist[i] >= mSw ? B.SWAMP : moist[i] >= mFo ? B.FOREST : moist[i] < mSt ? B.STEPPE : B.MEADOW;
  // ragged borders: every tile takes the biome of a nearby, slightly shifted tile, so long straight edges break up
  {
    const src = biome.slice();
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = idx(x, y);
        if (src[i] === B.CORE) continue;
        const jx = Math.round(x + (smooth(x, y, 5, seed + 61) - 0.5) * 9 + (noise(x, y, seed + 63) - 0.5) * 2.2);
        const jy = Math.round(y + (smooth(x, y, 5, seed + 67) - 0.5) * 9 + (noise(x, y, seed + 69) - 0.5) * 2.2);
        const j = idx(Math.max(0, Math.min(W - 1, jx)), Math.max(0, Math.min(H - 1, jy)));
        if (src[j] !== B.CORE) biome[i] = src[j];
      }
  }

  const obst = new Uint8Array(N);
  const road = new Uint8Array(N);
  const objects = []; // drawable multi-tile things: { t, x, y, v }
  const decor = []; // non-blocking small sprites: { t, x, y, v }
  const mines = [];
  const spawns = [];
  const villages = [];
  const towers = [];

  // ---- 3. spawns: 24 on a ring, 15° apart ----
  for (let k = 0; k < 12 * K; k++) {
    const step = 360 / (12 * K), a = ((step / 2 + step * k - 90) * Math.PI) / 180;
    spawns.push({ n: k + 1, x: Math.round(W / 2 + Math.cos(a) * 0.86 * (W / 2)), y: Math.round(H / 2 + Math.sin(a) * 0.86 * (H / 2)) });
  }

  // ---- 4. mines ----
  const bName = (x, y) => BIOME_INFO[biome[idx(x, y)]].id;
  const farFromMines = (x, y, d) => mines.every((m) => Math.hypot(m.x - x, m.y - y) >= d);
  const addMine = (type, x, y) => mines.push({ type, x, y, size: MINES[type].size });
  // guaranteed starter mines: 2 iron + 1 coal 12–20 tiles from every spawn
  for (const s of spawns)
    for (const type of ['iron', 'iron', 'coal']) {
      for (let tries = 0; tries < 400; tries++) {
        const a = R() * Math.PI * 2, d = 12 + R() * 8;
        const x = Math.round(s.x + Math.cos(a) * d), y = Math.round(s.y + Math.sin(a) * d);
        if (x < 6 || y < 6 || x > W - 7 || y > H - 7 || !farFromMines(x, y, 10)) continue;
        addMine(type, x, y); break;
      }
    }
  // the diamond mines sit around the temple plaza (4 on the small map, 8 on the big one)
  const nDia = MINES.diamond.count;
  for (let k = 0; k < nDia; k++) {
    const a = ((180 / nDia + (360 / nDia) * k) * Math.PI) / 180;
    addMine('diamond', Math.round(W / 2 + Math.cos(a) * 12 * K), Math.round(H / 2 + Math.sin(a) * 12 * K));
  }
  for (const [type, m] of Object.entries(MINES)) {
    if (type === 'diamond') continue;
    let left = Math.round(m.count * (type === 'diamond' ? 1 : MINE_SCALE)) - mines.filter((x) => x.type === type).length;
    for (let tries = 0; left > 0 && tries < 60000 * K * K; tries++) {
      const x = 6 + Math.floor(R() * (W - 12)), y = 6 + Math.floor(R() * (H - 12));
      const r = rOf(x, y);
      if (r < m.r[0] || r > m.r[1] || biome[idx(x, y)] === B.CORE) continue;
      if (R() > (m.pref.includes(bName(x, y)) ? 1 : 0.12)) continue;
      if (!farFromMines(x, y, 12) || spawns.some((s) => Math.hypot(s.x - x, s.y - y) < 11)) continue;
      addMine(type, x, y); left--;
    }
  }

  // ---- 5. ash fields around the tar pits ----
  for (const m of mines.filter((m) => m.type === 'tar')) {
    const rad = 4.5 + R() * 2.5;
    for (let y = m.y - 12; y <= m.y + 12; y++)
      for (let x = m.x - 12; x <= m.x + 12; x++)
        if (inside(x, y) && biome[idx(x, y)] !== B.CORE && Math.hypot(x - m.x, y - m.y) < rad * (0.75 + 0.5 * smooth(x, y, 5, seed + 31))) biome[idx(x, y)] = B.ASH;
  }

  // ---- 6. water: ponds, swamp pools, oases, frozen lakes ----
  const pond = (cx, cy, rad, ice) => {
    for (let y = cy - rad - 3; y <= cy + rad + 3; y++)
      for (let x = cx - rad - 3; x <= cx + rad + 3; x++)
        if (inside(x, y) && Math.hypot((x - cx) * 0.85, y - cy) < rad * (0.7 + 0.6 * smooth(x, y, 4, seed + 41))) obst[idx(x, y)] = ice ? O.ICE : O.WATER;
  };
  const pick = (want, n, minR, maxR) => {
    const out = [];
    for (let tries = 0; out.length < n && tries < 20000 * K * K; tries++) {
      const x = 8 + Math.floor(R() * (W - 16)), y = 8 + Math.floor(R() * (H - 16));
      if (biome[idx(x, y)] !== want) continue;
      const r = rOf(x, y);
      if (r < minR || r > maxR) continue;
      if (!farFromMines(x, y, 9) || out.some((p) => Math.hypot(p.x - x, p.y - y) < 18)) continue;
      out.push({ x, y });
    }
    return out;
  };
  for (const p of pick(B.MEADOW, 7 * K * K, 0.2, 0.95)) pond(p.x, p.y, 2 + Math.floor(R() * 3), false);
  for (const p of pick(B.FOREST, 4 * K * K, 0.2, 0.95)) pond(p.x, p.y, 2 + Math.floor(R() * 2), false);
  for (const p of pick(B.TUNDRA, 5 * K * K, 0.2, 0.95)) pond(p.x, p.y, 3 + Math.floor(R() * 4), true);
  const oases = pick(B.DESERT, 4 * K * K, 0.25, 0.95);
  for (const p of oases) pond(p.x, p.y, 2 + Math.floor(R() * 2), false);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (biome[idx(x, y)] === B.SWAMP && fbm(x, y, 9, seed + 51) > 0.6) obst[idx(x, y)] = O.WATER;

  // ---- 7. canyons (chasms) in the red badlands: smooth curves that taper at both ends ----
  const chasmPaths = [];
  for (let tries = 0; chasmPaths.length < 14 * K * K && tries < 4000 * K * K; tries++) {
    let x = 8 + R() * (W - 16), y = 8 + R() * (H - 16);
    if (biome[idx(x | 0, y | 0)] !== B.BADLANDS) continue;
    let a = R() * Math.PI * 2;
    const len = 12 + Math.floor(R() * 18), pts = [];
    for (let s = 0; s < len; s++) {
      if (!inside(x | 0, y | 0) || biome[idx(x | 0, y | 0)] !== B.BADLANDS) break;
      pts.push([x, y]);
      a += (R() - 0.5) * 0.5; x += Math.cos(a) * 0.9; y += Math.sin(a) * 0.9;
    }
    if (pts.length < 8 || !farFromMines(pts[pts.length >> 1][0], pts[pts.length >> 1][1], 8)) continue;
    chasmPaths.push({ pts, w: 0.75 + R() * 0.6, taper: true });
  }
  for (const c of chasmPaths) stampPath(c, (i) => { if (biome[i] === B.BADLANDS) obst[i] = O.CHASM; }, 0.1);

  // ---- 8. vegetation and rocks ----
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = idx(x, y);
      if (obst[i]) continue;
      const b = biome[i], n = noise(x, y, seed + 71), dense = fbm(x, y, 7, seed + 73);
      switch (b) {
        case B.FOREST: if (dense > 0.5 || n < 0.05) obst[i] = O.TREE; break;
        case B.PINE: if (dense > 0.52 || n < 0.05) obst[i] = O.PINE; break;
        case B.TUNDRA: if (n < 0.025) obst[i] = O.PINE; else if (n < 0.035) obst[i] = O.BOULDER; break;
        case B.MEADOW: if ((dense > 0.7 && n < 0.45) || n < 0.008) obst[i] = O.TREE; break;
        case B.STEPPE: if (n < 0.008) obst[i] = O.BOULDER; else if (n < 0.012) obst[i] = O.TREE; break;
        case B.DESERT: if (n < 0.016) obst[i] = O.CACTUS; else if (n < 0.022) obst[i] = O.BOULDER; break;
        case B.BADLANDS: if (dense > 0.66 && n < 0.35) obst[i] = O.BOULDER; else if (n < 0.012) obst[i] = O.BOULDER; break;
        case B.SWAMP: if (n < 0.06) obst[i] = O.DEADTREE; break;
        case B.ASH: if (n < 0.04) obst[i] = O.CHARRED; break;
      }
    }
  // oasis palms
  for (const p of oases)
    for (let k = 0; k < 6; k++) {
      const a = R() * Math.PI * 2, d = 4 + R() * 2.5;
      const x = Math.round(p.x + Math.cos(a) * d), y = Math.round(p.y + Math.sin(a) * d);
      if (inside(x, y) && !obst[idx(x, y)]) obst[idx(x, y)] = O.PALM;
    }

  // ---- 9. the ancient plateau: plaza, pillar rings, broken walls ----
  const cx = W / 2, cy = H / 2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (biome[idx(x, y)] === B.CORE) obst[idx(x, y)] = O.NONE;
  for (let k = 0; k < 16 * K; k++) {
    const a = (k / (16 * K)) * Math.PI * 2 + 0.1;
    if (k % 4 === 2) continue; // gaps for the roads
    const x = Math.round(cx + Math.cos(a) * 18 * K), y = Math.round(cy + Math.sin(a) * 18 * K);
    obst[idx(x, y)] = R() < 0.3 ? O.WALL : O.PILLAR;
    objects.push({ t: obst[idx(x, y)] === O.WALL ? 'wall' : 'pillar', x, y, v: k });
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.round(cx + Math.cos(a) * 6), y = Math.round(cy + Math.sin(a) * 6);
    obst[idx(x, y)] = O.PILLAR;
    objects.push({ t: 'pillar', x, y, v: 100 + k });
  }
  decor.push({ t: 'altar', x: cx, y: cy, v: 0 });
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (biome[idx(x, y)] !== B.CORE || d < 8 || obst[idx(x, y)]) continue;
      const n = noise(x, y, seed + 111);
      if (n < 0.012) { obst[idx(x, y)] = O.PILLAR; objects.push({ t: 'pillar', x, y, v: 200 }); }
      else if (n < 0.022) { obst[idx(x, y)] = O.WALL; objects.push({ t: 'wall', x, y, v: 201 }); }
    }

  // ---- 10. abandoned villages and watchtowers ----
  for (let tries = 0; villages.length < 8 * K * K && tries < 20000 * K * K; tries++) {
    const x = 10 + Math.floor(R() * (W - 20)), y = 10 + Math.floor(R() * (H - 20));
    const r = rOf(x, y), b = biome[idx(x, y)];
    if (r < 0.42 || r > 0.8 || ![B.MEADOW, B.STEPPE, B.TUNDRA, B.DESERT].includes(b)) continue;
    if (!farFromMines(x, y, 10) || villages.some((v) => Math.hypot(v.x - x, v.y - y) < 40) || spawns.some((s) => Math.hypot(s.x - x, s.y - y) < 16)) continue;
    villages.push({ x, y });
  }
  const clearAt = (x, y, rad) => {
    for (let j = -rad; j <= rad; j++)
      for (let i = -rad; i <= rad; i++) {
        const tx = x + i, ty = y + j;
        if (inside(tx, ty) && Math.hypot(i, j) <= rad + 0.3 && obst[idx(tx, ty)] !== O.MINE) obst[idx(tx, ty)] = O.NONE;
      }
  };
  for (const v of villages) {
    clearAt(v.x, v.y, 7);
    const n = 4 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + R() * 0.5, d = 4 + R() * 1.5;
      const hx = Math.round(v.x + Math.cos(a) * d) - 1, hy = Math.round(v.y + Math.sin(a) * d) - 1;
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) obst[idx(hx + i, hy + j)] = O.HOUSE;
      objects.push({ t: 'house', x: hx, y: hy, v: Math.floor(R() * 1000) });
    }
    obst[idx(v.x, v.y)] = O.WELL;
    objects.push({ t: 'well', x: v.x, y: v.y, v: 0 });
    for (const t of ['fence', 'fence', 'fence', 'hay', 'hay', 'crate', 'crate', 'cart', 'garden', 'garden']) {
      for (let k = 0; k < 30; k++) {
        const a = R() * Math.PI * 2, d = 2 + R() * 6, x = Math.round(v.x + Math.cos(a) * d), y = Math.round(v.y + Math.sin(a) * d);
        if (obst[idx(x, y)] || decor.some((e) => e.x === x && e.y === y)) continue;
        decor.push({ t, x, y, v: Math.floor(R() * 1000) });
        if (t === 'fence' || t === 'garden') for (let j = 1; j < 3; j++) if (!obst[idx(x + j, y)]) decor.push({ t, x: x + j, y, v: Math.floor(R() * 1000) });
        break;
      }
    }
  }
  for (let k = 0; k < 8 * K; k++) {
    const a = (((22.5 / K) + (45 / K) * k) * Math.PI) / 180;
    for (let d = 0.5; d < 0.62; d += 0.01) {
      const x = Math.round(cx + Math.cos(a) * d * (W / 2)), y = Math.round(cy + Math.sin(a) * d * (H / 2));
      if (!farFromMines(x, y, 8) || obst[idx(x, y)] === O.WATER || obst[idx(x, y)] === O.CHASM) continue;
      clearAt(x, y, 3);
      obst[idx(x, y)] = O.TOWER;
      towers.push({ x, y });
      objects.push({ t: 'tower', x, y, v: k });
      break;
    }
  }

  // ---- 11. clear around mines and spawns, then stamp mine footprints ----
  for (const m of mines) clearAt(m.x, m.y, m.type === 'diamond' ? 4 : 4);
  for (const s of spawns) clearAt(s.x, s.y, 6);
  for (const m of mines) {
    const h = m.size === 4 ? [-2, 1] : [-1, 1];
    for (let j = h[0]; j <= h[1]; j++) for (let i = h[0]; i <= h[1]; i++) obst[idx(m.x + i, m.y + j)] = O.MINE;
  }

  // ---- 12. border: a natural wall of trees / rocks, 3 tiles thick ----
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const e = Math.min(x, y, W - 1 - x, H - 1 - y);
      if (e > 2 || (e === 2 && noise(x, y, seed + 81) < 0.4)) continue;
      const b = biome[idx(x, y)];
      obst[idx(x, y)] = b === B.PINE || b === B.TUNDRA ? O.PINE : b === B.DESERT || b === B.BADLANDS ? O.BOULDER : b === B.ASH ? O.CHARRED : b === B.SWAMP ? O.DEADTREE : O.TREE;
    }

  // ---- 13. roads: A* from every spawn and village to the plateau ----
  const cost = (x, y) => {
    const o = obst[idx(x, y)];
    if (o === O.WATER || o === O.CHASM || o === O.MINE || o === O.HOUSE || o === O.WELL || o === O.PILLAR || o === O.WALL || o === O.TOWER) return Infinity;
    if (Math.min(x, y, W - 1 - x, H - 1 - y) < 3) return Infinity;
    let c = 1 + smooth(x, y, 9, seed + 91) * 1.2;
    if (o) c += 4;
    if (biome[idx(x, y)] === B.SWAMP) c += 1.5;
    if (road[idx(x, y)]) c *= 0.3;
    return c;
  };
  const astar = (sx, sy, goal) => {
    const g = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1);
    const heap = [];
    const push = (i, f) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
    const s = idx(sx, sy); g[s] = 0; push(s, 0);
    while (heap.length) {
      const [, i] = pop();
      const x = i % W, y = (i / W) | 0;
      if (goal(x, y)) { const path = []; for (let k = i; k >= 0; k = from[k]) path.push(k); return path; }
      for (let j = -1; j <= 1; j++)
        for (let k = -1; k <= 1; k++) {
          if (!j && !k) continue;
          const nx = x + k, ny = y + j;
          if (!inside(nx, ny)) continue;
          const c = cost(nx, ny) * (j && k ? 1.42 : 1);
          if (c === Infinity) continue;
          const ni = idx(nx, ny), ng = g[i] + c;
          if (ng < g[ni]) { g[ni] = ng; from[ni] = i; push(ni, ng + Math.hypot(nx - cx, ny - cy) * 0.9); }
        }
    }
    return [];
  };
  const toCore = (x, y) => rOf(x, y) < CORE_R * 1.15;
  const roadPaths = [];
  const lay = (path, w) => {
    if (path.length < 2) return;
    const pts = smoothPts(path.reverse().map((i) => [(i % W) + 0.5, ((i / W) | 0) + 0.5]));
    const rp = { pts, w, taper: false };
    roadPaths.push(rp);
    stampPath(rp, (i) => {
      const o = obst[i];
      if (o === O.WATER || o === O.CHASM || o === O.MINE || o === O.HOUSE || o === O.WELL || o === O.TOWER || o === O.PILLAR || o === O.WALL) return;
      obst[i] = O.NONE; road[i] = 1;
    });
  };
  for (const s of spawns) lay(astar(s.x, s.y, toCore), 1.25);
  for (const v of villages) lay(astar(v.x, v.y + 3, (x, y) => road[idx(x, y)] === 1 && Math.hypot(x - v.x, y - v.y) > 8), 0.75);

  // ---- 13b. Đất Ngục around the Hell Gate (16/11/2026): the east edge at mid height, where the server puts the gate ----
  // noise only (no R()), so every other part of the map comes out exactly as before
  if (NEW_MAP) {
    const gx = W - 16, gy = H / 2, RAD = 27, KEEP = [O.MINE, O.HOUSE, O.WELL, O.TOWER, O.WALL, O.CHASM];
    const nearMine = (x, y, r) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (inside(x + i, y + j) && obst[idx(x + i, y + j)] === O.MINE) return true; return false; };
    for (let y = Math.max(0, gy - RAD - 8); y <= Math.min(H - 1, gy + RAD + 8); y++)
      for (let x = Math.max(0, gx - RAD - 8); x < W; x++) {
        const i = idx(x, y), d = Math.hypot(x - gx, (y - gy) * 0.9), edge = RAD * (0.78 + 0.44 * smooth(x, y, 6, seed + 401));
        if (d > edge + 5 || biome[i] === B.CORE) continue;
        const border = x >= W - 3 || y < 3 || y >= H - 3;
        const burn = () => { if (obst[i] === O.TREE || obst[i] === O.PINE || obst[i] === O.PALM || obst[i] === O.CACTUS) obst[i] = noise(x, y, seed + 403) < 0.6 ? O.CHARRED : O.DEADTREE; };
        if (d > edge) { biome[i] = B.ASH; burn(); if (obst[i] === O.WATER || obst[i] === O.ICE) obst[i] = O.NONE; continue; } // the creeping rim: ash and burnt trees
        const plaza = d < 8.5 || (Math.abs(y - gy) < 2.6 && Math.abs(x - gx) < edge - 3); // brick yard round the gate, a brick road out on both sides
        biome[i] = plaza ? B.HELLB : B.HELL;
        if (border) { burn(); continue; } // the map's edge wall stays, burnt
        if (KEEP.includes(obst[i])) continue;
        obst[i] = O.NONE;
        if (plaza || road[i]) continue;
        const n = noise(x, y, seed + 407);
        if (d > 10 && d < edge - 2 && smooth(x, y, 5, seed + 405) > 0.76 && !nearMine(x, y, 3)) obst[i] = O.WATER; // lava pools (water tiles in this biome)
        else if (d > 11 && n < 0.035) obst[i] = O.CHARRED;
      }
  }

  // ---- 14. connectivity: open a path to every walkable pocket ----
  const reach = new Uint8Array(N);
  const flood = () => {
    reach.fill(0);
    const qu = [idx(cx, cy + 3)]; reach[qu[0]] = 1;
    while (qu.length) {
      const i = qu.pop(), x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!inside(nx, ny)) continue;
        const ni = idx(nx, ny);
        if (!reach[ni] && !blocks(obst[ni])) { reach[ni] = 1; qu.push(ni); }
      }
    }
  };
  flood();
  let carved = 0;
  for (let i = 0; i < N; i++) {
    if (reach[i] || blocks(obst[i])) continue;
    // BFS through anything removable back to the reached area, then clear that path
    const from = new Int32Array(N).fill(-2); from[i] = -1;
    const qu = [i]; let hit = -1;
    for (let h = 0; h < qu.length && hit < 0; h++) {
      const k = qu[h], x = k % W, y = (k / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!inside(nx, ny) || Math.min(nx, ny, W - 1 - nx, H - 1 - ny) < 1) continue;
        const ni = idx(nx, ny);
        if (from[ni] !== -2 || obst[ni] === O.MINE || obst[ni] === O.HOUSE || obst[ni] === O.TOWER || obst[ni] === O.WELL) continue;
        from[ni] = k;
        if (reach[ni]) { hit = ni; break; }
        qu.push(ni);
      }
    }
    for (let k = hit; k >= 0; k = from[k]) if (blocks(obst[k]) && obst[k] !== O.MINE) { obst[k] = O.NONE; carved++; }
    flood();
  }

  // ---- 15. small decor (does not block) ----
  for (let y = 3; y < H - 3; y++)
    for (let x = 3; x < W - 3; x++) {
      const i = idx(x, y);
      if (obst[i] || road[i]) continue;
      const b = biome[i], n = noise(x, y, seed + 101), v = Math.floor(noise(x, y, seed + 103) * 1000);
      const add = (t) => decor.push({ t, x, y, v });
      const nearWater = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => obst[idx(x + dx, y + dy)] === O.WATER);
      if (nearWater && (b === B.SWAMP || b === B.MEADOW || b === B.FOREST) && n < 0.5) { add('reeds'); continue; }
      switch (b) {
        case B.MEADOW: if (n < 0.06) add('tuft'); else if (n < 0.085) add('bush'); else if (n < 0.1) add('flowers'); else if (n < 0.108) add('rock'); break;
        case B.STEPPE: if (n < 0.08) add('drytuft'); else if (n < 0.09) add('rock'); else if (n < 0.095) add('bush'); break;
        case B.FOREST: if (n < 0.03) add('mushroom'); else if (n < 0.05) add('stump'); else if (n < 0.08) add('bush'); break;
        case B.PINE: if (n < 0.04) add('stump'); else if (n < 0.06) add('rock'); break;
        case B.TUNDRA: if (n < 0.02) add('snowrock'); else if (n < 0.03) add('drytuft'); break;
        case B.DESERT: if (n < 0.006) add('bones'); else if (n < 0.02) add('rock'); break;
        case B.BADLANDS: if (n < 0.03) add('redrock'); else if (n < 0.034) add('bones'); break;
        case B.SWAMP: if (n < 0.06) add('reeds'); else if (n < 0.07) add('mushroom'); break;
        case B.ASH: if (n < 0.012) add('bones'); else if (n < 0.03) add('rock'); break;
        case B.CORE: if (n < 0.07) add('rubble'); break;
        case B.HELL: if (n < 0.02) add('bones'); else if (n < 0.05) add('redrock'); break;
        case B.HELLB: if (n < 0.03) add('rubble'); break;
      }
    }
  // signposts where village roads meet the main road
  for (const v of villages) decor.push({ t: 'signpost', x: v.x + 3, y: v.y + 5, v: 0 });

  return { seed, W, H, biome, obst, road, roadPaths, chasmPaths, mines, spawns, villages, towers, objects, decor, carved, rOf, CORE_R };
}

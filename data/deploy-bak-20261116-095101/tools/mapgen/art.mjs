// Pixel art for the Sodier War map, drawn in code: biome ground textures, terrain sprites, mine models.
import { Px, noise, smooth, worley, mix } from './core.mjs';

const pickc = (arr, x, y, s) => arr[Math.floor(noise(x, y, s) * arr.length)];

// ============ ground ============
const G = {
  meadow: { base: '#5a9a3c', spk: ['#4d8a33', '#68aa45', '#76b64f', '#447d2d'], p: 0.4 },
  steppe: { base: '#9aa64c', spk: ['#8a9642', '#aab65a', '#b8ae5e', '#7c8a3a'], p: 0.38 },
  forest: { base: '#3c6a2e', spk: ['#335e27', '#477836', '#58682c', '#6a5a32'], p: 0.42 },
  pine: { base: '#3a5638', spk: ['#304c32', '#466244', '#5a5236', '#6a5c3c'], p: 0.44 },
  tundra: { base: '#e4ebf1', spk: ['#d3dee8', '#f3f7fa', '#c6d3df'], p: 0.3 },
  desert: { base: '#e0bd78', spk: ['#d2ac66', '#eaca8a', '#c89e5a'], p: 0.26 },
  badlands: { base: '#b4643a', spk: ['#a3572f', '#c27447', '#94502b', '#cc8452'], p: 0.36 },
  swamp: { base: '#4e5933', spk: ['#434e2b', '#5b663b', '#3a4528', '#666a3e'], p: 0.44 },
  ash: { base: '#4a4543', spk: ['#3d3836', '#57524f', '#302c2b', '#66605c'], p: 0.42 },
  core: { base: '#9a937a', spk: ['#8c8570'], p: 0 },
  road: { base: '#a8895a', spk: ['#977a4c', '#b6996a', '#8a6c42', '#c2a878'], p: 0.34 },
  hell: { base: '#6a2a1e', spk: ['#5a2218', '#7a3424', '#4c1c14', '#86402a'], p: 0.42 }, // Đất Ngục: scorched red earth (16/11/2026)
  hellb: { base: '#a8402e', spk: ['#94382a'], p: 0 }, // red brick yard
};
const BRICK = ['#a8402e', '#94382a', '#b84c36', '#8a3226', '#c05a3a', '#9c3c2c'];
const STONE = ['#9a937a', '#8c8570', '#a8a188', '#827b66', '#948e76'];

/** Colour of one ground pixel. (x, y) are pixel coords at the current scale; s = px per tile (16 or 4). */
export function ground(kind, x, y, s = 16) {
  const g = G[kind];
  const r = noise(x, y, 7);
  let c = r < g.p ? pickc(g.spk, x, y, 8) : g.base;
  const k = s / 16; // feature scale
  switch (kind) {
    case 'meadow': {
      if (noise(x, y, 12) > 0.965) c = (y & 1) ? '#86c45a' : '#3f7429'; // grass blades
      if (smooth(x, y, 22 * k + 2, 13) > 0.7 && noise(x, y, 14) > 0.9) c = pickc(['#f4f1e6', '#f2d04a', '#e88ab0', '#9fb8f0', '#f4f1e6'], x, y, 15);
      if (smooth(x, y, 30 * k + 3, 16) < 0.25) c = mix(c, '#3f7a2c', 0.35); // darker patches
      break;
    }
    case 'steppe': {
      if (Math.sin(x * 0.21 / k - y * 0.62 / k + smooth(x, y, 24 * k + 2, 5) * 9) > 0.93) c = '#c0c070';
      if (noise(x, y, 17) > 0.97) c = '#d6c97a';
      break;
    }
    case 'forest': {
      if (noise(x, y, 18) > 0.955) c = pickc(['#8a6a34', '#a0783a', '#b0602e'], x, y, 19); // leaf litter
      if (smooth(x, y, 14 * k + 2, 20) < 0.3) c = mix(c, '#2a4a20', 0.4);
      break;
    }
    case 'pine': {
      if (Math.sin(x * 1.3 / k + y * 0.4 / k) > 0.96 && noise(x, y, 21) > 0.5) c = '#7a6440'; // needles
      break;
    }
    case 'tundra': {
      if (Math.sin(x * 0.12 / k + y * 0.5 / k + smooth(x, y, 30 * k + 2, 22) * 8) > 0.9) c = '#cbd8e4'; // wind drifts
      if (noise(x, y, 23) > 0.988) c = '#7a8a6a';
      if (smooth(x, y, 20 * k + 2, 24) > 0.74) c = mix(c, '#b8c8d8', 0.4);
      break;
    }
    case 'desert': {
      if (Math.sin(x * 0.45 / k + y * 0.8 / k + smooth(x, y, 20 * k + 2, 6) * 6) > 0.86) c = '#c79a58'; // ripples
      if (smooth(x, y, 40 * k + 2, 25) > 0.68) c = mix(c, '#f0d69c', 0.35);
      break;
    }
    case 'badlands': {
      if (worley(x, y, 9 * k + 2, 26) < 0.9) c = '#7a3a1e'; // dry cracks
      else if (Math.sin(y * 0.9 / k + smooth(x, y, 16 * k + 2, 27) * 6) > 0.93) c = '#d08a58'; // strata
      break;
    }
    case 'swamp': {
      const p = smooth(x, y, 7 * k + 1, 28);
      if (p > 0.72) c = noise(x, y, 29) > 0.85 ? '#6e8070' : '#3b4838'; // puddles
      else if (noise(x, y, 30) > 0.97) c = '#7a8a3a';
      break;
    }
    case 'ash': {
      if (worley(x, y, 8 * k + 2, 31) < 0.7) c = '#2a2524';
      if (noise(x, y, 32) > 0.995) c = noise(x, y, 33) > 0.5 ? '#ff7a1a' : '#ffb347'; // embers
      break;
    }
    case 'core': {
      const t = Math.max(2, Math.round(8 * k));
      const row = Math.floor(y / t), off = row & 1 ? t >> 1 : 0;
      const bx = Math.floor((x + off) / t);
      const lx = (x + off) % t, ly = y % t;
      if (smooth(bx, row, 3, 34) < 0.18) { c = noise(x, y, 35) > 0.6 ? '#6a5a3e' : '#5a8a3a'; break; } // missing stones: dirt & grass
      c = lx === 0 || ly === 0 ? '#5f5848' : STONE[Math.floor(noise(bx, row, 36) * STONE.length)];
      if (lx !== 0 && ly !== 0 && noise(x, y, 37) > 0.9) c = mix(c, '#ffffff', 0.15);
      { const mo = smooth(x, y, 14 * k + 2, 38) + (noise(x, y, 39) - 0.5) * 0.08; if (mo > 0.64) c = mo > 0.7 ? pickc(['#4f7a32', '#5f8a3a', '#46702c'], x, y, 40) : (x + y) & 1 ? '#5f8a3a' : c; } // moss
      if (worley(x, y, 23 * k + 3, 41) < 0.5) c = '#4a4438'; // cracks
      break;
    }
    case 'road': {
      if (noise(x >> 1, y >> 1, 42) > 0.94) c = (y & 1) ? '#cdb48a' : '#7a5e38'; // pebbles
      break;
    }
    case 'hell': {
      if (smooth(x, y, 26 * k + 2, 61) > 0.66) c = mix(c, '#b8683e', 0.45); // patches of burnt sand
      const w = worley(x, y, 18 * k + 3, 62);
      if (w < 0.7) c = smooth(x, y, 30 * k + 3, 63) > 0.68 ? (w < 0.35 ? '#ffd23a' : '#ff6a1a') : '#2a0e0a'; // big cracks, a few glowing with lava
      if (noise(x, y, 64) > 0.994) c = noise(x, y, 65) > 0.5 ? '#ff7a1a' : '#ffb347'; // embers
      break;
    }
    case 'hellb': {
      const t = Math.max(2, Math.round(8 * k)), h = Math.max(2, t >> 1);
      const row = Math.floor(y / h), off = row & 1 ? t >> 1 : 0, bx = Math.floor((x + off) / t), lx = (x + off) % t, ly = y % h;
      if (smooth(bx, row, 3, 66) < 0.16) return ground('hell', x, y, s); // missing bricks
      c = lx === 0 || ly === 0 ? '#3a1a14' : BRICK[Math.floor(noise(bx, row, 67) * BRICK.length)];
      if (lx !== 0 && ly !== 0 && ly === 1) c = mix(c, '#ffffff', 0.12); // top edge light
      if (worley(x, y, 21 * k + 3, 68) < 0.45) c = smooth(x, y, 11 * k + 2, 69) > 0.6 ? '#ff6a1a' : '#2a0e0a'; // cracks, some glowing
      if (smooth(x, y, 16 * k + 2, 70) > 0.78) c = mix(c, '#1a0c0a', 0.2); // soot
      break;
    }
  }
  return c;
}

// ============ water / ice / chasm ============
export const WATER = {
  pond: { deep: '#2c5a86', mid: '#3a74a0', shallow: '#4f8fb0', light: '#7fb6d6', rim: '#6e5a3a' },
  swamp: { deep: '#22382e', mid: '#2e4a3c', shallow: '#3e5e48', light: '#5e7a5e', rim: '#3a3a26' },
  oasis: { deep: '#1f6f88', mid: '#2a8ea0', shallow: '#46b0b4', light: '#8ad8d0', rim: '#efd9a2' },
  ice: { deep: '#a8d0e4', mid: '#bfe0ef', shallow: '#d9f0fa', light: '#ffffff', rim: '#b8c8d8' },
  lava: { deep: '#ff9a1a', mid: '#ff6a1a', shallow: '#c8321a', light: '#ffd23a', rim: '#2a1410' }, // pools in Đất Ngục
};
export function waterColor(kind, x, y, depth, k = 1) {
  const w = WATER[kind];
  if (kind === 'ice') {
    if (worley(x, y, 14 * k + 2, 51) < 0.6) return '#8fbcd4';
    if (Math.sin(x * 0.3 / k - y * 0.6 / k) > 0.94) return '#ffffff';
    return depth >= 2 ? w.mid : w.shallow;
  }
  let c = depth <= 0 ? w.shallow : depth === 1 ? w.mid : w.deep;
  const wave = Math.sin(x * 0.55 / k + y * 0.9 / k) + Math.sin(x * 0.27 / k - y * 0.41 / k);
  if (wave > 1.55 && depth > 0) c = w.light;
  if (kind === 'swamp' && smooth(x, y, 6 * k + 1, 52) > 0.8 && depth > 0) c = noise(x, y, 53) > 0.3 ? '#4f7a3a' : '#e8a8c8'; // lily pads
  if (kind === 'lava' && worley(x, y, 14 * k + 2, 55) < 0.5 && depth > 0) c = '#5a1a0e'; // cooling crust
  return c;
}
/** Chasm pixel: k = pixels down from the lip, toBottom = pixels to the far rim. */
export function chasmColor(k, toBottom, x, y, s = 16) {
  const u = s / 16;
  if (toBottom <= Math.max(1, 1 * u)) return '#5a2a14';
  if (k <= 3 * u) return Math.sin(y * 2.2) > 0.4 ? '#c27447' : '#a3572f';
  if (k <= 6 * u) return noise(x, y, 54) > 0.8 ? '#7a3a1e' : '#6a3018';
  if (k <= 10 * u) return '#3a1a0e';
  return '#1a0c08';
}

// ============ helpers ============
/** Lumpy shape from circles, lit from the top-left. pal: [outline, dark, mid, light, highlight] */
function blob(p, circles, pal, seed = 0, tex = 2.5) {
  const inside = (x, y) => circles.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r);
  const bb = circles.reduce((a, [cx, cy, r]) => [Math.min(a[0], cx - r), Math.min(a[1], cy - r), Math.max(a[2], cx + r), Math.max(a[3], cy + r)], [1e9, 1e9, -1e9, -1e9]);
  const mx = (bb[0] + bb[2]) / 2, my = (bb[1] + bb[3]) / 2, R = Math.max(bb[2] - bb[0], bb[3] - bb[1]) / 2;
  for (let y = Math.floor(bb[1]); y <= Math.ceil(bb[3]); y++)
    for (let x = Math.floor(bb[0]); x <= Math.ceil(bb[2]); x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      if (edge) { p.set(x, y, pal[0]); continue; }
      let l = -((x - mx) + (y - my)) / (R * 1.6) + (smooth(x, y, tex, seed) - 0.5) * 0.7;
      p.set(x, y, l > 0.42 ? pal[4] : l > 0.08 ? pal[3] : l > -0.3 ? pal[2] : pal[1]);
    }
}

// ============ vegetation & rocks (16 px per tile) ============
const LEAF = [['#1c3618', '#2c5424', '#3e7430', '#58963e', '#7ab85a'], ['#1c3618', '#2a5026', '#3a6c34', '#4f8a42', '#6aa85a'], ['#2a2a14', '#4a5a20', '#6a7a2a', '#8a9a34', '#b0b850']];
export function tree(v = 0) {
  const p = new Px(26, 28);
  p.rect(12, 18, 3, 8, '#4a2e1a'); p.rect(12, 18, 1, 8, '#6a4628');
  const pal = LEAF[v % 7 === 0 ? 2 : v % 2];
  const j = (k) => (noise(v, k, 3) - 0.5) * 3;
  blob(p, [[13, 11, 8.5], [8 + j(1), 13 + j(2), 5.5], [18 + j(3), 13 + j(4), 5.5], [13 + j(5), 6 + j(6), 5.5], [13, 16, 5]], pal, v);
  if (v % 9 === 4) for (let k = 0; k < 6; k++) p.set(7 + noise(v, k, 5) * 12, 6 + noise(v, k, 6) * 11, '#e8889a'); // blossoms
  if (v % 9 === 7) for (let k = 0; k < 5; k++) p.set(7 + noise(v, k, 5) * 12, 6 + noise(v, k, 6) * 11, '#d8402a'); // fruit
  return p;
}
export function pine(v = 0, snowy = false) {
  const p = new Px(18, 28);
  p.rect(8, 22, 2, 5, '#4a2e1a');
  const tiers = [[3, 9, 4], [7, 14, 6], [11, 19, 8], [15, 24, 9]];
  for (const [y0, y1, hw] of tiers)
    for (let y = y0; y <= y1; y++) {
      const w = Math.round(((y - y0) / (y1 - y0)) * hw);
      for (let x = 9 - w; x <= 9 + w; x++) {
        const edge = x === 9 - w || x === 9 + w || y === y1;
        let c = edge ? '#132a1c' : x < 9 - w / 3 ? '#3f6e46' : x < 9 + w / 3 ? '#2c5236' : '#1f3d2a';
        if (!edge && noise(x, y, v) > 0.85) c = '#4a7a50';
        if (snowy && y <= y0 + 2 + (noise(x, y0, v) > 0.5 ? 1 : 0) && !edge) c = '#f0f5f8';
        p.set(x, y, c);
      }
    }
  p.set(9, 2, snowy ? '#ffffff' : '#132a1c');
  return p;
}
export function cactus(v = 0) {
  const p = new Px(12, 18);
  const col = (x0, y0, y1) => { for (let y = y0; y <= y1; y++) { p.set(x0, y, '#5f9e4a'); p.set(x0 + 1, y, '#468a3a'); p.set(x0 + 2, y, '#2f5e2a'); } p.set(x0 + 1, y0 - 1, '#468a3a'); };
  col(4, 3, 16);
  if (v % 2 === 0) { col(1, 6, 10); p.rect(2, 10, 3, 2, '#468a3a'); } else { col(1, 9, 12); p.rect(2, 12, 3, 2, '#468a3a'); }
  col(8, 7, 11); p.rect(7, 11, 2, 2, '#2f5e2a');
  for (let k = 0; k < 6; k++) p.set(2 + noise(v, k, 2) * 9, 4 + noise(v, k, 3) * 12, '#ece4c4');
  if (v % 3 === 0) { p.set(5, 1, '#f06a8a'); p.set(6, 1, '#f8a0b8'); }
  return p;
}
export function boulder(v = 0, kind = 'grey') {
  const pal = {
    grey: ['#3e3a38', '#5e5a56', '#7a7570', '#9a958e', '#bdb7ae'],
    red: ['#4a2214', '#7a3a22', '#9a5030', '#bc6a40', '#dc9a68'],
    snow: ['#4a4e56', '#6a707a', '#8a909a', '#e8eef4', '#ffffff'],
  }[kind];
  const p = new Px(18, 14);
  const j = (k) => (noise(v, k, 9) - 0.5) * 2.5;
  blob(p, [[9, 8, 5.5], [5 + j(1), 9, 3.5], [13 + j(2), 9, 3.5], [8 + j(3), 5, 3.5]], pal, v + 3, 2);
  if (kind === 'grey' && v % 3 === 0) for (let k = 0; k < 5; k++) p.set(5 + noise(v, k, 4) * 8, 4 + noise(v, k, 5) * 3, '#5f8a3a'); // moss
  p.line(8, 6, 10, 9, pal[1]);
  return p;
}
export function deadTree(v = 0, charred = false) {
  const p = new Px(18, 24);
  const [a, b] = charred ? ['#1e1a1a', '#3a302a'] : ['#4a3e34', '#6e5e4c'];
  p.rect(8, 9, 2, 14, a); p.rect(8, 9, 1, 14, b);
  p.line(9, 12, 15, 6, a); p.line(15, 6, 16, 3, a); p.line(8, 14, 3, 9, a); p.line(3, 9, 2, 5, a); p.line(9, 9, 10, 2, b); p.line(12, 9, 14, 10, a);
  if (charred) for (let k = 0; k < 3; k++) p.set(4 + noise(v, k, 2) * 10, 6 + noise(v, k, 3) * 14, '#ff7a1a');
  else p.line(5, 11, 4, 14, '#6a7a3a');
  return p;
}
export function palm(v = 0) {
  const p = new Px(24, 28);
  for (let y = 10; y < 27; y++) { const x = 11 + Math.round(Math.sin((y - 10) / 7) * 2 * (v % 2 ? 1 : -1)); p.set(x, y, y % 3 ? '#8a6a3a' : '#5e4424'); p.set(x + 1, y, '#6a4a2a'); }
  const fr = [[-9, 2], [-7, -3], [0, -6], [7, -3], [9, 3], [-4, 5], [5, 5]];
  for (const [dx, dy] of fr) {
    for (let t = 0; t <= 1; t += 0.08) {
      const x = 12 + dx * t, y = 9 + dy * t + 4 * t * t * Math.abs(dx) / 9;
      p.set(x, y, '#2e6a2e'); p.set(x, y - 1, t > 0.3 ? '#5aaa4a' : '#3f8a3a');
    }
  }
  p.set(11, 10, '#6a4a1a'); p.set(13, 10, '#6a4a1a');
  return p;
}

// ============ decor (does not block) ============
export function decorSprite(t, v = 0) {
  const p = new Px(16, 16);
  const n = (k, s) => noise(v, k, s);
  switch (t) {
    case 'tuft': case 'drytuft': {
      const c = t === 'tuft' ? ['#3f7429', '#78b850', '#9ad070'] : ['#8a8a3a', '#c0b86a', '#d8d08a'];
      for (let k = 0; k < 5; k++) { const x = 5 + k * 1.4; p.line(x, 12, x + (k - 2) * 0.6, 8 + n(k, 1) * 2, c[k % 3]); }
      break;
    }
    case 'fence': for (let x = 1; x < 15; x++) { p.set(x, 8, '#a8743f'); p.set(x, 11, '#7a4f2e'); } for (const x of [1, 7, 13]) { p.rect(x, 6, 2, 8, '#5a3a22'); p.set(x, 6, '#a8743f'); } if (v % 3 === 0) p.rect(8, 8, 4, 1, '#00000000'); break;
    case 'hay': p.ellipse(8, 10, 5, 4, '#a08040'); p.ellipse(7, 9, 4, 3, '#d8c070'); for (let k = 0; k < 6; k++) p.set(4 + n(k, 13) * 8, 7 + n(k, 14) * 6, '#7a6030'); break;
    case 'crate': p.rect(4, 6, 8, 7, '#8a5a34'); p.rect(4, 6, 8, 1, '#c89a5a'); p.line(4, 6, 11, 12, '#5a3a22'); p.rect(4, 12, 8, 1, '#4a2e1a'); p.rect(11, 6, 1, 7, '#5a3a22'); break;
    case 'cart': p.rect(2, 6, 11, 5, '#8a5a34'); p.rect(2, 6, 11, 1, '#c89a5a'); p.ellipse(4, 12, 2, 2, '#3a2416'); p.set(4, 12, '#a8743f'); p.line(12, 9, 15, 13, '#6a4628'); if (v % 2) blob(p, [[7, 6, 2.5]], ['#4a3a1a', '#7a6030', '#a08040', '#c0a050', '#d8c070'], v); break;
    case 'garden': for (let r = 0; r < 4; r++) { p.rect(1, 3 + r * 3, 14, 2, '#5a3e24'); for (let x = 2; x < 14; x += 3) p.set(x + (r % 2), 3 + r * 3, n(r, x) > 0.4 ? '#5f9e4a' : '#d8a040'); } break;
    case 'flowers': for (let k = 0; k < 7; k++) { const x = 3 + n(k, 11) * 10, y = 6 + n(k, 12) * 8; p.set(x, y + 1, '#3f7429'); p.set(x, y, ['#f4f1e6', '#f2d04a', '#e88ab0', '#9fb8f0', '#f08a5a'][(v + k) % 5]); p.set(x + 1, y, '#fff6c0'); } break;
    case 'bush': blob(p, [[8, 10, 4], [5, 11, 2.5], [11, 11, 2.5]], ['#1c3618', '#2c5424', '#3e7430', '#58963e', '#7ab85a'], v); if (v % 2) for (let k = 0; k < 3; k++) p.set(6 + n(k, 2) * 5, 8 + n(k, 3) * 4, '#c03a4a'); break;
    case 'rock': blob(p, [[8, 11, 2.5], [10, 12, 2]], ['#3e3a38', '#5e5a56', '#7a7570', '#9a958e', '#bdb7ae'], v); break;
    case 'redrock': blob(p, [[8, 11, 3], [11, 12, 2]], ['#4a2214', '#7a3a22', '#9a5030', '#bc6a40', '#dc9a68'], v); break;
    case 'snowrock': blob(p, [[8, 11, 3], [11, 12, 2]], ['#4a4e56', '#6a707a', '#8a909a', '#e8eef4', '#ffffff'], v); break;
    case 'stump': p.rect(6, 9, 5, 4, '#5a3a22'); p.rect(6, 9, 5, 1, '#c8a070'); p.set(8, 9, '#8a6a44'); p.set(5, 12, '#4a2e1a'); p.set(11, 12, '#4a2e1a'); break;
    case 'mushroom': for (let k = 0; k < 3; k++) { const x = 4 + k * 3 + n(k, 4) * 2, y = 10 + n(k, 5) * 3; p.set(x, y + 1, '#e8dcc0'); p.rect(x - 1, y, 3, 1, k % 2 ? '#c8302a' : '#d8a040'); p.set(x, y, '#ffffff'); } break;
    case 'reeds': for (let k = 0; k < 4; k++) { const x = 5 + k * 2; const h = 4 + n(k, 6) * 3; p.line(x, 13, x, 13 - h, '#6a7a3a'); p.set(x, 13 - h, '#6a4a2a'); p.set(x, 12 - h, '#7a5a2a'); } break;
    case 'bones': p.line(4, 11, 11, 11, '#e8e0cc'); for (let k = 0; k < 3; k++) p.line(5 + k * 2, 10, 5 + k * 2, 8, '#d9d0b8'); p.rect(11, 9, 3, 3, '#e8e0cc'); p.set(12, 10, '#3a3020'); break;
    case 'rubble': for (let k = 0; k < 4; k++) p.rect(4 + n(k, 7) * 8, 9 + n(k, 8) * 4, 2, 2, pickc(STONE, k, v, 9)); break;
    case 'signpost': p.rect(7, 4, 2, 10, '#5a3a22'); p.rect(3, 4, 10, 3, '#a8743f'); p.line(3, 4, 12, 4, '#c89a5a'); p.set(13, 5, '#a8743f'); break;
  }
  return p;
}

// ============ village, towers, ruins ============
const ROOFS = [
  ['#4a2214', '#7a3a22', '#a84a2a', '#c86a3a', '#e08a5a'], // terracotta
  ['#4a3a1a', '#7a6030', '#a08040', '#c0a050', '#d8c070'], // thatch
  ['#262c36', '#3a4250', '#4a5568', '#5f6b80', '#7a879a'], // slate
];
/** Ruined cottage, 2×2 tiles, seen from the 3/4 top-down view: roof with a collapsed hole, stone front wall. */
export function house(v = 0) {
  const p = new Px(36, 38);
  const R = ROOFS[v % 3], wide = v % 2 === 0;
  const x0 = wide ? 1 : 4, x1 = wide ? 34 : 31, top = 3, ridge = 12, eave = 22, wallB = 33;
  const st = (x, y) => STONE[Math.floor(noise(x >> 2, y >> 1, v) * STONE.length)];
  // front wall (stone), door and window
  for (let y = eave; y <= wallB; y++) for (let x = x0 + 1; x < x1; x++) p.set(x, y, y === wallB ? '#4a4638' : (y - eave) % 3 === 0 || (x + ((y - eave) / 3 | 0) * 2) % 5 === 0 ? '#5f5848' : st(x, y));
  const dx = x0 + 6 + (v % 4) * 2;
  p.rect(dx, eave + 4, 5, wallB - eave - 4, '#2a1c14'); p.rect(dx, eave + 4, 5, 1, '#5a3a22'); p.rect(dx + 5, eave + 6, 2, 6, '#6a4628'); // broken door hanging
  const wx = x1 - 10; p.rect(wx, eave + 4, 5, 4, '#1e1814'); p.rect(wx - 1, eave + 3, 7, 1, '#7a4f2e'); p.rect(wx - 1, eave + 8, 7, 1, '#7a4f2e'); p.set(wx + 2, eave + 5, '#7a4f2e');
  // roof: lit back slope, shaded front slope, tile rows
  for (let y = top; y < eave; y++)
    for (let x = x0; x <= x1; x++) {
      const back = y < ridge, row = back ? (ridge - y) : (y - ridge);
      let c = back ? (row % 3 === 0 ? R[2] : R[3]) : (row % 3 === 0 ? R[1] : R[2]);
      if ((x + (row / 3 | 0) * 2) % 4 === 0 && row % 3) c = back ? R[2] : R[1];
      if (y === ridge) c = R[4];
      if (x === x0 || x === x1 || y === top || y === eave - 1) c = R[0];
      p.set(x, y, c);
    }
  // collapsed hole showing beams and the dark inside
  const hx = x0 + 8 + (v % 5) * 3, hy = 9 + (v % 3) * 2, hr = 4 + (v % 3);
  for (let y = top + 1; y < eave - 1; y++)
    for (let x = x0 + 1; x < x1; x++) {
      const d = ((x - hx) / (hr + 1.5)) ** 2 + ((y - hy) / hr) ** 2 + (noise(x, y, v + 5) - 0.5) * 0.5;
      if (d < 1) p.set(x, y, d > 0.75 ? R[0] : '#2a1c14');
    }
  p.line(hx - hr - 1, hy, hx + hr + 1, hy, '#5a3a22'); p.line(hx - 2, hy - hr, hx - 2, hy + hr, '#4a2e1a'); p.line(hx + 2, hy - hr + 1, hx + 3, hy + hr, '#6a4628');
  // moss and a chimney
  for (let k = 0; k < 10; k++) { const x = x0 + 2 + noise(v, k, 6) * (x1 - x0 - 4), y = top + 2 + noise(v, k, 7) * 16; if ((p.get(x, y) >>> 8) !== 0x2a1c14) p.set(x, y, k % 2 ? '#5f8a3a' : '#4f7a32'); }
  if (v % 3 !== 1) { const cx = x1 - 7; p.rect(cx, top - 2, 4, 6, '#827b66'); p.rect(cx, top - 2, 4, 1, '#c4bea3'); p.rect(cx + 3, top - 1, 1, 5, '#5f5848'); }
  // fallen stones in front
  for (let k = 0; k < 4; k++) p.rect(x0 + 2 + noise(v, k, 8) * (x1 - x0 - 4), wallB + 1 + noise(v, k, 9) * 2, 2, 2, st(k, v));
  return p;
}
export function well() {
  const p = new Px(18, 22);
  p.ellipse(9, 15, 7, 5, '#5f5848'); p.ellipse(9, 14, 6, 4, '#9a937a'); p.ellipse(9, 14, 4, 2.5, '#1e3a4a'); p.set(8, 13, '#4a7a9a');
  p.rect(2, 3, 2, 12, '#5a3a22'); p.rect(14, 3, 2, 12, '#5a3a22'); p.rect(2, 3, 14, 2, '#7a4f2e'); p.line(9, 5, 9, 11, '#c8b89a'); p.rect(8, 10, 3, 2, '#7a4f2e');
  return p;
}
export function tower(v = 0) {
  const p = new Px(24, 44);
  for (const [x0, x1] of [[5, 7], [18, 16]]) p.line(x0, 42, x1, 16, '#4a2e1a');
  p.line(7, 42, 9, 16, '#6a4628'); p.line(16, 42, 14, 16, '#6a4628');
  p.line(6, 38, 16, 24, '#5a3a22'); p.line(17, 38, 7, 24, '#5a3a22'); p.line(7, 30, 16, 30, '#5a3a22');
  p.rect(3, 14, 18, 3, '#a8743f'); p.rect(3, 16, 18, 1, '#5a3a22'); // platform
  for (let x = 3; x < 21; x += 3) p.rect(x, 9, 1, 5, '#7a4f2e'); p.rect(3, 9, 18, 1, '#a8743f'); // railing
  for (let y = 2; y < 9; y++) { const w = Math.round((y - 2) * 1.4); p.line(12 - w, y, 12 + w, y, y === 8 ? '#5a2a18' : (y % 2 ? '#8a3a22' : '#a84a2a')); }
  p.line(12, 0, 12, 2, '#3a2416'); p.rect(13, 0, 4, 2, '#e8e0cc'); p.set(16, 1, '#c8c0aa');
  return p;
}
export function pillar(v = 0, broken = false) {
  const p = new Px(14, 32);
  const top = broken ? 12 + (v % 3) * 3 : 6;
  for (let y = top; y < 28; y++) for (let x = 3; x <= 10; x++) p.set(x, y, x === 3 ? '#c4bea3' : x === 10 ? '#4a4638' : (x % 2 ? '#9a937a' : '#827b66'));
  p.rect(1, 28, 12, 3, '#6e6852'); p.rect(1, 28, 12, 1, '#c4bea3');
  if (!broken) { p.rect(1, 3, 12, 3, '#9a937a'); p.rect(1, 3, 12, 1, '#c4bea3'); p.rect(1, 6, 12, 1, '#4a4638'); }
  else for (let x = 3; x <= 10; x++) p.set(x, top - (noise(x, v, 3) > 0.5 ? 1 : 0), '#c4bea3');
  for (let k = 0; k < 5; k++) p.set(4 + noise(v, k, 4) * 6, top + 4 + noise(v, k, 5) * 18, '#5f8a3a');
  p.line(6, top + 5, 8, top + 10, '#4a4638');
  return p;
}
export function wallPiece(v = 0) {
  const p = new Px(20, 16);
  for (let x = 1; x < 19; x++) { const h = 5 + Math.round(smooth(x, v, 4, 6) * 6); for (let y = 15 - h; y < 15; y++) p.set(x, y, y === 15 - h ? '#c4bea3' : (y % 3 === 0 || (x + (y / 3 | 0) * 2) % 5 === 0) ? '#5f5848' : STONE[(x + y + v) % 5]); }
  p.rect(1, 15, 18, 1, '#33302a');
  return p;
}
/** Temple plaza at the centre: rune circle laid into the paving (flat). */
export function altar() {
  const p = new Px(96, 96);
  for (let y = 0; y < 96; y++)
    for (let x = 0; x < 96; x++) {
      const d = Math.hypot(x - 47.5, y - 47.5), a = Math.atan2(y - 47.5, x - 47.5);
      if (d > 46) continue;
      if (d > 43) p.set(x, y, '#5f5848');
      else if (d > 40) p.set(x, y, '#c4bea3');
      else if (d > 38) p.set(x, y, '#6e6852');
      else if (d > 30) p.set(x, y, Math.floor((a + Math.PI) / (Math.PI / 12)) % 2 ? '#a8a188' : '#948e76');
      else if (d > 28) p.set(x, y, '#5f5848');
      else p.set(x, y, (x >> 2) % 2 ^ (y >> 2) % 2 ? '#9a937a' : '#8c8570');
      if (d > 32 && d < 37 && Math.abs(Math.sin(a * 12)) > 0.93) p.set(x, y, '#6fd3f0'); // runes
    }
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; p.line(47.5 + Math.cos(a) * 12, 47.5 + Math.sin(a) * 12, 47.5 + Math.cos(a) * 27, 47.5 + Math.sin(a) * 27, '#6fd3f0'); }
  p.ellipse(47.5, 47.5, 9, 9, '#4a4638'); p.ellipse(47.5, 47.5, 7, 7, '#c8f6ff'); p.ellipse(46, 46, 3, 3, '#ffffff');
  return p;
}
export function spawnCamp() {
  const p = new Px(40, 44);
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; blob(p, [[20 + Math.cos(a) * 15, 30 + Math.sin(a) * 10, 2.2]], ['#3e3a38', '#5e5a56', '#7a7570', '#9a958e', '#bdb7ae'], k); }
  p.ellipse(20, 31, 4, 2.5, '#3a2416'); p.rect(17, 29, 6, 1, '#6a4628'); p.set(19, 28, '#ff7a1a'); p.set(20, 27, '#ffb347'); p.set(21, 28, '#ff7a1a'); p.set(20, 28, '#ffe08a');
  p.rect(27, 4, 2, 26, '#5a3a22'); p.rect(29, 5, 9, 6, '#f2efe6'); p.rect(29, 10, 8, 1, '#c8c4b8'); p.set(37, 7, '#f2efe6');
  return p;
}

// ============ mines (model 48×64, decal separate so the outline hugs the model only) ============
function decal(w, h, cx, cy, rx, ry, pal) {
  const p = new Px(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (d > 1 || (d > 0.75 && noise(x, y, 61) < (d - 0.75) * 4)) continue;
      p.set(x, y, noise(x, y, 62) < 0.3 ? pickc(pal.slice(1), x, y, 63) : pal[0]);
    }
  return p;
}
const DIRT = ['#8a7050', '#7a6044', '#9a805e', '#6e5a40'];

function iron() {
  const m = new Px(48, 64);
  blob(m, [[24, 36, 13], [13, 41, 9], [35, 40, 10], [24, 27, 8]], ['#2b303b', '#3b4252', '#5b6577', '#8691a6', '#b7c0d1'], 3, 3);
  for (let y = 15; y < 52; y++) for (let x = 2; x < 46; x++) if ((m.get(x, y) & 255) && m.get(x, y) !== 0x2b303bff && Math.sin(x * 0.5 - y * 0.8 + smooth(x, y, 6, 4) * 4) > 0.9) m.set(x, y, noise(x, y, 5) > 0.5 ? '#b5562e' : '#e08a4f');
  for (const [x, y] of [[12, 36], [33, 33], [20, 25], [38, 42]]) { m.ellipse(x, y, 1.6, 1.2, '#7a3a22'); m.set(x - 1, y - 1, '#e08a4f'); }
  for (let y = 35; y < 48; y++) for (let x = 19; x < 30; x++) m.set(x, y, y < 38 ? '#2a1c14' : '#0e0a08');
  m.rect(17, 33, 2, 15, '#7a4f2e'); m.rect(30, 33, 2, 15, '#7a4f2e'); m.rect(17, 33, 1, 15, '#a8743f'); m.rect(15, 31, 19, 2, '#a8743f'); m.rect(15, 32, 19, 1, '#4a2e1c');
  m.rect(29, 34, 2, 3, '#ffd36b'); m.set(29, 34, '#fff3c4'); m.set(28, 36, '#ffb84d');
  for (let y = 48; y < 62; y += 3) m.rect(18, y, 13, 1, '#5a3a22');
  m.line(21, 47, 19, 62, '#a9adb5'); m.line(27, 47, 29, 62, '#a9adb5');
  m.rect(18, 51, 13, 6, '#6d6f75'); m.rect(18, 51, 13, 1, '#a9adb5'); m.rect(18, 56, 13, 1, '#3f4146');
  blob(m, [[21, 50, 2.2], [24, 49, 2.6], [28, 50, 2.2]], ['#3b2a22', '#5a2618', '#7a3a22', '#8691a6', '#b5562e'], 7, 1.5);
  m.rect(19, 57, 2, 2, '#22252a'); m.rect(28, 57, 2, 2, '#22252a');
  m.line(38, 47, 42, 37, '#7a4f2e'); m.line(40, 36, 45, 39, '#8691a6'); m.line(40, 37, 37, 40, '#8691a6');
  return { model: m, decal: decal(48, 64, 24, 50, 23, 13, DIRT) };
}
function coal() {
  const m = new Px(48, 64);
  const heap = [[24, 47, 12], [15, 50, 8], [33, 49, 9]];
  const inH = (x, y) => heap.some(([cx, cy, r]) => (x - cx) ** 2 + ((y - cy) * 1.25) ** 2 <= r * r);
  for (let y = 30; y < 60; y++)
    for (let x = 2; x < 46; x++) {
      if (!inH(x, y)) continue;
      const edge = !inH(x, y - 1) || !inH(x - 1, y) || !inH(x + 1, y) || !inH(x, y + 1);
      const w = worley(x, y, 4, 70), cell = noise(Math.floor(x / 4), Math.floor(y / 4), 71);
      let c = edge ? '#0c0c11' : w < 0.7 ? '#121218' : cell > 0.6 ? '#3a3c4d' : cell > 0.25 ? '#22232d' : '#1a1a22';
      if (!edge && w > 1.6 && noise(x, y, 72) > 0.93) c = noise(x, y, 73) > 0.5 ? '#8fa0c9' : '#c9c2ff';
      if (!edge && y < 44 && x < 26 && w > 1.2 && noise(x, y, 74) > 0.6) c = '#5e6278';
      m.set(x, y, c);
    }
  m.line(15, 44, 24, 10, '#5c3a22'); m.line(16, 44, 25, 10, '#8a5a34'); m.line(33, 44, 24, 10, '#5c3a22'); m.line(32, 44, 23, 10, '#8a5a34');
  m.line(18, 34, 30, 34, '#8a5a34'); m.line(20, 26, 28, 26, '#8a5a34'); m.line(19, 34, 28, 26, '#5c3a22');
  m.ellipse(24, 10, 4.5, 4.5, '#3f4146'); m.ellipse(24, 10, 3, 3, '#1e2127'); m.line(21, 10, 27, 10, '#a9adb5'); m.line(24, 7, 24, 13, '#a9adb5'); m.set(24, 10, '#d0d4da');
  m.line(28, 10, 28, 28, '#c8b89a'); m.rect(26, 28, 5, 4, '#4a515c'); m.rect(26, 28, 5, 1, '#7d8794'); m.rect(27, 27, 3, 1, '#22232d');
  m.ellipse(41, 53, 4, 2.5, '#3f4146'); m.rect(37, 50, 9, 2, '#22232d');
  for (const [x, y, c] of [[40, 49, '#ff7a1a'], [41, 48, '#ffb347'], [42, 49, '#ff7a1a'], [41, 47, '#ffe08a'], [39, 50, '#7a1f0a'], [43, 50, '#7a1f0a']]) m.set(x, y, c);
  for (const [x, y, r] of [[41, 43, 1.5], [42, 39, 2], [41, 34, 2.5]]) m.ellipse(x, y, r, r, '#4a4a5299');
  m.ellipse(8, 56, 3.5, 3, '#8a7a5a'); m.ellipse(8, 55, 2.5, 1.8, '#a89a74'); m.ellipse(13, 58, 3, 2.5, '#7a6a4a'); m.set(13, 56, '#a89a74');
  return { model: m, decal: decal(48, 64, 24, 51, 23, 12, ['#3a3832', '#22201c', '#4a4640', '#2e2c28']) };
}
function gold() {
  const m = new Px(48, 64);
  const rock = [[24, 36, 14], [12, 40, 8], [36, 40, 9], [24, 28, 8]];
  const inR = (x, y) => rock.some(([cx, cy, r]) => (x - cx) ** 2 + ((y - cy) * 1.15) ** 2 <= r * r);
  for (let y = 15; y < 52; y++)
    for (let x = 1; x < 47; x++) {
      if (!inR(x, y)) continue;
      const edge = !inR(x, y - 1) || !inR(x - 1, y) || !inR(x + 1, y) || !inR(x, y + 1);
      const layer = Math.floor((y + Math.round(Math.sin(x * 0.3) * 1.5)) / 3);
      let c = edge ? '#4a3220' : ['#9c6b3c', '#c99a5b', '#b08048', '#d8aa6a'][layer % 4];
      if (!edge && !inR(x - 2, y - 2)) c = '#e8c48a';
      if (!edge && (x - 24) + (y - 36) > 12) c = mix(c, '#6b4a2b', 0.4);
      const vein = Math.abs(Math.sin(x * 0.22 + 1) * 5 + 34 - y) < 1.1 || Math.abs(Math.sin(x * 0.3 + 4) * 4 + 41 - y) < 0.9;
      if (!edge && vein) c = noise(x, y, 80) > 0.6 ? '#ffe680' : '#f4c430';
      m.set(x, y, c);
    }
  for (const [x, y] of [[14, 33], [22, 30], [30, 36], [35, 42], [18, 43], [27, 40]]) { m.ellipse(x, y, 1.5, 1.2, '#b8860b'); m.set(x, y, '#f4c430'); m.set(x - 1, y - 1, '#fffbe0'); }
  for (const [x, y] of [[20, 29], [33, 38], [13, 41]]) { m.set(x, y, '#ffffff'); m.set(x - 1, y, '#ffe680'); m.set(x + 1, y, '#ffe680'); m.set(x, y - 1, '#ffe680'); m.set(x, y + 1, '#ffe680'); }
  for (let t = 0; t < 14; t++) { m.rect(4 + t, 49 + t * 0.45, 2, 3, t % 4 ? '#7a4f2e' : '#4a2e1c'); m.set(4 + t, 49 + t * 0.45, '#a8743f'); }
  m.line(5, 50, 17, 55, '#6aa0c0');
  const ingot = (x, y) => { m.rect(x, y, 6, 3, '#b8860b'); m.rect(x + 1, y, 4, 1, '#ffe680'); m.rect(x, y + 2, 6, 1, '#7a5208'); m.set(x + 1, y + 1, '#fffbe0'); };
  ingot(14, 58); ingot(20, 58); ingot(26, 58); ingot(17, 55); ingot(23, 55);
  m.rect(33, 51, 10, 4, '#7a4f2e'); m.rect(33, 51, 10, 1, '#a8743f'); blob(m, [[36, 50, 1.6], [39, 49, 1.8], [41, 50, 1.4]], ['#7a5208', '#b8860b', '#f4c430', '#ffe680', '#fffbe0'], 3, 1);
  m.ellipse(44, 56, 2, 2, '#3a2416'); m.line(33, 54, 31, 58, '#5a3a22');
  return { model: m, decal: decal(48, 64, 24, 50, 23, 13, ['#c9a46a', '#b8935a', '#d8b47a', '#a8834a']) };
}
function oil() {
  const m = new Px(48, 64);
  for (let y = 22; y < 50; y++) for (let x = 2; x < 14; x++) m.set(x, y, x === 2 || x === 13 ? '#3e1c14' : x < 5 ? '#b8604a' : x < 10 ? '#8c4030' : '#5c2a1e');
  m.ellipse(7.5, 22, 5.5, 2, '#8c4030'); m.ellipse(7.5, 22, 4, 1.2, '#b8604a');
  for (let y = 24; y < 49; y += 2) m.set(11, y, '#3e1c14'); m.line(10, 23, 10, 49, '#3e1c14'); m.line(12, 23, 12, 49, '#3e1c14');
  m.rect(3, 34, 10, 1, '#e8e0cc'); m.rect(3, 42, 10, 1, '#3e1c14');
  m.line(26, 47, 30, 26, '#4a515c'); m.line(34, 47, 30, 26, '#4a515c'); m.line(27, 47, 31, 26, '#7d8794'); m.line(27, 38, 33, 38, '#4a515c');
  m.rect(24, 46, 13, 2, '#2b2f36');
  m.line(16, 29, 44, 23, '#8a6a12'); m.line(16, 28, 44, 22, '#c9a227'); m.line(16, 27, 44, 21, '#f0d060');
  for (let y = 16; y < 32; y++) { const w = y < 20 ? y - 15 : y > 28 ? 32 - y : 4; for (let i = 0; i < w; i++) m.set(43 + i, y, i === 0 ? '#f0d060' : i < 2 ? '#c9a227' : '#8a6a12'); }
  m.line(45, 32, 45, 47, '#a9adb5'); m.rect(42, 46, 6, 4, '#4a515c'); m.rect(42, 46, 6, 1, '#7d8794');
  m.ellipse(18, 37, 5, 5, '#2b2f36'); m.ellipse(18, 37, 3.5, 3.5, '#4a515c'); m.rect(17, 30, 3, 8, '#7d8794'); m.ellipse(13, 40, 3, 3, '#7a1f1f');
  m.line(16, 29, 18, 36, '#1e2127');
  m.line(14, 49, 42, 49, '#7d8794'); m.line(14, 50, 42, 50, '#4a515c');
  const barrel = (x, y, c1, c2) => { m.rect(x, y, 5, 7, c1); m.rect(x + 3, y, 2, 7, c2); m.rect(x, y + 2, 5, 1, '#1e2127'); m.rect(x, y + 5, 5, 1, '#1e2127'); m.ellipse(x + 2, y, 2.5, 1, c2); };
  barrel(3, 53, '#3f6fc0', '#1f3f7a'); barrel(9, 54, '#3f6fc0', '#1f3f7a'); barrel(15, 53, '#c04040', '#7a1f1f');
  m.ellipse(33, 57, 10, 3.2, '#5a3210'); m.ellipse(33, 57, 8.5, 2.4, '#2a1708'); m.line(28, 56, 34, 56, '#a0642a'); m.set(30, 56, '#e0a85a');
  return { model: m, decal: decal(48, 64, 24, 51, 23, 12, ['#6a5440', '#5a4432', '#7a644c', '#3a2a1c']) };
}
function tar() {
  const m = new Px(48, 64);
  const inP = (x, y) => ((x - 24) / (18 + Math.sin(y * 0.7) * 1.2)) ** 2 + ((y - 43) / 11) ** 2 <= 1;
  for (let y = 30; y < 56; y++)
    for (let x = 2; x < 46; x++) {
      if (!inP(x, y)) continue;
      const edge = !inP(x, y - 1) || !inP(x - 1, y) || !inP(x + 1, y) || !inP(x, y + 1);
      let c = edge ? (y < 43 ? '#6a5444' : '#1e1814') : !inP(x, y - 2) ? '#07050a' : '#140d1c';
      if (!edge && noise(x, y, 90) > 0.8) c = '#261833';
      const sheen = Math.sin(x * 0.28 + y * 0.9 + smooth(x, y, 6, 91) * 5);
      if (!edge && sheen > 0.88) c = ['#5b4a8a', '#2f7f7a', '#8a7a2f'][Math.floor(smooth(x, y, 9, 92) * 3)];
      else if (!edge && sheen > 0.75) c = '#3d2a52';
      m.set(x, y, c);
    }
  for (const [x, y, r] of [[30, 40, 2], [18, 47, 1.5], [36, 47, 1.2], [26, 50, 1]]) { m.ellipse(x, y, r, r * 0.8, '#3d2a52'); m.set(x - 1, y - 1, '#9a8ac0'); }
  for (let a = 0; a < 6.3; a += 0.4) m.set(30 + Math.cos(a) * 3.5, 40 + Math.sin(a) * 1.3, '#261833');
  m.rect(10, 37, 6, 4, '#d9d0b8'); m.rect(10, 37, 6, 1, '#f2ecda'); m.set(11, 39, '#1e1814'); m.set(14, 39, '#1e1814'); m.rect(9, 41, 8, 1, '#6e6552');
  m.line(10, 37, 7, 33, '#d9d0b8'); m.line(7, 33, 8, 31, '#f2ecda'); m.line(15, 37, 18, 33, '#d9d0b8'); m.line(18, 33, 17, 31, '#f2ecda');
  for (let k = 0; k < 4; k++) { const x = 20 + k * 3; m.line(x, 42, x + 1, 36, '#d9d0b8'); m.line(x + 1, 36, x + 2, 35, '#a89d82'); }
  for (let t = 0; t < 12; t++) { const x = 33 + t * 0.4, y = 58 - t; m.rect(x, y, 4, 1, t % 3 ? '#8a5a34' : '#5c3a22'); }
  m.rect(31, 50, 1, 9, '#3a2314'); m.rect(38, 46, 1, 10, '#3a2314'); m.line(31, 50, 38, 46, '#c8b89a');
  m.rect(40, 57, 4, 3, '#5c3a22'); m.rect(40, 57, 4, 1, '#07050a'); m.set(41, 60, '#140d1c');
  for (const [x, y, r] of [[22, 26, 2], [24, 21, 2.5], [21, 15, 3]]) m.ellipse(x, y, r, r, '#2a242e88');
  return { model: m, decal: decal(48, 64, 24, 46, 23, 15, ['#2e2420', '#1e1814', '#4a3a30', '#3a2e28']) };
}
function crystal() {
  const m = new Px(48, 64);
  blob(m, [[24, 51, 9], [15, 53, 6], [33, 52, 7]], ['#2a2536', '#3a3448', '#5a5070', '#7e7396', '#9a8eb4'], 5, 3);
  const prism = (x0, base, h, w, tilt, pal) => {
    const tip = [x0 + tilt * h, base - h];
    for (let y = base - h; y <= base; y++) {
      const t = (y - (base - h)) / h, half = Math.min(w / 2, t * h * 0.9);
      const cx = x0 + tilt * (base - y);
      for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) {
        const u = (x - (cx - half)) / (2 * half + 0.01);
        const edge = x === Math.round(cx - half) || x === Math.round(cx + half);
        let c = edge ? pal[0] : u < 0.25 ? pal[4] : u < 0.55 ? pal[3] : u < 0.8 ? pal[2] : pal[1];
        if (!edge && u < 0.18) c = pal[5];
        if (y < base - h + 3 && !edge) c = pal[5];
        m.set(x, y, c);
      }
    }
    m.set(tip[0], tip[1], '#ffffff');
  };
  const V = ['#2a1040', '#4b1d73', '#7a35b0', '#b06bff', '#e3c2ff', '#f4e8ff'], C = ['#0e2a3a', '#1a4a6b', '#2f8fbf', '#8fe3ff', '#c8f6ff', '#ffffff'];
  prism(10, 53, 13, 4, -0.5, V); prism(38, 53, 14, 4, 0.5, V); prism(16, 51, 22, 6, -0.3, V); prism(32, 51, 23, 6, 0.3, V); prism(24, 50, 32, 8, 0, V);
  prism(20, 55, 9, 3, -0.2, C); prism(29, 56, 8, 3, 0.25, C); prism(14, 57, 6, 3, -0.4, C);
  for (const [x, y, c] of [[6, 26, C], [42, 22, V], [36, 10, C]]) { m.set(x, y - 1, c[4]); m.set(x - 1, y, c[3]); m.set(x, y, '#ffffff'); m.set(x + 1, y, c[2]); m.set(x, y + 1, c[1]); m.set(x, y + 2, c[1]); }
  return { model: m, decal: decal(48, 64, 24, 52, 23, 11, ['#4a3a5a', '#3a2e48', '#5a4a70', '#6a4a8a']) };
}
function diamond() {
  const m = new Px(64, 80);
  const inO = (x, y) => Math.abs(x - 32) <= 29 && Math.abs(y - 54) <= 21 && Math.abs(x - 32) + Math.abs(y - 54) * 1.35 <= 38;
  for (let y = 30; y < 80; y++)
    for (let x = 0; x < 64; x++) {
      if (inO(x, y)) {
        const lx = x % 6, ly = (y + ((x / 6 | 0) % 2) * 3) % 6;
        let c = lx === 0 || ly === 0 ? '#4a4638' : ['#9a937a', '#8c8570', '#a8a188', '#827b66'][Math.floor(noise(x / 6 | 0, (y + ((x / 6 | 0) % 2) * 3) / 6 | 0, 93) * 4)];
        if (!inO(x, y - 1)) c = '#c4bea3';
        if (smooth(x, y, 6, 94) > 0.72 && noise(x, y, 95) > 0.4) c = '#5f7f3a';
        m.set(x, y, c);
      } else if (inO(x, y - 3) && y > 54) m.set(x, y, y % 2 ? '#4a4638' : '#33302a'); // front face of the platform
    }
  for (const [rx, ry] of [[12, 44], [52, 44], [12, 64], [52, 64]]) { m.rect(rx - 2, ry - 2, 5, 5, '#33302a'); m.set(rx, ry, '#6fd3f0'); m.line(rx - 1, ry - 1, rx + 1, ry + 1, '#6fd3f0'); m.line(rx + 1, ry - 1, rx - 1, ry + 1, '#2a6f8f'); }
  m.ellipse(32, 56, 13, 7, '#33302a'); m.ellipse(32, 56, 11.5, 6, '#1a1814');
  const top = 33, mid = 40, bot = 58;
  for (let y = top; y <= bot; y++) {
    const hw = y <= mid ? 6 + (y - top) * 0.9 : Math.max(0, 12.3 * (1 - (y - mid) / (bot - mid + 6)));
    for (let x = Math.round(32 - hw); x <= Math.round(32 + hw); x++) {
      if (y > 56 && (x - 32) ** 2 / 130 + (y - 56) ** 2 / 36 < 1 && y > 57) continue;
      const edge = x === Math.round(32 - hw) || x === Math.round(32 + hw) || y === top;
      const a = Math.atan2(y - mid, x - 32), seg = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 10);
      let c = edge ? '#0e2a3a' : y <= mid ? (Math.abs(x - 32) < 4 && y < top + 4 ? '#ffffff' : ['#c8f6ff', '#6fd3f0', '#ffffff', '#8fe3ff'][(seg + (y > top + 3 ? 1 : 0)) % 4]) : ['#6fd3f0', '#2a6f8f', '#c8f6ff', '#2a6f8f', '#8fe3ff'][seg % 5];
      if (!edge && y === mid) c = '#ffffff';
      m.set(x, y, c);
    }
  }
  for (const [x, y, c] of [[27, 44, '#ff8ad8'], [36, 47, '#ffe26a'], [30, 50, '#8affc1'], [38, 38, '#8ab8ff']]) m.set(x, y, c);
  for (let k = 0; k < 4; k++) { const x = 25 + k * 5; for (let y = 2; y < 32; y++) if (noise(x, y, 96) > 0.25) m.set(x + (y % 3 === 0 ? 1 : 0), y, ['#ff8ad855', '#ffe26a55', '#8affc155', '#c8f6ff66'][k]); }
  for (const [x, y] of [[18, 52], [46, 50], [22, 62], [42, 62], [26, 49], [38, 58]]) { m.set(x, y - 1, '#c8f6ff'); m.set(x - 1, y, '#6fd3f0'); m.set(x, y, '#ffffff'); m.set(x + 1, y, '#2a6f8f'); m.set(x, y + 1, '#2a6f8f'); }
  m.blit(pillar(1), 2, 26); m.blit(pillar(2, true), 48, 26);
  for (let x = 12; x < 30; x++) for (let y = 72; y < 77; y++) m.set(x, y, y === 72 ? '#c4bea3' : y === 76 ? '#4a4638' : x % 3 ? '#9a937a' : '#827b66');
  return { model: m, decal: decal(64, 80, 32, 58, 31, 20, ['#7a6a4a', '#6a5a3e', '#5a8a3a', '#8a7a5a']) };
}
export const MINE_ART = { iron, coal, gold, oil, tar, crystal, diamond };
export const MINE_COLOR = {
  iron: ['#2b303b', '#8691a6', '#b5562e'], coal: ['#0c0c11', '#3a3c4d', '#8fa0c9'], gold: ['#5c3d06', '#f4c430', '#fffbe0'],
  oil: ['#1a0e05', '#a0642a', '#e0a85a'], tar: ['#07050a', '#3d2a52', '#8a7aa0'], crystal: ['#2a1040', '#b06bff', '#e3c2ff'], diamond: ['#0e2a3a', '#6fd3f0', '#ffffff'],
};

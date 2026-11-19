// Base structures (docs/design/can-cu/05 §5.6): Thành trì, Tháp cung, Pháo đá, Tháp phép, Kho, each in 5 levels + a ruin.
// Usage: node tools/unitgen/buildings.mjs → client/assets/buildings/<type>.png (rows: level 1..5, ruin) + atlas.json
// Walls are drawn by the client (they must join up tile by tile).
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { render, xform, I3, rotX, rotZ, ell, sph, cone, box, cyl } from './sdf.mjs';

const OUT = new URL('../../client/assets/buildings/', import.meta.url).pathname;
const K = 2; // px per model unit; one map tile = 32 sprite px = 16 model units
const R4 = (a, b, c, d) => ({ ramp: [a, b, c, d] });
// brick / plank / roof-tile patterns (pm = model-space point)
const fr = (v) => v - Math.floor(v);
const brick = (dark) => (pm, pl, n) => {
  if (Math.abs(n[2]) > 0.7) return null; // tops stay plain
  const row = Math.floor(pm[2] / 2.4), h = (Math.abs(n[0]) > Math.abs(n[1]) ? pm[1] : pm[0]) + row * 1.7;
  return fr(pm[2] / 2.4) < 0.16 || fr(h / 3.6) < 0.09 ? dark : null;
};
const plank = (dark) => (pm, pl, n) => { if (Math.abs(n[2]) > 0.7) return null; const h = Math.abs(n[0]) > Math.abs(n[1]) ? pm[1] : pm[0]; return fr(h / 2.2) < 0.14 ? dark : null; };
const tiles = (dark) => (pm) => (fr(pm[2] / 1.7) < 0.22 ? dark : null);
const MATS = {
  wood: { ...R4('#3e2414', '#6e4424', '#9a6434', '#b8844a'), pattern: plank('woodDark') }, woodDark: R4('#2a180c', '#4a2e18', '#6a4426', '#8a5a32'),
  beam: R4('#2a180c', '#4a2e18', '#6a4426', '#8a5a32'),
  thatch: { ...R4('#6a5418', '#a88a2c', '#d4b44a', '#ecd47a'), pattern: tiles('thatchDark') }, thatchDark: R4('#4a3a10', '#7a6420', '#a08434', '#c0a44a'),
  stone: { ...R4('#3a3a46', '#62626e', '#8e8e98', '#b4b4bc'), pattern: brick('mortar') }, stoneDark: R4('#26262e', '#3e3e48', '#5a5a66', '#74747e'),
  mortar: R4('#1e1e26', '#30303a', '#44444e', '#56565e'),
  marble: { ...R4('#7a7a88', '#b4b4c0', '#dedee6', '#ffffff'), pattern: brick('marbleJoint') }, marbleJoint: R4('#5a5a68', '#86869a', '#a4a4b4', '#c4c4d0'),
  roofRed: { ...R4('#4a1410', '#8a2a1c', '#b8442c', '#d86a48'), pattern: tiles('roofRedDark') }, roofRedDark: R4('#2e0c08', '#5a1a12', '#7a2a1c', '#9a3a28'),
  roofBlue: { ...R4('#141c4a', '#24347a', '#3a54a8', '#6a84d0'), pattern: tiles('roofBlueDark') }, roofBlueDark: R4('#0c1030', '#18245a', '#24387a', '#3a54a0'),
  bronze: { ramp: ['#6a3a10', '#c06a1a', '#f0a040', '#ffd890'], spec: '#fff0c0' },
  gold: { ramp: ['#6a3e0a', '#b8801c', '#e8b830', '#fff0a0'], spec: '#fffbe0' },
  iron: { ramp: ['#1e1e26', '#34343e', '#50505c', '#7e7e8c'], spec: '#c8c8d8' },
  purple: { ...R4('#24123e', '#3e2270', '#5e36a8', '#8a5ad8'), pattern: tiles('purpleDark') }, purpleDark: R4('#160a26', '#2a1650', '#3e2470', '#5a3a98'),
  orb: { ramp: ['#5a2aa8', '#8a5aff', '#c8a8ff', '#ffffff'], emissive: true },
  crystal: { ramp: ['#3a6ad0', '#6aa8ff', '#b8e0ff', '#ffffff'], emissive: true },
  glow: { ramp: ['#a87a10', '#f0c030', '#ffe680', '#ffffff'], emissive: true },
  banner: R4('#5a1414', '#a82828', '#e04a3a', '#ff9a7a'),
  rubble: R4('#2a2a30', '#4a4a52', '#6a6a72', '#8a8a92'),
  hay: R4('#5a4a14', '#8a7424', '#b89c3a', '#d8c060'), sack: R4('#5a4a32', '#8a7650', '#b4a070', '#d4c494'),
  grass: R4('#1e3a14', '#2e5a1e', '#3e7a28', '#5a9a3a'),
  eye: R4('#1b1726', '#1b1726', '#1b1726', '#1b1726'),
};
/** materials by level: wood → stone → stone + bronze → marble + gold */
function look(lv) {
  if (lv <= 2) return { wall: 'wood', dark: 'woodDark', roof: lv === 1 ? 'thatch' : 'roofRed', trim: 'beam', base: 'stoneDark' };
  if (lv === 3) return { wall: 'stone', dark: 'stoneDark', roof: 'roofRed', trim: 'stoneDark', base: 'stoneDark' };
  if (lv === 4) return { wall: 'stone', dark: 'stoneDark', roof: 'roofBlue', trim: 'bronze', base: 'stoneDark' };
  return { wall: 'marble', dark: 'stone', roof: 'roofBlue', trim: 'gold', base: 'stone' };
}
const crenels = (cx, cy, z, hw, hd, mat, g, n = 3) => {
  const P = [];
  for (let k = -n; k <= n; k += 2) for (const s of [-1, 1]) { P.push(box([cx + (k / n) * hw, cy + s * hd, z], [1.3, 1.1, 1.5], mat, g)); P.push(box([cx + s * hw, cy + (k / n) * hd, z], [1.1, 1.3, 1.5], mat, g)); }
  return P;
};
const windows = (P, x, y, z, n, dx, mat = 'eye', g = 'win') => { for (let k = 0; k < n; k++) P.push(box([x + (k - (n - 1) / 2) * dx, y, z], [0.9, 0.35, 1.6], mat, g)); };
const flag = (P, x, y, z, h, mat = 'banner') => { P.push(cone([x, y, z], [x, y, z + h], 0.35, 0.3, 'woodDark', 'flag')); P.push(box([x + 2.4, y, z + h - 2], [2.2, 0.25, 1.5], mat, 'flag', rotZ(0.15))); };

const MODELS = {
  'thanh-tri': (lv) => {
    const L = look(lv), P = [];
    P.push(box([0, 0, 2.5], [22, 21, 2.5], L.base, 'base'));
    P.push(box([0, 14, 1.5], [5, 4, 1.5], L.base, 'steps'), box([0, 16, 0.8], [4, 2.5, 0.8], L.base, 'steps'));
    // keep
    P.push(box([0, -1, 15], [13, 10, 10], L.wall, 'keep'));
    P.push(box([0, -1, 25.6], [14.2, 11.2, 0.9], L.trim, 'keep'));
    windows(P, 0, 9.2, 19, 3, 6, lv >= 4 ? 'glow' : 'eye');
    P.push(box([0, 9.4, 9], [3.6, 0.8, 5], 'woodDark', 'gate'), cyl([0, 9.6, 14], [0, 1, 0], 3.6, 0.6, L.trim, 'gate'));
    for (const s of [-1, 1]) P.push(box([s * 5.2, 9.6, 12], [0.6, 0.6, 7], L.trim, 'gate'));
    if (lv <= 2) P.push(box([0, -5, 30], [14, 6.6, 1], L.roof, 'roofA', rotX(-0.62)), box([0, 3, 30], [14, 6.6, 1], L.roof, 'roofB', rotX(0.62)), box([0, -1, 34.5], [14.5, 0.8, 0.8], L.trim, 'ridge'));
    else {
      P.push(...crenels(0, -1, 28, 13, 10, L.wall, 'keep'));
      P.push(box([0, -3, 33], [6, 5.5, 7], L.wall, 'top'), box([0, -3, 40.4], [6.8, 6.2, 0.8], L.trim, 'top'));
      windows(P, 0, 2.7, 35, 2, 4, 'glow', 'top');
      P.push(cone([0, -3, 41], [0, -3, 52 + (lv - 3) * 2], 8, 0.6, L.roof, 'roof2'));
      if (lv === 5) P.push(sph([0, -3, 54], 1.6, 'gold', 'roof2'));
    }
    // corner towers
    for (const [x, y] of [[-17, -14], [17, -14], [-17, 13], [17, 13]]) {
      const g = 'tw' + x + y, th = 28 + lv;
      P.push(cyl([x, y, th / 2], [0, 0, 1], 5, th / 2, L.wall, g));
      P.push(cyl([x, y, th + 0.6], [0, 0, 1], 5.8, 0.8, L.trim, g));
      P.push(box([x, y + 5, th * 0.6], [0.8, 0.3, 1.6], 'eye', g));
      P.push(cone([x, y, th + 1], [x, y, th + 11 + lv], 6.4, 0.5, L.roof, g));
    }
    // curtain walls between front towers (level 3+)
    if (lv >= 3) for (const y of [-14, 13]) P.push(box([0, y, 6], [12, 1.6, 6], L.wall, 'curtain' + y), ...[-9, -3, 3, 9].map((x) => box([x, y, 13], [1.4, 1.6, 1.2], L.wall, 'curtain' + y)));
    flag(P, 0, -3, lv <= 2 ? 34 : 52 + (lv - 3) * 2, 12);
    for (const s of [-1, 1]) P.push(box([s * 9, 9.4, 18], [1.8, 0.3, 4.5], 'banner', 'hang' + s));
    return P;
  },
  'thap-cung': (lv) => {
    const L = look(lv), P = [], h = 20 + lv * 2;
    P.push(box([0, 0, 1.5], [13, 13, 1.5], L.base, 'base'));
    if (lv <= 2) {
      // wooden watchtower on stilts with braces and a ladder
      for (const [x, y] of [[-7, -7], [7, -7], [-7, 7], [7, 7]]) P.push(cone([x, y, 3], [x * 0.8, y * 0.8, h + 4], 1.2, 1, 'beam', 'leg' + x + y));
      for (const y of [-7, 7]) P.push(cone([-7, y, 6], [6, y, h], 0.6, 0.6, 'beam', 'brace' + y), cone([7, y, 6], [-6, y, h], 0.6, 0.6, 'beam', 'brace' + y));
      for (let k = 0; k < 6; k++) P.push(box([0, 8, 5 + k * 3.4], [2, 0.3, 0.3], 'beam', 'ladder'));
      P.push(cone([-2, 8, 3], [-2, 6, h + 4], 0.35, 0.35, 'beam', 'ladder'), cone([2, 8, 3], [2, 6, h + 4], 0.35, 0.35, 'beam', 'ladder'));
      P.push(box([0, 0, h + 5], [9.5, 9.5, 1.2], 'wood', 'deck'));
      P.push(box([0, 9, h + 8], [9.5, 0.6, 2.4], 'wood', 'rail'), box([0, -9, h + 8], [9.5, 0.6, 2.4], 'wood', 'rail'), box([9, 0, h + 8], [0.6, 9.5, 2.4], 'wood', 'rail'), box([-9, 0, h + 8], [0.6, 9.5, 2.4], 'wood', 'rail'));
      for (const [x, y] of [[-8.5, -8.5], [8.5, -8.5], [-8.5, 8.5], [8.5, 8.5]]) P.push(cone([x, y, h + 6], [x, y, h + 15], 0.5, 0.5, 'beam', 'post'));
      P.push(cone([0, 0, h + 13], [0, 0, h + 32], 10.5, 0.5, L.roof, 'roof'));
    } else {
      P.push(box([0, 0, 3 + h / 2], [8, 8, h / 2], L.wall, 'body'));
      P.push(box([0, 0, 4], [9, 9, 1.4], L.dark, 'plinth'));
      P.push(box([0, 8.2, h * 0.45], [0.7, 0.4, 2.2], 'eye', 'body'), box([0, 8.2, h * 0.8], [0.7, 0.4, 2.2], 'eye', 'body'), box([8.2, 0, h * 0.6], [0.4, 0.7, 2.2], 'eye', 'body'));
      P.push(box([0, 0, 4 + h], [10.5, 10.5, 1.6], L.trim, 'deck'));
      P.push(...crenels(0, 0, 7.4 + h, 10, 10, L.wall, 'deck', 2));
      for (const [x, y] of [[-9, -9], [9, -9], [-9, 9], [9, 9]]) P.push(cone([x, y, 5 + h], [x * 0.3, y * 0.3, 15 + h], 0.5, 0.5, 'beam', 'post'));
      P.push(cone([0, 0, 13 + h], [0, 0, 31 + h + (lv - 3)], 10, 0.5, L.roof, 'roof'));
      P.push(box([0, 8.6, h * 0.25 + 3], [2.4, 0.3, 3.5], 'banner', 'hang'));
      if (lv === 5) P.push(sph([0, 0, 33 + h], 1.3, 'gold', 'roof'));
    }
    return P;
  },
  'phao-da': (lv) => {
    const L = look(lv), P = [];
    P.push(cyl([0, 0, 4.5], [0, 0, 1], 13, 4.5, L.wall, 'base'), cyl([0, 0, 9.4], [0, 0, 1], 13.6, 0.7, L.trim, 'base'));
    if (lv >= 3) for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 + 0.3; if (Math.sin(a) > 0.6) continue; P.push(box([Math.cos(a) * 12.4, Math.sin(a) * 12.4, 11.6], [1.4, 1.4, 1.4], L.wall, 'base', rotZ(a))); }
    else for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; if (Math.sin(a) > 0.6) continue; P.push(ell([Math.cos(a) * 11.5, Math.sin(a) * 11.5, 11], [2.4, 1.6, 1.3], 'sack', 'base', rotZ(a))); }
    // carriage + barrel
    P.push(box([0, -0.5, 12.6], [5.5, 6, 1.6], 'woodDark', 'cart'));
    for (const s of [1, -1]) { P.push(cyl([s * 6.6, -1, 13.4], [1, 0, 0], 3.4, 0.7, 'wood', 'wheel' + s)); P.push(cyl([s * 7.2, -1, 13.4], [1, 0, 0], 0.9, 0.3, 'iron', 'wheel' + s)); }
    const R = 3 + lv * 0.25;
    P.push(cyl([0, 2.5, 17], [0, 0.85, 0.5], R, 7.5, 'iron', 'barrel'), cyl([0, -3, 13.8], [0, 0.85, 0.5], R + 0.6, 1, L.trim === 'beam' ? 'iron' : L.trim, 'barrel'));
    P.push(cyl([0, 8.8, 20.6], [0, 0.85, 0.5], R + 0.5, 0.8, L.trim === 'beam' ? 'iron' : L.trim, 'barrel'), sph([0, 9.4, 21], R * 0.7, 'eye', 'barrel'));
    for (const [x, y, z] of [[-8, -6, 11.5], [-5.4, -7.6, 11.5], [-6.8, -6.6, 14]]) P.push(sph([x, y, z], 2.3, 'rubble', 'balls'));
    P.push(box([8, -6, 12], [2.6, 2.6, 2], 'wood', 'crate'));
    return P;
  },
  'thap-phep': (lv) => {
    const L = look(lv), P = [], h = 26 + lv * 2;
    P.push(cyl([0, 0, 2], [0, 0, 1], 11, 2, L.base, 'base'));
    for (let k = 0; k < 3; k++) P.push(cyl([0, 0, 5 + k * 1.2], [0, 0, 1], 9.6 - k * 0.9, 0.6, L.dark, 'step'));
    P.push(cone([0, 0, 7], [0, 0, 4 + h], 7.6, 5.2, L.wall, 'body'));
    for (const z of [h * 0.35, h * 0.7]) P.push(cyl([0, 0, z], [0, 0, 1], 7.6 - z * 0.09, 0.6, 'purple', 'band'));
    P.push(box([0, 6.4, h * 0.5], [1, 0.5, 2.4], 'orb', 'win'), box([6, 1.5, h * 0.75], [0.5, 1, 2.2], 'orb', 'win'));
    P.push(cyl([0, 0, 5 + h], [0, 0, 1], 7.4, 1, L.trim === 'beam' ? 'purple' : L.trim, 'ring'));
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; P.push(cone([Math.cos(a) * 6.5, Math.sin(a) * 6.5, 6 + h], [Math.cos(a) * 7.5, Math.sin(a) * 7.5, 9 + h], 0.9, 0.2, 'purple', 'spike')); }
    P.push(cone([0, 0, 6 + h], [0, 0, 19 + h], 7.4, 0.6, 'purple', 'roof'));
    P.push(sph([0, 0, 25 + h], 3 + lv * 0.25, 'orb', 'orb'));
    for (let k = 0; k < Math.min(lv + 1, 5); k++) { const a = (k / Math.min(lv + 1, 5)) * Math.PI * 2; P.push(cone([Math.cos(a) * 6, Math.sin(a) * 6, 23 + h], [Math.cos(a) * 6, Math.sin(a) * 6, 27 + h], 1, 0.1, 'crystal', 'shard' + k)); }
    return P;
  },
  kho: (lv) => {
    const L = look(lv), P = [];
    P.push(box([0, 0, 1.5], [14.5, 12.5, 1.5], L.base, 'base'));
    P.push(box([0, -1, 10], [12, 8, 7], L.wall, 'body'));
    for (const s of [-1, 1]) P.push(box([s * 12.2, -1, 10], [0.8, 8.4, 7.2], L.trim, 'body'));
    P.push(box([0, -5.4, 21], [13.2, 5.6, 0.9], L.roof, 'roofA', rotX(-0.62)), box([0, 3.4, 21], [13.2, 5.6, 0.9], L.roof, 'roofB', rotX(0.62)), box([0, -1, 24.6], [13.4, 0.7, 0.7], L.trim, 'ridge'));
    P.push(box([0, 7.3, 7.5], [4, 0.6, 4.5], 'woodDark', 'door'), box([0, 7.6, 12.6], [4.6, 0.5, 0.6], L.trim, 'door'), cone([-4, 7.8, 3], [4, 7.8, 12], 0.4, 0.4, 'beam', 'door'));
    windows(P, 0, 7.2, 15, 2, 14, lv >= 4 ? 'glow' : 'eye');
    P.push(cyl([10.5, 10, 5], [0, 0, 1], 2.4, 2.8, 'wood', 'barrel'), cyl([10.5, 10, 6.6], [0, 0, 1], 2.5, 0.35, 'iron', 'barrel'));
    P.push(cyl([-11, 9.5, 5], [0, 0, 1], 2.4, 2.8, 'wood', 'barrel2'), cyl([-11, 9.5, 6.6], [0, 0, 1], 2.5, 0.35, 'iron', 'barrel2'));
    P.push(box([-9, -10.5, 4.5], [3, 2.6, 2.4], 'wood', 'crate'), box([-9, -10.5, 8.6], [2.2, 2, 1.8], 'wood', 'crate2'));
    P.push(ell([7, 10.5, 4.4], [2.6, 2, 1.8], 'sack', 'sack'), ell([4, 11, 4.2], [2.4, 1.9, 1.6], 'sack', 'sack2'));
    if (lv >= 3) for (let k = 0; k < lv - 2; k++) P.push(sph([-3 + k * 3, 11.5, 3.4 + (k % 2) * 0.6], 1.1, 'gold', 'coin' + k));
    return P;
  },
};
const ruin = (size) => {
  const P = [], w = size * 7;
  P.push(box([0, 0, 1.5], [w, w, 1.5], 'rubble', 'base'));
  const pts = [[-0.5, -0.3, 3], [0.4, -0.5, 2.4], [0.1, 0.4, 3.4], [-0.6, 0.5, 2], [0.6, 0.3, 2.6], [0, 0, 4]];
  pts.forEach(([x, y, r], k) => P.push(box([x * w, y * w, 3 + r * 0.5], [r, r * 0.8, r * 0.7], k % 2 ? 'stone' : 'woodDark', 'r' + k, rotZ(k * 0.7))));
  P.push(cone([-w * 0.3, w * 0.1, 3], [-w * 0.1, w * 0.4, 9], 0.8, 0.5, 'woodDark', 'beam'));
  return P;
};
const SIZES = { 'thanh-tri': 3, 'thap-cung': 2, 'phao-da': 2, 'thap-phep': 2, kho: 2 };

function frame(prims, w, h, ox, oy) {
  const world = prims.map((p) => xform(p, I3, [0, 0, 0]));
  return render(world, MATS, w, h, ox, oy, { scale: K });
}
function bbox(px) {
  let x0 = px.w, y0 = px.h, x1 = -1, y1 = -1;
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if ((px.get(x, y) & 255) > 0) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
}

fs.mkdirSync(OUT, { recursive: true });
// hand-drawn sheets imported with tools/spriteimport/buildings.mjs win over these placeholder models
const atlas = fs.existsSync(OUT + 'atlas.json') ? JSON.parse(fs.readFileSync(OUT + 'atlas.json', 'utf8')) : {};
for (const [type, model] of Object.entries(MODELS)) {
  if (atlas[type]?.source === 'import' && !process.argv.includes('--force')) { console.log(type, 'kept (hand-drawn)'); continue; }
  const W = 200, H = 240, ox = 100, oy = 170;
  const frames = [1, 2, 3, 4, 5].map((lv) => frame(model(lv), W, H, ox, oy));
  frames.push(frame(ruin(SIZES[type]), W, H, ox, oy));
  let X0 = 1e9, Y0 = 1e9, X1 = -1, Y1 = -1;
  for (const f of frames) { const [a, b, c, d] = bbox(f); X0 = Math.min(X0, a); Y0 = Math.min(Y0, b); X1 = Math.max(X1, c); Y1 = Math.max(Y1, d); }
  const cw = X1 - X0 + 1, ch = Y1 - Y0 + 1, sheet = new Px(cw, ch * frames.length);
  frames.forEach((f, i) => { const c = new Px(cw, ch); c.blit(f, -X0, -Y0); sheet.blit(c, 0, i * ch); });
  savePng(sheet, `${OUT}${type}.png`);
  atlas[type] = { size: [cw, ch], anchor: [ox - X0, oy - Y0], rows: { lv1: 0, lv2: 1, lv3: 2, lv4: 3, lv5: 4, ruin: 5 }, tiles: SIZES[type] };
  console.log(type, cw + '×' + ch);
}
fs.writeFileSync(OUT + 'atlas.json', JSON.stringify(atlas, null, 1));

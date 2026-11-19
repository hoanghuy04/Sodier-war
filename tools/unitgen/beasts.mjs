// Monster camp creatures (10 camp levels): simple SDF models rendered to pixel sprites in 8 directions.
// Usage: node tools/unitgen/beasts.mjs [--only=id,id] → docs/design/assets/units-beasts/<id>.png + atlas.json + preview.png
// One frame per state (idle, walk, attack, hit, death), the same atlas layout the game uses for the AI unit sheets.
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
import { add, mul, mv, rotX, rotY, xform, render, I3, ell, sph, cone } from './sdf.mjs';
import { humanoid, dragon, moveAll, scaleAll } from './rig.mjs';
import { materials, PATTERNS, humPose, DIRS } from './units.mjs';

const OUT = new URL('../../docs/design/assets/units-beasts/', import.meta.url).pathname;
const K = 2.1; // screen px per model unit (a scale-1 humanoid ends up about as tall as the AI soldier sprites)
const R4 = (a, b, c, d) => ({ ramp: [a, b, c, d] });
const TAU = Math.PI * 2;

// ---------------- materials ----------------
const MATS = {
  ratFur: R4('#3a3036', '#5e5058', '#867880', '#aa9ca4'), ratPink: R4('#8a4a52', '#c07078', '#e09aa0', '#f4c4c8'),
  wolfFur: R4('#2e3038', '#52566a', '#7c8296', '#a8aec0'), wolfBelly: R4('#6a6a72', '#9a9aa4', '#c4c4cc', '#e4e4ea'),
  bearFur: R4('#2a1810', '#4e3020', '#74482c', '#966040'), bearBelly: R4('#4a3020', '#6e4a30', '#946a48', '#b08a62'),
  spider: R4('#141018', '#2a2032', '#463650', '#62506e'), spiderMark: R4('#6a1010', '#b02020', '#e04030', '#ff7a5a'),
  goblin: R4('#2a4a14', '#4a7a22', '#72a838', '#9ccc5a'), orc: R4('#2a3a22', '#4a5e36', '#6e8250', '#92a66c'),
  troll: R4('#2a3442', '#465468', '#687a90', '#8ea0b4'), mino: R4('#3a1c0e', '#62321a', '#8a4c28', '#ac6a3c'),
  rag: R4('#2e2214', '#4e3a20', '#6e5430', '#8c6e44'), ragDark: R4('#1e160c', '#342614', '#4a3820', '#5e4a2c'),
  claw: R4('#4a4438', '#8a8070', '#c4bcaa', '#ece6d8'), nose: R4('#100c0e', '#1e181c', '#2e262a', '#3e3438'),
  redEye: { ramp: ['#a01010', '#ff3020', '#ff8a60', '#ffffff'], emissive: true },
  yellowEye: { ramp: ['#a08000', '#f0c800', '#fff060', '#ffffff'], emissive: true },
  rock: R4('#3a3a40', '#5e5e66', '#86868e', '#a8a8b0'),
  // wyvern (green) and ancient dragon (black / ember) recolour the dragon rig's materials
  wyvern: { dragon: R4('#14300e', '#2a5a1c', '#468a2e', '#6cb848'), dragonJaw: R4('#14300e', '#2a5a1c', '#3e7a28', '#5aa040'), belly: R4('#5a5a1a', '#8a8a2a', '#b8b84a', '#e0e070'), membrane: R4('#1a2a10', '#2e4a1c', '#466a2a', '#5e8a3a'), spike: R4('#3a3a2a', '#6a6a4a', '#9a9a70', '#c8c8a0') },
  ancient: { dragon: R4('#0e0a12', '#1e1624', '#30243a', '#463650'), dragonJaw: R4('#0e0a12', '#1e1624', '#2a2034', '#3e3048'), belly: R4('#6a2a0a', '#b04a10', '#e07a20', '#ffb040'), membrane: R4('#3a0a0a', '#6a1410', '#9a2418', '#c83a20'), spike: R4('#4a1a0a', '#8a3010', '#c85a1a', '#f09030'), horn: R4('#4a4038', '#8a7a68', '#c4b49a', '#f0e4cc') },
};
function matsFor(c) {
  const m = { ...materials('red'), ...MATS };
  m.team = MATS.rag; m.teamDark = MATS.ragDark; m.capMat = MATS.rag; m.overall = MATS.rag;
  if (c.skin) { m.skin = MATS[c.skin]; }
  if (c.recolor) Object.assign(m, MATS[c.recolor]);
  if (c.belly) m.belly = MATS[c.belly];
  return m;
}

// ---------------- four-legged beast ----------------
/** cfg: L half length, R body radius, leg, head, snout, ears 'pointy'|'round', tail, mat, belly, mane, eye; pose: ph, amp, lunge, mouth, front */
function beast(c, p) {
  const P = [], { L, R, leg, head } = c, bz = leg + R * 0.55, m = c.mat, ph = p.ph ?? 0, amp = p.amp ?? 0;
  P.push(ell([0, 0, bz], [R * 0.85, L, R * 0.92], m, 'body', I3, { pattern: 'belly' }));
  P.push(sph([0, L * 0.55, bz + R * 0.12], R * 0.95, m, 'body', { pattern: 'belly' }));
  P.push(sph([0, -L * 0.55, bz], R * 0.88, m, 'body', { pattern: 'belly' }));
  if (c.mane) P.push(ell([0, L * 0.6, bz + R * 0.45], [R * 0.95, R * 0.9, R * 0.85], c.mane, 'body'));
  if (c.hump) P.push(sph([0, L * 0.45, bz + R * 0.6], R * 0.75, m, 'body'));
  const lunge = p.lunge ?? 0, mouth = p.mouth ?? 0;
  const hc = [0, L + head * 0.55 + lunge * head * 0.8, bz + R * 0.55 - lunge * head * 0.3 + (p.headUp ?? 0)];
  P.push(cone([0, L * 0.7, bz + R * 0.3], hc, R * 0.7, head * 0.8, m, 'neck'));
  P.push(sph(hc, head, m, 'head'));
  const sn = c.snout;
  P.push(cone(add(hc, [0, head * 0.45, -head * 0.15]), add(hc, [0, head * 0.6 + sn, -head * 0.3]), head * 0.62, head * 0.34, m, 'head'));
  P.push(sph(add(hc, [0, head * 0.6 + sn, -head * 0.22]), head * 0.24, 'nose', 'head'));
  P.push(cone(add(hc, [0, head * 0.35, -head * 0.55]), add(hc, [0, head * 0.5 + sn * 0.85, -head * 0.6 - mouth * head * 0.7]), head * 0.42, head * 0.22, c.jaw ?? m, 'jaw'));
  if (mouth > 0.3) for (const s of [1, -1]) P.push(cone(add(hc, [s * head * 0.25, head * 0.5 + sn * 0.7, -head * 0.42]), add(hc, [s * head * 0.25, head * 0.5 + sn * 0.75, -head * 0.75]), head * 0.12, 0.05, 'claw', 'jaw'));
  for (const s of [1, -1]) {
    P.push(sph(add(hc, [s * head * 0.48, head * 0.62, head * 0.28]), head * 0.2, c.eye ?? 'redEye', 'head'));
    if (c.ears === 'pointy') P.push(cone(add(hc, [s * head * 0.5, -head * 0.1, head * 0.55]), add(hc, [s * head * 0.72, -head * 0.25, head * 1.55]), head * 0.34, 0.08, m, 'ear' + s));
    else if (c.ears === 'round') P.push(sph(add(hc, [s * head * 0.68, -head * 0.15, head * 0.72]), head * 0.36, c.earMat ?? m, 'ear' + s));
  }
  // legs: trot (diagonal pairs move together)
  for (const [s, y, off] of [[1, 1, 0], [-1, 1, Math.PI], [1, -1, Math.PI], [-1, -1, 0]]) {
    const sw = Math.sin(ph + off) * amp + (y > 0 ? p.front ?? 0 : 0);
    const lift = Math.max(0, Math.cos(ph + off)) * amp * leg * 0.35 + (y > 0 ? (p.front ?? 0) * leg * 0.6 : 0);
    const hip = [s * R * 0.58, y * L * 0.62, bz - R * 0.35];
    const foot = [s * R * 0.62, y * L * 0.62 + Math.sin(sw) * leg * 0.75, Math.max(R * 0.22, lift + R * 0.22)];
    P.push(cone(hip, foot, R * 0.4, R * 0.26, m, 'leg' + s + y));
    P.push(ell(add(foot, [0, R * 0.12, 0]), [R * 0.28, R * 0.36, R * 0.22], c.paw ?? m, 'leg' + s + y));
  }
  // tail
  let prev = [0, -L * 1.0, bz + R * 0.25];
  const n = c.tailSeg ?? 4, sway = p.sway ?? 0;
  for (let k = 1; k <= n; k++) {
    const t = k / n, q = [Math.sin(k * 0.9) * sway * k * 0.4, -L * 1.0 - t * c.tail, bz + R * 0.25 + (c.tailUp ?? 0) * t - (c.tailDown ?? 0) * t * t];
    P.push(cone(prev, q, (c.tailR ?? R * 0.3) * (1 - t * 0.6), (c.tailR ?? R * 0.3) * (1 - t * 0.75), c.tailMat ?? m, 'tail'));
    prev = q;
  }
  return P;
}

// ---------------- spider ----------------
function spider(c, p) {
  const P = [], R = c.R, bz = R * 0.95, ph = p.ph ?? 0, amp = p.amp ?? 0, lunge = p.lunge ?? 0;
  P.push(ell([0, -R * 1.25, bz + R * 0.35], [R * 1.05, R * 1.35, R * 0.95], 'spider', 'abd'));
  P.push(ell([0, -R * 1.5, bz + R * 1.05], [R * 0.45, R * 0.6, R * 0.25], 'spiderMark', 'abd'));
  const ce = [0, R * 0.35 + lunge * R * 0.5, bz + R * 0.05 + lunge * R * 0.3];
  P.push(ell(ce, [R * 0.72, R * 0.8, R * 0.6], 'spider', 'head'));
  for (const [x, y, z, r] of [[0.22, 0.72, 0.28, 0.13], [-0.22, 0.72, 0.28, 0.13], [0.42, 0.62, 0.2, 0.09], [-0.42, 0.62, 0.2, 0.09], [0.12, 0.78, 0.05, 0.08], [-0.12, 0.78, 0.05, 0.08]]) P.push(sph(add(ce, [x * R, y * R, z * R]), r * R, 'redEye', 'head'));
  for (const s of [1, -1]) P.push(cone(add(ce, [s * R * 0.2, R * 0.7, -R * 0.2]), add(ce, [s * R * 0.12, R * (0.95 + lunge * 0.3), -R * 0.75]), R * 0.15, 0.05, 'claw', 'fang' + s));
  for (const s of [1, -1])
    for (let k = 0; k < 4; k++) {
      const a = (-0.9 + k * 0.55) * 1, off = (k % 2 ? Math.PI : 0) + (s > 0 ? 0 : Math.PI);
      const sw = Math.sin(ph + off) * amp * 0.5, lift = Math.max(0, Math.cos(ph + off)) * amp * R * 0.5;
      const hip = add(ce, [s * R * 0.45, -R * 0.15 - k * R * 0.18, 0]);
      const dir = [Math.cos(a + sw) * s, -Math.sin(a + sw), 0];
      const knee = add(hip, [dir[0] * R * 1.2, dir[1] * R * 1.2 - (k === 0 ? lunge * R * -0.6 : 0), R * 0.9 + lift]);
      const foot = [hip[0] + dir[0] * R * 2.3, hip[1] + dir[1] * R * 2.3, lift * 0.6 + R * 0.08];
      P.push(cone(hip, knee, R * 0.17, R * 0.13, 'spider', 'leg' + s + k), cone(knee, foot, R * 0.13, R * 0.05, 'spider', 'leg' + s + k));
    }
  return P;
}

// ---------------- roster ----------------
// kind: 'beast' | 'spider' | 'hum' | 'drg'. size: model scale. Shadow [rx, ry] in model units.
export const BEASTS = [
  { id: 'chuot-khong-lo', name: 'Chuột khổng lồ', kind: 'beast', size: 1, cfg: { L: 4.2, R: 2.6, leg: 2.2, head: 2.4, snout: 2.4, ears: 'round', earMat: 'ratPink', tail: 9, tailR: 0.55, tailSeg: 6, tailDown: 2, tailMat: 'ratPink', mat: 'ratFur', paw: 'ratPink' } },
  { id: 'soi-xam', name: 'Sói xám', kind: 'beast', size: 1, cfg: { L: 5.4, R: 2.7, leg: 5.2, head: 2.6, snout: 3, ears: 'pointy', tail: 5.5, tailR: 1.1, tailUp: 1.5, mat: 'wolfFur', mane: 'wolfFur', belly: 'wolfBelly', eye: 'yellowEye', paw: 'wolfFur' } },
  { id: 'goblin', name: 'Goblin', kind: 'hum', size: 0.78, wc: 'sword', skin: 'goblin', ears: 'goblin', cfg: { torso: 'leather', weapon: 'sword', sleeve: 'rag', hair: null } },
  { id: 'goblin-cung', name: 'Goblin cung', kind: 'hum', size: 0.78, wc: 'bow', skin: 'goblin', ears: 'goblin', cfg: { torso: 'leather', helmet: 'hood', hoodMat: 'rag', weapon: 'bow', quiver: true, sleeve: 'rag' } },
  { id: 'nhen-doc', name: 'Nhện độc', kind: 'spider', size: 1, cfg: { R: 3.4 } },
  { id: 'gau-nau', name: 'Gấu nâu', kind: 'beast', size: 1.3, cfg: { L: 5.6, R: 4.2, leg: 3.6, head: 3.2, snout: 1.8, ears: 'round', tail: 1.2, tailR: 1.2, tailSeg: 1, mat: 'bearFur', belly: 'bearBelly', hump: true, paw: 'bearFur' } },
  { id: 'orc', name: 'Orc chiến binh', kind: 'hum', size: 1.12, wc: 'greatsword', skin: 'orc', ears: 'orc', tusks: true, cfg: { torso: 'leather', helmet: 'horned', helmetMat: 'rock', weapon: 'greatsword', sleeve: 'rag', hair: 'hairBlack', glove: 'orc' } },
  { id: 'troll', name: 'Troll đá', kind: 'hum', size: 1.4, wc: 'staff', skin: 'troll', ears: 'orc', tusks: true, cfg: { torso: 'leather', weapon: 'staff', orb: 'rock', sleeve: 'troll', glove: 'troll', legs: 'troll' } },
  { id: 'minotaur', name: 'Minotaur', kind: 'hum', size: 1.4, wc: 'greatsword', skin: 'mino', horns: true, snout: true, cfg: { torso: 'leather', weapon: 'greatsword', sleeve: 'mino', glove: 'mino', legs: 'mino', hair: 'mane' } },
  { id: 'wyvern', name: 'Wyvern', kind: 'drg', size: 0.72, recolor: 'wyvern' },
  { id: 'rong-co-dai', name: 'Rồng cổ đại', kind: 'drg', size: 1.25, recolor: 'ancient' },
];
const STATES = ['idle', 'walk', 'attack', 'hit', 'death'];

function headExtras(b, p, hz) {
  // goblin / orc ears, tusks, minotaur horns + muzzle; placed on the humanoid head (centre [0, 0.3, hz + 12.6])
  const hc = [0, 0.3, hz + 12.6], E = [];
  for (const s of [1, -1]) {
    if (b.ears === 'goblin') E.push(cone(add(hc, [s * 5, 0.4, 0.6]), add(hc, [s * 10.5, -1.2, 2.6]), 1.6, 0.15, 'skin', 'ear' + s));
    if (b.ears === 'orc') E.push(cone(add(hc, [s * 5.2, 0.2, 0.2]), add(hc, [s * 7.6, -0.8, 1.6]), 1.2, 0.2, 'skin', 'ear' + s));
    if (b.tusks) E.push(cone(add(hc, [s * 1.6, 5, -2.8]), add(hc, [s * 1.9, 5.6, -0.6]), 0.55, 0.1, 'claw', 'head'));
    if (b.horns) { E.push(cone(add(hc, [s * 4.6, 0, 3]), add(hc, [s * 8.4, 0.8, 4.8]), 1.4, 0.8, 'claw', 'horn' + s)); E.push(cone(add(hc, [s * 8.4, 0.8, 4.8]), add(hc, [s * 9, 1.8, 8.4]), 0.8, 0.12, 'claw', 'horn' + s)); }
  }
  if (b.snout) { E.push(ell(add(hc, [0, 5.4, -2.2]), [3.2, 2.2, 2.2], 'skin', 'head')); for (const s of [1, -1]) E.push(sph(add(hc, [s * 1.2, 7.4, -2.2]), 0.6, 'nose', 'head')); E.push(cyl0(add(hc, [0, 7.3, -3]))); }
  const L = rotX(-(p.lean ?? 0));
  return moveAll(E, L, [0, 0, hz], [0, 0, p.bob ?? 0]);
}
const cyl0 = (c) => ({ k: 'ell', c, r: [1.2, 0.5, 0.5], R: I3, mat: 'gold', g: 'ring' }); // nose ring

/** model primitives for one state (single representative frame) */
function pose(b, state) {
  let prims = [], hover = 0, shadow = [6, 2.6];
  if (b.kind === 'beast') {
    const q = { idle: { sway: 0.4 }, walk: { ph: 1.2, amp: 0.55, sway: 1 }, attack: { lunge: 1, mouth: 1, front: 0.35 }, hit: { headUp: 0.8, sway: -0.6 }, death: {} }[state];
    prims = beast(b.cfg, q);
    if (state === 'hit') prims = moveAll(prims, rotX(-0.12), [0, -b.cfg.L, 0]);
    if (state === 'attack') prims = moveAll(prims, rotX(0.06), [0, 0, 0], [0, 1, 0]);
    if (state === 'death') prims = moveAll(prims, rotY(1.45), [0, 0, 0], [0, 0, b.cfg.R * 0.5]);
    shadow = [b.cfg.R * 1.15, b.cfg.L * 0.55];
  } else if (b.kind === 'spider') {
    const q = { idle: {}, walk: { ph: 1, amp: 0.8 }, attack: { lunge: 1 }, hit: {}, death: {} }[state];
    prims = spider(b.cfg, q);
    if (state === 'hit') prims = moveAll(prims, rotX(-0.15), [0, -b.cfg.R, 0]);
    if (state === 'death') prims = moveAll(prims, rotY(Math.PI * 0.92), [0, 0, b.cfg.R], [0, 0, 0]);
    shadow = [b.cfg.R * 2, b.cfg.R * 1.4];
  } else if (b.kind === 'hum') {
    const [anim, f] = { idle: ['idle', 0], walk: ['walk', 1], attack: ['attack', 3], hit: ['idle', 0], death: ['death', 5] }[state];
    const p = humPose(b.wc, anim, f, 6, false);
    const hz = 6.5;
    prims = [...humanoid(b.cfg, p), ...headExtras(b, p, hz)];
    if (state === 'hit') prims = moveAll(prims, rotX(-0.18), [0, 0, 0]);
    if (p.fall) prims = moveAll(prims, rotX(p.fall), [0, 0, 0], [0, 0, Math.sin(p.fall) * 1.8]);
    shadow = [7.5, 2.8];
  } else if (b.kind === 'drg') {
    const dp = { flap: 0.3, tailSway: 0.6, gait: 0, gaitAmp: 0, legsTuck: 0.5 };
    if (state === 'walk') { dp.flap = 1.0; dp.tailSway = 1.1; }
    if (state === 'attack') { dp.neckF = 2; dp.mouth = 1; dp.flap = 0.6; }
    if (state === 'hit') { dp.neckF = -2; dp.flap = -0.2; }
    if (state === 'death') dp.flap = -0.5;
    hover = state === 'death' ? 0 : state === 'walk' ? 9 : 8;
    prims = dragon(dp);
    if (state === 'death') prims = moveAll(prims, rotY(1.3), [0, 0, 0], [0, 0, 5]);
    shadow = [17, 7];
  }
  if (hover) prims = moveAll(prims, rotX(0), [0, 0, 0], [0, 0, hover]);
  return { prims: scaleAll(prims, b.size), shadow: shadow.map((v) => v * b.size), flash: state === 'hit' };
}

function renderFrame(b, state, deg, big) {
  const { prims, shadow, flash } = pose(b, state);
  const a = (deg * Math.PI) / 180;
  const F = [[-Math.cos(a), Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
  const world = prims.map((p) => xform(p, F, [0, 0, 0]));
  const [w, h, ox, oy] = big;
  const spr = render(world, matsFor(b), w, h, ox, oy, { patterns: PATTERNS, scale: K, flash: false });
  const out = new Px(w, h);
  // shadow ellipse (screen: x radius from the larger horizontal extent, y squashed)
  const rx = Math.max(shadow[0], shadow[1] * 0.6) * K, ry = Math.max(shadow[0], shadow[1]) * 0.5 * K;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (Math.hypot((x - ox) / rx, (y - oy) / ry) <= 1) out.set(x, y, '#0000004a');
  out.blit(spr, 0, 0);
  if (flash) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = spr.get(x, y); if ((v & 255) > 200) out.set(x, y, '#ffffff40'); }
  return out;
}
function bbox(px) {
  let x0 = px.w, y0 = px.h, x1 = -1, y1 = -1;
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if ((px.get(x, y) & 255) > 0) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
}

export function buildBeasts(only = null) {
  fs.mkdirSync(OUT, { recursive: true });
  const atlasFile = OUT + 'atlas.json';
  const atlas = fs.existsSync(atlasFile) ? JSON.parse(fs.readFileSync(atlasFile, 'utf8')) : {};
  for (const b of BEASTS) {
    if (only && !only.includes(b.id)) continue;
    const t0 = Date.now();
    const big = [Math.round(130 * b.size * K / 2.1 + 60), Math.round(130 * b.size * K / 2.1 + 60), 0, 0];
    big[2] = big[0] >> 1; big[3] = Math.round(big[1] * 0.72);
    const frames = STATES.map((s) => DIRS.map(([, deg]) => renderFrame(b, s, deg, big)));
    // crop every frame to the union box, keeping the ground anchor
    let X0 = 1e9, Y0 = 1e9, X1 = -1, Y1 = -1;
    for (const row of frames) for (const f of row) { const [a, c, d, e] = bbox(f); if (d < 0) continue; X0 = Math.min(X0, a); Y0 = Math.min(Y0, c); X1 = Math.max(X1, d); Y1 = Math.max(Y1, e); }
    X0 -= 1; Y0 -= 1; X1 += 1; Y1 += 1;
    const cw = X1 - X0 + 1, ch = Y1 - Y0 + 1;
    const sheet = new Px(cw, ch * STATES.length * 8);
    const states = {};
    STATES.forEach((s, si) => {
      states[s] = { row: si * 8, frames: 1 };
      frames[si].forEach((f, d) => { const c = new Px(cw, ch); c.blit(f, -X0, -Y0); sheet.blit(c, 0, (si * 8 + d) * ch); });
    });
    savePng(sheet, `${OUT}${b.id}.png`);
    atlas[b.id] = { size: [cw, ch], anchor: [big[2] - X0, big[3] - Y0], dirs: DIRS.map(([d]) => d), states, source: 'beasts.mjs' };
    console.log(`${b.id}: ${cw}×${ch} (${Date.now() - t0} ms)`);
  }
  fs.writeFileSync(atlasFile, JSON.stringify(atlas, null, 1));
  return atlas;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const only = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7);
  buildBeasts(only ? only.split(',') : null);
}

// Unit roster, materials, poses per animation, and the frame builder.
import { add, mul, norm, mv, rotX, rotY, rotZ, xform, render, project } from './sdf.mjs';
import { humanoid, horse, griffin, dragon, catapult, moveAll, scaleAll } from './rig.mjs';
import { Px, mix, noise } from '../mapgen/core.mjs';

// ---------------- materials ----------------
const R4 = (a, b, c, d) => ({ ramp: [a, b, c, d] });
export const TEAMS = {
  blue: [['#1a2350', '#2c4290', '#4566c4', '#7c9ce8'], ['#121834', '#1e2c62', '#2e4490', '#4a64b8']],
  red: [['#5a1414', '#a82828', '#e04a3a', '#ff9a7a'], ['#3e0c0c', '#7a1c1c', '#a83030', '#d05a4a']],
};
export function materials(team = 'blue') {
  const [t, td] = TEAMS[team];
  return {
    team: { ramp: t }, teamDark: { ramp: td },
    steel: { ramp: ['#2e3150', '#5a6088', '#9aa2c8', '#d4daf0'], spec: '#ffffff' },
    steelLight: { ramp: ['#5a6088', '#9aa2c8', '#d4daf0', '#ffffff'], spec: '#ffffff' },
    mail: { ramp: ['#24263a', '#3c4060', '#5a6084', '#7e86ac'], pattern: (pm) => ((Math.floor(pm[0] * 1.4) + Math.floor(pm[2] * 1.4)) % 2 ? null : 'mailDark') },
    mailDark: R4('#1c1e30', '#30344e', '#4a5070', '#646c92'),
    bronze: { ramp: ['#6a3a10', '#c06a1a', '#f0a040', '#ffd890'], spec: '#fff0c0' },
    belt: R4('#2a1810', '#4a2c16', '#6a4020', '#8a5a2c'),
    bootCuff: R4('#3a2214', '#6a4024', '#8f5a32', '#b07a48'),
    crossLight: { ramp: ['#6a98f0', '#9cc0ff', '#d8e6ff', '#ffffff'], emissive: true },
    blade: { ramp: ['#4a5468', '#8a96ac', '#c8d2e2', '#f4f8ff'], spec: '#ffffff' },
    gold: { ramp: ['#6a3e0a', '#b8801c', '#e8b830', '#fff0a0'], spec: '#fffbe0' },
    skin: R4('#b0604a', '#e08e6a', '#f7bf98', '#ffdcc0'),
    eye: R4('#1b1726', '#1b1726', '#1b1726', '#1b1726'),
    eyeHi: { ramp: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'], emissive: true },
    mouth: R4('#a83a3a', '#c84a44', '#d85a50', '#d85a50'),
    pants: R4('#1a1c2c', '#2c3048', '#434a6a', '#5c6488'),
    boots: R4('#2a1810', '#4e2e1a', '#6e4426', '#8e5a34'),
    leather: R4('#3e2414', '#6a4024', '#8f5a32', '#b07a48'),
    wood: R4('#3e2414', '#6e4424', '#9a6434', '#b8844a'),
    woodDark: R4('#2a180c', '#4a2e18', '#6a4426', '#8a5a32'),
    hood: R4('#173018', '#2a5a2a', '#3f8a3a', '#68b450'),
    hoodStar: { ramp: ['#1a1440', '#2e2470', '#4a3aa8', '#6e5ad8'], pattern: (pm) => (noise(Math.floor(pm[0] * 1.3), Math.floor(pm[2] * 1.3) + Math.floor(pm[1] * 1.3) * 97, 5) > 0.93 ? '#f4f0ff' : null) },
    hair: R4('#2a1608', '#4a2a12', '#6a3e1c', '#8a5428'),
    hairWhite: R4('#8a8ca8', '#c4c8dc', '#e8ecf6', '#ffffff'),
    hairBlack: R4('#0e0e14', '#1e1e2a', '#34344a', '#4a4a66'),
    hat: R4('#24123e', '#3e2270', '#5e36a8', '#8a5ad8'),
    orb: { ramp: ['#1e4a8a', '#3a8ae0', '#8ad0ff', '#e8f8ff'], emissive: true },
    fire: { ramp: ['#a82a10', '#f06a1a', '#ffb43a', '#fff0a0'], emissive: true },
    lamp: { ramp: ['#a87a10', '#f0c030', '#ffe680', '#ffffff'], emissive: true },
    star: { ramp: ['#a8a8d8', '#d8d8ff', '#f4f4ff', '#ffffff'], emissive: true },
    plumeRed: R4('#5a1010', '#a82424', '#e04434', '#ff8a6a'),
    plumeBlue: R4('#141c5a', '#2a40a8', '#4a6ae0', '#8aa8ff'),
    feather: R4('#8a8a8a', '#c8c8c8', '#ececec', '#ffffff'),
    string: R4('#a89a7a', '#d8ccaa', '#ece4c8', '#ffffff'),
    peasant: R4('#3a2a18', '#6a5030', '#8a6a40', '#a88a58'),
    capMat: { ramp: t }, overall: { ramp: t },
    white: R4('#c8ccd8', '#e8ecf4', '#ffffff', '#ffffff'),
    horse: R4('#3a1e0e', '#6a3a1c', '#9a5a2c', '#c07a40'),
    horseWhite: R4('#7a7c94', '#b8bccc', '#e4e8f0', '#ffffff'),
    horseBlack: R4('#121216', '#24242c', '#3a3a46', '#56566a'),
    mane: R4('#1e100a', '#3a2010', '#5a3418', '#7a4a22'),
    hoof: R4('#141010', '#2a2420', '#3e3630', '#56504a'),
    lion: R4('#6a4418', '#a8702c', '#d0a050', '#ecc880'),
    lionDark: R4('#3a2410', '#6a4420', '#8a5a2a', '#a8743a'),
    featherW: R4('#8a8a9a', '#c8ccd8', '#eef0f6', '#ffffff'),
    beak: R4('#7a5a08', '#c8901a', '#f0c030', '#ffe680'),
    wing: { ramp: ['#4a2e14', '#7a4e24', '#a8743a', '#c89a5a'], pattern: (pm, pl) => (Math.abs(pl[0]) > 3.4 && ((pl[0] * 1.4) | 0) % 2 ? 'wingTip' : null) },
    wingTip: R4('#2e1c0c', '#5a3a1a', '#7a5a32', '#a07a4a'),
    dragon: R4('#3a0810', '#7a1418', '#b8281e', '#e8503a'),
    dragonJaw: R4('#3a0810', '#7a1418', '#a8241c', '#d0402e'),
    belly: R4('#6a3a0a', '#b07a20', '#e0b040', '#ffe080'),
    spike: R4('#6a5a3a', '#a8946a', '#d8c89a', '#f6ecd0'),
    horn: R4('#6a5a3a', '#a8946a', '#d8c89a', '#f6ecd0'),
    membrane: R4('#2a0610', '#561018', '#7a1c22', '#9a3030'),
    dEye: { ramp: ['#a87a00', '#f0c000', '#ffe860', '#ffffff'], emissive: true },
    barrel: R4('#2a180c', '#5a3418', '#7a4a22', '#9a6430'),
    scale: { ramp: ['#3a0a0a', '#7a1a14', '#a8301e', '#d85a3a'], pattern: (pm) => { const row = Math.floor(pm[2] / 1.3); const fx = (((pm[0] + (row % 2) * 0.8) / 1.6) % 1 + 1) % 1; return fx < 0.2 || ((pm[2] / 1.3) % 1 + 1) % 1 < 0.22 ? 'scaleDark' : null; } },
    scaleDark: R4('#1e0404', '#3a0a0a', '#5a1410', '#7a1a14'),
    darkRed: { ramp: ['#2a0808', '#5a1414', '#8a2020', '#b84030'], spec: '#ff9a7a' },
    hardhat: { ramp: ['#6a4a08', '#c8901a', '#f0c030', '#ffe680'], spec: '#ffffff' },
    robeWhite: R4('#8a8aa0', '#c0c4d0', '#e8ecf2', '#ffffff'),
  };
}
export const PATTERNS = {
  shield: (pm, q) => { const r = Math.hypot(q[0], q[1]); if (Math.abs(q[2]) > 0.3 && r < 3.4 && ((Math.abs(q[0]) < 0.75 && q[1] > -2.4 && q[1] < 2.6) || (Math.abs(q[1] - 0.7) < 0.7 && Math.abs(q[0]) < 2))) return 'white'; return r > 3.45 || Math.abs(q[2]) <= 0.3 ? 'steel' : null; },
  heater: (pm, q) => { const rim = q[1] >= 0 ? Math.abs(q[0]) > 3.25 || q[1] > 3.6 : (q[0] / 4.25) ** 2 + (q[1] / 5.9) ** 2 > 0.66; if (rim || Math.abs(q[2]) < 0.3) return 'steel'; if ((Math.abs(q[0]) < 0.75 && q[1] > -3.6 && q[1] < 2.8) || (Math.abs(q[1] - 0.9) < 0.7 && Math.abs(q[0]) < 2.3)) return 'crossLight'; return null; },
  visor: () => null,
  hatband: (pm, q) => (q[0] > 0.5 && q[0] < 1.9 ? 'gold' : null),
  caparison: (pm) => (pm[2] < 10.8 && pm[2] > 5.4 && Math.abs(pm[0]) > 2.3 ? (pm[2] < 6.4 ? 'gold' : 'team') : null),
  belly: (pm, q, n) => (n[2] < -0.3 ? 'belly' : null),
  wheel: (pm, q, n, p) => { const r = Math.hypot(q[0], q[1]); if (r > 2.5 || Math.abs(q[2]) < 0.45) return 'woodDark'; if (r < 0.8) return 'steel'; const a = Math.atan2(q[1], q[0]) + (p.spin ?? 0); return Math.abs(Math.sin(a * 3)) < 0.3 ? 'woodDark' : null; },
};

// ---------------- roster ----------------
// size: [w, h, ox, oy] sprite canvas and the pixel where the feet / ground centre sits
export const PIX = 1.5; // screen px per model unit
const S = (a) => a.map((v) => Math.round(v * PIX));
const INF = S([48, 56, 24, 42]), MNT = S([70, 76, 35, 60]), AIR = S([84, 88, 42, 72]), DRG = S([116, 108, 58, 84]), CAT = S([84, 76, 42, 58]);
export const UNITS = [
  { id: 'dan-quan', name: 'Dân quân', cls: 'Bộ binh', kind: 'hum', size: INF, wc: 'spear', cfg: { torso: 'leather', helmet: 'cap', weapon: 'pitchfork', hair: 'hair', sleeve: 'peasant' } },
  { id: 'kiem-si', name: 'Kiếm sĩ', cls: 'Bộ binh', kind: 'hum', size: INF, wc: 'sword', cfg: { torso: 'mail', helmet: 'kettle', weapon: 'sword', shield: 'heater', pauldrons: true, hair: 'hair', glove: 'skin', sleeve: 'mail' } },
  { id: 'linh-giao', name: 'Lính giáo', cls: 'Giáo', kind: 'hum', size: INF, wc: 'spear', cfg: { torso: 'mail', helmet: 'kettle', plume: 'plumeBlue', weapon: 'spear', pauldrons: true, hair: 'hair', sleeve: 'mail' } },
  { id: 'cung-thu', name: 'Cung thủ', cls: 'Tầm xa', kind: 'hum', size: INF, wc: 'bow', cfg: { torso: 'leather', helmet: 'hood', weapon: 'bow', quiver: true, sleeve: 'hood', hair: 'hair' } },
  { id: 'ky-binh', name: 'Kỵ binh', cls: 'Kỵ', kind: 'mnt', size: MNT, wc: 'lance', cfg: { torso: 'mail', helmet: 'kettle', plume: 'plumeBlue', weapon: 'lance', pauldrons: true, mounted: true, hair: 'hair', sleeve: 'mail' }, mount: { coat: 'horse' } },
  { id: 'hiep-si', name: 'Hiệp sĩ', cls: 'Kỵ', kind: 'mnt', size: MNT, wc: 'sword', cfg: { torso: 'armor', helmet: 'greathelm', plume: 'plumeRed', weapon: 'sword', shield: 'heater', cape: true, mounted: true, glove: 'steel', legs: 'steel' }, mount: { coat: 'horseWhite', mane: 'hairWhite', caparison: true } },
  { id: 'phap-su', name: 'Pháp sư', cls: 'Phép', kind: 'hum', size: INF, wc: 'staff', cfg: { torso: 'robe', robe: 'hat', helmet: 'wizard', weapon: 'staff', hair: 'hairWhite', sleeve: 'hat' } },
  { id: 'may-ban-da', name: 'Máy bắn đá lửa', cls: 'Công thành', kind: 'cat', size: CAT },
  { id: 'su-thuu', name: 'Sư thứu', cls: 'Bay', kind: 'gri', size: AIR, wc: 'lance', cfg: { torso: 'tunic', helmet: 'kettle', plume: 'plumeBlue', weapon: 'spear', mounted: true } },
  { id: 'rong', name: 'Rồng', cls: 'Bay', kind: 'drg', size: DRG },
  // heroes
  { id: 'thach-lam', name: 'Thạch Lâm', cls: 'Anh hùng', kind: 'hum', size: INF, wc: 'greatsword', cfg: { torso: 'armor', helmet: 'kettle', plume: 'plumeRed', weapon: 'greatsword', cape: true, glove: 'steel', legs: 'steel' } },
  { id: 'kim-ha', name: 'Kim Hạ', cls: 'Anh hùng', kind: 'hum', size: INF, wc: 'sword', cfg: { torso: 'overall', helmet: 'hardhat', weapon: 'pick', hair: 'hair', longHair: true, sleeve: 'leather' } },
  { id: 'phong-vu', name: 'Phong Vũ', cls: 'Anh hùng', kind: 'mnt', size: MNT, wc: 'lance', cfg: { torso: 'leather', hair: 'hairBlack', weapon: 'lance', pennant: true, scarf: true, mounted: true, sleeve: 'team' }, mount: { coat: 'horseBlack', mane: 'hairWhite' } },
  { id: 'lam-nguyet', name: 'Lam Nguyệt', cls: 'Anh hùng', kind: 'hum', size: INF, wc: 'staff', cfg: { torso: 'robe', robe: 'hoodStar', helmet: 'hood', hoodMat: 'hoodStar', weapon: 'moonstaff', hair: 'hairWhite', longHair: true, sleeve: 'hoodStar' } },
  { id: 'hoa-ky', name: 'Hỏa Kỳ', cls: 'Anh hùng', kind: 'hum', size: INF, wc: 'whip', cfg: { torso: 'scale', helmet: 'horned', helmetMat: 'darkRed', weapon: 'whip', cape: true, glove: 'darkRed', legs: 'scaleDark' } },
];
export const ANIMS = { idle: 4, walk: 6, attack: 6, victory: 6, death: 6 };
export const ANIM_VI = { idle: 'chờ', walk: 'đi', attack: 'đánh', victory: 'chiến thắng', death: 'chết' };
// clockwise on screen, starting facing the viewer
export const DIRS = [['S', 0], ['SW', 315], ['W', 270], ['NW', 225], ['N', 180], ['NE', 135], ['E', 90], ['SE', 45]];
export const HIT_FRAME = 3;

// ---------------- humanoid poses ----------------
const TAU = Math.PI * 2;
function idleHands(wc) {
  switch (wc) {
    case 'sword': return { handR: [4.6, 4.2, 3.2], handL: [-4.6, 3.6, 4.6], w: [0.62, 0.3, 0.72], shieldN: [-0.2, 1, 0.05] };
    case 'greatsword': return { handR: [4.4, 2.6, 6.5], handL: [2.5, 3.2, 5.2], w: [0.25, -0.55, 0.8] };
    case 'spear': case 'lance': return { handR: [5, 1.5, 3.5], handL: [-5, 2, 3], w: [0.05, 0.08, 1] };
    case 'bow': return { handR: [5, 1.5, 3], handL: [-5, 2.2, 3.5], bowDir: [0, 1, 0] };
    case 'staff': return { handR: [5, 2, 3.5], handL: [-5, 2.5, 3], w: [0.05, 0.1, 1] };
    case 'whip': return { handR: [5, 2, 3.5], handL: [-5, 2, 3], w: [0.1, 0.4, 0.9], tipRel: [0.5, 2.2, -6.5], ctrlRel: [0.5, 3.6, -1] };
  }
}
const ATTACK = {
  sword: [
    { handR: [5, 3, 4], w: [0.2, 0.55, 0.8] },
    { handR: [4.5, -1.5, 10], w: [0.1, -0.75, 0.65], lean: -0.08 },
    { handR: [3.5, 1, 12], w: [0, 0.3, 0.95] },
    { handR: [2, 7, 5.5], w: [-0.1, 0.97, -0.2], lean: 0.25, legR: 0.35, legL: -0.25 },
    { handR: [1, 6, 2.5], w: [-0.35, 0.6, -0.7], lean: 0.2, legR: 0.3, legL: -0.2 },
    { handR: [5, 3, 4], w: [0.2, 0.55, 0.8] },
  ],
  spear: [
    { handR: [3, -1, 5.5], handL: [-1.5, 4, 6], w: [0, 1, 0.08] },
    { handR: [3, -3.2, 6], handL: [-1.5, 1.8, 6.2], w: [0, 1, 0.1], lean: -0.1 },
    { handR: [3, -3.4, 6], handL: [-1.5, 1.6, 6.2], w: [0, 1, 0.1], lean: -0.12 },
    { handR: [3, 4.5, 5.5], handL: [-1, 9, 6], w: [0, 1, 0.02], lean: 0.28, legR: 0.4, legL: -0.3 },
    { handR: [3, 2.5, 5.5], handL: [-1.3, 7, 6], w: [0, 1, 0.05], lean: 0.15, legR: 0.2, legL: -0.15 },
    { handR: [3, -1, 5.5], handL: [-1.5, 4, 6], w: [0, 1, 0.08] },
  ],
  bow: [
    { handL: [-1, 6.5, 7.5], handR: [0, 4.6, 7.5], draw: 0.1 },
    { handL: [-1, 6.5, 7.5], handR: [0.5, 2.5, 8], draw: 0.5 },
    { handL: [-1, 6.5, 7.5], handR: [1, 0.2, 8.4], draw: 1, lean: -0.05 },
    { handL: [-1, 6.5, 7.5], handR: [2.5, -1.2, 9], released: true, lean: -0.08 },
    { handL: [-3, 5, 5.5], handR: [4, 1.5, 4], released: true },
    { handL: [-1.5, 6, 6.5], handR: [0, 4.5, 7], draw: 0.05 },
  ],
  staff: [
    { handR: [4.5, 2.5, 4], w: [0.05, 0.2, 1], glow: 0.2, handL: [-5, 2.5, 3] },
    { handR: [4, 0.5, 8], w: [0, -0.25, 1], glow: 0.5, handL: [-4, 3, 5] },
    { handR: [3.5, 1.5, 11], w: [0, 0.1, 1], glow: 0.9, handL: [-3.5, 4, 6] },
    { handR: [2.5, 7, 7], w: [0, 0.85, 0.5], glow: 1.4, lean: 0.2, handL: [-3.5, 5.5, 6.5], legR: 0.3, legL: -0.2 },
    { handR: [3.5, 5, 5], w: [0, 0.5, 0.85], glow: 0.5, lean: 0.1, handL: [-4, 4, 5] },
    { handR: [4.5, 2.5, 4], w: [0.05, 0.2, 1], glow: 0.2, handL: [-5, 2.5, 3] },
  ],
  whip: [
    { handR: [5, 2, 3.5], w: [0.1, 0.4, 0.9], tipRel: [0.5, 2.2, -6.5], ctrlRel: [0.5, 3.6, -1] },
    { handR: [4, -1, 10], w: [0, -0.4, 0.9], tipRel: [0, -8, 1], ctrlRel: [0, -3, 4], lean: -0.08 },
    { handR: [3.5, 1, 12], w: [0, 0.2, 1], tipRel: [0, -5, 9], ctrlRel: [0, -2, 6], glow: 0.3 },
    { handR: [2.5, 6, 6], w: [0, 0.9, 0.3], tipRel: [0, 16, 1], ctrlRel: [0, 8, 3], lean: 0.25, glow: 1, legR: 0.35, legL: -0.25 },
    { handR: [3, 5, 4], w: [0, 0.8, 0], tipRel: [0, 11, -4], ctrlRel: [0, 6, 0], lean: 0.12 },
    { handR: [5, 2, 3.5], w: [0.1, 0.4, 0.9], tipRel: [0.5, 2.2, -6.5], ctrlRel: [0.5, 3.6, -1] },
  ],
};
ATTACK.lance = [
  { handR: [4, 0, 5], w: [0, 1, 0.25] }, { handR: [4, -2.5, 5.5], w: [0, 1, 0.35], lean: -0.1 }, { handR: [4, -2.8, 5.5], w: [0, 1, 0.3], lean: -0.1 },
  { handR: [4, 4.5, 5], w: [0, 1, 0.02], lean: 0.25 }, { handR: [4, 2, 5], w: [0, 1, 0.1], lean: 0.1 }, { handR: [4, 0, 5], w: [0, 1, 0.25] },
];
ATTACK.greatsword = ATTACK.sword.map((k) => ({ ...k, twoHand: true }));

export function humPose(wc, anim, f, n, shield) {
  const base = idleHands(wc), ph = (f / n) * TAU;
  let p = { ...base, bob: 0, lean: 0 };
  if (anim === 'idle') { p.bob = [0, -0.35, -0.5, -0.25][f]; p.capeSway = Math.sin(ph) * 0.03; if (p.glow !== undefined || wc === 'staff') p.glow = 0.2 + 0.15 * Math.sin(ph); }
  if (anim === 'walk') {
    const s = Math.sin(ph);
    p.legR = s * 0.55; p.legL = -s * 0.55; p.liftR = Math.max(0, -Math.cos(ph)) * 0.8; p.liftL = Math.max(0, Math.cos(ph)) * 0.8;
    p.bob = -Math.abs(Math.cos(ph)) * 0.6; p.lean = 0.06; p.capeSway = s * 0.08;
    p.handR = add(p.handR, [0, -s * 1.6, 0]);
    if (!shield && wc !== 'greatsword') p.handL = add(p.handL, [0, s * 1.6, 0]);
  }
  if (anim === 'attack') { p = { ...p, ...ATTACK[wc][f] }; if (shield && !ATTACK[wc][f].handL) { p.handL = [-3.5, 4.5, 6]; p.shieldN = [-0.2, 1, 0.1]; } }
  if (anim === 'victory') {
    p.jump = [0, 1.6, 3.2, 3.2, 1.6, 0][f]; p.bob = f === 0 || f === 5 ? -0.8 : 0;
    p.legR = f % 5 ? 0.25 : 0; p.legL = f % 5 ? -0.15 : 0; p.capeSway = -0.1;
    const up = f % 5 !== 0;
    if (wc === 'bow') { p.handL = up ? [-5.4, 1.5, 12] : base.handL; p.handR = up ? [4.6, 1.5, 11.5] : base.handR; p.bowDir = [0, 1, 0]; }
    else { p.handR = up ? [5.4, 1.5, 12] : [4.5, 2, 6]; p.w = up ? [0.15, 0.12, 1] : [0.1, 0.4, 0.9]; p.handL = up ? (shield ? [-5, 2.5, 8] : [-5, 1.5, 11.5]) : base.handL; if (wc === 'staff') p.glow = up ? 1.3 : 0.4; if (wc === 'whip') { p.tipRel = up ? [0, -3, 9] : base.tipRel; p.ctrlRel = up ? [0, -1, 6] : base.ctrlRel; p.glow = up ? 1 : 0; } }
  }
  if (anim === 'death') {
    p.fall = [0, 0.3, 0.75, 1.15, 1.45, 1.55][f]; p.flash = f === 0;
    p.handR = f >= 2 ? [6.5, 0.5, 6] : base.handR; p.handL = f >= 2 ? [-6.5, 0.5, 6] : base.handL;
    p.legR = f >= 2 ? 0.3 : 0; p.legL = f >= 2 ? -0.1 : 0; p.headTilt = f >= 3 ? -0.2 : 0;
  }
  if (wc === 'greatsword' && p.w) { const w = norm(p.w); p.handL = add(p.handR, add(mul(w, -1.9), [-0.6, 0, 0])); }
  return p;
}

// ---------------- frame builder ----------------
function fireCone(px, mx, my, fx, fy, len, f) {
  for (let d = 2; d < len; d++) {
    const half = 1 + d * 0.32;
    for (let s = -half; s <= half; s++) {
      const x = mx + fx * d - fy * s, y = my + fy * d + fx * s;
      const r = Math.abs(s) / half, t = d / len;
      if (noise(Math.round(x), Math.round(y), f * 7) < r * 0.9 + t * 0.35 - 0.1) continue;
      px.set(x, y, t + r * 0.4 < 0.25 ? '#fff6c8' : t + r * 0.3 < 0.5 ? '#ffd040' : t + r * 0.2 < 0.75 ? '#ff8a1a' : '#d83a14');
    }
  }
}

export function buildFrame(unit, anim, f, dirDeg, team = 'blue') {
  const n = ANIMS[anim];
  const [w, h, ox, oy] = unit.size;
  let prims = [], hover = 0, pre = null, flash = false, fire = null, shadow = [8, 3];
  const ph = (f / n) * TAU;
  if (unit.kind === 'hum') {
    const p = humPose(unit.wc, anim, f, n, unit.cfg.shield);
    prims = humanoid(unit.cfg, p);
    flash = p.flash;
    if (p.jump) prims = moveAll(prims, rotX(0), [0, 0, 0], [0, 0, p.jump]);
    if (p.fall) prims = moveAll(prims, rotX(p.fall), [0, 0, 0], [0, 0, Math.sin(p.fall) * 1.8]);
    shadow = [7.5, 2.6];
  } else if (unit.kind === 'mnt' || unit.kind === 'gri') {
    const p = humPose(unit.wc, anim === 'walk' ? 'idle' : anim === 'death' ? 'idle' : anim, anim === 'walk' ? f % 4 : anim === 'death' ? 0 : f, anim === 'walk' ? 4 : n, unit.cfg.shield);
    if (anim === 'walk') p.handR = add(p.handR, [0, -Math.sin(ph) * 0.8, 0]);
    const mp = { gait: ph, gaitAmp: anim === 'walk' ? 0.55 : 0, hbob: anim === 'walk' ? -Math.abs(Math.cos(ph)) * 0.8 : anim === 'idle' ? -0.25 * Math.sin(ph) : 0, tailSway: Math.sin(ph) * 0.8, neck: anim === 'idle' ? Math.sin(ph) * 0.3 : 0 };
    if (unit.kind === 'gri') { mp.flap = anim === 'death' ? -0.5 : 0.35 + Math.sin(ph * (anim === 'walk' ? 1 : 1)) * (anim === 'walk' ? 0.75 : 0.5); hover = anim === 'death' ? [6, 5, 3.5, 1.5, 0, 0][f] : 6 + Math.sin(ph) * 0.8; }
    if (anim === 'attack') { mp.frontLift = f === 3 ? 0.35 : 0; mp.neck = f === 3 ? 1 : 0; }
    let rider = humanoid(unit.cfg, p);
    const MS = unit.kind === 'gri' ? 1.45 : 1.22;
    const mk = (q) => scaleAll(unit.kind === 'gri' ? griffin(unit.mount ?? {}, q) : horse(unit.mount ?? {}, q), MS);
    const mount = mk(mp);
    rider = moveAll(rider, rotX(0), [0, 0, 0], [0, unit.kind === 'gri' ? -0.5 : -0.4, (mp.hbob ?? 0) * MS + 14 * (MS - 1) + (unit.kind === 'gri' ? -0.8 : 0)]);
    prims = [...mount, ...rider];
    if (anim === 'victory') { const a = [0, 0.25, 0.45, 0.45, 0.25, 0][f]; mp.frontLift = a * 2; prims = moveAll([...mk(unit.kind === 'gri' ? { ...mp, flap: 1.1 } : mp), ...rider], rotX(a), [0, -6, 0]); }
    if (anim === 'attack' && unit.kind === 'gri') prims = moveAll(prims, rotX(-[0, -0.1, -0.15, 0.3, 0.2, 0][f]), [0, 0, 8]);
    if (anim === 'death') { const a = [0, 0.3, 0.7, 1.1, 1.35, 1.45][f]; prims = moveAll(prims, rotY(a), [0, 0, 0], [0, 0, Math.sin(a) * 3.5]); flash = f === 0; }
    shadow = unit.kind === 'gri' ? [11, 4.5] : [10, 4];
  } else if (unit.kind === 'drg') {
    const dp = { flap: anim === 'death' ? -0.5 : 0.3 + Math.sin(ph) * (anim === 'walk' ? 0.9 : 0.55), tailSway: Math.sin(ph) * 1.2, gait: ph, gaitAmp: 0, legsTuck: 0.5 };
    hover = anim === 'death' ? [8, 6, 4, 1.5, 0, 0][f] : 8 + Math.sin(ph) * 1.2;
    if (anim === 'attack') { dp.neckF = [0, -3, -4, 2, 2.5, 0][f]; dp.mouth = [0, 0.2, 0.4, 1, 1, 0.3][f]; }
    if (anim === 'victory') { dp.flap = 1.1 + Math.sin(ph) * 0.2; dp.mouth = f >= 2 && f <= 4 ? 1 : 0.2; dp.neckF = -1; }
    prims = dragon(dp);
    if (anim === 'victory') prims = moveAll(prims, rotX([0, 0.15, 0.3, 0.35, 0.3, 0.15][f]), [0, -6, 8]);
    if (anim === 'death') { const a = [0, 0.2, 0.6, 1, 1.25, 1.3][f]; prims = moveAll(prims, rotY(a), [0, 0, 0], [0, 0, Math.sin(a) * 5]); flash = f === 0; }
    if (anim === 'attack' && f >= 3 && f <= 4) fire = { len: f === 3 ? 26 : 32 };
    shadow = [17, 7];
  } else if (unit.kind === 'cat') {
    const cp = { arm: -0.55, loaded: true, wheel: 0 };
    if (anim === 'walk') { cp.wheel = ph / 3; }
    if (anim === 'idle') { cp.arm = -0.55 + Math.sin(ph) * 0.02; }
    if (anim === 'attack') { cp.arm = [-0.55, -0.72, 0.4, 1.7, 2.25, 0.2][f]; cp.loaded = f < 3; if (f === 3 || f === 4) fire = { ball: f === 3 ? [0, 14, 30] : [0, 24, 36] }; }
    if (anim === 'victory') { cp.flag = ph * 2 + 0.1; cp.arm = [-0.55, 0.6, 1.3, 1.3, 0.6, -0.55][f]; }
    prims = scaleAll(catapult(cp), 1.7);
    if (anim === 'walk') prims = moveAll(prims, rotX(0), [0, 0, 0], [0, 0, Math.abs(Math.sin(ph)) * 0.4]);
    if (anim === 'victory') prims = moveAll(prims, rotX(0), [0, 0, 0], [0, 0, [0, 1, 2, 2, 1, 0][f]]);
    if (anim === 'death') { const a = [0, 0.15, 0.35, 0.5, 0.55, 0.55][f]; prims = moveAll(prims, rotY(a), [10, 0, 0], [0, 0, -a * 3]); flash = f === 0; }
    shadow = [17, 8];
  }
  if (hover) prims = moveAll(prims, rotX(0), [0, 0, 0], [0, 0, hover]);
  // facing: model x (right) -> r, model y (forward) -> f
  const a = (dirDeg * Math.PI) / 180;
  const F = [[-Math.cos(a), Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
  const world = prims.map((p) => xform(p, F, [0, 0, 0]));
  const sprite = render(world, materials(team), w, h, ox, oy, { flash, patterns: PATTERNS, scale: PIX });
  const out = new Px(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!out.get(x, y) && Math.hypot((x - ox) / (shadow[0] * PIX * (hover ? 0.85 : 1)), (y - oy) / (shadow[1] * PIX)) <= 1) out.set(x, y, '#0000004a');
  out.blit(sprite, 0, 0);
  if (fire && fire.ball) {
    const [bx, by] = project(mv(F, fire.ball));
    const cx = bx * PIX + ox, cy = by * PIX + oy;
    for (let k = 1; k <= 4; k++) out.ellipse(cx - fire.ball[1] * 0.05 * k, cy + k * 2.2, 2.4 - k * 0.45, 2.4 - k * 0.45, ['#ffb43a', '#f06a1a', '#a82a10', '#5a2a2a'][k - 1] + 'aa');
    out.ellipse(cx, cy, 3, 3, '#a82a10'); out.ellipse(cx, cy, 2.3, 2.3, '#f06a1a'); out.ellipse(cx - 0.6, cy - 0.6, 1.3, 1.3, '#fff0a0');
  } else if (fire) {
    const mouth = mv(F, [0, 22, 13 + 12 + hover - 3]);
    const [msx, msy] = project(mouth);
    const fw = mv(F, [0, 1, -0.25]), [fx, fy] = project(fw), l = Math.hypot(fx, fy) || 1;
    fireCone(out, msx * PIX + ox, msy * PIX + oy, fx / l, fy / l, fire.len * PIX, f);
  }
  return out;
}

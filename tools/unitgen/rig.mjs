// Chibi rigs built from SDF primitives in model space (x = unit's right, y = forward, z = up, feet at z = 0).
import { add, sub, mul, norm, lerp, len, cross, mv, mm, I3, rotX, rotY, rotZ, basisZ, ell, sph, cone, box, cyl } from './sdf.mjs';

/** Map a list of primitives through p' = A (p - pivot) + pivot + off. */
export function moveAll(prims, A, pivot = [0, 0, 0], off = [0, 0, 0]) {
  const P = (v) => add(add(mv(A, sub(v, pivot)), pivot), off);
  return prims.map((p) => {
    const q = { ...p };
    if (p.c) q.c = P(p.c);
    if (p.a) { q.a = P(p.a); q.b = P(p.b); }
    if (p.R) q.R = mm(A, p.R);
    if (p.clip) q.clip = { p: P(p.clip.p), n: mv(A, p.clip.n) };
    return q;
  });
}
const dir = (x, y, z) => norm([x, y, z]);

// ================= weapons =================
/** Weapon held at grip point h pointing along w. */
export function weapon(kind, h, w, o = {}) {
  const P = [], at = (k) => add(h, mul(w, k));
  const B = basisZ(w, o.up ?? [0, 0, 1]);
  switch (kind) {
    case 'sword': case 'greatsword': {
      const L = kind === 'sword' ? 11.5 : 14, R = kind === 'sword' ? 1.15 : 1.4;
      P.push(cone(at(1.6), at(L), R * 1.15, 0.35, 'blade', 'weapon'));
      P.push(box(at(1.3), [kind === 'sword' ? 2.8 : 3.4, 0.55, 0.5], 'gold', 'weapon', B, 0.25));
      P.push(sph(at(-1.3), 0.75, 'gold', 'weapon'));
      if (kind === 'greatsword') P.push(cone(at(-1.2), at(1), 0.55, 0.55, 'leather', 'weapon'));
      break;
    }
    case 'spear': case 'lance': case 'pitchfork': {
      const back = kind === 'lance' ? 6 : 7, fwd = kind === 'lance' ? 17 : 13;
      P.push(cone(at(-back), at(fwd), 0.65, 0.6, 'wood', 'weapon'));
      if (kind === 'pitchfork') {
        const side = norm(cross(w, [0, 0, 1]).some((v) => Math.abs(v) > 0.1) ? cross(w, [0, 0, 1]) : [1, 0, 0]);
        P.push(cone(add(at(fwd), mul(side, -1.6)), add(at(fwd), mul(side, 1.6)), 0.4, 0.4, 'blade', 'weapon'));
        for (const s of [-1.5, 0, 1.5]) P.push(cone(add(at(fwd), mul(side, s)), add(at(fwd + 3.5), mul(side, s * 1.1)), 0.35, 0.12, 'blade', 'weapon'));
      } else {
        P.push(cone(at(fwd), at(fwd + 3.6), 1.15, 0.1, 'blade', 'weapon'));
        P.push(sph(at(fwd - 0.2), 0.75, 'gold', 'weapon'));
        if (o.pennant) P.push(box(add(at(fwd - 3), [0, -1.8, 0.6]), [0.25, 1.8, 1.1], 'team', 'weapon', I3, 0.1));
      }
      break;
    }
    case 'staff': {
      P.push(cone(at(-9), at(9), 0.65, 0.6, 'wood', 'weapon'));
      P.push(sph(at(10.7), 1.85 + (o.glow ?? 0) * 0.5, o.orb ?? 'orb', 'orb'));
      for (const a of [0, 2.1, 4.2]) { const s = [Math.cos(a), Math.sin(a), 0]; P.push(cone(at(8.6), add(at(10.6), mul(s, 1.6)), 0.35, 0.15, 'gold', 'weapon')); }
      break;
    }
    case 'moonstaff': {
      P.push(cone(at(-9), at(9.5), 0.55, 0.5, 'wood', 'weapon'));
      const side = norm(cross(w, [0, 1, 0]).some((v) => Math.abs(v) > 0.1) ? cross(w, [0, 1, 0]) : [1, 0, 0]);
      for (let k = 0; k <= 8; k++) { const a = -1.2 + (k / 8) * 2.4; P.push(sph(add(at(12 + Math.cos(a) * 3.2), mul(side, Math.sin(a) * 3.2)), 0.85 - Math.abs(a) * 0.25, 'orb', 'orb')); }
      P.push(sph(at(12), 0.9, 'star', 'orb'));
      break;
    }
    case 'pick': {
      P.push(cone(at(-3), at(8), 0.55, 0.55, 'wood', 'weapon'));
      const side = norm(cross(w, [1, 0, 0]).some((v) => Math.abs(v) > 0.1) ? cross(w, [1, 0, 0]) : [0, 1, 0]);
      P.push(cone(add(at(8), mul(side, -1.5)), add(at(8), mul(side, 4)), 1, 0.15, 'blade', 'weapon'));
      P.push(box(add(at(8), mul(side, -2.2)), [1.1, 1.1, 1.1], 'blade', 'weapon', basisZ(w), 0.3));
      break;
    }
    case 'whip': {
      P.push(cone(at(-1), at(2.6), 0.6, 0.55, 'leather', 'weapon'));
      const s = at(2.6), tip = o.tip ?? add(s, [0, 2, -7]), ctrl = o.ctrl ?? add(s, [0, 4, 1]);
      let prev = s;
      for (let k = 1; k <= 10; k++) {
        const t = k / 10, q = add(add(mul(s, (1 - t) * (1 - t)), mul(ctrl, 2 * t * (1 - t))), mul(tip, t * t));
        P.push(cone(prev, q, 0.5 - t * 0.2, 0.45 - t * 0.2, 'leather', 'weapon')); prev = q;
      }
      P.push(sph(tip, 1.1 + (o.glow ?? 0) * 0.6, 'fire', 'orb'));
      break;
    }
  }
  return P;
}

// ================= humanoid =================
/**
 * cfg: { skin, hair, torso:'tunic'|'armor'|'robe'|'leather'|'scale'|'overall', helmet, plume, shield, cape, quiver, weapon, scarf, mounted }
 * pose: { bob, lean, legL, legR, liftL, liftR, handR, handL, w, wGrip, draw, glow, flap, tip, ctrl, headTilt }
 */
export function humanoid(cfg, pose) {
  const P = [];
  const hz = cfg.mounted ? 14 : 6.5; // hip height
  const bz = (pose.bob ?? 0) + hz;
  const lean = pose.lean ?? 0;
  const L = rotX(-lean);
  const up = (v) => add(mv(L, sub(v, [0, 0, hz])), [0, 0, bz]); // upper body: lean around the hip, then bob
  const UP = (prims) => moveAll(prims, L, [0, 0, hz], [0, 0, bz - hz]);

  // ---- legs ----
  if (cfg.torso !== 'robe') {
    for (const [s, sw, lift] of [[1, pose.legR ?? 0, pose.liftR ?? 0], [-1, pose.legL ?? 0, pose.liftL ?? 0]]) {
      if (cfg.mounted) {
        const hip = [s * 2, -0.5, bz], knee = [s * 4.4, 2, bz - 2.6], foot = [s * 4.2, 1.2, bz - 6];
        P.push(cone(hip, knee, 1.9, 1.6, cfg.legs ?? 'pants', 'legs'), cone(knee, foot, 1.6, 1.4, cfg.legs ?? 'pants', 'legs'));
        P.push(ell(add(foot, [0, 0.8, -0.4]), [1.5, 2.2, 1.2], 'boots', 'legs'));
        continue;
      }
      const sp = pose.spread ?? 0.9;
      const hip = [s * 2.2, 0, bz];
      const foot = [s * (2.2 + sp), Math.sin(sw) * 6.2, Math.max(0.9, bz - Math.cos(sw) * 6.2 + lift)];
      P.push(cone(hip, foot, 2.05, 1.7, cfg.legs ?? 'pants', 'legs' + s));
      P.push(ell(add(foot, [0, 0.75, 0.1]), [1.95, 2.6, 1.45], 'boots', 'legs' + s));
      P.push(cyl(add(foot, [0, 0.1, 1.5]), [0, 0, 1], 1.95, 0.45, 'bootCuff', 'legs' + s));
      if (cfg.torso === 'armor' || cfg.torso === 'mail') P.push(sph(lerp(hip, foot, 0.5), 1.35, 'steel', 'legs' + s, { c: add(lerp(hip, foot, 0.5), [0, 1.2, 0]) }));
    }
  }

  // ---- torso ----
  const T = [];
  const tmat = { tunic: 'team', armor: 'steel', mail: 'mail', robe: cfg.robe ?? 'team', leather: 'leather', scale: 'scale', overall: 'overall' }[cfg.torso] ?? 'team';
  T.push(ell([0, 0, hz + 4.7], [4.6, 3.4, 3.9], tmat, 'body'));
  if (cfg.torso === 'armor') T.push(box([0, 3.0, hz + 3.6], [2.1, 0.45, 2.4], 'team', 'tabard', rotX(-0.1), 0.4)); // tabard panel in front
  if (cfg.torso === 'mail') T.push(ell([0, 0.2, hz + 6.6], [4.9, 3.6, 1.2], 'team', 'body')); // coloured collar band
  if (cfg.torso !== 'robe') T.push(box([0, 3.4, hz + 2.3], [0.8, 0.35, 0.6], 'gold', 'buckle', I3, 0.15));
  if (cfg.torso === 'robe') T.push(cone([0, 0, hz + 3], [0, 0.3, 0.9], 4.3, 5.6, cfg.robe ?? 'team', 'body'));
  else T.push(cone([0, 0, hz + 2.2], [0, 0, hz + 0.5], 4.5, 4.75, cfg.torso === 'armor' || cfg.torso === 'mail' ? 'team' : tmat, 'body')); // short skirt
  T.push(ell([0, 0, hz + 2.3], [4.8, 3.5, 0.75], cfg.torso === 'robe' ? 'gold' : 'belt', 'body')); // belt
  if (cfg.torso === 'armor' || cfg.pauldrons) for (const s of [1, -1]) { T.push(ell([s * 4.9, -0.2, hz + 7.5], [2.9, 2.7, 2.1], 'steel', 'pauldron' + s, I3, { clip: { p: [0, 0, hz + 6.3], n: [0, 0, -1] } })); T.push(ell([s * 5.3, -0.1, hz + 6.2], [2.4, 2.3, 1.2], 'steel', 'pauldron' + s, I3, { clip: { p: [0, 0, hz + 5.6], n: [0, 0, -1] } })); }
  if (cfg.cape) T.push(box([0, -3.7, hz + 2.6], [4.3, 0.45, 5.2], 'teamDark', 'cape', rotX(0.12 + (pose.capeSway ?? 0)), 0.3));
  if (cfg.quiver) {
    T.push(cyl([2.4, -3.6, hz + 6], dir(0.35, -0.15, 1), 1.35, 3.6, 'leather', 'quiver'));
    for (const k of [-0.7, 0, 0.7]) T.push(sph([3.6 + k, -4, hz + 10.2 + k * 0.4], 0.75, 'feather', 'quiver'));
  }
  if (cfg.scarf) { let prev = [0, 2.2, hz + 7.6]; for (let k = 0; k < 5; k++) { const q = [0.6 * Math.sin(k + (pose.capeSway ?? 0) * 8), -2.5 - k * 1.6, hz + 7.4 - k * 0.6 + Math.sin(k * 1.3 + (pose.capeSway ?? 0) * 10) * 0.7]; T.push(cone(prev, q, 1.2, 1.0, 'team', 'scarf')); prev = q; } }
  P.push(...UP(T));

  // ---- head ----
  const H = [];
  const hc = [0, 0.3, hz + 12.6];
  H.push(sph(hc, 5.75, 'skin', 'head'));
  const eye = (s) => ell(add(hc, [s * 2.15, 5.05, -0.8]), [1.0, 0.6, 1.75], 'eye', 'head');
  if (cfg.helmet !== 'greathelm') { H.push(eye(1), eye(-1)); for (const s of [1, -1]) H.push(sph(add(hc, [s * 2.15 - 0.4, 5.7, -0.05]), 0.42, 'eyeHi', 'head')); H.push(ell(add(hc, [0.3, 5.5, -2.7]), [0.9, 0.35, 0.3], 'mouth', 'head')); }
  if (cfg.hair) H.push(sph(add(hc, [0, -0.9, 0.9]), 5.95, cfg.hair, 'hair', { clip: { p: add(hc, [0, 1.6, -0.4]), n: dir(0, 0.75, -0.66) } }));
  if (cfg.hair && ['kettle', 'nasal', 'horned'].includes(cfg.helmet)) for (const s of [1, -1]) H.push(ell(add(hc, [s * 4.9, 1.6, -0.6]), [1.3, 2.1, 2.4], cfg.hair, 'hair')); // locks under the helmet
  if (cfg.longHair) H.push(ell(add(hc, [0, -3.2, -4]), [4.6, 2.4, 5.2], cfg.hair ?? 'hairWhite', 'hair'));
  const hel = cfg.helmet;
  if (hel === 'kettle' || hel === 'horned' || hel === 'nasal') {
    H.push(sph(add(hc, [0, -0.3, 0.7]), 6.35, cfg.helmetMat ?? 'steel', 'helmet', { clip: { p: add(hc, [0, 0, 0.35]), n: dir(0, 0.62, -0.79) } }));
    H.push(ell(add(hc, [0, 0.4, 1.4]), [6.75, 6.75, 0.7], cfg.helmetMat ?? 'steel', 'helmet', I3, { clip: { p: add(hc, [0, 1.6, 1.4]), n: dir(0, 1, 0.05) } })); // brow rim
    H.push(ell(add(hc, [0, -0.3, 0.9]), [0.6, 6.75, 6.75], cfg.helmetMat === 'darkRed' ? 'darkRed' : 'steelLight', 'helmet', I3, { clip: { p: add(hc, [0, 0, 1.9]), n: [0, 0, -1] } })); // crest ridge
    for (const s of [1, -1]) H.push(sph(add(hc, [s * 6.1, 1.4, 0.4]), 0.75, 'bronze', 'helmet'));
    if (hel === 'nasal') H.push(box(add(hc, [0, 5.9, 0.6]), [0.45, 0.45, 1.6], 'steel', 'helmet', I3, 0.2));
    if (hel === 'horned') for (const s of [1, -1]) H.push(cone(add(hc, [s * 5, 0, 2.5]), add(hc, [s * 8.6, -0.5, 7.2]), 1.25, 0.2, 'horn', 'helmet'));
  }
  if (hel === 'greathelm') {
    H.push(sph(add(hc, [0, 0, 0.4]), 6.4, 'steel', 'helmet', { pattern: 'visor' }));
    H.push(box(add(hc, [0, 5.8, -0.2]), [3.2, 0.55, 0.5], 'eye', 'helmet', I3, 0.1));
  }
  if (cfg.plume) { let prev = add(hc, [0, 0.3, 6.4]); for (let k = 1; k <= 5; k++) { const q = add(hc, [0, 0.3 - k * 1.25, 6.4 + Math.sin(k * 0.7) * 2.2 - k * 0.5 + (pose.capeSway ?? 0) * 4]); H.push(cone(prev, q, 1.9 - k * 0.12, 1.75 - k * 0.15, cfg.plume, 'plume')); prev = q; } }
  if (hel === 'hood') {
    H.push(sph(add(hc, [0, -0.6, 0.5]), 6.55, cfg.hoodMat ?? 'hood', 'helmet', { clip: { p: add(hc, [0, 3, 0]), n: dir(0, 1, 0.18) } }));
    H.push(cone(add(hc, [0, -3, 4]), add(hc, [0, -6.4, 6.4]), 2.4, 0.5, cfg.hoodMat ?? 'hood', 'helmet'));
    H.push(cone(add(hc, [0, -1, -5.2]), add(hc, [0, -1.5, -6.8]), 5.2, 5.6, cfg.hoodMat ?? 'hood', 'helmet')); // mantle
  }
  if (hel === 'wizard') {
    H.push(ell(add(hc, [0, 0, 3.6]), [8.4, 8.4, 0.9], cfg.hatMat ?? 'hat', 'helmet'));
    H.push(cone(add(hc, [0, -0.3, 3.8]), add(hc, [0, -3.2, 13.5]), 5.2, 0.5, cfg.hatMat ?? 'hat', 'helmet', { pattern: 'hatband' }));
  }
  if (hel === 'cap') H.push(ell(add(hc, [0, -0.6, 3.4]), [6.1, 6.1, 3.3], 'capMat', 'helmet', I3, { clip: { p: add(hc, [0, 0, 1.6]), n: [0, 0, -1] } }));
  if (hel === 'hardhat') {
    H.push(sph(add(hc, [0, -0.2, 1.2]), 6.2, 'hardhat', 'helmet', { clip: { p: add(hc, [0, 0, 1.6]), n: [0, 0, -1] } }));
    H.push(ell(add(hc, [0, 1.2, 1.6]), [7, 7.5, 0.6], 'hardhat', 'helmet'));
    H.push(sph(add(hc, [0, 6.3, 3.6]), 1.3, 'lamp', 'orb'));
  }
  P.push(...moveAll(UP(H), rotX(-(pose.headTilt ?? 0)), up([0, 0, hz + 8]), [0, 0, 0]));

  // ---- arms, hands, weapon, shield ----
  const shoulder = (s) => up([s * 4.5, 0, hz + 7.2]);
  const reach = (s, target) => { const sh = shoulder(s), d = sub(target, sh), l = len(d), m = cfg.weapon === 'bow' && s < 0 ? 8.4 : 7.2; return l > m ? add(sh, mul(d, m / l)) : target; };
  const Hp = (v) => up([v[0], v[1], hz + v[2]]);
  const hR = reach(1, Hp(pose.handR)), hL = reach(-1, Hp(pose.handL));
  const wv = pose.w ? mv(L, norm(pose.w)) : [0, 0, 1];
  const sleeve = cfg.sleeve ?? (cfg.torso === 'armor' ? 'steel' : tmat);
  for (const [s, h] of [[1, hR], [-1, hL]]) { P.push(cone(shoulder(s), h, 1.9, 1.6, sleeve, 'arm' + s)); P.push(sph(h, 1.8, cfg.glove ?? 'skin', 'arm' + s)); }
  if (cfg.weapon && cfg.weapon !== 'bow') P.push(...weapon(cfg.weapon, hR, wv, { glow: pose.glow, orb: cfg.orb, pennant: cfg.pennant, tip: pose.tipRel && add(hR, pose.tipRel), ctrl: pose.ctrlRel && add(hR, pose.ctrlRel) }));
  if (cfg.weapon === 'greatsword' && pose.twoHand) { /* left hand already placed on the grip by the pose */ }
  if (cfg.weapon === 'bow') {
    const draw = pose.draw ?? 0, fw = mv(L, norm(pose.bowDir ?? [0, 1, 0])), upv = mv(L, [0, 0, 1]);
    const bc = add(hL, mul(fw, 2.2)), bp = (t) => add(add(bc, mul(upv, 8.4 * t)), mul(fw, -3 * t * t));
    for (let k = -4; k < 4; k++) P.push(cone(bp(k / 4), bp((k + 1) / 4), 0.8, 0.8, 'wood', 'weapon'));
    const nock = draw > 0 && !pose.released ? hR : add(bc, mul(fw, -3));
    P.push(cone(bp(-1), nock, 0.22, 0.22, 'string', 'string'), cone(nock, bp(1), 0.22, 0.22, 'string', 'string'));
    if (draw > 0 && !pose.released) { P.push(cone(nock, add(nock, mul(fw, 12.5)), 0.32, 0.32, 'wood', 'weapon'), cone(add(nock, mul(fw, 12.5)), add(nock, mul(fw, 14.2)), 0.75, 0.1, 'blade', 'weapon'), sph(nock, 0.6, 'feather', 'weapon')); }
  }
  if (cfg.shield) {
    const n = norm(pose.shieldN ?? [-0.45, 1, 0.08]);
    const c = add(hL, add(mul(n, 1.1), [-0.3, 0, 0.6]));
    if (cfg.shield === 'round') P.push(cyl(c, n, 4.3, 0.45, 'team', 'shield', { pattern: 'shield' }));
    else {
      const Bs = basisZ(n), c2 = add(c, [0, 0, 0.6]);
      P.push(box(c2, [3.9, 4.2, 0.45], 'teamDark', 'shield', Bs, 0.35, { pattern: 'heater', clip: { p: c2, n: mul(Bs[1], -1) } }));
      P.push(ell(c2, [4.25, 5.9, 0.8], 'teamDark', 'shield', Bs, { pattern: 'heater', clip: { p: c2, n: Bs[1] } }));
    }
  }
  return P;
}

// ================= horse / griffin =================
export function horse(cfg, pose) {
  const P = [], m = cfg.coat ?? 'horse', ph = pose.gait ?? 0, amp = pose.gaitAmp ?? 0;
  const bz = 9.8 + (pose.hbob ?? 0);
  P.push(ell([0, 0, bz], [3.9, 7.1, 3.9], m, 'hbody', I3, { pattern: cfg.caparison ? 'caparison' : null }));
  P.push(sph([0, 5.1, bz + 0.6], 4, m, 'hbody', { pattern: cfg.caparison ? 'caparison' : null }));
  P.push(sph([0, -5.2, bz + 0.5], 4.15, m, 'hbody', { pattern: cfg.caparison ? 'caparison' : null }));
  const nb = [0, 6.3, bz + 2], nt = [0, 9 + (pose.neck ?? 0), bz + 7.2];
  P.push(cone(nb, nt, 2.9, 2.1, m, 'hneck'));
  P.push(cone(add(nt, [0, 0.2, 0.6]), add(nt, [0, 3.6, -1.6]), 2.35, 1.55, m, 'hhead'));
  for (const s of [1, -1]) {
    P.push(cone(add(nt, [s * 1, -0.4, 2.2]), add(nt, [s * 1.2, -0.7, 3.9]), 0.6, 0.15, m, 'hhead'));
    P.push(ell(add(nt, [s * 1.85, 1.6, 0.4]), [0.45, 0.5, 0.55], 'eye', 'hhead'));
  }
  for (let k = 0; k < 4; k++) P.push(cone(lerp(add(nb, [0, -0.6, 2.4]), add(nt, [0, -0.9, 2]), k / 4), lerp(add(nb, [0, -0.6, 2.4]), add(nt, [0, -0.9, 2]), (k + 1) / 4), 1.3, 1.2, cfg.mane ?? 'mane', 'mane'));
  const ts = pose.tailSway ?? 0;
  P.push(cone([0, -7.6, bz + 2], [ts, -10.2, bz - 3.6], 1.35, 0.9, cfg.mane ?? 'mane', 'mane'));
  const legs = [[1, 5, 0], [-1, 5, Math.PI], [1, -5, Math.PI], [-1, -5, 0]];
  for (const [s, y, off] of legs) {
    const sw = Math.sin(ph + off) * amp + (y > 0 ? pose.frontLift ?? 0 : 0);
    const hip = [s * 2.1, y, bz - 1.5];
    const lift = Math.max(0, Math.cos(ph + off)) * amp * 2.2;
    const hoof = [s * 2.1, y + Math.sin(sw) * 7, Math.max(0.9, bz - 1.5 - Math.cos(sw) * 7.8 + lift)];
    P.push(cone(hip, hoof, 1.65, 0.95, m, 'hleg' + s + y));
    P.push(sph(add(hoof, [0, 0.2, -0.1]), 1.05, 'hoof', 'hleg' + s + y));
  }
  if (cfg.saddle !== false) P.push(ell([0, -0.6, bz + 3.6], [3.3, 3.1, 0.9], 'leather', 'saddle'));
  return P;
}
export function griffin(cfg, pose) {
  const P = [], ph = pose.gait ?? 0, amp = pose.gaitAmp ?? 0, bz = 8.6, flap = pose.flap ?? 0.4;
  P.push(ell([0, -0.5, bz], [3.9, 6.8, 3.7], 'lion', 'hbody'));
  P.push(sph([0, 4.6, bz + 1.2], 4.1, 'featherW', 'hbody'));
  P.push(cone([0, 5.6, bz + 3], [0, 7.6, bz + 7.2], 2.8, 2.4, 'featherW', 'hneck'));
  const hd = [0, 8.3 + (pose.neck ?? 0), bz + 8.2 - (pose.neck ?? 0) * 0.6];
  P.push(sph(hd, 2.9, 'featherW', 'hhead'));
  P.push(cone(add(hd, [0, 2.2, -0.2]), add(hd, [0, 4.4, -1.4]), 1.05, 0.2, 'beak', 'hhead'));
  for (const s of [1, -1]) P.push(ell(add(hd, [s * 1.9, 1.6, 0.5]), [0.5, 0.5, 0.6], 'eye', 'hhead'));
  P.push(cone(add(hd, [0, -2, 1.8]), add(hd, [0, -4, 3.4]), 1, 0.3, 'featherW', 'hhead'));
  P.push(cone([0, -7, bz + 1], [pose.tailSway ?? 0, -10.5, bz - 1], 0.7, 0.5, 'lion', 'tail'), sph([pose.tailSway ?? 0, -11, bz - 1.6], 1.3, 'lionDark', 'tail'));
  for (const [s, y, off, mat] of [[1, 4.5, 0, 'beak'], [-1, 4.5, Math.PI, 'beak'], [1, -4.8, Math.PI, 'lion'], [-1, -4.8, 0, 'lion']]) {
    const sw = Math.sin(ph + off) * amp + (y > 0 ? pose.frontLift ?? 0 : 0);
    const hip = [s * 2.2, y, bz - 1.2], foot = [s * 2.2, y + Math.sin(sw) * 5.5, Math.max(0.8, bz - 1.2 - Math.cos(sw) * 6.4)];
    P.push(cone(hip, foot, 1.6, 0.9, mat === 'beak' ? 'featherW' : 'lion', 'hleg' + s + y), sph(foot, 1, mat === 'beak' ? 'beak' : 'lionDark', 'hleg' + s + y));
  }
  for (const s of [1, -1]) {
    const root = [s * 3, 2.5, bz + 3.2];
    const A = mm(rotY(s * -flap), I3);
    for (const [len2, off, w2, mat] of [[8.5, 0, 3.4, 'wing'], [11.5, -2.4, 2.6, 'wingTip']]) {
      const c = add(root, mv(A, [s * len2 * 0.55, off - 0.8, 0.5]));
      P.push(ell(c, [len2 * 0.55, w2, 0.55], mat, 'wing' + s, mm(A, rotZ(s * 0.25))));
    }
  }
  return P;
}

// ================= dragon =================
export function dragon(pose) {
  const P = [], bz = 13, flap = pose.flap ?? 0.3, ph = pose.gait ?? 0;
  P.push(ell([0, 0, bz], [6, 10.5, 6.2], 'dragon', 'dbody', I3, { pattern: 'belly' }));
  P.push(sph([0, 7.5, bz + 1.5], 6, 'dragon', 'dbody', { pattern: 'belly' }));
  // neck chain up to the head
  const nb = [0, 10, bz + 3.5], hb = [0, 15 + (pose.neckF ?? 0), bz + 12.5 - (pose.neckF ?? 0) * 0.5];
  const ctrl = [0, 16 + (pose.neckF ?? 0) * 0.5, bz + 5];
  let prev = nb;
  for (let k = 1; k <= 5; k++) { const t = k / 5, q = add(add(mul(nb, (1 - t) ** 2), mul(ctrl, 2 * t * (1 - t))), mul(hb, t * t)); P.push(cone(prev, q, 3.9 - k * 0.3, 3.6 - k * 0.3, 'dragon', 'dneck', { pattern: 'belly' })); P.push(cone(add(prev, [0, -0.6, 2.8]), add(prev, [0, -1.2, 4.6]), 0.9, 0.15, 'spike', 'dneck')); prev = q; }
  const mouth = pose.mouth ?? 0;
  P.push(cone(hb, add(hb, [0, 6.2, -1 + mouth * 0.3]), 3.4, 2, 'dragon', 'dhead'));
  P.push(cone(add(hb, [0, 0.5, -1.8]), add(hb, [0, 5.6, -2.6 - mouth * 2.6]), 2.6, 1.5, 'dragonJaw', 'djaw'));
  if (mouth > 0.2) P.push(sph(add(hb, [0, 4.6, -1.8 - mouth]), 1.2, 'fire', 'orb'));
  for (const s of [1, -1]) {
    P.push(cone(add(hb, [s * 2.1, -0.8, 2]), add(hb, [s * 3.6, -4.6, 5.2]), 1.15, 0.2, 'horn', 'dhead'));
    P.push(ell(add(hb, [s * 2.25, 2.4, 1.3]), [0.6, 0.85, 0.55], 'dEye', 'dhead'));
    P.push(sph(add(hb, [s * 1, 6, 0.4]), 0.45, 'eye', 'dhead'));
  }
  // spikes on the back, tail
  for (let k = 0; k < 4; k++) P.push(cone([0, 5 - k * 4, bz + 5.6], [0, 4 - k * 4, bz + 8], 1.2, 0.15, 'spike', 'dbody'));
  prev = [0, -9.5, bz + 1];
  const tw = pose.tailSway ?? 0;
  for (let k = 1; k <= 6; k++) { const q = [Math.sin(k * 0.8) * tw * k * 0.5, -9.5 - k * 3.1, bz + 1 - k * 1.5 + Math.sin(k * 0.9) * 0.8]; P.push(cone(prev, q, 3.1 - k * 0.42, 2.8 - k * 0.42, 'dragon', 'dtail', { pattern: 'belly' })); prev = q; }
  P.push(ell(add(prev, [0, -1.6, 0]), [2.2, 1.8, 0.5], 'spike', 'dtail', rotX(0.2)));
  // legs
  for (const [s, y, off] of [[1, 6, 0], [-1, 6, Math.PI], [1, -6, Math.PI], [-1, -6, 0]]) {
    const sw = Math.sin(ph + off) * (pose.gaitAmp ?? 0) + (pose.legsTuck ?? 0) * (y > 0 ? 1 : -0.6);
    const hip = [s * 4.2, y, bz - 2], foot = [s * 4.6, y + Math.sin(sw) * 6, bz - 2 - Math.cos(sw) * 7.5];
    P.push(cone(hip, foot, 2.5, 1.5, 'dragon', 'dleg' + s + y));
    for (const c of [-0.9, 0, 0.9]) P.push(cone(foot, add(foot, [c, 1.6, -0.6]), 0.55, 0.15, 'horn', 'dleg' + s + y));
  }
  // wings: bone + three membrane panels
  for (const s of [1, -1]) {
    const sh = [s * 4.8, 4, bz + 4.5];
    const el = add(sh, [s * 9, -1, 7 + flap * 8]), tip = add(el, [s * 11, -5, -2 + flap * 6]);
    P.push(cone(sh, el, 1.5, 1.1, 'dragon', 'wingbone' + s), cone(el, tip, 1.1, 0.35, 'dragon', 'wingbone' + s));
    const back = [s * 4, -6, bz + 3];
    for (const [a, b, c2] of [[sh, el, back], [el, tip, back], [el, tip, add(back, [s * 8, -4, -3 + flap * 3])]]) {
      const cen = mul(add(add(a, b), c2), 1 / 3), nrm = norm(cross(sub(b, a), sub(c2, a)));
      const span = Math.max(len(sub(b, a)), len(sub(c2, a)), len(sub(c2, b)));
      P.push(ell(cen, [span * 0.42, span * 0.36, 0.4], 'membrane', 'wing' + s, basisZ(nrm, sub(b, a))));
    }
  }
  return P;
}

// ================= catapult =================
export function catapult(pose) {
  const P = [], wheel = pose.wheel ?? 0, arm = pose.arm ?? -0.55;
  for (const s of [1, -1]) {
    P.push(box([s * 3.8, 0, 4.2], [0.9, 8.5, 0.9], 'wood', 'frame'));
    P.push(cone([s * 3, 2, 4.8], [s * 2.2, 0.5, 12], 0.8, 0.7, 'wood', 'frame'));
    P.push(cone([s * 3, -3, 4.8], [s * 2.2, 0.5, 12], 0.8, 0.7, 'wood', 'frame'));
    for (const y of [5.6, -5.6]) P.push(cyl([s * 5.4, y, 3.2], [1, 0, 0], 3.2, 0.55, 'wood', 'wheel', { pattern: 'wheel', spin: wheel }));
  }
  for (const y of [7.4, -7.4, 0]) P.push(box([0, y, 4.4], [4.4, 0.7, 0.7], 'wood', 'frame'));
  P.push(box([0, 0.5, 12.2], [3.4, 0.6, 0.6], 'woodDark', 'frame'));
  const ax = [0, -1, 6.2], d = [0, -Math.cos(arm), Math.sin(arm)];
  const end = add(ax, mul(d, 12)), cw = add(ax, mul(d, -3));
  P.push(cone(cw, end, 0.85, 0.65, 'woodDark', 'arm'));
  P.push(box(cw, [1.8, 1.3, 1.5], 'steel', 'arm', basisZ(d), 0.3));
  P.push(ell(add(end, [0, 0, 0.6]), [1.9, 1.9, 1.1], 'leather', 'arm'));
  if (pose.loaded) P.push(sph(add(end, [0, 0, 1.8]), 1.65, 'fire', 'orb'));
  P.push(cyl([0, 6.5, 6.5], [0, 0, 1], 1.4, 1.4, 'barrel', 'frame'));
  if (pose.flag) { P.push(cone([-3.8, -7, 5], [-3.8, -7, 15], 0.35, 0.3, 'wood', 'flag')); P.push(box([-3.8, -8.8 + Math.sin(pose.flag) * 0.4, 13.6], [0.2, 1.8, 1.3], 'team', 'flag', rotZ(Math.sin(pose.flag) * 0.3), 0.1)); }
  return P;
}

/** Uniformly scale primitives about the ground origin (positions and sizes). */
export function scaleAll(prims, s) {
  return prims.map((p) => {
    const q = { ...p };
    if (p.c) q.c = mul(p.c, s);
    if (p.a) { q.a = mul(p.a, s); q.b = mul(p.b, s); q.r1 = p.r1 * s; q.r2 = p.r2 * s; }
    if (p.k === 'ell') q.r = p.r.map((v) => v * s);
    if (p.k === 'box') { q.h = p.h.map((v) => v * s); q.rr = p.rr * s; }
    if (p.k === 'cyl') { q.r = p.r * s; q.h = p.h * s; }
    if (p.clip) q.clip = { p: mul(p.clip.p, s), n: p.clip.n };
    return q;
  });
}

// Usage: P="$(cat tools/balance/th6-8.json)" node tools/balance/thmodel.mjs   (EFF=1: per-slot unit table, DBG=1: defence DPS per building)
// Lanchester-style power model, TH1..8. Calibrated on the live TH1-5 numbers (shared/balance.js); TH6-8 from P below.
import * as B from '../../shared/balance.js';
const P = JSON.parse(process.env.P || '{}');
const LVM = [...B.UNIT_LV_MULT, ...(P.unitLvMult ?? [1.75, 1.9, 2.05])];
const BLM = [...B.B_LEVEL_MULT, ...(P.bLvMult ?? [2.15, 2.3, 2.45])];
const KT = (a, d) => B.K(a, d);
const UN = { ...B.UNITS, ...(P.newUnits ?? {}) };
const HOUS = { ...B.HOUSING, ...(P.newHousing ?? {}) };
const CAP = (u, t) => (P.unitCap?.[u] ?? B.UNIT_LV_CAP[u] ?? [])[t - 1] ?? 0;
const capFull = (u) => [...(B.UNIT_LV_CAP[u] ?? [0,0,0,0,0]), ...(P.unitCapNew?.[u] ?? [])];
const unitCap = (u, t) => (P.unitCap?.[u] ?? capFull(u))[t - 1] ?? 0;
const MIX = P.mix ?? { 'dan-quan': .08, 'kiem-si': .12, 'linh-giao': .08, 'cung-thu': .14, 'ky-binh': .12, 'hiep-si': .14, 'phap-su': .12, 'may-ban-da': .10, 'su-thuu': .10, rong: .10, 'cong-binh': .04, 'y-su': .06, 'voi-chien': .12 };
const BARR = [...B.BUILDINGS['doanh-trai'].barracks, ...(P.barracks ?? [550, 700, 900])];
const THL = [...B.TOWN_HALL.levels.map((l) => ({ hp: l.hp, max: l.max })), ...(P.th ?? [])];
const NS = P.newScale ?? 1; const BLD = { ...B.BUILDINGS, ...Object.fromEntries(Object.entries(P.newBuild ?? {}).map(([k, v]) => [k, { ...v, hp: v.hp * NS, atk: v.atk * NS }])) };
const housing = (t) => (THL[t - 1].max['doanh-trai'] ?? 0) * BARR[t - 1];
function army(t, share = 1) {
  const H = housing(t) * share, ul = Object.keys(MIX).filter((u) => UN[u] && unitCap(u, t) > 0);
  let w = Object.fromEntries(ul.map((u) => [u, MIX[u]])), out = {};
  // dragons: at most 2 (DRAGON_LIMIT)
  const tot = () => Object.values(w).reduce((a, b) => a + b, 0);
  let n = {}; for (const u of ul) n[u] = (H * w[u]) / tot() / HOUS[u];
  if (n.rong > 2 * share) { const extra = (n.rong - 2 * share) * HOUS.rong; n.rong = 2 * share; delete w.rong; const s = tot(); for (const u of Object.keys(w)) n[u] += (extra * w[u]) / s / HOUS[u]; }
  let dpsB = 0, dpsU = 0, ehp = 0, heal = 0, wallBreak = 0, flyShare = 0, tot2 = 0;
  for (const u of Object.keys(n)) {
    const s = UN[u], m = LVM[unitCap(u, t) - 1], c = n[u];
    const atk = (s.atk ?? 0) * m, hp = s.hp * m;
    ehp += c * hp / (1 - (s.armor ?? 0)); tot2 += c * hp;
    if (s.fly) flyShare += c * hp;
    const aoeU = s.aoe ? 1 + 0.6 * s.aoe : s.breath ? 2 : 1;
    if (s.healer) heal += c * s.heal * m;
    if (s.sapper) { wallBreak += c * atk; continue; }
    dpsB += c * (atk / s.cd) * KT(s.cls, 'build') * (B.SIEGE_MULT[u] ?? s.siegeMult ?? B.SIEGE_DEF);
    dpsU += c * (atk / s.cd) * aoeU;
  }
  return { H, n, dpsB, dpsU, ehp, heal, wallBreak, fly: flyShare / tot2 };
}
const aoeF = (b) => (b.aoe ? 1 + 1.2 * b.aoe : 1) * (b.chain ? 1 + b.chain * 0.7 : 1) * (b.cone ? 2.5 : 1);
function base(t, a /*attacking army, for counters*/) {
  const L = THL[t - 1].max; let ehp = THL[t - 1].hp / (1 - B.TOWN_HALL.armor), dps = 0, trap = 0, wall = 0;
  for (const [ty, cnt] of Object.entries(L)) {
    const b = BLD[ty]; if (!b || !cnt) continue;
    const blv = b.lvAt ? b.lvAt[t] : Math.min(t, b.maxLv ?? 99); const m = (b.lvMult ?? BLM)[blv - 1] ?? 1;
    if (ty === 'tuong') { wall += cnt * b.hp * m / (1 - b.armor); continue; }
    if (b.trap) { trap += cnt * (b.atk ?? 0) * m * aoeF(b) * (b.trap === 'air' ? a.fly : 1 - a.fly); continue; }
    if (b.hero) { ehp += cnt * b.hp * m / (1 - b.armor); dps += cnt * b.atk * m / b.cd * aoeF(b); continue; }
    const hpE = cnt * b.hp * m / (1 - (b.armor ?? 0)); ehp += hpE;
    if (!b.atk) continue;
    const vs = b.airOnly ? a.fly : b.noFly ? 1 - a.fly : 1;
    const ramp = b.ramp ?? 1, hidden = b.hidden ? 1.25 : 1, dead = b.minRange ? 0.75 : 1;
    dps += cnt * (b.atk * m / b.cd) * aoeF(b) * vs * ramp * hidden * dead * (b.airOnly ? 1 : 1);
  }
  // Hội thành troops + 40 % of the owner's army (reference test of docs/design/26)
  const cc = B.CASTLE_CAP[Math.min(5, t) - 1] * (P.castleMult?.[t - 1] ?? 1);
  const g = army(t, 0.4), cg = army(t, cc / housing(t));
  return { ehp: ehp + 0.25 * wall, wall, dps, trap, gDps: g.dpsU + cg.dpsU, gEhp: g.ehp + cg.ehp };
}
function fight(ta, tb) {
  const a = army(ta), d = base(tb, a), dA = army(tb, 0.4);
  // attackers spend their damage on buildings + defending soldiers; sappers remove walls; healers add to EHP
  const wallLeft = Math.max(0.25, 1 - a.wallBreak / Math.max(1, d.wall * 0.25)) ;
  const baseE = d.ehp - 0.25 * d.wall * (1 - wallLeft) + d.gEhp;
  const aDps = (a.dpsB * (d.ehp / baseE) + a.dpsU * (d.gEhp / baseE));
  const armyE = a.ehp - d.trap + a.heal * 60; // 1 min of healing
  const S = (aDps * armyE) / ((d.dps + d.gDps) * baseE);
  return { S, aDps, armyE, bDps: d.dps + d.gDps, baseE };
}
const rows = [];
if (process.env.DBG) { for (const t of [5,6,7,8].filter((x) => x <= THL.length)) { const a = army(t); const L = THL[t-1].max; const parts = {}; for (const [ty, cnt] of Object.entries(L)) { const b = BLD[ty]; if (!b || !cnt || ty === 'tuong' || b.trap) continue; const blv = b.lvAt ? b.lvAt[t] : t; const m = (b.lvMult ?? BLM)[blv-1] ?? 1; parts[ty] = Math.round(cnt * (b.atk ?? 0) * m / (b.cd ?? 1) * aoeF(b) * (b.airOnly ? a.fly : b.noFly ? 1 - a.fly : 1) * (b.ramp ?? 1)); } console.log('TH' + t, 'fly', a.fly.toFixed(2), JSON.stringify(parts)); } }
const TM = THL.length; for (let t = 1; t <= TM; t++) { const f = fight(t, t), a = army(t); rows.push({ t, housing: housing(t), armyDps: Math.round(f.aDps), armyEhp: Math.round(f.armyE), baseDps: Math.round(f.bDps), baseEhp: Math.round(f.baseE), S: +f.S.toFixed(2) }); }
console.table(rows);
const M = []; for (let a = 1; a <= TM; a++) { const r = { army: "TH" + a }; for (let b = 1; b <= TM; b++) r['vs' + b] = +fight(a, b).S.toFixed(2); M.push(r); }
console.table(M);
if (process.env.EFF) { // power per housing slot of each unit at its top level (TH8)
  const e = []; for (const u of Object.keys(MIX)) { if (!UN[u]) continue; const s = UN[u], lv = unitCap(u, 8) || 1, m = LVM[lv - 1]; e.push({ u, lv, hous: HOUS[u], dpsB_slot: +((s.atk ?? 0) * m / s.cd * KT(s.cls, 'build') * (B.SIEGE_MULT[u] ?? s.siegeMult ?? B.SIEGE_DEF) / HOUS[u]).toFixed(1), dpsU_slot: +((s.atk ?? 0) * m / s.cd / HOUS[u]).toFixed(1), ehp_slot: Math.round(s.hp * m / (1 - (s.armor ?? 0)) / HOUS[u]) }); }
  console.table(e);
}

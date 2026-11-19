// Headless Địa Ngục runs with a bot hero (docs/design/29-dia-nguc.md §8.6). Usage:
//   node tools/sim/hell-sim.mjs <modeIndex 0..3> <S power> <skill 0..1> [runs=3] [hero=thach-lam] [party=1]
// skill 1 = kites well (flees crowds, dodges telegraphs, grabs gems / hearts); 0 = stands still.
import { HellRun } from '../../server/hell.js';
import { HELL_MODES, HELL_SKILLS, HELL_WEAPON } from '../../shared/hell.js';
const [mi = 1, S = 1.4, skill = 1, runs = 3, hero = 'thach-lam', party = 1] = process.argv.slice(2).map((v, i) => (i === 4 ? v : +v));
const PRIO = ['tu-luc', 'bao-kich', 'loi-cham', 'loi-cau', 'am-binh', 'huyet-am', 'thien-loi', 'ngu-kiem', 'la-bua', 'luoi-liem', 'phi-dao', 'tam-thep', 'giap-hac-thach', 'bang-tien', 'chuong-dong', 'bua-tran-ta', 'dia-chan', 'ho-lo', 'quat-ba-tieu', 'toc-phap', 'giay-gio', 'song-anh', 'khai-khong', 'nam-cham-hon', 'linh-khe', 'tia-pha-ma', 'bang-phong', 'min-luu-hoa', 'ho-menh-phu', 'gai-phan', 'van-may'];
function botMove(run, h, sk, rnd) {
  if (sk <= 0) return [0, 0];
  let fx = 0, fy = 0;
  for (const m of run.near(h.x, h.y, 9)) { const dx = h.x - m.x, dy = h.y - m.y, d = Math.max(0.3, Math.hypot(dx, dy)), w = (m.boss || m.elite ? 3 : 1) / (d * d); fx += dx * w; fy += dy * w; }
  for (const z of run.zones) if (z.hero && Math.hypot(h.x - z.x, h.y - z.y) < z.r + 1.5) { const dx = h.x - z.x, dy = h.y - z.y, d = Math.max(0.2, Math.hypot(dx, dy)); fx += (dx / d) * 8; fy += (dy / d) * 8; }
  for (const s of run.shots) { const d = Math.hypot(h.x - s.x, h.y - s.y); if (d < 3) { fx += -s.vy / 4; fy += s.vx / 4; } }
  if (run.phase === 'boss' && run.bossId) { const b = run.mons.get(run.bossId); if (b && run.t - b.actT > 0.8) { const dx = b.x - h.x, dy = b.y - h.y, d = Math.hypot(dx, dy) || 1, want = 2.2 + b.r; if (d > want) { fx += (dx / d) * 1.2; fy += (dy / d) * 1.2; } } }
  const crowd = Math.hypot(fx, fy);
  // go for gems / hearts when the crowd is thin
  let best = null, bd = 7;
  for (const g of run.gems) { const d = Math.hypot(g.x - h.x, g.y - h.y); const want = g.heart ? (h.hp < h.maxHp * 0.6 ? 0.2 : 9) : 1; if (d * want < bd) { bd = d * want; best = g; } }
  if (best) { const dx = best.x - h.x, dy = best.y - h.y, d = Math.hypot(dx, dy) || 1; const w = crowd > 0.6 ? 0.25 : 0.9; fx += (dx / d) * w; fy += (dy / d) * w; }
  // circle a little so it does not run into a corner
  fx += -fy * 0.35; fy += fx * 0.35;
  // a worse player: noise and late reactions
  if (sk < 1) { fx = fx * sk + (rnd() - 0.5) * (1 - sk) * 2; fy = fy * sk + (rnd() - 0.5) * (1 - sk) * 2; }
  return [fx, fy];
}
const results = [];
for (let r = 0; r < runs; r++) {
  const H = S, D = S, members = [];
  for (let k = 0; k < party; k++) members.push({ pid: k + 1, name: 'bot' + k, heroType: k ? ['kim-ha', 'phong-vu', 'lam-nguyet', 'hoa-ky'][k - 1] : hero, hp: 900 * H * H, atk: 28 * D * D, armor: 0.25, ms: 0.1, pet: 'gau-truc', petAtk: 40 * S, petHp: 2000 * S, petCd: 1, petRange: 1.2 });
  const run = new HellRun({ id: 'sim', seed: 1000 + r * 77 + mi * 13, mode: mi, members });
  const dmgBy = {}; { const o = run.hurtHero.bind(run); run.hurtHero = (h, d, src) => { const hp0 = h.hp; o(h, d, src); const k = src?.type ?? 'zone/shot'; dmgBy[k] = (dmgBy[k] ?? 0) + Math.max(0, hp0 - Math.max(0, h.hp)); }; }
  let rs = 99 + r; const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
  const t0 = Date.now(); let minHp = 1, steps = 0;
  while (!run.over && run.t < 60 * 30) {
    for (const h of run.heroes.values()) {
      if (h.cards) { const c = h.cards; let k = c.findIndex((x) => x.id === HELL_WEAPON[h.heroType]); if (k < 0) { let bi = 99; c.forEach((x, i) => { const p = PRIO.indexOf(x.id); const pr = p < 0 ? 50 : p; if (pr < bi) { bi = pr; k = i; } }); } run.input(h.pid, { t: 'hpick', i: Math.max(0, k) }); continue; }
      if (steps % 4 === 0) { const [x, y] = botMove(run, h, skill, rnd); run.input(h.pid, { t: 'hmove', x, y }); }
      if (run.t >= h.ultAt && run.near(h.x, h.y, 5).length > 8) run.input(h.pid, { t: 'hult' });
      if (!h.dead) minHp = Math.min(minHp, h.hp / h.maxHp);
    }
    run.update(); steps++;
  }
  const h = run.heroes.get(1);
  results.push({ dmgBy: Object.entries(dmgBy).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => k + ':' + Math.round(v)).join(' '), over: run.over, wave: run.wave, t: Math.round(run.t), lv: h.lv, kills: h.kills, minHp: +minHp.toFixed(2), skills: Object.entries(h.skills).map(([k, v]) => k + v).join(' '), ms: Date.now() - t0, earned: { gold: Math.round(h.earned.gold), soul: h.earned.soul, items: h.earned.items.join(','), xp: Math.round(h.earned.xp) } });
}
const win = results.filter((x) => x.over === 'win').length;
console.log(`mode ${HELL_MODES[mi].name} S=${S} skill=${skill} hero=${hero} party=${party}: win ${win}/${runs}`);
for (const x of results) console.log(' ', x.over, 'wave', x.wave, 't', x.t, 'lv', x.lv, 'kills', x.kills, 'minHp', x.minHp, 'ms', x.ms, '|', x.skills, '| dmg', x.dmgBy);
console.log(' earned (last):', JSON.stringify(results[results.length - 1].earned));

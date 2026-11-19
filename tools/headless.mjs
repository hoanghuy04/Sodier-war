// Headless run: bots play for N simulated minutes; prints a summary. Usage: node tools/headless.mjs [minutes=10] [bots=4]
import { Game } from '../server/game.js';
import { Bots } from '../server/bot.js';
const mins = +(process.argv[2] ?? 10), nb = +(process.argv[3] ?? 4);
const g = new Game(20261111), bots = new Bots(g);
bots.ensure(nb);
let deaths = 0; g.onDeath = (p) => { deaths++; console.log(`[${(g.t / 60).toFixed(1)}m] ${p.name} chết`, JSON.stringify(p.deathInfo)); };
const t0 = Date.now();
for (let i = 0; i < mins * 60 * 20; i++) {
  bots.update(); g.update();
  g.events.length = 0;
  for (const n of g.notices) if (n.kind === 'sys' && !/xuất trận/.test(n.text)) console.log(`[${(g.t / 60).toFixed(1)}m]`, n.text);
  g.notices.length = 0;
  if (i % (60 * 20) === 0 && i) {
    const s = [...g.players.values()].map((p) => `${p.name.split(' ').pop()}:${p.alive ? p.heroType : 'dead'} u${p.units.length} m${g.mines.filter((m) => m.owner === p.id).length} ${Object.entries(p.res).filter(([, v]) => v >= 1).map(([k, v]) => k[0] + Math.floor(v)).join(',')}`);
    console.log(`--- ${(g.t / 60).toFixed(0)}m units=${g.units.size}`, s.join(' | '));
  }
}
console.log(`done ${mins}m sim in ${((Date.now() - t0) / 1000).toFixed(1)}s, deaths ${deaths}, units ${g.units.size}`);

// Địa Ngục runs (docs/design/29-dia-nguc.md): one HellRun per solo player / party, each with its own 512×512 arena.
// The server decides every hit and every reward; clients only send movement, card picks and Q.
import {
  HELL_W, HELL_WAVE_S, HELL_ENRAGE_S, HELL_MODES, HELL_MON, HELL_ELITES, HELL_BOSSES, HELL_RINGS, HELL_SKILLS, HELL_WEAPON, HELL_ACT_SLOTS, HELL_PAS_SLOTS,
  HELL_SKILL_MAX, HELL_ULT, HELL_FILLER, HELL_REWARD, HELL_CHEST, HELL_HERO_SPEED, HELL_MON_SPEED_CAP, HELL_PICK_R, HELL_KEEP_DEAD, HELL_HEART, HELL_HEART_LIFE,
  waveHp, waveDmg, waveCount, partyN, partyHp, partyBossHp, HELL_CAP, hellXpNeed, eliteWave, bossOfMode, chestGroup, hellArena, hellWalk, hellFlyOk, mulberry,
} from '../shared/hell.js';

const DT = 0.05;
const hyp = Math.hypot;
const angDiff = (a, b) => { let d = Math.abs(a - b) % (Math.PI * 2); return d > Math.PI ? Math.PI * 2 - d : d; };
const VIEW_X = 26, VIEW_Y = 17; // tiles sent around each hero
export const MON_TYPES = [...Object.keys(HELL_MON), ...HELL_ELITES.map((e) => e.id), ...Object.keys(HELL_BOSSES)];
const MON_CODE = Object.fromEntries(MON_TYPES.map((t, i) => [t, i]));

export class HellRun {
  /** members: [{ pid, name, heroType, hp, atk, armor, ms, pet, petAtk, petHp, petCd, petRange, petRefine, lvl }] */
  constructor({ id, seed, mode, members }) {
    this.id = id; this.seed = seed; this.mi = Math.max(0, Math.min(HELL_MODES.length - 1, mode | 0)); this.mode = HELL_MODES[this.mi];
    this.rand = mulberry(seed ^ 0x9e37); this.A = hellArena(seed);
    this.t = 0; this.tick = 0; this.nextId = 1; this.events = []; this.over = null; this.paused = false;
    this.n = members.length;
    this.mons = new Map(); this.gems = []; this.shots = []; this.zones = []; this.proj = [];
    this.hash = new Map();
    this.heroes = new Map();
    const [cx, cy] = this.A.altar;
    members.forEach((m, k) => {
      const H = Math.max(1, Math.min(3, Math.sqrt((m.hp ?? 900) / 900))), D = Math.max(1, Math.min(3, Math.sqrt((m.atk ?? 28) / 28)));
      const h = {
        pid: m.pid, name: m.name, heroType: m.heroType, x: cx + (k - (members.length - 1) / 2) * 1.5, y: cy + 1, dir: Math.PI / 2, face: Math.PI / 2,
        baseHp: 900 * H, D, armor: Math.min(0.4, (m.armor ?? 0.25) * 0.5), spd: HELL_HERO_SPEED * (1 + Math.min(0.5, (m.ms ?? 0) * 0.5)) * (m.heroType === 'phong-vu' ? 1.12 : 1),
        hp: 0, maxHp: 0, lv: 1, xp: 0, mx: 0, my: 0, moving: false, dead: false, ghost: 0, reviveT: 0, out: false, invulnUntil: 0, guardAt: -9, slowUntil: 0, slowK: 1, stunUntil: 0,
        skills: {}, act: [], pas: [], cd: {}, cards: null, pendingCards: 0, rerolls: 2, skips: 1, ultAt: 30, ultUntil: 0, ult: null, xp2Until: 0, whipSide: 1, liemT: 0,
        earned: { gold: 0, oil: 0, crystal: 0, diamond: 0, xp: 0, soul: 0, items: [], dust: {} }, kills: 0, lastHit: -9,
        pet: m.pet ? { type: m.pet, x: cx, y: cy + 2, hp: m.petHp ?? 1000, maxHp: m.petHp ?? 1000, atk: m.petAtk ?? 30, cd: m.petCd ?? 1, range: m.petRange ?? 1.2, next: 0, rest: 0 } : null,
      };
      const wid = HELL_WEAPON[m.heroType] ?? 'w-thach-lam';
      h.skills[wid] = 1; h.act.push(wid);
      this.recalc(h); h.hp = h.maxHp;
      this.heroes.set(m.pid, h);
    });
    this.wave = 1; this.phase = 'run'; this.bossId = 0; this.bossAt = 0; this.eliteDone = 0; this.ringDone = 0; this.exitUntil = 0;
    this.spawnAcc = 0; this.sweepAt = 0; this.killCount = 0;
  }
  // ---------------------------------------------------------------- stats
  sk(h, id) { return h.skills[id] ? HELL_SKILLS[id].lv(h.skills[id]) : null; }
  recalc(h) {
    const P = (id) => this.sk(h, id);
    const hpK = 1 + (P('tam-thep')?.hp ?? 0) + (h.heroType === 'thach-lam' ? 0.2 : 0);
    const was = h.maxHp; h.maxHp = Math.round(h.baseHp * hpK); if (was) h.hp = Math.min(h.maxHp, h.hp + Math.max(0, h.maxHp - was));
    h.regen = P('tam-thep')?.regen ?? 0;
    h.red = (P('giap-hac-thach')?.red ?? 0) + (h.heroType === 'thach-lam' ? 0.1 : 0);
    h.spdK = 1 + (P('giay-gio')?.spd ?? 0);
    h.pick = HELL_PICK_R * (1 + (P('nam-cham-hon')?.pick ?? 0) + (h.heroType === 'kim-ha' ? 0.4 : 0));
    h.xpK = 1 + (P('nam-cham-hon')?.xp ?? 0);
    h.dmgK = h.D * (1 + (P('tu-luc')?.dmg ?? 0) + (P('song-anh')?.dmg ?? 0));
    h.cdK = 1 - (P('toc-phap')?.cdr ?? 0);
    h.areaK = 1 + (P('khai-khong')?.area ?? 0) + (h.heroType === 'lam-nguyet' ? 0.15 : 0);
    h.extra = P('song-anh')?.extra ?? 0;
    h.petK = 1 + (P('linh-khe')?.pet ?? 0) + (h.heroType === 'hoa-ky' ? 0.3 : 0);
  }
  // ---------------------------------------------------------------- input
  input(pid, c) {
    const h = this.heroes.get(pid); if (!h || this.over) return;
    if (c.t === 'hmove') { const x = +c.x || 0, y = +c.y || 0, l = Math.hypot(x, y); if (l > 0.01) { h.mx = x / l; h.my = y / l; h.moving = true; } else { h.mx = h.my = 0; h.moving = false; } return; }
    if (c.t === 'hpick' && h.cards) {
      const k = c.i | 0;
      if (c.reroll) { if (h.rerolls > 0) { h.rerolls--; h.cards = this.rollCards(h); } return; }
      if (c.skip) { if (h.skips > 0) { h.skips--; this.closeCards(h); } return; }
      const card = h.cards[k]; if (!card) return;
      this.applyCard(h, card); this.closeCards(h); return;
    }
    if (c.t === 'hult') return this.ultimate(h);
    if (c.t === 'hexit' && this.exitUntil > this.t && !h.dead && hyp(h.x - this.A.altar[0], h.y - this.A.altar[1]) < 4) { h.out = 'exit'; this.ev({ k: 'txt', x: h.x, y: h.y, s: 'Rời Địa Ngục' }); return; }
  }
  // ---------------------------------------------------------------- cards
  rollCards(h) {
    const n = h.lv % 5 === 0 ? 4 : 3, pool = [];
    for (const [id, S] of Object.entries(HELL_SKILLS)) {
      if (S.hero && S.hero !== h.heroType) continue;
      const L = h.skills[id] ?? 0;
      if (L >= HELL_SKILL_MAX) continue;
      if (!L && (S.slot === 'act' ? h.act.length >= HELL_ACT_SLOTS : h.pas.length >= HELL_PAS_SLOTS)) continue;
      pool.push({ id, w: L ? 1.5 : S.hero ? 1.5 : 1 });
    }
    const out = [];
    while (out.length < n && pool.length) {
      let r = this.rand() * pool.reduce((s, x) => s + x.w, 0), k = 0;
      for (; k < pool.length - 1; k++) { r -= pool[k].w; if (r <= 0) break; }
      const { id } = pool.splice(k, 1)[0], L = (h.skills[id] ?? 0) + 1;
      out.push({ id, L, name: HELL_SKILLS[id].name, text: HELL_SKILLS[id].texts[L - 1], icon: HELL_SKILLS[id].icon, slot: HELL_SKILLS[id].slot, isNew: L === 1 });
    }
    if (!out.length) for (const f of HELL_FILLER) out.push({ id: f.id, L: 0, name: f.name, text: f.text, icon: f.icon, filler: true });
    return out;
  }
  openCards(h) {
    if (h.cards) { h.pendingCards++; return; }
    h.cards = this.rollCards(h);
    if (this.n === 1) this.paused = true; // solo: the run stops while choosing
    else { h.invulnUntil = this.t + 2; for (const m of this.near(h.x, h.y, 2.5)) this.knock(m, h.x, h.y, 2); h.cardsAt = this.t; }
  }
  closeCards(h) {
    h.cards = null;
    if (h.pendingCards > 0) { h.pendingCards--; h.cards = this.rollCards(h); return; }
    if (![...this.heroes.values()].some((q) => q.cards)) this.paused = false;
  }
  applyCard(h, c) {
    if (c.filler) { if (c.id === 'heal') h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.3); else h.earned.gold += 30; return; }
    const S = HELL_SKILLS[c.id]; if (!S) return;
    const L = (h.skills[c.id] ?? 0) + 1; if (L > HELL_SKILL_MAX) return;
    if (L === 1) { if (S.slot === 'act') { if (h.act.length >= HELL_ACT_SLOTS) return; h.act.push(c.id); } else { if (h.pas.length >= HELL_PAS_SLOTS) return; h.pas.push(c.id); } }
    h.skills[c.id] = L; this.recalc(h);
  }
  gainXp(h, v) {
    if (h.dead || h.out) return;
    h.xp += v * h.xpK * (h.xp2Until > this.t ? 2 : 1);
    while (h.xp >= hellXpNeed(h.lv)) { h.xp -= hellXpNeed(h.lv); h.lv++; this.ev({ k: 'lvup', pid: h.pid }); this.openCards(h); }
  }
  // ---------------------------------------------------------------- helpers
  ev(e) { this.events.push(e); }
  liveHeroes() { return [...this.heroes.values()].filter((h) => !h.dead && !h.out); }
  nearestHero(x, y) { let b = null, bd = 1e9; for (const h of this.heroes.values()) { if (h.dead || h.out) continue; const d = hyp(h.x - x, h.y - y); if (d < bd) { bd = d; b = h; } } return b; }
  rehash() { this.hash.clear(); for (const m of this.mons.values()) { const k = ((m.y >> 1) << 9) | (m.x >> 1); let a = this.hash.get(k); if (!a) this.hash.set(k, (a = [])); a.push(m); } }
  near(x, y, r) {
    const out = [], c0 = (x - r) >> 1, c1 = (x + r) >> 1, r0 = (y - r) >> 1, r1 = (y + r) >> 1;
    for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) { const a = this.hash.get((cy << 9) | cx); if (a) for (const m of a) if (!m.dead && hyp(m.x - x, m.y - y) <= r + m.r) out.push(m); }
    return out;
  }
  monSpdCap() { const h = this.liveHeroes()[0]; return (h ? h.spd : HELL_HERO_SPEED) * HELL_MON_SPEED_CAP; }
  moveEnt(e, dx, dy, fly) {
    const nx = e.x + dx, ny = e.y + dy, ok = fly ? hellFlyOk : (x, y) => hellWalk(this.A, x, y);
    if (fly ? ok(this.A, nx, ny) : ok(nx, ny)) { e.x = nx; e.y = ny; return true; }
    if (fly ? ok(this.A, nx, e.y) : ok(nx, e.y)) { e.x = nx; return true; }
    if (fly ? ok(this.A, e.x, ny) : ok(e.x, ny)) { e.y = ny; return true; }
    return false;
  }
  knock(m, fx, fy, d) {
    if (m.boss || m.elite) d *= 0.15;
    const a = Math.atan2(m.y - fy, m.x - fx); this.moveEnt(m, Math.cos(a) * d, Math.sin(a) * d, m.fly);
  }
  // ---------------------------------------------------------------- spawning
  monStats(type, opts = {}) {
    const M = this.mode, w = this.wave;
    if (opts.elite) { const E = HELL_ELITES.find((e) => e.id === type); return { hp: E.hp * (0.4 + 0.6 * M.hp) * partyBossHp(this.n) * (1 + 0.03 * w), atk: E.atk * M.dmg * waveDmg(w), spd: E.spd, r: E.r, fly: !!E.fly, kind: 'elite', skill: E.skill, name: E.name }; }
    if (opts.boss) { const B = HELL_BOSSES[type]; return { hp: B.hp * M.bossHp * partyBossHp(this.n), atk: B.atk * M.dmg * waveDmg(w), spd: B.spd, r: B.r, fly: !!B.fly, kind: 'boss', skills: B.skills, name: B.name }; }
    const S = HELL_MON[type], k = opts.size ?? 1;
    return { hp: S.hp * waveHp(w) * M.hp * partyHp(this.n) * (k === 1 ? 1 : k === 2 ? 0.33 : 0.1), atk: S.atk * waveDmg(w) * M.dmg * (k === 1 ? 1 : k === 2 ? 0.7 : 0.4), spd: S.spd * (k === 1 ? 1 : k === 2 ? 1.3 : 1.6), r: S.r * (k === 1 ? 1 : k === 2 ? 0.7 : 0.45), fly: !!S.fly, kind: S.kind };
  }
  addMon(type, x, y, opts = {}) {
    const st = this.monStats(type, opts);
    const m = { id: this.nextId++, type, x, y, hp: st.hp, maxHp: st.hp, atk: st.atk, spd: Math.min(st.spd, this.monSpdCap()), baseSpd: st.spd, r: st.r, fly: st.fly, kind: st.kind, size: opts.size ?? 1, elite: !!opts.elite, boss: !!opts.boss,
      skill: st.skill, skills: st.skills, next: this.t + 1 + this.rand() * 2, hitAt: 0, dir: 0, act: 0, actT: 0, state: null, stT: 0, burn: null, slowUntil: 0, stunUntil: 0, revived: false, name: st.name, vx: 0, vy: 0 };
    this.mons.set(m.id, m);
    if (opts.vx != null) { m.vx = opts.vx; m.vy = opts.vy; m.straight = true; m.until = this.t + (opts.life ?? 12); }
    if (m.elite || m.boss) this.ev({ k: 'spawnbig', id: m.id, type, name: m.name });
    return m;
  }
  spawnPoint(h, r0 = 22, r1 = 27, fly = false) {
    for (let k = 0; k < 12; k++) {
      const a = this.rand() * Math.PI * 2, r = r0 + this.rand() * (r1 - r0), x = h.x + Math.cos(a) * r, y = h.y + Math.sin(a) * r;
      if (fly ? hellFlyOk(this.A, x, y) : hellWalk(this.A, x, y)) return { x, y };
    }
    return null;
  }
  director() {
    const M = this.mode, heroes = this.liveHeroes(); if (!heroes.length) return;
    const runT = M.waves * HELL_WAVE_S;
    this.wave = Math.min(M.waves + 1, Math.floor(this.t / HELL_WAVE_S) + 1);
    // elites
    if (this.eliteDone < M.elites && this.wave >= eliteWave(M, this.eliteDone) && this.t < runT) {
      const E = HELL_ELITES[this.eliteDone++], h = heroes[Math.floor(this.rand() * heroes.length)], p = this.spawnPoint(h, 14, 16, !!E.fly);
      if (p) { this.addMon(E.id, p.x, p.y, { elite: true }); this.ev({ k: 'banner', s: `Tinh anh: ${E.name}` }); }
    }
    // encirclements
    while (this.ringDone < HELL_RINGS.length && HELL_RINGS[this.ringDone].wave < this.wave - 0.01 && HELL_RINGS[this.ringDone].wave <= M.waves) {
      const R = HELL_RINGS[this.ringDone++]; if (this.wave - 1 !== R.wave && this.t - (R.wave * HELL_WAVE_S) > 5) continue;
      const h = heroes[Math.floor(this.rand() * heroes.length)], types = this.typesNow(), type = types[Math.floor(this.rand() * types.length)];
      const n = Math.round(R.n * M.count * partyN(this.n));
      for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2, x = h.x + Math.cos(a) * 12, y = h.y + Math.sin(a) * 12; if (hellWalk(this.A, x, y) || HELL_MON[type].fly) this.addMon(type, x, y); }
      this.ev({ k: 'banner', s: 'Vòng vây!' });
    }
    // the boss after the last wave
    if (this.phase === 'run' && this.t >= runT) {
      this.phase = 'boss'; this.bossAt = this.t;
      for (const m of [...this.mons.values()]) if (!m.elite) { this.mons.delete(m.id); this.ev({ k: 'poof', x: m.x, y: m.y }); }
      const h = heroes[0], type = bossOfMode(M, this.rand()), p = this.spawnPoint(h, 9, 11, !!HELL_BOSSES[type].fly) ?? { x: h.x + 8, y: h.y };
      const b = this.addMon(type, p.x, p.y, { boss: true }); this.bossId = b.id;
      this.ev({ k: 'banner', s: `Boss: ${HELL_BOSSES[type].name}` });
      return;
    }
    if (this.phase !== 'run') return;
    // keep the crowd: spawn off-screen around a random hero up to the target; far ones come back closer
    const target = Math.min(HELL_CAP(this.n), Math.round(waveCount(this.wave) * M.count * partyN(this.n)));
    let live = 0; for (const m of this.mons.values()) if (!m.elite && !m.boss) live++;
    const types = this.typesNow();
    let budget = Math.min(12, target - live);
    while (budget-- > 0) {
      const h = heroes[Math.floor(this.rand() * heroes.length)], type = this.pickType(types);
      if (HELL_MON[type].kind === 'sweep') { if (this.t >= this.sweepAt) this.sweep(h); continue; }
      const p = this.spawnPoint(h, 22, 27, HELL_MON[type].fly); if (!p) continue;
      const n = HELL_MON[type].pack ?? 1;
      for (let k = 0; k < n; k++) this.addMon(type, p.x + (k % 3) * 0.7, p.y + Math.floor(k / 3) * 0.7);
    }
    if (this.tick % 20 === 0) for (const m of this.mons.values()) {
      if (m.elite || m.boss || m.straight) continue;
      const h = this.nearestHero(m.x, m.y); if (!h) break;
      if (hyp(m.x - h.x, m.y - h.y) > 36) { const p = this.spawnPoint(h, 22, 26, m.fly); if (p) { m.x = p.x; m.y = p.y; } }
    }
  }
  typesNow() { return Object.keys(HELL_MON).filter((t) => HELL_MON[t].from <= this.t && (HELL_MON[t].w > 0 || HELL_MON[t].kind === 'sweep')); }
  pickType(types) { const ws = types.map((t) => HELL_MON[t].w || 1.2), s = ws.reduce((a, b) => a + b, 0); let r = this.rand() * s; for (let k = 0; k < types.length; k++) { r -= ws[k]; if (r <= 0) return types[k]; } return types[types.length - 1]; }
  sweep(h) { // Quạ Lửa: a flock crossing the screen in a line, warned 1 s before
    this.sweepAt = this.t + 18;
    const a = this.rand() * Math.PI * 2, sx = h.x - Math.cos(a) * 16, sy = h.y - Math.sin(a) * 16, n = 8 + Math.floor(this.rand() * 5), sp = 5;
    this.ev({ k: 'line', x: sx, y: sy, a: +a.toFixed(2), len: 32, w: 2, t: 1 });
    this.later(1, () => { for (let k = 0; k < n; k++) { const off = (k - n / 2) * 0.7, px = sx - Math.sin(a) * off, py = sy + Math.cos(a) * off; this.addMon('qua-lua', px, py, { vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 8 }); } });
  }
  later(dt, fn) { (this.timers ??= []).push({ at: this.t + dt, fn }); }
  // ---------------------------------------------------------------- damage
  hurtHero(h, dmg, src = null) {
    if (h.dead || h.out || this.t < h.invulnUntil) return;
    let d = dmg * (1 - h.armor) * (1 - h.red);
    if (h.ult === 'shield' && h.ultUntil > this.t) d *= 0.5;
    if (this.phase === 'boss' && this.t - this.bossAt > HELL_ENRAGE_S && src?.boss) d *= 3;
    d = Math.max(1, d);
    if (this.sk(h, 'giap-hac-thach')?.guard && d > h.maxHp * 0.1 && this.t - h.guardAt > 5) { h.guardAt = this.t; h.invulnUntil = this.t + 0.5; }
    h.hp -= d; h.lastHit = this.t;
    this.ev({ k: 'hhit', pid: h.pid, v: Math.round(d) });
    if (h.hp <= 0) this.heroDown(h);
  }
  heroDown(h) {
    h.hp = 0;
    if (this.n > 1) { h.dead = true; h.ghost = this.t + 30; h.reviveT = 0; this.ev({ k: 'down', pid: h.pid, x: h.x, y: h.y }); return; }
    h.dead = true; h.out = 'dead'; this.ev({ k: 'down', pid: h.pid, x: h.x, y: h.y });
  }
  hit(m, dmg, h, opts = {}) {
    if (m.dead || dmg <= 0) return;
    let d = dmg;
    if (m.kind === 'shell' && m.hp > m.maxHp * 0.5) d *= 0.4;
    if (m.kind === 'shield' && !opts.pierce && h) { const a = Math.atan2(h.y - m.y, h.x - m.x); if (angDiff(a, m.dir) < Math.PI / 2.5) d *= 0.25; }
    if (m.burrowed) d *= 0.5;
    if (m.mark > this.t) d *= 1.2;
    d *= 0.9 + this.rand() * 0.2;
    m.hp -= d; m.act = 3; m.actT = this.t;
    m.dmgAcc = (m.dmgAcc ?? 0) + d;
    if (opts.stun) m.stunUntil = Math.max(m.stunUntil, this.t + (m.elite || m.boss ? Math.min(0.3, opts.stun) : opts.stun));
    if (opts.slow) m.slowUntil = Math.max(m.slowUntil, this.t + opts.slow);
    if (opts.burn) m.burn = { dps: opts.burn, until: this.t + 3, by: h?.pid };
    if (m.hp <= 0) this.monDie(m, h, opts);
  }
  monDie(m, h, opts = {}) {
    if (m.kind === 'revive' && !m.revived && !opts.aoe) { m.revived = true; m.hp = m.maxHp * 0.5; m.down = this.t + 4; m.act = 5; m.actT = this.t; return; }
    m.dead = true; this.mons.delete(m.id); this.killCount++;
    this.ev({ k: 'mdie', id: m.id, type: m.type, x: +m.x.toFixed(1), y: +m.y.toFixed(1) });
    const killer = h ?? this.nearestHero(m.x, m.y);
    if (killer) killer.kills++;
    if (m.boss) return this.bossDown(m);
    if (m.elite) return this.eliteDown(m);
    const S = HELL_MON[m.type];
    let xp = S.xp * 1.5;
    if (opts.xpBonus) xp *= 1 + opts.xpBonus;
    this.gems.push({ id: this.nextId++, x: m.x, y: m.y, v: xp });
    if (this.gems.length > 260) { const g0 = this.gems.filter((g) => !g.heart).slice(0, 40); if (g0.length) { this.gems = this.gems.filter((g) => !g0.includes(g)); const v = g0.reduce((s2, g) => s2 + g.v, 0); this.gems.push({ id: this.nextId++, x: g0[0].x, y: g0[0].y, v }); } }
    if (this.rand() < HELL_REWARD.coinChance) this.dropAll('gold', HELL_REWARD.coinGold);
    if (this.rand() < (this.heartChance ?? HELL_HEART)) this.gems.push({ id: this.nextId++, x: m.x, y: m.y, v: 0, heart: this.t + HELL_HEART_LIFE });
    if (this.killCount % HELL_REWARD.soulPerKills === 0) this.dropAll('soul', 1);
    if (m.kind === 'split' && m.size < 3) for (let k = 0; k < 2; k++) this.addMon(m.type, m.x + (k ? 0.4 : -0.4), m.y, { size: m.size + 1 });
    if (opts.burst && m.burn && m.burn.until > this.t) { for (const q of this.near(m.x, m.y, 1)) this.hit(q, 30 * (h?.dmgK ?? 1), h, { aoe: true }); this.ev({ k: 'boom', x: m.x, y: m.y, r: 1, c: 'fire' }); }
  }
  dropAll(what, v) { for (const h of this.heroes.values()) if (!h.out || h.out === 'exit') h.earned[what] = (h.earned[what] ?? 0) + v; }
  eliteDown(m) {
    const F = this.mode.F;
    for (const h of this.heroes.values()) { if (h.out) continue; h.earned.xp += HELL_REWARD.eliteXp * F; h.earned.soul += HELL_REWARD.eliteSoul * F; this.chest(h, 'elite', 2); }
    this.exitUntil = this.t + 20;
    this.ev({ k: 'banner', s: 'Cổng thoát mở 20 giây trên Tế đàn (giữ 100% thưởng)' });
  }
  bossDown(m) {
    const F = this.mode.F;
    for (const h of this.heroes.values()) { if (h.out && h.out !== 'exit') continue; h.earned.xp += HELL_REWARD.bossXp * F; h.earned.soul += HELL_REWARD.bossSoul * F; h.earned.diamond += Math.round(HELL_REWARD.bossDiamond * F); this.chest(h, 'boss', 4); this.chest(h, 'boss', 0); }
    this.ev({ k: 'banner', s: 'Đã hạ boss!' });
    this.finish('win');
  }
  /** a chest: gear for the open world (+ skill level-ups while still in the run) */
  chest(h, kind, ups) {
    const T = HELL_CHEST[kind][chestGroup(this.mi)];
    let r = this.rand(), tier = T[T.length - 1][0];
    for (const [t, p] of T) { r -= p; if (r <= 0) { tier = t; break; } }
    h.earned.items.push(tier);
    for (let k = 0; k < ups && !h.dead; k++) {
      const own = Object.keys(h.skills).filter((id) => h.skills[id] < HELL_SKILL_MAX); if (!own.length) break;
      const id = own[Math.floor(this.rand() * own.length)]; h.skills[id]++;
    }
    this.recalc(h);
    this.ev({ k: 'chest', pid: h.pid, tier });
  }
  // ---------------------------------------------------------------- the main loop
  update() {
    if (this.over) return;
    if (this.paused) { this.tick++; return; }
    this.t += DT; this.tick++;
    if (this.timers?.length) { const due = this.timers.filter((x) => x.at <= this.t); this.timers = this.timers.filter((x) => x.at > this.t); for (const x of due) x.fn(); }
    this.rehash();
    this.director();
    for (const h of this.heroes.values()) this.heroTick(h);
    this.rehash();
    for (const m of [...this.mons.values()]) this.monTick(m);
    this.projTick(); this.shotTick(); this.zoneTick(); this.gemTick();
    // party: a member whose cards stay open 8 s gets the first one
    for (const h of this.heroes.values()) if (h.cards && this.n > 1 && this.t - (h.cardsAt ?? this.t) > 8) { this.applyCard(h, h.cards[0]); this.closeCards(h); }
    const alive = this.liveHeroes();
    if (!alive.length) this.finish([...this.heroes.values()].every((h) => h.out === 'exit') ? 'exit' : 'dead');
  }
  finish(why) {
    if (this.over) return;
    this.over = why;
    for (const h of this.heroes.values()) {
      const mins = Math.min(this.t, this.mode.waves * HELL_WAVE_S + 240) / 60, F = this.mode.F;
      h.earned.gold += HELL_REWARD.goldPerMin * mins * F; h.earned.oil += HELL_REWARD.oilPerMin * mins * F; h.earned.crystal += HELL_REWARD.crystalPerMin * mins * F; h.earned.xp += HELL_REWARD.xpPerMin * mins * F;
      const keep = why === 'win' || h.out === 'exit' ? 1 : HELL_KEEP_DEAD;
      for (const k of ['gold', 'oil', 'crystal', 'xp', 'soul']) h.earned[k] = Math.round(h.earned[k] * keep);
      h.earned.dust = why === 'win' ? { rare: 3 * (this.mi + 1), epic: this.mi >= 2 ? 2 * this.mi : 0, legendary: this.mi >= 3 ? 2 : 0 } : {};
      h.result = why === 'win' ? 'win' : h.out === 'exit' ? 'exit' : 'dead';
    }
    this.ev({ k: 'over', why });
  }
  heroTick(h) {
    if (h.out) return;
    if (h.dead) { // party ghost: a friend standing next to it for 3 s brings it back
      const f = [...this.heroes.values()].find((q) => q !== h && !q.dead && !q.out && hyp(q.x - h.x, q.y - h.y) < 1.5);
      if (f) { h.reviveT += DT; if (h.reviveT >= 3) { h.dead = false; h.hp = h.maxHp * 0.5; h.invulnUntil = this.t + 2; this.ev({ k: 'revive', pid: h.pid }); } } else h.reviveT = 0;
      if (h.dead && this.t > h.ghost) h.out = 'dead';
      return;
    }
    // move
    const slow = h.slowUntil > this.t ? h.slowK : 1, sp = h.spd * h.spdK * slow * (h.ult === 'rush' && h.ultUntil > this.t ? 1.6 : 1);
    if (h.moving && h.stunUntil <= this.t) { this.moveEnt(h, h.mx * sp * DT, h.my * sp * DT, false); h.dir = Math.atan2(h.my, h.mx); h.face = h.dir; }
    if (h.regen) h.hp = Math.min(h.maxHp, h.hp + h.regen * DT);
    if (h.ult === 'rush' && h.ultUntil > this.t) for (const m of this.near(h.x, h.y, 0.9)) if (!(m.rushHit > this.t)) { m.rushHit = this.t + 0.5; this.hit(m, 40 * h.dmgK, h); }
    // skills
    for (const id of h.act) {
      if ((h.cd[id] ?? 0) > this.t) continue;
      const cd = this.fire(h, id);
      if (cd) h.cd[id] = this.t + cd * h.cdK;
    }
    this.auraTick(h);
    // pet
    const pt = h.pet;
    if (pt) {
      if (pt.rest > this.t) { pt.x = h.x; pt.y = h.y + 1; }
      else {
        const tgt = this.nearMon(pt.x, pt.y, 6);
        if (tgt && hyp(tgt.x - pt.x, tgt.y - pt.y) > pt.range + tgt.r) { const a = Math.atan2(tgt.y - pt.y, tgt.x - pt.x); this.moveEnt(pt, Math.cos(a) * sp * DT, Math.sin(a) * sp * DT, false); }
        else if (!tgt && hyp(h.x - pt.x, h.y - pt.y) > 2) { const a = Math.atan2(h.y - pt.y, h.x - pt.x); this.moveEnt(pt, Math.cos(a) * sp * 1.1 * DT, Math.sin(a) * sp * 1.1 * DT, true); }
        if (hyp(h.x - pt.x, h.y - pt.y) > 8) { pt.x = h.x; pt.y = h.y + 1; }
        if (tgt && this.t >= pt.next && hyp(tgt.x - pt.x, tgt.y - pt.y) <= pt.range + tgt.r + 0.2) { pt.next = this.t + pt.cd; this.hit(tgt, pt.atk * h.petK, h); pt.act = this.t; }
      }
    }
  }
  nearMon(x, y, r, pred = null) { let b = null, bd = 1e9; for (const m of this.near(x, y, r)) { if (pred && !pred(m)) continue; const d = hyp(m.x - x, m.y - y); if (d < bd) { bd = d; b = m; } } return b; }
  monTick(m) {
    if (m.dead) return;
    const t = this.t;
    if (m.burn && m.burn.until > t && this.tick % 10 === 0) this.hit(m, m.burn.dps * 0.5, this.heroes.get(m.burn.by));
    if (m.dead) return;
    if (m.straight) { m.x += m.vx * DT; m.y += m.vy * DT; if (t > m.until || !hellFlyOk(this.A, m.x, m.y)) { this.mons.delete(m.id); return; } this.touch(m); return; }
    if (m.down) { if (t < m.down) return; m.down = 0; m.act = 0; }
    if (m.stunUntil > t || m.pulled > t) return;
    const h = this.nearestHero(m.x, m.y); if (!h) return;
    const dx = h.x - m.x, dy = h.y - m.y, d = hyp(dx, dy), a = Math.atan2(dy, dx);
    m.dir = a;
    let spd = m.spd * (m.slowUntil > t ? 0.6 : 1) * (this.inAura(m) ?? 1);
    if (m.kind === 'shell' && m.hp < m.maxHp * 0.5) spd = Math.min(this.monSpdCap(), m.baseSpd * 1.6);
    // specials
    if (m.elite || m.boss) { if (this.bigTick(m, h, d, a)) return; }
    else switch (m.kind) {
      case 'ranged': case 'hex': {
        const keep = HELL_MON[m.type].keep;
        if (t >= m.next && d < keep + 3) {
          m.next = t + HELL_MON[m.type].cd * (0.8 + this.rand() * 0.4); m.act = 2; m.actT = t;
          if (m.kind === 'ranged') { const s = HELL_MON[m.type].shot; this.shots.push({ id: this.nextId++, x: m.x, y: m.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, dmg: m.atk * 0.7, r: 0.35, until: t + 7, kind: 'orb' }); }
          else this.zones.push({ id: this.nextId++, x: h.x, y: h.y, r: 1.5, at: t + 1.2, dmg: m.atk * 0.6, kind: 'hex', hero: true });
        }
        if (d < keep - 1) spd = -spd * 0.6; else if (d < keep + 0.5) spd = 0;
        break;
      }
      case 'dash':
        if (m.state === 'dash') { if (t > m.stT) m.state = null; else spd = Math.max(spd, HELL_MON[m.type].dash); }
        else if (d < 6 && t >= m.next) { m.state = 'dash'; m.stT = t + 0.7; m.next = t + 4; }
        break;
      case 'bomb':
        if (m.state === 'arm') { spd = 0; if (t >= m.stT) { this.explode(m.x, m.y, 1.8, m.atk, m); this.zones.push({ id: this.nextId++, x: m.x, y: m.y, r: 1.2, at: t, until: t + 3, dps: m.atk * 0.15, kind: 'acid', hero: true }); m.dead = true; this.mons.delete(m.id); this.ev({ k: 'boom', x: m.x, y: m.y, r: 1.8, c: 'sulfur' }); return; } }
        else if (d < 1.2 + m.r) { m.state = 'arm'; m.stT = t + 0.8; m.act = 2; m.actT = t; }
        break;
      case 'hook':
        if (t >= m.next && d < 5.5 && d > 1.5) { m.next = t + 6; m.act = 2; m.actT = t; this.shots.push({ id: this.nextId++, x: m.x, y: m.y, vx: Math.cos(a) * 9, vy: Math.sin(a) * 9, dmg: m.atk * 0.5, r: 0.4, until: t + 0.7, kind: 'hook', slow: 0.4 }); }
        break;
      case 'trail':
        if (this.tick % 20 === 0) this.zones.push({ id: this.nextId++, x: m.x, y: m.y, r: 0.6, at: t, until: t + 2, dps: 4 * this.mode.dmg * waveDmg(this.wave), kind: 'burn', hero: true, small: true });
        break;
      case 'charge':
        if (m.state === 'warn') { spd = 0; if (t >= m.stT) { m.state = 'go'; m.stT = t + 1.5; m.ca = m.ca ?? a; } }
        else if (m.state === 'go') {
          const ok = this.moveEnt(m, Math.cos(m.ca) * 7 * DT, Math.sin(m.ca) * 7 * DT, false);
          this.touch(m, 1.2);
          if (!ok) { m.state = null; m.stunUntil = t + 1.5; }
          else if (t >= m.stT) m.state = null;
          return;
        } else if (d < 9 && t >= m.next) { m.state = 'warn'; m.stT = t + 1; m.ca = a; m.next = t + 6; this.ev({ k: 'line', x: m.x, y: m.y, a: +a.toFixed(2), len: 10, w: 1.4, t: 1 }); }
        break;
      default: break;
    }
    // walk at the hero (sliding along rocks), pushed apart from the crowd
    if (spd) {
      let vx = Math.cos(a) * spd, vy = Math.sin(a) * spd;
      for (const q of this.near(m.x, m.y, m.r + 0.6)) { if (q === m) continue; const ex = m.x - q.x, ey = m.y - q.y, ed = hyp(ex, ey) || 0.01, ov = m.r + q.r - ed; if (ov > 0) { vx += (ex / ed) * ov * 4; vy += (ey / ed) * ov * 4; } }
      if (!this.moveEnt(m, vx * DT, vy * DT, m.fly)) { // blocked: try to go round
        const s = m.id % 2 ? 1 : -1;
        for (const off of [0.8, 1.6, 2.4]) if (this.moveEnt(m, Math.cos(a + off * s) * spd * DT, Math.sin(a + off * s) * spd * DT, m.fly)) break;
      }
      m.act = m.act === 3 && t - m.actT < 0.25 ? 3 : 1;
    }
    this.touch(m);
  }
  /** contact damage: once a second per monster touching a hero */
  touch(m, mult = 1) {
    if (this.t < m.hitAt) return;
    for (const h of this.heroes.values()) {
      if (h.dead || h.out) continue;
      if (hyp(h.x - m.x, h.y - m.y) < m.r + 0.45) { m.hitAt = this.t + 1; m.act = 2; m.actT = this.t; this.hurtHero(h, m.atk * mult * (m.elite || m.boss ? 0.5 : 1), m); break; }
    }
  }
  explode(x, y, r, dmg, src) {
    for (const h of this.heroes.values()) if (!h.dead && !h.out && hyp(h.x - x, h.y - y) < r) this.hurtHero(h, dmg, src ?? { type: 'boom' });
    for (const q of this.near(x, y, r)) if (q !== src && !q.elite && !q.boss) this.hit(q, dmg * 0.5, null, { aoe: true });
  }
  // ---------------------------------------------------------------- elites / bosses
  bigTick(m, h, d, a) {
    const t = this.t;
    if (m.burrowed) { if (t >= m.burrowed) { m.burrowed = 0; m.x = m.bx; m.y = m.by; this.explode(m.x, m.y, 1.8, m.atk * 1.5, m); this.ev({ k: 'boom', x: m.x, y: m.y, r: 1.8, c: 'rock' }); } return true; }
    if (t < m.next) return false;
    const pick = m.boss ? m.skills[Math.floor(this.rand() * m.skills.length)] : m.skill;
    m.act = 6; m.actT = t;
    const D = m.atk;
    switch (pick) {
      case 'spin': if (d > 4) return false; m.next = t + 6; this.zones.push({ id: this.nextId++, x: m.x, y: m.y, r: 2.5, at: t + 0.6, until: t + 2, dps: D, kind: 'spin', hero: true, follow: m.id }); break;
      case 'summon': m.next = t + 8; for (let k = 0; k < 12; k++) { const aa = (k / 12) * Math.PI * 2; this.addMon('quy-tro', h.x + Math.cos(aa) * 7, h.y + Math.sin(aa) * 7); } this.ev({ k: 'banner', s: 'Phù Thủy Huyết gọi quỷ!' }); break;
      case 'ingots': m.next = t + 4 * Math.max(0.4, m.hp / m.maxHp); for (let k = 0; k < 3; k++) { const x = h.x + (this.rand() - 0.5) * 4, y = h.y + (this.rand() - 0.5) * 4; this.zones.push({ id: this.nextId++, x, y, r: 1.5, at: t + 1.1, dmg: D * 0.7, kind: 'ingot', hero: true, fire: 3 }); } break;
      case 'burrow': m.next = t + 7; m.burrowed = t + 1.2; m.bx = h.x; m.by = h.y; this.zones.push({ id: this.nextId++, x: h.x, y: h.y, r: 1.8, at: t + 1.2, dmg: 0, kind: 'burrow', hero: false }); break;
      case 'wave': m.next = t + 5; this.ev({ k: 'line', x: m.x, y: m.y, a: +a.toFixed(2), len: 12, w: 1.6, t: 0.8 }); this.later(0.8, () => this.lineHit(m.x, m.y, a, 12, 0.8, D * 1.5, m)); break;
      case 'rain': m.next = t + 7; for (let k = 0; k < 20; k++) { const x = h.x + (this.rand() - 0.5) * 14, y = h.y + (this.rand() - 0.5) * 10; this.zones.push({ id: this.nextId++, x, y, r: 1.2, at: t + 1 + this.rand(), dmg: D, kind: 'rain', hero: true }); } break;
      case 'adds': m.next = t + 12; for (let k = 0; k < 2; k++) this.addMon('cu-nham', m.x + (k ? 2 : -2), m.y); break;
      case 'scales': { m.next = t + 4; const n = 24, kind = Math.floor(this.rand() * 3); for (let k = 0; k < n; k++) { const aa = kind === 1 ? a + (k / n - 0.5) * 1.6 : (k / n) * Math.PI * 2 + (kind === 2 ? t : 0); this.shots.push({ id: this.nextId++, x: m.x, y: m.y, vx: Math.cos(aa) * 4.5, vy: Math.sin(aa) * 4.5, dmg: D * 0.7, r: 0.35, until: t + 5, kind: 'scale' }); } break; }
      case 'bats': m.next = t + 10; for (let k = 0; k < 16; k++) this.addMon('doi-than', m.x + (this.rand() - 0.5) * 3, m.y + (this.rand() - 0.5) * 3); break;
      case 'sweep': m.next = t + 5; { const len = 9; this.ev({ k: 'line', x: m.x, y: m.y, a: +a.toFixed(2), len, w: 2.4, t: 0.9 }); this.later(0.9, () => this.lineHit(m.x, m.y, a, len, 1.2, D * 1.4, m)); } break;
      case 'cage': if (d > 9) return false; m.next = t + 9; this.zones.push({ id: this.nextId++, x: h.x, y: h.y, r: 1.1, at: t + 1, dmg: D * 0.5, kind: 'cage', hero: true, stun: 2 }); break;
      case 'pull': if (m.hp > m.maxHp * 0.3) return false; m.next = t + 10; for (const q of this.heroes.values()) if (!q.dead && !q.out) { const aa = Math.atan2(m.y - q.y, m.x - q.x); this.moveEnt(q, Math.cos(aa) * 3, Math.sin(aa) * 3, false); } this.ev({ k: 'banner', s: 'Ngục Chủ kéo xích!' }); break;
      default: m.next = t + 3; return false;
    }
    return false;
  }
  lineHit(x, y, a, len, w, dmg, src) {
    for (const h of this.heroes.values()) { if (h.dead || h.out) continue; const px = h.x - x, py = h.y - y, along = px * Math.cos(a) + py * Math.sin(a), side = Math.abs(-px * Math.sin(a) + py * Math.cos(a)); if (along > 0 && along < len && side < w) this.hurtHero(h, dmg, src); }
  }
  // ---------------------------------------------------------------- projectiles, enemy shots, zones, gems
  projTick() {
    for (let i = this.proj.length - 1; i >= 0; i--) {
      const p = this.proj[i], h = this.heroes.get(p.pid);
      if (p.home && this.tick % 4 === 0) { const tg = p.target && this.mons.get(p.target); const tt = tg && !tg.dead ? tg : this.nearMon(p.x, p.y, 8); if (tt) { p.target = tt.id; const a = Math.atan2(tt.y - p.y, tt.x - p.x), s = hyp(p.vx, p.vy); p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s; } }
      if (p.ret && !p.back && hyp(p.x - p.ox, p.y - p.oy) >= p.range) p.back = true;
      if (p.back && h) { const a = Math.atan2(h.y - p.y, h.x - p.x), s = hyp(p.vx, p.vy); p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s; if (hyp(h.x - p.x, h.y - p.y) < 0.6) { this.proj.splice(i, 1); continue; } }
      p.x += p.vx * DT; p.y += p.vy * DT;
      let gone = this.t > p.until;
      for (const m of this.near(p.x, p.y, p.r)) {
        if (p.hit.has(m.id)) continue;
        p.hit.add(m.id);
        if (p.aoe) { for (const q of this.near(p.x, p.y, p.aoe)) this.hit(q, p.dmg, h, { aoe: true, pierce: p.pierceShield, xpBonus: p.xpBonus }); this.ev({ k: 'boom', x: +p.x.toFixed(1), y: +p.y.toFixed(1), r: p.aoe, c: p.fx }); gone = true; break; }
        if (p.stick) { this.zones.push({ id: this.nextId++, x: m.x, y: m.y, r: p.stick, at: this.t + 1, dmg: p.dmg, kind: 'bua', mon: true, pid: p.pid, mark: p.mark, follow: m.id }); gone = true; break; }
        this.hit(m, p.dmg, h, { xpBonus: p.xpBonus });
        if (p.ret && p.back) p.hit.delete(m.id); // a returning pickaxe hits again
        if (--p.pierce < 0) { gone = true; break; }
      }
      if (gone) { this.proj.splice(i, 1); if (p.ret && h && !p.back) {} }
    }
  }
  shotTick() {
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i]; s.x += s.vx * DT; s.y += s.vy * DT;
      let gone = this.t > s.until || !hellFlyOk(this.A, s.x, s.y);
      for (const h of this.heroes.values()) { if (h.dead || h.out || hyp(h.x - s.x, h.y - s.y) > s.r + 0.4) continue; this.hurtHero(h, s.dmg, { type: 's:' + s.kind }); if (s.slow) { h.slowUntil = this.t + 1.5; h.slowK = 1 - s.slow; } gone = true; break; }
      if (gone) this.shots.splice(i, 1);
    }
  }
  zoneTick() {
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i], t = this.t;
      if (z.follow) { const f = this.mons.get(z.follow); if (f) { z.x = f.x; z.y = f.y; } }
      if (t < z.at) continue;
      if (!z.fired) {
        z.fired = true;
        if (z.dmg && z.hero) for (const h of this.heroes.values()) if (!h.dead && !h.out && hyp(h.x - z.x, h.y - z.y) < z.r + 0.3) { this.hurtHero(h, z.dmg, { type: 'z:' + z.kind }); if (z.stun) h.stunUntil = t + z.stun; }
        if (z.mon) { const h = this.heroes.get(z.pid); for (const m of this.near(z.x, z.y, z.r)) { this.hit(m, z.dmg, h, { aoe: true, stun: z.stun, slow: z.slow, knock: z.knock }); if (z.knock) this.knock(m, z.kx ?? z.x, z.ky ?? z.y, z.knock); } if (z.mark) this.zones.push({ id: this.nextId++, x: z.x, y: z.y, r: z.r, at: t, until: t + 2, kind: 'mark', markZone: true }); this.ev({ k: 'boom', x: +z.x.toFixed(1), y: +z.y.toFixed(1), r: z.r, c: z.kind }); }
        else if (z.dmg) this.ev({ k: 'boom', x: +z.x.toFixed(1), y: +z.y.toFixed(1), r: z.r, c: z.kind });
        if (z.fire) { z.until = t + z.fire; z.dps = z.dmg * 0.15; }
        if (z.pull) { z.until = t + 2; }
      }
      if (z.dps && this.tick % 10 === 0) {
        if (z.hero) for (const h of this.heroes.values()) if (!h.dead && !h.out && hyp(h.x - z.x, h.y - z.y) < z.r + 0.2) this.hurtHero(h, z.dps * 0.5, { type: 'z:' + z.kind });
      }
      if (z.markZone) for (const m of this.near(z.x, z.y, z.r)) { m.mark = t + 0.3; m.slowUntil = Math.max(m.slowUntil, t + 0.3); }
      if (z.pull && t < z.until) for (const m of this.near(z.x, z.y, z.pull)) { if (m.boss || m.elite) continue; const a = Math.atan2(z.y - m.y, z.x - m.x); this.moveEnt(m, Math.cos(a) * 4 * DT, Math.sin(a) * 4 * DT, true); }
      if (z.pull && t >= z.until) { const h = this.heroes.get(z.pid); for (const m of this.near(z.x, z.y, z.pull)) this.hit(m, z.boomDmg, h, { aoe: true }); this.ev({ k: 'boom', x: +z.x.toFixed(1), y: +z.y.toFixed(1), r: z.pull, c: 'holo' }); }
      if (!z.until || t >= z.until) this.zones.splice(i, 1);
    }
  }
  gemTick() {
    if (this.tick % 20 === 0) this.gems = this.gems.filter((g) => !g.heart || g.heart > this.t);
    for (const h of this.heroes.values()) {
      if (h.dead || h.out) continue;
      const R = h.pick, petPick = this.sk(h, 'linh-khe')?.pick && h.pet;
      for (let i = this.gems.length - 1; i >= 0; i--) {
        const g = this.gems[i], d = hyp(g.x - h.x, g.y - h.y), dp = petPick ? hyp(g.x - h.pet.x, g.y - h.pet.y) : 99;
        if (d > R && dp > 1.2 && !g.vac) continue;
        if (d > 0.5) { const a = Math.atan2(h.y - g.y, h.x - g.x), s = Math.min(d, 14 * DT); g.x += Math.cos(a) * s; g.y += Math.sin(a) * s; g.vac = true; continue; }
        this.gems.splice(i, 1);
        if (g.heart) { h.hp = h.maxHp; if (h.pet) { h.pet.hp = h.pet.maxHp; h.pet.rest = 0; } this.ev({ k: 'heal', pid: h.pid }); continue; }
        const each = this.n > 1 ? (g.v * 0.3) / partyN(this.n) : g.v; // party: every member gets a share (≈ solo pace, the crowd is bigger)
        if (this.n > 1) { for (const q of this.heroes.values()) this.gainXp(q, each); } else this.gainXp(h, each);
      }
    }
  }
  // ---------------------------------------------------------------- skills
  /** fire skill `id` for hero h; returns its cooldown (s) or 0 when nothing to do */
  fire(h, id) {
    const P = this.sk(h, id), t = this.t, D = h.dmgK, A = h.areaK, ex = h.extra;
    const face = h.face;
    const near = (r) => this.nearMon(h.x, h.y, r);
    const ev = (o) => this.ev({ k: 'sk', s: id, pid: h.pid, x: +h.x.toFixed(2), y: +h.y.toFixed(2), ...o });
    switch (id) {
      case 'w-thach-lam': {
        const tg = near(P.range * A + 1); if (!tg) return 0.2;
        const a = Math.atan2(tg.y - h.y, tg.x - h.x); h.face = a;
        const arcs = P.back ? [a, a + Math.PI] : [a];
        for (const aa of arcs) for (const m of this.near(h.x, h.y, P.range * A)) if (angDiff(Math.atan2(m.y - h.y, m.x - h.x), aa) < (P.arc / 2) * Math.PI / 180) { this.hit(m, P.dmg * D, h); if (P.push) this.knock(m, h.x, h.y, 0.8); }
        ev({ a: +a.toFixed(2), r: P.range * A, back: P.back ? 1 : 0 });
        return P.cd;
      }
      case 'w-kim-ha': {
        const n = P.n + ex, tg = near(8); const a0 = tg ? Math.atan2(tg.y - h.y, tg.x - h.x) : face;
        for (let k = 0; k < n; k++) { const a = a0 + (k - (n - 1) / 2) * 0.5; this.proj.push({ id: this.nextId++, pid: h.pid, kind: 'cuoc', x: h.x, y: h.y, ox: h.x, oy: h.y, vx: Math.cos(a) * P.spd, vy: Math.sin(a) * P.spd, r: 0.6, dmg: P.dmg * D, pierce: 999, ret: true, range: P.range * A, until: t + 4, hit: new Set(), xpBonus: P.xpBonus }); }
        return P.cd;
      }
      case 'w-phong-vu': {
        const tg = near(P.len * A + 1); const a0 = tg ? Math.atan2(tg.y - h.y, tg.x - h.x) : face;
        const n = P.n + ex;
        for (let k = 0; k < n; k++) { const a = a0 + (k - (n - 1) / 2) * 0.35; this.lineMon(h, a, P.len * A, P.w ?? 0.7, P.dmg * D); ev({ a: +a.toFixed(2), len: P.len * A }); }
        return tg ? P.cd : 0.2;
      }
      case 'w-lam-nguyet': {
        const tg = near(10); if (!tg) return 0.2;
        for (let k = 0; k < P.n + ex; k++) { const a = Math.atan2(tg.y - h.y, tg.x - h.x) + (k - (P.n - 1) / 2) * 0.4; this.proj.push({ id: this.nextId++, pid: h.pid, kind: 'sao', x: h.x, y: h.y, vx: Math.cos(a) * 9, vy: Math.sin(a) * 9, r: 0.5, dmg: P.dmg * D, pierce: 0, aoe: P.aoe * A, home: true, until: t + 2.5, hit: new Set(), fx: 'star', pierceShield: P.pierceShield }); }
        return P.cd;
      }
      case 'w-hoa-ky': {
        const tg = near(P.len * A + 1); if (!tg) return 0.2;
        const sides = P.both ? [1, -1] : [1];
        const a0 = Math.atan2(tg.y - h.y, tg.x - h.x);
        for (const s of sides) { const a = s > 0 ? a0 : a0 + Math.PI; for (const m of this.lineList(h.x, h.y, a, P.len * A, P.w ?? 1.1)) this.hit(m, P.dmg * D, h, { burn: P.burn * D, burst: P.burst }); ev({ a: +a.toFixed(2), len: P.len * A }); }
        return P.cd;
      }
      case 'luoi-liem': { // the blades live in auraTick; this just toggles them
        h.liemOn = !h.liemOn || P.off === 0; h.liemSince = t;
        return h.liemOn ? P.on * A : P.off;
      }
      case 'loi-cham': {
        const bolts = P.bolts;
        let any = false;
        for (let b = 0; b < bolts; b++) {
          let cur = this.nearMon(h.x, h.y, P.range, (m) => !m.zapT || m.zapT < t); if (!cur) break; any = true;
          const pts = [[+h.x.toFixed(1), +h.y.toFixed(1)]], hitSet = new Set();
          for (let k = 0; k < P.jumps + ex && cur; k++) { hitSet.add(cur.id); cur.zapT = t + 0.1; pts.push([+cur.x.toFixed(1), +cur.y.toFixed(1)]); this.hit(cur, P.dmg * D, h); const c0 = cur; cur = this.nearMon(c0.x, c0.y, 3.5, (m) => !hitSet.has(m.id)); }
          this.ev({ k: 'zap', pid: h.pid, pts });
        }
        return any ? P.cd : 0.3;
      }
      case 'bua-tran-ta': return 99; // aura (auraTick)
      case 'phi-dao': {
        const tg = near(10); const a0 = tg ? Math.atan2(tg.y - h.y, tg.x - h.x) : face;
        const n = P.n + ex;
        for (let k = 0; k < n; k++) { const a = a0 + (k - (n - 1) / 2) * 0.18; this.proj.push({ id: this.nextId++, pid: h.pid, kind: 'dao', x: h.x, y: h.y, vx: Math.cos(a) * P.spd, vy: Math.sin(a) * P.spd, r: 0.4, dmg: P.dmg * D, pierce: P.pierce, until: t + 1.2, hit: new Set() }); }
        return P.cd;
      }
      case 'bang-tien': {
        const n = P.n + ex * 2;
        for (let k = 0; k < n; k++) { const tg = this.nearMon(h.x + (this.rand() - 0.5) * 10, h.y + (this.rand() - 0.5) * 10, 3) ?? null; const x = tg ? tg.x : h.x + (this.rand() - 0.5) * 12, y = tg ? tg.y : h.y + (this.rand() - 0.5) * 12; this.zones.push({ id: this.nextId++, x, y, r: P.aoe * A, at: t + 0.35, dmg: P.dmg * D, kind: 'ice', mon: true, pid: h.pid, slow: 1.5, stun: P.freeze }); this.ev({ k: 'sk', s: id, pid: h.pid, x: +x.toFixed(1), y: +y.toFixed(1) }); }
        return P.cd;
      }
      case 'chuong-dong': {
        if (!near(P.rad * A)) return 0.3;
        const ring = () => { for (const m of this.near(h.x, h.y, P.rad * A)) { this.hit(m, P.dmg * D, h, { aoe: true, stun: P.stun }); this.knock(m, h.x, h.y, 1.5); } ev({ r: P.rad * A }); };
        ring(); if (P.twice) this.later(0.5, ring);
        return P.cd;
      }
      case 'ngu-kiem': {
        const list = this.near(h.x, h.y, P.range).sort((a, b) => b.hp - a.hp); if (!list.length) return 0.3;
        for (let k = 0; k < P.n + ex; k++) { const tg = list[k % list.length], a = Math.atan2(tg.y - h.y, tg.x - h.x); this.proj.push({ id: this.nextId++, pid: h.pid, kind: 'kiem', x: h.x, y: h.y, ox: h.x, oy: h.y, vx: Math.cos(a) * 11, vy: Math.sin(a) * 11, r: 0.5, dmg: P.dmg * D, pierce: P.pierce, ret: true, range: P.range, until: t + 3, hit: new Set(), target: tg.id, home: true }); }
        return P.cd;
      }
      case 'dia-chan': {
        const tg = near(P.len * A); const a0 = tg ? Math.atan2(tg.y - h.y, tg.x - h.x) : face;
        for (let k = 0; k < P.n; k++) { const a = a0 + (k - (P.n - 1) / 2) * 0.45; ev({ a: +a.toFixed(2), len: P.len * A }); this.later(0.4, () => { for (const m of this.lineList(h.x, h.y, a, P.len * A, 0.9)) this.hit(m, P.dmg * D, h, { aoe: true, stun: 0.4 }); }); }
        return P.cd;
      }
      case 'ho-lo': {
        const list = this.near(h.x, h.y, 7); if (list.length < 3) return 0.5;
        for (let k = 0; k < P.n; k++) { const c = list[Math.floor(this.rand() * list.length)]; this.zones.push({ id: this.nextId++, x: c.x, y: c.y, r: P.rad * A, at: t, kind: 'holo', pid: h.pid, pull: P.rad * A, boomDmg: P.dmg * D }); this.ev({ k: 'sk', s: id, pid: h.pid, x: +c.x.toFixed(1), y: +c.y.toFixed(1), r: P.rad * A }); }
        return P.cd;
      }
      case 'quat-ba-tieu': {
        const tg = near(P.len * A); if (!tg) return 0.3;
        const a = Math.atan2(tg.y - h.y, tg.x - h.x), half = (P.arc / 2) * Math.PI / 180;
        for (const m of this.near(h.x, h.y, P.len * A)) if (angDiff(Math.atan2(m.y - h.y, m.x - h.x), a) < half) { this.hit(m, P.dmg * D * (P.blade ? 2 : 1), h, { aoe: true }); this.knock(m, h.x, h.y, 2); }
        this.shots = this.shots.filter((s) => !(hyp(s.x - h.x, s.y - h.y) < P.len * A && angDiff(Math.atan2(s.y - h.y, s.x - h.x), a) < half));
        ev({ a: +a.toFixed(2), len: P.len * A, arc: P.arc });
        return P.cd;
      }
      case 'thien-loi': {
        const list = this.near(h.x, h.y, 13).sort((a, b) => b.hp - a.hp); if (!list.length) return 0.4;
        for (let k = 0; k < Math.min(P.n, list.length); k++) { const tg = list[k]; this.hit(tg, P.dmg * D, h, { stun: P.stun }); for (const q of this.near(tg.x, tg.y, 1)) if (q !== tg) this.hit(q, 40 * D, h, { aoe: true }); this.ev({ k: 'sk', s: id, pid: h.pid, x: +tg.x.toFixed(1), y: +tg.y.toFixed(1) }); }
        return P.cd;
      }
      case 'la-bua': {
        if (!near(9)) return 0.3;
        for (let k = 0; k < P.n + ex; k++) { const a = this.rand() * Math.PI * 2; this.proj.push({ id: this.nextId++, pid: h.pid, kind: 'bua', x: h.x, y: h.y, vx: Math.cos(a) * 7, vy: Math.sin(a) * 7, r: 0.5, dmg: P.dmg * D, pierce: 0, stick: P.aoe * A, home: true, until: t + 3, hit: new Set(), mark: P.mark }); }
        return P.cd;
      }
      default: return 0;
    }
  }
  auraTick(h) {
    const t = this.t;
    const B = this.sk(h, 'bua-tran-ta');
    if (B && this.tick % 10 === 0) for (const m of this.near(h.x, h.y, B.rad * h.areaK)) { this.hit(m, B.dps * 0.5 * h.dmgK, h, { aoe: true }); m.slowUntil = Math.max(m.slowUntil, t + 0.6); if (B.push && this.tick % 40 === 0) this.knock(m, h.x, h.y, 0.6); }
    const L = this.sk(h, 'luoi-liem');
    if (L && h.liemOn) {
      const n = L.n + h.extra, R = L.rad * h.areaK;
      for (let k = 0; k < n; k++) {
        const a = t * 3.2 + (k / n) * Math.PI * 2, bx = h.x + Math.cos(a) * R, by = h.y + Math.sin(a) * R;
        for (const m of this.near(bx, by, 0.5)) { if ((m.liemHit ?? 0) > t) continue; m.liemHit = t + 0.45; this.hit(m, L.dmg * h.dmgK, h); }
      }
    }
  }
  inAura() { return null; }
  lineList(x, y, a, len, w) { const out = [], ca = Math.cos(a), sa = Math.sin(a); for (const m of this.near(x + ca * len / 2, y + sa * len / 2, len / 2 + 1)) { const px = m.x - x, py = m.y - y, al = px * ca + py * sa, side = Math.abs(-px * sa + py * ca); if (al > -0.3 && al < len && side < w + m.r) out.push(m); } return out; }
  lineMon(h, a, len, w, dmg) { for (const m of this.lineList(h.x, h.y, a, len, w)) this.hit(m, dmg, h); }
  ultimate(h) {
    if (h.dead || h.out || this.t < h.ultAt || h.cards) return;
    const U = HELL_ULT[h.heroType]; if (!U) return;
    h.ultAt = this.t + U.cd;
    const D = h.dmgK;
    switch (h.heroType) {
      case 'thach-lam': h.ult = 'shield'; h.ultUntil = this.t + 6; for (const m of this.near(h.x, h.y, 3)) this.knock(m, h.x, h.y, 2.5); break;
      case 'kim-ha': h.xp2Until = this.t + 8; for (const g of this.gems) if (hyp(g.x - h.x, g.y - h.y) < 30) g.vac = true; break;
      case 'phong-vu': h.ult = 'rush'; h.ultUntil = this.t + 5; break;
      case 'lam-nguyet': for (let k = 0; k < 12; k++) { const x = h.x + (this.rand() - 0.5) * 22, y = h.y + (this.rand() - 0.5) * 14; this.zones.push({ id: this.nextId++, x, y, r: 2, at: this.t + 0.4 + k * 0.08, dmg: 150 * D, kind: 'meteor', mon: true, pid: h.pid }); } break;
      case 'hoa-ky': { const tg = this.nearMon(h.x, h.y, 7), a = tg ? Math.atan2(tg.y - h.y, tg.x - h.x) : h.face; for (const m of this.near(h.x, h.y, 6)) if (angDiff(Math.atan2(m.y - h.y, m.x - h.x), a) < 0.6) { this.hit(m, 200 * D, h, { aoe: true }); m.atk *= 0.7; } this.ev({ k: 'ult', pid: h.pid, a: +a.toFixed(2) }); break; }
    }
    this.ev({ k: 'ult', pid: h.pid, hero: h.heroType, x: +h.x.toFixed(1), y: +h.y.toFixed(1) });
  }
  // ---------------------------------------------------------------- network
  /** the state for one viewer (10 / s) */
  view(pid) {
    const me = this.heroes.get(pid); if (!me) return null;
    const cx = me.dead || me.out ? (this.liveHeroes()[0]?.x ?? me.x) : me.x, cy = me.dead || me.out ? (this.liveHeroes()[0]?.y ?? me.y) : me.y;
    const inV = (x, y) => Math.abs(x - cx) < VIEW_X && Math.abs(y - cy) < VIEW_Y;
    const mons = [];
    for (const m of this.mons.values()) if (inV(m.x, m.y)) mons.push([m.id, MON_CODE[m.type], Math.round(m.x * 16), Math.round(m.y * 16), Math.max(0, Math.round((m.hp / m.maxHp) * 100)), m.act | 0, Math.round(((m.dir % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) * 10), m.size, m.state === 'arm' || m.state === 'warn' ? 1 : m.burrowed ? 2 : m.down ? 3 : 0]);
    const B = this.bossId && this.mons.get(this.bossId), elite = [...this.mons.values()].find((m) => m.elite);
    return {
      t: 'h', T: +this.t.toFixed(2), wave: this.wave, waves: this.mode.waves, phase: this.phase, paused: this.paused ? 1 : 0, exit: this.exitUntil > this.t ? +(this.exitUntil - this.t).toFixed(0) : 0,
      heroes: [...this.heroes.values()].map((h) => [h.pid, h.heroType, +h.x.toFixed(2), +h.y.toFixed(2), Math.round(h.hp), h.maxHp, +h.face.toFixed(2), h.moving ? 1 : 0, h.dead ? 1 : 0, h.out ? 1 : 0, h.lv, h.name, h.pet ? [h.pet.type, +h.pet.x.toFixed(2), +h.pet.y.toFixed(2), this.t - (h.pet.act ?? -9) < 0.3 ? 1 : 0] : null, h.liemOn ? [this.sk(h, 'luoi-liem').n + h.extra, +(this.sk(h, 'luoi-liem').rad * h.areaK).toFixed(2)] : null, this.sk(h, 'bua-tran-ta') ? +(this.sk(h, 'bua-tran-ta').rad * h.areaK).toFixed(2) : 0, h.ult && h.ultUntil > this.t ? h.ult : 0, Math.round(h.reviveT * 10)]),
      mons, gems: this.gems.filter((g) => inV(g.x, g.y)).map((g) => [g.id, +g.x.toFixed(1), +g.y.toFixed(1), g.heart ? 3 : g.v >= 20 ? 2 : g.v >= 5 ? 1 : 0]),
      shots: this.shots.filter((s) => inV(s.x, s.y)).map((s) => [s.id, +s.x.toFixed(2), +s.y.toFixed(2), s.kind]),
      zones: this.zones.filter((z) => inV(z.x, z.y) && z.kind !== 'mark').map((z) => [z.id, +z.x.toFixed(1), +z.y.toFixed(1), +z.r.toFixed(1), z.kind, z.at > this.t ? +(z.at - this.t).toFixed(1) : 0]),
      proj: this.proj.filter((p) => inV(p.x, p.y)).map((p) => [p.id, p.kind, +p.x.toFixed(2), +p.y.toFixed(2), +Math.atan2(p.vy, p.vx).toFixed(2)]),
      me: { lv: me.lv, xp: Math.floor(me.xp), need: hellXpNeed(me.lv), skills: me.skills, act: me.act, pas: me.pas, cards: me.cards, rerolls: me.rerolls, skips: me.skips, ult: Math.max(0, +(me.ultAt - this.t).toFixed(0)), kills: me.kills, earned: { gold: Math.round(me.earned.gold), soul: Math.round(me.earned.soul), items: me.earned.items.length }, out: me.out || 0, result: me.result ?? null },
      boss: B ? [B.type, Math.round(B.hp), Math.round(B.maxHp), B.name] : elite ? [elite.type, Math.round(elite.hp), Math.round(elite.maxHp), elite.name] : null,
    };
  }
}

/** all runs, ticked from the server loop */
export class HellManager {
  constructor() { this.runs = new Map(); this.next = 1; }
  start(mode, members, seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0) {
    const id = 'h' + this.next++;
    const run = new HellRun({ id, seed, mode, members });
    this.runs.set(id, run);
    return run;
  }
  update(onEnd) {
    for (const run of this.runs.values()) {
      run.update();
      if (run.over && !run.ended) { run.ended = true; run.endAt = Date.now(); onEnd(run); }
      if (run.ended && Date.now() - run.endAt > 60_000) this.runs.delete(run.id);
    }
  }
}

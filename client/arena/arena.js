// Đấu Trường Thú — turn-based 1v1 creature battle demo (16/11/2026).
// Art: client/arena/assets (built by tools/spriteimport/arena.mjs). Self-contained: no server, no game state.
const $ = (s) => document.querySelector(s);
const A = 'assets/';

// ------------------------------------------------------------------ data
const TYPE = {
  thuong: { n: 'Thường', c: '#9a9a86', row: 0 }, lua: { n: 'Lửa', c: '#ee7a30', row: 1 }, nuoc: { n: 'Nước', c: '#3f8ef0', row: 2 },
  co: { n: 'Cỏ', c: '#4cb84a', row: 3 }, doc: { n: 'Độc', c: '#a046c8', row: 4 }, dien: { n: 'Điện', c: '#e8b820', row: 5 },
};
const CHART = { lua: { co: 2, nuoc: 0.5, lua: 0.5 }, nuoc: { lua: 2, co: 0.5, nuoc: 0.5 }, co: { nuoc: 2, lua: 0.5, co: 0.5, doc: 0.5 }, doc: { co: 2, doc: 0.5 }, dien: { nuoc: 2, co: 0.5, dien: 0.5 } };
const effOf = (mt, types) => types.reduce((m, t) => m * (CHART[mt]?.[t] ?? 1), 1);
// kind: proj = flies from the user to the target, ground = on the target, self = on the user
const MOVES = {
  'than-hong': { n: 'Than Hồng', t: 'lua', p: 40, acc: 100, pp: 25, kind: 'proj', burn: 0.1 },
  'lua-xoay': { n: 'Lửa Xoáy', t: 'lua', p: 35, acc: 85, pp: 15, kind: 'ground', trap: true },
  'phun-lua': { n: 'Phun Lửa', t: 'lua', p: 90, acc: 100, pp: 15, kind: 'proj', burn: 0.1 },
  'dai-hoa-cau': { n: 'Đại Hỏa Cầu', t: 'lua', p: 110, acc: 85, pp: 5, kind: 'ground', burn: 0.1 },
  'voi-nuoc': { n: 'Vòi Nước', t: 'nuoc', p: 40, acc: 100, pp: 25, kind: 'proj' },
  'thu-minh': { n: 'Thu Mình', t: 'nuoc', p: 0, acc: 0, pp: 20, kind: 'self', defUp: 1 },
  'tia-bot-nuoc': { n: 'Tia Bọt Nước', t: 'nuoc', p: 65, acc: 100, pp: 20, kind: 'proj', slow: 0.1 },
  'phao-thuy-luc': { n: 'Pháo Thủy Lực', t: 'nuoc', p: 110, acc: 80, pp: 5, kind: 'proj' },
  'roi-day-leo': { n: 'Roi Dây Leo', t: 'co', p: 45, acc: 100, pp: 25, kind: 'proj' },
  'bot-doc': { n: 'Bột Độc', t: 'doc', p: 0, acc: 75, pp: 35, kind: 'ground', poison: 1 },
  'hat-hut-sinh-luc': { n: 'Hạt Hút Sinh Lực', t: 'co', p: 0, acc: 90, pp: 10, kind: 'ground', leech: true },
  'tia-mat-troi': { n: 'Tia Mặt Trời', t: 'co', p: 120, acc: 100, pp: 10, kind: 'proj', charge: true },
  'tia-dien-nho': { n: 'Tia Điện Nhỏ', t: 'dien', p: 40, acc: 100, pp: 30, kind: 'proj', par: 0.1 },
  'song-te-liet': { n: 'Sóng Tê Liệt', t: 'dien', p: 0, acc: 90, pp: 20, kind: 'ground', par: 1 },
  'loi-tien': { n: 'Lôi Tiễn', t: 'dien', p: 90, acc: 100, pp: 15, kind: 'proj', par: 0.1 },
  'thien-loi': { n: 'Thiên Lôi', t: 'dien', p: 110, acc: 70, pp: 10, kind: 'ground', par: 0.3 },
};
const LINES = {
  'ky-nhong': { names: ['Nhông Than', 'Kỳ Nhông Lửa', 'Hỏa Diệm Sơn'], types: ['lua'], base: { hp: 39, atk: 62, def: 45, spd: 65 }, moves: ['than-hong', 'lua-xoay', 'phun-lua', 'dai-hoa-cau'] },
  'rua-xoay': { names: ['Rùa Xoáy', 'Rùa San Hô', 'Đảo Quy'], types: ['nuoc'], base: { hp: 44, atk: 52, def: 65, spd: 43 }, moves: ['voi-nuoc', 'thu-minh', 'tia-bot-nuoc', 'phao-thuy-luc'] },
  'ech-sen': { names: ['Ếch Sen', 'Ếch Liên Hoa', 'Hiền Giả Sen'], types: ['co', 'doc'], base: { hp: 45, atk: 56, def: 50, spd: 45 }, moves: ['roi-day-leo', 'bot-doc', 'hat-hut-sinh-luc', 'tia-mat-troi'] },
  'soc-sam': { names: ['Sóc Sấm', 'Sóc Bay Sấm', 'Vua Bão'], types: ['dien'], base: { hp: 35, atk: 58, def: 40, spd: 90 }, moves: ['tia-dien-nho', 'song-te-liet', 'loi-tien', 'thien-loi'] },
};
function makeMon(line, stage, lv) {
  const L = LINES[line], k = [1, 1.3, 1.65][stage - 1];
  const st = (b) => Math.floor((b * k * 2 * lv) / 100) + 5;
  const hp = Math.floor(((L.base.hp * k * 2 * lv) / 100) * 1.8) + lv + 10; // ×1.8: a few more turns per fight
  return {
    line, stage, sheet: `${line}-${stage}`, name: L.names[stage - 1], types: L.types, lv, maxHp: hp, hp,
    atk: st(L.base.atk), def: st(L.base.def), spd: st(L.base.spd),
    moves: L.moves.slice(0, stage + 1).map((id) => ({ id, pp: MOVES[id].pp })),
    status: null, defSt: 0, spdSt: 0, trap: 0, leech: false, charging: null,
  };
}
const myTeam = () => [makeMon('ky-nhong', 2, 32), makeMon('rua-xoay', 3, 42), makeMon('ech-sen', 3, 40), makeMon('soc-sam', 2, 32)];
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
function wildMon() { const line = rnd(Object.keys(LINES)), stage = rnd([1, 2, 2, 3]); return makeMon(line, stage, [0, 26, 32, 40][stage] + Math.floor(Math.random() * 5)); }
const trainerTeam = () => [makeMon('ech-sen', 2, 31), makeMon('soc-sam', 3, 38), makeMon('ky-nhong', 3, 39)];

// ------------------------------------------------------------------ assets
const meta = await (await fetch(A + 'meta.json')).json();
const imgs = {};
const load = (k, f) => new Promise((ok) => { const i = new Image(); i.onload = () => { imgs[k] = i; ok(); }; i.onerror = ok; i.src = A + f; });
await Promise.all([
  ...Object.keys(meta.mons).map((k) => load(k, k + '.png')),
  ...Object.keys(meta.fx).map((k) => load('fx-' + k, 'fx-' + k + '.png')),
  load('trainer', 'trainer.png'),
]);

// ------------------------------------------------------------------ canvas + layout
const cv = $('#cv'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1, L = {}, bg = null;
function layout() {
  DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
  cv.width = W * DPR; cv.height = H * DPR;
  const portrait = H > W, AH = portrait ? H * 0.6 : H, base = portrait ? Math.min(W * 1.15, AH) : Math.min(H, W * 0.6);
  L = {
    portrait, AH, horizon: AH * 0.34,
    me: { x: W * (portrait ? 0.3 : 0.25), y: AH * (portrait ? 0.95 : 0.86), s: (base * 0.5) / 192 },
    foe: { x: W * (portrait ? 0.66 : 0.64), y: AH * (portrait ? 0.6 : 0.56), s: (base * 0.36) / 192 },
    tr: { x: W * (portrait ? 0.9 : 0.9), y: AH * (portrait ? 0.5 : 0.47), s: (base * 0.27) / 171 },
  };
  bg = drawBg();
}
// pixel-look arena: drawn at 1/3 size, scaled up without smoothing
function drawBg() {
  const k = 3, w = Math.ceil(W / k), h = Math.ceil(H / k), c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), hz = L.horizon / k, AH = L.AH / k;
  let seed = 7; const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let gr = g.createLinearGradient(0, 0, 0, hz); gr.addColorStop(0, '#5aa8e6'); gr.addColorStop(1, '#bfe3f6');
  g.fillStyle = gr; g.fillRect(0, 0, w, hz);
  // stands with a crowd
  const s0 = hz * 0.28;
  g.fillStyle = '#2a3150'; g.fillRect(0, s0, w, hz - s0);
  for (let y = s0 + 2; y < hz * 0.82; y += 3) for (let x = (y % 2) * 1.5; x < w; x += 3) { g.fillStyle = rnd(['#e8c48a', '#c98a5a', '#f2d6a8', '#7b8fd6', '#d95b5b', '#f2f2f2', '#5bb36e', '#2a3150', '#2a3150']); g.fillRect(x, y, 2, 2); }
  g.fillStyle = '#1d6a5a'; g.fillRect(0, hz * 0.82, w, hz * 0.18);
  for (let x = 0; x < w; x += 22) { g.fillStyle = '#e9f2ee'; g.fillRect(x + 4, hz * 0.86, 12, 2); g.fillStyle = '#f2c14e'; g.fillRect(x + 4, hz * 0.92, 6, 1); }
  // field with perspective stripes
  for (let i = 0, y = hz; y < AH; i++) { const hh = 2 + i * 1.6; g.fillStyle = i % 2 ? '#4fb648' : '#5cc452'; g.fillRect(0, y, w, hh + 1); y += hh; }
  g.fillStyle = '#5cc452'; if (AH < h) { g.fillStyle = '#0d1222'; g.fillRect(0, AH, w, h - AH); }
  g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1;
  g.beginPath(); g.ellipse(w * 0.5, hz + (AH - hz) * 0.42, w * 0.16, (AH - hz) * 0.12, 0, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(w * 0.36, hz); g.lineTo(w * 0.64, AH); g.stroke();
  g.beginPath(); g.moveTo(0, hz + (AH - hz) * 0.08); g.lineTo(w, hz + (AH - hz) * 0.08); g.stroke();
  // platforms
  for (const p of [L.me, L.foe]) {
    const rx = (p.s * 120) / k, ry = rx * 0.28, x = p.x / k, y = p.y / k;
    g.fillStyle = '#3c8f3a'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#a6e39a'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x, y + ry * 0.15, rx * 0.62, ry * 0.55, 0, 0, Math.PI * 2); g.fill();
  }
  return c;
}

// ------------------------------------------------------------------ battle state
let SPD = 1, AUTO = false, busy = false, mode = 'wild';
const S = { me: null, foe: null };
const mkSide = (team, pos, flip) => ({ team, i: 0, get mon() { return this.team[this.i]; }, pos, flip, anim: null, alpha: 1, glow: 0, glowC: '#fff', flash: 0, summon: 0 });
const fxs = [], floats = [];
let trainer = null; // { pose: 'idle' | 'hit' | 'win' }
const now = () => performance.now();
const wait = (ms) => new Promise((ok) => setTimeout(ok, ms / SPD));
const ROWS = { idle: [0, 4, 5, true], walk: [1, 4, 7, true], attack: [2, 4, 7, false], hurt: [3, 2, 9, false], faint: [3, 4, 7, false] };
function play(side, name, from = 0) {
  const [row, n, fps, loop] = ROWS[name];
  return new Promise((ok) => { side.anim = { row, f0: from, n, fps, loop, t0: now(), done: ok, name }; if (loop) ok(); });
}
function frameOf(side) {
  const a = side.anim; if (!a) return [0, 0];
  let f = Math.floor(((now() - a.t0) / 1000) * a.fps * SPD);
  if (a.loop) f = f % a.n;
  else if (f >= a.n - a.f0) {
    f = a.n - a.f0 - 1;
    if (a.done) { const d = a.done; a.done = null; setTimeout(d, 0); }
    if (a.name !== 'faint') { side.anim = { row: 0, f0: 0, n: 4, fps: 5, loop: true, t0: now() }; return [0, 0]; }
  }
  return [a.row, a.f0 + f];
}
/** an effect: frames play over `dur` ms; at = {x,y} target, from = {x,y} user (proj) */
function fx(id, opts) {
  const m = meta.fx[id]; const e = { id, m, t0: now(), dur: opts.dur ?? 700, ...opts }; fxs.push(e);
  return new Promise((ok) => { e.done = ok; });
}
const center = (side) => { const m = meta.mons[side.mon.sheet], s = side.pos.s; return { x: side.pos.x + (side.flip ? -1 : 1) * 0, y: side.pos.y - ((m.foot - m.top) * s) / 2, w: 120 * s, h: (m.foot - m.top) * s }; };

// ------------------------------------------------------------------ render
const tintCache = new Map();
function tinted(img, sx, sy, sw, sh, color) {
  const key = img.src + sx + ',' + sy + color; let c = tintCache.get(key);
  if (!c) { c = document.createElement('canvas'); c.width = sw; c.height = sh; const g = c.getContext('2d'); g.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh); g.globalCompositeOperation = 'source-in'; g.fillStyle = color; g.fillRect(0, 0, sw, sh); if (tintCache.size > 200) tintCache.clear(); tintCache.set(key, c); }
  return c;
}
function drawMon(side) {
  const mon = side.mon; if (!mon || side.alpha <= 0) return;
  const m = meta.mons[mon.sheet], img = imgs[mon.sheet]; if (!img) return;
  const [row, col] = frameOf(side), s = side.pos.s, C = m.cell;
  const sx = col * C, sy = row * C;
  ctx.save(); ctx.globalAlpha = side.alpha;
  ctx.translate(side.pos.x, side.pos.y);
  const sc = side.summon > 0 ? 1 - side.summon : 1;
  ctx.scale((side.flip ? -1 : 1) * sc, sc);
  const dx = -m.cx * s, dy = -m.foot * s;
  if (side.glow > now()) { // buff outline in the type colour
    const t = tinted(img, sx, sy, C, C, side.glowC), o = Math.max(2, s * 3);
    for (const [ox, oy] of [[-o, 0], [o, 0], [0, -o], [0, o]]) ctx.drawImage(t, dx + ox, dy + oy, C * s, C * s);
  }
  ctx.drawImage(img, sx, sy, C, C, dx, dy, C * s, C * s);
  if (side.flash > now()) { ctx.globalAlpha = 0.65 * side.alpha; ctx.drawImage(tinted(img, sx, sy, C, C, '#fff'), dx, dy, C * s, C * s); }
  ctx.restore();
}
function drawFx(e) {
  const m = e.m, img = imgs['fx-' + e.id]; if (!img) return;
  const p = Math.min(0.999, (now() - e.t0) / (e.dur / SPD)), n = e.frames ?? m.cols * m.rows;
  let f = e.loop ? Math.floor(((now() - e.t0) / 1000) * 10 * SPD) % (e.loopN ?? n) + (e.loopFrom ?? 0) : Math.floor(p * n);
  if (e.row != null) f = e.row * m.cols + Math.min(m.cols - 1, Math.floor(p * m.cols));
  const sx = (f % m.cols) * m.cw, sy = Math.floor(f / m.cols) * m.ch, [bx0, by0, bx1, by1] = m.box, bw = bx1 - bx0, bh = by1 - by0;
  ctx.save();
  if (e.kind === 'proj') {
    const dx = e.to.x - e.from.x, dy = e.to.y - e.from.y, dist = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), left = dx < 0;
    const kx = (dist * 1.02) / bw, ky = Math.min(kx, Math.max(1.1, e.thick ?? 1.6));
    ctx.translate(e.from.x, e.from.y);
    if (left) { ctx.scale(-1, 1); ctx.rotate(Math.PI - ang); } else ctx.rotate(ang);
    ctx.drawImage(img, sx + bx0, sy + by0, bw, bh, 0, -(bh / 2) * ky, bw * kx, bh * ky);
  } else { // ground / self / spark: box bottom-centre on the anchor, width = e.w
    const k = e.w / bw;
    ctx.translate(e.at.x, e.at.y);
    if (e.flip) ctx.scale(-1, 1);
    const yb = e.mid ? -(bh / 2) * k : -bh * k;
    ctx.drawImage(img, sx + bx0, sy + by0, bw, bh, -(bw / 2) * k, yb, bw * k, bh * k);
  }
  ctx.restore();
  if (!e.loop && p >= 0.999 && e.done) { const d = e.done; e.done = null; e.dead = true; d(); }
}
function drawTrainer() {
  if (!trainer) return;
  const t = meta.trainer, img = imgs.trainer, k = ['idle', 'hit', 'win'].indexOf(trainer.pose), s = L.tr.s;
  ctx.drawImage(img, k * t.cw, 0, t.cw, t.ch, L.tr.x - (t.cw / 2) * s, L.tr.y - t.ch * 0.95 * s, t.cw * s, t.ch * s);
}
function frame() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.imageSmoothingEnabled = false;
  if (bg) ctx.drawImage(bg, 0, 0, bg.width * 3, bg.height * 3);
  drawTrainer();
  // persistent trap rings under the trapped creature
  for (const side of [S.foe, S.me]) if (side?.mon?.trap > 0 && side.alpha > 0) {
    const c = center(side); drawFx({ id: 'lua-xoay', m: meta.fx['lua-xoay'], t0: 0, loop: true, loopFrom: 2, loopN: 4, kind: 'ground', at: { x: side.pos.x, y: side.pos.y + 4 }, w: c.w * 1.25 });
  }
  if (S.foe) drawMon(S.foe);
  if (S.me) drawMon(S.me);
  for (const e of fxs) drawFx(e);
  for (let i = fxs.length - 1; i >= 0; i--) if (fxs[i].dead) fxs.splice(i, 1);
  for (let i = floats.length - 1; i >= 0; i--) {
    const f = floats[i], t = (now() - f.t0) / (1100 / SPD); if (t >= 1) { floats.splice(i, 1); continue; }
    ctx.save(); ctx.globalAlpha = 1 - t * t; ctx.font = `900 ${f.size}px system-ui, sans-serif`; ctx.textAlign = 'center';
    ctx.lineWidth = 5; ctx.strokeStyle = '#1b1726'; ctx.strokeText(f.text, f.x, f.y - t * 40); ctx.fillStyle = f.c; ctx.fillText(f.text, f.x, f.y - t * 40); ctx.restore();
  }
  requestAnimationFrame(frame);
}
const float = (side, text, c = '#fff', size = 26) => { const p = center(side); floats.push({ text, c, size, x: p.x, y: p.y - p.h * 0.55, t0: now() }); };

// ------------------------------------------------------------------ UI
const msg = (t) => { $('#msg').textContent = t; };
async function say(t, ms = 900) { msg(t); await wait(ms); }
const hpColor = (r) => (r > 0.5 ? '#4cd964' : r > 0.2 ? '#f5c63c' : '#ef4b4b');
const chip = (t) => `<span class="chip" style="background:${TYPE[t].c}">${TYPE[t].n}</span>`;
const ST = { burn: ['Bỏng', '#e0602a'], poison: ['Độc', '#9b3fc4'], par: ['Tê liệt', '#c9a21a'] };
function card(el, side, mine) {
  const m = side.mon, r = m.hp / m.maxHp, st = m.status ? `<span class="st" style="background:${ST[m.status][1]}">${ST[m.status][0]}</span>` : '';
  const dots = mine || mode === 'trainer' ? `<div class="dots">${side.team.map((x) => `<b class="${x.hp <= 0 ? 'out' : ''}"></b>`).join('')}</div>` : '';
  el.innerHTML = `<div class="top">${m.name} ${m.types.map(chip).join(' ')} ${st}<span class="lv">Lv${m.lv}</span></div>
    <div class="bar"><i style="width:${r * 100}%;background:${hpColor(r)}"></i></div>
    ${mine ? `<div class="hpt"><span>${Math.max(0, m.hp)}/${m.maxHp}</span><span>${m.defSt > 0 ? '🛡+' + m.defSt : ''}</span></div>` : ''}${dots}`;
  el.classList.remove('hidden');
}
const cards = () => { card($('#ecard'), S.foe, false); card($('#pcard'), S.me, true); };
let tab = 'fight', forced = false;
function panel() {
  $('#panel').classList.remove('hidden');
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.t === tab));
  const b = $('#pbody'), me = S.me.mon, foe = S.foe.mon;
  if (tab === 'fight') {
    b.innerHTML = `<div class="moves">${[0, 1, 2, 3].map((i) => {
      const mv = me.moves[i]; if (!mv) return `<div class="mv" disabled style="background:#2a3354;opacity:.45"><div class="n">—</div></div>`;
      const M = MOVES[mv.id], e = M.p ? effOf(M.t, foe.types) : 1;
      const ef = !M.p ? '<span style="color:#e6eeff">Trạng thái</span>' : e > 1 ? '<span style="color:#b6ff9a">Hiệu quả cao!</span>' : e < 1 ? '<span style="color:#ffd0d0">Ít hiệu quả</span>' : 'Hiệu quả thường';
      return `<button class="mv" data-i="${i}" ${busy || mv.pp <= 0 || forced ? 'disabled' : ''} style="background:linear-gradient(${TYPE[M.t].c}, ${shade(TYPE[M.t].c)})">
        <div class="n">${M.n}</div><div class="pp">${M.p ? 'Sức mạnh ' + M.p + ' · ' : ''}PP ${mv.pp}/${M.pp}</div><div class="ef">${ef}</div></button>`;
    }).join('')}</div>`;
    b.querySelectorAll('.mv[data-i]').forEach((x) => (x.onclick = () => !x.disabled && turn({ move: +x.dataset.i })));
  } else if (tab === 'team') {
    b.innerHTML = `<div class="team">${S.me.team.map((m, i) => {
      const r = m.hp / m.maxHp, dis = busy && !forced ? true : m.hp <= 0 || i === S.me.i;
      return `<button class="mon ${i === S.me.i ? 'cur' : ''}" data-i="${i}" ${dis ? 'disabled' : ''}><div class="pic" style="background-image:url(${A}${m.sheet}.png)"></div>
        <div class="n">${m.name} · Lv${m.lv}</div><div class="bar"><i style="width:${Math.max(0, r) * 100}%;background:${hpColor(r)}"></i></div></button>`;
    }).join('')}</div>`;
    b.querySelectorAll('.mon').forEach((x) => (x.onclick = () => !x.disabled && (forced ? forcedPick(+x.dataset.i) : turn({ swap: +x.dataset.i }))));
  } else {
    b.innerHTML = `<div class="confirm">Đầu hàng sẽ tính là thua trận. <button class="btn red" id="yes-quit" ${busy ? 'disabled' : ''}>Đầu hàng</button><button class="btn" id="no-quit">Hủy</button></div>`;
    $('#yes-quit').onclick = () => !busy && finish('quit');
    $('#no-quit').onclick = () => { tab = 'fight'; panel(); };
  }
}
function shade(hex) { const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.round(v * 0.62)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
document.querySelectorAll('.tab').forEach((t) => (t.onclick = () => { if (forced && t.dataset.t !== 'team') return; tab = t.dataset.t; panel(); }));
$('#spd').onclick = () => { SPD = SPD === 1 ? 2 : 1; $('#spd').classList.toggle('on', SPD === 2); };
$('#auto').onclick = () => { AUTO = !AUTO; $('#auto').classList.toggle('on', AUTO); if (AUTO && !busy) autoStep(); };

// ------------------------------------------------------------------ battle logic
const speedOf = (m) => m.spd * (m.status === 'par' ? 0.5 : 1) * Math.max(0.25, 1 + 0.5 * m.spdSt);
function aiPick(mine, other) {
  if (mine.charging) return mine.moves.findIndex((x) => x.id === mine.charging);
  const sc = mine.moves.map((mv, i) => {
    if (mv.pp <= 0) return [i, 0];
    const M = MOVES[mv.id];
    if (!M.p) { const useful = (M.poison || M.par) ? !other.status : M.leech ? !other.leech : M.defUp ? mine.defSt < 2 : true; return [i, useful ? 45 : 2]; }
    return [i, M.p * effOf(M.t, other.types) * (mine.types.includes(M.t) ? 1.5 : 1) * (M.acc / 100)];
  });
  const tot = sc.reduce((a, [, v]) => a + v * v, 0); let r = Math.random() * tot;
  for (const [i, v] of sc) { r -= v * v; if (r <= 0) return i; }
  return sc.find(([, v]) => v > 0)?.[0] ?? 0;
}
async function turn(act) {
  if (busy) return; busy = true; panel();
  const me = S.me, foe = S.foe;
  const foeAct = { move: aiPick(foe.mon, me.mon) };
  if (act.swap != null) { await swapIn(me, act.swap, true); await useMove(foe, me, foeAct.move); }
  else {
    const first = speedOf(me.mon) >= speedOf(foe.mon) ? [[me, foe, act.move], [foe, me, foeAct.move]] : [[foe, me, foeAct.move], [me, foe, act.move]];
    for (const [a, d, i] of first) { if (a.mon.hp <= 0 || d.mon.hp <= 0) break; await useMove(a, d, i); }
  }
  if (await checkFaint()) return;
  for (const side of [me, foe]) await endOfTurn(side, side === me ? foe : me);
  if (await checkFaint()) return;
  busy = false; tab = 'fight'; msg(`${S.me.mon.name} muốn làm gì?`); panel();
  if (AUTO) autoStep();
}
async function autoStep() { await wait(500); if (!AUTO || busy || forced || !S.me) return; turn({ move: aiPick(S.me.mon, S.foe.mon) }); }

async function useMove(att, def, i) {
  const m = att.mon, mv = m.moves[i], M = MOVES[mv.id];
  if (m.status === 'par' && Math.random() < 0.25) { await play(att, 'hurt'); await say(`${m.name} bị tê liệt, không cử động được!`); return; }
  if (M.charge && m.charging !== mv.id) { // turn 1: soak up sunlight
    m.charging = mv.id; mv.pp--;
    att.glow = now() + 1300 / SPD; att.glowC = '#ffe066';
    await say(`${m.name} đang hấp thụ ánh nắng…`, 1300); return;
  }
  if (m.charging) m.charging = null; else mv.pp--;
  msg(`${m.name} dùng ${M.n}!`);
  const from = center(att), to = center(def);
  if (M.kind === 'self') {
    att.glow = now() + 1100 / SPD; att.glowC = TYPE[M.t].c;
    await fx(mv.id, { kind: 'self', at: { x: att.pos.x, y: att.pos.y + 6 }, w: from.w * 1.45, dur: 1100 });
  } else {
    const p = play(att, 'attack'); await wait(300);
    const mouth = { x: from.x + (att.flip ? -1 : 1) * from.w * 0.32, y: from.y - from.h * 0.05 };
    if (M.kind === 'proj') await fx(mv.id, { kind: 'proj', from: mouth, to, dur: 750, thick: M.p >= 90 ? 1.9 : 1.4 });
    else await fx(mv.id, { kind: 'ground', at: { x: def.pos.x, y: def.pos.y + 6 }, w: to.w * (mv.id === 'thien-loi' ? 1.0 : 1.35), dur: 850, flip: def.flip });
    await p;
  }
  if (M.acc && Math.random() * 100 >= M.acc) { await say(`${def.mon.name} né được!`); return; }
  if (M.defUp) { m.defSt = Math.min(6, m.defSt + M.defUp); cards(); await say(`Giáp của ${m.name} tăng lên!`); return; }
  if (M.p) {
    const e = effOf(M.t, def.mon.types), crit = Math.random() < 1 / 16;
    const atk = m.atk * (m.status === 'burn' ? 0.5 : 1), dfn = def.mon.def * Math.max(0.25, (2 + def.mon.defSt) / 2);
    let dmg = (((2 * m.lv) / 5 + 2) * M.p * (atk / dfn)) / 50 + 2;
    dmg = Math.max(1, Math.floor(dmg * (m.types.includes(M.t) ? 1.5 : 1) * e * (crit ? 1.5 : 1) * (0.85 + Math.random() * 0.15)));
    await hit(def, dmg, M.t, e > 1 ? '#b6ff9a' : e < 1 ? '#ffd0d0' : '#fff');
    if (crit) await say('Đòn chí mạng!', 700);
    if (e > 1) await say('Hiệu quả cao!', 750); else if (e < 1) await say('Ít hiệu quả…', 750);
  }
  const d = def.mon; if (d.hp <= 0) return;
  if (M.burn && !d.status && !d.types.includes('lua') && Math.random() < M.burn) { d.status = 'burn'; cards(); await say(`${d.name} bị bỏng!`); }
  if (M.par && !d.status && !d.types.includes('dien') && Math.random() < M.par) { d.status = 'par'; cards(); await say(`${d.name} bị tê liệt!`); }
  else if (M.par === 1 && d.status) await say('Không có tác dụng…');
  if (M.poison) { if (!d.status && !d.types.includes('doc')) { d.status = 'poison'; cards(); await say(`${d.name} bị trúng độc!`); } else await say('Không có tác dụng…'); }
  if (M.slow && Math.random() < M.slow) { d.spdSt = Math.max(-6, d.spdSt - 1); await say(`Tốc độ của ${d.name} giảm!`); }
  if (M.trap && !d.trap) { d.trap = 4 + Math.floor(Math.random() * 2); await say(`${d.name} bị vòng lửa giam lại!`); }
  if (M.leech) { if (!d.leech && !d.types.includes('co')) { d.leech = true; await say(`${d.name} bị gieo hạt hút sinh lực!`); } else await say('Không có tác dụng…'); }
}
async function hit(side, dmg, t, c = '#fff') {
  const p = center(side);
  side.flash = now() + 160 / SPD; play(side, 'hurt');
  fx('va-cham', { kind: 'ground', mid: true, row: TYPE[t].row, at: { x: p.x, y: p.y }, w: p.w * 0.9, dur: 420 });
  side.mon.hp = Math.max(0, side.mon.hp - dmg); float(side, '-' + dmg, c); cards();
  await wait(520);
}
async function endOfTurn(side, other) {
  const m = side.mon; if (!m || m.hp <= 0) return;
  const p = center(side);
  if (m.status === 'burn') { await hit(side, Math.max(1, Math.floor(m.maxHp / 16)), 'lua', '#ffb07a'); await say(`${m.name} bị bỏng hành hạ!`, 650); }
  if (m.hp > 0 && m.status === 'poison') { fx('bot-doc', { kind: 'ground', at: { x: side.pos.x, y: side.pos.y + 6 }, w: p.w, dur: 600, flip: side.flip }); await hit(side, Math.max(1, Math.floor(m.maxHp / 8)), 'doc', '#e0a0ff'); await say(`${m.name} bị độc ngấm!`, 650); }
  if (m.hp > 0 && m.trap > 0) { m.trap--; await hit(side, Math.max(1, Math.floor(m.maxHp / 8)), 'lua', '#ffb07a'); await say(m.trap ? `${m.name} bị vòng lửa thiêu đốt!` : `${m.name} thoát khỏi vòng lửa!`, 650); }
  if (m.hp > 0 && m.leech && other.mon.hp > 0) {
    const d = Math.max(1, Math.floor(m.maxHp / 8));
    fx('hat-hut-sinh-luc', { kind: 'ground', at: { x: side.pos.x, y: side.pos.y + 6 }, w: p.w * 0.9, dur: 700, flip: side.flip });
    await hit(side, d, 'co', '#b6ff9a');
    other.mon.hp = Math.min(other.mon.maxHp, other.mon.hp + d); float(other, '+' + d, '#7dffa0'); cards();
    await say(`Hạt hút sinh lực của ${m.name}!`, 650);
  }
}
async function checkFaint() {
  for (const side of [S.foe, S.me]) {
    if (side.mon.hp > 0) continue;
    await play(side, 'faint'); await say(`${side.mon.name}${side === S.foe && mode === 'wild' ? ' hoang' : ''} đã gục!`, 1000);
    await fade(side, 0);
    if (side === S.foe) {
      const next = side.team.findIndex((m) => m.hp > 0);
      if (next < 0) { finish('win'); return true; }
      trainer.pose = 'idle'; side.i = next; await say(`Lâm Nguyệt tung ra ${side.mon.name}!`, 700); await summon(side); cards();
    } else {
      if (!S.me.team.some((m) => m.hp > 0)) { finish('lose'); return true; }
      if (AUTO) { await swapIn(S.me, S.me.team.findIndex((m) => m.hp > 0), false); }
      else { forced = true; busy = false; tab = 'team'; msg('Chọn thú ra sân tiếp!'); panel(); return true; }
    }
  }
  return false;
}
async function forcedPick(i) { forced = false; busy = true; await swapIn(S.me, i, false); busy = false; tab = 'fight'; msg(`${S.me.mon.name} muốn làm gì?`); panel(); if (AUTO) autoStep(); }
const fade = (side, to) => new Promise((ok) => { const a0 = side.alpha, t0 = now(); const st = () => { const t = Math.min(1, (now() - t0) / (300 / SPD)); side.alpha = a0 + (to - a0) * t; t < 1 ? requestAnimationFrame(st) : ok(); }; st(); });
async function summon(side) {
  side.alpha = 1; side.summon = 1; side.flash = now() + 450 / SPD; play(side, 'idle');
  const m = side.mon; m.defSt = 0; m.spdSt = 0; m.trap = 0; m.leech = false; m.charging = null;
  const t0 = now(); await new Promise((ok) => { const st = () => { const t = Math.min(1, (now() - t0) / (380 / SPD)); side.summon = 1 - t; t < 1 ? requestAnimationFrame(st) : ok(); }; st(); });
}
async function swapIn(side, i, voluntary) {
  if (voluntary) { await say(`Quay về, ${side.mon.name}!`, 600); await fade(side, 0); }
  side.i = i; await say(`Tiến lên, ${side.mon.name}!`, 500); await summon(side); cards();
}
function finish(why) {
  busy = true; AUTO = false; $('#auto').classList.remove('on');
  if (trainer) trainer.pose = why === 'win' ? 'hit' : 'win';
  const T = { win: ['Thắng rồi!', mode === 'wild' ? `Bạn đã hạ thú hoang ${S.foe.mon.name}.` : 'Bạn đã đánh bại huấn luyện viên Lâm Nguyệt!'], lose: ['Thua rồi…', 'Cả đội đã gục. Luyện thêm rồi quay lại nhé!'], quit: ['Đã đầu hàng', 'Trận đấu kết thúc, tính là thua.'] }[why];
  msg(T[0]); $('#end-t').textContent = T[0]; $('#end-p').textContent = T[1];
  setTimeout(() => $('#end').classList.remove('hidden'), 700 / SPD);
}
async function start(m) {
  mode = m; $('#start').classList.add('hidden'); $('#end').classList.add('hidden'); $('#side').classList.remove('hidden');
  fxs.length = 0; forced = false; tab = 'fight'; busy = true;
  S.me = mkSide(myTeam(), L.me, false); S.foe = mkSide(m === 'wild' ? [wildMon()] : trainerTeam(), L.foe, true);
  S.me.alpha = 0; S.foe.alpha = 0; trainer = m === 'trainer' ? { pose: 'idle' } : null;
  $('#panel').classList.add('hidden'); $('#ecard').classList.add('hidden'); $('#pcard').classList.add('hidden');
  if (m === 'wild') { await summon(S.foe); await say(`Một ${S.foe.mon.name} hoang xuất hiện!`, 1000); }
  else { await say('Huấn luyện viên Lâm Nguyệt muốn thách đấu!', 1100); await say(`Lâm Nguyệt tung ra ${S.foe.mon.name}!`, 600); await summon(S.foe); }
  card($('#ecard'), S.foe, false);
  await say(`Tiến lên, ${S.me.mon.name}!`, 500); await summon(S.me); cards();
  busy = false; msg(`${S.me.mon.name} muốn làm gì?`); panel();
  if (AUTO) autoStep();
}
$('#go-wild').onclick = () => start('wild');
$('#go-trainer').onclick = () => start('trainer');
$('#again').onclick = () => { $('#end').classList.add('hidden'); $('#start').classList.remove('hidden'); };
addEventListener('resize', () => { layout(); if (S.me) { S.me.pos = L.me; S.foe.pos = L.foe; } });
layout(); requestAnimationFrame(frame);
window.__arena = { S, start, turn, set auto(v) { AUTO = v; $('#auto').classList.toggle('on', v); }, get busy() { return busy; }, get forced() { return forced; } };

// Canvas renderer: map chunks, mines, units, projectiles, effects.
import { S, now, serverNow, colorOf } from './state.js';
import { SPR, drawUnit, drawOutline, poseOf, typeOf, skinOf } from './sprites.js';
import { PETS, TIERS, CAMP_COLORS, CAPTURE_R, RES_INFO, GUARDS, HEROES, UNITS, BOSSES, BOSS_SCALE, TIER_INFO, SLOT_INFO, UNIT_ART_MAX, HOME_HEROES } from '/shared/balance.js';
import { pxImage, drawItemIcon } from './pxicons.js';
import { play, noteNonMelee, isMelee } from './audio.js';
import { drawBaseGround, pushBaseSprites, drawBaseSprite, drawBaseTop, drawKing, drawQueen } from './build.js';
import { B_TYPES } from '/shared/balance.js';
import { drawHellGate } from './hell.js';

// ---------------- hero skill effects (14/11/2026): art sheets client/assets/fx/<hero>.png, 8 frames per row (tools/spriteimport/fx.mjs)
const FXM = {};
fetch('/assets/fx/dir.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).then((j) => { for (const [k, m] of Object.entries(j)) { const im = new Image(); im.src = `/assets/fx/${k}.png?v=${m.v}`; FXM[k] = { ...m, im }; } }).catch(() => {});
/** draw frame fi of a row: wT = width in tiles, the anchor (ax of width, ay of height) at (x, y) */
function fxDraw(ctx, hero, row, fi, x, y, wT, z, alpha = 1, ay = 0.86, flip = false) {
  const M = FXM[hero]; if (!M || !M.im.complete || !M.im.naturalWidth || !M.rows[row]) return false;
  const [oy, h] = M.rows[row], dw = wT * T * z, dh = (dw * h) / M.w, f = Math.max(0, Math.min(7, fi | 0));
  ctx.globalAlpha = alpha;
  if (flip) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(M.im, f * M.w, oy, M.w, h, -dw / 2, y - dh * ay, dw, dh); ctx.restore(); }
  else ctx.drawImage(M.im, f * M.w, oy, M.w, h, x - dw / 2, y - dh * ay, dw, dh);
  ctx.globalAlpha = 1; return true;
}
// cast sequence [row, seconds, width in tiles, anchor y]; loop row while the skill lasts; end row when it stops; icon row
const SKFX = {
  'thach-lam': { seq: [[0, 0.55, 5.5, 0.9], [1, 0.6, 7.5, 0.8, 0.7]], loop: [2, 7.5, 0.8, 0.5], end: [3, 0.6, 7.5, 0.8], icon: 4 },
  'kim-ha': { seq: [[0, 1.1, 6, 0.9]], mine: [1, 4.5, 0.86, 0.9], end: [2, 0.8, 4.5, 0.86], icon: 3 },
  'phong-vu': { seq: [[0, 0.8, 6, 0.9]], loop: [1, 8, 0.6, 0.55], end: [2, 0.6, 8, 0.6], icon: 3 },
  'lam-nguyet': { seq: [[0, 0.5, 6.5, 0.6], [1, 0.5, 6.5, 0.86], [2, 0.7, 7.5, 0.82], [3, 0.9, 6.5, 0.8]], icon: 4 },
  'hoa-ky': { seq: [[0, 0.6, 6, 0.88], [1, 0.6, 6.5, 0.88], [2, 0.7, 11, 0.62]], loop: [3, 6, 0.7, 0.8], end: null, icon: 4 },
};
const SKON = new Map(); // hero unit id → [hero type, x, y] while its skill is on (to play the end row when it stops)
function drawSkillLoops(ctx, sx, sy, z, t) {
  const W = ctx.canvas.width, H = ctx.canvas.height, on = (x, y, m = 200) => x > -m && y > -m && x < W + m && y < H + m;
  const live = new Set();
  for (const h of S.view) {
    if (!(h.flags & 2) || !(h.flags & 64)) continue;
    const D = SKFX[h.type]; if (!D) continue;
    live.add(h.id); SKON.set(h.id, [h.type, h.x, h.y, h.owner]);
    const fr = Math.floor(t * 10) % 8;
    // the dome / wind ring sits on the middle of the army around the hero (not on the hero alone)
    let cx = h.x, cy = h.y, cn = 1;
    if (h.type === 'thach-lam' || h.type === 'phong-vu') for (const u of S.view) if (u.owner === h.owner && !(u.flags & 4) && !IS_B.has(u.type) && u !== h && Math.abs(u.x - h.x) < 7 && Math.abs(u.y - h.y) < 7) { cx += u.x; cy += u.y; cn++; }
    const hx = sx(cx / cn), hy = sy(cy / cn);
    if (D.loop && on(hx, hy)) fxDraw(ctx, h.type, D.loop[0], fr, hx, hy, D.loop[1], z, D.loop[3], D.loop[2]);
    const mine = (u) => u.owner === h.owner && !(u.flags & 4);
    if (h.type === 'thach-lam') for (const u of S.view) { if (!mine(u) || IS_B.has(u.type)) continue; const x = sx(u.x), y = sy(u.y); if (on(x, y, 40)) fxDraw(ctx, h.type, D.icon, (fr + u.id) % 8, x, y - 1.55 * T * z, 0.6, z, 0.85, 0.5); }
    if (h.type === 'phong-vu') for (const u of S.view) { if (!mine(u) || u.act !== 1 || IS_B.has(u.type)) continue; const x = sx(u.x), y = sy(u.y), d = u.dir ?? 0; if (on(x, y, 40)) fxDraw(ctx, h.type, D.icon, (fr + u.id) % 8, x, y, 1.6, z, 0.9, 0.75, d >= 1 && d <= 3); }
    if (h.type === 'hoa-ky') {
      const fl = S.view.filter((u) => u.owner === h.owner && (u.flags & 16));
      for (const u of fl) { const x = sx(u.x), y = sy(u.y); if (on(x, y)) fxDraw(ctx, h.type, D.loop[0], (fr + u.id) % 8, x, y, 2.6, z, 0.75, 0.8); }
      for (const e of S.view) { if (e.owner === h.owner || IS_B.has(e.type) || PETS[e.type]) continue;
        if (!fl.some((u) => Math.abs(u.x - e.x) < 5 && Math.abs(u.y - e.y) < 5 && Math.hypot(u.x - e.x, u.y - e.y) <= 5)) continue;
        const x = sx(e.x), y = sy(e.y); if (on(x, y, 40)) fxDraw(ctx, h.type, D.icon, (fr + e.id) % 8, x, y - 1.5 * T * z, 0.6, z, 0.95, 0.5); }
    }
    if (h.type === 'kim-ha') for (const m of S.mines) { if (m.owner !== h.owner) continue; const x = sx(m.x), y = sy(m.y); if (!on(x, y)) continue; fxDraw(ctx, h.type, D.mine[0], (fr + m.id) % 8, x, y + 0.6 * T * z, D.mine[1], z, D.mine[3], D.mine[2]); const k = ((t * 0.8 + m.id * 0.37) % 1); fxDraw(ctx, h.type, D.icon, Math.floor(t * 12 + m.id) % 8, x, y - (1.6 + k * 1.2) * T * z, 0.8, z, 1 - k * 0.8, 0.5); }
  }
  for (const [id, [type, x, y, owner]] of SKON) if (!live.has(id)) {
    SKON.delete(id); const D = SKFX[type]; if (!D?.end) continue;
    if (type === 'kim-ha') { for (const m of S.mines) if (m.owner === owner) S.fx.push({ kind: 'skend', sub: type, x: m.x, y: m.y + 0.6, t0: t, dur: D.end[1] }); }
    else S.fx.push({ kind: 'skend', sub: type, x, y, t0: t, dur: D.end[1] });
  }
}
const IS_B = new Set(B_TYPES); // structures are drawn from the base layout, not as units

const T = 16; // world px per tile
// click markers (assets/ui/click.png: 5 frames per kind)
const CLICK = { img: null, meta: null };
export async function loadClick(av = '') { try { CLICK.meta = await (await fetch('/assets/ui/click.json?v=' + av)).json(); const i = new Image(); i.src = '/assets/ui/click.png?v=' + av; await i.decode(); CLICK.img = i; } catch {} }
const CH = 512;
const chunks = new Map();
let overview = null;
export function initMap(seed) {
  overview = new Image(); overview.src = `/assets/map/${seed}/overview.png?v=${S.av ?? ''}`;
}
function chunk(cx, cy) {
  const k = cx + ',' + cy, lv = S.room?.mode === 'endless' ? S.chunkV?.[k] : null; // re-drawn after trees / rocks were cleared
  const src = lv ? `/live/${S.seed}/c_${cx}_${cy}.png?v=${lv}` : `/assets/map/${S.seed}/c_${cx}_${cy}.png?v=${S.av ?? ''}`;
  let c = chunks.get(k);
  if (!c || c.want !== src) {
    // keep showing the old picture until the new one has loaded (no flash)
    const n = new Image(); n.want = src; n.src = src;
    if (c?.complete && c.naturalWidth) { n.onload = () => chunks.set(k, n); c.want = src; } else { chunks.set(k, n); c = n; }
  }
  return c.complete && c.naturalWidth ? c : null;
}

// ------------------------------------------------------------ interpolation
export function interpolate() {
  const snaps = S.snaps;
  S.view = []; S.byId.clear();
  if (!snaps.length) return;
  const rt = serverNow() - 0.12;
  let b = snaps.length - 1;
  while (b > 0 && snaps[b - 1].t > rt) b--;
  const B = snaps[b], A = b > 0 ? snaps[b - 1] : null;
  const k = A ? Math.max(0, Math.min(1.2, (rt - A.t) / Math.max(0.01, B.t - A.t))) : 1;
  for (const [id, r] of B.units) {
    const a = A?.units.get(id);
    let x = r[3] / T, y = r[4] / T;
    if (a && Math.abs(a[3] - r[3]) < 64 && Math.abs(a[4] - r[4]) < 64) { x = (a[3] + (r[3] - a[3]) * k) / T; y = (a[4] + (r[4] - a[4]) * k) / T; }
    const u = { id, type: typeOf(r[1]), owner: r[2], x, y, hp: r[5], maxHp: r[6], dir: r[7], act: r[8], age: r[9] / 20 + Math.max(0, rt - B.t), flags: r[10], lv: r[11] ?? 1 };
    S.view.push(u); S.byId.set(id, u);
  }
}

// ------------------------------------------------------------ drawing
/** chat bubbles above heroes (12/11/2026): pixel box with a 2 px outline and a stepped tail, word-wrapped, drawn last */
export function drawBubbles(ctx) {
  const list = S.bubbleAt; S.bubbleAt = [];
  if (!list?.length) return;
  const fs = 14, lh = 17, maxW = 190, pad = 7;
  ctx.save(); ctx.font = `600 ${fs}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (const b of list) {
    // word wrap (long words are cut)
    const lines = []; let cur = '';
    for (const w of b.text.split(/\s+/)) {
      const tryL = cur ? cur + ' ' + w : w;
      if (ctx.measureText(tryL).width <= maxW) cur = tryL;
      else { if (cur) lines.push(cur); cur = w; while (ctx.measureText(cur).width > maxW) { let k = cur.length - 1; while (k > 1 && ctx.measureText(cur.slice(0, k)).width > maxW) k--; lines.push(cur.slice(0, k)); cur = cur.slice(k); } }
    }
    if (cur) lines.push(cur);
    if (lines.length > 5) { lines.length = 5; lines[4] += '…'; }
    const w = Math.ceil(Math.max(...lines.map((l) => ctx.measureText(l).width))) + pad * 2, h = lines.length * lh + pad * 2 - 3;
    const x = Math.round(b.x - w / 2), y = Math.round(b.y - h - 10);
    ctx.globalAlpha = b.k;
    // outline (dark), then fill (cream), clipped corners for the pixel look
    ctx.fillStyle = '#1b1726';
    ctx.fillRect(x + 2, y, w - 4, h); ctx.fillRect(x, y + 2, w, h - 4); ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(x + 4, y + 2, w - 8, h - 4); ctx.fillRect(x + 2, y + 4, w - 4, h - 8); ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
    // stepped tail pointing down to the hero
    const tx = Math.round(b.x) - 4;
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#1b1726'; ctx.fillRect(tx + i, y + h - 2 + i * 2, 10 - i * 2, 2); }
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#fffaf0'; ctx.fillRect(tx + 2 + i, y + h - 3 + i * 2, 6 - i * 2, 2); }
    ctx.fillStyle = '#2a2232';
    lines.forEach((l, i) => ctx.fillText(l, b.x, y + pad + i * lh - 1));
  }
  ctx.restore();
}
export function draw(ctx, W, H) {
  const { cam } = S, z = cam.z, s = z / 2;
  const t = now();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#1b1726'; ctx.fillRect(0, 0, W, H);
  const sx = (wx) => Math.round((wx * T - cam.x) * z), sy = (wy) => Math.round((wy * T - cam.y) * z);
  // map
  const x0 = Math.max(0, Math.floor(cam.x / CH)), y0 = Math.max(0, Math.floor(cam.y / CH));
  const x1 = Math.min(S.W * T / CH - 1, Math.floor((cam.x + W / z) / CH)), y1 = Math.min(S.H * T / CH - 1, Math.floor((cam.y + H / z) / CH));
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
    const img = chunk(cx, cy);
    const dx = Math.round((cx * CH - cam.x) * z), dy = Math.round((cy * CH - cam.y) * z);
    const dw = Math.round(((cx + 1) * CH - cam.x) * z) - dx, dh = Math.round(((cy + 1) * CH - cam.y) * z) - dy;
    if (img) ctx.drawImage(img, dx, dy, dw, dh);
    else if (overview?.complete) ctx.drawImage(overview, cx * 128, cy * 128, 128, 128, dx, dy, dw, dh);
  }
  const vis = (wx, wy, m = 4) => wx * T * z > cam.x * z - m * T * z && wy * T * z > cam.y * z - m * T * z && (wx * T - cam.x) * z < W + m * T * z && (wy * T - cam.y) * z < H + m * T * z;

  // "Về thành": blue rings rippling out from the hero while it channels
  if (S.alive && S.me?.rc > 0) {
    const h = S.byId.get(S.me.hero);
    if (h) for (let k = 0; k < 3; k++) {
      const ph = (t * 0.9 + k / 3) % 1, r = (0.6 + ph * 2.6) * T * z;
      ctx.strokeStyle = `rgba(90,176,255,${(1 - ph) * 0.9})`; ctx.lineWidth = Math.max(1, 2.5 * s * (1 - ph * 0.6));
      ctx.beginPath(); ctx.ellipse(sx(h.x), sy(h.y), r, r * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
  // ground layer: fire zones, capture rings, selection rings
  for (const f of S.fires) {
    const a = Math.max(0, Math.min(1, f.until - t));
    if (!vis(f.x, f.y)) continue;
    ctx.fillStyle = `rgba(255,${100 + Math.floor(Math.sin(t * 20 + f.x) * 40)},30,${0.28 * a})`;
    ctx.beginPath(); ctx.ellipse(sx(f.x), sy(f.y), f.r * T * z, f.r * T * z * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    for (let k = 0; k < 5; k++) { const ang = k * 1.3 + t * 3, rr = f.r * 0.6 * ((k * 37) % 10) / 10; ctx.fillStyle = k % 2 ? '#ffd23a' : '#ff6a1a'; ctx.fillRect(sx(f.x + Math.cos(ang) * rr) - z, sy(f.y + Math.sin(ang) * rr * 0.6) - 2 * z - ((t * 30 + k * 7) % 6) * z, 2 * z, 2 * z); }
  }
  for (const m of S.mines) {
    if (!vis(m.x, m.y)) continue;
    // protected mine (its owner died < 10 min ago): blue dome + countdown
    if (m.protect && m.protectAt > t) {
      const R = CAPTURE_R(m.type) * T * z;
      ctx.fillStyle = 'rgba(90,176,255,0.12)'; ctx.strokeStyle = 'rgba(122,208,255,0.75)'; ctx.lineWidth = Math.max(1, 1.5 * s);
      ctx.beginPath(); ctx.ellipse(sx(m.x), sy(m.y), R, R * 0.7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      const left = Math.max(0, m.protectAt - t), lbl = `🛡 ${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
      ctx.font = `600 ${Math.max(10, 6 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726';
      ctx.strokeText(lbl, sx(m.x), sy(m.y) - R * 0.7 - 4 * s); ctx.fillStyle = '#9adfff'; ctx.fillText(lbl, sx(m.x), sy(m.y) - R * 0.7 - 4 * s);
    }
    const sel = S.sel?.k === 'mine' && S.sel.id === m.id, hov = S.hover?.k === 'mine' && S.hover.id === m.id;
    if (m.capBy || sel || (hov && m.guards)) {
      const R = CAPTURE_R(m.type);
      ctx.save(); ctx.setLineDash([4 * s, 4 * s]); ctx.lineDashOffset = -t * 10;
      ctx.strokeStyle = m.capBy ? colorOf(m.capBy) : '#ffffffaa'; ctx.lineWidth = Math.max(1, s);
      ctx.beginPath(); ctx.ellipse(sx(m.x), sy(m.y), R * T * z, R * T * z, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }
  drawBaseGround(ctx, sx, sy, z, s, t, vis);
  if (S.sel?.k === 'unit') { const u = S.byId.get(S.sel.id); if (u) ring(ctx, sx(u.x), sy(u.y), s, '#ffffff', 1); }
  // monster camps: a wooden post with a level plaque (loot colour); cleared camps show when they come back
  for (const c of S.camps ?? []) {
    if (!vis(c.x, c.y, 3)) continue;
    const x = sx(c.x), y = sy(c.y), col = CAMP_COLORS[c.level];
    ctx.fillStyle = '#0005'; ctx.beginPath(); ctx.ellipse(x, y + 2 * z, 7 * z, 3 * z, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a2416'; ctx.fillRect(x - z, y - 18 * z, 2 * z, 20 * z);
    ctx.fillStyle = c.respawn ? '#4a4038' : '#7a4f2e'; ctx.fillRect(x - 9 * z, y - 22 * z, 18 * z, 9 * z);
    ctx.fillStyle = c.respawn ? '#666' : col; ctx.fillRect(x - 8 * z, y - 21 * z, 16 * z, 7 * z);
    ctx.font = `700 ${Math.max(9, 6 * z)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center';
    ctx.fillStyle = '#1b1726'; ctx.fillText(`Lv${c.level}`, x, y - 15.5 * z);
    if (c.respawn) { ctx.font = `${Math.max(9, 5 * z)}px "SWDigits", "Pixelify Sans", monospace`; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726'; const tx = `hồi sau ${Math.floor(c.respawn / 60)}:${String(c.respawn % 60).padStart(2, '0')}`; ctx.strokeText(tx, x, y - 25 * z); ctx.fillStyle = '#c8c4b0'; ctx.fillText(tx, x, y - 25 * z); }
  }
  // boss pedestals: carved stone ring with glowing runes
  // boss lairs (13/11/2026, client/assets/lairs): the boss stands in the middle of its lair; a dead boss leaves the dark
  // "-ha" picture until it comes back. Old stone ring while a picture is loading / missing.
  S.bossHome ??= {};
  for (const [type, , , hx, hy, id] of S.match?.bosses ?? []) {
    S.bossHome[type] = [hx, hy];
    if (!vis(hx, hy, 12)) continue;
    const b = S.byId.get(id), fight = b && b.act !== 0 && b.act !== 1;
    if (!drawLair(ctx, type, false, sx(hx), sy(hy), z)) pedestal(ctx, sx(hx), sy(hy), z, t, BOSS_GLOW[type] ?? '#9ff3ff', fight);
  }
  for (const [type, , rx, ry] of S.match?.respawn ?? []) {
    if (S.match?.bosses?.some((b) => b[0] === type)) continue;
    const h = rx ? [rx, ry] : S.bossHome[type]; if (!h || !vis(h[0], h[1], 12)) continue;
    drawLair(ctx, type, true, sx(h[0]), sy(h[1]), z);
  }
  // ground loot: light pillar + item icon
  for (const g of S.items) {
    if (!vis(g.x, g.y)) continue;
    const locked = g.owner && g.owner !== S.you;
    const c = locked ? '#8a8a8a' : TIER_INFO[g.item.tier].color, x = sx(g.x), y = sy(g.y);
    const tall = (14 + TIERS.indexOf(g.item.tier) * 6) * s;
    const gr = ctx.createLinearGradient(0, y - tall, 0, y);
    gr.addColorStop(0, c + '00'); gr.addColorStop(1, c + 'aa');
    ctx.fillStyle = gr; ctx.globalAlpha = 0.6 + Math.sin(t * 3 + g.id) * 0.25; ctx.fillRect(x - 5 * s, y - tall * 1.6, 10 * s, tall * 1.6); ctx.globalAlpha = 1;
    ctx.fillStyle = '#0006'; ctx.beginPath(); ctx.ellipse(x, y, 7 * s, 3 * s, 0, 0, 7); ctx.fill();
    const img = pxImage(g.item.slot, c), bob = Math.sin(t * 2.5 + g.id) * 1.5 * s;
    if (locked) ctx.globalAlpha = 0.55;
    if (!drawItemIcon(ctx, g.item.slot, g.item.tier, x - 13 * s, y - 28 * s + bob, 26 * s) && img.complete) ctx.drawImage(img, x - 12 * s, y - 26 * s + bob, 24 * s, 24 * s);
    ctx.globalAlpha = 1;
    if (locked) { ctx.fillStyle = '#1b1726'; ctx.fillRect(x + 4 * s, y - 10 * s, 8 * s, 7 * s); ctx.fillStyle = '#c8c4b0'; ctx.fillRect(x + 5 * s, y - 9 * s, 6 * s, 5 * s); ctx.strokeStyle = '#c8c4b0'; ctx.lineWidth = Math.max(1, s); ctx.beginPath(); ctx.arc(x + 8 * s, y - 10 * s, 2 * s, Math.PI, 0); ctx.stroke(); }
    if (S.hover?.k === 'item' && S.hover.id === g.id) {
      ctx.font = `600 ${Math.max(12, 6 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726';
      const label = locked ? `🔒 ${g.item.name} · của ${S.players.get(g.owner)?.name ?? '?'}` : g.item.name;
      ctx.strokeText(label, x, y - 30 * s); ctx.fillStyle = c; ctx.fillText(label, x, y - 30 * s);
    }
  }

  // y-sorted sprites: mines, units, corpses
  const list = [];
  for (const m of S.mines) if (vis(m.x, m.y, 5)) list.push([m.y + 1.2, 0, m]);
  for (const u of S.view) if (vis(u.x, u.y) && u.act !== 5 && !IS_B.has(u.type)) list.push([u.y, 1, u]);
  pushBaseSprites(list, vis);
  if (S.king && vis(S.king.x, S.king.y, 14)) list.push([S.king.y + 1.5, 4, S.king]);
  if (S.hellGate && vis(S.hellGate[0], S.hellGate[1], 14)) list.push([S.hellGate[1] + 4, 7, null]); // Cổng Địa Ngục (16/11/2026)
  if (S.queen && vis(S.queen.x, S.queen.y, 14)) list.push([S.queen.y + 1.5, 5, S.queen]);
  // Thú cưng (13/11/2026): a pet trots behind every hero that has one (positions smoothed here, nothing on the server)
  S.petPos ??= new Map();
  const heroOf = new Map(); for (const u of S.view) if (HEROES[u.type] && u.act !== 5) heroOf.set(u.owner, u);
  for (const pl of S.players?.values() ?? []) {
    if (!pl.pet || !pl.alive) { S.petPos.delete(pl.id); continue; }
    const h = heroOf.get(pl.id); if (!h) continue;
    if (S.view.some((u) => u.owner === pl.id && PETS[u.type] && u.act !== 5)) continue; // turned big: the battle unit is drawn instead
    let q = S.petPos.get(pl.id); if (!q) { q = { x: h.x - 1, y: h.y + 0.6, dir: 1, side: 1, hx: h.x, f: 0 }; S.petPos.set(pl.id, q); }
    // the pet stays BEHIND the hero: the side follows the hero's walking direction (not the pet's own facing, which
    // made it hop from side to side forever when the hero stood still — 13/11/2026)
    const mx = h.x - (q.hx ?? h.x); q.hx = h.x; if (Math.abs(mx) > 0.01) q.side = mx > 0 ? 1 : -1;
    const tx = h.x - 2.1 * (q.side || 1), ty = h.y + 0.9, dx = tx - q.x, dy = ty - q.y, d = Math.hypot(dx, dy);
    q.moving = false;
    if (d > 8) { q.x = tx; q.y = ty; } else if (d > 0.15) { q.x += dx * 0.12; q.y += dy * 0.12; q.f += d * 0.6; q.moving = d > 0.3; }
    if (h.act === 1 && d > 0.05) q.moving = true; // the hero walks: the pet walks too (it trails close behind, so d alone said 'idle' — 13/11/2026)
    q.dir = q.moving && Math.abs(dx) > 0.3 ? (dx > 0 ? 1 : -1) : q.side || 1; // running: face the way it runs; else look where the hero goes
    q.d8 = q.moving ? (d > 0.3 ? dir8(dx, dy) : h.dir ?? 0) : h.act === 1 || q.d8 == null ? h.dir ?? 0 : q.d8; // 8-way sheets (13/11/2026): the way it runs, else the hero's facing
    q.id = pl.pet;
    if (vis(q.x, q.y)) list.push([q.y, 6, q]);
  }
  for (const c of S.corpses) if (vis(c.x, c.y)) list.push([c.y - 0.5, 2, c]);
  list.sort((a, b) => a[0] - b[0]);
  for (const [, kind, o] of list) {
    if (kind === 0) drawMine(ctx, o, sx, sy, z, t);
    else if (kind === 1) drawOne(ctx, o, sx(o.x), sy(o.y), s, t);
    else if (kind === 3) drawBaseSprite(ctx, o, sx, sy, z, s, t);
    else if (kind === 4) drawKing(ctx, sx, sy, z, s, t);
    else if (kind === 5) drawQueen(ctx, sx, sy, z, s, t);
    else if (kind === 6) drawPet(ctx, o, sx(o.x), sy(o.y), s, t);
    else if (kind === 7) drawHellGate(ctx, sx, sy, s, t, S.hellGate[0], S.hellGate[1]);
    else drawCorpse(ctx, o, sx(o.x), sy(o.y), s, t);
  }
  // moving a mine: 12-tile ring around its original spot + a ghost under the cursor (green = ok, red = not here)
  if (S.mineMove && S.mines[S.mineMove.id] && window.__mineMoveCheck) {
    const m = S.mines[S.mineMove.id], w = { x: (S.mouse.x / z + S.cam.x) / T, y: (S.mouse.y / z + S.cam.y) / T }, c = window.__mineMoveCheck(m, w);
    ctx.save(); ctx.setLineDash([5 * s, 4 * s]); ctx.lineDashOffset = -t * 6; ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = Math.max(1, s * 1.5);
    ctx.beginPath(); ctx.ellipse(sx(m.ox), sy(m.oy), 12 * T * z, 12 * T * z, 0, 0, 7); ctx.stroke(); ctx.restore();
    ctx.globalAlpha = 0.6; drawMine(ctx, { ...m, x: c.cx, y: c.cy, moveT: 0, owner: 0, lv: m.lv, upAt: 0 }, sx, sy, z, t); ctx.globalAlpha = 1;
    ctx.strokeStyle = c.err ? '#ff4a4a' : '#3ee06b'; ctx.lineWidth = Math.max(2, s * 1.5); ctx.beginPath(); ctx.ellipse(sx(c.cx), sy(c.cy), CAPTURE_R(m.type) * T * z, CAPTURE_R(m.type) * T * z * 0.6, 0, 0, 7); ctx.stroke();
    if (c.err) { ctx.font = `600 ${Math.max(11, 6 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726'; ctx.strokeText(c.err, sx(c.cx), sy(c.cy) + 30 * s); ctx.fillStyle = '#ff8a8a'; ctx.fillText(c.err, sx(c.cx), sy(c.cy) + 30 * s); }
  }
  // projectiles
  for (let i = S.projs.length - 1; i >= 0; i--) {
    const p = S.projs[i], k = (t - p.t0) / p.dur;
    if (k >= 1) { S.projs.splice(i, 1); continue; }
    const x = p.x + (p.x1 - p.x) * k, y = p.y + (p.y1 - p.y) * k;
    const arc = p.kind === 'fireball' || p.kind === 'rock' ? Math.sin(k * Math.PI) * 2.5 : p.kind === 'arrow' ? Math.sin(k * Math.PI) * 0.6 : 0;
    const px = sx(x), py = sy(y) - arc * T * z - 14 * s;
    if (p.kind === 'arrow') {
      const ang = Math.atan2((p.y1 - p.y) * T - Math.cos(k * Math.PI) * 0.6 * T * 2, (p.x1 - p.x) * T);
      ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = Math.max(1, s); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - Math.cos(ang) * 8 * s, py - Math.sin(ang) * 8 * s); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(px - s, py - s, 2 * s, 2 * s);
    } else if (p.kind === 'orb' || p.kind === 'star') {
      const c = p.kind === 'orb' ? ['#3ab0ff', '#c8f0ff'] : ['#8a7aff', '#ffffff'];
      glow(ctx, px, py, 7 * s, c[0]); ctx.fillStyle = c[1]; ctx.fillRect(px - 2 * s, py - 2 * s, 4 * s, 4 * s);
    } else if (p.kind === 'rock') {
      ctx.fillStyle = '#0004'; ctx.beginPath(); ctx.ellipse(sx(x), sy(y), 3 * s, 1.5 * s, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#5a5a62'; ctx.beginPath(); ctx.arc(px, py, 3.5 * s, 0, 7); ctx.fill(); ctx.fillStyle = '#9a9aa4'; ctx.fillRect(px - 1.5 * s, py - 2.5 * s, 2 * s, 2 * s);
    } else if (p.kind === 'fireball') {
      glow(ctx, px, py, 9 * s, '#ff6a1a'); ctx.fillStyle = '#4a2a1a'; ctx.beginPath(); ctx.arc(px, py, 3.5 * s, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd23a'; ctx.fillRect(px - 1.5 * s, py - 3 * s, 3 * s, 2 * s);
    }
  }
  drawSkillLoops(ctx, sx, sy, z, t);
  // effects
  for (let i = S.fx.length - 1; i >= 0; i--) {
    const f = S.fx[i], k = (t - f.t0) / f.dur;
    if (k >= 1) { S.fx.splice(i, 1); continue; }
    if (k < 0) continue;
    drawFx(ctx, f, k, sx, sy, z, s, t);
  }
  drawOverlay(ctx, W, H, sx, sy, z, t);
  // HP bars + names on top
  for (const u of S.view) {
    if (!vis(u.x, u.y) || u.act === 5 || IS_B.has(u.type)) continue;
    const hero = u.flags & 2, hurt = u.hp < u.maxHp;
    if (BOSSES[u.type] && u.lv) { // boss level tag, always shown
      const ly = sy(u.y) - 280 * s; ctx.font = `700 ${Math.max(12, 7 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726';
      const txt = `${BOSSES[u.type].name} · cấp ${u.lv}`; ctx.strokeText(txt, sx(u.x), ly); ctx.fillStyle = ['#f0c030', '#f0c030', '#ffa040', '#ffa040', '#ff7040', '#ff5050', '#ff4aa0', '#c070ff'][u.lv - 1] ?? '#f0c030'; ctx.fillText(txt, sx(u.x), ly);
    }
    { const am = UNIT_ART_MAX[u.type]; if (am && u.lv > am && z >= 1.5) { // Tinh luyện ★ (16/11/2026)
      const n = u.lv - am, yy = sy(u.y) - (UNITS[u.type]?.slots >= 2 ? 64 : 42) * s; ctx.fillStyle = '#ffd23a'; ctx.strokeStyle = '#1b1726'; ctx.lineWidth = Math.max(1, s * 0.6);
      for (let i = 0; i < n; i++) { const cx = sx(u.x) + (i - (n - 1) / 2) * 5 * s; ctx.beginPath(); for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, rr = (j % 2 ? 1 : 2.4) * s; ctx.lineTo(cx + Math.cos(a) * rr, yy + Math.sin(a) * rr); } ctx.closePath(); ctx.stroke(); ctx.fill(); } } }
    if (HOME_HEROES[u.type]) { // Vua Thành / Nữ hoàng Băng: name tag like a boss, smaller
      const ly = sy(u.y) - 62 * s; ctx.font = `700 ${Math.max(11, 6 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726';
      const txt = `${HOME_HEROES[u.type].name} · cấp ${u.lv}`; ctx.strokeText(txt, sx(u.x), ly); ctx.fillStyle = '#ffd070'; ctx.fillText(txt, sx(u.x), ly);
    }
    if (!hurt && !hero && !(S.me?.combat && u.owner === S.you)) continue;
    const big = UNITS[u.type]?.slots >= 2 || GUARDS[u.type]?.scale > 1, boss = !!BOSSES[u.type];
    const w = (boss ? 90 : hero ? 22 : big ? 20 : 12) * s, h = Math.max(2, (boss ? 5 : hero ? 3 : 2) * s);
    const x = sx(u.x) - w / 2, y = sy(u.y) - (boss ? 270 : hero ? 56 : big ? (u.type === 'rong' ? 92 : 70) : 48) * s;
    ctx.fillStyle = '#1b1726'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = u.owner === S.you ? '#3ee06b' : u.owner ? '#ff4a4a' : '#f0c030';
    ctx.fillRect(x, y, Math.max(1, (w * u.hp) / u.maxHp), h);
    if (hero) {
      const p = S.players.get(u.owner);
      { const bu = S.bubbles?.get(u.owner); if (bu && bu.until > t) (S.bubbleAt ??= []).push({ text: bu.text, x: sx(u.x), y: y - (p?.title ? 18 : 12) * s, k: Math.min(1, (bu.until - t) / 0.4) }); }
      if (p && !(S.mobile && p.id === S.you)) { ctx.font = `600 ${Math.max(12, 7 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726'; ctx.strokeText(p.name, sx(u.x), y - 4 * s); ctx.fillStyle = p.id === S.you ? '#ffffff' : p.color; ctx.fillText(p.name, sx(u.x), y - 4 * s);
        if (p.title) { ctx.font = `600 ${Math.max(10, 5.5 * s)}px "SWDigits", "Pixelify Sans", monospace`; ctx.lineWidth = 3; ctx.strokeText(`« ${p.title} »`, sx(u.x), y - 11 * s); ctx.fillStyle = '#ffd070'; ctx.fillText(`« ${p.title} »`, sx(u.x), y - 11 * s); } }
      if (u.flags & 1) { ctx.strokeStyle = '#9fe8ff'; ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.2; ctx.lineWidth = s; ctx.beginPath(); ctx.ellipse(sx(u.x), sy(u.y) - 20 * s, 18 * s, 26 * s, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    }
  }
  drawBaseTop(ctx, sx, sy, z, s, t, vis);
  // floating texts
  ctx.textAlign = 'center';
  for (let i = S.texts.length - 1; i >= 0; i--) {
    const f = S.texts[i], k = (t - f.t0) / f.dur;
    if (k >= 1) { S.texts.splice(i, 1); continue; }
    const size = Math.max(9, (f.big ? 8 : 6) * s);
    ctx.font = `bold ${size}px "SWDigits", "Pixelify Sans", monospace`;
    ctx.globalAlpha = 1 - k * k;
    const x = sx(f.x), y = sy(f.y) - (40 + k * 18) * s;
    ctx.fillStyle = '#1b1726'; ctx.fillText(f.s, x + 1, y + 1); ctx.fillStyle = f.c; ctx.fillText(f.s, x, y);
    ctx.globalAlpha = 1;
  }
  // order marks + own path
  if (S.me?.path && !S.joyActive && S.byId.get(S.me.hero)) {
    const h = S.byId.get(S.me.hero);
    ctx.save(); ctx.setLineDash([2 * s, 4 * s]); ctx.strokeStyle = '#ffffff55'; ctx.lineWidth = Math.max(1, s * 0.75);
    ctx.beginPath(); ctx.moveTo(sx(h.x), sy(h.y)); for (const [x, y] of S.me.path) ctx.lineTo(sx(x), sy(y)); ctx.stroke(); ctx.restore();
  }
  // a mine picked from the resource card (13/11/2026): three gold rings pulse on it for 3 s
  if (S.ping) {
    const e = (performance.now() - S.ping.at) / 1000;
    if (e > 3) S.ping = null;
    else { ctx.save(); for (let k = 0; k < 3; k++) { const f = ((e * 1.2 + k / 3) % 1); ctx.strokeStyle = `rgba(255, 210, 80, ${(1 - f) * 0.9})`; ctx.lineWidth = Math.max(2, 2.5 * s); ctx.beginPath(); ctx.ellipse(sx(S.ping.x), sy(S.ping.y), (1 + f * 3.5) * T * z * 0.5, (1 + f * 3.5) * T * z * 0.35, 0, 0, 7); ctx.stroke(); } ctx.restore(); }
  }
  for (let i = S.marks.length - 1; i >= 0; i--) {
    const m = S.marks[i];
    // right-click orders: the hand-drawn arrows converging on the spot (green = go, red = attack), then a fade
    const kind = m.c === '#3ee06b' ? 'move' : m.c === '#ff4a4a' ? 'attack' : null, F = kind && CLICK.img && CLICK.meta?.[kind];
    if (F) {
      const e = t - m.t0, n = F.length, fi = Math.min(n - 1, Math.floor(e / 0.07)), fade = e > n * 0.07 ? 1 - (e - n * 0.07) / 0.3 : 1;
      if (fade <= 0) { S.marks.splice(i, 1); continue; }
      const [fx, fy, fw, fh, ax, ay] = F[fi]; ctx.globalAlpha = fade;
      ctx.drawImage(CLICK.img, fx, fy, fw, fh, Math.round(sx(m.x) - ax * s), Math.round(sy(m.y) - ay * s), Math.round(fw * s), Math.round(fh * s));
      ctx.globalAlpha = 1; continue;
    }
    const k = (t - m.t0) / 0.6;
    if (k >= 1) { S.marks.splice(i, 1); continue; }
    const r = (1 - k) * 8 * s + 3 * s, x = sx(m.x), y = sy(m.y);
    ctx.strokeStyle = m.c; ctx.lineWidth = Math.max(1, s);
    ctx.beginPath(); ctx.moveTo(x - r, y - r / 2); ctx.lineTo(x + r, y + r / 2); ctx.moveTo(x + r, y - r / 2); ctx.lineTo(x - r, y + r / 2); ctx.stroke();
  }
  // skill targeting circle
  if (S.targeting || S.skillAim) {
    const mh = S.byId.get(S.me?.hero);
    if (mh) {
      ctx.save(); ctx.strokeStyle = '#b8a0ff66'; ctx.lineWidth = Math.max(1, s); ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.ellipse(sx(mh.x), sy(mh.y), 8 * T * z, 8 * T * z, 0, 0, 7); ctx.stroke(); ctx.restore();
    }
    const ax = S.skillAim ? sx(S.skillAim.x) : S.mouse.x, ay = S.skillAim ? sy(S.skillAim.y) : S.mouse.y;
    ctx.save(); ctx.fillStyle = '#b8a0ff28'; ctx.strokeStyle = '#d098ff'; ctx.lineWidth = Math.max(1.5, s * 1.3); ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.ellipse(ax, ay, 2.5 * T * z, 2.5 * T * z, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  // arrow toward my hero when off screen
  const h = S.byId.get(S.me?.hero) ?? (S.lastHero ? S.lastHero : null);
  if (h && S.alive) {
    const hx = sx(h.x), hy = sy(h.y);
    if (hx < 0 || hy < 0 || hx > W || hy > H) {
      const cx = W / 2, cy = H / 2, a = Math.atan2(hy - cy, hx - cx);
      const r = Math.min(W, H) / 2 - 30, ax = cx + Math.cos(a) * r, ay = cy + Math.sin(a) * r;
      ctx.fillStyle = '#3ee06b'; ctx.beginPath(); ctx.moveTo(ax + Math.cos(a) * 14, ay + Math.sin(a) * 14); ctx.lineTo(ax + Math.cos(a + 2.5) * 10, ay + Math.sin(a + 2.5) * 10); ctx.lineTo(ax + Math.cos(a - 2.5) * 10, ay + Math.sin(a - 2.5) * 10); ctx.fill();
      ctx.font = '12px "SWDigits", "Pixelify Sans", monospace'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(Math.hypot(h.x - (cam.x + W / z / 2) / T, h.y - (cam.y + H / z / 2) / T))} ô`, ax - Math.cos(a) * 16, ay - Math.sin(a) * 16 + 4);
    }
  }
}

const BOSS_GLOW = { 'golem-kim-cuong': '#6fd3f0', 'chua-te-hac-in': '#ff7a2a', 'nu-hoang-pha-le': '#c070ff', 'vua-tho-phi': '#f0c030', 'bo-cap-sa-mac': '#8aff5a' };
const LAIR = {}, LAIR_W = { 'golem-kim-cuong': 21 }, LAIR_AY = { 'golem-kim-cuong': 0.66, 'chua-te-hac-in': 0.62, 'nu-hoang-pha-le': 0.63, 'bo-cap-sa-mac': 0.63, 'vua-tho-phi': 0.61 }; // width in tiles: Golem ×2.5, others ×2 the old 8.4-tile ring (others 16.8), where the arena centre is (fraction of the height)
function drawLair(ctx, type, dead, x, y, z) {
  const key = type + (dead ? '-ha' : '');
  if (!(key in LAIR)) { const i = new Image(); LAIR[key] = null; i.onload = () => (LAIR[key] = i); i.src = `/assets/lairs/${key}.png?v=7`; }
  const im = LAIR[key]; if (!im) return false;
  const w = (LAIR_W[type] ?? 16.8) * T * z, h = (w * im.height) / im.width, ay = LAIR_AY[type] ?? 0.72;
  const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(im, Math.round(x - w / 2), Math.round(y - h * ay), Math.round(w), Math.round(h));
  ctx.imageSmoothingEnabled = sm;
  return true;
}
function pedestal(ctx, x, y, z, t, c, fight) {
  const rx = 4.2 * T * z, ry = rx * 0.55;
  ctx.fillStyle = '#4a4638'; ctx.beginPath(); ctx.ellipse(x, y + 3 * z, rx, ry, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#9a937a'; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#827b66'; ctx.beginPath(); ctx.ellipse(x, y, rx * 0.86, ry * 0.86, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#c4bea3'; ctx.lineWidth = z; ctx.beginPath(); ctx.ellipse(x, y - z, rx, ry, 0, Math.PI, Math.PI * 2); ctx.stroke();
  const pulse = fight ? 0.75 + Math.sin(t * 10) * 0.25 : 0.45 + Math.sin(t * 2) * 0.2;
  ctx.globalAlpha = pulse; ctx.strokeStyle = fight ? '#ff5a3a' : c; ctx.lineWidth = Math.max(1, 1.5 * z);
  ctx.beginPath(); ctx.ellipse(x, y, rx * 0.7, ry * 0.7, 0, 0, 7); ctx.stroke();
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2 + t * 0.2; ctx.fillStyle = fight ? '#ffb08a' : c; ctx.fillRect(x + Math.cos(a) * rx * 0.78 - z, y + Math.sin(a) * ry * 0.78 - z, 2.5 * z, 2.5 * z); }
  ctx.globalAlpha = 1;
}
/**
 * Pixel overlay: fog of war + safe zone (bo) + "outside the zone" warning, drawn as one low-resolution layer of square
 * blocks locked to the world grid (so it never shimmers when the camera moves), with ordered (Bayer) dithering instead
 * of smooth gradients.
 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const ovCv = document.createElement('canvas'), ovCtx = ovCv.getContext('2d');
let ovImg = null;
function drawOverlay(ctx, W, H, sx, sy, z, t) {
  const M = S.match, zc = M?.phase === 'run' ? M.cur : null, nx = M?.phase === 'run' ? M.next : null;
  const vr = S.alive ? S.me?.vr : 0, h = S.byId.get(S.me?.hero);
  const fog = vr && h;
  if (!fog && !zc) return;
  const B = Math.max(4, Math.round(2 * z));
  const cam = S.cam, wx0 = cam.x * z, wy0 = cam.y * z;
  const offX = ((wx0 % B) + B) % B, offY = ((wy0 % B) + B) % B;
  const cols = Math.ceil(W / B) + 2, rows = Math.ceil(H / B) + 2;
  if (ovCv.width !== cols || ovCv.height !== rows) { ovCv.width = cols; ovCv.height = rows; ovImg = ovCtx.createImageData(cols, rows); }
  const d = ovImg.data;
  const gx0 = Math.floor(wx0 / B), gy0 = Math.floor(wy0 / B);
  const hx = fog ? sx(h.x) : 0, hy = fog ? sy(h.y) : 0, R = vr * T * z, edge = 0.16;
  // extra vision: owned mines and my Thành trì (only the ones near the screen)
  const vs = fog ? (S.me.vs ?? []).map(([x, y, r]) => [sx(x), sy(y), r * T * z]).filter(([x, y, r]) => x + r > 0 && x - r < W && y + r > 0 && y - r < H) : [];
  const zx = zc ? sx(zc.x) : 0, zy = zc ? sy(zc.y) : 0, zr = zc ? zc.r * T * z : 0;
  const nxx = nx ? sx(nx.x) : 0, nyy = nx ? sy(nx.y) : 0, nr = nx ? nx.r * T * z : 0;
  const outside = fog && zc && Math.hypot(h.x - zc.x, h.y - zc.y) > zc.r;
  const pulse = 0.5 + Math.sin(t * 6) * 0.15, dash = Math.max(3, Math.round(6 / (B / 4)));
  for (let j = 0; j < rows; j++) {
    const cy = j * B - offY + B / 2;
    for (let i = 0; i < cols; i++) {
      const cx = i * B - offX + B / 2, th = BAYER[((gy0 + j) & 3) * 4 + ((gx0 + i) & 3)];
      let r = 0, g = 0, b = 0, a = 0;
      // safe zone: blue outside, a solid bright ring on its edge
      if (zc) {
        const dz = Math.hypot(cx - zx, cy - zy);
        if (dz > zr) { r = 40; g = 90; b = 220; a = 72; }
        if (Math.abs(dz - zr) < B * 0.75) { r = 110; g = 170; b = 255; a = 235; }
      }
      // fog of war: dithered steps at the edge of the vision circle
      if (fog && a < 200) {
        let q = Math.hypot(cx - hx, cy - hy) / R;
        for (const [vx, vy, vr2] of vs) { const q2 = Math.hypot(cx - vx, cy - vy) / vr2; if (q2 < q) q = q2; }
        let fa = 0;
        if (q >= 1) fa = 190;
        else if (q > 1 - edge) { const u = (q - (1 - edge)) / edge; fa = u * 2 < 1 ? (u * 2 > th ? 95 : 0) : (u * 2 - 1 > th ? 190 : 95); }
        if (fa >= a) { r = a ? 22 : 12; g = a ? 20 : 10; b = a ? 60 : 24; a = fa; }
      }
      // next zone: dashed white ring of blocks
      if (nx) {
        const dn = Math.hypot(cx - nxx, cy - nyy);
        if (Math.abs(dn - nr) < B * 0.6 && Math.floor(((Math.atan2(cy - nyy, cx - nxx) + Math.PI) * nr) / B / dash) % 2 === 0) { r = 255; g = 255; b = 255; a = 220; }
      }
      // standing outside the zone: dithered red frame around the screen
      if (outside) {
        const e = Math.min(i, cols - 1 - i, j, rows - 1 - j) / (Math.min(cols, rows) * 0.09);
        if (e < 1 && (1 - e) * pulse * 1.6 > th) { r = 210; g = 30; b = 30; a = Math.max(a, 130); }
      }
      const k = (j * cols + i) * 4;
      d[k] = r; d[k + 1] = g; d[k + 2] = b; d[k + 3] = a;
    }
  }
  ovCtx.putImageData(ovImg, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(ovCv, -offX, -offY, cols * B, rows * B);
}
function ring(ctx, x, y, s, c, a) {
  ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, s);
  ctx.beginPath(); ctx.ellipse(x, y, 11 * s, 5 * s, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
}
function glow(ctx, x, y, r, c) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, c + 'ff'); g.addColorStop(1, c + '00');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}

/** 8-direction pet sheets (13/11/2026, tools/spriteimport/pet8.mjs): /assets/pets/<id>/<anim>.png, 8 rows = directions
 *  down, down-right, right, up-right, up, up-left, left, down-left × N frames; /assets/pets/dir.json lists what exists */
const PET8 = {}, PET8IMG = {}, PETATK = new Map();
fetch('/assets/pets/dir.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).then((j) => Object.assign(PET8, j)).catch(() => {});
const DIR_ROW = [0, 7, 6, 5, 4, 3, 2, 1]; // unit dir (S, SW, W, NW, N, NE, E, SE) → sheet row
const DIR8V = [[0, 1], [-0.7, 0.7], [-1, 0], [-0.7, -0.7], [0, -1], [0.7, -0.7], [1, 0], [0.7, 0.7]];
function dir8(dx, dy) { let b = 0, bv = -9; for (let i = 0; i < 8; i++) { const v = DIR8V[i][0] * dx + DIR8V[i][1] * dy; if (v > bv) { bv = v; b = i; } } return b; }
/** draw one frame of an 8-way pet sheet; false when that sheet is not there (yet) */
function drawPet8(ctx, id, form, anim, d, f, loop, x, y, k) {
  const M = PET8[id]; let n = M?.[form]?.[anim]; if (!n) return false;
  const load = (a) => { const key = `${id}/${a}`; if (!(key in PET8IMG)) { const i = new Image(); PET8IMG[key] = null; i.onload = () => (PET8IMG[key] = i); i.src = `/assets/pets/${key}.png?v=${M.v ?? ''}`; } return PET8IMG[key]; };
  for (const a of Object.keys(M[form])) load(a); // preload the whole form: an attack sheet still loading made the pet vanish (13/11/2026)
  let im = load(anim);
  if (!im) { // still loading: show the stance meanwhile
    const base = form === 'small' ? 'dung' : 'chien-dung', bi = PET8IMG[`${id}/${base}`];
    if (!bi) return form === 'big' || PET8IMG[`${id}/dung`] != null;
    im = bi; n = M[form][base]; anim = base; f = 0; loop = true;
  }
  const cw = im.width / n, ch = im.height / 8, fr = loop ? Math.floor(f) % n : Math.min(n - 1, Math.floor(f)), row = DIR_ROW[d & 7];
  if (n === 1) { // a one-pose sheet ('Bước 1' art): the motion is faked (hop / breathe / lunge / shake)
    const H = ch * k, V = DIR8V[d & 7];
    if (/di|chay/.test(anim)) { // a 2-pose step cycle: the walk pose and the stance in turn, a hop and a squash on each step
      const ph = f / 3, step = Math.floor(ph) % 2, u = ph % 1, alt = PET8IMG[`${id}/${form === 'small' ? 'dung' : 'chien-dung'}`];
      const fly = !!PETS[id]?.fight?.fly, hop = fly ? 0 : Math.sin(u * Math.PI), sq = fly ? 1 : 1 - 0.06 * (1 - hop), use = step && alt && !fly ? alt : im; // flyers glide: no hop, no pose swap (13/11/2026)
      ctx.drawImage(use, 0, row * ch, cw, ch, Math.round(x - cw * k * (2 - sq) / 2), Math.round(y - hop * H * 0.08 - ch * k * sq * 0.95), Math.round(cw * k * (2 - sq)), Math.round(ch * k * sq));
      return true;
    }
    else if (/dung/.test(anim)) { const b = Math.sin(f * 0.6) * 0.02; ctx.drawImage(im, 0, row * ch, cw, ch, Math.round(x - cw * k * (1 - b) / 2), Math.round(y - ch * k * (1 + b) * 0.95), Math.round(cw * k * (1 - b)), Math.round(ch * k * (1 + b))); return true; }
    else if (/danh|chieu/.test(anim)) { const a2 = Math.sin(Math.min(1, f / 6) * Math.PI) * H * 0.12; x += V[0] * a2; y += V[1] * a2 * 0.6; }
    else if (/trung/.test(anim)) x += Math.sin(f * 3) * H * 0.03;
  }
  ctx.drawImage(im, fr * cw, row * ch, cw, ch, Math.round(x - cw * k / 2), Math.round(y - ch * k * 0.95), Math.round(cw * k), Math.round(ch * k));
  return true;
}
/** shadow on the ground + how high a flying pet hovers (with a slow bob) */
function petHover(ctx, x, y, s, t, seed, h) { ctx.save(); ctx.globalAlpha = 0.28; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, y, 9 * s * h / 11, 3.5 * s * h / 11, 0, 0, 7); ctx.fill(); ctx.restore(); return (h + Math.sin(t * 2.2 + seed) * 2) * s; }
const PETIMG = {}, PETEMO = { 'soi-con': '🐺', 'meo-than-tai': '🐱', 'gau-truc': '🐼', 'rua-da': '🐢', 'cao-lua': '🦊', 'dai-bang': '🦅', 'tho-ngoc': '🐰', 'lac-da-vang': '🐫', 'phuong-hoang': '🐦‍🔥', 'rong-con': '🐲' };
function drawPet(ctx, q, x, y, s, t) {
  if (PETS[q.id]?.fight?.fly && PET8[q.id]) { y -= petHover(ctx, x, y, s, t, q.x, 11); } // flying pets hover above a ground shadow (13/11/2026)
  if (drawPet8(ctx, q.id, 'small', q.moving ? 'di' : 'dung', q.d8 ?? 0, q.moving ? t * 10 + q.x : t * 5 + q.x, true, x, y, s * 0.36)) return;
  if (!(q.id in PETIMG)) { const i = new Image(); PETIMG[q.id] = null; i.onload = () => (PETIMG[q.id] = i); i.src = `/assets/pets/${q.id}.png?v=${S.av ?? ''}`; }
  const im = PETIMG[q.id], bob = Math.round(Math.sin(t * 6 + q.x) * 0.8) * s;
  if (im) {
    // sheet: 4 frames × 2 rows (row 0 idle, row 1 walk), 128 px cells; drawn ~1/2 of a soldier (×1.5, 13/11/2026)
    const fw = im.width / 4, fh = im.height / 2, k = s * 0.36, walking = q.moving, fr = Math.floor(walking ? t * 8 + q.x : t * 4 + q.x) % 4; // walk 8 frames/s (was tied to the distance: ~40/s while catching up, 13/11/2026)
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); if (q.dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(im, fr * fw, walking ? fh : 0, fw, fh, Math.round(-fw * k / 2), Math.round(-fh * k * 0.92) + (walking ? 0 : bob), Math.round(fw * k), Math.round(fh * k)); ctx.restore();
  } else {
    ctx.font = `${Math.round(20 * s)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.save(); ctx.translate(Math.round(x), Math.round(y) + bob); if (q.dir < 0) ctx.scale(-1, 1); ctx.fillText(PETEMO[q.id] ?? PETS[q.id]?.icon ?? '🐾', 0, 0); ctx.restore();
  }
}
/** a pet in battle form (13/11/2026): /assets/pets/<id>-chien.png (4×4, 256 px: transform / idle / run / attack) when it
 *  exists, else the small sheet drawn ~3× bigger; a transform flash for the first 0.6 s */
const PETBIG = {}, PETBORN = new Map();
function drawPetBattle(ctx, u, x, y, s, t) {
  const id = u.type;
  if (!(id in PETBIG)) { const i = new Image(); PETBIG[id] = null; i.onload = () => (PETBIG[id] = i); i.src = `/assets/pets/${id}-chien.png?v=${S.av ?? ''}`; }
  // S.view is rebuilt from every snapshot, so the birth time lives in a map by unit id (13/11/2026: it was reset each
  // frame and the pet stayed stuck in the first frame of its transform flash)
  if (!PETBORN.has(u.id)) { PETBORN.set(u.id, t); if (PETBORN.size > 200) PETBORN.delete(PETBORN.keys().next().value); }
  const age = t - PETBORN.get(u.id), flip = (u.dir ?? 0) >= 3 && (u.dir ?? 0) <= 5 ? -1 : 1;
  const c = colorOf(u.owner); ctx.globalAlpha = 0.55; ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, s); ctx.beginPath(); ctx.ellipse(x, y, 16 * s, 7 * s, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
  if (PET8[id]?.big?.['chien-dung']) { // 8-direction sheets (13/11/2026)
    const d = u.dir ?? 0;
    if (PETS[id]?.fight?.fly) y -= petHover(ctx, x, y, s, t, u.id, 16);
    if (age < 0.6 && PET8[id].small?.['bien-hinh']) { // transform: the small pet glows and grows
      const g = age / 0.6; drawPet8(ctx, id, 'small', 'bien-hinh', d, age * 10, false, x, y, s * (0.36 + 0.18 * g)); // grows to the battle size (192 × 0.36 = 128 × 0.54)
    } else {
      let anim = 'chien-dung', f = t * 6 + u.id, loop = true;
      if (u.act === 1) { anim = 'chien-chay'; f = t * 10 + u.id; }
      else if (u.act === 2) { // attack: every 4th one is the signature skill
        const st = t - (u.age ?? 0), A = PETATK.get(u.id);
        if (!A || Math.abs(A.st - st) > 0.25) { const n = (A?.n ?? 0) + 1; PETATK.set(u.id, { st, n, skill: n % 4 === 0 && !!PET8[id].big.chieu }); if (PETATK.size > 200) PETATK.delete(PETATK.keys().next().value); }
        anim = PETATK.get(u.id).skill ? 'chieu' : 'chien-danh'; f = (u.age ?? 0) * 10; loop = false;
      } else if (u.act === 3 && PET8[id].big['chien-trung']) { anim = 'chien-trung'; f = (u.age ?? 0) * 10; loop = false; }
      else if (u.act === 5 && PET8[id].big['chien-guc']) { anim = 'chien-guc'; f = (u.age ?? 0) * 8; loop = false; }
      drawPet8(ctx, id, 'big', anim, d, f, loop, x, y, s * 0.36); // half of the first 8-way size (13/11/2026)
    }
    if (age < 0.6) { ctx.save(); ctx.globalAlpha = 0.6 * (1 - age / 0.6); ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(x, y - 27 * s, (15 + age * 60) * s, 0, 7); ctx.fill(); ctx.restore(); }
    return;
  }
  const big = PETBIG[id], small = PETIMG[id];
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); if (flip < 0) ctx.scale(-1, 1);
  if (big) {
    const fw = big.width / 4, fh = big.height / 4, k = s * 0.54, row = age < 0.6 ? 0 : u.act === 2 ? 3 : u.act === 1 ? 2 : 1, fr = age < 0.6 ? Math.min(3, Math.floor(age / 0.15)) : Math.floor(t * 6) % 4;
    ctx.drawImage(big, fr * fw, row * fh, fw, fh, Math.round(-fw * k / 2), Math.round(-fh * k * 0.92), Math.round(fw * k), Math.round(fh * k));
  } else if (small) {
    const fw = small.width / 4, fh = small.height / 2, grow = Math.min(1, age / 0.5), k = s * (0.36 + 0.75 * grow), fr = Math.floor(t * 6) % 4;
    ctx.drawImage(small, fr * fw, u.act === 1 ? fh : 0, fw, fh, Math.round(-fw * k / 2), Math.round(-fh * k * 0.92), Math.round(fw * k), Math.round(fh * k));
  } else if (!(id in PETIMG)) { const i = new Image(); PETIMG[id] = null; i.onload = () => (PETIMG[id] = i); i.src = `/assets/pets/${id}.png?v=${S.av ?? ''}`; }
  else { const g = Math.min(1, age / 0.5); ctx.font = `${Math.round((20 + 33 * g) * s)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(PETS[id]?.icon ?? '🐾', 0, 0); } // no art yet: a big emoji
  ctx.restore();
  if (age < 0.6) { ctx.save(); ctx.globalAlpha = 1 - age / 0.6; ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(x, y - 27 * s, (15 + age * 60) * s, 0, 7); ctx.fill(); ctx.restore(); }
}
function drawOne(ctx, u, x, y, s, t) {
  if (PETS[u.type]) return drawPetBattle(ctx, u, x, y, s, t);
  const team = u.owner === S.you || u.owner === 0 ? 'blue' : 'red';
  // team ring under every army (player colour), guards yellow
  const hero = u.flags & 2;
  if (u.act !== 5 && !BOSSES[u.type]) {
    const c = colorOf(u.owner);
    const big = UNITS[u.type]?.slots >= 4 ? 2.2 : UNITS[u.type]?.slots >= 2 ? 1.5 : GUARDS[u.type]?.scale > 1 ? 1.6 : 1;
    ctx.globalAlpha = hero ? 0.9 : 0.55; ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, s * (hero ? 1.5 : 1));
    ctx.beginPath(); ctx.ellipse(x, y, 9 * s * big, 4 * s * big, 0, 0, 7); ctx.stroke();
    if (hero) { ctx.globalAlpha = 0.25; ctx.fillStyle = c; ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  if (S.hover?.k === 'unit' && S.hover.id === u.id) ring(ctx, x, y, s, '#ffffff', 0.9);
  const skin = GUARDS[u.type] ? u.type : skinOf(u.type, u.lv);
  const a = SPR.atlas[GUARDS[u.type]?.sprite ?? skin];
  if (!a) return;
  const pose = poseOf(a, u.act, u.age, t, u.id);
  let ox = 0, oy = 0;
  if (u.act === 0 || u.act === 4) oy = Math.round(Math.sin(t * 3 + u.id) * 0.6) * s;
  if (u.act === 1) oy = -Math.abs(Math.round(Math.sin(t * 12 + u.id) * 1)) * s;
  if (u.act === 2 && u.age < 0.2) { const d = DIRV[u.dir]; ox = d[0] * 2 * s; oy = d[1] * 2 * s; }
  if (u.flags & 16 && u.type === 'rong') oy += Math.round(Math.sin(t * 2 + u.id) * 2) * s;
  const flash = u.act === 3 && u.age < 0.12 ? 0.7 : 0;
  const alpha = u.flags & 8 ? Math.max(0, 1 - u.age / 1.5) : u.flags & 128 ? 0.15 : 1;
  drawUnit(ctx, skin, team, pose, u.dir, x + ox, y + oy, s, alpha, flash, u.owner && !(u.flags & 8) ? glowOf(u.owner) : null);
  if (u.flags & 64 && S.players.get(u.owner)?.hero === 'thach-lam') {
    ctx.globalAlpha = 0.35; ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = Math.max(1, s);
    ctx.beginPath(); ctx.ellipse(x, y - 16 * s, 12 * s, 20 * s, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
  }
  if (u.flags & 32) { ctx.fillStyle = '#ffe26a'; for (let k = 0; k < 3; k++) { const a2 = t * 6 + k * 2.1; ctx.fillRect(x + Math.cos(a2) * 6 * s, y - 44 * s + Math.sin(a2) * 2 * s, 2 * s, 2 * s); } }
}
const DIRV = [[0, 1], [-0.7, 0.7], [-1, 0], [-0.7, -0.7], [0, -1], [0.7, -0.7], [1, 0], [0.7, 0.7]];
function drawCorpse(ctx, c, x, y, s, t) {
  const age = t - c.t0;
  const alpha = c.rout ? Math.max(0, 1 - age / 1.5) : age > 6 ? Math.max(0, 1 - (age - 6) / 2) : 1;
  if (alpha <= 0) return;
  const team = c.owner === S.you || c.owner === 0 ? 'blue' : 'red';
  drawUnit(ctx, c.type, team, 'death', c.dir, x + (c.rout ? c.vx * age * 16 * s : 0), y, s, alpha);
}
/** outline colour of a player (their chosen glow, else their colour) */
export function glowOf(id) { const p = S.players.get(id); return p ? p.glow || p.color : null; }
function drawMine(ctx, m, sx, sy, z, t) {
  let ml = m.lv ?? 1; while (ml > 1 && !(SPR.mineMeta[`${m.type}-l${ml}`] && SPR.mines[`${m.type}-l${ml}`])) ml--; // 16/11/2026: levels 6–8 use the highest drawn art
  const key = ml > 1 ? `${m.type}-l${ml}` : m.type; // upgraded mines have their own art
  const meta = SPR.mineMeta[key];
  // a moved mine glides to its new spot (its guards walk there on their own)
  let mx = m.x, my = m.y;
  if (m.moveT) { const k = Math.min(1, (now() - m.moveT) / 1.5), e = k * k * (3 - 2 * k); mx = m.fromX + (m.x - m.fromX) * e; my = m.fromY + (m.y - m.fromY) * e; if (k >= 1) m.moveT = 0; }
  const cx = m.type === 'diamond' ? mx : mx - 0.5, cy = m.type === 'diamond' ? my : my - 0.5;
  const x = sx(cx) + meta.dx * z, y = sy(cy) + meta.dy * z;
  const own = m.owner === S.you ? 'own' : m.owner ? 'enemy' : null;
  const hov = S.hover?.k === 'mine' && S.hover.id === m.id;
  if (own) { // the owner's outline colour (12/11/2026); a mine being stolen blinks
    const img = SPR.mines[key], g = glowOf(m.owner);
    if (m.steal && m.capBy) ctx.globalAlpha = 0.55 + 0.45 * Math.sin((t / 0.4) * Math.PI * 2);
    drawOutline(ctx, img, 0, 0, img.width, img.height, x, y, meta.w * z, meta.h * z, g, Math.max(1, Math.round(z * 0.8)));
    ctx.globalAlpha = 1;
  } else if (hov) ctx.drawImage(SPR.mines[`${key}-hover`], x - 2 * z, y - 2 * z, (meta.w + 4) * z, (meta.h + 4) * z);
  ctx.drawImage(SPR.mines[key], x, y, meta.w * z, meta.h * z);
  if (m.owner) { // small pennant in the owner's colour on the top-left of the mine (12/11/2026)
    const g = glowOf(m.owner) || '#ffffff', px = Math.max(1, Math.round(z)), fx = Math.round(x + meta.w * z * 0.18), fy = Math.round(y - 7 * px);
    ctx.fillStyle = '#1b1726'; ctx.fillRect(fx - px, fy - px, 3 * px, 15 * px); // pole outline
    ctx.fillStyle = '#d8c8a0'; ctx.fillRect(fx, fy, px, 13 * px);
    ctx.fillStyle = '#1b1726'; ctx.fillRect(fx + px, fy - px, 8 * px, 7 * px);
    ctx.fillStyle = g; ctx.fillRect(fx + px, fy, 6 * px, 5 * px); ctx.fillRect(fx + 7 * px, fy + px, px, 3 * px);
    ctx.fillStyle = '#ffffff55'; ctx.fillRect(fx + px, fy, 6 * px, px);
  }
  // level badge + upgrade bar (docs/design/can-cu/11-nang-cap-mo.md)
  if (m.lv > 1 || m.upAt) {
    const bx = x + meta.w * z - 6 * z, by = y + (m.type === 'diamond' ? 18 : 6) * z, r = 4.5 * z;
    if (m.lv > 1) {
      ctx.fillStyle = '#1b1726'; ctx.beginPath(); ctx.arc(bx, by, r + z * 0.8, 0, 7); ctx.fill();
      ctx.fillStyle = ['#a8784a', '#b8c0d0', '#e8b830', '#ff6ad5', '#7af0ff'][m.lv - 1]; ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill();
      ctx.font = `700 ${Math.max(8, 6 * z)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1b1726'; ctx.fillText(String(m.lv), bx, by + 0.5 * z); ctx.textBaseline = 'alphabetic';
    }
    if (m.upAt && m.upTotal) {
      const k = Math.max(0, Math.min(1, 1 - (m.upAt - now()) / m.upTotal)), w = meta.w * 0.6 * z, top = y - 4 * z;
      ctx.fillStyle = '#1b1726'; ctx.fillRect(x + (meta.w * z - w) / 2 - 1, top - 1, w + 2, 3 * z + 2); ctx.fillStyle = '#4aa8ff'; ctx.fillRect(x + (meta.w * z - w) / 2, top, w * k, 3 * z);
    }
  }
  // flag
  if (m.owner) {
    const c = colorOf(m.owner), fx = x + 3 * z, fy = y + (m.type === 'diamond' ? 20 : 8) * z;
    ctx.fillStyle = '#3a2416'; ctx.fillRect(fx, fy, z, 13 * z);
    const wave = Math.round(Math.sin(t * 5 + m.id) * 0.6) * z;
    ctx.fillStyle = c; ctx.fillRect(fx + z, fy + wave * 0, 7 * z, 5 * z); ctx.fillStyle = '#0004'; ctx.fillRect(fx + z, fy + 4 * z, 7 * z, z);
  }
  // capture bar
  if (m.capBy) {
    const w = 30 * z, bx = sx(m.x) - w / 2, by = y - 6 * z;
    ctx.fillStyle = '#1b1726'; ctx.fillRect(bx - 1, by - 1, w + 2, 3 * z + 2);
    ctx.fillStyle = colorOf(m.capBy); ctx.fillRect(bx, by, (w * m.cap) / 255, 3 * z);
    if (m.steal) { ctx.fillStyle = '#fff8'; ctx.fillRect(bx + w / 2, by, 1, 3 * z); }
  }
  if (m.guards) {
    ctx.font = `${Math.max(9, 5 * z)}px "SWDigits", "Pixelify Sans", monospace`; ctx.textAlign = 'center';
    ctx.fillStyle = '#1b1726'; ctx.fillText(`⚔${m.guards}`, sx(m.x) + 1, y - 2 * z + 1); ctx.fillStyle = '#f0c030'; ctx.fillText(`⚔${m.guards}`, sx(m.x), y - 2 * z);
  }
}
function drawFx(ctx, f, k, sx, sy, z, s, t) {
  const x = sx(f.x), y = sy(f.y);
  switch (f.kind) {
    case 'boom': {
      const col = { rock: '#c8c0b0', fireball: '#ff7a1a', orb: '#3ab0ff', star: '#b8a0ff', stomp: '#c8b080', wing: '#ffffff', slam: '#6fd3f0', whirl: '#ffffff', tar: '#ff6a1a', burrow: '#8aff5a', bomb: '#ffb030', airbomb: '#ff6a6a', spring: '#9adfff' }[f.sub] ?? '#fff';
      const r = f.r * T * z * (0.4 + k * 0.6);
      ctx.globalAlpha = 1 - k; glow(ctx, x, y - 6 * s, r, col);
      ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, 2 * s * (1 - k)); ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.55, 0, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
      if (f.sub === 'star' && k < 0.5) for (let i = 0; i < 5; i++) { const a = i * 1.26 + f.x, rr = f.r * T * z * 0.6; ctx.fillStyle = '#fff'; ctx.fillRect(x + Math.cos(a) * rr - 2 * s, y + Math.sin(a) * rr * 0.6 - (1 - k * 2) * 80 * s, 3 * s, 8 * s); }
      break;
    }
    case 'breath': {
      for (let i = 0; i < 26; i++) {
        const d = ((i * 0.37 + k * 1.5) % 1) * 3.2, sp = ((i * 7) % 11 - 5) / 5 * 0.42;
        const a = f.a + sp * (d / 3.2);
        const px = x + Math.cos(a) * d * T * z, py = y - 20 * s + Math.sin(a) * d * T * z * 0.75;
        ctx.globalAlpha = (1 - k) * (1 - d / 3.4);
        ctx.fillStyle = i % 3 === 0 ? '#fff2a0' : i % 3 === 1 ? '#ffb02a' : '#ff5a1a';
        const sz = (2 + d * 1.5) * s; ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1; break;
    }
    case 'zap': { // jagged white-violet bolt along the chain
      ctx.globalAlpha = 1 - k; ctx.lineCap = 'round';
      for (const [col, wd] of [['#b06aff', 4], ['#ffffff', 1.5]]) {
        ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, wd * s); ctx.beginPath();
        for (let i = 0; i + 1 < f.pts.length; i++) {
          const [x0, y0] = f.pts[i], [x1, y1] = f.pts[i + 1], X0 = sx(x0), Y0 = sy(y0) - (i ? 14 : 40) * s, X1 = sx(x1), Y1 = sy(y1) - 14 * s;
          if (i === 0) ctx.moveTo(X0, Y0);
          for (let j = 1; j <= 5; j++) { const q = j / 5, jx = j < 5 ? Math.sin(f.seed + i * 7 + j * 3.1 + k * 20) * 6 * s : 0; ctx.lineTo(X0 + (X1 - X0) * q + jx, Y0 + (Y1 - Y0) * q + jx * 0.6); }
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1; break;
    }
    case 'beam': { // Tháp Hỏa Ngục: thicker and whiter as it ramps up
      const a = S.byId.get(f.from), b = S.byId.get(f.to); if (!a || !b) break;
      const X0 = sx(a.x), Y0 = sy(a.y) - 46 * s, X1 = sx(b.x), Y1 = sy(b.y) - 14 * s, w = (1.5 + (f.s ?? 1) * 0.5) * s;
      ctx.globalAlpha = 0.9 * (1 - k * 0.5); ctx.lineCap = 'round';
      ctx.strokeStyle = '#ff4a1a'; ctx.lineWidth = w * 2.2; ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y1); ctx.stroke();
      ctx.strokeStyle = (f.s ?? 1) > 5 ? '#fff6c0' : '#ffb02a'; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y1); ctx.stroke();
      glow(ctx, X1, Y1, (4 + (f.s ?? 1)) * s, '#ff7a1a'); ctx.globalAlpha = 1; break;
    }
    case 'heal': { // Y sư: a green ring with rising plus signs
      const r = f.r * T * z * (0.3 + k * 0.7);
      ctx.globalAlpha = (1 - k) * 0.8; ctx.strokeStyle = '#6aff8a'; ctx.lineWidth = Math.max(1, 2 * s);
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.55, 0, 0, 7); ctx.stroke();
      ctx.fillStyle = '#b8ffc8';
      for (let i = 0; i < 6; i++) { const a = i * 1.047 + f.x, px = x + Math.cos(a) * r * 0.7, py = y + Math.sin(a) * r * 0.4 - k * 26 * s; ctx.fillRect(px - 2 * s, py - 0.5 * s, 4 * s, s); ctx.fillRect(px - 0.5 * s, py - 2 * s, s, 4 * s); }
      ctx.globalAlpha = 1; break;
    }
    case 'cone': { // Pháo chùm shrapnel
      ctx.globalAlpha = (1 - k) * 0.85;
      for (let i = 0; i < 18; i++) { const sp = ((i * 7) % 11 - 5) / 5 * 0.5, d = (0.3 + ((i * 0.37) % 1) * 0.7) * f.r * (0.3 + k * 0.7), a = f.a + sp;
        ctx.fillStyle = i % 3 ? '#c8b090' : '#ffb04a'; const px = x + Math.cos(a) * d * T * z, py = y + Math.sin(a) * d * T * z * 0.6 - 6 * s; ctx.fillRect(px - 1.5 * s, py - 1.5 * s, 3 * s, 3 * s); }
      ctx.globalAlpha = 1; break;
    }
    case 'summon': {
      ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#c8f6ff'; ctx.lineWidth = Math.max(1, s);
      ctx.beginPath(); ctx.ellipse(x, y, (6 + k * 10) * s, (3 + k * 5) * s, 0, 0, 7); ctx.stroke();
      for (let i = 0; i < 6; i++) { const a = i + k * 3; ctx.fillStyle = '#fff'; ctx.fillRect(x + Math.cos(a) * 10 * s, y - k * 30 * s - i * 3 * s, s * 1.5, s * 1.5); }
      ctx.globalAlpha = 1; break;
    }
    case 'skfx': {
      const D = SKFX[f.sub], el = k * f.dur; let acc = 0;
      for (const [row, d, w, ay, al = 1] of D.seq) { if (el < acc + d) { const pk = (el - acc) / d; fxDraw(ctx, f.sub, row, pk * 8, x, y, w, z, (pk > 0.85 && row === D.seq[D.seq.length - 1][0] ? (1 - pk) / 0.15 : 1) * (al < 1 ? 1 - (1 - al) * pk : 1), ay); break; } acc += d; }
      if (f.sub === 'lam-nguyet' && el > 0.5 && el < 1.0) for (let i = 0; i < 5; i++) { const a = i * 1.257 + f.x, r = 1.6 + (i % 2) * 0.8, pk = (el - 0.5) / 0.5; fxDraw(ctx, f.sub, D.icon, pk * 8, x + Math.cos(a) * r * T * z - (1 - pk) * 30 * s, y + Math.sin(a) * r * 0.55 * T * z - (1 - pk) * 60 * s, 0.9, z, 0.9, 0.8); }
      break;
    }
    case 'skend': { const D = SKFX[f.sub]; if (D?.end) fxDraw(ctx, f.sub, D.end[0], k * 8, x, y, D.end[2], z, 1, D.end[3]); break; }
    case 'skill': {
      const col = { 'thach-lam': '#7ad0ff', 'kim-ha': '#ffd23a', 'phong-vu': '#9fffd0', 'lam-nguyet': '#b8a0ff', 'hoa-ky': '#ff4a2a' }[f.sub] ?? '#fff';
      ctx.globalAlpha = 1 - k; ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, 3 * s * (1 - k));
      const r = (1 + k * 5) * T * z; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.55, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; break;
    }
    case 'captured': {
      ctx.globalAlpha = 1 - k;
      for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.28, r = k * 3 * T * z; ctx.fillStyle = i % 2 ? '#3ee06b' : '#ffffff'; ctx.fillRect(x + Math.cos(a) * r, y - 20 * s + Math.sin(a) * r * 0.6 - k * 20 * s, 2 * s, 2 * s); }
      ctx.globalAlpha = 1; break;
    }
    case 'warn': {
      ctx.globalAlpha = 0.25 + k * 0.5; ctx.fillStyle = '#ff3a2a';
      ctx.beginPath(); ctx.ellipse(x, y, f.r * T * z, f.r * T * z * 0.6, 0, 0, 7); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = '#ffd0c0'; ctx.lineWidth = Math.max(1, s);
      ctx.beginPath(); ctx.ellipse(x, y, f.r * T * z * k, f.r * T * z * 0.6 * k, 0, 0, 7); ctx.stroke(); break;
    }
    case 'loot': {
      ctx.globalAlpha = 1 - k; ctx.fillStyle = TIER_INFO[f.tier]?.color ?? '#fff';
      for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.28; ctx.fillRect(x + Math.cos(a) * k * 20 * s, y - 10 * s + Math.sin(a) * k * 12 * s - k * 20 * s, 2 * s, 2 * s); }
      ctx.globalAlpha = 1; break;
    }
    case 'hit': {
      ctx.globalAlpha = 1 - k; ctx.fillStyle = k < 0.4 ? '#ffffff' : '#ffe26a';
      const r = (2 + k * 4) * s; ctx.fillRect(x - r, y - 22 * s - s / 2, r * 2, s); ctx.fillRect(x - s / 2, y - 22 * s - r, s, r * 2);
      ctx.globalAlpha = 1; break;
    }
  }
}

// ------------------------------------------------------------ events from the server
export function onEvents(evs) {
  const t = now(), ts = performance.now() / 1000;
  for (const e of evs) {
    // sound: remember where non-melee damage comes from (projectile landing, blasts, fire, breath)
    if (e.k === 'proj') noteNonMelee(e.x1, e.y1, 1.2, ts + (e.dur ?? 0.3), ts + (e.dur ?? 0.3) + 0.3);
    else if (e.k === 'boom') noteNonMelee(e.x, e.y, (e.r ?? 2) + 0.6, ts, ts + 0.6);
    else if (e.k === 'fire') noteNonMelee(e.x, e.y, (e.r ?? 1.5) + 0.5, ts, ts + 0.12 + (e.dur ?? 3));
    else if (e.k === 'breath') noteNonMelee(e.x, e.y, 5, ts, ts + 1);
    if ((e.k === 'forgeok' || e.k === 'forgefail') && e.from) window.__sw?.forgeResult?.(e); // result dialog (13/11/2026)
    switch (e.k) {
      case 'proj': {
        S.projs.push({ kind: e.kind === 'scatter' ? 'rock' : e.kind, x: e.x, y: e.y, x1: e.x1, y1: e.y1, dur: e.dur, t0: t + 0.12 });
        // sounds (14/11/2026): launch now, impact when it lands
        if (e.kind === 'arrow') play('bow_release', e.x, e.y); else if (e.kind === 'rock' || e.kind === 'scatter') play('tower_cannon_fire', e.x, e.y);
        const land = { arrow: 'arrow_hit', orb: 'magic_orb_hit', star: 'magic_orb_hit', fireball: 'fireball_hit' }[e.kind];
        if (land) setTimeout(() => play(land, e.x1, e.y1), ((e.dur ?? 0.3) + 0.12) * 1000);
        break;
      }
      // 16/11/2026: Thành trì 6–8 effects
      case 'zap': S.fx.push({ kind: 'zap', pts: e.pts, x: e.pts[0][0], y: e.pts[0][1], t0: t + 0.05, dur: 0.35, seed: Math.random() * 99 }); noteNonMelee(e.pts[1][0], e.pts[1][1], 1.5, ts, ts + 0.4); break;
      case 'beam': { const a = S.byId.get(e.id); if (a) S.fx.push({ kind: 'beam', from: e.id, to: e.to, x: a.x, y: a.y, s: e.s, t0: t, dur: 0.3 }); break; }
      case 'heal': S.fx.push({ kind: 'heal', x: e.x, y: e.y, r: e.r, t0: t + 0.05, dur: 0.8 }); break;
      case 'cone': S.fx.push({ kind: 'cone', x: e.x, y: e.y, a: e.a, r: e.r, t0: t + 0.12, dur: 0.45 }); break;
      case 'boom': S.fx.push({ kind: 'boom', sub: e.kind, x: e.x, y: e.y, r: e.r, t0: t + 0.12, dur: e.kind === 'star' ? 0.8 : 0.5 }); break;
      case 'breath': S.fx.push({ kind: 'breath', x: e.x, y: e.y, a: e.a, t0: t + 0.12, dur: 0.6 }); play('dragon_breath', e.x, e.y); break;
      case 'fire': S.fires.push({ x: e.x, y: e.y, r: e.r, until: t + 0.12 + e.dur }); break;
      case 'dmg': {
        const u = S.byId.get(e.id);
        S.texts.push({ x: e.x + (Math.random() - 0.5) * 0.4, y: e.y, s: String(e.v), c: e.c ? '#ff9a2a' : u?.owner === S.you ? '#ff6a6a' : '#ffffff', big: !!e.c, t0: t + 0.12, dur: 0.7 });
        S.fx.push({ kind: 'hit', x: e.x, y: e.y, t0: t + 0.12, dur: 0.18 });
        if (u && IS_B.has(u.type)) play('building_hit', e.x, e.y, e.c ? 1.2 : 1); // a structure is hit
        else if (isMelee(e.x, e.y)) play(Math.random() < 0.65 ? 'sword_clash' : 'sword_swing', e.x, e.y, e.c ? 1.2 : 1);
        break;
      }
      case 'txt': S.texts.push({ x: e.x, y: e.y - 0.4, s: e.s, c: '#ffe26a', big: true, t0: t, dur: 1 }); break;
      case 'xp': if (e.o === S.you) S.texts.push({ x: e.x + (Math.random() - 0.5) * 0.6, y: e.y - 1.1, s: `+${e.v.toLocaleString('vi')} XP`, c: '#9ef08a', big: true, t0: t, dur: 1.5 }); break;
      case 'die': case 'rout': {
        const u = S.byId.get(e.id);
        if (u && e.k === 'die') { // death sounds: big monsters / bosses groan, soldiers grunt; my own hero: a sad bell for me only
          if (u.id === S.me?.hero) play('hero_death');
          else if (BOSSES[u.type] || (GUARDS[u.type] && (GUARDS[u.type].scale ?? 1) > 1.1)) play('death_monster_big', u.x, u.y);
          else if (!IS_B.has(u.type) && !GUARDS[u.type]) play('death_soldier', u.x, u.y);
        }
        if (u && !IS_B.has(u.type)) S.corpses.push({ type: GUARDS[u.type] ? u.type : skinOf(u.type, u.lv), owner: u.owner, x: u.x, y: u.y, dir: u.dir, t0: t + 0.1, rout: e.k === 'rout', vx: (Math.random() - 0.5) * 0.15 });
        break;
      }
      case 'summon': S.fx.push({ kind: 'summon', x: e.x, y: e.y, t0: t, dur: 0.8 }); break;
      case 'skill': { const D = SKFX[e.hero], M = FXM[e.hero]; if (D && M?.im.complete && M.im.naturalWidth) S.fx.push({ kind: 'skfx', sub: e.hero, x: e.x, y: e.y, t0: t, dur: D.seq.reduce((a, q) => a + q[1], 0) }); else S.fx.push({ kind: 'skill', sub: e.hero, x: e.x, y: e.y, t0: t, dur: 1 }); break; }
      case 'captured': S.fx.push({ kind: 'captured', x: e.x, y: e.y, t0: t, dur: 1.2 }); break;
      case 'warn': S.fx.push({ kind: 'warn', x: e.x, y: e.y, r: e.r, t0: t + 0.1, dur: e.dur }); break;
      case 'loot': S.fx.push({ kind: 'loot', x: e.x, y: e.y, tier: e.tier, t0: t + 0.1, dur: 1 }); if (TIERS.indexOf(e.tier) >= 4) play('loot_epic', e.x, e.y); break;
      case 'bskill': play('boss_warning', e.x, e.y, 1.3); S.texts.push({ x: e.x, y: e.y - 4, s: { slam: 'DẬM ĐẤT!', tar: 'PHUN HẮC ÍN!', storm: 'MƯA PHA LÊ!', whirl: 'LỐC RÌU!', burrow: 'ĐỘN THỔ!', summon: 'GỌI QUÂN!' }[e.s] ?? '!', c: '#ff8a5a', big: true, t0: t, dur: 1.4 }); break;
    }
  }
  S.corpses = S.corpses.filter((c) => t - c.t0 < (c.rout ? 1.6 : 8));
  S.fires = S.fires.filter((f) => f.until > t);
}

// ------------------------------------------------------------ hit testing
export function pick(mx, my) {
  const { cam } = S, z = cam.z, s = z / 2;
  let best = null, bd = 1e9;
  for (const u of S.view) {
    if (u.act === 5 || IS_B.has(u.type)) continue;
    const x = (u.x * T - cam.x) * z, y = (u.y * T - cam.y) * z;
    const big = BOSSES[u.type] ? BOSS_SCALE * 1.1 : UNITS[u.type]?.slots >= 4 ? 2.4 : UNITS[u.type]?.slots >= 2 ? 1.6 : GUARDS[u.type]?.scale > 1 ? 1.6 : 1;
    const hw = 11 * s * big, top = 40 * s * big;
    if (mx < x - hw || mx > x + hw || my < y - top || my > y + 4 * s) continue;
    const d = Math.abs(mx - x) + Math.abs(my - (y - top / 2)) * 0.5;
    if (d < bd) { bd = d; best = { k: 'unit', id: u.id }; }
  }
  const wx = (mx / z + cam.x) / T, wy = (my / z + cam.y) / T;
  for (const g of S.items) if (Math.hypot(wx - g.x, (wy - (g.y - 0.6)) * 1) < 0.9) return { k: 'item', id: g.id };
  if (best) return best;
  for (const m of S.mines) {
    const r = m.type === 'diamond' ? 2.2 : 1.7;
    if (Math.hypot(wx - m.x, (wy - (m.y - 0.6)) * 0.9) < r) return { k: 'mine', id: m.id };
  }
  return null;
}

/** pets in Địa Ngục use the same battle-form drawing */
export function drawPetHell(ctx, u, x, y, s, t) { drawPetBattle(ctx, u, x, y, s, t); }

/** Địa Ngục (16/11/2026): the hero's Q with the open-world art. el = seconds since the cast, liveDur = how long it lasts
 *  (loop row meanwhile), then the end row. z = zoom (tile = 16·z px). false once it is over. */
export function heroSkillFx(ctx, hero, el, x, y, z, liveDur = 0) {
  const D = SKFX[hero]; if (!D) return false;
  const seq = D.seq.reduce((a, q) => a + q[1], 0);
  if (el < seq) { let acc = 0; for (const [row, d, w, ay, al = 1] of D.seq) { if (el < acc + d) { const pk = (el - acc) / d; fxDraw(ctx, hero, row, pk * 8, x, y, w, z, al < 1 ? 1 - (1 - al) * pk : 1, ay); break; } acc += d; } return true; }
  if (el < liveDur && D.loop) { fxDraw(ctx, hero, D.loop[0], Math.floor(el * 10) % 8, x, y, D.loop[1], z, D.loop[3], D.loop[2]); return true; }
  const e0 = Math.max(seq, liveDur);
  if (D.end && el < e0 + D.end[1]) { fxDraw(ctx, hero, D.end[0], ((el - e0) / D.end[1]) * 8, x, y, D.end[2], z, 1, D.end[3]); return true; }
  return false;
}

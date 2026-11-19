// Sprite atlases (AI sheets), team / guard tints, mine models.
import { TYPE_LIST, UNITS, HEROES, GUARDS, BOSSES, BOSS_DRAW } from '/shared/balance.js';

export const SPR = { atlas: null, sheets: {}, mines: {}, mineMeta: null, ready: false };

const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('load ' + src)); i.src = src; });
const toCanvas = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').drawImage(img, 0, 0); return c; };

// Sheets taller than this are cut into several canvases: many GPUs cannot hold a texture taller than 8192 px
// (the boss sheets are ~9–10.5k px), and drawing from such an image falls back to a very slow CPU path.
const MAX_SHEET_H = 4096;
function splitSheet(img, ch) {
  if (!img || img.height <= MAX_SHEET_H) return img;
  const per = Math.max(1, Math.floor(MAX_SHEET_H / ch)), rows = Math.round(img.height / ch), parts = [];
  for (let r = 0; r < rows; r += per) {
    const n = Math.min(per, rows - r), c = document.createElement('canvas');
    c.width = img.width; c.height = n * ch;
    c.getContext('2d').drawImage(img, 0, r * ch, img.width, n * ch, 0, 0, img.width, n * ch);
    parts.push(c);
  }
  return { parts, per, width: img.width, height: img.height };
}
/** [source image, y] of frame `row` in a sheet (plain or split) */
// ---- player outline (12/11/2026): a thin outline + faint glow in the owner's chosen colour around units, mines, buildings.
// One silhouette per (source, frame, colour), cached (LRU-ish: cleared when it grows too big).
const SIL_ID = new WeakMap(); let silN = 0; const SIL = new Map();
const PAD = 3; // sprite px around the frame for the glow
/** outline + glow of one frame, pre-baked at sprite resolution: (sw + 2·PAD) × (sh + 2·PAD), no sprite inside */
function silFrame(src, sx, sy, sw, sh, color) {
  let id = SIL_ID.get(src); if (id == null) SIL_ID.set(src, (id = ++silN));
  const key = `${id}|${sx}|${sy}|${sw}|${sh}|${color}`;
  let c = SIL.get(key);
  if (!c) {
    if (SIL.size > 3000) SIL.clear();
    const m = document.createElement('canvas'); m.width = sw; m.height = sh;
    const mx = m.getContext('2d'); mx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
    mx.globalCompositeOperation = 'source-in'; mx.fillStyle = color; mx.fillRect(0, 0, sw, sh);
    c = document.createElement('canvas'); c.width = sw + PAD * 2; c.height = sh + PAD * 2;
    const x = c.getContext('2d');
    x.globalAlpha = 0.2; // soft glow, 2 px
    for (const [ox, oy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1], [-2, -1], [2, 1], [-1, 2], [1, -2]]) x.drawImage(m, PAD + ox, PAD + oy);
    x.globalAlpha = 0.9; // crisp 1 px line
    for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) x.drawImage(m, PAD + ox, PAD + oy);
    SIL.set(key, c);
  }
  return c;
}
let OUTLINE_ON = (() => { try { return localStorage.getItem('sw-noglow') !== '1'; } catch { return true; } })();
export function setOutline(on) { OUTLINE_ON = !!on; try { localStorage.setItem('sw-noglow', on ? '0' : '1'); } catch {} }
export const outlineOn = () => OUTLINE_ON;
/** draw the outline of a sprite region (call BEFORE drawing the sprite itself): one drawImage of the pre-baked frame */
export function drawOutline(ctx, src, sx, sy, sw, sh, dx, dy, dw, dh, color) {
  if (!color || !src || !OUTLINE_ON) return;
  const o = silFrame(src, sx, sy, sw, sh, color), kx = dw / sw, ky = dh / sh;
  ctx.drawImage(o, Math.round(dx - PAD * kx), Math.round(dy - PAD * ky), Math.round(dw + 2 * PAD * kx), Math.round(dh + 2 * PAD * ky));
}
// ---- team colour on structures (12/11/2026): the royal-blue cloth (banners, flags, drapes) takes the owner's colour
const TEAM_CACHE = new Map();
const hex2hsl = (h) => { const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let hh = 0, ss = 0; if (mx !== mn) { const d = mx - mn; ss = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh /= 6; } return [hh, ss, l]; };
const hsl2rgb = (h, s, l) => { if (!s) return [l, l, l]; const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; return [f(h + 1 / 3), f(h), f(h - 1 / 3)]; };
/** a copy of `img` whose saturated blue pixels are moved to `color` (same shading); cached per (image, colour) */
export function teamTint(img, color) {
  if (!img || !color || !/^#[0-9a-f]{6}$/i.test(color)) return img;
  let id = SIL_ID.get(img); if (id == null) SIL_ID.set(img, (id = ++silN));
  const key = id + '|' + color; let c = TEAM_CACHE.get(key); if (c) return c;
  if (TEAM_CACHE.size > 400) TEAM_CACHE.clear();
  c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  try {
    const d = x.getImageData(0, 0, c.width, c.height), p = d.data, [th, ts, tl] = hex2hsl(color);
    for (let i = 0; i < p.length; i += 4) {
      if (!p[i + 3]) continue;
      const r0 = p[i] / 255, g0 = p[i + 1] / 255, b0 = p[i + 2] / 255;
      if (b0 <= r0 || b0 <= g0) continue; // quick reject: blue must dominate
      const mx = b0, mn = Math.min(r0, g0), l = (mx + mn) / 2, dd = mx - mn; if (!dd) continue;
      const s = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn), h = ((r0 - g0) / dd + 4) / 6;
      if (h < 0.56 || h > 0.7 || s < 0.35 || l < 0.12 || l > 0.85) continue; // royal blue only (not sky, not water-ish greys)
      const [r, g, b] = hsl2rgb(th, Math.min(1, ts * (0.6 + s * 0.5)), Math.max(0.05, Math.min(0.92, l + (tl - 0.5) * 0.35)));
      p[i] = r * 255; p[i + 1] = g * 255; p[i + 2] = b * 255;
    }
    x.putImageData(d, 0, 0);
  } catch {}
  TEAM_CACHE.set(key, c); return c;
}
function frameSrc(img, row, ch) { return img.parts ? [img.parts[Math.floor(row / img.per)], (row % img.per) * ch] : [img, row * ch]; }

// guard tints: per-pixel recolour of an existing sheet
const TINTS = {
  bandit: (r, g, b) => [r * 0.9, g * 0.75, b * 0.7],
  dark: (r, g, b) => { const l = r * 0.3 + g * 0.59 + b * 0.11; return [l * 0.45 + 20, l * 0.4 + 12, l * 0.5 + 26]; },
  tar: (r, g, b) => { const l = r * 0.3 + g * 0.59 + b * 0.11; return [l * 0.35 + 24, l * 0.25 + 14, l * 0.45 + 34]; },
  crystal: (r, g, b) => { const l = r * 0.3 + g * 0.59 + b * 0.11; return [l * 0.8 + 70, l * 0.5 + 40, l * 0.9 + 90]; },
  golem: (r, g, b) => { const l = r * 0.3 + g * 0.59 + b * 0.11; return [l * 0.55 + 40, l * 0.9 + 50, l * 0.95 + 60]; },
};
function tinted(src, fn) {
  const c = toCanvas(src), x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    const [r, g, b] = fn(a[i], a[i + 1], a[i + 2]);
    a[i] = Math.min(255, r); a[i + 1] = Math.min(255, g); a[i + 2] = Math.min(255, b);
  }
  x.putImageData(d, 0, 0);
  return c;
}

export async function loadSprites(av = '') {
  const q = '?v=' + av;
  const atlas = await (await fetch('/assets/units/atlas.json' + q, { cache: 'no-store' })).json();
  SPR.atlas = atlas;
  const jobs = [];
  for (const id of Object.keys(atlas)) {
    jobs.push(load(`/assets/units/${id}.png${q}`).then((i) => (SPR.sheets[id] = { blue: i })));
    if (UNITS[id.replace(/-l\d$/, '')]) jobs.push(load(`/assets/units/${id}-do.png${q}`).then((i) => (SPR.sheets[id + '#red'] = i)));
  }
  const meta = await (await fetch('/assets/mines/mines.json' + q, { cache: 'no-store' })).json();
  SPR.mineMeta = meta;
  for (const t of Object.keys(meta)) for (const v of ['', '-own', '-enemy', '-hover']) jobs.push(load(`/assets/mines/${t}${v}.png${q}`).then((i) => (SPR.mines[t + v] = i)));
  await Promise.all(jobs);
  for (const id of Object.keys(atlas)) if (SPR.sheets[id + '#red']) SPR.sheets[id].red = SPR.sheets[id + '#red'];
  for (const id of Object.keys(atlas)) { const sh = SPR.sheets[id], ch = atlas[id].size[1]; sh.blue = splitSheet(sh.blue, ch); if (sh.red) sh.red = splitSheet(sh.red, ch); delete SPR.sheets[id + '#red']; }
  // guards
  for (const [g, def] of Object.entries(GUARDS)) {
    const base = SPR.sheets[def.sprite];
    if (!base) continue;
    if (!def.tint) { SPR.sheets['g:' + g] = { blue: base.blue }; continue; } // monsters with their own sheet
    const src = def.tint === 'bandit' ? base.red ?? base.blue : base.blue;
    SPR.sheets['g:' + g] = { blue: tinted(src, TINTS[def.tint]) };
  }
  SPR.ready = true;
}

/** sprite id for a unit at an army level: its own level sheet, else the closest lower level, else level 1 */
export function skinOf(type, lv = 1) {
  for (let l = lv; l > 1; l--) if (SPR.atlas?.[`${type}-l${l}`]) return `${type}-l${l}`;
  return type;
}
/** sheet + atlas entry for a unit type; team: 'blue' (mine) | 'red' (others) */
export function sheetFor(type, team) {
  if (GUARDS[type]) { const d = GUARDS[type]; if (!SPR.sheets['g:' + type]) return null; return { img: SPR.sheets['g:' + type].blue, a: SPR.atlas[d.sprite], scale: d.scale ?? 1 }; }
  const s = SPR.sheets[type];
  if (!s || !SPR.atlas[type]) return null;
  return { img: (team === 'red' && s.red) || s.blue, a: SPR.atlas[type], scale: BOSSES[type] ? BOSS_DRAW : 1 };
}

/** pick a pose name for an action code and the time since it started */
export function poseOf(a, act, age, idleT, id) {
  const has = (n) => !!a.states[n];
  switch (act) {
    case 1: return Math.floor((idleT + id * 0.13) * 6) % 2 ? 'walk' : 'idle';
    case 2: return age < 0.4 ? 'attack' : 'idle';
    case 3: return age < 0.3 && has('hit') ? 'hit' : 'idle';
    case 4: return has('victory2') && Math.floor(age * 3) % 2 ? 'victory2' : 'victory';
    case 5: return 'death';
    case 6: return has('skill') ? 'skill' : 'attack';
    default: return 'idle';
  }
}

/** draw one frame with its anchor at (sx, sy) screen px */
export function drawUnit(ctx, type, team, pose, dir, sx, sy, s, alpha = 1, flash = 0, outline = null) {
  const sh = sheetFor(type, team); if (!sh) return;
  const { img, a, scale } = sh;
  const st = a.states[pose] ?? a.states.idle;
  const [cw, ch] = a.size, [ox, oy] = a.anchor;
  const k = s * scale;
  const row = st.row + dir;
  if (alpha < 1) ctx.globalAlpha = alpha;
  const [src, fy] = frameSrc(img, row, ch);
  if (outline) drawOutline(ctx, src, 0, fy, cw, ch, Math.round(sx - ox * k), Math.round(sy - oy * k), Math.round(cw * k), Math.round(ch * k), outline, Math.max(1, Math.round(k * 0.6)));
  ctx.drawImage(src, 0, fy, cw, ch, Math.round(sx - ox * k), Math.round(sy - oy * k), Math.round(cw * k), Math.round(ch * k));
  if (flash > 0) {
    ctx.globalAlpha = flash * alpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(src, 0, fy, cw, ch, Math.round(sx - ox * k), Math.round(sy - oy * k), Math.round(cw * k), Math.round(ch * k));
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.globalAlpha = 1;
}

/** a small canvas with one pose (for HUD / shop / hero cards) */
export function thumb(type, pose = 'idle', dir = 0, s = 1, team = 'blue', crop = true) {
  const sh = sheetFor(type, team); if (!sh) return document.createElement('canvas');
  const { img, a, scale } = sh;
  const [cw, ch] = a.size;
  const st = a.states[pose] ?? a.states.idle;
  const c = document.createElement('canvas');
  const k = s * scale;
  c.width = Math.round(cw * k); c.height = Math.round(ch * k);
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const [src, fy] = frameSrc(img, st.row + dir, ch);
  x.drawImage(src, 0, fy, cw, ch, 0, 0, c.width, c.height);
  if (!crop) return c;
  // crop to content
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y++) for (let i = 0; i < c.width; i++) if (d[(y * c.width + i) * 4 + 3] > 40) { x0 = Math.min(x0, i); x1 = Math.max(x1, i); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x1 < x0) return c;
  const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1;
  o.getContext('2d').drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
  return o;
}
export const isUnit = (t) => !!UNITS[t];
export const isHero = (t) => !!HEROES[t];
export const typeOf = (code) => TYPE_LIST[code];

// Logo + favicons, drawn as pixel art. Usage: node tools/logo.mjs  → client/assets/brand/
import fs from 'node:fs';
import { Px, savePng, mix } from './mapgen/core.mjs';

const OUT = new URL('../client/assets/brand/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const INK = '#1b1726';

// ---------------------------------------------------------------- helpers
function outlineMask(p, color, n = 1) {
  // add an n-pixel outline (8-neighbour) around every opaque pixel
  for (let k = 0; k < n; k++) {
    const add = [];
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      if (p.get(x, y) & 255) continue;
      let hit = false;
      for (let j = -1; j <= 1 && !hit; j++) for (let i = -1; i <= 1; i++) if ((i || j) && x + i >= 0 && y + j >= 0 && x + i < p.w && y + j < p.h && p.get(x + i, y + j) & 255) { hit = true; break; }
      if (hit) add.push([x, y]);
    }
    for (const [x, y] of add) p.set(x, y, color);
  }
}
function shadowed(p, dx, dy, color) {
  const q = new Px(p.w + Math.abs(dx), p.h + Math.abs(dy));
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.get(x, y) & 255) q.set(x + dx, y + dy, color);
  q.blit(p, 0, 0);
  return q;
}
function thickLine(p, x0, y0, x1, y1, w, colorAt) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
  for (let k = 0; k <= n; k++) {
    const t = k / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    for (let j = -w; j <= w; j++) for (let i = -w; i <= w; i++) if (i * i + j * j <= w * w + 0.5) p.set(Math.round(x + i), Math.round(y + j), colorAt(t, i, j));
  }
}

// ---------------------------------------------------------------- emblem: split shield, crossed swords, diamond
function emblem(S) {
  const p = new Px(S, S);
  const k = S / 48;
  const swords = S >= 24;
  // crossed swords behind the shield
  if (swords) {
    const steel = ['#f4f6fb', '#c8d0de', '#8a96ac'];
    const blade = (x0, y0, x1, y1, flip) => {
      thickLine(p, x0, y0, x1, y1, Math.max(1, 1.6 * k), (t, i, j) => ((flip ? -i : i) + j < 0 ? steel[0] : (flip ? -i : i) + j === 0 ? steel[1] : steel[2]));
    };
    blade(6 * k, 6 * k, 40 * k, 40 * k, false);
    blade(42 * k, 6 * k, 8 * k, 40 * k, true);
    // hilts (bottom ends) + cross guards
    const hilt = (x, y, gx, gy) => {
      thickLine(p, x - gx, y - gy, x + gx, y + gy, Math.max(1, 1.2 * k), () => '#f4c430');
      thickLine(p, x, y, x + (x > S / 2 ? 4 : -4) * k, y + 4 * k, Math.max(1, 1.1 * k), () => '#7a4a22');
      p.set(Math.round(x + (x > S / 2 ? 5 : -5) * k), Math.round(y + 5 * k), '#f4c430');
    };
    hilt(38 * k, 38 * k, 4 * k, -4 * k);
    hilt(10 * k, 38 * k, 4 * k, 4 * k);
  }
  // shield
  const cx = S / 2, top = (swords ? 7 : 2) * k, H = (swords ? 34 : 44) * k, Wd = (swords ? 30 : 40) * k;
  const halfW = (y) => { const f = y / H; return f < 0.42 ? Wd / 2 : (Wd / 2) * Math.sqrt(Math.max(0, 1 - ((f - 0.42) / 0.58) ** 1.6)); };
  const blue = ['#1e3a8a', '#2c55c8', '#3a6ff0', '#6a96ff'], red = ['#7a1a14', '#b02a20', '#e0453a', '#ff7a6a'];
  const rim = Math.max(1, Math.round(2 * k));
  for (let y = 0; y < H; y++) {
    const hw = halfW(y); if (hw < 0.5) continue;
    for (let x = Math.ceil(cx - hw); x < cx + hw; x++) {
      const dx = x + 0.5 - cx, edge = hw - Math.abs(dx);
      const yy = Math.round(top + y);
      if (edge < rim || y < rim) { p.set(x, yy, y < rim + 1 || dx < 0 ? '#ffe066' : '#c88a10'); continue; }
      const pal = dx < 0 ? blue : red;
      const l = 1 - (y / H) * 0.6 - (dx < 0 ? 0 : 0.15) + (edge < rim + 2 ? 0.25 : 0);
      const c = l > 0.85 ? pal[3] : l > 0.6 ? pal[2] : l > 0.35 ? pal[1] : pal[0];
      p.set(x, yy, c);
    }
  }
  // centre seam
  for (let y = rim; y < H - 2 * k; y++) if (halfW(y) > 2) p.set(Math.floor(cx), Math.round(top + y), '#c88a10');
  // diamond gem in the middle
  const gy = top + H * 0.42, gr = Math.max(2, 7 * k);
  for (let j = -gr; j <= gr; j++) for (let i = -gr; i <= gr; i++) {
    const d = Math.abs(i) / gr + Math.abs(j) / (gr * 1.15);
    if (d > 1) continue;
    const c = d > 0.8 ? '#0e2a3a' : i + j < -gr * 0.3 ? '#ffffff' : i < 0 ? '#9ff3ff' : j > 0 ? '#2a8fb8' : '#6fd3f0';
    p.set(Math.round(cx - 0.5 + i), Math.round(gy + j), c);
  }
  outlineMask(p, INK, 1);
  return p;
}

// ---------------------------------------------------------------- wordmark
const G = {
  S: ['.#####.', '##...##', '##.....', '.#####.', '.....##', '.....##', '##...##', '.#####.'],
  O: ['.#####.', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  D: ['######.', '##...##', '##...##', '##...##', '##...##', '##...##', '##...##', '######.'],
  I: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '######'],
  E: ['#######', '##.....', '##.....', '######.', '##.....', '##.....', '##.....', '#######'],
  R: ['######.', '##...##', '##...##', '######.', '##.##..', '##..##.', '##...##', '##...##'],
  W: ['##.....##', '##.....##', '##.....##', '##..#..##', '##.###.##', '#########', '###...###', '##.....##'],
  A: ['..###..', '.##.##.', '##...##', '##...##', '#######', '##...##', '##...##', '##...##'],
  ' ': ['...', '...', '...', '...', '...', '...', '...', '...'],
};
function word(text, k = 2, ramp = ['#fff6c0', '#ffe066', '#f4c430', '#e8a020', '#c86a10', '#8a3a0a']) {
  const glyphs = [...text].map((c) => G[c]);
  const w = glyphs.reduce((s, g) => s + g[0].length + 1, -1) * k, h = 8 * k;
  const p = new Px(w, h);
  let ox = 0;
  for (const g of glyphs) {
    for (let r = 0; r < 8; r++) for (let c = 0; c < g[r].length; c++) {
      if (g[r][c] !== '#') continue;
      for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) {
        const yy = r * k + j;
        let col = ramp[Math.min(ramp.length - 1, Math.floor((yy / h) * ramp.length))];
        // bevel: top-left edge of each stroke lighter
        const up = r === 0 || g[r - 1][c] !== '#', left = c === 0 || g[r][c - 1] !== '#';
        if ((up && j === 0) || (left && i === 0)) col = mix(col, '#ffffff', 0.45);
        p.set(ox + c * k + i, yy, col);
      }
    }
    ox += (g[0].length + 1) * k;
  }
  outlineMask(p, '#3a1a06', 1);
  outlineMask(p, INK, 1);
  return shadowed(p, 2, 2, '#00000088');
}

// ---------------------------------------------------------------- outputs
const em = emblem(48);
savePng(em, OUT + 'emblem.png');
const w1 = word('SODIER'), w2 = word('WAR', 3, ['#ffffff', '#ffd0c8', '#ff7a6a', '#e0453a', '#b02a20', '#7a1a14']);
// stacked logo: emblem left, two lines of text right
{
  const gap = 6, H = Math.max(em.h, w1.h + w2.h + 4), W = em.w + gap + Math.max(w1.w, w2.w);
  const p = new Px(W, H);
  p.blit(em, 0, Math.round((H - em.h) / 2));
  const tx = em.w + gap, ty = Math.round((H - (w1.h + w2.h + 4)) / 2);
  p.blit(w1, tx, ty);
  p.blit(w2, tx + Math.round((w1.w - w2.w) / 2), ty + w1.h + 4);
  savePng(p, OUT + 'logo.png');
  savePng(p, OUT + 'logo@4x.png', 4);
}
for (const s of [16, 32, 48]) savePng(emblem(s), OUT + `favicon-${s}.png`);
// apple touch icon: emblem on a dark rounded square
{
  const p = new Px(45, 45, INK);
  p.blit(emblem(40), 2, 2);
  savePng(p, OUT + 'apple-touch-icon.png', 4);
}
console.log('brand →', OUT, fs.readdirSync(OUT).join(', '));

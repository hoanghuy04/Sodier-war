// Shared helpers for the AI sheet importers (buildlv.mjs, newbuild.mjs, importjpg.mjs):
//  loadImage  — PNG directly, JPG (Telegram photos) through a headless Chromium (playwright-core)
//  keyMagenta — background mask that only removes the magenta CONNECTED to the image border (plus a thin JPEG fringe
//               and big enclosed pockets of near-pure background), so violet / magenta-ish art inside the outlines
//               (lightning levels, glowing crystals) survives.
import fs from 'node:fs';
import { Px } from '../mapgen/core.mjs';
import { readPng } from './png.mjs';

const PW = '/home/huy/Main/unisage-web/node_modules/.pnpm/playwright-core@1.62.1/node_modules/playwright-core/index.mjs';
let browser = null;
export async function loadImage(f) {
  if (/\.png$/i.test(f)) return readPng(f);
  if (!browser) { const { chromium } = await import(PW); browser = await chromium.launch(); }
  const pg = await browser.newPage();
  const r = await pg.evaluate(async (src) => {
    const i = new Image(); i.src = src; await i.decode();
    const c = document.createElement('canvas'); c.width = i.width; c.height = i.height;
    const x = c.getContext('2d'); x.drawImage(i, 0, 0);
    const d = x.getImageData(0, 0, i.width, i.height).data;
    let s = ''; for (let k = 0; k < d.length; k += 8192) s += String.fromCharCode.apply(null, d.subarray(k, k + 8192));
    return { w: i.width, h: i.height, b: btoa(s) };
  }, 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64'));
  await pg.close();
  const d = Buffer.from(r.b, 'base64'), px = new Px(r.w, r.h);
  for (let k = 0; k < r.w * r.h; k++) px.d[k] = ((d[k * 4] << 24) | (d[k * 4 + 1] << 16) | (d[k * 4 + 2] << 8) | 255) >>> 0;
  return px;
}
export async function closeBrowser() { if (browser) await browser.close(); browser = null; }

export const rgb = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255];
/** loose magenta test (the old buildings.mjs isBg): background and its pink JPEG fringe */
export const looseBg = (v) => { const [r, g, b] = rgb(v); return r > 120 && b > 120 && g < 0.62 * Math.min(r, b) && Math.abs(r - b) < 110; };

/**
 * @returns Uint8Array solid mask (1 = sprite pixel)
 * opts: strict — RGB distance to the background colour that floods from the border (default 50)
 *       fringe — how many px the loose test may eat into the sprite from the flooded background (default 3)
 *       pocket — enclosed regions of near-background colour (distance < pocketDist) at least this big are background too
 */
export function keyMagenta(img, { strict = 50, fringe = 3, pocket = 150, pocketDist = 28 } = {}) {
  const { w: W, h: H, d } = img;
  // background colour = median of the border pixels
  const bs = [];
  for (let x = 0; x < W; x += 3) bs.push(d[x], d[(H - 1) * W + x]);
  for (let y = 0; y < H; y += 3) bs.push(d[y * W], d[y * W + W - 1]);
  const med = (k) => { const a = bs.map((v) => rgb(v)[k]).sort((p, q) => p - q); return a[a.length >> 1]; };
  const BG = [med(0), med(1), med(2)];
  const dist = (v) => { const [r, g, b] = rgb(v); return Math.sqrt((r - BG[0]) ** 2 + (g - BG[1]) ** 2 + (b - BG[2]) ** 2); };
  const near = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) near[i] = dist(d[i]);
  const solid = new Uint8Array(W * H).fill(1);
  // 1. flood the border-connected background
  const q = [];
  const push = (i) => { if (solid[i] && near[i] < strict) { solid[i] = 0; q.push(i); } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  const flood = () => { while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W); } };
  flood();
  // 2. enclosed pockets of near-pure background (holes between legs, inside a bow…)
  const seen = new Uint8Array(W * H);
  for (let s = 0; s < W * H; s++) {
    if (!solid[s] || seen[s] || near[s] >= pocketDist) continue;
    const list = [s]; seen[s] = 1;
    for (let k = 0; k < list.length; k++) {
      const i = list[k], x = i % W, y = (i / W) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) if (j >= 0 && solid[j] && !seen[j] && near[j] < pocketDist) { seen[j] = 1; list.push(j); }
    }
    if (list.length >= pocket) for (const i of list) { solid[i] = 0; q.push(i); }
  }
  // grow those pockets through the (looser) strict range too
  { const p = q.splice(0); for (const i of p) q.push(i); }
  flood();
  // 3. thin pink JPEG fringe: up to `fringe` px of loose-magenta pixels next to the background
  for (let pass = 0; pass < fringe; pass++) {
    const kill = [];
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x; if (!solid[i]) continue;
      if (solid[i - 1] && solid[i + 1] && solid[i - W] && solid[i + W]) continue;
      if (looseBg(d[i])) kill.push(i);
    }
    for (const i of kill) solid[i] = 0;
  }
  // 4. drop specks: a solid pixel needs at least 3 solid neighbours
  const clean = solid.slice();
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (!solid[i]) continue; let n = 0; for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) n += solid[i + j * W + k]; if (n < 4) clean[i] = 0; }
  return { mask: clean, bg: BG };
}

/** debug view: sprite pixels over a dark checker, removed pixels shown in a dim green so leaks are visible */
export function maskView(img, mask) {
  const out = new Px(img.w, img.h);
  for (let i = 0; i < img.w * img.h; i++) { const x = i % img.w, y = (i / img.w) | 0; out.d[i] = mask[i] ? img.d[i] : ((((x >> 3) + (y >> 3)) & 1) ? 0x203020ff : 0x182418ff); }
  return out;
}

/** downscale a source box [x0,y0,x1,y1] by k (majority mask + average colour, dark blocks → outline), as buildings.mjs */
export function shrinkBox(img, mask, [x0, y0, x1, y1], k) {
  const W = img.w, fw = Math.max(1, Math.round((x1 - x0 + 1) * k)), fh = Math.max(1, Math.round((y1 - y0 + 1) * k)), out = new Px(fw, fh);
  for (let ty = 0; ty < fh; ty++) for (let tx = 0; tx < fw; tx++) {
    const sx0 = Math.floor(x0 + tx / k), sx1 = Math.max(sx0 + 1, Math.floor(x0 + (tx + 1) / k)), sy0 = Math.floor(y0 + ty / k), sy1 = Math.max(sy0 + 1, Math.floor(y0 + (ty + 1) / k));
    let n = 0, s = 0, r = 0, g = 0, b = 0, dark = 0;
    for (let y = sy0; y < Math.min(sy1, y1 + 1); y++) for (let x = sx0; x < Math.min(sx1, x1 + 1); x++) {
      n++; const i = y * W + x; if (!mask[i]) continue;
      s++; const [R, G, B] = rgb(img.d[i]); r += R; g += G; b += B; if (R + G + B < 150) dark++;
    }
    if (!n || s / n < 0.45) continue;
    if (dark / s > 0.5) { out.set(tx, ty, '#1b1726'); continue; }
    const q = (v) => Math.min(255, Math.round(v / s / 8) * 8);
    out.d[ty * fw + tx] = ((q(r) << 24) | (q(g) << 16) | (q(b) << 8) | 255) >>> 0;
  }
  return out;
}

/** cells of a one-row sheet: runs of columns holding sprite pixels; small runs (sparkles, bubbles) join the nearest big one */
export function cellRuns(mask, W, H, y0 = 0, y1 = H - 1, minW = 40) {
  const has = Array.from({ length: W }, (_, x) => { let n = 0; for (let y = y0; y <= y1; y++) n += mask[y * W + x]; return n > 2; });
  let runs = [];
  for (let x = 0; x < W; x++) if (has[x]) { const s = x; while (x < W && has[x]) x++; runs.push([s, x - 1]); }
  const big = runs.filter(([a, b]) => b - a + 1 >= minW);
  for (const r of runs) if (r[1] - r[0] + 1 < minW) {
    const c = (r[0] + r[1]) / 2, gap = (q) => Math.max(0, q[0] - c, c - q[1]);
    const t = big.reduce((m, q) => (gap(q) < gap(m) ? q : m), big[0]);
    if (gap(t) < 30) { t[0] = Math.min(t[0], r[0]); t[1] = Math.max(t[1], r[1]); } // far-away specks are dropped
  }
  return big.sort((a, b) => a[0] - b[0]);
}

/** bbox of the mask inside a column range (rows y0..y1) */
export function boxOf(mask, W, x0, x1, y0, y1) {
  let a = 1e9, b = 1e9, c = -1, d = -1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (mask[y * W + x]) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  return [a, b, c, d];
}

/**
 * footprint width of a sprite: the largest connected part, widest row span in its bottom `part` of the height
 * (95th percentile, so one stray pixel row does not count). get(x, y) → truthy for sprite pixels.
 */
export function baseWidth(get, x0, y0, x1, y1, part = 0.35) {
  const w = x1 - x0 + 1, h = y1 - y0 + 1, lab = new Int32Array(w * h).fill(-1);
  let best = -1, bestN = 0;
  for (let s = 0; s < w * h; s++) {
    if (lab[s] >= 0 || !get(x0 + (s % w), y0 + ((s / w) | 0))) continue;
    const q = [s]; lab[s] = s;
    for (let k = 0; k < q.length; k++) {
      const i = q[k], x = i % w, y = (i / w) | 0;
      for (let j = -1; j <= 1; j++) for (let d = -1; d <= 1; d++) {
        const nx = x + d, ny = y + j, ni = ny * w + nx;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && lab[ni] < 0 && get(x0 + nx, y0 + ny)) { lab[ni] = s; q.push(ni); }
      }
    }
    if (q.length > bestN) { bestN = q.length; best = s; }
  }
  let top = h, bot = -1, l = w, r = -1;
  for (let i = 0; i < w * h; i++) if (lab[i] === best) { const x = i % w, y = (i / w) | 0; top = Math.min(top, y); bot = Math.max(bot, y); l = Math.min(l, x); r = Math.max(r, x); }
  const widths = [];
  for (let y = Math.round(bot - (bot - top) * part); y <= bot; y++) {
    let a = -1, b = -1; for (let x = 0; x < w; x++) if (lab[y * w + x] === best) { if (a < 0) a = x; b = x; }
    if (a >= 0) widths.push(b - a + 1);
  }
  widths.sort((p, q) => p - q);
  return { base: widths[Math.floor(widths.length * 0.95)] ?? 0, main: [x0 + l, y0 + top, x0 + r, y0 + bot] };
}

/** back a file up once (the first, original version is kept) */
export function backup(file, dir = process.env.SPRITE_BACKUP_DIR ?? '/tmp/claude-1000/-home-huy-Main/ee696ca4-fbda-4396-b973-564bda98cea1/scratchpad/asset-backup/') {
  if (!fs.existsSync(file)) return;
  const rel = file.replace(/^.*?sodier-war\//, '').replace(/\//g, '__');
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dir + rel)) fs.copyFileSync(file, dir + rel);
}

/** drop tiny isolated bits (≤ maxN px) that are mostly magenta-ish: semi-transparent bubbles / sparks tinted by the background */
export function dropPinkSpecks(p, maxN = 6) {
  const seen = new Uint8Array(p.w * p.h);
  for (let s = 0; s < p.w * p.h; s++) {
    if (seen[s] || !(p.d[s] & 255)) continue;
    const q = [s]; seen[s] = 1;
    for (let k = 0; k < q.length && q.length <= maxN; k++) {
      const i = q[k], x = i % p.w, y = (i / p.w) | 0;
      for (let j = -1; j <= 1; j++) for (let d = -1; d <= 1; d++) { const nx = x + d, ny = y + j, ni = ny * p.w + nx; if (nx >= 0 && ny >= 0 && nx < p.w && ny < p.h && !seen[ni] && (p.d[ni] & 255)) { seen[ni] = 1; q.push(ni); } }
    }
    if (q.length > maxN) continue;
    if (q.filter((i) => looseBg(p.d[i])).length * 2 >= q.length) for (const i of q) p.d[i] = 0;
  }
  return p;
}

/** magenta-hued (r ≈ b, little green): the background, its glow and its darkened ground shadow — but also pink crystals */
export const magentaHue = (v) => { const [r, g, b] = rgb(v), m = Math.min(r, b); return m > 60 && r / b > 0.82 && r / b < 1.4 && g < 0.62 * m; };
/**
 * deeper keying inside one box (ruin cells: pink ground shadow between the rubble): flood from the removed background
 * through magenta-hued pixels, and drop enclosed magenta-hued pockets of ≥ minPocket px. Changes mask in place.
 */
export function deepKey(img, mask, [x0, y0, x1, y1], minPocket = 12) {
  const W = img.w, inBox = (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
  const q = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * W + x; if (!mask[i] || !magentaHue(img.d[i])) continue;
    if ((x > 0 && !mask[i - 1]) || (x < W - 1 && !mask[i + 1]) || !mask[i - W] || !mask[i + W]) { mask[i] = 0; q.push(i); }
  }
  while (q.length) {
    const i = q.pop(), x = i % W, y = (i / W) | 0;
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) { if (!inBox(nx, ny)) continue; const j = ny * W + nx; if (mask[j] && magentaHue(img.d[j])) { mask[j] = 0; q.push(j); } }
  }
  const seen = new Uint8Array(W * (y1 + 2));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const s = y * W + x; if (!mask[s] || seen[s] || !magentaHue(img.d[s])) continue;
    const list = [s]; seen[s] = 1;
    for (let k = 0; k < list.length; k++) { const i = list[k], cx = i % W, cy = (i / W) | 0; for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) { if (!inBox(nx, ny)) continue; const j = ny * W + nx; if (mask[j] && !seen[j] && magentaHue(img.d[j])) { seen[j] = 1; list.push(j); } } }
    if (list.length >= minPocket) for (const i of list) mask[i] = 0;
  }
}

const hsv = (v) => { const [r, g, b] = rgb(v), mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0; if (mx !== mn) { if (mx === r) h = ((g - b) / (mx - mn)) * 60; else if (mx === g) h = (2 + (b - r) / (mx - mn)) * 60; else h = (4 + (r - g) / (mx - mn)) * 60; } if (h < 0) h += 360; return [h, mx ? (mx - mn) / mx : 0, mx]; };
/** pink / magenta-hued (hue 280–340): in art that must not contain pink (the Hell sheets) this is always background bleed */
export const isPinkish = (v) => { const [h, s, m] = hsv(v); return h > 280 && h < 340 && s > 0.35 && m > 90; };
/**
 * for art without any pink (Hell sheets): flood the background further through pinkish pixels (fringe of flames /
 * glows blended with magenta), then recolour the pinkish pixels left inside the sprite with their non-pink neighbours.
 * Changes mask and img.d in place.
 */
export function depink(img, mask) {
  const { w: W, h: H, d } = img, q = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (mask[i] && isPinkish(d[i]) && (!mask[i - 1] || !mask[i + 1] || !mask[i - W] || !mask[i + W])) { mask[i] = 0; q.push(i); } }
  while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) if (j >= 0 && mask[j] && isPinkish(d[j])) { mask[j] = 0; q.push(j); } }
  for (let pass = 0; pass < 4; pass++) {
    const fix = [];
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
      const i = y * W + x; if (!mask[i] || !isPinkish(d[i])) continue;
      let r = 0, g = 0, b = 0, n = 0;
      for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++) { const t = i + j * W + k; if (mask[t] && !isPinkish(d[t])) { const c = rgb(d[t]); r += c[0]; g += c[1]; b += c[2]; n++; } }
      if (n) fix.push([i, ((Math.round(r / n) << 24) | (Math.round(g / n) << 16) | (Math.round(b / n) << 8) | 255) >>> 0]);
    }
    for (const [i, v] of fix) d[i] = v;
    if (!fix.length) break;
  }
}

// Render every unit: sprite sheets + atlas, 8-direction GIFs per animation, roster board, battle scenes, preview page.
// Usage: node tools/unitgen/build.mjs [outDir]
import fs from 'node:fs';
import { Px, savePng, noise } from '../mapgen/core.mjs';
import { ground } from '../mapgen/art.mjs';
import { saveGif } from './gif.mjs';
import { UNITS, ANIMS, ANIM_VI, DIRS, HIT_FRAME, buildFrame, PIX } from './units.mjs';

const out = process.argv[2] ?? new URL('../../docs/design/assets/units/', import.meta.url).pathname;
const t0 = Date.now();
const SLUG = { idle: 'cho', walk: 'di', attack: 'danh', victory: 'thang', death: 'chet' };
const cache = new Map();
const frame = (u, a, f, d, team = 'blue') => {
  const k = `${u.id}|${a}|${f}|${d}|${team}`;
  if (!cache.has(k)) cache.set(k, buildFrame(u, a, f, d, team));
  return cache.get(k);
};

// ---------- sheets + atlas + 8-direction GIFs ----------
const atlas = {};
for (const u of UNITS) {
  const [w, h, ox, oy] = u.size;
  const rows = Object.keys(ANIMS).length * 8;
  const sheet = new Px(w * 6, h * rows);
  const states = {};
  let row = 0;
  for (const [a, n] of Object.entries(ANIMS)) {
    states[a] = { row, frames: n, fps: { idle: 6, walk: 10, attack: 10, victory: 8, death: 8 }[a], loop: a === 'idle' || a === 'walk', hitFrame: a === 'attack' ? HIT_FRAME : undefined, dirs: DIRS.map(([d]) => d) };
    for (const [, deg] of DIRS) { for (let f = 0; f < n; f++) sheet.blit(frame(u, a, f, deg), f * w, row * h); row++; }
    // GIF: 8 directions in two rows of four, in the same clockwise order
    const gframes = [];
    for (let f = 0; f < n; f++) {
      const g = new Px(w * 4, h * 2);
      DIRS.forEach(([, deg], i) => g.blit(frame(u, a, f, deg), (i % 4) * w, Math.floor(i / 4) * h));
      gframes.push(g);
    }
    if (a === 'death') for (let k = 0; k < 4; k++) gframes.push(gframes[n - 1]); // hold the last frame
    if (a === 'victory') gframes.push(gframes[n - 1]);
    saveGif(gframes, `${out}gif/${u.id}-${SLUG[a]}.gif`, { delay: Math.round(100 / states[a].fps), scale: 2 });
  }
  savePng(sheet, `${out}sheets/${u.id}.png`);
  atlas[u.id] = { name: u.name, cls: u.cls, size: [w, h], anchor: [ox, oy], cols: 6, states };
}
fs.writeFileSync(`${out}sheets/atlas.json`, JSON.stringify(atlas, null, 1));

// ---------- roster board (like the reference sheet: groups in two columns, sprites cropped) ----------
function crop(p, pad = 2) {
  let x0 = p.w, y0 = p.h, x1 = -1, y1 = -1;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if ((p.get(x, y) & 255) > 0x60) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const c = new Px(x1 - x0 + 1 + 2 * pad, y1 - y0 + 1 + 2 * pad);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) c.d[(y - y0 + pad) * c.w + (x - x0 + pad)] = p.get(x, y);
  return c;
}
{
  const groups = [['dan-quan', 'kiem-si'], ['linh-giao'], ['cung-thu'], ['ky-binh', 'hiep-si'], ['phap-su'], ['may-ban-da'], ['su-thuu', 'rong'], ['thach-lam', 'kim-ha', 'phong-vu', 'lam-nguyet', 'hoa-ky']];
  const tiles = groups.map((ids) => ids.flatMap((id) => { const u = UNITS.find((v) => v.id === id); return [crop(frame(u, 'idle', 0, 0)), crop(frame(u, 'idle', 0, 45))]; }));
  const gw = tiles.map((t) => t.reduce((a, s) => a + s.w + 6, 6)), gh = tiles.map((t) => Math.max(...t.map((s) => s.h)) + 12);
  // pack: pairs of groups side by side, hero row full width
  const layout = [[0, 1], [2, 3], [4, 5], [6], [7]];
  const colW = Math.max(...layout.filter((r) => r.length === 2).flatMap((r) => r.map((g) => gw[g])));
  const W = Math.max(colW * 2 + 18, ...layout.map((r) => r.reduce((a, g) => a + gw[g], 0) + 12));
  const H = layout.reduce((a, r) => a + Math.max(...r.map((g) => gh[g])) + 8, 8);
  const board = new Px(W, H, '#1f222c');
  let y = 8;
  for (const r of layout) {
    const rh = Math.max(...r.map((g) => gh[g]));
    r.forEach((g, k) => {
      const x0 = r.length === 2 ? 6 + k * (colW + 6) : 6, w = r.length === 2 ? colW : W - 12;
      board.rect(x0, y, w, rh, '#2a2e3a'); board.rect(x0, y, w, 1, '#3a3f50');
      let x = x0 + Math.round((w - gw[g]) / 2) + 6;
      for (const s of tiles[g]) { board.blit(s, x, y + rh - 6 - s.h); x += s.w + 6; }
    });
    y += rh + 8;
  }
  savePng(board, `${out}tat-ca.png`, 3);
}

// ---------- battle scene: four duels, the countered side falls, winners cheer ----------
const DIG = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001010010010', '111101111101111', '111101111001111'];
const num = (p, s, x, y, c) => { for (const ch of s) { const g = DIG[+ch]; for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g[j * 3 + i] === '1') p.set(x + i, y + j, c); x += 4; } };
const spark = (p, x, y, k) => { const c = ['#ffffff', '#fff0a0', '#ffd040'][k]; const r = [1, 3, 4][k]; for (const [dx, dy] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r - 1, r - 1], [1 - r, 1 - r], [r - 1, 1 - r], [1 - r, r - 1]]) p.set(x + dx, y + dy, c); };
function scene(pairs, file, bgKind = 'meadow') {
  const W = 300 * PIX, H = (pairs.length * 46 + 30) * PIX;
  const bg = new Px(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) bg.set(x, y, ground(bgKind, x, y, 16));
  const frames = [];
  const T = 34;
  for (let t = 0; t < T; t++) {
    const p = new Px(W, H); p.d.set(bg.d);
    const draws = [], fx = [];
    pairs.forEach(([a, b, dmgA, dmgB], k) => {
      const ua = UNITS.find((u) => u.id === a), ub = UNITS.find((u) => u.id === b);
      const gy = (40 + k * 46) * PIX;
      const meet = W / 2, gap = ((ua.size[0] + ub.size[0]) / 2) * 0.3;
      const walkT = Math.min(t, 6);
      const ax = meet - gap - (6 - walkT) * 7 * PIX, bx = meet + gap + (6 - walkT) * 7 * PIX;
      let A, Bf;
      if (t < 6) { A = frame(ua, 'walk', t % 6, 90); Bf = frame(ub, 'walk', t % 6, 270, 'red'); }
      else if (t < 18) { const f = (t - 6) % 6, g = (t - 6 + 3) % 6; A = frame(ua, 'attack', f, 90); Bf = frame(ub, 'attack', g, 270, 'red');
        if (f === HIT_FRAME || f === HIT_FRAME + 1) { spark(p, meet + gap * 0.3, gy - 18 * PIX, f - HIT_FRAME + 1); }
        if (f >= HIT_FRAME && f < HIT_FRAME + 3) num(p, String(dmgA), meet + gap * 0.4, gy - (28 + (f - HIT_FRAME) * 3) * PIX, '#ffd040');
        if (g === HIT_FRAME) spark(p, meet - gap * 0.3, gy - 18 * PIX, 1);
        if (g >= HIT_FRAME && g < HIT_FRAME + 3) num(p, String(dmgB), meet - gap * 0.6, gy - (28 + (g - HIT_FRAME) * 3) * PIX, '#ffffff'); }
      else if (t < 24) { A = frame(ua, 'attack', Math.min(5, t - 18), 90); Bf = frame(ub, 'death', t - 18, 270, 'red'); }
      else { A = frame(ua, 'victory', (t - 24) % 6, 90); Bf = frame(ub, 'death', 5, 270, 'red'); }
      draws.push([gy, () => { p.blit(A, Math.round(ax - ua.size[2]), Math.round(gy - ua.size[3])); p.blit(Bf, Math.round(bx - ub.size[2]), Math.round(gy - ub.size[3])); }]);
    });
    draws.sort((x, y) => x[0] - y[0]).forEach(([, f]) => f());
    frames.push(p);
  }
  saveGif(frames, file, { delay: 10, scale: 1 });
  savePng(frames[13], file.replace('.gif', '.png'), 2);
}
scene([['kiem-si', 'linh-giao', 19, 11], ['linh-giao', 'ky-binh', 21, 12], ['ky-binh', 'cung-thu', 27, 9], ['hiep-si', 'dan-quan', 24, 7]], `${out}giao-tranh.gif`);
scene([['thach-lam', 'kiem-si', 34, 12], ['lam-nguyet', 'linh-giao', 30, 10], ['hoa-ky', 'kiem-si', 32, 11]], `${out}giao-tranh-anh-hung.gif`, 'steppe');

// dragon vs a line of swordsmen
{
  const ud = UNITS.find((u) => u.id === 'rong'), us = UNITS.find((u) => u.id === 'kiem-si');
  const W = 260 * PIX, H = 120 * PIX, bg = new Px(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) bg.set(x, y, ground('badlands', x, y, 16));
  const frames = [];
  const sw = [[118, 58], [134, 76], [120, 94], [152, 64], [150, 92]];
  for (let t = 0; t < 30; t++) {
    const p = new Px(W, H); p.d.set(bg.d);
    const df = t < 6 ? frame(ud, 'idle', t % 4, 90) : t < 18 ? frame(ud, 'attack', (t - 6) % 6, 90) : frame(ud, 'victory', (t - 18) % 6, 90);
    const items = [[84 * PIX, () => p.blit(df, 70 * PIX - ud.size[2], 84 * PIX - ud.size[3])]];
    sw.forEach(([x, y], k) => {
      const burnt = t >= 9 + k * 2;
      const fr = !burnt ? frame(us, t < 6 ? 'idle' : 'attack', t < 6 ? t % 4 : (t + k) % 6, 270, 'red') : frame(us, 'death', Math.min(5, t - 9 - k * 2), 270, 'red');
      items.push([y * PIX, () => p.blit(fr, x * PIX - us.size[2], y * PIX - us.size[3])]);
    });
    items.sort((a, b) => a[0] - b[0]).forEach(([, f]) => f());
    frames.push(p);
  }
  saveGif(frames, `${out}rong-phun-lua.gif`, { delay: 10, scale: 1 });
  savePng(frames[10], `${out}rong-phun-lua.png`, 2);
}

// ---------- preview page (sheets embedded, works offline) ----------
{
  const imgs = Object.fromEntries(UNITS.map((u) => [u.id, 'data:image/png;base64,' + fs.readFileSync(`${out}sheets/${u.id}.png`).toString('base64')]));
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sodier War – Quân 8 hướng</title>
<style>:root{--bg:#1d2029;--panel:#272b37;--fg:#e8e8f0;--mut:#9aa0b4;--acc:#e8b830}body{margin:0;background:var(--bg);color:var(--fg);font:14px system-ui,sans-serif}
header{padding:12px 16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:var(--panel);position:sticky;top:0}
button{background:#353a4a;color:var(--fg);border:1px solid #454b60;border-radius:6px;padding:5px 10px;cursor:pointer;font:inherit}button.on{background:var(--acc);color:#1d2029;border-color:var(--acc)}
.grid{display:flex;flex-wrap:wrap;gap:10px;padding:16px}.cell{background:var(--panel);border-radius:8px;padding:6px;text-align:center}.cell span{display:block;color:var(--mut);font-size:12px}
canvas{image-rendering:pixelated;display:block}h1{font-size:16px;margin:0 12px 0 0}</style></head><body>
<header><h1>Sodier War · quân 8 hướng</h1><div id="units"></div><div id="anims"></div><label>Phóng <input id="zoom" type="range" min="2" max="6" value="3"></label></header>
<div class="grid" id="grid"></div>
<script>
const ATLAS=${JSON.stringify(atlas)};const IMGS=${JSON.stringify(imgs)};
const VI=${JSON.stringify(ANIM_VI)};const DIRVI={S:'xuống',SW:'chéo xuống trái',W:'quay trái',NW:'chéo lên trái',N:'quay lưng',NE:'chéo lên phải',E:'quay phải',SE:'chéo xuống phải'};
let unit=Object.keys(ATLAS)[1],anim='walk',img=new Image(),t0=performance.now();
const $=(s)=>document.querySelector(s);
function buttons(el,list,cur,set){el.innerHTML='';for(const [k,l] of list){const b=document.createElement('button');b.textContent=l;b.className=k===cur?'on':'';b.onclick=()=>{set(k);build()};el.appendChild(b)}}
function build(){buttons($('#units'),Object.entries(ATLAS).map(([k,v])=>[k,v.name]),unit,(k)=>unit=k);buttons($('#anims'),Object.keys(VI).map(k=>[k,VI[k]]),anim,(k)=>anim=k);
img=new Image();img.src=IMGS[unit];const a=ATLAS[unit],z=+$('#zoom').value;$('#grid').innerHTML='';
a.states[anim].dirs.forEach((d,i)=>{const c=document.createElement('div');c.className='cell';const cv=document.createElement('canvas');cv.width=a.size[0]*z;cv.height=a.size[1]*z;cv.dataset.i=i;c.appendChild(cv);const s=document.createElement('span');s.textContent=d+' · '+DIRVI[d];c.appendChild(s);$('#grid').appendChild(c)})}
function tick(now){const a=ATLAS[unit],st=a.states[anim],z=+$('#zoom').value;let f=Math.floor((now-t0)/1000*st.fps);f=st.loop?f%st.frames:Math.min(st.frames-1,f%(st.frames+6));
document.querySelectorAll('#grid canvas').forEach(cv=>{const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,cv.width,cv.height);const r=st.row+(+cv.dataset.i);g.drawImage(img,f*a.size[0],r*a.size[1],a.size[0],a.size[1],0,0,a.size[0]*z,a.size[1]*z)});requestAnimationFrame(tick)}
$('#zoom').oninput=build;build();requestAnimationFrame(tick);
</script></body></html>`;
  fs.writeFileSync(`${out}xem-truoc.html`, html);
}
console.log(`${cache.size} frames rendered in ${((Date.now() - t0) / 1000).toFixed(1)} s → ${out}`);

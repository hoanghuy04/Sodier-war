import fs from 'node:fs';
import { Px, savePng, smooth, noise, outline, mix } from './core.mjs';
import { generate, W, H, B, O, BIOME_INFO, MINES, segDist, halfWidth } from './gen.mjs';
import * as A from './art.mjs';
import { scene, OWN } from './scene.mjs';
// Render the generated map to PNG previews for docs/design.
// Usage: node tools/mapgen/render.mjs [seed] [outDir]

const seed = Number(process.argv[2] ?? 20261111);
const out = process.argv[3] ?? new URL('../../docs/design/assets/map/', import.meta.url).pathname;
const t0 = Date.now();
const SC = scene(seed);
const { map, renderDetail, renderOverview, mineArt, idx, clampT } = SC;
const { biome, obst, road, mines, spawns, villages, towers } = map;

// ---------------- tiny font for numbers ----------------
const DIG = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001010010010', '111101111101111', '111101111001111'];
function text(p, str, x, y, c, s = 2) {
  for (const ch of str) {
    const g = DIG[+ch];
    for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g[j * 3 + i] === '1') p.rect(x + i * s, y + j * s, s, s, c);
    x += 4 * s;
  }
}

// ---------------- outputs ----------------
fs.mkdirSync(out, { recursive: true });
const overview = renderOverview();
savePng(overview, out + 'tong-the.png');

// zones & mines
{
  const z = new Px(overview.w, overview.h); z.d.set(overview.d);
  for (let i = 0; i < z.d.length; i++) { const x = i % z.w, y = (i / z.w) | 0; z.shade(x, y, 0.5); }
  const S = 4, c = (W / 2) * S;
  for (const [r, col] of [[map.CORE_R, '#c8f6ff'], [0.4, '#ffffff'], [0.65, '#ffffff']])
    for (let a = 0; a < Math.PI * 2; a += 0.002) if (Math.floor(a * r * 128 * S / 10) % 2 === 0) { const x = c + Math.cos(a) * r * 128 * S, y = c + Math.sin(a) * r * 128 * S; z.rect(x - 1, y - 1, 3, 3, col); }
  const col = { iron: '#9aa7b8', coal: '#3a3c4d', gold: '#f4c430', oil: '#c27b2e', tar: '#7b3fa0', crystal: '#d08cff', diamond: '#9ff3ff' };
  for (const m of mines) {
    const big = m.type === 'diamond' ? 7 : 5, x = (m.x + 0.5) * S, y = (m.y + 0.5) * S;
    z.rect(x - big - 1, y - big - 1, 2 * big + 3, 2 * big + 3, '#111111'); z.rect(x - big, y - big, 2 * big + 1, 2 * big + 1, col[m.type]); z.rect(x - big, y - big, 2 * big + 1, 1, mix(col[m.type], '#ffffff', 0.5));
  }
  for (const v of villages) { const x = v.x * S, y = v.y * S; z.rect(x - 7, y - 3, 15, 10, '#111111'); z.rect(x - 6, y - 2, 13, 8, '#c8a070'); for (let k = 0; k < 7; k++) z.line(x - 7 + k, y - 3 - k, x + 7 - k, y - 3 - k, '#a84a2a'); }
  for (const t of towers) { const x = t.x * S, y = t.y * S; z.rect(x - 3, y - 10, 7, 14, '#111111'); z.rect(x - 2, y - 9, 5, 12, '#e8c070'); z.rect(x - 2, y - 9, 5, 3, '#a84a2a'); }
  for (const s of spawns) {
    const x = s.x * S + 2, y = s.y * S + 2;
    z.ellipse(x, y, 13, 13, '#111111'); z.ellipse(x, y, 11, 11, '#ffffff'); z.ellipse(x, y, 9, 9, '#2a2a2a');
    const str = String(s.n); text(z, str, x - (str.length * 8 - 2) / 2, y - 5, '#ffffff', 2);
  }
  savePng(z, out + 'vung-va-mo.png');
}

// minimap (1 px per tile, shown ×2)
{
  const mm = new Px(W, H);
  const C = ['#5a9a3c', '#9aa64c', '#2f5e28', '#2c4a30', '#e4ebf1', '#e0bd78', '#b4643a', '#4e5933', '#3a3634', '#9a937a', '#6a2a1e', '#a8402e', '#d6dce6', '#e6ebf3', '#c86a3a', '#b8321e'];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = idx(x, y), o = obst[i];
    let c = C[biome[i]];
    if (road[i]) c = '#b89a6a';
    if (o === O.WATER) c = biome[i] === B.SWAMP ? '#2e4a3c' : biome[i] === B.HELL || biome[i] === B.HELLB ? '#ff7a1a' : '#3a74a0';
    if (o === O.ICE) c = '#bfe0ef';
    if (o === O.CHASM) c = '#2a1208';
    if (o === O.TREE) c = biome[i] === B.FOREST ? '#24481f' : '#3a6a2a';
    if (o === O.PINE) c = biome[i] === B.TUNDRA ? '#5a7a62' : '#1f3a26';
    if (o === O.BOULDER) c = biome[i] === B.BADLANDS || biome[i] === B.DESERT ? '#7a3a22' : '#77726c';
    if (o === O.HOUSE || o === O.WELL) c = '#c8a070';
    mm.set(x, y, c);
  }
  const col = { iron: '#9aa7b8', coal: '#22232d', gold: '#f4c430', oil: '#c27b2e', tar: '#7b3fa0', crystal: '#d08cff', diamond: '#9ff3ff' };
  for (const [k, m] of mines.entries()) { const own = k % 3 === 1 ? '#3EE06B' : k % 3 === 2 ? '#FF4A4A' : '#9a9a9a'; mm.rect(m.x - 2, m.y - 2, 5, 5, own); mm.rect(m.x - 1, m.y - 1, 3, 3, col[m.type]); }
  savePng(mm, out + 'minimap.png', 2);
}

// detail crops
const crops = [];
const crop = (name, title, cx, cy) => {
  const tw = 40, th = 24;
  const tx0 = clampT(Math.round(cx - tw / 2), W - tw + 1), ty0 = clampT(Math.round(cy - th / 2), H - th + 1);
  const img = renderDetail(tx0, ty0, tw, th, (mi) => (mi % 3 === 1 ? 'own' : mi % 3 === 2 ? 'enemy' : null));
  savePng(img, out + `chi-tiet-${name}.png`, 2);
  crops.push({ name, title, tx0, ty0, tw, th });
};
const around = (m, r, pred) => { let n = 0; for (let y = m.y - r; y <= m.y + r; y++) for (let x = m.x - r; x <= m.x + r; x++) if (x >= 0 && y >= 0 && x < W && y < H && pred(idx(x, y))) n++; return n; };
const best = (list, score) => list.slice().sort((a, b) => score(b) - score(a))[0];
{
  const sp = best(spawns, (s) => around(s, 14, (i) => biome[i] === B.MEADOW) + around(s, 14, (i) => road[i]) * 0.5);
  crop('xuat-phat', `Khu xuất phát số ${sp.n}`, sp.x + 4, sp.y);
  crop('cao-nguyen-co', 'Cao nguyên cổ ở tâm bản đồ', W / 2, H / 2 - 2);
  const tm = best(mines.filter((m) => m.type === 'tar'), (m) => around(m, 12, (i) => biome[i] === B.ASH || biome[i] === B.SWAMP));
  crop('ho-dau-den', 'Hố dầu đen giữa vùng tro cháy', tm.x, tm.y);
  const gm = best(mines.filter((m) => m.type === 'gold' || m.type === 'oil'), (m) => around(m, 14, (i) => obst[i] === O.CHASM) * 3 + around(m, 14, (i) => biome[i] === B.BADLANDS));
  crop('hoang-mac-do', 'Hoang mạc đá đỏ, khe nứt và mỏ', gm.x, gm.y);
  const oa = best(mines.filter((m) => m.type === 'gold' || m.type === 'oil'), (m) => around(m, 14, (i) => biome[i] === B.DESERT) + around(m, 14, (i) => obst[i] === O.PALM || obst[i] === O.WATER) * 4);
  crop('sa-mac', 'Sa mạc và ốc đảo', oa.x, oa.y);
  const cm = best(mines.filter((m) => m.type === 'crystal' || m.type === 'coal'), (m) => around(m, 12, (i) => obst[i] === O.TREE || obst[i] === O.PINE) + (m.type === 'crystal' ? 60 : 0));
  crop('rung', 'Rừng và mỏ pha lê', cm.x, cm.y);
  const vi = villages[0];
  if (vi) crop('lang-hoang', 'Làng hoang và tháp canh', vi.x, vi.y);
  const tu = best(mines.filter((m) => m.type === 'iron' || m.type === 'coal'), (m) => around(m, 14, (i) => biome[i] === B.TUNDRA) + around(m, 14, (i) => obst[i] === O.ICE) * 2);
  crop('dong-tuyet', 'Đồng tuyết và hồ băng', tu.x, tu.y);
}

// mine sheet: 7 mines × (trống, của mình, của người khác) on their usual ground
{
  const types = Object.keys(A.MINE_ART), cw = 80, ch = 96;
  const sheet = new Px(cw * 3, ch * types.length);
  const gk = { iron: 'meadow', coal: 'forest', gold: 'desert', oil: 'steppe', tar: 'ash', crystal: 'forest', diamond: 'core' };
  types.forEach((t, row) => [null, 'own', 'enemy'].forEach((own, col) => {
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) sheet.set(col * cw + x, row * ch + y, A.ground(gk[t], x + row * 97, y + col * 131, 16));
    const art = mineArt[t];
    const dx = col * cw + (cw - art.model.w) / 2, dy = row * ch + ch - art.model.h - 6;
    sheet.blit(art.decal, dx, dy);
    if (own) { sheet.ellipse(dx + art.model.w / 2, dy + art.model.h - 16, art.model.w / 2 + 2, 16, OWN[own][0] + '26'); sheet.blit(outline(art.model, OWN[own][0], OWN[own][1]), dx - 2, dy - 2); }
    sheet.blit(art.model, dx, dy);
  }));
  savePng(sheet, out + 'mo-3-trang-thai.png', 2);
}

// ground swatches
{
  const kinds = ['meadow', 'steppe', 'forest', 'pine', 'tundra', 'desert', 'badlands', 'swamp', 'ash', 'core', 'road'];
  const sw = new Px(64 * 6, 64 * 3, '#1b1f24');
  kinds.forEach((k, n) => { const ox = (n % 6) * 64, oy = Math.floor(n / 6) * 64; for (let y = 2; y < 62; y++) for (let x = 2; x < 62; x++) sw.set(ox + x, oy + y, A.ground(k, x + n * 300, y, 16)); });
  ['pond', 'swamp', 'oasis', 'ice'].forEach((k, n) => { const ox = ((11 + n) % 6) * 64, oy = Math.floor((11 + n) / 6) * 64; for (let y = 2; y < 62; y++) for (let x = 2; x < 62; x++) { const e = Math.min(x - 2, y - 2, 61 - x, 61 - y); sw.set(ox + x, oy + y, e < 3 ? A.WATER[k].rim : A.waterColor(k, x, y, e < 6 ? 0 : e < 14 ? 1 : 2)); } });
  { const ox = (15 % 6) * 64, oy = Math.floor(15 / 6) * 64; for (let y = 2; y < 62; y++) for (let x = 2; x < 62; x++) { const top = 20 + Math.round(Math.sin(x * 0.3) * 3), bot = 46; sw.set(ox + x, oy + y, y < top ? A.ground('badlands', x, y) : y === top ? '#e0a070' : y > bot ? A.ground('badlands', x, y) : A.chasmColor(y - top, bot - y + 1, x, y)); } }
  savePng(sw, out + 'bang-dat.png', 2);
}

// stats
const st = { seed, size: [W, H], biomes: {}, obstacles: {}, mines: {}, spawns: spawns.length, villages: villages.length, towers: towers.length, roadTiles: 0, walkable: 0, carved: map.carved, crops };
const landN = W * H;
BIOME_INFO.forEach((b, k) => { st.biomes[b.id] = +(biome.filter((v) => v === k).length / landN * 100).toFixed(1); });
for (const [name, v] of Object.entries(O)) st.obstacles[name] = obst.filter((o) => o === v).length;
for (const t of Object.keys(MINES)) st.mines[t] = mines.filter((m) => m.type === t).length;
st.roadTiles = road.reduce((a, b) => a + b, 0);
st.walkable = +(obst.filter((o) => o === O.NONE || o === O.ICE).length / landN * 100).toFixed(1);
fs.writeFileSync(out + 'thong-ke.json', JSON.stringify(st, null, 2));
console.log(JSON.stringify({ ...st, crops: crops.map((c) => `${c.name} @${c.tx0},${c.ty0}`) }, null, 1));
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s → ${out}`);

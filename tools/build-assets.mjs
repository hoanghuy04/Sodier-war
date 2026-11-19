// Build every asset the game client needs into client/assets/.
// Usage: node tools/build-assets.mjs [seed] [--only=map|mines|units]
//   map    → client/assets/map/<seed>/c_<cx>_<cy>.png (32×32 tiles, 16 px/tile), overview.png (4 px/tile), minimap.png (1 px/tile)
//   mines  → client/assets/mines/<type>.png, <type>-own.png, <type>-enemy.png + mines.json (anchors)
//   units  → client/assets/units/ (AI sprite sheets + atlas.json)
import fs from 'node:fs';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { Px, savePng, outline } from './mapgen/core.mjs';
import { W, H, B, O } from './mapgen/gen.mjs';
import { scene, OWN } from './mapgen/scene.mjs';

const ROOT = new URL('../', import.meta.url).pathname;
const CH = 32; // tiles per chunk side

if (!isMainThread) {
  const { seed, jobs } = workerData;
  const sc = scene(seed);
  for (const [cx, cy, file] of jobs) {
    const img = sc.renderDetail(cx * CH, cy * CH, CH, CH, () => null, { noMineModels: true });
    savePng(img, file);
    parentPort.postMessage(1);
  }
  process.exit(0);
}

const seed = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 20261111);
const only = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7);
const want = (k) => !only || only === k;
const OUT = ROOT + 'client/assets/';
const t0 = Date.now();

if (want('map')) {
  const dir = `${OUT}map/${seed}/`;
  fs.mkdirSync(dir, { recursive: true });
  const sc = scene(seed);
  savePng(sc.renderOverview(), dir + 'overview.png');
  // minimap: 1 px per tile
  const { biome, obst, road } = sc.map;
  const mm = new Px(W, H);
  const C = ['#5a9a3c', '#9aa64c', '#2f5e28', '#2c4a30', '#e4ebf1', '#e0bd78', '#b4643a', '#4e5933', '#3a3634', '#9a937a', '#6a2a1e', '#a8402e', '#d6dce6', '#e6ebf3', '#c86a3a', '#b8321e'];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, o = obst[i];
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
  savePng(mm, dir + 'minimap.png');
  // detail chunks in parallel
  const all = [];
  for (let cy = 0; cy < H / CH; cy++) for (let cx = 0; cx < W / CH; cx++) all.push([cx, cy, `${dir}c_${cx}_${cy}.png`]);
  const n = Math.max(1, Math.min(os.cpus().length - 1, 8));
  let done = 0;
  await Promise.all(Array.from({ length: n }, (_, k) => new Promise((res, rej) => {
    const w = new Worker(new URL(import.meta.url), { workerData: { seed, jobs: all.filter((_, i) => i % n === k) } });
    w.on('message', () => { done++; if (done % 8 === 0) process.stdout.write(`\rmap chunks ${done}/${all.length}`); });
    w.on('error', rej); w.on('exit', res);
  })));
  console.log(`\nmap ${seed}: ${all.length} chunks (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}

// hand-drawn mines (tools/spriteimport/mines.mjs) are kept: rebuild the placeholder models only with --only=mines --force
if (want('mines') && (!fs.existsSync(OUT + 'mines/mines.json') || !JSON.parse(fs.readFileSync(OUT + 'mines/mines.json', 'utf8')).iron?.hd || process.argv.includes('--force'))) {
  const dir = OUT + 'mines/';
  fs.mkdirSync(dir, { recursive: true });
  const sc = scene(seed);
  const meta = {};
  for (const [t, art] of Object.entries(sc.mineArt)) {
    savePng(art.model, `${dir}${t}.png`);
    savePng(outline(art.model, OWN.own[0], OWN.own[1]), `${dir}${t}-own.png`);
    savePng(outline(art.model, OWN.enemy[0], OWN.enemy[1]), `${dir}${t}-enemy.png`);
    savePng(outline(art.model, '#ffffff', '#9a9a9a'), `${dir}${t}-hover.png`);
    // anchor: same placement as scene.renderDetail. Pixel position of model top-left relative to the mine's world point (tiles·16)
    const big = t === 'diamond';
    const cx = big ? 0 : 0.5 * 16, bottom = (big ? 2 : 1.5) * 16 + (big ? 16 : 8);
    meta[t] = { w: art.model.w, h: art.model.h, dx: Math.round(cx - art.model.w / 2), dy: Math.round(bottom - art.model.h) };
  }
  fs.writeFileSync(dir + 'mines.json', JSON.stringify(meta));
  console.log('mines ok');
}

if (want('units')) {
  const src = ROOT + 'docs/design/assets/units-ai/', dir = OUT + 'units/';
  fs.mkdirSync(dir, { recursive: true });
  const atlas = JSON.parse(fs.readFileSync(src + 'atlas.json', 'utf8'));
  delete atlas['kiem-si-b'];
  for (const id of Object.keys(atlas)) {
    fs.copyFileSync(`${src}${id}.png`, `${dir}${id}.png`);
    if (fs.existsSync(`${src}${id}-do.png`)) fs.copyFileSync(`${src}${id}-do.png`, `${dir}${id}-do.png`);
  }
  // monster camp creatures (tools/unitgen/beasts.mjs → docs/design/assets/units-beasts/)
  const bsrc = ROOT + 'docs/design/assets/units-beasts/';
  if (fs.existsSync(bsrc + 'atlas.json')) {
    const ba = JSON.parse(fs.readFileSync(bsrc + 'atlas.json', 'utf8'));
    for (const id of Object.keys(ba)) { fs.copyFileSync(`${bsrc}${id}.png`, `${dir}${id}.png`); atlas[id] = ba[id]; }
  }
  fs.writeFileSync(dir + 'atlas.json', JSON.stringify(atlas));
  console.log('units ok:', Object.keys(atlas).length);
}

// Re-render map chunks after trees / rocks were cleared in the open world.
// The static chunks (client/assets/map/<seed>/) have every obstacle baked in; a chunk that holds a cleared tile is drawn
// again here with those tiles emptied and saved to <data>/map-live/<seed>/c_<cx>_<cy>.png, served at /live/<seed>/….
// Rendering runs in a worker thread (the map scene costs ~1 s and ~240 MB to build), started on demand and closed when idle.
import fs from 'node:fs';
import path from 'node:path';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const CH = 32; // tiles per chunk side (same as tools/build-assets.mjs)

if (!isMainThread && workerData?.chunkr) {
  const { scene } = await import('../tools/mapgen/scene.mjs');
  const { O } = await import('../tools/mapgen/gen.mjs');
  const { savePng } = await import('../tools/mapgen/core.mjs');
  const sc = scene(workerData.seed);
  parentPort.on('message', ({ cx, cy, cleared, file }) => {
    for (const i of cleared) sc.map.obst[i] = O.NONE;
    const img = sc.renderDetail(cx * CH, cy * CH, CH, CH, () => null, { noMineModels: true });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    savePng(img, file + '.tmp');
    fs.renameSync(file + '.tmp', file);
    parentPort.postMessage({ cx, cy });
  });
}

/** chunks whose picture a cleared tile touches (sprites reach ~2 tiles up and 1 sideways, shadows 1 down) */
export function chunksOf(tx, ty) {
  const out = new Set();
  for (const [x, y] of [[tx - 1, ty - 2], [tx + 1, ty - 2], [tx - 1, ty + 1], [tx + 1, ty + 1]]) out.add(Math.floor(Math.max(0, x) / CH) + ',' + Math.floor(Math.max(0, y) / CH));
  return [...out];
}

export class ChunkRenderer {
  /** @param {{seed:number, dir:string, staticDir:string, W:number, getCleared:()=>Iterable<number>, onDone:(key:string, ver:string)=>void}} o */
  constructor(o) {
    this.o = o; this.dir = path.join(o.dir, 'map-live', String(o.seed));
    this.ver = new Map(); this.queue = []; this.busy = false; this.worker = null; this.idle = null;
    try { for (const f of fs.readdirSync(this.dir)) { const m = /^c_(\d+)_(\d+)\.png$/.exec(f); if (m) this.ver.set(m[1] + ',' + m[2], this.stamp(path.join(this.dir, f))); } } catch {}
  }
  stamp(file) { return Math.floor(fs.statSync(file).mtimeMs / 1000).toString(36); }
  file(key) { const [cx, cy] = key.split(','); return path.join(this.dir, `c_${cx}_${cy}.png`); }
  /** at start: every chunk with a cleared tile must exist and be newer than the static art */
  check() {
    const need = new Set(), W = this.o.W;
    for (const i of this.o.getCleared()) for (const k of chunksOf(i % W, Math.floor(i / W))) need.add(k);
    for (const k of need) {
      const [cx, cy] = k.split(','), f = this.file(k);
      let ok = false;
      try { ok = fs.statSync(f).mtimeMs >= fs.statSync(path.join(this.o.staticDir, `c_${cx}_${cy}.png`)).mtimeMs; } catch {}
      if (!ok) this.add([k]);
    }
  }
  add(keys) { for (const k of keys) if (!this.queue.includes(k)) this.queue.push(k); this.pump(); }
  pump() {
    if (this.busy || !this.queue.length) return;
    clearTimeout(this.idle);
    if (!this.worker) {
      this.worker = new Worker(new URL(import.meta.url), { workerData: { chunkr: true, seed: this.o.seed } });
      this.worker.on('message', ({ cx, cy }) => {
        const k = cx + ',' + cy, v = this.stamp(this.file(k));
        this.ver.set(k, v); this.busy = false;
        this.o.onDone(k, v);
        this.pump();
        if (!this.busy) this.idle = setTimeout(() => { this.worker?.terminate(); this.worker = null; }, 60_000);
      });
      this.worker.on('error', (e) => { console.error('chunkr', e); this.worker = null; this.busy = false; });
    }
    const k = this.queue.shift(), [cx, cy] = k.split(',').map(Number);
    this.busy = true;
    this.worker.postMessage({ cx, cy, cleared: [...this.o.getCleared()], file: this.file(k) });
  }
  versions() { return Object.fromEntries(this.ver); }
}

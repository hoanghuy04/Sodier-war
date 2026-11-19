// Static world: generated map, walkability, terrain speed, A* path finding.
import { generate, W, H, O, BIOME_INFO, blocks } from '../tools/mapgen/gen.mjs';

export class World {
  constructor(seed) {
    this.seed = seed;
    const m = (this.map = generate(seed));
    this.W = W; this.H = H;
    this.block = new Uint8Array(W * H);
    this.speed = new Float32Array(W * H);
    this.wells = [];
    for (let i = 0; i < W * H; i++) {
      const o = m.obst[i];
      this.block[i] = blocks(o) ? 1 : 0;
      let s = BIOME_INFO[m.biome[i]].speed;
      if (m.road[i]) s = 1.15;
      if (o === O.ICE) s = 0.7;
      this.speed[i] = s;
      if (o === O.WELL) this.wells.push({ x: (i % W) + 0.5, y: Math.floor(i / W) + 0.5 });
    }
    // mine centre in world tiles (3×3 footprint centred on the tile, diamond 4×4 centred on the tile corner)
    this.mines = m.mines.map((q, id) => ({ id, type: q.type, x: q.type === 'diamond' ? q.x : q.x + 0.5, y: q.type === 'diamond' ? q.y : q.y + 0.5, tx: q.x, ty: q.y }));
    this.spawns = m.spawns.map((s) => ({ n: s.n, x: s.x + 0.5, y: s.y + 0.5 }));
  }
  walkable(x, y) {
    const tx = Math.floor(x), ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) return false;
    const i = ty * W + tx;
    return !this.block[i] && !(this.dyn && this.dyn[i]);
  }
  /** a per-game view of the shared map with its own layer of blocked tiles (structures in the open world) */
  view() { const v = Object.create(this); v.dyn = new Uint8Array(W * H); v.block = this.block.slice(); return v; } // own copy of block: cleared trees / rocks
  dynAt(x, y) { const tx = Math.floor(x), ty = Math.floor(y); return !!this.dyn && tx >= 0 && ty >= 0 && tx < W && ty < H && !!this.dyn[ty * W + tx]; }
  speedAt(x, y) {
    const tx = Math.max(0, Math.min(W - 1, Math.floor(x))), ty = Math.max(0, Math.min(H - 1, Math.floor(y)));
    return this.speed[ty * W + tx] || 1;
  }
  /** nearest walkable tile centre to (x, y) within r tiles (BFS by rings) */
  nearestFree(x, y, r = 8) {
    if (this.walkable(x, y)) return { x, y };
    const tx = Math.floor(x), ty = Math.floor(y);
    let best = null, bd = 1e9;
    for (let d = 1; d <= r; d++) {
      for (let j = -d; j <= d; j++) for (let i = -d; i <= d; i++) {
        if (Math.max(Math.abs(i), Math.abs(j)) !== d) continue;
        const cx = tx + i + 0.5, cy = ty + j + 0.5;
        if (!this.walkable(cx, cy)) continue;
        const dd = (cx - x) ** 2 + (cy - y) ** 2;
        if (dd < bd) { bd = dd; best = { x: cx, y: cy }; }
      }
      if (best) return best;
    }
    return null;
  }
  lineFree(x0, y0, x1, y1) {
    const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 0.25);
    for (let k = 1; k <= n; k++) {
      const t = k / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      if (!this.walkable(x, y)) return false;
      // keep a little clearance so the path does not shave corners
      if (!this.walkable(x + 0.3, y) || !this.walkable(x - 0.3, y) || !this.walkable(x, y + 0.3) || !this.walkable(x, y - 0.3)) return false;
    }
    return true;
  }
  /** 13/11/2026: a way to a target shut in by structures (walls). A* that may cross structure tiles at a high cost;
   *  returns { pts: walkable tiles up to the first structure, hit: {x, y} first structure tile } or null */
  pathThrough(x0, y0, x1, y1, maxNodes = 120000) {
    const s = this.nearestFree(x0, y0, 3); if (!s || !this.dyn) return null;
    const sx = Math.floor(s.x), sy = Math.floor(s.y), gx = Math.floor(x1), gy = Math.floor(y1);
    if (gx < 0 || gy < 0 || gx >= W || gy >= H) return null;
    const N = W * H, start = sy * W + sx, goal = gy * W + gx, dyn = this.dyn;
    const gs = this._g ?? (this._g = new Float32Array(N)), from = this._f ?? (this._f = new Int32Array(N)), seen = this._s ?? (this._s = new Uint32Array(N)), closed = this._c ?? (this._c = new Uint32Array(N));
    const stamp = (this._stamp = (this._stamp ?? 0) + 1);
    const heap = new Heap(), h = (i) => Math.abs((i % W) - gx) + Math.abs(((i / W) | 0) - gy);
    gs[start] = 0; from[start] = -1; seen[start] = stamp; heap.push(start, h(start));
    let n = 0, found = false;
    while (heap.size) {
      const cur = heap.pop();
      if (closed[cur] === stamp) continue;
      closed[cur] = stamp;
      if (cur === goal) { found = true; break; }
      if (++n > maxNodes) break;
      const cx = cur % W, cy = (cur / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const ni = ny * W + nx; if (this.block[ni]) continue;
        const ng = gs[cur] + (dyn[ni] ? 12 : 1 / this.speed[ni]); // breaking through costs like a long walk round
        if (seen[ni] === stamp && ng >= gs[ni]) continue;
        seen[ni] = stamp; gs[ni] = ng; from[ni] = cur; heap.push(ni, ng + h(ni));
      }
    }
    if (!found) return null;
    const tiles = []; for (let k = goal; k !== -1; k = from[k]) tiles.push(k);
    tiles.reverse();
    const i = tiles.findIndex((k) => dyn[k]); if (i < 0) return null;
    return { pts: tiles.slice(0, i).map((k) => ({ x: (k % W) + 0.5, y: ((k / W) | 0) + 0.5 })), hit: { x: (tiles[i] % W) + 0.5, y: ((tiles[i] / W) | 0) + 0.5 } };
  }
  /** A* on the tile grid (8 directions, no corner cutting). Returns smoothed waypoint list (tile centres) or null. */
  path(x0, y0, x1, y1, maxNodes = 250000) {
    const s = this.nearestFree(x0, y0, 3), g = this.nearestFree(x1, y1, 10);
    if (!s || !g) return null;
    const sx = Math.floor(s.x), sy = Math.floor(s.y), gx = Math.floor(g.x), gy = Math.floor(g.y);
    const N = W * H, start = sy * W + sx, goal = gy * W + gx;
    if (start === goal) return [g];
    const gs = this._g ?? (this._g = new Float32Array(N));
    const from = this._f ?? (this._f = new Int32Array(N));
    const seen = this._s ?? (this._s = new Uint32Array(N));
    this._stamp = (this._stamp ?? 0) + 1;
    const stamp = this._stamp;
    const heap = new Heap();
    const h = (i) => { const dx = Math.abs((i % W) - gx), dy = Math.abs(((i / W) | 0) - gy); return (dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy)) / 1.15; };
    gs[start] = 0; from[start] = -1; seen[start] = stamp;
    heap.push(start, h(start));
    let n = 0, found = false;
    const D = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
    const closed = this._c ?? (this._c = new Uint32Array(N));
    while (heap.size) {
      const cur = heap.pop();
      if (closed[cur] === stamp) continue;
      closed[cur] = stamp;
      if (cur === goal) { found = true; break; }
      if (++n > maxNodes) break;
      const cx = cur % W, cy = (cur / W) | 0;
      for (const [dx, dy, c] of D) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const ni = ny * W + nx;
        const dyn = this.dyn;
        if (this.block[ni] || (dyn && dyn[ni])) continue;
        if (dx && dy && (this.block[cy * W + nx] || this.block[ny * W + cx] || (dyn && (dyn[cy * W + nx] || dyn[ny * W + cx])))) continue;
        const ng = gs[cur] + c / this.speed[ni];
        if (seen[ni] === stamp && ng >= gs[ni]) continue;
        seen[ni] = stamp; gs[ni] = ng; from[ni] = cur;
        heap.push(ni, ng + h(ni));
      }
    }
    if (!found) return null;
    const pts = [];
    for (let k = goal; k !== -1; k = from[k]) pts.push({ x: (k % W) + 0.5, y: ((k / W) | 0) + 0.5 });
    pts.reverse();
    pts[pts.length - 1] = g;
    // string pulling
    const out = [];
    let a = { x: x0, y: y0 }, k = 0;
    while (k < pts.length) {
      let far = k;
      for (let j = Math.min(pts.length - 1, k + 40); j > k; j--) if (this.lineFree(a.x, a.y, pts[j].x, pts[j].y)) { far = j; break; }
      out.push(pts[far]); a = pts[far]; k = far + 1;
    }
    return out;
  }
}

class Heap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(key, pri) {
    const k = this.k, v = this.v; let i = k.length; k.push(key); v.push(pri);
    while (i > 0) { const p = (i - 1) >> 1; if (v[p] <= pri) break; k[i] = k[p]; v[i] = v[p]; i = p; }
    k[i] = key; v[i] = pri;
  }
  pop() {
    const k = this.k, v = this.v, top = k[0], lk = k.pop(), lv = v.pop();
    if (k.length) {
      let i = 0; const n = k.length;
      for (;;) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && v[c + 1] < v[c]) c++; if (v[c] >= lv) break; k[i] = k[c]; v[i] = v[c]; i = c; }
      k[i] = lk; v[i] = lv;
    }
    return top;
  }
}

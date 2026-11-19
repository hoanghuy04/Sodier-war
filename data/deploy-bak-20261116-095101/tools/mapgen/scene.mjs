// Map scene: generated map + pixel renderers (detail 16 px/tile, overview 4 px/tile). Shared by render.mjs (docs) and the game asset build.
import fs from 'node:fs';
import { Px, savePng, smooth, noise, outline, mix } from './core.mjs';
import { generate, W, H, B, O, BIOME_INFO, MINES, segDist, halfWidth } from './gen.mjs';
import * as A from './art.mjs';
import { readPng } from '../spriteimport/png.mjs';

export const OWN = { own: ['#3EE06B', '#1F7A3A', '#3a6ff0'], enemy: ['#FF4A4A', '#8A1F1F', '#f08a24'] };

// hand-drawn trees / rocks (tools/spriteimport/obstacles.mjs); without them the procedural art.mjs ones are used
const HAND = (() => {
  try {
    const dir = new URL('./obstacles/', import.meta.url).pathname;
    const meta = JSON.parse(fs.readFileSync(dir + 'obstacles.json', 'utf8'));
    const sheet = readPng(dir + 'obstacles.png');
    const cut = ([x, y, w, h], flip) => { const p = new Px(w, h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.d[j * w + i] = sheet.d[(y + j) * sheet.w + x + (flip ? w - 1 - i : i)]; return p; };
    return { meta, cut };
  } catch { return null; }
})();

export function scene(seed) {
  const map = generate(seed);
  const { biome, obst, road, mines, spawns, villages, towers } = map;
  const idx = (x, y) => y * W + x;
  const clampT = (v, n) => Math.max(0, Math.min(n - 1, v));
  const bKind = (i) => BIOME_INFO[biome[i]].id;

  // distance (tiles) from land inside water / ice
  const wdist = new Uint8Array(W * H);
  {
    const q = [];
    for (let i = 0; i < W * H; i++) if (obst[i] === O.WATER || obst[i] === O.ICE) wdist[i] = 255; else q.push(i);
    for (let h = 0; h < q.length; h++) {
      const i = q[h], x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const ni = idx(nx, ny);
        if (wdist[ni] === 255) { wdist[ni] = wdist[i] + 1; q.push(ni); }
      }
    }
  }

  // ---------------- vector paths (roads, canyons) ----------------
  function pathIndex(paths) {
    const buckets = new Map();
    for (const p of paths)
      for (let k = 0; k + 1 < p.pts.length; k++) {
        const [ax, ay] = p.pts[k], [bx, by] = p.pts[k + 1], r = Math.ceil(p.w + 1);
        for (let y = Math.floor(Math.min(ay, by)) - r; y <= Math.ceil(Math.max(ay, by)) + r; y++)
          for (let x = Math.floor(Math.min(ax, bx)) - r; x <= Math.ceil(Math.max(ax, bx)) + r; x++) {
            const key = y * W + x;
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key).push([p, k]);
          }
      }
    /** signed distance (tiles) to the nearest path edge (< 0 inside), and that path's half-width & distance to centre */
    return (fx, fy) => {
      const list = buckets.get(Math.floor(fy) * W + Math.floor(fx));
      let best = 9, bw = 0, bd = 9;
      if (list) for (const [p, k] of list) {
        const [d, t] = segDist(fx, fy, p.pts[k][0], p.pts[k][1], p.pts[k + 1][0], p.pts[k + 1][1]);
        const hw = halfWidth(p, k + t);
        if (d - hw < best) { best = d - hw; bw = hw; bd = d; }
      }
      return [best, bw, bd];
    };
  }
  const roadAt = pathIndex(map.roadPaths), chasmAt = pathIndex(map.chasmPaths);

  // ---------------- ground pass ----------------
  function makeMasks(S) {
    const k = S / 16;
    const tileAt = (wx, wy, amp, s) => {
      const jx = ((smooth(wx, wy, 6 * k + 1, s) - 0.5) * 0.4 + (smooth(wx, wy, 26 * k + 2, s + 7) - 0.5) * 1.3) * amp * S;
      const jy = ((smooth(wx, wy, 6 * k + 1, s + 1) - 0.5) * 0.4 + (smooth(wx, wy, 26 * k + 2, s + 8) - 0.5) * 1.3) * amp * S;
      return idx(clampT(Math.floor((wx + jx) / S), W), clampT(Math.floor((wy + jy) / S), H));
    };
    const wv = (tx, ty) => { if (tx < 0 || ty < 0 || tx >= W || ty >= H) return 0; const o = obst[idx(tx, ty)]; return o === O.WATER || o === O.ICE ? 1 : 0; };
    // bilinear field over tile centres -> rounded shores instead of tile steps
    const waterF = (wx, wy) => {
      const fx = wx / S - 0.5, fy = wy / S - 0.5, x0 = Math.floor(fx), y0 = Math.floor(fy);
      const sm = (t) => t * t * (3 - 2 * t), u = sm(fx - x0), v = sm(fy - y0);
      return wv(x0, y0) * (1 - u) * (1 - v) + wv(x0 + 1, y0) * u * (1 - v) + wv(x0, y0 + 1) * (1 - u) * v + wv(x0 + 1, y0 + 1) * u * v + (smooth(wx, wy, 7 * k + 1, 201) - 0.5) * 0.3;
    };
    const isWater = (wx, wy) => waterF(wx, wy) > 0.5;
    const waterTile = (wx, wy) => {
      const tx = Math.floor(wx / S), ty = Math.floor(wy / S);
      for (const [i, j] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (wv(tx + i, ty + j)) return idx(tx + i, ty + j);
      return idx(clampT(tx, W), clampT(ty, H));
    };
    const wob = (wx, wy, s, a) => (smooth(wx, wy, 5 * k + 1, s) - 0.5) * a;
    const isChasm = (wx, wy) => chasmAt(wx / S, wy / S)[0] + wob(wx, wy, 203, 0.35) < 0;
    const road = (wx, wy) => { const [d, hw, dc] = roadAt(wx / S, wy / S); return [d + wob(wx, wy, 205, 0.3), hw, dc]; };
    return { k, tileAt, isWater, waterTile, isChasm, road };
  }
  function groundPixel(M, S, wx, wy) {
    const { k, tileAt, isWater, waterTile, isChasm, road } = M;
    const bi = tileAt(wx, wy, 1.3, 91);
    let c = A.ground(bKind(bi), wx, wy, S);
    const [rd, rhw, rdc] = road(wx, wy);
    const hellRoad = biome[bi] === B.HELL || biome[bi] === B.HELLB;
    if (rd < 0 && hellRoad) c = A.ground('hellb', wx, wy, S); // roads turn to brick in Đất Ngục
    else if (rd < 0) {
      c = A.ground('road', wx, wy, S);
      if (rd > -0.14) c = mix(c, '#6a5232', 0.35); // worn edge
      else if (rhw > 1 && Math.abs(rdc - rhw * 0.42) < 0.07) c = mix(c, '#7a5e38', 0.6); // wheel ruts
      else if (rhw > 1 && rdc < 0.12 && noise(wx, wy, 209) > 0.4) c = '#8a9a4a'; // grass in the middle
    } else if (rd < 0.12 && noise(wx, wy, 211) > 0.5) c = mix(c, '#a8895a', 0.5); // dust at the side
    if (isWater(wx, wy)) {
      const ti = waterTile(wx, wy), b = biome[ti];
      const kind = obst[ti] === O.ICE ? 'ice' : b === B.HELL || b === B.HELLB ? 'lava' : b === B.SWAMP ? 'swamp' : b === B.DESERT ? 'oasis' : 'pond';
      const e = Math.max(1, Math.round(2 * k));
      const shore = !isWater(wx + e, wy) || !isWater(wx - e, wy) || !isWater(wx, wy + e) || !isWater(wx, wy - e);
      return A.waterColor(kind, wx, wy, shore ? 0 : Math.min(2, wdist[ti] - 1 + (smooth(wx, wy, 5 * k + 1, 207) > 0.5 ? 1 : 0)), k);
    }
    const e = Math.max(1, Math.round(1.5 * k));
    if (isWater(wx + e, wy) || isWater(wx - e, wy) || isWater(wx, wy + e) || isWater(wx, wy - e)) {
      const ti = tileAt(wx, wy, 0.9, 91);
      const kind = obst[ti] === O.ICE || biome[ti] === B.TUNDRA ? 'ice' : biome[ti] === B.HELL || biome[ti] === B.HELLB ? 'lava' : biome[ti] === B.SWAMP ? 'swamp' : biome[ti] === B.DESERT ? 'oasis' : 'pond';
      return mix(c, A.WATER[kind].rim, 0.7);
    }
    if (isChasm(wx, wy)) {
      let up = 1, dn = 1;
      while (up < 14 * k && isChasm(wx, wy - up)) up++;
      while (dn < 4 * k && isChasm(wx, wy + dn)) dn++;
      return A.chasmColor(up, dn, wx, wy, S);
    }
    if (isChasm(wx, wy + 1)) return '#e0a070';
    return c;
  }

  // ---------------- detail render (16 px / tile) ----------------
  const S16 = 16;
  const mineArt = {};
  for (const t of Object.keys(A.MINE_ART)) mineArt[t] = A.MINE_ART[t]();
  const cache = new Map();
  const spr = (key, fn) => { if (!cache.has(key)) cache.set(key, fn()); return cache.get(key); };

  function renderDetail(tx0, ty0, tw, th, owners = () => null, opts = {}) {
    const S = S16, M = makeMasks(S);
    const p = new Px(tw * S, th * S);
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) p.set(x, y, groundPixel(M, S, tx0 * S + x, ty0 * S + y));
    const ox = -tx0 * S, oy = -ty0 * S;
    const inView = (x, y, m = 4) => x >= tx0 - m && y >= ty0 - m && x < tx0 + tw + m && y < ty0 + th + m;
    const tall = []; // [bottomY, draw()]
    // flat things: mine decals, the plaza, ownership ground tint
    for (const [mi, m] of mines.entries()) {
      if (!inView(m.x, m.y, 5)) continue;
      const art = mineArt[m.type], big = m.type === 'diamond';
      const cx = (m.x + (big ? 0 : 0.5)) * S + ox, bottom = (m.y + (big ? 2 : 1.5)) * S + oy + (big ? 16 : 8);
      const dx = Math.round(cx - art.model.w / 2), dy = Math.round(bottom - art.model.h);
      p.blit(art.decal, dx, dy);
      if (opts.noMineModels) continue;
      const own = owners(mi, m);
      if (own) p.ellipse(cx, bottom - (big ? 24 : 16), big ? 34 : 26, big ? 22 : 16, OWN[own][0] + '26');
      tall.push([bottom, () => {
        if (own) p.blit(spr(`ol-${m.type}-${own}`, () => outline(art.model, OWN[own][0], OWN[own][1])), dx - 2, dy - 2);
        p.blit(art.model, dx, dy);
        if (own) { const fx = dx + 3, fy = dy + (big ? 20 : 8); p.rect(fx, fy, 1, 13, '#3a2416'); p.rect(fx + 1, fy, 7, 5, OWN[own][2]); p.rect(fx + 1, fy + 4, 6, 1, mix(OWN[own][2], '#000000', 0.35)); p.set(fx + 3, fy + 2, '#ffffff'); }
      }]);
    }
    for (const d of map.decor) {
      if (!inView(d.x, d.y, 4)) continue;
      if (d.t === 'altar') { const a = spr('altar', A.altar); p.blit(a, d.x * S + ox - 48, d.y * S + oy - 48); continue; }
      const s = spr(`d-${d.t}-${d.v % 7}`, () => A.decorSprite(d.t, d.v));
      p.blit(s, d.x * S + ox + ((d.v % 5) - 2), d.y * S + oy + ((d.v >> 3) % 3) - 2);
    }
    for (const s of spawns) {
      if (!inView(s.x, s.y, 4)) continue;
      const c = spr('camp', A.spawnCamp);
      tall.push([s.y * S + oy + 30, () => p.blit(c, s.x * S + ox + 8 - 20, s.y * S + oy + 8 - 30)]);
    }
    // obstacles drawn per tile
    for (let ty = ty0 - 3; ty < ty0 + th + 3; ty++)
      for (let tx = tx0 - 2; tx < tx0 + tw + 2; tx++) {
        if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
        const o = obst[idx(tx, ty)], v = Math.floor(noise(tx, ty, 301) * 1000), b = biome[idx(tx, ty)];
        const bx = tx * S + ox + 8, by = ty * S + oy + 15;
        const jx = (v % 9) - 4, jy = ((v >> 4) % 7) - 3;
        const put = (s, ax, ay, sh) => tall.push([by + jy, () => p.blit(s, bx + jx - ax, by + jy - ay)]);
        const shadows = (rx, ry) => p.shadow(bx + jx + 3, by + jy - 2, rx, ry, 0.7);
        // hand-drawn sprite for this obstacle: a variant picked by the tile noise, mirrored on half of the tiles
        const hk = !HAND ? null : o === O.TREE ? 'oak' : o === O.PINE ? (b === B.TUNDRA ? 'snowpine' : 'pine') : o === O.PALM ? 'palm' : o === O.DEADTREE ? 'dead' : o === O.CHARRED ? 'charred' : o === O.CACTUS ? 'cactus'
          : o === O.BOULDER ? (b === B.BADLANDS || b === B.DESERT ? 'rockRed' : b === B.TUNDRA ? 'rockSnow' : 'rockGrey') : null;
        if (hk && HAND.meta[hk]?.length) {
          const list = HAND.meta[hk], vi = v % list.length, flip = ((v >> 5) & 1) === 1, sp = spr(`h-${hk}-${vi}-${flip}`, () => HAND.cut(list[vi], flip));
          const rock = hk.startsWith('rock');
          shadows(rock ? 7 : Math.max(4, Math.round(sp.w * 0.35)), rock ? 3 : 4);
          put(sp, Math.floor(sp.w / 2), sp.h - (rock ? 3 : 2));
          continue;
        }
        switch (o) {
          case O.TREE: shadows(10, 5); put(spr(`tree${v % 18}`, () => A.tree(v % 18)), 13, 27); break;
          case O.PINE: { const sn = b === B.TUNDRA; shadows(7, 4); put(spr(`pine${v % 6}${sn}`, () => A.pine(v % 6, sn)), 9, 27); break; }
          case O.BOULDER: { const kd = b === B.BADLANDS || b === B.DESERT ? 'red' : b === B.TUNDRA ? 'snow' : 'grey'; shadows(7, 3); put(spr(`bo${v % 6}${kd}`, () => A.boulder(v % 6, kd)), 9, 13); break; }
          case O.CACTUS: shadows(4, 2); put(spr(`ca${v % 4}`, () => A.cactus(v % 4)), 6, 17); break;
          case O.DEADTREE: shadows(5, 2); put(spr(`dt${v % 3}`, () => A.deadTree(v % 3)), 9, 23); break;
          case O.CHARRED: shadows(5, 2); put(spr(`ch${v % 3}`, () => A.deadTree(v % 3, true)), 9, 23); break;
          case O.PALM: shadows(8, 4); put(spr(`pa${v % 2}`, () => A.palm(v % 2)), 12, 27); break;
          case O.WELL: put(spr('well', A.well), 9, 21); break;
          case O.TOWER: shadows(9, 4); put(spr(`tw`, () => A.tower(0)), 12, 43); break;
          case O.PILLAR: shadows(6, 3); put(spr(`pi${v % 3}${v % 4 === 0}`, () => A.pillar(v % 3, v % 4 === 0)), 7, 31); break;
          case O.WALL: put(spr(`wa${v % 3}`, () => A.wallPiece(v % 3)), 10, 15); break;
        }
      }
    for (const h of map.objects.filter((h) => h.t === 'house' && obst[idx(h.x, h.y)] === O.HOUSE && inView(h.x, h.y, 3)))
      tall.push([(h.y + 2) * S + oy, () => p.blit(spr(`ho${h.v % 30}`, () => A.house(h.v % 30)), h.x * S + ox - 2, h.y * S + oy - 4)]);
    tall.sort((a, b) => a[0] - b[0]).forEach(([, f]) => f());
    return p;
  }

  // ---------------- overview (4 px / tile) ----------------
  function shrink(src, f) {
    const p = new Px(Math.ceil(src.w / f), Math.ceil(src.h / f));
    for (let y = 0; y < p.h; y++)
      for (let x = 0; x < p.w; x++) {
        const cnt = new Map(); let solid = 0;
        for (let j = 0; j < f; j++) for (let i = 0; i < f; i++) { const v = src.get(x * f + i, y * f + j); if (v & 255) { solid++; cnt.set(v, (cnt.get(v) ?? 0) + 1); } }
        if (solid * 2 < f * f) continue;
        p.d[y * p.w + x] = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0];
      }
    return p;
  }
  function renderOverview() {
    const S = 4, M = makeMasks(S);
    const p = new Px(W * S, H * S);
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) p.set(x, y, groundPixel(M, S, x, y));
    const altar = shrink(A.altar(), 4); p.blit(altar, (W / 2) * S - 12, (H / 2) * S - 12);
    const LEAFS = [['#1c3618', '#2c5424', '#3e7430', '#58963e'], ['#1c3618', '#2a5026', '#3a6c34', '#4f8a42']];
    for (let ty = 0; ty < H; ty++)
      for (let tx = 0; tx < W; tx++) {
        const o = obst[idx(tx, ty)], b = biome[idx(tx, ty)], v = Math.floor(noise(tx, ty, 301) * 1000);
        const x = tx * S, y = ty * S;
        switch (o) {
          case O.TREE: {
            const L = LEAFS[v % 2], cx = x + 2 + ((v % 3) - 1), cy = y + 1 + (((v >> 3) % 3) - 1);
            p.shadow(cx + 1.5, cy + 2.5, 2.5, 1.5, 0.72);
            for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) {
              const d = i * i + j * j; if (d > 7.3) continue;
              const l = i + j;
              p.set(cx + i, cy + j, d > 5 && l > 0 ? L[0] : l <= -3 ? L[3] : l <= 0 ? L[2] : L[1]);
            }
            break;
          }
          case O.PINE: { const sn = b === B.TUNDRA; p.set(x + 2, y - 1, sn ? '#ffffff' : '#2c5236'); p.rect(x + 1, y, 3, 2, '#2c5236'); p.rect(x, y + 2, 5, 2, '#1f3d2a'); p.set(x + 1, y + 2, '#3f6e46'); p.set(x + 1, y, sn ? '#f0f5f8' : '#3f6e46'); p.set(x + 2, y + 4, '#4a2e1a'); break; }
          case O.BOULDER: { const red = b === B.BADLANDS || b === B.DESERT, sn = b === B.TUNDRA; p.rect(x, y + 1, 4, 3, red ? '#7a3a22' : '#5e5a56'); p.rect(x, y + 1, 3, 2, red ? '#bc6a40' : sn ? '#e8eef4' : '#9a958e'); p.set(x, y + 1, red ? '#dc9a68' : '#bdb7ae'); break; }
          case O.CACTUS: p.rect(x + 2, y, 1, 4, '#468a3a'); p.set(x + 1, y + 1, '#5f9e4a'); p.set(x + 3, y + 2, '#2f5e2a'); break;
          case O.DEADTREE: case O.CHARRED: { const c = o === O.CHARRED ? '#1e1a1a' : '#4a3e34'; p.rect(x + 2, y + 1, 1, 3, c); p.set(x + 1, y, c); p.set(x + 3, y, c); break; }
          case O.PALM: p.rect(x + 2, y + 2, 1, 2, '#8a6a3a'); p.rect(x, y + 1, 5, 1, '#3f8a3a'); p.rect(x + 1, y, 3, 1, '#5aaa4a'); break;
          case O.WELL: p.rect(x, y, 4, 4, '#9a937a'); p.rect(x + 1, y + 1, 2, 2, '#1e3a4a'); break;
          case O.TOWER: p.rect(x + 1, y - 3, 3, 6, '#7a4f2e'); p.rect(x, y - 4, 5, 2, '#a84a2a'); p.set(x + 2, y - 5, '#e8e0cc'); break;
          case O.PILLAR: p.rect(x + 1, y - 2, 2, 5, '#c4bea3'); p.set(x + 2, y - 2, '#827b66'); break;
          case O.WALL: p.rect(x, y + 1, 4, 3, '#9a937a'); p.rect(x, y + 1, 4, 1, '#c4bea3'); break;
        }
      }
    for (const h of map.objects.filter((h) => h.t === 'house' && obst[idx(h.x, h.y)] === O.HOUSE)) {
      const x = h.x * S, y = h.y * S;
      p.rect(x, y, 8, 8, '#6a5a42'); p.rect(x, y, 8, 2, '#9a937a'); p.rect(x, y, 1, 8, '#9a937a'); p.rect(x + 7, y, 1, 8, '#827b66'); p.line(x + 2, y + 3, x + 6, y + 6, '#3a2416');
    }
    for (const s of spawns) {
      const x = s.x * S + 2, y = s.y * S + 2;
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; p.rect(x + Math.cos(a) * 4, y + Math.sin(a) * 3, 1, 1, '#bdb7ae'); }
      p.set(x, y, '#ff7a1a'); p.rect(x + 2, y - 6, 1, 6, '#5a3a22'); p.rect(x + 3, y - 6, 3, 2, '#f2efe6');
    }
    for (const m of mines) {
      const art = mineArt[m.type], big = m.type === 'diamond';
      const mini = spr(`mini-${m.type}`, () => { const c = new Px(art.model.w, art.model.h); c.blit(art.decal, 0, 0); c.blit(art.model, 0, 0); return shrink(c, 4); });
      const cx = (m.x + (big ? 0 : 0.5)) * S, bottom = (m.y + (big ? 2 : 1.5)) * S + (big ? 4 : 2);
      p.blit(mini, Math.round(cx - mini.w / 2), Math.round(bottom - mini.h));
    }
    return p;
  }

  return { map, renderDetail, renderOverview, mineArt, makeMasks, groundPixel, idx, clampT, wdist };
}

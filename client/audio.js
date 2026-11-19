// Game sound (docs/design/24-am-thanh.md): Web Audio, one context, a few rules so a 200-unit fight never turns into noise:
// at most MAX_VOICES at once, the same sound ≥ GAP ms apart and ≤ PER_SEC per second, quieter with distance from the camera,
// panned left / right, a small random pitch shift. The context only starts after the first tap / key (browser rule).
import { S } from './state.js';

const T = 16; // world px per tile (same as render.js)
const BASE = '/assets/audio/', AV = '?v=20261114c'; // bump AV when a sound file changes (assets are cached for a week)
// id → { files, vol (0..1 group loudness), prio (1 high … 5 low) }
const f1 = (id, n = 1) => Array.from({ length: n }, (_, i) => `sfx/${id}_${i + 1}.mp3`);
export const SOUNDS = {
  // battle (positional)
  sword_clash: { files: f1('sword_clash', 2), vol: 0.5, prio: 4 },
  sword_swing: { files: f1('sword_swing'), vol: 0.35, prio: 5 },
  bow_release: { files: f1('bow_release'), vol: 0.3, prio: 5 },
  arrow_hit: { files: f1('arrow_hit'), vol: 0.3, prio: 5 },
  magic_orb_hit: { files: f1('magic_orb_hit'), vol: 0.4, prio: 4 },
  fireball_hit: { files: f1('fireball_hit'), vol: 0.55, prio: 3 },
  dragon_breath: { files: f1('dragon_breath'), vol: 0.5, prio: 3 },
  building_hit: { files: f1('building_hit'), vol: 0.4, prio: 4 },
  tower_cannon_fire: { files: f1('tower_cannon_fire'), vol: 0.5, prio: 3 },
  death_soldier: { files: f1('death_soldier'), vol: 0.3, prio: 4 },
  death_monster_big: { files: f1('death_monster_big'), vol: 0.55, prio: 3 },
  boss_warning: { files: f1('boss_warning'), vol: 0.6, prio: 2 },
  loot_epic: { files: f1('loot_epic'), vol: 0.6, prio: 2 },
  // my own events (not positional)
  level_up: { files: f1('level_up'), vol: 0.7, prio: 1 },
  hero_death: { files: f1('hero_death'), vol: 0.7, prio: 1 },
  boss_killed: { files: f1('boss_killed'), vol: 0.65, prio: 1 },
  build_done: { files: f1('build_done'), vol: 0.6, prio: 2 },
  upgrade_done: { files: f1('upgrade_done'), vol: 0.6, prio: 2 },
  base_alarm: { files: f1('base_alarm'), vol: 0.75, prio: 1 },
  mine_captured: { files: f1('mine_captured'), vol: 0.55, prio: 2 },
  mine_lost: { files: f1('mine_lost'), vol: 0.6, prio: 2 },
  loot_pickup: { files: f1('loot_pickup'), vol: 0.45, prio: 2 },
  quest_complete: { files: f1('quest_complete'), vol: 0.6, prio: 2 },
  ui_click: { files: f1('ui_click'), vol: 0.25, prio: 3 },
  ui_buy: { files: f1('ui_buy'), vol: 0.45, prio: 2 },
  ui_error: { files: f1('ui_error'), vol: 0.4, prio: 2 },
  // marching loops (14/11/2026, played with setLoops, not play)
  march_small_loop: { files: f1('march_small_loop'), vol: 0.22, prio: 5 },
  march_big_loop: { files: f1('march_big_loop'), vol: 0.25, prio: 5 },
  cavalry_group_loop: { files: f1('cavalry_group_loop'), vol: 0.2, prio: 5 },
  wings_loop: { files: f1('wings_loop'), vol: 0.18, prio: 5 },
  siege_roll_loop: { files: f1('siege_roll_loop'), vol: 0.16, prio: 5 },
  horse_gallop: { files: f1('horse_gallop'), vol: 0.18, prio: 5 },
};
/** looping sounds (marching): setLoops({ id: 0..1 }) — each fades in / out smoothly, the rest fade out */
const loops = new Map();
export function setLoops(want) {
  if (!ctx) return;
  const t = ctx.currentTime;
  for (const id of new Set([...loops.keys(), ...Object.keys(want)])) {
    const v = muted ? 0 : (want[id] ?? 0) * (SOUNDS[id]?.vol ?? 0.2), L = loops.get(id);
    if (!L) {
      if (v <= 0.001) continue;
      const buf = buffers.get(id)?.filter(Boolean)[0]; if (!buf) continue;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const gn = ctx.createGain(); gn.gain.value = 0; src.connect(gn).connect(master); src.start();
      gn.gain.setTargetAtTime(v, t, 0.35); loops.set(id, { src, gn, v });
    } else if (Math.abs(L.v - v) > 0.001) {
      L.gn.gain.setTargetAtTime(v, t, v > L.v ? 0.35 : 0.5); L.v = v;
      if (v <= 0.001) { const l = L; setTimeout(() => { if (l.v <= 0.001) { try { l.src.stop(); } catch {} loops.delete(id); } }, 3000); }
    }
  }
}
// background music (14/11/2026): calm while exploring, battle music while my army fights; a 1.5 s crossfade
const MUSIC = { calm: 'music/music_world_calm.mp3', battle: 'music/music_battle.mp3' }, MUSIC_VOL = 0.2; // soft (14/11/2026: was 0.32)
const tracks = {}; let musicWant = 'calm', musicOn = store0('sw-music', true), fadeT = 0;
function store0(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } }
export const musicEnabled = () => musicOn;
export function setMusicEnabled(v) { musicOn = !!v; try { localStorage.setItem('sw-music', JSON.stringify(musicOn)); } catch {} }
export function setMusic(kind) { if (MUSIC[kind]) musicWant = kind; }
function musicTick() {
  if (!ctx) return;
  for (const k of Object.keys(MUSIC)) {
    let a = tracks[k];
    const want = musicOn && !muted && volume > 0 && k === musicWant ? MUSIC_VOL * volume : 0;
    if (!a) { if (!want) continue; a = tracks[k] = new Audio(BASE + MUSIC[k] + AV); a.loop = true; a.volume = 0; }
    a.volume = Math.max(0, Math.min(1, a.volume + Math.sign(want - a.volume) * Math.min(Math.abs(want - a.volume), 0.04)));
    if (want > 0 && a.paused) a.play().catch(() => {});
    if (a.volume <= 0.001 && !a.paused) a.pause();
  }
}
setInterval(musicTick, 100);
const MAX_VOICES = 8, GAP = 80, PER_SEC = 6;
let ctx = null, master = null;
const buffers = new Map(), lastAt = new Map(), recent = new Map();
let voices = 0;
const store = { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
let volume = store.get('sw-vol', 0.7), muted = store.get('sw-mute', false);

export const soundVolume = () => volume;
export const soundMuted = () => muted;
export function setVolume(v) { volume = Math.max(0, Math.min(1, +v || 0)); store.set('sw-vol', volume); if (master) master.gain.value = muted ? 0 : volume; }
export function setMuted(m) { muted = !!m; store.set('sw-mute', muted); if (master) master.gain.value = muted ? 0 : volume; }

function start() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : volume; master.connect(ctx.destination);
  for (const [id, s] of Object.entries(SOUNDS)) s.files.forEach((f, i) => load(id, i, f));
}
async function load(id, i, f) {
  try {
    const r = await fetch(BASE + f + AV); const b = await ctx.decodeAudioData(await r.arrayBuffer());
    if (!buffers.has(id)) buffers.set(id, []); buffers.get(id)[i] = b;
  } catch (e) { console.warn('audio', f, e.message); }
}
for (const ev of ['pointerdown', 'touchstart', 'keydown']) addEventListener(ev, start, { capture: true, passive: true });

/** play a sound; (x, y) in world tiles → volume / pan from the camera (omit for UI sounds) */
const stats = {}, why = {};
export function play(id, x, y, gain = 1) {
  stats[id] = (stats[id] ?? 0) + 1;
  if (!ctx || muted || !volume) { why.off = (why.off ?? 0) + 1; return; }
  const s = SOUNDS[id], list = buffers.get(id)?.filter(Boolean); if (!s || !list?.length) { why.nobuf = (why.nobuf ?? 0) + 1; return; }
  const t = performance.now();
  if (t - (lastAt.get(id) ?? -1e9) < GAP) return;
  const rc = (recent.get(id) ?? []).filter((v) => t - v < 1000); if (rc.length >= PER_SEC) return;
  if (voices >= MAX_VOICES && s.prio >= 3) return; // when crowded only the important ones still play
  let g = s.vol * gain, pan = 0;
  if (x != null) {
    const cam = S.cam, z = cam.z || 1, vw = innerWidth / z / T, vh = innerHeight / z / T;
    const cx = cam.x / T + vw / 2, cy = cam.y / T + vh / 2, dx = x - cx, dy = y - cy;
    const d = Math.hypot(dx / (vw / 2), dy / (vh / 2)); // 1 = edge of the screen
    if (d > 1.5) { why.far = (why.far ?? 0) + 1; return; }
    g *= d < 0.6 ? 1 : Math.max(0, 1 - (d - 0.6) / 0.9);
    pan = Math.max(-0.7, Math.min(0.7, dx / (vw / 2) * 0.7));
  }
  if (g < 0.02) { why.quiet = (why.quiet ?? 0) + 1; return; }
  why.played = (why.played ?? 0) + 1;
  lastAt.set(id, t); rc.push(t); recent.set(id, rc);
  const src = ctx.createBufferSource(); src.buffer = list[Math.floor(Math.random() * list.length)];
  src.playbackRate.value = 0.95 + Math.random() * 0.1;
  const gn = ctx.createGain(); gn.gain.value = g;
  let node = src.connect(gn);
  if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; node = node.connect(p); }
  node.connect(master);
  voices++; src.onended = () => { voices = Math.max(0, voices - 1); };
  src.start();
}

// ---- which damage events are melee hits: not where a projectile lands, a blast goes off or fire burns
const zones = []; // { x, y, r, from, to } in seconds (performance.now / 1000)
export function noteNonMelee(x, y, r, from, to) { zones.push({ x, y, r, from, to }); if (zones.length > 400) zones.splice(0, zones.length - 400); }
export function isMelee(x, y) {
  const t = performance.now() / 1000;
  for (let i = zones.length - 1; i >= 0; i--) { const z = zones[i]; if (z.to < t - 2) { zones.splice(i, 1); continue; } if (t >= z.from - 0.25 && t <= z.to + 0.35 && Math.hypot(x - z.x, y - z.y) <= z.r) return false; }
  return true;
}
/** debug: is the sound running? (window.__sw.audio()) */
export const audioDebug = () => ({ loops: Object.fromEntries([...loops].map(([k, l]) => [k, +l.v.toFixed(3)])), calls: stats, why, ctx: ctx?.state ?? 'not started', loaded: [...buffers.keys()].length, of: Object.keys(SOUNDS).length, volume, muted, music: Object.fromEntries(Object.entries(tracks).map(([k, a]) => [k, { paused: a.paused, vol: +a.volume.toFixed(2) }])) });

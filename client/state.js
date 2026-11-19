// Shared client state.
export const S = {
  ws: null, you: 0, token: null, seed: 0, W: 256, H: 256,
  mines: [], // {id, type, x, y, owner, capBy, cap, guards, steal, held, respawn}
  players: new Map(), // id -> info
  me: null, // own state from snapshots
  alive: false, heroType: null, best: 0,
  snaps: [], // [{t, recv, units: Map}]
  clockOffset: null, // server time - local time
  view: [], // interpolated units this frame
  byId: new Map(),
  match: null, items: [], inv: { equip: {}, bag: [] },
  corpses: [], fx: [], projs: [], fires: [], texts: [], marks: [],
  cam: { x: 0, y: 0, z: 2, follow: true, vx: 0, vy: 0 },
  mouse: { x: 0, y: 0, wx: 0, wy: 0, in: false },
  hover: null, sel: null, // {k:'unit'|'mine', id}
  targeting: false, // waiting for a skill target click
  ui: { shop: false, board: false, bigMap: false, chat: false },
  t0: performance.now(),
};
export const now = () => performance.now() / 1000;
export const serverNow = () => now() + (S.clockOffset ?? 0);
export const isMine = (owner) => owner === S.you;
export const colorOf = (owner) => (owner ? S.players.get(owner)?.color ?? '#ccc' : '#e0c040');

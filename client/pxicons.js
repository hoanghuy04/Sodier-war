// Pixel icons for the button rail (same idea as Ant War's pxIcons): rows of palette letters → inline SVG.
const PAL = { k: '#1a120b', a: '#e89a2a', A: '#ffd070', y: '#fff1b8', o: '#a85e10', n: '#6a4a1e', N: '#a8783e', b: '#6a3a0c', s: '#7a7468', S: '#c8c4b0', w: '#f1e7d6', r: '#c8402a', R: '#f07a5a', u: '#3a68b8', U: '#8ab8ff', g: '#3f7a2e', G: '#8ad06a', p: '#7a3ec8', P: '#d098ff' };
const IC = {
  // equipment (X = tier colour, x = darker tier colour)
  weapon: ['..........SS', '.........SwS', '........SwS.', '.......SwS..', '......SwS...', '.....SwS....', '.k..SwS.....', '.kXSwS......', '..kXS.......', '.nkkX.......', 'nNn.kk......', 'nn..........'],
  helmet: ['....kkkk....', '..kkXXXXkk..', '.kXXwXXXXxk.', '.kXwXXXXXxk.', 'kXXXXXXXXXxk', 'kXXkkkkkkXxk', 'kXk......kxk', 'kXk......kxk', '.k........k.'],
  armor: ['.kk......kk.', 'kXXk....kXXk', 'kXXXkkkkXXxk', '.kXXwXXXXxk.', '.kXwXXXXXxk.', '.kXXXXXXXxk.', '.kXXXkkXXxk.', '.kXXXXXXXxk.', '..kxxxxxxk..', '...kkkkkk...'],
  boots: ['..kkkk......', '..kXXk......', '..kXXk......', '..kXXk......', '..kXwk......', '..kXXXkkk...', '..kXXXXXXk..', '..kXXXXXXXk.', '..kxxxxxxxk.', '..kkkkkkkkk.'],
  ring: ['....kkkk....', '...kwXXXk...', '...kXwXxk...', '....kkkk....', '..kkSSSSkk..', '.kS......Sk.', 'kS........sk', 'kS........sk', '.kS......sk.', '..kkssssk...', '....kkkk....'],
  shield: ['.kkkkkkkkkk.', 'kXXXXwXXXXxk', 'kXwXXXXXXXxk', 'kXXXXXXXXXxk', 'kXXXXkkXXXxk', 'kXXXkwXkXXxk', '.kXXXkkXXxk.', '.kXXXXXXXxk.', '..kXXXXXxk..', '...kXXXxk...', '....kxxk....', '.....kk.....'],
  gloves: ['..k.k.k.k...', '.kXkXkXkXk..', '.kXkXkXkXk..', '.kXkXkXkXk..', '.kXXXXXXXk.k', '.kXwXXXXXkXk', '.kXXXXXXXXXk', '.kXXXXXXXXk.', '..kXXXXXxk..', '..kkkkkkkk..', '..kSSSSSSk..', '..kkkkkkkk..'],
  amulet: ['k..........k', '.k........k.', '..k......k..', '...k....k...', '....kkkk....', '...kXXXXk...', '..kXwXXXxk..', '..kXXXXXxk..', '...kxxxxk...', '....kkkk....'],
  bag: ['....nnnn....', '...n....n...', '..nnnnnnnn..', '.nNNNNNNNNn.', 'nNNyNNNNNNNn', 'nNNNNaaNNNNn', 'nNNNNaaNNNNn', 'nNNNNNNNNNNn', 'nNNNNNNNNNNn', '.nnnnnnnnnn.'],
  cal: ['.r..r..r..r.', 'wwwwwwwwwwww', 'rrrrrrrrrrrr', 'wwwwwwwwwwww', 'wkwkwkwkwkww', 'wwwwwwwwwwww', 'wkwkwkwkwaaw', 'wwwwwwwwwaaw', 'wkwkwkwkwwww', 'wwwwwwwwwwww'],
  house: ['.....rr.....', '....rRRr....', '...rRRRRr...', '..rRRRRRRr..', '.rrrrrrrrrr.', '..nNNNNNNn..', '..nNkkNNNn..', '..nNkkNyyn..', '..nNkkNyyn..', '..nnkknnnn..'],
  help: ['...kkkkkk...', '..kAAAAAAk..', '.kAAkkkkAAk.', '.kAk....kAk.', '..k....kAAk.', '......kAAk..', '.....kAAk...', '.....kAk....', '......k.....', '.....kAk....', '.....kAk....', '......k.....'],
  globe: ['....kkkk....', '..kkgGGgkk..', '.kgGGgguuuk.', '.kGGggguuuk.', 'kuuGgguuuGgk', 'kuuuguuuGGgk', 'kuuuuuuGGggk', 'kuuuuuuuggGk', '.kuGGuuuugk.', '.kuGGguuuuk.', '..kkguuukk..', '....kkkk....'],
  trophy: ['...kkkkkkkk...', '.kkyAAAAAAokk.', 'k.kyAAAAAAok.k', 'k.kyAAAAAaok.k', '.kkyAAAAAaokk.', '...kyAAAAok...', '....kyAAok....', '.....kaok.....', '......kk......', '.....kaak.....', '...kkkkkkkk...', '...knNNNNnk...', '...kkkkkkkk...'],
  chest: ['..bbbbbbbb..', '.bnNNNNNNnb.', 'bnNNNaaNNNnb', 'bnnnnaannnnb', 'baaaaAAaaaab', 'bnnnnkknnnnb', 'bnNNNNNNNNnb', 'bnNNNNNNNNnb', 'bnnnnnnnnnnb', 'bbbbbbbbbbbb'],
  swords: ['S.........S.', '.S.......S..', '..S.....S...', '...S...S....', '....S.S.....', '.....S......', '....S.S.....', '..nS...Sn...', '.nn.....nn..', 'nn.......nn.'],
  flag: ['.k..........', '.kRRRRRR....', '.kRrRRRRR...', '.kRRRRRRRR..', '.kRRRRRRr...', '.kRRRRR.....', '.k..........', '.k..........', '.k..........', 'kkk.........'],
  'sk-thach-lam': ['..kkkkkkkk..', '.kAAAAAAAAk.', 'kAUUUUUUUUAk', 'kAUUyyyyUUAk', 'kAUUyUUyUUAk', 'kAUUUUUUUUAk', '.kAUUUUUUAk.', '.kAUUUUUUAk.', '..kAUUUUAk..', '...kAUUAk...', '....kAAk....', '.....kk.....'],
  'sk-kim-ha': ['....AAAA....', '..AAyyyyAA..', '.AAyAAAAyAA.', 'AA..nnnn..AA', '....nNNn....', '...nNNn..UU.', '..nNNn..UwwU', '.nNNn...UUUU', 'nNNn.....UU.', 'nnn.........', '............', '............'],
  'sk-phong-vu': ['......GGGGGG', '...GGGyyyyyG', '.GGyyyyGGG..', '........GGGG', '..GGGGGGyyyG', 'GGyyyyGGG...', '......GGGGGG', '.GGGGGyyyyG.', 'GyyyGGGG....', '............', '............', '............'],
  'sk-lam-nguyet': ['........PPyP', '.......PPyyP', '......PPPyyP', '....PPP.PPP.', '...PP..PP...', '..wyP.PP....', '.wyyyPP.....', 'wyyyyw......', '.wyyw..P....', '..ww..PyP...', '.......P....', '............'],
  'sk-hoa-ky': ['.....rr.....', '...rrRRrr...', '..rRRAAARr..', '.rRAAyyAARr.', '.rRAyyyyARr.', 'rRAAyyyyAARr', 'rRAAyAAyAARr', '.rRAA..AARr.', '..rR....Rr..', '...r....r...', '............', '............'],
  'act-hold': ['.....AA.....', '...AAyyAA...', '..AggggggA..', '.AgGGGGGGgA.', 'AgGGwwwwGGgA', 'AgGGwkkwGGgA', 'AgGGwkkwGGgA', '.AgGGwwGGgA.', '..AgGGGGgA..', '...AggggA...', '....AAAA....', '............'],
  'act-regroup': ['AA........AA', 'AAA......AAA', '.AAA....AAA.', '..A..yy..A..', '....yyyy....', '...yyyyyy...', '...yyyyyy...', '....yyyy....', '..A..yy..A..', '.AAA....AAA.', 'AAA......AAA', 'AA........AA'],
  'act-pull': ['....RRRR....', '..RRRRRRRR..', '.RRR....RRR.', 'RRR......RRR', '..........RR', '...w......RR', '..ww.....RRR', '.wwwwwwRRRR.', '..ww...RRR..', '...w........', '............', '............'],
  'act-mode': ['....AAAA....', '....AAAA....', '............', 'UUU......UUU', 'UUU..GG..UUU', '.....GG.....', '............', 'UUU......UUU', 'UUU......UUU', '....AAAA....', '....AAAA....', '............'],
  scroll: ['..kkkkkkkk..', '.kNyyyyyyNk.', '.knyyyyyynk.', '..kyyyyyyk..', '..kykkkkyk..', '..kyyyyyyk..', '..kykkkyyk..', '..kyyyyyyk..', '..kykkkkyk..', '..kyyyyyyk..', '.kNyyyyyyNk.', '..kkkkkkkk..'],
  chat: ['.kkkkkkkkkk.', 'kwwwwwwwwwwk', 'kwkkkkkkkkwk', 'kwwwwwwwwwwk', 'kwkkkkkkwwwk', 'kwwwwwwwwwwk', '.kkkwwwwkkkk', '...kwk......', '..kwk.......', '..kk........'],
  menu: ['............', '.AAAAAAAAAA.', '.AAAAAAAAAA.', '............', '.AAAAAAAAAA.', '.AAAAAAAAAA.', '............', '.AAAAAAAAAA.', '.AAAAAAAAAA.', '............'],
  full: ['AAAA....AAAA', 'AA........AA', 'A..........A', 'A..........A', '............', '............', 'A..........A', 'A..........A', 'AA........AA', 'AAAA....AAAA'],
  center: ['.....AA.....', '.....AA.....', '..AA....AA..', '.A........A.', '.A...yy...A.', 'AA..yyyy..AA', 'AA..yyyy..AA', '.A...yy...A.', '.A........A.', '..AA....AA..', '.....AA.....', '.....AA.....'],
};
export function px(name, size = 28, tint = null) {
  const rows = IC[name]; if (!rows) return '';
  const pal = tint ? { ...PAL, X: tint, x: shade(tint, 0.6) } : { ...PAL, X: '#c8c4b0', x: '#7a7468' };
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  let r = '';
  rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const c = pal[row[x]]; if (c) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c}"/>`; } });
  return `<svg class="px" width="${size}" height="${size}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet">${r}</svg>`;
}
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.round(((n >> v) & 255) * f).toString(16).padStart(2, '0'); return '#' + c(16) + c(8) + c(0); }
/** the same icon as an Image (for canvas drawing) */
const imgCache = new Map();
export function pxImage(name, tint) {
  const k = name + tint;
  if (!imgCache.has(k)) { const i = new Image(); i.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(px(name, 24, tint).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')); imgCache.set(k, i); }
  return imgCache.get(k);
}

// hand-drawn equipment icons (client/assets/items/items.png: 6 slot columns × 5 tier rows, 48 px cells)
const ITEM_COL = ['weapon', 'helmet', 'armor', 'boots', 'ring', 'amulet', 'shield', 'gloves'], ITEM_ROW = ['common', 'fine', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'black']; // 7 rows (fine / mythic tinted from white / orange)
let itemsSheet = null;
export function itemIcon(slot, tier, size = 40) {
  const c = ITEM_COL.indexOf(slot), r = ITEM_ROW.indexOf(tier);
  if (c < 0 || r < 0) return '';
  const k = size / 48;
  return `<span class="ii" style="display:inline-block;width:${size}px;height:${size}px;background:url(/assets/items/items.png${itemsV}) ${-c * size}px ${-r * size}px / ${384 * k}px ${384 * k}px no-repeat;image-rendering:pixelated"></span>`;
}
let itemsV = '';
export function loadItemIcons(av = '') { itemsV = '?v=' + av; itemsSheet = new Image(); itemsSheet.src = '/assets/items/items.png' + itemsV; }
/** draw one icon on a canvas (ground loot); returns false while the sheet is not loaded */
export function drawItemIcon(ctx, slot, tier, x, y, size) {
  const c = ITEM_COL.indexOf(slot), r = ITEM_ROW.indexOf(tier);
  if (!itemsSheet?.complete || !itemsSheet.naturalWidth || c < 0 || r < 0) return false;
  ctx.drawImage(itemsSheet, c * 48, r * 48, 48, 48, x, y, size, size);
  return true;
}

// Every gameplay number in one place (docs/design chapters 3–8). Shared by server and client.

export const RES = ['iron', 'coal', 'gold', 'oil', 'tar', 'crystal', 'diamond'];
// rate = mine output per minute (12/11/2026: every mine ×0.5)
// 13/11/2026: iron and coal ×2 (mines 7.5 → 15 and 6 → 12 per minute, base income 20 → 40 and 10 → 20) at the owner's request
export const RES_INFO = {
  iron: { name: 'Sắt', mine: 'Mỏ Sắt', rate: 15, score: 1, color: '#b7c0d1', capture: [6, 15] },
  coal: { name: 'Than', mine: 'Mỏ Than', rate: 12, score: 1, color: '#6b7088', capture: [6, 15] },
  gold: { name: 'Vàng', mine: 'Mỏ Vàng', rate: 3.5, score: 2, color: '#f4c430', capture: [9, 22] },
  oil: { name: 'Dầu', mine: 'Giếng Dầu', rate: 3, score: 2, color: '#e0a85a', capture: [10, 25] },
  tar: { name: 'Dầu đen', mine: 'Hố Dầu Đen', rate: 2, score: 3, color: '#a68ad0', capture: [12, 30] },
  crystal: { name: 'Pha lê', mine: 'Mỏ Pha lê', rate: 1.25, score: 4, color: '#d08cff', capture: [14, 35] },
  diamond: { name: 'Kim cương', mine: 'Mỏ Kim cương', rate: 0.75, score: 6, color: '#9ff3ff', capture: [20, 50] },
};
export const CAPTURE_R = (type) => (type === 'diamond' ? 3 : 2.5);
export const START_RES = { iron: 200, coal: 60 };
// daily check-in: one per day (Vietnam time), a 7-day cycle; day 7 = one legendary (orange) item
// daily check-in: a calendar per month (11/11/2026). Each day of the month has its own gift, getting better towards the
// end of the month: odd days resources, even days equipment, every 7th day and the last day a big piece of equipment.
const CI_RES = [
  { iron: 500, coal: 250 }, { gold: 250, oil: 120 }, { tar: 100, crystal: 50 }, { crystal: 90, diamond: 20 }, { diamond: 35, crystal: 120 },
];
const CI_TIER = ['common', 'uncommon', 'rare', 'rare', 'epic'];
const CI_BIG = { 7: 'rare', 14: 'epic', 21: 'epic', 28: 'legendary' };
/** gift for day d (1..31) of a month that has `len` days */
export function checkinReward(d, len = 30) {
  const wk = Math.min(4, Math.floor((d - 1) / 7));
  if (d === len) return { item: 'legendary', big: true };
  if (CI_BIG[d]) return { item: CI_BIG[d], big: true };
  if (d % 2 === 0) return { item: CI_TIER[wk] };
  return { res: { ...CI_RES[wk] } };
}
/** the gifts of a whole month */
export const checkinMonth = (len) => Array.from({ length: len }, (_, i) => checkinReward(i + 1, len));
export const CHECKIN = checkinMonth(30); // (kept for old imports)
export const OFFLINE_RATE = 0.5; // offline players still earn, at half speed
export const OFFLINE_MAX_MIN = 24 * 60; // at most 24 h of offline income is paid back
// every army earns a little of every resource without any mine (per minute); mines are still much faster
export const BASE_INCOME = { iron: 40, coal: 20, gold: 5, oil: 4, tar: 2, crystal: 1, diamond: 0.2 }; // diamond 0.5 → 0.2 (11/11/2026): get more from mines, rocks, camps
export const SHIELD_SECONDS = 60;
export const GUARD_RESPAWN = 240; // seconds a mine must stay empty
export const LEASH = 6;

export const holdBonus = (sec) => Math.min(0.3, Math.floor(sec / 120) * 0.05);
export function management(n, hero) {
  const start = hero === 'kim-ha' ? 9 : 7, floor = hero === 'kim-ha' ? 0.8 : 0.7;
  if (n < start) return 1;
  return Math.max(floor, 1 - 0.03 * (n - start + 1));
}

// ---- classes and the counter table K[attacker][defender] ----
export const CLASSES = ['inf', 'spear', 'ranged', 'cav', 'magic', 'siege', 'fly', 'hero', 'build'];
export const CLASS_NAME = { inf: 'Bộ binh', spear: 'Giáo', ranged: 'Tầm xa', cav: 'Kỵ', magic: 'Phép', siege: 'Công thành', fly: 'Bay', hero: 'Anh hùng', build: 'Công trình' };
const KT = {
  inf: [1.0, 1.4, 1.2, 0.8, 1.2, 1.3, 0.5, 1.0, 1.3],
  spear: [1.0, 1.0, 1.0, 1.75, 1.0, 1.0, 0.75, 1.0, 1.0],
  ranged: [1.3, 1.1, 1.0, 0.8, 1.0, 0.8, 1.5, 0.9, 0.5],
  cav: [1.0, 0.7, 1.6, 1.0, 1.6, 1.8, 0.5, 1.0, 1.5],
  magic: [1.0, 1.0, 1.0, 1.0, 1.0, 1.2, 1.2, 1.0, 0.8],
  siege: [1.2, 1.2, 1.2, 1.0, 1.2, 1.5, 0, 0.8, 2.5],
  fly: [1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.0, 1.0, 1.0],
  hero: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.75, 1.0, 1.0],
  build: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0],
};
export const K = (a, d) => KT[a][CLASSES.indexOf(d)];

// ---- army (chapter 4.2). range/speed in tiles, cd in seconds, armor 0..1 ----
export const UNITS = {
  'dan-quan': { n: 1, name: 'Dân quân', cls: 'inf', cost: { iron: 40 }, hp: 70, atk: 9, cd: 1.0, range: 0.8, armor: 0, speed: 2.2, slots: 1, cap: 1, summon: 1, desc: 'Rẻ nhất, lấp ô và giữ chân địch.' },
  'kiem-si': { n: 2, name: 'Kiếm sĩ', cls: 'inf', cost: { iron: 80, coal: 20 }, hp: 130, atk: 14, cd: 1.0, range: 0.8, armor: 0.15, speed: 2.1, slots: 1, cap: 1, summon: 2, desc: 'Quân chủ lực đầu game, khắc Lính giáo.' },
  'linh-giao': { n: 3, name: 'Lính giáo', cls: 'spear', cost: { iron: 70, coal: 25 }, hp: 110, atk: 12, cd: 1.1, range: 1.2, armor: 0.1, speed: 2.1, slots: 1, cap: 1, summon: 2, desc: '×1,75 lên Kỵ, đòn đầu làm ngựa choáng.' },
  'cung-thu': { n: 4, name: 'Cung thủ', cls: 'ranged', cost: { iron: 60, coal: 30 }, hp: 70, atk: 11, cd: 1.3, range: 6, armor: 0, speed: 2.2, slots: 1, cap: 1, summon: 2, ranged: 'arrow', desc: 'Bắn tự do, ×1,5 lên quân bay.' },
  'ky-binh': { n: 5, name: 'Kỵ binh', cls: 'cav', cost: { iron: 110, coal: 30, gold: 50 }, hp: 170, atk: 38, cd: 1.0, range: 2.5, armor: 0.15, speed: 3.2, slots: 1, cap: 1, summon: 3, charge: true, desc: 'Sát thương cao, máu vừa, tầm với xa hơn Hiệp sĩ một chút: đứng sau Hiệp sĩ mà đánh. Xung phong ×2, khắc Cung.' }, // 12/11/2026: damage dealer
  'hiep-si': { n: 6, name: 'Hiệp sĩ', cls: 'cav', cost: { iron: 180, coal: 60, gold: 60 }, hp: 560, atk: 13, cd: 1.5, range: 0.9, armor: 0.5, speed: 2.2, slots: 1, cap: 3, summon: 4, desc: 'Binh chắn (tank): máu và giáp cực dày, hút 3 kẻ địch đánh cùng lúc, nhưng sát thương và tốc độ thấp.' }, // 12/11/2026: tank
  'phap-su': { n: 7, name: 'Pháp sư', cls: 'magic', cost: { coal: 40, gold: 80, crystal: 25 }, hp: 115, atk: 26, cd: 1.8, range: 6, armor: 0, speed: 2.0, slots: 1, cap: 1, summon: 4, ranged: 'orb', aoe: 1, pierce: true, desc: 'Cầu phép nổ vùng 1 ô, bỏ qua giáp.' },
  'may-ban-da': { n: 8, name: 'Máy bắn đá lửa', cls: 'siege', cost: { iron: 160, oil: 60, tar: 15 }, hp: 220, atk: 45, cd: 3.5, range: 7.0, minRange: 2, armor: 0.2, speed: 1.3, slots: 2, cap: 2, summon: 6, ranged: 'fireball', aoe: 1.5, burn: [3, 8], desc: 'Bắn xa, nổ vùng, đốt đất. Không bắn quân bay.' },
  'su-thuu': { n: 9, name: 'Sư thứu', cls: 'fly', cost: { iron: 60, gold: 120, oil: 40, crystal: 30 }, hp: 480, atk: 38, cd: 0.9, range: 1.0, armor: 0.2, speed: 3.4, slots: 2, cap: 2, summon: 6, fly: true, desc: 'Bay qua vật cản, nhanh nhất game.' },
  rong: { n: 10, name: 'Rồng', cls: 'fly', cost: { gold: 400, tar: 120, crystal: 60, diamond: 30 }, hp: 2100, atk: 78, cd: 1.6, range: 3.0, armor: 0.3, speed: 2.8, slots: 4, cap: 4, summon: 12, fly: true, breath: true, desc: 'Phun lửa hình nón, trúng 3 mục tiêu. Mạnh nhất game.' },
  // 16/11/2026 (docs/design/28-chi-so-th6-8.md): Thành trì 6 / 7 / 8 units
  'cong-binh': { n: 11, name: 'Công binh', cls: 'inf', cost: { iron: 120, coal: 60, oil: 20 }, hp: 90, atk: 300, cd: 1.0, range: 0.8, armor: 0, speed: 2.6, slots: 1, cap: 1, summon: 3, sapper: true, aoe: 1.5, desc: 'Ôm thùng thuốc nổ lao vào tường gần nhất (hết tường thì vào công trình) rồi tự nổ vùng 1,5 ô: ×4 lên tường, ×2 lên công trình.' },
  'y-su': { n: 12, name: 'Y sư', cls: 'magic', cost: { gold: 150, crystal: 30 }, hp: 260, atk: 0, cd: 1.0, range: 3.5, armor: 0.1, speed: 2.0, slots: 1, cap: 1, summon: 5, healer: true, desc: 'Không đánh. Mỗi giây hồi % máu cho mọi lính phe mình trong 3,5 ô (tướng nhận một nửa). Nhiều Y sư không cộng dồn.' },
  'voi-chien': { n: 13, name: 'Voi chiến', cls: 'siege', cost: { iron: 600, gold: 300, oil: 100, diamond: 15 }, hp: 3200, atk: 70, cd: 1.6, range: 1.2, armor: 0.35, speed: 1.6, slots: 4, cap: 4, summon: 12, aoe: 1.2, trample: true, desc: 'Voi bọc giáp, nữ tướng bắn cung trên lưng. Máu cực trâu, mỗi cú giẫm nổ vùng 1,2 ô, ×2 lên công trình. Chậm.' },
};
// 12/11/2026 rebalance: every soldier ×1.5 HP and attack; soldiers hit structures harder (walls, towers, houses)
// 13/11/2026: longer ranges so melee bosses must walk up to the archers (Golem 2.6 + its 4.5 slam no longer reach them):
// Cung thủ 4.5 → 6, Pháp sư 4 → 6, Lam Nguyệt 4 → 6; towers Tháp cung 7.5 → 9, Pháo đá 6 → 7.5, Tháp phép 5.5 → 7.
// Rule kept: no soldier outranges the shortest base defence (7, Lam Nguyệt +1 included); Máy bắn đá stays 7
// 14/11/2026: Kỵ binh = damage dealer behind the Hiệp sĩ wall (atk 30 → 38, reach 1.4 → 2.5); Pháp sư hp 90 → 115 (still < Kỵ binh);
// Sư thứu (hp 260 → 480, atk 22 → 38, armour .15 → .2) and Rồng (hp 1600 → 2100, atk 60 → 78) all-round strong
export const UNIT_POWER = 1.5;
for (const u of Object.values(UNITS)) { u.hp = Math.round(u.hp * UNIT_POWER); u.atk = Math.round(u.atk * UNIT_POWER * 10) / 10; }
export const SIEGE_MULT = { 'may-ban-da': 3, rong: 2 }, SIEGE_DEF = 2;
export const HEAL_PCT = [0.015, 0.02, 0.025], HEAL_R = 3.5, SAPPER_WALL = 4; // Y sư heal / s by level, Công binh vs walls (16/11/2026) // soldier damage × this against structures
export const GARRISON_DEF = 0.4; // share of the army a base keeps to defend its Thành trì ("Cất binh": 40 % in, 60 % stay with the hero)
/** pick ~share of a list keeping the mix of types (sorted by type, every n-th one) */
export function pickShare(list, share, typeOf = (x) => x.type) { const s = [...list].sort((a, b) => String(typeOf(a)).localeCompare(String(typeOf(b)))), out = [], rest = []; s.forEach((x, i) => (Math.floor((i + 1) * share) > Math.floor(i * share) ? out : rest).push(x)); return [out, rest]; }
export const SHOP_ORDER = Object.keys(UNITS);
export const DRAGON_LIMIT = (hero) => (hero === 'hoa-ky' ? 3 : 2);

// ---- neutral mine guards (chapter 4.7) — sprite = sheet reused with a tint on the client ----
export const GUARDS = {
  'tho-phi': { name: 'Thổ phỉ', cls: 'inf', hp: 70, atk: 9, cd: 1.0, range: 0.8, armor: 0, speed: 2.2, cap: 1, sprite: 'g-tho-phi' },
  'cung-phi': { name: 'Cung thủ phỉ', cls: 'ranged', hp: 70, atk: 10, cd: 1.3, range: 4.0, armor: 0, speed: 2.2, cap: 1, ranged: 'arrow', sprite: 'g-cung-phi' },
  'kiem-si-den': { name: 'Kiếm sĩ đen', cls: 'inf', hp: 150, atk: 15, cd: 1.0, range: 0.8, armor: 0.15, speed: 2.1, cap: 1, sprite: 'g-kiem-si-den' },
  'thu-hac-in': { name: 'Thú hắc ín', cls: 'inf', hp: 400, atk: 20, cd: 1.4, range: 1.0, armor: 0.1, speed: 2.0, cap: 2, slow: true, sprite: 'g-thu-hac-in' },
  'tinh-linh': { name: 'Tinh linh pha lê', cls: 'magic', hp: 160, atk: 18, cd: 1.5, range: 3.0, armor: 0, speed: 2.0, cap: 1, ranged: 'orb', pierce: true, sprite: 'g-tinh-linh' },
  // monster camps (docs/design/18): own sprites from tools/unitgen/beasts.mjs, no tint. Level 5+ hit much harder.
  // every monster rolls its own drop: `drop` = chance to drop (× `items`), then a tier from `loot` [tier, chance]
  'chuot-khong-lo': { name: 'Chuột khổng lồ', cls: 'inf', hp: 50, atk: 6, cd: 0.9, range: 0.7, armor: 0, speed: 2.6, cap: 1, sprite: 'chuot-khong-lo', drop: 0.08, loot: [['common', 0.6], ['fine', 0.3], ['uncommon', 0.1]] },
  'soi-xam': { name: 'Sói xám', cls: 'inf', hp: 100, atk: 12, cd: 0.9, range: 0.8, armor: 0, speed: 3.0, cap: 1, sprite: 'soi-xam', drop: 0.1, loot: [['common', 0.4], ['fine', 0.3], ['uncommon', 0.27], ['rare', 0.03]] },
  goblin: { name: 'Goblin', cls: 'inf', hp: 140, atk: 14, cd: 1.0, range: 0.8, armor: 0.05, speed: 2.3, cap: 1, sprite: 'goblin', drop: 0.12, loot: [['common', 0.15], ['fine', 0.2], ['uncommon', 0.5], ['rare', 0.15]] },
  'goblin-cung': { name: 'Goblin cung', cls: 'ranged', hp: 90, atk: 13, cd: 1.3, range: 4.2, armor: 0, speed: 2.3, cap: 1, ranged: 'arrow', sprite: 'goblin-cung', drop: 0.12, loot: [['common', 0.15], ['fine', 0.2], ['uncommon', 0.5], ['rare', 0.15]] },
  'nhen-doc': { name: 'Nhện độc', cls: 'inf', hp: 260, atk: 18, cd: 1.0, range: 0.9, armor: 0.1, speed: 2.4, cap: 2, slow: true, sprite: 'nhen-doc', drop: 0.14, loot: [['uncommon', 0.6], ['rare', 0.39], ['epic', 0.01]] },
  'gau-nau': { name: 'Gấu nâu', cls: 'inf', hp: 900, atk: 40, cd: 1.3, range: 1.0, armor: 0.2, speed: 2.2, cap: 3, sprite: 'gau-nau', drop: 0.18, loot: [['uncommon', 0.4], ['rare', 0.55], ['epic', 0.05]] },
  orc: { name: 'Orc chiến binh', cls: 'inf', hp: 1000, atk: 48, cd: 1.2, range: 1.1, armor: 0.25, speed: 2.1, cap: 3, sprite: 'orc', drop: 0.2, loot: [['uncommon', 0.2], ['rare', 0.64], ['epic', 0.15], ['legendary', 0.01]] },
  troll: { name: 'Troll đá', cls: 'inf', hp: 2200, atk: 75, cd: 1.6, range: 1.3, armor: 0.3, speed: 1.8, cap: 4, stomp: true, sprite: 'troll', drop: 0.24, loot: [['uncommon', 0.1], ['rare', 0.68], ['epic', 0.2], ['legendary', 0.02]] },
  minotaur: { name: 'Minotaur', cls: 'inf', hp: 3000, atk: 95, cd: 1.5, range: 1.4, armor: 0.35, speed: 2.0, cap: 4, stomp: true, sprite: 'minotaur', drop: 0.28, loot: [['rare', 0.72], ['epic', 0.25], ['legendary', 0.03]] },
  wyvern: { name: 'Wyvern', cls: 'inf', hp: 3500, atk: 85, cd: 1.6, range: 2.6, armor: 0.3, speed: 2.2, cap: 5, breath: true, sprite: 'wyvern', drop: 0.32, loot: [['rare', 0.64], ['epic', 0.31], ['legendary', 0.05]] },
  'rong-co-dai': { name: 'Rồng cổ đại', cls: 'inf', hp: 12000, atk: 150, cd: 1.8, range: 3.4, armor: 0.4, speed: 1.8, cap: 8, breath: true, sprite: 'rong-co-dai', drop: 1, items: 2, loot: [['rare', 0.5], ['epic', 0.38], ['legendary', 0.12]] },
  // Sự kiện thế giới (13/11/2026): every 2 hours a Thủ lĩnh quái (monster chief + escort) or an Đoàn xe vàng (gold cart + bandits)
  'thu-linh': { name: 'Thủ lĩnh quái', cls: 'inf', hp: 36000, atk: 210, cd: 1.6, range: 1.8, armor: 0.4, speed: 1.9, cap: 8, stomp: true, sprite: 'thu-linh', scale: 1 }, // own art (14/11/2026, docs/design/samples/army/prompts/bosses/22-boss-su-kien.md; was the Minotaur ×1.7)
  'xe-vang': { name: 'Xe chở vàng', cls: 'inf', hp: 14000, atk: 0, cd: 99, range: 0, armor: 0.35, speed: 1.2, cap: 6, sprite: 'xe-vang', scale: 1 }, // own art (14/11/2026; was the golem ×1.2)
  golem: { name: 'Golem kim cương', cls: 'inf', hp: 3000, atk: 70, cd: 2.0, range: 1.2, armor: 0.4, speed: 1.6, cap: 5, stomp: true, sprite: 'g-golem' },
  // boss minions (14/11/2026): called at 75 / 50 / 25 % HP (BOSS_SUMMON); their own art
  // (docs/design/samples/army/prompts/bosses/23-linh-trieu-hoi.md); no loot; stats × the boss level multiplier
  'tay-sai-golem': { name: 'Đá vệ kim cương', cls: 'inf', hp: 900, atk: 40, cd: 1.4, range: 1.1, armor: 0.35, speed: 1.8, cap: 2, sprite: 'tay-sai-golem' },
  'tay-sai-hac-in': { name: 'Quỷ bùn hắc ín', cls: 'inf', hp: 700, atk: 45, cd: 1.2, range: 1.0, armor: 0.2, speed: 2.0, cap: 1, slow: true, sprite: 'tay-sai-hac-in' },
  'tay-sai-pha-le': { name: 'Tiên pha lê', cls: 'magic', hp: 500, atk: 40, cd: 1.5, range: 4, armor: 0.1, speed: 2.4, cap: 1, ranged: 'orb', fly: true, sprite: 'tay-sai-pha-le' },
  'tay-sai-tho-phi': { name: 'Cận vệ thổ phỉ', cls: 'inf', hp: 800, atk: 50, cd: 1.3, range: 1.1, armor: 0.25, speed: 2.2, cap: 1, sprite: 'tay-sai-tho-phi' },
  'tay-sai-bo-cap': { name: 'Bọ cạp con', cls: 'inf', hp: 650, atk: 45, cd: 1.1, range: 1.0, armor: 0.3, speed: 2.6, cap: 1, sprite: 'tay-sai-bo-cap' },
  'tay-sai-thu-linh': { name: 'Yêu tinh xung kích', cls: 'inf', hp: 1000, atk: 55, cd: 1.1, range: 1.0, armor: 0.25, speed: 2.4, cap: 1, sprite: 'tay-sai-thu-linh' },
  // Xe chở vàng escort (14/11/2026): royal treasury guards with their own art, replacing the dark swordsmen / bandit archers
  'ho-ve-giao': { name: 'Vệ binh hộ tống', cls: 'spear', hp: 240, atk: 20, cd: 1.2, range: 1.4, armor: 0.3, speed: 2.0, cap: 2, sprite: 'ho-ve-giao' },
  'ho-ve-cung': { name: 'Nỏ thủ hộ tống', cls: 'ranged', hp: 120, atk: 17, cd: 1.6, range: 4.5, armor: 0.1, speed: 2.0, cap: 1, ranged: 'arrow', sprite: 'ho-ve-cung' },
};
// 13/11/2026 (docs/design/26): camps dropped ~100 items an hour → ×0.35 the chance per monster, and purple or better ×0.25
// (the rest goes to blue); bosses stay the main source of high qualities. The camp dragon (2 sure items) is left alone.
export const CAMP_DROP_MULT = 0.28, CAMP_HIGH_MULT = 0.25; // 13/11/2026 evening: ×0.8 again (0.35 → 0.28), camps respawn in 30 s
const TIERS_ORDER = ['common', 'fine', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'black'];
for (const G of Object.values(GUARDS)) {
  if (!G.loot || (G.items ?? 1) > 1) continue;
  G.drop = Math.round(G.drop * CAMP_DROP_MULT * 1000) / 1000;
  let cut = 0;
  G.loot = G.loot.map(([t, p]) => { if (TIERS_ORDER.indexOf(t) >= 4) { cut += p * (1 - CAMP_HIGH_MULT); return [t, p * CAMP_HIGH_MULT]; } return [t, p]; });
  if (cut) { const r = G.loot.find(([t]) => t === 'rare'); if (r) r[1] += cut; else G.loot.unshift(['rare', cut]); }
}
// a captured mine gets a free garrison: a copy of 20 % of the capturer's army AT THE MOMENT OF CAPTURE (same unit types,
// buying more later does not grow it), at most
// GARRISON_MAX soldiers. Without an army it falls back to this small default (docs/design/17.2)
export const GARRISON_SHARE = 0.2;
export const GARRISON_MAX = 30;
export const GARRISON = {
  iron: [['dan-quan', 1], ['cung-thu', 1]], coal: [['dan-quan', 1], ['cung-thu', 1]],
  gold: [['kiem-si', 1], ['cung-thu', 1]], oil: [['kiem-si', 2], ['cung-thu', 1]],
  tar: [['kiem-si', 2], ['hiep-si', 1]], crystal: [['phap-su', 2]], diamond: [['hiep-si', 1], ['phap-su', 2]],
};
// monster camps for farming equipment (docs/design/18): count per level, ring (r = distance to centre / 128),
// pack, loot table [tier, chance], number of items, resources, respawn seconds
export const CAMPS = {
  // 10 monsters per camp; each monster rolls its own loot (GUARDS[..].drop / loot); `res` is the bonus for clearing the camp
  1: { n: 7, r: [0.7, 0.92], pack: [['chuot-khong-lo', 10]], res: { iron: 40, coal: 20 }, respawn: 30 },
  2: { n: 6, r: [0.62, 0.88], pack: [['soi-xam', 10]], res: { iron: 70, coal: 35 }, respawn: 30 },
  3: { n: 5, r: [0.55, 0.82], pack: [['goblin', 6], ['goblin-cung', 4]], res: { iron: 90, coal: 40, gold: 20 }, respawn: 30 },
  4: { n: 5, r: [0.48, 0.75], pack: [['nhen-doc', 10]], res: { gold: 40, oil: 20 }, respawn: 30 },
  5: { n: 4, r: [0.42, 0.68], pack: [['gau-nau', 10]], res: { gold: 60, oil: 30 }, respawn: 30 },
  6: { n: 3, r: [0.36, 0.6], pack: [['orc', 7], ['goblin-cung', 3]], res: { gold: 80, tar: 15 }, respawn: 30 },
  7: { n: 3, r: [0.3, 0.52], pack: [['troll', 6], ['orc', 4]], res: { gold: 100, tar: 25, crystal: 8 }, respawn: 30 },
  8: { n: 2, r: [0.25, 0.45], pack: [['minotaur', 6], ['troll', 4]], res: { gold: 120, crystal: 15 }, respawn: 30 },
  9: { n: 2, r: [0.2, 0.38], pack: [['wyvern', 6], ['minotaur', 4]], res: { crystal: 20, diamond: 4 }, respawn: 30 },
  10: { n: 1, r: [0.17, 0.3], pack: [['rong-co-dai', 1], ['wyvern', 5], ['minotaur', 4]], res: { crystal: 30, diamond: 10 }, respawn: 30 },
};
export const CAMP_ATK_MULT = 1 / 1.5; // 14/11/2026: packs are ×3, so each camp monster hits ÷1.5
// 14/11/2026 later: per camp level on top (simulated: an army of "level X" farms camps X-1..X+1 with low losses);
// the high camps (troll / minotaur stomps, wyvern breath ×30) wiped the back line
export const CAMP_LV_ATK = [1, 1, 1, 1, 1, 0.9, 0.7, 0.45, 0.2, 0.3];
export const campAtkK = (lv) => CAMP_ATK_MULT * (CAMP_LV_ATK[lv - 1] ?? 1);
export const CAMP_PACK_MULT = 3; // 14/11/2026: ×3 monsters per camp (a lone chief, e.g. the ancient dragon, stays 1)
// tier colour of each camp level's plaque (map post, minimap dot)
export const CAMP_COLORS = { 1: '#c8c4b0', 2: '#a8d890', 3: '#5fd35f', 4: '#4ad8c0', 5: '#4aa8ff', 6: '#7a8aff', 7: '#c070ff', 8: '#ff70d0', 9: '#ff8a40', 10: '#ffa020' };
export const CAMP_LEASH = 8;
export const GUARD_SETS = {
  gold: { list: [['tho-phi', 3], ['cung-phi', 1]], reward: { gold: 40 } },
  oil: { list: [['tho-phi', 4], ['cung-phi', 2]], reward: { oil: 30 } },
  tar: { list: [['kiem-si-den', 3], ['cung-phi', 2], ['thu-hac-in', 1]], reward: { tar: 25 } },
  crystal: { list: [['tinh-linh', 4]], reward: { crystal: 15 } },
  diamond: { list: [['golem', 1], ['tinh-linh', 4]], reward: { diamond: 10, gold: 150 } },
};

// ---- heroes (chapter 6) ----
export const HERO_BASE = { cls: 'hero', hp: 900, atk: 28, cd: 1.0, range: 1.0, armor: 0.25, speed: 2.4, cap: 3, slots: 0 };
export const HEROES = {
  'thach-lam': {
    name: 'Thạch Lâm', title: 'Kiếm Vương', stars: 1, hp: 1080, quote: 'Khiên vững thì quân vững.',
    passive: 'Kỷ luật thép: Bộ binh và Lính giáo +15% HP, +10% ATK. Bản thân +20% HP.',
    skill: { name: 'Tường khiên', cd: 30, dur: 6, desc: '6 giây, mọi quân của mình nhận ít hơn 30% sát thương.' },
  },
  'kim-ha': {
    name: 'Kim Hạ', title: 'Bà Chủ Mỏ', stars: 2, hp: 765, atk: 22.4, quote: 'Ai giữ mỏ, người đó giữ cuộc chơi.',
    passive: 'Mạch giàu: mỏ +20% sản lượng, chiếm mỏ nhanh hơn 35%, kho cơ bản ×2, quản lý từ mỏ thứ 9 (sàn 80%).',
    skill: { name: 'Đào thần tốc', cd: 90, dur: 30, desc: '30 giây, mọi mỏ đang giữ cho gấp đôi sản lượng.' },
  },
  'phong-vu': {
    name: 'Phong Vũ', title: 'Kỵ Tướng', stars: 3, speed: 2.8, quote: 'Đến trước, đánh trước, rút trước.',
    passive: 'Vó ngựa: cả đội +12% tốc độ. Kỵ binh, Hiệp sĩ +15% ATK, giá −10%.',
    skill: { name: 'Thần tốc', cd: 23, dur: 5, desc: '5 giây, cả đội +60% tốc độ, rút khỏi trận không bị đánh lưng.' },
  },
  'lam-nguyet': {
    name: 'Lam Nguyệt', title: 'Nữ Pháp Sư', stars: 2, hp: 810, atk: 24, cd: 1.4, range: 6, ranged: 'star', aoe: 1, pierce: true, quote: 'Trăng lên thì sao rơi.',
    passive: 'Tinh tú: Cung thủ, Pháp sư +1 ô tầm, +15% ATK. Giá Pha lê −20%. Bản thân bắn phép tầm 6.',
    skill: { name: 'Mưa sao băng', cd: 20, dur: 0, target: true, desc: 'Chọn điểm trong 8 ô: sao băng rơi vùng 2,5 ô, 120 sát thương, bỏ qua giáp.' },
  },
  'hoa-ky': {
    name: 'Hỏa Kỳ', title: 'Kẻ Thuần Long', stars: 3, quote: 'Lửa không chọn chủ. Chủ chọn lửa.',
    passive: 'Huyết long: Sư thứu, Rồng giá −15%, +15% HP. Giữ được 3 Rồng, Rồng triệu tập 6 giây. Bộ binh −10% ATK.',
    skill: { name: 'Long hống', cd: 25, dur: 5, desc: '5 giây, địch trong 5 ô quanh quân bay của mình mất 30% ATK, 20% tốc độ.' },
  },
};
export const HERO_ORDER = Object.keys(HEROES);
export const heroStats = (id) => ({ ...HERO_BASE, ...HEROES[id], hp: HEROES[id].hp ?? HERO_BASE.hp });

// ---- formation rings (chapter 7) ----
export const RING_SLOTS = (n) => 3 * n * (n + 1);
export const RING_COST = { 4: { gold: 200 }, 5: { gold: 350, crystal: 30 } };
export const MAX_RINGS = 5;

// ---- unit levels, researched in the Học viện (open world only; docs/design/can-cu/09-hoc-vien.md) ----
/** max level of each unit per Thành trì level (0 = unit not unlocked yet) */
export const UNIT_LV_CAP = {
  'dan-quan': [2, 3, 4, 5, 5], 'kiem-si': [2, 3, 4, 5, 5], 'linh-giao': [2, 3, 4, 5, 5], 'cung-thu': [2, 3, 4, 5, 5],
  'ky-binh': [1, 2, 3, 4, 5], 'hiep-si': [1, 2, 3, 3, 4], 'phap-su': [0, 1, 2, 3, 4], 'may-ban-da': [0, 0, 1, 2, 3],
  'su-thuu': [0, 0, 0, 1, 2], rong: [0, 0, 0, 0, 2],
};
// 16/11/2026: Thành trì 6–8 (docs/design/28). Units with new art get new levels; the others keep their last drawn level and
// get "Tinh luyện ★1–3" (levels past UNIT_ART_MAX, same sprite + stars, same stats as the level)
for (const [u, add] of Object.entries({ 'dan-quan': [6, 7, 8], 'kiem-si': [6, 7, 8], 'linh-giao': [6, 7, 8], 'cung-thu': [6, 7, 8], 'ky-binh': [6, 7, 8], 'hiep-si': [5, 6, 7], 'phap-su': [5, 6, 7], 'may-ban-da': [4, 5, 6], 'su-thuu': [3, 4, 5], rong: [2, 3, 4] })) UNIT_LV_CAP[u].push(...add);
Object.assign(UNIT_LV_CAP, { 'cong-binh': [0, 0, 0, 0, 0, 2, 3, 4], 'y-su': [0, 0, 0, 0, 0, 0, 2, 3], 'voi-chien': [0, 0, 0, 0, 0, 0, 0, 2] });
export const UNIT_ART_MAX = { 'dan-quan': 5, 'kiem-si': 5, 'linh-giao': 5, 'ky-binh': 5, 'may-ban-da': 3, 'su-thuu': 2 };
export const UNIT_LV_MAX = 8;
/** "5★2" for a refined level past the last drawn one */
export const unitLvLabel = (type, lv) => { const a = UNIT_ART_MAX[type]; return a && lv > a ? `${a}★${lv - a}` : `${lv}`; };
export const UNIT_LV_MULT = [1, 1.15, 1.3, 1.45, 1.6, 1.7, 1.8, 1.9]; // hp and attack (6–8: 16/11/2026)
export const UNIT_LV_COST = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7]; // price to buy one
export const RESEARCH_TIME = [0, 1200, 3600, 7200, 14400, 21600, 32400, 43200]; // s to reach level 2..8
export const RESEARCH_SHARE = 0.35; // of the storage of the first Thành trì level that allows it
/** highest level a unit can reach with this Thành trì and Học viện level (no Học viện: 1) */
export const unitLvCap = (type, thLv, acadLv) => Math.max(1, Math.min(UNIT_LV_CAP[type]?.[Math.max(0, thLv - 1)] ?? 1, acadLv ? (acadLv >= 5 ? UNIT_LV_MAX : acadLv + 1) : 1));
/** first Thành trì level that allows `lv` for this unit (0 = never) */
export const unitLvTh = (type, lv) => (UNIT_LV_CAP[type]?.findIndex((v) => v >= lv) ?? -1) + 1;
export function researchCost(type, lv) {
  const th = Math.max(1, unitLvTh(type, lv)), store = TOWN_HALL.levels[th - 1].store, cost = UNITS[type].cost;
  const k = (RESEARCH_SHARE * store) / Math.max(...Object.entries(cost).map(([r, v]) => v / STORAGE_BASE[r]));
  return Object.fromEntries(Object.entries(cost).map(([r, v]) => [r, Math.max(1, Math.round((v * k) / 5) * 5)]));
}
/** Price of a unit for a hero (passive discounts) at a level. */
export function unitCost(type, hero, lv = 1) {
  const c = { ...UNITS[type].cost };
  const u = UNITS[type];
  let f = UNIT_LV_COST[lv - 1] ?? 1;
  if (hero === 'phong-vu' && u.cls === 'cav') f *= 0.9;
  if (hero === 'hoa-ky' && u.cls === 'fly') f *= 0.85;
  for (const k of Object.keys(c)) {
    c[k] = Math.round(c[k] * f);
    if (k === 'crystal' && hero === 'lam-nguyet') c[k] = Math.round(c[k] * 0.8);
  }
  return c;
}
export function ringCost(n, hero) {
  const c = { ...RING_COST[n] };
  if (c.crystal && hero === 'lam-nguyet') c.crystal = Math.round(c.crystal * 0.8);
  return c;
}
export const costValue = (c) => Object.entries(c).reduce((s, [k, v]) => s + v * VALUE[k], 0);
export const VALUE = { iron: 1, coal: 1.3, gold: 2.5, oil: 3.2, tar: 5, crystal: 9, diamond: 18 };

export const PLAYER_COLORS = ['#3a6ff0', '#e0453a', '#f0b429', '#3ab07a', '#a05af0', '#f07ac0', '#40c8e0', '#e08a3a', '#9aa0aa', '#7a5a3a', '#c0e040', '#ffffff'];

// ---- matches & zone (docs/design/15) ----
export const MATCH_LEN = 20 * 60;
export const JOIN_WINDOW = 6 * 60; // players can (re)join a match during the first 6 minutes
export const INTERMISSION = 2; // seconds between the end of a match and the lobby (just enough for the last death animation)
// [warnAt, shrinkStart, shrinkEnd, radius after, damage % max HP per second outside]
// radii are for the 384×384 map (1.5× the first 256 map)
export const ZONE_PHASES = [
  [300, 360, 480, 138, 0.015],
  [480, 570, 660, 87, 0.025],
  [660, 750, 825, 51, 0.04],
  [825, 900, 960, 27, 0.06],
  [960, 1020, 1140, 6, 0.1],
];
export const ZONE_START_R = 276; // covers the whole 384×384 map

// ---- bosses (docs/design/15.3); sprites are drawn 5× the hero size ----
export const BOSS_SCALE = 5;
export const BOSS_ART_H = 147; // bosses are imported at their native resolution (idle height in art px); heroes are ~50 px
export const BOSS_DRAW = (BOSS_SCALE * 50) / BOSS_ART_H;
export const BOSSES = {
  'golem-kim-cuong': { name: 'Golem Kim Cương', cls: 'inf', hp: 14000, atk: 130, cd: 2.2, range: 2.6, armor: 0.4, speed: 1.1, cap: 10, skill: 'slam', skillCd: 8, drops: [[['black', 0.005], ['legendary', 0.1], ['epic', 0.35], ['rare', 0.545]], [['epic', 0.2], ['rare', 0.55], ['uncommon', 0.25]], [['rare', 0.5], ['uncommon', 0.5]]], at: 'center' },
  'chua-te-hac-in': { name: 'Chúa Tể Hắc Ín', cls: 'inf', hp: 9000, atk: 95, cd: 1.8, range: 2.4, armor: 0.25, speed: 1.2, cap: 10, skill: 'tar', skillCd: 9, drops: [[['epic', 0.2], ['rare', 0.55], ['uncommon', 0.25]], [['rare', 0.45], ['uncommon', 0.55]], [['rare', 0.25], ['uncommon', 0.5], ['common', 0.25]]], at: 'N' },
  'nu-hoang-pha-le': { name: 'Nữ Hoàng Pha Lê', cls: 'magic', hp: 7500, atk: 75, cd: 1.6, range: 7, armor: 0.1, speed: 1.3, cap: 10, ranged: 'orb', aoe: 1.5, pierce: true, skill: 'storm', skillCd: 10, drops: [[['epic', 0.2], ['rare', 0.55], ['uncommon', 0.25]], [['rare', 0.45], ['uncommon', 0.55]], [['rare', 0.25], ['uncommon', 0.5], ['common', 0.25]]], at: 'E' },
  'vua-tho-phi': { name: 'Vua Thổ Phỉ', cls: 'inf', hp: 9000, atk: 115, cd: 1.6, range: 2.4, armor: 0.3, speed: 1.4, cap: 10, skill: 'whirl', skillCd: 7, drops: [[['epic', 0.2], ['rare', 0.55], ['uncommon', 0.25]], [['rare', 0.45], ['uncommon', 0.55]], [['rare', 0.25], ['uncommon', 0.5], ['common', 0.25]]], at: 'S' },
  'bo-cap-sa-mac': { name: 'Bọ Cạp Sa Mạc', cls: 'inf', hp: 8000, atk: 100, cd: 1.2, range: 2.6, armor: 0.35, speed: 1.8, cap: 10, skill: 'burrow', skillCd: 8, drops: [[['epic', 0.2], ['rare', 0.55], ['uncommon', 0.25]], [['rare', 0.45], ['uncommon', 0.55]], [['rare', 0.25], ['uncommon', 0.5], ['common', 0.25]]], at: 'W' },
};
// 12/11/2026 rebalance: bosses ×2 HP, ×1.5 attack (on top of the level scaling); below 30 % HP they enrage (+50 % attack speed)
// 13/11/2026 (docs/design/excel/trang-bi-level.xlsx, Rot_Boss): drops scale with the boss level. Item 1 from table A, items 2-3
// from table B; rows = boss level 1..8, columns = Trắng … Đen. Golem counts as one level higher. Purple+ per kill: lv1 ≈ 0.5, lv8 ≈ 1.6
export const BOSS_DROP_A = [[0, 0, 0.1, 0.5, 0.3, 0.095, 0.005, 0], [0.0, 0.0, 0.0857, 0.4571, 0.3171, 0.1214, 0.0164, 0.0021], [0.0, 0.0, 0.0714, 0.4143, 0.3343, 0.1479, 0.0279, 0.0043], [0.0, 0.0, 0.0571, 0.3714, 0.3514, 0.1743, 0.0393, 0.0064], [0.0, 0.0, 0.0429, 0.3286, 0.3686, 0.2007, 0.0507, 0.0086], [0.0, 0.0, 0.0286, 0.2857, 0.3857, 0.2271, 0.0621, 0.0107], [0.0, 0.0, 0.0143, 0.2429, 0.4029, 0.2536, 0.0736, 0.0129], [0, 0, 0, 0.2, 0.42, 0.28, 0.085, 0.015]];
export const BOSS_DROP_B = [[0.1, 0.15, 0.4, 0.3, 0.05, 0, 0, 0], [0.0857, 0.1286, 0.3643, 0.3214, 0.0857, 0.0129, 0.0014, 0.0], [0.0714, 0.1071, 0.3286, 0.3429, 0.1214, 0.0257, 0.0029, 0.0], [0.0571, 0.0857, 0.2929, 0.3643, 0.1571, 0.0386, 0.0043, 0.0], [0.0429, 0.0643, 0.2571, 0.3857, 0.1929, 0.0514, 0.0057, 0.0], [0.0286, 0.0429, 0.2214, 0.4071, 0.2286, 0.0643, 0.0071, 0.0], [0.0143, 0.0214, 0.1857, 0.4286, 0.2643, 0.0771, 0.0086, 0.0], [0, 0, 0.15, 0.45, 0.3, 0.09, 0.01, 0]];
// 13/11/2026 evening: red (Đỏ) from bosses ×0.25 (it was 0.5–10.5 % per kill, and the whole party gets the same tier);
// what is taken off goes to orange
export const BOSS_RED_MULT = 0.25;
for (const T of [BOSS_DROP_A, BOSS_DROP_B]) for (const row of T) { const cut = row[6] * (1 - BOSS_RED_MULT); row[6] = Math.round(row[6] * BOSS_RED_MULT * 1e5) / 1e5; row[5] = Math.round((row[5] + cut) * 1e5) / 1e5; }
export const BOSS_POWER = { hp: 2, atk: 1.5 }, BOSS_ENRAGE = { at: 0.3, speed: 1.5 };
for (const b of Object.values(BOSSES)) { b.hp = Math.round(b.hp * BOSS_POWER.hp); b.atk = Math.round(b.atk * BOSS_POWER.atk); }
export const BOSS_LEASH = 12;
/** boss minions (14/11/2026): at each HP threshold the boss calls n of its own minions (more for the Golem and the chief) */
export const BOSS_SUMMON_AT = [0.75, 0.5, 0.25];
export const BOSS_SUMMON = { 'golem-kim-cuong': { type: 'tay-sai-golem', n: [12, 16, 20] }, 'chua-te-hac-in': { type: 'tay-sai-hac-in', n: [10, 13, 16] }, 'nu-hoang-pha-le': { type: 'tay-sai-pha-le', n: [10, 13, 16] },
  'vua-tho-phi': { type: 'tay-sai-tho-phi', n: [10, 13, 16] }, 'bo-cap-sa-mac': { type: 'tay-sai-bo-cap', n: [12, 15, 18] }, 'thu-linh': { type: 'tay-sai-thu-linh', n: [12, 16, 20] } }; // 14/11/2026: ×2.5 (armies are big)
// boss resource reward (14/11/2026): BOSS_REFUND of the soldiers each player lost to the boss (and its minions) comes back,
// plus a bonus per boss level, split evenly in a party
export const ORPHAN_DROP_MULT = 0.1; // 14/11/2026: minions left after their boss falls drop 1/10 as often as the matching camp monster
export const BOSS_REFUND = 0.6;
export const BOSS_RES_BONUS = { gold: 400, oil: 120, tar: 50, crystal: 20 };
export const BOSS_RESPAWN = 600; // endless world: a dead boss comes back after 10 minutes
export const MINE_ALERT_R = 10; // an enemy hero this close to your mine warns you

// ---- equipment (docs/design/16) ----
// 7 qualities (12/11/2026, docs/design/20-lo-ren-nghien-ruong.md): white < yellow < green < blue < purple < orange < red
export const TIERS = ['common', 'fine', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'black']; // black: 12/11/2026, forge only
export const TIER_INFO = {
  common: { name: 'Trắng', color: '#e8e4d8' }, fine: { name: 'Vàng', color: '#ffe26a' }, uncommon: { name: 'Xanh lá', color: '#5fd35f' }, rare: { name: 'Xanh dương', color: '#4aa8ff' },
  epic: { name: 'Tím', color: '#c070ff' }, legendary: { name: 'Cam', color: '#ffa020' }, mythic: { name: 'Đỏ', color: '#ff3a3a' }, black: { name: 'Đen', color: '#d8d0f0' },
};
// powders (from the Lò nghiền), one per quality, kept per account in the base
export const DUST = {
  common: 'Bột Tro Bạc', fine: 'Bột Hổ Phách', uncommon: 'Bột Lục Bảo', rare: 'Bột Lam Ngọc', epic: 'Bột Tử Tinh', legendary: 'Bột Kim Hỏa', mythic: 'Bột Huyết Long', black: 'Bột Hư Không',
};
// Lò rèn: going up from TIERS[i] to TIERS[i + 1]
export const FORGE = [
  { dust: 10, cost: { gold: 200 }, rate: 0.9, lv: 1 },
  { dust: 9, cost: { gold: 400 }, rate: 0.75, lv: 1 },
  { dust: 8, cost: { gold: 800, crystal: 40 }, rate: 0.6, lv: 1 },
  { dust: 7, cost: { gold: 1500, crystal: 100 }, rate: 0.4, lv: 2 },
  { dust: 6, cost: { gold: 3000, crystal: 250, diamond: 30 }, rate: 0.22, lv: 3 },
  { dust: 5, cost: { gold: 6000, crystal: 600, diamond: 120 }, rate: 0.08, lv: 5 },
  { dust: 4, cost: { gold: 6000, crystal: 600, diamond: 100 }, rate: 0.05, lv: 5, flat: true }, // Đỏ → Đen: 5 %, no forge-level bonus (12/11/2026)
];
export const FORGE_LV_BONUS = 0.04; // per Lò rèn level above 1
// 14/11/2026: forging UP TO Tím / Cam / Đỏ / Đen (rows 3–6): resources ×0.6 and the success chance ×0.6 (after the Lò rèn bonus)
export const FORGE_HI_FROM = 3, FORGE_HI_COST = 0.6, FORGE_HI_RATE = 0.6;
for (let i = FORGE_HI_FROM; i < FORGE.length; i++) FORGE[i].cost = Object.fromEntries(Object.entries(FORGE[i].cost).map(([r, v]) => [r, Math.round(v * FORGE_HI_COST)]));
// 14/11/2026 later: every forge row's resources ÷2 (dust and success chance unchanged)
export const FORGE_COST_MULT = 0.5;
for (const F of FORGE) F.cost = Object.fromEntries(Object.entries(F.cost).map(([r, v]) => [r, Math.max(1, Math.round(v * FORGE_COST_MULT))]));
export const forgeRate = (tierIdx, forgeLv) => { const r = FORGE[tierIdx].flat ? FORGE[tierIdx].rate : Math.min(0.95, FORGE[tierIdx].rate + FORGE_LV_BONUS * (forgeLv - 1)); return tierIdx >= FORGE_HI_FROM ? Math.round(r * FORGE_HI_RATE * 1000) / 1000 : r; };
export const GRIND_DOUBLE = [0.1, 0.2, 0.3, 0.4, 0.5]; // (old: chance of 2 powders, by level; kept for old clients)
// 12/11/2026: one item ground = a random GRIND_MIN[lv - 1]…GRIND_MAX powders of its own colour; forging needs 10 → 4 (FORGE.dust)
export const GRIND_MIN = [1, 2, 3, 4, 5], GRIND_MAX = 10;
export const CHEST_GRID = [[15, 10], [18, 12], [20, 12], [20, 15], [20, 18]]; // Rương đồ: columns × rows by level
export const SLOTS = ['weapon', 'helmet', 'armor', 'boots', 'ring', 'amulet', 'shield', 'gloves']; // shield + gloves 12/11/2026
export const STAT_NAME = { atk: 'Sát thương', hp: 'Máu', hpPct: 'Máu', armor: 'Giáp', speed: 'Tốc độ', as: 'Tốc đánh', ls: 'Hút máu', dg: 'Né' };
// main stats per slot, one value per tier (atk / hpPct / armor / speed are fractions, hp is flat)
export const SLOT_INFO = {
  weapon: { name: 'Vũ khí', stats: { atk: [0.08, 0.12, 0.16, 0.28, 0.45, 0.7, 1.015] }, names: ['Kiếm Sắt', 'Kiếm Đồng', 'Kiếm Thép', 'Đao Lam Ngọc', 'Kiếm Hắc Diệu', 'Long Kiếm Kim Cương', 'Kiếm Huyết Long'] },
  helmet: { name: 'Mũ', stats: { hp: [60, 95, 130, 240, 400, 650, 942] }, names: ['Mũ Da', 'Mũ Đồng', 'Mũ Sắt', 'Mũ Lông Vũ', 'Mũ Sừng Quỷ', 'Vương Miện Pha Lê', 'Mũ Long Vương'] },
  armor: { name: 'Giáp', stats: { armor: [0.04, 0.055, 0.07, 0.11, 0.16, 0.22, 0.319] }, names: ['Áo Gai', 'Áo Da Thuộc', 'Giáp Lưới', 'Giáp Vảy Thép', 'Giáp Hắc Ín', 'Giáp Rồng', 'Giáp Huyết Long'] },
  boots: { name: 'Giày', stats: { speed: [0.04, 0.055, 0.07, 0.11, 0.16, 0.24, 0.348] }, names: ['Giày Cỏ', 'Dép Da', 'Ủng Da', 'Ủng Gió', 'Giày Bọ Cạp', 'Giày Thần Tốc', 'Hài Phong Thần'] },
  ring: { name: 'Nhẫn', stats: { atk: [0.05, 0.07, 0.09, 0.15, 0.24, 0.36, 0.522], hp: [30, 45, 60, 110, 180, 280, 406] }, names: ['Nhẫn Đồng', 'Nhẫn Hổ Phách', 'Nhẫn Bạc', 'Nhẫn Lam Ngọc', 'Nhẫn Huyết Ngọc', 'Nhẫn Vua Thổ Phỉ', 'Nhẫn Huyết Long'] },
  // 12/11/2026: Khiên (defence: armour + flat HP) and Găng tay (offence: attack speed + damage)
  shield: { name: 'Khiên', stats: { armor: [0.025, 0.035, 0.045, 0.07, 0.1, 0.14, 0.2], hp: [30, 45, 65, 120, 200, 325, 470] }, names: ['Khiên Gỗ', 'Khiên Hổ Phách', 'Khiên Sắt Lục', 'Khiên Lam Ngọc', 'Khiên Hắc Diệu', 'Khiên Rồng Vàng', 'Khiên Huyết Long'] },
  gloves: { name: 'Găng tay', stats: { as: [0.04, 0.055, 0.07, 0.11, 0.16, 0.24, 0.348], atk: [0.03, 0.04, 0.05, 0.08, 0.12, 0.18, 0.26] }, names: ['Găng Vải', 'Găng Hổ Phách', 'Găng Da Lục', 'Găng Lam Ngọc', 'Găng Hắc Diệu', 'Găng Thần Lực', 'Găng Huyết Long'] },
  amulet: { name: 'Bùa', stats: { hpPct: [0.04, 0.055, 0.07, 0.11, 0.16, 0.24, 0.348], armor: [0.02, 0.025, 0.03, 0.05, 0.07, 0.1, 0.145] }, names: ['Bùa Gỗ', 'Bùa Hổ Phách', 'Bùa Ngà', 'Bùa Trăng', 'Bùa Tinh Tú', 'Tim Golem', 'Bùa Huyết Long'] },
};
// black tier (12/11/2026): "… Hắc Long"
{
  const BLACK = { weapon: 'Kiếm Hắc Long', helmet: 'Mũ Hắc Long', armor: 'Giáp Hắc Long', boots: 'Hài Hắc Long', ring: 'Nhẫn Hắc Long', amulet: 'Bùa Hắc Long', shield: 'Khiên Hắc Long', gloves: 'Găng Hắc Long' };
  for (const [slot, info] of Object.entries(SLOT_INFO)) {
    for (const v of Object.values(info.stats)) if (v.length === 7) v.push(v[6] >= 10 ? Math.round(v[6] * 1.45) : Math.round(v[6] * 1.45 * 1000) / 1000);
    if (info.names.length === 7) info.names.push(BLACK[slot]);
  }
}
// ---- equipment stats v2 (docs/design/23-chi-so-trang-bi.md, 12/11/2026) ----
// main stats: ×1.45 per tier, anchored on purple (= the v1 purple values). OLD_SLOT_STATS keeps v1 to convert saved items.
export const GEAR_STEP = 1.45, GEAR_V = 3; // v3 (13/11/2026): items have a level (docs/design/26-mo-phong-trang-bi-level.md)
export const OLD_SLOT_STATS = Object.fromEntries(Object.entries(SLOT_INFO).map(([slot, i]) => [slot, Object.fromEntries(Object.entries(i.stats).map(([k, v]) => [k, [...v]]))]));
for (const info of Object.values(SLOT_INFO)) for (const [k, v] of Object.entries(info.stats)) {
  const anchor = v[4];
  info.stats[k] = TIERS.map((_, t) => { const x = anchor * Math.pow(GEAR_STEP, t - 4); return k === 'hp' ? Math.round(x) : Math.round(x * 1000) / 1000; });
}
// extra lines: 1/3 of the reference slot's main stat of that tier
export const EXTRA_REF = { atk: ['weapon', 'atk'], hp: ['helmet', 'hp'], armor: ['armor', 'armor'], speed: ['boots', 'speed'], as: ['gloves', 'as'] };
export const EXTRA_SHARE = 1 / 3;
// lifesteal / dodge (12/11/2026): extra lines only, one line = this × GEAR_STEP^(tier − purple); hero caps; the army gets ARMY_SHARE of it
export const EXTRA_FLAT = { ls: 0.04, dg: 0.03 };
export const LS_CAP = 0.3, DODGE_CAP = 0.3;
// soldiers get a share of the hero's gear (flat HP: every 100 = +1 % soldier HP); capped
export const ARMY_SHARE = { atk: 0.1, as: 0.15, armor: 0.12, hpPct: 0.15, hpFlat: 0.0001, ls: 0.15, dg: 0.15 };
export const ARMY_CAP = { atk: 0.5, hp: 0.5, armor: 0.15, as: 0.15, ls: 0.05, dg: 0.05 };
// sets: 3 / 6 / 8 worn pieces of exactly the same quality → hero +a % HP & damage / army +b % HP / army +c % damage, +d % attack speed
export const GEAR_SETS = {
  common: { name: 'Tân Binh', a: 0.04, b: 0.01, c: 0.01, d: 0 },
  fine: { name: 'Hổ Phách', a: 0.05, b: 0.02, c: 0.02, d: 0 },
  uncommon: { name: 'Lục Bảo', a: 0.06, b: 0.03, c: 0.03, d: 0.01 },
  rare: { name: 'Lam Ngọc', a: 0.08, b: 0.04, c: 0.04, d: 0.01 },
  epic: { name: 'Hắc Diệu', a: 0.1, b: 0.05, c: 0.05, d: 0.02 },
  legendary: { name: 'Kim Long', a: 0.12, b: 0.06, c: 0.06, d: 0.03 },
  mythic: { name: 'Huyết Long', a: 0.15, b: 0.08, c: 0.08, d: 0.04 },
  black: { name: 'Hắc Long', a: 0.2, b: 0.1, c: 0.1, d: 0.05 },
};
export const SET_AT = [3, 6, 8];
/** the 3 lines of a set, for display: [{ n, text }] */
export const setLines = (tier) => { const S = GEAR_SETS[tier], p = (v) => Math.round(v * 100); return [
  { n: 3, text: `Tướng +${p(S.a)}% máu, +${p(S.a)}% sát thương` },
  { n: 6, text: `Quân +${p(S.b)}% máu` },
  { n: 8, text: `Quân +${p(S.c)}% sát thương${S.d ? `, +${p(S.d)}% tốc đánh` : ''}` },
]; };
/** saved v1 item → v2: main stats from the new table, the extra-line part ×(1/3 ÷ 1/2) */
function restatV2(it) {
  if (!it || it.sv >= 2 || !SLOT_INFO[it.slot]) return it;
  const ti = TIERS.indexOf(it.tier); if (ti < 0) return it;
  const old = OLD_SLOT_STATS[it.slot], nw = SLOT_INFO[it.slot].stats, st = {};
  for (const [k, v] of Object.entries(it.stats ?? {})) {
    const main0 = old[k]?.[ti] ?? 0, extra = Math.max(0, v - main0) * (EXTRA_SHARE / 0.5);
    st[k] = Math.round(((nw[k]?.[ti] ?? 0) + extra) * 1000) / 1000;
  }
  for (const [k, v] of Object.entries(nw)) if (st[k] == null) st[k] = v[ti];
  it.stats = st; it.sv = 2;
  return it;
}
// ---- item levels (13/11/2026, docs/design/excel/trang-bi-level.xlsx): value = purple-lv50 base × 1.45^(tier − purple) × level factor × roll
export const ITEM_LV_MAX = 100;
export const itemLvMult = (lv) => 0.5 + (0.5 * Math.max(1, Math.min(ITEM_LV_MAX, lv | 0))) / 50; // lv 1 ×0.51 · lv 50 ×1 · lv 100 ×1.5
export const ITEM_ROLL = [0.9, 1.1];
export const EXTRA_COUNT = [[0, 0], [0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 4]]; // extra lines by quality: [min, max]
export const SUB_BASE = { atk: 0.15, hp: 133, hpPct: 0.053, armor: 0.053, speed: 0.053, as: 0.053, ls: 0.04, dg: 0.03 }; // one extra line, purple lv 50
export const SLOT_POOL = { // the 4 extra-line kinds a slot can roll (never its main stats, never twice)
  weapon: ['as', 'ls', 'hp', 'dg'], helmet: ['hpPct', 'armor', 'dg', 'atk'], armor: ['hp', 'hpPct', 'dg', 'ls'], boots: ['dg', 'as', 'hp', 'armor'],
  ring: ['as', 'ls', 'dg', 'armor'], amulet: ['hp', 'ls', 'atk', 'speed'], shield: ['hpPct', 'dg', 'ls', 'atk'], gloves: ['ls', 'dg', 'hp', 'speed'],
};
/** level of a dropped item: follows the hero who earned it (−6 … +2); DROP_OVER of the time it is ahead (+3 … +10),
 *  something to level up for. Never above the source's ceiling (13/11/2026) */
export const DROP_OVER = 0.15;
export const dropLv = (heroLv, cap = ITEM_LV_MAX, rand = Math.random) => {
  const h = Math.min(ITEM_LV_MAX, (heroLv | 0) || 1), d = rand() < DROP_OVER ? 3 + Math.floor(rand() * 8) : -6 + Math.floor(rand() * 9);
  return Math.max(1, Math.min(cap, ITEM_LV_MAX, h + d));
};
export const CAMP_LV_CAP = (campLv) => 10 * campLv; // bãi quái L: items up to level 10·L
export const BOSS_LV_CAP = (bossLv) => Math.min(ITEM_LV_MAX, 30 + 10 * (bossLv - 1)); // boss level 1 → 30 … 8 → 100
export const MINE_LV_CAP = { gold: 20, oil: 20, tar: 40, crystal: 40, diamond: 60 };
const r2 = (k, v) => (k === 'hp' ? Math.round(v) : Math.round(v * 1000) / 1000);
/** stats of a level-lv item: main lines + the given extra kinds, each with its own roll (roll = null → random) */
function itemStats(slot, ti, lv, extras, rand, roll = null) {
  const k = itemLvMult(lv), R = () => roll ?? ITEM_ROLL[0] + rand() * (ITEM_ROLL[1] - ITEM_ROLL[0]), st = {};
  for (const [s, v] of Object.entries(SLOT_INFO[slot].stats)) st[s] = r2(s, v[ti] * k * R());
  for (const e of extras) st[e] = r2(e, (st[e] ?? 0) + SUB_BASE[e] * Math.pow(GEAR_STEP, ti - 4) * k * R());
  return st;
}
/** saved item → v3: gets a level (its owner's hero level when known, else 1); main stats at that level, extra kinds kept where the slot allows */
export function restatItem(it, lv = 1) {
  if (!it || it.sv === GEAR_V || !SLOT_INFO[it.slot]) return it;
  restatV2(it);
  const ti = TIERS.indexOf(it.tier); if (ti < 0) return it;
  const pool = SLOT_POOL[it.slot], main = SLOT_INFO[it.slot].stats, [lo, hi] = EXTRA_COUNT[ti];
  const old = Object.keys(it.stats ?? {}).filter((k) => !main[k] && pool.includes(k));
  const n = Math.max(lo, Math.min(hi, old.length || Math.round((lo + hi) / 2)));
  const ex = old.slice(0, n); for (const k of pool) if (ex.length < n && !ex.includes(k)) ex.push(k);
  it.lv = Math.max(1, Math.min(ITEM_LV_MAX, lv | 0 || 1));
  it.stats = itemStats(it.slot, ti, it.lv, ex, Math.random, 1);
  it.sv = GEAR_V;
  return it;
}
// most mines of each kind one player (bots too) may hold in the open world, so new players find free mines (12/11/2026)
export const MINE_CAP = { iron: 15, coal: 12, gold: 8, oil: 6, tar: 4, crystal: 2, diamond: 1 };
// Nữ hoàng Sa mạc (13/11/2026): her palace in the south sells extra mine slots per account. Priced so the first slot of any
// kind pays back in ~8–11 h of play (mine level 1, hold bonus, 70 % management); the k-th costs base × (1 + 0.35·(k−1)).
// At most MINE_EXTRA_MAX extra of each kind (diamond stays rare). Every price fits a Thành trì 2–3 storage.
export const MINE_EXTRA_MAX = { iron: 10, coal: 8, gold: 6, oil: 4, tar: 3, crystal: 2, diamond: 1 };
export const MINE_SLOT_COST = {
  iron: { iron: 3500, coal: 1000, gold: 600 }, coal: { coal: 2800, iron: 1500, gold: 600 }, gold: { gold: 1000, iron: 1500, coal: 600 },
  oil: { oil: 600, gold: 600, iron: 1000 }, tar: { tar: 400, gold: 700, iron: 1000 }, crystal: { crystal: 250, gold: 900, tar: 100 },
  diamond: { diamond: 120, gold: 1500, crystal: 250 },
};
export const MINE_SLOT_STEP = 0.35;
/** price of the k-th extra slot (k = 1, 2, …) */
export const mineSlotCost = (type, k) => Object.fromEntries(Object.entries(MINE_SLOT_COST[type]).map(([r, v]) => [r, Math.round((v * (1 + MINE_SLOT_STEP * (k - 1))) / 10) * 10]));
export const QUEEN_SIZE = [20, 14], QUEEN_SAFE_R = 15, QUEEN_USE_R = 12; // ×2 like the King (13/11/2026)
export const PALACE_BLOCK = 0.7; // the back 70 % of a palace footprint blocks the way, the front (steps, throne) stays walkable
// Thú cưng (13/11/2026): bought once in the shop (per account), one follows the hero at a time; each gives one bonus
// speed: army move speed · loot: camp drop chance × · hpPct / armor / atk / ls: hero · xp: × XP · res: × mine income and camp
// rewards · regen: hero HP per second (even in a fight) · army: soldiers' damage and HP
export const PETS = {
  // bonus = cả đội (hero AND soldiers: atk / hp / armor / ls / speed / regen per s) + loot / xp / res for the owner
  // fight = the pet's own battle form (13/11/2026): appears next to the hero in a fight, ×(1 + 1.5 % × hero level)
  'soi-con': { name: 'Sói Con', icon: '🐺', bonus: { speed: 0.08 }, text: 'Cả đội +8% tốc chạy', role: 'Cận chiến nhanh',
    fight: { cls: 'cav', hp: 1400, atk: 45, cd: 0.8, range: 1.2, armor: 0.15, speed: 3.4 }, pay: 'boots', cost: {} },
  'meo-than-tai': { name: 'Mèo Thần Tài', icon: '🐱', bonus: { loot: 0.15 }, text: '+15% tỉ lệ rơi đồ', role: 'Ném đồng vàng tầm xa',
    fight: { cls: 'ranged', hp: 1000, atk: 50, cd: 1.4, range: 5, armor: 0.1, speed: 2.6, ranged: 'star' }, pay: 'shield', cost: {} },
  'gau-truc': { name: 'Gấu Trúc', icon: '🐼', bonus: { hp: 0.06 }, text: 'Cả đội +6% máu', role: 'Đỡ đòn, hút 3 kẻ địch',
    fight: { cls: 'inf', hp: 3000, atk: 40, cd: 1.4, range: 1.2, armor: 0.3, speed: 2.4, cap: 3 }, pay: 'helmet', cost: {} },
  'rua-da': { name: 'Rùa Đá', icon: '🐢', bonus: { armor: 0.05 }, text: 'Cả đội +5% giáp', role: 'Đỡ đòn cực lì',
    fight: { cls: 'inf', hp: 3600, atk: 30, cd: 1.6, range: 1.2, armor: 0.5, speed: 2.0, cap: 3 }, pay: 'armor', cost: {} },
  'cao-lua': { name: 'Cáo Lửa', icon: '🦊', bonus: { ls: 0.03 }, text: 'Cả đội +3% hút máu', role: 'Cận chiến đốt lửa',
    fight: { cls: 'inf', hp: 1300, atk: 60, cd: 1.0, range: 1.4, armor: 0.15, speed: 3.0 }, pay: 'gloves', cost: {} },
  'dai-bang': { name: 'Đại Bàng', icon: '🦅', bonus: { atk: 0.06 }, text: 'Cả đội +6% sát thương', role: 'Bay, bổ nhào',
    fight: { cls: 'fly', hp: 1200, atk: 65, cd: 1.0, range: 1.2, armor: 0.1, speed: 3.6, fly: true }, pay: 'weapon', cost: {} },
  'tho-ngoc': { name: 'Thỏ Ngọc', icon: '🐰', bonus: { xp: 0.2 }, text: '+20% kinh nghiệm', role: 'Phép trăng nổ vùng',
    fight: { cls: 'magic', hp: 1100, atk: 50, cd: 1.3, range: 4, armor: 0.1, speed: 2.8, ranged: 'orb', aoe: 1, pierce: true }, pay: 'amulet', cost: {} },
  'lac-da-vang': { name: 'Lạc Đà Vàng', icon: '🐫', bonus: { res: 0.1 }, text: '+10% tài nguyên từ mỏ và bãi quái', role: 'Đá hậu, khá lì',
    fight: { cls: 'cav', hp: 2400, atk: 45, cd: 1.5, range: 1.3, armor: 0.25, speed: 2.8 }, pay: 'ring', cost: {} },
  'phuong-hoang': { name: 'Phượng Hoàng Con', icon: '🐦‍🔥', bonus: { regen: 0.006 }, text: 'Cả đội hồi 0,6% máu mỗi giây (cả khi đánh)', role: 'Bay, lửa phép nổ vùng',
    fight: { cls: 'magic', hp: 1100, atk: 55, cd: 1.6, range: 5, armor: 0.1, speed: 3.2, ranged: 'orb', aoe: 1.5, pierce: true, fly: true }, pay: 'amulet', cost: {} },
  'rong-con': { name: 'Rồng Con', icon: '🐲', bonus: { atk: 0.04, hp: 0.04 }, text: 'Cả đội +4% sát thương và máu', role: 'Bay, phun lửa hình nón',
    fight: { cls: 'fly', hp: 2000, atk: 70, cd: 1.6, range: 3, armor: 0.2, speed: 3.0, fly: true, breath: true }, pay: 'ring', cost: {} },
  // ── Thần thú (bậc Cam, 13/11/2026): 4 linh thú tu tiên, đổi bằng 1 món Cam đúng ô; ~10 % phúc lợi, chiến ×1,4 Linh thú
  'cuu-vi-ho': { tier: 'legendary', name: 'Cửu Vĩ Hồ', icon: '🌸', bonus: { dg: 0.05, ls: 0.03 }, text: 'Cả đội +5% né đòn, +3% hút máu', role: 'Hồ hoả mê hoặc: xuyên, làm chậm, khó trúng',
    fight: { cls: 'magic', hp: 2000, atk: 78, cd: 1.2, range: 5, armor: 0.12, speed: 3.4, ranged: 'orb', pierce: true, slow: true, dodge: 0.2 }, pay: 'boots', cost: {} },
  'ty-huu': { tier: 'legendary', name: 'Tỳ Hưu', icon: '🦁', bonus: { loot: 0.2, res: 0.12 }, text: '+20% tỉ lệ rơi đồ, +12% tài nguyên', role: 'Nuốt vàng: dậm đất choáng vùng',
    fight: { cls: 'inf', hp: 4000, atk: 70, cd: 1.5, range: 1.4, armor: 0.35, speed: 2.6, cap: 3, stomp: true }, pay: 'ring', cost: {} },
  'tien-hac': { tier: 'legendary', name: 'Tiên Hạc', icon: '🦢', bonus: { xp: 0.25, speed: 0.04 }, text: '+25% kinh nghiệm, cả đội +4% tốc chạy', role: 'Bay, phóng lông vũ tầm xa',
    fight: { cls: 'ranged', hp: 1900, atk: 82, cd: 1.1, range: 6, armor: 0.12, speed: 3.6, fly: true, ranged: 'star' }, pay: 'helmet', cost: {} },
  'ky-lan': { tier: 'legendary', name: 'Kỳ Lân', icon: '🦄', bonus: { atk: 0.035, hp: 0.035, armor: 0.03 }, text: 'Cả đội +3,5% sát thương, +3,5% máu, +3% giáp', role: 'Lao tới dậm lửa, khá lì',
    fight: { cls: 'cav', hp: 3600, atk: 86, cd: 1.3, range: 1.4, armor: 0.35, speed: 3.2, charge: true, stomp: true }, pay: 'shield', cost: {} },
  // ── Thánh thú / Tứ Linh (bậc Đỏ, 13/11/2026): Thanh Long, Bạch Hổ, Chu Tước, Huyền Vũ, đổi bằng 1 món Đỏ đúng ô;
  //    ~15 % phúc lợi, chiến ×2 Linh thú
  'thanh-long': { tier: 'mythic', name: 'Thanh Long', icon: '🐉', bonus: { atk: 0.09, speed: 0.07 }, text: 'Cả đội +9% sát thương, +7% tốc chạy', role: 'Bay, phun lôi thuỷ hình nón',
    fight: { cls: 'fly', hp: 4400, atk: 140, cd: 1.5, range: 3.4, armor: 0.28, speed: 3.4, fly: true, breath: true }, pay: 'weapon', cost: {} },
  'bach-ho': { tier: 'mythic', name: 'Bạch Hổ', icon: '🐅', bonus: { as: 0.1, atk: 0.05 }, text: 'Cả đội +10% tốc đánh, +5% sát thương', role: 'Vồ mồi: lao tới đánh choáng',
    fight: { cls: 'cav', hp: 4000, atk: 150, cd: 0.9, range: 1.3, armor: 0.28, speed: 3.8, charge: true }, pay: 'gloves', cost: {} },
  'chu-tuoc': { tier: 'mythic', name: 'Chu Tước', icon: '🔥', bonus: { regen: 0.01, hp: 0.06 }, text: 'Cả đội hồi 1% máu/giây, +6% máu', role: 'Bay, mưa lửa nổ vùng rộng',
    fight: { cls: 'magic', hp: 3100, atk: 115, cd: 1.5, range: 5.5, armor: 0.18, speed: 3.4, fly: true, ranged: 'orb', aoe: 2, pierce: true }, pay: 'amulet', cost: {} },
  'huyen-vu': { tier: 'mythic', name: 'Huyền Vũ', icon: '🐍', bonus: { armor: 0.09, hp: 0.07 }, text: 'Cả đội +9% giáp, +7% máu', role: 'Rùa rắn: đỡ 4 kẻ địch, làm chậm',
    fight: { cls: 'inf', hp: 8000, atk: 66, cd: 1.5, range: 1.4, armor: 0.55, speed: 2.2, cap: 4, slow: true }, pay: 'armor', cost: {} },
  // ── Thượng cổ thần thú (bậc Đen, 13/11/2026): huyền thoại Sơn Hải Kinh, đổi bằng 1 món Đen đúng ô; ~25 % phúc lợi, chiến ×2,8
  'con-bang': { tier: 'black', name: 'Côn Bằng', icon: '🐋', bonus: { speed: 0.15, atk: 0.1, as: 0.07 }, text: 'Cả đội +15% tốc chạy, +10% sát thương, +7% tốc đánh', role: 'Cá hoá chim: bay, cuồng phong hình nón',
    fight: { cls: 'fly', hp: 9000, atk: 220, cd: 1.6, range: 3.6, armor: 0.32, speed: 4.0, fly: true, breath: true }, pay: 'boots', cost: {} },
  'ung-long': { tier: 'black', name: 'Ứng Long', icon: '⚡', bonus: { atk: 0.15, ls: 0.06 }, text: 'Cả đội +15% sát thương, +6% hút máu', role: 'Rồng cánh: lao xuống, sấm dậm choáng vùng',
    fight: { cls: 'fly', hp: 8500, atk: 260, cd: 1.4, range: 1.6, armor: 0.32, speed: 3.8, fly: true, charge: true, stomp: true, ls: 0.15 }, pay: 'weapon', cost: {} },
  'bach-trach': { tier: 'black', name: 'Bạch Trạch', icon: '🐐', bonus: { xp: 0.5, loot: 0.35, res: 0.25, regen: 0.005 }, text: '+50% XP, +35% rơi đồ, +25% tài nguyên, đội hồi 0,5% máu/s', role: 'Thần thú thông tuệ: phép thánh nổ vùng, làm chậm',
    fight: { cls: 'magic', hp: 6200, atk: 180, cd: 1.5, range: 6, armor: 0.22, speed: 3.2, ranged: 'orb', aoe: 2, pierce: true, slow: true }, pay: 'amulet', cost: {} },
  'thao-thiet': { tier: 'black', name: 'Thao Thiết', icon: '👹', bonus: { hp: 0.13, ls: 0.06, armor: 0.06 }, text: 'Cả đội +13% máu, +6% hút máu, +6% giáp', role: 'Nuốt trời: đỡ 5 kẻ địch, hút máu cực mạnh',
    fight: { cls: 'inf', hp: 14000, atk: 170, cd: 1.5, range: 1.5, armor: 0.5, speed: 2.4, cap: 5, stomp: true, ls: 0.3 }, pay: 'armor', cost: {} },
};
/** pay tier of a pet: Tím (the first 10) / Cam (Thần thú) / Đỏ (Thánh thú, Tứ Linh) / Đen (Thượng cổ) — 13/11/2026 */
export const petTier = (id) => PETS[id]?.tier ?? 'epic';
export const PET_TIER_GROUPS = [['epic', 'Linh thú'], ['legendary', 'Thần thú'], ['mythic', 'Thánh thú · Tứ Linh'], ['black', 'Thượng cổ thần thú']];
// 13/11/2026: a pet is bought with ONE purple (Tím) item of the slot that matches its bonus (damage → a weapon …), from the bag or the Rương đồ
export const PET_PAY_TIER = 'epic'; // 13/11/2026: purple (was orange: only 1 orange item on the whole server)
export const PET_LV_STEP = 0.015, PET_REST = 90; // battle stats ×(1 + step × hero level); a beaten pet rests 90 s
/** battle-form stats of a pet for a hero level */
export const petFight = (id, lv = 1) => { const F = PETS[id]?.fight; if (!F) return null; const m = 1 + PET_LV_STEP * (lv | 0); return { ...F, hp: Math.round(F.hp * m), atk: Math.round(F.atk * m * 10) / 10, cap: F.cap ?? 1 }; };
export const petBonus = (id) => PETS[id]?.bonus ?? {};
export const WORLD_EVENT = {
  every: 7200, // a new event every 2 hours (Vietnam time: 0h, 2h, 4h …)
  chief: { name: 'Thủ lĩnh quái', life: 1800, escort: [['troll', 4], ['orc', 6]], reward: { crystal: 250, diamond: 40, gold: 2000 }, items: [['legendary', 0.15], ['epic', 0.45], ['rare', 0.4]], nItems: 3 },
  cart: { name: 'Đoàn xe vàng', life: 1500, speed: 0.55, escort: [['ho-ve-giao', 8], ['ho-ve-cung', 6], ['thu-hac-in', 2]], reward: { gold: 5000, diamond: 60, crystal: 300 }, items: [['epic', 0.35], ['rare', 0.65]], nItems: 2 },
};
export const SPEED_BONUS_CAP = 1; // hero / army move speed bonus from gear + points: at most +100 %
export const BAG_SIZE = 24; // 8×3 (12/11/2026, was 16)
export const ARMOR_CAP = 0.75;
export const ITEM_TTL = 120;
/** loot table for a cleared mine guard set */
export const MINE_DROPS = {
  gold: [['common', 0.45], ['fine', 0.3], ['uncommon', 0.25]], oil: [['common', 0.45], ['fine', 0.3], ['uncommon', 0.25]],
  tar: [['common', 0.15], ['fine', 0.2], ['uncommon', 0.55], ['rare', 0.1]], crystal: [['common', 0.15], ['fine', 0.2], ['uncommon', 0.55], ['rare', 0.1]],
  diamond: [['uncommon', 0.5], ['rare', 0.5]],
};
/** make an item: {id, slot, tier, name, stats:{atk,hp,hpPct,armor,speed}} */
export function makeItem(id, tier, rand = Math.random, slot = SLOTS[Math.floor(rand() * SLOTS.length)], lv = 1) {
  const ti = TIERS.indexOf(tier), info = SLOT_INFO[slot], [lo, hi] = EXTRA_COUNT[ti];
  const pool = [...SLOT_POOL[slot]], ex = [];
  for (let n = lo + Math.floor(rand() * (hi - lo + 1)); n > 0 && pool.length; n--) ex.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  lv = Math.max(1, Math.min(ITEM_LV_MAX, lv | 0 || 1));
  return { id, slot, tier, name: info.names[ti], lv, stats: itemStats(slot, ti, lv, ex, rand), sv: GEAR_V };
}
/** total bonuses of a set of equipped items */
export function equipBonus(equip) {
  const b = { atk: 0, hp: 0, hpPct: 0, armor: 0, speed: 0, as: 0, ls: 0, dg: 0 };
  for (const it of Object.values(equip ?? {})) if (it) for (const [k, v] of Object.entries(it.stats)) b[k] = (b[k] ?? 0) + v;
  return b;
}
/** worn pieces per quality: { tier: n } */
export function setCounts(equip) { const c = {}; for (const it of Object.values(equip ?? {})) if (it) c[it.tier] = (c[it.tier] ?? 0) + 1; return c; }
/** everything the gear gives: hero (equipBonus + set 3-piece) and army (shares + sets, capped) */
export function gearBonus(equip) {
  const hero = equipBonus(equip), c = setCounts(equip), set = { heroPct: 0, hp: 0, atk: 0, as: 0 };
  for (const [t, n] of Object.entries(c)) { const S = GEAR_SETS[t]; if (!S) continue; if (n >= 3) set.heroPct += S.a; if (n >= 6) set.hp += S.b; if (n >= 8) { set.atk += S.c; set.as += S.d; } }
  hero.hpPct += set.heroPct; hero.atk += set.heroPct;
  const raw = { atk: 0, hp: 0, hpPct: 0, armor: 0, as: 0, ls: 0, dg: 0 };
  for (const it of Object.values(equip ?? {})) if (it) { const a = armySrc(it); for (const k of Object.keys(raw)) raw[k] += a[k] ?? 0; }
  const army = {
    atk: Math.min(ARMY_CAP.atk, raw.atk * ARMY_SHARE.atk + set.atk),
    hp: Math.min(ARMY_CAP.hp, raw.hpPct * ARMY_SHARE.hpPct + raw.hp * ARMY_SHARE.hpFlat + set.hp),
    armor: Math.min(ARMY_CAP.armor, raw.armor * ARMY_SHARE.armor),
    as: Math.min(ARMY_CAP.as, raw.as * ARMY_SHARE.as + set.as),
    ls: Math.min(ARMY_CAP.ls, raw.ls * ARMY_SHARE.ls),
    dg: Math.min(ARMY_CAP.dg, raw.dg * ARMY_SHARE.dg),
  };
  for (const k of Object.keys(army)) army[k] = Math.round(army[k] * 1000) / 1000;
  return { hero, army, sets: c };
}
/** the stats of an item that feed the army share: main stats in full, extra lines at EXTRA_ARMY */
export const EXTRA_ARMY = 0.5;
function armySrc(it) {
  const ti = TIERS.indexOf(it.tier), main = SLOT_INFO[it.slot]?.stats ?? {}, out = {};
  if (it.sv >= 3) { for (const [k, v] of Object.entries(it.stats ?? {})) out[k] = main[k] ? v : v * EXTRA_ARMY; return out; } // v3: extra lines never share a main stat
  for (const [k, v] of Object.entries(it.stats ?? {})) { const m = Math.min(v, main[k]?.[ti] ?? 0); out[k] = m + (v - m) * EXTRA_ARMY; }
  return out;
}
/** what one item gives the army on its own (tooltip) */
export function itemArmy(it) {
  const s = it ? armySrc(it) : {};
  return { atk: (s.atk ?? 0) * ARMY_SHARE.atk, hp: (s.hpPct ?? 0) * ARMY_SHARE.hpPct + (s.hp ?? 0) * ARMY_SHARE.hpFlat, armor: (s.armor ?? 0) * ARMY_SHARE.armor, as: (s.as ?? 0) * ARMY_SHARE.as, ls: (s.ls ?? 0) * ARMY_SHARE.ls, dg: (s.dg ?? 0) * ARMY_SHARE.dg };
}
export const fmtStat = (k, v) => (k === 'hp' ? `+${Math.round(v)} ${STAT_NAME[k]}` : `+${Math.round(v * 1000) / 10}% ${STAT_NAME[k]}`);

/** Network type codes: index in this list. */
// ---- base building (docs/design/can-cu/) ----
// stat multiplier per level (×1 / 1.6 / 2.2 / 2.8 / 3.4); cost to reach level L = level-1 cost × UP_COST[L-1] (+ crystal at 4, diamond at 5)
// 13/11/2026 (docs/design/26): a TH X max army beats a TH X max base held by 40 % of the same army ~80 % of the time
// (was [1, 1.6, 2.2, 2.8, 3.4]: low bases fell 95 %, TH5 only 50 %)
export const B_LEVEL_MULT = [1.45, 1.8, 1.9, 1.92, 2.0, 2.3, 2.5, 2.7]; // 13/11/2026 v2: re-tuned with Hội thành, longer ranges (attack wins 75–90 %)
export const BUILD_GEAR = 2; // structures get 2× the soldiers' share of the owner's gear (HP, damage): gear on both sides keeps ~80 %
export const UP_COST = [1, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5];
export const UP_TIME = [0, 300, 900, 1800, 3600, 5400, 7200, 10800]; // seconds to upgrade to level 2..5, ×BUILD_TIME_MULT → 10 min / 30 min / 1 h / 2 h (11/11/2026, was 2–16 min)
export const WALL_TIME = [0, 0, 0, 0, 0, 0, 0, 0]; // walls are built and upgraded at once
export const BUILD_TIME_MULT = 2; // every other build / upgrade time ×2 (11/11/2026)
export const BUILDINGS = {
  'thap-cung': { name: 'Tháp cung', size: 2, hp: 800, armor: 0.1, atk: 18, cd: 1.3, range: 9, atkCls: 'ranged', ranged: 'arrow', cost: { iron: 120, coal: 60 }, time: 15, cap: 6, desc: 'Bắn xa 9 ô (xa hơn mọi lính), ×1,5 lên quân bay.' },
  'phao-da': { name: 'Pháo đá', size: 2, hp: 1200, armor: 0.2, atk: 60, cd: 3.0, range: 7.5, atkCls: 'siege', ranged: 'rock', aoe: 1.2, noFly: true, cost: { iron: 160, coal: 60, gold: 30 }, time: 20, cap: 6, desc: 'Nổ vùng 1,2 ô, diệt bộ binh đông. Không bắn được quân bay.' },
  'thap-phep': { name: 'Tháp phép', size: 2, hp: 750, armor: 0, atk: 50, cd: 2.0, range: 7, atkCls: 'magic', ranged: 'orb', aoe: 1.5, pierce: true, cost: { coal: 80, gold: 100, crystal: 15 }, time: 25, cap: 6, desc: 'Nổ vùng, xuyên giáp: khắc Hiệp sĩ, Rồng. Mỏng.' },
  tuong: { name: 'Tường', size: 1, hp: 400, armor: 0.3, cost: { iron: 25 }, time: 2, cap: 3, desc: 'Chặn đường quân đi bộ. Quân bay bay qua.' },
  kho: { name: 'Kho', size: 2, hp: 1200, armor: 0.2, cost: { iron: 200, coal: 100 }, time: 20, cap: 6, store: [0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2], desc: 'Tăng sức chứa tài nguyên.' },
  // traps (11/11/2026): hidden from enemies, 1 tile, do not block the way; fire once then re-arm by themselves after `rearm` s
  bom: { maxLv: 5, name: 'Bom', size: 1, hp: 1, armor: 0, atk: 70, aoe: 1.5, trigger: 0.9, trap: 'bomb', rearm: 120, cost: { iron: 60, coal: 30 }, time: 8, cap: 1, desc: 'Bẫy ẩn: quân bộ địch dẫm vào là nổ vùng 1,5 ô. Tự nạp lại sau 2 phút.' },
  'lo-xo': { maxLv: 5, name: 'Lò xo', size: 1, hp: 1, armor: 0, atk: 0, lift: [2, 3, 4, 5, 6], trigger: 0.75, trap: 'spring', rearm: 150, cost: { iron: 100, coal: 50, gold: 20 }, time: 10, cap: 1, desc: 'Bẫy ẩn: hất quân bộ địch văng ra ngoài vùng căn cứ (2 → 6 ô quân theo cấp). Không hất tướng.' },
  'bom-khi': { maxLv: 5, name: 'Bom khí', size: 1, hp: 1, armor: 0, atk: 90, aoe: 2, trigger: 3.5, trap: 'air', rearm: 120, cost: { iron: 80, coal: 40, gold: 40 }, time: 12, cap: 1, desc: 'Bẫy ẩn: quân bay địch tới gần 3,5 ô là nổ vùng 2 ô trên trời.' },
  'hoc-vien': { maxLv: 5, name: 'Học viện', size: 2, hp: 1500, armor: 0.2, cost: { iron: 300, coal: 150, gold: 60 }, time: 30, cap: 4, academy: true, desc: 'Nghiên cứu nâng cấp quân (máu, sát thương). Mỗi lúc 1 loại, không tốn thợ.' },
  'hoi-thanh': { name: 'Hội thành', size: 3, hp: 1500, armor: 0.25, cost: { iron: 400, coal: 200, gold: 120 }, time: 60, cap: 8, castle: true, desc: 'Gửi lính vào giữ nhà: địch bước vào tầm canh là lính xông ra đánh, xong trận tự quay về.' },
  'doanh-trai': { name: 'Doanh trại', size: 7, hp: 2000, armor: 0.2, cost: { iron: 300, coal: 150 }, time: 45, cap: 8, barracks: [70, 100, 150, 250, 400, 500, 600, 700], desc: 'Sân tập: giới hạn chỗ ở của quân (dân quân 1 … rồng 8, cộng tất cả doanh trại). Lính cất (C) đứng trong sân.' },
  'ruong-do': { maxLv: 5, name: 'Rương đồ', size: 2, hp: 1200, armor: 0.25, cost: { iron: 400, coal: 200, gold: 100 }, time: 30, cap: 6, chest: true, desc: 'Cất trang bị và bột an toàn (không rơi khi chết, không bị cướp). 150 → 360 ô theo cấp.' },
  'lo-nghien': { maxLv: 5, name: 'Lò nghiền', size: 2, hp: 1600, armor: 0.25, cost: { iron: 4000, coal: 2000, gold: 2500, crystal: 300, diamond: 60 }, time: 120, cap: 6, grinder: true, desc: 'Nghiền trang bị thừa thành bột cùng phẩm chất (cấp cao có cơ hội ra 2 bột).' },
  'lo-ren': { maxLv: 5, name: 'Lò rèn', size: 3, hp: 2200, armor: 0.3, cost: { iron: 5000, coal: 2500, gold: 3500, crystal: 500, diamond: 100 }, time: 180, cap: 8, forge: true, desc: 'Rèn trang bị lên phẩm chất kế tiếp bằng bột (có tỉ lệ). Đồ Đỏ cần Lò rèn cấp 5.' },
  'nha-tho-xay': { name: 'Nhà thợ xây', size: 2, hp: 600, armor: 0.1, cost: { iron: 150, coal: 50 }, time: 15, cap: 3, noLevels: true, desc: 'Mỗi nhà có 1 thợ xây, tối đa 5 nhà (không phụ thuộc cấp Thành trì). Nhà đầu tiên được tặng; các nhà sau rất đắt.' },
  // 16/11/2026 (docs/design/27, 28): Thành trì 6–8 defences, 3 levels each (lvMult), max level = 2 at the Thành trì that opens it, 3 after
  'coi-phao': { name: 'Cối pháo', size: 3, hp: 2520, armor: 0.2, atk: 280, cd: 5, range: 11, minRange: 4, atkCls: 'siege', ranged: 'rock', aoe: 1.8, noFly: true, cost: { iron: 6000, coal: 3000, gold: 2500, tar: 300, diamond: 30 }, time: 1800, cap: 8, unlockTh: 6, maxLv: 3, lvMult: [1, 1.25, 1.5], desc: 'Bắn quả bom vồng rất xa (11 ô), nổ vùng 1,8 ô. Vùng chết 4 ô: địch sát chân thì không bắn được. Không bắn quân bay.' },
  'phong-khong': { name: 'Tháp phòng không', size: 3, hp: 2240, armor: 0.2, atk: 490, cd: 1, range: 10, atkCls: 'ranged', ranged: 'arrow', airOnly: true, cost: { iron: 5000, coal: 2500, gold: 3000, oil: 400, diamond: 30 }, time: 1800, cap: 8, unlockTh: 6, maxLv: 3, lvMult: [1, 1.25, 1.5], desc: 'Chỉ bắn quân bay (Sư thứu, Rồng, quân bay của boss), sát thương rất cao, tầm 10 ô.' },
  'no-than': { name: 'Nỏ Thần', size: 3, hp: 3500, armor: 0.3, atk: 42, cd: 0.25, range: 12, atkCls: 'ranged', ranged: 'arrow', cost: { iron: 8000, coal: 4000, gold: 5000, tar: 500, crystal: 300, diamond: 60 }, time: 3600, cap: 8, unlockTh: 7, maxLv: 3, lvMult: [1, 1.25, 1.5], desc: 'Nỏ liên thanh 4 mũi / giây, tầm 12 ô, bắn cả quân bộ lẫn quân bay.' },
  'cot-set': { name: 'Cột sét ẩn', size: 2, hp: 1260, armor: 0.1, atk: 112, cd: 1.6, range: 7, atkCls: 'magic', ranged: 'zap', chain: 2, hideR: 6, cost: { iron: 4000, coal: 2000, gold: 3000, crystal: 250, diamond: 40 }, time: 2400, cap: 6, unlockTh: 7, maxLv: 3, lvMult: [1, 1.25, 1.5], desc: 'Ẩn dưới đất, không bị đánh tới khi địch vào gần 6 ô thì trồi lên. Sét lan thêm 2 mục tiêu gần nhau. Đánh cả quân bay.' },
  'phao-chum': { name: 'Pháo chùm', size: 3, hp: 4200, armor: 0.3, atk: 350, cd: 4, range: 10, minRange: 3, atkCls: 'siege', ranged: 'scatter', aoe: 1.2, cone: 4, cost: { iron: 12000, coal: 6000, gold: 8000, tar: 800, crystal: 500, diamond: 100 }, time: 5400, cap: 8, unlockTh: 8, maxLv: 3, lvMult: [1, 1.25, 1.5], desc: 'Bắn bình nổ to, vỡ thành chùm mảnh văng hình nón 4 ô ra sau mục tiêu (50 % sát thương), trúng cả quân bay. Vùng chết 3 ô.' },
  'hoa-nguc': { name: 'Tháp Hỏa Ngục', size: 2, hp: 3080, armor: 0.25, atk: 40, cd: 0.25, range: 8, atkCls: 'magic', ranged: 'beam', beam: 10, beamT: 4, cost: { iron: 10000, coal: 5000, gold: 8000, tar: 800, crystal: 600, diamond: 120 }, time: 5400, cap: 6, unlockTh: 8, maxLv: 3, lvMult: [1, 1.25, 1.5], desc: 'Tia lửa liên tục vào 1 mục tiêu: 40 → 400 sát thương / giây sau 4 giây bám liền. Khắc tướng, quân máu trâu, boss. Đánh cả quân bay.' },
  'be-vua': { name: 'Bệ Vua', size: 3, hp: 3000, armor: 0.3, cost: { gold: 6000, crystal: 300, diamond: 80 }, time: 1800, cap: 8, unlockTh: 6, homeHero: 'vua-thanh', heroLv: [0, 0, 0, 0, 0, 10, 15, 20], desc: 'Nơi Vua Thành đứng giữ nhà. Địch vào vùng canh 12 ô thì Vua xông ra, hết địch thì về bệ. Bị hạ thì nghỉ 10 phút trên bệ. Nâng cấp bệ = lên cấp Vua.' },
  'be-nu-hoang': { name: 'Bệ Nữ hoàng', size: 3, hp: 3000, armor: 0.3, cost: { gold: 9000, crystal: 500, diamond: 150 }, time: 3600, cap: 8, unlockTh: 8, homeHero: 'nu-hoang-bang', heroLv: [0, 0, 0, 0, 0, 0, 0, 10], desc: 'Nơi Nữ hoàng Băng đứng giữ nhà. Địch vào vùng canh 13 ô thì Nữ hoàng ra bắn nỏ băng (làm chậm), xong về bệ. Nâng cấp bệ = lên cấp Nữ hoàng.' },
};
export const TOWN_HALL = {
  name: 'Thành trì', size: 3, armor: 0.3, cap: 10,
  levels: [
    { hp: 3000, cost: { iron: 300, coal: 100 }, time: 20, max: { 'thap-cung': 2, 'phao-da': 1, 'thap-phep': 0, tuong: 60, 'nha-tho-xay': 5, 'bom': 2, 'lo-xo': 0, 'bom-khi': 0, 'hoc-vien': 1, 'ruong-do': 1, 'lo-nghien': 0, 'lo-ren': 0, 'doanh-trai': 1, 'hoi-thanh': 0, kho: 1 }, builders: 1, store: 1.5 },
    { hp: 4500, cost: { iron: 700, coal: 300, gold: 150 }, time: 600, max: { 'thap-cung': 3, 'phao-da': 1, 'thap-phep': 1, tuong: 120, 'nha-tho-xay': 5, 'bom': 3, 'lo-xo': 1, 'bom-khi': 0, 'hoc-vien': 1, 'ruong-do': 1, 'lo-nghien': 0, 'lo-ren': 0, 'doanh-trai': 2, 'hoi-thanh': 1, kho: 1 }, builders: 2, store: 2.25 },
    { hp: 6000, cost: { iron: 1400, coal: 600, gold: 400, oil: 60 }, time: 1800, max: { 'thap-cung': 4, 'phao-da': 2, 'thap-phep': 1, tuong: 180, 'nha-tho-xay': 5, 'bom': 4, 'lo-xo': 2, 'bom-khi': 1, 'hoc-vien': 1, 'ruong-do': 1, 'lo-nghien': 0, 'lo-ren': 0, 'doanh-trai': 2, 'hoi-thanh': 1, kho: 2 }, builders: 2, store: 3.5 },
    { hp: 8000, cost: { iron: 2400, coal: 1000, gold: 800, tar: 120, crystal: 40 }, time: 3600, max: { 'thap-cung': 5, 'phao-da': 3, 'thap-phep': 2, tuong: 240, 'nha-tho-xay': 5, 'bom': 5, 'lo-xo': 2, 'bom-khi': 2, 'hoc-vien': 1, 'ruong-do': 1, 'lo-nghien': 1, 'lo-ren': 1, 'doanh-trai': 3, 'hoi-thanh': 1, kho: 2 }, builders: 2, store: 5 },
    { hp: 10500, cost: { iron: 3600, coal: 1600, gold: 1500, tar: 250, crystal: 120, diamond: 25 }, time: 5400, max: { 'thap-cung': 6, 'phao-da': 4, 'thap-phep': 3, tuong: 300, 'nha-tho-xay': 5, 'bom': 6, 'lo-xo': 3, 'bom-khi': 3, 'hoc-vien': 1, 'ruong-do': 1, 'lo-nghien': 1, 'lo-ren': 1, 'doanh-trai': 3, 'hoi-thanh': 1, kho: 3 }, builders: 3, store: 7 },
    // 16/11/2026: Thành trì 6–8 (docs/design/28-chi-so-th6-8.md)
    { hp: 13500, cost: { iron: 5500, coal: 2500, gold: 2500, tar: 400, crystal: 220, diamond: 50 }, time: 7200, max: { 'thap-cung': 7, 'phao-da': 5, 'thap-phep': 4, tuong: 350, 'nha-tho-xay': 5, 'bom': 7, 'lo-xo': 3, 'bom-khi': 4, 'hoc-vien': 1, 'ruong-do': 1, 'lo-nghien': 1, 'lo-ren': 1, 'doanh-trai': 3, 'hoi-thanh': 1, kho: 3, 'coi-phao': 1, 'phong-khong': 1, 'be-vua': 1 }, builders: 3, store: 9 },
    { hp: 17000, cost: { iron: 8000, coal: 3600, gold: 3800, tar: 600, crystal: 350, diamond: 90 }, time: 10800, max: { 'thap-cung': 7, 'phao-da': 5, 'thap-phep': 4, tuong: 400, 'nha-tho-xay': 5, 'bom': 8, 'lo-xo': 4, 'bom-khi': 4, 'hoc-vien': 1, 'ruong-do': 1, 'lo-nghien': 1, 'lo-ren': 1, 'doanh-trai': 3, 'hoi-thanh': 1, kho: 4, 'coi-phao': 2, 'phong-khong': 2, 'no-than': 1, 'cot-set': 2, 'be-vua': 1 }, builders: 4, store: 11.5 },
    { hp: 21000, cost: { iron: 11000, coal: 5000, gold: 5500, tar: 900, crystal: 500, diamond: 150 }, time: 14400, max: { 'thap-cung': 8, 'phao-da': 6, 'thap-phep': 5, tuong: 450, 'nha-tho-xay': 5, 'bom': 8, 'lo-xo': 4, 'bom-khi': 5, 'hoc-vien': 1, 'ruong-do': 1, 'lo-nghien': 1, 'lo-ren': 1, 'doanh-trai': 3, 'hoi-thanh': 1, kho: 4, 'coi-phao': 2, 'phong-khong': 2, 'no-than': 2, 'cot-set': 3, 'phao-chum': 1, 'hoa-nguc': 1, 'be-vua': 1, 'be-nu-hoang': 1 }, builders: 4, store: 14 },
  ],
};
// open world: the Thành trì level needed to buy a unit (no Thành trì = level 0). Match rooms have no bases: no lock there.
export const UNIT_TH = { 'hiep-si': 1, 'phap-su': 2, 'may-ban-da': 3, 'su-thuu': 4, rong: 5, 'cong-binh': 6, 'y-su': 7, 'voi-chien': 8 };
export const BASE_ZONE = 37; // tiles beyond the Thành trì edge (77×77 tiles in all; 12/11/2026: 12 → 18 → 37, ×2 at the owner's request)
export const BASE_GAP = 80; // min distance between two Thành trì centres (zones 77 wide never overlap)
// min distance from a Thành trì centre to: spawn camps, monster camps, boss lairs, mines (11/11/2026: shrunk from 16 / 16 / 18)
export const TH_GAP = { spawn: 10, camp: 12, boss: 14, mine: 5 };
export const STORAGE_BASE = { iron: 4000, coal: 3000, gold: 1500, oil: 1200, tar: 600, crystal: 300, diamond: 120 };
export const STORE_MULT = 2; // 14/11/2026: every storage (Thành trì + Kho, and what the Kho keeps safe) ×2; prices still use STORAGE_BASE
// ---- dọn chướng ngại trong vùng căn cứ (chặt cây / đập đá), kiểu Clash of Clans ----
// thợ xây làm (chiếm 1 thợ), tốn tài nguyên, có thời gian; xong thì ô đó trống mãi. reward: [loại, tỉ lệ, ít nhất, nhiều nhất]
export const CLEAR = {
  tree: { name: 'Cây', verb: 'Chặt', cost: { iron: 30, coal: 10 }, time: 40, reward: ['crystal', 0.2, 2, 4] },
  pine: { name: 'Cây thông', verb: 'Chặt', cost: { iron: 30, coal: 10 }, time: 40, reward: ['crystal', 0.2, 2, 4] },
  palm: { name: 'Cây dừa', verb: 'Chặt', cost: { iron: 30, coal: 10 }, time: 40, reward: ['crystal', 0.2, 2, 4] },
  dead: { name: 'Cây khô', verb: 'Chặt', cost: { iron: 15 }, time: 20, reward: ['crystal', 0.1, 1, 2] },
  cactus: { name: 'Xương rồng', verb: 'Chặt', cost: { iron: 15 }, time: 20, reward: ['crystal', 0.1, 1, 2] },
  rock: { name: 'Tảng đá', verb: 'Đập', cost: { iron: 60, coal: 40 }, time: 90, reward: ['diamond', 0.25, 1, 2] },
};
/** obstacle id on the map (tools/mapgen/gen.mjs O) → CLEAR kind; anything else (nước, vực, nhà, tháp, cột đá…) cannot be cleared */
export const OBST_CLEAR = { 1: 'tree', 2: 'pine', 3: 'rock', 4: 'cactus', 11: 'dead', 12: 'dead', 13: 'palm' };

// bot lãnh chúa NPC chơi 24/24 nên bị giảm: nhận 25% tài nguyên, xây / nâng cấp / triệu tập quân lâu gấp 4 (11/11/2026)
export const BOT_RES = 0.3375, BOT_SLOW = 3; // 14/11/2026: +35 % resources (0.25 → 0.3375) and build / upgrade a bit faster (×4 → ×3)
export const BOT_DROP = 0.5; // 14/11/2026: bots farm camps too, with half the item drop chance of a player
// 13/11/2026: the raid loot is spread over the Thành trì (RAID_TH_PART of it) and the Kho (the rest, split evenly); each one
// gives its part when it falls (once per RAID_COOLDOWN). No Kho: the Thành trì holds everything
export const RAID_TH_PART = 0.4;
export const RAID_SHARE = 0.1, RAID_COOLDOWN = 7200, RAID_SHIELD = 1800, REPAIR_SHARE = 0.1; // repair = 10 % of all that was paid (upgrades got much dearer)
/** structures that need no builder (built / upgraded at once) */
// ---- Trang trí (12/11/2026, docs/design/samples/buildings/prompts/14-trang-tri.md): look only, no HP, never attacked,
// do not block the way, no levels, placed at once, sold back at full price. Drawn small (smaller than any structure).
export const DECOS = {
  'tt-duoc': ['Đuốc đứng', 1, { iron: 120, coal: 120 }], 'tt-co': ['Cột cờ', 1, { iron: 150, gold: 60 }], 'tt-den': ['Đèn lồng đá', 1, { iron: 200, coal: 100 }],
  'tt-bui-hoa': ['Bụi hoa', 1, { gold: 80 }], 'tt-chau-cay': ['Chậu cây cắt tỉa', 1, { gold: 120, coal: 60 }], 'tt-thung': ['Thùng gỗ, bao tải', 1, { iron: 100, coal: 100 }],
  'tt-hinh-nom': ['Hình nộm tập kiếm', 1, { iron: 150, coal: 80 }], 'tt-gia-vu-khi': ['Giá vũ khí', 1, { iron: 300, gold: 100 }], 'tt-lua-trai': ['Lửa trại', 1, { coal: 200, iron: 80 }],
  'tt-cot-da': ['Cột đá cổ', 1, { iron: 300, gold: 150 }],
  'tt-dai-phun': ['Đài phun nước', 2, { iron: 1500, gold: 800, oil: 200 }], 'tt-tuong-anh-hung': ['Tượng anh hùng', 2, { iron: 2000, gold: 1200, crystal: 50 }],
  'tt-anh-dao': ['Cây anh đào', 2, { gold: 1000, oil: 300 }], 'tt-cong-hoa': ['Cổng vòm hoa', 2, { iron: 800, gold: 600 }], 'tt-luong-hoa': ['Luống hoa', 2, { gold: 500, coal: 300 }],
  'tt-tuong-rong': ['Tượng rồng đá', 2, { iron: 3000, gold: 2000, diamond: 30 }], 'tt-ao-ca': ['Ao cá koi', 2, { gold: 1500, oil: 500, crystal: 40 }],
  'tt-bia': ['Bia chiến công', 2, { iron: 2500, gold: 1500, diamond: 20 }], 'tt-den-pha-le': ['Đền pha lê', 2, { gold: 2000, crystal: 200, diamond: 50 }],
  'tt-leu': ['Lều chỉ huy', 2, { iron: 1200, coal: 800, gold: 600 }],
};
for (const [k, [name, size, cost]] of Object.entries(DECOS)) BUILDINGS[k] = { name, size, hp: 1, armor: 0, cost, time: 0, cap: 1, deco: true, noLevels: true, desc: 'Đồ trang trí: chỉ để làm đẹp căn cứ. Không máu, không bị phá, lính đi xuyên qua. Cất lại được, hoàn đủ tiền.' };
export const DECO_MAX = { 1: [2, 3, 4, 5, 6], 2: [1, 1, 2, 2, 3] }; // of each piece, by Thành trì level (small / big)
export const NO_BUILDER = (type) => type === 'tuong' || !!BUILDINGS[type]?.trap || !!BUILDINGS[type]?.deco;
export const B_TYPES = ['thanh-tri', ...Object.keys(BUILDINGS)];
// Thành trì cấp 5 (cấp cuối): không giới hạn số công trình. Mỗi công trình vượt mức của cấp 5 làm giá xây và nâng cấp
// loại đó tăng thêm EXTRA_STEP (tường +2 %/bức, công trình khác +25 %/cái), tính theo tổng số đang có.
export const TH_MAX = 8; // 16/11/2026: was 5
export const EXTRA_STEP = { tuong: 0.02 };
export const EXTRA_STEP_DEF = 0.25;
/** building limit for a type at Thành trì level thLv (Infinity at the last level) */
export const HUT_MAX = 5;
export const ONE_PER_BASE = new Set(['ruong-do', 'lo-nghien', 'lo-ren']); // never more than one, optional for the Thành trì upgrade
export const OPTIONAL_B = new Set(['hoc-vien', 'ruong-do', 'lo-nghien', 'lo-ren']); // not needed to level the Thành trì
/** highest level a structure may reach with this Thành trì (16/11/2026: Thành trì 6–8; new defences 2 at their Thành trì, 3 after) */
export function bMaxLv(type, thLv) {
  if (type === 'thanh-tri') return TH_MAX;
  const b = BUILDINGS[type]; if (!b || b.noLevels || b.deco) return 1;
  if (b.homeHero) return b.heroLv?.[thLv - 1] ?? 0;
  if (b.unlockTh) return Math.max(0, Math.min(b.maxLv ?? 3, thLv - b.unlockTh + 2));
  return Math.min(thLv, b.maxLv ?? TH_MAX);
}
/** Thành trì level whose storage / times price level lv of this structure (new defences: lv1-2 at their Thành trì, lv3 one after) */
export const bThOf = (type, lv) => { const b = BUILDINGS[type]; return b?.unlockTh ? Math.min(TH_MAX, b.unlockTh + Math.max(0, lv - 2)) : b?.homeHero ? Math.min(TH_MAX, b.unlockTh + Math.floor((lv - 1) / 5)) : Math.min(TH_MAX, lv); };
export const bLimit = (type, thLv) => (BUILDINGS[type]?.deco ? Infinity /* 14/11/2026: decorations unlimited (DECO_MAX no longer used) */ : type === 'nha-tho-xay' ? HUT_MAX : /* 15/11/2026: Thành trì 5 no longer unlimited, its table applies */ TOWN_HALL.levels[thLv - 1]?.max[type] ?? 0);
/** price multiplier when the base holds n of this type (n counts the one being built) */
export function extraMult(type, n) {
  if (type === 'thanh-tri' || type === 'nha-tho-xay' || type === 'hoc-vien' || type === 'hoi-thanh' || type === 'doanh-trai' || ONE_PER_BASE.has(type) || BUILDINGS[type]?.deco) return 1;
  const over = Math.max(0, n - (TOWN_HALL.levels[TH_MAX - 1].max[type] ?? 0));
  return 1 + over * (EXTRA_STEP[type] ?? EXTRA_STEP_DEF);
}
/** cost to build (lv 1) or upgrade to level lv; n = how many of this type the base holds (for the price rise past the cap) */
// upgrade prices follow the storage of the Thành trì level they need (11/11/2026): the heaviest resource of the mix costs
// UP_SHARE of what that level can hold (Thành trì factor only, Kho not counted); the other resources keep their ratio.
export const UP_SHARE = { def: 0.25, tuong: 0.015, trap: 0.1, th: 0.4 };
function scaleToStore(cost, share, store) {
  const k = (share * store) / Math.max(...Object.entries(cost).map(([r, v]) => v / STORAGE_BASE[r]));
  return Object.fromEntries(Object.entries(cost).map(([r, v]) => [r, Math.max(1, Math.round((v * k) / 5) * 5)]));
}
// Nhà thợ xây (11/11/2026): price of the n-th hut, independent of the Thành trì (the 1st one is free with the Thành trì)
export const HUT_COST = [
  { iron: 150, coal: 50 },
  { iron: 1500, coal: 1200, gold: 800, diamond: 120 },
  { iron: 3000, coal: 2400, gold: 1600, diamond: 300 },
  { iron: 5000, coal: 4000, gold: 2800, diamond: 600 },
  { iron: 7500, coal: 6000, gold: 4000, diamond: 1000 },
];
export function buildCost(type, lv, n = 0) {
  if (type === 'thanh-tri') return lv === 1 ? { ...TOWN_HALL.levels[0].cost } : scaleToStore(TOWN_HALL.levels[lv - 1].cost, UP_SHARE.th, TOWN_HALL.levels[lv - 2].store);
  if (type === 'nha-tho-xay') return { ...HUT_COST[Math.max(0, Math.min(HUT_MAX, n || 1) - 1)] };
  if (BUILDINGS[type]?.deco) return { ...BUILDINGS[type].cost };
  const b = BUILDINGS[type], thq = bThOf(type, lv), store = TOWN_HALL.levels[thq - 1].store;
  const share = type === 'tuong' ? UP_SHARE.tuong : b.trap ? UP_SHARE.trap : b.grinder || b.forge ? 0.4 : UP_SHARE.def; // the furnaces are dear
  // the furnaces: every level dearer than the last (they are built at Thành trì 4, so the storage rule would make them cheap)
  if ((b.grinder || b.forge) && lv > 1) { const k = [1, 1.25, 1.6, 2.1, 2.8][lv - 1]; return Object.fromEntries(Object.entries(b.cost).map(([r, v]) => [r, Math.round((v * k) / 5) * 5])); }
  const c = lv === 1 ? { ...b.cost } : scaleToStore(b.cost, share, store);
  // walls (12/11/2026): every level brings a new resource, small amounts since there are hundreds of pieces
  if (type === 'tuong' && lv >= 2) {
    const k = (r, f, min) => Math.max(min, Math.round(STORAGE_BASE[r] * store * share * f));
    c.coal = k('coal', 0.3, 2);
    if (lv >= 3) c.gold = k('gold', 0.15, 2);
    if (lv >= 4) c.crystal = k('crystal', 0.12, 1);
    if (lv >= 5) c.diamond = k('diamond', 0.05, 1);
  }
  if (thq === 4 && lv > 1 && type !== 'tuong') c.crystal = (c.crystal ?? 0) + Math.max(3, Math.round(STORAGE_BASE.crystal * store * share * 0.2));
  if (thq >= 5 && lv > 1 && type !== 'tuong') c.diamond = Math.max(c.diamond ?? 0, Math.max(2, Math.round(STORAGE_BASE.diamond * store * share * 0.2)));
  const f = extraMult(type, n);
  if (f > 1) for (const r of Object.keys(c)) c[r] = Math.round(c[r] * f);
  return c;
}
export function buildTime(type, lv) {
  if (type === 'tuong') return WALL_TIME[lv - 1];
  if (BUILDINGS[type]?.trap || BUILDINGS[type]?.deco) return 0; // traps go up (and level up) at once, no builder needed
  if (type === 'thanh-tri') return TOWN_HALL.levels[lv - 1].time * BUILD_TIME_MULT;
  if (BUILDINGS[type]?.homeHero && lv > 1) return (900 + 120 * lv) * BUILD_TIME_MULT; // a hero level: 34 min (lv 2) … 1 h 50 (lv 20)
  return (lv === 1 ? BUILDINGS[type].time : UP_TIME[bThOf(type, lv) - 1] ?? UP_TIME[UP_TIME.length - 1]) * BUILD_TIME_MULT;
}
/** combat stats of a structure at level lv */
export function buildStats(type, lv) {
  if (type === 'thanh-tri') return { cls: 'build', hp: TOWN_HALL.levels[lv - 1].hp, armor: TOWN_HALL.armor, atk: 0, cd: 1, range: 0, speed: 0, cap: TOWN_HALL.cap, size: 3 };
  const b = BUILDINGS[type], m = b.homeHero ? 1 : (b.lvMult ?? B_LEVEL_MULT)[lv - 1] ?? 1;
  return { cls: 'build', hp: Math.round((b.hp * m) / 10) * 10, armor: b.armor, atk: b.atk ? Math.round(b.atk * m) : 0, cd: b.cd ?? 1, range: b.range ?? 0, speed: 0, cap: b.cap, size: b.size,
    atkCls: b.atkCls, ranged: b.ranged ?? null, aoe: b.aoe ?? 0, pierce: !!b.pierce, noFly: !!b.noFly,
    minRange: b.minRange ?? 0, airOnly: !!b.airOnly, chain: b.chain ?? 0, hideR: b.hideR ?? 0, cone: b.cone ?? 0, beam: b.beam ?? 0, beamT: b.beamT ?? 0 };
}
// Hội thành (12/11/2026, docs/design/can-cu/10-hoi-thanh.md): troops parked inside sally out when an enemy comes in range
// Doanh trại (12/11/2026): owned soldiers (army + kept in the base + queue) ≤ sum of the barracks' room; without one: NO_BARRACKS_CAP
export const NO_BARRACKS_CAP = 30;
export const CASTLE_CAP = [20, 30, 45, 60, 80, 96, 112, 128]; // 12/11/2026 (was 10..30)
export const CASTLE_RANGE = [24, 28, 32, 36, 40, 42, 44, 46]; // ×2 with the bigger base zone (12/11/2026)
// Hội thành v2 (13/11/2026): troops inside fight CASTLE_LV_BONUS levels above the research (max 5); the owner's soldiers
// standing in the watch range get +damage / −damage taken; "Gọi viện binh" brings the troops to the hero for a while
export const CASTLE_LV_BONUS = [1, 1, 1, 1, 1, 1, 1, 1]; // 13/11/2026: +2 at level 3+ made bases too strong (attack win rate 40–60 %)
export const CASTLE_AURA_ATK = [0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15], CASTLE_AURA_ARM = [0.04, 0.04, 0.05, 0.05, 0.06, 0.06, 0.07, 0.07];
export const CASTLE_CALL_CD = 300, CASTLE_CALL_DUR = 180;
export const HOUSING = { 'dan-quan': 1, 'cung-thu': 1, 'kiem-si': 2, 'linh-giao': 2, 'phap-su': 3, 'ky-binh': 4, 'hiep-si': 5, 'may-ban-da': 6, 'su-thuu': 7, rong: 8, 'cong-binh': 2, 'y-su': 5, 'voi-chien': 10 };
// Nâng cấp mỏ (12/11/2026, docs/design/can-cu/11-nang-cap-mo.md): the level belongs to the mine and stays when it is captured
export const MINE_LV_MULT = [1, 1.3, 1.6, 2, 2.5, 2.9, 3.3, 3.7]; // 6–8 (16/11/2026): Thành trì 6–8, drawn with the level-5 art
export const MINE_LV_MAX = 8;
export const MINE_UP_TIME = [0, 300, 900, 1800, 3600, 5400, 7200, 10800]; // s to reach level 2..8
export const MINE_UP_SHARE = 0.15;
/** cost to bring a mine of this type to level lv (2..5): iron + gold + its own resource, ~15 % of the needed Thành trì's storage */
export function mineUpCost(type, lv) {
  const store = TOWN_HALL.levels[lv - 1].store, k = MINE_UP_SHARE * store * (type === 'crystal' || type === 'diamond' ? 1.5 : 1);
  const rs = [...new Set(['iron', 'gold', type])];
  return Object.fromEntries(rs.map((r) => [r, Math.max(5, Math.round((k * STORAGE_BASE[r]) / rs.length / 5) * 5)]));
}
// Cấp anh hùng (12/11/2026, docs/design/19-cap-anh-hung.md): XP → levels → 10 potential points each, level caps opened
// at the Northern King's palace. Open world only; per account (kept on death and when switching hero).
export const HERO_CAPS = [30, 50, 70, 100];
export const HERO_UNLOCK = [ // to go past HERO_CAPS[i]
  { th: 3, cost: { gold: 4000, crystal: 600, diamond: 80 } },
  { th: 4, cost: { gold: 6500, crystal: 1200, diamond: 150 } },
  { th: 5, cost: { gold: 10000, crystal: 2000, diamond: 400 } },
];
export const heroXpNeed = (lv) => Math.round(20 * lv ** 1.5);
export const HERO_PTS = 10;
// each stat takes at most cap(L) points, L = the current level cap (30/50/70/100): opening a cap at the King raises them too
export const HERO_STAT = {
  hp: { name: 'Máu', per: 20, cap: (L) => 4 * L }, // 120 / 200 / 280 / 400 points
  atk: { name: 'Tấn công', per: 0.5, cap: (L) => 3 * L }, // 90 / 150 / 210 / 300
  as: { name: 'Tốc độ đánh', per: 0.005, cap: (L) => Math.min(100, 2 * L) }, // 60 / 100 → +30 % / +50 %
  ms: { name: 'Tốc độ di chuyển', per: 0.004, cap: (L) => Math.min(75, Math.round(1.5 * L)) }, // 45 / 75 → +18 % / +30 %
  ar: { name: 'Giáp', per: 0.0025, cap: (L) => 2 * L }, // 60 / 100 / 140 / 200 → +15 % … +50 % (total armour still ≤ 75 %)
  ls: { name: 'Hút máu', per: 0.002, cap: (L) => L }, // 12/11/2026: 30 / 50 / 70 / 100 → +6 % … +20 %
  dg: { name: 'Né', per: 0.002, cap: (L) => L }, // 30 … 100 → +6 % … +20 % (total dodge ≤ 30 %)
};
export const HERO_RESET_COST = { diamond: 50 };
export const HERO_XP = { camp: 4, wildGuard: 3, hero: 60, heroLv: 6, boss: 400, th: 120 };
// 13/11/2026: King and Queen ×2 (×4 was too big; art drawn PALACE_SCALE× bigger, footprint, peace ring and talk range to match)
export const PALACE_SCALE = 2;
export const KING_SIZE = [20, 14]; // palace footprint (tiles); was [10, 7]
export const KING_SAFE_R = 15; // no fighting this close to the palace centre
export const KING_USE_R = 12; // the hero must be this close to talk to the king (the front steps)
// Boss levels (12/11/2026): a random level 1..8 on every (re)spawn; level 1 = twice the old boss, +20 % per level after;
// XP ×1.5 at level 1, +20 % per level after
export const BOSS_LV_MAX = 8;
export const bossLvMult = (lv) => 2 * (1 + 0.2 * (lv - 1));
export const bossXpMult = (lv) => 1.5 * (1 + 0.2 * (lv - 1));
// Tướng giữ nhà (16/11/2026, docs/design/28 §5): stand on their altar (Bệ Vua / Bệ Nữ hoàng), sally at enemies in `guard`
// tiles, walk back after; knocked out → rest REST s on the altar. Level = the altar's level, +5 % hp / atk per level.
export const HOME_HEROES = {
  'vua-thanh': { name: 'Vua Thành', cls: 'hero', hp: 12600, atk: 308, cd: 1.4, range: 1.2, armor: 0.3, speed: 2.2, cap: 4, aoe: 1, guard: 12, skill: 'fury', skillCd: 20 },
  'nu-hoang-bang': { name: 'Nữ hoàng Băng', cls: 'hero', hp: 7000, atk: 252, cd: 0.9, range: 8, armor: 0.2, speed: 2.4, cap: 3, ranged: 'arrow', slowHit: 0.3, guard: 13, skill: 'blizzard', skillCd: 25 },
};
export const HOME_HERO_REST = 600;
export const homeHeroStats = (type, lv) => { const h = HOME_HEROES[type], k = 1 + 0.05 * (Math.max(1, lv) - 1); return { ...h, hp: Math.round(h.hp * k), atk: Math.round(h.atk * k) }; };
export const B_NAME = (type) => (type === 'thanh-tri' ? TOWN_HALL.name : BUILDINGS[type].name);
// network type codes = index in this list: types added later go at the END so old codes never move (13/11/2026: a client
// with the new list against a server with the old one drew buildings as bosses)
export const NEW_TYPES = ['cong-binh', 'y-su', 'voi-chien', 'coi-phao', 'phong-khong', 'no-than', 'cot-set', 'phao-chum', 'hoa-nguc', 'be-vua', 'be-nu-hoang', 'vua-thanh', 'nu-hoang-bang']; // 16/11/2026
const LATE_TYPES = ['thu-linh', 'xe-vang', 'soi-con', 'meo-than-tai', 'gau-truc', 'rua-da', 'cao-lua', 'dai-bang', 'tho-ngoc', 'lac-da-vang', 'phuong-hoang', 'rong-con', 'thanh-long', 'bach-ho', 'chu-tuoc', 'huyen-vu', 'cuu-vi-ho', 'ty-huu', 'tien-hac', 'ky-lan', 'con-bang', 'ung-long', 'bach-trach', 'thao-thiet', 'tay-sai-golem', 'tay-sai-hac-in', 'tay-sai-pha-le', 'tay-sai-tho-phi', 'tay-sai-bo-cap', 'tay-sai-thu-linh', 'ho-ve-giao', 'ho-ve-cung']; // + pets (battle form)
export const TYPE_LIST = [...Object.keys(UNITS).filter((k) => !NEW_TYPES.includes(k)), ...Object.keys(HEROES), ...Object.keys(GUARDS).filter((k) => !LATE_TYPES.includes(k)), ...Object.keys(BOSSES), ...B_TYPES.filter((k) => !NEW_TYPES.includes(k)), ...LATE_TYPES, ...NEW_TYPES];
export const TYPE_CODE = Object.fromEntries(TYPE_LIST.map((t, i) => [t, i]));
export const ACT = { idle: 0, walk: 1, attack: 2, hit: 3, victory: 4, death: 5, skill: 6 };

// Địa Ngục (docs/design/29-dia-nguc.md, 16/11/2026): a survivor run behind the Hell Gate on the east edge of the world.
// Shared by the server (server/hell.js) and the client (client/hell.js): data tables, the arena generator, the formulas.
// Every arena is as big as the open world (512 × 512 tiles, owner's request); monsters chase the hero and are never faster.

export const HELL_W = 512;
export const HELL_WAVE_S = 60; // one wave = one minute; the boss comes after the last wave of the mode
export const HELL_ENRAGE_S = 4 * 60; // boss still alive 4 min after it came: ×3 damage
export const HELL_MAX_RUNS = 6;
export const HELL_PARTY_MAX = 5;
export const HELL_HERO_SPEED = 3.6; // tiles / s (the open-world hero speed); monsters walk at most ×0.92 of it
export const HELL_MON_SPEED_CAP = 0.92;
export const HELL_PICK_R = 2.2; // gem pick-up radius (tiles)
export const HELL_MINE_MAX_MIN = 25; // mines pay 100 % while you are down there, at most 25 minutes
export const HELL_GATE_R = 14; // the hero must stand this close to the gate to go down
export const HELL_KEEP_DEAD = 0.7; // died: 70 % of what was earned
export const HELL_HEART = 0.012, HELL_HEART_LIFE = 30; // a kill drops a heart (full heal for the hero and its pet), gone after 30 s
// 4 modes picked at the gate (owner's request 16/11/2026, replaces the 6 Tầng of the first draft). waves: 1 minute each,
// then the boss wave. hp / dmg / count: monster multipliers. F: reward multiplier. S: suggested hero power (√(H·D)).
export const HELL_MODES = [
  { id: 'de', name: 'Dễ', waves: 10, hp: 0.5, dmg: 0.45, count: 0.8, F: 1, S: 1.0, boss: 'quy-vuong-nham', bossHp: 0.3, bossDmg: 0.5, pct: 0.6, elites: 3 },
  { id: 'tb', name: 'Trung bình', waves: 15, hp: 0.72, dmg: 0.55, count: 1.1, F: 2, S: 1.4, boss: 'mau-hau-tro', bossHp: 0.8, bossDmg: 0.7, pct: 0.8, elites: 4 },
  { id: 'kho', name: 'Khó', waves: 15, hp: 1.0, dmg: 0.85, count: 1.45, F: 3.5, S: 1.9, boss: 'nguc-chu', bossHp: 1.0, bossDmg: 1.0, pct: 1.0, elites: 4 },
  { id: 'sieu', name: 'Siêu khó', waves: 20, hp: 1.25, dmg: 0.8, count: 1.6, F: 6, S: 2.6, boss: null, bossHp: 1.6, bossDmg: 0.95, pct: 1.0, elites: 4 },
];
export const HELL_TIERS = HELL_MODES; // (old name)
/** wave (1-based) at which elite k (0..3) comes, for a mode */
export const eliteWave = (mode, k) => Math.max(2, Math.round(mode.waves * [0.27, 0.47, 0.67, 0.85][k]));
/** monster scaling by wave (1..16): hp and damage grow every wave */
export const waveHp = (w) => 1.15 * (1 + 0.13 * (w - 1)); // 16/11/2026: a bit tougher (was 1 + 0.11·(w−1)) so standing still loses // a horde, not tanks (owner 16/11): wave 15 ×2.5, wave 20 ×3.1
export const waveDmg = (w) => 1 + 0.095 * (w - 1); // wave 15: ×2.3, wave 20: ×2.8 (16/11/2026: was 0.085)
/** live monsters the director keeps around (one hero); parties: × partyN */
export const waveCount = (w) => 40 + 28 * (w - 1); // wave 15: ~430 live monsters around one hero
export const partyN = (n) => 1 + 0.55 * (n - 1);
export const partyHp = (n) => 1 + 0.15 * (n - 1);
export const partyBossHp = (n) => 1 + 0.8 * (n - 1);
export const HELL_CAP = (n) => (n > 1 ? 900 : 600);
/** XP to go from level L to L+1 */
export const hellXpNeed = (L) => Math.round(10 + 7 * (L - 1) + (L - 1) ** 2); // grows faster each level (16/11/2026: was linear, heroes ended at level 45–80)

// ---------------------------------------------------------------- monsters
// kind: chase (walk at the hero), fly (ignores lava and rocks), ranged (keeps `keep` tiles, shoots `shot`), dash (lunges
// when close), bomb (swells then explodes), split (splits in 2 on death, `split` sizes), sweep (a flock crossing the screen
// in a straight line), revive (stands up once), shell (armour until half hp), hex (ground circle under the hero),
// charge (telegraphed straight charge), shield (blocks 75 % from the front), trail (leaves burning ground)
export const HELL_MON = {
  'quy-tro': { name: 'Quỷ Tro', hp: 12, atk: 5, spd: 1.9, xp: 1, from: 0, kind: 'chase', r: 0.35, w: 10 },
  'doi-than': { name: 'Dơi Than', hp: 8, atk: 4, spd: 2.6, xp: 1, from: 30, kind: 'fly', r: 0.3, w: 7, fly: true },
  'sau-dung-nham': { name: 'Sâu Dung Nham', hp: 30, atk: 6, spd: 1.0, xp: 1, from: 60, kind: 'trail', r: 0.45, w: 5 },
  'cot-than': { name: 'Cốt Than', hp: 40, atk: 8, spd: 1.6, xp: 2, from: 120, kind: 'revive', r: 0.4, w: 6 },
  'khuyen-bazan': { name: 'Khuyển Bazan', hp: 60, atk: 10, spd: 2.2, xp: 2, from: 180, kind: 'dash', r: 0.45, w: 3, pack: 4, dash: 3.3 },
  'den-oan-hon': { name: 'Đèn Oan Hồn', hp: 45, atk: 9, spd: 1.4, xp: 2, from: 210, kind: 'ranged', r: 0.4, w: 1.5, keep: 7, shot: 1.6, cd: 4.5, fly: true },
  'bo-luu-huynh': { name: 'Bọ Lưu Huỳnh', hp: 35, atk: 25, spd: 2.0, xp: 2, from: 240, kind: 'bomb', r: 0.4, w: 3 },
  'ke-keo-xich': { name: 'Kẻ Kéo Xích', hp: 55, atk: 12, spd: 1.5, xp: 3, from: 300, kind: 'hook', r: 0.45, w: 3 },
  'nhay-dung-nham': { name: 'Nhầy Dung Nham', hp: 70, atk: 10, spd: 1.3, xp: 1, from: 360, kind: 'split', r: 0.55, w: 3 },
  'qua-lua': { name: 'Quạ Lửa', hp: 20, atk: 10, spd: 3.3, xp: 1, from: 390, kind: 'sweep', r: 0.35, w: 0, fly: true },
  'cu-nham': { name: 'Cự Nham', hp: 200, atk: 20, spd: 1.1, xp: 6, from: 420, kind: 'shell', r: 0.7, w: 2 },
  'thay-cung-sung': { name: 'Thầy Cúng Sừng', hp: 90, atk: 30, spd: 1.3, xp: 5, from: 480, kind: 'hex', r: 0.45, w: 2, keep: 8, cd: 5 },
  'hoa-te': { name: 'Hỏa Tê', hp: 300, atk: 35, spd: 1.6, xp: 8, from: 570, kind: 'charge', r: 0.7, w: 2 },
  've-binh-nguc': { name: 'Vệ Binh Ngục', hp: 400, atk: 25, spd: 1.2, xp: 8, from: 660, kind: 'shield', r: 0.6, w: 2 },
};
// elites: fixed times, a bar at the top of the screen, a Rương Ngục when they fall
export const HELL_ELITES = [
  { id: 'cai-nguc', name: 'Cai Ngục', at: 240, hp: 3000, atk: 20, spd: 1.5, r: 0.9, skill: 'spin' },
  { id: 'phu-thuy-huyet', name: 'Phù Thủy Huyết', at: 420, hp: 4500, atk: 25, spd: 1.6, r: 0.8, skill: 'summon', fly: true },
  { id: 'lo-ren-song', name: 'Lò Rèn Sống', at: 600, hp: 9000, atk: 40, spd: 1.3, r: 0.9, skill: 'ingots' },
  { id: 'ret-dung-nham', name: 'Rết Dung Nham', at: 750, hp: 12000, atk: 50, spd: 2.0, r: 0.9, skill: 'burrow' },
];
export const HELL_BOSSES = {
  'quy-vuong-nham': { name: 'Quỷ Vương Nham Thạch', hp: 60000, atk: 65, spd: 1.8, r: 1.4, skills: ['wave', 'rain', 'adds'] },
  'mau-hau-tro': { name: 'Mẫu Hậu Tro Tàn', hp: 50000, atk: 60, spd: 2.0, r: 1.3, fly: true, skills: ['scales', 'bats', 'rain'] },
  'nguc-chu': { name: 'Ngục Chủ Xích Xiềng', hp: 80000, atk: 75, spd: 1.6, r: 1.4, skills: ['sweep', 'cage', 'pull'] },
};
export const bossOfMode = (mode, rnd) => mode.boss ?? ['quy-vuong-nham', 'mau-hau-tro', 'nguc-chu'][Math.floor(rnd * 3)];
// encirclements (Vòng vây): a ring of one monster type closing in around a hero, at these waves (if the mode has them)
export const HELL_RINGS = [{ wave: 3, n: 40 }, { wave: 8, n: 70 }, { wave: 12, n: 100 }, { wave: 17, n: 130 }];

// ---------------------------------------------------------------- skills
// Every skill: 5 levels. `lv(L)` gives the numbers at level L, `text(L)` the card text (what this level does).
// slot: 'act' (5 slots, slot 1 = the hero weapon) or 'pas' (4 slots). Damage numbers are multiplied by the hero's D and Tụ Lực.
const pct = (v) => `${Math.round(v * 100)}%`;
export const HELL_SKILLS = {
  // ---- hero weapons (slot 1, owned from the start)
  'w-thach-lam': { name: 'Trảm Kiếm Vương', hero: 'thach-lam', slot: 'act', icon: 0, fx: ['fx-01', 0],
    lv: (L) => ({ dmg: 22 * [1, 1.25, 1.25, 1.25, 1.75][L - 1], cd: L >= 4 ? 0.99 : 1.1, range: L >= 4 ? 2.75 : 2.2, arc: 150, back: L >= 3, push: L >= 5 }),
    texts: ['Chém hình quạt 150° trước mặt, tầm 2,2 ô, 22 sát thương, mỗi 1,1 giây.', '+25% sát thương.', 'Chém cả phía sau lưng.', 'Tầm +25%, hồi chiêu −10%.', '+40% sát thương, đẩy lùi quái.'] },
  'w-kim-ha': { name: 'Cuốc Bay', hero: 'kim-ha', slot: 'act', icon: 1, fx: ['fx-01', 2],
    lv: (L) => ({ dmg: 16 * [1, 1, 1.3, 1.3, 1.69][L - 1], cd: 1.4, n: [1, 2, 2, 3, 3][L - 1], range: 6, spd: L >= 4 ? 9.6 : 8, xpBonus: L >= 5 ? 0.1 : 0 }),
    texts: ['Ném 1 cuốc xoay bay ra 6 ô rồi quay về, xuyên mọi quái, 16 sát thương.', '+1 cuốc.', '+30% sát thương.', '+1 cuốc, bay nhanh hơn 20%.', '+30% sát thương, quái bị cuốc hạ rơi thêm 10% XP.'] },
  'w-phong-vu': { name: 'Giáo Xung Phong', hero: 'phong-vu', slot: 'act', icon: 2, fx: ['fx-02', 0],
    lv: (L) => ({ dmg: 38 * [1, 1.3, 1.3, 1.3, 1.69][L - 1], cd: 1.0, n: L >= 5 ? 3 : L >= 3 ? 2 : 1, len: L >= 4 ? 6 : 4.5, w: 1.0 }),
    texts: ['Đâm thẳng 4,5 ô về phía quái gần nhất, xuyên quái, 38 sát thương, mỗi 1 giây.', '+30% sát thương.', '2 mũi giáo (lệch 20°).', 'Dài thêm 2 ô.', '3 mũi giáo, +30% sát thương.'] },
  'w-lam-nguyet': { name: 'Tinh Đạn', hero: 'lam-nguyet', slot: 'act', icon: 3, fx: ['fx-02', 2],
    lv: (L) => ({ dmg: 26 * (L >= 5 ? 1.4 : 1), cd: 0.9, n: [1, 2, 2, 3, 3][L - 1], aoe: 0.8 * (L >= 3 ? 1.3 : 1), pierceShield: L >= 5 }),
    texts: ['1 ngôi sao tự tìm quái gần nhất, nổ vùng 0,8 ô, 26 sát thương, mỗi 0,9 giây.', '+1 sao.', 'Vùng nổ +30%.', '+1 sao.', '+40% sát thương, xuyên khiên Vệ Binh Ngục.'] },
  'w-hoa-ky': { name: 'Roi Lửa', hero: 'hoa-ky', slot: 'act', icon: 4, fx: ['fx-03', 0],
    lv: (L) => ({ dmg: 30 * (L >= 3 ? 1.3 : 1), cd: 0.9, both: L >= 2, w: 1.5, len: L >= 4 ? 4.5 : 3.5, burn: 6 * (L >= 4 ? 1.5 : 1), burst: L >= 5 }),
    texts: ['Quất roi lửa về phía quái, dài 3,5 ô, 30 sát thương + cháy 6/giây trong 3 giây.', 'Quất cả hai bên.', '+30% sát thương.', 'Dài +1 ô, cháy +50%.', 'Quái đang cháy chết thì nổ vùng 1 ô, 30 sát thương.'] },
  // ---- shared actives (12)
  'luoi-liem': { name: 'Lưỡi Liềm Xoay', slot: 'act', icon: 5, fx: ['fx-03', 2],
    lv: (L) => ({ dmg: 12 * (L >= 3 ? 1.3 : 1) * (L >= 5 ? 1.3 : 1), n: [2, 3, 3, 4, 4][L - 1], rad: 2 * (L >= 3 ? 1.15 : 1), on: L >= 5 ? 99 : L >= 4 ? 5 : 4, off: L >= 5 ? 0 : 3 }),
    texts: ['2 lưỡi liềm bạc xoay quanh tướng (bán kính 2 ô), 12 sát thương mỗi lần chạm. Bật 4 giây, tắt 3 giây.', '+1 lưỡi.', '+30% sát thương, bán kính +15%.', '+1 lưỡi, bật lâu thêm 1 giây.', 'Xoay liên tục không tắt, +30% sát thương.'] },
  'loi-cham': { name: 'Lôi Châm', slot: 'act', icon: 6, fx: ['fx-04', 0],
    lv: (L) => ({ dmg: 20 * (L >= 3 ? 1.3 : 1), jumps: L >= 2 ? 5 : 3, cd: L >= 4 ? 1.6 : 2, bolts: L >= 5 ? 2 : 1, range: 7 }),
    texts: ['Tia sét nhảy qua 3 quái trong 7 ô, 20 sát thương mỗi quái, mỗi 2 giây.', 'Nhảy thêm 2 quái.', '+30% sát thương.', 'Hồi chiêu −20%.', 'Mỗi lần phóng 2 tia sét.'] },
  'bua-tran-ta': { name: 'Bùa Trấn Tà', slot: 'act', icon: 7, fx: ['fx-04', 2],
    lv: (L) => ({ dps: [8, 8, 12, 12, 18][L - 1], rad: 1.6 * (L >= 2 ? 1.2 : 1) * (L >= 4 ? 1.2 : 1), slow: L >= 4 ? 0.2 : 0.1, push: L >= 5 }),
    texts: ['Vòng bùa vàng quanh tướng 1,6 ô: 8 sát thương mỗi giây, làm chậm quái 10%.', 'Bán kính +20%.', '12 sát thương mỗi giây.', 'Bán kính +20%, làm chậm 20%.', '18 sát thương mỗi giây, mỗi 2 giây đẩy quái ra.'] },
  'phi-dao': { name: 'Phi Đao Bạc', slot: 'act', icon: 8, fx: ['fx-05', 0],
    lv: (L) => ({ dmg: 10 * (L >= 4 ? 1.3 : 1), cd: L >= 5 ? 0.51 : 0.6, n: [1, 2, 3, 3, 5][L - 1], pierce: L >= 3 ? 1 : 0, spd: 12 }),
    texts: ['Phóng 1 dao bạc theo hướng mặt, 10 sát thương, mỗi 0,6 giây.', '+1 dao.', '+1 dao, xuyên qua 1 quái.', '+30% sát thương.', '+2 dao, hồi chiêu −15%.'] },
  'bang-tien': { name: 'Mưa Băng Tiễn', slot: 'act', icon: 9, fx: ['fx-06', 2],
    lv: (L) => ({ dmg: 18 * (L >= 3 ? 1.3 : 1) * (L >= 5 ? 1.3 : 1), n: [4, 6, 6, 8, 8][L - 1], cd: L >= 5 ? 2.25 : 3, aoe: 0.8, slow: 0.3, freeze: L >= 4 ? 0.5 : 0 }),
    texts: ['4 mũi băng rơi ngẫu nhiên trong 6 ô quanh tướng, vùng 0,8 ô, 18 sát thương, làm chậm 30%.', '+2 mũi băng.', '+30% sát thương.', '+2 mũi, đóng băng quái 0,5 giây.', 'Hồi chiêu −25%, +30% sát thương.'] },
  'chuong-dong': { name: 'Chuông Trấn Hồn', slot: 'act', icon: 10, fx: ['fx-06', 3],
    lv: (L) => ({ dmg: 30 * (L >= 2 ? 1.3 : 1), rad: 3.5 * (L >= 3 ? 1.2 : 1), cd: L >= 4 ? 4 : 5, twice: L >= 5, stun: L >= 5 ? 0.5 : 0 }),
    texts: ['Mỗi 5 giây chuông đồng ngân: sóng vòng 3,5 ô, 30 sát thương, đẩy lùi quái 1,5 ô.', '+30% sát thương.', 'Bán kính +20%.', 'Hồi chiêu còn 4 giây.', 'Ngân 2 lần liền, làm choáng 0,5 giây.'] },
  'ngu-kiem': { name: 'Ngự Kiếm', slot: 'act', icon: 11, fx: ['fx-05', 2],
    lv: (L) => ({ dmg: 30 * (L >= 3 ? 1.3 : 1) * (L >= 5 ? 1.4 : 1), n: [1, 2, 2, 3, 3][L - 1], pierce: L >= 5 ? 99 : 2, cd: 2.5, range: 8 }),
    texts: ['1 thanh kiếm bay tìm quái nhiều máu nhất trong 8 ô, xuyên 2 quái, 30 sát thương, rồi quay về.', '+1 kiếm.', '+30% sát thương.', '+1 kiếm.', 'Xuyên vô hạn, +40% sát thương.'] },
  'dia-chan': { name: 'Địa Chấn Quyền', slot: 'act', icon: 12, fx: ['fx-07', 0],
    lv: (L) => ({ dmg: 40 * (L >= 2 ? 1.3 : 1) * (L >= 5 ? 1.3 : 1), n: L >= 5 ? 3 : L >= 3 ? 2 : 1, len: L >= 4 ? 9 : 6, cd: 4 }),
    texts: ['Mỗi 4 giây tạo khe nứt dài 6 ô theo hướng đi, nổ sau 0,4 giây, 40 sát thương, hất quái.', '+30% sát thương.', '2 khe nứt (hình quạt).', 'Dài thêm 3 ô.', '3 khe nứt, +30% sát thương.'] },
  'ho-lo': { name: 'Hồ Lô Hút Hồn', slot: 'act', icon: 13, fx: ['fx-06', 0],
    lv: (L) => ({ dmg: 60 * (L >= 3 ? 1.5 : 1), rad: 3 * (L >= 2 ? 1.2 : 1), cd: L >= 4 ? 6.5 : 8, n: L >= 5 ? 2 : 1 }),
    texts: ['Mỗi 8 giây đặt hồ lô chỗ quái đông nhất: hút quái trong 3 ô suốt 2 giây rồi nổ 60 sát thương.', 'Bán kính hút +20%.', '+50% sát thương.', 'Hồi chiêu còn 6,5 giây.', 'Đặt 2 hồ lô một lúc.'] },
  'quat-ba-tieu': { name: 'Quạt Ba Tiêu', slot: 'act', icon: 14, fx: ['fx-07', 1],
    lv: (L) => ({ dmg: 15 * (L >= 2 ? 1.3 : 1), len: L >= 3 ? 5.5 : 4, cd: L >= 4 ? 2.4 : 3, arc: L >= 5 ? 120 : 90, blade: L >= 5 }),
    texts: ['Mỗi 3 giây quạt hình nón 90° dài 4 ô: 15 sát thương, đẩy quái 2 ô, xóa đạn của quái trong nón.', '+30% sát thương.', 'Dài thêm 1,5 ô.', 'Hồi chiêu còn 2,4 giây.', 'Nón 120°, thêm lưỡi gió 15 sát thương.'] },
  'thien-loi': { name: 'Thiên Lôi Giáng', slot: 'act', icon: 15, fx: ['fx-07', 2],
    lv: (L) => ({ dmg: 120 * (L >= 2 ? 1.3 : 1) * (L >= 5 ? 1.5 : 1), n: L >= 3 ? 2 : 1, cd: L >= 4 ? 3.2 : 4, stun: L >= 5 ? 1 : 0 }),
    texts: ['Mỗi 4 giây sét đánh quái nhiều máu nhất quanh tướng: 120 sát thương + văng 40 sát thương vùng 1 ô.', '+30% sát thương.', 'Đánh thêm quái nhiều máu thứ hai.', 'Hồi chiêu còn 3,2 giây.', '+50% sát thương, làm choáng 1 giây (tinh anh 0,3 giây).'] },
  'la-bua': { name: 'Lá Bùa Bay', slot: 'act', icon: 16, fx: ['fx-07', 3],
    lv: (L) => ({ dmg: 28 * (L >= 3 ? 1.3 : 1), n: [2, 3, 3, 4, 4][L - 1], aoe: 1.2 * (L >= 4 ? 1.2 : 1), cd: 2.5, mark: L >= 5 }),
    texts: ['Mỗi 2,5 giây 2 lá bùa tự tìm quái, dính vào rồi nổ sau 1 giây, vùng 1,2 ô, 28 sát thương.', '+1 lá bùa.', '+30% sát thương.', '+1 lá bùa, vùng nổ +20%.', 'Nổ để lại ấn 2 giây: quái trong ấn chậm 30%, nhận thêm 20% sát thương.'] },
  // ---- passives (9)
  'tam-thep': { name: 'Tâm Thép', slot: 'pas', icon: 17, lv: (L) => ({ hp: 0.1 * L, regen: 0.3 * L }), texts: ['+10% máu tối đa, hồi 0,3 máu mỗi giây.', 'Tổng +20% máu, 0,6 máu/giây.', 'Tổng +30% máu, 0,9 máu/giây.', 'Tổng +40% máu, 1,2 máu/giây.', 'Tổng +50% máu, 1,5 máu/giây.'] },
  'giap-hac-thach': { name: 'Giáp Hắc Thạch', slot: 'pas', icon: 18, lv: (L) => ({ red: 0.04 * L, guard: L >= 5 }), texts: ['Giảm 4% sát thương nhận.', 'Giảm 8%.', 'Giảm 12%.', 'Giảm 16%.', 'Giảm 20%. Trúng đòn mất hơn 10% máu thì bất tử 0,5 giây (hồi 5 giây).'] },
  'giay-gio': { name: 'Giày Gió', slot: 'pas', icon: 19, lv: (L) => ({ spd: 0.07 * L }), texts: ['+7% tốc chạy.', 'Tổng +14% tốc chạy.', 'Tổng +21%.', 'Tổng +28%.', 'Tổng +35% tốc chạy.'] },
  'nam-cham-hon': { name: 'Nam Châm Hồn', slot: 'pas', icon: 20, lv: (L) => ({ pick: 0.3 * L, xp: 0.03 * L }), texts: ['Tầm hút Hồn tinh +30%, +3% XP.', 'Tầm hút +60%, +6% XP.', 'Tầm hút +90%, +9% XP.', 'Tầm hút +120%, +12% XP.', 'Tầm hút +150%, +15% XP.'] },
  'tu-luc': { name: 'Tụ Lực', slot: 'pas', icon: 21, lv: (L) => ({ dmg: 0.08 * L }), texts: ['+8% sát thương mọi kỹ năng.', 'Tổng +16%.', 'Tổng +24%.', 'Tổng +32%.', 'Tổng +40% sát thương.'] },
  'toc-phap': { name: 'Tốc Pháp', slot: 'pas', icon: 22, lv: (L) => ({ cdr: 0.06 * L }), texts: ['Hồi chiêu −6%.', 'Tổng −12%.', 'Tổng −18%.', 'Tổng −24%.', 'Tổng −30% thời gian hồi chiêu.'] },
  'khai-khong': { name: 'Khai Không', slot: 'pas', icon: 23, lv: (L) => ({ area: 0.08 * L }), texts: ['+8% vùng và thời gian hiệu lực kỹ năng.', 'Tổng +16%.', 'Tổng +24%.', 'Tổng +32%.', 'Tổng +40%.'] },
  'song-anh': { name: 'Song Ảnh', slot: 'pas', icon: 24, lv: (L) => ({ dmg: [0.05, 0.05, 0.1, 0.1, 0.15][L - 1], extra: L >= 4 ? 2 : L >= 2 ? 1 : 0 }), texts: ['+5% sát thương.', '+1 đạn / lưỡi / kiếm cho mọi kỹ năng có số lượng.', 'Tổng +10% sát thương.', 'Tổng +2 đạn / lưỡi / kiếm.', 'Tổng +15% sát thương.'] },
  'linh-khe': { name: 'Linh Khế', slot: 'pas', icon: 25, lv: (L) => ({ pet: 0.15 * L, rest: 0.15 * L, pick: L >= 5 }), texts: ['Thú cưng +15% sát thương và máu, nghỉ ngắn hơn 15%.', 'Tổng +30%.', 'Tổng +45%.', 'Tổng +60%.', 'Tổng +75%, thú tự nhặt Hồn tinh.'] },
  // ---- 16/11/2026: 5 more actives + 5 more passives (icons 40–49 on icon-ky-nang-2; an emoji stands in until it is drawn)
  'tia-pha-ma': { name: 'Tia Phá Ma', slot: 'act', icon: 40, emo: '🔆', fx: ['fx-04', 0],
    lv: (L) => ({ dmg: 14 * (L >= 3 ? 1.3 : 1) * (L >= 5 ? 1.4 : 1), len: L >= 2 ? 6 : 5, dur: 1.5, cd: L >= 4 ? 4 : 5, n: L >= 5 ? 2 : 1 }),
    texts: ['Mỗi 5 giây một tia sáng dài 5 ô quét 1 vòng quanh tướng trong 1,5 giây, 14 sát thương mỗi quái chạm.', 'Tia dài 6 ô.', '+30% sát thương.', 'Hồi chiêu còn 4 giây.', '2 tia đối nhau, +40% sát thương.'] },
  'min-luu-hoa': { name: 'Mìn Lưu Hỏa', slot: 'act', icon: 41, emo: '💣', fx: ['fx-08', 3],
    lv: (L) => ({ dmg: 45 * (L >= 2 ? 1.3 : 1) * (L >= 5 ? 1.3 : 1), cd: L >= 4 ? 0.8 : 1.2, aoe: 1.5 * (L >= 3 ? 1.25 : 1), max: [5, 6, 7, 8, 10][L - 1], burn: L >= 5 }),
    texts: ['Vừa đi vừa rải mìn lửa (1,2 giây một quả, tối đa 5). Quái giẫm vào thì nổ vùng 1,5 ô, 45 sát thương.', '+30% sát thương.', 'Vùng nổ +25%, tối đa 7 quả.', 'Rải nhanh hơn (0,8 giây).', '+30% sát thương, nổ để lại lửa cháy.'] },
  'am-binh': { name: 'Âm Binh', slot: 'act', icon: 42, emo: '👻', fx: ['fx-08', 0],
    lv: (L) => ({ dmg: 24 * (L >= 3 ? 1.3 : 1) * (L >= 5 ? 1.3 : 1), n: [2, 3, 3, 4, 5][L - 1], life: L >= 4 ? 7 : 5, cd: 8, spd: 5 }),
    texts: ['Mỗi 8 giây gọi 2 âm binh lao qua đám quái gần nhất trong 5 giây, mỗi quái trúng 24 sát thương.', '+1 âm binh.', '+30% sát thương.', '+1 âm binh, sống 7 giây.', '+1 âm binh, +30% sát thương.'] },
  'loi-cau': { name: 'Lôi Cầu', slot: 'act', icon: 43, emo: '🔮', fx: ['fx-04', 0],
    lv: (L) => ({ dmg: 18 * (L >= 2 ? 1.3 : 1) * (L >= 5 ? 1.3 : 1), n: L >= 3 ? 2 : 1, life: L >= 4 ? 6 : 4.5, cd: 6, spd: 7 }),
    texts: ['Mỗi 6 giây thả 1 quả cầu sét nảy qua lại quanh tướng trong 4,5 giây, xuyên quái, 18 sát thương mỗi lần chạm.', '+30% sát thương.', '+1 quả cầu.', 'Cầu tồn tại 6 giây.', '+30% sát thương, chạm quái thì giật sang 1 quái gần đó.'] },
  'bang-phong': { name: 'Băng Phong Hoàn', slot: 'act', icon: 44, emo: '❄️', fx: ['fx-06', 2],
    lv: (L) => ({ dmg: 25 * (L >= 2 ? 1.3 : 1), rad: 3 * (L >= 3 ? 1.2 : 1), freeze: L >= 5 ? 1.8 : 1.2, cd: L >= 4 ? 5.5 : 7 }),
    texts: ['Mỗi 7 giây tỏa vòng băng 3 ô: 25 sát thương, đóng băng quái 1,2 giây (tinh anh 0,3 giây).', '+30% sát thương.', 'Bán kính +20%.', 'Hồi chiêu còn 5,5 giây.', 'Đóng băng 1,8 giây.'] },
  'bao-kich': { name: 'Bạo Kích', slot: 'pas', icon: 45, emo: '💥', lv: (L) => ({ crit: 0.04 * L, critX: L >= 5 ? 2.5 : 2 }), texts: ['4% tỉ lệ gây x2 sát thương.', 'Tổng 8%.', 'Tổng 12%.', 'Tổng 16%.', 'Tổng 20%, đòn bạo kích x2,5.'] },
  'huyet-am': { name: 'Huyết Ẩm', slot: 'pas', icon: 46, emo: '🩸', lv: (L) => ({ leech: 0.25 * L }), texts: ['Mỗi quái hạ được hồi 0,25 máu (tối đa 0,6% máu/giây).', 'Hồi 0,5 máu mỗi quái.', 'Hồi 0,75 máu mỗi quái.', 'Hồi 1 máu mỗi quái.', 'Hồi 1,25 máu mỗi quái.'] },
  'ho-menh-phu': { name: 'Hộ Mệnh Phù', slot: 'pas', icon: 47, emo: '🧧', lv: (L) => ({ save: 120 - 15 * (L - 1), saveHp: 0.3 + 0.05 * (L - 1) }), texts: ['Chặn 1 đòn chí mạng: còn 30% máu, bất tử 2 giây. Hồi lại sau 120 giây.', 'Hồi lại sau 105 giây, còn 35% máu.', 'Sau 90 giây, còn 40% máu.', 'Sau 75 giây, còn 45% máu.', 'Sau 60 giây, còn 50% máu.'] },
  'gai-phan': { name: 'Gai Phản', slot: 'pas', icon: 48, emo: '🌵', lv: (L) => ({ thorn: 0.5 + 0.25 * (L - 1), flat: 10 * L }), texts: ['Quái đánh trúng mình nhận lại 50% sát thương + 10.', 'Phản 75% + 20.', 'Phản 100% + 30.', 'Phản 125% + 40.', 'Phản 150% + 50.'] },
  'van-may': { name: 'Vận May', slot: 'pas', icon: 49, emo: '🍀', lv: (L) => ({ heart: 0.2 * L, gold: 0.1 * L, tierUp: L >= 5 ? 0.25 : 0 }), texts: ['Tim rơi nhiều hơn 20%, +10% vàng.', 'Tim +40%, vàng +20%.', 'Tim +60%, vàng +30%.', 'Tim +80%, vàng +40%.', 'Tim +100%, vàng +50%; trang bị trong rương 25% lên 1 bậc.'] },
};
/** Tiến hóa (docs/design/29 §5.6): an active at level 5 + its paired passive (any level) → the next Rương Ngục evolves it.
 *  icon = index on icon-ky-nang, fx = [sheet, row] */
export const HELL_EVO = {
  'luoi-liem': { pas: 'khai-khong', name: 'Bánh Xe Luân Hồi', icon: 26, fx: ['fx-03', 3], text: 'Vành 8 lưỡi bán kính 3 ô xoay liên tục, 30 sát thương, đẩy lùi.' },
  'loi-cham': { pas: 'toc-phap', name: 'Lưới Sấm Cửu Thiên', icon: 27, fx: ['fx-04', 1], text: 'Sét nhảy 12 quái, để lưới điện làm chậm 50% trong 2 giây.' },
  'bua-tran-ta': { pas: 'tam-thep', name: 'Kim Cang Trận', icon: 28, fx: ['fx-04', 3], text: 'Vòng 3 ô, 35 sát thương mỗi giây, hồi 0,5 máu mỗi quái trúng (tối đa 15/giây).' },
  'phi-dao': { pas: 'song-anh', name: 'Bão Đao Bạc', icon: 29, fx: ['fx-05', 1], text: '8 dao xoắn ốc liên tục quanh tướng, xuyên 3, 18 sát thương.' },
  'ngu-kiem': { pas: 'tu-luc', name: 'Thiên Kiếm Trận', icon: 30, fx: ['fx-05', 3], text: '6 kiếm mỗi đợt từ trên trời phóng xuống, 50 sát thương, xuyên vô hạn.' },
  'ho-lo': { pas: 'nam-cham-hon', name: 'Hồ Lô Thôn Thiên', icon: 31, fx: ['fx-06', 1], text: 'Hố hút 5 ô trong 4 giây rồi nổ 300; hút cả Hồn tinh trên màn hình.' },
  'w-thach-lam': { pas: 'giap-hac-thach', name: 'Thạch Kiếm Phá Sơn', icon: 32, fx: ['fx-01', 1], text: 'Mỗi nhát chém phóng thêm sóng đá 6 ô, 60 sát thương, choáng 0,3 giây.' },
  'w-kim-ha': { pas: 'nam-cham-hon', name: 'Cuốc Vàng Đào Mạch', icon: 33, fx: ['fx-01', 3], text: '4 cuốc; chỗ cuốc trúng bùng mạch vàng vùng 1,5 ô, 50 sát thương; quái chết 5% rơi vàng.' },
  'w-phong-vu': { pas: 'giay-gio', name: 'Vó Ngựa Sấm Rền', icon: 34, fx: ['fx-02', 1], text: 'Thêm: mỗi 4 giây 3 kỵ binh hồn lao ngang 12 ô, 80 sát thương, đẩy lùi.' },
  'w-lam-nguyet': { pas: 'khai-khong', name: 'Nguyệt Thực', icon: 35, fx: ['fx-02', 3], text: '5 sao; mỗi 6 giây một vầng trăng rơi xuống, 200 sát thương vùng 3 ô.' },
  'w-hoa-ky': { pas: 'linh-khe', name: 'Roi Long Hỏa', icon: 36, fx: ['fx-03', 1], text: 'Rồng lửa bay vòng 3 ô quanh tướng, 40 sát thương mỗi 0,5 giây; thú cưng +30% sát thương.' },
};
export const HELL_WEAPON = { 'thach-lam': 'w-thach-lam', 'kim-ha': 'w-kim-ha', 'phong-vu': 'w-phong-vu', 'lam-nguyet': 'w-lam-nguyet', 'hoa-ky': 'w-hoa-ky' };
export const HELL_ACT_SLOTS = 5, HELL_PAS_SLOTS = 4, HELL_SKILL_MAX = 5;
// Q: the hero's ultimate (45 s), re-using the open-world skill art fx-<hero>
export const HELL_ULT = {
  'thach-lam': { name: 'Tường khiên', cd: 45, text: '6 giây nhận ít hơn 50% sát thương, đẩy lùi mọi quái trong 3 ô.' },
  'kim-ha': { name: 'Đào thần tốc', cd: 45, text: 'Hút mọi Hồn tinh quanh mình, 8 giây Hồn tinh ×2 XP.' },
  'phong-vu': { name: 'Thần tốc', cd: 45, text: '5 giây +60% tốc chạy, xuyên qua quái, mỗi quái chạm nhận 40 sát thương.' },
  'lam-nguyet': { name: 'Mưa sao băng', cd: 45, text: '12 sao băng rơi khắp màn hình, mỗi sao 150 sát thương vùng 2 ô.' },
  'hoa-ky': { name: 'Long hống', cd: 45, text: 'Hồn rồng gầm hình nón 6 ô: 200 sát thương, quái trúng yếu đi 30% trong 8 giây.' },
};
// extra cards when everything is maxed
export const HELL_FILLER = [
  { id: 'gold', name: 'Túi vàng', text: '+30 vàng mang về.', icon: 34 },
  { id: 'heal', name: 'Bình Huyết', text: 'Hồi 30% máu.', icon: 34 },
];
/** a skill's card text for level L (1..5), with "Cấp L" */
export const skillText = (id, L) => HELL_SKILLS[id]?.texts[L - 1] ?? '';

// ---------------------------------------------------------------- rewards (per run, one player, × tier F)
export const HELL_REWARD = {
  goldPerMin: 30, oilPerMin: 4, crystalPerMin: 1.5, xpPerMin: 20, eliteXp: 40, bossXp: 400, bossDiamond: 3,
  soulPerKills: 40, eliteSoul: 8, bossSoul: 30, coinChance: 0.02, coinGold: 3,
};
// chest gear tiers by tier group (elite / boss)
export const HELL_CHEST = {
  elite: [[['uncommon', 0.4], ['rare', 0.45], ['epic', 0.15]], [['uncommon', 0.15], ['rare', 0.5], ['epic', 0.32], ['legendary', 0.03]], [['rare', 0.35], ['epic', 0.52], ['legendary', 0.13]]],
  boss: [[['rare', 0.5], ['epic', 0.42], ['legendary', 0.08]], [['rare', 0.3], ['epic', 0.52], ['legendary', 0.17], ['mythic', 0.01]], [['rare', 0.1], ['epic', 0.55], ['legendary', 0.32], ['mythic', 0.03]]],
};
export const chestGroup = (mi) => (mi <= 1 ? 0 : mi === 2 ? 1 : 2); // mode index → chest table
// Than Hồn → pet refining (Hỏa luyện 0..10): +4 % pet battle hp / atk per level
export const PET_REFINE_MAX = 10, PET_REFINE_STEP = 0.04;
export const petRefineCost = (lv) => 60 * lv; // to reach lv

// ---------------------------------------------------------------- the arena (deterministic from the run seed)
// tiles: 0 floor (bazan), 1 lava (no walking, flyers cross), 2 rock (blocks everyone but flyers), 3 bridge (walkable)
// 4 bone ground, 5 ash ground (floor variants), 6 obsidian floor
export function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function noise2(seed) {
  const r = mulberry(seed), G = 64, g = new Float32Array((G + 1) * (G + 1));
  for (let i = 0; i < g.length; i++) g[i] = r();
  return (x, y) => { // value noise on a 64-cell lattice over the map (x, y in 0..1)
    const fx = x * G, fy = y * G, ix = Math.min(G - 1, Math.floor(fx)), iy = Math.min(G - 1, Math.floor(fy)), tx = fx - ix, ty = fy - iy;
    const s = (t) => t * t * (3 - 2 * t), a = g[iy * (G + 1) + ix], b = g[iy * (G + 1) + ix + 1], c = g[(iy + 1) * (G + 1) + ix], d = g[(iy + 1) * (G + 1) + ix + 1];
    return a + (b - a) * s(tx) + (c - a) * s(ty) + (a - b - c + d) * s(tx) * s(ty);
  };
}
/** { W, t: Uint8Array tiles, deco: [[x, y, kind]], braziers: [[x, y]], altar: [x, y] } */
export function hellArena(seed, W = HELL_W) {
  const t = new Uint8Array(W * W), r = mulberry(seed ^ 0x51ed), n1 = noise2(seed), n2 = noise2(seed * 7 + 3), c = W / 2;
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, d = Math.hypot(x - c, y - c);
    const v = n1(x / W, y / W) * 0.65 + n2(x / W * 3 % 1, y / W * 3 % 1) * 0.35;
    if (x < 3 || y < 3 || x >= W - 3 || y >= W - 3) { t[i] = 2; continue; }
    if (v > 0.74 && d > 14) t[i] = 1; // lava lakes
    else t[i] = v < 0.3 ? 5 : v > 0.62 ? 4 : v > 0.55 && v < 0.57 ? 6 : 0;
  }
  // lava rivers: a few meandering channels with bone bridges every ~40 tiles
  for (let k = 0; k < 6; k++) {
    let x = r() * W, y = r() < 0.5 ? 4 : W - 5, a = y < W / 2 ? Math.PI / 2 : -Math.PI / 2, len = 0;
    while (x > 3 && y > 3 && x < W - 4 && y < W - 4 && len < W * 1.4) {
      a += (r() - 0.5) * 0.35; x += Math.cos(a); y += Math.sin(a); len++;
      const bridge = len % 46 < 4;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = Math.round(x + dx), yy = Math.round(y + dy); if (Math.hypot(xx - c, yy - c) < 14) continue; const i = yy * W + xx; if (t[i] !== 2) t[i] = bridge ? 3 : 1; }
    }
  }
  // rocks and statues (blocking), bones (decor)
  const deco = [], braziers = [];
  const free = (x, y, rr) => { for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) { const v = t[(y + dy) * W + (x + dx)]; if (v === 1 || v === 2 || v === 3) return false; } return Math.hypot(x - c, y - c) > 10; };
  const KINDS = [[0, 1400, true], [1, 260, true], [2, 1800, false], [3, 300, true], [4, 1100, true], [5, 60, true]]; // vat-the-1 rows: obsidian pillar, chain post, bones, skull stake, lava rock, statue
  for (const [kind, n, block] of KINDS) for (let k = 0; k < n; k++) {
    const x = 4 + Math.floor(r() * (W - 8)), y = 4 + Math.floor(r() * (W - 8));
    if (!free(x, y, block ? 1 : 0)) continue;
    deco.push([x, y, kind, Math.floor(r() * 3)]);
    if (block) t[y * W + x] = 2;
  }
  for (let k = 0; k < 900; k++) { const x = 6 + Math.floor(r() * (W - 12)), y = 6 + Math.floor(r() * (W - 12)); if (free(x, y, 1)) { braziers.push([x, y]); t[y * W + x] = 2; } }
  return { W, t, deco, braziers, altar: [c, c] };
}
export const hellWalk = (A, x, y) => { if (x < 0 || y < 0 || x >= A.W || y >= A.W) return false; const v = A.t[(y | 0) * A.W + (x | 0)]; return v !== 1 && v !== 2; };
export const hellFlyOk = (A, x, y) => x >= 2 && y >= 2 && x < A.W - 2 && y < A.W - 2;

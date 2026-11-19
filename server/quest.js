// Daily quests + achievements (docs/design/21-nhiem-vu.md). Installed onto Game.prototype by installQuests(Game).
// Progress lives per account in this.questProg (saved with the world). this.quest(p, kind, n) is called from the game hooks.
import { RES_INFO, makeItem, BAG_SIZE } from '../shared/balance.js';

const vnDay = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
// daily quest pool: need[th - 1] by Thành trì level; reward: share of the storage + diamonds + hero XP
export const QUESTS = {
  monster: { name: 'Hạ quái ở bãi quái', need: [20, 30, 45, 60, 80], res: 0.06, xp: 150 },
  pvp: { name: 'Hạ lính của người chơi khác', need: [10, 20, 30, 45, 60], res: 0.08, xp: 200 },
  mine: { name: 'Chiếm mỏ', need: [2, 3, 4, 5, 6], res: 0.07 },
  bossdmg: { name: 'Gây sát thương lên boss', need: [5000, 10000, 18000, 28000, 40000], dia: 15, xp: 300 },
  upgrade: { name: 'Nâng cấp công trình', need: [1, 1, 2, 2, 3], res: 0.06 },
  summon: { name: 'Triệu tập lính', need: [30, 50, 80, 110, 150], res: 0.05 },
  grind: { name: 'Nghiền đồ', need: [3, 4, 6, 8, 10], dust: true, th: 4 },
  forge: { name: 'Rèn đồ (thành công hay thất bại)', need: [1, 1, 1, 2, 3], dust: true, th: 4 },
  clear: { name: 'Dọn cây / đá', need: [2, 3, 4, 5, 6], res: 0.05 },
  online: { name: 'Chơi online (phút)', need: [30, 40, 45, 50, 60], dia: 10 },
};
// achievements: counter key, tier thresholds, diamonds per tier, title at the last tier
export const ACHIEVE = {
  hunter: { name: 'Thợ săn', desc: 'Hạ quái', key: 'monster', tiers: [100, 1000, 5000, 20000], dia: [10, 30, 80, 200], title: 'Thợ săn huyền thoại' },
  boss: { name: 'Diệt boss', desc: 'Hạ boss', key: 'boss', tiers: [1, 10, 50, 200], dia: [10, 40, 100, 250], title: 'Kẻ diệt boss' },
  warlord: { name: 'Chinh phạt', desc: 'Hạ lính người khác', key: 'pvp', tiers: [100, 1000, 10000], dia: [15, 60, 200], title: 'Chiến thần' },
  miner: { name: 'Chúa mỏ', desc: 'Giữ cùng lúc nhiều mỏ', key: 'minesHeld', max: true, tiers: [10, 30, 60, 100], dia: [10, 30, 80, 200], title: 'Chúa mỏ' },
  builder: { name: 'Kiến trúc sư', desc: 'Cấp Thành trì', key: 'th', max: true, tiers: [2, 3, 4, 5], labels: ['Cấp 2', 'Cấp 3', 'Cấp 4', 'Cấp 5'], dia: [10, 25, 50, 100], title: 'Lãnh chúa' },
  hero: { name: 'Anh hùng', desc: 'Cấp anh hùng', key: 'heroLv', max: true, tiers: [10, 30, 50, 70, 100], dia: [10, 30, 60, 120, 300], title: 'Bất tử' },
  smith: { name: 'Thợ rèn', desc: 'Rèn thành công đồ Xanh dương / Tím / Cam / Đỏ / Đen', key: 'forgeTier', max: true, tiers: [3, 4, 5, 6, 7], labels: ['Xanh dương', 'Tím', 'Cam', 'Đỏ', 'Đen'], dia: [15, 40, 100, 300, 1000], title: 'Thần rèn' },
  wall: { name: 'Phòng thủ', desc: 'Đẩy lùi trận tấn công căn cứ', key: 'repelled', tiers: [1, 10, 50], dia: [10, 40, 120], title: 'Thành đồng' },
};
const REROLL_DIA = 10;

export function installQuests(Game) {
  const P = Game.prototype;
  P.questOf = function (p) {
    if (this.mode !== 'endless' || !p?.acc || p.bot) return null;
    this.questProg ??= new Map();
    let q = this.questProg.get(p.acc);
    if (!q) this.questProg.set(p.acc, (q = { day: '', list: [], rerolls: 0, chest: false, cnt: {}, ach: {}, title: null, v: 1 }));
    if (q.day !== vnDay()) this.newDay(p, q);
    return q;
  };
  P.newDay = function (p, q) {
    const th = Math.max(1, this.baseOf(p) ? this.thLevel(this.baseOf(p)) : 1);
    const pool = Object.keys(QUESTS).filter((k) => (QUESTS[k].th ?? 1) <= th), list = [];
    while (list.length < 5 && pool.length) list.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    q.day = vnDay(); q.rerolls = 0; q.chest = false; q.th = th;
    q.list = list.map((k) => ({ k, need: QUESTS[k].need[th - 1], got: 0, claimed: false }));
    q.v++;
  };
  /** something happened: n more of `kind` (daily quests) and the achievement counter of the same key */
  P.quest = function (p, kind, n = 1) {
    const q = this.questOf(p); if (!q) return;
    let hit = false;
    for (const e of q.list) if (e.k === kind && e.got < e.need) { e.got = Math.min(e.need, e.got + n); hit = true; if (e.got >= e.need) this.notice(p.id, `✅ Hoàn thành nhiệm vụ: ${QUESTS[kind].name}`, 'ok'); }
    const A = Object.values(ACHIEVE).find((a) => a.key === kind);
    if (A) { q.cnt[kind] = A.max ? Math.max(q.cnt[kind] ?? 0, n) : (q.cnt[kind] ?? 0) + n; hit = true; }
    if (hit) q.v++;
  };
  /** once a second: the 'highest ever' counters (Thành trì level, hero level, mines held at once) */
  P.questLive = function (p, minesHeld) {
    const q = this.questOf(p); if (!q) return;
    const b = this.baseOf(p), live = { th: b ? this.thLevel(b) : 0, heroLv: this.heroProgOf?.(p)?.lv ?? 0, minesHeld };
    for (const [k, v] of Object.entries(live)) if (v > (q.cnt[k] ?? 0)) { q.cnt[k] = v; q.v++; }
  };
  P.questReward = function (p, k) {
    const Q = QUESTS[k], cap = this.capOf(p), out = {};
    if (Q.res) for (const r of ['iron', 'coal', 'gold']) out[r] = Math.round((cap?.[r] ?? 3000) * Q.res);
    if (Q.dia) out.diamond = Q.dia;
    return out;
  };
  P.questClaim = function (p, i) {
    const q = this.questOf(p); if (!q) return;
    const e = q.list[i]; if (!e || e.claimed || e.got < e.need) return;
    e.claimed = true; q.v++;
    const Q = QUESTS[e.k], rw = this.questReward(p, e.k), got = [];
    for (const [r, v] of Object.entries(rw)) { this.gain(p, r, v); got.push(`${v.toLocaleString('vi')} ${RES_INFO[r].name}`); }
    if (Q.xp) { this.gainXp?.(p, Q.xp); got.push(`${Q.xp} XP`); }
    if (Q.dust) { const b = this.baseOf(p); if (b) { b.dust ??= {}; const t = q.th >= 4 ? 'uncommon' : 'fine'; b.dust[t] = (b.dust[t] ?? 0) + 3; this.chestTouch?.(b); got.push(`3 bột`); } }
    this.notice(p.id, `🎁 Thưởng nhiệm vụ: ${got.join(', ')}`, 'ok');
    // all 5 claimed: the daily chest (one green-or-better item + powder)
    if (!q.chest && q.list.every((x) => x.claimed)) {
      q.chest = true;
      const r = Math.random(), tier = r < 0.6 ? 'uncommon' : r < 0.9 ? 'rare' : 'epic';
      const it = this.dropItemFor(p, tier); p.bag ??= [];
      const h = this.units.get(p.hero);
      if (p.bag.length < BAG_SIZE) p.bag.push(it); else if (h) this.dropItem(it, h.x, h.y, 1, p.id);
      const b = this.baseOf(p); if (b) { b.dust ??= {}; b.dust.fine = (b.dust.fine ?? 0) + 2; this.chestTouch?.(b); }
      this.notice(p.id, `🎉 Xong cả 5 nhiệm vụ: Rương ngày cho ${it.name} + 2 Bột Hổ Phách`, 'ok');
    }
  };
  P.questReroll = function (p, i) {
    const q = this.questOf(p); if (!q) return;
    const e = q.list[i]; if (!e || e.claimed) return;
    if (q.rerolls >= 1 && !this.pay(p, { diamond: REROLL_DIA })) return this.notice(p.id, `Đổi nhiệm vụ cần ${REROLL_DIA} kim cương (lượt miễn phí hôm nay đã dùng)`, 'err');
    const th = q.th ?? 1, pool = Object.keys(QUESTS).filter((k) => (QUESTS[k].th ?? 1) <= th && !q.list.some((x) => x.k === k));
    if (!pool.length) return;
    const k = pool[Math.floor(Math.random() * pool.length)];
    q.list[i] = { k, need: QUESTS[k].need[th - 1], got: 0, claimed: false }; q.rerolls++; q.v++;
  };
  P.achClaim = function (p, key) {
    const q = this.questOf(p), A = Object.hasOwn(ACHIEVE, key) ? ACHIEVE[key] : null; if (!q || !A) return;
    const have = q.cnt[A.key] ?? 0, done = q.ach[key] ?? 0; // tiers claimed
    if (done >= A.tiers.length || have < A.tiers[done]) return;
    q.ach[key] = done + 1; q.v++;
    this.gain(p, 'diamond', A.dia[done]);
    let txt = `🏆 ${A.name} mốc ${done + 1}: +${A.dia[done]} kim cương`;
    if (done + 1 === A.tiers.length) { txt += ` · danh hiệu "${A.title}"`; q.title ??= key; }
    this.notice(p.id, txt, 'ok');
  };
  P.titleSet = function (p, key) { const q = this.questOf(p); if (!q) return; if (key && (!Object.hasOwn(ACHIEVE, key) || (q.ach[key] ?? 0) < ACHIEVE[key].tiers.length)) return; q.title = key || null; q.v++; };
  P.titleOf = function (p) { const k = this.questProg?.get(p.acc)?.title; return k ? ACHIEVE[k]?.title : null; };
  /** for the client: [{ k, name, need, got, claimed, reward }], achievements, title */
  P.questInfo = function (p) {
    const q = this.questOf(p); if (!q) return null;
    return {
      day: q.day, rerolls: q.rerolls, chest: q.chest, rerollDia: REROLL_DIA, title: q.title,
      list: q.list.map((e) => ({ ...e, name: QUESTS[e.k].name, reward: this.questReward(p, e.k), xp: QUESTS[e.k].xp ?? 0, dust: !!QUESTS[e.k].dust })),
      ach: Object.entries(ACHIEVE).map(([key, A]) => ({ key, name: A.name, desc: A.desc, tiers: A.tiers, dia: A.dia, title: A.title, labels: A.labels, have: q.cnt[A.key] ?? 0, done: q.ach[key] ?? 0 })),
    };
  };
}

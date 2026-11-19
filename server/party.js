// Tổ đội (12/11/2026): up to 5 players in the open world. Members never fight each other (army, hero, mine posts, bases,
// traps, fire) and every member close to a boss / camp monster kill gets a full share: the same number of items with the
// same tiers (each item's slot rolled per player), the same hero XP and the same camp resources.
import { makeItem, RES_INFO, TIER_INFO } from '../shared/balance.js';

export const PARTY_MAX = 5, PARTY_SHARE_R = 40, INVITE_TTL = 60;

export function installParty(Game) {
  const P = Game.prototype;
  P.partyOf = function (p) {
    if (!p?.party) return null;
    const pt = this.parties?.get(p.party);
    if (!pt || !pt.members.includes(p.id)) { p.party = 0; return null; }
    return pt;
  };
  /** players a and b (ids) are in the same party */
  P.sameParty = function (a, b) {
    if (!a || !b || a === b) return false;
    const pa = this.players.get(a); if (!pa?.party) return false;
    const pb = this.players.get(b); return !!pb && pb.party === pa.party && !!this.parties?.get(pa.party);
  };
  /** a base (account key) belongs to someone in p's party */
  P.partyHasBase = function (p, key) {
    const pt = this.partyOf(p); if (!pt) return false;
    return pt.members.some((id) => id !== p.id && this.players.get(id)?.acc === key);
  };
  P.partyMembers = function (p) { const pt = this.partyOf(p); return pt ? pt.members.map((id) => this.players.get(id)).filter(Boolean) : [p]; };
  P.partyInvite = function (p, id) {
    if (this.mode !== 'endless') return this.notice(p.id, 'Tổ đội chỉ có ở Thế giới mở', 'err');
    const q = this.players.get(id | 0);
    if (!q || q === p || q.bot) return this.notice(p.id, 'Không mời được người này', 'err');
    const pt = this.partyOf(p);
    if (pt && pt.members.length >= PARTY_MAX) return this.notice(p.id, `Tổ đội đã đủ ${PARTY_MAX} người`, 'err');
    if (this.partyOf(q)) return this.notice(p.id, `${q.name} đang ở tổ đội khác`, 'err');
    if (!q.connected) return this.notice(p.id, `${q.name} đang offline`, 'err');
    (this.partyInv ??= new Map()).set(q.id, { from: p.id, until: this.t + INVITE_TTL });
    this.notice(q.id, `🤝 ${p.name} mời bạn vào tổ đội`, 'sys', { pinv: p.id, pname: p.name });
    this.notice(p.id, `Đã gửi lời mời tới ${q.name}`, 'ok');
  };
  P.partyAccept = function (p, from, yes = true) {
    const inv = this.partyInv?.get(p.id);
    if (!inv || inv.from !== (from | 0) || inv.until < this.t) return this.notice(p.id, 'Lời mời đã hết hạn', 'err');
    this.partyInv.delete(p.id);
    const a = this.players.get(inv.from); if (!a) return;
    if (!yes) return this.notice(a.id, `${p.name} đã từ chối lời mời tổ đội`, 'warn');
    if (this.partyOf(p)) this.partyLeave(p, true);
    let pt = this.partyOf(a);
    if (!pt) { this.parties ??= new Map(); this.nextParty = (this.nextParty ?? 0) + 1; pt = { id: this.nextParty, leader: a.id, members: [a.id] }; this.parties.set(pt.id, pt); a.party = pt.id; }
    if (pt.members.length >= PARTY_MAX) return this.notice(p.id, `Tổ đội đã đủ ${PARTY_MAX} người`, 'err');
    pt.members.push(p.id); p.party = pt.id; pt.v = (pt.v ?? 0) + 1;
    // fights between new team-mates stop at once
    for (const m of pt.members) for (const id of this.players.get(m)?.units ?? []) { const u = this.units.get(id), f = u && this.units.get(u.foe); if (f && this.sameParty(u.owner, f.owner)) this.unpair(u); }
    for (const m of this.partyMembers(p)) this.notice(m.id, `🤝 ${p.name} đã vào tổ đội (${pt.members.length}/${PARTY_MAX})`, 'ok');
  };
  P.partyLeave = function (p, quiet = false) {
    const pt = this.partyOf(p); if (!pt) return;
    pt.members = pt.members.filter((id) => id !== p.id); p.party = 0; pt.v = (pt.v ?? 0) + 1;
    if (!quiet) this.notice(p.id, 'Đã rời tổ đội', 'ok');
    for (const id of pt.members) this.notice(id, `${p.name} đã rời tổ đội`, 'warn');
    if (pt.members.length < 2) { for (const id of pt.members) { const q = this.players.get(id); if (q) q.party = 0; } this.parties.delete(pt.id); }
    else if (pt.leader === p.id) pt.leader = pt.members[0];
  };
  P.partyKick = function (p, id) {
    const pt = this.partyOf(p); if (!pt || pt.leader !== p.id) return this.notice(p.id, 'Chỉ trưởng nhóm mới mời ra được', 'err');
    const q = this.players.get(id | 0); if (!q || q.party !== pt.id || q === p) return;
    this.partyLeave(q, true); this.notice(q.id, `Bạn đã bị mời ra khỏi tổ đội`, 'warn');
  };
  /** for the client: the members with their hero state (sent a few times a second while in a party) */
  P.partyInfo = function (p) {
    const pt = this.partyOf(p); if (!pt) return null;
    return { id: pt.id, leader: pt.leader, max: PARTY_MAX, members: pt.members.map((id) => {
      const q = this.players.get(id), h = q && this.units.get(q.hero);
      return q && { id: q.id, name: q.name, color: q.color, hero: q.heroType, alive: !!q.alive && !!h && !h.dead, on: !!q.connected, hp: h ? Math.ceil(h.hp) : 0, maxHp: h?.maxHp ?? 1, x: h ? Math.round(h.x * 10) / 10 : null, y: h ? Math.round(h.y * 10) / 10 : null, lv: this.heroProgOf?.(q)?.lv ?? 1 };
    }).filter(Boolean) };
  };
  /** who shares a PvE kill at (x, y): the killer and every living party member within PARTY_SHARE_R */
  /** what each member gets when a party shares camp rewards: 1 alone, −10 % per extra member, at least 50 % (13/11/2026) */
  P.partyShare = (n) => Math.max(0.5, 1 - 0.1 * Math.max(0, n - 1));
  /** XP and resources (14/11/2026): every living member gets a share wherever they are, the total split evenly (1/n each) */
  P.partySplit = (n) => 1 / Math.max(1, n);
  P.shareAll = function (killer) {
    if (!killer || killer.bot || this.mode !== 'endless') return killer ? [killer] : [];
    return [killer, ...this.partyMembers(killer).filter((m) => m !== killer && !m.bot && m.alive)];
  };
  P.shareWith = function (killer, x, y) {
    if (!killer || killer.bot || this.mode !== 'endless') return killer ? [killer] : [];
    const out = [killer];
    for (const m of this.partyMembers(killer)) {
      if (m === killer || m.bot || !m.alive) continue;
      const h = this.units.get(m.hero); if (h && !h.dead && Math.hypot(h.x - x, h.y - y) <= PARTY_SHARE_R) out.push(m);
    }
    return out;
  };
  /** one loot roll (tier) → an item of that tier for every sharer, the slot rolled per player */
  P.shareLoot = function (sharers, tier, x, y, spread, killer, cap, f = 1) {
    for (const m of sharers) if (f >= 1 || this.rand() < f) this.lootTo(this.dropItemFor(m, tier, cap), x, y, spread, m); // each member: an item of their own level (f: party share)
  };
}

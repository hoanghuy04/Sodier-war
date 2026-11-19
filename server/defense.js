// Defense log (docs/design/22-nhat-ky-phong-thu.md): every attack on a base is one "battle" that closes 30 s after the
// last hit. The owner keeps the last 30 (b.defLog), the attackers get the same entry in their attack log (b.atkLog).
import { RES } from '../shared/balance.js';

const QUIET = 30, KEEP = 30;

export function installDefense(Game) {
  const P = Game.prototype;
  /** the open battle at base b (created on the first hit), with ap noted as an attacker */
  P.battleAt = function (b, ap) {
    if (this.mode !== 'endless') return null;
    let w = b.battle;
    if (!w) w = b.battle = { start: Date.now(), last: this.t, atk: {}, lost: {}, ruins: {}, defLost: 0, enemyKilled: 0, traps: 0, fallen: false };
    if (!w.warned) { // 14/11/2026: tell the owner (the client plays the war horn on this notice)
      w.warned = true; const o = [...this.players.values()].find((p) => p.acc === b.key && !p.bot);
      if (o) { const th = this.thOf?.(b), c = th ? this.itemCenter(th) : null; this.notice(o.id, `⚔ Căn cứ đang bị ${ap?.name ?? 'kẻ địch'} tấn công!`, 'warn', c ? { x: c.x, y: c.y } : undefined); }
    }
    w.last = this.t;
    if (ap && !w.atk[ap.acc ?? ap.name]) w.atk[ap.acc ?? ap.name] = { name: ap.name, color: ap.color, hero: ap.heroType, key: ap.acc ?? null, bot: !!ap.bot };
    return w;
  };
  P.battleHit = function (b, ap) { this.battleAt(b, ap); };
  P.battleRuin = function (b, type, ap) { const w = this.battleAt(b, ap); if (!w) return; w.ruins[type] = (w.ruins[type] ?? 0) + 1; if (type === 'thanh-tri') w.fallen = true; };
  P.battleLoot = function (b, got) { const w = b.battle; if (!w) return; for (const [r, v] of Object.entries(got ?? {})) if (v >= 1) w.lost[r] = (w.lost[r] ?? 0) + Math.floor(v); };
  P.battleTrap = function (b) { const w = b.battle; if (w) { w.traps++; w.last = this.t; } };
  /** a unit died: a defender of a base under attack, or an attacker killed by a base's defence */
  P.battleKill = function (e, a) {
    if (this.mode !== 'endless') return;
    if (e.baseKey && e.kind !== 'build') { const b = this.bases.get(e.baseKey); if (b?.battle) { b.battle.defLost++; b.battle.last = this.t; } }
    const dk = a?.baseKey; if (dk && e.owner) { const b = this.bases.get(dk); if (b?.battle) { b.battle.enemyKilled++; b.battle.last = this.t; } }
  };
  P.battleTick = function (b) {
    const w = b.battle; if (!w || this.t - w.last < QUIET) return;
    b.battle = null;
    const atk = Object.values(w.atk);
    if (!atk.length) return; // nobody identifiable (monsters wandering in)
    const e = { id: `${w.start}-${b.key}`, start: w.start, end: Date.now(), atk, lost: w.lost, ruins: w.ruins, defLost: w.defLost, enemyKilled: w.enemyKilled, traps: w.traps, fallen: w.fallen };
    (b.defLog ??= []).push(e); if (b.defLog.length > KEEP) b.defLog.shift();
    b.defV = (b.defV ?? 0) + 1;
    for (const a of atk) {
      const ab = a.key ? this.bases.get(a.key) : null; if (!ab) continue;
      (ab.atkLog ??= []).push({ ...e, target: { name: b.name, color: b.color, key: b.key } });
      if (ab.atkLog.length > KEEP) ab.atkLog.shift();
      ab.defV = (ab.defV ?? 0) + 1;
    }
    if (!w.fallen) {
      const owner = [...this.players.values()].find((q) => q.acc === b.key) ?? { acc: b.key, id: -1 };
      this.quest?.(owner, 'repelled', 1);
    }
    const o = [...this.players.values()].find((q) => q.acc === b.key && q.connected);
    if (o) this.notice(o.id, w.fallen ? `📖 Trận phòng thủ kết thúc: Thất thủ. Xem Nhật ký phòng thủ ở Thành trì` : `🛡 Đã đẩy lùi ${atk.map((x) => x.name).join(', ')}! Xem Nhật ký phòng thủ ở Thành trì`, w.fallen ? 'warn' : 'ok');
  };
  /** for the client */
  P.defInfo = function (b) { return { def: b.defLog ?? [], atk: b.atkLog ?? [], res: RES }; };
}

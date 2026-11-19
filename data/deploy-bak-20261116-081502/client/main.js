// Sodier War client: connection, input, camera, HUD.
import { S, now } from './state.js';
import { loadSprites, thumb, SPR, skinOf, setOutline, outlineOn } from './sprites.js';
import { soundVolume, soundMuted, setVolume, setMuted, play, setMusic, setLoops, audioDebug } from './audio.js';
import { initMap, interpolate, draw, drawBubbles, onEvents, pick, loadClick } from './render.js';
import { hellInit, hellStart, hellStop, hellEnd, hellPacket, drawHell, hellKey, hellMouse, hellWheel, hellState, hellIconURL } from './hell.js';
import { HELL_MODES, HELL_GATE_R, PET_REFINE_MAX, PET_REFINE_STEP, petRefineCost } from '/shared/hell.js';
import { px, itemIcon, loadItemIcons } from './pxicons.js';
import { showThDialog, loadBuildings, setBases, startPlace, cancelBuild, buildDown, buildDrag, buildUp, buildingAt, startMove, wallLine, renderBuildShop, buildInfoHtml, wireBuildInfo, myKey, SIZE as B_SIZE, loadObst, setCleared, obstPick, obstInfoHtml, wireObstInfo, builderCount, builderJobs, fmtLeft, myRuins, showRepairAll, showNeed, resNeeds } from './build.js';
import { PET_PAY_TIER, petTier, PET_TIER_GROUPS, petFight, PETS, CASTLE_LV_BONUS, CASTLE_AURA_ATK, CASTLE_AURA_ARM, MINE_CAP, MINE_EXTRA_MAX, mineSlotCost, QUEEN_SIZE, QUEEN_USE_R, itemLvMult, gearBonus, setCounts, setLines, itemArmy, GEAR_SETS, UNIT_LV_MULT, DECOS, TIERS, DUST, FORGE, forgeRate, GRIND_DOUBLE, GRIND_MIN, GRIND_MAX, CHEST_GRID, BASE_ZONE, BUILDINGS, CASTLE_CAP, CASTLE_RANGE, HOUSING, KING_SIZE, KING_USE_R, HERO_CAPS, HERO_UNLOCK, HERO_STAT, HERO_RESET_COST, ARMOR_CAP, MINE_LV_MULT, MINE_UP_TIME, mineUpCost, UNIT_TH, CAMP_COLORS, RES, RES_INFO, UNITS, HEROES, HERO_ORDER, GUARDS, CLASS_NAME, K, CLASSES, BOSSES, TIER_INFO, SLOT_INFO, SLOTS, STAT_NAME, fmtStat, BAG_SIZE, equipBonus, unitCost, ringCost, RING_SLOTS, MAX_RINGS, CAPTURE_R, DRAGON_LIMIT, holdBonus, management, B_NAME, unitLvLabel, TOWN_HALL, B_TYPES, HOME_HEROES } from '/shared/balance.js';

const T = 16;
const $ = (id) => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
let W = 0, H = 0, mobileZoomInit = false;
function updateMobileMode() {
  const minSide = Math.min(innerWidth, innerHeight);
  const coarse = matchMedia('(pointer: coarse)').matches;
  const mob = minSide <= 560 || (coarse && minSide <= 860);
  S.mobile = mob;
  document.body.classList.toggle('mobile', mob);
  document.body.classList.toggle('portrait-lock', mob && innerHeight > innerWidth);
  if (mob && !mobileZoomInit && innerWidth > innerHeight) {
    mobileZoomInit = true;
    S.cam.z = innerHeight < 370 ? 1.25 : 1.45;
  }
}
let PIPW = null; // the Document Picture-in-Picture window while the game is popped out (treo máy, 13/11/2026)
function resize() { const w = PIPW ?? window; W = canvas.width = w.innerWidth; H = canvas.height = w.innerHeight; if (!PIPW) updateMobileMode(); }
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 80));
visualViewport?.addEventListener('resize', resize);
resize();
const tryLockLandscape = () => { if (S.mobile) screen.orientation?.lock?.('landscape').catch(() => {}); };

// ================================================================= connection
let pending = null, reconnectTimer = null;
function connect() {
  const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
  S.ws = ws;
  ws.onopen = () => { ws.send(JSON.stringify({ t: 'hello', name: localStorage.getItem('sw-name') ?? '', token: localStorage.getItem('sw-token'), password: S.pw ?? '', invite: S.invite ?? '', wd: navigator.webdriver ? 1 : 0 })); S.pw = null; };
  ws.onmessage = (e) => onMsg(JSON.parse(e.data));
  ws.onclose = () => { if (S.ws !== ws || S.loggedOut || S.authFailed) return; $('offline').classList.toggle('hidden', !S.joined); clearTimeout(reconnectTimer); reconnectTimer = setTimeout(connect, 1500); };
}
// Cổng Địa Ngục panel: pick a mode (docs/design/29-dia-nguc.md)
function openHellGate() {
  const old = document.getElementById('hellgate'); if (old) { old.remove(); return; }
  const h = S.byId.get(S.me?.hero), g = S.hellGate, near = h && g && Math.hypot(h.x - g[0], h.y - g[1]) <= HELL_GATE_R + 6;
  const hp = h?.maxHp ?? 900, atk = S.me?.hs?.[1] ?? 28, Sp = Math.sqrt(Math.max(1, Math.min(3, Math.sqrt(hp / 900))) * Math.max(1, Math.min(3, Math.sqrt(atk / 28))));
  const box = document.createElement('div'); box.id = 'hellgate'; box.className = 'thup';
  box.innerHTML = `<div class="thup-box hellgate"><div class="thup-title">🔥 Cổng Địa Ngục</div>
    <div class="thup-sub">Chỉ mang tướng + thú cưng. Quân, mỏ, căn cứ được giữ nguyên; mỏ vẫn chạy 100% (tối đa 25 phút). Tướng tự đánh, bạn di chuyển né quái và chọn thẻ kỹ năng khi lên cấp.${S.party ? ' Tổ đội: trưởng nhóm mở cổng, thành viên đứng gần cổng đi cùng.' : ''}</div>
    <div class="hg-pow">Sức mạnh tướng của bạn ≈ <b>${Sp.toFixed(1)}</b> (máu ${hp}, tấn công ${Math.round(atk)})</div>
    <div class="hg-modes">${HELL_MODES.map((M, i) => `<div class="hg-mode ${Sp + 0.05 >= M.S ? '' : 'hard'}"><b>${M.name}</b><small>${M.waves} vòng quái + boss · gợi ý sức mạnh ${M.S}</small><small>Thưởng ×${M.F}${i === 3 ? ' · boss ngẫu nhiên' : ''}</small><button data-m="${i}" ${near ? '' : 'disabled'}>${near ? 'Vào' : 'Đứng gần cổng'}</button></div>`).join('')}</div>
    ${near ? '' : '<div class="muted">Đi tới sát Cổng Địa Ngục (rìa phía Đông bản đồ) rồi bấm lại.</div>'}<button class="thup-ok">Đóng</button></div>`;
  document.body.appendChild(box);
  box.querySelector('.thup-ok').onclick = () => box.remove();
  box.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => { send({ t: 'hell-enter', mode: +b.dataset.m }); box.remove(); }));
}
const send = (m) => {
  // battle music only after a real attack order on a boss (14/11/2026); any other move order ends it
  if (m?.t === 'chase') { const u = S.byId?.get(m.id); S.bossOrder = u && BOSSES[u.type] ? { id: m.id, at: performance.now() } : null; }
  else if (m?.t === 'move' || m?.t === 'mine' || m?.t === 'recall' || m?.t === 'stop') S.bossOrder = null;
  if (S.ws?.readyState === 1) S.ws.send(JSON.stringify(m));
};
hellInit((m) => send(m));

const fmtTime = (s) => { s = Math.round(s); return s >= 3600 ? `${Math.floor(s / 3600)}h${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
window.__sw = { S, send, startPlace, showThDialog, forgeResult, audio: audioDebug, openHellGate: () => openHellGate() }; // forgeResult: Lò rèn result dialog, called from render.onEvents // debugging handle

async function onMsg(m) {
  switch (m.t) {
    case 'auth-fail': {
      if (m.needInvite) setTimeout(() => $('inviteinput').focus(), 0);
      S.authFailed = true; localStorage.removeItem('sw-token'); S.ws?.close();
      $('offline').classList.add('hidden'); $('login').classList.remove('hidden');
      $('loginerr').textContent = m.reason; $('loginbtn').disabled = false; $('loginbtn').textContent = 'Vào trận';
      (m.needPw ? $('pwinput') : $('nameinput')).focus();
      break;
    }
    case 'reload': if (m.token !== undefined) localStorage.setItem('sw-token', m.token); location.reload(); break; // admin: force F5 (14/11/2026)
    case 'kicked': S.loggedOut = true; alert('Tài khoản này vừa đăng nhập ở nơi khác.'); location.reload(); break;
    case 'welcome': {
      S.authFailed = false; $('loginerr').textContent = '';
      localStorage.setItem('sw-name', m.name);
      // the server came back with another map or new art (a deploy while this tab stayed open): start clean,
      // otherwise old map chunks / sprites stay cached in memory and the map looks cut into pieces
      if (S.loaded && (S.loaded.seed !== m.seed || S.loaded.av !== m.av)) { localStorage.setItem('sw-token', m.token); location.reload(); return; }
      S.loaded ??= { seed: m.seed, av: m.av };
      S.token = m.token; S.seed = m.seed; S.W = m.W; S.H = m.H; S.best = m.best; S.account = { name: m.name, wins: m.wins, best: m.best };
      localStorage.setItem('sw-token', m.token);
      S.mineDefs = m.mines;
      S.spawns = m.spawns;
      S.av = m.av;
      S.readyP ??= (async () => { initMap(m.seed); loadItemIcons(m.av); loadClick(m.av); await Promise.all([loadSprites(m.av), loadBuildings(m.av), loadObst(m.av)]); await mmLoad(); })();
      await S.readyP;
      $('offline').classList.add('hidden'); $('login').classList.add('hidden');
      if (!S.room) showHome();
      break;
    }
    case 'rooms': S.roomList = m; renderHome(); break;
    case 'ci': S.ci = m; renderCheckin(); break;
    case 'askh': case 'askd': case 'aske': case 'askt': case 'askw': advMsg(m); return; // Trợ lý AI
    case 'hell': hellStart(m); closeAllDlg(); return;
    case 'h': hellPacket(m); return;
    case 'hellend': hellEnd(m); return;
    case 'joined': {
      // reset first: snapshots that arrive while the sprites are still loading must not be wiped afterwards
      // (12/11/2026: the inventory sent in the first snapshot was cleared and the bag looked empty)
      resetWorld(); dlogFirst = true;
      S.camps = (m.camps ?? []).map(([level, x, y], id) => ({ id, level, x, y, respawn: 0 }));
      S.king = m.king ? { tx: m.king[0], ty: m.king[1], x: m.king[0] + KING_SIZE[0] / 2, y: m.king[1] + KING_SIZE[1] / 2 } : null;
      S.queen = m.queen ? { tx: m.queen[0], ty: m.queen[1], x: m.queen[0] + QUEEN_SIZE[0] / 2, y: m.queen[1] + QUEEN_SIZE[1] / 2 } : null;
      S.hellGate = m.hellGate ?? null; S.hellRuns = m.hellRuns ?? 0; $('advbtn')?.classList.remove('hidden');
      S.room = m.room; S.mode = m.room.mode; S.you = m.you; S.joined = true; S.alive = m.alive; S.heroType = m.hero; S.best = m.best;
      await S.readyP;
      send({ t: 'resync' });
      $('home').classList.add('hidden'); $('hud').classList.remove('hidden');
      if (!m.alive) showPick(); else { hideScreens(); S.centerOnHero = true; }
      break;
    }
    case 'left': S.room = null; S.joined = false; resetWorld(); $('hud').classList.add('hidden'); showHome(); break;
    case 's': {
      const t = now();
      const off = m.time - t;
      S.clockOffset = S.clockOffset == null ? off : S.clockOffset + (off - S.clockOffset) * (Math.abs(off - S.clockOffset) > 0.5 ? 1 : 0.05);
      const units = new Map(); for (const r of m.u) units.set(r[0], r);
      S.snaps.push({ t: m.time, units });
      if (S.snaps.length > 12) S.snaps.shift();
      if (m.ev?.length) onEvents(m.ev);
      if (m.it) S.items = m.it;
      if (m.chest) S.chest = m.chest;
      if (m.quest) { S.quest = m.quest; renderQuest(); }
      if (m.dlog) { S.dlog = m.dlog; onDlog(); }
      if ('party' in m) { S.party = m.party; renderParty(); if (chatCh === 'party' && !chatLog.party.length) renderChatLog(); }
      if (m.inv) {
        const count = (v) => Object.values(v.equip ?? {}).filter(Boolean).length + (v.bag?.length ?? 0);
        if (count(m.inv) > count(S.inv) && $('invpanel').classList.contains('hidden')) {
          S.hasNewInv = true;
          document.querySelector('.rb.inv')?.classList.add('new');
          syncOpenBtnDot();
        }
        S.inv = m.inv; renderInv();
      }
      if (m.chest || m.inv) renderCraft(); // after both the chest and the bag are up to date (12/11/2026: items showed in both)
      const was = S.me;
      S.me = m.me ?? null;
      setMusic(battleMusic() ? 'battle' : 'calm'); // battle music only after an attack order on a boss (14/11/2026)
      { const hk = JSON.stringify([S.me?.hl, S.me?.hs, S.me?.pet]); if (hk !== S.hlKey) { S.hlKey = hk; renderInv(); } syncKingBtn(); syncQueenBtn(); syncHellBtn(); syncAutoBadge(); }
      if (S.me && !S.alive) { S.alive = true; hideScreens(); S.centerOnHero = true; }
      if (S.me && was) for (let i = 0; i < 7; i++) if (S.me.res[i] < was.res[i] - 0.5) flashRes(i);
      if (S.me) { const h = units.get(S.me.hero); if (h && was && h[5] < (S.lastHp ?? h[5])) { $('portrait').classList.remove('hurt'); void $('portrait').offsetWidth; $('portrait').classList.add('hurt'); } if (h) S.lastHp = h[5]; }
      break;
    }
    case 'mt': S.match = m; if (m.cs && S.camps) m.cs.forEach((v, i) => { if (S.camps[i]) S.camps[i].respawn = v; }); updateJoinUI(); break;
    case 'end': showResults(m); break;
    case 'start': if (!S.alive) { updateJoinUI(); } break;
    case 'lobby':
      // the room is back in its lobby: everybody (winner included) is out of the map now
      endJoy(false); S.targeting = false; S.skillAim = null;
      S.alive = false; S.me = null; S.watching = false; $('deadbanner').classList.add('hidden');
      if ($('results').classList.contains('hidden')) showPick();
      break;
    case 'm': {
      const set = (i, r) => { const q = S.mines[i]; if (q) [q.owner, q.capBy, q.cap, q.guards, q.steal, q.held, q.respawn, q.protect, q.lv, q.up, q.upTotal] = r; if (q?.protect) q.protectAt = now() + q.protect; if (q) q.upAt = q.up ? now() + q.up : 0; if (q) { const nx = r[11] || q.ox, ny = r[12] || q.oy; if (nx !== q.x || ny !== q.y) { q.fromX = q.x; q.fromY = q.y; q.moveT = now(); q.x = nx; q.y = ny; } } };
      if (m.list) m.list.forEach((r, i) => set(i, r)); // full list when joining a world
      if (m.d) for (const [i, r] of m.d) set(i, r); // afterwards only the mines that changed
      break;
    }
    case 'pl': S.players = new Map(m.list.map((p) => [p.id, p])); S.ev = m.ev ?? null; S.evAt = performance.now(); renderRank(); renderLobbyPlayers(); syncEvBanner(); break;
    case 'n': notice(m); if (m.th) showThDialog(m.th); break;
    case 'pinfo': showPInfo(m); break;
    case 'cleared': setCleared(m); if (S.sel?.k === 'obst') { if (S.cleared.has(S.sel.ty * S.W + S.sel.tx)) S.sel = null; renderInfo(true); } break;
    case 'chunks': S.chunkV = m.all ? { ...m.v } : { ...(S.chunkV ?? {}), ...m.v }; break;
    case 'bases': setBases(m.list); renderCastleDlg(); if (S.sel?.k === 'build') renderInfo(true); if (!$('shop').classList.contains('hidden')) renderShop(); break;
    case 'chat': { const pty = m.ch === 'party', line = `${pty ? '<span class="cp-tag">[Đội]</span> ' : ''}<b style="color:${m.color}">${esc(m.from)}:</b> ${esc(m.text)}`; chatAdd(pty ? 'party' : 'all', line); if (document.body.classList.contains('mobile')) feed(line, 'chat'); const p = [...S.players.values()].find((q) => q.name === m.from); if (p) (S.bubbles ??= new Map()).set(p.id, { text: m.text, until: now() + Math.min(10, 4 + m.text.length / 20) }); break; }
    case 'dead': endJoy(false); S.bossOrder = null; S.targeting = false; S.skillAim = null; S.alive = false; S.me = null; S.best = m.info.best;
      if (m.forfeit || S.forfeitSent) { S.forfeitSent = false; showPick(); break; }
      setTimeout(() => (S.mode === 'endless' ? showDefeat(m.info) : showDeadBanner(m.info)), 900); break;
  }
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// ================================================================= screens
$('nameinput').value = localStorage.getItem('sw-name') ?? '';
const doLogin = () => {
  tryLockLandscape();
  const n = $('nameinput').value.trim(); if (!n) { $('nameinput').focus(); return; }
  const pw = $('pwinput').value; if (!pw) { $('loginerr').textContent = 'Nhập mật khẩu'; $('pwinput').focus(); return; }
  localStorage.removeItem('sw-token');
  localStorage.setItem('sw-name', n);
  S.pw = pw; S.invite = $('inviteinput').value.trim(); S.authFailed = false; S.loggedOut = false;
  $('loginerr').textContent = '';
  $('loginbtn').disabled = true; $('loginbtn').textContent = 'Đang tải…';
  connect();
};
$('loginbtn').onclick = doLogin;
$('nameinput').onkeydown = (e) => { if (e.key === 'Enter') $('pwinput').focus(); };
$('pwinput').onkeydown = (e) => { if (e.key === 'Enter') doLogin(); };
$('inviteinput').onkeydown = (e) => { if (e.key === 'Enter') doLogin(); };
// still logged in from last time: go straight in
if (localStorage.getItem('sw-token') && localStorage.getItem('sw-name')) { $('loginbtn').disabled = true; $('loginbtn').textContent = 'Đang vào…'; connect(); }
else ($('nameinput').value ? $('pwinput') : $('nameinput')).focus();
const logout = () => {
  if (!confirm('Đăng xuất? Nhân vật và đội quân của bạn sẽ rời khỏi server ngay.')) return;
  S.loggedOut = true; send({ t: 'logout' }); localStorage.removeItem('sw-token'); try { sessionStorage.removeItem('sw-chat'); } catch {}
  setTimeout(() => location.reload(), 200);
};
$('logoutbtn').onclick = logout;
$('home-logout').onclick = logout;

let picked = null;
function showPick() {
  hideScreens();
  $('lobbydelete').classList.toggle('hidden', !(S.mode === 'match' && S.room?.by && S.room.by === S.account?.name));
  $('lobbyleave').textContent = S.mode === 'endless' ? 'Về trang chủ' : 'Rời phòng';
  $('pick').querySelector('h2').textContent = S.mode === 'endless' ? `${S.room?.name ?? 'Thế giới mở'} · chọn nhân vật` : `${S.room?.name ?? 'Phòng'} · hàng chờ`;
  $('pick').querySelector('.lobby-sub').textContent = S.mode === 'endless' ? 'Người chơi trong thế giới này' : 'Chọn nhân vật cho ván tới';
  setTimeout(updateJoinUI, 0);
  $('pick').classList.remove('hidden');
  picked = picked ?? S.heroType ?? localStorage.getItem('sw-hero') ?? 'thach-lam';
  const box = $('herocards'); box.innerHTML = '';
  for (const id of HERO_ORDER) {
    const h = HEROES[id];
    const c = document.createElement('div');
    c.className = 'hcard' + (id === picked ? ' sel' : '');
    c.innerHTML = `<div class="hsp"></div><div class="hn">${h.name}</div><div class="ht">${h.title} <span class="stars">${'★'.repeat(h.stars)}${'☆'.repeat(3 - h.stars)}</span></div><q>${h.quote}</q><p><b>Nội tại.</b> ${h.passive}</p><p><b>Kỹ năng (Q): ${h.skill.name}.</b> ${h.skill.desc} Hồi ${h.skill.cd} giây.</p>`;
    const sp = c.querySelector('.hsp');
    const frames = Array.from({ length: 8 }, (_, d) => thumb(id, 'idle', d, 1.6, 'blue', false));
    sp.appendChild(frames[0]);
    let timer = null, d = 0;
    c.onmouseenter = () => { timer = setInterval(() => { d = (d + 1) % 8; sp.replaceChildren(frames[d]); }, 250); };
    c.onmouseleave = () => { clearInterval(timer); d = 0; sp.replaceChildren(frames[0]); };
    c.onclick = () => { picked = id; localStorage.setItem('sw-hero', id); send({ t: 'pick', hero: id }); for (const x of box.children) x.classList.remove('sel'); c.classList.add('sel'); };
    box.appendChild(c);
  }
}
function go() {
  tryLockLandscape();
  localStorage.setItem('sw-hero', picked); S.heroType = picked;
  const M = S.match;
  if (S.mode === 'endless') { send({ t: 'spawn', hero: picked }); $('pick').classList.add('hidden'); S.centerOnHero = true; return; }
  if (M?.phase === 'lobby') { send({ t: 'startmatch', hero: picked }); return; }
  if (M?.phase === 'run' && M.el < M.join && !S.players.get(S.you)?.died) { send({ t: 'spawn', hero: picked }); $('pick').classList.add('hidden'); S.centerOnHero = true; return; }
  // a match is running and we cannot join: watch it
  $('pick').classList.add('hidden'); S.watching = true;
}
const forfeit = () => {
  // open world: just back to the home page, like going offline (army, items and mines are all kept)
  if (S.mode === 'endless') { send({ t: 'forfeit' }); return; }
  if (!S.alive) { showPick(); return; }
  if (!confirm('Rời trận? Bạn bỏ ván này (không vào lại được tới ván sau), đồ đang mang rơi xuống đất.')) return;
  S.forfeitSent = true; send({ t: 'forfeit' });
};
const leaveRoom = () => {
  if (S.alive && !confirm('Về trang chủ? Nhân vật và đội quân của bạn sẽ rời khỏi thế giới này.')) return;
  send({ t: 'leaveroom' });
};
$('lobbyleave').onclick = () => leaveRoom();
$('lobbydelete').onclick = () => { if (S.room && confirm(`Xoá phòng "${S.room.name}"? Mọi người trong phòng sẽ về trang chủ.`)) send({ t: 'deleteroom', id: S.room.id }); };
$('res-leave').onclick = (e) => { e.preventDefault(); $('results').classList.add('hidden'); send({ t: 'leaveroom' }); };
$('lobbywatch').onclick = (e) => { e.preventDefault(); $('pick').classList.add('hidden'); S.watching = !S.alive; };
$('gobtn').onclick = go;
function showDefeat(info) {
  hideScreens(); document.body.classList.add('gray');
  $('defeat').classList.remove('hidden');
  const h = HEROES[info.hero] ?? HEROES['thach-lam'];
  $('defeat-who').innerHTML = info.killer ? `${h.name} đã ngã xuống dưới tay <b>${esc(info.killer)}</b>` : info.why === 'left' ? 'Bạn đã rời trận quá lâu' : info.why === 'zone' ? `${h.name} gục ngoài bo` : `${h.name} đã ngã xuống`;
  setTimeout(updateJoinUI, 0);
  const mm = Math.floor(info.alive / 60), ss = info.alive % 60;
  $('defeat-stats').innerHTML = [
    ['Thời gian sống', `${mm} phút ${ss} giây`], ['Mỏ giữ nhiều nhất cùng lúc', info.bestMines], ['Quân đã mua (giá trị)', info.bought.toLocaleString('vi')],
    ['Quân địch đã hạ (giá trị)', info.killed.toLocaleString('vi')], ['Điểm đời này', info.score], ['Điểm cao nhất', `${info.best ?? S.best}${info.rank ? ` (hạng ${info.rank} server)` : ''}`],
  ].map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
  S.watch = info.killerId;
  picked = info.hero;
}
$('againbtn').onclick = () => { document.body.classList.remove('gray'); showPick(); };
$('watchbtn').onclick = (e) => { e.preventDefault(); document.body.classList.remove('gray'); $('defeat').classList.add('hidden'); send({ t: 'leaveroom' }); };
function hideScreens() { for (const id of ['pick', 'defeat', 'login', 'home']) $(id).classList.add('hidden'); document.body.classList.remove('gray'); S.watching = false; }

// ================================================================= notices
function feed(html, cls = '') { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; $('sysfeed').appendChild(d); setTimeout(() => d.remove(), 8000); while ($('sysfeed').children.length > 8) $('sysfeed').firstChild.remove(); }
/** marching sounds (14/11/2026): while my army walks (not fighting), loops by size and make-up; checked 4× a second */
setInterval(() => {
  const me = S.me, h = me && S.byId?.get(me.hero), want = {};
  if (h && h.act === 1 && !me.combat && !S.afk) {
    const own = S.view.filter((u) => u.owner === S.you && UNITS[u.type] && Math.hypot(u.x - h.x, u.y - h.y) < 14), n = own.length, moving = own.filter((u) => u.act === 1).length; // the army around the hero (not mine garrisons / base troops)
    if (moving >= Math.max(1, n * 0.3)) {
      const cav = own.filter((u) => UNITS[u.type].cls === 'cav').length, fly = own.filter((u) => UNITS[u.type].cls === 'fly').length, siege = own.filter((u) => UNITS[u.type].cls === 'siege').length;
      want[n >= 30 ? 'march_big_loop' : 'march_small_loop'] = n >= 3 ? 1 : 0.5;
      if (cav >= 4) want.cavalry_group_loop = Math.min(1, cav / 15);
      if (fly >= 2) want.wings_loop = Math.min(1, fly / 8);
      if (siege >= 1) want.siege_roll_loop = 0.8;
    } else if (HEROES[h.type]?.cls === 'cav' || h.type === 'phong-vu') want.horse_gallop = 0.7; // the hero rides alone
  }
  setLoops(want);
}, 250);
/** battle music (14/11/2026, changed): only from a real attack order on a boss until that boss dies or I order something else */
function battleMusic() {
  const o = S.bossOrder; if (!o) return false;
  const boss = S.byId?.get(o.id), alive = (S.match?.bosses ?? []).some((b) => b[5] === o.id);
  if (!alive || (boss && boss.act === 5)) { S.bossOrder = null; return false; } // the boss died / left: back to calm
  return true;
}
// UI sounds (14/11/2026): a soft click on every button, coins on a buy / build button that is not greyed out
document.addEventListener('click', (e) => {
  const b = e.target.closest?.('button'); if (!b || b.disabled) return;
  const buy = /^(MUA|XÂY)/.test((b.textContent ?? '').trim()) && !b.classList.contains('lack');
  play(buy ? 'ui_buy' : 'ui_click');
}, true);
function noticeSound(m) {
  const t = m.text ?? '', me = S.me?.name ?? '\u0000';
  if (m.kind === 'sys') { if (/hạ thành công boss|đã hạ boss/.test(t) && t.includes(me)) play('boss_killed'); return; }
  if (/^⭐ Lên cấp/.test(t)) play('level_up');
  else if (/Hoàn thành nhiệm vụ|Xong cả 5 nhiệm vụ|Nhận thưởng/.test(t)) play('quest_complete');
  else if (/^Nhặt được/.test(t)) play('loot_pickup');
  else if (/^Đã chiếm /.test(t)) play('mine_captured');
  else if (/^Mất .* vào tay|bị chiếm:/.test(t)) play('mine_lost');
  else if (/^⚔ Căn cứ đang bị/.test(t)) play('base_alarm');
  else if (m.kind === 'err') play('ui_error');
}
function notice(m) {
  noticeSound(m);
  if (m.pinv) showPartyInvite(m);
  if (m.kind === 'sys') return feed(esc(m.text));
  const d = document.createElement('div'); d.className = m.kind; d.textContent = m.text;
  if (m.color) d.style.color = m.color;
  if (m.x != null) d.onclick = () => jumpTo(m.x, m.y);
  $('alerts').appendChild(d); setTimeout(() => d.remove(), m.kind === 'loot' ? 9000 : 4500); // picked-up items stay twice as long
  // too many lines: drop the oldest ordinary notice first, loot lines last
  while ($('alerts').children.length > 6) ([...$('alerts').children].find((x) => !x.classList.contains('loot')) ?? $('alerts').firstChild).remove();
}
function flashRes(i) { const el = $('resbar').children[i]; if (el) { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); } }

// ================================================================= camera & input
const cam = S.cam;
function jumpTo(x, y) { if (S.mobile && S.alive) return; cam.x = x * T - W / cam.z / 2; cam.y = y * T - H / cam.z / 2; cam.follow = false; }
function clampCam() {
  const mw = S.W * T, mh = S.H * T, vw = W / cam.z, vh = H / cam.z;
  cam.x = Math.max(-vw / 2, Math.min(mw - vw / 2, cam.x)); cam.y = Math.max(-vh / 2, Math.min(mh - vh / 2, cam.y));
}
function setZoom(z, mx = W / 2, my = H / 2) {
  z = Math.max(S.mobile ? 0.85 : 1, Math.min(4, z)); if (z === cam.z) return;
  const wx = mx / cam.z + cam.x, wy = my / cam.z + cam.y;
  cam.z = z; cam.x = wx - mx / z; cam.y = wy - my / z;
}
const toWorld = (mx, my) => ({ x: (mx / cam.z + cam.x) / T, y: (my / cam.z + cam.y) / T });
function bindTap(el, fn) {
  let tid = null, sx = 0, sy = 0, ts = 0;
  el.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0]; if (!t) return;
    tid = t.identifier; sx = t.clientX; sy = t.clientY;
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === tid) {
        tid = null;
        if (Math.hypot(t.clientX - sx, t.clientY - sy) < 18) { e.preventDefault(); ts = performance.now(); fn(e, t); }
      }
    }
  }, { passive: false });
  el.addEventListener('click', (e) => { if (performance.now() - ts < 500) return; fn(e, e); });
}
let drag = null, rdown = null, ldown = null, lastCanvasTouch = 0, buyMult = 1; // left button: click = select, hold + drag = pan the map
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
// double click (left) on one of my structures = pick it up and move it (12/11/2026; holding + dragging now pans the map).
// A wall piece: its selected group (Shift + click) if it belongs to one, else its whole straight row.
canvas.addEventListener('dblclick', (e) => {
  if (S.build || !S.alive || S.room?.mode !== 'endless') return;
  const w = toWorld(e.clientX, e.clientY), bt = buildingAt(w.x, w.y);
  if (!bt || bt.key !== myKey()) return;
  let ids = [bt.id];
  if (bt.type === 'tuong') {
    if (S.selWalls?.has(bt.id) && S.selWalls.size > 1) ids = [...S.selWalls];
    else { const h = wallLine(bt, 1, 0), v = wallLine(bt, 0, 1), list = h.length >= v.length ? h : v; S.selWalls = new Set(list.map((q) => q.id)); ids = [...S.selWalls]; }
  }
  S.sel = { k: 'build', key: bt.key, id: bt.id };
  startMove(ids, false, { tx: Math.floor(w.x), ty: Math.floor(w.y) });
  if (S.build) notice({ kind: 'ok', text: 'Đang dời: bấm vào chỗ mới để đặt · chuột phải / Esc: thôi' });
  renderInfo(true);
});
canvas.addEventListener('mousedown', (e) => {
  if (hellState.on) { hellMouse('down', e); return; }
  if (performance.now() - lastCanvasTouch < 450) return;
  if (e.button === 1) { e.preventDefault(); drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, lx: e.clientX, ly: e.clientY }; cam.follow = false; canvas.style.cursor = 'grabbing'; }
  if (e.button === 2) rdown = { x: e.clientX, y: e.clientY };
  if (e.button === 0 && S.mineMove) { doMineMove(toWorld(e.clientX, e.clientY)); return; }
  if (e.button === 0 && S.build) { buildHeld = true; buildDown(toWorld(e.clientX, e.clientY), e, send); return; }
  if (e.button === 0) ldown = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, lx: e.clientX, ly: e.clientY, w: toWorld(e.clientX, e.clientY) };
});
let buildHeld = false;
addEventListener('mouseup', (e) => {
  if (hellState.on) { hellMouse('up', e); return; }
  if (performance.now() - lastCanvasTouch < 450) return;
  if (e.button === 0 && buildHeld) { buildHeld = false; buildUp(); if (S.build?.drag) { buildDown(toWorld(e.clientX, e.clientY), e, send); S.build = null; } }
  if (e.button === 0 && ldown) { if (drag) { drag = null; canvas.style.cursor = ''; } else if (e.target === canvas) leftClick(e.clientX, e.clientY); ldown = null; }
  if (e.button === 1 && drag) { drag = null; canvas.style.cursor = ''; }
  if (e.button === 2 && rdown) { if (Math.hypot(e.clientX - rdown.x, e.clientY - rdown.y) < 6 && e.target === canvas) rightClick(e.clientX, e.clientY); rdown = null; }
});
addEventListener('mousemove', (e) => {
  if (hellState.on) { hellMouse('move', e); return; }
  if (performance.now() - lastCanvasTouch < 450) return;
  S.mouse.x = e.clientX; S.mouse.y = e.clientY; S.mouseOnMap = e.target === canvas; // no map hover label through panels (13/11/2026)
  if (buildHeld && S.build) { buildDrag(toWorld(e.clientX, e.clientY), send); return; }
  if (ldown && !drag && !S.targeting && Math.hypot(e.clientX - ldown.x, e.clientY - ldown.y) >= 6) {
    drag = ldown; cam.follow = false;
  }
  if (drag) { cam.vx = (drag.lx - e.clientX) / cam.z; cam.vy = (drag.ly - e.clientY) / cam.z; drag.lx = e.clientX; drag.ly = e.clientY; cam.x = drag.cx + (drag.x - e.clientX) / cam.z; cam.y = drag.cy + (drag.y - e.clientY) / cam.z; }
});
canvas.addEventListener('wheel', (e) => { e.preventDefault(); if (hellState.on) { hellWheel(e); return; } setZoom(Math.round(cam.z) + (e.deltaY < 0 ? 1 : -1), e.clientX, e.clientY); }, { passive: false });

// ---- multi-touch on map canvas (hero always pinned centered while alive; pinch zooms around center)
const ctouches = new Map();
let cGesture = null;
function confirmMobileBuild() {
  if (!S.build) return;
  const keep = S.build.mode === 'place' && S.build.type === 'tuong';
  buildDown(toWorld(S.mouse.x, S.mouse.y), { shiftKey: keep }, send);
  buildUp();
}
canvas.addEventListener('touchstart', (e) => {
  if (hellState.on) { e.preventDefault(); const t = e.changedTouches[0]; if (t) hellMouse('down', { button: 2, clientX: t.clientX, clientY: t.clientY }); return; } // Địa Ngục: hold a finger to walk toward it
  e.preventDefault(); lastCanvasTouch = performance.now();
  closeMobileDrawer();
  for (const t of e.changedTouches) ctouches.set(t.identifier, { x: t.clientX, y: t.clientY });
  if (ctouches.size === 1) {
    const [p] = ctouches.values();
    cGesture = { mode: 'one', moved: false, sx: p.x, sy: p.y, lx: p.x, ly: p.y, cx: cam.x, cy: cam.y };
  } else if (ctouches.size >= 2) {
    const [a, b] = [...ctouches.values()];
    cGesture = { mode: 'pinch', moved: true, dist: Math.max(12, Math.hypot(a.x - b.x, a.y - b.y)), z0: cam.z, lx: (a.x + b.x) / 2, ly: (a.y + b.y) / 2 };
    if (!S.alive) cam.follow = false;
  }
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  if (hellState.on) { e.preventDefault(); const t = e.changedTouches[0]; if (t) hellMouse('move', { clientX: t.clientX, clientY: t.clientY }); return; }
  e.preventDefault(); lastCanvasTouch = performance.now();
  for (const t of e.changedTouches) { const r = ctouches.get(t.identifier); if (r) { r.x = t.clientX; r.y = t.clientY; } }
  if (!cGesture) return;
  if (ctouches.size >= 2) {
    const [a, b] = [...ctouches.values()], dist = Math.max(12, Math.hypot(a.x - b.x, a.y - b.y)), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if (cGesture.mode !== 'pinch') cGesture = { mode: 'pinch', moved: true, dist, z0: cam.z, lx: mx, ly: my };
    if (S.alive && !S.freeCam) {
      setZoom(cGesture.z0 * (dist / cGesture.dist), W / 2, H / 2);
      pinHeroCam();
    } else {
      cam.x += (cGesture.lx - mx) / cam.z; cam.y += (cGesture.ly - my) / cam.z; cGesture.lx = mx; cGesture.ly = my;
      setZoom(cGesture.z0 * (dist / cGesture.dist), mx, my);
    }
    cam.vx = cam.vy = 0;
  } else if (ctouches.size === 1 && cGesture.mode === 'one') {
    const [p] = ctouches.values();
    if (!cGesture.moved && Math.hypot(p.x - cGesture.sx, p.y - cGesture.sy) >= 8) {
      cGesture.moved = true;
      if (!S.alive) cam.follow = false;
    }
    if (cGesture.moved) {
      if (S.alive && S.build) { S.mouse.x = p.x; S.mouse.y = p.y; S.build._tapped = true; }
      else {
        // 12/11/2026: one finger drags the map on mobile too (the hero stays where he is); "Về tướng" brings the camera back
        if (S.alive && !S.freeCam) { setFreeCam(true); cGesture.cx = cam.x; cGesture.cy = cam.y; cGesture.sx = cGesture.lx = p.x; cGesture.sy = cGesture.ly = p.y; }
        cam.vx = (cGesture.lx - p.x) / cam.z; cam.vy = (cGesture.ly - p.y) / cam.z;
        cGesture.lx = p.x; cGesture.ly = p.y;
        cam.x = cGesture.cx + (cGesture.sx - p.x) / cam.z; cam.y = cGesture.cy + (cGesture.sy - p.y) / cam.z;
      }
    }
  }
}, { passive: false });
const endCanvasTouch = (e) => {
  e.preventDefault(); lastCanvasTouch = performance.now();
  for (const t of e.changedTouches) {
    if (e.type === 'touchend' && ctouches.size === 1 && cGesture?.mode === 'one' && !cGesture.moved) {
      $('minimap-wrap').classList.remove('big');
      if (S.mineMove) { const w = toWorld(t.clientX, t.clientY), k = `${Math.floor(w.x)},${Math.floor(w.y)}`; S.mouse.x = t.clientX; S.mouse.y = t.clientY; if (S.mineMove.tap === k) doMineMove(w); else S.mineMove.tap = k; } // tap twice on the same tile
      else if (S.targeting) { S.mouse.x = t.clientX; S.mouse.y = t.clientY; leftClick(t.clientX, t.clientY); }
      else if (S.build) {
        const sz = S.build.mode === 'place' ? B_SIZE(S.build.type) : 1;
        const tile = (w) => `${Math.round(w.x - sz / 2)},${Math.round(w.y - sz / 2)}`;
        const prevT = tile(toWorld(S.mouse.x, S.mouse.y)), nextT = tile(toWorld(t.clientX, t.clientY));
        S.mouse.x = t.clientX; S.mouse.y = t.clientY;
        if (S.build._tapped && prevT === nextT) confirmMobileBuild(); else S.build._tapped = true;
      } else { S.mouse.x = t.clientX; S.mouse.y = t.clientY; leftClick(t.clientX, t.clientY); }
    }
    ctouches.delete(t.identifier);
  }
  if (ctouches.size === 1) { const [p] = ctouches.values(); cGesture = { mode: 'one', moved: true, sx: p.x, sy: p.y, lx: p.x, ly: p.y, cx: cam.x, cy: cam.y }; }
  else if (!ctouches.size) cGesture = null;
};
canvas.addEventListener('touchend', (e) => { if (hellState.on) { e.preventDefault(); hellMouse('up', { button: 2 }); return; } endCanvasTouch(e); }, { passive: false });
canvas.addEventListener('touchcancel', endCanvasTouch, { passive: false });

function rightClick(mx, my) {
  if (S.targeting) { S.targeting = false; return; }
  if (S.mineMove) { S.mineMove = null; return; }
  if (S.build) { cancelBuild(); return; }
  if (!S.alive) return;
  const p = pick(mx, my), w = toWorld(mx, my);
  const bt = (!p || p.k === 'mine') && buildingAt(w.x, w.y);
  if (bt && bt.key !== myKey() && bt.uid && S.byId.get(bt.uid)) { send({ t: 'chase', id: bt.uid }); S.marks.push({ x: bt.tx + B_SIZE(bt.type) / 2, y: bt.ty + B_SIZE(bt.type) / 2, c: '#ff4a4a', t0: now() }); return; }
  if (p?.k === 'unit') {
    const u = S.byId.get(p.id);
    if (u && u.owner !== S.you) { send({ t: 'chase', id: u.id }); S.marks.push({ x: u.x, y: u.y, c: '#ff4a4a', t0: now() }); return; }
  }
  if (p?.k === 'item') { pickUp(p.id); return; }
  if (p?.k === 'mine') { send({ t: 'mine', id: p.id }); const m = S.mines[p.id]; S.marks.push({ x: m.x, y: m.y, c: '#3ee06b', t0: now() }); return; }
  send({ t: 'move', x: w.x, y: w.y }); S.marks.push({ x: w.x, y: w.y, c: '#3ee06b', t0: now() });
}
function leftClick(mx, my) {
  { const w = toWorld(mx, my), g = S.hellGate; if (g && !S.build && Math.abs(w.x - g[0]) < 3.5 && w.y > g[1] - 5.5 && w.y < g[1] + 5.5) { openHellGate(); return; } } // Cổng Địa Ngục
  if (S.targeting) { const w = toWorld(mx, my); send({ t: 'skill', x: w.x, y: w.y }); S.targeting = false; return; }
  const prev = S.sel;
  S.sel = pick(mx, my);
  if (S.mobile && S.sel?.k === 'unit' && S.sel.id === S.me?.hero) S.sel = null;
  const w = toWorld(mx, my), bt = (!S.sel || S.sel.k === 'mine') && buildingAt(w.x, w.y);
  if (bt) {
    // walls: Shift + click adds / removes single wall pieces to the selection (to move them together)
    if (shiftDown && bt.type === 'tuong' && prev?.k === 'build' && prev.key === bt.key && findWall(prev)) {
      S.selWalls ??= new Set([prev.id]);
      if (S.selWalls.has(bt.id) && S.selWalls.size > 1) S.selWalls.delete(bt.id); else S.selWalls.add(bt.id);
      S.sel = { k: 'build', key: bt.key, id: [...S.selWalls][0] };
    } else { S.sel = { k: 'build', key: bt.key, id: bt.id }; S.selWalls = bt.type === 'tuong' ? new Set([bt.id]) : null; }
  } else S.selWalls = null;
  if (!S.sel && !bt) S.sel = obstPick(w.x, w.y); // a tree / rock in my base zone: clear it
  if (S.sel?.k === 'item') { pickUp(S.sel.id); S.sel = null; }
  if (S.sel) $('rankpanel').classList.add('hidden');
  renderInfo(true);
}
/** left click on loot: the hero walks over and picks it up (only your own loot from monsters) */
let shiftDown = false;
addEventListener('keydown', (e) => { if (e.key === 'Shift') shiftDown = true; });
addEventListener('keyup', (e) => { if (e.key === 'Shift') shiftDown = false; });
const findWall = (sel) => S.bases?.find((b) => b.key === sel.key)?.items.find((i) => i.id === sel.id && i.type === 'tuong');
function pickUp(id) {
  const g = S.items.find((q) => q.id === id); if (!g || !S.alive) return;
  if (g.owner && g.owner !== S.you) { notice({ kind: 'err', text: `Chiến lợi phẩm của ${S.players.get(g.owner)?.name ?? 'người khác'}: bạn không nhặt được` }); return; }
  send({ t: 'pickup', id }); S.marks.push({ x: g.x, y: g.y, c: TIER_INFO[g.item.tier].color, t0: now() });
}
function useSkill() {
  if (!S.me || S.me.cd > 0) return;
  if (HEROES[S.heroType]?.skill.target) {
    S.targeting = !S.targeting;
    const mh = S.byId.get(S.me.hero);
    if (S.targeting && S.mobile && mh) { S.mouse.x = (mh.x * T - cam.x) * cam.z; S.mouse.y = (mh.y * T - cam.y) * cam.z; }
    return;
  }
  send({ t: 'skill' });
}
// 15/11/2026: desktop chat panel on the left (between Tổ đội and the hero card), tabs Server / Đội; mobile keeps the pop-up input + feed
// history kept from login on: sessionStorage survives F5 / the reload after a server restart, dropped on logout or another name
const CHAT_SS = 'sw-chat', CHAT_MAX = 200;
const chatLog = (() => { try { const o = JSON.parse(sessionStorage.getItem(CHAT_SS) || 'null'); if (o && o.name === localStorage.getItem('sw-name')) return { all: o.all ?? [], party: o.party ?? [] }; } catch {} return { all: [], party: [] }; })(), chatUnread = { all: 0, party: 0, ai: 0 };
const chatSave = () => { try { sessionStorage.setItem(CHAT_SS, JSON.stringify({ name: localStorage.getItem('sw-name'), ...chatLog })); } catch {} };
let chatCh = 'all';
const cpEmpty = () => `<div class="muted">${chatCh === 'party' ? (S.party ? 'Chưa có tin nhắn trong tổ đội' : 'Chưa có tổ đội: mời người khác vào đội để chat riêng') : 'Chưa có tin nhắn. Bấm Enter để chat'}</div>`;
function renderChatTabs() { document.querySelectorAll('#chatpanel [data-ch]').forEach((b) => { const ch = b.dataset.ch; b.classList.toggle('on', ch === chatCh); b.querySelector('i').textContent = chatUnread[ch] ? (chatUnread[ch] > 9 ? '9+' : chatUnread[ch]) : ''; }); }
function renderChatLog() { if (chatCh === 'ai') return; const el = $('cplog'); el.innerHTML = chatLog[chatCh].map((h) => `<div>${h}</div>`).join('') || cpEmpty(); el.scrollTop = el.scrollHeight; }
function chatAdd(ch, html) {
  const L = chatLog[ch]; L.push(html); if (L.length > CHAT_MAX) L.shift(); chatSave();
  if (ch !== chatCh) { chatUnread[ch]++; return renderChatTabs(); }
  const el = $('cplog'), atEnd = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
  if (L.length === 1) el.innerHTML = '';
  const d = document.createElement('div'); d.innerHTML = html; el.appendChild(d);
  while (el.children.length > CHAT_MAX) el.firstChild.remove();
  if (atEnd) el.scrollTop = el.scrollHeight;
}
function setChatCh(ch) {
  chatCh = ch; chatUnread[ch] = 0; renderChatTabs(); renderChatLog();
  const ai = ch === 'ai'; // 16/11/2026: the AI helper lives in its own tab of this panel
  if (ai) advMount($('chatpanel'), $('cplog'));
  $('cplog').classList.toggle('hidden', ai); $('advlog')?.classList.toggle('hidden', !ai && $('advlog').parentElement?.id === 'chatpanel');
  $('cpin').maxLength = ai ? 500 : 140;
  $('cpin').placeholder = ai ? 'Hỏi trợ lý AI (luật chơi, tài khoản của bạn), Enter để gửi' : ch === 'party' ? 'Nhắn cho tổ đội, Enter để gửi' : 'Nhắn cho cả server, Enter để gửi';
}
document.querySelectorAll('#chatpanel [data-ch]').forEach((b) => (b.onclick = () => { setChatCh(b.dataset.ch); $('cpin').focus(); }));
function submitPanelChat() {
  const v = $('cpin').value.trim();
  if (chatCh === 'ai') { if (v && advSend(v)) $('cpin').value = ''; return; }
  if (v) { if (chatCh === 'party' && !S.party) return notice({ kind: 'err', text: 'Chưa có tổ đội' }); send(chatCh === 'party' ? { t: 'pchat', text: v } : { t: 'chat', text: v }); }
  $('cpin').value = ''; $('cpin').blur();
}
$('cpsend').onclick = submitPanelChat;
renderChatLog();
function openChat() { if (!document.body.classList.contains('mobile')) return $('cpin').focus(); $('chatbox').classList.remove('hidden'); $('chatin').focus(); }
function closeChat() { $('chatin').value = ''; $('chatbox').classList.add('hidden'); $('chatin').blur(); }
function submitChat() { const v = $('chatin').value.trim(); if (v) send({ t: 'chat', text: v }); closeChat(); }
$('chatsend').onclick = submitChat;
$('chatclose').onclick = closeChat;
// ---------------- shortcut keys: each player can rebind them (saved in this browser) (12/11/2026)
const KEY_ACTS = {
  mup: { name: 'Đi lên (giữ phím)', def: 'w', move: [0, -1], run: () => {} }, // WASD walking (16/11/2026), handled on keydown / keyup
  mleft: { name: 'Đi sang trái (giữ phím)', def: 'a', move: [-1, 0], run: () => {} },
  mdown: { name: 'Đi xuống (giữ phím)', def: 's', move: [0, 1], run: () => {} },
  mright: { name: 'Đi sang phải (giữ phím)', def: 'd', move: [1, 0], run: () => {} },
  skill: { name: 'Kỹ năng tướng', def: 'q', run: () => useSkill() },
  center: { name: 'Về giữa tướng (bám camera)', def: ' ', run: () => { centerHero(); cam.follow = true; } },
  follow: { name: 'Bật / tắt camera bám tướng', def: 'f', run: () => { cam.follow = !cam.follow; } },
  shop: { name: 'Cửa hàng', def: 'b', run: () => toggleShop() },
  inv: { name: 'Trang bị và túi đồ', def: 'i', run: () => toggleInv() },
  quest: { name: 'Nhiệm vụ', def: 'j', run: () => ($('questdlg').classList.contains('hidden') ? openQuest() : $('questdlg').classList.add('hidden')) },
  hold: { name: 'Cất binh / Xuất binh', def: 'c', run: () => send({ t: 'hold' }) },
  regroup: { name: 'Tập hợp', def: 't', run: () => regroup() },
  pull: { name: 'Rút quân', def: 'r', run: () => pullBack() },
  atk: { name: 'Đánh mục tiêu gần nhất', def: 'e', run: () => attackNearest() }, // was A until WASD walking (16/11/2026)
  mode: { name: 'Đổi cách xếp đội hình', def: 'g', run: () => send({ t: 'mode' }) },
  recall: { name: 'Về thành', def: 'v', run: () => recall() },
  stop: { name: 'Dừng tướng', def: 'h', run: () => send({ t: 'stop' }) },
  map: { name: 'Phóng to bản đồ nhỏ', def: 'm', run: () => $('minimap-wrap').classList.toggle('big') },
  zoomin: { name: 'Phóng to', def: '=', run: () => setZoom(Math.round(cam.z) + 1) },
  zoomout: { name: 'Thu nhỏ', def: '-', run: () => setZoom(Math.round(cam.z) - 1) },
  help: { name: 'Hướng dẫn', def: '?', run: () => openHelp() },
  keys: { name: 'Bảng phím tắt', def: 'k', run: () => openKeys() },
};
const KEY_FIXED = /^(Tab|Enter|Escape|Shift|Control|Alt|Meta|CapsLock|Arrow.*|[0-9])$/; // reserved: chat, scoreboard, close, buy by number, camera
let keyMap = {};
try { keyMap = JSON.parse(localStorage.getItem('sw-keys') || '{}') ?? {}; } catch { keyMap = {}; }
const keyOf = (id) => (Object.hasOwn(keyMap, id) ? keyMap[id] : KEY_ACTS[id].def);
const normKey = (k) => (k.length === 1 ? k.toLowerCase() : k);
const keyName = (k) => (k === ' ' ? 'Space' : k === '' ? '—' : k.length === 1 ? k.toUpperCase() : k);
function keyAction(k) {
  const n = normKey(k);
  for (const id of Object.keys(KEY_ACTS)) { const b = keyOf(id); if (b && (b === n || (id === 'zoomin' && b === '=' && n === '+'))) return id; }
  return null;
}
function saveKeys() { try { localStorage.setItem('sw-keys', JSON.stringify(keyMap)); } catch {} keyLabels(); }
/** the key letters printed on buttons follow the bindings */
function keyLabels() {
  const L = (id) => keyName(keyOf(id));
  $('regroupbtn').textContent = `${L('regroup')} · Tập hợp`; $('pullbtn').textContent = `${L('pull')} · Rút quân`; $('atkbtn').textContent = `${L('atk')} · Đánh`; $('recallbtn').textContent = `${L('recall')} · Về thành`;
  const sk = document.querySelector('#skillbtn .key'); if (sk) sk.textContent = L('skill');
  lastHud = '';
}
let keyWait = null;
/** is any dialog / panel / selection open? (Esc closes them; with nothing open Esc opens Cài đặt) */
const ESC_IDS = ['keysdlg', 'dlogdlg', 'questdlg', 'craftdlg', 'campdlg', 'castledlg', 'checkin', 'help', 'heroswap', 'shop', 'rankpanel', 'invpanel', 'queendlg', 'kingdlg', 'pinfodlg', 'board'];
function escAnyOpen() {
  if (ESC_IDS.some((id) => { const d = document.getElementById(id); return d && !d.classList.contains('hidden'); })) return true;
  if (document.getElementById('needdlg') || document.getElementById('forgedlg')) return true;
  return !!(S.sel || S.targeting || S.skillAim || S.mineMove || $('minimap-wrap').classList.contains('big'));
}
/** 14/11/2026: close every dialog / panel except Cài đặt (map modes like Dời, Xây, nhắm kỹ năng stay on) */
function closeAllDlg() {
  for (const id of ESC_IDS) if (id !== 'keysdlg') document.getElementById(id)?.classList.add('hidden');
  document.querySelectorAll('#needdlg, #forgedlg, .thup').forEach((d) => d.remove());
  document.querySelectorAll('.rb.shop.on, .rb.inv.on, .rb.rank.on').forEach((b) => b.classList.remove('on'));
  $('info').classList.add('hidden'); S.sel = null; infoKey = ''; setTimeout(() => { if (!S.sel) S.selWalls = null; }, 0); // after the button's handler (Dời uses the picked walls)
  $('minimap-wrap').classList.remove('big');
  closeMobileDrawer();
}
// any button in the info panel closes everything first (its own handler still runs and may open the next dialog);
// in other dialogs a button that hands control to the map (Dời, Xây, nhắm…) closes everything afterwards
const DLG_SEL = '.modal, .panel, #m-drawer, #needdlg, #forgedlg, .thup';
const INFO_KEEP = /^(info-x|mineabandon|b-(w[hvg]|wclear|cput-|ctake-))/;
let dlgMode0 = null;
const mapMode = () => !!(S.build || S.mineMove || S.targeting || S.skillAim);
document.addEventListener('click', (e) => {
  const b = e.target.closest?.('button'); dlgMode0 = null;
  if (!b || b.disabled || b.closest('#keysdlg') || !b.closest(DLG_SEL)) return;
  if (b.closest('#info')) { if (!INFO_KEEP.test(b.id || '')) closeAllDlg(); return; }
  dlgMode0 = mapMode();
}, true);
document.addEventListener('click', () => { if (dlgMode0 === false && mapMode()) closeAllDlg(); dlgMode0 = null; });
function openKeys() { $('keysdlg').classList.remove('hidden'); keyWait = null; renderKeys(); }
const GLOWS = [['Đỏ', '#ff5a5a'], ['Cam', '#ffa040'], ['Vàng', '#ffe060'], ['Lục', '#5ee07a'], ['Lam', '#5ab8ff'], ['Chàm', '#7a86ff'], ['Tím', '#c07aff'], ['Hồng', '#ff7ad0']];
function glowHtml() {
  const me = S.players?.get(S.you), cur = me?.glow || '', base = me?.color ?? '#ffffff';
  return `<div class="glowset"><div class="gs-h">Màu viền đội <small>(lính, tướng, mỏ, công trình của bạn; ai cũng thấy)</small></div>
    <div class="gs-row">${GLOWS.map(([n, c]) => `<button class="gsw ${cur === c ? 'on' : ''}" data-c="${c}" title="${n}" style="--c:${c}"></button>`).join('')}
    <button class="gsw def ${!cur ? 'on' : ''}" data-c="" title="Mặc định: màu người chơi" style="--c:${base}">✕</button>
    <label class="gsoff"><input type="checkbox" id="gsoff" ${outlineOn() ? '' : 'checked'}> Tắt viền (máy yếu)</label>
    <input type="color" id="gspick" value="${cur || base}" title="Chọn màu tuỳ ý"><input id="gshex" maxlength="7" placeholder="#RRGGBB" value="${cur}"><button id="gsok">Áp dụng</button></div></div>`;
}
function wireGlow() {
  const set = (c) => { send({ t: 'set-glow', c }); setTimeout(() => { if (!$('keysdlg').classList.contains('hidden') && !keyWait) renderKeys(); }, 1200); };
  document.querySelectorAll('#keysbody .gsw').forEach((b) => (b.onclick = () => set(b.dataset.c)));
  if ($('gsoff')) $('gsoff').onchange = () => setOutline(!$('gsoff').checked);
  const pick = $('gspick'), hex = $('gshex');
  if (pick) pick.oninput = () => { hex.value = pick.value; };
  if ($('gsok')) $('gsok').onclick = () => { const v = hex.value.trim().toLowerCase(); if (/^#[0-9a-f]{6}$/.test(v)) set(v); else notice({ kind: 'err', text: 'Mã màu dạng #RRGGBB, ví dụ #5ab8ff' }); };
}
/** Tự động (13/11/2026): auto fight monsters + lowest quality picked up; kept on the server per account */
function autoCfg() { const c = S.me?.cfg ?? {}; return { farm: !!c.farm, lv: c.lv ?? 3, lvMin: c.lvMin ?? 1, pick: c.pick ?? 0, home: c.home ?? 0, store: !!c.store }; }
function autoHtml() {
  if (S.room?.mode !== 'endless') return '';
  const c = autoCfg();
  return `<div class="glowset autoset"><div class="gs-h">Tự động</div><div class="sgrid">
    <span>Tự động đánh quái <small>train quái, farm đồ</small></span><label class="sw"><input type="checkbox" id="autofarm" ${c.farm ? 'checked' : ''}><i></i></label>
    <span>Bãi quái thấp nhất <small>bỏ qua bãi cấp thấp hơn</small></span><select id="autolvmin">${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${c.lvMin === i + 1 ? 'selected' : ''}>Cấp ${i + 1}</option>`).join('')}</select>
    <span>Bãi quái tối đa <small>chỉ đánh bãi cấp ≤ mức này</small></span><select id="autolv">${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${c.lv === i + 1 ? 'selected' : ''}>Cấp ${i + 1}</option>`).join('')}</select>
    <span>Về thành khi quân dưới <small>0 = tắt · về rồi nghỉ luôn, tắt tự đánh</small></span><span class="snum"><input type="number" id="autohome" min="0" max="500" step="5" value="${c.home}"> lính</span>
    <span>Túi đầy thì tự về cất Rương <small>về thành, cất hết túi vào Rương đồ rồi đánh tiếp</small></span><label class="sw"><input type="checkbox" id="autostore" ${c.store ? 'checked' : ''}><i></i></label>
    <span>Chỉ nhặt đồ từ <small>đồ thấp hơn để lại dưới đất</small></span><select id="autopick">${TIERS.map((t, i) => `<option value="${i}" ${c.pick === i ? 'selected' : ''}>${i ? TIER_INFO[t].name + ' trở lên' : 'Tất cả'}</option>`).join('')}</select>
    </div><div class="gs-note">Tướng tự tìm bãi gần nhất trong 80 ô. Máu dưới 35% thì nghỉ tới 85%. Bạn ra lệnh khác thì auto chờ 10 giây.</div></div>`;
}
function wireAuto() {
  const send2 = () => { const cfg = { farm: $('autofarm').checked, lv: +$('autolv').value, lvMin: Math.min(+$('autolvmin').value, +$('autolv').value), pick: +$('autopick').value, home: Math.max(0, +$('autohome').value | 0), store: $('autostore').checked }; S.me && (S.me.cfg = cfg); send({ t: 'auto-cfg', ...cfg }); syncAutoBadge(); };
  for (const id of ['autofarm', 'autolv', 'autolvmin', 'autopick', 'autohome', 'autostore']) if ($(id)) $(id).onchange = send2;
}
/** 📺 pop the game out into a small always-on-top window (Chrome / Edge Document PiP; else a view-only video PiP) */
async function openPip() {
  if (PIPW) return;
  if (window.documentPictureInPicture) {
    try {
      const pw = await documentPictureInPicture.requestWindow({ width: 520, height: 320 });
      for (const ss of [...document.styleSheets]) {
        try { const st = pw.document.createElement('style'); st.textContent = [...ss.cssRules].map((r) => r.cssText).join('\n'); pw.document.head.appendChild(st); }
        catch { if (ss.href) { const l = pw.document.createElement('link'); l.rel = 'stylesheet'; l.href = ss.href; pw.document.head.appendChild(l); } }
      }
      pw.document.body.className = document.body.className + ' inpip';
      pw.document.body.style.cssText = 'margin:0;overflow:hidden;background:#000';
      const home = { next: canvas.nextSibling };
      PIPW = pw; pw.document.body.append(canvas, $('autobadge'));
      pw.addEventListener('resize', resize);
      pw.addEventListener('pagehide', () => { PIPW = null; document.body.insertBefore(canvas, home.next); const ab = pw.document.getElementById('autobadge'); if (ab) document.body.appendChild(ab); resize(); requestAnimationFrame(frame); syncAutoBadge(); });
      resize(); syncAutoBadge(); // the running loop moves itself to the PiP window on its next frame
      return;
    } catch (e) { console.warn('pip', e); }
  }
  try { // fallback: the canvas as a video (view only)
    const v = document.createElement('video'); v.muted = true; v.srcObject = canvas.captureStream(15); await v.play(); await v.requestPictureInPicture();
  } catch { notice({ kind: 'err', text: 'Trình duyệt này không hỗ trợ thu nhỏ (PiP). Dùng Chrome hoặc Edge bản mới' }); }
}
function syncAutoBadge() {
  let b = $('autobadge') ?? PIPW?.document.getElementById('autobadge'); const on = S.alive && S.room?.mode === 'endless' && !!S.me?.cfg?.farm;
  if (!b && on) { b = document.createElement('div'); b.id = 'autobadge'; b.onclick = (e) => { if (e.target.closest('.ab-pip')) return openPip(); if (!e.target.closest('.ab-stop')) return; const c = { ...autoCfg(), farm: false }; S.me.cfg = c; send({ t: 'auto-cfg', ...c }); syncAutoBadge(); }; document.body.appendChild(b); }
  if (b) { b.classList.toggle('hidden', !on); if (on) {
      const n = Object.values(S.me?.counts ?? {}).reduce((x, y) => x + y, 0), h = S.byId?.get(S.me?.hero), hp = h ? Math.round((h.hp / h.maxHp) * 100) : 100;
      // one clean pill: status · army · hero HP · stop (the long details only on big screens)
      // three corners: status (top left) · army (bottom left) · stop (bottom right)
      const t = `<div class="ab-c ab-c1"><span class="ab-dot"></span><span class="ab-t">Treo máy</span><span class="ab-long">bãi ${S.me.cfg.lvMin ?? 1}–${S.me.cfg.lv}${S.me.cfg.home ? ` · về khi &lt; ${S.me.cfg.home} lính` : ''}</span></div>`
        + `<div class="ab-c ab-c2"><span class="ab-n"><b>${n}</b> quân</span><span class="ab-hp" title="Máu tướng"><i style="width:${hp}%"></i></span></div>`
        + `<button class="ab-c ab-c3 ab-stop">⏹ Tắt treo máy</button>`
        + (PIPW ? '' : `<button class="ab-c ab-c4 ab-pip" title="Thu nhỏ game thành cửa sổ luôn nổi trên cùng">📺 Thu nhỏ</button>`);
      if (b.dataset.t !== t) { b.dataset.t = t; b.innerHTML = t; }
    } }
  // 13/11/2026: AFK mode hides every button; only the army bar and the "Tắt treo máy" badge stay
  if (PIPW) { PIPW.document.body.classList.toggle('afk', on); if (!on) PIPW.close(); }
  if (document.body.classList.contains('afk') !== on) {
    document.body.classList.toggle('afk', on);
    if (on) { for (const id of ['invpanel', 'info', 'rankpanel', 'm-drawer']) $(id)?.classList.add('hidden'); document.querySelectorAll('.modal, .thup, .qmodal').forEach((m) => m.classList.add('hidden')); S.sel = null; }
  }
}
/** sound settings (client/audio.js) */
function soundHtml() {
  return `<div class="glowset"><div class="gs-h">Âm thanh</div><div class="sgrid">
    <span>Tắt tiếng</span><label class="sw"><input type="checkbox" id="sndoff" ${soundMuted() ? 'checked' : ''}><i></i></label>
    <span>Âm lượng</span><span class="svol"><input type="range" id="sndvol" min="0" max="100" step="5" value="${Math.round(soundVolume() * 100)}"><b id="sndval">${Math.round(soundVolume() * 100)}%</b></span>
  </div></div>`;
}
function wireSound() {
  if ($('sndoff')) $('sndoff').onchange = () => setMuted($('sndoff').checked);
  if ($('sndvol')) $('sndvol').oninput = () => { setVolume($('sndvol').value / 100); $('sndval').textContent = `${$('sndvol').value}%`; };
}
function renderKeys() {
  $('keysbody').innerHTML = autoHtml() + soundHtml() + (S.room?.mode ? glowHtml() : '') + `<div class="kgrid">${Object.entries(KEY_ACTS).map(([id, a]) => `<span>${a.name}</span><button class="kbtn ${keyWait === id ? 'wait' : ''} ${keyOf(id) !== a.def ? 'chg' : ''}" data-k="${id}">${keyWait === id ? 'Bấm phím…' : keyName(keyOf(id))}</button>`).join('')}</div>
    <div class="kfoot"><small>Bấm vào ô rồi nhấn phím mới · Esc: hủy · Delete: bỏ phím. Trùng phím thì hai nút đổi chỗ cho nhau. Không dùng được: Tab, Enter, Esc, phím số, phím mũi tên.</small><button id="kreset">↺ Mặc định</button></div>`;
  $('keysbody').querySelectorAll('.kbtn').forEach((b) => (b.onclick = () => { keyWait = keyWait === b.dataset.k ? null : b.dataset.k; renderKeys(); }));
  $('kreset').onclick = () => { keyMap = {}; keyWait = null; saveKeys(); renderKeys(); };
  wireGlow(); wireSound(); wireAuto();
}
// capture the next key for the action being rebound (runs before the game's own handler)
addEventListener('keydown', (e) => {
  if (!keyWait || $('keysdlg').classList.contains('hidden')) return;
  e.preventDefault(); e.stopImmediatePropagation();
  const k = e.key ?? '';
  if (k === 'Escape') { keyWait = null; return renderKeys(); }
  if (k === 'Delete' || k === 'Backspace') { keyMap[keyWait] = ''; keyWait = null; saveKeys(); return renderKeys(); }
  if (KEY_FIXED.test(k)) return notice({ kind: 'err', text: `Phím ${keyName(k)} đã dành cho việc khác, chọn phím khác` });
  const n = normKey(k), old = keyOf(keyWait);
  for (const id of Object.keys(KEY_ACTS)) if (id !== keyWait && keyOf(id) === n) keyMap[id] = old; // swap with whoever had it
  keyMap[keyWait] = n; keyWait = null; saveKeys(); renderKeys();
}, true);
addEventListener('keydown', (e) => {
  if (document.activeElement?.id === 'advin') { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('advsend').click(); } else if (e.key === 'Escape') document.activeElement.blur(); return; } // Trợ lý AI input
  if (hellState.on) { hellKey(e, true); return; } // Địa Ngục keys
  if (document.activeElement === $('cpin')) {
    if (e.key === 'Enter') submitPanelChat();
    if (e.key === 'Escape') $('cpin').blur();
    if (e.key === 'Tab') { e.preventDefault(); setChatCh(chatCh === 'all' ? 'party' : 'all'); }
    return;
  }
  if (document.activeElement === $('chatin')) {
    if (e.key === 'Enter') submitChat();
    if (e.key === 'Escape') closeChat();
    return;
  }
  if ([ $('nameinput'), $('pwinput'), $('inviteinput'), $('roomname') ].includes(document.activeElement)) return;
  if (!S.joined) return;
  const k = e.key ?? '';
  if (k === 'Tab') { e.preventDefault(); $('board').classList.remove('hidden'); renderBoard(); return; }
  if (!$('pick').classList.contains('hidden')) { if (k === 'Enter' && !$('gobtn').disabled) go(); return; }
  if (k === 'Enter') { openChat(); e.preventDefault(); return; }
  const act = keyAction(k);
  if (act && KEY_ACTS[act].move) { e.preventDefault(); if (!e.repeat) { wasdDown.add(act); wasdUpdate(); } return; }
  if (act) { e.preventDefault(); KEY_ACTS[act].run(); }
  if (act) {}
  else if (k === 'Escape' && S.build) cancelBuild();
  else if (k === 'Escape' && !escAnyOpen()) openKeys(); // 14/11/2026: Esc with nothing open = Cài đặt; otherwise it closes everything
  else if (k === 'Escape') { for (const id of ['needdlg', 'forgedlg', 'queendlg', 'kingdlg', 'pinfodlg']) { const d = document.getElementById(id); if (d && !d.classList.contains('hidden')) { if (id === 'needdlg' || id === 'forgedlg') d.remove(); else d.classList.add('hidden'); } } $('keysdlg').classList.add('hidden'); $('dlogdlg').classList.add('hidden'); $('questdlg').classList.add('hidden'); $('craftdlg').classList.add('hidden'); S.mineMove = null; $('campdlg').classList.add('hidden'); $('castledlg').classList.add('hidden'); $('checkin').classList.add('hidden'); $('help').classList.add('hidden'); $('heroswap').classList.add('hidden'); closeMobileDrawer(); S.targeting = false; S.skillAim = null; S.sel = null; renderInfo(true); $('shop').classList.add('hidden'); $('rankpanel').classList.add('hidden'); $('invpanel').classList.add('hidden'); renderRank(); $('minimap-wrap').classList.remove('big'); }
  else if (/^[0-9]$/.test(k) && !$('shop').classList.contains('hidden')) { const n = k === '0' ? 10 : +k; const type = Object.keys(UNITS).find((t) => UNITS[t].n === n); if (type) buy(type, e.shiftKey ? 5 : buyMult); }
  else if (k.startsWith('Arrow')) { keys[k] = true; cam.follow = false; }
});
const keys = {};
addEventListener('keyup', (e) => { if (hellState.on) hellKey(e, false); if (!e.key) return; { const a = keyAction(e.key); if (a && KEY_ACTS[a].move && wasdDown.delete(a)) wasdUpdate(); } if (e.key === 'Tab') $('board').classList.add('hidden'); keys[e.key] = false; });
addEventListener('blur', () => { ldown = null; drag = null; wasdDown.clear(); joy.kb = false; endJoy(); $('board').classList.add('hidden'); for (const k in keys) keys[k] = false; });
document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => $(b.dataset.close).classList.add('hidden')));
document.querySelectorAll('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) { m.classList.add('hidden'); if (m.id === 'shop') document.querySelector('.rb.shop')?.classList.remove('on'); } }));
$('skillbtn').onclick = () => useSkill();
$('modebtn').onclick = () => send({ t: 'mode' });
// ---- change the main character in place
function openSwap() {
  if (!S.alive) return;
  const me = S.me, block = me?.combat ? 'Đang giao tranh, chưa đổi được' : me?.hc ? `Đổi lại sau ${me.hc} giây` : '';
  $('swaphint').textContent = block || 'Giữ nguyên quân, mỏ, tài nguyên và trang bị. Máu giữ đúng tỉ lệ %. Mỗi lần đổi cách nhau 2 phút.';
  $('swaphint').style.color = block ? '#ff8a6a' : '';
  const box = $('swapcards'); box.innerHTML = '';
  for (const id of HERO_ORDER) {
    const h = HEROES[id], cur = id === S.heroType;
    const c = document.createElement('div');
    c.className = 'hcard' + (cur ? ' cur' : block ? ' off' : '');
    c.innerHTML = `<div class="hsp"></div><div class="hn">${h.name}</div><div class="ht">${h.title} <span class="stars">${'★'.repeat(h.stars)}${'☆'.repeat(3 - h.stars)}</span></div><p><b>Nội tại.</b> ${h.passive}</p><p><b>Q: ${h.skill.name}.</b> ${h.skill.desc}</p>`;
    c.querySelector('.hsp').appendChild(th(id, 1.4));
    if (!cur && !block) c.onclick = () => { send({ t: 'changehero', hero: id }); S.heroType = id; $('heroswap').classList.add('hidden'); lastHs = ''; };
    box.appendChild(c);
  }
  $('heroswap').classList.remove('hidden');
}
$('swapbtn').onclick = openSwap;
const pullBack = () => {
  if (!S.alive) return;
  send({ t: 'pullback' }); S.pullUntil = now() + 4;
  const b = $('pullbtn'); b.classList.add('on'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('on'), 4000);
};
$('pullbtn').onclick = pullBack;
// 16/11/2026: "Đánh" (A): the closest monster / boss / guard to the hero (never a player or a base: that stays a click)
const IS_STRUCT = new Set(B_TYPES);
function attackNearest() {
  if (!S.alive) return;
  const h = S.byId.get(S.me?.hero); if (!h) return;
  let best = null, bd = 22;
  for (const u of S.view ?? []) {
    if (u.act === 5 || u.owner || IS_STRUCT.has(u.type) || HOME_HEROES[u.type] || u.flags & 128) continue;
    if (!GUARDS[u.type] && !BOSSES[u.type]) continue;
    const d = Math.hypot(u.x - h.x, u.y - h.y); if (d < bd) { bd = d; best = u; }
  }
  if (!best) return notice({ kind: 'err', text: 'Không có quái nào gần tướng' });
  send({ t: 'chase', id: best.id });
  S.marks?.push({ x: best.x, y: best.y, c: '#ff4a4a', t0: now() });
  const b = $('atkbtn'); if (b) { b.classList.add('on'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('on'), 1500); }
}
$('atkbtn').onclick = attackNearest;
const regroup = () => {
  if (!S.alive || now() < (S.regroupUntil ?? 0)) return;
  send({ t: 'regroup' }); S.regroupUntil = now() + 15;
  const b = $('regroupbtn'); b.disabled = true; clearTimeout(b._t); b._t = setTimeout(() => (b.disabled = false), 15000);
};
$('regroupbtn').onclick = regroup;
document.addEventListener('click', (e) => { if (e.target.closest?.('#resbar .fixall')) showRepairAll(send); });
const recall = () => { if (S.alive) send({ t: 'recall' }); };
$('recallbtn').onclick = recall;
$('callbtn').onclick = () => { const c = castleCallState(); if (c && !c.left) send({ t: 'castle-call' }); };
// the stow button: cất tất cả ↔ xuất binh (14/11/2026: no more 40 % step)
const HOLD_LBL = ['Cất binh', 'Cất 40%', 'Cất tất cả', 'Xuất binh'];
const holdStep = (me) => (me.hold ? 3 : S.myBase ? 2 : 0);
$('holdbtn').onclick = () => send({ t: 'hold' });
function centerHero() { const h = S.byId.get(S.me?.hero); if (h) { cam.x = h.x * T - W / cam.z / 2; cam.y = h.y * T - H / cam.z / 2; } }
function pinHeroCam() {
  const h = S.byId.get(S.me?.hero) ?? (S.alive ? S.lastHero : null);
  if (!h) return false;
  cam.x = h.x * T - W / cam.z / 2;
  cam.y = h.y * T - H / cam.z / 2;
  cam.vx = cam.vy = 0; cam.follow = true;
  return true;
}
bindTap($('portrait'), () => { setFreeCam(false); centerHero(); cam.follow = true; });
/** mobile: the camera left the hero (map dragged); the "Về tướng" button shows until it comes back */
function setFreeCam(on) { S.freeCam = on; if (on) cam.follow = false; $('m-recenter')?.classList.toggle('hidden', !on); }
bindTap($('m-recenter'), () => { setFreeCam(false); pinHeroCam(); });
bindTap($('m-ctxok'), () => confirmMobileBuild());
bindTap($('m-ctxcancel'), () => { if (S.build) cancelBuild(); S.targeting = false; S.skillAim = null; updateMobileCtx(); });
function updateMobileCtx() {
  const bar = $('m-ctxbar');
  if (!S.mobile || !S.joined || !S.me) { bar.classList.add('hidden'); return; }
  if (S.build) {
    $('m-ctxtxt').textContent = S.build.mode === 'move' ? 'Dời' : B_NAME(S.build.type);
    $('m-ctxok').classList.remove('hidden'); bar.classList.remove('hidden');
  } else if (S.targeting) {
    $('m-ctxtxt').textContent = 'Chạm vị trí';
    $('m-ctxok').classList.add('hidden'); bar.classList.remove('hidden');
  } else bar.classList.add('hidden');
}

// ================================================================= mobile joystick & Liên Quân 5-button pad
const joyWrap = $('joy-wrap'), joyBase = $('joy-base'), joyKnob = $('joy-knob'), joyGlow = $('joy-glow');
const joy = { active: false, id: null, mouse: false, dx: 0, dy: 0, mag: 0, angle: 0, sentAngle: null, nextKeepAt: 0 };
const joyPicked = new Map();
let lastJoyCmdAt = 0, joySendTimer = null, joyStopTimer = null;
function flushJoyMove() {
  if (hellState.on) return;
  joySendTimer = null; clearTimeout(joyStopTimer); joyStopTimer = null;
  if (!joy.active || joy.mag <= 0.16 || !S.alive || !S.me) return;
  const h = S.byId.get(S.me.hero) ?? S.lastHero; if (!h) return;
  const dist = 3.8 + joy.mag * 1.5 + Math.random() * 0.4;
  const tx = Math.max(1, Math.min((S.W || 200) - 1, h.x + joy.dx * dist));
  const ty = Math.max(1, Math.min((S.H || 200) - 1, h.y + joy.dy * dist));
  send({ t: 'move', x: +tx.toFixed(2), y: +ty.toFixed(2) });
  lastJoyCmdAt = performance.now();
  joy.sentAngle = joy.angle;
  joy.nextKeepAt = lastJoyCmdAt + 620 + Math.random() * 320;
}
function requestJoyMove(keepalive) {
  if (hellState.on) return; // Địa Ngục: the hell client reads S.joy instead
  clearTimeout(joyStopTimer); joyStopTimer = null;
  if (!S.alive || !S.me || joy.mag <= 0.16) return;
  const diff = joy.sentAngle == null ? 99 : Math.abs(Math.atan2(Math.sin(joy.angle - joy.sentAngle), Math.cos(joy.angle - joy.sentAngle)));
  if (!keepalive && joy.sentAngle != null && diff < 0.24) return;
  const wait = (195 + Math.random() * 45) - (performance.now() - lastJoyCmdAt);
  if (wait > 0) {
    if (!joySendTimer) joySendTimer = setTimeout(flushJoyMove, wait);
    return;
  }
  flushJoyMove();
}
function updateJoyFromPoint(cx0, cy0) {
  const r = joyBase.getBoundingClientRect(), scale = r.width / (joyBase.offsetWidth || 118) || 1;
  const rawX = (cx0 - (r.left + r.width / 2)) / scale, rawY = (cy0 - (r.top + r.height / 2)) / scale;
  const maxLocal = 43, rawDist = Math.hypot(rawX, rawY), clamped = Math.min(maxLocal, rawDist);
  const ang = rawDist > 0.5 ? Math.atan2(rawY, rawX) : joy.angle;
  joyKnob.style.transform = `translate3d(${(Math.cos(ang) * clamped).toFixed(1)}px, ${(Math.sin(ang) * clamped).toFixed(1)}px, 0)`;
  const mag = clamped / maxLocal;
  if (mag > 0.16) {
    joy.dx = Math.cos(ang); joy.dy = Math.sin(ang); joy.mag = mag; joy.angle = ang;
    S.joy = hellState.on ? { x: joy.dx, y: joy.dy } : null;
    joyGlow.style.transform = `rotate(${((ang * 180) / Math.PI + 90).toFixed(1)}deg)`;
    joyWrap.classList.add('active');
    S.joyActive = true; cam.follow = true;
    requestJoyMove(false);
  } else {
    joy.mag = 0; joyWrap.classList.remove('active'); S.joy = null;
    if (joy.sentAngle !== null && !joyStopTimer && S.alive) {
      clearTimeout(joySendTimer); joySendTimer = null;
      const wait = Math.max(0, (180 + Math.random() * 35) - (performance.now() - lastJoyCmdAt));
      joyStopTimer = setTimeout(() => { joyStopTimer = null; if (joy.active && joy.mag <= 0.16 && S.alive) { joy.sentAngle = null; lastJoyCmdAt = performance.now(); send({ t: 'stop' }); } }, wait);
    }
  }
}
function endJoy(stopHero = true) {
  clearTimeout(joySendTimer); joySendTimer = null;
  const wasMoving = joy.active && joy.sentAngle !== null;
  joy.active = false; joy.id = null; joy.mouse = false; joy.mag = 0; joy.sentAngle = null; S.joy = null;
  S.joyActive = false;
  joyWrap.classList.remove('active');
  joyKnob.style.transform = '';
  if (stopHero && wasMoving && S.alive) {
    clearTimeout(joyStopTimer);
    const wait = Math.max(0, (175 + Math.random() * 35) - (performance.now() - lastJoyCmdAt));
    joyStopTimer = setTimeout(() => { joyStopTimer = null; if (!joy.active && S.alive) { lastJoyCmdAt = performance.now(); send({ t: 'stop' }); } }, wait);
  }
}
// WASD: held keys steer the same way as the touch joystick (move orders a few tiles ahead, re-aimed when the keys change)
const wasdDown = new Set();
function wasdUpdate() {
  if (joy.active && !joy.kb) return; // the touch / mouse joystick is in use
  let x = 0, y = 0;
  for (const id of wasdDown) { x += KEY_ACTS[id].move[0]; y += KEY_ACTS[id].move[1]; }
  if (!x && !y) { if (joy.kb) { joy.kb = false; endJoy(true); } return; }
  const a = Math.atan2(y, x);
  Object.assign(joy, { active: true, kb: true, mouse: false, dx: Math.cos(a), dy: Math.sin(a), mag: 1, angle: a });
  S.joyActive = true; cam.follow = true;
  requestJoyMove(false);
}
function tickJoy() {
  if (!joy.active || joy.mag <= 0.16 || !S.alive || !S.me) return;
  const nowMs = performance.now();
  if (nowMs >= joy.nextKeepAt) flushJoyMove();
  const h = S.byId.get(S.me.hero);
  if (h && (S.inv.bag?.length ?? 0) < BAG_SIZE && nowMs - lastJoyCmdAt >= 210) {
    for (const g of S.items) {
      if ((g.owner && g.owner !== S.you) || Math.hypot(g.x - h.x, g.y - h.y) > 1.55) continue;
      if (nowMs - (joyPicked.get(g.id) ?? 0) < 2000) continue;
      joyPicked.set(g.id, nowMs); lastJoyCmdAt = nowMs; send({ t: 'pickup', id: g.id }); break;
    }
  }
}
joyWrap.addEventListener('touchstart', (e) => {
  e.preventDefault(); e.stopPropagation();
  if (joy.active) return;
  const t = e.changedTouches[0]; if (!t) return;
  joy.active = true; joy.id = t.identifier; joy.mouse = false; clearTimeout(joyStopTimer);
  updateJoyFromPoint(t.clientX, t.clientY);
}, { passive: false });
joyWrap.addEventListener('touchmove', (e) => {
  e.preventDefault();
  for (const t of e.changedTouches) if (t.identifier === joy.id) updateJoyFromPoint(t.clientX, t.clientY);
}, { passive: false });
const onJoyTouchEnd = (e) => { for (const t of e.changedTouches) if (t.identifier === joy.id) { e.preventDefault(); endJoy(true); } };
joyWrap.addEventListener('touchend', onJoyTouchEnd, { passive: false });
joyWrap.addEventListener('touchcancel', onJoyTouchEnd, { passive: false });
joyWrap.addEventListener('mousedown', (e) => {
  if (performance.now() - lastCanvasTouch < 500 || e.button !== 0) return;
  e.preventDefault(); e.stopPropagation();
  joy.active = true; joy.mouse = true; clearTimeout(joyStopTimer);
  updateJoyFromPoint(e.clientX, e.clientY);
});
addEventListener('mousemove', (e) => { if (joy.active && joy.mouse) updateJoyFromPoint(e.clientX, e.clientY); });
addEventListener('mouseup', () => { if (joy.active && joy.mouse) endJoy(true); });

// ---- Bottom-right 5-button cluster (1 main hero skill + 4 army controls around it)
$('m-hold-ic').innerHTML = px('act-hold', 22);
$('m-pull-ic').innerHTML = px('act-pull', 22);
$('m-regroup-ic').innerHTML = px('act-regroup', 22);
$('m-mode-ic').innerHTML = px('act-mode', 22);
bindTap($('m-hold'), () => send({ t: 'hold' }));
bindTap($('m-pull'), () => pullBack());
bindTap($('m-regroup'), () => regroup());
bindTap($('m-mode'), () => send({ t: 'mode' }));

let mSkillHero = '', skillTouch = null, skillTapTs = 0;
const mSkillBtn = $('m-skill');
mSkillBtn.addEventListener('touchstart', (e) => {
  e.preventDefault(); e.stopPropagation();
  skillTapTs = performance.now();
  if (!S.me || S.me.cd > 0 || !S.alive) return;
  const hero = HEROES[S.heroType];
  if (!hero?.skill.target) { send({ t: 'skill' }); return; }
  const t = e.changedTouches[0]; if (!t) return;
  skillTouch = { id: t.identifier, sx: t.clientX, sy: t.clientY, dragged: false };
  const mh = S.byId.get(S.me.hero);
  if (mh) S.skillAim = { x: mh.x, y: mh.y };
}, { passive: false });
mSkillBtn.addEventListener('touchmove', (e) => {
  if (!skillTouch) return;
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier !== skillTouch.id) continue;
    const dx = t.clientX - skillTouch.sx, dy = t.clientY - skillTouch.sy, d = Math.hypot(dx, dy);
    if (d >= 10) skillTouch.dragged = true;
    const mh = S.byId.get(S.me?.hero); if (!mh) continue;
    if (d < 8) S.skillAim = { x: mh.x, y: mh.y };
    else {
      const k = Math.min(1, d / 62) * 8, ang = Math.atan2(dy, dx);
      S.skillAim = { x: Math.max(1, Math.min((S.W || 200) - 1, mh.x + Math.cos(ang) * k)), y: Math.max(1, Math.min((S.H || 200) - 1, mh.y + Math.sin(ang) * k)) };
    }
  }
}, { passive: false });
const endSkillTouch = (e) => {
  if (!skillTouch) return;
  for (const t of e.changedTouches) {
    if (t.identifier !== skillTouch.id) continue;
    e.preventDefault(); skillTapTs = performance.now();
    if (e.type === 'touchend') {
      if (skillTouch.dragged && S.skillAim) { send({ t: 'skill', x: +S.skillAim.x.toFixed(2), y: +S.skillAim.y.toFixed(2) }); S.skillAim = null; S.targeting = false; }
      else { S.skillAim = null; useSkill(); }
    } else S.skillAim = null;
    skillTouch = null;
  }
};
mSkillBtn.addEventListener('touchend', endSkillTouch, { passive: false });
mSkillBtn.addEventListener('touchcancel', endSkillTouch, { passive: false });
mSkillBtn.addEventListener('click', () => { if (performance.now() - skillTapTs < 500) return; useSkill(); });

function updateMobaPad(t) {
  const me = S.me;
  joyWrap.style.visibility = me ? '' : 'hidden';
  $('moba-pad').style.visibility = me ? '' : 'hidden';
  if (!me) { if (joy.active) endJoy(false); return; }
  const hero = HEROES[S.heroType];
  if (mSkillHero !== S.heroType) {
    mSkillHero = S.heroType;
    $('m-skill-ic').innerHTML = px('sk-' + S.heroType, 36) || px('sk-thach-lam', 36);
  }
  $('m-skill-lbl').textContent = hero?.skill.name ?? 'Kỹ năng';
  const cd = me.cd ?? 0, maxCd = hero?.skill.cd ?? 1;
  mSkillBtn.classList.toggle('cool', cd > 0);
  mSkillBtn.classList.toggle('active', (me.sk ?? 0) > 0 || S.targeting || !!S.skillAim);
  $('m-skill-sw').style.setProperty('--sw', cd > 0 ? `${Math.min(360, (cd / maxCd) * 360).toFixed(1)}deg` : '0deg');
  $('m-skill-cd').textContent = cd > 0 ? Math.ceil(cd) : '';

  $('m-hold').classList.toggle('on', !!me.hold);
  $('m-hold-lbl').textContent = ['Cất binh', 'Cất 40%', 'Cất hết', 'Xuất binh'][holdStep(me)];

  const pr = Math.max(0, (S.pullUntil ?? 0) - t);
  $('m-pull').classList.toggle('on', pr > 0);
  $('m-pull-sw').style.setProperty('--sw', pr > 0 ? `${((pr / 4) * 360).toFixed(1)}deg` : '0deg');
  $('m-pull-cd').textContent = pr > 0 ? Math.ceil(pr) : '';

  const rr = Math.max(0, (S.regroupUntil ?? 0) - t);
  $('m-regroup').classList.toggle('cool', rr > 0);
  $('m-regroup-sw').style.setProperty('--sw', rr > 0 ? `${((rr / 15) * 360).toFixed(1)}deg` : '0deg');
  $('m-regroup-cd').textContent = rr > 0 ? Math.ceil(rr) : '';

  const byType = me.mode === 'type';
  $('m-mode').classList.toggle('on', byType);
  $('m-mode-lbl').textContent = byType ? 'Binh chủng' : 'Thứ tự mua';
}

// ================================================================= minimap
const mm = $('minimap'), mctx = mm.getContext('2d');
let mmImg = null;
async function mmLoad() { mmImg = new Image(); mmImg.src = `/assets/map/${S.seed}/minimap.png?v=${S.av ?? ''}`; await new Promise((r) => (mmImg.onload = r)); }
const mmPos = (e) => { const r = mm.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * S.W, y: ((e.clientY - r.top) / r.height) * S.H }; };
let mmDrag = false;
mm.addEventListener('mousedown', (e) => { if (performance.now() - lastCanvasTouch < 450) return; const p = mmPos(e); if (e.button === 0) { mmDrag = true; jumpTo(p.x, p.y); } if (e.button === 2 && S.alive) { send({ t: 'move', x: p.x, y: p.y }); S.marks.push({ x: p.x, y: p.y, c: '#3ee06b', t0: now() }); } });
mm.addEventListener('mousemove', (e) => { if (mmDrag) { const p = mmPos(e); jumpTo(p.x, p.y); } });
addEventListener('mouseup', () => (mmDrag = false));
mm.addEventListener('contextmenu', (e) => e.preventDefault());
mm.addEventListener('touchstart', (e) => {
  e.preventDefault(); e.stopPropagation(); lastCanvasTouch = performance.now();
  if (S.mobile && S.alive) { $('minimap-wrap').classList.toggle('big'); return; }
  if (e.touches[0]) { const p = mmPos(e.touches[0]); jumpTo(p.x, p.y); }
}, { passive: false });
mm.addEventListener('touchmove', (e) => {
  e.preventDefault(); e.stopPropagation(); lastCanvasTouch = performance.now();
  if (S.mobile && S.alive) return;
  if (e.touches[0]) { const p = mmPos(e.touches[0]); jumpTo(p.x, p.y); }
}, { passive: false });
const mmZ = document.createElement('canvas'), mmZctx = mmZ.getContext('2d');
let mmZimg = null;
const CAMP_COL = CAMP_COLORS;
const MCOL = { iron: '#9aa7b8', coal: '#7a8098', gold: '#f4c430', oil: '#c27b2e', tar: '#7b3fa0', crystal: '#d08cff', diamond: '#9ff3ff' };
// pixel skull for bosses on the minimap
const SKULL = ['.kkkkk.', 'kwwwwwk', 'kwkwkwk', 'kwwwwwk', '.kwkwk.', '.kkkkk.'];
// minimap boss marker (13/11/2026): a red pixel crown like the one sent by the owner. k outline, r red, d dark red, g gem
const CROWN = ['k....k....k', 'kk..kgk..kk', 'krk.kgk.krk', 'krrkkgkkrrk', 'krrrrgrrrrk', 'krrrrrrrrrk', 'kdddddddddk', 'kk.kk.kk.kk'];
function mmCrown(x, y, blue = false) { // blue: a boss coming back (respawning)
  CROWN.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const c = row[i]; if (c === '.') continue; mctx.fillStyle = c === 'k' ? (blue ? '#0a1a4a' : '#1b1726') : c === 'g' ? (blue ? '#9ae0ff' : '#ff9a9a') : c === 'd' ? (blue ? '#1450b0' : '#9a1424') : (blue ? '#2a9aff' : '#e8283c'); mctx.fillRect(Math.round(x) - 5 + i, Math.round(y) - 4 + j, 1, 1); } });
}
function mmSkull(x, y, c) {
  SKULL.forEach((row, j) => { for (let i = 0; i < row.length; i++) { if (row[i] === '.') continue; mctx.fillStyle = row[i] === 'k' ? '#1b1726' : c; mctx.fillRect(Math.round(x) - 3 + i, Math.round(y) - 3 + j, 1, 1); } });
}
function drawMinimap(t) {
  const k = mm.width / S.W;
  mctx.imageSmoothingEnabled = false;
  if (mmImg) mctx.drawImage(mmImg, 0, 0, mm.width, mm.height);
  // calm the terrain down so markers stand out
  mctx.fillStyle = 'rgba(16, 12, 28, 0.42)'; mctx.fillRect(0, 0, mm.width, mm.height);
  const M = S.match;
  if (M?.phase === 'run' && M.cur) {
    // pixel zone: 2×2 px blocks
    const n = mm.width / 2;
    if (mmZ.width !== n) { mmZ.width = mmZ.height = n; mmZimg = mmZctx.createImageData(n, n); }
    const d = mmZimg.data, kk = S.W / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = (i + 0.5) * kk, y = (j + 0.5) * kk, o = (j * n + i) * 4;
      const dz = Math.hypot(x - M.cur.x, y - M.cur.y), dn = M.next ? Math.hypot(x - M.next.x, y - M.next.y) : 1e9;
      let c = [0, 0, 0, 0];
      if (dz > M.cur.r) c = [40, 90, 220, 120];
      if (Math.abs(dz - M.cur.r) < kk * 0.7) c = [110, 170, 255, 255];
      if (M.next && Math.abs(dn - M.next.r) < kk * 0.6 && ((i + j) & 1)) c = [255, 255, 255, 255];
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = c[3];
    }
    mmZctx.putImageData(mmZimg, 0, 0);
    mctx.drawImage(mmZ, 0, 0, mm.width, mm.height);
  }
  // mines: neutral = small dim dot, yours = big square with a green frame, enemy = big square with a red frame
  for (const m of S.mines) {
    const x = Math.round(m.x * k), y = Math.round(m.y * k);
    if (!m.owner) { mctx.globalAlpha = 0.75; mctx.fillStyle = MCOL[m.type]; mctx.fillRect(x - 1, y - 1, 2, 2); mctx.globalAlpha = 1; continue; }
    const mine = m.owner === S.you;
    if (!mine) continue; // other players' mines are not shown on the minimap (13/11/2026: too cluttered)
    mctx.fillStyle = mine ? '#3EE06B' : '#FF4A4A'; mctx.fillRect(x - 3, y - 3, 7, 7);
    mctx.fillStyle = '#1b1726'; mctx.fillRect(x - 2, y - 2, 5, 5);
    mctx.fillStyle = MCOL[m.type]; mctx.fillRect(x - 1, y - 1, 3, 3);
    if (mine && m.capBy) { const r = 5 + ((t * 8) % 7); mctx.strokeStyle = '#ff4a4a'; mctx.lineWidth = 1; mctx.strokeRect(x - r, y - r, r * 2 + 1, r * 2 + 1); }
  }
  // monster camps: a small diamond in the colour of the loot they usually drop (grey when cleared)
  for (const c of S.camps ?? []) {
    const x = Math.round(c.x * k), y = Math.round(c.y * k);
    mctx.fillStyle = '#1b1726'; mctx.fillRect(x - 2, y - 1, 5, 3); mctx.fillRect(x - 1, y - 2, 3, 5);
    mctx.fillStyle = c.respawn ? '#555' : CAMP_COL[c.level]; mctx.fillRect(x - 1, y, 3, 1); mctx.fillRect(x, y - 1, 1, 3);
  }
  // the Northern King: a gold crown
  if (S.king) { const x = Math.round(S.king.x * k), y = Math.round(S.king.y * k); mctx.fillStyle = '#1b1726'; mctx.fillRect(x - 5, y - 4, 11, 8); mctx.fillStyle = '#ffd23a'; mctx.fillRect(x - 4, y - 1, 9, 4); mctx.fillRect(x - 4, y - 3, 1, 2); mctx.fillRect(x, y - 3, 1, 2); mctx.fillRect(x + 4, y - 3, 1, 2); }
  // the Desert Queen: a sand-coloured tent
  if (S.queen) { const x = Math.round(S.queen.x * k), y = Math.round(S.queen.y * k); mctx.fillStyle = '#1b1726'; mctx.fillRect(x - 5, y - 5, 11, 10); mctx.fillStyle = '#e8a040'; for (let i = 0; i < 4; i++) mctx.fillRect(x - i, y - 3 + i, 2 * i + 1, 1); mctx.fillStyle = '#c04a2a'; mctx.fillRect(x - 4, y + 1, 9, 3); }
  // the world event: a pulsing red / gold dot
  if (S.ev) { const x = Math.round(S.ev[1] * k), y = Math.round(S.ev[2] * k), on = Math.floor(performance.now() / 400) % 2; mctx.fillStyle = '#1b1726'; mctx.fillRect(x - 5, y - 5, 11, 11); mctx.fillStyle = S.ev[0] === 'chief' ? (on ? '#ff3a2a' : '#ff8a4a') : (on ? '#ffd23a' : '#fff2a0'); mctx.fillRect(x - 4, y - 4, 9, 9); }
  // bases: a castle square in the owner's colour (yours with a white frame)
  for (const b of S.bases ?? []) {
    const th = b.items.find((i) => i.type === 'thanh-tri'); if (!th) continue;
    const x = Math.round((th.tx + 1.5) * k), y = Math.round((th.ty + 1.5) * k), mine = b.key === myKey();
    mctx.fillStyle = mine ? '#ffffff' : '#1b1726'; mctx.fillRect(x - 4, y - 4, 9, 9);
    mctx.fillStyle = th.state === 'ruin' ? '#666' : b.color; mctx.fillRect(x - 3, y - 3, 7, 7);
    mctx.fillStyle = '#1b1726'; mctx.fillRect(x - 1, y, 3, 3);
  }
  // bosses
  S.bossHome ??= {}; for (const b of M?.bosses ?? []) S.bossHome[b[0]] = [b[3], b[4]];
  for (const [type, , rx, ry] of M?.respawn ?? []) { if (M.bosses?.some((b) => b[0] === type)) continue; const h = rx ? [rx, ry] : S.bossHome[type]; if (h) mmCrown(h[0] * k, h[1] * k, true); } // respawning: blue crown at its home
  for (const [, x, y] of M?.bosses ?? []) mmCrown(x * k, y * k);
  // heroes: others (only inside your vision while alive), you = blinking white diamond
  const myH = S.byId.get(S.me?.hero), vr = S.alive ? S.me?.vr : 0;
  for (const p of S.players.values()) {
    if (!p.alive || p.x == null || p.id === S.you) continue;
    if (vr && myH && Math.hypot(p.x - myH.x, p.y - myH.y) > vr) continue;
    const x = Math.round(p.x * k), y = Math.round(p.y * k);
    mctx.fillStyle = '#1b1726'; mctx.fillRect(x - 3, y - 3, 7, 7); mctx.fillStyle = p.color; mctx.fillRect(x - 2, y - 2, 5, 5);
  }
  const me = S.players.get(S.you);
  if (me?.alive && me.x != null) {
    const x = Math.round(me.x * k), y = Math.round(me.y * k), c = Math.floor(t * 3) % 2 ? '#ffffff' : '#ffe26a';
    mctx.fillStyle = '#1b1726'; for (let j = -5; j <= 5; j++) { const w = 5 - Math.abs(j); mctx.fillRect(x - w - 1, y + j, w * 2 + 3, 1); }
    mctx.fillStyle = c; for (let j = -4; j <= 4; j++) { const w = 4 - Math.abs(j); mctx.fillRect(x - w, y + j, w * 2 + 1, 1); }
  }
  // camera frame
  for (const pm of S.party?.members ?? []) if (pm.id !== S.you && pm.x != null) { const x = Math.round(pm.x * k), y = Math.round(pm.y * k); mctx.fillStyle = '#3ad8ff'; mctx.fillRect(x - 2, y - 2, 5, 5); mctx.strokeStyle = '#fff'; mctx.lineWidth = 1; mctx.strokeRect(x - 2.5, y - 2.5, 6, 6); }
  { const rv = revengeAt(); if (rv) { const x = Math.round(rv.x * k), y = Math.round(rv.y * k), r = 4 + ((t * 6) % 5); mctx.strokeStyle = '#ff3a3a'; mctx.lineWidth = 2; mctx.beginPath(); mctx.arc(x, y, r, 0, Math.PI * 2); mctx.stroke(); mctx.fillStyle = '#ff3a3a'; mctx.fillRect(x - 1, y - 1, 3, 3); } }
  mctx.strokeStyle = '#ffffffcc'; mctx.lineWidth = 1;
  mctx.strokeRect(Math.round((cam.x / T) * k) + 0.5, Math.round((cam.y / T) * k) + 0.5, Math.round((W / cam.z / T) * k), Math.round((H / cam.z / T) * k));
}

// ================================================================= HUD
const resEls = [];
$('resbar').innerHTML = RES.map((r) => `<div class="res" title="${RES_INFO[r].name}"><i class="ic" data-r="${r}" title="${RES_INFO[r].name}" style="--c:${RES_INFO[r].color}"></i><span class="v">0</span><small></small></div>`).join('') + '<div class="res bld hidden" title="Thợ xây rảnh / tổng số thợ xây"><span class="hm">🔨</span><span class="v">0/0</span></div><button class="res fixall hidden" title="Căn cứ bị phá: sửa tất cả công trình hỏng">🔧 <span class="v"></span></button><div class="mg"></div>';
for (const el of $('resbar').querySelectorAll('.res')) resEls.push(el);
// hover (tap on mobile) a resource: name, amount / storage, income (12/11/2026)
let resHover = -1, resTipT = 0, resAnchor = null;
const resTip = document.createElement('div'); resTip.id = 'restip'; resTip.className = 'hidden'; document.body.appendChild(resTip);
function showResTip() {
  const i = resHover, me = S.me, el = resAnchor ?? resEls[i];
  if (el?.classList.contains('bld') && i >= 0) return showBldTip(el);
  resTip.classList.remove('wide');
  if (i < 0 || i >= RES.length || !me || !el) { resTip.classList.add('hidden'); return; }
  const r = RES[i], v = me.res[i], cap = me.cap?.[i], full = cap && v >= cap, k = cap ? Math.min(100, (v / cap) * 100) : 0;
  const mine = S.mines.filter((m) => m.owner === S.you && m.type === r), byLv = {};
  for (const m of mine) byLv[m.lv ?? 1] = (byLv[m.lv ?? 1] ?? 0) + 1;
  // 13/11/2026: mines held per level; a click flies the camera to one of them, the next click to the next one
  const lvRows = mine.length && !resAnchor ? `<div class="rt-lvs">${Object.keys(byLv).sort((a, b) => b - a).map((lv) => `<button class="rt-lv" data-t="${r}" data-lv="${lv}" title="Bấm để tới mỏ, bấm tiếp để sang mỏ kế">Cấp ${lv} <b>×${byLv[lv]}</b></button>`).join('')}</div>` : '';
  const nm = mine.length, mcap = S.room?.mode === 'endless' && MINE_CAP[r] != null ? MINE_CAP[r] + (me.mx?.[r] ?? 0) : null;
  const key = `${i}|${v}|${cap}|${me.inc[i]}|${nm}|${mcap}|${JSON.stringify(byLv)}|${!!resAnchor}`;
  if (resTip.dataset.k !== key) {
    resTip.dataset.k = key;
    resTip.innerHTML = `<div class="rt-h"><i class="ic" data-r="${r}" style="--c:${RES_INFO[r].color}"></i><b>${RES_INFO[r].name}</b></div>
      <div class="rt-v">${v.toLocaleString('vi')}${cap ? ` <span>/ ${cap.toLocaleString('vi')}</span>` : ''}</div>
      ${cap ? `<div class="rt-bar${full ? ' full' : ''}"><i style="width:${k}%"></i></div><div class="rt-s">Sức chứa ${cap.toLocaleString('vi')}${full ? ' · <b>ĐẦY</b>: thu nhập dừng, tiêu bớt hoặc xây Kho / nâng Thành trì' : ` · còn trống ${(cap - v).toLocaleString('vi')}`}</div>` : '<div class="rt-s">Không giới hạn sức chứa (trận đấu)</div>'}
      <div class="rt-s">Thu nhập: <b>+${me.inc[i] ?? 0}</b> mỗi phút</div>
      <div class="rt-s">${RES_INFO[r].mine} đang chiếm: <b${mcap != null && nm >= mcap ? ' style="color:#ff8a6a"' : ''}>${nm}${mcap != null ? ` / ${mcap}` : ''}</b>${mcap != null ? `${me.mx?.[r] ? ` (đã mở thêm +${me.mx[r]})` : ''}${nm >= mcap ? ' · đầy: bỏ bớt mỏ hoặc mở thêm ở Nữ hoàng Sa mạc (phía Nam)' : ''}` : ''}</div>${lvRows}`;
  }
  const rc = el.getBoundingClientRect();
  resTip.style.left = Math.max(8, Math.min(window.innerWidth - 248, rc.left)) + 'px'; resTip.style.top = rc.bottom + 6 + 'px';
  resTip.classList.remove('hidden');
}
/** 🔨 on the top bar: every builder job with its progress bar */
function showBldTip(el) {
  const bc = builderCount(), jobs = builderJobs();
  const html = `<div class="rt-h">🔨 <b>Thợ xây ${bc ? `${bc.free}/${bc.total} rảnh` : ''}</b></div>`
    + (jobs.length ? jobs.map((j) => `<div class="bt-job"><div class="bt-n"><span>${j.icon} ${j.name}</span><b>${fmtLeft(j.left)}</b></div><div class="rt-bar"><i style="width:${(j.k * 100).toFixed(1)}%"></i></div></div>`).join('') : '<div class="rt-s">Không có việc nào · thợ đang rảnh</div>')
    + (bc && !bc.free ? '<div class="rt-s">Hết thợ rảnh: xây thêm Nhà thợ xây để làm nhiều việc cùng lúc</div>' : '');
  if (resTip.dataset.k !== html) { resTip.dataset.k = html; resTip.innerHTML = html; }
  const rc = el.getBoundingClientRect();
  resTip.style.left = Math.max(8, Math.min(window.innerWidth - 268, rc.left)) + 'px'; resTip.style.top = rc.bottom + 6 + 'px';
  resTip.classList.add('wide'); resTip.classList.remove('hidden');
}
// every resource icon in the game (prices, shop cards, dialogs) shows the same card on hover
document.addEventListener('mouseover', (e) => {
  const cell = e.target.closest?.('#resbar .res'), ic = cell ? null : e.target.closest?.('.ic[data-r]');
  const el = cell ?? ic; if (!el) return;
  const i = cell ? resEls.indexOf(cell) : RES.indexOf(ic.dataset.r); if (i < 0 || (i >= RES.length && !cell?.classList.contains('bld'))) return;
  el.removeAttribute('title'); resHover = i; resAnchor = cell ? null : ic; showResTip();
});
let resTipHideT = 0;
document.addEventListener('mouseout', (e) => {
  const el = e.target.closest?.('#resbar .res, .ic[data-r]'); if (!el || el.contains(e.relatedTarget)) return;
  if (resTip.contains(e.relatedTarget)) return;
  clearTimeout(resTipHideT); resTipHideT = setTimeout(() => { if (resTip.matches(':hover')) return; resHover = -1; resAnchor = null; showResTip(); }, 220); // time to reach the card
});
resTip.addEventListener('mouseleave', (e) => { if (e.relatedTarget?.closest?.('#resbar .res')) return; resHover = -1; resAnchor = null; showResTip(); });
resTip.addEventListener('click', (e) => {
  const b = e.target.closest('.rt-lv'); if (!b) return;
  const t = b.dataset.t, lv = +b.dataset.lv, list = S.mines.filter((m) => m.owner === S.you && m.type === t && (m.lv ?? 1) === lv).sort((a, c) => a.id - c.id);
  if (!list.length) return;
  S.mineCycle ??= {}; const k = t + lv, n = ((S.mineCycle[k] ?? -1) + 1) % list.length; S.mineCycle[k] = n;
  const m = list[n]; jumpTo(m.x, m.y); S.ping = { x: m.x, y: m.y, at: performance.now() };
  b.querySelector('b').textContent = `×${list.length} · ${n + 1}/${list.length}`;
});
resEls.slice(0, RES.length).forEach((el, i) => {
  el.addEventListener('click', () => { if (!S.mobile) return; resHover = resHover === i ? -1 : i; showResTip(); clearTimeout(resTipT); resTipT = setTimeout(() => { resHover = -1; showResTip(); }, 3000); });
});
const thumbCache = new Map();
const th = (type, s = 1, pose = 'idle', dir = 0) => { const k = `${type}|${s}|${pose}|${dir}`; if (!thumbCache.has(k)) thumbCache.set(k, thumb(type, pose, dir, s)); const c = thumbCache.get(k), o = document.createElement('canvas'); o.width = c.width; o.height = c.height; o.getContext('2d').drawImage(c, 0, 0); return o; };
let lastHud = '';
const mmss = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, Math.round(s)) % 60).padStart(2, '0')}`;
function renderMatchBar() {
  const M = S.match; if (!M) return;
  if (S.mode === 'endless') {
    const rs = (M.respawn ?? []).filter(([, s]) => s > 0).sort((a, b) => a[1] - b[1])[0];
    const h = `🌍 ${esc(S.room?.name ?? 'Thế giới mở')} · ${M.alive} đội · ${M.bosses?.length ?? 0}/5 boss${rs ? `<span class="zone">· ${BOSSES[rs[0]].name} hồi sinh sau ${mmss(rs[1])}</span>` : ''}`;
    if ($('matchbar').innerHTML !== h) $('matchbar').innerHTML = h;
    renderBossBar(); return;
  }
  let h = M.phase === 'lobby' ? `Ván #${M.n} · đang ở hàng chờ${M.startIn ? ` · bắt đầu sau ${M.startIn}s` : ''}` : `Ván #${M.n} · ${mmss(M.el)} / ${mmss(M.len)} · còn ${M.alive} đội`;
  if (M.phase === 'end') h = `Ván #${M.n} kết thúc · hàng chờ mở sau ${mmss(M.endIn)}`;
  else if (M.phase === 'run') {
    if (M.el < M.join) h += `<span class="join">· cổng mở ${mmss(M.join - M.el)}</span>`;
    if (M.zs === 'shrink') h += `<span class="zone shrink">· BO ĐANG THU HẸP ${mmss(M.zin)}</span>`;
    else if (M.zin) h += `<span class="zone">· bo thu hẹp sau ${mmss(M.zin)}</span>`;
    else if (M.zs === 'done') h += `<span class="zone shrink">· bo cuối</span>`;
  }
  if ($('matchbar').innerHTML !== h) $('matchbar').innerHTML = h;
  renderBossBar();
}
function renderBossBar() {
  // boss health bar: the boss nearest to the centre of the screen
  let best = null, bd = 1e9;
  const cx = (cam.x + W / cam.z / 2) / T, cy = (cam.y + H / cam.z / 2) / T;
  for (const u of S.view) if (BOSSES[u.type] && u.act !== 5) { const d = Math.hypot(u.x - cx, u.y - cy); if (d < bd && d < 22) { bd = d; best = u; } }
  $('bossbar').classList.toggle('hidden', !best);
  if (best) { $('bossbar').querySelector('b').textContent = BOSSES[best.type].name; $('bossbar').querySelector('i').style.width = `${(100 * best.hp) / best.maxHp}%`; $('bossbar').querySelector('span').textContent = `${Math.ceil(best.hp).toLocaleString('vi')} / ${best.maxHp.toLocaleString('vi')}`; }
}
let lastHs = '';
function renderHud() {
  renderMatchBar();
  const me = S.me;
  if (me && JSON.stringify(me.hs) !== lastHs) { lastHs = JSON.stringify(me.hs); renderInv(); }
  $('hud').classList.toggle('hidden', !S.joined);
  $('resbar').style.visibility = me ? '' : 'hidden';
  if (!me) { $('herobox').style.visibility = 'hidden'; $('armybox').style.visibility = 'hidden'; $('skillbox').style.visibility = 'hidden'; return; }
  $('herobox').style.visibility = ''; $('armybox').style.visibility = ''; $('skillbox').style.visibility = '';
  RES.forEach((r, i) => {
    const el = resEls[i];
    el.querySelector('.v').textContent = S.mobile ? shortNum(me.res[i]) : me.res[i].toLocaleString('vi'); // phones: 5,0tr (16/11/2026)
    const full = me.cap && me.res[i] >= me.cap[i];
    el.classList.toggle('full', !!full);
    el.removeAttribute('title'); el.querySelector('.ic')?.removeAttribute('title');
    el.querySelector('small').textContent = me.inc[i] ? `+${me.inc[i]}` : '';
    el.classList.toggle('zero', !me.res[i] && !me.inc[i]);
  });
  const nr = S.room?.mode === 'endless' ? myRuins().length : 0, fx = $('resbar').querySelector('.fixall');
  fx.classList.toggle('hidden', !nr); if (nr) fx.querySelector('.v').textContent = `Sửa ${nr}`;
  const bc = S.room?.mode === 'endless' ? builderCount() : null, be = $('resbar').querySelector('.bld');
  be.classList.toggle('hidden', !bc);
  if (bc) { be.querySelector('.v').textContent = `${bc.free}/${bc.total}`; be.classList.toggle('busy', !bc.free); be.title = `Thợ xây: ${bc.free} rảnh / ${bc.total} thợ${bc.free ? '' : ' · tất cả đang bận (xây, nâng cấp, sửa, dọn cây đá)'}`; }
  // "Về thành": blue bar with a countdown above the army bar (the ripple around the hero is in render.js)
  const rc = me.rc ?? 0, rb = $('recallbar');
  rb.classList.toggle('hidden', !rc);
  $('recallbtn').classList.toggle('hidden', !(S.room?.mode === 'endless' && S.myBase));
  document.querySelector('.rb.recall')?.classList.toggle('hidden', !(S.mobile && S.room?.mode === 'endless' && S.myBase));
  document.querySelector('.rb[data-rail="home"]')?.classList.toggle('hidden', S.room?.mode === 'endless'); // "Rời phòng" is for match rooms only
  $('recallbtn').classList.toggle('on', !!rc);
  syncCallBtn();
  if (rc) { rb.querySelector('.fill').style.width = `${Math.max(0, Math.min(100, (1 - rc / 8) * 100))}%`; rb.querySelector('span').textContent = `${rc.toFixed(1)}s`; }
  if (resHover >= 0) showResTip();
  $('resbar').querySelector('.mg').textContent = me.mg < 1 ? `quản lý ${Math.round(me.mg * 100)}%` : '';
  const h = S.byId.get(me.hero);
  if (h && HEROES[h.type] && h.type !== S.heroType) S.heroType = h.type; // the server decides (e.g. after a hero change)
  const hero = HEROES[S.heroType];
  if (h) {
    $('herohp').style.width = `${(100 * h.hp) / h.maxHp}%`;
    $('herohptext').textContent = `${Math.ceil(h.hp)} / ${h.maxHp}`;
  }
  $('heroname').textContent = S.mobile ? (S.account?.name ?? '') : `${hero?.name ?? ''} · ${hero?.title ?? ''}`; // mobile: just the player's name
  const life = `${Math.floor(me.life / 60)}:${String(me.life % 60).padStart(2, '0')}`;
  $('herosub').textContent = `Sống ${life} · ${me.score} điểm · ${me.mines} mỏ${me.shield ? ` · khiên ${me.shield}s` : ''}${me.combat ? ' · ⚔ giao chiến' : ''}`;
  if ($('portrait').dataset.h !== S.heroType) { $('portrait').dataset.h = S.heroType; $('portrait').replaceChildren(th(S.heroType, 1.2)); }
  // army
  const key = JSON.stringify(me.counts) + me.used + me.total + me.mode + me.hold + holdStep(me);
  if (key !== lastHud) {
    lastHud = key;
    const box = $('armylist'); box.innerHTML = '';
    for (const t of Object.keys(UNITS)) {
      if (!me.counts[t]) continue;
      const d = document.createElement('div'); d.className = 'army-it'; d.title = UNITS[t].name;
      d.appendChild(th(t, t === 'rong' ? 0.3 : UNITS[t].slots > 1 ? 0.4 : 0.6)); d.append(`×${me.counts[t]}`); box.appendChild(d);
    }
    if (!box.children.length) box.innerHTML = `<span style="color:#a89880">${S.mobile ? 'Chưa có quân · mở Shop mua' : 'Chưa có quân. Bấm B để mua.'}</span>`;
    $('slots').textContent = `${Object.values(me.counts).reduce((a, b) => a + b, 0)} quân`;
    $('modebtn').textContent = `${keyName(keyOf('mode'))} · ${me.mode === 'buy' ? 'Xếp theo thứ tự mua' : 'Xếp theo binh chủng'}`;
    { $('holdbtn').textContent = `${keyName(keyOf('hold'))} · ${HOLD_LBL[holdStep(me)]}`; } $('holdbtn').classList.toggle('on', !!me.hold);
  }
  // skill
  if (hero) {
    $('skillname').textContent = hero.skill.name + (me.cd > 0 ? ` ${Math.ceil(me.cd)}s` : '');
    $('skillbtn').classList.toggle('cool', me.cd > 0);
    $('skillbtn').classList.toggle('active', me.sk > 0 || S.targeting);
    $('skillcd').style.width = me.cd > 0 ? `${100 - (100 * me.cd) / hero.skill.cd}%` : '100%';
  }
  // queue
  const q = $('queuebox'); q.innerHTML = '';
  for (const [type, rem, total] of me.q) {
    const d = document.createElement('div'); d.className = 'q-it';
    d.appendChild(th(type, 0.4)); const b = document.createElement('div'); b.className = 'qb'; b.innerHTML = `<i style="width:${100 - (100 * rem) / total}%"></i>`; d.appendChild(b);
    q.appendChild(d);
  }
  if (!$('shop').classList.contains('hidden')) renderShop();
  if (!$('castledlg').classList.contains('hidden')) renderCastleDlg();
  if (!$('campdlg').classList.contains('hidden')) renderCampDlg();
  if (!$('craftdlg').classList.contains('hidden') && craft.mode === 'forge') renderCraft(); // costs vs resources
}

// ---------------- right rail (Ant War style) + mobile Open drawer + rankings panel
const RAIL = [
  { id: 'rank', icon: 'trophy', short: 'BXH', title: 'Bảng xếp hạng: quân số, công trình đang chiếm', cls: 'rank', click: () => toggleRank() },
  { id: 'shop', icon: 'chest', short: 'Shop', title: 'Cửa hàng quân (B)', cls: 'shop', click: () => toggleShop() },
  { id: 'inv', icon: 'bag', short: 'Trang bị', title: 'Trang bị và túi đồ (I)', cls: 'inv', click: () => toggleInv() },
  { id: 'quest', icon: 'scroll', short: 'Nhiệm vụ', title: 'Nhiệm vụ hằng ngày và Thành tựu (Thế giới mở)', cls: 'quest', click: () => openQuest() },
  { id: 'checkin', icon: 'cal', short: 'Điểm danh', title: 'Điểm danh hằng ngày (ngày 7: trang bị cam)', cls: 'cal', click: () => openCheckin() },
  { id: 'recall', icon: 'house', short: 'Về thành', title: 'Về thành: 8 giây sau tướng và cả đội về Thành trì', cls: 'recall', click: () => recall() },
  { id: 'keys', icon: 'menu', short: 'Cài đặt', title: 'Cài đặt: màu viền đội và phím tắt', cls: 'rank', click: () => openKeys() },
  { id: 'help', icon: 'help', short: 'Hướng dẫn', title: 'Hướng dẫn chơi', cls: 'rank', click: () => openHelp() },
  { id: 'forfeit', icon: 'flag', short: 'Rời trận', title: 'Rời trận: Thế giới mở = về trang chủ, giữ nguyên quân, đồ, mỏ (như offline); ván đấu = bỏ ván, rơi hết đồ', cls: 'leave', click: () => forfeit() },
  { id: 'home', icon: 'house', short: 'Rời phòng', title: 'Rời phòng, về trang chủ', cls: '', click: () => leaveRoom() },
];
$('rail').innerHTML = RAIL.map((r) => `<button class="rb ${r.cls}" data-rail="${r.id}" title="${r.title}">${px(r.icon, 28)}<span class="rs">${r.short}</span></button>`).join('');
bindTap($('rail'), (e) => { const b = e.target.closest('[data-rail]'); if (!b) return; RAIL.find((r) => r.id === b.dataset.rail)?.click(); if (S.mobile && b.dataset.rail !== 'more') closeMobileDrawer(); });

function compactResHtml(me) {
  if (!me) return '';
  const items = RES.map((r, i) => {
    const v = me.res[i], full = me.cap && v >= me.cap[i], zero = !v && !me.inc[i];
    return `<span class="mr${full ? ' full' : ''}${zero ? ' zero' : ''}"><i class="ic" data-r="${r}" style="--c:${RES_INFO[r].color}"></i>${v.toLocaleString('vi')}</span>`;
  });
  const bc = S.room?.mode === 'endless' ? builderCount() : null;
  if (bc) items.push(`<span class="mr${!bc.free ? ' full' : ''}">🔨${bc.free}/${bc.total}</span>`);
  const army = Object.values(me.counts ?? {}).reduce((a, b) => a + b, 0);
  items.push(`<span class="mr">⚔${army}</span>`);
  return items.join('');
}
let drawerGridKey = '';
function syncOpenBtnDot() {
  const b = $('m-openbtn'), d = $('m-drawer');
  if (!b || !d) return;
  // mobile: ☰ shows / hides the shortcut icons (the top resource bar hides while they are out)
  const open = document.body.classList.contains('menu-open');
  const html = open ? '✕' : '☰';
  if (b.dataset.h !== html) { b.dataset.h = html; b.innerHTML = html; }
  b.classList.toggle('on', open);
  b.classList.toggle('dot', !open && !!(S.hasNewInv || (S.ci && !S.ci.today)));
}
function closeMobileDrawer() {
  const d = $('m-drawer');
  if (d && !d.classList.contains('hidden')) d.classList.add('hidden');
  if (document.body.classList.contains('menu-open')) { document.body.classList.remove('menu-open'); syncOpenBtnDot(); }
}
function renderMobileDrawer() {
  const d = $('m-drawer');
  if (!d || d.classList.contains('hidden')) return;
  const rHtml = compactResHtml(S.me);
  if ($('m-res').dataset.h !== rHtml) { $('m-res').dataset.h = rHtml; $('m-res').innerHTML = rHtml; }
  const mHtml = $('matchbar').innerHTML;
  if ($('m-match').innerHTML !== mHtml) $('m-match').innerHTML = mHtml;
  const fs = !!document.fullscreenElement, canRecall = !!(S.alive && S.room?.mode === 'endless' && S.myBase), rc = !!(S.me?.rc);
  const btns = [
    ['shop', 'chest', 'Shop', ''],
    ['inv', 'bag', 'Túi đồ', S.hasNewInv ? 'dot' : ''],
    ['rank', 'trophy', 'BXH', ''],
  ];
  if (S.alive) btns.push(['swap', 'swords', 'Đổi tướng', S.me?.combat || S.me?.hc ? 'dim' : '']);
  if (canRecall) btns.push(['recall', 'house', rc ? 'Huỷ về' : 'Về thành', rc ? 'on' : '']);
  { const cs = castleCallState(); if (cs && !cs.left && !cs.cd && cs.inside && !cs.ruin) btns.push(['call', 'flag', 'Viện binh', '']); }
  btns.push(
    ['chat', 'chat', 'Chat', ''],
    ['ci', 'cal', 'Điểm danh', S.ci && !S.ci.today ? 'dot' : ''],
    ['fs', 'full', fs ? 'Thu nhỏ' : 'Toàn màn', ''],
    ['help', 'help', 'Hướng dẫn', ''],
    ['forfeit', 'flag', 'Rời trận', 'danger'],
    ['home', 'house', S.mode === 'endless' ? 'Trang chủ' : 'Rời phòng', ''],
    ['logout', 'flag', 'Đăng xuất', 'danger'],
  );
  const gKey = JSON.stringify(btns);
  if (gKey !== drawerGridKey) {
    drawerGridKey = gKey;
    $('m-grid').innerHTML = btns.map(([id, ic, lbl, cls]) => `<button type="button" data-act="${id}" class="${cls}">${px(ic, 17)}<span>${lbl}</span></button>`).join('');
  }
}
function toggleMobileDrawer() {
  document.body.classList.toggle('menu-open');
  syncOpenBtnDot();
}
syncOpenBtnDot();
bindTap($('m-openbtn'), () => toggleMobileDrawer());
bindTap($('m-drawer'), (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  closeMobileDrawer();
  const a = b.dataset.act;
  if (a === 'shop') toggleShop();
  else if (a === 'inv') toggleInv();
  else if (a === 'rank') toggleRank();
  else if (a === 'swap') openSwap();
  else if (a === 'recall') recall();
  else if (a === 'call') send({ t: 'castle-call' });
  else if (a === 'chat') openChat();
  else if (a === 'ci') openCheckin();
  else if (a === 'fs') { if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.().then(tryLockLandscape).catch(() => {}); }
  else if (a === 'help') openHelp();
  else if (a === 'forfeit') forfeit();
  else if (a === 'home') leaveRoom();
  else if (a === 'logout') logout();
});
addEventListener('fullscreenchange', () => { drawerGridKey = ''; if (!$('m-drawer').classList.contains('hidden')) renderMobileDrawer(); });
let rankSort = localStorage.getItem('sw-rank') ?? 'units';
function toggleRank() { $('rankpanel').classList.toggle('hidden'); $('invpanel').classList.add('hidden'); $('info').classList.add('hidden'); S.sel = null; renderRank(); }
const MEDAL = ['🥇', '🥈', '🥉'];
function renderRank() {
  const box = $('rankpanel');
  document.querySelector('.rb.rank')?.classList.toggle('on', !box.classList.contains('hidden'));
  if (box.classList.contains('hidden')) return;
  const rows = [...S.players.values()].filter((p) => !p.bot).sort((a, b) => rankSort === 'units' ? (b.units - a.units || b.mines - a.mines) : (b.mines - a.mines || b.units - a.units));
  const maxU = Math.max(1, ...rows.map((p) => p.units)), maxM = Math.max(1, ...rows.map((p) => p.mines));
  box.innerHTML = `<div class="rk-head"><b>Bảng xếp hạng</b><span class="tabs"><button data-s="units" class="${rankSort === 'units' ? 'on' : ''}">Quân số</button> <button data-s="mines" class="${rankSort === 'mines' ? 'on' : ''}">Công trình</button>${S.mobile ? ' <button type="button" class="pnl-x" id="rk-x">✕</button>' : ''}</span></div>
  <table><tr><th>#</th><th>Người chơi</th><th>Quân</th><th>Công trình</th></tr>${rows.map((p, i) => {
    const mt = Object.entries(p.mt ?? {}).sort((a, b) => RES.indexOf(a[0]) - RES.indexOf(b[0])).map(([t, n]) => `<span title="${RES_INFO[t].mine}"><i style="--c:${RES_INFO[t].color}"></i>${n}</span>`).join('');
    const pct = rankSort === 'units' ? (100 * p.units) / maxU : (100 * p.mines) / maxM;
    return `<tr class="${p.id === S.you ? 'me' : ''} ${p.alive ? '' : 'dead'}"><td><span class="medal">${MEDAL[i] ?? i + 1}</span></td>
      <td class="nm"><span style="color:${p.color}">${esc(p.name)}</span>${p.bot ? ' 🤖' : ''}<small>${p.alive ? HEROES[p.hero]?.name ?? '' : 'đang chờ xuất trận'}${p.dragons ? ` · 🐉${p.dragons}` : ''}</small><div class="bar"><i style="width:${pct}%;background:${p.color}"></i></div></td>
      <td>${p.units}</td><td>${p.mines}<div class="mt">${mt}</div></td></tr>`;
  }).join('')}</table>`;
  box.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => { rankSort = b.dataset.s; localStorage.setItem('sw-rank', rankSort); renderRank(); }));
  const rx = $('rk-x'); if (rx) rx.onclick = () => { box.classList.add('hidden'); renderRank(); };
}

// ---------------- inventory (docs/design/16)
let mInvSel = null;
function toggleInv() { S.hasNewInv = false; syncOpenBtnDot(); document.querySelector('.rb.inv')?.classList.remove('new'); $('invpanel').classList.toggle('hidden'); $('rankpanel').classList.add('hidden'); $('info').classList.add('hidden'); document.querySelector('.rb.inv')?.classList.toggle('on', !$('invpanel').classList.contains('hidden')); renderInv(); }
const statLines = (st) => Object.entries(st).map(([k, v]) => fmtStat(k, v));
/** Lò rèn result dialog (13/11/2026): success (old ➜ new, the new lines) or failure (what was lost, the item stays) */
function forgeResult(e) {
  document.getElementById('forgedlg')?.remove();
  const ok = e.k === 'forgeok', f = e.from, it = e.item, nt = ok ? it.tier : TIERS[TIERS.indexOf(f.tier) + 1];
  const box = Object.assign(document.createElement('div'), { id: 'forgedlg', className: 'thup' });
  const pic = (slot, tier, sz = 46) => `<span class="cc t-${tier}" style="width:${sz + 10}px;height:${sz + 10}px">${itemIcon(slot, tier, sz) || px(slot, sz, TIER_INFO[tier].color)}</span>`;
  const spent = `${e.dust} ${e.dustName} · ${Object.entries(e.cost ?? {}).map(([r, v]) => `${v.toLocaleString('vi')} ${RES_INFO[r].name}`).join(' · ')}`;
  box.innerHTML = `<div class="thup-box fres ${ok ? 'ok' : 'fail'}"><div class="thup-title">${ok ? '🔥 RÈN THÀNH CÔNG!' : '💨 RÈN THẤT BẠI'}</div>
    <div class="fres-pair">${pic(f.slot, f.tier)}<span class="farrow">➜</span>${ok ? pic(it.slot, it.tier, 56) : `<span class="fres-x">${pic(f.slot, nt)}</span>`}</div>
    <div class="fres-name"><b style="color:${TIER_INFO[ok ? it.tier : f.tier].color}">${esc(ok ? it.name : f.name)}</b> · Lv ${f.lv}<br><small>${TIER_INFO[f.tier].name} ➜ ${TIER_INFO[nt].name} · tỉ lệ ${Math.round(e.rate * 100)}%</small></div>
    ${ok ? `<div class="fres-tip">${itemTip(it)}</div>` : `<div class="fres-lost">Mất: ${spent}<br><b>Món đồ vẫn còn nguyên</b>, có thể rèn lại.</div>`}
    <button class="thup-ok">${ok ? 'Tuyệt!' : 'Đã hiểu'}</button></div>`;
  document.body.appendChild(box);
  box.querySelector('.thup-ok').onclick = () => box.remove();
  box.onclick = (ev) => { if (ev.target === box) box.remove(); };
}
function itemTip(it, cmp) {
  const c = TIER_INFO[it.tier].color;
  const hl = S.me?.hl?.[0] ?? 1, ilv = it.lv ?? 1;
  let h = `<b style="color:${c}">${esc(it.name)}</b> <span class="ilv">Lv ${ilv}</span><br><span style="color:${c}">${TIER_INFO[it.tier].name}</span> · ${SLOT_INFO[it.slot].name}<br>${ilv > hl ? `<span class="down">🔒 Cần tướng cấp ${ilv} (đang ${hl})</span><br>` : ''}${statLines(it.stats).join('<br>')}`;
  // gear v2: what the soldiers get from this piece, and its set
  const ar = itemArmy(it), al = [['atk', 'sát thương'], ['hp', 'máu'], ['armor', 'giáp'], ['as', 'tốc đánh'], ['ls', 'hút máu'], ['dg', 'né']].filter(([k]) => ar[k] >= 0.0005).map(([k, n]) => `+${Math.round(ar[k] * 1000) / 10}% ${n}`);
  if (al.length) h += `<br><span class="tq">Quân: ${al.join(', ')}</span>`;
  if (GEAR_SETS[it.tier]) { const n = setCounts(S.inv.equip)[it.tier] ?? 0; h += `<br><span style="color:${c}">Bộ ${GEAR_SETS[it.tier].name} (đang mặc ${n}/8)</span>`; }
  const cur = cmp === undefined ? S.inv.equip?.[it.slot] : cmp;
  if (cur && cur.id !== it.id) {
    const keys = new Set([...Object.keys(it.stats), ...Object.keys(cur.stats)]);
    h += `<br><small>So với ${esc(cur.name)}:</small><br>` + [...keys].map((k) => { const d = (it.stats[k] ?? 0) - (cur.stats[k] ?? 0); if (!d) return ''; return `<span class="${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${fmtStat(k, Math.abs(d)).slice(1)}</span>`; }).filter(Boolean).join('<br>');
  }
  return h;
}
const SLOT_POS = { helmet: [2, 1], weapon: [1, 1], armor: [3, 1], shield: [1, 2], gloves: [3, 2], ring: [1, 3], boots: [2, 3], amulet: [3, 3] };
// ---------------- Rương đồ / Lò nghiền / Lò rèn (docs/design/20-lo-ren-nghien-ruong.md)
const craft = { mode: null, sel: new Set(), pick: null, key: '' };
window.addEventListener('opencraft', (e) => { craft.mode = e.detail; craft.sel.clear(); craft.pick = null; craft.key = ''; $('craftdlg').classList.remove('hidden'); send({ t: 'resync' }); renderCraft(true); });
const dustIcon = (t, size = 26) => `<span class="dust" style="width:${size}px;height:${size}px;background:url(/assets/items/dust.png?v=${S.av ?? ''}) ${-TIERS.indexOf(t) * size}px 0 / ${size * 8}px ${size}px no-repeat"></span>`;
const bLv = (type) => S.myBase?.items.find((i) => i.type === type && i.state !== 'build' && i.state !== 'ruin')?.lv ?? 0;
function cellHtml(it, where, extra = '') {
  if (!it) return '<div class="cc empty"></div>';
  return `<div class="cc t-${it.tier}${craft.sel.has(it.id) || craft.pick === it.id ? ' on' : ''}" data-id="${it.id}" data-w="${where}">${itemIcon(it.slot, it.tier, 38) || px(it.slot, 38, TIER_INFO[it.tier].color)}<i class="ilvb">${it.lv ?? 1}</i>${extra}</div>`;
}
function wireCells(box, onClick) {
  box.querySelectorAll('.cc[data-id]').forEach((el) => {
    const id = +el.dataset.id, it = [...(S.chest?.items ?? []), ...(S.inv.bag ?? []), ...Object.values(S.inv.equip ?? {})].find((q) => q?.id === id);
    el.onclick = (e) => onClick(id, el.dataset.w, it, e);
    if (!S.mobile && it) { el.onmouseenter = () => { const tip = $('tip'); tip.innerHTML = itemTip(it, el.dataset.w === 'eq' ? null : undefined); tip.classList.add('itip'); tip.classList.remove('hidden'); const r = el.getBoundingClientRect(); tip.style.left = Math.max(4, r.left - 240) + 'px'; tip.style.top = r.top + 'px'; }; el.onmouseleave = () => $('tip').classList.add('hidden'); }
  });
}
function renderCraft(force = false) {
  const box = $('craftdlg'); if (box.classList.contains('hidden') || !craft.mode) return;
  const chest = S.chest?.items ?? [], dust = S.chest?.dust ?? {}, bag = S.inv.bag ?? [], eq = S.inv.equip ?? {};
  // self-heal: an item showing in both the chest and the bag means one update was missed → ask the server for both again
  { const inChest = new Set(chest.map((i) => i.id)); if (bag.some((i) => inChest.has(i.id)) && now() - (craft.healT ?? -9) > 2) { craft.healT = now(); send({ t: 'resync-inv' }); } }
  const key = JSON.stringify([craft.mode, chest.map((i) => i.id + i.tier), dust, bag.map((i) => i.id + i.tier), Object.values(eq).map((i) => i?.id + i?.tier), [...craft.sel], craft.pick, craft.mode === 'forge' ? S.me?.res : 0, S.myBase?.items.map((i) => i.lv + i.type).join()]);
  if (key === craft.key && !force) return; craft.key = key;
  // keep the scroll position of the item grids across re-renders (14/11/2026: the forge list jumped back to the top every
  // time resources ticked, since its key includes them)
  const keepScroll = [...$('craftbody').querySelectorAll('.chestgrid')].map((g) => g.scrollTop), keepMode = craft.scrollMode;
  craft.scrollMode = craft.mode;
  queueMicrotask(() => { if (keepMode !== craft.mode) return; [...$('craftbody').querySelectorAll('.chestgrid')].forEach((g, i) => { if (keepScroll[i]) g.scrollTop = keepScroll[i]; }); });
  const body = $('craftbody'), dustRow = `<div class="dustrow">${TIERS.map((t) => `<span title="${DUST[t]}">${dustIcon(t)}<b style="color:${TIER_INFO[t].color}">${dust[t] ?? 0}</b></span>`).join('')}</div>`;
  $('crafttools').innerHTML = '';
  if (craft.mode === 'chest') {
    const lv = bLv('ruong-do'), [cols, rows] = CHEST_GRID[Math.max(0, lv - 1)], cap = cols * rows;
    $('crafttitle').textContent = 'RƯƠNG ĐỒ'; $('craftcap').textContent = `Cấp ${lv} · ${chest.length} / ${cap} ô`;
    $('crafttools').innerHTML = '<button id="chestsort">⇅ Xếp gọn</button>';
    body.innerHTML = `${dustRow}<div class="chestgrid" style="grid-template-columns: repeat(${cols}, var(--cc))">${Array.from({ length: cap }, (_, i) => cellHtml(chest[i], 'chest')).join('')}</div>
      <div class="craftsub">Túi đồ (${bag.length}/${BAG_SIZE})</div><div class="chestgrid bagrow" style="grid-template-columns: repeat(${Math.min(cols, Math.ceil(BAG_SIZE / 2))}, var(--cc))">${Array.from({ length: BAG_SIZE }, (_, i) => cellHtml(bag[i], 'bag')).join('')}</div><div class="crafthelp">Bấm 1 món để chuyển · Shift + bấm: chuyển cả loại cùng phẩm chất</div>`;
    $('chestsort').onclick = () => send({ t: 'chest-sort' });
    wireCells(body, (id, w, it, e) => {
      const list = e.shiftKey && it ? (w === 'chest' ? chest : bag).filter((q) => q.tier === it.tier).map((q) => q.id) : [id];
      send({ t: w === 'chest' ? 'chest-take' : 'chest-put', ids: list }); $('tip').classList.add('hidden');
    });
    return;
  }
  const loose = [...bag.map((it) => [it, 'bag']), ...chest.map((it) => [it, 'chest'])];
  if (craft.mode === 'grind') {
    const lv = bLv('lo-nghien');
    $('crafttitle').textContent = 'LÒ NGHIỀN'; const glo = GRIND_MIN[lv - 1] ?? 1; $('craftcap').textContent = `Cấp ${lv} · mỗi món ra ${glo}–${GRIND_MAX} bột cùng màu`;
    const sel = loose.filter(([it]) => craft.sel.has(it.id)), gain = {};
    for (const [it] of sel) gain[it.tier] = (gain[it.tier] ?? 0) + 1;
    body.innerHTML = `${dustRow}<div class="tierpick">${TIERS.slice(0, 5).map((t) => `<button data-t="${t}" style="color:${TIER_INFO[t].color}">Chọn hết ${TIER_INFO[t].name}</button>`).join('')}<button data-t="">Bỏ chọn</button></div>
      <div class="chestgrid" style="grid-template-columns: repeat(16, var(--cc))">${loose.map(([it, w]) => cellHtml(it, w)).join('') || '<div class="muted">Không có đồ nào trong túi / rương</div>'}</div>
      <div class="dustmix"><b>Gộp bột</b> <small>9 bột → 1 bột màu kế tiếp, không tốn tài nguyên</small>${TIERS.slice(0, -1).map((t, i) => { const n = Math.floor((dust[t] ?? 0) / 9); return `<button data-mt="${t}" ${n ? '' : 'disabled'} title="${DUST[t]} → ${DUST[TIERS[i + 1]]}">${dustIcon(t, 16)}×9 → ${dustIcon(TIERS[i + 1], 16)}${n ? ` <b>(${n})</b>` : ''}</button>`; }).join('')}</div>
      <div class="craftfoot"><span class="qrws">${sel.length ? `Sẽ nhận: ${Object.entries(gain).map(([t, n]) => `<span class="qrw">${dustIcon(t, 18)} ${n * glo}–${n * GRIND_MAX}</span>`).join('')}` : 'Chưa chọn món nào'}</span><button id="grindgo" ${sel.length ? '' : 'disabled'}>⚙ Nghiền ${sel.length} món</button></div>`;
    body.querySelectorAll('.tierpick button').forEach((b) => (b.onclick = () => { const t = b.dataset.t; if (!t) craft.sel.clear(); else for (const [it] of loose) if (it.tier === t) craft.sel.add(it.id); renderCraft(true); }));
    body.querySelectorAll('.dustmix button').forEach((b) => (b.onclick = (e) => send({ t: 'dustmix', tier: b.dataset.mt, all: !e.shiftKey }))); // click: gộp hết · Shift: gộp 1 lần
    $('grindgo').onclick = () => { if (confirm(`Nghiền ${sel.length} món thành bột? Không lấy lại được.`)) { send({ t: 'grind', ids: [...craft.sel] }); craft.sel.clear(); } };
    wireCells(body, (id) => { if (craft.sel.has(id)) craft.sel.delete(id); else craft.sel.add(id); renderCraft(true); });
    return;
  }
  // forge
  const lv = bLv('lo-ren'), all = [...Object.values(eq).filter(Boolean).map((it) => [it, 'eq']), ...loose], picked = all.find(([it]) => it.id === craft.pick)?.[0];
  $('crafttitle').textContent = 'LÒ RÈN'; $('craftcap').textContent = `Cấp ${lv} · +${(lv - 1) * 4}% tỉ lệ`;
  let right = '<div class="muted">Chọn một món bên trái để xem cách rèn.</div>';
  if (picked) {
    const ti = TIERS.indexOf(picked.tier), next = TIERS[ti + 1];
    if (!next) right = `<div class="fcard">${cellHtml(picked, 'x')}<b style="color:${TIER_INFO[picked.tier].color}">${esc(picked.name)}</b><div>Đã ở phẩm chất cao nhất.</div></div>`;
    else {
      const F = FORGE[ti], rate = forgeRate(ti, Math.max(1, lv)), have = Object.fromEntries(RES.map((r, i) => [r, S.me?.res[i] ?? 0])), dh = dust[picked.tier] ?? 0;
      const lm = itemLvMult(picked.lv ?? 1), main = Object.entries(SLOT_INFO[picked.slot].stats).map(([k, v]) => `${fmtStat(k, picked.stats[k] ?? v[ti] * lm)} → <b style="color:#8aff8a">~${fmtStat(k, v[ti + 1] * lm)}</b>`).join('<br>');
      const lvOk = lv >= F.lv, dOk = dh >= F.dust, rOk = Object.entries(F.cost).every(([r, v]) => have[r] >= v);
      right = `<div class="fcard"><div class="fpair">${cellHtml(picked, 'x')}<span class="farrow">➜</span><div class="cc t-${next}">${itemIcon(picked.slot, next, 38)}</div></div>
        <b style="color:${TIER_INFO[picked.tier].color}">${esc(picked.name)}</b> → <b style="color:${TIER_INFO[next].color}">${SLOT_INFO[picked.slot].names[ti + 1]} (${TIER_INFO[next].name})</b>
        <div class="fstat">${main}<br><small>Giữ level ${picked.lv ?? 1}, các dòng được quay lại (±10%) theo phẩm chất mới</small></div>
        <div class="freq"><span class="${dOk ? '' : 'miss'}">${dustIcon(picked.tier, 20)} ${dh} / ${F.dust} ${DUST[picked.tier]}</span>
        ${Object.entries(F.cost).map(([r, v]) => `<span class="${have[r] >= v ? '' : 'miss'}"><i class="ic" data-r="${r}" style="--c:${RES_INFO[r].color}"></i>${v.toLocaleString('vi')}</span>`).join('')}
        ${lvOk ? '' : `<span class="miss">Cần Lò rèn cấp ${F.lv}</span>`}</div>
        <div class="frate">Tỉ lệ thành công: <b>${Math.round(rate * 100)}%</b> · thất bại mất bột + tài nguyên, giữ món đồ</div>
        <button id="forgego" class="${lvOk && dOk && rOk ? '' : 'lack'}">🔨 Rèn</button></div>`;
    }
  }
  body.innerHTML = `${dustRow}<div class="forgewrap"><div class="chestgrid" style="grid-template-columns: repeat(9, var(--cc))">${all.map(([it, w]) => cellHtml(it, w, w === 'eq' ? '<i class="worn">E</i>' : '')).join('')}</div><div class="fright">${right}</div></div>`;
  const go = $('forgego'); if (go) go.onclick = () => send({ t: 'forge', id: craft.pick });
  wireCells(body.querySelector('.forgewrap .chestgrid'), (id) => { craft.pick = id; renderCraft(true); });
}
// ---------------- Doanh trại: the whole army at a glance (laid out like the shop)
let campBuilt = false;
window.addEventListener('opencamp', () => { $('campdlg').classList.remove('hidden'); renderCampDlg(true); });
function renderCampDlg(rebuild = false) {
  const box = $('campdlg'); if (box.classList.contains('hidden')) return;
  const me = S.me; if (!me) return;
  const onMap = {}, kept = S.myBase?.gl ?? {}, queue = {};
  for (const u of S.view ?? []) if (u.owner === S.you && UNITS[u.type] && !(u.flags & 6)) onMap[u.type] = (onMap[u.type] ?? 0) + 1;
  for (const q of me.q ?? []) queue[q[0]] = (queue[q[0]] ?? 0) + 1;
  const grid = $('campgrid');
  if (!campBuilt || rebuild) {
    campBuilt = true; grid.innerHTML = '';
    for (const type of Object.keys(UNITS)) {
      const u = UNITS[type], c = document.createElement('div');
      c.className = 'card' + (type === 'rong' ? ' dragon' : ''); c.dataset.type = type;
      c.innerHTML = `<span class="hk ctot"></span><button class="cdel" title="Bỏ 1 lính (Shift: 5). Không hoàn tài nguyên">−</button><div class="sp"></div><div class="nm">${u.name}</div><div class="cls">${CLASS_NAME[u.cls]}${S.unitLv?.[type] > 1 ? ` · cấp ${unitLvLabel(type, S.unitLv[type])}` : ''}</div><div class="cin"></div>`;
      c.querySelector('.sp').appendChild(th(skinOf(type, S.unitLv?.[type] ?? 1), type === 'rong' ? 0.55 : u.slots > 1 ? 0.8 : 1.2, 'walk'));
      c.querySelector('.cdel').onclick = (e) => { e.stopPropagation(); send({ t: 'dismiss-type', unit: type, n: e.shiftKey ? 5 : 1 }); };
      grid.appendChild(c);
    }
  }
  let total = 0;
  for (const c of grid.children) {
    const t = c.dataset.type, all = me.counts?.[t] ?? 0, k = kept[t] ?? 0, m = onMap[t] ?? 0, q = queue[t] ?? 0, other = Math.max(0, all - k - m);
    total += all + q;
    c.querySelector('.ctot').textContent = all + q ? `×${all + q}` : '';
    c.querySelector('.cin').innerHTML = all + q ? `Đi theo <b>${m}</b> · Đang cất <b class="${k ? 'cin-on' : ''}">${k + other}</b>${q ? ` · Triệu tập <b>${q}</b>` : ''}` : '<span class="muted">chưa có</span>';
    c.classList.toggle('locked', !(all + q));
    c.querySelector('.cdel').disabled = !all;
  }
  const [n, cap] = me.ac ?? [total, 0];
  $('campcap').textContent = cap ? `${n} / ${cap} chỗ` : `${n} chỗ · không giới hạn`;
  $('campbar').querySelector('i').style.width = cap ? `${Math.min(100, (n / cap) * 100)}%` : '0';
  $('campbar').classList.toggle('full', !!cap && n >= cap);
  $('campbar').querySelector('em').textContent = cap ? `${n} / ${cap}` : `${n}`;
  const camps = S.myBase?.items.filter((i) => i.type === 'doanh-trai') ?? [];
  const foot = $('campfoot'), key = camps.map((c) => `${c.lv}${c.state}`).join() + n + cap;
  if (foot.dataset.k !== key) {
    foot.dataset.k = key;
    foot.innerHTML = camps.length ? camps.map((c, i) => `<span class="cchip">⛺ Doanh trại ${i + 1} · cấp ${c.lv} · ${BUILDINGS['doanh-trai'].barracks[c.lv - 1]} lính${c.state === 'build' ? ' (đang xây)' : c.state === 'up' ? ' (đang nâng)' : c.state === 'ruin' ? ' (đổ nát)' : ''}</span>`).join('') + '<span class="muted">Tính cả lính đang cất và đang triệu tập. Hội thành tính riêng.</span>' : '<span class="muted">Chưa có Doanh trại: được tối đa 30 lính.</span>';
  }
}
// ---------------- Hội thành: pick the troops to keep inside (laid out like the shop)
let castleBuilt = false;
window.addEventListener('opencastle', () => { $('castledlg').classList.remove('hidden'); renderCastleDlg(true); });
function renderCastleDlg(rebuild = false) {
  const box = $('castledlg'); if (box.classList.contains('hidden')) return;
  const ca = S.myBase?.items.find((i) => i.type === 'hoi-thanh');
  if (!ca || ca.state === 'build') { box.classList.add('hidden'); return; }
  const cap = CASTLE_CAP[ca.lv - 1], inside = {}, army = {};
  let used = 0, out = 0;
  for (const s of S.myBase.ca ?? []) { const t = s.replace('!', ''); used += HOUSING[t] ?? 1; if (s[0] === '!') out++; else inside[t] = (inside[t] ?? 0) + 1; }
  for (const u of S.view ?? []) if (u.owner === S.you && UNITS[u.type] && !(u.flags & 6)) army[u.type] = (army[u.type] ?? 0) + 1;
  const kept = S.myBase.gl ?? {}; // stowed in the Doanh trại: can be sent too
  const free = cap - used, grid = $('castlegrid');
  if (!castleBuilt || rebuild) {
    castleBuilt = true; grid.innerHTML = '';
    for (const type of Object.keys(UNITS)) {
      const u = UNITS[type], c = document.createElement('div');
      c.className = 'card' + (type === 'rong' ? ' dragon' : ''); c.dataset.type = type;
      c.innerHTML = `<span class="hk">${HOUSING[type]}</span><div class="sp"></div><div class="nm">${u.name}</div><div class="cls">${HOUSING[type]} chỗ ở · ${CLASS_NAME[u.cls]}</div><div class="cin"></div><div class="cbtns"><button class="cput">GỬI</button><button class="ctake">RÚT</button></div>`;
      c.querySelector('.sp').appendChild(th(skinOf(type, S.unitLv?.[type] ?? 1), type === 'rong' ? 0.55 : u.slots > 1 ? 0.8 : 1.2, 'walk'));
      c.querySelector('.cput').onclick = (e) => send({ t: 'castle-put', unit: type, n: e.shiftKey ? 5 : 1 });
      c.querySelector('.ctake').onclick = (e) => send({ t: 'castle-take', unit: type, n: e.shiftKey ? 5 : 1 });
      grid.appendChild(c);
    }
  }
  for (const c of grid.children) {
    const t = c.dataset.type, a = (army[t] ?? 0) + (kept[t] ?? 0), i = inside[t] ?? 0, h = HOUSING[t];
    c.querySelector('.cin').innerHTML = `${kept[t] ? `Đội ${army[t] ?? 0} + cất ${kept[t]}` : `Trong đội <b>${a}</b>`} · Trong Hội thành <b class="${i ? 'cin-on' : ''}">${i}</b>`;
    const put = c.querySelector('.cput'), take = c.querySelector('.ctake');
    put.disabled = !a || free < h || out > 0; take.disabled = !i;
    put.textContent = !a ? 'GỬI' : free < h ? 'HẾT CHỖ' : 'GỬI';
    c.classList.toggle('locked', !a && !i);
  }
  $('castlecap').textContent = `Cấp ${ca.lv} · ${used} / ${cap} chỗ · tầm canh ${CASTLE_RANGE[ca.lv - 1]} ô · lính bên trong +${CASTLE_LV_BONUS[ca.lv - 1]} cấp · quân trong tầm +${Math.round(CASTLE_AURA_ATK[ca.lv - 1] * 100)}% sát thương, −${Math.round(CASTLE_AURA_ARM[ca.lv - 1] * 100)}% sát thương nhận`;
  $('castlebar').querySelector('i').style.width = `${Math.min(100, (used / cap) * 100)}%`;
  $('castlebar').querySelector('em').textContent = `${used} / ${cap}`;
  const nArmy = Object.keys(army).length + Object.values(kept).filter((n) => n > 0).length;
  const foot = $('castlefoot'), k = `${free}|${out}|${nArmy}`;
  if (foot.dataset.k !== k) {
    foot.dataset.k = k;
    foot.innerHTML = `<button id="castlefill" ${free > 0 && nArmy && !out ? '' : 'disabled'}>⤵ Gửi lấp đầy (lính to trước)</button><span>${out ? `⚔ ${out} lính đang ra trận, đợi họ về.` : 'Tướng phải đứng trong căn cứ. Địch bước vào tầm canh là lính trong Hội thành xông ra, xong trận tự về.'}</span>`;
    $('castlefill').onclick = () => send({ t: 'castle-fill' });
  }
}
// ---- hand / red sword cursors (assets/ui/cursor-*.png, tip = hotspot)
let cursorDownUntil = 0;
function gameCursor() {
  if (!S.alive || S.mobile) return S.hover ? 'pointer' : '';
  let foe = false;
  const h = S.hover;
  if (h?.k === 'unit') { const u = S.byId.get(h.id); foe = !!u && u.owner !== S.you; }
  if (!foe && !h) { const w = toWorld(S.mouse.x, S.mouse.y), bt = buildingAt(w.x, w.y); foe = !!(bt && bt.key !== myKey() && bt.uid); }
  const down = performance.now() < cursorDownUntil ? '-down' : '';
  return `url(/assets/ui/cursor-${foe ? 'attack' : 'move'}${down}.png?v=${S.av ?? ''}) 1 1, ${foe ? 'crosshair' : 'pointer'}`;
}
canvas.addEventListener('mousedown', (e) => { if (e.button === 2) cursorDownUntil = performance.now() + 160; });
/** moving a mine: the chosen tile (centre rule as on the server) */
function mineMoveTile(m, w) { return m.type === 'diamond' ? { tx: Math.round(w.x), ty: Math.round(w.y) } : { tx: Math.floor(w.x), ty: Math.floor(w.y) }; }
function mineMoveCheck(m, w) {
  const { tx, ty } = mineMoveTile(m, w), cx = m.type === 'diamond' ? tx : tx + 0.5, cy = m.type === 'diamond' ? ty : ty + 0.5;
  if (Math.hypot(cx - m.ox, cy - m.oy) > 12) return { cx, cy, err: 'Xa quá: chỉ trong 12 ô quanh vị trí gốc' };
  return { cx, cy, tx, ty, err: null };
}
function doMineMove(w) {
  const m = S.mines[S.mineMove?.id]; S.mineMove = null; if (!m) return;
  const c = mineMoveCheck(m, w); if (c.err) return notice({ kind: 'err', text: c.err });
  send({ t: 'mine-move', id: m.id, x: c.tx, y: c.ty });
}
window.__mineMoveCheck = mineMoveCheck; // render.js draws the ghost with it
/** level, XP bar and the 5 stats with + buttons (docs/design/19-cap-anh-hung.md); plain stats outside the open world */
/** gear v2: what the army gets + the 3/6/8 set lines of every quality worn */
function petRowHtml() {
  if (S.room?.mode !== 'endless') return '';
  const id = S.me?.pet, P = id && PETS[id];
  return `<div class="petrow" id="petrow" title="Thú cưng: bấm để chọn / mua trong Shop">${P ? petPic(id, 40) : '<span class="petemo" style="font-size:26px;opacity:.4">🐾</span>'}<div><b>${P ? P.name : 'Thú cưng'}</b><small>${P ? '🛡 ' + P.text : 'Chưa có · mua trong Shop'}</small>${P ? `<small class="pf">⚔ ${P.role} · ❤ ${petFight(id, S.me?.hl?.[0] ?? 1).hp.toLocaleString('vi')} · ⚔ ${petFight(id, S.me?.hl?.[0] ?? 1).atk}</small>` : ''}</div><span class="petgo">${P ? 'Đổi' : 'Mua'}</span></div>`;
}
function gearPanelHtml(eq = S.inv.equip ?? {}) {
  const g = gearBonus(eq), a = g.army, pc = (v) => `+${Math.round(v * 1000) / 10}%`;
  let h = `<h3>Quân lính nhận</h3><div class="armygear"><span>Sát thương <b>${pc(a.atk)}</b></span><span>Máu <b>${pc(a.hp)}</b></span><span>Giáp <b>${pc(a.armor)}</b></span><span>Tốc đánh <b>${pc(a.as)}</b></span><span>Hút máu <b>${pc(a.ls)}</b></span><span>Né <b>${pc(a.dg)}</b></span></div>`;
  const worn = TIERS.filter((t) => g.sets[t]).reverse();
  if (worn.length) h += `<h3>Bộ trang bị</h3><div class="gearsets">${worn.map((t) => { const n = g.sets[t], c = TIER_INFO[t].color;
    return `<div class="gs"><b style="color:${c}">${GEAR_SETS[t].name} · ${n}/8</b>${setLines(t).map((l) => `<div class="gl ${n >= l.n ? 'on' : ''}" style="color:${c}">(${l.n}) ${l.text}${n >= l.n ? '' : ` <small>${n}/${l.n}</small>`}</div>`).join('')}</div>`; }).join('')}</div>`;
  return h;
}
function heroStatsHtml(hs) {
  if (!hs) return '';
  const hl = S.me?.hl;
  if (!hl) return `<div class="invstats"><span>Máu <b>${hs[0]}</b></span><span>Sát thương <b>${hs[1]}</b></span><span>Giáp <b>${hs[2]}%</b></span><span>Tốc độ đội <b>+${hs[3]}%</b></span></div>`;
  const [lv, xp, need, pts, cap, ...st] = hl, K = ['hp', 'atk', 'as', 'ms', 'ar', 'ls', 'dg'], pt = Object.fromEntries(K.map((k, i) => [k, st[i] ?? 0]));
  const full = lv >= cap, val = { hp: `${hs[0]}`, atk: `${hs[1]}`, as: `${hs[4] ?? 1} đòn/giây`, ms: `+${hs[3]}%`, ar: `${hs[2]}%`, ls: `${hs[5] ?? 0}%`, dg: `${hs[6] ?? 0}%` };
  const extra = (k) => { const v = pt[k] * HERO_STAT[k].per; return pt[k] ? ` <small>(+${k === 'hp' ? Math.round(v) : k === 'atk' ? v.toFixed(1) : (Math.round(v * 1000) / 10) + '%'})</small>` : ''; };
  const maxed = (k) => pt[k] >= HERO_STAT[k].cap(cap) || (k === 'ar' && hs[2] / 100 + HERO_STAT.ar.per > ARMOR_CAP + 1e-9) || ((k === 'ls' || k === 'dg') && (hs[k === 'ls' ? 5 : 6] ?? 0) / 100 + 0.002 > 0.3 + 1e-9);
  return `<div class="hstat"><div class="hlv">Cấp <b>${lv}</b><span class="xpbar"><i style="width:${Math.min(100, (xp / need) * 100)}%"></i><em>${full ? 'ĐẦY' : `${xp} / ${need}`}</em></span></div>
    <div class="hcap">${full && cap < HERO_CAPS[HERO_CAPS.length - 1] ? `🔒 Đạt giới hạn ${cap}: tới <b>Nhà vua phía Bắc</b> để mở` : `Giới hạn cấp ${cap}`} · Còn <b class="${pts ? 'hpts' : ''}">${pts}</b> điểm</div>
    ${K.map((k) => `<div class="hrow"><span>${HERO_STAT[k].name} <small class="hmax ${pt[k] >= HERO_STAT[k].cap(cap) ? 'full' : ''}">${pt[k]}/${HERO_STAT[k].cap(cap)}</small></span><b>${val[k]}${extra(k)}</b><button class="hsplus" data-k="${k}" ${pts && !maxed(k) ? '' : 'disabled'} title="+1 điểm: ${k === 'hp' ? '+20 máu' : k === 'atk' ? '+0,5 tấn công' : k === 'as' ? '+0,5% tốc đánh' : k === 'ms' ? '+0,4% tốc chạy' : k === 'ls' ? '+0,2% hút máu (tối đa 30%)' : k === 'dg' ? '+0,2% né đòn (tối đa 30%)' : '+0,25% giáp (tối đa 75%)'}">+</button></div>`).join('')}
    ${Object.values(pt).some(Boolean) ? `<button id="hreset" class="hreset">↺ Tẩy điểm (${HERO_RESET_COST.diamond} kim cương)</button>` : ''}</div>`;
}
// ---------------- the Northern King: unlock the level cap
function kingNear() { const h = S.me && S.byId.get(S.me.hero); return !!(S.king && h && Math.hypot(h.x - S.king.x, h.y - S.king.y) <= KING_USE_R); }
function showKing() {
  let box = $('kingdlg');
  if (!box) { box = document.createElement('div'); box.id = 'kingdlg'; box.className = 'thup'; document.body.appendChild(box); }
  const hl = S.me?.hl, cap = hl?.[4] ?? HERO_CAPS[0], lv = hl?.[0] ?? 1, i = HERO_CAPS.indexOf(cap), U = HERO_UNLOCK[i];
  const thl = S.myBase?.items.find((q) => q.type === 'thanh-tri')?.lv ?? 0, have = Object.fromEntries(RES.map((r, k) => [r, S.me?.res[k] ?? 0]));
  const why = !U ? null : !kingNear() ? 'Phải đứng trước cung điện' : thl < U.th ? `Cần Thành trì cấp ${U.th}` : Object.entries(U.cost).some(([r, v]) => have[r] < v) ? 'Thiếu tài nguyên' : null;
  box.innerHTML = `<div class="thup-box king-box"><div class="thup-title">👑 Nhà vua phía Bắc</div>
    <div class="muted">"Sức mạnh của ngươi đã chạm tới giới hạn? Mang cống phẩm tới đây, ta sẽ mở khoá."</div>
    <div class="king-cap">Cấp hiện tại <b>${lv}</b> · Giới hạn <b>${cap}</b></div>
    ${U ? `<div class="king-next">Mở giới hạn <b>${cap} → ${HERO_CAPS[i + 1]}</b> · cần Thành trì cấp ${U.th}</div><div class="lab-cost">${Object.entries(U.cost).map(([r, v]) => `<span class="${have[r] < v ? 'miss' : ''}"><i class="ic" data-r="${r}" style="--c:${RES_INFO[r].color}"></i>${v.toLocaleString('vi')}</span>`).join('')}</div>
      <button class="thup-ok king-go" ${why ? 'disabled' : ''}>${why ?? '👑 Mở giới hạn sức mạnh'}</button>` : '<div class="king-next">Ngươi đã đạt tới giới hạn tối đa (cấp 100).</div>'}
    <button class="thup-ok king-close">Đóng</button></div>`;
  box.classList.remove('hidden');
  box.querySelector('.king-close').onclick = () => box.classList.add('hidden');
  const go = box.querySelector('.king-go'); if (go) go.onclick = () => { send({ t: 'king-unlock' }); box.classList.add('hidden'); };
}
// ---------------- Xem thông tin người chơi khác (14/11/2026): stats + gear they wear, read only
function showPInfo(m) {
  let box = $('pinfodlg');
  if (!box) { box = document.createElement('div'); box.id = 'pinfodlg'; box.className = 'thup'; document.body.appendChild(box); box.onclick = (e) => { if (e.target === box) box.classList.add('hidden'); }; }
  const eq = m.equip ?? {}, hero = HEROES[m.hero], hs = m.hs, isz = S.mobile ? 32 : 44;
  const slot = (it, sl) => `<div class="slot ${it ? 't-' + it.tier : 'empty'}" data-pi="${it ? it.id : ''}" style="grid-column:${SLOT_POS[sl][0]};grid-row:${SLOT_POS[sl][1]}">${it ? itemIcon(it.slot, it.tier, isz) || px(it.slot, isz, TIER_INFO[it.tier].color) : px(sl, isz, null)}<span class="lbl">${it ? '' : SLOT_INFO[sl].name}</span>${it ? `<i class="ilvb">${it.lv ?? 1}</i>` : ''}</div>`;
  const rows = hs ? [['Máu', hs[0]], ['Sát thương', hs[1]], ['Giáp', hs[2] + '%'], ['Tốc đánh', (hs[4] ?? 1) + ' đòn/giây'], ['Tốc chạy đội', '+' + hs[3] + '%'], ['Hút máu', (hs[5] ?? 0) + '%'], ['Né đòn', (hs[6] ?? 0) + '%']] : [];
  const nEq = SLOTS.filter((sl) => eq[sl]).length;
  box.innerHTML = `<div class="thup-box pinfo-box"><button type="button" class="pnl-x pinfo-x" title="Đóng">✕</button>
    <div class="thup-title" style="color:${m.color ?? '#ffe26a'}">${esc(m.name)}${m.bot ? ' 🤖' : ''}</div>
    <div class="muted">${hero ? `${hero.name} · ${hero.title}` : 'Chưa chọn tướng'}${m.lv ? ` · Cấp <b>${m.lv}</b>` : ''}${m.title ? ` · 🏅 ${esc(m.title)}` : ''}${m.alive ? '' : ' · 💀 đang chết'}</div>
    <div class="pinfo-cols"><div class="pinfo-c1"><h3>Chỉ số</h3>${rows.length ? `<div class="pinfo-stats">${rows.map(([k, v]) => `<div class="hrow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>` : '<div class="muted">Không có (tướng chưa ra trận)</div>'}
      <div class="pinfo-more"><span>Quân <b>${m.army}</b></span><span>Điểm <b>${m.score}</b></span>${m.pet && PETS[m.pet] ? `<span>${petPic(m.pet, 28)} ${esc(PETS[m.pet].name)}</span>` : ''}</div>${nEq ? gearPanelHtml(eq) : ''}</div>
      <div class="pinfo-c2"><h3>Đang mặc ${nEq}/${SLOTS.length}</h3><div class="doll">${SLOTS.map((sl) => slot(eq[sl], sl)).join('')}<div class="hero"></div></div></div></div></div>`;
  if (m.hero) box.querySelector('.hero').appendChild(th(m.hero, 1));
  box.classList.remove('hidden');
  box.querySelector('.pinfo-x').onclick = () => box.classList.add('hidden');
  const all = Object.values(eq).filter(Boolean);
  box.querySelectorAll('.slot[data-pi]').forEach((el) => {
    const it = all.find((q) => q.id === +el.dataset.pi); if (!it) return;
    const show = () => { const tip = $('tip'); tip.innerHTML = itemTip(it, null); tip.classList.add('itip'); tip.classList.remove('hidden'); const r = el.getBoundingClientRect(); tip.style.left = Math.max(4, r.left - 240) + 'px'; tip.style.top = r.top + 'px'; };
    if (S.mobile) el.onclick = show; else { el.onmouseenter = show; el.onmouseleave = () => $('tip').classList.add('hidden'); }
  });
}
// ---------------- the Desert Queen (south): buy extra mine slots (13/11/2026)
function queenNear() { const h = S.me && S.byId.get(S.me.hero); return !!(S.queen && h && Math.hypot(h.x - S.queen.x, h.y - S.queen.y) <= QUEEN_USE_R); }
const queenSel = { type: 'iron', n: 1 };
function queenCost(type, have, n) { const c = {}; for (let k = have + 1; k <= have + n; k++) for (const [r, v] of Object.entries(mineSlotCost(type, k))) c[r] = (c[r] ?? 0) + v; return c; }
function showQueen() {
  let box = $('queendlg');
  if (!box) { box = document.createElement('div'); box.id = 'queendlg'; box.className = 'qmodal'; document.body.appendChild(box); box.onclick = (e) => { if (e.target === box) box.classList.add('hidden'); }; }
  const mx = S.me?.mx ?? {}, held = (t) => S.mines.filter((m) => m.owner === S.you && m.type === t).length;
  const T = queenSel.type, ex = mx[T] ?? 0, room = MINE_EXTRA_MAX[T] - ex;
  queenSel.n = Math.max(1, Math.min(Math.max(1, room), queenSel.n | 0 || 1));
  const pips = (t) => Array.from({ length: MINE_EXTRA_MAX[t] }, (_, k) => `<i class="${k < (mx[t] ?? 0) ? 'on' : ''}"></i>`).join('');
  box.innerHTML = `<div class="qpanel">
    <div class="qhead"><div><div class="qtitle">🏜 Nữ hoàng Sa mạc</div><div class="qsub">"Đất của thảo nguyên rộng lắm, nhưng không cho không. Muốn giữ thêm mỏ, hãy trả bằng của cải."</div></div><button class="qx" title="Đóng">✕</button></div>
    <div class="qlabel">Chọn loại mỏ</div>
    <div class="qgrid">${Object.keys(MINE_EXTRA_MAX).map((t) => { const cap = MINE_CAP[t] + (mx[t] ?? 0), h = held(t), full = (mx[t] ?? 0) >= MINE_EXTRA_MAX[t];
      return `<button class="qcard${t === T ? ' on' : ''}${full ? ' maxed' : ''}" data-t="${t}"><img src="/assets/mines/${t}.png" alt=""><span class="qname">${RES_INFO[t].mine}</span><span class="qheld"><b class="${h >= cap ? 'full' : ''}">${h}</b> / ${cap} mỏ</span><span class="qpips" title="Đã mở thêm ${mx[t] ?? 0} / ${MINE_EXTRA_MAX[t]}">${pips(t)}</span></button>`; }).join('')}</div>
    <div class="qdetail">${room > 0 ? `
      <div class="qqty"><div class="qlabel">Số chỗ mở thêm</div>
        <div class="qstep"><button class="qminus" aria-label="Bớt">−</button><input class="qn" type="number" inputmode="numeric" min="1" max="${room}" value="${queenSel.n}"><button class="qplus" aria-label="Thêm">+</button></div>
        <div class="qsmall">Còn mở được tối đa ${room} chỗ</div></div>
      <div class="qsum"><div class="qlabel">Sau khi mở</div><div class="qcap"><span>${MINE_CAP[T] + ex}</span><em>→</em><b class="qnew"></b></div><div class="qsmall">${RES_INFO[T].mine} giữ tối đa</div></div>`
    : `<div class="qmaxed">✔ ${RES_INFO[T].mine} đã mở tối đa +${MINE_EXTRA_MAX[T]} (giữ tối đa ${MINE_CAP[T] + ex} mỏ)</div>`}</div>
    ${room > 0 ? '<div class="qlabel">Tổng giá</div><div class="qcost"></div><div class="qnote">Mỗi chỗ mở sau đắt thêm 35% giá gốc · mở theo tài khoản, chết không mất</div>' : ''}
    <button class="qgo"></button></div>`;
  box.classList.remove('hidden');
  const upd = () => {
    const go = box.querySelector('.qgo');
    if (room <= 0) { go.disabled = true; go.textContent = 'Đã mở tối đa'; return; }
    const n = queenSel.n, cost = queenCost(T, ex, n), have = Object.fromEntries(RES.map((r, k) => [r, S.me?.res[k] ?? 0])), lack = Object.entries(cost).some(([r, v]) => have[r] < v);
    box.querySelector('.qn').value = n;
    box.querySelector('.qnew').textContent = MINE_CAP[T] + ex + n;
    box.querySelector('.qcost').innerHTML = Object.entries(cost).map(([r, v]) => `<span class="qchip${have[r] < v ? ' miss' : ''}"><i class="ic" data-r="${r}" style="--c:${RES_INFO[r].color}"></i><b>${v.toLocaleString('vi')}</b><small>${have[r] < v ? `thiếu ${(v - have[r]).toLocaleString('vi')}` : RES_INFO[r].name}</small></span>`).join('');
    const why = !queenNear() ? 'Phải đứng trước cung điện' : lack ? 'Thiếu tài nguyên' : null;
    go.disabled = !!why; go.textContent = why ?? `🏜 Mở thêm ${n} chỗ ${RES_INFO[T].mine}`;
  };
  const setN = (v) => { queenSel.n = Math.max(1, Math.min(room, v | 0 || 1)); upd(); };
  box.querySelector('.qx').onclick = () => box.classList.add('hidden');
  box.querySelectorAll('.qcard').forEach((b) => (b.onclick = () => { queenSel.type = b.dataset.t; queenSel.n = 1; showQueen(); }));
  if (room > 0) {
    box.querySelector('.qminus').onclick = () => setN(queenSel.n - 1);
    box.querySelector('.qplus').onclick = () => setN(queenSel.n + 1);
    box.querySelector('.qn').oninput = (e) => { if (e.target.value !== '') setN(+e.target.value); };
    box.querySelector('.qgo').onclick = () => { send({ t: 'queen-unlock', type: T, n: queenSel.n }); setTimeout(() => !box.classList.contains('hidden') && showQueen(), 700); };
  }
  upd();
}
/** "🔥 Vào Địa Ngục" when the hero stands near the gate (like the King's and the Queen's buttons, 16/11/2026) */
function syncHellBtn() {
  let b = $('hellbtn');
  const h = S.byId.get(S.me?.hero), g = S.hellGate;
  const show = !!(S.alive && S.room?.mode === 'endless' && h && g && !hellState.on && Math.hypot(h.x - g[0], h.y - g[1]) <= 9);
  if (!b && show) { b = document.createElement('button'); b.id = 'hellbtn'; b.textContent = '🔥 Vào Địa Ngục'; b.onclick = () => openHellGate(); document.body.appendChild(b); }
  if (b) b.classList.toggle('hidden', !show);
  if (!show) document.getElementById('hellgate')?.remove();
}
function syncQueenBtn() {
  let b = $('queenbtn');
  const show = S.alive && S.room?.mode === 'endless' && queenNear();
  if (!b && show) { b = document.createElement('button'); b.id = 'queenbtn'; b.textContent = '🏜 Gặp Nữ hoàng Sa mạc'; b.onclick = showQueen; document.body.appendChild(b); }
  if (b) b.classList.toggle('hidden', !show);
  if (!show) $('queendlg')?.classList.add('hidden');
}
/** "📯 Viện binh" (Hội thành, 13/11/2026): state from the base snapshot (ca = troops, cc = cooldown s, cb = [n, s left]) */
function castleCallState() {
  const B = S.myBase; if (!B || S.room?.mode !== 'endless' || !S.alive) return null;
  const ca = B.items?.find((i) => i.type === 'hoi-thanh' && i.state !== 'build'); if (!ca) return null;
  const el = performance.now() / 1000 - (B._at ?? 0), inside = (B.ca ?? []).filter((x) => x[0] !== '!').length;
  const cd = Math.max(0, Math.ceil((B.cc ?? 0) - el)), left = B.cb ? Math.max(0, Math.ceil(B.cb[1] - el)) : 0;
  return { inside, cd, left, n: B.cb?.[0] ?? 0, ruin: ca.state === 'ruin' };
}
function syncCallBtn() {
  const b = $('callbtn'), c = castleCallState();
  b.classList.toggle('hidden', !c);
  if (!c) return;
  const mm = (v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
  const txt = c.left ? `📯 ${c.n} lính · ${mm(c.left)}` : c.cd ? `📯 Hồi ${mm(c.cd)}` : `📯 Viện binh (${c.inside})`;
  if (b.textContent !== txt) b.textContent = txt;
  b.disabled = !c.left && (!!c.cd || !c.inside || c.ruin);
  b.classList.toggle('on', !!c.left);
}
/** Sự kiện thế giới (13/11/2026): banner under the world bar + a marker on the minimap */
function syncEvBanner() {
  let b = $('evbanner'); const ev = S.ev;
  if (!b) { b = document.createElement('button'); b.id = 'evbanner'; b.onclick = () => { if (S.ev) { jumpTo(S.ev[1], S.ev[2]); S.ping = { x: S.ev[1], y: S.ev[2], at: performance.now() }; } }; document.body.appendChild(b); }
  b.classList.toggle('hidden', !ev || S.room?.mode !== 'endless');
  if (!ev) return;
  const [kind, , , left, hp] = ev, mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  const t = kind === 'chief' ? `🔥 Thủ lĩnh quái · máu ${hp}% · còn ${mm} · bấm để xem` : `💰 Đoàn xe vàng · xe ${hp}% · còn ${mm} · bấm để xem`;
  if (b.textContent !== t) b.textContent = t;
  b.className = kind === 'chief' ? 'evchief' : 'evcart';
}
function syncKingBtn() {
  let b = $('kingbtn');
  const show = S.alive && S.room?.mode === 'endless' && kingNear();
  if (!b && show) { b = document.createElement('button'); b.id = 'kingbtn'; b.textContent = '👑 Gặp Nhà vua phía Bắc'; b.onclick = showKing; document.body.appendChild(b); }
  if (b) b.classList.toggle('hidden', !show);
}
function renderInv() {
  const box = $('invpanel');
  if (box.classList.contains('hidden')) return;
  const eq = S.inv.equip ?? {}, bag = S.inv.bag ?? [];
  const all = [...Object.values(eq).filter(Boolean), ...bag];
  if (mInvSel && !all.some((q) => q.id === mInvSel)) mInvSel = null;
  // icon smaller than its cell so the quality border keeps some padding (12/11/2026)
  const isz = (where) => where === 'eq' ? (S.mobile ? 32 : 44) : (S.mobile ? 20 : 32); // 14/11/2026: bigger pictures (the level number covered them)
  const slotHtml = (it, slot, where) => `<div class="slot ${it ? 't-' + it.tier : 'empty'}${S.mobile && it && it.id === mInvSel ? ' m-sel' : ''}" data-${where}="${it ? it.id : ''}" data-slot="${slot}" style="${SLOT_POS[slot] && where === 'eq' ? `grid-column:${SLOT_POS[slot][0]};grid-row:${SLOT_POS[slot][1]}` : ''}">${it ? itemIcon(it.slot, it.tier, isz(where)) || px(it.slot, isz(where), TIER_INFO[it.tier].color) : px(slot, isz(where), null)}<span class="lbl">${it ? '' : SLOT_INFO[slot].name}</span>${it ? `<i class="ilvb${(it.lv ?? 1) > (S.me?.hl?.[0] ?? 1) ? ' lock' : ''}">${it.lv ?? 1}</i>` : ''}${it && !S.mobile ? `<span class="dropx" title="Vứt xuống đất">✕</span>` : ''}</div>`;
  const hs = S.me?.hs;
  const selIt = S.mobile && mInvSel ? all.find((q) => q.id === mInvSel) : null;
  const selEq = selIt && Object.values(eq).some((q) => q?.id === selIt.id);
  box.innerHTML = `<div class="inv-head"><b>Trang bị</b><button type="button" class="pnl-x" id="inv-x" title="Đóng">✕</button></div><div class="inv-cols"><div class="inv-c1"><h3>Chỉ số</h3>${heroStatsHtml(hs)}${gearPanelHtml()}</div><div class="inv-c2"><div class="inv-gear"><div><h3>Đang mặc</h3><div class="doll">${SLOTS.map((sl) => slotHtml(eq[sl], sl, 'eq')).join('')}<div class="hero"></div></div>${petRowHtml()}</div>
    <div><h3>Túi đồ ${bag.length}/${BAG_SIZE}</h3><div class="bag">${Array.from({ length: BAG_SIZE }, (_, i) => bag[i] ? slotHtml(bag[i], bag[i].slot, 'bag') : '<div class="slot empty"></div>').join('')}</div></div></div>
    ${S.mobile ? `<div class="m-invbar">${selIt ? `<div class="m-invtxt">${itemTip(selIt, selEq ? null : undefined)}</div><div class="m-invbtns"><button type="button" class="eqb" id="m-inveq">${selEq ? 'Cởi ra' : 'Mặc vào'}</button><button type="button" class="drb" id="m-invdrop">Vứt bỏ</button></div>` : '<div class="m-invtxt" style="color:#a89880">Chạm món đồ để xem chỉ số, so sánh, mặc/cởi hoặc vứt bỏ. Đi gần đồ dưới đất tự động nhặt.</div>'}</div>` : '<div class="invhint">Bấm đồ trong túi để mặc · bấm đồ đang mặc để cởi · <b>✕</b> hoặc chuột phải để vứt · nhặt đồ trên đất bằng chuột trái</div>'}</div></div>`;
  if (S.heroType) box.querySelector('.hero').appendChild(th(S.heroType, 1));
  box.querySelectorAll('.hsplus').forEach((b) => (b.onclick = () => send({ t: 'stat-add', k: b.dataset.k })));
  const hr = $('hreset'); if (hr) hr.onclick = () => { if (confirm(`Tẩy hết điểm tiềm năng đã cộng để cộng lại? Tốn ${HERO_RESET_COST.diamond} kim cương.`)) send({ t: 'stat-reset' }); };
  const ix = $('inv-x'); if (ix) ix.onclick = () => { box.classList.add('hidden'); document.querySelector('.rb.inv')?.classList.remove('on'); };
  const pr = $('petrow'); if (pr) pr.onclick = () => { box.classList.add('hidden'); shopTab = 'pet'; for (const x of document.querySelectorAll('#shoptabs button')) x.classList.toggle('on', x.dataset.st === 'pet'); if ($('shop').classList.contains('hidden')) toggleShop(); renderShop(true); };
  if (S.mobile && selIt) {
    $('m-inveq').onclick = () => { if (selEq) send({ t: 'unequip', slot: selIt.slot }); else send({ t: 'equip', id: selIt.id }); mInvSel = null; };
    $('m-invdrop').onclick = () => { if (confirm(`Vứt ${selIt.name} xuống đất?`)) { send({ t: 'dropitem', id: selIt.id }); mInvSel = null; } };
  }
  box.querySelectorAll('.slot[data-eq], .slot[data-bag]').forEach((el) => {
    const id = +(el.dataset.eq || el.dataset.bag); const it = all.find((q) => q.id === id);
    if (!it) return;
    if (S.mobile) {
      el.onclick = () => { mInvSel = mInvSel === id ? null : id; renderInv(); };
      return;
    }
    el.onmouseenter = () => { const tip = $('tip'); tip.innerHTML = itemTip(it, el.dataset.eq ? null : undefined); tip.classList.add('itip'); tip.classList.remove('hidden'); const r = el.getBoundingClientRect(); tip.style.left = r.left - 240 + 'px'; tip.style.top = r.top + 'px'; S.invTip = true; };
    el.onmouseleave = () => { $('tip').classList.add('hidden'); S.invTip = false; };
    const discard = () => { $('tip').classList.add('hidden'); S.invTip = false; if (confirm(`Vứt ${it.name} xuống đất?`)) send({ t: 'dropitem', id }); };
    el.onclick = (e) => { if (e.target.classList.contains('dropx')) return discard(); $('tip').classList.add('hidden'); S.invTip = false; if (el.dataset.eq) send({ t: 'unequip', slot: el.dataset.slot }); else send({ t: 'equip', id }); };
    el.oncontextmenu = (e) => { e.preventDefault(); discard(); };
  });
}

// ---------------- home page: modes and rooms
function resetWorld() {
  endJoy(false);
  Object.assign(S, { snaps: [], view: [], corpses: [], fx: [], projs: [], fires: [], texts: [], marks: [], items: [], inv: { equip: {}, bag: [] }, me: null, match: null, sel: null, hover: null, watching: false, watch: 0, alive: false, bases: [], myBase: null, build: null, selWalls: null, skillAim: null, pullUntil: 0, regroupUntil: 0, hasNewInv: false });
  S.byId.clear(); S.players = new Map();
  S.mines = (S.mineDefs ?? []).map(([type, x, y], id) => ({ id, type, x, y, ox: x, oy: y, owner: 0, capBy: 0, cap: 0, guards: 0, steal: 0, held: 0, respawn: 0 }));
  closeMobileDrawer();
  for (const id of ['shop', 'invpanel', 'rankpanel', 'results', 'deadbanner', 'defeat', 'info', 'm-ctxbar']) $(id).classList.add('hidden');
  syncOpenBtnDot();
  document.body.classList.remove('gray');
}
function showHome() {
  hideScreens(); $('hud').classList.add('hidden');
  $('home').classList.remove('hidden');
  $('home-name').textContent = `Chào ${S.account?.name ?? ''}`;
  $('home-foot').textContent = `Thành tích: ${S.account?.wins ?? 0} ván thắng · điểm cao nhất ${S.account?.best ?? 0}`;
  if (!$('ic-endless').children.length) {
    for (const t of ['thach-lam', 'rong', 'golem-kim-cuong']) $('ic-endless').appendChild(th(t, t === 'golem-kim-cuong' ? 0.24 : t === 'rong' ? 0.5 : 1));
    for (const t of ['hiep-si', 'kiem-si', 'cung-thu', 'phap-su']) $('ic-rooms').appendChild(th(t, 1));
  }
  send({ t: 'rooms' }); renderHome();
}
function renderHome() {
  const L = S.roomList; if (!L || $('home').classList.contains('hidden')) return;
  const world = L.list.find((r) => r.mode === 'endless');
  $('endless-meta').textContent = world ? `${world.humans.length} người đang chơi${world.humans.length ? ': ' + world.humans.slice(0, 5).join(', ') : ''} · ${L.online} người online` : '';
  const rooms = L.list.filter((r) => r.mode === 'match');
  const st = (r) => r.phase === 'lobby' ? (r.startIn ? ['lobby', `bắt đầu sau ${r.startIn}s`] : ['lobby', 'Hàng chờ']) : r.phase === 'run' ? ['run', `Đang đấu ${mmss(r.el)}`] : ['end', 'Tổng kết'];
  $('roomlist').innerHTML = rooms.length ? rooms.map((r) => { const [c, t] = st(r); return `<div class="room"><div class="rn"><b>${esc(r.name)}</b><small>${r.humans.length} người${r.humans.length ? ': ' + esc(r.humans.slice(0, 4).join(', ')) : ''}${r.by ? ` · tạo bởi ${esc(r.by)}` : ''} · ván #${r.n}</small></div><span class="st ${c}">${t}</span><button data-room="${r.id}">Vào</button>${r.by && r.by === S.account?.name ? `<button class="del" data-del="${r.id}" title="Xoá phòng của bạn">Xoá</button>` : ''}</div>`; }).join('')
    : '<div class="room empty">Chưa có phòng nào. Tạo phòng rồi rủ bạn bè vào nhé.</div>';
  $('roomlist').querySelectorAll('[data-room]').forEach((b) => (b.onclick = () => { tryLockLandscape(); send({ t: 'joinroom', id: b.dataset.room }); }));
  $('roomlist').querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => { const r = rooms.find((q) => q.id === b.dataset.del); if (r && confirm(`Xoá phòng "${r.name}"? Mọi người trong phòng sẽ về trang chủ.`)) send({ t: 'deleteroom', id: r.id }); }));
}
$('go-endless').onclick = () => { tryLockLandscape(); const w = S.roomList?.list.find((r) => r.mode === 'endless'); send({ t: 'joinroom', id: w?.id ?? 'world' }); };
$('createroom').onclick = () => send({ t: 'createroom', name: $('roomname').value.trim() });
$('roomname').onkeydown = (e) => { if (e.key === 'Enter') $('createroom').click(); };

// ---------------- daily check-in
/** the biggest resource of a gift, as its icon */
const resPic = (res) => { const [r] = Object.entries(res).sort((a, b) => b[1] / (RES_INFO[b[0]].score ?? 1) - a[1] / (RES_INFO[a[0]].score ?? 1))[0] ?? []; return r ? `<i class="ic cires" data-r="${r}" style="--c:${RES_INFO[r].color}"></i>` : ''; };
const resLine = (res) => Object.entries(res).map(([r, v]) => `<div><i style="--c:${RES_INFO[r].color}"></i>${v} ${RES_INFO[r].name}</div>`).join('');
function openCheckin() { send({ t: 'ci' }); $('checkin').classList.remove('hidden'); renderCheckin(); }
function renderCheckin() {
  const c = S.ci; if (!c) return;
  for (const el of [$('home-ci'), document.querySelector('.rb.cal')]) el?.classList.toggle('dot', !c.today);
  syncOpenBtnDot();
  if (!$('m-drawer').classList.contains('hidden')) renderMobileDrawer();
  if ($('checkin').classList.contains('hidden')) return;
  // calendar of the month: Monday-first weeks; past days are grey (as if checked), today glows until claimed
  const got = new Set(c.got ?? []), lead = ((c.first ?? 1) + 6) % 7;
  const head = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w) => `<div class="ciwd">${w}</div>`).join('');
  const cells = c.rewards.map((rw, i) => {
    const d = i + 1, past = d < c.day, isToday = d === c.day, done = got.has(d) || past || (isToday && c.today);
    const pic = rw.item ? (itemIcon(SLOTS[d % SLOTS.length], rw.item, 40) || px(SLOTS[d % SLOTS.length], 40, TIER_INFO[rw.item].color)) : resPic(rw.res);
    const txt = rw.item ? `<b style="color:${TIER_INFO[rw.item].color}">${TIER_INFO[rw.item].name}</b>` : resLine(rw.res);
    return `<div class="ciday ${done ? 'done' : ''} ${got.has(d) ? 'got' : ''} ${isToday && !c.today ? 'next' : ''} ${rw.big ? 'big' : ''}" title="Ngày ${d}/${c.month}"><b>${d}</b>${pic}<div class="rw">${txt}</div></div>`;
  }).join('');
  $('cidays').innerHTML = head + '<div class="ciblank"></div>'.repeat(lead) + cells;
  $('cifoot').innerHTML = `<div>Tháng ${c.month}/${c.year} · đã điểm danh <b>${c.count}</b> ngày${c.pending ? ` · <b style="color:#ffd070">${c.pending} phần quà đang chờ</b>: vào Thế giới mở (tướng còn sống) để nhận` : ''}</div>
    <button id="cigo" class="big" ${c.today ? 'disabled' : ''}>${c.today ? 'Hôm nay đã điểm danh · mai quay lại nhé' : `Điểm danh ngày ${c.day}/${c.month}`}</button>
    <small>Mỗi ngày trong tháng một phần quà, càng cuối tháng càng xịn. Ngày đã qua không nhận lại được. Quà vào kho / túi đồ ở Thế giới mở.</small>`;
  const b = $('cigo'); if (b) b.onclick = () => send({ t: 'checkin' });
}
$('home-ci').onclick = openCheckin;
keyLabels();

// ---------------- Tổ đội (party): invite popup + member frames on the left
function showPartyInvite(m) {
  let box = $('pinvbox');
  if (!box) { box = document.createElement('div'); box.id = 'pinvbox'; document.body.appendChild(box); }
  box.innerHTML = `<div>🤝 <b>${esc(m.pname)}</b> mời bạn vào tổ đội</div><small>Cùng tổ không đánh nhau; hạ boss / quái gần nhau thì ai cũng nhận đủ đồ, EXP, tài nguyên.</small><div class="pinv-btns"><button class="ok">Đồng ý</button><button class="no">Từ chối</button></div>`;
  box.classList.remove('hidden');
  const close = () => { box.classList.add('hidden'); clearTimeout(box._t); };
  box.querySelector('.ok').onclick = () => { send({ t: 'party-accept', from: m.pinv, yes: true }); close(); };
  box.querySelector('.no').onclick = () => { send({ t: 'party-accept', from: m.pinv, yes: false }); close(); };
  clearTimeout(box._t); box._t = setTimeout(close, 60000);
}
function renderParty() {
  let box = $('partybox');
  if (!box) { box = document.createElement('div'); box.id = 'partybox'; document.body.appendChild(box); }
  const pt = S.party;
  if (!pt) { box.classList.add('hidden'); box.dataset.h = ''; return; }
  const html = `<div class="pt-head"><button class="pt-tog" title="Thu gọn / mở khung tổ đội">◀</button>🤝 Tổ đội ${pt.members.length}/${pt.max}<button class="pt-leave" title="Rời tổ đội">Rời</button></div>` + pt.members.map((m) => {
    const k = m.alive ? Math.max(0, Math.min(1, m.hp / m.maxHp)) : 0;
    return `<div class="pt-m ${m.alive ? '' : 'dead'} ${m.on ? '' : 'off'}" data-id="${m.id}" title="${m.x != null ? 'Bấm để nhìn tới' : ''}"><span class="pt-n" style="color:${m.color}">${m.id === pt.leader ? '👑 ' : ''}${esc(m.name)}${m.id === S.you ? ' (bạn)' : ''}</span><span class="pt-lv">Lv ${m.lv}</span><div class="pt-hp"><i style="width:${(k * 100).toFixed(0)}%"></i></div>${m.alive ? '' : '<small>đã chết</small>'}</div>`;
  }).join('');
  box.classList.toggle('mini', partyMini());
  if (box.dataset.h === html) return;
  box.dataset.h = html; box.innerHTML = html; box.classList.remove('hidden');
  box.querySelector('.pt-leave').onclick = () => send({ t: 'party-leave' });
  box.querySelector('.pt-tog').onclick = (e) => { e.stopPropagation(); try { localStorage.setItem('sw-party-mini', partyMini() ? '0' : '1'); } catch {} box.classList.toggle('mini', partyMini()); };
  box.querySelectorAll('.pt-m').forEach((el) => (el.onclick = () => { const m = S.party?.members.find((q) => q.id === +el.dataset.id); if (m?.x != null) jumpTo(m.x, m.y); }));
}

// ---------------- defense log (docs/design/22-nhat-ky-phong-thu.md)
let dTab = 'def', dlogFirst = true;
const dlSeenKey = () => `sw-dlog-seen-${myKey()}`;
const lsGet = (k) => { try { return +localStorage.getItem(k) || 0; } catch { return 0; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, String(v)); } catch {} };
window.addEventListener('opendlog', () => openDlog());
document.querySelectorAll('[data-dt]').forEach((b) => (b.onclick = () => { dTab = b.dataset.dt; renderDlog(); }));
function openDlog(onlyNew = null) { $('dlogdlg').classList.remove('hidden'); dTab = 'def'; renderDlog(onlyNew); }
/** first log after joining: battles since the last visit → "Trong lúc bạn vắng mặt" */
function onDlog() {
  const d = S.dlog; if (!d) return;
  const seen = lsGet(dlSeenKey()), last = Math.max(0, ...d.def.map((e) => e.end));
  if (dlogFirst) { dlogFirst = false; const fresh = d.def.filter((e) => e.end > seen); if (fresh.length && seen) openDlog(fresh); }
  if (last) lsSet(dlSeenKey(), last);
  if (!$('dlogdlg').classList.contains('hidden')) renderDlog();
}
const dlTime = (ms) => { const d = new Date(ms); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${d.getDate()}/${d.getMonth() + 1}`; };
const dlRes = (o) => Object.entries(o ?? {}).filter(([, v]) => v >= 1).map(([r, v]) => `<span class="qrw"><i class="ic" data-r="${r}" style="--c:${RES_INFO[r].color}"></i>${fmtN(v)}</span>`).join('') || '<span class="muted">không mất gì</span>';
let dlFresh = null;
function renderDlog(onlyNew) {
  if (onlyNew !== undefined) dlFresh = onlyNew;
  const d = S.dlog ?? { def: [], atk: [] };
  document.querySelectorAll('[data-dt]').forEach((b) => b.classList.toggle('on', b.dataset.dt === dTab));
  const fresh = dTab === 'def' && dlFresh;
  $('dltitle').textContent = fresh ? 'TRONG LÚC BẠN VẮNG MẶT' : 'NHẬT KÝ PHÒNG THỦ';
  const list = (fresh ? dlFresh : dTab === 'def' ? d.def : d.atk).slice().reverse();
  const wk = d.def.filter((e) => e.end > Date.now() - 7 * 864e5), lostWk = {};
  for (const e of wk) for (const [r, v] of Object.entries(e.lost)) lostWk[r] = (lostWk[r] ?? 0) + v;
  $('dlhint').textContent = dTab === 'def' ? `7 ngày: bị đánh ${wk.length} trận · đẩy lùi ${wk.filter((e) => !e.fallen).length} · thất thủ ${wk.filter((e) => e.fallen).length}` : 'Các căn cứ bạn đã đánh';
  const ruins = myRuins().length;
  const rows = list.map((e) => {
    const who = dTab === 'def' ? e.atk.map((a) => `<b style="color:${a.color}">${esc(a.name)}</b>`).join(', ') : `<b style="color:${e.target.color}">${esc(e.target.name)}</b>`;
    const res = dTab === 'def' ? (e.fallen ? '<span class="dl-bad">Thất thủ</span>' : '<span class="dl-ok">Đẩy lùi</span>') : (e.fallen ? '<span class="dl-ok">Phá được Thành trì</span>' : '<span class="dl-bad">Bị đẩy lùi</span>');
    const rz = Object.entries(e.ruins).map(([t, n]) => `${B_NAME(t)}${n > 1 ? ` ×${n}` : ''}`).join(', ');
    const foe = dTab === 'def' ? e.atk.find((a) => a.key && S.bases?.some((b) => b.key === a.key)) : null;
    return `<div class="dl-row ${e.fallen === (dTab === 'def') ? 'lost' : 'won'}">
      <div class="dl-top"><span class="dl-t">${dlTime(e.start)}</span><span>${dTab === 'def' ? '⚔ ' : '🎯 '}${who}</span>${res}</div>
      <div class="dl-det"><span>${dTab === 'def' ? 'Mất' : 'Cướp được'}: ${dlRes(e.lost)}</span>
        ${rz ? `<span>🏚 Bị phá: ${rz}</span>` : ''}
        <span>💀 Lính nhà mất ${e.defLost} · địch bị hạ ${e.enemyKilled}${e.traps ? ` · 💣 bẫy nổ ${e.traps}` : ''}</span></div>
      ${foe || (dTab === 'def' && ruins) ? `<div class="dl-btns">${foe ? `<button class="dl-rev" data-k="${foe.key}" data-n="${esc(foe.name)}">⚔ Trả thù ${esc(foe.name)}</button>` : ''}${dTab === 'def' && ruins ? `<button class="dl-fix">🔧 Sửa tất cả (${ruins})</button>` : ''}</div>` : ''}
    </div>`;
  }).join('');
  $('dlbody').innerHTML = (rows || `<div class="muted dl-empty">${dTab === 'def' ? 'Chưa có trận nào đánh vào căn cứ của bạn.' : 'Bạn chưa đánh căn cứ nào.'}</div>`)
    + (fresh ? `<button class="dl-all">📖 Xem cả nhật ký</button>` : '');
  $('dlbody').querySelectorAll('.dl-rev').forEach((b) => (b.onclick = () => { S.revenge = { key: b.dataset.k, name: b.dataset.n }; $('dlogdlg').classList.add('hidden'); notice({ text: `⚔ Đã đánh dấu căn cứ ${b.dataset.n}: đi theo đường đỏ, tới nơi thì đường tự tắt`, kind: 'warn' }); }));
  $('dlbody').querySelectorAll('.dl-fix').forEach((b) => (b.onclick = () => showRepairAll(send)));
  $('dlbody').querySelectorAll('.dl-all').forEach((b) => (b.onclick = () => renderDlog(null)));
}
/** world position of the marked enemy base (its Thành trì), or null */
function revengeAt() {
  const rv = S.revenge; if (!rv) return null;
  const b = S.bases?.find((x) => x.key === rv.key), th = b?.items.find((i) => i.type === 'thanh-tri');
  return th ? { x: th.tx + 2, y: th.ty + 2, name: rv.name } : null;
}
/** red dashed line from my hero to the marked base, with the distance */
function drawRevenge(t) {
  const p = revengeAt(); if (!p) return;
  const h = S.byId.get(S.me?.hero); if (!h) return;
  const z = cam.z, X = (wx) => (wx * T - cam.x) * z, Y = (wy) => (wy * T - cam.y) * z;
  const d = Math.hypot(p.x - h.x, p.y - h.y);
  if (d < 6) { S.revenge = null; return; }
  ctx.save();
  ctx.strokeStyle = '#ff3a3acc'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 30;
  ctx.beginPath(); ctx.moveTo(X(h.x), Y(h.y)); ctx.lineTo(X(p.x), Y(p.y)); ctx.stroke();
  // label near the hero, along the line
  const ux = (p.x - h.x) / d, uy = (p.y - h.y) / d, lx = X(h.x) + ux * 90, ly = Y(h.y) + uy * 90;
  ctx.setLineDash([]); ctx.font = '600 13px "SWDigits", "Pixelify Sans", monospace'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#1b1726';
  const txt = `⚔ ${p.name} · ${Math.round(d)} ô`; ctx.strokeText(txt, lx, ly); ctx.fillStyle = '#ff6a5a'; ctx.fillText(txt, lx, ly);
  ctx.restore();
}

// ---------------- daily quests + achievements (docs/design/21-nhiem-vu.md)
let qTab = 'day';
function openQuest() {
  if (S.room?.mode !== 'endless') return notice({ text: 'Nhiệm vụ chỉ có ở Thế giới mở', kind: 'err' });
  $('questdlg').classList.remove('hidden'); renderQuest(true);
}
document.querySelectorAll('[data-qt]').forEach((b) => (b.onclick = () => { qTab = b.dataset.qt; renderQuest(true); }));
const qClaimable = (q) => q && (q.list.some((e) => !e.claimed && e.got >= e.need) || q.ach.some((a) => a.done < a.tiers.length && a.have >= a.tiers[a.done]));
const fmtN = (v) => Math.floor(v).toLocaleString('vi');
function renderQuest(force) {
  const q = S.quest;
  document.querySelector('.rb.quest')?.classList.toggle('dot', !!qClaimable(q));
  if (!q || $('questdlg').classList.contains('hidden')) return;
  document.querySelectorAll('[data-qt]').forEach((b) => b.classList.toggle('on', b.dataset.qt === qTab));
  const body = $('qbody');
  let html;
  if (qTab === 'day') {
    $('qhint').textContent = `Ngày ${q.day.split('-').reverse().join('/')} · đổi mới lúc 0h · xong cả 5 nhận Rương ngày`;
    html = '<div class="qlist">' + q.list.map((e, i) => {
      const k = Math.min(1, e.got / e.need), done = e.got >= e.need;
      const rw = [...Object.entries(e.reward).map(([r, v]) => `<span class="qrw"><i class="ic" data-r="${r}" style="--c:${RES_INFO[r].color}"></i>${fmtN(v)}</span>`), e.xp ? `<span class="qrw xp">+${e.xp} XP</span>` : '', e.dust ? `<span class="qrw">${dustIcon(q.th >= 4 ? 'uncommon' : 'fine', 18)} 3 bột</span>` : ''].join('');
      const btn = e.claimed ? '<button disabled>✔ Đã nhận</button>' : done ? `<button class="qgo" data-i="${i}">🎁 Nhận</button>` : `<button class="qre" data-i="${i}" title="${q.rerolls ? `Đổi nhiệm vụ khác: ${q.rerollDia} kim cương` : 'Đổi nhiệm vụ khác (miễn phí 1 lần/ngày)'}">🔄 ${q.rerolls ? q.rerollDia + '💎' : 'Đổi'}</button>`;
      return `<div class="qcard ${done ? 'done' : ''} ${e.claimed ? 'claimed' : ''}"><div class="qname">${e.name}</div>
        <div class="qbar"><i style="width:${k * 100}%"></i><span>${fmtN(e.got)} / ${fmtN(e.need)}</span></div>
        <div class="qfoot"><div class="qrws">${rw}</div>${btn}</div></div>`;
    }).join('') + '</div>'
      + `<div class="qchest ${q.chest ? 'got' : ''}">${px('chest', 34)}<div><b>Rương ngày</b><br><small>${q.chest ? 'Đã nhận hôm nay' : `Nhận đủ 5 nhiệm vụ (${q.list.filter((e) => e.claimed).length}/5): 1 trang bị Xanh lá trở lên + 2 bột`}</small></div></div>`;
  } else {
    $('qhint').textContent = 'Đạt mốc nhận kim cương · mốc cuối mở danh hiệu hiện trên đầu tên';
    html = '<div class="alist">' + q.ach.map((a) => {
      const all = a.done >= a.tiers.length, next = a.tiers[Math.min(a.done, a.tiers.length - 1)], can = !all && a.have >= next;
      const pips = a.tiers.map((t, i) => `<i class="${i < a.done ? 'got' : a.have >= t ? 'can' : ''}" title="Mốc ${i + 1}: ${a.labels?.[i] ?? fmtN(t)} · ${a.dia[i]} kim cương">${a.labels?.[i] ?? fmtN(t)}</i>`).join('');
      const wear = all ? (q.title === a.key ? '<button class="atl" data-k="">Bỏ danh hiệu</button>' : `<button class="atl" data-k="${a.key}">Đeo danh hiệu</button>`) : '';
      return `<div class="acard ${all ? 'all' : ''}"><div class="ahead"><b>${a.name}</b><small>${a.desc}${a.labels ? '' : ` · đang có <b>${fmtN(a.have)}</b>`}</small></div>
        <div class="apips">${pips}</div>
        <div class="afoot"><span class="atitle ${all ? 'on' : ''}">🏅 ${a.title}${q.title === a.key ? ' (đang đeo)' : ''}</span>${can ? `<button class="ago" data-k="${a.key}">🎁 Nhận ${a.dia[a.done]} 💎</button>` : wear}</div></div>`;
    }).join('') + '</div>';
  }
  if (!force && body.dataset.h === html) return;
  body.dataset.h = html; body.innerHTML = html;
  body.querySelectorAll('.qgo').forEach((b) => (b.onclick = () => send({ t: 'quest-claim', i: +b.dataset.i })));
  body.querySelectorAll('.qre').forEach((b) => (b.onclick = () => send({ t: 'quest-reroll', i: +b.dataset.i })));
  body.querySelectorAll('.ago').forEach((b) => (b.onclick = () => send({ t: 'ach-claim', k: b.dataset.k })));
  body.querySelectorAll('.atl').forEach((b) => (b.onclick = () => send({ t: 'title-set', k: b.dataset.k })));
}

// ---------------- help (the "?" button, like Ant War)
const HELP = [
  ['globe', 'Bắt đầu', `<h4>Sodier War là gì?</h4><p>Bạn là một vị tướng. Chiếm <b>mỏ khoáng sản</b> để có tài nguyên, dùng tài nguyên <b>mua quân</b> và <b>xây căn cứ</b>. Quân tự xếp khối lục giác quanh tướng và tự đánh khi gặp địch.</p>
    <ul><li><b>Thế giới mở</b>: chơi mãi, có căn cứ, chết thì xuất trận lại (ở Thành trì nếu có). Boss hồi sinh 10 phút sau khi bị hạ. Rời đi thì quân, tài nguyên, đồ được giữ lại; offline vẫn nhận 50% thu nhập (tối đa 24 giờ).</li>
    <li><b>Đấu theo ván</b>: tạo phòng, chờ bạn bè, bấm Bắt đầu. Mỗi ván tối đa 20 phút, bo thu hẹp, một mạng, không có căn cứ.</li></ul>
    <h4>Mới chơi nên làm gì?</h4><ol><li>Chiếm 2 mỏ Sắt và 1 mỏ Than gần trại, mua Dân quân, Kiếm sĩ.</li><li>Đủ 300 Sắt 100 Than thì <b>xây Thành trì</b> (B → tab Công trình): mở thêm quân, tăng sức chứa, chết xuất trận ngay ở nhà.</li>
    <li>Xây <b>Kho</b> sớm: tài nguyên trong Kho không mất khi tướng chết.</li><li>Đánh bãi quái cấp thấp (Lv1–3) lấy trang bị, rồi dần vào giữa bản đồ.</li></ol>
    <p><b>Tướng chết</b>: mất quân đang đi theo và đồ đang mang (rơi xuống đất). Ở Thế giới mở <b>mỏ vẫn giữ</b> (đồn lính tiếp tục canh, thu nhập chạy lại khi xuất trận); người hạ lấy 25% tài nguyên ngoài phần Kho bảo vệ. Căn cứ và lính đã cất trong căn cứ vẫn còn.</p>`],
  ['swords', 'Điều khiển', `<h4>Điện thoại (màn hình ngang)</h4><table>
    <tr><td><b>Nhân vật chính</b></td><td>Luôn ghim cố định ở chính giữa màn hình; di chuyển thì bản đồ trượt bên dưới</td></tr>
    <tr><td><b>Nút tròn trái dưới</b></td><td>Giữ và xoay ngón cái để di chuyển tướng, tự động nhặt đồ gần chân</td></tr>
    <tr><td><b>Cụm 5 nút phải dưới</b></td><td>1 nút lớn <b>Kỹ năng tướng</b> + 4 nút xung quanh: <b>Cất binh</b> · <b>Rút quân</b> · <b>Tập hợp</b> · <b>Binh chủng</b></td></tr>
    <tr><td><b>Nút Open (góc phải trên)</b></td><td>Mở bảng tài nguyên, Shop, Túi đồ, BXH, Đổi tướng, Về thành, Chat và cài đặt</td></tr>
    <tr><td><b>Bản đồ & Minimap</b></td><td>Chạm đối tượng để đánh / xem thông tin · chụm 2 ngón phóng to thu nhỏ · chạm minimap để phóng to</td></tr></table>
    <h4>Máy tính (chuột và phím)</h4><table>
    <tr><td><b>Chuột phải</b></td><td>Đi tới / chiếm mỏ / tấn công (cả công trình địch) / nhặt đồ</td></tr><tr><td><b>Chuột trái</b></td><td>Xem thông tin, chọn công trình. Giữ và kéo để kéo bản đồ</td></tr>
    <tr><td><b>Lăn chuột</b></td><td>Phóng to, thu nhỏ</td></tr><tr><td><kbd>Space</kbd></td><td>Về chỗ tướng</td></tr><tr><td><kbd>B</kbd></td><td>Cửa hàng: tab Quân (phím 1–0 để mua, Shift mua 5) và tab Công trình</td></tr>
    <tr><td><kbd>I</kbd></td><td>Trang bị</td></tr><tr><td><kbd>Q</kbd></td><td>Kỹ năng của tướng</td></tr><tr><td><kbd>G</kbd></td><td>Xếp đội hình theo binh chủng / thứ tự mua (tầm xa luôn ở trong, đánh gần ở ngoài)</td></tr><tr><td><kbd>V</kbd></td><td>Về thành: 8 giây sau tướng và cả đội về Thành trì (bị tấn công là hủy)</td></tr>
    <tr><td><kbd>H</kbd></td><td>Dừng</td></tr><tr><td><kbd>R</kbd></td><td>Rút quân: cả đội bỏ mục tiêu, về đội hình 4 giây</td></tr><tr><td><kbd>T</kbd></td><td>Tập hợp: lính kẹt thì cả đội xuất hiện ngay quanh tướng (hồi 15 giây)</td></tr>
    <tr><td><kbd>C</kbd></td><td>Cất binh / Xuất binh. Có căn cứ thì lính vào căn cứ giữ nhà; xuất binh phải đứng ở căn cứ</td></tr><tr><td><kbd>Esc</kbd></td><td>Thôi đặt / dời công trình, đóng bảng</td></tr>
    <tr><td><kbd>Tab</kbd></td><td>Bảng xếp hạng</td></tr><tr><td><kbd>M</kbd></td><td>Phóng to bản đồ nhỏ</td></tr><tr><td><kbd>Enter</kbd></td><td>Chat</td></tr></table>`],
  ['flag', 'Mỏ và tài nguyên', `<h4>Chiếm mỏ</h4><ul><li>Đưa <b>tướng</b> vào vòng quanh mỏ, không có địch và lính canh, cờ tự lên sau vài giây.</li>
    <li>Mỏ từ Vàng trở lên có <b>lính canh</b> (Thổ phỉ, Cung thủ phỉ, Kiếm sĩ đen, Thú hắc ín, Tinh linh pha lê, Golem): hạ hết mới chiếm được, còn rơi tài nguyên và trang bị.</li>
    <li>Chiếm xong, mỏ có <b>đồn lính miễn phí</b> bằng 20% đội quân lúc chiếm (tối đa 30). <b>Cướp mỏ của người khác lâu gấp 2,5 lần</b> mỏ trống. Có tướng địch tới gần (10 ô) là bạn được báo.</li>
    <li>Viền <span style="color:#3EE06B">xanh</span> là mỏ của bạn, <span style="color:#FF4A4A">đỏ</span> là của người khác. Giữ càng lâu sản lượng càng tăng (tới +30%); giữ quá nhiều mỏ thì hệ số quản lý giảm dần.</li></ul>
    <p>Bảy loại: Sắt, Than (gần trại) → Vàng, Dầu → Dầu đen, Pha lê → Kim cương (giữa bản đồ). Rê chuột lên icon tài nguyên để xem tên và sức chứa.</p>
    <h4>Sức chứa (Thế giới mở)</h4><p>Mỗi loại chỉ chứa được tới mức sức chứa; đầy thì thu nhập loại đó dừng (số hiện màu đỏ, chữ "đầy"). Nâng <b>Thành trì</b> và xây <b>Kho</b> để chứa nhiều hơn. Phần nằm trong sức chứa của Kho được <b>bảo vệ</b>: không mất khi chết, không bị cướp.</p>`],
  ['chest', 'Quân và đội hình', `<h4>Mua quân</h4><p>Mở cửa hàng (B), tab Quân. 10 binh chủng: Dân quân, Kiếm sĩ, Lính giáo, Cung thủ, Kỵ binh, Hiệp sĩ, Pháp sư, Máy bắn đá, Sư thứu, Rồng.</p>
    <p><b>Ở Thế giới mở, quân mạnh cần Thành trì:</b> cấp 1 Hiệp sĩ · cấp 2 Pháp sư · cấp 3 Máy bắn đá · cấp 4 Sư thứu · cấp 5 Rồng (thẻ quân hiện 🔒). Đấu theo ván không khóa.</p>
    <h4>Khắc chế</h4><p>Kiếm khắc Giáo, Giáo khắc Kỵ, Kỵ khắc Cung, Cung khắc Kiếm và quân bay. Phá công trình: Máy bắn đá mạnh nhất (×2,5), Kỵ ×1,5, bộ binh ×1,3; cung tên rất yếu (×0,5). Rê chuột lên thẻ quân để xem.</p>
    <h4>Đội hình</h4><p>Quân tự xếp lục giác gọn quanh tướng: tầm xa ở trong, cận chiến ở ngoài, quân bay ngoài cùng. Bị cản thì quân tự tìm đường vòng; kẹt thì bấm <b>T</b> (Tập hợp). Đi qua chỗ có quái mạnh mà không muốn đánh: <b>C</b> (Cất binh) cho tướng đi một mình.</p>`],
  ['swords', 'Giao tranh', `<h4>Đánh nhau</h4><ul><li><b>Người gặp người</b> (kể cả lãnh chúa NPC và đồn lính giữ mỏ của người chơi): tự đánh nhau, mỗi quân tự chọn mục tiêu trong tầm với.</li><li><b>Quái, boss, lính canh mỏ</b>: lính của bạn không tự đánh; chỉ đánh khi bạn ra lệnh (chuột phải vào chúng).</li>
    <li>Tướng được <b>quân che</b>: địch chỉ đánh được tướng khi quân cận chiến của bạn đều đang bận.</li>
    <li>Rút lui (chạy ngược hướng địch): cả đội rút theo. <b>R</b> để cả đội bỏ mục tiêu ngay.</li><li>Hết giao tranh 10 giây, quân tự hồi máu; trong căn cứ hồi 3% máu mỗi giây.</li>
    <li>Bạn chỉ thấy được địch trong <b>tầm nhìn</b> quanh tướng (rộng hơn khi đứng cạnh tháp canh).</li></ul>`],
  ['trophy', 'Bãi quái', `<h4>10 cấp bãi quái</h4><p>Cột mốc "Lv1"…"Lv10" trên bản đồ, chấm màu trên minimap. Cấp càng cao càng gần tâm, quái càng mạnh, đồ càng xịn. <b>Mỗi bãi 10 con</b>, mỗi con quái tự có tỉ lệ rơi đồ.</p>
    <table><tr><td>Lv1 Chuột khổng lồ</td><td>Lv2 Sói xám</td></tr><tr><td>Lv3 Goblin, Goblin cung</td><td>Lv4 Nhện độc</td></tr><tr><td>Lv5 Gấu nâu</td><td>Lv6 Orc chiến binh</td></tr><tr><td>Lv7 Troll đá</td><td>Lv8 Minotaur</td></tr><tr><td>Lv9 Wyvern</td><td>Lv10 Rồng cổ đại</td></tr></table>
    <ul><li>Từ Lv5 quái rất mạnh, cần đội lớn. Rồng cổ đại chắc chắn rơi 2 món (12% Huyền thoại, 38% Sử thi).</li><li><b>Quái, boss và lính canh mỏ không tự đánh ai</b>: đi ngang qua thoải mái. Muốn đánh thì <b>chuột phải vào một con</b> (hoặc ra lệnh chiếm mỏ có lính canh): cả đội vào trận, quái chỉ đánh trả người đã gây sự. Hết trận thì quái lại hiền.</li>
    <li>Dọn sạch bãi được thêm tài nguyên; 1 phút sau quái hồi lại.</li></ul>`],
  ['bag', 'Trang bị', `<h4>Đồ cho tướng</h4><p>6 ô: Vũ khí (sát thương), Mũ (máu), Giáp (giáp), Giày (tốc độ cả đội), Nhẫn, Bùa. Túi 16 ô.</p>
    <p>5 cấp: <span style="color:#c8c4b0">Thường</span>, <span style="color:#5fd35f">Tốt</span>, <span style="color:#4aa8ff">Hiếm</span>, <span style="color:#c070ff">Sử thi</span>, <span style="color:#ffa020">Huyền thoại</span>.</p>
    <ul><li>Đồ rơi từ quái ở bãi quái, lính canh mỏ, lãnh chúa NPC và <b>boss</b> (đồ xịn nhất).</li><li>Đồ quái rơi thuộc về người hạ: chuột trái để tướng tới nhặt (đồ người khác hiện ổ khóa xám).</li>
    <li>Nút Trang bị sáng lên khi có đồ mới; bấm vào đồ trong túi để mặc, nút ✕ để vứt.</li><li>Điểm danh 7 ngày: ngày 7 nhận đồ Huyền thoại.</li><li>Thế giới mở: tướng chết vẫn giữ nguyên đồ (mặc lại khi hồi sinh). Lãnh chúa NPC chết thì rơi đồ. Ván đấu: chết rơi hết đồ.</li></ul>`],
  ['house', 'Căn cứ', `<h4>Xây căn cứ (chỉ ở Thế giới mở)</h4><ul><li>B → tab <b>Công trình</b> → <b>Thành trì</b> → chuột trái lên bản đồ (ô xanh là đặt được). Cách trại xuất phát 10 ô, cách bãi quái 12 ô, cách boss 14 ô, cách căn cứ khác 28 ô. Ô đỏ là không đặt được (cây, đá, nước, quá gần…), rê chuột để xem lý do.</li>
    <li>Công trình khác đặt trong <b>vùng 13 ô quanh Thành trì</b> (khung vàng): <b>Tháp cung</b> bắn xa, bắn quân bay · <b>Pháo đá</b> nổ vùng diệt bộ binh đông (không bắn quân bay) · <b>Tháp phép</b> xuyên giáp · <b>Tường</b> chặn đường · <b>Kho</b> tăng sức chứa và bảo vệ tài nguyên.</li>
    <li>Bấm vào công trình của bạn để <b>nâng cấp, sửa, dời, phá bỏ</b>. Số việc xây cùng lúc = số <b>thợ xây</b>. Không được bịt kín lối vào Thành trì.</li></ul>
    <h4>Thành trì cấp 1–5</h4><ul><li>Mở thêm số lượng công trình, cấp tối đa, thợ xây, sức chứa, và <b>mở khóa quân</b> (cấp 1 Hiệp sĩ … cấp 5 Rồng).</li>
    <li>Muốn nâng Thành trì phải <b>xây đủ</b> Tháp cung, Pháo đá, Tháp phép, Kho của cấp hiện tại (tường không tính). Nâng xong có bảng báo những gì vừa mở.</li>
    <li><b>Thành trì cấp 5 (cấp cuối)</b>: xây bao nhiêu công trình cũng được (miễn còn chỗ trong vùng căn cứ). Vượt mức cấp 5 thì mỗi cái thêm làm giá xây và nâng cấp loại đó tăng 25% (tường: 2% mỗi bức). Số quân thì không giới hạn ở mọi cấp.</li>
    <li>Thời gian: Thành trì 40 giây → 20 phút → 1 giờ → 2 giờ → 3 giờ; tháp, pháo, kho xây 30–50 giây, nâng lên cấp 2 / 3 / 4 / 5: 10 phút / 30 phút / 1 giờ / 2 giờ.</li><li>Bị đánh phá: bấm <b>🔧 Sửa</b> trên thanh trên cùng (hoặc trong bảng Thành trì) để sửa tất cả cùng lúc, xong ngay, không tốn thợ (10% tổng đã đầu tư). Đang bị đánh thì chưa sửa được.</li></ul>
    <h4>Chặt cây, đập đá</h4><ul><li>Bấm chuột trái vào cây, xương rồng hay tảng đá <b>trong vùng căn cứ</b> của bạn → <b>🪓 Chặt</b> / <b>⛏ Đập</b>. Thợ xây làm (chiếm 1 thợ như khi xây nhà), tốn tài nguyên và có thời gian.</li>
    <li>Cây 30 Sắt + 10 Than, 40 giây · cây khô, xương rồng 15 Sắt, 20 giây · tảng đá 60 Sắt + 40 Than, 90 giây.</li>
    <li>Dọn xong ô đó trống mãi: xây nhà, đi lại được. Đôi khi tìm thấy Pha lê (cây) hoặc Kim cương (đá).</li></ul>
    <h4>Bẫy (ẩn với địch, không chặn đường)</h4><ul><li><b>Bom</b>: quân bộ địch dẫm vào là nổ vùng 1,5 ô. <b>Lò xo</b> (Thành trì 2+): hất quân bộ địch văng ra ngoài vùng căn cứ (2 → 6 ô quân theo cấp, không hất tướng). <b>Bom khí</b> (Thành trì 3+): quân bay tới gần là nổ trên trời.</li><li>Nổ xong tự nạp lại sau 2–2,5 phút. Bẫy nâng cấp được như công trình.</li></ul>
    <h4>Nâng Thành trì</h4><ul><li>Phải xây đủ số công trình của cấp hiện tại <b>và</b> nâng mọi công trình (trừ tường, nhà thợ xây) lên bằng cấp Thành trì.</li></ul>
    <h4>Nhà thợ xây</h4><ul><li>Mỗi Nhà thợ xây có 1 thợ, <b>tối đa 5 nhà ở mọi cấp Thành trì</b>. Nhà đầu tiên được tặng khi xây Thành trì; nhà thứ 2 → 5 rất đắt (Sắt, Than, Vàng và 120 / 300 / 600 / 1.000 Kim cương), nhà sau đắt hơn nhà trước. Nhà bị phá thì mất thợ đó tới khi sửa; luôn còn ít nhất 1 thợ.</li>
    <li>Thợ tự đi từ nhà ra chỗ làm: đóng búa khi xây, nâng cấp; chặt cây; đập đá. Ô 🔨 trên thanh trên cùng: thợ rảnh / tổng thợ.</li></ul>
    <h4>Tường (mỗi đoạn 1 ô, xây và nâng xong ngay)</h4><ul><li>Giữ chuột trái và kéo để xây cả hàng. Ô tường cạnh nhau tự nối liền.</li><li>Bấm một đoạn tường → <b>Nâng cả hàng</b>, hoặc <b>Dời cả cụm tường</b> (cả khối nối liền đi theo, giữ nguyên hình); Shift + chuột trái để chọn thêm từng đoạn.</li><li><b>Dời công trình</b>: giữ chuột trái vào nhà / tường của bạn rồi kéo tới chỗ mới, thả ra là xong (hoặc bấm vào nó → ✥ Dời → bấm chỗ mới).</li><li>Dời Thành trì thì cả căn cứ dời theo.</li></ul>
    <h4>Phòng thủ và tấn công</h4><ul><li>Căn cứ ở lại cả khi bạn offline và tự bắn kẻ địch. <b>Cất binh (C)</b> khi có căn cứ: lính vào trong và tự ra giữ nhà khi bị đánh. Bấm C lần nữa ở đâu cũng được: lính ra ngay quanh tướng.</li>
    <li>Tướng chết thì xuất trận lại ở Thành trì. Đứng trong căn cứ hồi 3% máu/giây.</li>
    <li>Chuột phải vào công trình địch để đánh. Phá Thành trì người khác: cướp 10% kho ngoài phần Kho bảo vệ (mỗi căn cứ 1 lần / 2 giờ, sau đó có khiên 30 phút).</li>
    <li>Lãnh chúa NPC cũng tự xây căn cứ. Họ không đánh nhà ai, nhưng bạn đánh nhà họ được.</li></ul>`],
  ['trophy', 'Boss và bo', `<h4>5 boss</h4><p>Golem Kim Cương ở tâm bản đồ, 4 boss quanh tâm: Chúa Tể Hắc Ín (Bắc), Nữ Hoàng Pha Lê (Đông), Vua Thổ Phỉ (Nam), Bọ Cạp Sa Mạc (Tây). Vòng đỏ dưới đất là chiêu sắp rơi, tránh ra! Ai hạ boss được báo cho cả thế giới.</p>
    <h4>Bo (chỉ ở Đấu theo ván)</h4><p>Từ phút 6, vùng an toàn thu hẹp 5 lần. Vòng trắng là bo sắp tới, vùng xanh là ngoài bo. Đứng ngoài bo thì mất máu, cả tướng lẫn quân.</p>`],
];
function openHelp(i = 0) {
  $('help').classList.remove('hidden');
  $('helptabs').innerHTML = HELP.map(([ic, name], k) => `<button data-h="${k}" class="${k === i ? 'on' : ''}">${px(ic, 20)}${name}</button>`).join('');
  $('helpbody').innerHTML = HELP[i][2];
  $('helptabs').querySelectorAll('[data-h]').forEach((b) => (b.onclick = () => openHelp(+b.dataset.h)));
}
$('helpbtn').onclick = () => openHelp();

// ---------------- matches
function updateJoinUI() {
  const M = S.match; if (!M) return;
  const me = S.players.get(S.you);
  const js = $('joinstatus'), gb = $('gobtn');
  let status = '', btn = '', dis = false, closed = false;
  if (S.mode === 'endless') {
    status = `Thế giới mở · ${M.alive} đội đang chơi · chết thì xuất trận lại · boss hồi sinh 10 phút sau khi bị hạ`; btn = 'XUẤT TRẬN';
  } else if (M.phase === 'lobby') {
    if (M.startIn) { status = `${M.startedBy ?? 'Ai đó'} đã bấm Bắt đầu · ván #${M.n} bắt đầu sau ${M.startIn} giây`; btn = `Bắt đầu sau ${M.startIn}s`; dis = true; }
    else { status = `Ván #${M.n} đang chờ người chơi. Ai bấm BẮT ĐẦU thì cả hàng chờ cùng vào ván.`; btn = 'BẮT ĐẦU'; }
  } else if (M.phase === 'run') {
    const canJoin = M.el < M.join && !me?.died;
    if (canJoin) { status = `Ván #${M.n} đang diễn ra (${mmss(M.el)}) · còn ${mmss(M.join - M.el)} để vào · ${M.alive} đội`; btn = 'VÀO TRẬN'; }
    else { closed = true; status = me?.died ? `Bạn đã ra khỏi ván #${M.n}. Có thể xem tiếp đến hết ván (tối đa ${mmss(M.len - M.el)} nữa), hoặc rời phòng.` : `Ván #${M.n} đã đóng cổng (${mmss(M.el)}). Chờ ván sau, trong lúc đó có thể xem trận.`; btn = 'XEM TRẬN'; }
  } else { closed = true; status = `Ván #${M.n} vừa kết thúc, hàng chờ mở ngay đây…`; btn = 'Đang tổng kết…'; dis = true; }
  if (js) { js.classList.toggle('closed', closed); js.textContent = status; }
  if (gb) { gb.textContent = btn; gb.disabled = dis; }
  renderLobbyPlayers();
}
function renderLobbyPlayers() {
  const box = $('lobbyplayers'); if (!box || $('pick').classList.contains('hidden')) return;
  const rows = [...S.players.values()].filter((p) => (!p.bot || p.alive) && !p.away).sort((a, b) => (b.id === S.you) - (a.id === S.you) || (b.alive - a.alive));
  box.innerHTML = rows.map((p) => {
    const st = p.alive ? ['play', 'Trong ván'] : p.died ? ['dead', 'Đã bị hạ'] : p.on ? ['wait', 'Hàng chờ'] : ['off', 'Vắng'];
    return `<span class="lp ${p.id === S.you ? 'me' : ''}"><b style="color:${p.color}">${esc(p.name)}</b>${p.bot ? ' 🤖' : ''}<i class="${st[0]}">${st[1]}</i></span>`;
  }).join('') || '<span class="lp">Chưa có ai</span>';
}
function showDeadBanner(info) {
  const h = HEROES[info.hero] ?? HEROES['thach-lam'];
  const why = info.killer ? `${h.name} đã ngã xuống dưới tay <b>${esc(info.killer)}</b>` : info.why === 'zone' ? `${h.name} gục ngoài bo` : `${h.name} đã ngã xuống`;
  const b = $('deadbanner');
  b.innerHTML = `<b class="t">ĐÃ BỊ HẠ</b>${why} · sống ${mmss(info.alive)} · ${info.score} điểm<br>Bạn đang xem trận. Hết ván sẽ có bảng kết quả rồi về hàng chờ.<br><button id="db-ok">Đóng</button>`;
  b.classList.remove('hidden');
  $('db-ok').onclick = () => b.classList.add('hidden');
  S.watching = true; S.watch = info.killerId;
}
function showResults(m) {
  const box = $('results');
  $('res-winner').innerHTML = m.winner ? `🏆 <b>${esc(m.winner.name)}</b> (${HEROES[m.winner.hero]?.name ?? ''}) thắng ván #${m.n}!` : `Ván #${m.n}: không ai sống sót.`;
  $('res-table').innerHTML = `<tr><th>#</th><th>Người chơi</th><th>Nhân vật</th><th>Điểm</th><th>Quân</th><th>Mỏ</th></tr>` + m.results.map((r) => `<tr class="${r.id === S.you ? 'me' : ''} ${m.winner?.id === r.id ? 'win' : ''}"><td>${r.rank}</td><td style="color:${r.color}">${esc(r.name)}${r.bot ? ' 🤖' : ''}${r.alive ? '' : ' ☠'}</td><td>${HEROES[r.hero]?.name ?? ''}</td><td>${r.score}</td><td>${r.units}</td><td>${r.mines}</td></tr>`).join('');
  $('res-next').textContent = `Hàng chờ mở lại sau ${m.next} giây`;
  $('defeat').classList.add('hidden'); $('deadbanner').classList.add('hidden');
  box.classList.remove('hidden');
}
$('res-close').onclick = () => { $('results').classList.add('hidden'); $('deadbanner').classList.add('hidden'); if (!S.alive || S.match?.phase !== 'run') showPick(); };
$('res-stay').onclick = (e) => { e.preventDefault(); $('results').classList.add('hidden'); };

// ---------------- shop
let shopTab = 'army';
for (const b of document.querySelectorAll('#shoptabs button')) b.onclick = () => { shopTab = b.dataset.st; for (const x of document.querySelectorAll('#shoptabs button')) x.classList.toggle('on', x === b); renderShop(true); };
$('buymult').onclick = () => {
  buyMult = buyMult === 1 ? 5 : 1;
  $('buymult').textContent = `×${buyMult}`;
  $('buymult').classList.toggle('on', buyMult === 5);
  if (!$('shop').classList.contains('hidden')) renderShop();
  if (!$('castledlg').classList.contains('hidden')) renderCastleDlg();
  if (!$('campdlg').classList.contains('hidden')) renderCampDlg();
  if (!$('craftdlg').classList.contains('hidden') && craft.mode === 'forge') renderCraft(); // costs vs resources
};
function toggleShop() { const s = $('shop'); s.classList.toggle('hidden'); document.querySelector('.rb.shop')?.classList.toggle('on', !s.classList.contains('hidden')); if (!s.classList.contains('hidden')) renderShop(true); }
function buy(type, n = 1) { send({ t: 'buy', type, n }); }
let shopBuilt = false;
/** Thú cưng (13/11/2026): picture from /assets/pets/<id>.png (4 walk frames in a row) when it exists, else the emoji */
const PET_IMG = {};
export function petImg(id) { if (!(id in PET_IMG)) { const i = new Image(); PET_IMG[id] = null; i.onload = () => (PET_IMG[id] = i); i.src = `/assets/pets/${id}.png?v=${S.av ?? ''}`; } return PET_IMG[id]; }
const PET8M = {}; fetch('/assets/pets/dir.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).then((j) => { Object.assign(PET8M, j); const g = $('pshopgrid'); if (g) g.dataset.k = ''; }).catch(() => {});
function petPic(id, size = 56, anim = false) {
  const M = PET8M[id], n = M?.small?.dung; // 8-way art (13/11/2026): the front-facing stance, row 1 of <id>/dung.png
  if (n) return `<span class="petpic" style="width:${size}px;height:${size}px;background:url(/assets/pets/${id}/dung.png?v=${M.v}) 0 0 / ${size * n}px ${size * 8}px no-repeat;image-rendering:pixelated"></span>`;
  const im = petImg(id); return im ? `<span class="petpic${anim ? ' anim' : ''}" style="--s:${size}px;width:${size}px;height:${size}px;background:url(${im.src}) 0 0 / ${size * 4}px ${size * 2}px no-repeat"></span>` : `<span class="petemo" style="font-size:${Math.round(size * 0.7)}px">${PETS[id].icon}</span>`; }
function renderPetShop() {
  const me = S.me, grid = $('pshopgrid'), have = Object.fromEntries(RES.map((r, i) => [r, me?.res[i] ?? 0])), own = new Set(me?.pets ?? []);
  const key = JSON.stringify([me?.pets, me?.pet, (S.inv?.bag ?? []).map((i) => i.id), (S.chest?.items ?? []).length, me?.sl]) + Object.keys(PET_IMG).filter((k) => PET_IMG[k]).length;
  const soul = me?.sl?.[0] ?? 0, refOf = (id) => me?.sl?.[1]?.[id] ?? 0; // Than Hồn + Hỏa luyện (Địa Ngục, 16/11/2026)
  if (grid.dataset.k === key) return; grid.dataset.k = key;
  const card = ([id, P]) => {
    const PT = petTier(id);
    // price: one orange item of P.pay (bag + Rương đồ)
    const nOr = [...(S.inv?.bag ?? []), ...(S.chest?.items ?? [])].filter((it) => it?.slot === P.pay && it.tier === PT).length;
    const mine = own.has(id), on = me?.pet === id, lack = !nOr;
    const TN = TIER_INFO[PT].name, cost = `<span class="petpay${lack ? ' miss' : ''}" title="Trả bằng 1 món ${TN} ô ${SLOT_INFO[P.pay].name} (trong túi hoặc Rương đồ, lấy món level thấp nhất)"><span class="cc t-${PT}">${itemIcon(P.pay, PT, 22) || ''}</span>1 ${SLOT_INFO[P.pay].name} ${TN} <small>(có ${nOr})</small></span>`;
    const F0 = petFight(id, S.me?.hl?.[0] ?? 1), rk = 1 + PET_REFINE_STEP * (me?.sl?.[1]?.[id] ?? 0), F = { ...F0, hp: Math.round(F0.hp * rk), atk: Math.round(F0.atk * rk * 10) / 10 }; // with Hỏa luyện
    return `<div class="card petcard pt-${PT}${on ? ' on' : ''}" data-pet="${id}"><div class="sp">${petPic(id, 72, true)}</div><div class="nm">${P.name}</div><div class="cls petfx">🛡 ${P.text}</div>
      <div class="petfight" title="Hình thái chiến đấu: khi tướng giao chiến, thú cưng hoá lớn và đánh cùng (chỉ số theo cấp tướng)">⚔ ${P.role}<br>❤ ${F.hp.toLocaleString('vi')} · ⚔ ${F.atk} · ${F.range > 2 ? `tầm ${F.range}` : 'cận chiến'}</div>
      ${mine ? `<div class="petref" title="Hỏa luyện bằng Than Hồn (kiếm ở Địa Ngục): mỗi cấp +${PET_REFINE_STEP * 100}% máu và sát thương dạng chiến đấu, cả thế giới mở và Địa Ngục">🔥 Hỏa luyện ${refOf(id)}/${PET_REFINE_MAX}${refOf(id) ? ` · +${Math.round(refOf(id) * PET_REFINE_STEP * 100)}%` : ''}</div>` : ''}
      <div class="cost">${mine ? '<span class="owned">✓ Đã có</span>' : cost}</div><button class="${mine ? (on ? 'peton' : 'petuse') : lack ? 'lack petbuy' : 'petbuy'}">${mine ? (on ? '✓ Đang đi theo' : 'Cho đi theo') : 'MUA'}</button>
      ${on && refOf(id) < PET_REFINE_MAX ? `<button class="petrefb${soul < petRefineCost(refOf(id) + 1) ? ' lack' : ''}">🔥 Hỏa luyện: ${petRefineCost(refOf(id) + 1)} Than Hồn (có ${soul})</button>` : ''}</div>`;
  };
  grid.innerHTML = PET_TIER_GROUPS.map(([T, label]) => { const list = Object.entries(PETS).filter(([id]) => petTier(id) === T); return list.length ? `<div class="pettier t-${T}"><b>${label}</b><small>đổi bằng 1 món ${TIER_INFO[T].name} đúng ô</small></div>` + list.map(card).join('') : ''; }).join('');
  grid.querySelectorAll('.petrefb').forEach((b) => (b.onclick = () => send({ t: 'pet-refine' })));
  grid.querySelectorAll('.petcard').forEach((c) => (c.querySelector('button').onclick = () => { const id = c.dataset.pet; if (!own.has(id)) send({ t: 'pet-buy', id }); else send({ t: 'pet-use', id: me.pet === id ? null : id }); }));
  const f = $('shopfoot'), t = '🛡 Phúc lợi cho cả đội (tướng + lính) luôn có hiệu lực. ⚔ Khi tướng giao chiến, thú cưng hoá lớn và đánh cùng (chỉ số tăng theo cấp tướng), hết trận thì thu nhỏ; bị hạ thì nghỉ 90 giây. Giá: Linh thú 1 món Tím, Thần thú 1 món Cam, Thánh thú (Tứ Linh) 1 món Đỏ, Thượng cổ thần thú 1 món Đen, đúng ô (túi hoặc Rương đồ). Mua 1 lần dùng mãi, mỗi lúc 1 con đi theo.';
  if (f.dataset.k !== t) { f.dataset.k = t; f.textContent = t; }
}
function renderShop(rebuild) {
  const me = S.me; if (!me) return;
  const sr = $('shopres'), srHtml = S.mobile ? compactResHtml(me) : '';
  if (sr && sr.dataset.h !== srHtml) { sr.dataset.h = srHtml; sr.innerHTML = srHtml; }
  const bt = S.room?.mode === 'endless';
  $('shoptabs').classList.toggle('hidden', !bt);
  if (!bt) shopTab = 'army';
  $('buymult').classList.toggle('hidden', shopTab !== 'army');
  $('shopgrid').classList.toggle('hidden', shopTab !== 'army'); $('bshopgrid').classList.toggle('hidden', shopTab !== 'build'); $('dshopgrid').classList.toggle('hidden', shopTab !== 'deco');
  $('pshopgrid').classList.toggle('hidden', shopTab !== 'pet');
  if (shopTab === 'pet') { renderPetShop(); return; }
  if (shopTab === 'deco') {
    renderBuildShop($('dshopgrid'), (type) => { startPlace(type); $('shop').classList.add('hidden'); document.querySelector('.rb.shop')?.classList.remove('on'); }, Object.keys(DECOS));
    const f = $('shopfoot'), t = 'Đồ trang trí: chỉ để làm đẹp, không máu, không bị phá, lính đi xuyên qua. Đặt ngay, không cần thợ xây. Cất lại được, hoàn đủ tiền. Số lượng mỗi món tăng theo cấp Thành trì.';
    if (f.dataset.k !== t) { f.dataset.k = t; f.textContent = t; }
    return;
  }
  if (shopTab === 'build') {
    renderBuildShop($('bshopgrid'), (type) => { startPlace(type); $('shop').classList.add('hidden'); document.querySelector('.rb.shop')?.classList.remove('on'); });
    const f = $('shopfoot'), cap = me.cap ? RES.map((r, i) => `${RES_INFO[r].name} ${me.cap[i].toLocaleString('vi')}`).join(' · ') : '';
    const t = `Xây trong vùng ${BASE_ZONE} ô quanh Thành trì. Sức chứa hiện tại: ${cap}`;
    if (f.dataset.k !== t) { f.dataset.k = t; f.textContent = t; }
    return;
  }
  const grid = $('shopgrid');
  if (!shopBuilt || rebuild) {
    shopBuilt = true; grid.innerHTML = '';
    for (const [type, u] of Object.entries(UNITS)) {
      const c = document.createElement('div'); c.className = 'card' + (type === 'rong' ? ' dragon' : ''); c.dataset.type = type;
      const cls = CLASS_NAME[u.cls];
      const strong = CLASSES.filter((d) => K(u.cls, d) >= 1.3).map((d) => CLASS_NAME[d]).join(', ');
      const weak = CLASSES.filter((a) => K(a, u.cls) >= 1.3).map((a) => CLASS_NAME[a]).join(', ');
      c.title = `${u.desc}\nHP ${u.hp} · ATK ${u.atk} · hồi ${u.cd}s · tầm ${u.range} · giáp ${u.armor * 100}% · tốc độ ${u.speed}\nKhắc: ${strong || '—'}\nBị khắc bởi: ${weak || '—'}`;
      c.innerHTML = `<span class="hk">${u.n % 10}</span><div class="sp"></div><div class="nm">${u.name}</div><span class="hous" title="Chiếm ${HOUSING[type] ?? 1} chỗ trong Doanh trại / Hội thành">${HOUSING[type] ?? 1} chỗ</span><div class="cls">${cls} · triệu tập ${u.summon}s</div><div class="cost"></div><div class="stats">HP ${u.hp} · ATK ${u.atk} · tầm ${u.range}</div><button>MUA</button>`;
      c.dataset.skin = ''; // the picture follows the researched level (13/11/2026), set in the loop below
      c.querySelector('button').onclick = (e) => {
        const ac = S.me?.ac;
        if (ac?.[1] && ac[0] >= ac[1]) {
          const b = S.myBase, th = b?.items.find((i) => i.type === 'thanh-tri'), camps = b?.items.filter((i) => i.type === 'doanh-trai') ?? [], lim = th ? TOWN_HALL.levels[th.lv - 1]?.max['doanh-trai'] ?? 3 : 0;
          const rows = [{ icon: '⛺', text: `Doanh trại đã đầy: ${ac[0]} / ${ac[1]} lính`, sub: 'tính cả lính đang cất trong căn cứ và đang triệu tập' }];
          if (camps.length < lim) rows.push({ icon: '🏗', text: `Xây thêm Doanh trại (${camps.length}/${lim})`, sub: 'mỗi Doanh trại cấp 1 chứa 70 lính' });
          const low = camps.filter((i) => i.lv < (th?.lv ?? 1) && i.lv < 8);
          if (low.length) rows.push({ icon: '⬆', text: `Nâng cấp Doanh trại (${low.length} cái chưa đủ cấp)`, sub: `sức chứa theo cấp: ${BUILDINGS['doanh-trai'].barracks.join(' / ')}` });
          if (!camps.length) rows.push({ icon: '🏰', text: 'Chưa có Doanh trại', sub: `không có thì chỉ được ${ac[1]} lính` });
          rows.push({ icon: '🗑', text: 'Hoặc giải tán bớt lính', sub: 'bấm vào lính → Giải tán (hoàn 30%)' });
          return showNeed('Không mua thêm lính được', rows);
        }
        buy(type, e.shiftKey ? 5 : buyMult);
      };
      grid.appendChild(c);
    }
  }
  const have = Object.fromEntries(RES.map((r, i) => [r, me.res[i]]));
  for (const c of grid.children) {
    { const t = c.dataset.type, sk = skinOf(t, S.room?.mode === 'endless' ? S.unitLv?.[t] ?? 1 : 1); if (c.dataset.skin !== sk) { c.dataset.skin = sk; const sp = c.querySelector('.sp'); sp.innerHTML = ''; sp.appendChild(th(sk, t === 'rong' ? 0.55 : UNITS[t].slots > 1 ? 0.8 : 1.2, 'walk')); } }
    const type = c.dataset.type;
    const ulv = S.room?.mode === 'endless' ? S.unitLv?.[type] ?? 1 : 1, cost = unitCost(type, S.heroType, ulv);
    { const t2 = c.querySelector('.ulv') ?? c.appendChild(Object.assign(document.createElement('span'), { className: 'ulv' })); t2.textContent = ulv > 1 ? `Cấp ${ulv}` : ''; }
    { // stats at my researched level and with my hero's bonus (same as server unitStats)
      const b = UNITS[type], m = UNIT_LV_MULT[ulv - 1] ?? 1, ht = S.heroType; let hp = b.hp * m, atk = b.atk * m, rg = b.range;
      if (ht === 'thach-lam' && (b.cls === 'inf' || b.cls === 'spear')) { hp *= 1.15; atk *= 1.1; }
      if (ht === 'phong-vu' && b.cls === 'cav') atk *= 1.15;
      if (ht === 'lam-nguyet' && (b.cls === 'ranged' || b.cls === 'magic')) { rg += 1; atk *= 1.15; }
      if (ht === 'hoa-ky') { if (b.cls === 'fly') hp *= 1.15; if (b.cls === 'inf') atk *= 0.9; }
      const txt = `HP ${Math.round(hp)} · ATK ${Math.round(atk * 10) / 10} · tầm ${rg}`, el = c.querySelector('.stats');
      if (el && el.textContent !== txt) { el.textContent = txt; el.classList.toggle('up', ulv > 1); }
    }
    c.querySelector('.cost').innerHTML = Object.entries(cost).map(([r, v]) => `<span class="${have[r] < v ? 'miss' : ''}"><i class="ic" data-r="${r}" title="${RES_INFO[r].name}" style="--c:${RES_INFO[r].color}"></i>${v}</span>`).join('');
    const ok = Object.entries(cost).every(([r, v]) => have[r] >= v);
    const own = (me.counts[type] ?? 0) + me.q.filter((q) => q[0] === type).length;
    const lbl = buyMult > 1 ? `MUA ×${buyMult}` : 'MUA';
    // open world: stronger units need a Thành trì level
    const need = S.room?.mode === 'endless' ? UNIT_TH[type] ?? 0 : 0, thl = S.myBase?.items.find((i) => i.type === 'thanh-tri')?.lv ?? 0, locked = need > thl;
    const full = !!(me.ac?.[1] && me.ac[0] + (HOUSING[type] ?? 1) > me.ac[1]); // Doanh trại: not enough room for this one (counted by housing)
    const b = c.querySelector('button'); b.disabled = (!ok || locked) && !full; b.classList.toggle('lack', full);
    b.textContent = full ? (S.mobile ? '⛺ Đầy' : '⛺ DOANH TRẠI ĐẦY') : S.mobile ? (locked ? `🔒 Cấp ${need}` : own ? `${lbl} (${own})` : lbl) : (locked ? `🔒 Thành trì cấp ${need}` : own ? `${lbl} · có ${own}` : lbl);
    c.classList.toggle('locked', locked);
  }
  const foot = $('shopfoot');
  const k = me.ac?.[1] ? `Doanh trại: ${me.ac[0]} / ${me.ac[1]} chỗ (tính theo chỗ ở: dân quân, cung thủ 1 · kiếm sĩ, lính giáo 2 · pháp sư 3 · kỵ binh 4 · hiệp sĩ 5 · máy bắn đá 6 · sư thứu 7 · rồng 8; gồm cả lính đang cất và đang triệu tập). Xây / nâng Doanh trại để chứa thêm.` : `Đang có ${Object.values(me.counts).reduce((a, b) => a + b, 0)} quân. Không giới hạn số lượng, đội hình lục giác tự giãn theo số quân.`;
  if (foot.dataset.k !== k) { foot.dataset.k = k; foot.textContent = k; }
}

// ---------------- info panel
let infoKey = '';
function renderInfo(force) {
  const box = $('info'), sel = S.sel;
  if (!sel) { box.classList.add('hidden'); infoKey = ''; return; }
  let html = '', key = '';
  const xbtn = '<button type="button" class="pnl-x" id="info-x" title="Đóng (Esc)">✕</button>'; // 13/11/2026: the panel sits in the middle now, always closable
  if (sel.k === 'obst') {
    const h2 = obstInfoHtml(sel);
    if (!h2) { box.classList.add('hidden'); return; }
    key = 'o' + h2 + S.mobile;
    if (key === infoKey && !force) return;
    infoKey = key; box.innerHTML = xbtn + h2; box.classList.remove('hidden');
    wireObstInfo(sel, send, (id, f) => { const b = $(id); if (b) b.onclick = f; });
    const ix = $('info-x'); if (ix) ix.onclick = () => { S.sel = null; renderInfo(true); };
    return;
  }
  if (sel.k === 'build') {
    const h2 = buildInfoHtml(sel);
    if (!h2) { box.classList.add('hidden'); return; }
    key = 'b' + h2 + (S.me?.res ?? []).join(',') + S.mobile;
    if (key === infoKey && !force) return;
    infoKey = key; box.innerHTML = xbtn + h2; box.classList.remove('hidden');
    wireBuildInfo(sel, send, (id, f) => { const b = $(id); if (b) b.onclick = f; }, () => renderInfo(true));
    const ix = $('info-x'); if (ix) ix.onclick = () => { S.sel = null; renderInfo(true); };
    return;
  }
  if (sel.k === 'unit') {
    const u = S.byId.get(sel.id);
    if (!u) { box.classList.add('hidden'); return; }
    const def = UNITS[u.type] ?? GUARDS[u.type] ?? BOSSES[u.type] ?? null, hero = HEROES[u.type];
    const p = S.players.get(u.owner);
    const name = hero ? `${hero.name}` : def?.name ?? u.type;
    const gar = (u.flags & 4) && u.owner;
    const owner = gar ? (u.owner === S.you ? 'Đồn lính giữ mỏ của bạn' : `Đồn lính giữ mỏ của ${esc(p?.name ?? '?')}`) : u.owner === S.you ? 'Quân của bạn' : p ? `Của ${esc(p.name)}` : BOSSES[u.type] ? 'BOSS · rơi đồ xịn' : 'Lính canh mỏ';
    key = `${sel.id}|${Math.ceil(u.hp)}|${u.owner}|${S.mobile}|${S.party?.members.map((m) => m.id).join(',') ?? ''}`;
    if (key === infoKey && !force) return;
    const cls = hero ? 'Anh hùng' : CLASS_NAME[def?.cls] ?? '';
    html = `${xbtn}<h3>${name}</h3><div class="muted">${hero ? hero.title + ' · ' : ''}${cls} · <span style="color:${p?.color ?? '#f0c030'}">${owner}</span></div>
      <table><tr><td>Máu</td><td>${Math.ceil(u.hp)} / ${u.maxHp}</td></tr>${def ? `<tr><td>Tấn công</td><td>${def.atk}</td></tr><tr><td>Giáp</td><td>${Math.round(def.armor * 100)}%</td></tr><tr><td>Tầm</td><td>${def.range} ô</td></tr>` : ''}</table>`;
    if (u.owner === S.you && UNITS[u.type] && !gar) html += `<button id="dismiss">Giải tán (hoàn 30%)</button>`;
    const mate = S.party?.members.some((m) => m.id === u.owner);
    if (u.owner !== S.you && S.alive && !mate) html += `<button id="attack">${u.flags & 2 ? 'Đuổi theo' : 'Tấn công'}</button>`;
    if ((u.flags & 2) && u.owner !== S.you && p) html += `<button id="pinfob">📋 Xem thông tin</button>`;
    if ((u.flags & 2) && u.owner !== S.you && p && !p.bot && S.room?.mode === 'endless') html += mate ? (S.party.leader === S.you ? `<button id="pkickb">✕ Mời ${esc(p.name)} ra khỏi tổ đội</button>` : '<div class="muted">🤝 Đồng đội trong tổ</div>') : `<button id="pinvb">🤝 Mời vào tổ đội</button>`;
    if (u.owner === S.you && hero) html += `<button id="skillb">Kỹ năng (Q): ${hero.skill.name}</button><button id="swapb">⇄ Đổi nhân vật chính</button><button id="shopb">Cửa hàng (B)</button><button id="stopb">Dừng (H)</button>`;
  } else {
    const m = S.mines[sel.id];
    const info = RES_INFO[m.type], p = S.players.get(m.owner);
    key = `m${m.id}|${m.owner}|${m.capBy}|${m.cap >> 4}|${m.guards}|${m.held >> 3}|${m.respawn >> 3}|${S.mobile}|${m.lv}|${m.up >> 2}|${m.owner === S.you ? Math.floor(Date.now() / 3000) : ''}`;
    if (key === infoKey && !force) return;
    const mlv = m.lv ?? 1, real = m.owner ? Math.round(info.rate * (1 + holdBonus(m.held)) * MINE_LV_MULT[mlv - 1]) : 0;
    html = `${xbtn}<h3>${info.mine}</h3><div class="muted">(${Math.floor(m.x)}, ${Math.floor(m.y)}) · <span style="color:${p?.color ?? '#aaa'}">${p ? 'Chủ: ' + esc(p.name) : 'Trống'}</span></div>
      ${m.protect ? `<div style="color:#7ad0ff">🛡 Đang được bảo vệ (chủ mỏ vừa chết): không ai chiếm được, còn ${Math.max(0, Math.ceil((m.protectAt - now()) / 60))} phút</div>` : ''}<table><tr><td>Cấp mỏ</td><td>${mlv} / ${MINE_LV_MULT.length} (×${MINE_LV_MULT[mlv - 1]})${m.upAt ? ` · đang nâng, còn ${fmtTime(Math.max(0, m.upAt - now()))}` : ''}</td></tr><tr><td>Sản lượng gốc</td><td>${info.rate}/phút</td></tr>${m.owner ? `<tr><td>Giữ liên tục</td><td>${Math.floor(m.held / 60)} phút (+${Math.round(holdBonus(m.held) * 100)}%)</td></tr><tr><td>Sản lượng thực</td><td>~${real}/phút</td></tr>` : ''}
      <tr><td>Lính canh</td><td>${m.guards || 'không'}</td></tr>${m.respawn && !m.guards && !m.owner && ['gold', 'oil', 'tar', 'crystal', 'diamond'].includes(m.type) ? `<tr><td>Lính canh sinh lại</td><td>${Math.floor(m.respawn / 60)}:${String(m.respawn % 60).padStart(2, '0')}</td></tr>` : ''}
      <tr><td>Thời gian chiếm</td><td>${info.capture[m.owner ? 1 : 0] * (S.heroType === 'kim-ha' ? 0.65 : 1)}s</td></tr>${m.capBy ? `<tr><td>Đang bị chiếm</td><td>${Math.round((m.cap / 255) * 100)}%</td></tr>` : ''}</table>
      <div class="muted">Đứng trong vòng ${CAPTURE_R(m.type)} ô quanh mỏ, không còn lính canh và địch thì cờ tự lên.</div>`;
    if (m.owner !== S.you && S.alive) html += `<button id="gomine">Đi tới mỏ này</button>`;
    if (m.owner === S.you) { const nm = S.mines.filter((q) => q.owner === S.you).length; html += `<div class="muted">Lính canh dựng theo đội quân lúc chiếm (20% quân, tối đa 30). Quân mạnh lên thì cập nhật lại:</div><button id="garref">🛡 Cập nhật lính canh mỏ này</button>${nm > 1 ? `<button id="garrefall">🛡 Cập nhật lính canh tất cả ${nm} mỏ</button>` : ''}`; }
    if (m.owner === S.you && S.room?.mode === 'endless') html += `<button id="minemove">✥ Dời mỏ (trong 12 ô quanh vị trí gốc)</button>`;
    if (m.owner === S.you && S.room?.mode === 'endless') { const nT = S.mines.filter((q) => q.owner === S.you && q.type === m.type).length, capT = MINE_CAP[m.type] + (S.me?.mx?.[m.type] ?? 0); html += `<div class="muted">Bạn đang giữ ${nT} / ${capT} ${info.mine}.</div><button id="mineabandon" class="${S.abandonAsk === m.id ? 'warnbtn' : ''}">${S.abandonAsk === m.id ? '⚠ Bấm lần nữa để bỏ mỏ (giữ lại cấp mỏ cho mỏ)' : '🏳 Bỏ mỏ này (để chiếm mỏ khác)'}</button>`; }
    if (m.owner === S.you && S.room?.mode === 'endless' && mlv < MINE_LV_MULT.length && !m.upAt) {
      const c = mineUpCost(m.type, mlv + 1), thl = S.myBase?.items.find((i) => i.type === 'thanh-tri')?.lv ?? 0, have = Object.fromEntries(RES.map((r, i) => [r, S.me?.res[i] ?? 0]));
      const bc = builderCount(), lack = thl < mlv + 1 || !bc?.free || Object.entries(c).some(([r, v]) => have[r] < v);
      html += `<div class="muted">Cấp ${mlv + 1}: sản lượng ×${MINE_LV_MULT[mlv]} · ${fmtTime(MINE_UP_TIME[mlv])}. Cần 1 thợ xây. Mỏ bị chiếm vẫn giữ cấp.</div><div class="mcost">Giá: ${Object.entries(c).map(([r, v]) => `<span class="rc${have[r] < v ? ' miss' : ''}">${v.toLocaleString('vi')} ${RES_INFO[r].name}</span>`).join(', ')}</div><button id="mineup" class="${lack ? 'lack' : ''}">⬆ Nâng cấp mỏ lên cấp ${mlv + 1}${lack ? ' <small class="lackt">(còn thiếu, bấm để xem)</small>' : ''}</button>`;
    }
  }
  infoKey = key;
  box.innerHTML = html; box.classList.remove('hidden');
  const on = (id, f) => { const b = $(id); if (b) b.onclick = f; };
  on('info-x', () => { S.sel = null; renderInfo(true); });
  on('dismiss', () => { if (confirm('Giải tán quân này? Bạn nhận lại 30% giá.')) { send({ t: 'dismiss', id: sel.id }); S.sel = null; renderInfo(true); } });
  on('attack', () => send({ t: 'chase', id: sel.id }));
  on('skillb', useSkill); on('swapb', openSwap); on('shopb', toggleShop); on('stopb', () => send({ t: 'stop' }));
  on('gomine', () => send({ t: 'mine', id: sel.id }));
  on('pinfob', () => { const u = S.byId.get(sel.id); if (u) send({ t: 'pinfo', id: u.owner }); });
  on('pinvb', () => { const u = S.byId.get(sel.id); if (u) send({ t: 'party-invite', id: u.owner }); });
  on('pkickb', () => { const u = S.byId.get(sel.id); if (u) send({ t: 'party-kick', id: u.owner }); });
  on('garref', () => send({ t: 'garrison-refresh', id: sel.id }));
  on('garrefall', () => send({ t: 'garrison-refresh' }));
  on('mineabandon', () => { if (S.abandonAsk === sel.id) { S.abandonAsk = null; send({ t: 'mine-abandon', id: sel.id }); } else { S.abandonAsk = sel.id; setTimeout(() => { if (S.abandonAsk === sel.id) { S.abandonAsk = null; renderInfo(true); } }, 4000); } renderInfo(true); });
  on('minemove', () => { S.mineMove = { id: sel.id }; notice({ kind: 'ok', text: S.mobile ? 'Chạm 2 lần vào chỗ mới để dời mỏ' : 'Bấm vào chỗ mới để dời mỏ · chuột phải / Esc: thôi' }); });
  on('mineup', () => {
    const m = S.mines[sel.id], lv = (m.lv ?? 1) + 1, thl = S.myBase?.items.find((i) => i.type === 'thanh-tri')?.lv ?? 0, bc = builderCount(), need = [];
    if (thl < lv) need.push({ icon: '🏰', text: `Thành trì cấp ${lv}`, sub: `mỏ cấp ${lv} cần Thành trì cấp ${lv} (đang cấp ${thl})` });
    if (!bc?.free) need.push({ icon: '🔨', text: 'Hết thợ xây', sub: bc ? `${bc.total - bc.free}/${bc.total} thợ đang bận · đợi xong việc hoặc xây thêm Nhà thợ xây` : 'cần có căn cứ (Thành trì)' });
    need.push(...resNeeds(mineUpCost(m.type, lv)));
    if (need.length) return showNeed(`Chưa nâng được ${RES_INFO[m.type].mine} lên cấp ${lv}`, need);
    send({ t: 'mine-up', id: sel.id });
  });
}
function renderBoard() {
  const rows = [...S.players.values()].filter((p) => !p.bot).sort((a, b) => b.score - a.score); // NPC lords are not ranked
  $('boardtbl').innerHTML = `<tr><th>#</th><th>Người chơi</th><th>Nhân vật</th><th>Điểm</th><th>Mỏ</th><th>Quân</th><th>🐉</th><th>Cao nhất</th></tr>` +
    rows.map((p, i) => `<tr class="${p.id === S.you ? 'me' : ''}"><td>${i + 1}</td><td style="color:${p.color}">${esc(p.name)}${p.bot ? ' 🤖' : ''}${p.on ? '' : ' (vắng)'}</td><td>${p.alive ? HEROES[p.hero]?.name ?? '' : '—'}</td><td>${p.score}</td><td>${p.mines}${p.dia ? ' 💎' : ''}</td><td>${p.units}</td><td>${p.dragons || ''}</td><td>${p.best}</td></tr>`).join('');
}

// ================================================================= main loop
let lastView = 0, lastT = now(), hudT = 0;
function frame() {
  const t = now(), dt = Math.min(0.05, t - lastT); lastT = t;
  if (hellState.on) { drawHell(ctx, W, H); (PIPW ?? window).requestAnimationFrame(frame); return; } // Địa Ngục (16/11/2026)
  if (S.joined && SPR.ready) {
    interpolate();
    tickJoy();
    const h = S.byId.get(S.me?.hero);
    const panning = !!(drag || cGesture?.moved);
    if (h) S.lastHero = { x: h.x, y: h.y };
    if (S.centerOnHero && h) { centerHero(); S.centerOnHero = false; cam.follow = true; }
    if (S.watching && S.watch) { const p = S.players.get(S.watch); if (p?.x != null) { cam.x += (p.x * T - W / cam.z / 2 - cam.x) * 0.1; cam.y += (p.y * T - H / cam.z / 2 - cam.y) * 0.1; } }
    else if (cam.follow && h && !panning) {
      const hx = h.x * T - cam.x - W / cam.z / 2, hy = h.y * T - cam.y - H / cam.z / 2;
      const dzx = (W / cam.z) * 0.2, dzy = (H / cam.z) * 0.2;
      if (Math.abs(hx) > dzx) cam.x += (hx - Math.sign(hx) * dzx) * 0.12;
      if (Math.abs(hy) > dzy) cam.y += (hy - Math.sign(hy) * dzy) * 0.12;
    }
    if (!panning && (Math.abs(cam.vx) > 0.05 || Math.abs(cam.vy) > 0.05)) { cam.x += cam.vx; cam.y += cam.vy; cam.vx *= 0.85; cam.vy *= 0.85; } else if (!panning) { cam.vx = cam.vy = 0; }
    const ks = 600 * dt / cam.z;
    if (keys.ArrowLeft) cam.x -= ks; if (keys.ArrowRight) cam.x += ks; if (keys.ArrowUp) cam.y -= ks; if (keys.ArrowDown) cam.y += ks;
    if (S.mobile && S.alive && !S.freeCam) { S.centerOnHero = false; pinHeroCam(); }
    else if (S.freeCam && (!S.alive || !S.mobile)) setFreeCam(false);
    clampCam();
    S.hover = (panning || S.mobile || S.mouseOnMap === false) ? null : pick(S.mouse.x, S.mouse.y);
    canvas.style.cursor = drag ? 'grabbing' : S.targeting ? 'crosshair' : S.build ? '' : gameCursor();
    draw(ctx, W, H);
    drawBubbles(ctx);
    drawRevenge(t);
    drawMinimap(t);
    tooltip();
    if (S.mobile) { updateMobaPad(t); updateMobileCtx(); }
    if (t - hudT > 0.1) { hudT = t; renderHud(); renderInfo(false); if (!$('board').classList.contains('hidden')) renderBoard(); if (S.mobile && !$('m-drawer').classList.contains('hidden')) renderMobileDrawer(); }
    if (t - lastView > 0.25) { lastView = t; send({ t: 'view', x: cam.x / T, y: cam.y / T, w: W / cam.z / T, h: H / cam.z / T }); }
  }
  (PIPW ?? window).requestAnimationFrame(frame); // the PiP window keeps drawing even when this tab is hidden
}
function tooltip() {
  if (S.invTip) return;
  const tip = $('tip'), hv = S.hover;
  if (!hv) { tip.classList.add('hidden'); return; }
  let s = '';
  tip.classList.remove('itip');
  if (hv.k === 'item') { const g = S.items.find((q) => q.id === hv.id); if (!g) return; tip.innerHTML = itemTip(g.item) + (g.owner && g.owner !== S.you ? `<br><span class="down">🔒 Chiến lợi phẩm của ${esc(S.players.get(g.owner)?.name ?? 'người khác')}</span>` : '<br><small>Chuột trái để nhặt</small>'); tip.classList.add('itip'); tip.classList.remove('hidden'); tip.style.left = S.mouse.x + 14 + 'px'; tip.style.top = S.mouse.y + 16 + 'px'; return; }
  if (hv.k === 'unit') { const u = S.byId.get(hv.id); if (!u) return; const p = S.players.get(u.owner); s = `${HEROES[u.type]?.name ?? UNITS[u.type]?.name ?? GUARDS[u.type]?.name ?? BOSSES[u.type]?.name ?? (PETS[u.type] ? '🐾 ' + PETS[u.type].name : u.type)} · ${p ? p.name : 'lính canh'} · ${Math.ceil(u.hp)}/${u.maxHp}`; }
  else { const m = S.mines[hv.id]; const p = S.players.get(m.owner); s = `${RES_INFO[m.type].mine} · ${p ? p.name : 'trống'}${m.guards ? ` · ${m.guards} lính canh` : ''}`; }
  tip.textContent = s + (hv.k === 'unit' && BOSSES[S.byId.get(hv.id)?.type] ? ' · BOSS' : ''); tip.classList.remove('hidden');
  tip.style.left = S.mouse.x + 14 + 'px'; tip.style.top = S.mouse.y + 16 + 'px';
}
requestAnimationFrame(frame);

// ---------------------------------------------------------------- Trợ lý AI (16/11/2026): a bubble in the free space on the left, a small chat window, answers streamed
const ADV = { open: false, busy: false, cur: null, asked: false };
const advEsc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const advMd = (t) => advEsc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^#{1,4}\s*(.+)$/gm, '<b>$1</b>').replace(/^[-•]\s+/gm, '• ').replace(/\n/g, '<br>');
function advBuild() {
  if ($('advbtn')) return;
  const b = document.createElement('button'); b.id = 'advbtn'; b.className = 'hidden'; b.title = 'Trợ lý AI: hỏi về luật chơi và tài khoản của bạn'; b.innerHTML = '💬<span>Trợ lý</span>';
  const w = document.createElement('div'); w.id = 'advwin'; w.className = 'hidden';
  w.innerHTML = `<div class="adv-head"><b>🤖 Trợ lý Sodier War</b><small>chỉ xem dữ liệu của bạn · 30 câu/ngày</small><button class="adv-x" title="Đóng">✕</button></div>
    <div class="adv-slot"></div>
    <div class="adv-in"><textarea id="advin" rows="2" maxlength="500" placeholder="Nhập câu hỏi, Enter để gửi"></textarea><button id="advsend">Gửi</button></div>`;
  document.body.append(b, w);
  const log = document.createElement('div'); log.id = 'advlog'; log.className = 'hidden';
  log.innerHTML = '<div class="adv-hi">Chào bạn! Hỏi mình bất cứ điều gì về Sodier War: nên nâng gì, vì sao chưa xây được, Địa Ngục chơi sao, thú cưng nào hợp… (30 câu/ngày, mỗi câu khoảng 20–30 giây)</div>';
  $('chatpanel').insertBefore(log, $('cplog').nextSibling);
  b.onclick = () => { ADV.open = !ADV.open; w.classList.toggle('hidden', !ADV.open); b.classList.toggle('on', ADV.open); if (ADV.open) { advMount(w.querySelector('.adv-slot')); setTimeout(() => $('advin').focus(), 50); } }; // phones: the chat panel is hidden there
  w.querySelector('.adv-x').onclick = () => b.click();
  $('advsend').onclick = () => { if (advSend($('advin').value)) $('advin').value = ''; };
}
/** put the answer log into the chat panel (desktop tab) or the phone window; history is fetched the first time */
function advMount(box, after = null) {
  const log = $('advlog'); if (!log) return;
  if (log.parentElement !== box) { if (after) box.insertBefore(log, after.nextSibling); else box.appendChild(log); }
  log.classList.remove('hidden'); log.scrollTop = 1e9;
  if (!ADV.asked) { ADV.asked = true; send({ t: 'askh' }); }
}
function advAdd(cls, html) { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; $('advlog').appendChild(d); $('advlog').scrollTop = 1e9; return d; }
function advSend(text) {
  const t = String(text ?? '').trim().slice(0, 500); if (!t || ADV.busy) { if (ADV.busy) notice({ kind: 'err', text: 'Trợ lý đang trả lời câu trước, chờ chút nhé' }); return false; }
  ADV.busy = true; $('advsend').disabled = true;
  advAdd('adv-q', advEsc(t));
  ADV.cur = advAdd('adv-a pending', '<i class="adv-st">⏳ Đang nghĩ…</i>'); ADV.cur._t = '';
  send({ t: 'ask', text: t });
  return true;
}
function advMsg(m) {
  advBuild();
  if (m.t === 'askh') { for (const [q, a] of m.items ?? []) { advAdd('adv-q', advEsc(q)); advAdd('adv-a', advMd(a)); } return; }
  const c = ADV.cur; if (!c) return;
  if (m.t === 'askw') { if (!c._t) c.innerHTML = `<i class="adv-st">⏳ Đang có người hỏi trước, bạn đứng thứ ${m.pos}…</i>`; return; }
  if (m.t === 'askt') { if (!c._t) c.innerHTML = `<i class="adv-st">🔎 Đang tra ${m.tool === 'Read' ? 'tài liệu' : 'luật chơi'}…</i>`; return; }
  if (m.t === 'askd') { c._t += m.d; c.classList.remove('pending'); c.innerHTML = advMd(c._t); $('advlog').scrollTop = 1e9; return; }
  if (m.t === 'aske') { if (m.err && !c._t) c.innerHTML = `<span class="adv-err">${advEsc(m.err)}</span>`; c.classList.remove('pending'); ADV.cur = null; ADV.busy = false; $('advsend').disabled = false; if (chatCh !== 'ai' && !ADV.open) { chatUnread.ai++; renderChatTabs(); } }
}
advBuild();

/** 5.000.000 → "5,0tr", 12.400 → "12,4k" (phones' resource bar) */
function shortNum(v) { v = Math.floor(v ?? 0); return v >= 1e6 ? (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace('.', ',') + 'tr' : v >= 1e4 ? (v / 1e3).toFixed(v >= 1e5 ? 0 : 1).replace('.', ',') + 'k' : v.toLocaleString('vi'); }

/** Tổ đội box folded to its header (16/11/2026); phones start folded */
function partyMini() { let v = null; try { v = localStorage.getItem('sw-party-mini'); } catch {} return v == null ? !!S.mobile : v === '1'; }

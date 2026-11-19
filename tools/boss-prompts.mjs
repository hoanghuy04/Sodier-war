// Writes the AI image prompts for the 5 bosses and their pedestals → docs/design/samples/army/prompts/bosses/
// Usage: node tools/boss-prompts.mjs
import fs from 'node:fs';

const OUT = new URL('../docs/design/samples/army/prompts/bosses/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const STYLE = `STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.`;

const DIRS = `DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction (same weapon hand, same crystals, same scars); only the facing changes.`;

const CELLS = (px) => `CELLS & BACKGROUND: every cell exactly the same size (${px}×${px} px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.`;

const BOSSES = [
  {
    n: 1, id: 'golem-kim-cuong', vi: 'Golem Kim Cương', en: 'Diamond Golem', mine: 'Mỏ Kim cương (lõi bản đồ, cao nguyên cổ)',
    lore: 'Người khổng lồ đá cổ được dựng để canh 4 mỏ Kim cương. Chậm, cực lì, mỗi 6 giây dậm đất làm vỡ kim cương ra thành sóng xung kích.',
    look: 'an ancient stone golem built from grey-blue carved temple blocks with mossy edges, glowing cyan rune lines across the body, a huge diamond core shining in its chest, clusters of cyan diamond crystals growing from its shoulders and back, massive square fists, small glowing cyan eyes under a heavy stone brow',
    poses: { idle: 'standing guard, slow heavy breathing, the chest diamond pulsing', walk: 'slow heavy stomping walk, the ground shakes, arms swinging', attack: 'a huge overhead double-fist smash', skill: 'GROUND SLAM: raises both fists, slams the ground, a ring of diamond shards and a cyan shockwave bursts out around it', hit: 'staggers back, small stone chips fly off, cracks glow', roar: 'beats its chest, the runes and the core flare bright cyan', die: 'cracks all over, the core dims, collapses into a pile of rubble with dull diamonds' },
    skillFx: 'cyan shockwave ring and flying diamond shards',
    ped: 'an octagonal ancient stone dais of worn carved slabs with glowing blue runes in a circle, four broken temple pillars at the corners, cyan diamond shards and moss in the cracks, three low steps at the front',
    pedBattle: 'the runes flare from blue to bright cyan and white, small diamond sparks rise from the cracks',
    pedDead: 'the runes go dark one by one, a big crack splits the dais, dust settles',
  },
  {
    n: 2, id: 'chua-te-hac-in', vi: 'Chúa Tể Hắc Ín', en: 'Tar Overlord', mine: 'Hố Dầu Đen (vùng tro cháy)',
    lore: 'Khối hắc ín sống trồi lên từ hố dầu đen, bên trong cháy âm ỉ. Đòn đánh làm chậm, kỹ năng phun hắc ín cháy thành vũng lửa.',
    look: 'a hulking living blob of bubbling black-purple tar, molten orange embers glowing inside cracks of its body, a skull-like head with burning orange eyes and a wide dripping jaw, thick arms ending in tar claws, charred bones and burnt logs stuck in its body, tar constantly dripping from it',
    poses: { idle: 'tar bubbling and dripping, embers flickering', walk: 'oozes forward, leaving tar drips, the body squashing and stretching', attack: 'a heavy tar claw swipe that splashes black tar', skill: 'TAR ERUPTION: rears up, then vomits a wide arc of burning tar that lands as flaming puddles in front of it', hit: 'the body splashes and dents, embers spray out', roar: 'opens the huge jaw and roars, flames bursting from its back', die: 'melts down into a smoking flat puddle of tar with a last ember going out' },
    skillFx: 'arcs of burning black tar landing as flaming puddles',
    ped: 'a ring of cracked charred black basalt around a bubbling pool of black-purple tar, burnt dead tree stumps, glowing ember cracks in the stone, small tar bubbles popping',
    pedBattle: 'the tar pool boils hard, flames lick along the ember cracks, smoke rises',
    pedDead: 'the tar cools to a dull matte black, the embers fade, thin smoke drifts away',
  },
  {
    n: 3, id: 'nu-hoang-pha-le', vi: 'Nữ Hoàng Pha Lê', en: 'Crystal Queen', mine: 'Mỏ Pha lê (rừng sâu, đầm lầy)',
    lore: 'Linh hồn của mạch pha lê, lơ lửng và đánh phép từ xa. Kỹ năng gọi mưa mảnh pha lê xuống vùng rộng, bỏ qua giáp.',
    look: 'an elegant floating sorceress made of translucent violet and pink crystal, a tall crown of sharp amethyst shards, long flowing gown that fades into crystal spikes instead of legs, glowing white eyes, a crystal sceptre in the right hand, small crystal shards orbiting around her',
    poses: { idle: 'floating up and down gently, shards orbiting', walk: 'glides forward, gown trailing, shards following', attack: 'points the sceptre and fires a sharp violet crystal bolt', skill: 'CRYSTAL STORM: raises both arms, a magic circle appears above her and a rain of violet crystal shards falls around her', hit: 'recoils, a few shards crack off her body', roar: 'spreads her arms, the crown blazes, shards spin fast around her', die: 'shatters into hundreds of violet shards that fall into a glittering pile' },
    skillFx: 'magic circle and falling violet crystal shards',
    ped: 'a round amethyst geode platform, the floor made of polished violet crystal facets, a ring of tall crystal clusters around the edge, a faint glowing magic circle engraved in the middle',
    pedBattle: 'the magic circle lights up bright pink-violet and spins, the crystal clusters glow',
    pedDead: 'the circle fades out, several crystal clusters crack and topple, the glow dies',
  },
  {
    n: 4, id: 'vua-tho-phi', vi: 'Vua Thổ Phỉ', en: 'Bandit King', mine: 'Mỏ Vàng (sa mạc, thảo nguyên)',
    lore: 'Thủ lĩnh băng thổ phỉ chiếm mỏ Vàng. To khỏe, rìu đôi khổng lồ. Kỹ năng xoay rìu chém vòng tròn, đánh trúng mọi quân quanh hắn.',
    look: 'a huge burly bandit chief with a red bandana mask over the lower face and an eye patch, a wide grin of gold teeth showing above the mask, a dark fur cloak, studded leather armour, thick gold chains and a big bag of gold coins on the belt, a giant double-bladed battle axe in the right hand, bare muscular arms with tattoos',
    poses: { idle: 'resting the axe on his shoulder, tossing a gold coin', walk: 'swaggering heavy walk, axe on the shoulder, cloak swaying', attack: 'a powerful diagonal axe chop with a white motion arc', skill: 'WHIRLWIND: spins around with the axe held out, a full white circular slash trail around him, gold coins flying', hit: 'staggers, a few gold coins fall out of the bag', roar: 'raises the axe high and laughs, gold coins raining around him', die: 'drops to his knees then falls flat, the axe stuck in the ground, coins spilling out' },
    skillFx: 'full circular white slash trail and flying gold coins',
    ped: 'a raised raider platform of heavy wooden planks on top of stacked crates and open treasure chests overflowing with gold coins, a tattered red banner with a skull on a pole, rope, barrels, gold coins scattered around',
    pedBattle: 'the banner whips in the wind, coins jump and glint, torches on the corners flare',
    pedDead: 'the banner pole snaps and falls, a chest tips over, coins slide off, torches go out',
  },
  {
    n: 5, id: 'bo-cap-sa-mac', vi: 'Bọ Cạp Sa Mạc', en: 'Desert Scorpion', mine: 'Giếng Dầu (sa mạc)',
    lore: 'Bọ cạp khổng lồ sống dưới cát quanh giếng dầu. Nhanh, càng kẹp mạnh. Kỹ năng chui xuống cát rồi trồi lên đâm kim độc.',
    look: 'a giant armoured desert scorpion with a sand-gold and rust-orange segmented carapace, oil-black glossy joints, two huge serrated pincers, a tall curled tail ending in a black stinger dripping glowing green venom, four glowing green eyes, small rocks and sand stuck on its back',
    poses: { idle: 'pincers clicking, tail swaying slowly, sand trickling off', walk: 'fast eight-legged scuttle, tail raised, pincers forward', attack: 'a double pincer snap forward', skill: 'BURROW STRIKE: digs into the sand leaving only a mound, then bursts out of the ground with a huge green venom sting downward and a spray of sand', hit: 'recoils, legs folding, sand spraying', roar: 'rears up on its back legs, pincers spread wide, tail high', die: 'flips over on its back, legs curling up, the venom glow fades' },
    skillFx: 'sand eruption and a green venom splash',
    ped: 'a half-buried sandstone ruin platform: cracked square slabs with faded carvings, two broken obelisks, sand dunes drifting over the edges, a small black oil puddle and a few bones',
    pedBattle: 'sand pours from the cracks, the carvings glow faint green, the oil puddle ripples',
    pedDead: 'sand slowly covers the slabs, the green glow fades, an obelisk tips over',
  },
];

const ROWS = [
  ['idle', 'Đứng (Idle)', 'Idle', 4],
  ['walk', 'Đi (Walk)', 'Walk', 6],
  ['attack', 'Đánh thường (Attack)', 'Attack', 6],
  ['skill', 'Kỹ năng (Skill)', 'Skill', 8],
  ['hit', 'Trúng đòn (Hit)', 'Hit', 2],
  ['roar', 'Gầm / thắng (Roar)', 'Roar', 6],
  ['die', 'Chết (Die)', 'Die', 6],
];
const FRAMES = {
  attack: (b) => `frame 1: ready stance; frame 2: wind-up; frame 3: the strike starts; frame 4: IMPACT: ${b.poses.attack}; frame 5: follow-through; frame 6: back to the ready stance.`,
  skill: (b) => `${b.poses.skill}. frames 1-2: wind-up; frames 3-4: the big moment with ${b.skillFx}; frames 5-6: the effect spreads out; frames 7-8: recover to the ready stance. Keep the effect INSIDE the cell.`,
  die: (b) => `${b.poses.die}. Frame 6 is the final still pose that stays on the ground.`,
};

const fence = (s) => '```text\n' + s + '\n```';
let index = '';
for (const b of BOSSES) {
  const desc = `Pixel art boss sprite of ${b.look}.`;
  const sheet = `${desc}

${STYLE}

LAYOUT: 8 columns × 7 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
${ROWS.map(([k, , en], i) => `Row ${i + 1} "${en}": ${b.poses[k]}.`).join('\n')}

${DIRS}

${CELLS(256)}`;
  let md = `# Boss ${b.n}. ${b.vi} (${b.en})

Mã boss: \`${b.id}\` · canh **${b.mine}** · ô 256×256 px

${b.lore}

**Gửi kèm ảnh mẫu:** \`sprite-pixels/1.png\` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ. Mỗi ảnh tạo trong một **cuộc trò chuyện mới**, chỉ một boss.

## Bước 1: sheet 8 hướng × 7 tư thế

Lưu thành \`sprite-pixels/boss-${b.id}.png\`

${fence(sheet)}

## Bước 2: hoạt ảnh nhiều khung (mỗi hoạt ảnh một ảnh)

Mỗi ảnh: **8 hàng = 8 hướng**, **cột = khung hình** từ trái sang phải.

`;
  for (const [k, vi, en, nf] of ROWS) {
    const what = FRAMES[k] ? FRAMES[k](b) : `${b.poses[k]}.`;
    const loop = k === 'idle' || k === 'walk' ? ', a seamless loop' : '';
    const p = `Pixel art animation sprite sheet of a BOSS: ${b.look}.

${STYLE}

ANIMATION "${en}", ${nf} frames: ${what}

LAYOUT: 8 rows × ${nf} columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the ${nf} frames from left to right${loop}. The motion is the same in every row, only the facing changes.

${DIRS}

${CELLS(256)}`;
    md += `### ${vi} · ${nf} khung\n\nLưu thành \`sprite-pixels/boss-${b.id}-${k}.png\`\n\n${fence(p)}\n\n`;
  }
  const ped = `Pixel art sprite sheet of a boss arena pedestal seen from a top-down 3/4 view (same camera as the reference sheet): ${b.ped}. It is a flat raised platform about 5 tiles wide and 4 tiles deep (roughly 176×132 px of art) with a clear flat centre where a large boss stands, its front edge facing the viewer. It is a single static object, no characters on it.

STYLE (match the attached reference sheet exactly): same pixel art style, outline thickness and shading as the reference: crisp 1-pixel dark navy outline (#1b1726), saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow outside the object. Neutral, no team colours.

LAYOUT: 4 columns × 3 rows of animation frames, all of the SAME pedestal from the SAME angle at the SAME position and scale:
Row 1 "Dormant" (boss alive, waiting), 4 frames, seamless loop: subtle idle motion: faint glow pulsing, small particles.
Row 2 "Battle" (players are fighting the boss), 4 frames, seamless loop: ${b.pedBattle}.
Row 3 "Defeated" (the boss is dead), 4 frames, plays once: ${b.pedDead}. Frame 4 is the final still state.

CELLS & BACKGROUND: every cell exactly the same size (256×192 px), the pedestal centred with its base on the same baseline in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the object edge touches magenta directly. No cast shadow on the background, no border, no grid lines, no text, no labels, no numbers.`;
  md += `## Bệ đứng (sân boss)

Một ảnh riêng: bệ đứng dưới chân boss, đặt tại mỏ. Có 3 trạng thái hoạt ảnh: **chờ** (boss còn sống), **giao chiến** (đang bị đánh), **bị hạ** (boss chết, bệ tắt sáng và nứt).

Lưu thành \`sprite-pixels/be-${b.id}.png\`

${fence(ped)}
`;
  const file = `${String(15 + b.n).padStart(2, '0')}-boss-${b.id}.md`;
  fs.writeFileSync(OUT + file, md);
  index += `| ${b.n} | [${b.vi}](${file}) | \`${b.id}\` | ${b.mine} | ${b.poses.skill.split(':')[0]} |\n`;
}
fs.writeFileSync(OUT + 'README.md', `# Prompt tạo 5 boss và bệ đứng

Mỗi boss có một file. Trong file có:
- **Bước 1:** một ảnh 8 hướng × 7 tư thế (đứng, đi, đánh, kỹ năng, trúng đòn, gầm, chết) để duyệt thiết kế.
- **Bước 2:** 7 ảnh, mỗi hoạt ảnh một ảnh nhiều khung (8 hàng hướng × 2–8 khung).
- **Bệ đứng:** một ảnh riêng, 3 trạng thái × 4 khung (chờ, giao chiến, bị hạ).

Cách làm (giống binh chủng):
1. Mở **cuộc trò chuyện mới** trong công cụ tạo ảnh cho mỗi ảnh, chỉ một boss một lần.
2. Copy khối prompt tiếng Anh, **gửi kèm \`sprite-pixels/1.png\`** làm mẫu phong cách.
3. Kiểm tra: nền magenta một màu, đủ hàng × cột, hướng 4–6 nhìn từ sau lưng, hiệu ứng kỹ năng không tràn sang ô bên cạnh, không có chữ.
4. Lưu đúng tên file ghi trong prompt vào \`sprite-pixels/\` rồi báo mình nhập vào game.

Thứ tự nên làm: bước 1 của cả 5 boss → bệ đứng của cả 5 → duyệt xong mới làm bước 2.

| # | Boss | Mã | Canh mỏ | Kỹ năng |
|---|---|---|---|---|
${index}
Viết lại các file này: \`node tools/boss-prompts.mjs\`.
`);
console.log('boss prompts →', OUT, fs.readdirSync(OUT).join(', '));

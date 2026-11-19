# Prompt vẽ 5 hang boss (13/11/2026)

Thay cho cái bệ đá hình bầu dục đang vẽ tạm dưới chân boss. Mỗi boss một **hang/sào huyệt** riêng, hợp với loại boss và vùng đất của nó.

**Kích thước:** bệ hiện tại rộng ~8,4 ô.
- Golem Kim Cương: **to gấp đôi**, khoảng **17 ô ngang × 10 ô sâu**.
- 4 boss còn lại: **gấp 1,5**, khoảng **12,5 ô ngang × 7,5 ô sâu**.

**Mỗi hang 2 ảnh** (cùng góc nhìn, cùng vị trí, cùng kích thước):
1. `hang-<mã boss>.png`: lúc boss còn sống (hang sáng, có khí thế).
2. `hang-<mã boss>-ha.png`: lúc boss bị hạ, chờ hồi sinh (tắt sáng, nứt vỡ, khói tàn).

**Quy tắc chung:**
- Gửi kèm ảnh mẫu `sprite-pixels/1.png` và ảnh boss tương ứng để giữ nét vẽ, màu và tỉ lệ.
- Gửi lại dạng **File PNG**, đúng tên.

## Phần chung (dán sau mỗi prompt riêng)

**Golem (ảnh 1536×960):**
```text
STYLE: pixel art environment piece for a top-down 3/4 view RPG/RTS, matching the attached reference: same palette, crisp 1-pixel dark navy outline (#1b1726) on the main shapes, saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the object.
SCALE & SHAPE: one large lair seen from the same 3/4 camera as the units, about 17 tiles wide and 10 tiles deep (one tile ≈ one soldier's width). The back (top of the image) is the tallest part (cliff, cave mouth, walls); the front edge (bottom) is low and open toward the viewer so heroes can walk in. The CENTRE is a wide, flat, clear arena floor (about 10 × 6 tiles) where a very large boss stands and fights: nothing tall in the middle.
IMAGE: one single image, exactly 1536×960 px, the lair centred, filling most of the image. BACKGROUND: one flat solid pure magenta #FF00FF around the lair; the object edge touches magenta directly. No characters, no boss, no text, no labels, no grid, no border, no cast shadow on the background.
```

**4 boss còn lại (ảnh 1152×720):** giống hệt trên nhưng đổi 2 dòng:
```text
SCALE & SHAPE: one lair seen from the same 3/4 camera as the units, about 12.5 tiles wide and 7.5 tiles deep (one tile ≈ one soldier's width). The back (top of the image) is the tallest part; the front edge (bottom) is low and open toward the viewer so heroes can walk in. The CENTRE is a flat, clear arena floor (about 7 × 4.5 tiles) where a large boss stands and fights: nothing tall in the middle.
IMAGE: one single image, exactly 1152×720 px, the lair centred, filling most of the image.
```
(các dòng STYLE và BACKGROUND giữ nguyên)

**Thêm cho ảnh "bị hạ" (`-ha`):**
```text
DEFEATED STATE: the exact same lair, same angle, same size and position, but its master has been slain: all glowing lights and magic are off, cracks across the arena floor, a few fallen stones, thin wisps of dark smoke, colours a little duller. Everything else identical so the two images can be swapped in place.
```

## 1. Golem Kim Cương: `hang-golem-kim-cuong.png` (to ×2)

Lõi bản đồ, cao nguyên cổ, mỏ kim cương.
```text
An ancient diamond core sanctum carved into a highland plateau: a huge half-circle of cyclopean grey stone walls and broken temple pillars at the back, a colossal cave mouth in the back wall glowing with cyan light, giant raw diamond crystals (cyan and white) bursting out of the rock all around, an octagonal arena floor of worn carved slabs with a big ring of glowing blue runes, mine cart rails and an old mine entrance on one side, moss and small diamond shards in the cracks, wide low steps at the front.
```

## 2. Chúa Tể Hắc Ín: `hang-chua-te-hac-in.png` (×1,5)

Vùng tro cháy, hố dầu đen.
```text
A scorched tar lair in burnt ash lands: a jagged cliff of black basalt at the back with a cave mouth oozing black-purple tar, rivers of bubbling tar flowing around the arena in channels, charred dead trees and blackened bones, glowing orange ember cracks in the rock, a round cracked basalt arena floor in the middle ringed by dark iron spikes, small tar geysers and smoke vents on the sides.
```

## 3. Nữ Hoàng Pha Lê: `hang-nu-hoang-pha-le.png` (×1,5)

Rừng sâu, đầm lầy, mỏ pha lê.
```text
A crystal geode grotto in a deep misty forest: the back is a giant split-open amethyst geode forming a sparkling cave, tall violet and pink crystal clusters growing in a ring, twisted dark forest roots and swamp water pools with glowing lily pads at the edges, an elegant round floor of polished violet crystal facets in the middle with a faint engraved magic circle, a few floating crystal shards.
```

## 4. Vua Thổ Phỉ: `hang-vua-tho-phi.png` (×1,5)

Sa mạc, thảo nguyên, mỏ vàng.
```text
A bandit king's stronghold at the edge of a desert steppe: a wooden palisade of sharpened logs and a rocky outcrop with a cave hideout at the back, a big tattered red banner with a skull on a tall pole, watchtower platforms, open treasure chests and piles of gold coins and loot sacks, barrels, ropes and stolen carts around the sides, a trampled sandy arena in the middle marked by a circle of stones and torches.
```

## 5. Bọ Cạp Sa Mạc: `hang-bo-cap-sa-mac.png` (×1,5)

Sa mạc, giếng dầu.
```text
A giant scorpion's burrow in the deep desert: a half-buried sandstone temple ruin at the back with a dark burrow hole tunnelling under it, two broken obelisks with faded carvings, curved sand dunes drifting over the edges, black oil seeping from the cracks into small puddles, huge bleached bones and a giant ribcage, a sunken sandy arena floor in the middle with cracked square slabs.
```

## Gắn vào game

Gửi PNG về, mình sẽ cắt nền, đặt hang đúng chỗ boss (tâm hang = chỗ boss đứng), vẽ dưới chân boss và lính. Lúc boss bị hạ thì đổi sang ảnh `-ha` tới khi hồi sinh.

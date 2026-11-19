# Boss sự kiện thế giới: Thủ lĩnh quái & Xe chở vàng (14/11/2026)

Hai boss của **sự kiện thế giới** (mỗi 2 tiếng, xen kẽ) hiện đang mượn hình tạm: Thủ lĩnh quái dùng hình Minotaur phóng to, Xe chở vàng dùng hình Golem. Đây là prompt vẽ hình riêng, cùng chuẩn với 5 boss (ô 256×256, 8 hướng).

**Gửi kèm ảnh mẫu:** `sprite-pixels/kiem-si.png` (Kiếm sĩ) và 1 sheet boss (vd `boss-golem-kim-cuong.png`) để giữ nét vẽ và tỉ lệ. Mỗi ảnh tạo trong **một cuộc trò chuyện mới**. Gửi lại dạng **File PNG**, không chữ.

## 1. Thủ lĩnh quái (Monster Warlord)

Mã: `thu-linh` · xuất hiện ở bãi quái, 36.000 máu, kèm 4 Troll + 6 Orc, dậm đất choáng vùng. Lưu thành `sprite-pixels/boss-thu-linh.png` (2048×1792).

```text
Pixel art boss sprite of the Monster Warlord: a towering horned ogre-troll chieftain with grey-green warty skin and red war paint, a crown of bones and a broken iron helmet with two huge curved horns, armour made of bone plates and rusty iron straps, a tattered red war banner with a skull mounted on a pole on its back, a gigantic spiked wooden club studded with iron in its right hand, a trophy belt of goblin skulls, glowing yellow eyes and big tusks.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a WORLD-EVENT BOSS: about 2.5× the height of the reference soldier (same size class as the other bosses), brutal and imposing, chunky readable silhouette. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal and gold. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

LAYOUT: 8 columns × 7 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing tall, club resting on the shoulder, heavy breathing, the banner sways.
Row 2 "Walk": heavy stomping walk, club swinging, the ground cracks under its feet.
Row 3 "Attack": a huge sideways swing of the spiked club.
Row 4 "Skill": WAR STOMP: jumps and slams both feet down, a brown dust shockwave ring with flying rocks bursts out around it.
Row 5 "Hit": staggers back, flinching, a tooth flies off, angry face.
Row 6 "Roar": raises the club and roars to the sky, war paint glowing red, calling its monsters.
Row 7 "Die": falls to its knees then crashes face-down, the banner pole snaps, the club rolls away.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view; the face (or the front of the wagon) is NOT visible.
- 5 up: full BACK view.
The design is identical in every direction; only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the subject centred, its lowest point on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## 2. Xe chở vàng (Gold Wagon)

Mã: `xe-vang` · chạy dọc đường qua bản đồ, không đánh, có lính phỉ hộ tống; phá xe để cướp vàng. Lưu thành `sprite-pixels/boss-xe-vang.png` (2048×1024).

```text
Pixel art sprite of a heavy armoured gold wagon: a big wooden cart reinforced with iron bands and gold trims, four thick spoked wheels, an open top heaped with shining gold coins, gold bars and a couple of locked treasure chests, a small red-and-gold royal pennant on a pole at the back, pulled by two sturdy brown oxen in leather harness with brass bells, a lantern hanging at the front. No driver.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a WORLD-EVENT BOSS: about 2× the length of a horse, a big heavy wagon, chunky readable silhouette. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal and gold. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

LAYOUT: 8 columns × 4 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing still, the oxen breathing, the lantern swinging gently, coins glinting.
Row 2 "Move": rolling forward, the oxen pulling hard mid-step, wheels turning, a few coins bouncing on top.
Row 3 "Hit": the wagon shakes from a blow, wood splinters and a few gold coins spill out, the oxen flinch.
Row 4 "Destroyed": a broken wreck: one wheel off, planks smashed, chests burst open, gold coins and bars scattered on the ground, the oxen gone (only cut harness ropes left).

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view; the face (or the front of the wagon) is NOT visible.
- 5 up: full BACK view.
The design is identical in every direction; only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the subject centred, its lowest point on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Gắn vào game

Gửi 2 PNG về, mình cắt nền, nhập vào game, thay hình tạm, và đặt kích thước cho cân với boss khác.

# Lính triệu hồi của 6 boss (14/11/2026)

Khi máu boss xuống 75% / 50% / 25%, boss gọi một đợt lính riêng. Mỗi loại 1 ảnh **8 hướng × 6 tư thế**, ô 128×128 (giống lính thường). Gửi kèm `sprite-pixels/kiem-si.png` và sheet boss tương ứng. Lưu đúng tên, gửi dạng File PNG.

## 1. Đá vệ kim cương (lính của Golem Kim Cương)

Lưu thành `sprite-pixels/tay-sai-golem.png` (1024×768)

```text
Pixel art sprite sheet of a small rock golem servant made of grey-blue carved stone blocks with a glowing cyan rune on its chest and small cyan diamond shards on its shoulders, stubby legs, big rock fists, two glowing cyan dot eyes.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman, about the same height as the reference soldier (a boss's minion). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing ready, breathing.
Row 2 "Walk": mid-stride, legs clearly apart (a flying creature: wings beating, hovering forward).
Row 3 "Attack": punches forward with a rock fist, small diamond chips fly.
Row 4 "Hit": recoiling backwards, flashing white.
Row 5 "Spawn": appearing from a burst of cyan crystal light, half formed.
Row 6 "Die": crumbles into a pile of rocks and dull crystal shards.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile (3 faces RIGHT, 7 faces LEFT).
- 4 up-right / 6 up-left: three-quarter BACK view; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction; only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## 2. Quỷ bùn hắc ín (lính của Chúa Tể Hắc Ín)

Lưu thành `sprite-pixels/tay-sai-hac-in.png` (1024×768)

```text
Pixel art sprite sheet of a hunched tar ooze imp made of dripping black-purple tar, glowing orange ember eyes and ember cracks, long dripping claws, little tar bubbles popping on its back.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman, about the same height as the reference soldier (a boss's minion). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing ready, breathing.
Row 2 "Walk": mid-stride, legs clearly apart (a flying creature: wings beating, hovering forward).
Row 3 "Attack": lunges and slashes with dripping tar claws, tar drops splash.
Row 4 "Hit": recoiling backwards, flashing white.
Row 5 "Spawn": appearing from a burst of tar, half formed.
Row 6 "Die": melts into a bubbling black tar puddle.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile (3 faces RIGHT, 7 faces LEFT).
- 4 up-right / 6 up-left: three-quarter BACK view; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction; only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## 3. Tiên pha lê (lính của Nữ Hoàng Pha Lê)

Lưu thành `sprite-pixels/tay-sai-pha-le.png` (1024×768)

```text
Pixel art sprite sheet of a small floating crystal fairy guardian with a body of translucent violet-pink crystal facets, two pairs of thin crystal wings, a glowing white core, hovering above the ground with tiny sparkles.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman, about the same height as the reference soldier (a boss's minion). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing ready, breathing.
Row 2 "Walk": mid-stride, legs clearly apart (a flying creature: wings beating, hovering forward).
Row 3 "Attack": fires a small violet crystal shard forward from its hands.
Row 4 "Hit": recoiling backwards, flashing white.
Row 5 "Spawn": appearing from a burst of violet sparkles, half formed.
Row 6 "Die": shatters into falling violet crystal fragments and sparkles.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile (3 faces RIGHT, 7 faces LEFT).
- 4 up-right / 6 up-left: three-quarter BACK view; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction; only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## 4. Cận vệ thổ phỉ (lính của Vua Thổ Phỉ)

Lưu thành `sprite-pixels/tay-sai-tho-phi.png` (1024×768)

```text
Pixel art sprite sheet of a burly desert bandit bodyguard with a red headscarf and face mask, leather and studded armour, gold earrings, a big two-handed axe, a sash with gold coins.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman, about the same height as the reference soldier (a boss's minion). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing ready, breathing.
Row 2 "Walk": mid-stride, legs clearly apart (a flying creature: wings beating, hovering forward).
Row 3 "Attack": swings the big axe in a wide downward chop.
Row 4 "Hit": recoiling backwards, flashing white.
Row 5 "Spawn": appearing from a burst of sand and smoke, half formed.
Row 6 "Die": falls on his back, the axe and a few gold coins drop.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile (3 faces RIGHT, 7 faces LEFT).
- 4 up-right / 6 up-left: three-quarter BACK view; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction; only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## 5. Bọ cạp con (lính của Bọ Cạp Sa Mạc)

Lưu thành `sprite-pixels/tay-sai-bo-cap.png` (1024×768)

```text
Pixel art sprite sheet of a young giant desert scorpion with sandy-orange armoured plates, two big pincers, a curled tail with a glowing purple poison stinger, six legs.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman, about the same height as the reference soldier (a boss's minion). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing ready, breathing.
Row 2 "Walk": mid-stride, legs clearly apart (a flying creature: wings beating, hovering forward).
Row 3 "Attack": strikes forward with the tail stinger, a purple poison splash.
Row 4 "Hit": recoiling backwards, flashing white.
Row 5 "Spawn": appearing from a burst of sand and smoke, half formed.
Row 6 "Die": flips onto its back, legs curling.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile (3 faces RIGHT, 7 faces LEFT).
- 4 up-right / 6 up-left: three-quarter BACK view; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction; only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## 6. Yêu tinh xung kích (lính của Thủ lĩnh quái)

Lưu thành `sprite-pixels/tay-sai-thu-linh.png` (1024×768)

```text
Pixel art sprite sheet of a fierce goblin raider berserker with green skin, red war paint, a horned bone helmet, spiked shoulder pad, a jagged cleaver in one hand and a small round wooden shield, bone necklace.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman, about the same height as the reference soldier (a boss's minion). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing ready, breathing.
Row 2 "Walk": mid-stride, legs clearly apart (a flying creature: wings beating, hovering forward).
Row 3 "Attack": leaps forward and hacks with the cleaver.
Row 4 "Hit": recoiling backwards, flashing white.
Row 5 "Spawn": appearing from a burst of red war smoke, half formed.
Row 6 "Die": falls face down, the helmet rolls away.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile (3 faces RIGHT, 7 faces LEFT).
- 4 up-right / 6 up-left: three-quarter BACK view; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction; only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## 7. Cung thủ hộ tống Xe vàng (tầm xa)

Lưu thành `sprite-pixels/ho-ve-cung.png` (1024×768)

```text
Pixel art sprite sheet of a royal treasury crossbowman escorting a gold wagon: a light steel kettle helmet with a small red-and-gold plume, a red-and-gold tabard with a gold crown emblem over chainmail, leather bracers, a heavy steel crossbow, a quiver of bolts on the hip, a small gold-coin pouch.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman, about the same height as the reference soldier (a royal treasure escort). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing guard, alert.
Row 2 "Walk": marching mid-stride, legs clearly apart.
Row 3 "Attack": aims and shoots the crossbow forward, a short bolt flies with a white streak.
Row 4 "Hit": recoiling backwards, flashing white.
Row 5 "Victory": raises the crossbow over the head, cheering.
Row 6 "Die": falls backwards, the crossbow drops, a few gold coins spill from the pouch.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile (3 faces RIGHT, 7 faces LEFT).
- 4 up-right / 6 up-left: three-quarter BACK view; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction; only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## 8. Vệ binh hộ tống Xe vàng (tầm gần)

Lưu thành `sprite-pixels/ho-ve-giao.png` (1024×768)

```text
Pixel art sprite sheet of a royal treasury halberd guard escorting a gold wagon: a full steel sallet helmet with a red-and-gold plume, polished steel breastplate with gold trims over a red-and-gold tabard with a gold crown emblem, a tall halberd with a gold tassel, a small round steel shield on the back.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman, about the same height as the reference soldier (a royal treasure escort). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing guard, alert.
Row 2 "Walk": marching mid-stride, legs clearly apart.
Row 3 "Attack": thrusts and sweeps the halberd forward in a wide arc.
Row 4 "Hit": recoiling backwards, flashing white.
Row 5 "Victory": slams the halberd butt on the ground and stands proud.
Row 6 "Die": falls on his side, the halberd clatters down, the helmet rolls off.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile (3 faces RIGHT, 7 faces LEFT).
- 4 up-right / 6 up-left: three-quarter BACK view; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction; only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

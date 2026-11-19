# 13. Phong Vũ, Kỵ Tướng (anh hùng) (Cavalry General hero)

Mã quân: `phong-vu` · ô 160×160 px

**Gửi kèm ảnh mẫu:** `sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ. Nếu công cụ không nhận ảnh thì vẫn dán prompt như bình thường.

## Bước 1: sheet 8 hướng (1 tư thế mỗi hoạt ảnh)

Lưu thành `sprite-pixels/phong-vu.png`

```text
Pixel art sprite sheet of a dashing cavalry general riding a black horse with a white mane and tail and a blue saddle blanket: black-haired young man, blue leather armour with silver studs, long blue scarf flowing behind, a spear with a blue pennant in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": horse standing, breathing, tail swishing, rider ready.
Row 2 "Walk": mid-stride walking pose, legs clearly apart, arms swinging.
Row 3 "Attack": lunging spear thrust at full length, horse front hooves lifted, white sparkle.
Row 4 "Hit": horse and rider flinching backwards, impact marks.
Row 5 "Victory": horse rears high, rider raises the spear, scarf and pennant flying.
Row 6 "Die": horse fallen on its side, rider thrown on the ground, both still.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (160×160 px), the horse and rider centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Bước 2: hoạt ảnh nhiều khung (mỗi hoạt ảnh một ảnh)

Mỗi ảnh: **8 hàng = 8 hướng**, **cột = khung hình** từ trái sang phải.

### Đứng (Idle) · 4 khung

Lưu thành `sprite-pixels/phong-vu-dung.png`

```text
Pixel art animation sprite sheet of a dashing cavalry general riding a black horse with a white mane and tail and a blue saddle blanket: black-haired young man, blue leather armour with silver studs, long blue scarf flowing behind, a spear with a blue pennant in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Idle", 4 frames: horse standing, breathing, tail swishing, rider ready.

LAYOUT: 8 rows × 4 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 4 frames from left to right, a seamless loop. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (160×160 px), the horse and rider centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Di chuyển (Walk) · 6 khung

Lưu thành `sprite-pixels/phong-vu-di.png`

```text
Pixel art animation sprite sheet of a dashing cavalry general riding a black horse with a white mane and tail and a blue saddle blanket: black-haired young man, blue leather armour with silver studs, long blue scarf flowing behind, a spear with a blue pennant in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Walk", 6 frames: full horse trot cycle loop, diagonal leg pairs, horse and rider bob up and down, mane and cape flowing.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right, a seamless loop. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (160×160 px), the horse and rider centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Tấn công (Attack) · 6 khung

Lưu thành `sprite-pixels/phong-vu-tan-cong.png`

```text
Pixel art animation sprite sheet of a dashing cavalry general riding a black horse with a white mane and tail and a blue saddle blanket: black-haired young man, blue leather armour with silver studs, long blue scarf flowing behind, a spear with a blue pennant in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Attack", 6 frames: frame 1: spear upright, horse ready; frame 2: lowers the spear, horse gathers; frame 3: horse charges forward; frame 4: IMPACT: lunging spear thrust at full length, horse front hooves lifted, white sparkle; frame 5: horse lands, scarf flying; frame 6: spear back upright.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (160×160 px), the horse and rider centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Bị trúng (Hit) · 2 khung

Lưu thành `sprite-pixels/phong-vu-bi-trung.png`

```text
Pixel art animation sprite sheet of a dashing cavalry general riding a black horse with a white mane and tail and a blue saddle blanket: black-haired young man, blue leather armour with silver studs, long blue scarf flowing behind, a spear with a blue pennant in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Hit", 2 frames: horse and rider flinch with a white flash, then recover.

LAYOUT: 8 rows × 2 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 2 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (160×160 px), the horse and rider centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Chiến thắng (Victory) · 6 khung

Lưu thành `sprite-pixels/phong-vu-chien-thang.png`

```text
Pixel art animation sprite sheet of a dashing cavalry general riding a black horse with a white mane and tail and a blue saddle blanket: black-haired young man, blue leather armour with silver studs, long blue scarf flowing behind, a spear with a blue pennant in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Victory", 6 frames: frame 1: horse prances; frame 2: horse starts to rear; frame 3: horse rears high, rider raises the spear, scarf and pennant flying; frame 4: still rearing; frame 5: front hooves come down; frame 6: horse stands, spear raised.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (160×160 px), the horse and rider centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Chết (Die) · 6 khung

Lưu thành `sprite-pixels/phong-vu-chet.png`

```text
Pixel art animation sprite sheet of a dashing cavalry general riding a black horse with a white mane and tail and a blue saddle blanket: black-haired young man, blue leather armour with silver studs, long blue scarf flowing behind, a spear with a blue pennant in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Die", 6 frames: hit flash, horse stumbles, falls on its side, rider thrown, dust, both lying still.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (160×160 px), the horse and rider centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

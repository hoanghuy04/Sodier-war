# 01. Dân quân (Militia)

Mã quân: `dan-quan` · ô 128×128 px

**Gửi kèm ảnh mẫu:** `sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ. Nếu công cụ không nhận ảnh thì vẫn dán prompt như bình thường.

## Bước 1: sheet 8 hướng (1 tư thế mỗi hoạt ảnh)

Lưu thành `sprite-pixels/dan-quan.png`

```text
Pixel art sprite sheet of a young peasant militia man: blue cloth cap, short brown hair, brown patched linen tunic with a rope belt, rolled-up sleeves, short blue cape, brown trousers and worn leather boots, holding a long wooden pitchfork with three iron tines in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": neutral stance.
Row 2 "Walk": mid-stride walking pose, legs clearly apart, arms swinging.
Row 3 "Attack": full thrust, arms extended, tines far forward, small white impact sparkle at the tines.
Row 4 "Hit": recoiling backwards, eyes shut, small impact marks.
Row 5 "Victory": top of the jump, mouth open shouting.
Row 6 "Die": lying on the back on the ground, eyes closed.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the character centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Bước 2: hoạt ảnh nhiều khung (mỗi hoạt ảnh một ảnh)

Mỗi ảnh: **8 hàng = 8 hướng**, **cột = khung hình** từ trái sang phải.

### Đứng (Idle) · 4 khung

Lưu thành `sprite-pixels/dan-quan-dung.png`

```text
Pixel art animation sprite sheet of a young peasant militia man: blue cloth cap, short brown hair, brown patched linen tunic with a rope belt, rolled-up sleeves, short blue cape, brown trousers and worn leather boots, holding a long wooden pitchfork with three iron tines in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Idle", 4 frames: neutral stance; breathing loop: inhale (chest up 1px), exhale, back to neutral; cape sways gently.

LAYOUT: 8 rows × 4 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 4 frames from left to right, a seamless loop. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the character centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Di chuyển (Walk) · 6 khung

Lưu thành `sprite-pixels/dan-quan-di.png`

```text
Pixel art animation sprite sheet of a young peasant militia man: blue cloth cap, short brown hair, brown patched linen tunic with a rope belt, rolled-up sleeves, short blue cape, brown trousers and worn leather boots, holding a long wooden pitchfork with three iron tines in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Walk", 6 frames: full walk cycle loop: right foot forward contact, passing (body lowest), left foot up (body highest), left foot forward contact, passing, right foot up; arms swing opposite to the legs, cape trails.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right, a seamless loop. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the character centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Tấn công (Attack) · 6 khung

Lưu thành `sprite-pixels/dan-quan-tan-cong.png`

```text
Pixel art animation sprite sheet of a young peasant militia man: blue cloth cap, short brown hair, brown patched linen tunic with a rope belt, rolled-up sleeves, short blue cape, brown trousers and worn leather boots, holding a long wooden pitchfork with three iron tines in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Attack", 6 frames: frame 1: ready stance, pitchfork held low in both hands, tines forward; frame 2: pulls the pitchfork back to the hip, leaning back; frame 3: steps forward, starting the thrust; frame 4: IMPACT: full thrust, arms extended, tines far forward, small white impact sparkle at the tines; frame 5: holds the extended pose, cape flying back; frame 6: pulls back to the ready stance.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the character centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Bị trúng (Hit) · 2 khung

Lưu thành `sprite-pixels/dan-quan-bi-trung.png`

```text
Pixel art animation sprite sheet of a young peasant militia man: blue cloth cap, short brown hair, brown patched linen tunic with a rope belt, rolled-up sleeves, short blue cape, brown trousers and worn leather boots, holding a long wooden pitchfork with three iron tines in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Hit", 2 frames: recoils backwards with the whole sprite flashing white, eyes shut; then recovers.

LAYOUT: 8 rows × 2 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 2 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the character centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Chiến thắng (Victory) · 6 khung

Lưu thành `sprite-pixels/dan-quan-chien-thang.png`

```text
Pixel art animation sprite sheet of a young peasant militia man: blue cloth cap, short brown hair, brown patched linen tunic with a rope belt, rolled-up sleeves, short blue cape, brown trousers and worn leather boots, holding a long wooden pitchfork with three iron tines in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Victory", 6 frames: frame 1: crouches, pitchfork low; frame 2: jumps up, pitchfork raised overhead; frame 3: top of the jump, mouth open shouting; frame 4: lands; frame 5: waves the cap with the left hand, pitchfork up; frame 6: stands proudly, pitchfork planted.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the character centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Chết (Die) · 6 khung

Lưu thành `sprite-pixels/dan-quan-chet.png`

```text
Pixel art animation sprite sheet of a young peasant militia man: blue cloth cap, short brown hair, brown patched linen tunic with a rope belt, rolled-up sleeves, short blue cape, brown trousers and worn leather boots, holding a long wooden pitchfork with three iron tines in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

ANIMATION "Die", 6 frames: hit flash white, knocked back with the weapon slipping, falling backwards, hits the ground, small dust puff, lying still on the back with eyes closed.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the shield/off-hand item in the LEFT hand in every direction. Every piece of gear (cape, plume, quiver, shield…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the character centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

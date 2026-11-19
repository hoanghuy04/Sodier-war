# Thổ phỉ (Bandit)

Mã lính canh: `tho-phi` · canh mỏ: Vàng, Dầu, Dầu đen · ô 128×128 px

**Gửi kèm ảnh mẫu:** `../army/sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ và bảng màu.

## Bước 1: sheet 8 hướng (1 tư thế mỗi hoạt ảnh)

Lưu thành `sprite-pixels/tho-phi.png`

```text
Pixel art sprite sheet of a BANDIT, the weakest mine guard: scruffy man with a red bandana over the hair and a black cloth mask over the mouth, stubble, a patched brown vest over a dirty beige shirt, rope belt with a small pouch, torn brown trousers, worn boots, a rusty curved machete in the right hand, a burning torch in the left hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, the same proportions, outline thickness, palette and shading as the reference soldier. Big head (about 40% of the body height), expressive eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Natural colours only (no team colour): these are hostile guards of the wild mines.

LAYOUT: 8 columns × 5 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": neutral stance, shifty eyes.
Row 2 "Walk": mid-stride sneaky walk.
Row 3 "Attack": wild slash with the machete, white motion arc.
Row 4 "Hit": recoiling, eyes shut.
Row 5 "Die": lying on the back, torch dropped and out.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the off-hand item in the LEFT hand in every direction. Every piece of gear is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the character centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

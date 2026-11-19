# Troll đá (Stone troll) · bãi quái cấp 7

Mã quái: `troll` · ô 192×192 px

**Gửi kèm ảnh mẫu:** `../army/sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ và bảng màu. Nếu công cụ không nhận ảnh thì vẫn dán prompt như bình thường.

## Bước 1: sheet 8 hướng (1 tư thế mỗi hoạt ảnh)

Lưu thành `sprite-pixels/troll.png`

```text
Pixel art sprite sheet of a huge STONE TROLL: hunched giant with blue-grey stony skin, patches of green moss and small rocks on the shoulders, long arms, small dull eyes, two tusks, a tattered brown loincloth, a huge stone-headed wooden club in the right hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, the same outline thickness, palette richness and shading as the reference soldier. Cute but clearly hostile monster: slightly big head, expressive eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Natural colours only (no team colour): it is a wild monster.

LAYOUT: 8 columns × 5 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": hunched, club dragging on the ground.
Row 2 "Walk": slow heavy stomp.
Row 3 "Attack": slamming the stone club down onto the ground, dust and stone chips flying.
Row 4 "Hit": grunting, recoiling, rock chips falling off.
Row 5 "Die": collapsed face-down like a pile of rocks.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every part (tail, wings, weapon, horns…) is present in every direction; a held weapon stays in the same hand in every direction.

CELLS & BACKGROUND: every cell exactly the same size (192×192 px), the monster centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

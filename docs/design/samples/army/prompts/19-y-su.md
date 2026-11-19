# 19. Y sư (thầy thuốc hồi máu, Healer)

Mã quân: `y-su` · ô 128×128 px · mở ở **Thành trì cấp 7**

Không đánh. Mỗi giây hồi máu cho 3 lính phe mình bị thương nặng nhất trong 5 ô (tướng nhận một nửa). Không hồi công trình. Đi sau đội hình, khắc trận đánh dài (đánh boss, đánh căn cứ).

**Gửi kèm ảnh mẫu:** `sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ. Gửi lại dạng **File** PNG.

## Bước 1: sheet 8 hướng (1 tư thế mỗi hoạt ảnh)

Lưu thành `sprite-pixels/y-su.png`

```text
Pixel art sprite sheet of a gentle HEALER MONK, a young woman with her black hair in a bun held by a wooden pin, a kind face, a long white and royal BLUE robe with wide sleeves and a red sash, a small round straw hat hanging on her back, a wooden staff in the right hand topped with a green jade lotus that glows softly, a cloth medicine pouch and a small gourd bottle on the belt, glowing green healing herbs in the left hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing calmly, staff upright, a few green leaf-sparkle pixels.
Row 2 "Walk": walking, legs clearly apart, robe swaying, staff swinging.
Row 3 "Attack": "Heal": raising the staff high, the jade lotus shining, a ring of bright green healing pixels and small plus-shaped sparkles spreading around her.
Row 4 "Hit": flinching backwards, eyes shut, impact marks.
Row 5 "Victory": bowing politely with both hands holding the staff, green sparkles.
Row 6 "Die": lying on the side on the ground, eyes closed, the staff dropped beside her.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon / tool stays in the RIGHT hand and the off-hand item in the LEFT hand in every direction. Every piece of gear is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the character centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

Sheet 8 hướng được duyệt thì mình gửi tiếp prompt hoạt ảnh nhiều khung (bước 2) như các lính khác.

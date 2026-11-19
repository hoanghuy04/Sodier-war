# 18. Công binh (lính phá tường, Sapper)

Mã quân: `cong-binh` · ô 128×128 px · mở ở **Thành trì cấp 6**

Chạy thẳng tới **tường** gần nhất (hết tường thì tới công trình), châm thùng thuốc nổ: nổ vùng 1,5 ô, ×4 lên tường, ×2 lên công trình, rồi chết. Máu thấp, chạy nhanh. Mở đường cho quân vào căn cứ có nhiều tường (TH6–8 tới 450 đoạn tường).

**Gửi kèm ảnh mẫu:** `sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ. Gửi lại dạng **File** PNG.

## Bước 1: sheet 8 hướng (1 tư thế mỗi hoạt ảnh)

Lưu thành `sprite-pixels/cong-binh.png`

```text
Pixel art sprite sheet of a small brave SAPPER soldier carrying a big wooden POWDER KEG: short and stocky, a leather cap with round goggles pushed up on the forehead, a soot-smudged cheerful face with a moustache, a blue padded vest with many pouches over a brown shirt, a blue scarf, leather gloves, sturdy boots; he holds the iron-banded powder keg (with a short burning fuse sparking on top) against his chest with BOTH arms, a small lit torch tucked in the belt on the right side.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing, hugging the keg, the fuse sparking.
Row 2 "Walk": running fast, leaning forward, legs clearly apart, the keg held tight.
Row 3 "Attack": throwing himself forward and slamming the keg down in front of him, a big bright orange-yellow pixel explosion bursting from the keg.
Row 4 "Hit": stumbling backwards, eyes wide, the keg wobbling.
Row 5 "Victory": jumping with the keg lifted over his head, cheering.
Row 6 "Die": lying on the back, blackened with soot, little smoke puffs, broken keg staves around.

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

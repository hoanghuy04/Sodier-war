# 20. Voi chiến (War elephant)

Mã quân: `voi-chien` · ô 224×224 px · mở ở **Thành trì cấp 8**

Quân nặng nhất game: máu và giáp cực dày, đánh **công trình ×2**, mỗi cú giẫm nổ vùng 1,2 ô. Trên lưng có lính cung bắn tên (tầm 5). Chậm, chiếm 10 chỗ doanh trại. Cảm hứng voi chiến Hai Bà Trưng.

**Gửi kèm ảnh mẫu:** `sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ. Gửi lại dạng **File** PNG.

## Bước 1: sheet 8 hướng (1 tư thế mỗi hoạt ảnh)

Lưu thành `sprite-pixels/voi-chien.png`

```text
Pixel art sprite sheet of a huge armoured WAR ELEPHANT with a rider: a grey elephant with big ears, long curved ivory tusks capped with steel spikes, wearing a royal BLUE and gold caparison cloth, steel plate armour on the head, trunk and shoulders, gold bells on the harness; on its back a wooden howdah (small fortified seat) with blue and gold trims and a little blue pennant; in the howdah a female general in red-and-gold armour with a golden headband and long black hair, holding a bow in the left hand and an arrow in the right; a mahout boy in a blue turban sits on the elephant's neck holding a short hook.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, shield field, banners) so it can be recoloured later. This is a VERY BIG unit: about 2.5 times the height of the reference soldier and much wider, the biggest soldier in the game.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing, ears flapping, trunk swaying, the general ready with the bow.
Row 2 "Walk": heavy slow stride, legs clearly apart, the ground shaking (small dust puffs at the feet).
Row 3 "Attack": the elephant rears up on its hind legs and stomps down with its front legs, a ring of cracked earth and dust bursting around the feet, while the general shoots an arrow.
Row 4 "Hit": flinching backwards, trumpeting with the trunk raised, impact marks on the armour.
Row 5 "Victory": trunk raised high trumpeting, the general raising her bow, pennant flying.
Row 6 "Die": the elephant collapsed on its side on the ground, the howdah broken, the riders sitting dazed beside it.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon / tool stays in the RIGHT hand and the off-hand item in the LEFT hand in every direction. Every piece of gear is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (224×224 px), the character centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

Sheet 8 hướng được duyệt thì mình gửi tiếp prompt hoạt ảnh nhiều khung (bước 2) như các lính khác.

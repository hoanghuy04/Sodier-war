# 16. Vua Thành (tướng giữ nhà)

Mã quân: `vua-thanh` · ô 160×160 px · tướng giữ nhà, mở ở **Thành trì cấp 6**

Đứng trên Bệ Vua. Địch vào vùng canh 12 ô thì xông ra chém, đánh lan (cận chiến, máu rất trâu). Chiêu **Nộ Vương**: đập rìu xuống đất, choáng địch quanh 3 ô 2 giây và hồi 25% máu. Bị hạ thì ngồi hồi máu trên bệ.

**Gửi kèm ảnh mẫu:** `sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ. Gửi lại dạng **File** PNG.

Lưu thành `sprite-pixels/vua-thanh.png`

```text
Pixel art sprite sheet of a mighty WARRIOR KING who guards the player's castle: a broad, stocky middle-aged king with a big braided red-brown beard, a heavy golden crown with blue gems over a steel helmet rim, thick steel plate armour with gold trims, a royal BLUE cape with a white fur collar, a huge double-headed GREAT-AXE held in the right hand and a round steel shield with a golden crown emblem on the left arm, big fur boots.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman, but this is a HERO, about 1.4 times the height of the reference soldier. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, banners) so it can be recoloured later.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing proud, axe resting on the shoulder, breathing.
Row 2 "Walk": heavy stomping stride, legs clearly apart, cape swinging.
Row 3 "Attack": a huge overhead axe chop at full swing, white swoosh pixels.
Row 4 "Hit": flinching backwards behind the shield, impact marks.
Row 5 "Skill": "Royal Fury": slamming the axe into the ground, a ring of cracked rock and orange shock-wave pixels around him, eyes glowing.
Row 6 "Rest": knocked out, sitting on the ground exhausted, head down, axe lying beside him (he recovers on his altar).

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the off-hand item in the LEFT hand in every direction. Every piece of gear (crown, cape, fur, quiver…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (160×160 px), the character centred, feet on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

Sau khi sheet 8 hướng được duyệt, mình gửi tiếp prompt hoạt ảnh nhiều khung (đứng, đi, đánh, chiêu) giống các tướng hiện có.

# Vật thể tương tác Địa Ngục (5 loại × 2 trạng thái)

Sheet `vat-the-2` · 5 cột × 2 hàng · ô 256×256 px. Lò lửa, Lồng Hồn, Mạch phun nham, Tế đàn, Cột Neo (trận Ngục Chủ). Hàng 1 = trạng thái bình thường, hàng 2 = trạng thái sau khi bị đánh vỡ / đang hoạt động. Lửa động và cột nham phun là hiệu ứng riêng (`fx-11`).

**Gửi kèm:** `docs/design/samples/army/sprite-pixels/kiem-si.png`. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/vat-the-2.png`

```text
Pixel art sprite sheet of INTERACTIVE OBJECTS for a hell dungeon of a top-down RPG/RTS. 5 kinds (columns) × 2 states (rows).
Column 1 "Brazier" (1×1 tile): a black iron bowl brazier on three clawed legs. Row 1: full of burning red-orange fire. Row 2: smashed, tipped over, the coals scattered and dark.
Column 2 "Soul cage" (1×1 tile): a tall rusty iron birdcage on a stone base. Row 1: closed, a small translucent sky-blue ghostly soldier spirit glowing inside. Row 2: bars bent and broken open, empty.
Column 3 "Lava vent" (2×2 tiles, flat): a low round mound of cracked black crust with a hole in the middle. Row 1: dormant, a faint orange glow deep in the hole. Row 2: active, the cracks glowing bright, lava bubbling at the mouth.
Column 4 "Altar" (3×3 tiles, low and wide): a round stepped platform of dark basalt with a ring of carved runes and four short horn-shaped pillars at the corners. Row 1: dormant, runes dark. Row 2: active, the runes glowing pale gold and white (the safe exit point, the only gold-white object on the map).
Column 5 "Anchor pillar" (1×1 tile, tall): a heavy square black stone pillar with a huge iron ring near the top and a thick chain leading off it. Row 1: intact. Row 2: broken in half, the ring and the chain lying on the rubble.

STYLE (match the attached reference sheet): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and gold. Chunky, readable, slightly exaggerated toy-like shapes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Hell palette: deep crimson, basalt black, charcoal grey, molten orange, sulfur yellow, bone white. Glowing parts (lava cracks, ember eyes, flames) are drawn as hard-edged bands of 2-3 bright tones (white-yellow core → orange → deep red rim), never as a soft glow. Never use pink or magenta inside the sprite.
CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric, NOT a diamond): we see the front side and the top from above at about 45°.

CELLS & BACKGROUND: 5 columns × 2 rows, every cell exactly 256×256 px, each object centred horizontally with its base on the same baseline near the bottom of the cell, the same scale in both rows. The altar fills about 92% of the cell width; brazier, cage and pillar about 40-50% of the width. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no ground shadow, no glow on the background, no border, no grid lines, no text, no labels, no numbers.
```

# Vật phẩm nhặt trong Địa Ngục

Sheet `vat-pham` · 8 cột × 3 hàng · ô 64×64 px. Hồn tinh, tiền, bình máu, vật phẩm đặc biệt, rương và hoạt ảnh mở rương.

**Gửi kèm:** `docs/design/samples/army/sprite-pixels/kiem-si.png`. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/vat-pham.png`

```text
Pixel art sprite sheet of small PICKUP ITEMS lying on the ground in a hell dungeon of a top-down RPG/RTS. 8 columns × 3 rows, one item per cell.
Row 1 (currencies and healing): 1 "Blue soul gem": a small sky-blue faceted diamond-shaped crystal with a tiny white flame inside. 2 "Green soul gem": the same shape, a bit bigger, emerald green. 3 "Blood soul gem": the biggest, deep blood red with a bright core. 4 "Soul Ember": a small black coal lump with a glowing violet-orange flame shaped like a tiny face on top. 5 "Gold coin": one shiny gold coin standing at an angle. 6 "Gold pile": a small heap of gold coins. 7 "Blood flask": a small round glass flask of bright red potion with a cork and a string. 8 "Hell ticket": a small charred parchment ticket with a red wax seal stamped with a horned skull.
Row 2 (power-ups and chests): 1 "Soul magnet": a small horseshoe magnet made of bone with sky-blue tips. 2 "Blast talisman": a yellow paper talisman with a red abstract glyph and a lit fuse on top. 3 "Frost hourglass": a small hourglass with a bronze frame and ice-blue sand. 4 "Holy orb": a glowing white-gold orb in a little bronze holder. 5 "Hell chest": a small black iron chest with red glowing seams and a demon-skull lock. 6 "Elite chest": the same chest with gold trims and gold corners. 7 "Exit sigil": a small gold ring with a pale blue centre. 8 "Ghost soldier": a small translucent sky-blue soldier helmet with a faint glow.
Row 3 "Chest opening", 8 frames of the ELITE CHEST from row 2, left → right: closed; shaking; the lid cracks with golden light; the lid flies open with a column of golden light; coins and gems pop out; the light shrinks; the open chest glowing faintly; the open empty chest.

STYLE (match the attached reference sheet): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and gold. Chunky, readable, slightly exaggerated toy-like shapes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Hell palette: deep crimson, basalt black, charcoal grey, molten orange, sulfur yellow, bone white. Glowing parts (lava cracks, ember eyes, flames) are drawn as hard-edged bands of 2-3 bright tones (white-yellow core → orange → deep red rim), never as a soft glow. Never use pink or magenta inside the sprite.
CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric, NOT a diamond): we see the front side and the top from above at about 45°.

CELLS & BACKGROUND: 8 columns × 3 rows, every cell exactly 64×64 px, each item centred with its bottom on the same baseline; gems and coins fill about 40% of the cell, chests about 70%. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no border, no grid lines, no text, no labels, no numbers.
```

# Vật thể trang trí Địa Ngục (6 loại × 3 biến thể)

Sheet `vat-the-1` · 6 cột × 3 hàng · ô 192×192 px. Vật cản và trang trí, không tương tác. Mỗi vật đứng trên 1 ô (cột cao khoảng 2 ô). Game chọn ngẫu nhiên biến thể và lật ngang cho đa dạng.

**Gửi kèm:** `docs/design/samples/army/sprite-pixels/kiem-si.png`. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/vat-the-1.png`

```text
Pixel art sprite sheet of MAP OBSTACLES for a hell dungeon of a top-down strategy game. 6 kinds (columns) × 3 shape variants (rows); every object stands on a single map tile.
Columns (kinds):
1 "Obsidian pillar": a tall jagged pillar of glossy black-violet obsidian with sharp facets and a few thin glowing orange cracks.
2 "Chain post": a thick black iron post with a ring on top and rusty chains hanging from it, a broken shackle at the end of one chain.
3 "Bone pile": a low heap of large white bones, a rib cage and a horned skull.
4 "Skull stake": a charred wooden stake with a horned demon skull on top and a few small embers.
5 "Lava rock": a big black boulder with glowing orange lava cracks and a wisp of smoke.
6 "Demon statue": a weathered dark red stone statue of a kneeling horned demon with one horn broken off.
Rows (variants of the same kind, clearly different silhouettes, same style and colours):
Row 1 "Variant A": the typical full-size shape.
Row 2 "Variant B": a different shape (pillar: split in two points; chain post: leaning; bone pile: spread wider; stake: two stakes; rock: taller and narrower; statue: standing with arms crossed).
Row 3 "Variant C": a smaller or broken one (about 70% height, cracked or toppled).

STYLE (match the attached reference sheet): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and gold. Chunky, readable, slightly exaggerated toy-like shapes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Hell palette: deep crimson, basalt black, charcoal grey, molten orange, sulfur yellow, bone white. Glowing parts (lava cracks, ember eyes, flames) are drawn as hard-edged bands of 2-3 bright tones (white-yellow core → orange → deep red rim), never as a soft glow. Never use pink or magenta inside the sprite.
CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric, NOT a diamond): we see the front side and the top from above at about 45°.

CELLS & BACKGROUND: 6 columns × 3 rows, every cell exactly 192×192 px, each object centred horizontally with its base on the same baseline near the bottom of the cell. Pillars, posts, stakes and statues fill about 80% of the cell height, rocks and bone piles about 45%. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no ground shadow, no glow on the background, no border, no grid lines, no text, no labels, no numbers.
```

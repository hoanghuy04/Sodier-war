# Bẫy theo cấp (3 loại × 5 cấp + đã nổ)

Mỗi loại bẫy **1 sheet 6 ô**: cấp 1 → 5 rồi ô cuối là "đã nổ". Bẫy nhỏ, nằm trên **1 ô** bản đồ, phải nhìn rõ ở cỡ nhỏ. Cấp sau rõ ràng to và nguy hiểm hơn cấp trước.

**Gửi kèm ảnh mẫu:** `../army/sprite-pixels/1.png` (Kiếm sĩ, để giữ nét vẽ). Gửi lại dạng **File** PNG.

## 1. Bom

Lưu thành `sprite-pixels/bay-bom.png`

```text
Pixel art sprite sheet of a hidden BOMB TRAP for a medieval base-building strategy game (a round black iron bomb half buried in a small patch of dug earth, a short twisted fuse on top, a riveted band around it), lying flat on a single map tile, drawn at 5 upgrade levels plus its used state, one per column. Every level is clearly bigger, richer and more dangerous than the previous one but stays recognisably the same trap with the same footprint:
Column 1 "Level 1": a small rough iron bomb with a rope band, a short fuse, a few pebbles around.
Column 2 "Level 2": a bigger iron bomb with two riveted bands and a brass fuse cap.
Column 3 "Level 3": a heavy steel bomb with spikes around its band, a glowing red fuse tip, sandbags around the hole.
Column 4 "Level 4": a black-steel bomb with BRONZE bands and four short spikes, a skull mark painted on it, a stone ring around the hole.
Column 5 "Level 5": a huge GOLD-banded black bomb with glowing orange cracks (solid pixels), big spikes and a crown-shaped fuse holder, the most dangerous.
Column 6 "Used": the level 3 trap after it went off: the bomb is gone: a small scorched crater with black soot and two little smoke wisps.

STYLE (match the attached reference sheet): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal and gold. Chunky, readable shapes that still read at a small size. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the top and the front of the trap from above at about 45°.

CELLS & BACKGROUND: 6 columns x 1 row, every cell exactly 192x192 px, each trap centred with its base near the bottom of the cell, identical scale in every cell; the trap fills about 55 % of the cell width (it covers one map tile; level 5 may be a little bigger). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No grass, no ground shadow outside the object, no glow, no border, no grid lines, no text, no labels, no numbers.
```

## 2. Lò xo

Lưu thành `sprite-pixels/bay-lo-xo.png`

```text
Pixel art sprite sheet of a hidden SPRING TRAP for a medieval base-building strategy game (a square wooden-and-iron pressure plate on the ground with a big coiled steel spring under a red-painted lid), lying flat on a single map tile, drawn at 5 upgrade levels plus its used state, one per column. Every level is clearly bigger, richer and more dangerous than the previous one but stays recognisably the same trap with the same footprint:
Column 1 "Level 1": a plain wooden plate with a thin rusty spring, a red lid.
Column 2 "Level 2": an iron-framed plate with a thicker spring and two hinges.
Column 3 "Level 3": a steel plate with BRONZE corners, a double spring and a red-and-white warning stripe.
Column 4 "Level 4": a riveted steel plate with BRONZE trims, a triple heavy spring, a skull-and-arrow mark on the lid.
Column 5 "Level 5": a GOLD-framed plate with a glowing blue rune on the lid (solid pixels), huge gold springs, the strongest launcher.
Column 6 "Used": the level 3 trap after it went off: the lid flipped open and bent up, the spring sticking out loose, a few splinters.

STYLE (match the attached reference sheet): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal and gold. Chunky, readable shapes that still read at a small size. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the top and the front of the trap from above at about 45°.

CELLS & BACKGROUND: 6 columns x 1 row, every cell exactly 192x192 px, each trap centred with its base near the bottom of the cell, identical scale in every cell; the trap fills about 55 % of the cell width (it covers one map tile; level 5 may be a little bigger). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No grass, no ground shadow outside the object, no glow, no border, no grid lines, no text, no labels, no numbers.
```

## 3. Bom khí

Lưu thành `sprite-pixels/bay-bom-khi.png`

```text
Pixel art sprite sheet of a hidden AIR MINE for a medieval base-building strategy game (a small upright red-and-white striped rocket mine on a little three-legged iron stand, pointed tip and short fins, aimed at the sky), lying flat on a single map tile, drawn at 5 upgrade levels plus its used state, one per column. Every level is clearly bigger, richer and more dangerous than the previous one but stays recognisably the same trap with the same footprint:
Column 1 "Level 1": a small wooden rocket with paper fins on a wobbly stand.
Column 2 "Level 2": a red-and-white striped iron rocket on a sturdier tripod.
Column 3 "Level 3": two small rockets side by side on a steel stand with a brass ring.
Column 4 "Level 4": a sleek steel rocket with BRONZE fins and a red tip on a reinforced stand with a small dish.
Column 5 "Level 5": a big GOLD-trimmed rocket with a glowing cyan tip (solid pixels) on a royal stand, three small rockets around it, the strongest.
Column 6 "Used": the level 3 trap after it went off: the stand is empty and tipped over, a black scorch mark and a thin smoke line rising.

STYLE (match the attached reference sheet): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal and gold. Chunky, readable shapes that still read at a small size. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the top and the front of the trap from above at about 45°.

CELLS & BACKGROUND: 6 columns x 1 row, every cell exactly 192x192 px, each trap centred with its base near the bottom of the cell, identical scale in every cell; the trap fills about 55 % of the cell width (it covers one map tile; level 5 may be a little bigger). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No grass, no ground shadow outside the object, no glow, no border, no grid lines, no text, no labels, no numbers.
```

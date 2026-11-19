# Mẫu vẽ 7 mỏ khoáng sản

Mỗi mỏ là một vật thể đứng trên bản đồ (không có hướng). Vẽ **1 ảnh 7 ô**, mỗi ô một loại mỏ. Game tự vẽ viền xanh / đỏ và cờ của chủ mỏ, nên không cần vẽ cờ.

**Gửi kèm ảnh mẫu:** `../army/sprite-pixels/1.png`. Lưu thành `mines/sprite-pixels/mo.png`. Gửi dạng **File** (PNG) để nét nhất.

## Bước 1

```text
Pixel art sprite sheet of 7 RESOURCE MINES for a strategy game map, one per cell, each sitting on a small patch of its own ground:
Cell 1 "Iron mine": a low grey-blue rock outcrop with rust-red iron veins and brown ore lumps, a small wooden mine entrance framed by beams, a mine cart full of iron ore on a short rail track in front.
Cell 2 "Coal mine": a heap of angular black coal lumps with blue-grey shiny faces, a small wooden winch tower with a rope and a bucket above a dark shaft, a small brick furnace glowing orange at the side.
Cell 3 "Gold mine": a layered sandy-brown cliff block with two thick wavy gold veins and sparkling gold nuggets, a pickaxe stuck in the rock, a small wooden sluice with water and a pan of gold dust in front.
Cell 4 "Oil well": a yellow and black steel pumpjack (horse-head oil pump) on an A-frame, a black oil puddle with a shiny rainbow streak at its base, two oil barrels.
Cell 5 "Tar pit": an irregular oval pit of bubbling black tar with a purple-rainbow sheen, rocks around the rim, a few bones half sunk in, bubbles popping.
Cell 6 "Crystal mine": 5-7 tall hexagonal violet crystal pillars growing at angles out of a purple-grey rock base, each crystal with a dark, a mid and a bright face and a white glint on one edge.
Cell 7 "Diamond temple": the rarest mine, BIGGER than the others (4×4 map tiles instead of 3×3): an ancient octagonal stone platform with cracked edges, moss between the stones, carved runes at the corners, two broken carved pillars, and a huge cyan diamond on an altar in the middle glowing softly.

STYLE (match the attached reference sheet): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and gems. Chunky, readable, slightly toy-like shapes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. No team colour and no flags (the game draws the owner's coloured outline and flag itself).

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the front side and the top from above at about 45°; every mine faces the viewer.

CELLS & BACKGROUND: 7 columns × 1 row, every cell exactly 256×256 px, each mine centred with its base near the bottom of the cell. Mines 1-6 fill about 70% of the cell width (3×3 map tiles); the diamond temple fills about 92% (4×4 map tiles). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow outside the object, no glow, no border, no grid lines, no text, no labels, no numbers.
```

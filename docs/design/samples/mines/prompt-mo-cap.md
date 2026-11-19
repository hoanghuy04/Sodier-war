# Mỏ theo cấp (nâng cấp mỏ)

Mỗi loại mỏ **1 sheet 4 ô** = cấp 2, 3, 4, 5 (cấp 1 là hình hiện tại). Tổng 7 sheet. Mỗi cấp phải giàu và hoành tráng hơn cấp trước rõ rệt, nhưng vẫn nhận ra là cùng một mỏ.

**Gửi kèm 2 ảnh mẫu:** `../army/sprite-pixels/1.png` (nét vẽ) và `sprite-pixels/mo.png` (hình cấp 1 của 7 mỏ). Gửi lại dạng **File** PNG.

## 1. Mỏ Sắt

Lưu thành `sprite-pixels/iron-cap.png`

```text
Pixel art sprite sheet of the SAME mine as cell 1 of the attached level-1 mines sheet (an IRON MINE: a low grey-blue rock outcrop with rust-red iron veins, a wooden mine entrance framed by beams, a mine cart full of iron ore on a short rail track), drawn at 4 upgrade levels, one per column. The mine grows richer, bigger and more impressive at every level while staying recognisably the same mine with the same base shape and the same footprint:
Column 1 "Level 2": more ore piles, the entrance reinforced with thick logs and iron bands, a second mine cart, a lantern on a post.
Column 2 "Level 3": the entrance rebuilt in grey cut stone with an iron door frame, a small iron crane lifting ore, rails split into two tracks, a stack of iron ingots.
Column 3 "Level 4": a big stone mine house with a BRONZE winch wheel and bronze pipes, a steam vent, a conveyor of iron ore, glowing orange smelter.
Column 4 "Level 5": a grand fortified iron works: tall chimney, GOLD-trimmed machinery, a huge gear wheel, piles of shiny steel ingots, sparks (solid pixels).

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the level-1 mines. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and gems. Chunky, readable, slightly toy-like shapes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. No team colour and no flags (the game draws the owner's outline and flag itself).

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the front side and the top from above at about 45°; the mine faces the viewer.

CELLS & BACKGROUND: 4 columns x 1 row, every cell exactly 256x256 px, the mine centred with its base near the bottom of the cell, identical scale in every cell; the mine fills about 72% of the cell width (3x3 map tiles, level 5 may be slightly taller, never wider). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground outside the object, no ground shadow, no glow, no border, no grid lines, no text, no labels, no numbers.
```

## 2. Mỏ Than

Lưu thành `sprite-pixels/coal-cap.png`

```text
Pixel art sprite sheet of the SAME mine as cell 2 of the attached level-1 mines sheet (a COAL MINE: a heap of black coal lumps with blue-grey shiny faces, a small wooden winch tower with a rope and bucket above a dark shaft, a small brick furnace glowing orange), drawn at 4 upgrade levels, one per column. The mine grows richer, bigger and more impressive at every level while staying recognisably the same mine with the same base shape and the same footprint:
Column 1 "Level 2": a taller winch tower with iron bands, more coal heaps, two buckets, a wheelbarrow.
Column 2 "Level 3": a stone shaft house with a tiled roof, iron rails and a coal cart, a bigger brick furnace with two chimneys.
Column 3 "Level 4": a big headframe tower of dark iron with a BRONZE pulley wheel, a conveyor belt dumping coal, glowing furnaces.
Column 4 "Level 5": a grand coal works: tall black-iron headframe trimmed with GOLD, three chimneys with orange glow, mountains of shiny coal, sparks (solid pixels).

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the level-1 mines. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and gems. Chunky, readable, slightly toy-like shapes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. No team colour and no flags (the game draws the owner's outline and flag itself).

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the front side and the top from above at about 45°; the mine faces the viewer.

CELLS & BACKGROUND: 4 columns x 1 row, every cell exactly 256x256 px, the mine centred with its base near the bottom of the cell, identical scale in every cell; the mine fills about 72% of the cell width (3x3 map tiles, level 5 may be slightly taller, never wider). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground outside the object, no ground shadow, no glow, no border, no grid lines, no text, no labels, no numbers.
```

## 3. Mỏ Vàng

Lưu thành `sprite-pixels/gold-cap.png`

```text
Pixel art sprite sheet of the SAME mine as cell 3 of the attached level-1 mines sheet (a GOLD MINE: a sandy-brown cliff block with thick wavy gold veins and sparkling nuggets, a pickaxe stuck in the rock, a small wooden sluice with water and a pan of gold dust), drawn at 4 upgrade levels, one per column. The mine grows richer, bigger and more impressive at every level while staying recognisably the same mine with the same base shape and the same footprint:
Column 1 "Level 2": wider gold veins, a wooden scaffold on the cliff, two pans, a sack of nuggets.
Column 2 "Level 3": a stone-framed mine entrance, a longer sluice with a water wheel, a small chest of gold nuggets.
Column 3 "Level 4": a big water wheel with BRONZE fittings, a gold-washing station, open treasure chests overflowing with nuggets, bigger glittering veins.
Column 4 "Level 5": a grand gold mine: the whole cliff laced with thick gold veins, a GOLD-trimmed stone gate with a crown emblem, carts of gold bars, many sparkles (solid pixels).

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the level-1 mines. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and gems. Chunky, readable, slightly toy-like shapes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. No team colour and no flags (the game draws the owner's outline and flag itself).

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the front side and the top from above at about 45°; the mine faces the viewer.

CELLS & BACKGROUND: 4 columns x 1 row, every cell exactly 256x256 px, the mine centred with its base near the bottom of the cell, identical scale in every cell; the mine fills about 72% of the cell width (3x3 map tiles, level 5 may be slightly taller, never wider). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground outside the object, no ground shadow, no glow, no border, no grid lines, no text, no labels, no numbers.
```

## 4. Giếng Dầu

Lưu thành `sprite-pixels/oil-cap.png`

```text
Pixel art sprite sheet of the SAME mine as cell 4 of the attached level-1 mines sheet (an OIL WELL: a yellow and black steel pumpjack (horse-head pump) on an A-frame, a black oil puddle with a rainbow streak, two oil barrels), drawn at 4 upgrade levels, one per column. The mine grows richer, bigger and more impressive at every level while staying recognisably the same mine with the same base shape and the same footprint:
Column 1 "Level 2": a bigger pumpjack, a small storage tank, four barrels, a pipe to the tank.
Column 2 "Level 3": two pumpjacks, a riveted steel storage tank with a ladder, pipes and valves.
Column 3 "Level 4": a tall drilling derrick of steel with BRONZE valves, two big tanks, pipelines, a pressure gauge, a small flame on a flare stack.
Column 4 "Level 5": a grand oil refinery: tall derrick trimmed with GOLD, three shiny tanks, glowing flare, golden pipes and wheels, black gold gushing (solid pixels).

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the level-1 mines. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and gems. Chunky, readable, slightly toy-like shapes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. No team colour and no flags (the game draws the owner's outline and flag itself).

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the front side and the top from above at about 45°; the mine faces the viewer.

CELLS & BACKGROUND: 4 columns x 1 row, every cell exactly 256x256 px, the mine centred with its base near the bottom of the cell, identical scale in every cell; the mine fills about 72% of the cell width (3x3 map tiles, level 5 may be slightly taller, never wider). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground outside the object, no ground shadow, no glow, no border, no grid lines, no text, no labels, no numbers.
```

## 5. Hố Dầu Đen

Lưu thành `sprite-pixels/tar-cap.png`

```text
Pixel art sprite sheet of the SAME mine as cell 5 of the attached level-1 mines sheet (a TAR PIT: an irregular oval pit of bubbling black tar with a purple-rainbow sheen, rocks around the rim, a few bones half sunk in), drawn at 4 upgrade levels, one per column. The mine grows richer, bigger and more impressive at every level while staying recognisably the same mine with the same base shape and the same footprint:
Column 1 "Level 2": a bigger pit with a wooden walkway over it and a bucket on a pole, more bubbles.
Column 2 "Level 3": a stone rim around the pit, a wooden crane dipping a big bucket, barrels of tar.
Column 3 "Level 4": a dark stone basin with BRONZE pipes pumping tar into a cauldron over a fire, purple fumes (solid pixels), skulls on the rim.
Column 4 "Level 5": a grand sinister tar forge: obsidian rim trimmed with GOLD, a huge cauldron, glowing purple runes on the stones, big purple bubbles (solid pixels).

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the level-1 mines. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and gems. Chunky, readable, slightly toy-like shapes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. No team colour and no flags (the game draws the owner's outline and flag itself).

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the front side and the top from above at about 45°; the mine faces the viewer.

CELLS & BACKGROUND: 4 columns x 1 row, every cell exactly 256x256 px, the mine centred with its base near the bottom of the cell, identical scale in every cell; the mine fills about 72% of the cell width (3x3 map tiles, level 5 may be slightly taller, never wider). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground outside the object, no ground shadow, no glow, no border, no grid lines, no text, no labels, no numbers.
```

## 6. Mỏ Pha lê

Lưu thành `sprite-pixels/crystal-cap.png`

```text
Pixel art sprite sheet of the SAME mine as cell 6 of the attached level-1 mines sheet (a CRYSTAL MINE: 5-7 tall hexagonal violet crystal pillars growing at angles out of a purple-grey rock base, each with a dark, a mid and a bright face and a white glint), drawn at 4 upgrade levels, one per column. The mine grows richer, bigger and more impressive at every level while staying recognisably the same mine with the same base shape and the same footprint:
Column 1 "Level 2": more and taller violet crystals, a small wooden scaffold and a pickaxe.
Column 2 "Level 3": a stone ring around the crystal cluster, cut crystals stacked in crates, a lantern.
Column 3 "Level 4": huge violet crystals framed by BRONZE braces and rings, floating small shards held by the braces, glowing rune stones.
Column 4 "Level 5": a grand crystal sanctum: giant violet crystals with GOLD crowns and bands, a gold arch, bright inner glow drawn with solid pixels, sparkles.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the level-1 mines. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and gems. Chunky, readable, slightly toy-like shapes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. No team colour and no flags (the game draws the owner's outline and flag itself).

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the front side and the top from above at about 45°; the mine faces the viewer.

CELLS & BACKGROUND: 4 columns x 1 row, every cell exactly 256x256 px, the mine centred with its base near the bottom of the cell, identical scale in every cell; the mine fills about 72% of the cell width (3x3 map tiles, level 5 may be slightly taller, never wider). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground outside the object, no ground shadow, no glow, no border, no grid lines, no text, no labels, no numbers.
```

## 7. Đền Kim cương

Lưu thành `sprite-pixels/diamond-cap.png`

```text
Pixel art sprite sheet of the SAME mine as cell 7 of the attached level-1 mines sheet (the DIAMOND TEMPLE, bigger than the other mines (4x4 tiles): an ancient octagonal stone platform with cracked edges and moss, carved runes at the corners, two broken pillars, a huge cyan diamond on an altar in the middle), drawn at 4 upgrade levels, one per column. The mine grows richer, bigger and more impressive at every level while staying recognisably the same mine with the same base shape and the same footprint:
Column 1 "Level 2": the pillars repaired, cleaned stones, a second smaller diamond, braziers at the corners.
Column 2 "Level 3": four whole carved pillars with a stone ring on top, runes lit cyan (solid pixels), steps up to the altar.
Column 3 "Level 4": a roofed stone temple with BRONZE domes and cyan glowing runes, three big diamonds on the altar.
Column 4 "Level 5": a grand white-marble temple with GOLD domes and spires, a giant floating cyan diamond above the altar held by gold claws, many sparkles (solid pixels).

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the level-1 mines. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and gems. Chunky, readable, slightly toy-like shapes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. No team colour and no flags (the game draws the owner's outline and flag itself).

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the front side and the top from above at about 45°; the mine faces the viewer.

CELLS & BACKGROUND: 4 columns x 1 row, every cell exactly 256x256 px, the mine centred with its base near the bottom of the cell, identical scale in every cell; the mine fills about 92% of the cell width (4x4 map tiles, level 5 may be slightly taller, never wider). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground outside the object, no ground shadow, no glow, no border, no grid lines, no text, no labels, no numbers.
```

# Lên cấp 6–8 cho công trình đã có

Thành trì lên tới cấp 8 thì các công trình đánh / giữ nhà cũng lên tới cấp 8 (công trình không vượt cấp Thành trì). Mỗi công trình cần **1 sheet thêm 3 hình: cấp 6, 7, 8** (không cần vẽ lại cấp 1–5 và đổ nát).

**Cách vẽ:** gửi kèm **sheet cũ của chính công trình đó** (trong `client/assets/buildings/` hoặc `sprite-pixels/`) làm ảnh mẫu, để công cụ giữ nguyên hình dáng, đổi chất liệu theo hệ: **cấp 6 nước, cấp 7 dung nham, cấp 8 sấm sét**, màu khác hẳn cấp 1–5, dáng đồ sộ hơn (to, dày, cao hơn, thêm tháp / giáp / trang trí) nhưng vẫn nhận ra là công trình cũ. Gửi lại dạng **File** PNG.

Học viện, Rương đồ, Lò nghiền, Lò rèn, Nhà thợ xây và bẫy giữ tối đa cấp 5 (không cần vẽ).

| Mã | Tên | Ô | Lưu thành | Ưu tiên |
|---|---|---|---|---|
| `thanh-tri` | Thành trì | 384×384 | `sprite-pixels/thanh-tri-6-8.png` | Bắt buộc (Thành trì cấp 6, 7, 8) |
| `thap-cung` | Tháp cung | 256×256 | `sprite-pixels/thap-cung-6-8.png` | Bắt buộc |
| `phao-da` | Pháo đá | 256×256 | `sprite-pixels/phao-da-6-8.png` | Bắt buộc |
| `thap-phep` | Tháp phép | 256×256 | `sprite-pixels/thap-phep-6-8.png` | Bắt buộc |
| `kho` | Kho | 256×256 | `sprite-pixels/kho-6-8.png` | Bắt buộc |
| `hoi-thanh` | Hội thành | 384×384 | `sprite-pixels/hoi-thanh-6-8.png` | Bắt buộc |
| `doanh-trai` | Doanh trại | 512×512 | `sprite-pixels/doanh-trai-6-8.png` | Nên có |

## Thành trì (`thanh-tri`) cấp 6–8

Lưu thành `sprite-pixels/thanh-tri-6-8.png`

```text
Pixel art sprite sheet continuing the attached sheet of the CASTLE KEEP (main building of the base): draw the SAME building (identical 3×3 tile footprint, the same main parts in the same places, the same front-facing camera, so the player still recognises it) at three new, much higher ELEMENTAL levels. Each level is clearly GRANDER and more MASSIVE than the attached level 5 and than the level before it: thicker walls, bigger and heavier blocks, taller towers or a taller weapon, extra turrets / spires / buttresses / armour plates, bigger ornaments, a more imposing and powerful silhouette (still built on the same footprint). The COLOURS must be completely different from levels 1-5: do NOT use brown wood, red clay tiles, plain grey stone, bronze, or white marble with gold, which belong to the lower levels.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and crystal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like base buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth, painted plates) so it can be recoloured later.

LEVELS (one per column, each one an ELEMENT):
Column 1 "Level 6, WATER": built of deep TEAL and turquoise sea-stone with mother-of-pearl and polished silver trims, coral and seashell ornaments, clear AQUA water crystals, small waterfalls or glowing water streams running down the walls into little pools at the base, bubbles and foam pixels; roof (if any) of sea-green scale tiles like fish scales.
Column 2 "Level 7, LAVA": built of massive BLACK BASALT and dark volcanic rock with deep CRACKS full of glowing ORANGE-RED MOLTEN LAVA, blackened iron plates with red-hot rivets, small lava falls and glowing magma pools at the base, ember and spark pixels rising, roof (if any) of black obsidian tiles with glowing orange edges.
Column 3 "Level 8, LIGHTNING": the grandest version: built of dark STORM-GREY gunmetal and dark charcoal stone with bright SILVER plates, big floating storm crystals in electric YELLOW and white, crackling jagged LIGHTNING BOLTS arcing between spires and lightning-rod tips, small dark storm-cloud puffs around the top, glowing yellow rune lines; roof (if any) of dark gunmetal tiles with yellow lightning patterns.
Keep the team-colour royal BLUE banners / flags / cloth at every level (only those parts are blue).

CELLS & BACKGROUND: 3 columns × 1 row, every cell exactly the same size (384×384 px), exactly the same scale and baseline as the attached sheet, the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell (each higher level is taller and more massive, up to about 30% taller than the attached level 5 at level 8, but never wider than about 92% of the cell; the effects such as water, lava and lightning may rise above it but never cross into a neighbouring cell). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Tháp cung (`thap-cung`) cấp 6–8

Lưu thành `sprite-pixels/thap-cung-6-8.png`

```text
Pixel art sprite sheet continuing the attached sheet of the ARCHER TOWER: draw the SAME building (identical 2×2 tile footprint, the same main parts in the same places, the same front-facing camera, so the player still recognises it) at three new, much higher ELEMENTAL levels. Each level is clearly GRANDER and more MASSIVE than the attached level 5 and than the level before it: thicker walls, bigger and heavier blocks, taller towers or a taller weapon, extra turrets / spires / buttresses / armour plates, bigger ornaments, a more imposing and powerful silhouette (still built on the same footprint). The COLOURS must be completely different from levels 1-5: do NOT use brown wood, red clay tiles, plain grey stone, bronze, or white marble with gold, which belong to the lower levels.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and crystal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like base buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth, painted plates) so it can be recoloured later.

LEVELS (one per column, each one an ELEMENT):
Column 1 "Level 6, WATER": built of deep TEAL and turquoise sea-stone with mother-of-pearl and polished silver trims, coral and seashell ornaments, clear AQUA water crystals, small waterfalls or glowing water streams running down the walls into little pools at the base, bubbles and foam pixels; roof (if any) of sea-green scale tiles like fish scales.
Column 2 "Level 7, LAVA": built of massive BLACK BASALT and dark volcanic rock with deep CRACKS full of glowing ORANGE-RED MOLTEN LAVA, blackened iron plates with red-hot rivets, small lava falls and glowing magma pools at the base, ember and spark pixels rising, roof (if any) of black obsidian tiles with glowing orange edges.
Column 3 "Level 8, LIGHTNING": the grandest version: built of dark STORM-GREY gunmetal and dark charcoal stone with bright SILVER plates, big floating storm crystals in electric YELLOW and white, crackling jagged LIGHTNING BOLTS arcing between spires and lightning-rod tips, small dark storm-cloud puffs around the top, glowing yellow rune lines; roof (if any) of dark gunmetal tiles with yellow lightning patterns.
Keep the team-colour royal BLUE banners / flags / cloth at every level (only those parts are blue).

CELLS & BACKGROUND: 3 columns × 1 row, every cell exactly the same size (256×256 px), exactly the same scale and baseline as the attached sheet, the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell (each higher level is taller and more massive, up to about 30% taller than the attached level 5 at level 8, but never wider than about 92% of the cell; the effects such as water, lava and lightning may rise above it but never cross into a neighbouring cell). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Pháo đá (`phao-da`) cấp 6–8

Lưu thành `sprite-pixels/phao-da-6-8.png`

```text
Pixel art sprite sheet continuing the attached sheet of the STONE-BALL CANNON emplacement: a LOW ROUND stone parapet ring (a short circular wall, open in the middle, NOT a square block, NOT a box) with a big cannon on a heavy wheeled carriage inside it, the barrel pointing straight toward the viewer so we see its round dark muzzle from the front, a little pyramid of cannonballs and a crate on the front-right ledge. It is as low and wide as the attached level 5 (about as tall as it is wide), seen straight from the front, never from a corner. Keep that round low ring and the front-facing cannon at every level, but make each level GRANDER: a thicker, heavier ring with bigger blocks and buttresses, a bigger and longer barrel with heavy bands, extra armour plates and ornaments. The COLOURS must be completely different from levels 1-5: do NOT use brown wood, red clay tiles, plain grey stone, bronze, or white marble with gold.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and crystal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like base buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth, painted plates) so it can be recoloured later.

LEVELS (one per column, each one an ELEMENT):
Column 1 "Level 6, WATER": built of deep TEAL and turquoise sea-stone with mother-of-pearl and polished silver trims, coral and seashell ornaments, clear AQUA water crystals, small waterfalls or glowing water streams running down the walls into little pools at the base, bubbles and foam pixels; roof (if any) of sea-green scale tiles like fish scales.
Column 2 "Level 7, LAVA": built of massive BLACK BASALT and dark volcanic rock with deep CRACKS full of glowing ORANGE-RED MOLTEN LAVA, blackened iron plates with red-hot rivets, small lava falls and glowing magma pools at the base, ember and spark pixels rising, roof (if any) of black obsidian tiles with glowing orange edges.
Column 3 "Level 8, LIGHTNING": the grandest version: built of dark STORM-GREY gunmetal and dark charcoal stone with bright SILVER plates, big floating storm crystals in electric YELLOW and white, crackling jagged LIGHTNING BOLTS arcing between spires and lightning-rod tips, small dark storm-cloud puffs around the top, glowing yellow rune lines; roof (if any) of dark gunmetal tiles with yellow lightning patterns.
Keep the team-colour royal BLUE banners / flags / cloth at every level (only those parts are blue).

CELLS & BACKGROUND: 3 columns × 1 row, every cell exactly the same size (256×256 px), exactly the same scale and baseline as the attached sheet, the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell (each higher level is taller and more massive, up to about 30% taller than the attached level 5 at level 8, but never wider than about 92% of the cell; the effects such as water, lava and lightning may rise above it but never cross into a neighbouring cell). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Tháp phép (`thap-phep`) cấp 6–8

Lưu thành `sprite-pixels/thap-phep-6-8.png`

```text
Pixel art sprite sheet continuing the attached sheet of the MAGE TOWER: draw the SAME building (identical 2×2 tile footprint, the same main parts in the same places, the same front-facing camera, so the player still recognises it) at three new, much higher ELEMENTAL levels. Each level is clearly GRANDER and more MASSIVE than the attached level 5 and than the level before it: thicker walls, bigger and heavier blocks, taller towers or a taller weapon, extra turrets / spires / buttresses / armour plates, bigger ornaments, a more imposing and powerful silhouette (still built on the same footprint). The COLOURS must be completely different from levels 1-5: do NOT use brown wood, red clay tiles, plain grey stone, bronze, or white marble with gold, which belong to the lower levels.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and crystal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like base buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth, painted plates) so it can be recoloured later.

LEVELS (one per column, each one an ELEMENT):
Column 1 "Level 6, WATER": built of deep TEAL and turquoise sea-stone with mother-of-pearl and polished silver trims, coral and seashell ornaments, clear AQUA water crystals, small waterfalls or glowing water streams running down the walls into little pools at the base, bubbles and foam pixels; roof (if any) of sea-green scale tiles like fish scales.
Column 2 "Level 7, LAVA": built of massive BLACK BASALT and dark volcanic rock with deep CRACKS full of glowing ORANGE-RED MOLTEN LAVA, blackened iron plates with red-hot rivets, small lava falls and glowing magma pools at the base, ember and spark pixels rising, roof (if any) of black obsidian tiles with glowing orange edges.
Column 3 "Level 8, LIGHTNING": the grandest version: built of dark STORM-GREY gunmetal and dark charcoal stone with bright SILVER plates, big floating storm crystals in electric YELLOW and white, crackling jagged LIGHTNING BOLTS arcing between spires and lightning-rod tips, small dark storm-cloud puffs around the top, glowing yellow rune lines; roof (if any) of dark gunmetal tiles with yellow lightning patterns.
Keep the team-colour royal BLUE banners / flags / cloth at every level (only those parts are blue).

CELLS & BACKGROUND: 3 columns × 1 row, every cell exactly the same size (256×256 px), exactly the same scale and baseline as the attached sheet, the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell (each higher level is taller and more massive, up to about 30% taller than the attached level 5 at level 8, but never wider than about 92% of the cell; the effects such as water, lava and lightning may rise above it but never cross into a neighbouring cell). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Kho (`kho`) cấp 6–8

Lưu thành `sprite-pixels/kho-6-8.png`

```text
Pixel art sprite sheet continuing the attached sheet of the STOREHOUSE: draw the SAME building (identical 2×2 tile footprint, the same main parts in the same places, the same front-facing camera, so the player still recognises it) at three new, much higher ELEMENTAL levels. Each level is clearly GRANDER and more MASSIVE than the attached level 5 and than the level before it: thicker walls, bigger and heavier blocks, taller towers or a taller weapon, extra turrets / spires / buttresses / armour plates, bigger ornaments, a more imposing and powerful silhouette (still built on the same footprint). The COLOURS must be completely different from levels 1-5: do NOT use brown wood, red clay tiles, plain grey stone, bronze, or white marble with gold, which belong to the lower levels.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and crystal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like base buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth, painted plates) so it can be recoloured later.

LEVELS (one per column, each one an ELEMENT):
Column 1 "Level 6, WATER": built of deep TEAL and turquoise sea-stone with mother-of-pearl and polished silver trims, coral and seashell ornaments, clear AQUA water crystals, small waterfalls or glowing water streams running down the walls into little pools at the base, bubbles and foam pixels; roof (if any) of sea-green scale tiles like fish scales.
Column 2 "Level 7, LAVA": built of massive BLACK BASALT and dark volcanic rock with deep CRACKS full of glowing ORANGE-RED MOLTEN LAVA, blackened iron plates with red-hot rivets, small lava falls and glowing magma pools at the base, ember and spark pixels rising, roof (if any) of black obsidian tiles with glowing orange edges.
Column 3 "Level 8, LIGHTNING": the grandest version: built of dark STORM-GREY gunmetal and dark charcoal stone with bright SILVER plates, big floating storm crystals in electric YELLOW and white, crackling jagged LIGHTNING BOLTS arcing between spires and lightning-rod tips, small dark storm-cloud puffs around the top, glowing yellow rune lines; roof (if any) of dark gunmetal tiles with yellow lightning patterns.
Keep the team-colour royal BLUE banners / flags / cloth at every level (only those parts are blue).

CELLS & BACKGROUND: 3 columns × 1 row, every cell exactly the same size (256×256 px), exactly the same scale and baseline as the attached sheet, the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell (each higher level is taller and more massive, up to about 30% taller than the attached level 5 at level 8, but never wider than about 92% of the cell; the effects such as water, lava and lightning may rise above it but never cross into a neighbouring cell). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Hội thành (`hoi-thanh`) cấp 6–8

Lưu thành `sprite-pixels/hoi-thanh-6-8.png`

```text
Pixel art sprite sheet continuing the attached sheet of the black-brick GUILD FORTRESS: draw the SAME building (identical 3×3 tile footprint, the same main parts in the same places, the same front-facing camera, so the player still recognises it) at three new, much higher ELEMENTAL levels. Each level is clearly GRANDER and more MASSIVE than the attached level 5 and than the level before it: thicker walls, bigger and heavier blocks, taller towers or a taller weapon, extra turrets / spires / buttresses / armour plates, bigger ornaments, a more imposing and powerful silhouette (still built on the same footprint). The COLOURS must be completely different from levels 1-5: do NOT use brown wood, red clay tiles, plain grey stone, bronze, or white marble with gold, which belong to the lower levels.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and crystal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like base buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth, painted plates) so it can be recoloured later.

LEVELS (one per column, each one an ELEMENT):
Column 1 "Level 6, WATER": built of deep TEAL and turquoise sea-stone with mother-of-pearl and polished silver trims, coral and seashell ornaments, clear AQUA water crystals, small waterfalls or glowing water streams running down the walls into little pools at the base, bubbles and foam pixels; roof (if any) of sea-green scale tiles like fish scales.
Column 2 "Level 7, LAVA": built of massive BLACK BASALT and dark volcanic rock with deep CRACKS full of glowing ORANGE-RED MOLTEN LAVA, blackened iron plates with red-hot rivets, small lava falls and glowing magma pools at the base, ember and spark pixels rising, roof (if any) of black obsidian tiles with glowing orange edges.
Column 3 "Level 8, LIGHTNING": the grandest version: built of dark STORM-GREY gunmetal and dark charcoal stone with bright SILVER plates, big floating storm crystals in electric YELLOW and white, crackling jagged LIGHTNING BOLTS arcing between spires and lightning-rod tips, small dark storm-cloud puffs around the top, glowing yellow rune lines; roof (if any) of dark gunmetal tiles with yellow lightning patterns.
Keep the team-colour royal BLUE banners / flags / cloth at every level (only those parts are blue).

CELLS & BACKGROUND: 3 columns × 1 row, every cell exactly the same size (384×384 px), exactly the same scale and baseline as the attached sheet, the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell (each higher level is taller and more massive, up to about 30% taller than the attached level 5 at level 8, but never wider than about 92% of the cell; the effects such as water, lava and lightning may rise above it but never cross into a neighbouring cell). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Doanh trại (`doanh-trai`) cấp 6–8

Lưu thành `sprite-pixels/doanh-trai-6-8.png`

```text
Pixel art sprite sheet continuing the attached sheet of the training CAMP (barracks yard): draw the SAME building (identical 5×5 tile footprint, the same main parts in the same places, the same front-facing camera, so the player still recognises it) at three new, much higher ELEMENTAL levels. Each level is clearly GRANDER and more MASSIVE than the attached level 5 and than the level before it: thicker walls, bigger and heavier blocks, taller towers or a taller weapon, extra turrets / spires / buttresses / armour plates, bigger ornaments, a more imposing and powerful silhouette (still built on the same footprint). The COLOURS must be completely different from levels 1-5: do NOT use brown wood, red clay tiles, plain grey stone, bronze, or white marble with gold, which belong to the lower levels.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and crystal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like base buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth, painted plates) so it can be recoloured later.

LEVELS (one per column, each one an ELEMENT):
Column 1 "Level 6, WATER": built of deep TEAL and turquoise sea-stone with mother-of-pearl and polished silver trims, coral and seashell ornaments, clear AQUA water crystals, small waterfalls or glowing water streams running down the walls into little pools at the base, bubbles and foam pixels; roof (if any) of sea-green scale tiles like fish scales.
Column 2 "Level 7, LAVA": built of massive BLACK BASALT and dark volcanic rock with deep CRACKS full of glowing ORANGE-RED MOLTEN LAVA, blackened iron plates with red-hot rivets, small lava falls and glowing magma pools at the base, ember and spark pixels rising, roof (if any) of black obsidian tiles with glowing orange edges.
Column 3 "Level 8, LIGHTNING": the grandest version: built of dark STORM-GREY gunmetal and dark charcoal stone with bright SILVER plates, big floating storm crystals in electric YELLOW and white, crackling jagged LIGHTNING BOLTS arcing between spires and lightning-rod tips, small dark storm-cloud puffs around the top, glowing yellow rune lines; roof (if any) of dark gunmetal tiles with yellow lightning patterns.
Keep the team-colour royal BLUE banners / flags / cloth at every level (only those parts are blue).

CELLS & BACKGROUND: 3 columns × 1 row, every cell exactly the same size (512×512 px), exactly the same scale and baseline as the attached sheet, the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell (each higher level is taller and more massive, up to about 30% taller than the attached level 5 at level 8, but never wider than about 92% of the cell; the effects such as water, lava and lightning may rise above it but never cross into a neighbouring cell). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Tường (`tuong`) cấp 6–8

Lưu thành `sprite-pixels/tuong-6-8.png`. Gửi kèm `sprite-pixels/tuong.png` (sheet tường cũ).

```text
Pixel art sprite sheet continuing the attached sheet of modular WALL pieces: the SAME four pieces in the SAME four columns ("Pillar", "Join right", "Join down", "Rubble"), with exactly the same cell size (128×128 px), position, height and thickness as the attached sheet so they line up on the grid, at three new higher levels, one per row.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and crystal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like base buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth, painted plates) so it can be recoloured later.

Rows (the levels):
Row 1 "Level 6, WATER": thick deep TEAL sea-stone blocks with mother-of-pearl caps, coral and seashell studs, a thin glowing aqua water stream running along the top.
Row 2 "Level 7, LAVA": massive BLACK BASALT blocks with glowing ORANGE-RED lava cracks and red-hot iron caps, a few ember pixels.
Row 3 "Level 8, LIGHTNING": dark STORM-GREY gunmetal blocks with silver caps, a small electric YELLOW storm crystal on top of each pillar and tiny lightning sparks between pillars.
Each level is a little thicker and taller than the one before (still lining up on the grid). Do NOT use brown wood, plain grey stone, bronze, or white marble with gold, which belong to levels 1-5.

LAYOUT: 4 columns × 3 rows. CELLS & BACKGROUND: every cell exactly 128×128 px, identical scale in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow, no border, no grid lines, no text, no labels, no numbers.
```

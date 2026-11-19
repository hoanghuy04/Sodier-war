# Học viện và Lò rèn cấp 6–8 (16/11/2026) · 1 hình mỗi công trình

Học viện và Lò rèn giờ lên tới cấp 8 (theo Thành trì 6–8). Mỗi công trình chỉ cần **1 hình mới**, dùng chung cho cấp 6, 7 và 8 (game hiện số cấp riêng). Cấp 1–5 giữ hình cũ.

**Cách vẽ:** gửi kèm **sheet cũ của chính công trình đó** (`client/assets/buildings/hoc-vien.png` hoặc `lo-ren.png`) để giữ hình dáng, và `docs/design/samples/army/sprite-pixels/kiem-si.png` để khớp nét. Gửi lại dạng **File PNG**.

| Mã | Tên | Ô | Lưu thành |
|---|---|---|---|
| `hoc-vien` | Học viện | 256×256 | `sprite-pixels/hoc-vien-6.png` |
| `lo-ren` | Lò rèn | 384×384 | `sprite-pixels/lo-ren-6.png` |

## Học viện (`hoc-vien`) cấp 6–8

```text
Pixel art sprite of the ACADEMY at its grand top tier, continuing the attached sheet: the SAME building (identical 2×2 tile footprint, the same main parts in the same places, the same front-facing camera, so the player still recognises it) rebuilt as a much grander ARCANE WAR ACADEMY: taller walls of deep SAPPHIRE-blue stone with polished GOLD trims, a tall central spire with a large floating glowing blue-violet crystal, open scroll racks and a big brass armillary sphere / telescope on the roof, glowing blue rune lines along the walls, small floating books and sparkles around the spire. Clearly more massive and imposing than the attached level 5 (about 25% taller, still on the same footprint). The colours must be different from levels 1-5: no brown wood, no red clay tiles, no plain grey stone.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and crystal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like base buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth, painted plates) so it can be recoloured later.

CELL & BACKGROUND: one single image 256×256 px, the same scale and baseline as the attached sheet, the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of the cell, never wider than about 92% of the cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow on the background, no halo, no border, no text, no labels, no numbers.
```

## Lò rèn (`lo-ren`) cấp 6–8

```text
Pixel art sprite of the FORGE at its grand top tier, continuing the attached sheet: the SAME building (identical 3×3 tile footprint, the same main parts in the same places, the same front-facing camera, so the player still recognises it) rebuilt as a much grander DRAGON FORGE: massive walls of black BASALT with deep cracks of glowing orange molten metal, a huge chimney shaped like a horned dragon head breathing bright flames and sparks, a giant anvil of dark steel with a glowing red-hot blade on it, heavy chains and silver-plated bellows, a lava-fed quenching trough at the front, glowing gold rune circles on the walls. Clearly more massive and imposing than the attached level 5 (about 25% taller, still on the same footprint). The colours must be different from levels 1-5: no brown wood, no red clay tiles, no plain grey stone.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and crystal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like base buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth, painted plates) so it can be recoloured later.

CELL & BACKGROUND: one single image 384×384 px, the same scale and baseline as the attached sheet, the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of the cell, never wider than about 92% of the cell; flames and sparks may rise above it but stay inside the cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow on the background, no halo, no border, no text, no labels, no numbers.
```

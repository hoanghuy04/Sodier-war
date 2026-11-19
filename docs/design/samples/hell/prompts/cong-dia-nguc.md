# Cổng Địa Ngục (công trình cố định ở rìa phía Đông thế giới mở) · bản DỌC ĐỐI XỨNG

Mã: `cong-dia-nguc` · một công trình cố định trên bản đồ, đặt sát rìa Đông, **dựng dọc theo trục Bắc–Nam, đối xứng hoàn toàn trái–phải: đi vào từ bên Tây hay bên Đông đều được** · chân đế 6 ô ngang × 10 ô dọc · ô 640×960 px (ảnh đứng) · **chỉ 1 hình** (không cấp, không đổ nát). Xoáy động trong lòng cổng là hiệu ứng riêng (`fx-11`, hàng 4), game đặt chồng lên giữa cổng.

16/11/2026: bản 2 (đối xứng) theo yêu cầu chủ game; bản dọc 1 chiều cũ lưu ở scratchpad. Gửi kèm **ảnh bản dọc đang dùng** làm mẫu để giữ đúng chất liệu và chi tiết, chỉ đổi bố cục thành đối xứng.

**Gửi kèm ảnh mẫu:** `docs/design/samples/army/sprite-pixels/kiem-si.png` (Kiếm sĩ) + ảnh Cổng Địa Ngục bản dọc hiện tại. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/cong-dia-nguc.png`

```text
Pixel art sprite of the HELL GATE, a legendary landmark on the eastern edge of a fantasy world map. It is a free-standing gate built along the north-south line, PERFECTLY MIRROR-SYMMETRIC LEFT-RIGHT, so travellers can enter it from either side (west or east). Keep the same materials and details as the attached current version (black obsidian and dark red basalt, kneeling horned demon statues, a giant horned skull with glowing orange eyes, a swirling crimson-and-black vortex with an orange fiery rim, heavy iron chains with broken shackles, lava channels, black iron braziers with red flames, jagged dark red crystal spikes, small bone piles, cracked stone stairs), but rebuild the layout as one symmetric shape:
- Two huge pillars, one at the TOP (north) and one at the BOTTOM (south) of the picture, each carved as a pair of kneeling horned demons back to back, one facing left and one facing right.
- A long massive lintel joins the two pillars vertically down the middle of the picture; the giant horned skull sits on the top of the lintel, seen from above, its face toward the viewer (south), with two glowing eyes.
- Between the pillars, the arch opening runs top to bottom and is filled with the vortex, seen from above as a tall swirling crimson-black oval with a fiery orange rim, visible and open on BOTH the left and the right side. Leave the vortex area readable: the game draws an animated vortex on top of it.
- A wide cracked stone staircase descends from the opening to the LEFT and an identical one descends to the RIGHT.
- Four black iron braziers with red flames: top-left, bottom-left, top-right and bottom-right of the stairs.
- Lava channels flow out to both sides along the stairs; chains with broken shackles hang on both pillars; dark red crystal spikes and small bone piles at all four corners, mirrored.
The left half is the exact mirror image of the right half (except the light direction).

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and buildings. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on obsidian and iron. Glowing lava and fire are hard-edged bands of 2-3 bright tones (white-yellow core → orange → deep red rim). Chunky, readable, slightly exaggerated toy-like shapes like Clash of Clans buildings drawn as pixel art. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Never use pink or magenta inside the sprite.

CAMERA: the same top-down 3/4 view as the soldiers and the buildings (NOT isometric, NOT a diamond): we look down from the south at about 45°, so we see the TOPS of the pillars and of the long vertical lintel, both the left and the right stairs, and the south face of the bottom pillar. Its ground footprint is a TALL rectangle: 6 map tiles wide (left-right) and 10 tiles deep (top-bottom), edges parallel to the picture borders, centred.

CELL & BACKGROUND: one single image 640×960 px (portrait), the gate centred horizontally, its footprint filling about 90% of the height and about 85% of the width, the bottom pillar's base near the bottom edge. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground field around it, no ground shadow, no glow on the background, no halo, no border, no text, no labels.
```

Đặt trên map sát rìa Đông, giữa vùng "Đất Ngục" (gạch đỏ, đất cháy, vũng dung nham); đi vào từ bên Tây hay Đông đều được. Khi có ảnh mới: `node tools/spriteimport/hell.mjs` cắt lại, `hell.json` → `gate.facing: 'both'`.

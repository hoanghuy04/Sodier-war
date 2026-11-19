# Mẫu vẽ: thợ xây, nhà thợ xây, cây và đá

5 ảnh. Như mọi lần:
- **Gửi kèm ảnh mẫu** `../army/sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để giữ đúng nét vẽ và bảng màu.
- Nền một màu hồng tím `#FF00FF`.
- Gửi lại dạng **File** (PNG), không gửi dạng ảnh nén, để nét nhất.

| # | Ảnh | Dùng để | Ô | Lưu thành |
|---|---|---|---|---|
| 1 | Nhà thợ xây | Nơi thợ xây ở trong căn cứ (như Builder's Hut trong CoC) | 256×256, 2 ô | `sprite-pixels/nha-tho-xay.png` |
| 2 | Thợ xây: đi lại | Thợ đi từ nhà tới chỗ làm, 8 hướng | 128×128, 8 × 3 ô | `sprite-pixels/tho-xay-di.png` |
| 3 | Thợ xây: làm việc | Chặt cây, đập đá, đóng búa xây nhà (đứng cạnh, quay phải, game tự lật khi đứng bên trái) | 128×128, 4 × 3 ô | `sprite-pixels/tho-xay-lam.png` |
| 4 | Biểu tượng rìu, cuốc | Nút "Chặt", "Đập" và dấu trên bản đồ | 256×256, 2 ô | `sprite-pixels/icon-don.png` |
| 5 | Cây và đá | Vẽ lại cây, đá trên **toàn bản đồ** (thay hình máy vẽ hiện tại) | 192×192, 10 × 3 ô | `sprite-pixels/chuong-ngai.png` |

## 1. Nhà thợ xây (2 ô: nhà, đổ nát)

```text
Pixel art sprite sheet of a BUILDER'S HUT for a medieval base-building strategy game: a small cosy one-room wooden cottage where a builder lives, a steep straw-thatch roof with a little crooked brick chimney puffing nothing, a round-topped wooden door with iron hinges, one small square window with a warm yellow light, a workbench outside on the right with a saw and planks, a wooden toolrack with a hammer, an axe and a pickaxe leaning on the left wall, a small pile of logs and a stone block at the front corner, a little blue pennant on the roof tip.

STYLE (match the attached reference unit sheet): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like, like Clash of Clans buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (the pennant) so it can be recoloured later.

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric, NOT a diamond): the hut faces the viewer (front side at the bottom of the picture), we see its front wall and its roof from above at about 45°. Its square ground footprint looks like a slightly flattened square, front edge horizontal. The door is on the front side.
The footprint is 2×2 map tiles: the hut fills about 80% of the cell width; it is the smallest building of the base, lower than a storehouse.

CELLS:
Column 1 "Hut": the hut as described.
Column 2 "Ruin": the destroyed hut: a low pile of broken planks, scattered straw and the fallen chimney bricks on the same footprint, the workbench tipped over, nothing standing taller than one third of the hut.

CELLS & BACKGROUND: 2 columns × 1 row, every cell exactly 256×256 px, the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of both cells, identical scale. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## 2. Thợ xây: đi lại (8 hướng × 3 hàng)

```text
Pixel art sprite sheet of a BUILDER WORKER for a medieval strategy game: a short stocky friendly man with a big bushy brown beard, rosy cheeks, a yellow-orange hard leather cap, a sleeveless brown leather work vest over a cream shirt with rolled-up sleeves, a wide tool belt with a hammer and pouches, dark-green trousers, heavy brown boots, a woodcutter's axe carried on the right shoulder.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, the same proportions, outline thickness, palette and shading as the reference soldier. Big head (about 40% of the body height), friendly eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Natural colours only, no team colour.

LAYOUT: 8 columns × 3 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing relaxed, axe on the shoulder.
Row 2 "Walk A": mid-stride, left foot forward, right arm back.
Row 3 "Walk B": mid-stride, right foot forward, left arm back (the other half of the walk cycle).

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The axe stays on the RIGHT shoulder in every direction. Every piece of gear is present in every direction.

CELLS & BACKGROUND: every cell exactly 128×128 px, the worker centred, feet on the same baseline in every cell, identical scale and design in every cell, the worker about 60% of the cell height (he is shorter than a soldier). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## 3. Thợ xây: làm việc (4 khung × 3 hàng)

```text
Pixel art animation sheet of the same BUILDER WORKER as the attached sheet (short stocky man, big bushy brown beard, yellow-orange hard leather cap, brown leather work vest over a cream shirt, tool belt, dark-green trousers, heavy brown boots), working.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, the same proportions, outline thickness, palette and shading as the reference. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

LAYOUT: 4 columns × 3 rows. Every cell is one animation frame; the worker is always seen from the three-quarter FRONT-RIGHT side, FACING RIGHT, working on something just outside the right edge of the cell (the game mirrors him when he works from the other side). Do NOT draw the tree, rock or building he works on.
Row 1 "Chop" with a woodcutter's AXE at waist height: frame 1 axe raised back over the shoulder, frame 2 axe swinging forward, frame 3 axe hitting at the right edge with small brown wood chips flying, frame 4 pulling the axe back.
Row 2 "Mine" with a PICKAXE: frame 1 pickaxe raised high above the head, frame 2 coming down, frame 3 hitting low at the right edge with small grey stone chips and one white spark, frame 4 lifting it again.
Row 3 "Build" with a HAMMER: frame 1 hammer raised, frame 2 coming down, frame 3 hitting a nail at chest height at the right edge with a tiny yellow spark, frame 4 hammer back at rest.

CELLS & BACKGROUND: every cell exactly 128×128 px, the worker's feet on the same baseline and at the same horizontal position in every cell (only the arms and tool move), identical scale and design in every cell, the worker about 60% of the cell height. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## 4. Biểu tượng rìu, cuốc (2 ô)

```text
Pixel art icon sheet for a strategy game UI, 2 icons in one row:
Cell 1 "Chop": a woodcutter's AXE leaning diagonally (handle bottom-left, head top-right), light-brown wooden handle with darker grain, a steel axe head with a bright silver edge, two small brown wood chips flying from the edge.
Cell 2 "Mine": a PICKAXE leaning diagonally the other way (handle bottom-right, head top-left), wooden handle, a dark iron curved double-pointed head with a bright tip, two small grey stone chips and one white spark.

STYLE (match the attached reference sheet): chunky readable pixel art icons, crisp 1-pixel dark navy outline (#1b1726), saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow.

CELLS & BACKGROUND: 2 columns × 1 row, every cell exactly 256×256 px, the icon centred and filling about 80% of the cell. Background: one flat solid pure magenta #FF00FF everywhere; the icon edge touches magenta directly. No shadow, no glow, no border, no grid lines, no text, no labels, no numbers.
```

## 5. Cây và đá trên bản đồ (10 loại × 3 biến thể)

Vẽ xong thì **cả bản đồ** đổi sang hình mới. Mỗi loại cần 3 biến thể khác dáng để rừng không lặp lại; game chọn ngẫu nhiên và lật ngang thêm cho đa dạng. Mỗi vật đứng trên **1 ô** bản đồ, ngọn cây cao khoảng 2 ô.

```text
Pixel art sprite sheet of MAP OBSTACLES (trees and rocks) for a top-down strategy game map. 10 kinds (columns) × 3 shape variants (rows); every object stands on a single map tile.
Columns (kinds):
1 "Oak tree": a round leafy green deciduous tree, thick brown trunk, layered rounded leaf clumps with light top-left edges.
2 "Pine tree": a tall narrow dark-green conifer, 3-4 stacked triangular tiers, short brown trunk.
3 "Snowy pine": the same kind of pine with thick white snow on top of each tier.
4 "Palm tree": a curved thin trunk with ring marks, a crown of long arching green fronds, two or three coconuts.
5 "Dead tree": a leafless grey-brown twisted swamp tree with crooked bare branches and a little hanging moss.
6 "Charred tree": a burnt black leafless tree with glowing orange cracks in the bark and a few embers.
7 "Cactus": a green saguaro cactus with vertical ribs and tiny light spines.
8 "Grey boulder": a big rounded grey stone with cracks and a moss patch.
9 "Red desert rock": a layered red-orange sandstone rock with flat strata lines.
10 "Snowy boulder": a blue-grey boulder with a cap of white snow and small icicles.
Rows (variants of the same kind, clearly different silhouettes, same style and colours):
Row 1 "Variant A": the typical full-size shape.
Row 2 "Variant B": a different shape (trees: leaning slightly or with a fork; cactus: one arm only; rocks: taller and narrower).
Row 3 "Variant C": a smaller or younger one (trees: about 75% height; cactus: short with a pink flower; rocks: a low flat stone with two pebbles).

STYLE (match the attached reference sheet): chibi pixel art for a top-down 3/4 view RPG/RTS map, the same palette, outline and shading as the game's soldiers. Crisp 1-pixel dark navy outline (#1b1726). Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric): we see the front side and the top from above at about 45°.

CELLS & BACKGROUND: 10 columns × 3 rows, every cell exactly 192×192 px, each object centred horizontally with its base (trunk foot / rock bottom) on the same baseline near the bottom of the cell. Full-size trees fill about 80% of the cell height, rocks about 45% of the cell height and 60% of the width. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no border, no grid lines, no text, no labels, no numbers.
```

## Ghi chú

- Ảnh 2 và 3 phải là **cùng một người thợ** (gửi kèm ảnh 2 khi tạo ảnh 3 để giữ đúng mặt, quần áo).
- Ảnh quá lớn (ảnh 5 là 1920×576) mà công cụ không tạo nổi thì tách làm 2: cột 1–5 và cột 6–10, mỗi ảnh 5 × 3 ô.

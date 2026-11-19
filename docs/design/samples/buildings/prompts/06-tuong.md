# Tường (Wall)

Mã công trình: `tuong` · **mỗi đoạn tường đúng 1 ô** (giống Clash of Clans) · ô 128×128 px

Tường không vẽ thành một khối liền. Mỗi ô là **một trụ tường**, và game tự nối các trụ cạnh nhau bằng **đoạn nối** (sang phải và xuống dưới), nên người chơi xếp tường theo hình gì cũng liền mạch.

**Gửi kèm ảnh mẫu:** `../army/sprite-pixels/1.png` để công cụ giữ đúng nét vẽ và bảng màu.

## Bước 1: sheet các mảnh tường × 5 cấp

Lưu thành `sprite-pixels/tuong.png`

```text
Pixel art sprite sheet of modular WALL pieces for a player's base, like the walls in Clash of Clans: every wall piece occupies exactly ONE map tile, and neighbouring pieces join into a continuous wall.

STYLE (match the attached reference unit sheet): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal and gold. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like, like Clash of Clans buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth) so it can be recoloured later.

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric, NOT a diamond): the building faces the viewer (front side at the bottom of the picture), we see its front wall and its roof/top from above at about 45°. Its square ground footprint looks like a slightly flattened square, front edge horizontal. The entrance (door, gate, opening) is on the front side.
One map tile = one 128×128 cell: a wall pillar sits in the middle of its cell, its square footprint about 55% of the cell width, about as tall as it is wide.

LAYOUT: 4 columns × 5 rows.
Columns (the pieces):
Column 1 "Pillar": one free-standing square wall block (a post), top slightly bevelled.
Column 2 "Join right": the short horizontal wall section that bridges a pillar to the pillar in the next tile to the RIGHT: it starts at the left edge of the cell and ends at the right edge, the same height and thickness as the pillar minus one step, front face toward the viewer.
Column 3 "Join down": the short wall section that bridges a pillar to the pillar in the tile BELOW: seen from the 3/4 view it is the top of a wall running toward the viewer, from the top edge of the cell to the bottom edge, the same height as the join-right section.
Column 4 "Rubble": the destroyed wall piece: a few broken blocks lying flat on the footprint.
Rows (the levels, the same shapes getting richer):
Row 1 "Level 1": sharpened wooden logs bound with rope (a palisade).
Row 2 "Level 2": wooden logs with iron bands and iron spikes on top.
Row 3 "Level 3": grey cut-stone bricks with mortar lines.
Row 4 "Level 4": grey stone with polished BRONZE caps and rivets.
Row 5 "Level 5": white marble with GOLD caps and a small gold ornament on each pillar.
The pillar of column 1 and the joins of columns 2-3 must line up exactly when the cells are placed next to each other on the grid (same baseline, same height, same thickness in every row).

CELLS & BACKGROUND: every cell exactly 128×128 px, identical scale in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow, no border, no grid lines, no text, no labels, no numbers.
```

Game ghép tường như sau: mỗi ô tường vẽ **Trụ**; nếu ô bên phải cũng là tường thì vẽ thêm **Nối phải**; nếu ô bên dưới cũng là tường thì vẽ thêm **Nối xuống**. Tường đổ nát dùng mảnh **Đổ nát**.

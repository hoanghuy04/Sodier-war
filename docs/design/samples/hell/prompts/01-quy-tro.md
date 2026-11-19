# 01. Quỷ Tro (Ash Imp) · Địa Ngục, bầy đông, xuất hiện từ 0:00

Mã quái: `quy-tro` · ô 128×128 px · sheet 8 hướng × 5 tư thế (Đứng, Đi, Đánh, Trúng đòn, Chết)

Quân lót đường, đông nhất. Hình nhỏ nhất trong các quái.

**Gửi kèm ảnh mẫu:** `docs/design/samples/army/sprite-pixels/kiem-si.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ và bảng màu. Mỗi ảnh một cuộc trò chuyện mới. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/quy-tro.png`

```text
Pixel art sprite sheet of a small ASH IMP: a knee-high chubby demon imp made of grey ash and soot, cracked skin with thin glowing orange ember lines, two short stubby black horns, big round glowing yellow-orange eyes, a wide grin with tiny fangs, small ragged bat-like wings too small to fly, thin arms with three black claws, a thin tail ending in a little ember.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, the same outline thickness, palette richness and shading as the reference soldier. Cute but clearly hostile monster: slightly big head, expressive eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral hell monster: no team colour, no flags of any player. Hell palette: deep crimson, basalt black, charcoal grey, molten orange, sulfur yellow, bone white. Glowing parts (lava cracks, ember eyes, flames) are drawn as hard-edged bands of 2-3 bright tones (white-yellow core → orange → deep red rim), never as a soft glow. Never use pink or magenta inside the sprite.
SIZE: small: the idle pose is about 45% of the cell height (smaller than the reference soldier).

LAYOUT: 8 columns × 5 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": hunched, wings twitching, the ember lines flickering.
Row 2 "Walk": scurrying forward on short legs, arms out, tail up.
Row 3 "Attack": leaping forward and slashing with both claws, mouth wide open.
Row 4 "Hit": knocked back, ash puffing off its body, eyes squeezed shut.
Row 5 "Die": crumbled into a small heap of grey ash with the two horns and a last ember on top.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every part (horns, wings, tail, chains, weapon…) is present in every direction; a held weapon stays in the same hand in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the monster centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

Nhập vào game: `node tools/spriteimport/import.mjs <ảnh> quy-tro idle,walk,attack,hit,death --no-team`

# 04. Cốt Than (Coal Bones) · Địa Ngục, cận chiến, hồi sinh một lần, từ 2:00

Mã quái: `cot-than` · ô 128×128 px · sheet 8 hướng × 5 tư thế (Đứng, Đi, Đánh, Trúng đòn, Chết)

Hàng Chết là đống xương còn than hồng: game dùng luôn làm trạng thái "chờ đứng dậy" (phát ngược hàng Chết khi hồi sinh).

**Gửi kèm ảnh mẫu:** `docs/design/samples/army/sprite-pixels/kiem-si.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ và bảng màu. Mỗi ảnh một cuộc trò chuyện mới. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/cot-than.png`

```text
Pixel art sprite sheet of a COAL BONES skeleton: a hunched humanoid skeleton of charred black-brown bones held together by glowing red-hot coals in its ribcage and joints, a cracked skull with burning orange eye sockets, a broken rusty iron sword in the right hand, a rotten wooden plank used as a shield in the left hand, scraps of burnt cloth on the hips.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, the same outline thickness, palette richness and shading as the reference soldier. Cute but clearly hostile monster: slightly big head, expressive eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral hell monster: no team colour, no flags of any player. Hell palette: deep crimson, basalt black, charcoal grey, molten orange, sulfur yellow, bone white. Glowing parts (lava cracks, ember eyes, flames) are drawn as hard-edged bands of 2-3 bright tones (white-yellow core → orange → deep red rim), never as a soft glow. Never use pink or magenta inside the sprite.
SIZE: about 55% of the cell height (like the reference soldier).

LAYOUT: 8 columns × 5 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": swaying, the coal in the ribcage glowing.
Row 2 "Walk": shambling stride, the jaw clattering.
Row 3 "Attack": overhead chop with the rusty sword.
Row 4 "Hit": bones rattling, the skull knocked sideways.
Row 5 "Die": collapsed into a small pile of black bones with the skull on top, the coal still glowing faintly (it can stand up again).

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every part (horns, wings, tail, chains, weapon…) is present in every direction; a held weapon stays in the same hand in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the monster centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

Nhập vào game: `node tools/spriteimport/import.mjs <ảnh> cot-than idle,walk,attack,hit,death --no-team`

# 08. Kẻ Kéo Xích (Chain Dragger) · Địa Ngục, ném móc làm chậm, từ 5:00

Mã quái: `ke-keo-xich` · ô 160×160 px · sheet 8 hướng × 5 tư thế (Đứng, Đi, Đánh, Trúng đòn, Chết)

Móc xích bay là hiệu ứng ở `fx-09`.

**Gửi kèm ảnh mẫu:** `docs/design/samples/army/sprite-pixels/kiem-si.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ và bảng màu. Mỗi ảnh một cuộc trò chuyện mới. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/ke-keo-xich.png`

```text
Pixel art sprite sheet of a CHAIN DRAGGER: a gaunt hunched grey-skinned ghoul demon with a long neck, a sack-cloth hood over its head with two glowing red eye holes, iron manacles on both wrists, heavy rusty chains wrapped around its shoulders and dragging on the ground behind it, a big rusty iron hook on a chain held in the right hand, a bony long-fingered left hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, the same outline thickness, palette richness and shading as the reference soldier. Cute but clearly hostile monster: slightly big head, expressive eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral hell monster: no team colour, no flags of any player. Hell palette: deep crimson, basalt black, charcoal grey, molten orange, sulfur yellow, bone white. Glowing parts (lava cracks, ember eyes, flames) are drawn as hard-edged bands of 2-3 bright tones (white-yellow core → orange → deep red rim), never as a soft glow. Never use pink or magenta inside the sprite.
SIZE: about 65% of the cell height.

LAYOUT: 8 columns × 5 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": swaying, the chain hook dangling.
Row 2 "Walk": dragging its feet and the chains.
Row 3 "Attack": throwing the hook forward overhand, the chain stretched straight.
Row 4 "Hit": recoiling, hood flapping.
Row 5 "Die": fallen face down, tangled in its own chains.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every part (horns, wings, tail, chains, weapon…) is present in every direction; a held weapon stays in the same hand in every direction.

CELLS & BACKGROUND: every cell exactly the same size (160×160 px), the monster centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

Nhập vào game: `node tools/spriteimport/import.mjs <ảnh> ke-keo-xich idle,walk,attack,hit,death --no-team`

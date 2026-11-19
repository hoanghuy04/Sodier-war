# 21. Boss Ngục Chủ Xích Xiềng (The Chained Warden) · boss cuối Ngục Xích

Mã boss: `nguc-chu` · ô 256×256 px · sheet 8 hướng × 7 tư thế (Đứng, Đi, Đánh, Kỹ năng, Trúng đòn, Gầm, Chết)

Bước 1 để duyệt thiết kế. Duyệt xong mới làm bước 2 (mỗi hoạt ảnh một ảnh nhiều khung, cùng cách như `docs/design/samples/army/prompts/bosses/`). Hiệu ứng chiêu của boss ở `fx-10`.

**Gửi kèm ảnh mẫu:** `docs/design/samples/army/sprite-pixels/kiem-si.png` (Kiếm sĩ đã duyệt). Mỗi ảnh một cuộc trò chuyện mới. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/boss-nguc-chu.png`

```text
Pixel art boss sprite of THE CHAINED WARDEN, a hell boss: a colossal giant in black iron armour plates bolted onto grey stone-like flesh, a huge cage-like iron helmet with a single glowing red eye inside, a massive spiked iron collar, heavy iron cuffs on both wrists and ankles with thick chains hanging from them to the ground and ending in broken links, red-hot glowing seams in the armour, a gigantic iron key as long as a sword held in the right hand and used as a club.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, the same outline thickness, palette richness and shading as the reference soldier. This is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral hell monster: no team colour, no flags of any player. Hell palette: deep crimson, basalt black, charcoal grey, molten orange, sulfur yellow, bone white. Glowing parts (lava cracks, ember eyes, flames) are drawn as hard-edged bands of 2-3 bright tones (white-yellow core → orange → deep red rim), never as a soft glow. Never use pink or magenta inside the sprite.

LAYOUT: 8 columns × 7 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing, chains hanging, smoke breathing out of the helmet.
Row 2 "Walk": heavy step, dragging the chains.
Row 3 "Attack": smashing the giant key down on the ground.
Row 4 "Skill": CHAIN SWEEP: whipping a chain in a wide horizontal arc around him.
Row 5 "Hit": staggering, sparks flying from the armour.
Row 6 "Roar": pulling at his chains with both arms, roaring, the red eye blazing.
Row 7 "Die": falling to his knees, the helmet cracked open, the chains slack on the ground.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every part (horns, wings, tail, chains, weapon…) is present in every direction; a held weapon stays in the same hand in every direction.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

# 20. Boss Mẫu Hậu Tro Tàn (Ash Matriarch) · boss Ngã Ba Sông Nham

Mã boss: `mau-hau-tro` · ô 256×256 px · sheet 8 hướng × 7 tư thế (Đứng, Đi, Đánh, Kỹ năng, Trúng đòn, Gầm, Chết)

Bước 1 để duyệt thiết kế. Duyệt xong mới làm bước 2 (mỗi hoạt ảnh một ảnh nhiều khung, cùng cách như `docs/design/samples/army/prompts/bosses/`). Hiệu ứng chiêu của boss ở `fx-10`.

**Gửi kèm ảnh mẫu:** `docs/design/samples/army/sprite-pixels/kiem-si.png` (Kiếm sĩ đã duyệt). Mỗi ảnh một cuộc trò chuyện mới. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/boss-mau-hau-tro.png`

```text
Pixel art boss sprite of ASH MATRIARCH, a hell boss: a gigantic moth-like demon queen hovering in the air, four huge wings of grey ash with glowing orange ember patterns shaped like eyes, the wing edges crumbling into burning scales, a furry charcoal body, a pale bone-white face mask with six black eyes, long feathery antennae, thin clawed arms holding a sceptre of black bone, a long trailing abdomen dripping embers.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, the same outline thickness, palette richness and shading as the reference soldier. This is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral hell monster: no team colour, no flags of any player. Hell palette: deep crimson, basalt black, charcoal grey, molten orange, sulfur yellow, bone white. Glowing parts (lava cracks, ember eyes, flames) are drawn as hard-edged bands of 2-3 bright tones (white-yellow core → orange → deep red rim), never as a soft glow. Never use pink or magenta inside the sprite.

LAYOUT: 8 columns × 7 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": hovering, wings slowly beating, embers falling.
Row 2 "Walk": flying forward, wings beating hard.
Row 3 "Attack": slashing down with the bone sceptre.
Row 4 "Skill": BURNING SCALES: wings flung wide open, a burst of glowing burning scales shooting out in a ring.
Row 5 "Hit": wings folding in, ash puffing out.
Row 6 "Roar": rising with all four wings spread, shrieking, embers swirling around her.
Row 7 "Die": fallen on the ground, the wings crumbling into a pile of grey ash.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every part (horns, wings, tail, chains, weapon…) is present in every direction; a held weapon stays in the same hand in every direction.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. This creature always flies: in every pose except Die its lowest point hovers about one fifth of the cell above the baseline, at the same height in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

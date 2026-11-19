# 19. Boss Quỷ Vương Nham Thạch (Magma Tyrant) · boss Đồng Xương Cháy

Mã boss: `quy-vuong-nham` · ô 256×256 px · sheet 8 hướng × 7 tư thế (Đứng, Đi, Đánh, Kỹ năng, Trúng đòn, Gầm, Chết)

Bước 1 để duyệt thiết kế. Duyệt xong mới làm bước 2 (mỗi hoạt ảnh một ảnh nhiều khung, cùng cách như `docs/design/samples/army/prompts/bosses/`). Hiệu ứng chiêu của boss ở `fx-10`.

**Gửi kèm ảnh mẫu:** `docs/design/samples/army/sprite-pixels/kiem-si.png` (Kiếm sĩ đã duyệt). Mỗi ảnh một cuộc trò chuyện mới. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/boss-quy-vuong-nham.png`

```text
Pixel art boss sprite of MAGMA TYRANT, a hell boss: a giant demon king with a body of cracked black obsidian rock and rivers of bright molten lava glowing in the cracks, huge curved horns of black stone with glowing tips, a crown of black iron spikes fused into his head, a long beard of flowing fire, burning yellow-white eyes, a gigantic cleaver of red-hot molten metal in the right hand, a heavy chain hung with small skulls around the waist, hooved legs.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, the same outline thickness, palette richness and shading as the reference soldier. This is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral hell monster: no team colour, no flags of any player. Hell palette: deep crimson, basalt black, charcoal grey, molten orange, sulfur yellow, bone white. Glowing parts (lava cracks, ember eyes, flames) are drawn as hard-edged bands of 2-3 bright tones (white-yellow core → orange → deep red rim), never as a soft glow. Never use pink or magenta inside the sprite.

LAYOUT: 8 columns × 7 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": breathing, lava dripping from the cracks, the beard of fire flickering.
Row 2 "Walk": heavy stomping step, the cleaver dragging and scraping sparks.
Row 3 "Attack": a huge overhead cleaver chop into the ground.
Row 4 "Skill": WAVE CLEAVE: a horizontal sweeping chop that throws a crescent wave of lava forward.
Row 5 "Hit": staggering back, lava splashing from the cracks.
Row 6 "Roar": raising both arms and roaring to the sky, flames bursting from the horns.
Row 7 "Die": dropping to his knees and breaking apart into a mound of cooling black rocks, the cleaver stuck in the ground.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every part (horns, wings, tail, chains, weapon…) is present in every direction; a held weapon stays in the same hand in every direction.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

# Boss 1. Golem Kim Cương (Diamond Golem)

Mã boss: `golem-kim-cuong` · canh **Mỏ Kim cương (lõi bản đồ, cao nguyên cổ)** · ô 256×256 px

Người khổng lồ đá cổ được dựng để canh 4 mỏ Kim cương. Chậm, cực lì, mỗi 6 giây dậm đất làm vỡ kim cương ra thành sóng xung kích.

**Gửi kèm ảnh mẫu:** `sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ. Mỗi ảnh tạo trong một **cuộc trò chuyện mới**, chỉ một boss.

## Bước 1: sheet 8 hướng × 7 tư thế

Lưu thành `sprite-pixels/boss-golem-kim-cuong.png`

```text
Pixel art boss sprite of an ancient stone golem built from grey-blue carved temple blocks with mossy edges, glowing cyan rune lines across the body, a huge diamond core shining in its chest, clusters of cyan diamond crystals growing from its shoulders and back, massive square fists, small glowing cyan eyes under a heavy stone brow.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

LAYOUT: 8 columns × 7 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing guard, slow heavy breathing, the chest diamond pulsing.
Row 2 "Walk": slow heavy stomping walk, the ground shakes, arms swinging.
Row 3 "Attack": a huge overhead double-fist smash.
Row 4 "Skill": GROUND SLAM: raises both fists, slams the ground, a ring of diamond shards and a cyan shockwave bursts out around it.
Row 5 "Hit": staggers back, small stone chips fly off, cracks glow.
Row 6 "Roar": beats its chest, the runes and the core flare bright cyan.
Row 7 "Die": cracks all over, the core dims, collapses into a pile of rubble with dull diamonds.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction (same weapon hand, same crystals, same scars); only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Bước 2: hoạt ảnh nhiều khung (mỗi hoạt ảnh một ảnh)

Mỗi ảnh: **8 hàng = 8 hướng**, **cột = khung hình** từ trái sang phải.

### Đứng (Idle) · 4 khung

Lưu thành `sprite-pixels/boss-golem-kim-cuong-idle.png`

```text
Pixel art animation sprite sheet of a BOSS: an ancient stone golem built from grey-blue carved temple blocks with mossy edges, glowing cyan rune lines across the body, a huge diamond core shining in its chest, clusters of cyan diamond crystals growing from its shoulders and back, massive square fists, small glowing cyan eyes under a heavy stone brow.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Idle", 4 frames: standing guard, slow heavy breathing, the chest diamond pulsing.

LAYOUT: 8 rows × 4 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 4 frames from left to right, a seamless loop. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction (same weapon hand, same crystals, same scars); only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Đi (Walk) · 6 khung

Lưu thành `sprite-pixels/boss-golem-kim-cuong-walk.png`

```text
Pixel art animation sprite sheet of a BOSS: an ancient stone golem built from grey-blue carved temple blocks with mossy edges, glowing cyan rune lines across the body, a huge diamond core shining in its chest, clusters of cyan diamond crystals growing from its shoulders and back, massive square fists, small glowing cyan eyes under a heavy stone brow.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Walk", 6 frames: slow heavy stomping walk, the ground shakes, arms swinging.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right, a seamless loop. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction (same weapon hand, same crystals, same scars); only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Đánh thường (Attack) · 6 khung

Lưu thành `sprite-pixels/boss-golem-kim-cuong-attack.png`

```text
Pixel art animation sprite sheet of a BOSS: an ancient stone golem built from grey-blue carved temple blocks with mossy edges, glowing cyan rune lines across the body, a huge diamond core shining in its chest, clusters of cyan diamond crystals growing from its shoulders and back, massive square fists, small glowing cyan eyes under a heavy stone brow.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Attack", 6 frames: frame 1: ready stance; frame 2: wind-up; frame 3: the strike starts; frame 4: IMPACT: a huge overhead double-fist smash; frame 5: follow-through; frame 6: back to the ready stance.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction (same weapon hand, same crystals, same scars); only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Kỹ năng (Skill) · 8 khung

Lưu thành `sprite-pixels/boss-golem-kim-cuong-skill.png`

```text
Pixel art animation sprite sheet of a BOSS: an ancient stone golem built from grey-blue carved temple blocks with mossy edges, glowing cyan rune lines across the body, a huge diamond core shining in its chest, clusters of cyan diamond crystals growing from its shoulders and back, massive square fists, small glowing cyan eyes under a heavy stone brow.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Skill", 8 frames: GROUND SLAM: raises both fists, slams the ground, a ring of diamond shards and a cyan shockwave bursts out around it. frames 1-2: wind-up; frames 3-4: the big moment with cyan shockwave ring and flying diamond shards; frames 5-6: the effect spreads out; frames 7-8: recover to the ready stance. Keep the effect INSIDE the cell.

LAYOUT: 8 rows × 8 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 8 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction (same weapon hand, same crystals, same scars); only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Trúng đòn (Hit) · 2 khung

Lưu thành `sprite-pixels/boss-golem-kim-cuong-hit.png`

```text
Pixel art animation sprite sheet of a BOSS: an ancient stone golem built from grey-blue carved temple blocks with mossy edges, glowing cyan rune lines across the body, a huge diamond core shining in its chest, clusters of cyan diamond crystals growing from its shoulders and back, massive square fists, small glowing cyan eyes under a heavy stone brow.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Hit", 2 frames: staggers back, small stone chips fly off, cracks glow.

LAYOUT: 8 rows × 2 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 2 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction (same weapon hand, same crystals, same scars); only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Gầm / thắng (Roar) · 6 khung

Lưu thành `sprite-pixels/boss-golem-kim-cuong-roar.png`

```text
Pixel art animation sprite sheet of a BOSS: an ancient stone golem built from grey-blue carved temple blocks with mossy edges, glowing cyan rune lines across the body, a huge diamond core shining in its chest, clusters of cyan diamond crystals growing from its shoulders and back, massive square fists, small glowing cyan eyes under a heavy stone brow.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Roar", 6 frames: beats its chest, the runes and the core flare bright cyan.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction (same weapon hand, same crystals, same scars); only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Chết (Die) · 6 khung

Lưu thành `sprite-pixels/boss-golem-kim-cuong-die.png`

```text
Pixel art animation sprite sheet of a BOSS: an ancient stone golem built from grey-blue carved temple blocks with mossy edges, glowing cyan rune lines across the body, a huge diamond core shining in its chest, clusters of cyan diamond crystals growing from its shoulders and back, massive square fists, small glowing cyan eyes under a heavy stone brow.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Die", 6 frames: cracks all over, the core dims, collapses into a pile of rubble with dull diamonds. Frame 6 is the final still pose that stays on the ground.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The design is identical in every direction (same weapon hand, same crystals, same scars); only the facing changes.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the boss centred, feet (or the lowest point) on the same baseline in every cell, identical scale and design in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Bệ đứng (sân boss)

Một ảnh riêng: bệ đứng dưới chân boss, đặt tại mỏ. Có 3 trạng thái hoạt ảnh: **chờ** (boss còn sống), **giao chiến** (đang bị đánh), **bị hạ** (boss chết, bệ tắt sáng và nứt).

Lưu thành `sprite-pixels/be-golem-kim-cuong.png`

```text
Pixel art sprite sheet of a boss arena pedestal seen from a top-down 3/4 view (same camera as the reference sheet): an octagonal ancient stone dais of worn carved slabs with glowing blue runes in a circle, four broken temple pillars at the corners, cyan diamond shards and moss in the cracks, three low steps at the front. It is a flat raised platform about 5 tiles wide and 4 tiles deep (roughly 176×132 px of art) with a clear flat centre where a large boss stands, its front edge facing the viewer. It is a single static object, no characters on it.

STYLE (match the attached reference sheet exactly): same pixel art style, outline thickness and shading as the reference: crisp 1-pixel dark navy outline (#1b1726), saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow outside the object. Neutral, no team colours.

LAYOUT: 4 columns × 3 rows of animation frames, all of the SAME pedestal from the SAME angle at the SAME position and scale:
Row 1 "Dormant" (boss alive, waiting), 4 frames, seamless loop: subtle idle motion: faint glow pulsing, small particles.
Row 2 "Battle" (players are fighting the boss), 4 frames, seamless loop: the runes flare from blue to bright cyan and white, small diamond sparks rise from the cracks.
Row 3 "Defeated" (the boss is dead), 4 frames, plays once: the runes go dark one by one, a big crack splits the dais, dust settles. Frame 4 is the final still state.

CELLS & BACKGROUND: every cell exactly the same size (256×192 px), the pedestal centred with its base on the same baseline in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the object edge touches magenta directly. No cast shadow on the background, no border, no grid lines, no text, no labels, no numbers.
```

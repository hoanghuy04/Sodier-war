# Boss 3. Nữ Hoàng Pha Lê (Crystal Queen)

Mã boss: `nu-hoang-pha-le` · canh **Mỏ Pha lê (rừng sâu, đầm lầy)** · ô 256×256 px

Linh hồn của mạch pha lê, lơ lửng và đánh phép từ xa. Kỹ năng gọi mưa mảnh pha lê xuống vùng rộng, bỏ qua giáp.

**Gửi kèm ảnh mẫu:** `sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ. Mỗi ảnh tạo trong một **cuộc trò chuyện mới**, chỉ một boss.

## Bước 1: sheet 8 hướng × 7 tư thế

Lưu thành `sprite-pixels/boss-nu-hoang-pha-le.png`

```text
Pixel art boss sprite of an elegant floating sorceress made of translucent violet and pink crystal, a tall crown of sharp amethyst shards, long flowing gown that fades into crystal spikes instead of legs, glowing white eyes, a crystal sceptre in the right hand, small crystal shards orbiting around her.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

LAYOUT: 8 columns × 7 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": floating up and down gently, shards orbiting.
Row 2 "Walk": glides forward, gown trailing, shards following.
Row 3 "Attack": points the sceptre and fires a sharp violet crystal bolt.
Row 4 "Skill": CRYSTAL STORM: raises both arms, a magic circle appears above her and a rain of violet crystal shards falls around her.
Row 5 "Hit": recoils, a few shards crack off her body.
Row 6 "Roar": spreads her arms, the crown blazes, shards spin fast around her.
Row 7 "Die": shatters into hundreds of violet shards that fall into a glittering pile.

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

Lưu thành `sprite-pixels/boss-nu-hoang-pha-le-idle.png`

```text
Pixel art animation sprite sheet of a BOSS: an elegant floating sorceress made of translucent violet and pink crystal, a tall crown of sharp amethyst shards, long flowing gown that fades into crystal spikes instead of legs, glowing white eyes, a crystal sceptre in the right hand, small crystal shards orbiting around her.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Idle", 4 frames: floating up and down gently, shards orbiting.

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

Lưu thành `sprite-pixels/boss-nu-hoang-pha-le-walk.png`

```text
Pixel art animation sprite sheet of a BOSS: an elegant floating sorceress made of translucent violet and pink crystal, a tall crown of sharp amethyst shards, long flowing gown that fades into crystal spikes instead of legs, glowing white eyes, a crystal sceptre in the right hand, small crystal shards orbiting around her.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Walk", 6 frames: glides forward, gown trailing, shards following.

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

Lưu thành `sprite-pixels/boss-nu-hoang-pha-le-attack.png`

```text
Pixel art animation sprite sheet of a BOSS: an elegant floating sorceress made of translucent violet and pink crystal, a tall crown of sharp amethyst shards, long flowing gown that fades into crystal spikes instead of legs, glowing white eyes, a crystal sceptre in the right hand, small crystal shards orbiting around her.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Attack", 6 frames: frame 1: ready stance; frame 2: wind-up; frame 3: the strike starts; frame 4: IMPACT: points the sceptre and fires a sharp violet crystal bolt; frame 5: follow-through; frame 6: back to the ready stance.

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

Lưu thành `sprite-pixels/boss-nu-hoang-pha-le-skill.png`

```text
Pixel art animation sprite sheet of a BOSS: an elegant floating sorceress made of translucent violet and pink crystal, a tall crown of sharp amethyst shards, long flowing gown that fades into crystal spikes instead of legs, glowing white eyes, a crystal sceptre in the right hand, small crystal shards orbiting around her.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Skill", 8 frames: CRYSTAL STORM: raises both arms, a magic circle appears above her and a rain of violet crystal shards falls around her. frames 1-2: wind-up; frames 3-4: the big moment with magic circle and falling violet crystal shards; frames 5-6: the effect spreads out; frames 7-8: recover to the ready stance. Keep the effect INSIDE the cell.

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

Lưu thành `sprite-pixels/boss-nu-hoang-pha-le-hit.png`

```text
Pixel art animation sprite sheet of a BOSS: an elegant floating sorceress made of translucent violet and pink crystal, a tall crown of sharp amethyst shards, long flowing gown that fades into crystal spikes instead of legs, glowing white eyes, a crystal sceptre in the right hand, small crystal shards orbiting around her.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Hit", 2 frames: recoils, a few shards crack off her body.

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

Lưu thành `sprite-pixels/boss-nu-hoang-pha-le-roar.png`

```text
Pixel art animation sprite sheet of a BOSS: an elegant floating sorceress made of translucent violet and pink crystal, a tall crown of sharp amethyst shards, long flowing gown that fades into crystal spikes instead of legs, glowing white eyes, a crystal sceptre in the right hand, small crystal shards orbiting around her.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Roar", 6 frames: spreads her arms, the crown blazes, shards spin fast around her.

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

Lưu thành `sprite-pixels/boss-nu-hoang-pha-le-die.png`

```text
Pixel art animation sprite sheet of a BOSS: an elegant floating sorceress made of translucent violet and pink crystal, a tall crown of sharp amethyst shards, long flowing gown that fades into crystal spikes instead of legs, glowing white eyes, a crystal sceptre in the right hand, small crystal shards orbiting around her.

STYLE (match the attached reference sheet exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette richness and shading as the reference swordsman, but this is a BOSS: about 2.5× the height of the reference soldier, heavy and imposing, chunky readable silhouette, cute-but-menacing proportions (big head, big hands/claws). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gems and crystals. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Neutral monster: no team colour, no flags of any player.

ANIMATION "Die", 6 frames: shatters into hundreds of violet shards that fall into a glittering pile. Frame 6 is the final still pose that stays on the ground.

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

Lưu thành `sprite-pixels/be-nu-hoang-pha-le.png`

```text
Pixel art sprite sheet of a boss arena pedestal seen from a top-down 3/4 view (same camera as the reference sheet): a round amethyst geode platform, the floor made of polished violet crystal facets, a ring of tall crystal clusters around the edge, a faint glowing magic circle engraved in the middle. It is a flat raised platform about 5 tiles wide and 4 tiles deep (roughly 176×132 px of art) with a clear flat centre where a large boss stands, its front edge facing the viewer. It is a single static object, no characters on it.

STYLE (match the attached reference sheet exactly): same pixel art style, outline thickness and shading as the reference: crisp 1-pixel dark navy outline (#1b1726), saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow outside the object. Neutral, no team colours.

LAYOUT: 4 columns × 3 rows of animation frames, all of the SAME pedestal from the SAME angle at the SAME position and scale:
Row 1 "Dormant" (boss alive, waiting), 4 frames, seamless loop: subtle idle motion: faint glow pulsing, small particles.
Row 2 "Battle" (players are fighting the boss), 4 frames, seamless loop: the magic circle lights up bright pink-violet and spins, the crystal clusters glow.
Row 3 "Defeated" (the boss is dead), 4 frames, plays once: the circle fades out, several crystal clusters crack and topple, the glow dies. Frame 4 is the final still state.

CELLS & BACKGROUND: every cell exactly the same size (256×192 px), the pedestal centred with its base on the same baseline in every cell, nothing crosses into a neighbouring cell. Background: one flat solid pure magenta #FF00FF everywhere; the object edge touches magenta directly. No cast shadow on the background, no border, no grid lines, no text, no labels, no numbers.
```

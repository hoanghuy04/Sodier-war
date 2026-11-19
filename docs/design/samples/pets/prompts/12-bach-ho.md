# 12. Bạch Hổ

Mã pet: `bach-ho` · Bậc: **Thần thú (Cam)** · Chiêu: **Bạch Hổ Liệt Trảo**

Pet có 2 hình thái, mỗi hình thái **30 khung hoạt ảnh × 8 hướng**, chia giống hệt binh lính: Đứng 4 + Di chuyển 6 + Hành động 6 + Bị trúng 2 + Hành động 6 + Kết thúc 6 = 30.

| Hình thái | Ô | Hoạt ảnh (khung) |
|---|---|---|
| Thường (nhỏ, đi theo tướng) | 128×128 | Đứng 4 · Đi 6 · Bắt đầu biến hình 6 · Bị trúng 2 · Vui mừng 6 · Kiệt sức 6 |
| Chiến đấu (to, đánh cùng tướng) | 256×256 | Thủ thế 4 · Chạy 6 · Tấn công 6 · Bị trúng 2 · Tung chiêu 6 · Gục 6 |

**Gửi kèm ảnh mẫu:** `../army/sprite-pixels/1.png` (Kiếm sĩ), 1 sheet boss, và ảnh thiết kế pet này bạn đã duyệt để giữ đúng con. Gửi lại dạng **File PNG**, đúng tên file, không chữ.

## Hình thái thường · ô 128×128

### Bước 1: sheet 8 hướng (1 tư thế mỗi hoạt ảnh)

Lưu thành `bach-ho.png`

```text
Pixel art sprite sheet of a pet, EXACTLY like the attached design: A chubby white tiger cub (Baihu) with black stripes, icy blue eyes and a tiny golden 王 mark on the forehead.

STYLE (match the attached reference sheets exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier. Small and very cute pet, about one third the height of a soldier, big head, big shiny eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing calmly, happy face.
Row 2 "Walk": mid-trot, legs clearly apart.
Row 3 "Transform start": jumping up while its body glows brightly.
Row 4 "Hit": recoiling backwards, eyes shut, flashing white.
Row 5 "Happy": top of a happy jump, big smile, small sparkles.
Row 6 "Rest": curled up asleep on the ground, eyes closed.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Bước 2: hoạt ảnh nhiều khung (mỗi hoạt ảnh một ảnh)

Mỗi ảnh: **8 hàng = 8 hướng**, **cột = khung hình** từ trái sang phải.

#### Đứng (Idle) · 4 khung

Lưu thành `bach-ho-dung.png` (512×1024)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: A chubby white tiger cub (Baihu) with black stripes, icy blue eyes and a tiny golden 王 mark on the forehead.

STYLE (match the attached reference sheets exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier. Small and very cute pet, about one third the height of a soldier, big head, big shiny eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Idle", 4 frames: breathing loop: body rises 1px and back, blinks once, tail / ears / wings move gently.

LAYOUT: 8 rows × 4 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 4 frames from left to right, a seamless loop. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

#### Đi (Walk) · 6 khung

Lưu thành `bach-ho-di.png` (768×1024)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: A chubby white tiger cub (Baihu) with black stripes, icy blue eyes and a tiny golden 王 mark on the forehead.

STYLE (match the attached reference sheets exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier. Small and very cute pet, about one third the height of a soldier, big head, big shiny eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Walk", 6 frames: trot cycle loop: the legs clearly in different positions in every frame, body bobbing, tail swinging.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right, a seamless loop. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

#### Bắt đầu biến hình (Transform start) · 6 khung

Lưu thành `bach-ho-bien-hinh.png` (768×1024)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: A chubby white tiger cub (Baihu) with black stripes, icy blue eyes and a tiny golden 王 mark on the forehead.

STYLE (match the attached reference sheets exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier. Small and very cute pet, about one third the height of a soldier, big head, big shiny eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Transform start", 6 frames: frame 1: alert, looks up; frame 2: crouches, its body starts glowing; frame 3: jumps up glowing brightly; frame 4: wrapped in a bright energy burst with streaks; frame 5: the burst at full size (silhouette slightly bigger); frame 6: a white-gold flash filling most of the cell.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

#### Bị trúng (Hit) · 2 khung

Lưu thành `bach-ho-trung.png` (256×1024)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: A chubby white tiger cub (Baihu) with black stripes, icy blue eyes and a tiny golden 王 mark on the forehead.

STYLE (match the attached reference sheets exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier. Small and very cute pet, about one third the height of a soldier, big head, big shiny eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Hit", 2 frames: recoils backwards with the whole sprite flashing white, eyes shut; then recovers.

LAYOUT: 8 rows × 2 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 2 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

#### Vui mừng (Happy) · 6 khung

Lưu thành `bach-ho-vui.png` (768×1024)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: A chubby white tiger cub (Baihu) with black stripes, icy blue eyes and a tiny golden 王 mark on the forehead.

STYLE (match the attached reference sheets exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier. Small and very cute pet, about one third the height of a soldier, big head, big shiny eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Happy", 6 frames: jumps happily: crouch, jump up, top of the jump with a big smile and little sparkles, land, spin / wag, back to idle.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

#### Kiệt sức (Rest) · 6 khung

Lưu thành `bach-ho-nghi.png` (768×1024)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: A chubby white tiger cub (Baihu) with black stripes, icy blue eyes and a tiny golden 王 mark on the forehead.

STYLE (match the attached reference sheets exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier. Small and very cute pet, about one third the height of a soldier, big head, big shiny eyes. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Rest", 6 frames: exhausted after its battle form was beaten: wobbles, sits down, lies down, closes its eyes, sleeps with a small 'z' bubble drawn as pixels, slow breathing.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (128×128 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

## Hình thái chiến đấu · ô 256×256

### Bước 1: sheet 8 hướng (1 tư thế mỗi hoạt ảnh)

Lưu thành `bach-ho-chien.png`

```text
Pixel art sprite sheet of a pet, EXACTLY like the attached design: The White Tiger of the West: a huge muscular white tiger with black stripes, silver-white metal armour plates, icy blue eyes, the golden 王 mark glowing on its forehead, metal-qi blades floating around it.

STYLE (match the attached reference sheets exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier and boss. BATTLE FORM of the pet: the same creature grown up, fierce and powerful, about 1.25x the height of the reference soldier (half the size of the reference boss), chunky readable silhouette, still recognisably the same pet (same colours and signature details). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Battle idle": fierce ready stance, eyes glowing.
Row 2 "Run": full stride run, legs stretched.
Row 3 "Attack": the IMPACT moment: a pouncing claw strike with silver crescent blade trails.
Row 4 "Hit": recoiling backwards, snarling, flashing white.
Row 5 "Skill": the most dramatic moment of its skill: the creature crouches low, the 王 mark flares, then dashes forward in a silver streak.
Row 6 "Defeated": fallen on its side, aura fading, eyes closed.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

### Bước 2: hoạt ảnh nhiều khung (mỗi hoạt ảnh một ảnh)

Mỗi ảnh: **8 hàng = 8 hướng**, **cột = khung hình** từ trái sang phải.

#### Thủ thế (Battle idle) · 4 khung

Lưu thành `bach-ho-chien-dung.png` (1024×2048)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: The White Tiger of the West: a huge muscular white tiger with black stripes, silver-white metal armour plates, icy blue eyes, the golden 王 mark glowing on its forehead, metal-qi blades floating around it.

STYLE (match the attached reference sheets exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier and boss. BATTLE FORM of the pet: the same creature grown up, fierce and powerful, about 1.25x the height of the reference soldier (half the size of the reference boss), chunky readable silhouette, still recognisably the same pet (same colours and signature details). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Battle idle", 4 frames: fierce ready stance, breathing loop, mane / tail / wings / aura moving, eyes glowing.

LAYOUT: 8 rows × 4 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 4 frames from left to right, a seamless loop. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

#### Chạy (Run) · 6 khung

Lưu thành `bach-ho-chien-chay.png` (1536×2048)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: The White Tiger of the West: a huge muscular white tiger with black stripes, silver-white metal armour plates, icy blue eyes, the golden 王 mark glowing on its forehead, metal-qi blades floating around it.

STYLE (match the attached reference sheets exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier and boss. BATTLE FORM of the pet: the same creature grown up, fierce and powerful, about 1.25x the height of the reference soldier (half the size of the reference boss), chunky readable silhouette, still recognisably the same pet (same colours and signature details). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Run", 6 frames: full run / gallop cycle loop: legs stretched and gathered in turn, the body clearly moving forward.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right, a seamless loop. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

#### Tấn công (Attack) · 6 khung

Lưu thành `bach-ho-chien-danh.png` (1536×2048)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: The White Tiger of the West: a huge muscular white tiger with black stripes, silver-white metal armour plates, icy blue eyes, the golden 王 mark glowing on its forehead, metal-qi blades floating around it.

STYLE (match the attached reference sheets exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier and boss. BATTLE FORM of the pet: the same creature grown up, fierce and powerful, about 1.25x the height of the reference soldier (half the size of the reference boss), chunky readable silhouette, still recognisably the same pet (same colours and signature details). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Attack", 6 frames: frames 1-2: wind-up; frame 3: IMPACT: a pouncing claw strike with silver crescent blade trails; frames 4-5: follow-through; frame 6: back to the ready stance. The attack goes in the facing direction.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

#### Bị trúng (Hit) · 2 khung

Lưu thành `bach-ho-chien-trung.png` (512×2048)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: The White Tiger of the West: a huge muscular white tiger with black stripes, silver-white metal armour plates, icy blue eyes, the golden 王 mark glowing on its forehead, metal-qi blades floating around it.

STYLE (match the attached reference sheets exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier and boss. BATTLE FORM of the pet: the same creature grown up, fierce and powerful, about 1.25x the height of the reference soldier (half the size of the reference boss), chunky readable silhouette, still recognisably the same pet (same colours and signature details). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Hit", 2 frames: recoils backwards with the whole sprite flashing white, snarling; then recovers.

LAYOUT: 8 rows × 2 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 2 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

#### Tung chiêu (Skill) · 6 khung

Lưu thành `bach-ho-chieu.png` (1536×2048)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: The White Tiger of the West: a huge muscular white tiger with black stripes, silver-white metal armour plates, icy blue eyes, the golden 王 mark glowing on its forehead, metal-qi blades floating around it.

STYLE (match the attached reference sheets exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier and boss. BATTLE FORM of the pet: the same creature grown up, fierce and powerful, about 1.25x the height of the reference soldier (half the size of the reference boss), chunky readable silhouette, still recognisably the same pet (same colours and signature details). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Skill", 6 frames: the signature skill "Bạch Hổ Liệt Trảo (White Tiger Rending Claws)": frames 1-2: charging, energy gathering around the body; frames 3-4: the creature crouches low, the 王 mark flares, then dashes forward in a silver streak, the most dramatic pose with the strongest effect; frames 5-6: release and recover.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

#### Gục (Defeated) · 6 khung

Lưu thành `bach-ho-chien-guc.png` (1536×2048)

```text
Pixel art animation sprite sheet of a pet, EXACTLY like the attached design: The White Tiger of the West: a huge muscular white tiger with black stripes, silver-white metal armour plates, icy blue eyes, the golden 王 mark glowing on its forehead, metal-qi blades floating around it.

STYLE (match the attached reference sheets exactly): pixel art for a top-down 3/4 view RPG/RTS, same outline thickness, palette and shading as the reference soldier and boss. BATTLE FORM of the pet: the same creature grown up, fierce and powerful, about 1.25x the height of the reference soldier (half the size of the reference boss), chunky readable silhouette, still recognisably the same pet (same colours and signature details). Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite.

THEME: Chinese xianxia cultivation-world divine beast: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, a faint qi aura drawn as crisp pixel streaks (no soft blur). Clearly more noble and powerful than an ordinary pet.

ANIMATION "Defeated", 6 frames: beaten: hit flash white, staggers, falls on its side, the battle aura fades, it shrinks a little in a puff of light, lies still.

LAYOUT: 8 rows × 6 columns. Rows = the 8 directions below from top to bottom (row 1 = direction 1 … row 8 = direction 8). Columns = the 6 frames from left to right. The motion is the same in every row, only the facing changes.

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head and the back; the face is NOT visible.
- 5 up: full BACK view, no face at all.
Every signature detail (horns, tails, wings, scarf, ornaments, aura) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (256×256 px), the creature centred, feet (or the lowest point of a hovering creature) on the same baseline in every cell, identical scale and design in every cell. Effects (fire, light, energy) stay inside their cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

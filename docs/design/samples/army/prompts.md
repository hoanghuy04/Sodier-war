# Prompt tạo sprite quân (cùng chất lượng sheet Rồng)

> **Bản mới, chi tiết theo từng binh chủng:** xem thư mục [prompts/](prompts/README.md). File này giữ lại để tham khảo.

Sheet [sprite-pixels/dragon.png](sprite-pixels/dragon.png) là mẫu về **độ đẹp và độ chi tiết**. Các prompt dưới đây giữ đúng phong cách đó và sửa sẵn những lỗi làm sheet không dùng được trong game:

| Lỗi ở sheet Rồng | Sửa trong prompt |
|---|---|
| Nền lem đỏ/đen/xám quanh hình, không cắt sạch được | Nền **magenta #FF00FF đặc**, không bóng, không viền sáng |
| Hướng ↑ vẫn thấy mặt | Ghi rõ ↑ là **nhìn lưng**, ↗ ↖ là ba phần tư sau lưng |
| Hàng Đứng và Di chuyển gần như giống nhau, mỗi ô 1 tư thế | Bước 2: mỗi hoạt ảnh một sheet nhiều khung |
| Pixel nhòe, kích thước ô không đều | Ô vuông bằng nhau, chân cùng một đường, pixel sắc |
| Có chữ, nhãn trong ảnh | Không chữ (mình tự gắn nhãn khi ghép) |

## Cách dùng

**Bước 1: sheet 8 hướng (giống sheet Rồng).** Mỗi quân một prompt ở dưới, cho ra 6 hàng × 8 cột. Đủ để duyệt thiết kế và làm tư thế chính.

**Bước 2: hoạt ảnh nhiều khung.** Sau khi duyệt bước 1, với mỗi hoạt ảnh dùng prompt mẫu ở cuối file: 8 hàng (hướng) × N cột (khung). Đứng 4, Đi 6, Tấn công 6 (khung 4 là lúc trúng), Bị trúng 2, Chiến thắng 6, Chết 6.

**Lưu file** vào `docs/design/samples/army/sprite-pixels/` theo tên `<mã quân>.png` (bước 1) hoặc `<mã quân>-<hoạt ảnh>.png` (bước 2), ví dụ `kiem-si.png`, `kiem-si-tan-cong.png`. Phần còn lại mình làm bằng công cụ nhập:
- cắt ô, bỏ nền magenta
- đưa về lưới pixel chuẩn
- canh chân cùng một đường
- tạo bản màu đỏ cho đội địch
- xuất sprite sheet, atlas và GIF cho game

Mẹo:
- Nếu công cụ ra ảnh quá rộng, cho mỗi lần 4 hướng (2 ảnh).
- Nếu nền vẫn lem, thêm câu: *"The background must be exactly one flat colour #FF00FF, the sprite edge must touch magenta directly."*
- Dán kèm sheet Rồng hoặc ảnh quân mẫu làm ảnh tham chiếu phong cách nếu công cụ cho phép.

## Dân quân (Militia)

Mã quân: `dan-quan` · ô 128×128 px

```text
Pixel art sprite sheet of a young peasant militia man: blue cloth cap, brown patched linen tunic with a rope belt, rolled-up sleeves, brown trousers and worn boots, holding a long wooden pitchfork with three iron tines.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (128×128 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": standing ready, breathing.
Row 2 "Di chuyển (Walk)": mid-stride walking, legs clearly apart.
Row 3 "Tấn công (Attack)": attack key pose: thrusts the pitchfork straight forward with both hands.
Row 4 "Bị trúng (Hit)": flinching backwards, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: raises the pitchfork overhead and jumps.
Row 6 "Chết (Die)": fallen on the ground, lying on the back.
The same character with identical design, colours and proportions in all 48 cells.
```

## Kiếm sĩ (Swordsman)

Mã quân: `kiem-si` · ô 128×128 px

```text
Pixel art sprite sheet of a swordsman: rounded steel kettle helmet with a raised centre ridge and a bronze rivet on each side, short brown hair showing at the sides, big two-layer steel pauldrons, grey chainmail shirt with a blue collar, gold belt buckle, dark navy trousers, brown boots with cuffs, a broad steel short sword with a gold crossguard in the right hand, a blue heater shield with a steel rim and a glowing light-blue cross in the left hand.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (128×128 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": standing ready, breathing.
Row 2 "Di chuyển (Walk)": mid-stride walking, legs clearly apart.
Row 3 "Tấn công (Attack)": attack key pose: winds up and slashes the sword diagonally down while stepping forward behind the shield.
Row 4 "Bị trúng (Hit)": flinching backwards, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: raises the sword straight up and jumps, shield held high.
Row 6 "Chết (Die)": fallen on the ground, lying on the back.
The same character with identical design, colours and proportions in all 48 cells.
```

## Lính giáo (Spearman)

Mã quân: `linh-giao` · ô 128×128 px

```text
Pixel art sprite sheet of a spearman: steel helmet with a tall blue horsehair plume, steel pauldrons, chainmail, blue tunic, leather belt, dark trousers, brown boots, a very long wooden spear (taller than him) with a steel leaf-shaped head.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (128×128 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": standing ready, breathing.
Row 2 "Di chuyển (Walk)": mid-stride walking, legs clearly apart.
Row 3 "Tấn công (Attack)": attack key pose: lowers the spear level, pulls it back, then thrusts it far forward with both hands.
Row 4 "Bị trúng (Hit)": flinching backwards, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: raises the spear vertically overhead and jumps.
Row 6 "Chết (Die)": fallen on the ground, lying on the back.
The same character with identical design, colours and proportions in all 48 cells.
```

## Cung thủ (Archer)

Mã quân: `cung-thu` · ô 128×128 px

```text
Pixel art sprite sheet of an archer: green hood with a short shoulder cape, brown hair, leather vest over a green shirt, brown trousers, boots, a quiver of white-fletched arrows on the back, a large wooden recurve bow.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (128×128 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": standing ready, breathing.
Row 2 "Di chuyển (Walk)": mid-stride walking, legs clearly apart.
Row 3 "Tấn công (Attack)": attack key pose: raises the bow, draws the string to the cheek in three steps, releases the arrow (arrow visible flying off), lowers the bow.
Row 4 "Bị trúng (Hit)": flinching backwards, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: holds the bow high overhead and jumps.
Row 6 "Chết (Die)": fallen on the ground, lying on the back.
The same character with identical design, colours and proportions in all 48 cells.
```

## Kỵ binh (Cavalry)

Mã quân: `ky-binh` · ô 160×160 px

```text
Pixel art sprite sheet of a cavalryman on a brown horse with a dark mane and tail, leather saddle and blue saddle blanket. Rider: steel helmet with a blue plume, chainmail, blue tunic, long wooden lance with a steel point.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (160×160 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": horse standing, rider ready.
Row 2 "Di chuyển (Walk)": horse trotting, legs clearly in motion.
Row 3 "Tấn công (Attack)": attack key pose: lowers the lance and charges, the horse lunges forward and lifts its front legs at the hit.
Row 4 "Bị trúng (Hit)": horse and rider flinching, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: the horse rears up on its hind legs while the rider raises the lance.
Row 6 "Chết (Die)": horse and rider fallen on their side.
The same character with identical design, colours and proportions in all 48 cells.
```

## Hiệp sĩ (Knight)

Mã quân: `hiep-si` · ô 160×160 px

```text
Pixel art sprite sheet of a knight on a white horse wearing a blue caparison with gold trim. Rider: full silver plate armour with gold trims, closed great helm with an eye slit and a red plume, blue cape, longsword, blue heater shield with a gold cross.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (160×160 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": horse standing, rider ready.
Row 2 "Di chuyển (Walk)": horse trotting, legs clearly in motion.
Row 3 "Tấn công (Attack)": attack key pose: swings the longsword down from horseback, shield in front.
Row 4 "Bị trúng (Hit)": horse and rider flinching, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: the horse rears up, the knight raises the sword.
Row 6 "Chết (Die)": horse and rider fallen on their side.
The same character with identical design, colours and proportions in all 48 cells.
```

## Pháp sư (Mage)

Mã quân: `phap-su` · ô 128×128 px

```text
Pixel art sprite sheet of a mage: tall pointed purple wizard hat with a gold band, white hair, long purple robe with gold trim reaching the ground, wooden staff topped by a glowing blue orb held by gold claws.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (128×128 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": standing ready, breathing.
Row 2 "Di chuyển (Walk)": mid-stride walking, legs clearly apart.
Row 3 "Tấn công (Attack)": attack key pose: lifts the staff, the orb charges up and shines brighter, then points it forward and fires a blue energy ball.
Row 4 "Bị trúng (Hit)": flinching backwards, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: raises the staff high, the orb flares bright, small jump.
Row 6 "Chết (Die)": fallen on the ground, lying on the back.
The same character with identical design, colours and proportions in all 48 cells.
```

## Máy bắn đá lửa (Fire catapult)

Mã quân: `may-ban-da` · ô 160×160 px

```text
Pixel art sprite sheet of a wooden fire catapult: heavy timber frame on 4 spoked wooden wheels with iron rims, A-frame uprights, throwing arm with a leather bucket holding a burning tar ball, iron counterweight, a tar barrel at the front, a small blue team pennant.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (160×160 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": loaded and ready.
Row 2 "Di chuyển (Move)": rolling, wheels turning.
Row 3 "Tấn công (Attack)": attack key pose: the arm is pulled back, then swings up and over and launches the flaming ball forward, the arm hits the crossbar.
Row 4 "Bị trúng (Hit)": shaking, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: the blue pennant waves, the catapult bounces slightly.
Row 6 "Hỏng (Destroyed)": broken and collapsed, one wheel off, small fire.
The same character with identical design, colours and proportions in all 48 cells.
```

## Sư thứu (Griffin rider)

Mã quân: `su-thuu` · ô 160×160 px

```text
Pixel art sprite sheet of a flying griffin: white eagle head and chest feathers, golden hooked beak, large brown wings with darker tips, tawny lion body and tail. Rider: steel helmet with a blue plume, blue tunic, holding a spear. It hovers above the ground.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (160×160 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Bay đứng (Hover)": hovering, wings mid-beat.
Row 2 "Bay (Fly)": flying forward, wings in a strong downstroke.
Row 3 "Tấn công (Attack)": attack key pose: dives forward, the griffin claws and the rider thrusts the spear.
Row 4 "Bị trúng (Hit)": flinching, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: wings spread wide upward, rider raises the spear.
Row 6 "Chết (Die)": crashed on the ground, wings limp.
The same character with identical design, colours and proportions in all 48 cells.
```

## Thạch Lâm, Kiếm Vương (hero)

Mã quân: `thach-lam` · ô 128×128 px

```text
Pixel art sprite sheet of a heroic sword king: full silver plate armour with gold trims, steel helmet with a red plume, flowing red cape, a huge two-handed greatsword resting on his shoulder.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (128×128 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": standing ready, breathing.
Row 2 "Di chuyển (Walk)": mid-stride walking, legs clearly apart.
Row 3 "Tấn công (Attack)": attack key pose: swings the greatsword in a big overhead two-handed arc.
Row 4 "Bị trúng (Hit)": flinching backwards, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: plants the greatsword, raises a fist, cape flowing.
Row 6 "Chết (Die)": fallen on the ground, lying on the back.
The same character with identical design, colours and proportions in all 48 cells.
```

## Kim Hạ, Bà Chủ Mỏ (hero)

Mã quân: `kim-ha` · ô 128×128 px

```text
Pixel art sprite sheet of a cheerful mine mistress: yellow miner hard hat with a glowing lamp on the front, long brown braid, blue overalls, leather sleeves and gloves, a gem pouch at the hip, a steel pick-hammer.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (128×128 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": standing ready, breathing.
Row 2 "Di chuyển (Walk)": mid-stride walking, legs clearly apart.
Row 3 "Tấn công (Attack)": attack key pose: smashes the pick-hammer down overhead.
Row 4 "Bị trúng (Hit)": flinching backwards, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: raises the pick-hammer, the hat lamp shines, jumps.
Row 6 "Chết (Die)": fallen on the ground, lying on the back.
The same character with identical design, colours and proportions in all 48 cells.
```

## Phong Vũ, Kỵ Tướng (hero)

Mã quân: `phong-vu` · ô 160×160 px

```text
Pixel art sprite sheet of a cavalry general on a black horse with a white mane: black-haired young man, blue leather armour, long blue scarf flowing behind, spear with a blue pennant.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (160×160 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": horse standing, rider ready.
Row 2 "Di chuyển (Walk)": horse trotting, legs clearly in motion.
Row 3 "Tấn công (Attack)": attack key pose: charges and thrusts the spear from horseback.
Row 4 "Bị trúng (Hit)": horse and rider flinching, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: the horse rears up, the scarf and pennant flutter.
Row 6 "Chết (Die)": horse and rider fallen on their side.
The same character with identical design, colours and proportions in all 48 cells.
```

## Lam Nguyệt, Nữ Pháp Sư (hero)

Mã quân: `lam-nguyet` · ô 128×128 px

```text
Pixel art sprite sheet of a moon sorceress: navy-violet hood and long robe sprinkled with tiny silver stars, long white hair, a staff topped by a glowing crescent moon.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (128×128 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": standing ready, breathing.
Row 2 "Di chuyển (Walk)": mid-stride walking, legs clearly apart.
Row 3 "Tấn công (Attack)": attack key pose: raises the moon staff and calls down a small falling star in front of her.
Row 4 "Bị trúng (Hit)": flinching backwards, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: lifts the staff, stars sparkle around her.
Row 6 "Chết (Die)": fallen on the ground, lying on the back.
The same character with identical design, colours and proportions in all 48 cells.
```

## Hỏa Kỳ, Kẻ Thuần Long (hero)

Mã quân: `hoa-ky` · ô 128×128 px

```text
Pixel art sprite sheet of a dragon tamer: dark red helmet with two curved ivory horns, red dragon-scale armour, black cape, red gloves, a leather whip with a burning tip.

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: one sprite sheet. 8 columns = 8 facing directions in this exact order: down (facing the viewer), down-right, right, up-right, up (BACK view, we see the back and the back of the head, NO face), up-left, left, down-left. Up-right and up-left show a three-quarter BACK view. Left/right show a clean side profile. Every cell is the same size (128×128 px), the character is centred and its feet touch the same baseline in every cell, same scale in every cell. BACKGROUND: flat solid pure magenta #FF00FF in every cell, nothing else: no shadow on the ground, no glow, no halo, no border, no grid lines, no text, no labels. 6 rows, one pose per cell:
Row 1 "Đứng (Idle)": standing ready, breathing.
Row 2 "Di chuyển (Walk)": mid-stride walking, legs clearly apart.
Row 3 "Tấn công (Attack)": attack key pose: whips back over the head and cracks the whip forward, the tip bursts into flame.
Row 4 "Bị trúng (Hit)": flinching backwards, flashing white.
Row 5 "Chiến thắng (Victory)": victory pose: cracks the whip above the head, flames around.
Row 6 "Chết (Die)": fallen on the ground, lying on the back.
The same character with identical design, colours and proportions in all 48 cells.
```

## Prompt mẫu cho bước 2 (hoạt ảnh nhiều khung)

Thay `<MÔ TẢ QUÂN>` bằng câu mô tả của quân đó ở trên (câu sau "Pixel art sprite sheet of"), `<HOẠT ẢNH>` và `<N>` theo bảng:

| Hoạt ảnh | N khung | Mô tả chuyển động |
|---|---|---|
| Đứng | 4 | breathing idle loop, small up-down body bob |
| Di chuyển | 6 | full walk cycle loop, legs alternate, arms swing (horses: trot cycle, wheels: one full turn) |
| Tấn công | 6 | anticipation, wind-up, peak, HIT on frame 4, follow-through, recover |
| Bị trúng | 2 | flinch back with a white flash, recover |
| Chiến thắng | 6 | crouch, jump with the weapon raised, peak, land, cheer |
| Chết | 6 | hit flash, knock back, fall, hit the ground, small dust, lie still |

```text
Pixel art animation sprite sheet of <MÔ TẢ QUÂN>

STYLE: high-quality chibi pixel art for a top-down 3/4 view RPG/RTS. Big head (about 40% of body height), large dark eyes with a white highlight, small red mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid: every pixel square and sharp, NO blur, NO anti-aliasing, NO soft glow, NO gradients outside the sprite. Team colour is BLUE (tabard, shield, cape, cloth) so it can be recoloured later.

LAYOUT: 8 rows = 8 facing directions in this order from top to bottom: down (facing the viewer), down-right, right, up-right, up (BACK view, no face), up-left, left, down-left. <N> columns = <N> animation frames of "<HOẠT ẢNH>" from left to right, a smooth loop where it makes sense. Every cell the same size, the character centred, feet on the same baseline in every cell, identical design and scale in every frame. BACKGROUND: flat solid pure magenta #FF00FF, no shadow, no glow, no halo, no grid lines, no text.
```

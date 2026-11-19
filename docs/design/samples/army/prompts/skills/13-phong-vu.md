# Hiệu ứng skill: Phong Vũ · Thần tốc

Skill: 5 giây, cả đội +60% tốc độ. Màu chủ đạo: xanh bạc hà + trắng + xanh lam (khăn choàng xanh).

**Gửi kèm:** ảnh tướng `sprite-pixels/phong-vu.png` (để khớp màu và nét). Trả về **File PNG**.

## Ảnh 1: `fx-phong-vu.png` (8 cột × 3 hàng, ô 256×256)

```text
Pixel art VFX sprite sheet of the "Swift Wind" skill of a cavalry general: mint green, white and sky blue wind, swirling air currents, a few green leaves.
Row 1 "Cast": a tornado of mint and white wind spirals up from the ground in the centre, it widens into a huge whirlwind, leaves and dust spin in it, then it bursts outward into a ring of gusts on the ground.
Row 2 "Rush" (seamless loop, around the army for 5 s): a wide spinning ring of wind streaks circles the ground ellipse, long sharp horizontal speed lines whoosh past, a few leaves fly. Frame 8 must flow back into frame 1.
Row 3 "End": the wind streaks thin out and curl into small swirls that fade away.

STYLE: pixel art VISUAL EFFECT (VFX) sprite sheet for a top-down 3/4 view RPG/RTS, matching the attached reference sprite: same palette richness, chunky readable shapes, crisp hard pixel edges. Glows and light are drawn as hard-edged bands of 2-3 bright tones (white-hot core → bright colour → darker colour rim), like classic 16-bit game magic effects. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft airbrushed glow, NO semi-transparent pixels. Never use pink or magenta colours inside the effect. Anything lying on the ground (rings, circles, cracks) is seen from the 3/4 camera, so it is an ellipse about twice as wide as tall.
LAYOUT: 8 columns × 3 rows. Each ROW is one animation, played left → right (column 1 = frame 1 … column 8 = frame 8), smooth step between frames. Every cell exactly 256×256 px, the effect centred on the SAME anchor point in every cell (the centre of the ground ellipse sits at the middle of the lower third of the cell), nothing crosses into a neighbouring cell.
BACKGROUND: one flat solid pure magenta #FF00FF everywhere, the effect pixels touch magenta directly. No characters, no hero, no soldiers, no ground tiles, no text, no labels, no numbers, no grid lines, no border.
```

## Ảnh 2: `fx-phong-vu-icon.png` (8 cột × 1 hàng, ô 64×64)

```text
Pixel art icon effect animation: a wind trail drawn for a unit moving to the RIGHT: 3-4 sharp mint and white speed streaks behind the feet plus a small swirl of dust, flickering (shown under every friendly unit while it runs; the game mirrors it for other directions).
STYLE: same pixel art VFX style as the main sheet, hard pixel edges, NO blur, NO anti-aliasing, NO semi-transparent pixels, no pink or magenta inside the effect.
LAYOUT: 8 columns × 1 row, one looping animation left → right, every cell exactly 64×64 px, the effect centred in every cell. BACKGROUND: flat solid pure magenta #FF00FF, no text, no characters.
```

**Cách gắn vào game:** Cast phát 1 lần chỗ tướng, Rush lặp quanh đội trong 5 giây, End lúc hết. Vệt gió nhỏ gắn dưới chân từng lính khi chạy.

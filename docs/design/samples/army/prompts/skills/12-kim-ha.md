# Hiệu ứng skill: Kim Hạ · Đào thần tốc

Skill: 30 giây, mọi mỏ đang giữ cho gấp đôi sản lượng. Màu chủ đạo: vàng kim + xanh ngọc (đá quý).

**Gửi kèm:** ảnh tướng `sprite-pixels/kim-ha.png` (để khớp màu và nét). Trả về **File PNG**.

## Ảnh 1: `fx-kim-ha.png` (8 cột × 3 hàng, ô 256×256)

```text
Pixel art VFX sprite sheet of the "Gold Rush" skill of a mine mistress: shining gold, warm yellow light, gold coins and sparkling gems (cyan, green, red).
Row 1 "Cast": a giant golden pick-hammer of light swings down and strikes the ground in the centre, the ground cracks with glowing gold lines, then a big fountain of gold coins, gold nuggets and colourful gems erupts upward and rains back down; a golden ring shockwave spreads on the ground.
Row 2 "Mine boost" (seamless loop, shown on top of each owned mine for 30 s): a golden ring of spinning coins circles the ground ellipse, bright gold sparkles and small coins pop up and twinkle, a tall thin beam of gold light pulses in the middle. Frame 8 must flow back into frame 1.
Row 3 "End": the coin ring slows, the coins drop and shatter into gold dust that fades away.

STYLE: pixel art VISUAL EFFECT (VFX) sprite sheet for a top-down 3/4 view RPG/RTS, matching the attached reference sprite: same palette richness, chunky readable shapes, crisp hard pixel edges. Glows and light are drawn as hard-edged bands of 2-3 bright tones (white-hot core → bright colour → darker colour rim), like classic 16-bit game magic effects. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft airbrushed glow, NO semi-transparent pixels. Never use pink or magenta colours inside the effect. Anything lying on the ground (rings, circles, cracks) is seen from the 3/4 camera, so it is an ellipse about twice as wide as tall.
LAYOUT: 8 columns × 3 rows. Each ROW is one animation, played left → right (column 1 = frame 1 … column 8 = frame 8), smooth step between frames. Every cell exactly 256×256 px, the effect centred on the SAME anchor point in every cell (the centre of the ground ellipse sits at the middle of the lower third of the cell), nothing crosses into a neighbouring cell.
BACKGROUND: one flat solid pure magenta #FF00FF everywhere, the effect pixels touch magenta directly. No characters, no hero, no soldiers, no ground tiles, no text, no labels, no numbers, no grid lines, no border.
```

## Ảnh 2: `fx-kim-ha-icon.png` (8 cột × 1 hàng, ô 64×64)

```text
Pixel art icon effect animation: a single shining gold coin with a tiny gem sparkle, spinning and floating up a little (shown above a mine each time it pays out double).
STYLE: same pixel art VFX style as the main sheet, hard pixel edges, NO blur, NO anti-aliasing, NO semi-transparent pixels, no pink or magenta inside the effect.
LAYOUT: 8 columns × 1 row, one looping animation left → right, every cell exactly 64×64 px, the effect centred in every cell. BACKGROUND: flat solid pure magenta #FF00FF, no text, no characters.
```

**Cách gắn vào game:** Cast phát 1 lần chỗ tướng, Mine boost lặp trên mỗi mỏ đang giữ suốt 30 giây, End lúc hết. Icon đồng xu bay lên mỗi lần mỏ trả tài nguyên.

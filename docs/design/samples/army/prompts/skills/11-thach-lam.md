# Hiệu ứng skill: Thạch Lâm · Tường khiên

Skill: 6 giây, mọi quân của mình nhận ít hơn 30% sát thương. Màu chủ đạo: xanh lam kim loại + vàng (giáp bạc viền vàng).

**Gửi kèm:** ảnh tướng `sprite-pixels/thach-lam.png` (để khớp màu và nét). Trả về **File PNG**.

## Ảnh 1: `fx-thach-lam.png` (8 cột × 4 hàng, ô 256×256)

```text
Pixel art VFX sprite sheet of the "Shield Wall" skill of a sword king: royal blue, bright cyan and gold holy light, made of hexagon shield cells.
Row 1 "Cast" (0.6 s): a giant ghostly greatsword of white-gold light plunges down from above into the centre; on impact a gold rune circle flashes on the ground and a burst of cyan light rays shoots up.
Row 2 "Rise": a huge shield dome made of glowing cyan hexagon outlines grows up from the rune circle until it is a full half-dome (about 220 px wide); the hexagons are drawn as bright outlines with an empty (magenta) inside so units stay visible.
Row 3 "Hold" (seamless loop): the finished hexagon dome stays, a band of white light sweeps around it from left to right, a few hexagons flicker brighter, small gold sparks drift upward. Frame 8 must flow back into frame 1.
Row 4 "Break": the dome cracks, the hexagons pop apart into falling cyan shards that turn into tiny gold sparkles and vanish; the rune circle fades out.

STYLE: pixel art VISUAL EFFECT (VFX) sprite sheet for a top-down 3/4 view RPG/RTS, matching the attached reference sprite: same palette richness, chunky readable shapes, crisp hard pixel edges. Glows and light are drawn as hard-edged bands of 2-3 bright tones (white-hot core → bright colour → darker colour rim), like classic 16-bit game magic effects. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft airbrushed glow, NO semi-transparent pixels. Never use pink or magenta colours inside the effect. Anything lying on the ground (rings, circles, cracks) is seen from the 3/4 camera, so it is an ellipse about twice as wide as tall.
LAYOUT: 8 columns × 4 rows. Each ROW is one animation, played left → right (column 1 = frame 1 … column 8 = frame 8), smooth step between frames. Every cell exactly 256×256 px, the effect centred on the SAME anchor point in every cell (the centre of the ground ellipse sits at the middle of the lower third of the cell), nothing crosses into a neighbouring cell.
BACKGROUND: one flat solid pure magenta #FF00FF everywhere, the effect pixels touch magenta directly. No characters, no hero, no soldiers, no ground tiles, no text, no labels, no numbers, no grid lines, no border.
```

## Ảnh 2: `fx-thach-lam-icon.png` (8 cột × 1 hàng, ô 64×64)

```text
Pixel art icon effect animation: a small glowing cyan hexagon shield with a gold rim floating above a soldier's head, gently bobbing and pulsing brighter every few frames (shown on every friendly unit while the skill is active).
STYLE: same pixel art VFX style as the main sheet, hard pixel edges, NO blur, NO anti-aliasing, NO semi-transparent pixels, no pink or magenta inside the effect.
LAYOUT: 8 columns × 1 row, one looping animation left → right, every cell exactly 64×64 px, the effect centred in every cell. BACKGROUND: flat solid pure magenta #FF00FF, no text, no characters.
```

**Cách gắn vào game:** Cast + Rise phát 1 lần khi bấm skill, Hold lặp trong 6 giây quanh tướng, Break lúc hết. Icon nhỏ gắn trên đầu từng lính của mình.

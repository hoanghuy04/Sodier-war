# Hiệu ứng skill: Lam Nguyệt · Mưa sao băng

Skill: chọn điểm trong 8 ô: sao băng rơi vùng 2,5 ô, 120 sát thương. Màu chủ đạo: tím xanh đêm + bạc + trắng (áo choàng sao).

**Gửi kèm:** ảnh tướng `sprite-pixels/lam-nguyet.png` (để khớp màu và nét). Trả về **File PNG**.

## Ảnh 1: `fx-lam-nguyet.png` (8 cột × 4 hàng, ô 256×256)

```text
Pixel art VFX sprite sheet of the "Meteor Rain" skill of a moon sorceress: deep violet, indigo, bright white and silver starlight, a crescent moon motif.
Row 1 "Target": a violet magic circle draws itself on the ground (about 200 px wide ellipse): first the outer ring, then a 5-point star and a crescent moon inside, then tiny runes around the edge, glowing brighter in the last frames.
Row 2 "Fall": a blazing meteor of white-violet starfire falls steeply from the TOP-RIGHT corner of the cell down to the ground anchor, getting bigger as it comes, with a long sparkling trail of violet fire and small silver stars; the last frame touches the ground.
Row 3 "Impact": a huge white flash, a violet-white starburst explosion with sharp star-shaped rays, a shockwave ring racing across the ground, star fragments and rocks flying out, then a column of violet light shoots up.
Row 4 "Afterglow": a glowing cracked crater with violet embers and twinkling silver stars that slowly fade and vanish.

STYLE: pixel art VISUAL EFFECT (VFX) sprite sheet for a top-down 3/4 view RPG/RTS, matching the attached reference sprite: same palette richness, chunky readable shapes, crisp hard pixel edges. Glows and light are drawn as hard-edged bands of 2-3 bright tones (white-hot core → bright colour → darker colour rim), like classic 16-bit game magic effects. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft airbrushed glow, NO semi-transparent pixels. Never use pink or magenta colours inside the effect. Anything lying on the ground (rings, circles, cracks) is seen from the 3/4 camera, so it is an ellipse about twice as wide as tall.
LAYOUT: 8 columns × 4 rows. Each ROW is one animation, played left → right (column 1 = frame 1 … column 8 = frame 8), smooth step between frames. Every cell exactly 256×256 px, the effect centred on the SAME anchor point in every cell (the centre of the ground ellipse sits at the middle of the lower third of the cell), nothing crosses into a neighbouring cell.
BACKGROUND: one flat solid pure magenta #FF00FF everywhere, the effect pixels touch magenta directly. No characters, no hero, no soldiers, no ground tiles, no text, no labels, no numbers, no grid lines, no border.
```

## Ảnh 2: `fx-lam-nguyet-icon.png` (8 cột × 1 hàng, ô 64×64)

```text
Pixel art icon effect animation: a small falling violet-white star with a short sparkle trail (several are dropped around the target area for extra rain).
STYLE: same pixel art VFX style as the main sheet, hard pixel edges, NO blur, NO anti-aliasing, NO semi-transparent pixels, no pink or magenta inside the effect.
LAYOUT: 8 columns × 1 row, one looping animation left → right, every cell exactly 64×64 px, the effect centred in every cell. BACKGROUND: flat solid pure magenta #FF00FF, no text, no characters.
```

**Cách gắn vào game:** Target hiện 1 giây (đúng thời gian chờ server), Fall rơi trong ~0,3 giây cuối, Impact + Afterglow lúc trúng. Sao nhỏ rắc thêm quanh vùng nổ.

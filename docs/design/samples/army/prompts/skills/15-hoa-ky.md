# Hiệu ứng skill: Hỏa Kỳ · Long hống

Skill: 5 giây, địch trong 5 ô quanh quân bay của mình mất 30% ATK, 20% tốc độ. Màu chủ đạo: đỏ lửa + cam + vàng + đen (giáp vảy rồng).

**Gửi kèm:** ảnh tướng `sprite-pixels/hoa-ky.png` (để khớp màu và nét). Trả về **File PNG**.

## Ảnh 1: `fx-hoa-ky.png` (8 cột × 4 hàng, ô 256×256)

```text
Pixel art VFX sprite sheet of the "Dragon Roar" skill of a dragon tamer: blazing red, orange and yellow fire with black smoke, a spectral fire dragon.
Row 1 "Summon": flames swirl up from the ground and form a giant spectral head of a red fire dragon above the centre (horns, glowing yellow eyes, open jaws), rising and opening its mouth.
Row 2 "Roar": the fire dragon head roars, its jaws wide, a cone of roaring fire and sound waves blasts out, then the head bursts into flames.
Row 3 "Shockwave": three red-orange fire rings explode outward one after another across the ground ellipse, with ember sparks and black smoke puffs flying out, the ground scorched.
Row 4 "Burn aura" (seamless loop, for 5 s): a low ring of flickering flames on the ground ellipse with embers floating upward. Frame 8 must flow back into frame 1.

STYLE: pixel art VISUAL EFFECT (VFX) sprite sheet for a top-down 3/4 view RPG/RTS, matching the attached reference sprite: same palette richness, chunky readable shapes, crisp hard pixel edges. Glows and light are drawn as hard-edged bands of 2-3 bright tones (white-hot core → bright colour → darker colour rim), like classic 16-bit game magic effects. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft airbrushed glow, NO semi-transparent pixels. Never use pink or magenta colours inside the effect. Anything lying on the ground (rings, circles, cracks) is seen from the 3/4 camera, so it is an ellipse about twice as wide as tall.
LAYOUT: 8 columns × 4 rows. Each ROW is one animation, played left → right (column 1 = frame 1 … column 8 = frame 8), smooth step between frames. Every cell exactly 256×256 px, the effect centred on the SAME anchor point in every cell (the centre of the ground ellipse sits at the middle of the lower third of the cell), nothing crosses into a neighbouring cell.
BACKGROUND: one flat solid pure magenta #FF00FF everywhere, the effect pixels touch magenta directly. No characters, no hero, no soldiers, no ground tiles, no text, no labels, no numbers, no grid lines, no border.
```

## Ảnh 2: `fx-hoa-ky-icon.png` (8 cột × 1 hàng, ô 64×64)

```text
Pixel art icon effect animation: a fear/weakness debuff shown above an ENEMY unit: a small cracked red sword pointing down with a dark red claw scratch behind it, flickering, with 2 tiny black smoke wisps.
STYLE: same pixel art VFX style as the main sheet, hard pixel edges, NO blur, NO anti-aliasing, NO semi-transparent pixels, no pink or magenta inside the effect.
LAYOUT: 8 columns × 1 row, one looping animation left → right, every cell exactly 64×64 px, the effect centred in every cell. BACKGROUND: flat solid pure magenta #FF00FF, no text, no characters.
```

**Cách gắn vào game:** Summon + Roar phát chỗ tướng, Shockwave lan ra 5 ô, Burn aura lặp quanh từng quân bay 5 giây. Icon nhỏ gắn trên đầu địch bị yếu.

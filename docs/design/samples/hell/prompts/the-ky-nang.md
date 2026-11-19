# Khung thẻ kỹ năng

Sheet `the-ky-nang` · 5 cột × 1 hàng · ô 192×288 px. Khung trống; game đặt icon vào ô vuông trên, viết tên và mô tả bằng chữ của game.

**Gửi kèm:** `docs/design/samples/army/sprite-pixels/kiem-si.png`. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/the-ky-nang.png`

```text
Pixel art sprite sheet of 5 EMPTY SKILL CARD FRAMES for the level-up screen of a hell survival mode in a top-down RPG/RTS. Each card is a tall rounded rectangle with: a square window near the top (about 112×112 px) for an icon, a small title plate under it, and an empty dark text panel in the lower half. All windows and panels are EMPTY (flat dark colour), no icon, no text.
Column 1 "Active skill": dark charcoal card with a silver-blue steel rim and small rivets.
Column 2 "Passive": dark card with a bronze-green rim and a small leaf-like ornament on top.
Column 3 "Hero weapon": dark card with a bright gold rim and a small gold crown on top.
Column 4 "Evolution": dark crimson card with a thick gold rim, small white-gold flames along the edge and a star on top; the most precious-looking card.
Column 5 "Locked": a dull dark grey iron card with a chain across it and a small padlock.

STYLE: chunky pixel art UI in the same palette, outline and shading as the attached reference sprite. Crisp 1-pixel dark navy outline (#1b1726). Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal and gold. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the card. Never use pink or magenta inside a card.

CELLS & BACKGROUND: 5 columns × 1 row, every cell exactly 192×288 px, each card centred and filling about 92% of the cell, all cards the same size and shape. Background: one flat solid pure magenta #FF00FF everywhere. No text, no letters, no numbers, no grid lines.
```

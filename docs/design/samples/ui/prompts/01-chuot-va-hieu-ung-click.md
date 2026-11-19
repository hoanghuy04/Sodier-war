# Con trỏ chuột + hiệu ứng nhấn chuột phải (kiểu Liên Minh Huyền Thoại)

2 phần, vẽ thành 3 file. **Gửi kèm ảnh mẫu** `../../army/sprite-pixels/1.png` (Kiếm sĩ) để giữ nét pixel art. Gửi lại dạng **File** PNG.

- Con trỏ: **bàn tay chỉ** khi di chuột trên đất (chuột phải = đi tới), **kiếm đỏ** khi di chuột lên địch (chuột phải = tấn công).
- Hiệu ứng nhấn: **mũi tên xanh lá** chụm xuống chỗ nhấn khi ra lệnh đi, **mũi tên đỏ** khi ra lệnh đánh.

## 1. Con trỏ chuột

Lưu thành `sprite-pixels/con-tro.png`

```text
Pixel art sprite sheet of MOUSE CURSORS for a fantasy RTS game, 4 columns × 1 row:
Column 1 "Move": a chunky cartoon gauntlet HAND with the INDEX FINGER pointing up-left (like a classic pointing-hand cursor), light steel glove with a brown leather cuff and a small gold rivet, the fingertip is the exact top-left tip of the sprite.
Column 2 "Move pressed": the same hand slightly pushed down, the finger bent a little as if tapping, with three tiny white motion ticks around the fingertip.
Column 3 "Attack": a short RED SWORD pointing up-left: blood-red glowing steel blade with a bright white edge highlight, black and gold crossguard, dark red leather grip, gold pommel; the blade tip is the exact top-left tip of the sprite.
Column 4 "Attack pressed": the same red sword tilted a little more, with a small red slash spark at the tip.

STYLE: chibi pixel art matching the attached reference sheet's palette and shading. Crisp 1-pixel dark navy outline (#1b1726) around every cursor so it stays readable on any ground (grass, snow, sand). Saturated colours, 3-4 tone shading, light from the top-left. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO glow outside the outline, NO drop shadow.

CELLS & BACKGROUND: 4 columns × 1 row, every cell exactly 128×128 px; each cursor is about 90 px tall and touches the top-left corner of its cell with its tip (that point is the click point). Background: one flat solid pure magenta #FF00FF everywhere. No text, no labels, no grid lines.
```

## 2. Hiệu ứng nhấn để ĐI (xanh lá)

Lưu thành `sprite-pixels/click-di.png`

```text
Pixel art ANIMATION sprite sheet of a MOVE-ORDER CLICK MARKER on the ground for a top-down 3/4 view RTS (like the green arrows in League of Legends): 4 bright GREEN chevron ARROWS arranged around a point (north, east, south, west), each arrow pointing INWARD and slightly DOWN toward the centre, plus a flat green ring on the ground at the centre seen in perspective (a squashed ellipse, about twice as wide as tall).
8 frames in one row, the animation of one click:
Frame 1: the 4 arrows appear far from the centre and high above the ground, small ring just a dot.
Frames 2-4: the arrows slide inward and down toward the centre, getting closer; the ring grows.
Frame 5: the arrows almost touch the centre, the ring is at full size with a bright white flash pixel ring inside.
Frames 6-8: the arrows fade (fewer pixels, lighter green), the ring expands a bit and thins out until only a faint outline is left.
Colours: bright lime green #6dff4a with a darker green #2a9a2a outline side and white #ffffff highlight pixels; the ring in the same greens.

STYLE: pixel art, crisp 1-pixel dark outline (#1b1726) on the arrows, flat bright colours, strict pixel grid, every pixel sharp: NO blur, NO anti-aliasing, NO soft glow (fading is done by removing pixels, not by transparency).

CELLS & BACKGROUND: 8 columns × 1 row, every cell exactly 128×128 px, the click point is the exact centre of every cell (the ring's centre). Background: one flat solid pure magenta #FF00FF everywhere. No text, no labels, no grid lines.
```

## 3. Hiệu ứng nhấn để TẤN CÔNG (đỏ)

Lưu thành `sprite-pixels/click-danh.png`

```text
The SAME animation sheet as the green move marker (same 8 frames, same layout, same size, the 4 inward-pointing chevron arrows sliding down onto a ground ring), but for an ATTACK order: everything RED: bright red #ff3a3a arrows with a dark red #9a1a1a side and white highlight pixels, a red ring on the ground, and at frame 5 a small red crossed-swords spark in the centre instead of the white flash.

STYLE: pixel art, crisp 1-pixel dark outline (#1b1726) on the arrows, flat bright colours, strict pixel grid, every pixel sharp: NO blur, NO anti-aliasing, NO soft glow.

CELLS & BACKGROUND: 8 columns × 1 row, every cell exactly 128×128 px, the click point is the exact centre of every cell. Background: one flat solid pure magenta #FF00FF everywhere. No text, no labels, no grid lines.
```

Game sẽ tự: đổi con trỏ khi rê lên địch, phát 8 khung hình mũi tên trong khoảng 0,4 giây tại chỗ nhấn chuột phải (xanh = đi, đỏ = đánh), và giữ vòng mờ dưới chân tới khi quân tới nơi.

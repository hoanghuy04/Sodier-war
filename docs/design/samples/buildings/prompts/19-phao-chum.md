# Pháo chùm (giống Scattershot)

Mã công trình: `phao-chum` · chân đế 3×3 ô · ô 384×384 px · mở ở **Thành trì cấp 8** · 4 hình

Bắn một quả bình đất nung to, trúng đích thì vỡ thành chùm mảnh văng hình nón **ra phía sau** mục tiêu, trúng cả quân bộ lẫn quân bay. Tầm 3–10 ô (vùng chết 3 ô).

**Gửi kèm ảnh mẫu:** `../army/sprite-pixels/1.png` (Kiếm sĩ đã duyệt) và sheet Thành trì (`sprite-pixels/thanh-tri.png`) để giữ đúng nét vẽ, góc nhìn và cỡ. Gửi lại dạng **File** PNG (không gửi dạng ảnh nén).

Lưu thành `sprite-pixels/phao-chum.png`

```text
Pixel art sprite sheet of a HEAVY SCATTER CANNON for base defence: a wide, stout bombard cannon with a very large flared mouth, resting on a massive rotating base of interlocking stone blocks and thick metal plates; on top of the breech a loading hopper holds big round CLAY FIRE-POT bombs wrapped in rope (one glowing crack of light on them); two heavy counterweight blocks on the sides, chains and big bolts; the cannon points forward and slightly to the left.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal, gold and crystal. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like base buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth, painted plates) so it can be recoloured later.

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric, NOT a diamond): the building faces the viewer (front side at the bottom of the picture), we see its front side and its top from above at about 45°. Its square ground footprint looks like a slightly flattened square, front edge horizontal.
The footprint is 3×3 map tiles: the base fills about 85% of the cell width; low and wide, about as tall as it is wide.

LEVELS (one per column, the same building growing richer, same footprint and the same overall silhouette so the player recognises it):
Column 1 "Level 1": dark blued STEEL plates with silver rivets on a dark slate-stone base, deep blue painted panels.
Column 2 "Level 2": black OBSIDIAN stone with polished silver trims and violet crystal inlays, thin glowing violet rune lines.
Column 3 "Level 3": white marble and heavy GOLD plating with sky-blue crystal shards, small sky-blue flames or glowing runes, the richest version.
Column 4 "Ruin": the destroyed building: a low pile of broken stone, twisted metal, splintered beams and dust on the same footprint, nothing standing taller than one third of the level 1 building.

CELLS & BACKGROUND: 4 columns × 1 row, every cell exactly the same size (384×384 px), the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell, identical scale in every cell (level 3 may be slightly taller, never wider). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow on the background, no halo, no border, no grid lines, no text, no labels, no numbers.
```

Công trình không có hướng (luôn quay mặt về phía người xem) và không cần hoạt ảnh nhiều khung: giàn giáo khi đang xây, đạn, tia và nổ do game tự vẽ.

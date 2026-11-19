# Tháp phép (Wizard tower)

Mã công trình: `thap-phep` · chân đế 2×2 ô · ô 256×256 px

**Gửi kèm ảnh mẫu:** `../army/sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ và bảng màu. Nếu công cụ không nhận ảnh thì vẫn dán prompt như bình thường.

## Bước 1: sheet 5 cấp + đổ nát

Lưu thành `sprite-pixels/thap-phep.png`

```text
Pixel art sprite sheet of a WIZARD TOWER for base defence: a slim round tower tapering upward, purple bands around it, glowing violet windows, a purple conical roof with small spikes around its rim, and a big glowing violet magic orb floating above the roof tip with small blue crystal shards orbiting it (more shards at higher levels). Round stepped stone base.

STYLE (match the attached reference unit sheet): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal and gold. Chunky, readable shapes with slightly exaggerated proportions (cute, sturdy, toy-like, like Clash of Clans buildings drawn as pixel art). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, flags, cloth) so it can be recoloured later.

CAMERA: the same top-down 3/4 view as the soldiers (NOT isometric, NOT a diamond): the building faces the viewer (front side at the bottom of the picture), we see its front wall and its roof/top from above at about 45°. Its square ground footprint looks like a slightly flattened square, front edge horizontal. The entrance (door, gate, opening) is on the front side.
The footprint is 2×2 map tiles: the round base fills about 75% of the cell width; the tower is about two and a half times as tall as it is wide.

LEVELS (one per column, the same building growing richer, same footprint and the same overall silhouette so the player recognises it):
Column 1 "Level 1": rough wood planks and logs, straw thatch roof, rope lashings.
Column 2 "Level 2": sturdier wood with iron bands, red clay tile roof.
Column 3 "Level 3": grey cut-stone bricks with mortar lines, red clay tile roof, small stone details.
Column 4 "Level 4": grey stone with polished BRONZE trims and rivets, deep blue tile roof, small blue banners.
Column 5 "Level 5": white marble with GOLD trims and gold finials, deep blue tile roof, blue and gold banners, a few glowing details.
Column 6 "Ruin": the destroyed building: a low pile of broken stone, splintered beams and dust on the same footprint, no roof, nothing standing taller than one third of the level 1 building.

CELLS & BACKGROUND: 6 columns × 1 row, every cell exactly the same size (256×256 px), the building centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell, identical scale in every cell (level 5 may be slightly taller, never wider). Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

Công trình không có hướng (luôn quay mặt về phía người xem) và không cần hoạt ảnh nhiều khung: giàn giáo khi đang xây và hiệu ứng bắn do game tự vẽ.

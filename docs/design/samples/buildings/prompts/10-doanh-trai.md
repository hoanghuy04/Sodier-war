# Doanh trại (Barracks / Army Camp)

Mã công trình: `doanh-trai` · chân đế **5×5 ô** (to) · ô 512×512 px

Doanh trại là **sân tập lộ thiên**: lính đang cất (phím C) sẽ được game vẽ đứng bên trong sân, nên giữa sân phải để **trống, phẳng** (đất nện / sân lát), không có đồ vật che. Đồ trang trí chỉ nằm sát mép.

**Gửi kèm ảnh mẫu:** `../army/sprite-pixels/1.png` (Kiếm sĩ) và sheet Thành trì (`sprite-pixels/thanh-tri.png`) để giữ đúng nét vẽ, góc nhìn và cỡ. Gửi lại dạng **File** PNG.

Lưu thành `sprite-pixels/doanh-trai.png`

```text
Pixel art sprite sheet of a big open-air ARMY CAMP / BARRACKS YARD for a strategy game base (like the Army Camp in Clash of Clans): a large square training ground seen from above, its whole CENTRE is an EMPTY flat area of packed dirt (about 70 % of the footprint) where the game will draw the soldiers standing in rows, so nothing may stand in the middle. Around the edges only: a low fence or wall along all four sides with an open gate in the middle of the front side, two or three tents in the back corners, a weapon rack with spears and shields, a few training dummies, a small campfire, crates and barrels, a flag pole with a royal BLUE banner at the back. Everything that rises above the ground stays close to the border so it never hides the yard.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal and gold. Chunky, readable, toy-like shapes like Clash of Clans buildings drawn as pixel art. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, tent stripes) so it can be recoloured later.

CAMERA: the same top-down 3/4 view as the soldiers and the Town Hall (NOT isometric, NOT a diamond): the camp faces the viewer (gate at the bottom of the picture), we see the ground of the yard from above at about 45°, the back fence and tents are higher in the picture. Its square ground footprint looks like a slightly flattened square, front edge horizontal. The footprint is 5×5 map tiles: it fills about 95 % of the cell width.

LEVELS (one per column, the same camp growing bigger and richer, same footprint; every level clearly more impressive than the previous one):
Column 1 "Level 1": a rough wooden stake fence, one small canvas tent, a straw training dummy, packed dirt yard.
Column 2 "Level 2": a sturdier log palisade with a wooden gate arch, two tents with blue stripes, a weapon rack, a campfire.
Column 3 "Level 3": a low grey stone wall with wooden gate towers, three bigger tents, weapon racks, archery targets, the yard edged with stones.
Column 4 "Level 4": stone walls with polished BRONZE trims and torches, a big command tent with a blue banner, armour stands, training dummies in metal, the yard paved at the edges.
Column 5 "Level 5": a grand camp with stone walls trimmed in GOLD, two gate towers with blue-and-gold banners, a royal command pavilion, golden weapon racks, braziers, the yard paved with light stone tiles, the most impressive version.
Column 6 "Ruin": the destroyed camp: broken fences, torn collapsed tents, scattered weapons and dust on the same footprint, nothing taller than one quarter of the level 1 camp.

CELLS & BACKGROUND: 6 columns × 1 row, every cell exactly the same size (512×512 px), the camp centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell, identical scale in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No grass around it, no ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

Công trình không có hướng. Lính đứng trong sân và giàn giáo khi đang xây do game tự vẽ.

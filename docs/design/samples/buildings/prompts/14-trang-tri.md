# Trang trí căn cứ (Decorations) — 20 món, 4 sheet

Shop trang trí: đồ chỉ để làm đẹp căn cứ (không đánh, không bị phá, không chặn đường lính của mình).
4 sheet, mỗi sheet 5 món xếp **1 hàng × 5 cột**. Mỗi sheet là 1 prompt riêng bên dưới.

**Gửi kèm ảnh mẫu (mỗi lần vẽ):** `../army/sprite-pixels/1.png` (Kiếm sĩ) và sheet Thành trì (`sprite-pixels/thanh-tri.png`) để giữ nét vẽ, góc nhìn và cỡ. Gửi lại dạng **File** PNG.

| Sheet | Lưu thành | Chân đế | Ô | Món (cột 1 → 5) |
|---|---|---|---|---|
| A | `sprite-pixels/trang-tri-a.png` | 1×1 | 192×192 | Đuốc đứng · Cột cờ · Đèn lồng đá · Bụi hoa · Chậu cây cắt tỉa |
| B | `sprite-pixels/trang-tri-b.png` | 1×1 | 192×192 | Thùng gỗ + bao tải · Hình nộm tập kiếm · Giá vũ khí · Lửa trại · Cột đá cổ |
| C | `sprite-pixels/trang-tri-c.png` | 2×2 | 320×320 | Đài phun nước · Tượng anh hùng · Cây anh đào · Cổng vòm hoa · Luống hoa |
| D | `sprite-pixels/trang-tri-d.png` | 2×2 | 320×320 | Tượng rồng đá · Ao cá koi có cầu · Bia chiến công · Đền pha lê · Lều chỉ huy |

Phần STYLE / CAMERA / BACKGROUND giống nhau ở cả 4 prompt (đã chép sẵn vào từng prompt).

---

## Sheet A — đồ nhỏ 1×1 (đèn, cờ, cây)

```text
Pixel art sprite sheet of 5 small DECORATION props for a medieval fantasy base, one prop per column, all the same small size (each stands on ONE map tile):
Column 1 "Standing torch": a tall iron brazier on three legs with a bright pixel flame (solid orange and yellow pixels, no soft glow), a small blue ribbon tied on the pole.
Column 2 "Banner pole": a wooden pole on a little stone base with a long royal BLUE banner with a gold lion emblem, waving to the right, a gold spear tip on top.
Column 3 "Stone lantern": a carved grey stone lantern (Japanese-castle style) with a warm yellow light window, moss on the base.
Column 4 "Flower bush": a round green bush covered with red, pink and yellow flowers, a few petals on the ground under it.
Column 5 "Topiary pot": a terracotta pot with a neatly trimmed round topiary tree on a short trunk, gold band on the pot.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal and gold. Chunky, readable, toy-like shapes like Clash of Clans decorations drawn as pixel art. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, ribbons) so it can be recoloured later.

CAMERA: the same top-down 3/4 view as the soldiers and the Town Hall (NOT isometric, NOT a diamond): the object faces the viewer, we see its front and its top from above at about 45°.

CELLS & BACKGROUND: 5 columns × 1 row, every cell exactly 192×192 px, each prop centred horizontally, its base on the same baseline near the bottom of every cell, identical scale in every cell. The props are small (one map tile): each is about 55 % of the cell width; tall thin props (torch, banner) may be taller but never wider. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

---

## Sheet B — đồ nhỏ 1×1 (doanh trại, sinh hoạt)

```text
Pixel art sprite sheet of 5 small DECORATION props for a medieval fantasy army base, one prop per column, all the same small size (each stands on ONE map tile):
Column 1 "Crates and sacks": two stacked wooden crates with iron corners and a rope, two burlap sacks of grain leaning on them, one sack open with golden grain.
Column 2 "Training dummy": a straw training dummy on a wooden post with a dented iron helmet, a wooden shield nailed to it, a few arrows stuck in the straw.
Column 3 "Weapon rack": a wooden rack holding two swords, a spear and an axe, a round blue shield hanging on the side, metal shining.
Column 4 "Campfire": a ring of stones with crossed logs and a lively pixel flame (solid orange and yellow pixels), a small cooking pot on a tripod above it.
Column 5 "Ancient pillar": a broken white marble column with a carved capital, green ivy climbing it, small cracks and a fallen chunk at its foot.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal and gold. Chunky, readable, toy-like shapes like Clash of Clans decorations drawn as pixel art. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (shields, cloth) so it can be recoloured later.

CAMERA: the same top-down 3/4 view as the soldiers and the Town Hall (NOT isometric, NOT a diamond): the object faces the viewer, we see its front and its top from above at about 45°.

CELLS & BACKGROUND: 5 columns × 1 row, every cell exactly 192×192 px, each prop centred horizontally, its base on the same baseline near the bottom of every cell, identical scale in every cell. The props are small (one map tile): each is about 55 % of the cell width. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

---

## Sheet C — đồ lớn 2×2 (vườn, tượng)

```text
Pixel art sprite sheet of 5 large DECORATION pieces for a royal medieval fantasy base, one piece per column, all on the same 2×2-tile footprint:
Column 1 "Fountain": a round white stone fountain with two tiers, clear blue water falling in solid pixel streams and splashes, gold trim, a small blue-and-gold flag on top.
Column 2 "Hero statue": a heroic knight statue in polished grey stone raising a sword, standing on a tall square plinth with a gold plaque and a laurel wreath, a blue cloth draped on the plinth.
Column 3 "Cherry blossom tree": a lovely tree with a dark curved trunk and a big round crown of pink blossoms, pink petals scattered under it, a small stone bench beside it.
Column 4 "Flower arch": a white wooden garden arch covered with climbing roses (red and pink) and green leaves, a little stone path through it, small lanterns hanging on both sides.
Column 5 "Flower bed": a raised square garden bed with a stone border, rows of colourful flowers (red, yellow, purple, white), a tiny wooden sign with a blue ribbon.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on water, metal and gold. Chunky, readable, toy-like shapes like Clash of Clans decorations drawn as pixel art. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (flags, cloth, ribbons) so it can be recoloured later.

CAMERA: the same top-down 3/4 view as the soldiers and the Town Hall (NOT isometric, NOT a diamond): the piece faces the viewer (front at the bottom of the picture), we see its front and its top from above at about 45°. Its square footprint looks like a slightly flattened square, front edge horizontal. The footprint is 2×2 map tiles.

CELLS & BACKGROUND: 5 columns × 1 row, every cell exactly the same size (320×320 px), each piece centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell, identical scale in every cell (the tree and the statue may be taller, never wider). Each piece fills about 85 % of the cell width. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

---

## Sheet D — đồ lớn 2×2 (công trình trang trí đặc biệt)

```text
Pixel art sprite sheet of 5 large special DECORATION pieces for a powerful medieval fantasy base, one piece per column, all on the same 2×2-tile footprint:
Column 1 "Dragon statue": a fierce dragon statue of dark grey stone with spread wings and open jaws, glowing red gem eyes (solid pixels), coiled on a round stone pedestal with gold runes.
Column 2 "Koi pond": a small round pond with clear blue water, orange-and-white koi fish, lily pads with pink flowers, a tiny red wooden arched bridge over it, stones around the edge.
Column 3 "Victory monument": a tall white stone obelisk with carved crossed swords and a gold crown on top, a blue banner wrapped around it, laurel wreaths at its base.
Column 4 "Crystal shrine": a small round stone shrine with four short pillars and a big floating purple-blue crystal in the middle, small crystal shards around it, magic sparkle pixels (solid, no soft glow).
Column 5 "Command tent": a big blue-and-white striped army tent with gold trim, its front flap open showing a small table with a map, a flag on the top pole, two wooden stakes and ropes.

STYLE (match the attached reference sheets): chibi pixel art for a top-down 3/4 view RPG/RTS, the same palette, outline and shading as the game's soldiers and the Town Hall. Crisp 1-pixel dark navy outline (#1b1726) around every object and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on water, crystal, metal and gold. Chunky, readable, toy-like shapes like Clash of Clans decorations drawn as pixel art. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (banners, tent stripes) so it can be recoloured later.

CAMERA: the same top-down 3/4 view as the soldiers and the Town Hall (NOT isometric, NOT a diamond): the piece faces the viewer (front at the bottom of the picture), we see its front and its top from above at about 45°. Its square footprint looks like a slightly flattened square, front edge horizontal. The footprint is 2×2 map tiles.

CELLS & BACKGROUND: 5 columns × 1 row, every cell exactly the same size (320×320 px), each piece centred horizontally, the bottom of its footprint on the same baseline near the bottom of every cell, identical scale in every cell (the obelisk may be taller, never wider). Each piece fills about 85 % of the cell width. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no grass, no ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

---

## Gợi ý cơ chế shop (để làm sau khi có ảnh)

- Tab **"Trang trí"** trong Cửa hàng → Công trình. Mua bằng tài nguyên / kim cương, giá theo độ "xịn": đồ 1×1 rẻ (vài trăm sắt / vàng), đồ 2×2 đặc biệt (tượng rồng, đền pha lê) tốn kim cương.
- Không có cấp, không máu, không bị phá, lính của mình đi xuyên qua được; số lượng mỗi món giới hạn theo cấp Thành trì.
- Dời / cất lại kho được (cất thì hoàn đồ, không mất).

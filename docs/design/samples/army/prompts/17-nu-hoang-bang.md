# 17. Nữ hoàng Băng (tướng giữ nhà)

Mã quân: `nu-hoang-bang` · ô 160×160 px · tướng giữ nhà, mở ở **Thành trì cấp 8**

Đứng trên Bệ Nữ hoàng. Địch vào vùng canh 13 ô thì ra bắn nỏ băng tầm xa (8 ô), mỗi mũi làm chậm địch 30%. Chiêu **Bão Tuyết**: tàng hình 3 giây, bắn mũi băng xuyên thấu đóng băng 1 hàng địch. Bị hạ thì ngồi hồi máu trên bệ.

**Gửi kèm ảnh mẫu:** `sprite-pixels/1.png` (Kiếm sĩ đã duyệt) để công cụ giữ đúng nét vẽ. Gửi lại dạng **File** PNG.

Lưu thành `sprite-pixels/nu-hoang-bang.png`

```text
Pixel art sprite sheet of an elegant FROST QUEEN who guards the player's castle: a tall graceful young queen with long silver-white hair in a braid, a delicate crown of clear blue ice crystals, a fitted silver-and-blue armoured gown with a white fur shoulder mantle, a long royal BLUE cape with silver snowflake patterns, a sleek ornate CROSSBOW made of silver and glowing blue ice held in the right hand, a quiver of icicle-tipped bolts on her back, small ice shards floating around her left hand.

STYLE (match the attached reference sheet exactly): chibi pixel art for a top-down 3/4 view RPG/RTS, same proportions, outline thickness, palette and shading as the reference swordsman, but this is a HERO, about 1.4 times the height of the reference soldier. Big head (about 40% of the body height), large dark eyes with a white highlight, small mouth. Crisp 1-pixel dark navy outline (#1b1726) around every sprite and between parts. Saturated colours, 4-5 tone shading, light from the top-left, bright specular pixels on metal. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the sprite. Team colour is royal BLUE (cape, tunic, banners) so it can be recoloured later.

LAYOUT: 8 columns × 6 rows. Columns = the 8 directions below (column 1 = direction 1 … column 8 = direction 8). Rows = poses, one pose per cell:
Row 1 "Idle": standing poised, crossbow lowered, cape and hair moving gently, a few snowflake pixels.
Row 2 "Walk": light elegant stride, legs clearly apart, cape flowing.
Row 3 "Attack": aiming and firing the crossbow, a short glowing blue icicle bolt leaving it, frost puff at the muzzle.
Row 4 "Hit": recoiling backwards, impact marks, ice shards cracking.
Row 5 "Skill": "Blizzard": half transparent (semi-invisible with a pale outline), surrounded by a swirl of snowflakes, crossbow glowing bright blue.
Row 6 "Rest": knocked out, kneeling on the ground exhausted, crossbow on the ground beside her (she recovers on her altar).

DIRECTIONS, always in this order: 1 down (facing the viewer), 2 down-right, 3 right, 4 up-right, 5 up, 6 up-left, 7 left, 8 down-left.
- 1 down: full front view.
- 2 down-right / 8 down-left: three-quarter FRONT view.
- 3 right / 7 left: clean side profile.
- 4 up-right / 6 up-left: three-quarter BACK view: we see the back of the head, the back and the cape; the face is NOT visible.
- 5 up: full BACK view, no face at all.
The weapon stays in the RIGHT hand and the off-hand item in the LEFT hand in every direction. Every piece of gear (crown, cape, fur, quiver…) is present in every direction.

CELLS & BACKGROUND: every cell exactly the same size (160×160 px), the character centred, feet on the same baseline in every cell, identical scale and design in every cell. Background: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground shadow, no glow, no halo, no border, no grid lines, no text, no labels, no numbers.
```

Sau khi sheet 8 hướng được duyệt, mình gửi tiếp prompt hoạt ảnh nhiều khung (đứng, đi, đánh, chiêu) giống các tướng hiện có.

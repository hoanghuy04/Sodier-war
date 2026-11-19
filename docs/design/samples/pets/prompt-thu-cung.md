# Thú cưng (10 con) — prompt vẽ sprite

Mỗi con 1 ảnh riêng (dễ vẽ đẹp hơn 1 sheet lớn).

**Ảnh:**
- 1 hàng **4 khung** đi bộ quay mặt sang **phải** (game tự lật khi đi sang trái).
- Mỗi khung 128×128 px, cả ảnh **512×128**, nền **magenta #FF00FF** phẳng.
- Gửi kèm ảnh mẫu `../army/sprite-pixels/1.png` (Kiếm sĩ) để giữ nét vẽ.
- Gửi lại dạng **File** PNG. Tên file theo cột "Mã".

| # | Mã | Tên | Phúc lợi (trong game) |
|---|---|---|---|
| 1 | soi-con | Sói Con | +8% tốc chạy cả đội |
| 2 | meo-than-tai | Mèo Thần Tài | +15% tỉ lệ rơi đồ |
| 3 | gau-truc | Gấu Trúc | +12% máu tướng |
| 4 | rua-da | Rùa Đá | +8% giáp tướng |
| 5 | cao-lua | Cáo Lửa | +6% hút máu tướng |
| 6 | dai-bang | Đại Bàng | +10% sát thương tướng |
| 7 | tho-ngoc | Thỏ Ngọc | +20% kinh nghiệm |
| 8 | lac-da-vang | Lạc Đà Vàng | +10% tài nguyên (mỏ, bãi quái) |
| 9 | phuong-hoang | Phượng Hoàng Con | Tướng hồi 1% máu mỗi giây |
| 10 | rong-con | Rồng Con | +6% sát thương và máu cho cả đội |

## Phần chung (dán sau mỗi prompt riêng)

```text
STYLE: chibi pixel art pet for a top-down 3/4 view RPG/RTS, matching the attached soldier reference: same palette, crisp 1-pixel dark navy outline (#1b1726), saturated colours, 4-5 tone shading, light from the top-left. Small, cute and very readable, about one third the height of a soldier, big head, big shiny eyes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient.

SHEET: one row of 4 frames, each frame 128×128 px (whole image 512×128): a looping walk / trot cycle facing RIGHT (side-ish 3/4 view), the pet centred in each frame, feet on the same baseline about 12 px above the bottom edge, same size in every frame. Flying pets flap their wings and bob up and down instead of walking.

BACKGROUND: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no shadow, no glow, no border, no text, no labels, no grid lines.
```

## Prompt riêng từng con

1. **soi-con** — `A loyal grey wolf pup with fluffy fur, white chest and paws, bright blue eyes, a small red scarf around its neck, tail held high, trotting happily.`
2. **meo-than-tai** — `A chubby golden lucky cat (maneki-neko style) with a red collar and a little gold bell, holding a shiny gold coin, one paw raised, walking on its hind legs proudly.`
3. **gau-truc** — `A round baby panda with black and white fur, rosy cheeks, chewing a green bamboo leaf, waddling slowly and clumsily.`
4. **rua-da** — `A small sturdy turtle whose shell is made of grey stone blocks with green moss and a tiny glowing blue crystal on top, walking slowly with determined eyes.`
5. **cao-lua** — `A slender fox cub with orange-red fur whose tail tip and ear tips are burning with small bright flames, golden eyes, running with a playful smirk.`
6. **dai-bang** — `A young brown and white eagle with golden beak and sharp golden eyes, wearing a tiny leather hood ribbon, flying and flapping its wide wings, fierce look.`
7. **tho-ngoc** — `A white jade rabbit with pale green glowing jade patterns on its fur, long ears, holding a tiny glowing moon-shaped pendant, hopping lightly.`
8. **lac-da-vang** — `A small cute camel with sandy golden fur, a colourful woven saddle blanket and two little sacks of gold coins hanging on its sides, walking steadily, desert merchant style.`
9. **phuong-hoang** — `A baby phoenix chick with red, orange and gold feathers, a small flame crest on its head and a long fiery tail, flying and flapping gently, sparkles of warm light.`
10. **rong-con** — `A baby dragon with emerald green scales, cream belly, small purple wings, tiny horns, flying with little wing flaps and puffing a small cute smoke ring.`

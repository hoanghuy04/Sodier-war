# Thú cưng: 2 hình thái (thường + chiến đấu) — prompt vẽ hoạt ảnh

Mỗi thú cưng có **2 hình thái**, vẽ **2 ảnh riêng**:

| Hình thái | Khi nào | Kích thước trên bản đồ | File |
|---|---|---|---|
| **Thường** (nhỏ, dễ thương) | đi theo tướng lúc bình thường | khoảng 1/3 chiều cao lính | `<mã>.png` |
| **Chiến đấu** (to, hung dữ) | khi tướng vào giao tranh: biến hình, to bằng 1/2 boss | khoảng 1,25 lần chiều cao lính | `<mã>-chien.png` |

**Quy ước chung cho mọi ảnh**
- Quay mặt sang **phải**, game tự lật khi đi sang trái.
- Mỗi hàng **4 khung**, các khung cùng kích thước, chân cùng 1 đường đáy.
- Nền **magenta #FF00FF** phẳng.
- Gửi kèm ảnh mẫu `../army/sprite-pixels/1.png` (Kiếm sĩ) và 1 sheet boss (ví dụ Golem) để giữ nét vẽ và tỉ lệ.
- Gửi lại dạng **File** PNG.

**Ảnh 1 — hình thái Thường** (`<mã>.png`): ô 128×128, 2 hàng × 4 khung = **512×256**
- Hàng 1: đứng yên (thở, vẫy đuôi / chớp mắt).
- Hàng 2: đi / chạy lon ton (con bay thì vỗ cánh, nhấp nhô).

**Ảnh 2 — hình thái Chiến đấu** (`<mã>-chien.png`): ô 256×256, 4 hàng × 4 khung = **1024×1024**
- Hàng 1: **biến hình**. Khung 1 là con nhỏ phát sáng, khung 2–3 lớn dần trong vầng sáng và tia năng lượng, khung 4 là hình thái chiến đấu đầy đủ.
- Hàng 2: đứng thủ thế (hung dữ, sẵn sàng lao vào).
- Hàng 3: đi / chạy (con bay thì vỗ cánh mạnh).
- Hàng 4: tấn công (1 đòn đặc trưng của con đó, xem bảng dưới).

## Phần chung — dán sau mỗi prompt riêng

**Cho ảnh Thường:**
```text
STYLE: chibi pixel art pet for a top-down 3/4 view RPG/RTS, matching the attached soldier reference: same palette, crisp 1-pixel dark navy outline (#1b1726), saturated colours, 4-5 tone shading, light from the top-left. Small and very cute, about one third the height of a soldier, big head, big shiny eyes. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient.
SHEET: 2 rows × 4 frames, every cell exactly 128×128 px (whole image 512×256). Row 1: idle loop (breathing, blinking, tail wag). Row 2: walk / trot loop (flying pets: wing flaps and a gentle bob). Facing RIGHT in a side-ish 3/4 view, centred in each cell, feet on the same baseline about 12 px above the cell bottom, identical size and design in every cell.
BACKGROUND: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. No ground, no shadow, no border, no text, no labels, no grid lines.
```

**Cho ảnh Chiến đấu:**
```text
STYLE: pixel art for a top-down 3/4 view RPG/RTS, matching the attached soldier and boss references: same palette, crisp 1-pixel dark navy outline (#1b1726), saturated colours, 4-5 tone shading, light from the top-left. This is the BATTLE FORM of the same pet: the same creature grown up, fierce and powerful, armour or magic details, about 1.25× the height of the reference soldier (half the size of the reference boss), chunky readable silhouette, still recognisably the same pet (same colours and signature details). Strict pixel grid: NO blur, NO anti-aliasing, NO gradient outside the sprite.
SHEET: 4 rows × 4 frames, every cell exactly 256×256 px (whole image 1024×1024). Row 1: TRANSFORM (frame 1 the small cute pet glowing, frames 2-3 growing inside a burst of light and energy streaks, frame 4 the full battle form). Row 2: battle idle (fierce, ready to pounce). Row 3: run (flying pets: strong wing beats). Row 4: attack (one signature strike, see the pet's prompt). Facing RIGHT in a side-ish 3/4 view, centred in each cell, feet on the same baseline about 20 px above the cell bottom, identical scale in rows 2-4.
BACKGROUND: one flat solid pure magenta #FF00FF everywhere; the sprite edge touches magenta directly. Effects (light, fire, energy) stay inside the cell. No ground, no shadow, no border, no text, no labels, no grid lines.
```

## Prompt riêng từng con

| # | Mã | Thường (nhỏ) | Chiến đấu (to) | Đòn tấn công (hàng 4) |
|---|---|---|---|---|
| 1 | soi-con | `A loyal grey wolf pup with fluffy fur, white chest and paws, bright blue eyes, a small red scarf.` | `A huge battle dire wolf with thick grey fur, glowing blue eyes, steel shoulder guards and a torn red war scarf, bared fangs.` | `a leaping bite with blue claw-slash streaks` |
| 2 | meo-than-tai | `A chubby golden lucky cat (maneki-neko style) with a red collar and a little gold bell, holding a shiny gold coin.` | `A giant golden guardian cat standing on its hind legs, golden armour plates, a huge gold coin shield on one arm, glowing coin charms.` | `throws a spinning giant gold coin that bursts into coins` |
| 3 | gau-truc | `A round baby panda with rosy cheeks, chewing a green bamboo leaf.` | `A massive kung-fu war panda with a straw hat, wrapped wrists and a thick bamboo staff, determined eyes.` | `a heavy bamboo staff smash with green leaves flying` |
| 4 | rua-da | `A small turtle whose shell is made of grey stone blocks with moss and a tiny glowing blue crystal.` | `A colossal stone fortress turtle, its shell a castle of stone blocks with glowing blue crystals and moss, stone spikes on its head.` | `slams its front feet down, a blue crystal shockwave` |
| 5 | cao-lua | `A slender fox cub with orange-red fur whose tail tip and ear tips burn with small flames.` | `A tall fire fox with three blazing tails, flame mane, glowing golden eyes and ember runes along its body.` | `swipes its three burning tails, a wave of fire` |
| 6 | dai-bang | `A young brown and white eagle with golden beak and golden eyes, a tiny leather ribbon.` | `A giant war eagle with gleaming steel-tipped feathers, a golden helmet crest and huge spread wings.` | `dives with talons forward, wind blades` |
| 7 | tho-ngoc | `A white jade rabbit with pale green glowing jade patterns, long ears, a tiny moon pendant.` | `A tall mystic moon rabbit warrior in white and jade robes, glowing jade patterns, holding a crescent-moon blade.` | `a crescent-moon blade slash leaving a silver arc` |
| 8 | lac-da-vang | `A small sandy golden camel with a woven saddle blanket and two little sacks of gold coins.` | `A huge armoured war camel with golden plate barding, desert jewels, gold sacks turned into spiked saddle bags.` | `rears up and kicks, sand and gold dust burst` |
| 9 | phuong-hoang | `A baby phoenix chick with red, orange and gold feathers, a small flame crest and a fiery tail.` | `A majestic adult phoenix with huge burning wings, long flowing fire tail feathers and a golden crest.` | `beats its wings, a blast of phoenix fire feathers` |
| 10 | rong-con | `A baby dragon with emerald green scales, cream belly, small purple wings, tiny horns.` | `A big young emerald dragon with large purple wings, curved horns, spiked tail and glowing green eyes.` | `breathes a cone of green dragon fire` |

**Cách ghép prompt cho mỗi ảnh:** dán dòng "Thường" (hoặc "Chiến đấu" + thêm `Attack row: <đòn tấn công>`), rồi dán Phần chung tương ứng ở trên.

Ví dụ ảnh chiến đấu của Sói Con:
`A huge battle dire wolf with thick grey fur, glowing blue eyes, steel shoulder guards and a torn red war scarf, bared fangs. Attack row: a leaping bite with blue claw-slash streaks.` + phần chung "Chiến đấu".

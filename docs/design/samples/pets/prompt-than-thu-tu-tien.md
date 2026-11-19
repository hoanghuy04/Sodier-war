# Thần thú tu tiên — 12 thú cưng bậc Cam và Đen: prompt vẽ 2 hình thái

Bổ sung 13/11/2026. Ngoài 10 Linh thú (đổi bằng đồ Tím), có thêm 2 bậc theo phong cách **thế giới tu tiên (xianxia)**:

| Bậc | Giá | Số con | Cảm giác |
|---|---|---|---|
| **Thần thú** (viền cam) | 1 món **Cam** đúng ô | 8 | Tứ Linh + linh thú cát tường: uy nghiêm, có hào quang tiên khí |
| **Thượng cổ thần thú** (viền đen-tím) | 1 món **Đen** đúng ô | 4 | Huyền thoại Sơn Hải Kinh: khổng lồ, cổ xưa, áp đảo |

Kích thước ảnh, số khung và thứ tự hàng **giống hệt** file `prompt-thu-cung-2-hinh-thai.md`:
- `<mã>.png`: 512×256 (2 hàng × 4 khung, ô 128). Hàng 1 đứng yên, hàng 2 đi.
- `<mã>-chien.png`: 1024×1024 (4 hàng × 4 khung, ô 256). Hàng 1 biến hình, hàng 2 thủ thế, hàng 3 chạy, hàng 4 đòn đánh.

Dùng lại phần **STYLE / SHEET / BACKGROUND** chung của file đó, rồi thêm đoạn tu tiên dưới đây.

## Đoạn thêm cho mọi thần thú (dán sau phần chung)

```text
THEME: Chinese xianxia cultivation-world divine beast. Celestial details: flowing cloud scrolls, jade and gold ornaments, glowing spirit runes, faint qi aura drawn as crisp pixel streaks (no soft blur). It must look clearly more noble and powerful than an ordinary pet, and must NOT resemble any other beast in this set (unique silhouette, unique main colour).
```

**Thêm riêng cho bậc Đen (Thượng cổ):**
```text
ANCIENT TIER: primordial mythical beast from the Classic of Mountains and Seas. Battle form fills more of the cell (about 1.5x the soldier's height, still inside the 256 cell), ancient weathered textures, a dark violet-and-gold aura with tiny star sparks, overwhelming presence.
```

## Prompt riêng từng con

Mỗi con có **màu chủ đạo và hình dáng riêng**, không trùng với nhau và không trùng 10 Linh thú cũ (Rồng Con xanh lục có cánh, Phượng Hoàng Con đỏ cam, Cáo Lửa cam, Rùa Đá xám).

### Bậc Cam — Thần thú

| # | Mã | Thường (nhỏ) | Chiến đấu (to) | Đòn tấn công (hàng 4) |
|---|---|---|---|---|
| 1 | thanh-long | `A tiny azure Eastern dragon (Qinglong), long serpentine body with NO wings, sky-blue scales, white flowing whiskers and mane, small antler horns, a pearl held in one claw, riding a little cloud.` | `The Azure Dragon of the East: a long coiling serpentine azure dragon with no wings, glowing sapphire scales, flowing white mane and whiskers, golden antlers, gripping a shining dragon pearl, wrapped in storm clouds and blue lightning.` | `breathes a cone of blue water and lightning` |
| 2 | bach-ho | `A chubby white tiger cub (Baihu) with black stripes, icy blue eyes and a tiny golden 王 mark on the forehead.` | `The White Tiger of the West: a huge muscular white tiger with black stripes, silver-white metal armour plates, icy blue eyes, the golden 王 mark glowing on its forehead, metal-qi blades floating around it.` | `a pouncing claw strike with silver crescent blade trails` |
| 3 | chu-tuoc | `A small vermilion bird chick (Zhuque) with crimson and black-red feathers, three long ribbon tail plumes and a little flame crown.` | `The Vermilion Bird of the South: an elegant crimson-red sacred bird (darker and more red than a phoenix, NO gold), three very long ribbon tail plumes, wings edged with black-red flames, a burning crown crest.` | `flaps its wings, raining burning crimson feathers` |
| 4 | huyen-vu | `A small black-green turtle (Xuanwu) with a dark jade shell carved with a bagua pattern, a little black snake coiled around its shell.` | `The Black Tortoise of the North: a giant dark-jade armoured turtle with a bagua-patterned shell, a large black serpent coiled around it with its head rising over the shell, cold water mist and ice runes.` | `the serpent strikes forward while the turtle slams down a ring of dark water` |
| 5 | cuu-vi-ho | `A tiny snow-white fox cub with nine fluffy tails tipped with pink-violet ghost fire, a red mark between its eyes.` | `The Nine-Tailed Fox: a graceful tall white fox with nine huge fanning tails burning with pink-violet foxfire, a crimson forehead mark, golden charm bells, seductive glowing eyes.` | `fans its nine tails, firing a spread of pink-violet foxfire orbs` |
| 6 | ty-huu | `A round golden Pixiu cub (lion-dragon) with one small horn, folded little wings, a big happy mouth and a few gold ingots around it.` | `The Pixiu treasure beast: a big golden-bronze lion-dragon with one horn, small wings, curled jade-green mane, a wide mouth swallowing gold coins, gold ingots and coins orbiting it.` | `stomps and opens its mouth, a vortex of gold coins` |
| 7 | tien-hac | `A small red-crowned crane chick, white feathers with black wing tips and neck, a red crown, a tiny jade ribbon.` | `The Immortal Crane: a tall elegant red-crowned crane, pure white feathers with black wing tips, a vivid red crown, long legs, riding wisps of cloud, a jade talisman ribbon on its neck.` | `spreads its wings and shoots a fan of glowing white feather darts` |
| 8 | ky-lan | `A small Qilin foal: deer-like body with turquoise and gold dragon scales, a single soft horn, curly cloud mane, little hooves wreathed in flame.` | `The Qilin: a noble Chinese unicorn with a deer body covered in turquoise and gold dragon scales, an ox tail, a single golden horn, a curling cloud mane, hooves burning with holy fire.` | `rears up and stamps, a ring of golden holy flames` |

### Bậc Đen — Thượng cổ thần thú

| # | Mã | Thường (nhỏ) | Chiến đấu (to) | Đòn tấn công (hàng 4) |
|---|---|---|---|---|
| 9 | con-bang | `A small cute Kun fish-bird: a round deep-ocean-blue fish body with tiny feathered wing fins, star-speckled skin, a swirling water tail.` | `The Kun-Peng: a colossal ancient creature half whale half roc, a deep indigo whale body with starry patterns morphing into gigantic dark feathered wings, ocean water and storm wind swirling around it, ancient gold runes on its back.` | `beats its colossal wings, a cone of hurricane wind and seawater` |
| 10 | ung-long | `A small golden-yellow dragon (Yinglong) with big feathered bird-like wings, amber eyes and tiny thunder sparks.` | `The Yinglong: an ancient winged dragon with golden-amber scales, huge feathered eagle-like wings, a thunder halo behind its head, crackling purple-gold lightning along its body, ancient and majestic.` | `dives down and slams the ground with a purple-gold thunderbolt shockwave` |
| 11 | bach-trach | `A small white Baize: a goat-like holy beast with a lion face, soft white fur, many tiny wise eyes on its flanks, small curved horns and a scroll in its mouth.` | `The Baize: a large white sage beast with a lion head and goat horns, a long white beard, several wise golden eyes along its body, ancient scrolls and floating glowing talismans circling it, calm holy light.` | `the floating talismans burst into a circle of holy white-gold light` |
| 12 | thao-thiet | `A small dark-bronze Taotie: a fat horned creature with a huge mouth full of teeth and the classic bronze-vessel taotie face pattern, cute but greedy.` | `The Taotie: a massive primordial devourer with a dark bronze body etched with taotie bronze patterns, ram horns, a gigantic gaping maw with rows of teeth, a dark violet hunger vortex in its mouth, glowing red eyes.` | `opens its giant maw, a dark violet devouring vortex sucks enemies in` |

## Cách ghép

Ảnh thường: dòng "Thường" + phần chung "Thường" + đoạn THEME (+ ANCIENT TIER nếu bậc Đen).

Ảnh chiến đấu: dòng "Chiến đấu" + `Attack row: <đòn tấn công>.` + phần chung "Chiến đấu" + đoạn THEME (+ ANCIENT TIER nếu bậc Đen).

Ví dụ Côn Bằng, ảnh chiến đấu:
`The Kun-Peng: a colossal ancient creature half whale half roc, ... Attack row: beats its colossal wings, a cone of hurricane wind and seawater.` + phần chung "Chiến đấu" + THEME + ANCIENT TIER.

Gửi file PNG về, mình nhập bằng `tools/spriteimport/pet.mjs <png> <mã> 128 2` (thường) và `<mã>-chien 256 4` (chiến đấu). Khi chưa có ảnh, game hiện emoji tạm.

## Chỉ số (đã có trong `shared/balance.js` → `PETS`)

| Mã | Tên | Phúc lợi cả đội | Lối đánh | Ô đổi |
|---|---|---|---|---|
| thanh-long | Thanh Long | +7% sát thương, +6% tốc chạy | bay, phun hình nón | Vũ khí Cam |
| bach-ho | Bạch Hổ | +8% tốc đánh, +4% sát thương | lao tới đánh choáng | Găng tay Cam |
| chu-tuoc | Chu Tước | hồi 0,8% máu/giây, +4% máu | bay, nổ vùng rộng tầm 5,5 | Bùa Cam |
| huyen-vu | Huyền Vũ | +7% giáp, +5% máu | đỡ 4 địch, làm chậm | Giáp Cam |
| cuu-vi-ho | Cửu Vĩ Hồ | +6% né đòn, +3% hút máu | phép xuyên, làm chậm, tự né 25% | Giày Cam |
| ty-huu | Tỳ Hưu | +25% rơi đồ, +15% tài nguyên | dậm đất choáng vùng | Nhẫn Cam |
| tien-hac | Tiên Hạc | +30% kinh nghiệm, +4% tốc chạy | bay, bắn tầm 6 | Mũ Cam |
| ky-lan | Kỳ Lân | +4% sát thương, +4% máu, +3% giáp | lao tới + dậm lửa | Khiên Cam |
| con-bang | Côn Bằng | +12% tốc chạy, +8% sát thương, +5% tốc đánh | bay, cuồng phong hình nón | Giày Đen |
| ung-long | Ứng Long | +12% sát thương, +4% hút máu | bay, lao xuống + sấm dậm, hút máu 15% | Vũ khí Đen |
| bach-trach | Bạch Trạch | +40% kinh nghiệm, +30% rơi đồ, +20% tài nguyên, hồi 0,4% máu/giây | phép thánh nổ vùng tầm 6, làm chậm | Bùa Đen |
| thao-thiet | Thao Thiết | +10% máu, +5% hút máu, +4% giáp | đỡ 5 địch, dậm, hút máu 30% | Giáp Đen |

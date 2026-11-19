# Âm thanh Sodier War: danh sách đầy đủ (12/11/2026)

Danh sách mọi âm thanh nên có, nhóm theo hệ thống, kèm thời điểm phát trong game, mô tả, độ dài, số biến thể và độ ưu tiên.

Độ ưu tiên:
- **P1** — cần có ngay (game "sống" hẳn lên).
- **P2** — nên có.
- **P3** — làm sau cho đầy đủ.

Cột "Sự kiện" ghi tên sự kiện server / client đang có (`k:` trong `events`), để gắn âm thanh khỏi phải thêm code server.

---

## 0. Quy ước kỹ thuật

| Mục | Quy ước |
|---|---|
| Định dạng | `.ogg` (Opus/Vorbis) + `.mp3` dự phòng cho iPhone cũ · 44,1 kHz · SFX **mono**, nhạc **stereo** |
| Đặt tên | `client/assets/audio/<nhóm>/<tên>_<số biến thể>.ogg`, ví dụ `sfx/unit/sword_hit_2.ogg`, `music/boss_golem.ogg` |
| Độ to | SFX chuẩn hoá −14 LUFS (tiếng nhỏ như click −20) · nhạc −18 LUFS · có 3 thanh trượt trong Cài đặt: Nhạc / Hiệu ứng / Giao diện + nút Tắt tiếng |
| Biến thể | tiếng lặp nhiều (chém, bắn, trúng đòn) cần 3–4 bản và lệch cao độ ngẫu nhiên ±5% để không nhàm |
| Không gian | tiếng trong trận nhỏ dần theo khoảng cách tới camera, lệch trái/phải theo vị trí; ngoài màn hình quá 1,5 màn thì không phát (trừ boss / báo động) |
| Chống ồn | mỗi loại tối đa 4–6 tiếng cùng lúc, cùng loại cách nhau ≥ 60 ms. Trận 200 quân chỉ phát "tiếng trận đông người" (mục 3.5) thay vì 200 tiếng chém |
| Phong cách | fantasy trung cổ, chắc và "đã tai" kiểu game chiến thuật mobile (Clash / Rush Royale), hơi retro cho hợp pixel art; không quá thật, không máu me |
| Dung lượng | tổng SFX ≤ 8 MB, mỗi bản nhạc ≤ 2 MB (loop 60–120 s); tải nhạc theo nhu cầu |
| Điện thoại | âm thanh chỉ bật sau lần chạm đầu tiên (quy định của trình duyệt) |

## 0b. Nguyên tắc "không chói, không rối" (12/11/2026)

Mục tiêu: nghe rõ từng tiếng quan trọng, không bị một mớ âm thanh chồng lên nhau.

1. **Âm thanh phải đơn giản.** Mỗi file chỉ 1 ý, ngắn (đa số 0,2–0,8 s), đầu tiếng rõ, đuôi tắt nhanh. Không reverb dài, không tiếng rít cao chói. Cắt bớt tần số rất cao (> 10 kHz) và rất trầm (< 60 Hz) cho SFX nhỏ.
2. **Tối đa 8 tiếng SFX cùng lúc trên toàn game.** Tiếng mới sẽ thay tiếng cũ ít quan trọng hơn. Lính bình thường tối đa 3 tiếng cùng lúc, còn lại gộp vào "tiếng trận đông" (mục 3.5).
3. **Thứ tự ưu tiên khi đông.** Tiếng ưu tiên cao luôn được phát, tiếng thấp bị bỏ:
   | Mức | Loại tiếng |
   |---|---|
   | 1 (cao nhất) | cảnh báo boss, báo động căn cứ, đồ Đỏ/Đen rơi, tướng mình chết |
   | 2 | kỹ năng boss, kỹ năng tướng, tháp và bẫy nhà mình |
   | 3 | tướng mình đánh, chiếm mỏ, nâng cấp xong, rèn |
   | 4 | lính mình đánh / chết |
   | 5 (thấp nhất) | lính người khác, quái thường, bước chân, môi trường |
4. **Tự hạ nhạc (ducking).** Khi có tiếng mức 1–2, nhạc nền và tiếng trận tự nhỏ đi ~40% trong 1–2 giây rồi lên lại, nên tiếng quan trọng luôn nghe rõ.
5. **Giãn cách.** Cùng một loại tiếng cách nhau tối thiểu 80 ms. Tiếng lặp nhiều (chém, tên trúng) tối đa 6 lần/giây cho cả màn hình.
6. **Gần to, xa nhỏ.** Tiếng của mình và gần camera to nhất. Người khác / quái nhỏ hơn 30%. Ngoài màn hình không phát (trừ cảnh báo).
7. **Độ to cố định từng nhóm** (so với tiếng to nhất = 100%):
   | Nhóm | Độ to |
   |---|---|
   | Cảnh báo, boss | 100% |
   | Kỹ năng | 85% |
   | Tháp / bẫy | 80% |
   | Tướng | 75% |
   | Lính | 50% |
   | Bước chân | 30% |
   | Môi trường | 20% |
   | Click giao diện | 40% |
   | Nhạc nền | 45% |
8. **Bản gọn để làm trước.** Nếu muốn ít file nữa, mỗi binh chủng chỉ cần 1 tiếng đánh + dùng chung 1 tiếng trúng đòn và 1 tiếng chết. Khi đó P1 còn khoảng 70 file mà vẫn đủ phân biệt.
9. **Tắt dễ dàng.** Cài đặt có Tắt tiếng + 3 thanh trượt (Nhạc / Hiệu ứng / Giao diện), mặc định Hiệu ứng 70%, Nhạc 40%.

---

## 1. Nhạc nền (music, loop)

| ID | Tên | Khi nào | Mô tả | Dài | Ưu tiên |
|---|---|---|---|---|---|
| music/menu | Trang chủ | màn hình đăng nhập / chọn chế độ | hành khúc fantasy hào hùng, kèn đồng + trống, mở đầu chiến dịch | 90 s loop | P1 |
| music/world_calm | Thế giới mở: yên bình | đi lại, không giao chiến | nhẹ, đàn dây + sáo, phiêu lưu | 120 s loop | P1 |
| music/battle | Giao chiến | `me.combat = true` | nhịp nhanh, trống trận, dây gấp; chuyển mượt (fade 1,5 s) từ world_calm | 90 s loop | P1 |
| music/base | Căn cứ | tướng ở trong vùng căn cứ, không đánh | ấm cúng, tiếng búa xa, đàn luýt | 90 s loop | P2 |
| music/boss_golem | Boss Golem Kim Cương | đánh boss (trong 12 ô quanh boss) | nặng, đá và pha lê, trống trầm, đàn ống | 90 s loop | P1 |
| music/boss_tar | Boss Chúa Tể Hắc Ín | như trên | tối, sền sệt, kèn trầm méo, nhịp chậm đe doạ | 90 s loop | P2 |
| music/boss_crystal | Boss Nữ Hoàng Pha Lê | như trên | huyền bí, chuông pha lê, hợp xướng nữ | 90 s loop | P2 |
| music/boss_bandit | Boss Vua Thổ Phỉ | như trên | hoang dã, trống bộ lạc, guitar Tây Ban Nha nhanh | 90 s loop | P2 |
| music/boss_scorpion | Boss Bọ Cạp Sa Mạc | như trên | sa mạc, thang âm Trung Đông, trống tay | 90 s loop | P2 |
| music/enrage | Boss cuồng nộ | boss dưới 30% máu (`CUỒNG NỘ!`) | đoạn chuyển nhanh hơn 15%, thêm hợp xướng | 30 s loop | P3 |
| music/raid | Căn cứ bị tấn công | nhận cảnh báo "đang đánh căn cứ của bạn" | báo động, trống gấp, kèn hiệu | 60 s loop | P2 |
| music/victory | Thắng ván (chế độ phòng) | kết quả ván: thắng | fanfare 8 giây rồi lặng | 8 s | P2 |
| music/defeat | Thua ván / tướng chết | kết quả ván: thua, màn hình hồi sinh | buồn, chậm | 6 s | P2 |
| music/king | Cung điện Nhà vua phía Bắc | đứng gần cung điện | trang nghiêm, đàn organ + kèn | 60 s loop | P3 |

## 2. Không khí (ambient loop, phát nhỏ theo vùng)

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| amb/meadow | biome Đồng cỏ / Thảo nguyên | gió nhẹ, chim hót, côn trùng | P2 |
| amb/forest | Rừng lá rộng / Rừng thông | lá xào xạc, chim gõ kiến, cành gãy | P2 |
| amb/tundra | Đồng tuyết | gió rít lạnh, tuyết lạo xạo | P3 |
| amb/desert | Sa mạc / Hoang mạc đá đỏ | gió cát, rắn chuông xa | P3 |
| amb/swamp | Đầm lầy | ếch kêu, bong bóng bùn | P3 |
| amb/ash | Vùng tro cháy | lửa tí tách, gió nóng | P3 |
| amb/core | Cao nguyên cổ | gió vang, tiếng ngân đá cổ | P3 |
| amb/base | trong căn cứ | búa gõ xa, lửa rèn, người nói lao xao | P2 |
| amb/mine | đứng gần mỏ của mình | cuốc chim, xe goòng | P3 |
| amb/fountain · amb/campfire | gần đồ trang trí Đài phun nước / Lửa trại / Đuốc | nước chảy · lửa tí tách | P3 |

---

## 3. Chiến đấu: lính (sự kiện `dmg`, `proj`, `die`, `rout`)

### 3.1 Đòn đánh và trúng đòn theo binh chủng

| ID | Binh chủng | Âm thanh | Biến thể | Ưu tiên |
|---|---|---|---|---|
| unit/militia_hit | Dân quân | gậy / chĩa gỗ đập | 3 | P2 |
| unit/sword_swing · unit/sword_hit | Kiếm sĩ | vung kiếm vút · kiếm chém trúng giáp | 3 + 4 | P1 |
| unit/spear_thrust | Lính giáo | đâm giáo "xoẹt" + tiếng gỗ | 3 | P2 |
| unit/bow_release · unit/arrow_fly · unit/arrow_hit | Cung thủ, Tháp cung, Cung phỉ, Goblin cung | dây cung bật · tên rít · tên cắm (thịt / gỗ / giáp) | 3 + 2 + 4 | P1 |
| unit/cav_charge · unit/cav_hit | Kỵ binh | vó ngựa phi + ngựa hí khi lao vào · giáo đâm mạnh | 2 + 3 | P1 |
| unit/knight_hit · unit/knight_step | Hiệp sĩ | khiên búa nặng nề "coong" · bước giáp sắt | 3 + 2 | P2 |
| unit/mage_cast · unit/orb_fly · unit/orb_hit | Pháp sư, Tháp phép, Tinh linh pha lê | niệm phép ngân · cầu năng lượng vù · nổ phép lách tách | 2 + 1 + 3 | P1 |
| unit/catapult_fire · unit/fireball_fly · unit/fireball_hit | Máy bắn đá lửa, Pháo đá | cần gạt bật "phựt" · cầu lửa bay · nổ lửa lớn | 2 + 1 + 3 | P1 |
| unit/fire_burn | vùng lửa (sự kiện `fire`) | lửa cháy liếm, loop ngắn | 1 loop | P2 |
| unit/griffin_screech · unit/griffin_hit | Sư thứu | tiếng kêu đại bàng-sư tử · vỗ cánh + móng vuốt | 2 + 3 | P2 |
| unit/dragon_roar · unit/dragon_breath | Rồng (lính) | gầm ngắn · thở lửa (sự kiện `breath`) | 2 + 2 | P1 |
| unit/building_hit | lính đánh công trình | đập gỗ / đá vụn | 4 | P2 |

### 3.2 Trúng đòn chung

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| hit/crit | `dmg` có `c:1` (khắc chế, chí mạng) | trúng mạnh + "ting" kim loại cao | P1 |
| hit/dodge | chữ "Né!" (sự kiện `txt` "Né!") | vút gió hụt | P2 |
| hit/lifesteal | tướng hút máu (máu hồi khi đánh) | "suỵt" hút nhẹ, nhỏ, cách nhau ≥ 1 s | P3 |
| hit/shield_block | Thạch Lâm đang bật Tường khiên mà bị đánh | đòn dội vào khiên | P3 |
| hit/stun | bị choáng (boss slam) | chuông "boong" choáng váng + chim kêu líu lo | P2 |

### 3.3 Chết và tháo chạy

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| death/human | lính người chết (`die`) | tiếng kêu ngắn kiểu hoạt hình, không máu me | P1 (3 biến thể) |
| death/horse | Kỵ binh / Hiệp sĩ chết | ngựa hí + ngã | P2 |
| death/monster_small | Chuột, Sói, Goblin, Nhện | rít / ăng ẳng | P2 |
| death/monster_big | Gấu, Orc, Troll, Minotaur | gầm tắt dần + đổ ầm | P2 |
| death/flyer | Sư thứu, Wyvern, Rồng | rơi xuống đất "uỵch" | P2 |
| death/machine | Máy bắn đá vỡ | gỗ gãy + sắt rơi | P2 |
| unit/rout | quân tháo chạy (`rout`) | tiếng la hoảng loạn + chân chạy | P3 |

### 3.4 Lệnh điều quân

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| cmd/move | ra lệnh di chuyển (chuột phải / joystick) | "Rõ!" ngắn hoặc tiếng trống 1 nhịp | P2 |
| cmd/attack | ra lệnh tấn công mục tiêu / chiếm mỏ | kèn hiệu tấn công ngắn | P1 |
| cmd/regroup | Tập hợp (T) | trống tập hợp 2 nhịp | P2 |
| cmd/pullback | Rút quân (R) | kèn rút quân | P2 |
| cmd/stow · cmd/unstow | Cất binh 40% / Cất tất cả / Xuất binh (C) | tiếng cổng gỗ đóng · cổng mở + bước quân | P2 |
| cmd/summon | quân xuất hiện quanh tướng (`summon`) | ánh sáng "vụt" + tiếng quân hô | P1 |
| cmd/recall | Về thành (V) | phép dịch chuyển ngân dài 2 s | P1 |
| cmd/buy_unit | mua lính xong | tiếng hô nhập ngũ / tiếng bước chân | P1 |

### 3.4b Di chuyển (bổ sung theo yêu cầu 12/11/2026)

Tiếng bước chân đổi theo mặt đất: cỏ / đất, đá / đường, cát, tuyết, bùn đầm lầy. Mỗi loại 3–4 biến thể.

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| move/hero_walk_<đất> | tướng đi bộ **một mình** (không có quân theo, hoặc quân đã cất) | bước chân 1 người, áo giáp nhẹ lách cách, nhịp theo tốc độ chạy | P1 |
| move/hero_horse_<đất> | tướng cưỡi ngựa một mình (Phong Vũ, hoặc tướng có thú cưỡi) | vó ngựa phi 4 nhịp "lộc cộc", ngựa thở phì phò | P1 |
| move/march_small | hành quân 5–30 lính | nhiều bước chân đều nhịp + giáp leng keng, loop | P1 |
| move/march_big | hành quân > 30 lính | đoàn quân rầm rập, đất rung nhẹ, trống hành quân xa, loop; to/nhỏ theo số quân | P1 |
| move/cavalry_group | đoàn có nhiều Kỵ binh / Hiệp sĩ | vó ngựa dồn dập nhiều con | P2 |
| move/siege_roll | đoàn có Máy bắn đá | bánh gỗ lăn cót két | P2 |
| move/flyers | đoàn có Sư thứu / Rồng | vỗ cánh phành phạch, loop | P2 |
| move/speed_boost | Phong Vũ bật Thần tốc / tốc chạy tăng mạnh | gió lùa "vù" khi tăng tốc | P2 |
| move/stop | cả đội dừng lại | bước cuối "khựng" + giáp va nhẹ | P3 |

Quy tắc phát: chỉ 1 loop di chuyển cho cả đội của mình (chọn theo số quân và binh chủng đông nhất), nhỏ dần khi camera ở xa. Quân người khác chỉ phát `march` khi đi vào màn hình.

### 3.5 Tiếng trận đông (thay cho hàng trăm tiếng lẻ)

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| battle/clash_small | 5–30 quân đang giao chiến trong màn hình | tiếng va chạm lẻ tẻ, loop | P1 |
| battle/clash_big | > 30 quân | biển tiếng kiếm khiên + hò hét xa, loop; to/nhỏ theo số quân | P1 |

---

## 4. Tướng (5 nhân vật chính)

| ID | Tướng | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|---|
| hero/select | tất cả | chọn / đổi tướng | câu thoại ngắn của tướng (vd Thạch Lâm "Khiên vững thì quân vững!") | P2 |
| hero/attack | tất cả | tướng đánh thường | như binh chủng của tướng nhưng to và rõ hơn | P1 |
| hero/hurt | tất cả | tướng mất > 10% máu trong 1 đòn | rên ngắn | P2 |
| hero/death | tất cả | tướng chết | tiếng ngã + chuông buồn | P1 |
| hero/respawn | tất cả | hồi sinh | ánh sáng thánh + kèn ngắn | P1 |
| hero/levelup | tất cả | lên cấp (`levelup`) | fanfare lên cấp lấp lánh | P1 |
| skill/thach_lam | Thạch Lâm · Tường khiên | bật kỹ năng | hàng khiên dựng "rầm rầm" + tiếng hô "Giữ vững!" | P1 |
| skill/kim_ha | Kim Hạ · Đào thần tốc | bật kỹ năng | cuốc chim gõ dồn dập + tiếng vàng rơi leng keng | P1 |
| skill/phong_vu | Phong Vũ · Thần tốc | bật kỹ năng | ngựa hí + gió lốc + vó ngựa tăng tốc | P1 |
| skill/lam_nguyet_cast · skill/lam_nguyet_hit | Lam Nguyệt · Mưa sao băng | chọn điểm · sao băng rơi | ngân phép · loạt sao băng rơi rít rồi nổ | P1 |
| skill/hoa_ky | Hoả Kỳ · Long hống | bật kỹ năng | rồng gầm vang + sóng âm | P1 |
| skill/ready | tất cả | kỹ năng hồi xong | "ting" nhỏ | P2 |

---

## 5. BOSS (sự kiện `bskill`, `warn`, `boom` có `kind`)

Mỗi boss cần đủ bộ: **xuất hiện**, **gầm khi phát hiện địch**, **đánh thường**, **niệm / gồng kỹ năng**, **kỹ năng nổ**, **bị đánh**, **cuồng nộ**, **chết**.

### 5.1 Golem Kim Cương (boss giữa map, kỹ năng **slam**: dậm đất, choáng 1 s, vùng 4,5 ô)

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| boss/golem/spawn | boss hồi sinh | đá lăn ầm ầm, pha lê ngân | P2 |
| boss/golem/aggro | lần đầu có địch vào vùng | gầm đá trầm vang, rung | P1 |
| boss/golem/attack | đánh thường | nắm đấm đá đập "uỳnh" | P1 |
| boss/golem/slam_windup | `bskill` slam (0,5 s trước khi nổ) | đá kêu răng rắc, rút sức | P1 |
| boss/golem/slam_impact | `boom` kind `slam` | dậm đất cực mạnh, nứt đất, pha lê vỡ vụn, bass sâu | P1 |
| boss/golem/hurt | bị đánh (≤ 1 lần/giây) | đá mẻ, vụn rơi | P2 |
| boss/golem/death | chết | sụp đổ thành đống đá, pha lê rơi lanh canh | P1 |

### 5.2 Chúa Tể Hắc Ín (kỹ năng **tar**: phun 5 vũng hắc ín cháy theo hình quạt)

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| boss/tar/aggro | phát hiện địch | tiếng cười trầm ục ục như bùn sôi | P1 |
| boss/tar/attack | đánh thường | quất xúc tu hắc ín "chẹp" | P1 |
| boss/tar/spew | `bskill` tar | ọc phun hắc ín, nhớt dính | P1 |
| boss/tar/ignite | vũng hắc ín bốc cháy | "phừng" bắt lửa + cháy sền sệt | P1 |
| boss/tar/hurt · death | bị đánh · chết | bùn bắn · tan chảy thành vũng, sôi rồi tắt | P2 / P1 |

### 5.3 Nữ Hoàng Pha Lê (đánh xa bằng cầu, kỹ năng **storm**: 7 vòng cảnh báo rồi pha lê rơi)

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| boss/crystal/aggro | phát hiện địch | giọng nữ vang vọng, tiếng cười ngân | P1 |
| boss/crystal/attack | bắn cầu pha lê | ngân cao "vút" + vỡ lanh lảnh | P1 |
| boss/crystal/storm_warn | `warn` (vòng đỏ hiện 0,9 s) | chuông pha lê đếm ngược tăng dần, rất rõ để người chơi né | P1 |
| boss/crystal/storm_hit | `boom` kind `star` (7 lần) | pha lê đâm xuống vỡ tung, lệch thời gian nhẹ | P1 |
| boss/crystal/hurt · death | bị đánh · chết | nứt kính · vỡ tan thành bụi sáng + tiếng thở dài | P2 / P1 |

### 5.4 Vua Thổ Phỉ (kỹ năng **whirl**: xoay kiếm, đẩy lùi, vùng 3,8 ô)

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| boss/bandit/aggro | phát hiện địch | hét "Cướp hết cho ta!" + cười khả ố | P1 |
| boss/bandit/attack | đánh thường | đao lớn chém nặng | P1 |
| boss/bandit/whirl | `bskill` + `boom` kind `whirl` | lốc xoáy kim loại vù vù 0,6 s + đẩy văng | P1 |
| boss/bandit/hurt · death | bị đánh · chết | gầm gừ · ngã + túi vàng rơi leng keng | P2 / P1 |

### 5.5 Bọ Cạp Sa Mạc (kỹ năng **burrow**: chui xuống cát 1 s rồi trồi lên dưới chân địch đông nhất)

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| boss/scorpion/aggro | phát hiện địch | rít lách cách, càng kẹp | P1 |
| boss/scorpion/attack | đánh thường | kẹp càng "cắc" + chích đuôi | P1 |
| boss/scorpion/burrow_down | `bskill` burrow | đào cát rào rào, biến mất | P1 |
| boss/scorpion/rumble | `warn` vòng 2,5 ô (1 s) | đất rung ì ầm dưới chân, to dần | P1 |
| boss/scorpion/burrow_up | `boom` kind `burrow` | trồi lên phá đất + cát bắn + rít | P1 |
| boss/scorpion/hurt · death | bị đánh · chết | vỏ giáp nứt · lật ngửa, chân co giật | P2 / P1 |

### 5.6 Chung cho mọi boss

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| boss/enrage | boss < 30% máu, chữ `CUỒNG NỘ!` | gầm thét dài + nhịp tim dồn | P1 |
| boss/warn_generic | mọi vòng cảnh báo `warn` | "bíp" cảnh báo ngắn trầm | P1 |
| boss/kill_fanfare | hạ boss (loot rơi) | fanfare chiến thắng 3 s | P1 |
| boss/respawn_global | thông báo boss hồi sinh toàn server | tiếng tù và xa | P3 |

---

## 6. Quái bãi farm và lính canh mỏ

| ID | Quái | Âm thanh (tấn công / phát hiện / chết) | Ưu tiên |
|---|---|---|---|
| mob/rat | Chuột khổng lồ | chít chít · gặm | P3 |
| mob/wolf | Sói xám | gầm gừ · tru dài khi cả bầy bị khiêu khích | P2 |
| mob/goblin | Goblin, Goblin cung | cười khúc khích the thé, la "Ki ki!" | P2 |
| mob/spider | Nhện độc | rít + chân lạch cạch, phun độc (làm chậm) | P2 |
| mob/bear | Gấu nâu | gầm to, vả | P2 |
| mob/orc | Orc chiến binh | hô chiến "WAAGH" kiểu hoạt hình | P2 |
| mob/troll · mob/stomp | Troll đá, Minotaur | gầm trầm · dậm đất (`stomp`) | P2 |
| mob/minotaur | Minotaur | rống bò, húc | P2 |
| mob/wyvern | Wyvern | rít chói + thở lửa | P2 |
| mob/ancient_dragon | Rồng cổ đại (bãi cấp 10) | gầm vang trời, thở lửa lớn, mini-boss | P1 |
| mob/camp_aggro | cả bãi bị khiêu khích | trống / tiếng hú tập hợp | P2 |
| mob/camp_clear | dọn sạch bãi, nhận tài nguyên | "ting ting" + túi rơi | P1 |
| guard/bandit | Thổ phỉ, Cung phỉ, Kiếm sĩ đen (lính canh mỏ) | hô "Đứng lại!" | P3 |
| guard/tar_beast | Thú hắc ín | ọc ọc | P3 |
| guard/crystal_spirit | Tinh linh pha lê | ngân trong | P3 |
| guard/golem | Golem kim cương nhỏ | đá lăn, dậm | P3 |

---

## 7. Căn cứ (Thành trì và công trình)

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| base/place | đặt công trình / tường / bẫy | gỗ đặt "cộp" + bụi | P1 |
| base/place_invalid | chỗ không đặt được | "bụp" trầm + rung nhẹ | P1 |
| base/build_loop | đang xây (thợ xây làm việc) | búa gõ, cưa, loop nhỏ | P2 |
| base/build_done | xây xong ("đã xây xong") | tiếng búa cuối + "ting" hoàn thành | P1 |
| base/upgrade_start | bắt đầu nâng cấp | cuộn giấy + búa | P2 |
| base/upgrade_done | nâng cấp xong ("đã lên cấp N") | fanfare ngắn + lấp lánh | P1 |
| base/th_upgrade | Thành trì lên cấp | fanfare LỚN, chuông + kèn đồng + đám đông hò reo | P1 |
| base/repair | sửa / sửa tất cả | búa gõ nhanh 3 nhịp + tiền | P2 |
| base/demolish | phá bỏ / cất công trình | gỗ đổ, "rắc" | P2 |
| base/move | dời công trình (nhấp đúp) | nhấc lên "vút" · đặt xuống "cộp" | P2 |
| base/move_base | chuyển nhà (1 lần/ngày) | phép dịch chuyển lớn + xe ngựa | P3 |
| base/collapse | công trình bị phá huỷ | sụp đổ, đá rơi, khói | P1 |
| base/th_destroyed | Thành trì bị phá | sụp đổ lớn + chuông báo buồn | P1 |
| base/alarm | căn cứ bị tấn công ("đang đánh căn cứ của bạn") | tù và báo động 2 hồi | P1 |
| base/garrison_out | lính giữ nhà xông ra | cổng mở + hô xung trận | P2 |
| base/repelled | đẩy lùi địch (nhật ký phòng thủ) | kèn chiến thắng nhỏ | P2 |
| base/raid_loot | cướp được tài nguyên khi phá Thành trì | tiền tuôn ào ào | P1 |
**Công trình thủ nhà** (bổ sung chi tiết 12/11/2026). Tiếng tháp to hơn tiếng lính một chút, vì người chơi cần nghe rõ nhà mình đang bị đánh và tháp đang bắn trả.

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| tower/archer_shot | Tháp cung bắn | dây cung lớn bật "phựt" từ trên cao + tên rít xuống (3 biến thể, khác tiếng cung thủ thường) | P1 |
| tower/archer_hit | tên tháp trúng | tên cắm nặng | P1 |
| tower/cannon_fire | Pháo đá bắn | "ĐÙNG" trầm + khói phụt + rung nhẹ (2 biến thể) | P1 |
| tower/cannon_fly · tower/cannon_hit | đạn pháo bay · rơi trúng | đạn đá rít · nổ đất đá văng vùng | P1 |
| tower/mage_charge | Tháp phép tụ phép (0,3 s trước khi bắn) | ngân điện tăng dần | P2 |
| tower/mage_shot · tower/mage_hit | Tháp phép bắn · trúng | tia phép "zzzap" · nổ phép lách tách | P1 |
| tower/aim | tháp phát hiện địch vào tầm (lần đầu) | cơ khí xoay "kẹt kẹt" / cung căng dây | P3 |
| tower/destroyed | tháp bị phá | tháp đổ sập, gạch rơi | P1 |
| wall/hit · wall/break | tường bị đánh · tường vỡ | gỗ / đá bị đập · đổ rầm | P2 |
| trap/bomb_click · trap/bomb_boom | Bom: địch giẫm lên · nổ | tách kíp "cạch" 0,2 s · nổ "BÙM" lớn + đất bắn | P1 |
| trap/spring | Lò xo bật | "BOING" lò xo + quân bị hất văng kêu "á á" + rơi uỵch | P1 |
| trap/air_hiss · trap/air_boom | Bom khí (bắn quân bay): kích hoạt · nổ trên không | xì hơi phóng lên · nổ "bụp" trên cao + mảnh vụn | P1 |
| trap/rearm | bẫy nạp lại xong (sau 120–150 s) | "cạch" lên cò | P3 |
| trap/reveal | bẫy bị lộ / đã dùng | tiếng gỗ lỏng "lạch cạch" | P3 |
| lab/research_start · lab/research_done | Học viện bắt đầu / xong nghiên cứu lính | lật sách + bút lông · "eureka" lấp lánh + tiếng hô | P2 / P1 |
| lab/cancel | huỷ nghiên cứu | cuộn giấy gấp lại | P3 |
| barracks/train | doanh trại huấn luyện xong | hô "Sẵn sàng!" | P2 |
| castle/put · castle/take | gửi / rút lính Hội thành | cổng thành + bước quân | P3 |
| castle/sally | lính Hội thành xông ra | tù và + hò reo | P2 |
| deco/place | đặt đồ trang trí | "pop" vui | P3 |

---

## 8. Mỏ tài nguyên

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| mine/capture_tick | thanh chiếm mỏ chạy | tick nhẹ, cao dần theo tiến độ | P2 |
| mine/captured | chiếm mỏ thành công (`captured`) | cờ cắm "phấp" + kèn chiến thắng ngắn + tiếng quân hò reo + leng keng tài nguyên. Mỏ quý (Pha lê, Kim cương) có bản to hơn `mine/captured_rare` | P1 |
| mine/captured_rare | chiếm mỏ Pha lê / Kim cương | như trên + ngân pha lê / kim cương lấp lánh | P2 |
| mine/steal | cướp mỏ của người khác | kèn chiếm + tiếng kiếm tra vào vỏ | P2 |
| mine/lost | mất mỏ | kèn trầm buồn | P1 |
| mine/alert | địch tới gần mỏ (`alert`) | chuông cảnh báo 2 tiếng | P1 |
| mine/full_cap | đã đủ giới hạn mỏ loại đó | "bụp" từ chối | P3 |
| mine/upgrade_done | mỏ lên cấp | búa + leng keng | P2 |
| mine/move | dời mỏ (`minemove`) | đất chuyển ầm | P3 |
| mine/refresh_guards | cập nhật lính canh mỏ | trống đổi gác | P3 |
| res/gain_small | tài nguyên chảy về (định kỳ) | leng keng rất nhỏ, ≤ 1 lần/5 s | P3 |

---

## 9. Trang bị, Lò rèn, Lò nghiền, Rương

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| loot/drop_common | đồ Trắng / Vàng / Xanh lá rơi (`loot`) | "cạch" kim loại nhẹ | P1 |
| loot/drop_rare | Xanh dương / Tím | lanh canh + ngân phép | P1 |
| loot/drop_epic | Cam | tia sáng + hợp xướng ngắn "aah" | P1 |
| loot/drop_mythic | Đỏ | tiếng tim đập + bùng lửa + hợp xướng | P1 |
| loot/drop_black | **Đen** | khoảng lặng 0,3 s rồi tiếng rồng gầm trầm + gió hư không + chuông vỡ: hiếm và "ngầu" nhất game | P1 |
| loot/pickup | tự nhặt vào túi ("Đã nhặt") | "pop" + cao độ tăng theo phẩm chất | P1 |
| loot/bag_full | túi đầy | "bụp" trầm | P2 |
| item/equip_metal | mặc vũ khí / giáp / mũ / khiên / găng | kim loại "kẻng" | P1 |
| item/equip_cloth | mặc giày / bùa | vải sột soạt | P2 |
| item/equip_ring | mặc nhẫn | "ting" trong | P2 |
| item/unequip · item/drop | cởi đồ · vứt đồ | trượt ra · rơi xuống đất | P2 |
| item/set_bonus | kích hoạt dòng Bộ trang bị 3/6/8 món | hợp âm sáng theo phẩm chất | P2 |
| forge/hammer | đang rèn (1 s) | búa nện đe 3 nhịp, tia lửa | P1 |
| forge/success | rèn thành công | búa + fanfare + lửa bùng | P1 |
| forge/success_black | rèn lên Đen thành công | như loot/drop_black, dài hơn | P1 |
| forge/fail | rèn thất bại | xì hơi nước + kim loại nứt "rắc" | P1 |
| grind/run | nghiền đồ | cối xay đá nghiến | P2 |
| grind/powder | nhận bột | cát chảy lấp lánh | P2 |
| chest/open · chest/close | mở / đóng Rương đồ | bản lề kẽo kẹt · đóng "cộp" | P2 |
| chest/store | cất nhanh (Shift + chuột) | "phụp" | P3 |

---

## 10. Nhiệm vụ, thành tựu, điểm danh, xã hội

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| quest/progress | tiến độ nhiệm vụ ngày tăng | "tick" nhỏ | P3 |
| quest/complete | hoàn thành 1 nhiệm vụ | "ting ting" | P1 |
| quest/claim | nhận thưởng nhiệm vụ / rương ngày | rương mở + tiền | P1 |
| quest/reroll | đổi nhiệm vụ | xáo bài | P3 |
| ach/unlock | đạt thành tựu | fanfare + huy chương | P1 |
| ach/title | đặt danh hiệu | dấu ấn "cộp" | P3 |
| checkin/claim | điểm danh ngày | lịch lật + quà | P2 |
| checkin/big | ngày quà lớn (7, 14, 21, 28, cuối tháng) | fanfare lớn | P2 |
| party/invite | nhận lời mời tổ đội | gõ cửa 2 tiếng | P2 |
| party/join · party/leave | vào / rời tổ đội | hợp âm lên · hợp âm xuống | P2 |
| chat/message | có tin chat mới (bong bóng chat) | "pop" bong bóng | P2 |
| king/unlock | mở giới hạn cấp ở Nhà vua phía Bắc | hợp xướng + kèn trang nghiêm | P2 |
| world/announce | thông báo toàn server (phá Thành trì, hạ boss...) | tù và xa | P3 |

---

## 11. Giao diện

| ID | Khi nào | Mô tả | Ưu tiên |
|---|---|---|---|
| ui/click | bấm nút | click gỗ nhẹ | P1 |
| ui/hover | rê chuột qua nút (chỉ máy tính) | rất nhỏ | P3 |
| ui/open · ui/close | mở / đóng bảng (Shop, Trang bị, Nhiệm vụ, Cài đặt...) | giấy da mở · gấp lại | P1 |
| ui/tab | đổi tab | lật trang | P2 |
| ui/buy | mua lính / công trình / trang trí | tiền xu rơi + "ting" | P1 |
| ui/not_enough | thiếu tài nguyên / lỗi (notice `err`) | "bụp" trầm | P1 |
| ui/notice_ok · ui/notice_warn | thông báo thành công / cảnh báo | "ting" · "đing đoong" | P2 |
| ui/stat_add | cộng điểm tiềm năng | "tick" tăng cao độ | P2 |
| ui/stat_reset | tẩy điểm | quét "vút" | P3 |
| ui/hotkey_set | đặt phím tắt | "bíp" | P3 |
| ui/minimap_ping | bấm bản đồ nhỏ | "pip" sóng âm | P3 |
| ui/login · ui/join_world | đăng nhập · vào Thế giới mở | cổng mở + kèn ngắn | P2 |

---

## 12. Bảng đếm

| Nhóm | Số âm thanh (tính cả biến thể) | P1 |
|---|---|---|
| Nhạc nền | 14 | 4 |
| Không khí | 10 | 0 |
| Lính, chiến đấu, di chuyển | ~85 | 26 |
| Tướng | 14 | 11 |
| Boss | ~36 | 26 |
| Quái và lính canh | ~20 | 2 |
| Căn cứ + thủ nhà | ~44 | 20 |
| Mỏ | 11 | 3 |
| Trang bị / rèn | ~24 | 13 |
| Nhiệm vụ / xã hội | 14 | 4 |
| Giao diện | 13 | 5 |
| **Tổng** | **~285 file** | **~115** |

**Đề xuất làm theo đợt:**
1. P1 (~115 file): nghe khác hẳn ngay.
2. P2.
3. P3 + nhạc riêng cho từng boss.

---

## 13. Gợi ý tạo âm thanh

- **SFX:** ElevenLabs Sound Effects, Stable Audio, hoặc thư viện bản quyền (Sonniss GDC bundle miễn phí, Kenney.nl CC0).
- **Nhạc:** Suno / Udio, hoặc thuê nhạc sĩ.

Mẫu prompt (tiếng Anh, thêm "game sound effect, no music, no voice, short, clean, mono"):

| ID | Prompt mẫu |
|---|---|
| boss/golem/slam_impact | `giant stone golem slams the ground, massive earth-shattering thud, cracking rock, shattering crystal shards, deep sub bass, fantasy game boss, 1.5 seconds` |
| boss/crystal/storm_warn | `rising crystal chime countdown, magical warning bell, 0.9 seconds, getting faster and higher, fantasy` |
| boss/scorpion/burrow_up | `giant scorpion bursts out of desert sand, sand explosion, chitin clicking, screech, 1.2 seconds` |
| boss/tar/spew | `monster vomits thick boiling tar, gooey bubbling splash, then fire ignites with a whoosh, 1.5 seconds` |
| boss/bandit/whirl | `heavy curved sword spinning whirlwind, metallic whooshes, wind vortex, ends with impact, 0.8 seconds` |
| loot/drop_black | `ultra rare legendary item drop, short silence, deep dragon growl, dark void wind, shattering bell, epic, 2 seconds` |
| forge/success | `blacksmith hammer hits anvil three times, sparks, bright magical success fanfare, 1.5 seconds` |
| forge/fail | `steam hiss, metal cracks and breaks, disappointing low thud, 1 second` |
| base/th_upgrade | `medieval castle upgrade complete, brass fanfare, bells ringing, crowd cheering, 3 seconds` |
| trap/spring | `cartoon spring trap boing, soldiers yelling as they are launched into the air, 1 second` |
| music/boss_golem | `epic fantasy boss battle music, heavy taiko drums, deep brass, crystal bells, pipe organ, 140 bpm, seamless loop, instrumental` |
| music/world_calm | `calm fantasy adventure exploration music, strings and flute, warm, medieval, seamless loop, instrumental` |

---

## 14. Gắn vào game (khi có file)

- `client/audio.js`: Web Audio API (một AudioContext, các kênh Nhạc / SFX / UI), tải trước P1, tải sau phần còn lại.
- Hàm `play(id, { x, y })`: tự chọn biến thể, lệch cao độ, nhỏ dần theo khoảng cách, lệch trái/phải, giới hạn số tiếng cùng lúc.
- Gắn vào chỗ client đang nhận `events` (`dmg`, `proj`, `die`, `boom` + `kind`, `bskill`, `warn`, `breath`, `fire`, `summon`, `levelup`, `loot`, `captured`, `alert`, `minemove`, `rout`, `txt`) và các `notice`. Đa số **không cần sửa server**.
- Cài đặt (phím K): 3 thanh trượt Nhạc / Hiệu ứng / Giao diện + Tắt tiếng, lưu vào localStorage.

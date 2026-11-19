# 29. Địa Ngục: chiều không gian mới sau Cổng Địa Ngục (đề xuất 16/11/2026)

Trạng thái: **đề xuất, chưa code**. Mọi con số là **lượt cân bằng đầu tiên**, chỉnh lại sau khi chạy mô phỏng (như docs/design/26).

## 1. Tóm tắt

- Ở rìa **phía Đông** thế giới mở có **Cổng Địa Ngục** (`cong-dia-nguc`), một công trình cố định như Nhà vua phía Bắc và Nữ hoàng Sa mạc.
- Qua cổng là **Địa Ngục**: một lượt chơi sinh tồn **15 phút** kiểu "đánh lũ quái" (survivor). Tướng **tự đánh**, người chơi chỉ **di chuyển** và **chọn thẻ kỹ năng** khi lên cấp. Quái chết rơi **Hồn tinh** (XP).
- Chỉ mang **tướng + thú cưng**. Quân ở lại thế giới mở (cất như khi offline).
- Đi một mình hoặc theo **Tổ đội** (tối đa 5, dùng tổ đội có sẵn).
- Mỗi tổ đội vào một **đấu trường riêng** (instance), không chung bản đồ với tổ khác. Lý do ở mục 3.
- Phần thưởng mang về thế giới mở: tài nguyên, trang bị, bột, XP tướng, và **Than Hồn** để **luyện thú cưng**.
- Nội dung: **14 quái thường + 4 quái tinh anh + 3 boss**, **5 vũ khí riêng của tướng + 12 kỹ năng chủ động + 9 nội tại**, **11 dạng tiến hóa**, **3 đấu trường**, **6 Tầng Ngục**. Hình vẽ: **39 sheet** (mục 9).

## 2. Vòng chơi

### 2.1 Một lượt xuống ngục

```
Tới Cổng Địa Ngục (rìa Đông) ─► bảng Cổng: chọn Tầng, đi một mình hoặc gọi tổ đội (đếm ngược 15 giây)
        │
        ▼
Quân được cất, tướng + thú cưng vào đấu trường riêng, đứng trên Tế đàn ở giữa
        │
        ▼
0:00–15:00  quái kéo tới theo đợt ─► tướng tự đánh ─► nhặt Hồn tinh ─► lên cấp ─► chọn 1 trong 3 thẻ
        │        phút 4 · 7 · 10 · 12:30: quái tinh anh, rơi Rương Ngục (lên cấp kỹ năng / tiến hóa + 1 món đồ)
        │        sau mỗi tinh anh: Cổng thoát mở 20 giây (ra lúc này giữ 100% thưởng)
        ▼
14:00  vòng lửa khép lại thành đấu trường boss ─► đánh boss
        │
        ├─ hạ boss ─► Rương boss + mở Tầng tiếp theo ─► về Cổng Địa Ngục, quân trở lại quanh tướng
        └─ chết (cả tổ) ─► giữ 70% thưởng đã tích ─► về Cổng Địa Ngục
```

| Mốc | Diễn biến |
|---|---|
| 0:00–2:00 | Quỷ Tro, Dơi Than, Sâu Dung Nham. Người chơi nhặt 3–5 thẻ đầu. |
| 2:00–5:00 | Thêm Cốt Than, Khuyển Bazan, Đèn Oan Hồn, Bọ Lưu Huỳnh. Phút 3: đợt **Vòng vây** (một vòng quái khép quanh tướng). |
| 4:00 | Tinh anh 1: **Cai Ngục**. |
| 5:00–9:00 | Kẻ Kéo Xích, Nhầy Dung Nham, Quạ Lửa (bầy bay ngang màn hình), Cự Nham, Thầy Cúng Sừng. |
| 7:00 | Tinh anh 2: **Phù Thủy Huyết**. Phút 8: Vòng vây lần 2. |
| 9:00–14:00 | Hỏa Tê, Vệ Binh Ngục. Quái đông nhất. |
| 10:00 | Tinh anh 3: **Lò Rèn Sống**. Phút 12: Vòng vây lần 3. |
| 12:30 | Tinh anh 4: **Rết Dung Nham**. |
| 14:00 | Quái thường rút lui. Vòng lửa bán kính 14 ô khép quanh tổ đội. Boss xuất hiện. |
| 18:00 | Boss chưa chết thì **Hỏa Thịnh**: boss gây ×3 sát thương (hết giờ mềm). |

### 2.2 Điều khiển

- Di chuyển: **giữ chuột phải** để đi theo con trỏ (giống thế giới mở) hoặc **WASD / phím mũi tên**.
- Kỹ năng tự đánh. Phím **Q**: chiêu cuối của tướng (mục 5.4), hồi 45 giây.
- Lên cấp: hiện 3 thẻ (cứ 5 cấp hiện 4 thẻ), bấm hoặc phím **1–4**. Mỗi lượt có **2 lần Đổi bài** và **1 lần Bỏ qua**.
- **Đi một mình:** lượt chơi **dừng hẳn** khi đang chọn thẻ (đấu trường riêng nên server dừng được).
- **Tổ đội:** không dừng được. Khi bảng thẻ mở, tướng được **bất tử 2 giây** và quái quanh 2 ô bị đẩy lùi. Sau 8 giây chưa chọn thì tự chọn thẻ đầu.

### 2.3 Ô kỹ năng

- **5 ô chủ động:** ô 1 luôn là vũ khí riêng của tướng, 4 ô còn lại nhặt từ thẻ.
- **4 ô nội tại.**
- Mỗi kỹ năng 5 cấp. Đủ bộ cần ~44 lần lên cấp. Một lượt 15 phút đạt khoảng cấp 38–42, nên gần đủ bộ khi gặp boss nhưng phải chọn lọc.

### 2.4 Hồn tinh, vật phẩm nhặt

| Vật phẩm | Từ đâu | Tác dụng |
|---|---|---|
| Hồn tinh lam / lục / huyết | quái chết | 1 / 5 / 20 XP. Trên sàn quá 250 viên thì viên cũ gộp thành Hồn tinh huyết. |
| Than Hồn | 1 / 40 quái, tinh anh 8, boss 30 | Tiền riêng của Địa Ngục, mang về để luyện thú cưng |
| Đồng vàng | 2% quái | +3 vàng mang về |
| Bình Huyết | đập Lò lửa | hồi 25% HP |
| Nam Châm Hồn | đập Lò lửa, hiếm | hút mọi Hồn tinh trên đấu trường |
| Bùa Nổ | đập Lò lửa, hiếm | hạ mọi quái thường trên màn hình |
| Cát Băng | đập Lò lửa, hiếm | đóng băng quái 6 giây |
| Rương Ngục | tinh anh, boss | 1 / 3 / 5 lần lên cấp kỹ năng (hoặc tiến hóa nếu đủ điều kiện) + 1 món đồ cho thế giới mở |

### 2.5 Chết, cứu, thoát

- **Một mình:** hết HP là hết lượt. Giữ **70%** thưởng đã tích (Rương đã mở thì giữ đủ món đồ).
- **Tổ đội:** hết HP thì thành **Hồn** tại chỗ trong 30 giây. Đồng đội đứng cạnh (1,5 ô) **3 giây** thì cứu dậy với 50% HP. Quá 30 giây thì người đó ra ngoài xem, vẫn nhận 70% phần của mình khi lượt kết thúc. Lượt hết khi cả tổ ra ngoài hoặc boss chết.
- **Cổng thoát:** mở 20 giây trên Tế đàn sau mỗi lần hạ tinh anh. Ra lúc đó giữ **100%** thưởng đã tích. Đây là lựa chọn "chắc ăn hay liều tiếp".
- Mất kết nối: một mình thì lượt dừng tối đa 2 phút; tổ đội thì tướng đứng yên (như AFK ở thế giới mở).

### 2.6 Thú cưng trong Địa Ngục

- Thú cưng **luôn đi cùng** (khác thế giới mở, nơi nó chỉ hiện khi có giao chiến), dùng dạng chiến đấu `fight` hiện có, chỉ số ×0,5 (vì quái ở đây yếu hơn quái bãi) × hệ số cấp tướng như cũ.
- Bám trong 4 ô quanh tướng, tự đánh quái gần nhất trong 6 ô.
- Thú có `cap: 3` (Gấu Trúc, Rùa Đá) **khiêu khích** tối đa 15 quái quanh nó, kéo quái khỏi tướng.
- Hiệu ứng `bonus` của thú vẫn có: tốc chạy, máu, giáp, hút máu, hồi máu áp vào tướng; `loot` +15% Than Hồn và tỉ lệ đồ trong Rương; `xp` +20% XP Hồn tinh; `res` +10% tài nguyên mang về.
- Thú gục thì nghỉ 20 giây rồi hiện lại cạnh tướng (nội tại Linh Khế rút ngắn).

### 2.7 Tầng Ngục

| Tầng | Mở khi | Sức mạnh đề nghị (S, mục 8.1) | Máu quái | Sát thương quái | Hệ số thưởng F |
|---|---|---|---|---|---|
| 1 | tướng cấp 10 | 1,0 | ×1 | ×1 | 1 |
| 2 | hạ boss Tầng 1 | 1,3 | ×1,8 | ×1,3 | 1,5 |
| 3 | hạ boss Tầng 2 | 1,6 | ×3 | ×1,7 | 2,2 |
| 4 | hạ boss Tầng 3 | 2,0 | ×4,8 | ×2,2 | 3 |
| 5 | hạ boss Tầng 4 | 2,5 | ×7,5 | ×2,8 | 4 |
| 6 | hạ boss Tầng 5 | 3,0 | ×11 | ×3,5 | 5,5 |

Tầng mở theo tài khoản. Tổ đội vào được Tầng mà **trưởng nhóm** đã mở; thành viên chưa mở vẫn vào được, nhận thưởng theo Tầng đó.

## 3. Bài toán nhiều người chơi

### 3.1 Vấn đề

Thế giới mở là **một bản đồ 512×512 chung**, một `Game` chạy 20 tick/giây với ~7 000 quân. Mỗi lượt Địa Ngục cần **300–480 quái sống cùng lúc** và sinh ra **3 000–8 000 quái** trong 15 phút. Nếu 5 tổ đội cùng xuống ngục trên một bản đồ chung thì phải trả lời: quái của ai đuổi ai, ai được XP, đợt quái chồng lên nhau thế nào, và server có chịu nổi không.

### 3.2 Các phương án

| | A. Bản đồ Địa Ngục chung, mỗi tổ một bộ sinh quái | B. Mỗi lượt là một phòng `Game` đầy đủ (mode `hell`) | **C. Mỗi lượt là một `HellRun` nhẹ, đấu trường riêng** | D. Client tự chạy, server chỉ kiểm tra |
|---|---|---|---|---|
| Ý tưởng | Một map lớn, mỗi tổ có vùng và bộ sinh quái riêng, quái chỉ nhắm tổ của nó | Dùng lại `Room` + `Game` như phòng `match` | Lớp mới gọn nhẹ chỉ có tướng, thú, quái, Hồn tinh, kỹ năng. Mỗi tổ một đấu trường 128×128 | Như game một người, gửi kết quả lên server |
| Tương tác giữa các tổ | Có (thấy nhau). Nhưng phải chặn: cướp quái, cướp Hồn tinh, kỹ năng tổ này trúng quái tổ kia, quái hai tổ chen nhau | Không | Không (có thể hiện "bóng" tổ khác cho vui, mục 3.4) | Không |
| Đợt quái | Rất khó: hai tổ đứng gần thì đợt chồng lên nhau, độ khó lệch | Dễ | Dễ: bộ điều phối riêng mỗi lượt | Dễ |
| Tải server | Tất cả trong một tick, một bảng băm. Map phải rất lớn (khóa băm hiện tại `(cy<<8)\|cx` chỉ đủ 256 ô băm mỗi chiều) | Nặng: `Game` dựng mỏ, bãi quái, căn cứ, Nhà vua… cho cả map 512; logic đánh theo cặp, đội hình không hợp đánh lũ | Nhẹ: không có mỏ, căn cứ, đội hình. Quái đi theo bản đồ hướng (flow field), không A* | Gần như 0 |
| Băng thông | Lọc theo tầm nhìn đã có, nhưng phải lọc thêm theo tổ | Gói `s` JSON hiện tại ~40 byte/quân | Gói riêng gọn (mục 3.5) | Thấp |
| Chống gian lận | Server tính | Server tính | Server tính | **Kém**: sửa client là có đồ |
| Dừng khi chọn thẻ | Không | Được | **Được** khi đi một mình | Được |
| Công sức | Cao nhất | Trung bình, nhưng phải bẻ `Game` rất nhiều chỗ | Trung bình: code mới nhưng sạch, tách hẳn khỏi thế giới mở | Thấp, nhưng phải viết sim ở client |

### 3.3 Đề xuất: phương án C

**Mỗi lượt xuống ngục (một người hoặc một tổ) là một `HellRun` riêng, có đấu trường riêng.** Một `HellManager` giữ danh sách các lượt và tick tất cả chúng trong vòng lặp 20 Hz sẵn có (sau này chuyển sang `worker_threads`).

Ghép với hệ thống phòng hiện tại:

- Vào ngục = `takeOut` khỏi phòng `world` như khi offline: quân, mỏ, căn cứ được giữ (`stash`). Tướng, trang bị, cấp, thú cưng đọc từ `heroProg` của phòng `world` (cùng tiến trình nên đọc trực tiếp).
- Trong lúc ở ngục, thu nhập mỏ tính **100%** (không phải 50% offline), tối đa 25 phút.
- Ra ngục = `joinRoom(world)` → `unstashPlayer`, tướng hiện ở bậc thềm Cổng Địa Ngục. Thưởng đi qua hàng chờ quà `pending` có sẵn (như quà điểm danh).
- Server khởi động lại giữa lượt: lượt không được lưu. Thưởng đã tích được ghi vào `pending` mỗi 10 giây, nên người chơi nhận đủ 100% phần đã tích và quay về thế giới mở.
- Người ở thế giới mở thấy trên Cổng: "Đang ở ngục: Huy (Tầng 3, phút 9)".

Tải ước tính:

| | Một lượt | 6 lượt cùng lúc (trần `HELL_MAX_RUNS = 6`) |
|---|---|---|
| Quái sống | trần 320 (một người) · 480 (tổ 5 người) | ≤ 2 900 (ít hơn thế giới mở) |
| CPU (ước) | quái: hướng đi từ flow field (O(1)) + tách đám đông qua bảng băm + kiểm tra chạm; ~1,5 µs/quái/tick → ~10–15 ms mỗi giây | ~6–9% một nhân |
| Flow field | BFS 128×128 = 16 384 ô, tính lại mỗi 0,5 giây | không đáng kể |

Nhóm chơi 2–10 người nên thường chỉ 1–4 lượt cùng lúc. Trần 6 lượt là để an toàn; đủ trần thì Cổng báo "đợi lượt".

### 3.4 Quy tắc để nhiều quái mà vẫn nhẹ

- **Sinh ngoài màn hình:** quái mọc ở vòng 22–26 ô quanh một thành viên ngẫu nhiên (nhiều hơn tầm nhìn 20×14 ô).
- **Trần quái sống:** đủ trần thì không sinh thêm. Quái ở xa mọi tướng hơn 34 ô được **dời lại** gần tướng thay vì sinh con mới.
- **Kỹ năng do server tính trúng, client tự vẽ:** server chỉ gửi sự kiện "kỹ năng X cấp Y bắn ở (x, y) hướng d, hạt giống s". Đạn bay, lưỡi xoay, vòng hào quang do client vẽ lại từ sự kiện. Không gửi từng viên đạn.
- **Hồn tinh không di chuyển:** chỉ gửi "rơi ở (x, y)" và "đã nhặt", client tự vẽ hiệu ứng hút.
- **Gộp sát thương:** số sát thương bay lên gộp theo quái mỗi 0,2 giây.
- Tùy chọn cho vui: góc màn hình hiện "bóng mờ" các tổ khác đang ở ngục (tên, Tầng, phút), không tương tác.

### 3.5 Mạng và chống gian lận

- Client gửi lên **chỉ**: hướng đi (hoặc điểm đích), chọn thẻ (chỉ số trong danh sách server đưa), Đổi bài, Bỏ qua, Q, thoát. Server từ chối mọi thứ khác.
- Gói trạng thái mới `h` 10 lần/giây, chỉ quái trong khung nhìn + 6 ô:
  - Giai đoạn 1: mảng số nguyên JSON phẳng `[id, loại, x×16, y×16, %HP, cờ]` (~25 byte/quái) → 300 quái ≈ 75 KB/giây. Đủ cho nhóm nhỏ.
  - Giai đoạn 3: gói nhị phân 9 byte/quái → ~27 KB/giây.
- Thưởng do server tính theo phút sống, quái hạ, tinh anh, boss. Không có gì ở client quyết định phần thưởng.
- Chống cày quá tay: **Vé Ngục**, mỗi tài khoản giữ tối đa 4 vé, hồi 1 vé mỗi 6 giờ. Vào ngục không có vé vẫn được, nhưng chỉ nhận Than Hồn và XP tướng ×50%.

### 3.6 Kế hoạch làm theo giai đoạn

| Giai đoạn | Việc | Kết quả |
|---|---|---|
| 0. Khung | `shared/hell.js` (bảng quái, kỹ năng, Tầng, thưởng); `server/hell/run.js`, `manager.js`; Cổng Địa Ngục trên map (đặt như `findQueen`, phía Đông); vào/ra bằng stash/unstash; thưởng qua `pending`. Quái tạm dùng hình quái bãi tô màu đỏ. | Một người vào, đánh 3 loại quái, 4 kỹ năng, ra có thưởng. Đo CPU / băng thông với 6 lượt bot. |
| 1. Vòng chơi một người | Bộ điều phối 15 phút, thẻ + đổi bài, 5 vũ khí tướng, 12 kỹ năng, 9 nội tại, 8 quái, 2 tinh anh, 1 boss, Vé Ngục, 1 đấu trường. Client `client/hell.js` (vẽ đấu trường, HUD, bảng thẻ). | Chơi được trọn một lượt Tầng 1. |
| 2. Tổ đội | Đếm ngược ở Cổng, chia XP, cứu đồng đội, hệ số theo số người, tự chọn thẻ khi không dừng được. | 2–5 người chơi chung. |
| 3. Đủ nội dung | 14 quái, 4 tinh anh, 3 boss, 11 tiến hóa, 3 đấu trường, Tầng 1–6, Luyện thú; gói nhị phân; `worker_threads` nếu tick thế giới mở bị ảnh hưởng. | Bản đầy đủ. |
| 4. Cân bằng | `tools/sim/hell-sim.mjs`: tướng bot chọn thẻ tham lam, chạy 100 lượt mỗi Tầng × mỗi tướng; mục tiêu ở mục 8.6. | Chỉnh số. |

Lưu ý code đang chạy: mã loại mới (quái ngục) chỉ **thêm vào cuối** `TYPE_LIST` / danh sách giao thức, không chèn giữa (client cũ tải `shared/*.js` trước khi server khởi động lại).

## 4. Quái

Hình: dáng chibi như quái bãi, mỗi loài **1 sheet 8 hướng × 5 tư thế** (đứng, đi, đánh, trúng đòn, chết). Boss 8 hướng × 7 tư thế. Màu chủ đạo của quái: đỏ thẫm, đen bazan, cam dung nham, vàng lưu huỳnh, xương trắng. **Kỹ năng của người chơi dùng màu lạnh / sáng** (vàng kim, trắng, xanh băng, tím sấm) để luôn tách khỏi nền đỏ và đòn của quái.

Chỉ số dưới đây ở **Tầng 1, phút 0, đi một mình**. Cách nhân theo phút / Tầng / số người ở mục 8.

### 4.1 Quái thường (14)

| # | Quái · mã | Vai trò | Xuất hiện | Máu | Đánh | Tốc độ (ô/s) | XP | Hành vi |
|---|---|---|---|---|---|---|---|---|
| 1 | **Quỷ Tro** `quy-tro` · Ash Imp | bầy đông | 0:00 | 12 | 5 | 1,9 | 1 | Quỷ con tro xám mắt than hồng, lao thẳng vào tướng. Quân lót đường. |
| 2 | **Dơi Than** `doi-than` · Cinder Bat | bầy bay | 0:30 | 8 | 4 | 2,6 | 1 | Bay chéo lắc lư, bay qua dung nham và vật cản. |
| 3 | **Sâu Dung Nham** `sau-dung-nham` · Magma Grub | bò chậm, vết lửa | 1:00 | 30 | 6 | 1,0 | 1 | Để lại vệt cháy 2 giây (4 sát thương/giây). Chặn đường chạy vòng. |
| 4 | **Cốt Than** `cot-than` · Coal Bones | cận chiến, hồi sinh | 2:00 | 40 | 8 | 1,6 | 2 | Bộ xương gắn bằng than hồng. Chết lần đầu thành đống xương, 4 giây sau đứng dậy với 50% máu, trừ khi trúng đòn vùng hoặc bị giẫm qua. |
| 5 | **Khuyển Bazan** `khuyen-bazan` · Basalt Hound | lao tới theo bầy | 3:00 | 60 | 10 | 2,2 (lao 4,5) | 2 | Bầy 5 con. Cách tướng ≤ 6 ô thì lao 1 giây. |
| 6 | **Đèn Oan Hồn** `den-oan-hon` · Wailing Lantern | bắn xa | 3:30 | 45 | 9 | 1,4 | 2 | Lồng đèn sắt nhốt một gương mặt than khóc. Giữ cách 7 ô, bắn cầu lửa chậm (1,2 ô/s), né được. |
| 7 | **Bọ Lưu Huỳnh** `bo-luu-huynh` · Sulfur Beetle | tự nổ | 4:00 | 35 | 25 | 2,0 | 2 | Tới cách 1,2 ô thì phồng túi 0,8 giây rồi nổ vùng 1,8 ô (trúng cả quái khác ×0,5), để vũng axit 3 giây. |
| 8 | **Kẻ Kéo Xích** `ke-keo-xich` · Chain Dragger | khống chế | 5:00 | 90 | 12 | 1,5 | 3 | Quái gù kéo xích. Ném móc xích tầm 5 ô: tướng trúng bị chậm 40% trong 1,5 giây. Hồi 6 giây. |
| 9 | **Nhầy Dung Nham** `nhay-dung-nham` · Lava Ooze | tách đôi | 6:00 | 120 → 40 → 12 | 10 / 7 / 4 | 1,3 / 1,7 / 2,1 | 1 mỗi lần | Chết tách 2 con nhỏ, rồi 4 con tí hon. Ba cỡ dùng chung một sheet (game thu nhỏ). |
| 10 | **Quạ Lửa** `qua-lua` · Ember Crow | bầy bay quét | 6:30 | 20 | 10 | 5,0 | 1 | Không đuổi theo: bầy 8–12 con bay thẳng một đường ngang màn hình (có vạch báo trước 1 giây). |
| 11 | **Cự Nham** `cu-nham` · Magma Brute | trâu | 7:00 | 400 | 20 | 1,1 → 1,8 | 6 | Vỏ đá nguội giảm 60% sát thương. Dưới 50% máu vỏ vỡ, lộ lõi dung nham, chạy nhanh hơn. |
| 12 | **Thầy Cúng Sừng** `thay-cung-sung` · Horned Hexer | phép vùng | 8:00 | 150 | 30 | 1,3 | 5 | Đứng cách 8 ô, vẽ vòng bùa 1,5 ô dưới chân tướng, nổ sau 1,2 giây. |
| 13 | **Hỏa Tê** `hoa-te` · Blaze Rhino | húc đường thẳng | 9:30 | 600 | 35 | 1,6 (húc 7) | 8 | Vạch đỏ báo 1 giây, húc 10 ô, đâm trúng vật cản thì choáng 1,5 giây. |
| 14 | **Vệ Binh Ngục** `ve-binh-nguc` · Infernal Warden | khiên | 11:00 | 800 | 25 | 1,2 | 8 | Khiên tháp phía trước chặn 75% sát thương từ phía trước, đập khiên đẩy lùi. Đánh từ sau lưng hoặc dùng phép xuyên khiên. |

Rơi đồ chung: luôn rơi Hồn tinh (theo XP), 2% đồng vàng, 1/40 Than Hồn. Quái thường không rơi trang bị (trang bị chỉ có trong Rương, mục 7).

### 4.2 Quái tinh anh (4)

Xuất hiện theo giờ cố định, có vạch máu riêng trên đầu màn hình, rơi **Rương Ngục**. Máu không tăng theo phút (chỉ theo Tầng và số người).

| Tinh anh · mã | Phút | Máu | Đánh | Hành vi |
|---|---|---|---|---|
| **Cai Ngục** `cai-nguc` · The Jailer | 4:00 | 3 000 | 20 | Gã cai ngục béo, chùm chìa khóa và chùy xích. Xoay chùy 2 giây (vùng 2,5 ô). Ném lồng sắt: tướng trúng bị nhốt 1 giây (bấm chạy để phá). |
| **Phù Thủy Huyết** `phu-thuy-huyet` · Blood Witch | 7:00 | 4 500 | 25 | Bay lơ lửng. Mỗi 8 giây gọi một vòng 12 Quỷ Tro quanh tướng. Hồi 3% máu/giây cho quái trong 6 ô: hạ nó trước. |
| **Lò Rèn Sống** `lo-ren-song` · Living Forge | 10:00 | 9 000 | 40 | Lò rèn biết đi có đe trên vai. Ném 3 thỏi sắt nung theo đường cong (vùng 1,5 ô, để lửa 3 giây). Mỗi 25% máu mất: +20% tốc ném. |
| **Rết Dung Nham** `ret-dung-nham` · Lava Centipede | 12:30 | 12 000 | 50 | Chui xuống đất, vòng báo 1,2 giây rồi trồi lên dưới chân tướng. Đầu nhận đủ sát thương, thân 50%. |

### 4.3 Boss (3)

Mỗi đấu trường một boss chính. Từ Tầng 4, boss chọn ngẫu nhiên trong 3. Tầng 6 có thêm 30% máu và dùng chiêu ở mọi giai đoạn.

| Boss · mã | Đấu trường | Máu (T1, 1 người) | Chiêu |
|---|---|---|---|
| **Quỷ Vương Nham Thạch** `quy-vuong-nham` · Magma Tyrant | Đồng Xương Cháy | 60 000 | **Chém Sóng:** dao phay dung nham chém ra sóng đường thẳng 12 ô. **Mưa Nham:** 20 khối nham rơi có vòng báo. **Gọi Cự Nham:** 2 con ở 66% và 33% máu. |
| **Mẫu Hậu Tro Tàn** `mau-hau-tro` · Ash Matriarch | Ngã Ba Sông Nham | 50 000 | Con ngài chúa khổng lồ, cánh tro rơi vảy cháy. **Vảy Cháy:** 3 kiểu bắn vảy (xoắn ốc 24 vảy, hình quạt, vòng tròn). **Kén Dơi:** 4 kén nở 10 Dơi Than mỗi kén. **Bão Tro:** 6 giây chỉ thấy rõ 6 ô quanh tướng. |
| **Ngục Chủ Xích Xiềng** `nguc-chu` · The Chained Warden | Ngục Xích | 80 000 | Người khổng lồ giáp đen bị 4 xích neo vào 4 Cột Neo. **Quét Xích:** xích quét theo vạch báo. Phá một Cột Neo (3 000 máu): boss mất 10% máu tối đa nhưng +15% tốc. **Giam Cầm:** nhốt một tướng 2 giây (đồng đội phá lồng). Dưới 30%: kéo mọi thứ về phía mình. |

Boss khi hạ: Rương boss (3 hoặc 5 lần lên cấp kỹ năng, chắc chắn tiến hóa nếu đủ điều kiện) + 2 món đồ + kim cương (mục 7).

## 5. Kỹ năng

### 5.1 Luật thẻ

- Kho thẻ: **12 chủ động + 9 nội tại = 21 thẻ chung**, thêm **vũ khí riêng** của tướng mình (chỉ tướng đó thấy).
- Thẻ hiện ra: kỹ năng đã có (để lên cấp) hoặc kỹ năng mới (khi còn ô trống). Đủ ô thì chỉ hiện thẻ nâng cấp. Mọi thứ cấp 5 hết thì hiện thẻ "+30 vàng mang về" hoặc "Hồi 30% HP".
- Trọng số: kỹ năng đã có ×1,5, vũ khí riêng ×1,5, còn lại ×1.
- **Tiến hóa:** chủ động cấp 5 + nội tại ghép đôi (cấp bất kỳ) → mở **Rương Ngục** tiếp theo sẽ tiến hóa thay vì lên cấp. Dạng tiến hóa chiếm đúng ô cũ, giữ cấp 5.
- Tất cả sát thương dưới đây là số gốc, nhân với hệ số trang bị D (mục 8.1), Tụ Lực và các hệ số khác.

### 5.2 Vũ khí riêng của tướng (5, ô 1, có sẵn từ đầu)

| Tướng | Vũ khí | Cấp 1 | Cấp 2 → 5 | Hình ảnh |
|---|---|---|---|---|
| Thạch Lâm | **Trảm Kiếm Vương** | chém hình quạt 150° trước mặt, tầm 2,2 ô, 22 sát thương, hồi 1,1 s | L2 +25% sát thương · L3 chém cả phía sau · L4 tầm +25%, hồi −10% · L5 +40% sát thương, đẩy lùi | vệt chém bạc trắng hình lưỡi liềm lớn, tia vàng ở mép |
| Kim Hạ | **Cuốc Bay** | ném 1 cuốc xoay bay ra 6 ô rồi quay về, xuyên mọi quái, 16 sát thương, hồi 1,4 s | L2 +1 cuốc · L3 +30% sát thương · L4 +1 cuốc, bay nhanh +20% · L5 +30% sát thương, quái bị cuốc hạ rơi thêm 10% XP | cuốc chim xoay tròn, vệt vàng hổ phách, tia lửa khi chạm |
| Phong Vũ | **Giáo Xung Phong** | đâm thẳng 4 ô theo hướng đang đi, xuyên, 26 sát thương, hồi 1,2 s | L2 +30% sát thương · L3 2 mũi (lệch 20°) · L4 dài +2 ô · L5 3 mũi, +30% sát thương | mũi giáo ánh xanh lam, vệt gió dài có cờ nhỏ |
| Lam Nguyệt | **Tinh Đạn** | 1 sao tự tìm quái gần nhất, nổ vùng 0,8 ô, 18 sát thương, hồi 1,0 s | L2 +1 sao · L3 vùng nổ +30% · L4 +1 sao · L5 +40% sát thương, xuyên khiên Vệ Binh | ngôi sao bạc tím có đuôi, nổ thành vòng sao nhỏ |
| Hỏa Kỳ | **Roi Lửa** | quất ngang trái/phải luân phiên, dài 3,5 ô, 20 sát thương + cháy 6/s trong 3 s, hồi 1,0 s | L2 quất cả hai bên · L3 +30% sát thương · L4 dài +1 ô, cháy +50% · L5 quái đang cháy chết thì nổ vùng 1 ô, 30 sát thương | roi lửa đỏ cam, đầu roi bắn tia lửa (ngoại lệ màu ấm duy nhất, có lõi trắng) |

**Nội tại tướng trong Địa Ngục** (thay cho nội tại thế giới mở, vốn gắn với quân và mỏ):

| Tướng | Nội tại ngục |
|---|---|
| Thạch Lâm | +20% HP, −10% sát thương nhận |
| Kim Hạ | +40% tầm hút Hồn tinh, +25% vàng và Than Hồn mang về |
| Phong Vũ | +12% tốc chạy, chạm quái khi đang chạy không bị chậm |
| Lam Nguyệt | +15% vùng kỹ năng |
| Hỏa Kỳ | thú cưng +30% sát thương, hiệu ứng cháy +20% |

### 5.3 Kỹ năng chủ động chung (12)

| # | Kỹ năng · mã | Cấp 1 | Cấp 2 → 5 | Hình ảnh |
|---|---|---|---|---|
| 1 | **Lưỡi Liềm Xoay** `luoi-liem` | 2 lưỡi liềm bạc xoay quanh tướng bán kính 2 ô, 12 sát thương/lần chạm, bật 4 s tắt 3 s | L2 +1 lưỡi · L3 +30% sát thương, bán kính +15% · L4 +1 lưỡi, bật +1 s · L5 xoay liên tục, +30% sát thương | lưỡi liềm bạc có vệt sáng trắng xanh |
| 2 | **Lôi Châm** `loi-cham` | tia sét nhảy 3 quái trong 7 ô, 20 sát thương, hồi 2 s | L2 nhảy +2 · L3 +30% sát thương · L4 hồi −20% · L5 phóng 2 tia mỗi lần | tia sét tím trắng gấp khúc giữa các quái |
| 3 | **Bùa Trấn Tà** `bua-tran-ta` | vòng bùa vàng quanh tướng 1,6 ô, 8 sát thương/giây, chậm 10% | L2 bán kính +20% · L3 12/giây · L4 bán kính +20%, chậm 20% · L5 18/giây, mỗi 2 s đẩy nhẹ | vòng bát quái vàng nhạt xoay dưới chân, chữ bùa bay |
| 4 | **Phi Đao Bạc** `phi-dao` | 1 dao bay theo hướng mặt, 10 sát thương, hồi 0,6 s, bay 12 ô/s | L2 +1 dao · L3 +1 dao, xuyên 1 · L4 +30% sát thương · L5 +2 dao, hồi −15% | dao bạc nhỏ, vệt trắng ngắn |
| 5 | **Mưa Băng Tiễn** `bang-tien` | 4 mũi băng rơi chỗ ngẫu nhiên trong 6 ô, vùng 0,8 ô, 18 sát thương, chậm 30% 1,5 s, hồi 3 s | L2 +2 mũi · L3 +30% sát thương · L4 +2 mũi, đóng băng 0,5 s · L5 hồi −25%, +30% sát thương | mũi băng xanh trời cắm xuống, vỡ thành mảnh băng |
| 6 | **Chuông Trấn Hồn** `chuong-dong` | mỗi 5 s chuông đồng ngân, sóng vòng 3,5 ô, 30 sát thương, đẩy lùi 1,5 ô | L2 +30% sát thương · L3 bán kính +20% · L4 hồi 4 s · L5 ngân 2 lần (lần 2 sau 0,5 s), choáng 0,5 s | chuông đồng hiện trên đầu tướng, vòng sóng vàng đồng |
| 7 | **Ngự Kiếm** `ngu-kiem` | 1 kiếm bay tìm quái máu cao nhất trong 8 ô, xuyên 2, 30 sát thương, quay về, hồi 2,5 s | L2 +1 kiếm · L3 +30% sát thương · L4 +1 kiếm · L5 xuyên vô hạn, +40% sát thương | kiếm xanh ngọc có vệt sáng dài |
| 8 | **Địa Chấn Quyền** `dia-chan` | mỗi 4 s một khe nứt dài 6 ô theo hướng đi, nổ sau 0,4 s, 40 sát thương, hất 0,4 s | L2 +30% sát thương · L3 2 khe (hình quạt) · L4 dài +3 ô · L5 3 khe, +30% sát thương | khe nứt đất sáng vàng đất, đá văng lên |
| 9 | **Hồ Lô Hút Hồn** `ho-lo` | mỗi 8 s đặt hồ lô ở chỗ quái dày nhất trong 7 ô, hút quái trong 3 ô suốt 2 s, rồi nổ 60 sát thương | L2 bán kính +20% · L3 +50% sát thương · L4 hồi 6,5 s · L5 2 hồ lô | hồ lô ngọc bích, xoáy gió xanh lục, nổ ánh trắng |
| 10 | **Quạt Ba Tiêu** `quat-ba-tieu` | mỗi 3 s quạt hình nón 90° dài 4 ô, 15 sát thương, đẩy 2 ô, xóa đạn quái trong nón | L2 +30% sát thương · L3 dài +1,5 ô · L4 hồi 2,4 s · L5 nón 120°, thêm lưỡi gió 15 sát thương | quạt lá chuối khổng lồ hiện ra, cơn gió trắng xanh hình nón |
| 11 | **Thiên Lôi Giáng** `thien-loi` | mỗi 4 s sét đánh quái máu cao nhất trên màn hình, 120 sát thương + văng 40 vùng 1 ô | L2 +30% sát thương · L3 đánh thêm quái máu cao thứ 2 · L4 hồi 3,2 s · L5 +50% sát thương, choáng 1 s (tinh anh 0,3 s) | cột sét trắng xanh từ trên trời, vòng nổ trên đất |
| 12 | **Lá Bùa Bay** `la-bua` | mỗi 2,5 s 2 lá bùa tự tìm quái, dính vào rồi nổ sau 1 s, vùng 1,2 ô, 28 sát thương | L2 +1 bùa · L3 +30% sát thương · L4 +1 bùa, vùng +20% · L5 nổ để lại ấn 2 s: quái trong ấn chậm 30%, nhận +20% sát thương | lá bùa giấy vàng chữ đỏ bay lượn, nổ thành ấn tròn vàng |

### 5.4 Chiêu cuối (Q, hồi 45 giây)

Dùng lại kỹ năng tướng ở thế giới mở và hình hiệu ứng `fx-<mã tướng>.png` đã vẽ:

| Tướng | Chiêu ngục |
|---|---|
| Thạch Lâm · Tường khiên | 6 s nhận ít hơn 50% sát thương, lúc bật đẩy lùi mọi quái trong 3 ô |
| Kim Hạ · Đào thần tốc | hút mọi Hồn tinh trên đấu trường, 8 s Hồn tinh ×2 XP |
| Phong Vũ · Thần tốc | 5 s +60% tốc chạy, xuyên qua quái và gây 40 sát thương mỗi con chạm |
| Lam Nguyệt · Mưa sao băng | 12 sao băng rơi khắp màn hình, mỗi sao 150 sát thương vùng 2 ô |
| Hỏa Kỳ · Long hống | hồn rồng gầm hình nón 6 ô: 200 sát thương, quái trúng −30% sát thương trong 8 s |

### 5.5 Nội tại (9)

| Nội tại · mã | Mỗi cấp | Cấp 5 thêm |
|---|---|---|
| **Tâm Thép** `tam-thep` | +10% HP tối đa, +0,3 HP/s | tổng +50% HP, 1,5 HP/s |
| **Giáp Hắc Thạch** `giap-hac-thach` | −4% sát thương nhận | trúng đòn mất >10% HP thì bất tử 0,5 s (hồi 5 s) |
| **Giày Gió** `giay-gio` | +7% tốc chạy | tổng +35% |
| **Nam Châm Hồn** `nam-cham-hon` | +30% tầm hút (gốc 1,5 ô), +3% XP | tầm 3,75 ô, +15% XP |
| **Tụ Lực** `tu-luc` | +8% sát thương | tổng +40% |
| **Tốc Pháp** `toc-phap` | −6% thời gian hồi | tổng −30% |
| **Khai Không** `khai-khong` | +8% vùng và thời gian hiệu lực | tổng +40% |
| **Song Ảnh** `song-anh` | cấp 1/3/5: +5% sát thương; cấp 2/4: +1 đạn/lưỡi/kiếm cho mọi kỹ năng có số lượng | tổng +2 đạn, +15% sát thương |
| **Linh Khế** `linh-khe` | thú cưng +15% sát thương và máu, thời gian nghỉ −15% | thú tự nhặt Hồn tinh, hiệu ứng `bonus` của thú ×1,5 |

### 5.6 Tiến hóa (11)

| Tiến hóa | Công thức | Hiệu ứng | Hình ảnh |
|---|---|---|---|
| **Bánh Xe Luân Hồi** | Lưỡi Liềm Xoay 5 + Khai Không | vành 8 lưỡi bán kính 3 ô xoay liên tục, 30 sát thương, đẩy lùi | bánh xe bạc lớn có nan lưỡi, chữ cổ phát sáng |
| **Lưới Sấm Cửu Thiên** | Lôi Châm 5 + Tốc Pháp | nhảy 12 quái, để lưới điện 2 s làm chậm 50% | lưới sét tím phủ mặt đất |
| **Kim Cang Trận** | Bùa Trấn Tà 5 + Tâm Thép | vòng 3 ô, 35 sát thương/giây, hồi 0,5 HP mỗi quái trúng (tối đa 15 HP/s) | vòng kim cương vàng chói nhiều lớp, cột sáng |
| **Bão Đao Bạc** | Phi Đao Bạc 5 + Song Ảnh | 8 dao xoắn ốc liên tục quanh tướng, xuyên 3, 18 sát thương | cơn lốc dao bạc |
| **Thiên Kiếm Trận** | Ngự Kiếm 5 + Tụ Lực | 12 kiếm xếp vòng trên đầu, lần lượt phóng xuống, 50 sát thương | vòng kiếm xanh ngọc trên không |
| **Hồ Lô Thôn Thiên** | Hồ Lô Hút Hồn 5 + Nam Châm Hồn | hố hút 5 ô trong 4 s, 40/giây, nổ 300; hút cả Hồn tinh trên màn hình | hồ lô lớn mở nắp, xoáy đen viền xanh lục |
| **Thạch Kiếm Phá Sơn** (Thạch Lâm) | Trảm Kiếm Vương 5 + Giáp Hắc Thạch | mỗi nhát chém phóng sóng đá 6 ô, 60 sát thương, choáng 0,3 s | sóng đá xám bạc trồi lên theo đường chém |
| **Cuốc Vàng Đào Mạch** (Kim Hạ) | Cuốc Bay 5 + Nam Châm Hồn | 4 cuốc; chỗ cuốc chạm đất bùng mạch vàng vùng 1,5 ô, 50 sát thương; quái chết 5% rơi đồng vàng | mạch vàng nứt sáng trên đất |
| **Vó Ngựa Sấm Rền** (Phong Vũ) | Giáo Xung Phong 5 + Giày Gió | thêm: mỗi 4 s 3 kỵ binh hồn lao ngang 12 ô, 80 sát thương, đẩy lùi | kỵ binh ánh xanh lam trong suốt, bụi vó |
| **Nguyệt Thực** (Lam Nguyệt) | Tinh Đạn 5 + Khai Không | 5 sao; mỗi 6 s một vầng trăng rơi xuống, 200 sát thương vùng 3 ô | trăng lưỡi liềm bạc lớn rơi, vòng ánh trăng |
| **Roi Long Hỏa** (Hỏa Kỳ) | Roi Lửa 5 + Linh Khế | roi thành rồng lửa bay vòng 3 ô quanh tướng, 40 sát thương mỗi 0,5 s; thú cưng +30% sát thương khi rồng còn | rồng lửa nhỏ uốn lượn, lõi trắng |

Cả 9 nội tại đều có ít nhất một công thức dùng tới.

## 6. Bản đồ Địa Ngục

### 6.1 Chung

- Mỗi lượt một **đấu trường 128×128 ô**, viền là vách bazan và biển dung nham (không đi qua). Tướng xuất hiện trên **Tế đàn** ở giữa.
- Dung nham: quân đi bộ không qua được, quái bay qua được. Cầu xương / cầu đá bắc qua sông nham tạo điểm nghẹt.
- Nền vẽ bằng **trình vẽ map có sẵn** (`tools/mapgen/scene.mjs`, 16 px/ô) với một bảng màu và quần xã mới, dựng trước thành ảnh chunk như map thường (`client/assets/map/hell-1..3/`). Sheet nền (mục 9) là ảnh mẫu chất liệu và màu để chỉnh trình vẽ, cộng 1 hàng dung nham chảy 8 khung.
- Bảng màu: bazan đen nâu `#2a1416`, đá đỏ thẫm `#5a1a1e`, hắc thạch `#1a1020` ánh tím, tro `#4a3a3a`, xương `#d8cbb0`, dung nham `#ff5a1a` / `#ffb02a` / lõi `#fff0a0`.
- Không khí (client tự vẽ): tàn lửa bay lên, viền màn hình tối đỏ, mặt dung nham nhấp nháy.
- Vật cản đặt ngẫu nhiên theo hạt giống của lượt; mỗi đấu trường còn xoay / lật ngẫu nhiên nên lượt nào cũng hơi khác.

### 6.2 Ba đấu trường

| Đấu trường | Bố cục | Boss | Dùng cho |
|---|---|---|---|
| **Đồng Xương Cháy** | Rộng thoáng: cánh đồng xương, cột hắc thạch thưa, vài hồ dung nham nhỏ. Dễ chạy vòng. | Quỷ Vương Nham Thạch | Tầng 1–2 (và ngẫu nhiên từ Tầng 4) |
| **Ngã Ba Sông Nham** | 3 sông dung nham gặp nhau gần tâm, 6 cây cầu. Quái bay lợi thế, phải tính đường chạy. | Mẫu Hậu Tro Tàn | Tầng 2–3 |
| **Ngục Xích** | Nhà ngục đổ nát: tường gãy xếp ô bàn cờ, cột xích, lồng sắt; giữa là hố boss với 4 Cột Neo. | Ngục Chủ Xích Xiềng | Tầng 3+ |

### 6.3 Vật thể (mô hình đơn giản)

| Vật · mã | Chặn đường | Tương tác | Số trên một đấu trường |
|---|---|---|---|
| Cột hắc thạch `cot-hac-thach` | có | không | 30–60 |
| Cột xích `cot-xich` (cột sắt có xích treo) | có | không | 10–30 |
| Đống xương `dong-xuong` | không | không (trang trí) | 40–80 |
| Cọc sọ `coc-so` (cọc gỗ cháy cắm sọ) | có | không | 10–20 |
| Đá nham `da-nham` (đá đen nứt đỏ) | có | không | 30–50 |
| Tượng quỷ `tuong-quy` (tượng đá quỳ, gãy sừng) | có | không | 4–8 |
| **Lò lửa** `lo-lua` (2 trạng thái: cháy / vỡ) | có | đánh vỡ → rơi Bình Huyết / Nam Châm / Bùa Nổ / Cát Băng | 10–14, mọc lại sau 90 s |
| **Lồng Hồn** `long-hon` (2 trạng thái: kín / vỡ) | có | đánh vỡ → một **hồn lính** (loại quân mạnh nhất của mình ở thế giới mở, hình quân có sẵn tô xanh trong suốt) đánh cùng 45 s | 4 |
| **Mạch phun nham** `mach-phun` (2 trạng thái: âm ỉ / phun) | không | mỗi 12 s phun vùng 2 ô (vòng báo 1 s), trúng cả quái | 6–10 |
| **Tế đàn** `te-dan` (2 trạng thái: ngủ / sáng) | không | chỗ xuất hiện; Cổng thoát mở ở đây | 1 |
| **Cột Neo** `cot-neo` (2 trạng thái: nguyên / gãy) | có | chỉ ở trận Ngục Chủ, 3 000 máu | 4 |
| Cầu xương `cau-xuong` | không | ô đi được trên dung nham (vẽ trong trình vẽ map) | 6 |

## 7. Phần thưởng mang về thế giới mở

Tính cho lượt **trọn vẹn** (sống 15 phút + hạ boss), **một người**, nhân với hệ số Tầng F (mục 2.7). Sống không trọn thì tài nguyên và XP tính theo phút sống. Tổ đội: **mỗi người** nhận đủ phần của mình (như luật tổ đội ở bãi quái), vì quái đã đông hơn theo số người.

| Thưởng | Cách tính | Tầng 1 trọn vẹn | Tầng 6 trọn vẹn (×5,5) |
|---|---|---|---|
| Vàng | 30 / phút + đồng vàng nhặt | ~450 | ~2 500 |
| Dầu đen | 4 / phút | 60 | 330 |
| Pha lê | 1,5 / phút | 22 | 120 |
| Kim cương | hạ boss: 3 | 3 | 16 |
| XP tướng | 20 / phút + tinh anh 40 + boss 400 | ~860 | ~4 700 |
| Bột (mài đồ) | cuối lượt | 3 Bột Lam Ngọc | 8 Bột Lam Ngọc, 4 Bột Tử Tinh, 2 Bột Kim Hỏa |
| Than Hồn | 1 / 40 quái + tinh anh 8 + boss 30 | ~150 | ~800 |
| Trang bị | Rương tinh anh: 1 món · Rương boss: 2 món | 6 món | 6 món, tier cao hơn |

Bảng độ hiếm trang bị trong Rương (cấp món đồ = cấp tướng, như đồ rơi hiện tại):

| | Xanh lá | Xanh dương | Tím | Cam | Đỏ |
|---|---|---|---|---|---|
| Rương tinh anh, Tầng 1–2 | 40% | 45% | 15% | – | – |
| Rương tinh anh, Tầng 3–4 | 15% | 50% | 32% | 3% | – |
| Rương tinh anh, Tầng 5–6 | – | 35% | 52% | 13% | – |
| Rương boss, Tầng 1–2 | – | 50% | 42% | 8% | – |
| Rương boss, Tầng 3–4 | – | 30% | 52% | 17% | 1% |
| Rương boss, Tầng 5–6 | – | 10% | 55% | 32% | 3% |

So sánh để giữ kinh tế: dọn một bãi quái cấp 10 cho 30 pha lê + 10 kim cương; một boss thế giới cho 400 vàng, 120 dầu, 50 dầu đen, 20 pha lê. Một lượt Tầng 1 (15 phút) đáng khoảng một boss thế giới; Tầng 5–6 đáng 3–5 boss nhưng khó hơn nhiều và giới hạn bởi Vé Ngục (4 vé tối đa, 1 vé / 6 giờ).

### 7.1 Luyện thú (dùng Than Hồn)

Thêm vào bảng Thú cưng: mỗi thú có **cấp Hỏa luyện 0–10** (lưu trong `heroProg`, theo tài khoản).

| Cấp | Giá (Than Hồn) | Hiệu quả (cả thế giới mở và ngục) |
|---|---|---|
| 1–10 | 60 × cấp (tổng 3 300) | mỗi cấp +4% máu và sát thương dạng chiến đấu của thú |
| 5 | | hiệu ứng `bonus` cả đội của thú ×1,25 |
| 10 | | hiệu ứng `bonus` ×1,5; thú có viền lửa đỏ |

Tổng 3 300 Than Hồn ≈ 20 lượt Tầng 1 hoặc ~7 lượt Tầng 4 cho một thú lên 10.

## 8. Số liệu (lượt cân bằng đầu tiên)

### 8.1 Tướng vào ngục

Chỉ số ở thế giới mở (gốc + trang bị + điểm tiềm năng) chênh nhau rất xa, nên khi vào ngục được **nén lại**:

- HP ngục = 900 × H, với `H = clamp(√(HP thế giới mở / 900), 1, 3)`.
- Hệ số sát thương D = `clamp(√(ATK thế giới mở / 28), 1, 3)`, nhân vào mọi kỹ năng.
- Giáp: lấy giáp thế giới mở × 0,5 (tối đa 40%). Tốc chạy: lấy gốc của tướng (2,4; Phong Vũ 2,8), cộng trang bị tốc độ × 0,5.
- **Sức mạnh S = √(H × D)**, hiện ở bảng Cổng để gợi ý Tầng (mục 2.7).
- Không hồi máu tự nhiên (chỉ Tâm Thép, Bình Huyết, thú cưng, Kim Cang Trận).

### 8.2 Quái theo thời gian

- Máu: `HP = gốc × (1 + 0,12·m + 0,012·m²) × Tầng_HP × tổ_HP` (m = phút). Phút 5: ×1,9 · phút 10: ×3,4 · phút 15: ×5,5.
- Sát thương: `gốc × (1 + 0,06·m) × Tầng_dmg`. Phút 15: ×1,9. Mỗi quái đánh tối đa 1 lần/giây khi chạm.
- Số quái sống mục tiêu: `min(trần, (25 + 18·m) × tổ_SL)`. Trần: 320 (1 người), 480 (2–5 người).
- Tổ đội n người: `tổ_SL = 1 + 0,55·(n−1)` (số quái), `tổ_HP = 1 + 0,15·(n−1)` (máu quái thường), tinh anh và boss `1 + 0,8·(n−1)`.
- Đợt Vòng vây (phút 3, 8, 12): 40 / 70 / 100 quái thường cùng loại hiện một lượt thành vòng bán kính 12 ô quanh tướng và khép lại.

### 8.3 XP

- Cần để lên cấp L → L+1: cấp 1–19: `6 + 7·(L−1)`; từ cấp 20: `140 + 12·(L−20)`.
- Tổng tới cấp 20: ~1 300 XP; tới cấp 40: ~6 400 XP.
- Một người trọn 15 phút hạ khoảng 3 500–4 000 quái (trung bình ~1,7 XP mỗi con) → khoảng cấp 38–42.
- Tổ đội: mỗi viên Hồn tinh ai nhặt cũng chia cho **mọi thành viên còn sống**, mỗi người nhận `giá trị × 1,1 / tổ_SL`. Vì quái đông hơn `tổ_SL` lần nên mỗi người lên cấp nhanh hơn một người chơi khoảng 10%.

### 8.4 Sát thương kỹ năng cấp 1 và cấp 5 (chưa nhân D, Tụ Lực)

| Kỹ năng | Sát thương/giây ước tính cấp 1 | cấp 5 | Ghi chú |
|---|---|---|---|
| Trảm Kiếm Vương | 20 (mỗi quái trong quạt) | ~55 | đánh vùng gần |
| Cuốc Bay | 11 × số quái trên đường | ~45 × số quái | xuyên |
| Giáo Xung Phong | 22 | ~85 | đường thẳng |
| Tinh Đạn | 18 | ~75 | tự tìm, vùng nhỏ |
| Roi Lửa | 20 + cháy 18 | ~70 + cháy 40 | |
| Lưỡi Liềm Xoay | ~14 | ~80 | sát thương vùng quanh người |
| Lôi Châm | 30 tổng (3 con) | ~190 tổng | |
| Bùa Trấn Tà | 8 mỗi quái | 18 mỗi quái | vùng nhỏ |
| Phi Đao Bạc | 17 | ~85 | |
| Mưa Băng Tiễn | 24 | ~120 | khống chế |
| Chuông Trấn Hồn | 6 mỗi quái | ~22 mỗi quái | đẩy lùi |
| Ngự Kiếm | 24 | ~150 | khắc tinh anh |
| Địa Chấn Quyền | 10 mỗi quái | ~50 mỗi quái | |
| Hồ Lô Hút Hồn | 7,5 mỗi quái | ~45 mỗi quái | gom quái |
| Quạt Ba Tiêu | 5 mỗi quái | ~16 mỗi quái | đẩy, xóa đạn |
| Thiên Lôi Giáng | 30 (1 con) | ~140 (2 con) | khắc tinh anh, boss |
| Lá Bùa Bay | 22 | ~110 | |

Mục tiêu: bộ 5 chủ động cấp 5 + Tụ Lực 5 với D = 1 đạt ~1 500 sát thương/giây lên một mục tiêu đơn, ~6 000 tổng lên đám đông. Boss Tầng 1 (60 000 máu) chết trong khoảng 40–60 giây khi đi một mình.

### 8.5 Số quái và mức áp lực

| Phút | Quái sống (1 người) | Máu Quỷ Tro | Máu Cự Nham | Quái chạm cùng lúc để hạ tướng 900 HP trong 5 s |
|---|---|---|---|---|
| 1 | 43 | 14 | – | 34 Quỷ Tro |
| 5 | 115 | 23 | 760 | 28 |
| 10 | 205 | 41 | 1 360 | 22 |
| 14 | 277 | 60 | 2 010 | 20 |

### 8.6 Mục tiêu cân bằng (cho mô phỏng giai đoạn 4)

- Tầng ứng với S đề nghị: người chơi bình thường sống tới phút 14 khoảng **60–70%**, hạ boss **40–55%**.
- Tầng thấp hơn S một bậc: hạ boss ≥ 85%.
- Không có cặp kỹ năng nào cho tỉ lệ hạ boss cao hơn bộ trung bình quá 20 điểm phần trăm.
- Không tướng nào lệch tỉ lệ hạ boss quá ±10 điểm so với trung bình 5 tướng.

## 9. Hình vẽ cần làm

Prompt ở `docs/design/samples/hell/prompts/`, **mỗi file một sheet** (danh sách đầy đủ: `docs/design/samples/hell/README.md`). Ảnh lưu vào `docs/design/samples/hell/sprite-pixels/`. Cách làm như mọi lần: mỗi ảnh một cuộc trò chuyện mới, gửi kèm ảnh Kiếm sĩ đã duyệt `docs/design/samples/army/sprite-pixels/kiem-si.png`, nền magenta `#FF00FF`, gửi lại dạng **File PNG**.

| Nhóm | Sheet | Số file | Ô | Bố cục |
|---|---|---|---|---|
| Quái thường | `01`–`14` (mỗi quái một file) | 14 | 128 (bầy) · 160 (vừa) · 192 (to) | 8 hướng × 5 tư thế |
| Tinh anh | `15`–`18` | 4 | 192 | 8 hướng × 5 tư thế |
| Boss | `19`–`21` | 3 | 256 | 8 hướng × 7 tư thế (hoạt ảnh nhiều khung gửi sau khi duyệt) |
| Hiệu ứng kỹ năng | `fx-01`–`fx-07` | 7 | 256 | 8 khung × 4 hàng (mỗi hàng một kỹ năng) |
| Hiệu ứng quái, boss | `fx-08`–`fx-10` | 3 | 256 | 8 khung × 4–5 hàng |
| Hiệu ứng bản đồ | `fx-11` | 1 | 256 | 8 khung × 4 hàng (mạch phun, tường lửa, cổng thoát, xoáy Cổng Địa Ngục) |
| Vật phẩm nhặt | `vat-pham` | 1 | 64 | 8 × 3 |
| Biểu tượng kỹ năng | `icon-ky-nang` | 1 | 64 | 8 × 5 (37 kỹ năng + 3 nút) |
| Khung thẻ | `the-ky-nang` | 1 | 192×288 | 5 × 1 |
| Nền đấu trường (mẫu chất liệu + dung nham chảy) | `nen-dia-nguc` | 1 | 128 | 8 × 3 |
| Vật thể | `vat-the-1` (trang trí), `vat-the-2` (tương tác, 2 trạng thái) | 2 | 192 · 256 | 6 × 3 · 5 × 2 |
| Cổng Địa Ngục | `cong-dia-nguc` | 1 | 768×640 | 1 hình |
| **Tổng** | | **39** | | |

Tướng và thú cưng dùng hình có sẵn. Chiêu cuối dùng `fx-<mã tướng>.png` có sẵn. Hồn lính dùng hình quân có sẵn tô xanh trong suốt.

**Thứ tự vẽ đề xuất** (bản chơi thử chỉ cần 17 sheet): Cổng Địa Ngục · nền · vật thể 1–2 · vật phẩm · icon · khung thẻ · quái 01, 02, 04, 05, 06, 07 · tinh anh 15 · boss 19 · fx-01, fx-02, fx-03 → sau đó phần còn lại.

## 10. Còn để ngỏ

- Hệ số nén chỉ số tướng (căn bậc hai, trần ×3) cần kiểm với dải chỉ số trang bị thật ở cấp 30–100.
- Có nên cho tổ đội **ghép tự động** (người lạ cùng Tầng) không. Đề xuất: chưa, nhóm chơi nhỏ.
- Thu nhập mỏ 100% trong lúc ở ngục có thể bị lạm dụng như "AFK an toàn". Trần 25 phút mỗi lượt giới hạn việc này.
- Hồn lính lấy loại quân mạnh nhất: Rồng có thể quá mạnh trong 45 giây; có thể giới hạn tối đa Hiệp sĩ.

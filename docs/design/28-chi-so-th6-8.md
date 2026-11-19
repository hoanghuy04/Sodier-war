# 28. Bộ chỉ số cân bằng cho Thành trì 6–8 (16/11/2026)

Trạng thái: **đề xuất, chưa code**. Thay số liệu tạm trong `27-thanh-tri-6-8.md`.

## 1. Cách cân bằng

### Mô hình
`tools/balance/thmodel.mjs`, tham số ở `tools/balance/th6-8.json`.

Chạy: `P="$(cat tools/balance/th6-8.json)" node tools/balance/thmodel.mjs`

Mô hình kiểu Lanchester:

- **Quân đánh:** sức mạnh = tổng sát thương mỗi giây × tổng máu hiệu dụng (máu ÷ (1 − giáp)).
  - Quân lấy đủ sức chứa Doanh trại, trộn đều các loại đã mở.
  - Cấp lính tối đa theo Thành trì.
- **Căn cứ thủ:** sức mạnh = tổng sát thương tháp × tổng máu (công trình + Thành trì + ¼ tường).
  - Cộng thêm lính Hội thành và 40% quân của chủ nhà, giống bài test ở docs/design/26.
  - Trừ sát thương bẫy.
  - Nổ vùng, quân bay / không bay, khắc chế lớp quân lấy từ `shared/balance.js`.
- **Chỉ số S** = sức mạnh quân đánh ÷ sức mạnh căn cứ, cùng cấp Thành trì. S > 1 là quân đánh có lợi.

### Mốc chuẩn
Lấy đúng số liệu đang chạy trên server:

| Thành trì | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| S hiện tại | 0,57 | 0,95 | 1,08 | 2,06 | **2,62** |

TH5 (S = 2,62) là mức đã chỉnh bằng mô phỏng engine thật hôm 13/11: quân đánh thắng khoảng 75–90%.

### Mục tiêu cho TH6–8
- S giữ quanh 2,6–2,8, ngang TH5.
- Lên 1 cấp Thành trì vẫn mạnh hơn rõ.
- Lính mới, công trình mới mạnh tương đương đồ cũ cùng tầm, không phá vỡ.

### Kết quả với bộ số dưới đây

| Thành trì | 5 | 6 | 7 | 8 |
|---|---|---|---|---|
| Sức chứa quân | 1.200 | 1.500 | 1.800 | 2.100 |
| S cùng cấp | 2,62 | **2,70** | **2,82** | **2,81** |
| Quân TH(n+1) đánh nhà TH(n) | 6,2 | 4,96 | 4,72 | 5,47 |
| Quân TH(n) đánh nhà TH(n+1) | 0,87 | 1,46 | 1,62 | 1,46 |

**Nhận xét**
- Cân bằng công / thủ ở TH6–8 giữ ngang TH5 (chênh dưới 8%).
- Quân hơn 1 cấp thì đánh nhà dưới rất dễ (S khoảng 5).
- Ngược lại, nhà hơn 1 cấp không còn "bất khả xâm phạm" như TH4 → TH5 (1,46 so với 0,87), vì sức chứa quân chỉ tăng 25%/cấp thay vì 60%.
  - Mình chọn vậy để giữ số lính trên bản đồ vừa phải: TH8 2.100 chỗ, khoảng 900 lính mỗi người.
  - Muốn nhà cấp cao "cứng" hơn với quân cấp dưới thì phải tăng mạnh cả hai phía, quân lên khoảng 4.000+ chỗ, nặng server.

Mô hình chỉ là ước lượng. Sau khi code xong sẽ chạy lại bằng engine thật như docs/design/26 rồi chỉnh.

## 2. Thành trì

| | TH5 (hiện tại) | TH6 | TH7 | TH8 |
|---|---|---|---|---|
| Máu | 10.500 | 13.500 | 17.000 | 21.000 |
| Sức chứa (×STORE_MULT) | 7 | 9 | 11,5 | 14 |
| Thời gian nâng (gốc, game ×2) | 5.400 s | 7.200 s | 10.800 s | 14.400 s |
| Thợ xây tối đa | 3 | 3 | 4 | 4 |

Giá nâng Thành trì và công trình tính theo sức chứa như hiện tại (`scaleToStore`), nên tự tăng.

## 3. Công trình cũ lên cấp 6–8

- **Hệ số máu / sát thương theo cấp** (`B_LEVEL_MULT`): cấp 1–5 giữ [1,45 · 1,8 · 1,9 · 1,92 · 2,0], thêm **cấp 6 = 2,3, cấp 7 = 2,5, cấp 8 = 2,7**.
- **Thời gian nâng cấp 6 / 7 / 8:** 5.400 / 7.200 / 10.800 s gốc (trong game 3 / 4 / 6 giờ).
- **Hội thành:** sức chứa lính cấp 6 / 7 / 8 = 96 / 112 / 128 (cấp 5: 80).
- **Doanh trại:** vẫn tối đa 3 cái. Sức chứa cấp 6 / 7 / 8 = 500 / 600 / 700 mỗi cái (cấp 5: 400).

Số lượng tối đa:

| Công trình | TH5 | TH6 | TH7 | TH8 |
|---|---|---|---|---|
| Tháp cung | 6 | 7 | 7 | 8 |
| Pháo đá | 4 | 5 | 5 | 6 |
| Tháp phép | 3 | 4 | 4 | 5 |
| Tường | 300 | 350 | 400 | 450 |
| Bom / Lò xo / Bom khí | 6 / 3 / 3 | 7 / 3 / 4 | 8 / 4 / 4 | 8 / 4 / 5 |
| Kho | 3 | 3 | 4 | 4 |
| Doanh trại | 3 | 3 | 3 | 3 |
| Cối pháo | – | 1 | 2 | 2 |
| Tháp phòng không | – | 1 | 2 | 2 |
| Nỏ Thần | – | – | 1 | 2 |
| Cột sét ẩn | – | – | 2 | 3 |
| Pháo chùm | – | – | – | 1 |
| Tháp Hỏa Ngục | – | – | – | 1 |
| Bệ Vua / Bệ Nữ hoàng | – | 1 / – | 1 / – | 1 / 1 |

## 4. Công trình mới

- Mỗi công trình mới có 3 cấp. Cấp 2 ×1,25, cấp 3 ×1,5 máu và sát thương.
- Cấp tối đa: cấp 2 ở Thành trì vừa mở nó, cấp 3 từ Thành trì sau. Pháo chùm và Hỏa Ngục dừng ở cấp 2 tới TH9.

Chỉ số cấp 1:

| | Chân đế | Máu | Giáp | Sát thương | Hồi | Tầm | Đặc biệt |
|---|---|---|---|---|---|---|---|
| Cối pháo | 3×3 | 2.520 | 0,2 | 280 | 5 s | 4–11 | Nổ vùng 1,8 ô. Không bắn bay. Vùng chết 4 ô |
| Tháp phòng không | 3×3 | 2.240 | 0,2 | 490 | 1 s | 10 | Chỉ bắn bay |
| Nỏ Thần | 3×3 | 3.500 | 0,3 | 42 | 0,25 s | 12 | Bắn bộ + bay, 1 mục tiêu |
| Cột sét ẩn | 2×2 | 1.260 | 0,1 | 112 | 1,6 s | 7 | Ẩn tới khi địch vào 6 ô. Sét lan thêm 2 mục tiêu (mỗi lần lan −30%) |
| Pháo chùm | 3×3 | 4.200 | 0,3 | 350 + mảnh 50% | 4 s | 3–10 | Mảnh văng hình nón 4 ô ra sau mục tiêu, trúng cả bay |
| Tháp Hỏa Ngục | 2×2 | 3.080 | 0,25 | 40 → 400 /s | liên tục | 8 | Tia 1 mục tiêu, sát thương ×10 sau 4 s bám liền. Đổi mục tiêu là về lại 40 |

Đối chiếu sức mạnh mỗi cái ở cấp tối đa của TH đó (sát thương / giây hiệu dụng):

| Công trình | TH | Sát thương / giây hiệu dụng |
|---|---|---|
| Pháo đá | 6 | khoảng 110 |
| Cối pháo | 6 | khoảng 220 |
| Tháp cung | 7 | khoảng 35 |
| Nỏ Thần | 7 | khoảng 210 |
| Tháp phép | 8 | khoảng 180 |
| Pháo chùm | 8 | khoảng 270 |

Công trình mới bằng khoảng 1,5–6 tháp cũ, đúng vai "công trình chủ lực" của cấp mới. Phòng không yếu với quân bộ (0), rất mạnh với quân bay.

## 5. Tướng giữ nhà

| | Mở | Máu | Giáp | Sát thương | Hồi | Tầm | Vùng canh | Chiêu |
|---|---|---|---|---|---|---|---|---|
| Vua Thành | TH6 | 12.600 | 0,3 | 308 (nổ vùng 1 ô) | 1,4 s | 1,2 | 12 ô | Nộ Vương: choáng 3 ô 2 s, hồi 25% máu (hồi chiêu 20 s) |
| Nữ hoàng Băng | TH8 | 7.000 | 0,2 | 252 | 0,9 s | 8 | 13 ô | Bão Tuyết: tàng hình 3 s + mũi băng xuyên hàng ×3 sát thương (hồi chiêu 25 s). Mỗi mũi làm chậm 30% |

- **Cấp tướng:** 1–20. Mỗi cấp +5% máu và sát thương (cấp 10 ×1,45, cấp 20 ×1,95).
- **Tối đa:** TH6 → Vua 10; TH7 → Vua 15; TH8 → Vua 20, Nữ hoàng 10.
- **Nâng cấp:** bằng vàng + kim cương, tốn 1 thợ. Tướng đang nâng thì không ra đánh.
- **Bị hạ:** về bệ hồi 10 phút.

## 6. Lính

- **Hệ số máu / sát thương theo cấp** (`UNIT_LV_MULT`): cấp 1–5 giữ [1 · 1,15 · 1,3 · 1,45 · 1,6], thêm **cấp 6 = 1,7, cấp 7 = 1,8, cấp 8 = 1,9**.
- **Giá mua mỗi cấp** (`UNIT_LV_COST`): cấp 6–8 = 1,5 / 1,6 / 1,7.
- **Nghiên cứu cấp 6 / 7 / 8:** 21.600 / 32.400 / 43.200 s (6 / 9 / 12 giờ).

Cấp tối đa theo Thành trì:

Lính có hình cấp mới thì mở cấp mới. Lính **không** vẽ thêm thì giữ cấp cuối hiện tại, nhưng Học viện mở **Tinh luyện ★1 / ★2 / ★3** cho cấp cuối ở TH6 / 7 / 8 (yêu cầu chủ game 16/11):
- Hình giữ nguyên, thêm 1–3 ngôi sao trên đầu.
- Mỗi ★ cho chỉ số đúng bằng lên thêm 1 cấp, nên cân bằng không đổi so với mô hình.
- TH5 trở xuống không bị ảnh hưởng.

| Lính | TH5 | TH6 | TH7 | TH8 | Cách lên |
|---|---|---|---|---|---|
| Cung thủ | 5 | 6 | 7 | 8 | cấp mới (đã có hình 6–8) |
| Hiệp sĩ, Pháp sư | 4 | 5 | 6 | 7 | cấp mới (đã có hình 5–7) |
| Rồng | 2 | 2 | 3 | 4 | cấp mới (đã có hình 3–4) |
| Dân quân, Kiếm sĩ, Lính giáo, Kỵ binh | 5 | 5★1 | 5★2 | 5★3 | tinh luyện cấp 5 (★3 = sức mạnh cấp 8) |
| Máy bắn đá lửa | 3 | 3★1 | 3★2 | 3★3 | tinh luyện cấp 3 (★3 = sức mạnh cấp 6) |
| Sư thứu | 2 | 2★1 | 2★2 | 2★3 | tinh luyện cấp 2 (★3 = sức mạnh cấp 5) |
| Công binh | – | 2 | 3 | 4 | lính mới (đã có hình 1–4) |
| Y sư | – | – | 2 | 3 | lính mới (đã có hình 1–3) |
| Voi chiến | – | – | – | 2 | lính mới (đã có hình 1–2) |

Hệ số ★ theo cấp nền:

| Lính | ★1 | ★2 | ★3 |
|---|---|---|---|
| Lính cấp nền 5 (Dân quân, Kiếm sĩ, Lính giáo, Kỵ binh) | ×1,7 | ×1,8 | ×1,9 |
| Máy bắn đá lửa (cấp nền 3) | ×1,45 | ×1,6 | ×1,7 |
| Sư thứu (cấp nền 2) | ×1,3 | ×1,45 | ×1,6 |

### Lính mới
Số gốc, game tự ×1,5 như mọi lính (`UNIT_POWER`).

| | Lớp | Chỗ ở | Máu | Giáp | Sát thương | Hồi | Tầm | Tốc độ | Giá |
|---|---|---|---|---|---|---|---|---|---|
| Công binh | Bộ binh | 2 | 90 | 0 | 300 một lần, nổ 1,5 ô, ×4 tường, ×2 công trình | – | 0,8 | 2,6 | 120 sắt, 60 than, 20 dầu |
| Y sư | Phép | 5 | 260 | 0,1 | Không đánh. Hồi 24 máu / s cho 3 lính yếu nhất trong 5 ô (tướng ½) | 1 s | 5 | 2,0 | 150 vàng, 30 pha lê |
| Voi chiến | Công thành | 10 | 3.200 | 0,35 | 70, giẫm vùng 1,2 ô, ×2 công trình (+ tên 10 tầm 5) | 1,6 s | 1,2 | 1,6 | 600 sắt, 300 vàng, 100 dầu, 15 kim cương |

Đối chiếu mỗi chỗ ở, cấp tối đa TH8:

| Lính | Máu hiệu dụng / chỗ | Sát thương công trình / chỗ |
|---|---|---|
| Hiệp sĩ cấp 7 | 605 | 14 |
| Rồng cấp 4 | 816 | 27 |
| Voi chiến cấp 2 | 849 | 38 |

Voi là lính chủ lực đắt nhất, mạnh hơn Hiệp sĩ khoảng 1,4 lần mỗi chỗ, ngang Rồng nhưng không bay. Y sư không đánh, đổi lại giữ quân sống lâu.

## 7. Ảnh hưởng tới phần khác (cần xem tiếp)

- **Boss và bãi quái:** quân TH8 mạnh khoảng gấp 2,2 lần TH5 (sát thương × máu). Boss cấp 8 sẽ dễ hơn nhiều. Đề xuất sau khi code: thêm boss cấp 9–10, hoặc tăng máu boss theo cấp.
- **Số lính trên bản đồ:** TH8 khoảng 900 lính mỗi người chơi. Cần đo tải server khi có nhiều người TH8.
- **Đồ của người thủ / người đánh** (BUILD_GEAR) giữ nguyên như TH5.

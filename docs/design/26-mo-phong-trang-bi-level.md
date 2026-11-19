# Mô phỏng hệ thống level trang bị: farm 1 ngày, đánh quái / boss / căn cứ (13/11/2026)

File Excel: `docs/design/excel/trang-bi-level.xlsx` (roll đã đổi thành 90–110% cho mọi màu).
Script mô phỏng nằm ngoài repo (scratchpad). Mọi trận đánh chạy bằng engine server thật (`server/game.js`).

## 1. Cách test

**5 giai đoạn người chơi.** Số quân lấy theo sức chứa Doanh trại của cấp Thành trì. Đối chiếu dữ liệu thật trên server: top hiện tại là tướng cấp 17–20, Thành trì 3, khoảng 135–200 chỗ quân, tức nằm giữa S2 và S3.

| Giai đoạn | Tướng | Thành trì | Quân (chỗ) | Cấp lính (Học viện) |
|---|---|---|---|---|
| S1 Mới chơi | 10 | 1 | 70 | 1 |
| S2 Đầu giữa | 30 | 2 | 198 | 2 |
| S3 Giữa | 50 | 3 | 299 | 3 |
| S4 Cuối | 70 | 4 | 750 | 4 |
| S5 Đỉnh | 100 | 5 | 1.200 | 5 |

**3 bộ đồ mỗi giai đoạn.** Cả 8 món cùng màu, level = level tướng, roll 100%.

| Giai đoạn | Thường gặp | Xịn |
|---|---|---|
| S1 | Vàng | Xanh lá |
| S2 | Xanh lá | Xanh dương |
| S3 | Xanh dương | Tím |
| S4 | Tím | Cam |
| S5 | Cam | Đỏ (và bản "thần": Đen) |

- Điểm tiềm năng: 30% máu, 30% tấn công, 10% mỗi loại tốc đánh / giáp / hút máu / né.
- Tướng: Thạch Lâm.
- Cách đánh: tướng đuổi mục tiêu gần nhất, không dùng kỹ năng, không điều khiển tay.
- Số trận: 459 trận quái và boss (mỗi kiểu 3 lần), 56 trận đánh căn cứ thật (căn cứ của mlem và DHH lấy từ save live).

## 2. Đánh bãi quái: quá dễ, đồ gần như không ảnh hưởng

| Giai đoạn | Bãi farm an toàn (mất 0–2% quân) | Bãi cao nhất qua được | Thời gian dọn 1 bãi |
|---|---|---|---|
| S1 | 4 | 6 (mất 9% quân) | 6 s |
| S2 | 7 | 8 (mất 8%) | 12 s |
| S3 | 8 | 10 (mất 10% nếu có đồ, 26% nếu không) | 13 s |
| S4–S5 | 10 | 10 | 8–10 s |

Có đồ hay không thì kết quả gần như giống nhau. Bãi quái hiện tại không phải thử thách, quân số mới là thứ quyết định.

## 3. Boss: rất khó, đồ tạo khác biệt lớn

Kết quả ghi theo dạng thắng / thua, kèm % quân mất. "chết" = cả tướng và quân đều bị hạ.

| Giai đoạn, đồ | Vua Thổ Phỉ cấp 1 | cấp 4 | cấp 8 | Golem cấp 1 | cấp 4 | cấp 8 |
|---|---|---|---|---|---|---|
| S2 không đồ | chết | chết | chết | chết | chết | chết |
| S2 Xanh lá | thắng, mất 91% | chết | chết | chết | chết | chết |
| S2 Tím (test thêm) | thắng, mất 77% | chết | chết | | | |
| S3 không đồ | thắng, mất 58% | chết | chết | chết | chết | chết |
| S3 Tím | thắng, mất 53% | chết | chết | chết | chết | chết |
| S3 Cam (test thêm) | | thắng, mất 82% | | thắng, mất 92% | | |
| S4 không đồ | thắng, mất 5% | thắng, mất 55% | chết | thắng, mất 55% | chết | chết |
| S4 Tím | thắng, mất 13% | thắng, mất 16% | thắng 2/3, mất 92% | thắng, mất 27% | thắng, mất 66% | chết |
| S4 Cam | thắng, mất 11% | thắng, mất 13% | thắng, mất 54% | thắng, mất 27% | thắng, mất 61% | chết |
| S5 không đồ | thắng, mất 13% | thắng, mất 25% | thắng, mất 57% | thắng, mất 28% | thắng, mất 60% | chết |
| S5 Cam | thắng, mất 0% | thắng, mất 16% | thắng, mất 28% | thắng, mất 0% | thắng, mất 28% | thắng, mất 63% |
| S5 Đỏ | thắng, mất 0% | thắng, mất 14% | thắng, mất 17% | thắng, mất 0% | thắng, mất 27% | thắng, mất 58% |
| S5 Đen | thắng, mất 0% | thắng, mất 1% | thắng, mất 17% | thắng, mất 0% | thắng, mất 27% | thắng, mất 31% |

S1 thua mọi boss.

**Kết luận về boss**
- Đề xuất buff boss / quái hôm qua là **không cần**: boss đã rất khó.
- Người chơi top hiện tại (khoảng S2–S3) chỉ hạ được boss cấp 1, và mất hơn nửa quân.
- Boss cấp 4 trở lên cần tới giai đoạn S4.

## 4. Đánh căn cứ thật

Kết quả ghi theo dạng: số tháp bị phá / thời gian / % quân tấn công mất.

| Tấn công | Căn cứ DHH (Thành trì 3, 180 tường, 7 tháp) | Căn cứ mlem (Thành trì 3, 132 tường, 7 tháp) |
|---|---|---|
| S2 không đồ / Xanh lá / Xanh dương | quân tấn công chết hết, phá 1/7 tháp | phá 7/7 tháp, không phá được Thành trì, chết hết |
| S3 không đồ | chết hết, phá 1/7 tháp | thắng sau 102 s, mất 70% |
| S3 Xanh dương | chết hết, phá 1/7 tháp | thắng sau 93 s, mất 64% |
| S3 Tím | chết hết, phá 1/7 tháp | thắng sau 85 s, mất 51–60% |

**Đồ của người thủ** (quân giữ nhà nhận phần chia từ đồ). Test: S3 mặc Xanh dương đánh căn cứ mlem.

| Đồ của người thủ | Quân tấn công mất |
|---|---|
| Không đồ | 55% |
| Xanh dương | 60% |
| Tím | 60–76% |
| Phần chia tối đa (+50% máu và sát thương) | 87% |

**Cuối game.** Hai căn cứ trên, nâng mọi công trình lên cấp 5.

| Tấn công | Căn cứ DHH | Căn cứ mlem |
|---|---|---|
| S4 không đồ | chết hết | thắng sau 97 s, mất 58% |
| S4 Tím | thắng sau 66–70 s, mất 65% | thắng sau 69–79 s, mất 29–39% |
| S5 không đồ | thắng sau 51 s, mất 45% | thắng sau 80 s, mất 31% |
| S5 Đỏ | thắng sau **18 s**, mất 11–14% | thắng sau 40–44 s, mất 6–8% |

**Kết luận về căn cứ**
- Giữa game: đồ không phá cân bằng. Căn cứ có tường kín như của DHH vẫn giữ được.
- Cuối game: đồ Đỏ làm đánh nhà rẻ hơn khoảng 3 lần. Một phần là do quân 1.200 chỗ, trong khi căn cứ chỉ có 7 tháp. Thành trì 5 thật được 13 tháp nên sẽ cứng hơn bản test.

## 5. Sức mạnh tướng theo đồ

Đồ level 100, 8 món cùng màu, so với tướng không đồ.

| Đồ | Máu | Tấn công | Quân nhận |
|---|---|---|---|
| Cam | ×2,2 | ×3,2 | +25% sát thương, +35% máu |
| Đỏ | ×2,5 | ×4,6 | +38% sát thương, +47% máu |
| Đen | ×3,0 | ×6,9 | +50% / +50% (chạm trần) |

- Tướng mạnh lên nhiều, nhưng theo ước tính chỉ chiếm khoảng 15% tổng sát thương của cả đội 1.200 chỗ (chưa đo riêng).
- Hút máu và né: đồ Tím level 70 cho khoảng 28%, đồ Cam level 70 chạm trần 30%.

## 6. Mô phỏng 1 ngày farm

**Giả định**
- 3 giờ chơi mỗi ngày, hiệu suất 60% (đi lại, nhặt đồ, chat).
- Cứ đủ 24 món thì về nhà cất đồ, mất 90 giây.
- Hạ boss trong khả năng: S2–S3 khoảng 1 con/ngày, S4 khoảng 6, S5 khoảng 13.
- Chạy 200 lần rồi lấy trung bình.

### 6a. Theo đúng bảng Excel hiện tại (bãi L rớt đồ level 10L−9 → 10L)

| Giai đoạn | Lượt dọn bãi / ngày | Món rớt / ngày | Món mặc được | Ghi chú |
|---|---|---|---|---|
| S1 (cấp 10, bãi 4) | 195 | 234 | **0** | Đồ level 31–40, tướng mới cấp 10 → lên cấp 22 cuối ngày |
| S2 (cấp 30, bãi 7) | 145 | 292 | **khoảng 3** | Đồ level 61–70 |
| S3 (cấp 50, bãi 8) | 98 | 236 | **khoảng 3** | Đồ level 71–80 |
| S4 (cấp 70, bãi 10) | 95 | 321 | 17 | |
| S5 (cấp 100) | 94 | 338 | 338 | 7 ô đã Cam+ |

**Vấn đề 1: level đồ chạy trước level tướng.**
- Người chơi đánh được bãi cao hơn nhiều so với level tướng: tướng cấp 10 đã dọn được bãi 4–6.
- Vì vậy 95–99% đồ rơi ra không mặc được, chỉ để nghiền.
- Lên cấp chậm: tướng 50 → 70 mất khoảng 11 ngày.

**Vấn đề 2: rớt quá nhiều.**
- Khoảng 80–110 món mỗi giờ. Túi 24 ô đầy sau mỗi 10–15 phút.
- S4 có đủ bột để rèn khoảng 90 lần Xanh dương → Tím và 30 lần Tím → Cam mỗi ngày. May là chi phí rèn khoảng 730.000 vàng + 5.800 kim cương nên tài nguyên sẽ chặn bớt.

### 6b. Theo đề xuất

Áp cả 3 thay đổi:
- Level đồ đi theo tướng (A).
- Số món rơi ×0,35 (B).
- Tỉ lệ Tím+ ở bãi quái ×0,25 (C).

| Giai đoạn | Món / ngày | Sau 1 ngày | Sau 7 ngày | Sau 14 ngày |
|---|---|---|---|---|
| S1 | 89 | 8 ô Xanh lá+, 6–7 ô Xanh dương | 8 ô Xanh dương | (đứng ở cấp 30 nếu chưa mở giới hạn) |
| S2 | 115 | 3–4 ô Tím | 8 ô Tím, 2–3 ô Cam | 4 ô Cam |
| S3 | 93 | 4 ô Tím | 8 ô Tím, 3 ô Cam | 5 ô Cam |
| S4 | 138 | 7 ô Tím, 2 ô Cam | 7–8 ô Cam, 1–2 ô Đỏ | 8 Cam, 2–3 Đỏ |
| S5 | 161 | 8 ô Tím, 4 ô Cam | 8 ô Cam, 4 ô Đỏ | 6 ô Đỏ, khoảng 1,4 món Đen rơi ra |

Chưa tính rèn: với TH4+ thì rèn từ bột sẽ đi nhanh hơn, nhưng bị giới hạn bởi tài nguyên.

## 7. Đề xuất

- **A. Level đồ đi theo level tướng.** Level đồ = level tướng của người hạ quái −6 … +2, nhưng không vượt level tối đa của bãi / boss (bãi L: tối đa 10L; boss cấp B: tối đa 30 + 10B).
  - Đánh bãi thấp thì ra đồ thấp.
  - Đánh bãi cao thì ra màu đẹp hơn, đúng level của mình.
  - Đồ mặc được ngay, không còn 99% đồ chỉ để nghiền.
- **B. Giảm số món rơi ở bãi quái xuống còn khoảng 1/3** (tỉ lệ rớt mỗi con ×0,35). Vẫn ra khoảng 30–50 món mỗi giờ, đủ bột để rèn, túi không đầy liên tục.
- **C. Giảm tỉ lệ Tím / Cam / Đỏ ở bãi quái còn 1/4.**
  - Phần bị bớt chuyển sang Xanh dương.
  - Boss giữ nguyên bảng hiện tại, thành nguồn đồ màu cao chính.
  - Nhịp: đủ bộ Tím sau khoảng 1 tuần, bộ Cam khoảng 2–3 tuần, Đỏ là mục tiêu dài hạn, Đen cực hiếm.
- **D. Không buff boss.** Boss đã đủ khó.
- **E. (Tuỳ chọn) Tăng máu bãi quái cấp 6–10 lên ×1,5–2.** Đồ và quân có ý nghĩa hơn khi farm. Bãi 1–5 giữ nguyên cho người mới.
- **F. (Tuỳ chọn) Tháp cấp 4–5 thêm sát thương.** Hoặc giữ nguyên nếu chấp nhận cuối game đánh nhà nhanh. Thành trì 5 thật có 13 tháp và bẫy nên sẽ cứng hơn bản test.

## 8. Giới hạn của mô phỏng

- Quân do mình chọn theo sức chứa Doanh trại. Người chơi thật có thể ít quân hơn hoặc lệch loại.
- AI đơn giản: không dùng kỹ năng, không rút lui, không đánh theo tổ đội.
- Chỉ test với tướng Thạch Lâm.
- Thời gian dọn bãi và đi lại là ước lượng. Thời gian đi lại lấy từ vị trí bãi thật trên bản đồ (khoảng cách trung bình giữa các bãi cùng cấp 49–70 ô).
- Căn cứ cuối game là căn cứ Thành trì 3 nâng hết lên cấp 5, chưa có thêm tháp như Thành trì 5 thật.

## 9. Đã áp dụng vào game (13/11/2026)

### Trang bị có level

Gồm đề xuất A, B, C. Code nằm ở `shared/balance.js`: `makeItem`, `restatItem`, `dropLv`, `CAMP_DROP_MULT`, `CAMP_HIGH_MULT`.

**Công thức chỉ số mỗi dòng**

Giá trị = chỉ số đồ Tím level 50 × 1,45^(phẩm chất − Tím) × (0,5 + 0,5 × level / 50) × roll 90–110%.

**Dòng phụ**
- Số dòng theo phẩm chất: Trắng 0, Vàng 0, Xanh lá 0–1, Xanh dương 1, Tím 1–2, Cam 2, Đỏ 2–3, Đen 3–4.
- Mỗi dòng chọn không trùng trong nhóm 4 loại riêng của từng ô.

**Mặc đồ**
- Tướng phải có cấp ≥ level đồ. Bot không bị giới hạn.
- Đồ chưa đủ cấp vẫn nhặt, cất, nghiền, rèn được.

**Level đồ khi rơi**
- Bằng level tướng của người hạ, lệch −6 … +2. 15% số món là đồ vượt cấp +3 … +10 (`DROP_OVER`), để có đồ chờ lên cấp. Tổng cộng khoảng 1/3 số món cao hơn cấp tướng.
- Không vượt trần của nguồn rơi:

| Nguồn | Trần level đồ |
|---|---|
| Bãi quái cấp L | 10·L |
| Boss cấp B (Golem tính +1 cấp) | 30 + 10·(B−1) |
| Mỏ Vàng / Dầu | 20 |
| Mỏ Dầu đen / Pha lê | 40 |
| Mỏ Kim cương | 60 |

- Tổ đội: mỗi người nhận một món theo level của chính mình.

**Rèn:** giữ nguyên level, các dòng được roll lại.

**Bãi quái**
- Tỉ lệ rơi của mỗi con quái ×0,35. Rồng cổ đại giữ nguyên.
- Tỉ lệ Tím+ ×0,25, phần bớt đi chuyển sang Xanh dương.

**Đồ cũ:** chuyển sang level = cấp tướng hiện tại của chủ (đồ dưới đất: level 1). Chỉ số tính lại ở roll 100%, giữ các loại dòng phụ hợp lệ.

### Cân bằng đánh nhà

**Hệ số công trình theo cấp** (`B_LEVEL_MULT`)

| | Cấp 1 | Cấp 2 | Cấp 3 | Cấp 4 | Cấp 5 |
|---|---|---|---|---|---|
| Cũ | 1 | 1,6 | 2,2 | 2,8 | 3,4 |
| Mới | 1,5 | 2,0 | 2,2 | 2,45 | 2,5 |

**Công trình nhận phần chia từ đồ của chủ nhà** (`BUILD_GEAR = 2`): máu và sát thương ×(1 + 2 × phần chia của lính).

**Tỉ lệ người đánh thắng.** Quân max của Thành trì X đánh căn cứ Thành trì X đã max công trình, giữ nhà bằng 40% quân max cấp. Mỗi cấp 30–40 trận.

| | TH1 | TH2 | TH3 | TH4 | TH5 |
|---|---|---|---|---|---|
| Không đồ | 83% | 87% | 87% | 87% | 80% |
| Cả 2 bên có đồ thường gặp | 90% | 83% | 90% | 67% | 83% |

**Lỗi đã sửa:** căn cứ có tường bao kín thì lệnh tấn công không tìm được đường, tướng đứng im. Giờ tướng tự phá bức tường đầu tiên trên đường ngắn nhất (`world.pathThrough`, `breachTo`), rồi đánh tiếp mục tiêu.

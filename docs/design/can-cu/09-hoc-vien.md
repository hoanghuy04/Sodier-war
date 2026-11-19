# 09. Học viện: nâng cấp quân (đã làm 11/11/2026, lính tạm dùng hình cấp 1)

Giống Phòng thí nghiệm trong Clash of Clans: một công trình trong căn cứ dùng để **nghiên cứu nâng cấp từng loại quân**. Chỉ áp dụng ở **Thế giới mở**; đấu theo ván mọi quân đều cấp 1 cho công bằng.

## 1. Công trình Học viện

- Kích thước 2×2 ô, mỗi căn cứ **1 Học viện**, mở từ Thành trì cấp 1.
- Có 5 cấp như các công trình khác (nâng bằng thợ xây, giá theo sức chứa, cấp Học viện ≤ cấp Thành trì). **Không** tính vào luật "xây đủ / nâng đủ cấp mới được nâng Thành trì" (tùy chọn). Đang nghiên cứu thì không nâng Học viện được.
- **Cấp quân tối đa = min(bảng giới hạn theo Thành trì, cấp Học viện + 1)**.
- Mỗi lúc chỉ nghiên cứu **1 loại quân**, không tốn thợ xây. Học viện bị phá (đổ nát) thì việc nghiên cứu tạm dừng tới khi sửa.

## 2. Cấp quân

- Mỗi loại quân có cấp 1 → 5, gắn với **tài khoản** (không mất khi chết, giữ khi offline).
- Nâng cấp áp dụng **ngay cho mọi lính loại đó** của bạn: lính đang đi theo, lính cất trong căn cứ, đồn lính giữ mỏ.

| Cấp | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Máu, sát thương | ×1 | ×1,15 | ×1,3 | ×1,45 | ×1,6 |
| Giá mua lính | ×1 | ×1,1 | ×1,2 | ×1,3 | ×1,4 |

## 3. Giới hạn cấp theo Thành trì

Quân càng mạnh thì càng ít cấp. Ô "–" là chưa mở loại quân đó.

| Quân | TT1 | TT2 | TT3 | TT4 | TT5 |
|---|---|---|---|---|---|
| Dân quân, Kiếm sĩ, Lính giáo, Cung thủ | 2 | 3 | 4 | 5 | 5 |
| Kỵ binh | 1 | 2 | 3 | 4 | 5 |
| Hiệp sĩ | 1 | 2 | 3 | 3 | 4 |
| Pháp sư | – | 1 | 2 | 3 | 4 |
| Máy bắn đá lửa | – | – | 1 | 2 | 3 |
| Sư thứu | – | – | – | 1 | 2 |
| Rồng | – | – | – | – | 2 |

## 4. Giá và thời gian nghiên cứu

- Giá lên cấp L = **35 % sức chứa** (đắt, theo yêu cầu) của Thành trì cấp đầu tiên cho phép cấp L (tính theo loại tài nguyên nặng nhất trong giá mua loại quân đó, các loại khác giữ tỉ lệ; giống cách tính giá nâng công trình).
- Thời gian: lên cấp 2 = 20 phút, cấp 3 = 1 giờ, cấp 4 = 2 giờ, cấp 5 = 4 giờ.
- Ví dụ Kiếm sĩ (giá mua 80 Sắt + 20 Than): lên cấp 2 (mở ở TT1, chứa 6 000 Sắt) = 2 100 Sắt + 525 Than, 20 phút; lên cấp 5 (mở ở TT4, chứa 20 000 Sắt) = 7 000 Sắt + 1 750 Than, 4 giờ.
- **Không bắt buộc** nâng quân để nâng Thành trì (cấp quân không tính vào luật "nâng đủ cấp").

## 5. Giao diện nâng cấp quân

Bấm vào Học viện → nút **"⚔ Nâng cấp quân"** → bảng gỗ, mỗi loại quân một thẻ:
- **Hình lính ở cấp hiện tại** (mỗi cấp một diện mạo, xem mục 6), tên, "Cấp 2 / tối đa 3".
- Chỉ số hiện tại → sau khi nâng (máu, sát thương).
- Giá + thời gian, nút **"⬆ Lên cấp 3"**.
- Đã tới giới hạn của Thành trì: nút xám **"🔒 Mở khóa ở Thành trì cấp X"** (X = cấp Thành trì đầu tiên cho phép cấp tiếp theo).
- Học viện chưa đủ cấp: **"Cần Học viện cấp X"**.
- Quân chưa mở: thẻ tối, ghi **"Mở ở Thành trì cấp X"**.
- Đang nghiên cứu: thanh tiến độ + đếm ngược; trên bản đồ Học viện có thanh tiến độ như khi xây.
- Cửa hàng quân hiện cấp lính trên thẻ ("Cấp 3").

## 6. Diện mạo theo cấp

Giống CoC: **mỗi cấp một bộ hình** (giáp, vũ khí, áo choàng xịn dần), kích thước và dáng giữ nguyên để người chơi vẫn nhận ra. Cấp 1 là hình hiện tại. Cần vẽ thêm: 4 loại lính thường × 4 cấp, Kỵ binh 4, Hiệp sĩ 3, Pháp sư 3, Máy bắn đá 2, Sư thứu 1, Rồng 1 = **30 sheet**, cộng 1 sheet Học viện. Prompt ở `docs/design/samples/army-levels/`.

Lính địch hiện đúng hình theo cấp của chủ, nhìn là biết đối thủ mạnh cỡ nào.

## 7. Kỹ thuật (khi làm)

- `shared/balance.js`: `ACADEMY` (công trình), `UNIT_LV_CAP[unit][th-1]`, `UNIT_LV_MULT`, `researchCost(unit, lv)`, `researchTime(lv)`.
- Lưu cấp quân theo tài khoản trong căn cứ: `base.unitLv = { 'kiem-si': 3, … }`, `base.research = { unit, lv, doneAt, total }`.
- `unitStats(type, hero, lv)` nhân hệ số; snapshot gửi kèm cấp để client chọn hình (`<unit>-l<lv>` trong atlas, thiếu hình thì dùng cấp gần nhất).

# 01. Thành trì (nhà chính)

Thành trì là tim của căn cứ, giống Town Hall của Clash of Clans. Mỗi người chơi có **một** Thành trì. Không có Thành trì thì không xây được gì khác.

- Kích thước **3×3 ô**. Giáp 30%. Không tự bắn.
- **Vùng căn cứ:** mọi công trình khác phải nằm trong **13 ô** quanh tâm Thành trì (hình vuông 27×27 ô).
- Quân và tướng của chủ đứng trong vùng căn cứ khi không giao chiến được **hồi 3% máu mỗi giây**.
- Tướng chết thì **xuất trận lại ở Thành trì** (nếu Thành trì chưa bị phá).

## Cấp Thành trì

| Cấp | Máu | Giá nâng lên cấp này | Thời gian |
|---|---|---|---|
| 1 | 3 000 | 300 Sắt, 100 Than | 20 giây |
| 2 | 4 500 | 700 Sắt, 300 Than, 150 Vàng | 1 phút |
| 3 | 6 000 | 1 400 Sắt, 600 Than, 400 Vàng, 60 Dầu | 3 phút |
| 4 | 8 000 | 2 400 Sắt, 1 000 Than, 800 Vàng, 120 Dầu đen, 40 Pha lê | 6 phút |
| 5 | 10 500 | 3 600 Sắt, 1 600 Than, 1 500 Vàng, 250 Dầu đen, 120 Pha lê, 25 Kim cương | 10 phút |

Giá mỗi cấp luôn vừa với kho của cấp trước (xem 04), nên muốn lên cấp thì không phải xây Kho trước.

## Mở khóa theo cấp Thành trì

Số lượng tối đa mỗi loại công trình, và **cấp tối đa** của mọi công trình khác (bằng cấp Thành trì):

| Thành trì | Tháp cung | Pháo đá | Tháp phép | Tường | Kho | Cấp tối đa công trình | Thợ xây |
|---|---|---|---|---|---|---|---|
| 1 | 2 | 1 | 0 | 60 | 1 | 1 | 1 |
| 2 | 3 | 1 | 1 | 120 | 1 | 2 | 2 |
| 3 | 4 | 2 | 1 | 180 | 2 | 3 | 2 |
| 4 | 5 | 3 | 2 | 240 | 2 | 4 | 2 |
| 5 | 6 | 4 | 3 | 300 | 3 | 5 | 3 |

**Điều kiện nâng Thành trì (11/11/2026):** phải xây xong đủ số Tháp cung, Pháo đá, Tháp phép, Kho mà cấp hiện tại cho phép (tường không tính; công trình đang xây hoặc đổ nát không tính). Nút nâng cấp ghi còn thiếu gì. Nâng xong hiện **bảng gỗ** liệt kê: công trình được xây thêm, cấp tối đa mới, thợ xây, sức chứa và quân mới mở.

**Thợ xây** = số công trình được xây hoặc nâng cấp cùng lúc (giống Builder trong Clash of Clans).

## Mở khóa quân (đã làm 11/11/2026)

Ở Thế giới mở, quân mạnh cần Thành trì đủ cấp mới mua được (phòng đấu theo ván không khóa). Quân đang có vẫn giữ, chỉ không mua thêm loại bị khóa.

| Thành trì | Mở thêm |
|---|---|
| chưa có | Dân quân, Kiếm sĩ, Lính giáo, Cung thủ, Kỵ binh |
| 1 | Hiệp sĩ |
| 2 | Pháp sư |
| 3 | Máy bắn đá lửa |
| 4 | Sư thứu |
| 5 | Rồng |

## Thành trì cấp 5: không giới hạn (11/11/2026)

- Ở cấp 5 (cấp cuối) bỏ giới hạn số lượng mọi công trình. Giới hạn thật chỉ còn là chỗ trống trong vùng căn cứ 27×27 ô.
- Giá tăng đều theo số lượng: gọi n là tổng số công trình loại đó (tính cả cái đang xây), m là mức của cấp 5 (Tháp cung 6, Pháo đá 4, Tháp phép 3, Tường 300, Kho 3). Giá xây và nâng cấp = giá gốc × (1 + 0,25 × max(0, n − m)). Riêng tường: 0,02 thay cho 0,25.
  - Ví dụ: Tháp cung thứ 7 giá ×1,25, thứ 8 ×1,5, thứ 10 ×2. Khi đã có 10 tháp cung thì nâng cấp tháp cung nào cũng ×2.
  - Tường thứ 350 ×2, thứ 400 ×3.
- Thợ xây vẫn 3. Số quân không giới hạn ở mọi cấp (đã như vậy từ trước).
- Bot lãnh chúa NPC vẫn chỉ xây tới mức cấp 5.

## Sức chứa tài nguyên theo cấp Thành trì

Chi tiết ở [04-tai-nguyen-va-kho.md](04-tai-nguyen-va-kho.md). Tóm tắt: chưa có Thành trì thì kho chứa ×1, Thành trì cấp 1 → ×1,5, cấp 2 → ×2,25, cấp 3 → ×3,5, cấp 4 → ×5, cấp 5 → ×7. Mỗi Kho cộng thêm.

## Vị trí đặt Thành trì

- Cách Thành trì người khác **ít nhất 28 ô** (11/11/2026: trước là 32).
- Cách trại xuất phát 10 ô, cách mỏ 5 ô, cách bãi quái 12 ô, cách chỗ boss 14 ô (`TH_GAP`; trước là 16 / 5 / 16 / 18).
- Không đặt trên nước, vực, đá, cây (phải đủ 3×3 ô trống), không đặt trong Cao nguyên cổ (tâm bản đồ).
- Tướng phải đứng trong 15 ô.
- **Dời Thành trì:** được, mất 30 giây, cả căn cứ dời theo nếu chỗ mới đủ trống; nếu không thì các công trình không vừa được trả về kho đồ xây (không mất). Mỗi lần dời cách nhau ít nhất 1 giờ.

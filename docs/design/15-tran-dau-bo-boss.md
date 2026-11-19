# 15. Trận đấu, bo và boss

Thay cho "server chạy mãi" ở chương 1: game chia thành **từng trận**, mỗi trận **tối đa 20 phút**, kiểu sinh tồn (battle royale). Vùng an toàn (**bo**) thu hẹp dần, ai ở ngoài bị trừ máu.

## 15.1 Vòng đời một trận

| Giai đoạn | Thời gian | Chuyện gì xảy ra |
|---|---|---|
| **Mở cổng** | 0:00 – 6:00 | Ai cũng vào trận được (chọn nhân vật → xuất phát ở trại, khiên 60 giây). Chết trong lúc này thì **được vào lại**. Bo phủ cả bản đồ |
| **Sinh tồn** | 6:00 – 20:00 | Cổng đóng: chết là hết trận, chỉ xem tiếp. Bo thu hẹp 5 lần |
| **Kết thúc** | Khi chỉ còn ≤ 1 đội sống (sau 6:00), hoặc hết 20:00 | Thắng: đội còn sống cuối cùng. Hết giờ mà còn nhiều đội: đội nhiều **điểm** nhất trong số còn sống |
| **Nghỉ** | 20 giây | Bảng kết quả trận. Sau đó bản đồ làm mới: mỏ trống, lính canh và boss sống lại, đồ trên đất biến mất, mọi người chọn nhân vật cho trận mới |

- Tài khoản, mật khẩu, điểm cao nhất và **số trận thắng** được giữ qua các trận. Quân, mỏ, tài nguyên và **trang bị** chỉ sống trong một trận.
- Bot cũng chỉ vào trận trong lúc cổng mở.

## 15.2 Bo (vùng an toàn)

Hình tròn. Vòng tròn trắng là **bo sắp tới**, vùng xanh mờ bên ngoài là **ngoài bo**.

| Lần | Báo trước (hiện vòng trắng) | Thu hẹp | Bán kính sau (ô) | Trừ máu ngoài bo (% máu tối đa / giây) |
|---|---|---|---|---|
| 1 | 5:00 | 6:00 → 8:00 | 92 | 1,5% |
| 2 | 8:00 | 9:30 → 11:00 | 58 | 2,5% |
| 3 | 11:00 | 12:30 → 13:45 | 34 | 4% |
| 4 | 13:45 | 15:00 → 16:00 | 18 | 6% |
| 5 | 16:00 | 17:00 → 19:00 | 4 | 10% |

- Tâm bo mới chọn ngẫu nhiên **bên trong** bo cũ, sao cho bo mới nằm trọn trong bo cũ (giống PUBG). Lần 5 luôn chứa một điểm đi được.
- Trừ máu áp cho **nhân vật chính và mọi quân** đứng ngoài bo (quân bay cũng bị). Lính canh và boss không bị.
- HUD: đồng hồ trận, "Bo thu hẹp sau 0:45" hoặc "Bo đang thu hẹp", viền màn hình đỏ khi nhân vật đứng ngoài bo. Minimap vẽ cả hai vòng.

## 15.3 Năm boss

Boss to **gấp 5 lần nhân vật chính** trên bản đồ. 1 boss ở **tâm bản đồ**, 4 boss còn lại đứng **cách đều quanh tâm** (4 hướng Bắc, Đông, Nam, Tây, cách tâm khoảng 46 ô, vào chỗ trống gần nhất). Dưới chân mỗi boss có bệ đá với vòng ký tự phát sáng.

| Boss | Vị trí | Máu | Đánh | Giáp | Tầm | Kỹ năng (tự động) | Rơi đồ |
|---|---|---|---|---|---|---|---|
| **Golem Kim Cương** | Tâm | 14 000 | 130 | 40% | 2,6 | **Dậm đất** mỗi 8 giây: 160 sát thương trong 4,5 ô, choáng 1 giây | 1 Huyền thoại + 2 Sử thi |
| **Chúa Tể Hắc Ín** | Bắc | 9 000 | 95 | 25% | 2,4 | **Phun hắc ín** mỗi 9 giây: 5 vũng lửa trước mặt (6 ô), 25/giây trong 4 giây | 1 Sử thi + 2 Hiếm |
| **Nữ Hoàng Pha Lê** | Đông | 7 500 | 75 (đạn phép vùng 1,5 ô, bỏ qua giáp) | 10% | 7 | **Mưa pha lê** mỗi 10 giây: 7 mảnh rơi quanh bà trong 5 ô, 110 mỗi mảnh, bỏ qua giáp | 1 Sử thi + 2 Hiếm |
| **Vua Thổ Phỉ** | Nam | 9 000 | 115 | 30% | 2,4 | **Lốc rìu** mỗi 7 giây: 150 sát thương mọi quân trong 3,8 ô, đẩy lùi 1 ô | 1 Sử thi + 2 Hiếm |
| **Bọ Cạp Sa Mạc** | Tây | 8 000 | 100 | 35% | 2,6 | **Độn thổ** mỗi 8 giây: chui xuống, trồi lên chỗ đông địch nhất trong 9 ô: 200 sát thương trong 2,5 ô + vũng độc 20/giây trong 4 giây | 1 Sử thi + 2 Hiếm |

- Boss đứng trên bệ, **không đuổi xa quá 12 ô**. Hết địch trong 4 giây thì về bệ và hồi đầy máu.
- Sức chứa cận chiến: 10 quân vây cùng lúc.
- Mỗi trận chỉ có 1 lượt boss (chết là hết, không hồi sinh trong trận).
- Đồ rơi ra **trên đất** quanh xác boss, ai nhặt trước được trước (mục 16.6).

## 15.4 Lính canh mỏ rơi đồ

Hạ hết lính canh của một mỏ: ngoài phần thưởng tài nguyên cũ, rơi thêm **1 món đồ cấp thấp**:

| Mỏ | Đồ rơi |
|---|---|
| Vàng, Dầu | Thường 70%, Tốt 30% |
| Dầu đen, Pha lê | Thường 30%, Tốt 60%, Hiếm 10% |
| Kim cương | Tốt 50%, Hiếm 50% |

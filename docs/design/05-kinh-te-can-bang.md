# 5. Kinh tế và cân bằng giá

Giá quân được đặt sao cho **thời gian phải giữ mỏ** để mua một quân tăng dần theo sức mạnh của quân. Rồng cần giữ cùng lúc mỏ Kim cương, Dầu đen, Pha lê và hai mỏ Vàng trong khoảng 15 phút.

## 5.1 Giá trị quy đổi

Mọi thứ quy về **Sắt** để so sánh (chỉ dùng khi thiết kế, trong game không đổi được):

| Sắt | Than | Vàng | Dầu | Dầu đen | Pha lê | Kim cương |
|---|---|---|---|---|---|---|
| 1,0 | 1,3 | 2,5 | 3,2 | 5,0 | 9,0 | 18,0 |

Cách chọn: giá trị một đơn vị tỉ lệ nghịch với sản lượng của mỏ, rồi tăng thêm theo độ hiếm để mỏ hiếm cho giá trị/phút cao hơn (Sắt 30/phút, Kim cương 54/phút, xem [03-khoang-san.md](03-khoang-san.md) mục 3.1).

## 5.2 Giá trị và sức mạnh từng binh chủng

- **HP hiệu dụng** = HP / (1 − giáp).
- **DPS** = ATK / hồi đòn.
- **Chỉ số tay đôi** = HP hiệu dụng × DPS. Chỉ số này đo sức thắng trong một trận một chọi một.

| Binh chủng | Giá trị (Sắt) | HP hiệu dụng | DPS | Chỉ số tay đôi | Chỉ số / giá trị | Ghi chú |
|---|---|---|---|---|---|---|
| Dân quân | 40 | 70 | 9,0 | 630 | 15,8 | Rẻ, lấp ô |
| Kiếm sĩ | 106 | 153 | 14,0 | 2 141 | 20,2 | Hiệu quả nhất trong quân rẻ |
| Lính giáo | 103 | 122 | 10,9 | 1 333 | 12,9 | ×1,75 với Kỵ → 22,6 |
| Cung thủ | 99 | 70 | 8,5 | 592 | 6,0 | Bắn tự do, không bị giới hạn bắt cặp (thực tế mạnh gấp 2–3 lần chỉ số này) |
| Kỵ binh | 211 | 212 | 15,5 | 3 272 | 15,5 | Thêm đòn xung phong ×2 |
| Hiệp sĩ | 408 | 492 | 20,0 | 9 846 | 24,1 | Lì nhất trong quân bộ |
| Pháp sư | 477 | 90 | 14,4 | 1 300 (×2 nhờ vùng) | 5,4 | Bỏ qua giáp, bắn tự do |
| Máy bắn đá lửa | 427 | 275 | 12,9 | 3 536 (×3 nhờ vùng) | 24,8 | Chậm, không bắn quân bay |
| Sư thứu | 758 | 306 | 24,4 | 7 476 (×2 với cận chiến) | 19,7 | Nhanh, bay |
| **Rồng** | **2 680** | 2 286 | 37,5 × 3 mục tiêu | 257 000 | 96 | Mạnh nhất. Giới hạn 2 con, khắc tinh là Cung thủ |

Rồng có chỉ số/giá trị cao vượt trội **một cách cố ý**. Đây là phần thưởng cuối game. Ba thứ giữ cho Rồng không áp đảo:

1. Chỉ được 2 con mỗi đội.
2. Đắt nhất về tài nguyên hiếm (Kim cương, Dầu đen), phải giữ mỏ lõi.
3. Cung thủ và Pháp sư bắn tự do, gây ×1,5 lên quân bay (mục 5.5).

## 5.3 Thu nhập theo giai đoạn

Thu nhập mỗi phút của một người chơi điển hình. Đã tính hệ số quản lý và thưởng giữ mỏ trung bình.

| Giai đoạn | Đang giữ | Sắt | Than | Vàng | Dầu | Dầu đen | Pha lê | Kim cương | Giá trị/phút |
|---|---|---|---|---|---|---|---|---|---|
| **Khởi đầu** (0–2 phút) | Không mỏ, chỉ kho cơ bản | 12 | 4 | – | – | – | – | – | 17 |
| **Sớm** (3–8 phút) | 2 Sắt, 1 Than | 72 | 29 | – | – | – | – | – | 110 |
| **Giữa** (8–20 phút) | 3 Sắt, 2 Than, 2 Vàng, 1 Dầu (hệ số 94%, thưởng ~15%) | 109 | 58 | 30 | 13 | – | – | – | 301 |
| **Muộn** (20+ phút) | Thêm 1 Dầu đen, 1 Pha lê, 1 Kim cương (11 mỏ, hệ số 85%, thưởng ~25%) | 108 | 57 | 30 | 13 | 8,5 | 5,3 | 3,2 | 447 |

## 5.4 Thời gian dành dụm để mua (phút)

Thời gian = lớn nhất trong các `giá / thu nhập` của từng loại tài nguyên, nếu chỉ dành tiền cho món đó.

| Món | Giai đoạn Sớm | Giai đoạn Giữa | Giai đoạn Muộn | Tài nguyên chặn |
|---|---|---|---|---|
| Dân quân | 0,6 | 0,4 | 0,4 | Sắt |
| Kiếm sĩ | 1,1 | 0,7 | 0,7 | Sắt |
| Lính giáo | 1,0 | 0,6 | 0,6 | Sắt |
| Cung thủ | 1,0 | 0,6 | 0,6 | Sắt / Than |
| Kỵ binh | — (chưa có Vàng) | 1,0 | 1,0 | Vàng |
| Hiệp sĩ | — | 2,0 | 2,0 | Vàng |
| Vòng 4 đội hình | — | 6,7 | 6,7 | Vàng |
| Pháp sư | — | — | 4,7 | Pha lê |
| Máy bắn đá lửa | — | — | 4,6 | Dầu |
| Sư thứu | — | — | 5,7 | Pha lê |
| Vòng 5 đội hình | — | — | 11,7 | Vàng |
| **Rồng** | — | — | **14,1** | **Dầu đen** (Vàng 13,3, Pha lê 11,3, Kim cương 9,4) |

Nhận xét dùng để cân bằng:

- **Vàng là nút thắt chung** từ giữa game: Kỵ, Hiệp sĩ, Pháp sư, Sư thứu, Rồng và mở vòng đều cần Vàng. Bản đồ có 12 mỏ Vàng nằm ở vòng giữa nên luôn có giao tranh ở đó.
- Bốn tài nguyên của Rồng chạm ngưỡng gần như cùng lúc (9–14 phút). Mất bất kỳ mỏ nào trong bốn loại là chậm Rồng. Như vậy mỏ nào cũng đáng giữ.
- Mỗi lớp quân mạnh hơn cần một loại mỏ hiếm hơn: Kỵ cần Vàng, Công thành cần Dầu, Phép/Bay cần Pha lê, Rồng cần Kim cương. Người chơi buộc phải đi dần vào trong bản đồ.

## 5.5 Mục tiêu cân bằng (để kiểm bằng mô phỏng)

Các trận thử dưới đây chạy bằng mô phỏng không hình (headless) theo đúng luật [08-chien-dau.md](08-chien-dau.md), 200 lần mỗi trận, sai lệch cho phép ±15%.

| Trận | Giá trị hai bên | Kết quả mong muốn |
|---|---|---|
| 10 Kiếm sĩ vs 10 Lính giáo | 1 060 vs 1 030 | Kiếm sĩ thắng, còn 4–6 quân |
| 10 Lính giáo vs 5 Kỵ binh | 1 030 vs 1 055 | Giáo thắng, còn 4–6 quân |
| 5 Kỵ binh vs 10 Cung thủ | 1 055 vs 990 | Kỵ thắng, còn 2–4 quân |
| 10 Cung thủ vs 10 Kiếm sĩ (có 5 Dân quân che phía trước) | 1 190 vs 1 060 | Cung thắng sát nút |
| 1 Rồng vs 20 Kiếm sĩ | 2 680 vs 2 120 | **Rồng thắng**, còn 60–80% máu |
| 1 Rồng vs 25 Cung thủ | 2 680 vs 2 475 | **Cung thắng**, mất 12–16 Cung thủ |
| 1 Rồng + 10 Kiếm sĩ vs 6 Hiệp sĩ + 12 Cung thủ | 3 740 vs 3 636 | Gần 50/50 |
| Golem kim cương + 4 Tinh linh vs 30 Kiếm sĩ + 10 Cung thủ | — vs 4 170 | Người chơi thắng, mất 35–50% quân |

Phép tính nhanh cho hai trận Rồng (khớp mục tiêu):

- **Rồng vs 20 Kiếm sĩ.** Mỗi Kiếm sĩ gây 14 × 0,5 (cận chiến đánh quân bay) × 0,7 (giáp) × 0,9 (hào quang) = 4,4 sát thương/giây. Chỉ 4 Kiếm sĩ vây được một lúc, cộng lại 17,6/giây. Rồng phun lửa 60 × 1,2 × 0,85 = 61 sát thương, cộng 12 sát thương cháy. Hai lần phun hạ 3 Kiếm sĩ (130 HP), mất 3,2 giây. 20 Kiếm sĩ chết hết sau khoảng 21 giây. Trong thời gian đó Rồng mất khoảng 375 HP, tức 23% máu.
- **Rồng vs 25 Cung thủ.** Mỗi Cung thủ gây 11 × 1,5 × 0,7 × 0,9 / 1,3 = 8,0 sát thương/giây, không bị giới hạn bắt cặp. 25 Cung thủ cộng lại 200/giây, Rồng chết sau khoảng 8 giây. Mỗi lần phun lửa hạ 3 Cung thủ (70 HP), trong 8 giây được 5 lần, khoảng 15 Cung thủ.

## 5.6 Chiến lợi phẩm và hồi phục

- Hạ nhân vật chính của người khác: nhận **25% kho** của họ, chia đều nếu nhiều người cùng đánh (theo sát thương gây lên nhân vật đó).
- Quân chết không rơi gì. Thắng trận lớn có lợi vì giữ được mỏ, không phải vì nhặt đồ.
- Lính canh mỏ rơi phần thưởng cố định ([03-khoang-san.md](03-khoang-san.md) mục 3.6).
- **Không có chi phí nuôi quân.** Quân chỉ mất khi chết hoặc giải tán.

## 5.7 Chỗ chỉnh nhanh khi cân bằng

Mọi con số nằm trong `packages/rules/src/balance.ts`. Khi chỉnh thì sửa theo thứ tự này để ít ảnh hưởng dây chuyền:

1. Sản lượng mỏ (tốc độ cả game).
2. Giá quân (thời gian tới từng mốc).
3. HP/ATK (kết quả trận đánh).
4. Bảng khắc chế (chỉ khi một lớp quân bị bỏ hẳn).

# 4. Hệ thống quân đội

## 4.1 Lớp quân

| Lớp | Binh chủng | Vai trò |
|---|---|---|
| **Bộ binh** | Dân quân, Kiếm sĩ | Chịu đòn, đông, rẻ. Khắc Lính giáo |
| **Giáo** | Lính giáo | Khắc Kỵ binh, đánh Quân bay đỡ hơn bộ binh |
| **Tầm xa** | Cung thủ | Bắn từ trong đội hình. Khắc Bộ binh và **Quân bay** |
| **Kỵ** | Kỵ binh, Hiệp sĩ | Nhanh, khỏe. Khắc Tầm xa, Phép, Công thành |
| **Phép** | Pháp sư | Sát thương vùng nhỏ, **bỏ qua giáp** |
| **Công thành** | Máy bắn đá lửa | Bắn xa, sát thương vùng, đốt cháy. Chậm. Không bắn được quân bay |
| **Bay** | Sư thứu, **Rồng** | Bay qua vật cản. Cận chiến đánh vào chỉ còn một nửa sát thương |
| **Anh hùng** | Nhân vật chính | Xem [06-nhan-vat-chinh.md](06-nhan-vat-chinh.md) |

## 4.2 Bảng binh chủng

| # | Binh chủng | Lớp | Giá | HP | ATK | Hồi đòn (giây) | Tầm (ô) | Giáp | Tốc độ (ô/giây) | Số ô đội hình | Đối thủ cận chiến cùng lúc | Triệu tập (giây) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Dân quân** | Bộ binh | 40 Sắt | 70 | 9 | 1,0 | 0,8 | 0% | 2,2 | 1 | 1 | 1 |
| 2 | **Kiếm sĩ** | Bộ binh | 80 Sắt, 20 Than | 130 | 14 | 1,0 | 0,8 | 15% | 2,1 | 1 | 1 | 2 |
| 3 | **Lính giáo** | Giáo | 70 Sắt, 25 Than | 110 | 12 | 1,1 | 1,2 | 10% | 2,1 | 1 | 1 | 2 |
| 4 | **Cung thủ** | Tầm xa | 60 Sắt, 30 Than | 70 | 11 | 1,3 | 4,5 | 0% | 2,2 | 1 | 1 | 2 |
| 5 | **Kỵ binh** | Kỵ | 110 Sắt, 20 Than, 30 Vàng | 180 | 17 | 1,1 | 0,9 | 15% | 3,2 | 1 | 1 | 3 |
| 6 | **Hiệp sĩ** | Kỵ | 180 Sắt, 60 Than, 60 Vàng | 320 | 24 | 1,2 | 0,9 | 35% | 2,7 | 1 | 1 | 4 |
| 7 | **Pháp sư** | Phép | 40 Than, 80 Vàng, 25 Pha lê | 90 | 26 (vùng 1 ô) | 1,8 | 4,0 | 0% | 2,0 | 1 | 1 | 4 |
| 8 | **Máy bắn đá lửa** | Công thành | 160 Sắt, 60 Dầu, 15 Dầu đen | 220 | 45 (vùng 1,5 ô) + cháy | 3,5 | 7,0 (gần nhất 2) | 20% | 1,3 | 2 | 2 | 6 |
| 9 | **Sư thứu** | Bay | 60 Sắt, 120 Vàng, 40 Dầu, 30 Pha lê | 260 | 22 | 0,9 | 1,0 | 15% | 3,4 | 2 | 2 | 6 |
| 10 | **Rồng** | Bay (huyền thoại) | 400 Vàng, 120 Dầu đen, 60 Pha lê, 30 Kim cương | **1600** | **60** (phun lửa hình nón, tối đa 3 mục tiêu) | 1,6 | 3,0 | 30% | 2,8 | **4** | **4** | 12 |

- **Số ô đội hình:** số ô quân chiếm trong khối lục giác ([07-doi-hinh-luc-giac.md](07-doi-hinh-luc-giac.md)).
- **Đối thủ cận chiến cùng lúc:** số quân cận chiến địch được bắt cặp với quân này một lúc ([08-chien-dau.md](08-chien-dau.md) mục 8.3). Quân to (Máy bắn đá, Sư thứu, Rồng) bị vây bởi nhiều đối thủ.
- **Triệu tập:** thời gian từ lúc bấm mua tới lúc quân xuất hiện ở ô của mình. Mua khi đội đang giao chiến thì thời gian triệu tập **gấp đôi**.

## 4.3 Mô tả và điểm đặc biệt từng binh chủng

1. **Dân quân.** Nông dân cầm chĩa, áo vải nâu. Rẻ nhất, dùng để lấp ô và giữ chân địch. Không có gì đặc biệt.
2. **Kiếm sĩ.** Mũ sắt, khiên tròn, kiếm ngắn. Quân chủ lực đầu game. Đỡ đòn tốt nhờ giáp 15%.
3. **Lính giáo.** Giáo dài, khiên chữ nhật. Gây **×1,75** lên Kỵ. Đòn đầu tiên trong mỗi trận tay đôi với Kỵ làm đối thủ **choáng 0,5 giây** (chặn ngựa).
4. **Cung thủ.** Mũ trùm xanh, cung gỗ. Đứng yên trong đội hình bắn ra, không chiếm suất bắt cặp của đối thủ (mục 8.4). Bị cận chiến áp sát thì rút dao găm, chỉ còn **50% ATK**. Gây **×1,5** lên Quân bay.
5. **Kỵ binh.** Ngựa nâu, giáo nhẹ. Nhanh nhất trong quân bộ. **Đòn xung phong:** đòn đầu tiên sau khi chạy ít nhất 3 ô gây **×2** sát thương.
6. **Hiệp sĩ.** Ngựa trắng mặc giáp, giáp kín, kiếm dài, áo choàng màu người chơi. Lì nhất trong quân bộ (giáp 35%). Có đòn xung phong như Kỵ binh.
7. **Pháp sư.** Áo choàng tím, gậy đầu pha lê. Bắn cầu năng lượng nổ vùng bán kính 1 ô, **bỏ qua giáp**. Yếu máu, cần quân che.
8. **Máy bắn đá lửa.** Khung gỗ, gàu ném, thùng hắc ín. Bắn vào chỗ đông quân địch nhất trong tầm. Ô trúng đạn **cháy 3 giây**, ai đứng trong đó mất 8 HP/giây. Không bắn được quân bay, không bắn mục tiêu gần dưới 2 ô. **Làm cả đội đi chậm** (tốc độ đội theo quân chậm nhất, mục 7.5).
9. **Sư thứu.** Đầu đại bàng, thân sư tử, có người cưỡi. Bay qua vật cản. Nhanh nhất game. Hợp đi săn Cung thủ và Máy bắn đá.
10. **Rồng.** Quân mạnh nhất game (xem mục 4.6).

## 4.4 Bảng khắc chế (hệ số sát thương K)

Hàng: lớp **tấn công**. Cột: lớp **bị đánh**.

| Tấn công ↓ / Bị đánh → | Bộ binh | Giáo | Tầm xa | Kỵ | Phép | Công thành | Bay | Anh hùng |
|---|---|---|---|---|---|---|---|---|
| **Bộ binh** | 1,0 | **1,4** | 1,2 | 0,8 | 1,2 | 1,3 | *0,5* | 1,0 |
| **Giáo** | 1,0 | 1,0 | 1,0 | **1,75** | 1,0 | 1,0 | *0,75* | 1,0 |
| **Tầm xa** | **1,3** | 1,1 | 1,0 | 0,8 | 1,0 | 0,8 | **1,5** | 0,9 |
| **Kỵ** | 1,0 | *0,7* | **1,6** | 1,0 | **1,6** | **1,8** | *0,5* | 1,0 |
| **Phép** | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 | 1,2 | 1,2 | 1,0 |
| **Công thành** | 1,2 | 1,2 | 1,2 | 1,0 | 1,2 | 1,5 | **0** | 0,8 |
| **Bay** | 1,2 | 1,2 | 1,2 | 1,2 | 1,2 | 1,2 | 1,0 | 1,0 |
| **Anh hùng** | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 | 1,0 | 0,75 | 1,0 |

Vòng khắc chế chính: **Kiếm khắc Giáo, Giáo khắc Kỵ, Kỵ khắc Cung, Cung khắc Kiếm và Quân bay**.

## 4.5 Giới hạn đội quân

- Đội hình có sẵn **3 vòng = 36 ô**. Mở thêm (mua trong cửa hàng, giữ mãi tới khi nhân vật chết):
  - **Vòng 4** (+24 ô, tổng 60): 200 Vàng.
  - **Vòng 5** (+30 ô, tổng 90): 350 Vàng + 30 Pha lê.
- Tối đa **2 Rồng** mỗi đội (Kẻ Thuần Long: 3).
- **Giải tán** một quân (chuột trái chọn quân, bấm Giải tán): trả lại 30% giá.

## 4.6 Rồng

- **Hình dáng:** rồng đỏ thẫm, bụng vàng đồng, sừng ngà, cánh màng đỏ tía có gân, mắt vàng phát sáng. Sprite 48×48 px, có bóng đổ trên mặt đất cách thân 6 px (cho thấy đang bay).
- **Phun lửa:** hình nón dài 3 ô, góc 50°, trúng tối đa 3 mục tiêu (ưu tiên đối thủ đang bắt cặp với Rồng). Ô trúng lửa cháy 2 giây (6 HP/giây).
- **Đòn đập cánh** (tự động, mỗi 10 giây): đẩy lùi quân cận chiến đang vây Rồng 1 ô và làm chúng choáng 0,4 giây.
- **Hào quang Uy long:** quân địch dưới đất trong 4 ô quanh Rồng mất 10% ATK. Không cộng dồn giữa nhiều Rồng.
- **Điểm yếu:** Cung thủ (×1,5) và Pháp sư (bỏ qua giáp) bắn tự do mà không chiếm suất bắt cặp. Một đàn 25 Cung thủ hạ được một con Rồng đi một mình.
- **Triệu tập:** Rồng bay từ mép màn hình vào (12 giây), cả server nhận thông báo "**<tên> đã triệu hồi Rồng!**".
- Trong đội hình, Rồng chiếm 4 ô liền nhau ở vòng của nó. Nó bay lơ lửng ở điểm giữa 4 ô đó.

## 4.7 Lính canh mỏ (trung lập)

| Lính canh | Lớp | HP | ATK | Hồi đòn | Tầm | Giáp | Đối thủ cùng lúc | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| Thổ phỉ | Bộ binh | 70 | 9 | 1,0 | 0,8 | 0% | 1 | Khăn đỏ bịt mặt, rìu ngắn |
| Cung thủ phỉ | Tầm xa | 70 | 10 | 1,3 | 4,0 | 0% | 1 | |
| Kiếm sĩ đen | Bộ binh | 150 | 15 | 1,0 | 0,8 | 15% | 1 | Giáp đen dính hắc ín |
| Thú hắc ín | Bộ binh | 400 | 20 | 1,4 | 1,0 | 10% | 2 | Mỗi đòn làm chậm 20% trong 2 giây |
| Tinh linh pha lê | Phép | 160 | 18 | 1,5 | 3,0 | 0% | 1 | Lơ lửng, tỏa sáng tím |
| **Golem kim cương** | Bộ binh (boss) | 3000 | 70 | 2,0 | 1,2 | 40% | 5 | Dậm đất mỗi 6 giây: 50 sát thương mọi quân trong 2 ô |

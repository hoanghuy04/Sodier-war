# Địa Ngục: 12 kỹ năng chủ động + 8 nội tại mới (17/11/2026, bản nháp)

Thêm vào `HELL_SKILLS` (shared/hell.js). Icon: sheet `icon-ky-nang-3` (index 50–69). Hiệu ứng: `fx-13`, `fx-14`, `fx-15` (chủ động), `fx-16` (nội tại cần hiệu ứng). Số liệu là bản đầu, chỉnh lại bằng tools/sim/hell-sim.mjs trước khi mở.

Mỗi kỹ năng có 5 cấp. Chữ "+30%" tính trên số gốc của cấp 1.

## Chủ động (12)

| # | Tên | Icon | FX | Cách đánh (cấp 1) | Cấp 2 → 5 |
|---|---|---|---|---|---|
| 1 | **Phong Thần Lốc** | 50 | fx-13 / 1 | Mỗi 6 giây thả 1 cơn lốc đi lang thang 4 giây, hút nhẹ quái trong 1,5 ô, 10 sát thương mỗi 0,5 giây | +1 lốc · lốc to +25% · sống 6 giây · +1 lốc, +40% sát thương |
| 2 | **Kim Cương Chưởng** | 51 | fx-13 / 2 | Mỗi 7 giây bàn tay vàng khổng lồ đập xuống chỗ quái đông nhất: vùng 2,5 ô, 90 sát thương, choáng 0,5 giây | +30% sát thương · vùng +20% · hồi chiêu 5,5 giây · đập 2 lần liền, choáng 1 giây |
| 3 | **Thạch Thương Trận** | 52 | fx-13 / 3 | Mỗi 5 giây 3 vòng gai đá lần lượt trồi lên quanh tướng (1,5 / 3 / 4,5 ô), mỗi vòng 25 sát thương, hất quái | +30% sát thương · +1 vòng (6 ô) · hồi chiêu 4 giây · gai để lại 2 giây làm chậm 30% |
| 4 | **Linh Hỏa Đom Đóm** | 53 | fx-13 / 4 | Mỗi 6 giây gọi 3 đốm lửa linh hồn tự bay tìm quái trong 6 giây, mỗi lần chạm 5 sát thương rồi bay sang con khác | +1 đốm · +30% sát thương · +1 đốm · gọi lại mỗi 5 giây, +30% sát thương |
| 5 | **Phượng Hoàng Hỏa** | 54 | fx-14 / 1 | Mỗi 5 giây phượng lửa bay thẳng 8 ô theo hướng đi, xuyên quái, 45 sát thương, để vệt lửa 2 giây (8/giây) | +30% sát thương · vệt lửa 3 giây · hồi chiêu 4 giây · 2 phượng chéo nhau, +30% sát thương |
| 6 | **Thánh Thủy Bình** | 55 | fx-14 / 2 | Mỗi 3 giây ném 1 bình vào quái gần nhất, vỡ thành vũng nước thánh 1,4 ô trong 3 giây, 12 sát thương mỗi giây | +1 bình · vũng +25% · 18 sát thương/giây · +1 bình, vũng hồi 1 máu/giây cho tướng đứng trong |
| 7 | **Thiên La Võng** | 56 | fx-14 / 3 | Mỗi 8 giây tung lưới bạc phủ vùng 2 ô quanh quái đông nhất: trói quái 1,5 giây (tinh anh 0,4), 20 sát thương | lưới +20% · trói 2 giây · hồi chiêu 6 giây · quái bị trói nhận thêm 25% sát thương |
| 8 | **Nguyệt Luân** | 57 | fx-14 / 4 | Đĩa trăng bạc bay ra, chạm mép màn hình thì bật lại, sống 4 giây, xuyên quái, 16 sát thương; mỗi 5 giây | +1 đĩa · +30% sát thương · sống 6 giây · +1 đĩa, đĩa to gấp đôi |
| 9 | **Kính Chiếu Yêu** | 58 | fx-15 / 1 | Mỗi 3 giây gương đồng chiếu tia hình nón 60° dài 5 ô, 40 sát thương, quái trúng bị lộ (nhận thêm 10% sát thương 3 giây) | +30% sát thương · nón 90° · gấp 3 sát thương lên tinh anh và trùm · hồi chiêu 2,5 giây, lộ +20% |
| 10 | **Hạc Giấy Thần** | 59 | fx-15 / 2 | 3 con hạc giấy bay vòng (2,5 ô) quanh tướng, mỗi 2,5 giây một con lao xuống quái gần nhất, nổ vùng 1 ô, 45 sát thương | +1 hạc · +30% sát thương · lao mỗi 1,5 giây, +2 hạc · nổ +25% |
| 11 | **Thủy Long Ba** | 60 | fx-15 / 3 | Mỗi 6 giây một bức sóng nước rộng 4 ô tràn về phía trước 7 ô, 30 sát thương, cuốn quái lùi theo sóng | +30% sát thương · sóng rộng 6 ô · hồi chiêu 4,5 giây · sóng tràn cả 2 hướng, làm chậm 30% |
| 12 | **Liên Nỏ** | 61 | fx-15 / 4 | Nỏ liên châu bắn loạt 5 mũi tên nhanh theo hướng mặt (0,08 giây một mũi), 9 sát thương; mỗi 1,5 giây | +2 mũi · xuyên 1 quái · +30% sát thương · loạt 10 mũi xòe 3 hướng |

## Nội tại (8)

| # | Tên | Icon | FX | Cấp 1 | Cấp 5 |
|---|---|---|---|---|---|
| 1 | **Khiên Linh Quang** | 62 | fx-16 / 1 | Khiên hấp thụ 8% máu tối đa, hồi đầy sau 6 giây không bị đánh | Khiên 40%, hồi sau 4 giây; vỡ khiên thì đẩy quái quanh 2 ô |
| 2 | **Ảo Ảnh Bộ** | 63 | fx-16 / 2 | 4% né đòn (để lại ảo ảnh) | 20% né; né xong +30% tốc chạy 1 giây |
| 3 | **Đồ Long** | 64 | — | +8% sát thương lên tinh anh và trùm | +40%; đòn đầu tiên lên trùm mỗi 10 giây ×2 |
| 4 | **Hàn Khí** | 65 | fx-16 / 3 | Đòn kỹ năng có 5% làm chậm 30% 1,5 giây | 25%; quái đã chậm trúng thêm lần nữa thì đóng băng 0,8 giây |
| 5 | **Hỏa Ấn** | 66 | (dùng cháy sẵn có) | Đòn kỹ năng có 6% gây cháy 5/giây trong 3 giây | 30%, cháy 10/giây; quái chết khi đang cháy lây cho 1 quái gần |
| 6 | **Sát Ý** | 67 | fx-16 / 4 | Mỗi quái hạ trong 3 giây +0,5% sát thương (tối đa 10 tầng) | +1% mỗi tầng, tối đa 25 tầng |
| 7 | **Cuồng Nộ** | 68 | (dùng fx-16 / 4 tô đỏ) | Dưới 50% máu: +6% sát thương, +4% tốc chạy | +30% sát thương, +20% tốc chạy, dưới 30% máu hút 1 máu mỗi đòn |
| 8 | **Phong Tiễn** | 69 | — | Đạn, đĩa, lưỡi bay nhanh hơn 10%, tầm +5% | Nhanh hơn 50%, tầm +25% |

Cấp 2–4 của nội tại chia đều giữa cấp 1 và cấp 5.

## Gợi ý tiến hóa (làm sau)

- Nguyệt Luân + Phong Tiễn → **Nhật Nguyệt Song Luân**
- Kim Cương Chưởng + Giáp Hắc Thạch → **Như Lai Thần Chưởng**
- Phượng Hoàng Hỏa + Hỏa Ấn → **Phượng Hoàng Niết Bàn**
- Thiên La Võng + Hàn Khí → **Băng La Thiên Võng**
- Liên Nỏ + Sát Ý → **Vạn Tiễn Xuyên Tâm**

## Thứ tự vẽ

1. `icon-ky-nang-3` (prompt icon-ky-nang-3.md)
2. `fx-13`, `fx-14`, `fx-15` (12 chủ động)
3. `fx-16` (khiên, ảo ảnh, băng khi trúng, hào quang Sát Ý / Cuồng Nộ)

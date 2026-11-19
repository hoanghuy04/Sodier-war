# 18. Bãi quái (Thế giới mở và phòng đấu)

10 cấp bãi quái, **mỗi bãi 10 con**. Cấp càng cao thì nằm càng gần tâm bản đồ, quái càng mạnh. Từ **cấp 5** trở lên quái mạnh hơn hẳn, cần đội lớn.

**Quái trung lập (11/11/2026):** quái ở bãi, boss và lính canh mỏ không tự đánh ai; quân người chơi cũng không tự đánh chúng. Chỉ khi người chơi ra lệnh (chuột phải vào một con, hoặc lệnh chiếm mỏ có lính canh) hoặc gây sát thương thì cả hai bên mới đánh nhau, và quái chỉ đánh những người đã gây sự (`team.aggro`). Hết trận thì quái trung lập lại. Người với người vẫn tự đánh.

**Rơi đồ theo từng con:** mỗi con quái bị hạ tự tung xác suất rơi đồ của nó, rồi chọn độ hiếm theo bảng riêng của loài đó. Đồ rơi ngay chỗ con quái chết và thuộc về người hạ. Dọn sạch cả bãi thì được thêm tài nguyên thưởng.

Model quái là hình 3D đơn giản dựng bằng `tools/unitgen/beasts.mjs` (8 hướng, các tư thế chờ / đi / đánh / trúng đòn / chết), xuất ra `docs/design/assets/units-beasts/`, rồi `node tools/build-assets.mjs --only=units` chép vào game.

## Bãi quái

| Cấp | 10 con gồm | Số bãi (map 384) | Thưởng dọn sạch | Hồi lại |
|---|---|---|---|---|
| 1 | 10 Chuột khổng lồ | 16 | 40 Sắt, 20 Than | 1,5 phút |
| 2 | 10 Sói xám | 14 | 70 Sắt, 35 Than | 2 phút |
| 3 | 6 Goblin + 4 Goblin cung | 11 | 90 Sắt, 40 Than, 20 Vàng | 2,5 phút |
| 4 | 10 Nhện độc | 11 | 40 Vàng, 20 Dầu | 3 phút |
| 5 | 10 Gấu nâu | 9 | 60 Vàng, 30 Dầu | 4 phút |
| 6 | 7 Orc + 3 Goblin cung | 7 | 80 Vàng, 15 Dầu đen | 5 phút |
| 7 | 6 Troll đá + 4 Orc | 7 | 100 Vàng, 25 Dầu đen, 8 Pha lê | 6 phút |
| 8 | 6 Minotaur + 4 Troll | 5 | 120 Vàng, 15 Pha lê | 7 phút |
| 9 | 6 Wyvern + 4 Minotaur | 5 | 20 Pha lê, 4 Kim cương | 8 phút |
| 10 | 1 Rồng cổ đại + 5 Wyvern + 4 Minotaur | 2 | 30 Pha lê, 10 Kim cương | 10 phút |

## Từng loài: sức mạnh và tỉ lệ rơi đồ

Màu đồ: Thường (trắng), Tốt (xanh lá), Hiếm (xanh dương), Sử thi (tím), Huyền thoại (cam).

| Quái | Máu · Đánh | Tỉ lệ rơi đồ | Nếu rơi thì ra |
|---|---|---|---|
| Chuột khổng lồ | 50 · 6 | 8% | Trắng 85%, Xanh lá 15% |
| Sói xám | 100 · 12 | 10% | Trắng 60%, Xanh lá 37%, Xanh dương 3% |
| Goblin / Goblin cung | 140 · 14 / 90 · 13 (bắn xa) | 12% | Trắng 30%, Xanh lá 55%, Xanh dương 15% |
| Nhện độc | 260 · 18, làm chậm | 14% | Xanh lá 55%, Xanh dương 42%, Tím 3% |
| Gấu nâu | 900 · 40 | 18% | Xanh lá 30%, Xanh dương 58%, Tím 12% |
| Orc chiến binh | 1 000 · 48 | 20% | Xanh dương 60%, Tím 36%, Cam 4% |
| Troll đá | 2 200 · 75, dậm đất | 24% | Xanh dương 45%, Tím 48%, Cam 7% |
| Minotaur | 3 000 · 95, dậm đất | 28% | Xanh dương 30%, Tím 58%, Cam 12% |
| Wyvern | 3 500 · 85, phun lửa | 32% | Xanh dương 15%, Tím 65%, Cam 20% |
| Rồng cổ đại | 12 000 · 150, phun lửa | chắc chắn rơi **2 món** | Tím 50%, Cam 50% |

Trung bình một bãi cấp 1 rơi khoảng 0,8 món, bãi cấp 10 khoảng 5 món. Số liệu nằm trong `shared/balance.js` (`GUARDS`: `drop`, `loot`; `CAMPS`).

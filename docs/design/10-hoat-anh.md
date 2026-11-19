# 10. Hoạt ảnh

## 10.1 Tám hướng

| Mã | Hướng | Tên trong yêu cầu | Người xem thấy |
|---|---|---|---|
| `S` | Xuống | **Đi xuống** / mặt trước | Mặt, ngực, vũ khí phía trước |
| `N` | Lên | **Quay lưng** | Lưng, áo choàng, mũ từ phía sau, mũi vũ khí thò lên trên đầu |
| `W` | Trái | **Quay trái** | Mặt nghiêng, nhìn sang trái |
| `E` | Phải | **Quay phải** | Mặt nghiêng, nhìn sang phải |
| `SE` | Chéo xuống phải | Chéo | Ba phần tư mặt trước, hướng phải |
| `SW` | Chéo xuống trái | Chéo | Ba phần tư mặt trước, hướng trái |
| `NE` | Chéo lên phải | Chéo | Ba phần tư lưng, hướng phải |
| `NW` | Chéo lên trái | Chéo | Ba phần tư lưng, hướng trái |

**Chọn hướng từ vận tốc:** `góc = atan2(vy, vx)`, chia 8 khoảng 45°. Có **vùng trễ ±10°**: hướng chỉ đổi khi góc vượt khỏi khoảng hiện tại hơn 10°, để quân đi chéo nhẹ không nhấp nháy giữa hai hướng.

**Khi đánh nhau**, quân quay mặt về đối thủ, không quay theo vận tốc.

**Vẽ cả 8 hướng.** Art sinh bằng code (mục 10.8) nên không tốn công. Vũ khí luôn ở tay phải, khiên ở tay trái. Lật gương chỉ dùng tạm khi đang làm dở art.

## 10.2 Danh sách trạng thái

| Trạng thái | Khung | Tốc độ | Lặp | Khi nào |
|---|---|---|---|---|
| **Chờ** (`idle`) | 4 | 6 khung/giây | Có | Đứng yên trong đội hình |
| **Chờ lâu** (`idle_fidget`) | 6 | 8 khung/giây | Không | Ngẫu nhiên mỗi 6–12 giây khi chờ: nhìn quanh, gãi đầu, chống kiếm |
| **Đi** (`walk`) | 6 | 10 khung/giây (nhân với tốc độ thật / tốc độ gốc) | Có | Di chuyển |
| **Quay** (`turn`) | 1 khung mỗi hướng trung gian, 60 ms | — | Không | Đổi hướng lệch hơn 45° (mục 10.3) |
| **Thủ thế** (`combat_idle`) | 2 | 4 khung/giây | Có | Đang có cặp, chờ hết thời gian hồi đòn |
| **Đánh** (`attack`) | 6 | Co giãn theo hồi đòn (mục 10.5) | Không | Đòn cận chiến |
| **Bắn** (`shoot`) | 6 | Co giãn theo hồi đòn | Không | Cung thủ, Máy bắn đá |
| **Niệm** (`cast`) | 6 | Co giãn theo hồi đòn | Không | Pháp sư, Lam Nguyệt, Tinh linh |
| **Trúng đòn** (`hurt`) | 2 | 12 khung/giây | Không | Bị đánh: khung 1 tô trắng toàn thân, khung 2 lùi 1 px |
| **Chết** (`death`) | 6 | 8 khung/giây | Không, giữ khung cuối làm xác | HP về 0 |
| **Tan rã** (`rout`) | 4 | 10 khung/giây | Có | Nhân vật chính chết: buông vũ khí, chạy |
| **Chiến thắng** (`cheer`) | 4 | 6 khung/giây | 2 lần | Hết giao chiến và bên mình thắng (chỉ nhân vật chính) |
| **Bay lượn** (`hover`) | 6 | 8 khung/giây | Có | Chờ của quân bay |
| **Bay** (`fly`) | 6 | 12 khung/giây | Có | Đi của quân bay |

## 10.3 Quay lưng, quay trái, quay phải

- Hướng mới lệch hướng cũ **≤ 45°**: đổi ngay.
- Lệch **> 45°**: quay qua các hướng trung gian theo **chiều ngắn hơn**. Mỗi hướng trung gian hiện khung 0 của trạng thái Chờ trong **60 ms**.
- Lệch đúng 180° (ví dụ đang đi xuống thì **quay lưng** đi lên): quay **theo chiều kim đồng hồ**, cho khớp chiều xếp đội hình.

| Từ → Tới | Các hướng hiện ra | Tổng thời gian |
|---|---|---|
| `S` → `N` (quay lưng) | S → SW → W → NW → N | 180 ms |
| `S` → `E` (quay phải) | S → SE → E | 60 ms |
| `S` → `W` (quay trái) | S → SW → W | 60 ms |
| `E` → `W` | E → SE → S → SW → W | 180 ms |
| `N` → `S` | N → NE → E → SE → S | 180 ms |

Hoạt ảnh Quay không làm chậm di chuyển. Quân vẫn đi trong lúc quay.

## 10.4 Chu kỳ đi (quân bộ, 6 khung)

| Khung | Chân | Thân | Tay / vũ khí |
|---|---|---|---|
| 0 | Hai chân chạm đất, chân phải trước | Bình thường | Tay trái trước |
| 1 | Chân phải đỡ, chân trái nhấc | **Lên 1 px** | Về giữa |
| 2 | Chân trái vượt lên | Bình thường | Tay phải trước |
| 3 | Hai chân chạm đất, chân trái trước | Bình thường | Tay phải trước |
| 4 | Chân trái đỡ, chân phải nhấc | **Lên 1 px** | Về giữa |
| 5 | Chân phải vượt lên | Bình thường | Tay trái trước |

- Hướng `N`: áo choàng đung đưa trễ 1 khung so với thân.
- Hướng `E`/`W`: chân thấy rõ nhất, bước dài 3 px. Hướng `S`/`N`: bước ngắn 1–2 px, chủ yếu thấy thân nhún.
- Ngựa (Kỵ binh, Hiệp sĩ, Phong Vũ) có chu kỳ **phi nước kiệu 6 khung** riêng: bốn chân theo cặp chéo, bờm và đuôi lay trễ 1 khung, người cưỡi nhún 1 px ngược pha với ngựa.

## 10.5 Đòn đánh (cận chiến, 6 khung)

| Khung | Tên | Mô tả (Kiếm sĩ, hướng `E`) | Thời lượng tương đối |
|---|---|---|---|
| 0 | Chuẩn bị | Chân trước bước tới 1 px, khiên đưa lên | 15% |
| 1 | Vung lên | Kiếm ra sau đầu | 20% |
| 2 | Bổ xuống | Kiếm ngang vai, vệt mờ 1 px | 10% |
| 3 | **Trúng** | Kiếm duỗi thẳng về đối thủ, **sát thương tính ở khung này**, tia lóe xuất hiện | 10% |
| 4 | Theo đà | Kiếm chúi xuống, thân nghiêng | 20% |
| 5 | Về thế | Trở về tư thế Thủ thế | 25% |

- **Thời lượng đòn** = min(0,6 giây, 0,8 × hồi đòn). Phần còn lại của thời gian hồi đòn là Thủ thế.
- Hai quân trong một cặp **lệch nhịp**: quân ra đòn sau bắt đầu chậm ngẫu nhiên 0–0,3 giây để hai bên không vung kiếm cùng lúc như soi gương.
- Bị đánh trúng đúng lúc đang ở khung 0–1: quân vẫn đánh tiếp (không bị ngắt đòn), chỉ chồng khung tô trắng của Trúng đòn lên.

Biến thể theo binh chủng:

| Binh chủng | Đòn đánh |
|---|---|
| Dân quân | Đâm chĩa thẳng (không vung) |
| Lính giáo | Đâm giáo dài 2 nhịp: khung 3 đâm ra 4 px |
| Kỵ binh / Hiệp sĩ | Ngựa chồm lên ở khung 1–2, người cưỡi chém xuống ở khung 3 |
| Sư thứu | Lao xuống mổ, cánh xòe rộng ở khung 2 |
| Rồng | 8 khung: ngửa cổ (0–2), há miệng sáng dần (3), phun lửa (4–6, luồng lửa là sprite riêng 48×24 chạy 6 khung), ngậm lại (7) |
| Nhân vật | Mỗi nhân vật có đòn riêng (chém hai tay, búa nện, giáo đâm từ lưng ngựa, vẩy gậy, quất roi lửa) |

## 10.6 Chết (6 khung)

1. Giật ngửa ra sau (khung tô trắng).
2. Khuỵu gối.
3. Vũ khí rơi ra (vũ khí thành sprite riêng, văng 2–4 px).
4. Ngã nghiêng theo **hướng bị đánh** (luôn ngã ra xa kẻ đánh).
5. Chạm đất, bụi 2 khung.
6. Nằm yên. Đây là khung xác, giữ 8 giây rồi mờ dần trong 1 giây.

Quân bay chết thì rơi xuống: bóng đổ to dần tới khi trùng với thân, rồi chạm đất bung bụi.

## 10.7 Kích thước sprite

Kích thước thật lấy theo sprite đã dựng ở [14-mo-hinh-quan.md](14-mo-hinh-quan.md) mục 14.7 (bộ binh 72 × 84, kỵ 105 × 114, Sư thứu 126 × 132, Rồng 174 × 162, Máy bắn đá 126 × 114; quân cao ~40 px). Các con số 16 × 16 ban đầu đã bỏ.

- **Thứ tự vẽ:** theo `y` của điểm neo, nhỏ trước lớn sau. Bóng của quân bay vẽ trước mọi quân dưới đất.
- **Viền ngoài:** `#1B1726` dày 1 px quanh mọi sprite.

## 10.8 Màu người chơi và cách tạo art

- Mỗi sprite có 3 màu "dành chỗ" (áo choàng, cờ, hoa văn khiên) được thay bằng **màu người chơi** lúc chạy (palette swap). Có 10 màu người chơi: lam, cam, tím, vàng chanh, hồng, ngọc, nâu đỏ, trắng ngà, xám than, xanh trời. **Không dùng xanh lá thuần và đỏ thuần**, vì hai màu đó dành cho viền sở hữu mỏ.
- Art được **sinh bằng code**: `tools/unitgen/` dựng mỗi quân thành búp bê 3D rồi chiếu ra pixel ở 8 hướng (xem [14-mo-hinh-quan.md](14-mo-hinh-quan.md)). Chạy `node tools/unitgen/build.mjs` để sinh lại sprite sheet, GIF và trang xem trước `assets/units/xem-truoc.html`.
- **Sprite sheet:** mỗi thực thể một file PNG. Mỗi trạng thái là một khối 8 hàng (thứ tự S, SW, W, NW, N, NE, E, SE, tức theo chiều kim đồng hồ trên màn hình, bắt đầu từ hướng xuống), mỗi hàng là các khung của trạng thái đó. Kèm file JSON:

```json
{
  "size": [16, 16], "anchor": [8, 15],
  "states": {
    "walk":   { "row": 0,  "frames": 6, "fps": 10, "loop": true },
    "attack": { "row": 8,  "frames": 6, "fps": 0,  "loop": false, "hitFrame": 3,
                "weights": [0.15, 0.2, 0.1, 0.1, 0.2, 0.25] },
    "death":  { "row": 16, "frames": 6, "fps": 8,  "loop": false, "holdLast": true }
  }
}
```

## 10.9 Hiệu ứng đi kèm

| Hiệu ứng | Khung | Kích thước | Khi nào |
|---|---|---|---|
| Bụi chân | 3 | 6 × 4 | Mỗi bước của ngựa, quân đi trên sa mạc / đất đỏ |
| Tia lóe trúng đòn | 3 | 6 × 6 | Khung Trúng |
| Mũi tên | 1 (xoay 16 góc) | 7 × 1 | Cung thủ |
| Cầu phép | 4 | 6 × 6 | Pháp sư, có vệt đuôi 3 điểm |
| Đá lửa | 4 (cháy) | 8 × 8 | Máy bắn đá, có bóng trên mặt đất co giãn theo độ cao |
| Lửa cháy trên ô | 6 | 16 × 16 | Ô bị đốt |
| Luồng lửa Rồng | 6 | 48 × 24 | Rồng phun |
| Triệu tập | 8 | 24 × 32 | Quân mới xuất hiện: cột sáng màu người chơi, cờ cắm xuống |
| Khiên (Tường khiên) | 4 | 16 × 16 | Kỹ năng Thạch Lâm |
| Sao băng | 6 | 16 × 32 | Kỹ năng Lam Nguyệt |
| Sóng gầm | 6 | vòng tròn tới 5 ô | Kỹ năng Hỏa Kỳ |

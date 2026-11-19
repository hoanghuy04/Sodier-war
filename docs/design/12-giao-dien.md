# 12. Giao diện

Giao diện dùng **DOM thuần** cho các bảng và **Canvas 2D** cho bản đồ, giống Ant War. Font pixel cho tiêu đề và số (ví dụ "Pixelify Sans" hoặc font bitmap tự vẽ 5×7). Font thường cho đoạn chữ dài. Các khung bảng có viền gỗ tối 2 px và góc vát pixel.

## 12.1 Bố cục màn hình chơi

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ⛏ 1 240 +109 │ ● 380 +58 │ ✦ 92 +30 │ 🛢 40 +13 │ ◉ 12 +8 │ ◆ 5 +5 │ 💎 0 +3 │  quản lý 94%   ┌──────────┐
│──────────────────────────────────────────────────────────────────────────┘  │ MINIMAP  │
│ ⚔ An đã hạ Bình (Kiếm Vương)                                                │ 180×180  │
│ ⚠ Mỏ Vàng (52,77) đang bị chiếm!                                            └──────────┘
│                                                                             ┌──────────┐
│                                                                             │ THÔNG TIN│
│                      ( bản đồ, khối quân, mỏ )                              │ (thứ đang│
│                                                                             │  chọn)   │
│                                                                             └──────────┘
│┌────────┐ ┌───────────────────────────────────────┐ ┌──────────────────────┐            │
││chân dung│ │ 🗡×12 🛡×6 🏹×8 🐎×4 ... │ ô 30/36 │ G │ │ [Q] Tường khiên  ▓▓░ │  [B] Cửa hàng│
││ HP ████ │ └───────────────────────────────────────┘ └──────────────────────┘            │
│└────────┘                                                                                │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

## 12.2 Thanh tài nguyên (trên cùng)

- 7 ô theo thứ tự Sắt, Than, Vàng, Dầu, Dầu đen, Pha lê, Kim cương. Mỗi ô có **biểu tượng pixel 12×12** (lấy dáng từ mô hình mỏ: cục quặng, cục than, thỏi vàng, giọt dầu nâu, giọt dầu đen, tinh thể tím, viên kim cương), **số đang có** và **+sản lượng/phút** màu xanh nhạt.
- Số tăng lên thì chạy dần (đếm lên trong 0,3 giây). Mua quân thì ô bị trừ nháy đỏ.
- Rê chuột lên một ô tài nguyên: danh sách mỏ loại đó đang giữ, sản lượng từng mỏ, thưởng giữ mỏ.
- Hệ số quản lý (khi < 100%) hiện ở cuối thanh, màu cam.

## 12.3 Minimap (góc trên phải)

- 256 × 256 px, mỗi pixel là 1 ô (xem [02-ban-do.md](02-ban-do.md) mục 2.9). Nền tô màu vùng đất. Vòng lõi vẽ nét đứt.
- Mỏ: ô vuông 3 px màu tài nguyên, khung xanh / đỏ / xám ([11-mo-hinh-mo.md](11-mo-hinh-mo.md) mục 11.10).
- Nhân vật mình: chấm trắng nhấp nháy. Đội người khác trong tầm nhìn: chấm màu người chơi. Chỗ thấy lần cuối: chấm đỏ mờ.
- Khung chữ nhật trắng là vùng camera đang nhìn.
- Mỏ mình đang bị chiếm: vòng đỏ lan ra từ mỏ, lặp mỗi giây.
- Phím **M** phóng minimap lên 400 × 400 giữa màn hình.

## 12.4 Góc dưới bên trái: nhân vật

- Chân dung 48×48 chạy hoạt ảnh chờ. Khi bị đánh, khung chân dung nháy đỏ.
- Thanh HP to. Đang được Hộ giá thì có biểu tượng khiên nhỏ ([08-chien-dau.md](08-chien-dau.md) mục 8.5).
- Tên nhân vật, thời gian sống của đời này.

## 12.5 Dưới giữa: tóm tắt đội quân

- Biểu tượng từng binh chủng kèm số lượng, chỉ hiện loại đang có. Bấm vào một biểu tượng thì các quân loại đó nháy viền trắng trên bản đồ.
- **Ô đã dùng / tối đa** (ví dụ `30/36`) và nút chế độ xếp **G** (Theo thứ tự mua / Đội hình chiến đấu).
- Bên phải là nút kỹ năng **Q**: biểu tượng, tên, vòng hồi chiêu chạy theo chiều kim đồng hồ.

## 12.6 Cửa hàng quân (phím B)

```
┌─ CỬA HÀNG ─────────────────────────────────────────────── [x] ─┐
│  [1]          [2]          [3]          [4]          [5]       │
│ ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐       │
│ │ ☺    │    │ ☺🛡  │    │ ☺/   │    │ ☺)   │    │ 🐎    │       │
│ │Dân   │    │Kiếm  │    │Lính  │    │Cung  │    │Kỵ    │       │
│ │quân  │    │sĩ    │    │giáo  │    │thủ   │    │binh  │       │
│ │⛏40   │    │⛏80 ●20│   │⛏70 ●25│   │⛏60 ●30│   │⛏110 ●20 ✦30│
│ │[MUA] │    │[MUA] │    │[MUA] │    │[MUA] │    │ thiếu ✦12 │   │
│ └──────┘    └──────┘    └──────┘    └──────┘    └──────┘       │
│  [6] Hiệp sĩ   [7] Pháp sư   [8] Máy bắn đá   [9] Sư thứu  [0] RỒNG │
│ ─────────────────────────────────────────────────────────────── │
│  Mở rộng đội hình:  Vòng 4 (+24 ô) ✦200 [MUA]   Vòng 5 🔒      │
│  Đang triệu tập: 🗡 2s ▓▓▓░  🐎 3s ▓░░░                         │
└──────────────────────────────────────────────────────────────────┘
```

- Mỗi thẻ có: sprite chạy hoạt ảnh **Đi** hướng `S`, tên, giá (biểu tượng + số, phần thiếu tô đỏ), số ô đội hình chiếm.
- Rê chuột lên thẻ: chỉ số đầy đủ, lớp quân, **khắc** gì / **bị khắc** bởi gì (biểu tượng), mô tả 1 dòng. Ô đội hình mà quân sẽ đứng sáng lên trên bản đồ.
- Thẻ **Rồng** to gấp đôi ở cuối hàng, viền vàng đồng, ghi "Đang có x/2".
- Bấm **MUA** (hoặc phím số khi cửa hàng mở). Giữ **Shift** khi bấm thì mua 5 cái liền (nếu đủ tiền và đủ ô).
- **Hàng triệu tập:** các quân đang chờ xuất hiện, kèm thanh thời gian.
- Cửa hàng mở được bất cứ lúc nào, kể cả khi đang đánh (thời gian triệu tập gấp đôi).

## 12.7 Thông báo

| Loại | Vị trí | Ví dụ | Màu |
|---|---|---|---|
| Hệ thống toàn server | Trên trái, dưới thanh tài nguyên, giữ 6 giây | "⚔ An đã hạ Bình (Kiếm Vương)", "🐉 Chi đã triệu hồi Rồng!" | Trắng |
| Cảnh báo riêng | Giữa trên, giữ 4 giây, có âm báo | "⚠ Mỏ Vàng (52,77) đang bị chiếm!" (bấm vào để camera nhảy tới) | Đỏ |
| Thành công | Giữa trên | "Đã chiếm Mỏ Pha lê" | Xanh |
| Không làm được | Gần con trỏ | "Thiếu 12 Vàng", "Đội hình đầy" | Cam |

## 12.8 Màn hình THẤT BẠI

Hiện ngay sau hoạt ảnh chết của nhân vật (1 giây).

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              ████  T H Ấ T   B Ạ I  ████                 │   ← chữ pixel đỏ to, rơi xuống rồi rung nhẹ
│                                                          │
│         Thạch Lâm đã ngã xuống dưới tay  An              │
│                                                          │
│   ┌────────────────────────────────────────────────┐     │
│   │  Thời gian sống ............. 27 phút 14 giây  │     │
│   │  Mỏ giữ nhiều nhất cùng lúc .............. 9   │     │
│   │  Quân đã mua (giá trị) ............. 6 420     │     │
│   │  Quân địch đã hạ (giá trị) ......... 3 115     │     │
│   │  Điểm đời này ........................ 412     │     │
│   │  Điểm cao nhất ........... 655 (hạng 2 server) │     │
│   └────────────────────────────────────────────────┘     │
│                                                          │
│               ┌──────────────────────┐                   │
│               │    BẮT ĐẦU LẠI  ⏎    │                   │   ← nút chính, to, nháy nhẹ
│               └──────────────────────┘                   │
│                  Xem tiếp trận đấu                       │   ← liên kết nhỏ: theo dõi người đã hạ mình
└──────────────────────────────────────────────────────────┘
```

- **Nền:** bản đồ vẫn chạy phía sau nhưng chuyển sang **đen trắng**, viền màn hình tối đỏ (vignette). Camera đứng yên ở chỗ nhân vật ngã.
- **Chữ "THẤT BẠI":** font pixel 32 px màu `#FF4A4A` viền `#3A0A0A`. Rơi từ trên xuống trong 0,4 giây, chạm thì rung 3 px.
- **Âm thanh:** trống trầm một tiếng, nhạc nền tắt dần.
- **Nút BẮT ĐẦU LẠI** (hoặc phím Enter):
  1. Mở màn hình chọn nhân vật ([06-nhan-vat-chinh.md](06-nhan-vat-chinh.md) mục 6.4), chọn sẵn nhân vật vừa dùng.
  2. Bấm **Xuất trận**: đếm ngược 3 giây, nhân vật xuất hiện ở điểm xuất phát mới ([02-ban-do.md](02-ban-do.md) mục 2.6) với vốn khởi đầu và khiên 60 giây.
- **Xem tiếp trận đấu:** camera theo dõi người đã hạ mình. Thanh trên cùng ghi "Đang xem An", có nút **Bắt đầu lại**.
- Điểm đời này được lưu vào bảng xếp hạng. Mọi thứ khác (kho, quân, mỏ) mất hết.

## 12.9 Bảng xếp hạng (giữ Tab)

| Cột | Ý nghĩa |
|---|---|
| Hạng | Theo điểm đời hiện tại |
| Người chơi | Tên + màu |
| Nhân vật | Biểu tượng nhân vật đang dùng |
| Điểm | Đời hiện tại |
| Mỏ | Số mỏ đang giữ (kèm biểu tượng Kim cương nếu có) |
| Quân | Số ô quân đang có |
| 🐉 | Số Rồng |
| Cao nhất | Điểm cao nhất mọi đời |

## 12.10 Màn hình vào game

1. Nhập tên (lưu lại cho lần sau) và mã mời của server (giống Ant War).
2. Chọn nhân vật.
3. Vào bản đồ.

Mất kết nối: màn hình mờ, hiện "Đang kết nối lại…". Trong lúc đó nhân vật **đóng trại** tại chỗ: đứng yên, vẫn bị tấn công được. Quay lại trong 2 phút thì chơi tiếp. Quá 2 phút thì nhân vật rút khỏi bản đồ, mỏ thành mỏ trống, tính như một đời đã kết thúc (không có người hạ).

## 12.11 Âm thanh (định hướng)

- Nhạc nền chiptune, tiết tấu nhanh dần khi có đội địch trong 18 ô.
- Mỗi lớp quân có tiếng đánh riêng (keng kiếm, phựt cung, bùm phép, ầm đá lửa, gầm Rồng).
- Mỏ có tiếng môi trường khi camera ở gần: lạch cạch xe goòng, bơm dầu kẽo kẹt, hắc ín lục bục, pha lê ngân.

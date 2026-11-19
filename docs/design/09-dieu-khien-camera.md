# 9. Điều khiển và camera

## 9.1 Chuột

| Thao tác | Kết quả |
|---|---|
| **Chuột phải** vào đất trống | Nhân vật đi tới điểm đó (tìm đường A* quanh vật cản). Cả đội đi theo. Một dấu chữ thập xanh nháy ở điểm đến |
| **Chuột phải** vào mỏ | Đi tới tâm mỏ và đứng trong vòng chiếm. Chiếm tự động khi đủ điều kiện |
| **Chuột phải** vào quân/nhân vật địch | **Đuổi theo**: đích đi liên tục cập nhật theo vị trí địch, tới khi chạm thì giao chiến. Dấu chữ thập đỏ |
| **Chuột phải** vào lính canh mỏ | Đi tới và đánh lính canh |
| **Chuột phải** mà lỡ kéo nhẹ (< 6 px) | Vẫn tính là bấm. Kéo xa hơn thì bỏ qua, không ra lệnh |
| **Chuột trái** vào một thứ | **Chọn** thứ đó, bảng **Thông tin** bên phải hiện chi tiết và các nút thao tác (mục 9.2) |
| **Chuột trái** vào đất trống | Bỏ chọn |
| **Chuột trái** vào minimap | Camera nhảy tới đó. Giữ và kéo trên minimap để lướt |
| **Chuột phải** vào minimap | Ra lệnh đi tới điểm đó trên bản đồ |
| **Giữ chuột giữa và kéo** | **Kéo bản đồ** (camera đi ngược hướng kéo, 1:1 theo pixel màn hình). Con trỏ đổi thành bàn tay nắm |
| **Lăn chuột** | Phóng to / thu nhỏ **theo nấc nguyên** ×1, ×2, ×3, ×4 quanh vị trí con trỏ. Pixel luôn sắc nét |
| **Rê chuột** | Tooltip ngắn: tên quân/mỏ, chủ, máu. Thứ dưới con trỏ có viền trắng 1 px |

## 9.2 Thao tác với thứ đã chọn (chuột trái)

| Thứ được chọn | Bảng thông tin | Nút |
|---|---|---|
| Nhân vật của mình | Chỉ số, nội tại, kỹ năng, danh sách quân theo loại, số ô đã dùng / tối đa | **Kỹ năng (Q)**, **Cửa hàng (B)**, **Đổi chế độ xếp (G)**, **Dừng (H)** |
| Quân của mình | Chỉ số, máu, ô số mấy trong đội hình, đã giết bao nhiêu | **Giải tán** (hoàn 30%, có hỏi lại) |
| Mỏ | Xem [03-khoang-san.md](03-khoang-san.md) mục 3.8 | **Đi tới mỏ này** |
| Nhân vật người khác | Tên người chơi, nhân vật, máu, số quân ước lượng, số mỏ đang giữ | **Đuổi theo** |
| Quân người khác / lính canh | Chỉ số, máu, lớp, khắc chế gì | **Tấn công** (= chuột phải) |

## 9.3 Bàn phím

| Phím | Tác dụng |
|---|---|
| **Space** | Đưa camera về nhân vật |
| **F** | Bật/tắt camera **bám theo** nhân vật (mặc định bật. Kéo bản đồ bằng chuột giữa thì tự tắt) |
| **Q** | Dùng kỹ năng nhân vật. Mưa sao băng cần thêm một lần chuột trái chọn điểm, chuột phải hủy |
| **B** | Mở/đóng cửa hàng quân |
| **1 – 0** | Mua nhanh binh chủng 1–10 khi cửa hàng đang mở |
| **G** | Đổi chế độ xếp đội hình |
| **H** | Dừng lại tại chỗ |
| **Tab** (giữ) | Bảng xếp hạng |
| **M** | Phóng to minimap |
| **Esc** | Đóng bảng đang mở, hủy chọn, hủy chọn điểm kỹ năng |
| **Enter** | Mở ô chat |
| **+ / −** | Phóng to / thu nhỏ (như lăn chuột) |
| **Phím mũi tên** | Kéo camera bằng phím (tắt camera bám) |

## 9.4 Camera

- Khung nhìn bằng kích thước cửa sổ trình duyệt. Canvas vẽ với `imageSmoothingEnabled = false`.
- **Phóng:** nấc nguyên ×1–×4, mặc định ×3 (một ô = 48 px màn hình). Đổi nấc thì giữ nguyên điểm bản đồ dưới con trỏ.
- **Bám theo:** camera bám nhân vật với độ trễ mượt (lerp 12%/khung). Nhân vật đi ra khỏi vùng giữa 40% màn hình thì camera mới bắt đầu chạy (vùng chết), nên khi đánh nhau màn hình không lắc.
- **Giới hạn:** camera không ra quá rìa bản đồ quá nửa màn hình.
- **Kéo bằng chuột giữa:** khi buông chuột vẫn trôi nhẹ thêm (quán tính, giảm 15%/khung, tắt được trong cài đặt).
- Nhân vật ra ngoài khung nhìn: mép màn hình hiện **mũi tên chỉ về nhân vật** kèm khoảng cách (ô).

## 9.5 Phản hồi khi ra lệnh

- Bấm chuột phải: dấu chữ thập 4 khung (to → nhỏ) ở điểm đến, đường chấm mờ từ nhân vật tới đó trong 1 giây.
- Lệnh không làm được (ví dụ bấm vào vật cản kín): dấu chữ thập xám lắc nhẹ, nhân vật đi tới điểm đi được gần nhất.
- Nhân vật hô một câu ngắn trong bong bóng chữ pixel (ví dụ "Tiến lên!", "Chiếm mỏ!"), tối đa 1 lần mỗi 4 giây. Tắt được.

## 9.6 Cài đặt

- Đổi chức năng chuột trái/phải (cho người quen kiểu khác).
- Tốc độ kéo bản đồ, bật/tắt quán tính.
- Bật/tắt: số sát thương, vết máu, rung màn hình, bong bóng chữ.
- Âm lượng nhạc và hiệu ứng.

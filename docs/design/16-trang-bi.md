# 16. Trang bị và ô đồ

Nhân vật chính có **6 ô trang bị** và **túi đồ 16 ô**. Trang bị tăng 4 chỉ số: **Máu, Sát thương, Giáp, Tốc độ di chuyển**. Đồ chỉ có từ **lính canh mỏ** (cấp thấp) và **boss** (cấp cao), và chỉ dùng trong trận hiện tại.

## 16.1 Ô trang bị

```
            ┌──────┐
            │  MŨ  │            Mũ: + Máu
   ┌──────┐ └──────┘ ┌──────┐
   │ VŨ   │  (nhân  │ GIÁP │   Vũ khí: + Sát thương %     Giáp: + Giáp
   │ KHÍ  │   vật)  │      │
   └──────┘ ┌──────┐ └──────┘
   ┌──────┐ │ GIÀY │ ┌──────┐
   │ NHẪN │ └──────┘ │ BÙA  │   Giày: + Tốc độ cả đội      Nhẫn: + Sát thương %, + Máu   Bùa: + Máu %, + Giáp
   └──────┘          └──────┘
```

| Ô | Chỉ số chính | Thường | Tốt | Hiếm | Sử thi | Huyền thoại |
|---|---|---|---|---|---|---|
| **Vũ khí** | Sát thương | +8% | +16% | +28% | +45% | +70% |
| **Giáp** | Giáp | +4% | +7% | +11% | +16% | +22% |
| **Mũ** | Máu | +60 | +130 | +240 | +400 | +650 |
| **Giày** | Tốc độ di chuyển (cả đội) | +4% | +7% | +11% | +16% | +24% |
| **Nhẫn** | Sát thương + Máu | +5%, +30 | +9%, +60 | +15%, +110 | +24%, +180 | +36%, +280 |
| **Bùa** | Máu % + Giáp | +4%, +2% | +7%, +3% | +11%, +5% | +16%, +7% | +24%, +10% |

- **Tốc độ** của giày áp cho **cả đội** (đội đi theo tốc độ chung, xem chương 7), nên giày có ích cho cả khối quân.
- Giáp tổng của nhân vật tối đa **75%**.
- Từ **Hiếm** trở lên, món đồ có thêm **1 dòng phụ** ngẫu nhiên (một trong 4 chỉ số, bằng một nửa giá trị của ô có chỉ số đó ở cùng cấp). Huyền thoại có **2 dòng phụ**.

## 16.2 Năm cấp đồ

| Cấp | Màu | Nguồn |
|---|---|---|
| Thường | Trắng xám `#c8c4b0` | Lính canh Vàng, Dầu |
| Tốt | Xanh lá `#5fd35f` | Lính canh |
| Hiếm | Xanh dương `#4aa8ff` | Lính canh Dầu đen / Pha lê / Kim cương, boss |
| Sử thi | Tím `#c070ff` | Boss |
| Huyền thoại | Cam `#ffa020` | Golem Kim Cương (boss tâm) |

Tên đồ theo ô và cấp, ví dụ Vũ khí: *Kiếm Sắt → Kiếm Thép → Đao Lam Ngọc → Kiếm Hắc Diệu → Long Kiếm Kim Cương*.

## 16.3 Túi đồ và thao tác

- **Túi 16 ô.** Đồ nhặt được vào túi. Túi đầy thì không nhặt thêm (có thông báo).
- **Bấm vào đồ trong túi**: mặc vào ô tương ứng. Nếu ô đó đang có đồ thì đổi chỗ (đồ cũ về túi).
- **Bấm vào đồ đang mặc**: cởi ra túi.
- **Nút Vứt**: thả món đồ xuống đất ngay chỗ nhân vật.
- Rê chuột lên đồ: tên, cấp, chỉ số, và **so sánh** với món đang mặc ở ô đó (xanh là tăng, đỏ là giảm).
- Phím **I** hoặc nút **Đồ** (icon ba lô) trên thanh nút bên phải mở bảng Trang bị.

## 16.4 Nhặt đồ trên đất

- Đồ rơi nằm trên đất với **cột sáng màu theo cấp**, tên hiện khi rê chuột. Mất sau 120 giây.
- **Nhân vật chính** đi qua (≤ 1,5 ô) thì tự nhặt nếu túi còn chỗ. Chuột phải vào món đồ: nhân vật đi tới nhặt.
- Quân lính không nhặt đồ.

## 16.5 Khi nhân vật chết

Toàn bộ đồ đang mặc và trong túi **rơi xuống đất** quanh xác. Người hạ (hoặc bất kỳ ai) có thể nhặt. Đây là phần thưởng lớn của việc săn nhân vật địch cuối trận.

## 16.6 Ghi chú cân bằng

- Một bộ Huyền thoại đầy đủ: Máu khoảng +1 200, Sát thương +100% trở lên, Giáp +32%, Tốc độ đội +24%. Mạnh, nhưng chỉ có 1 Golem mỗi trận và Golem nằm ở tâm, nơi bo đóng lại cuối cùng.
- Đồ chỉ cộng cho **nhân vật chính**, trừ Giày (cả đội đi nhanh hơn). Quân lính vẫn mạnh nhờ mua quân và mỏ.

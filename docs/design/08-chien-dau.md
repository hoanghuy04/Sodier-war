# 8. Chiến đấu

## 8.1 Khi nào bắt đầu đánh

- Hai đội (của hai người chơi khác nhau, hoặc người chơi với lính canh) **chạm nhau** khi có một cặp quân hai bên cách nhau **≤ 1,2 ô**. Nhân vật cũng tính là quân.
- Lúc đó cả hai đội vào trạng thái **Giao chiến**:
  - Đội hình vỡ ra, mỗi quân tự bắt cặp với một đối thủ (mục 8.3).
  - Nhân vật vẫn nhận lệnh di chuyển (để rút lui, mục 8.7).
  - Thanh chiếm mỏ dừng lại.
- Cung thủ, Pháp sư, Máy bắn đá **bắn trước khi chạm**: địch vào tầm là bắn, dù hai đội chưa chạm. Bị bắn thì đội kia cũng vào Giao chiến.
- Người đang có **khiên bảo vệ** (60 giây đầu) không chạm và không bị bắn.

## 8.2 Vòng đời một trận

```
Tiếp cận ─► Chạm (≤1,2 ô) ─► Vỡ đội hình, bắt cặp ─► Đánh tay đôi
                                     ▲                     │
                                     │        một bên ngã xuống
                                     │                     ▼
                                     └── người thắng tìm đối thủ mới
                                                           │
                                Không còn địch trong 6 ô suốt 2 giây
                                                           ▼
                                        Hết giao chiến ─► Dồn hàng, về đội hình
```

## 8.3 Bắt cặp đánh tay đôi (cận chiến)

Mỗi quân có **sức chứa** = số đối thủ cận chiến được vây nó cùng lúc (cột "Đối thủ cận chiến cùng lúc" trong [04-quan-doi.md](04-quan-doi.md)). Quân thường có sức chứa 1, nên đánh **đúng một chọi một**.

Thuật toán (chạy mỗi 0,25 giây cho các quân đang Giao chiến mà chưa có cặp):

1. Lấy danh sách quân cận chiến chưa có cặp của hai bên.
2. Tính khoảng cách từng cặp (quân ta, quân địch còn sức chứa) trong phạm vi **8 ô**.
3. Sắp các cặp theo khoảng cách tăng dần. Duyệt lần lượt, cặp nào hai bên còn trống thì **ghép**. Đây là ghép tham lam theo khoảng cách gần nhất, nhanh và nhìn tự nhiên.
4. Nhân vật chính chỉ được đưa vào danh sách bị ghép khi luật **Hộ giá** cho phép (mục 8.5).
5. Quân không tìm được cặp (bên mình đông hơn) thì **chờ** ở vị trí đang đứng, quay mặt về trận gần nhất. Khi có cặp nào kết thúc, nó vào ghép ở lượt sau.

Sau khi ghép:

- Hai quân **chạy về phía nhau**, gặp ở **điểm giữa** (lệch về phía quân chậm hơn), đứng cách nhau đúng tầm đánh của quân tầm ngắn hơn, mặt đối mặt.
- Mỗi bên đánh theo nhịp hồi đòn riêng. Đòn trúng vào **khung đánh trúng** của hoạt ảnh ([10-hoat-anh.md](10-hoat-anh.md) mục 10.5).
- Một bên chết: bên kia chơi hoạt ảnh đánh xong, đứng yên 0,3 giây rồi vào lại danh sách chờ ghép.
- Quân to (sức chứa > 1) có các đối thủ đứng **đều quanh nó** theo các góc 360°/sức chứa.

## 8.4 Quân tầm xa

- Cung thủ, Pháp sư, Máy bắn đá và nhân vật Lam Nguyệt **không ghép cặp** để bắn. Chúng chọn mục tiêu tự do trong tầm và **không chiếm sức chứa** của mục tiêu.
- Thứ tự chọn mục tiêu:
  1. Quân địch đang đánh tay đôi với quân mình gần nhất.
  2. Quân thuộc lớp mình khắc (Cung → Bay, Bộ binh).
  3. Quân gần nhất.
  - Máy bắn đá chọn **điểm có nhiều địch nhất** trong vùng 1,5 ô.
- Quân tầm xa đứng yên ở chỗ đang đứng (trong khối quân cũ) để bắn. Mục tiêu ra khỏi tầm thì nó bước tới tối đa 2 ô rồi dừng.
- Bị một quân cận chiến địch ghép cặp: Cung thủ rút dao găm (50% ATK, tầm 0,8). Pháp sư vẫn bắn nhưng chậm hơn 30%. Máy bắn đá không tự vệ được.
- Đạn bay thật trên màn hình: mũi tên đi theo đường cong 0,25 giây, cầu phép 0,35 giây, đá lửa vòng cung 0,9 giây. Sát thương tính khi đạn tới nơi (mục tiêu chạy khỏi điểm rơi đá lửa thì tránh được).

## 8.5 Luật Hộ giá

Nhân vật chính chỉ bị **ghép cặp cận chiến** khi **mọi quân cận chiến còn sống của mình đều đang có cặp**, hoặc khi đội không còn quân cận chiến nào.

Nhân vật chỉ bị **quân tầm xa nhắm** khi nó đang đánh tay đôi, hoặc khi đội của nó còn **dưới 5 quân**.

Người chơi đông quân thì nhân vật được che. Người chơi bị đánh tan đội thì nhân vật lộ ra. Nhân vật vẫn **tự đánh** đối thủ gần nhất trong 1 ô (hoặc trong 4 ô với Lam Nguyệt) dù đang được che.

## 8.6 Công thức sát thương

```
sát thương = ATK × K(lớp tấn công, lớp bị đánh) × (1 − giáp bị đánh) × buff × (0,9 … 1,1 ngẫu nhiên)
```

- `K` là bảng khắc chế ([04-quan-doi.md](04-quan-doi.md) mục 4.4).
- Phép (Pháp sư, Tinh linh, kỹ năng Mưa sao băng) bỏ qua giáp: thay `(1 − giáp)` bằng 1.
- Làm tròn xuống, thấp nhất 1.
- Sát thương vùng (Pháp sư, Máy bắn đá, Rồng) trúng đủ sát thương vào mọi mục tiêu trong vùng.
- Số ngẫu nhiên lấy từ seed của trận nên **xem lại trận** cho đúng kết quả.

Các hiệu ứng đặc biệt:

| Hiệu ứng | Nguồn | Tác dụng |
|---|---|---|
| Xung phong | Kỵ binh, Hiệp sĩ | Đòn đầu sau khi chạy ≥ 3 ô: ×2 |
| Chặn ngựa | Lính giáo | Đòn đầu với Kỵ: đối thủ choáng 0,5 giây |
| Cháy | Máy bắn đá (3 giây, 8/giây), Rồng (2 giây, 6/giây) | Sát thương theo thời gian trên ô, cả hai bên đứng trong đều bị |
| Chậm | Thú hắc ín | −20% tốc độ trong 2 giây |
| Đập cánh | Rồng, mỗi 10 giây | Đẩy lùi 1 ô, choáng 0,4 giây |
| Dậm đất | Golem kim cương, mỗi 6 giây | 50 sát thương trong 2 ô |
| Uy long | Rồng (hào quang 4 ô) | Địch dưới đất −10% ATK |

## 8.7 Rút lui

- Đang Giao chiến mà nhân vật được ra lệnh đi **xa trận hơn 3 ô**, toàn đội rút theo:
  - Quân đang có cặp bị đánh **một đòn vào lưng** (×1,5) rồi mới thoát được (trừ khi dùng kỹ năng Thần tốc của Phong Vũ).
  - Đội rút chạy với tốc độ đội bình thường. Kỵ và quân bay địch đuổi kịp, nên rút lui khỏi đội nhiều Kỵ rất khó.
- Bên đuổi: quân không có cặp **đuổi tối đa 8 ô** rồi quay về nhân vật của mình.

## 8.8 Nhân vật chính chết

1. Nhân vật chơi hoạt ảnh chết (1 giây, ngã xuống, rơi vũ khí).
2. Toàn bộ quân của người đó **tan rã**: buông vũ khí, chạy tán loạn ra ngoài 1–2 ô, mờ dần trong 1,5 giây. Không ai nhận được quân này.
3. Mọi mỏ của người đó thành **mỏ trống** ([03-khoang-san.md](03-khoang-san.md) mục 3.7).
4. Người hạ nhân vật (chia theo sát thương nếu nhiều người đánh) nhận **25% kho** của người chết.
5. Cả server thấy dòng thông báo: "⚔ **<A>** đã hạ **<B>** (Kiếm Vương)".
6. Người chết thấy màn hình **THẤT BẠI** ([12-giao-dien.md](12-giao-dien.md) mục 12.8).

## 8.9 Ba bên trở lên

- Đội A đang đánh đội B mà đội C lao vào: C chạm ai thì vào Giao chiến với người đó. Thuật toán bắt cặp coi **mọi đội khác mình là địch** (không có liên minh).
- Lính canh mỏ là phe thứ ba, đánh bất kỳ ai vào vòng chiếm.

## 8.10 Hiển thị trận đánh

- **Thanh máu** 12×2 px trên đầu mỗi quân, chỉ hiện khi đang Giao chiến hoặc khi máu < 100%. Màu xanh lá (quân mình), đỏ (địch), vàng (lính canh).
- **Số sát thương** bằng font pixel 5 px, bay lên rồi mờ trong 0,6 giây. Chí mạng (khắc chế ≥ 1,5) màu cam, to hơn 1 px.
- **Tia lóe khi trúng đòn:** 3 khung trắng-vàng 6×6 px ở điểm chạm.
- **Xác** nằm lại 8 giây rồi mờ đi. Có vết máu pixel đỏ sẫm, tắt được trong cài đặt.
- Camera **không tự rung**. Riêng cú dậm đất của Golem và đòn đập cánh của Rồng rung màn hình 2 px trong 0,2 giây nếu xảy ra trong khung nhìn.

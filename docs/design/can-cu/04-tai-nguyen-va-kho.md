# 04. Giới hạn tài nguyên và Kho

Mỗi người chơi chỉ chứa được một lượng tài nguyên tối đa, giống kho chứa trong Clash of Clans. **Chỉ áp dụng ở Thế giới mở**; phòng đấu theo trận không giới hạn.

## 4.1 Sức chứa

Sức chứa mỗi loại = **mức gốc × (hệ số Thành trì + tổng hệ số các Kho)**.

| | Sắt | Than | Vàng | Dầu | Dầu đen | Pha lê | Kim cương |
|---|---|---|---|---|---|---|---|
| Mức gốc | 4 000 | 3 000 | 1 500 | 1 200 | 600 | 300 | 120 |

| Thành trì | chưa có | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Hệ số | ×1 | ×1,5 | ×2,25 | ×3,5 | ×5 | ×7 |

Mỗi Kho cộng thêm +0,4 (cấp 1) tới +2,0 (cấp 5).

Ví dụ:
- Chưa có căn cứ: Sắt 4 000, Kim cương 120.
- Thành trì cấp 3 + 2 Kho cấp 3: hệ số 3,5 + 2,4 = 5,9, tức Sắt 23 600, Kim cương 708.
- Thành trì cấp 5 + 3 Kho cấp 5: hệ số 13, tức Sắt 52 000, Kim cương 1 560.

## 4.2 Khi kho đầy

- Thu nhập loại tài nguyên đó **dừng lại** khi chạm sức chứa (các loại khác vẫn tăng). Thanh tài nguyên trên cùng hiện số màu đỏ và chữ "đầy".
- Tài nguyên **đang có vượt sức chứa không bị xóa** (người chơi cũ đang có nhiều hơn vẫn giữ nguyên), chỉ không tăng thêm cho tới khi tiêu xuống dưới mức.
- Đồ nhặt, thưởng điểm danh, thưởng dọn bãi quái, tiền cướp: cũng bị cắt ở sức chứa (phần dư mất, có thông báo).
- Thu nhập offline (50%) cũng dừng ở sức chứa.

## 4.2b Kho bảo vệ tài nguyên (đã làm 11/11/2026)

Phần tài nguyên nằm trong **sức chứa của các Kho** (mức gốc × tổng hệ số các Kho, ví dụ 2 Kho cấp 3 = +2,4 × mức gốc) được an toàn:
- Tướng chết: người hạ chỉ lấy 25% **phần vượt quá** mức bảo vệ; phần được bảo vệ **còn nguyên khi xuất trận lại** (trước đây chết là mất hết, về lại mức khởi đầu).
- Thành trì bị phá: cướp 10% của phần vượt quá mức bảo vệ.

## 4.3 Cướp tài nguyên

- Người **phá Thành trì** nhận **10% mỗi loại** tài nguyên của chủ căn cứ, kể cả khi chủ offline. Phần nhận được không vượt sức chứa của người cướp.
- Mỗi căn cứ chỉ bị cướp **1 lần mỗi 2 giờ**. Sau khi bị phá Thành trì, căn cứ có **khiên 30 phút**: không ai đánh được công trình của căn cứ đó (trừ khi chủ căn cứ tự ra đánh người khác thì khiên tắt).
- Thành trì bị phá thì căn cứ ngừng hồi máu cho quân và tướng không xuất trận ở đó cho tới khi sửa. Các tháp vẫn bắn.
- Phá Kho, Tháp, Tường không được tài nguyên (chỉ Thành trì).

## 4.4 Vì sao cần giới hạn

- Người chơi lâu năm không gom vô hạn tài nguyên, nên phải tiêu (mua quân, xây nhà) thay vì để đầy kho.
- Tạo lý do nâng Thành trì và xây Kho.
- Giới hạn cũng chặn được bot cày tài nguyên lâu dài.

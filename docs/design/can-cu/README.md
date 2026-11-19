# Căn cứ (Base building) · bản thiết kế, chưa làm

Hệ thống căn cứ kiểu Clash of Clans, đơn giản hơn, chỉ có ở **Thế giới mở**. Thư mục này thay cho mục 17.1 cũ trong [../17-can-cu-va-don-mo.md](../17-can-cu-va-don-mo.md).

| Tệp | Nội dung |
|---|---|
| [01-thanh-tri.md](01-thanh-tri.md) | **Thành trì** (nhà chính, cấp 1–5): mở khóa số lượng và cấp công trình, giới hạn kho tài nguyên |
| [02-cong-trinh.md](02-cong-trinh.md) | Từng công trình: Tháp cung, Pháo đá, Tháp phép, Tường, Kho. Chỉ số và giá từng cấp |
| [03-can-bang.md](03-can-bang.md) | Cách tính giá cho cân với quân, bảng khắc chế công trình ↔ binh chủng |
| [04-tai-nguyen-va-kho.md](04-tai-nguyen-va-kho.md) | Giới hạn tài nguyên, Kho, cướp tài nguyên khi phá Thành trì |
| [05-xay-dung-va-giao-dien.md](05-xay-dung-va-giao-dien.md) | Mua trong cửa hàng, đặt, nâng cấp, sửa, thợ xây, giao diện |
| [06-tan-cong-va-phong-thu.md](06-tan-cong-va-phong-thu.md) | Đánh căn cứ, lính đã cất giữ nhà, tướng chết thì xuất trận ở căn cứ, khiên bảo vệ |
| [07-ky-thuat.md](07-ky-thuat.md) | Cách làm trong code, lưu dữ liệu, các bước triển khai |

## Đã chốt với người chơi (11/11/2026)

1. Giá công trình được **tính lại để cân với giá quân** (xem 03). Một công trình phòng thủ phải "đáng tiền" ngang một nhóm lính cùng giá, nhỉnh hơn một chút vì đứng yên.
2. **Lính đã cất (nút C) ở trong căn cứ để giữ nhà** khi tướng đi vắng hoặc offline.
3. **Phá Thành trì cướp 10% kho**, mỗi căn cứ chỉ bị cướp 1 lần mỗi 2 giờ.
4. **Tướng chết thì căn cứ vẫn đứng**, tướng xuất trận lại ở căn cứ.
5. Có **nhà chính (Thành trì) cấp 1–5** giống Town Hall của Clash of Clans: cấp Thành trì quyết định được xây bao nhiêu công trình, công trình lên tới cấp mấy, và **kho chứa tối đa bao nhiêu tài nguyên**.

6. (11/11) **Thành trì mở khóa quân** (01), **Kho bảo vệ tài nguyên** khi chết / bị cướp (04), **NPC lãnh chúa tự xây căn cứ** (không đánh nhà ai, ẩn khỏi bảng xếp hạng; người chơi đánh nhà NPC được).

## Tóm tắt một dòng

Đặt Thành trì → mua tháp, tường, kho trong Shop → đặt quanh Thành trì (trong 13 ô) → nâng Thành trì để mở thêm chỗ, thêm cấp, thêm sức chứa → căn cứ tự bắn kẻ địch cả khi bạn offline, lính đã cất ra giữ nhà.

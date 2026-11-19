# Cấp anh hùng, điểm tiềm năng và Nhà vua phía Bắc

Giống "cộng tiềm năng" trong Ngọc Rồng Online: tướng đánh nhau để nhận kinh nghiệm, lên cấp được điểm, tự cộng điểm vào chỉ số. Có giới hạn cấp, muốn vượt phải tới **Nhà vua phía Bắc** trả tài nguyên.

Chỉ áp dụng ở **Thế giới mở**. Trận đấu xếp phòng giữ nguyên chỉ số gốc để công bằng.

## Kinh nghiệm (XP)

| Hành động | XP |
|---|---|
| Hạ quái ở bãi quái cấp N | 4 × N |
| Hạ lính canh mỏ | 3 |
| Hạ lính của người chơi khác | 1 × chỗ ở của lính (dân quân 1 … rồng 8) |
| Hạ tướng của người chơi khác | 60 + 6 × cấp của tướng đó |
| Hạ boss | 400 |
| Phá Thành trì của người khác | 120 × cấp Thành trì |

- XP tính cho tướng gây đòn kết liễu hoặc khi lính của mình kết liễu (lính kết liễu thì tướng nhận 50 %).
- Cần XP để lên cấp `L → L+1`: `round(20 × L^1,5)`. Cấp 10 → 11 cần ~630 XP, cấp 29 → 30 ~3 100 XP, cấp 99 → 100 ~19 700 XP.

## Điểm tiềm năng

- Mỗi lần lên cấp nhận **10 điểm**. Bấm **+** để cộng **1 điểm mỗi lần**.

| Chỉ số | 1 điểm = | Giới hạn |
|---|---|---|
| Máu | +20 HP | không |
| Tấn công | +0,5 ATK | không |
| Tốc độ đánh | +0,5 % | +50 % |
| Tốc độ di chuyển | +0,4 % | +30 % |
| Giáp | +0,25 % | tổng giáp tối đa 75 % (như hiện tại) |

- Chỉ số đã chạm giới hạn thì nút + mờ đi.
- Điểm gắn với **tài khoản**, không mất khi chết, đổi tướng vẫn giữ.

## Giới hạn cấp và Nhà vua phía Bắc

- Mốc giới hạn: **30 → 50 → 70 → 100** (100 là tối đa).
- Đạt mốc mà chưa mở: thanh XP đầy và đứng yên, không lên cấp nữa (điểm đã có vẫn cộng được).
- Mở mốc tiếp theo: đi tới **Nhà vua phía Bắc**, cung điện cố định ở rìa phía Bắc bản đồ. Đứng gần cung điện, bấm vào → bảng "Mở giới hạn sức mạnh".

| Mở giới hạn | Thành trì cần | Giá |
|---|---|---|
| 30 → 50 | 3 | 4 000 vàng · 600 pha lê · 80 kim cương |
| 50 → 70 | 4 | 6 500 vàng · 1 200 pha lê · 150 kim cương |
| 70 → 100 | 5 | 10 000 vàng · 2 000 pha lê · 400 kim cương |

- Giá luôn nằm trong sức chứa kho của Thành trì cần thiết.
- Cung điện không đánh được, ai cũng tới được. Quanh cung điện là vùng an toàn nhỏ (không ai đánh nhau trong bán kính 8 ô quanh cung điện) để không bị phục kích khi mở.

## Bảng Trang bị

Thêm khung **Chỉ số** cạnh ô trang bị:

- Cấp, thanh XP (`1 240 / 3 100`), giới hạn hiện tại (`Giới hạn: 30 · mở ở Nhà vua phía Bắc`).
- 5 dòng chỉ số: **Máu, Tấn công, Tốc độ đánh, Tốc độ di chuyển, Giáp**. Mỗi dòng ghi tổng (gốc + trang bị + điểm) và nút **+**, ví dụ `Máu 1 480 (+200 điểm)  [+]`.
- Số điểm chưa cộng: `Còn 7 điểm`.

## Hình ảnh

Nhà vua phía Bắc: một cung điện lớn cố định trên bản đồ. Prompt: `docs/design/samples/buildings/prompts/09-nha-vua.md`.

# 4 thú khởi đầu × 3 dạng — prompt hình động (16/11/2026)

Thiết kế gốc: `../sprite-pixels/khoi-dau/` — Kỳ Nhông Lửa `ky-nhong-v2.jpg`, Rùa Xoáy `rua-xoay-v2.jpg` (bản thác nước), Ếch Sen `ech-sen-v2.jpg`, Sóc Bay Sấm `soc-sam.jpg`.
Mỗi prompt = 1 ảnh 1024×1024 (4 hàng × 4 khung, ô 256×256), quay mặt sang PHẢI. Gửi kèm sheet thiết kế của con đó. Lưu tên `<con>-<dạng>.png`, ví dụ `ky-nhong-1.png`.

Hàng 1 đứng yên · Hàng 2 đi · Hàng 3 tấn công (đòn riêng) · Hàng 4 trúng đòn + gục.

## Phần chung (đầu mỗi prompt, thay N)

```text
Animate the creature shown in cell N (stage N) of the attached sheet. Keep its design EXACTLY: same body, colours, markings, proportions, outline and pixel style, so it is clearly the same character in every frame.
LAYOUT: 4 rows × 4 frames, every cell exactly 256×256 px (whole image 1024×1024). Facing RIGHT in a side-ish 3/4 view in every frame, the same size in every frame (about 60% of the cell height), centred, feet on the same baseline about 20 px above the bottom edge. Row 1 IDLE loop, row 2 WALK loop, row 3 ATTACK, row 4 HURT and FAINT (frame 1 flinch with a white flash, frame 2 recover, frame 3 stagger, frame 4 knocked out lying on the ground).
STYLE: strict pixel grid, crisp 1-pixel dark navy outline (#1b1726), NO blur, NO anti-aliasing, NO soft glow, NO motion blur. Effects (fire, water, petals, sparks) are pixel art and stay inside their own cell.
BACKGROUND: one flat solid pure magenta #FF00FF everywhere. No ground, no shadow, no text, no numbers, no grid lines, no borders between cells.
```

## Chi tiết từng dạng (sau phần chung)

| File | Đứng yên | Đi | Tấn công |
|---|---|---|---|
| ky-nhong-1 | nhún, chớp mắt, chỏm lửa lay | lạch bạch 2 chân, đuôi lắc | phồng má phun 1 cầu lửa nhỏ |
| ky-nhong-2 | thở, khói mũi, mào lửa lay | rình bước thấp 4 chân | vồ tới, vuốt lửa vạch vệt cam |
| ky-nhong-3 | thở nặng, núi lửa bốc khói | dậm chậm nặng nề | ngóc đầu gầm, núi lửa phun đá |
| rua-xoay-1 | nhấp nhô, vẫy vây | lạch bạch | thổi 3 bong bóng |
| rua-xoay-2 | xoáy nước trên mai quay | bước đều | rụt vào mai xoay lao tới |
| rua-xoay-3 | thác chảy, đèn hải đăng nháy | bước chậm nặng | dậm chân, sóng cuộn lao tới |
| ech-sen-1 | phồng họng, mũ lá nhún | nhảy nhỏ | búp sen bắn cánh hoa |
| ech-sen-2 | hoa lay, chuồn chuồn bay | nhảy | roi dây leo quất tới |
| ech-sen-3 | búp gậy sáng nhịp | bước chống gậy | nâng gậy, bão cánh sen vàng |
| soc-sam-1 | vẫy đuôi, má lóe tia | nhảy lóc cóc | lao húc bọc điện |
| soc-sam-2 | màng phập phồng | chạy nảy, màng hé | lượn tới phóng tia sét |
| soc-sam-3 | lơ lửng, màng gợn | lượn sát đất | gọi sét đánh xuống trước mặt |

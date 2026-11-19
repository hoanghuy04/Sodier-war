# 4 thú khởi đầu — skill + prompt hiệu ứng (16/11/2026)

Mỗi con 4 skill, 1 sheet hiệu ứng: 8 khung × 4 hàng, ô 256×256 (2048×1024). Chỉ vẽ hiệu ứng, không vẽ thú.
Gửi kèm `docs/design/samples/army/sprite-pixels/kiem-si.png` + 1 sheet fx cũ (vd `docs/design/samples/hell/sprite-pixels/fx-12.png`). Gửi lại File PNG.

Chọn từ danh sách chiêu bạn gửi (16/11/2026): giữ cơ chế, đặt tên Việt riêng của game, chuyển sang thời gian thực (PP → hồi chiêu). Dạng 1 có chiêu 1–2, dạng 2 mở chiêu 3, dạng 3 mở chiêu 4 (tuyệt chiêu).

| Con (hệ) | 1 | 2 | 3 | 4 (dạng 3) |
|---|---|---|---|---|
| Kỳ Nhông Lửa (Lửa) — `fx-ky-nhong` | Than Hồng (Ember 40, 10% bỏng) | Lửa Xoáy (Fire Spin 35, giam + đốt 4–5 s) | Phun Lửa (Flamethrower 90, 10% bỏng) | Đại Hỏa Cầu (Fire Blast 110, 10% bỏng) |
| Rùa Xoáy (Nước) — `fx-rua-xoay` | Vòi Nước (Water Gun 40) | Thu Mình (Withdraw: +giáp) | Tia Bọt Nước (Bubble Beam 65, 10% chậm) | Pháo Thủy Lực (Hydro Pump 110) |
| Ếch Sen (Cỏ + Độc) — `fx-ech-sen` | Roi Dây Leo (Vine Whip 45) | Bột Độc (Poison Powder: trúng độc) | Hạt Hút Sinh Lực (Leech Seed: hút máu theo thời gian) | Tia Mặt Trời (Solar Beam 120, gom 1 nhịp) |
| Sóc Bay Sấm (Điện) — `fx-soc-sam` | Tia Điện Nhỏ (Thunder Shock 40, 10% tê) | Sóng Tê Liệt (Thunder Wave: tê) | Lôi Tiễn (Thunderbolt 90, 10% tê) | Thiên Lôi (Thunder 110, 30% tê) |

Không đưa Z-Move và chiêu độc quyền của Pokémon cụ thể (vd 10,000,000 Volt Thunderbolt, Volt Tackle).

## Hiệu ứng tách theo chiêu (16/11/2026)

Mỗi chiêu 1 ảnh riêng `fx-skill-<mã>.png`: 1 hàng 8 khung, ô 256×256 (2048×256), chỉ hiệu ứng, không gắn với thú nào; thú nào gọi chiêu thì game ghép vào. Chiêu bắn vẽ hướng PHẢI (game xoay theo mục tiêu), chiêu vùng đặt tại chỗ. Phần chung: `skill-fx-chung.txt`.

Mã: than-hong, lua-xoay, phun-lua, dai-hoa-cau, voi-nuoc, thu-minh, tia-bot-nuoc, phao-thuy-luc, roi-day-leo, bot-doc, hat-hut-sinh-luc, tia-mat-troi, tia-dien-nho, song-te-liet, loi-tien, thien-loi.

## Đợt bổ sung (16/11/2026, đã gửi qua Telegram)

- Sửa: `fx-skill-phao-thuy-luc`, `fx-skill-phun-lua` (giữ trong ô), `fx-skill-thu-minh` (đường lục giác dày 2–3 px). Khuôn mới 2 hàng × 4 khung, 1024×512.
- Tư thế thú: `<con>-<dạng>-chieu.png` × 12, 2 hàng × 4 khung, 1024×512. Hàng 1 TUNG CHIÊU (khung 4 giữ dáng, game ghép hiệu ứng chiêu), hàng 2 GỒNG (dùng cho chiêu buff như Thu Mình). Rùa gồng = rụt vào mai.
- `fx-skill-va-cham.png`: tia va chạm cận chiến, 6 hàng (Thường, Lửa, Nước, Cỏ, Độc, Điện) × 4 khung, 1024×1536.

**Chốt (16/11/2026): bỏ 12 ảnh tư thế.** Mọi chiêu dùng hàng 3 (tấn công) của ảnh động từng con; chiêu bắn xa phát hiệu ứng ở khung 3 (ra đòn). Chiêu buff: hàng 1 (đứng yên) + viền sáng màu hệ vẽ bằng code + hiệu ứng chiêu. Va chạm cận chiến: `fx-skill-va-cham.png` dùng chung.

# Prompt vẽ lính theo cấp (Học viện)

Mỗi cấp một bộ hình, giống Clash of Clans. **Cấp 1 là hình hiện tại** (đã có). Mỗi sheet: 8 hướng × 6 tư thế, giống hệt cách vẽ cấp 1.

**Gửi kèm 2 ảnh mẫu**: `../army/sprite-pixels/1.png` (Kiếm sĩ đã duyệt, giữ nét vẽ) **và sheet cấp 1 của chính loại lính đó** (`../army/sprite-pixels/<mã>.png`), để giữ đúng mặt, dáng, cỡ người. Nền #FF00FF, gửi lại dạng File PNG.

| Lính | Cấp cần vẽ | Lưu thành |
|---|---|---|
| [Dân quân](prompts/01-dan-quan.md) | 2, 3, 4, 5 | `sprite-pixels/dan-quan-l<cấp>.png` |
| [Kiếm sĩ](prompts/02-kiem-si.md) | 2, 3, 4, 5 | `sprite-pixels/kiem-si-l<cấp>.png` |
| [Lính giáo](prompts/03-linh-giao.md) | 2, 3, 4, 5 | `sprite-pixels/linh-giao-l<cấp>.png` |
| [Cung thủ](prompts/04-cung-thu.md) | 2, 3, 4, 5 | `sprite-pixels/cung-thu-l<cấp>.png` |
| [Kỵ binh](prompts/05-ky-binh.md) | 2, 3, 4, 5 | `sprite-pixels/ky-binh-l<cấp>.png` |
| [Hiệp sĩ](prompts/06-hiep-si.md) | 2, 3, 4 | `sprite-pixels/hiep-si-l<cấp>.png` |
| [Pháp sư](prompts/07-phap-su.md) | 2, 3, 4 | `sprite-pixels/phap-su-l<cấp>.png` |
| [Máy bắn đá lửa](prompts/08-may-ban-da.md) | 2, 3 | `sprite-pixels/may-ban-da-l<cấp>.png` |
| [Sư thứu](prompts/09-su-thuu.md) | 2 | `sprite-pixels/su-thuu-l<cấp>.png` |
| [Rồng](prompts/10-rong.md) | 2 | `sprite-pixels/rong-l<cấp>.png` |

Tổng: **30 sheet** lính + 1 sheet Học viện (`prompts/00-hoc-vien.md`).

## Quy tắc lên cấp (bắt buộc, thay đổi phải rõ rệt)

Mỗi loại lính có **đường tiến hoá màu riêng**, nhìn màu là biết cấp. Mỗi cấp còn **đổi tóc, thêm sừng/gai/giáp, vũ khí ngầu hơn**. Cấp cuối luôn là bản huyền thoại.

| Lính | Cấp 1 → 2 → 3 → 4 → 5 |
|---|---|
| Dân quân | Nâu vải → Cam đồng → Xanh rêu → Đỏ đô → Đồng thau óng |
| Kiếm sĩ | Thép xám → Đồng → Bạc sáng → Đỏ máu → Vàng kim |
| Lính giáo | Thép xám → Xanh ngọc bích → Bạc trắng → Đen viền đỏ → Đỏ thẫm + vàng (rồng) |
| Cung thủ | Xanh lá → Nâu da → Xám tro → Đen + tím → Trắng ngà + vàng |
| Kỵ binh | Thép + ngựa nâu → Đồng + ngựa hạt dẻ → Bạc + ngựa xám → Đen + ngựa đen → Bạch kim + ngựa trắng |
| Hiệp sĩ | Bạc → Đỏ son → Đen tuyền → Trắng thánh + vàng |
| Pháp sư | Tím → Đỏ → Đen → Vàng kim |
| Máy bắn đá | Gỗ nâu → Sắt đen → Đỏ lửa + vàng |
| Sư thứu | Nâu → Trắng tuyết + vàng |
| Rồng | Đỏ → Trắng bạc |

Sừng / gai tăng dần: cấp 2 gai nhỏ, đinh tán → cấp 3 gai trên vai, mũ có gờ nhọn → cấp 4 **sừng** trên mũ, gai khắp vai/khuỷu/gối → cấp 5 sừng lớn, vương miện, cánh, ngọc phát sáng (vẽ bằng pixel đặc).

Áo choàng / tabard / cờ / vải yên vẫn giữ **xanh dương** (màu đội, game tự đổi màu theo đội); **không dùng xanh dương cho giáp**.

Khi vẽ cấp N (N ≥ 3), gửi thêm **sheet cấp N−1 đã vẽ** để AI thấy rõ phải khác và ngầu hơn cấp trước.

Thứ tự nên vẽ: lính rẻ trước (Dân quân, Kiếm sĩ, Lính giáo, Cung thủ cấp 2–3), vì người chơi lên những cấp đó sớm nhất.
## Cấp mới cho Thành trì 6–8 (16/11/2026)

Cấp mở ở TH6 = hệ **nước**, TH7 = **dung nham**, TH8 = **sấm sét (tím)**, đồng bộ với công trình cấp 6–8. Gửi kèm thêm sheet cấp cao nhất đã có của lính đó.

| Lính | Cấp cần vẽ | Prompt |
|---|---|---|
| Dân quân | 6, 7, 8 | [01-dan-quan-th6-8.md](prompts/01-dan-quan-th6-8.md) |
| Kiếm sĩ | 6, 7, 8 | [02-kiem-si-th6-8.md](prompts/02-kiem-si-th6-8.md) |
| Lính giáo | 6, 7, 8 | [03-linh-giao-th6-8.md](prompts/03-linh-giao-th6-8.md) |
| Cung thủ | 6, 7, 8 | [04-cung-thu-th6-8.md](prompts/04-cung-thu-th6-8.md) |
| Kỵ binh | 6, 7, 8 | [05-ky-binh-th6-8.md](prompts/05-ky-binh-th6-8.md) |
| Hiệp sĩ | 5, 6, 7 | [06-hiep-si-th6-8.md](prompts/06-hiep-si-th6-8.md) |
| Pháp sư | 5, 6, 7 | [07-phap-su-th6-8.md](prompts/07-phap-su-th6-8.md) |
| Máy bắn đá lửa | 4, 5, 6 | [08-may-ban-da-th6-8.md](prompts/08-may-ban-da-th6-8.md) |
| Sư thứu | 3, 4, 5 | [09-su-thuu-th6-8.md](prompts/09-su-thuu-th6-8.md) |
| Rồng | 3, 4, 5 | [10-rong-th6-8.md](prompts/10-rong-th6-8.md) |

Tổng: 30 sheet.

### Lính mới (TH6–8)

| Lính | Cấp cần vẽ | Prompt |
|---|---|---|
| Công binh | 2 (nước), 3 (dung nham), 4 (sấm sét) | [11-cong-binh.md](prompts/11-cong-binh.md) |
| Y sư | 2 (dung nham), 3 (sấm sét) | [12-y-su.md](prompts/12-y-su.md) |
| Voi chiến | 2 (sấm sét) | [13-voi-chien.md](prompts/13-voi-chien.md) |

**Cập nhật 16/11/2026:** chỉ vẽ cấp mới cho Cung thủ (6–8), Hiệp sĩ (5–7), Pháp sư (5–7), Rồng (3–4) và 3 lính mới. Dân quân, Kiếm sĩ, Lính giáo, Kỵ binh, Máy bắn đá, Sư thứu **không vẽ thêm**: cấp cuối được "Tinh luyện ★1–3" ở TH6–8 (xem docs/design/28-chi-so-th6-8.md).

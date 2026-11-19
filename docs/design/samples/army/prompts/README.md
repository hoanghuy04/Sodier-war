# Prompt tạo sprite theo từng binh chủng

Mỗi binh chủng có một file riêng. Trong file có:
- **Bước 1:** một prompt ra sheet 8 hướng × 6 tư thế, để duyệt thiết kế.
- **Bước 2:** 6 prompt, mỗi hoạt ảnh một ảnh nhiều khung (8 hàng hướng × 4 hoặc 6 khung), để quân chuyển động thật trong game.

Cách làm cho mỗi binh chủng:
1. Mở file của binh chủng, copy khối prompt tiếng Anh.
2. Dán vào công cụ tạo ảnh, **gửi kèm ảnh `sprite-pixels/1.png`** (Kiếm sĩ đã duyệt) làm mẫu phong cách.
3. Kiểm tra:
   - Nền một màu magenta.
   - Đủ số hàng và cột.
   - Hướng 4, 5, 6 nhìn từ sau lưng.
   - Vũ khí ở cùng một tay trong mọi hướng.
   - Không có chữ.
4. Lưu đúng tên file ghi trong prompt vào `sprite-pixels/` rồi báo mình nhập vào game.

Nên làm bước 1 cho cả đội trước, duyệt xong mới làm bước 2.

| # | Binh chủng | Mã | Bước 2 |
|---|---|---|---|
| 01 | [Dân quân](01-dan-quan.md) | `dan-quan` | 6 hoạt ảnh |
| 02 | [Kiếm sĩ](02-kiem-si.md) | `kiem-si` | 6 hoạt ảnh |
| 03 | [Lính giáo](03-linh-giao.md) | `linh-giao` | 6 hoạt ảnh |
| 04 | [Cung thủ](04-cung-thu.md) | `cung-thu` | 6 hoạt ảnh |
| 05 | [Kỵ binh](05-ky-binh.md) | `ky-binh` | 6 hoạt ảnh |
| 06 | [Hiệp sĩ](06-hiep-si.md) | `hiep-si` | 6 hoạt ảnh |
| 07 | [Pháp sư](07-phap-su.md) | `phap-su` | 6 hoạt ảnh |
| 08 | [Máy bắn đá lửa](08-may-ban-da.md) | `may-ban-da` | 6 hoạt ảnh |
| 09 | [Sư thứu](09-su-thuu.md) | `su-thuu` | 6 hoạt ảnh |
| 10 | [Rồng](10-rong.md) | `rong` | 6 hoạt ảnh |
| 11 | [Thạch Lâm, Kiếm Vương (anh hùng)](11-thach-lam.md) | `thach-lam` | 6 hoạt ảnh |
| 12 | [Kim Hạ, Bà Chủ Mỏ (anh hùng)](12-kim-ha.md) | `kim-ha` | 6 hoạt ảnh |
| 13 | [Phong Vũ, Kỵ Tướng (anh hùng)](13-phong-vu.md) | `phong-vu` | 6 hoạt ảnh |
| 14 | [Lam Nguyệt, Nữ Pháp Sư (anh hùng)](14-lam-nguyet.md) | `lam-nguyet` | 6 hoạt ảnh |
| 15 | [Hỏa Kỳ, Kẻ Thuần Long (anh hùng)](15-hoa-ky.md) | `hoa-ky` | 6 hoạt ảnh |

## Boss

5 boss canh mỏ quý (kèm bệ đứng có hoạt ảnh): xem [bosses/README.md](bosses/README.md).

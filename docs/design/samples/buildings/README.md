# Mẫu vẽ công trình căn cứ

Prompt "bước 1" cho từng công trình, cùng phong cách với quân (`../army/`). Mỗi công trình cần **1 ảnh** (không có 8 hướng, không có hoạt ảnh nhiều khung).

| Tệp prompt | Công trình | Chân đế | Ô | Ảnh cần lưu |
|---|---|---|---|---|
| [prompts/01-thanh-tri.md](prompts/01-thanh-tri.md) | Thành trì | 3×3 ô | 384×384 | `sprite-pixels/thanh-tri.png` (6 cột: cấp 1–5 + đổ nát) |
| [prompts/02-thap-cung.md](prompts/02-thap-cung.md) | Tháp cung | 2×2 ô | 256×256 | `sprite-pixels/thap-cung.png` |
| [prompts/03-phao-da.md](prompts/03-phao-da.md) | Pháo đá | 2×2 ô | 256×256 | `sprite-pixels/phao-da.png` |
| [prompts/04-thap-phep.md](prompts/04-thap-phep.md) | Tháp phép | 2×2 ô | 256×256 | `sprite-pixels/thap-phep.png` |
| [prompts/05-kho.md](prompts/05-kho.md) | Kho | 2×2 ô | 256×256 | `sprite-pixels/kho.png` |
| [prompts/06-tuong.md](prompts/06-tuong.md) | Tường | 1×1 ô | 128×128 | `sprite-pixels/tuong.png` (4 cột mảnh × 5 hàng cấp) |

Vẽ xong, lưu ảnh vào `sprite-pixels/` đúng tên trên, mình sẽ viết bước nhập (cắt ô, bỏ nền magenta, thu về đúng cỡ trong game) và thay cho model tạm hiện tại.

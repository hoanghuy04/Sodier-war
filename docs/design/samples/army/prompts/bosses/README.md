# Prompt tạo 5 boss và bệ đứng

Mỗi boss có một file. Trong file có:
- **Bước 1:** một ảnh 8 hướng × 7 tư thế (đứng, đi, đánh, kỹ năng, trúng đòn, gầm, chết) để duyệt thiết kế.
- **Bước 2:** 7 ảnh, mỗi hoạt ảnh một ảnh nhiều khung (8 hàng hướng × 2–8 khung).
- **Bệ đứng:** một ảnh riêng, 3 trạng thái × 4 khung (chờ, giao chiến, bị hạ).

Cách làm (giống binh chủng):
1. Mở **cuộc trò chuyện mới** trong công cụ tạo ảnh cho mỗi ảnh, chỉ một boss một lần.
2. Copy khối prompt tiếng Anh, **gửi kèm `sprite-pixels/1.png`** làm mẫu phong cách.
3. Kiểm tra: nền magenta một màu, đủ hàng × cột, hướng 4–6 nhìn từ sau lưng, hiệu ứng kỹ năng không tràn sang ô bên cạnh, không có chữ.
4. Lưu đúng tên file ghi trong prompt vào `sprite-pixels/` rồi báo mình nhập vào game.

Thứ tự nên làm: bước 1 của cả 5 boss → bệ đứng của cả 5 → duyệt xong mới làm bước 2.

| # | Boss | Mã | Canh mỏ | Kỹ năng |
|---|---|---|---|---|
| 1 | [Golem Kim Cương](16-boss-golem-kim-cuong.md) | `golem-kim-cuong` | Mỏ Kim cương (lõi bản đồ, cao nguyên cổ) | GROUND SLAM |
| 2 | [Chúa Tể Hắc Ín](17-boss-chua-te-hac-in.md) | `chua-te-hac-in` | Hố Dầu Đen (vùng tro cháy) | TAR ERUPTION |
| 3 | [Nữ Hoàng Pha Lê](18-boss-nu-hoang-pha-le.md) | `nu-hoang-pha-le` | Mỏ Pha lê (rừng sâu, đầm lầy) | CRYSTAL STORM |
| 4 | [Vua Thổ Phỉ](19-boss-vua-tho-phi.md) | `vua-tho-phi` | Mỏ Vàng (sa mạc, thảo nguyên) | WHIRLWIND |
| 5 | [Bọ Cạp Sa Mạc](20-boss-bo-cap-sa-mac.md) | `bo-cap-sa-mac` | Giếng Dầu (sa mạc) | BURROW STRIKE |

Viết lại các file này: `node tools/boss-prompts.mjs`.

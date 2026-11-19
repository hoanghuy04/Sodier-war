# Sodier War: Tài liệu thiết kế

Game chiến thuật thời gian thực, nhiều người chơi, chạy trên trình duyệt, đồ họa **pixel art nhìn từ trên xuống**.
Mỗi người điều khiển **một nhân vật chính**. Quân mua về tự **xếp thành hình lục giác quanh nhân vật** và đi theo nhân vật.
Người chơi chiếm **mỏ khoáng sản** để có tài nguyên theo thời gian, dùng tài nguyên mua quân mạnh hơn rồi đi chiếm mỏ của người khác. **Rồng** là quân mạnh nhất.
Nhân vật chính chết thì thua và chơi lại từ đầu.

## Mục lục

| # | File | Nội dung |
|---|---|---|
| 1 | [01-tong-quan.md](01-tong-quan.md) | Ý tưởng, trụ cột thiết kế, vòng lặp chơi, một ván chơi diễn ra thế nào |
| 2 | [02-ban-do.md](02-ban-do.md) | Bản đồ 256×256 ô sinh bằng code (giống Ant War nhưng **không sông, không núi**): 10 vùng đất, đường, làng, tháp canh, khe nứt, ảnh render thật |
| 3 | [03-khoang-san.md](03-khoang-san.md) | 7 loại mỏ, sản lượng, cách chiếm và chiếm lại, lính canh mỏ, viền xanh/đỏ |
| 4 | [04-quan-doi.md](04-quan-doi.md) | 10 binh chủng, giá, chỉ số, bảng khắc chế, Rồng |
| 5 | [05-kinh-te-can-bang.md](05-kinh-te-can-bang.md) | Giá trị quy đổi, giá quân so với sản lượng mỏ, thời gian mua theo từng giai đoạn |
| 6 | [06-nhan-vat-chinh.md](06-nhan-vat-chinh.md) | 5 nhân vật chính, mỗi người một buff và một kỹ năng |
| 7 | [07-doi-hinh-luc-giac.md](07-doi-hinh-luc-giac.md) | Cách quân xếp lục giác theo chiều kim đồng hồ, công thức tọa độ, dồn hàng |
| 8 | [08-chien-dau.md](08-chien-dau.md) | Chạm quân thì đánh từng cặp, công thức sát thương, bảo vệ nhân vật chính, thất bại |
| 9 | [09-dieu-khien-camera.md](09-dieu-khien-camera.md) | Chuột phải di chuyển, chuột trái thao tác, giữ chuột giữa kéo bản đồ, phím tắt |
| 10 | [10-hoat-anh.md](10-hoat-anh.md) | Hoạt ảnh: chờ, đi, quay lưng, quay trái/phải, đi xuống, 4 hướng chéo, đánh nhau, chết |
| 11 | [11-mo-hinh-mo.md](11-mo-hinh-mo.md) | Mô hình pixel art chi tiết cho từng mỏ: bố cục, bảng màu, chuyển động, viền sở hữu |
| 12 | [12-giao-dien.md](12-giao-dien.md) | HUD, cửa hàng quân, bảng thông tin, cảnh báo, màn hình **Thất bại** và nút **Bắt đầu lại** |
| 13 | [13-ky-thuat.md](13-ky-thuat.md) | Kiến trúc kỹ thuật (dùng lại stack của Ant War), cột mốc làm game |
| 14 | [14-mo-hinh-quan.md](14-mo-hinh-quan.md) | **Mô hình 15 quân và anh hùng theo ảnh mẫu**, 8 hướng × 5 hoạt ảnh (chờ, đi, đánh, chiến thắng, chết), GIF giao tranh, sprite sheet |
| 15 | [15-tran-dau-bo-boss.md](15-tran-dau-bo-boss.md) | **Trận đấu 20 phút, bo thu hẹp (kiểu PUBG), 5 boss** quanh tâm bản đồ, lính canh rơi đồ |
| 17 | [17-can-cu-va-don-mo.md](17-can-cu-va-don-mo.md) | **Căn cứ** (đã chuyển sang thư mục can-cu/) và **đồn lính 20%** ở mỏ đã chiếm (đã có) |
| — | [can-cu/](can-cu/README.md) | **Căn cứ** kiểu Clash of Clans: Thành trì cấp 1–5, tháp, tường, kho, giới hạn tài nguyên, cân bằng với binh chủng (thiết kế, chưa làm) |
| 18 | [18-bai-quai.md](18-bai-quai.md) | **10 cấp bãi quái**, mỗi bãi 10 con (Chuột → Rồng cổ đại), model riêng, mỗi con có tỉ lệ rơi đồ riêng |
| 16 | [16-trang-bi.md](16-trang-bi.md) | **Trang bị và ô đồ**: 6 ô, túi 8 ô, 5 cấp đồ, chỉ số Máu / Sát thương / Giáp / Tốc độ, nhặt và rơi đồ |

Hình minh họa nằm trong [assets/](assets/):

- [assets/doi-hinh-luc-giac.svg](assets/doi-hinh-luc-giac.svg): thứ tự 90 ô của đội hình.
- [assets/units/](assets/units/): sprite sheet, 75 GIF hoạt ảnh, cảnh giao tranh, bảng toàn quân, trang xem tương tác `xem-truoc.html` (từ `tools/unitgen/`).
- [assets/map/](assets/map/): ảnh bản đồ render từ `tools/mapgen/` (toàn cảnh, vùng và mỏ, minimap, 8 ảnh cận cảnh, mẫu đất, 7 mỏ ở 3 trạng thái).

## Tóm tắt những điều đã chốt

| Chủ đề | Quyết định |
|---|---|
| Tên game | **Sodier War** |
| Thể loại | Chiến thuật thời gian thực, nhiều người chơi, server chạy liên tục. Người chơi vào bất cứ lúc nào |
| Đồ họa | Pixel art, ô 16×16 px, nhìn từ trên xuống, phóng to theo bội số nguyên (×1 tới ×4) |
| Bản đồ | 256×256 ô, 10 vùng đất, 138 mỏ, 12 điểm xuất phát, đường đất, làng hoang, tháp canh, khe nứt, ao/hồ băng, **không sông, không núi** |
| Khoáng sản | Sắt, Than, Vàng, Dầu, Dầu đen, Pha lê, Kim cương. Càng hiếm càng nằm gần tâm bản đồ |
| Quân | 10 binh chủng từ Dân quân tới **Rồng** (mạnh nhất, tối đa 2 con mỗi đội) |
| Nhân vật chính | Chọn 1 trong 5 nhân vật, mỗi người có buff riêng |
| Đội hình | Lục giác quanh nhân vật, xếp từ đỉnh trên cùng **theo chiều kim đồng hồ**, vòng trong trước vòng ngoài sau |
| Chiến đấu | Hai đội chạm nhau thì vỡ đội hình, **từng chiến binh bắt cặp đánh một chọi một** |
| Điều khiển | Chuột phải: di chuyển. Chuột trái: chọn và thao tác. Giữ chuột giữa: kéo bản đồ. Lăn chuột: phóng to/thu nhỏ |
| Sở hữu mỏ | Mỏ của mình có **viền xanh**, mỏ của người khác có **viền đỏ**. Mỏ chiếm qua lại được |
| Thua | Nhân vật chính chết thì hiện màn hình **Thất bại**. Nút **Bắt đầu lại** cho chọn nhân vật và xuất phát lại |

## Quy ước trong tài liệu

- **Ô** là một ô bản đồ 16×16 px. Khoảng cách, tầm đánh và tốc độ đều tính theo ô (tốc độ tính bằng ô/giây).
- Sản lượng tính bằng **đơn vị / phút**. Server cộng dồn mỗi giây.
- Mọi con số đều là **giá trị khởi điểm**. Chúng nằm trong một file cấu hình (`packages/rules/src/balance.ts`) và sẽ được chỉnh sau khi chạy mô phỏng (xem [13-ky-thuat.md](13-ky-thuat.md)).

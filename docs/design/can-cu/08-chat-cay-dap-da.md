# 08. Chặt cây, đập đá (11/11/2026)

Giống dọn chướng ngại trong Clash of Clans: cây, đá trong vùng căn cứ chiếm chỗ xây nhà, người chơi trả tiền cho thợ xây dọn đi.

## Luật

- Chỉ dọn được trong **vùng căn cứ của mình** (27×27 ô quanh Thành trì). Ngoài vùng thì cây, đá vẫn như cũ (bản đồ chung không bị phá).
- Bấm chuột trái vào cây / đá → bảng thông tin có nút **🪓 Chặt** hoặc **⛏ Đập**.
- Mỗi việc dọn **chiếm 1 thợ xây** (chung với xây, nâng cấp, sửa nhà). Tướng phải ở gần căn cứ khi ra lệnh.
- Xong thì ô đó **trống mãi** (lưu trong `state.json`, kể cả khi dời hay mất căn cứ): đi lại được, xây nhà được.
- Bot lãnh chúa NPC không dọn.

| Loại | Trên bản đồ | Giá | Thời gian | Có thể tìm thấy |
|---|---|---|---|---|
| Cây | cây lá, thông, dừa | 30 Sắt + 10 Than | 40 giây | 20%: 2–4 Pha lê |
| Cây khô | cây khô đầm lầy, cây cháy | 15 Sắt | 20 giây | 10%: 1–2 Pha lê |
| Xương rồng | sa mạc | 15 Sắt | 20 giây | 10%: 1–2 Pha lê |
| Tảng đá | đá xám, đá đỏ, đá tuyết | 60 Sắt + 40 Than | 90 giây | 25%: 1–2 Kim cương |

Nước, vực, nhà làng, tháp canh, cột đá cổ, giếng: không dọn được.

Phần thưởng tìm thấy cộng vào kho của chủ căn cứ (giữ lại nếu chủ đang vắng, nhận khi quay lại).

## Kỹ thuật

- `shared/balance.js`: `CLEAR` (giá, thời gian, thưởng), `OBST_CLEAR` (mã chướng ngại → loại).
- Server: `game.cleared` (Set chỉ số ô). Thế giới mở có bản sao riêng của lớp `block` (`world.view()`), dọn xong thì `block[i] = 0`.
- `base.clears`: việc đang làm `{tx, ty, kind, doneAt, total}`; tính vào `busyBuilders`.
- Lệnh `base-clear {x, y}`. Gửi xuống: `bases[].cl`, `cleared {list | add}`, `chunks {v}`.
- Hình bản đồ: các mảnh 32×32 ô có sẵn đã vẽ cây, đá. Mảnh nào có ô vừa dọn được vẽ lại trên server (`server/chunkr.js`, luồng phụ) với ô đó trống, lưu ở `data/map-live/<seed>/`, phục vụ tại `/live/<seed>/c_x_y.png?v=…`. Client đổi sang mảnh mới khi tải xong (không nháy).
- Client tải `/obst.bin` (1 byte mỗi ô) để biết ô nào là cây / đá.

## Hình vẽ

Prompt ở `docs/design/samples/clearing/README.md`: thợ xây (chặt, đập, đi), 2 biểu tượng, và (tùy chọn) vẽ lại 10 loại cây đá cho cả bản đồ.

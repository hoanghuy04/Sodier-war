# 07. Kỹ thuật

## 7.1 Dữ liệu

- `shared/balance.js` thêm:
  - `BUILDINGS`: chỉ số từng loại × 5 cấp, giá, thời gian, kích thước, lớp đánh.
  - `TOWN_HALL`: cấp 1–5 với giá, máu, giới hạn số lượng, thợ xây, hệ số kho.
  - `STORAGE_BASE`: mức gốc sức chứa.
  - Lớp giáp mới `build` trong bảng khắc chế `KT` (cột: bộ binh 1,3; giáo 1,0; tầm xa 0,5; kỵ 1,5; phép 0,8; công thành 2,5; bay 1,0; anh hùng 1,0).
- Căn cứ gắn với **tài khoản** (tên), không gắn với id người chơi trong trận (id đổi khi rời / vào lại Thế giới mở):
  `game.bases: Map<accKey, { owner, x, y, th, buildings: [{ id, type, x, y, lv, hp, state: 'build'|'up'|'ok'|'ruin', doneAt }], stowedHome, lastRaid, shieldUntil, log: [] }>`
- Lưu trong `state.json` cùng phòng Thế giới mở (`serialize` / `restore`, thêm `basesV: 1`).

## 7.2 Mô phỏng

- Mỗi công trình còn đứng là một **unit kind `'build'`**: tốc độ 0, có `hp / atk / range / cd / aoe / pierce`, `owner` là id người chơi nếu đang online, ngược lại là id "chủ vắng mặt" riêng của căn cứ (để `hostile()` vẫn đúng khi chủ offline).
- Dùng lại `tryShoot` cho tháp, `damage` / `kill` cho công trình. Chết thì không xóa mà chuyển `state: 'ruin'` (không bắn, không chặn đường).
- **Ô bị chặn động:** `world.js` thêm lớp `dyn` (Uint8Array W×H). Công trình đánh dấu ô của nó. `walkable()` kiểm tra thêm `dyn`; A* coi tường của **địch** là đi được với chi phí cao (×12), của mình thì không đi qua.
- Hồi máu 3%/giây cho quân trong vùng căn cứ khi team không giao chiến.
- Giới hạn tài nguyên: một hàm `capOf(p)` dùng ở mọi chỗ cộng tài nguyên (thu nhập, offline, nhặt, thưởng, cướp).

## 7.3 Lệnh (client → server)

`base-place {type, x, y}`, `base-up {id}`, `base-repair {id}`, `base-move {id, x, y}`, `base-remove {id}`, `base-wallrow {id}`, `base-cancel`. Server kiểm tra mọi thứ (tiền, suất, thợ, ô trống, vùng căn cứ, lối vào Thành trì).

## 7.4 Gửi xuống client

- Công trình là unit nên đi chung snapshot (đã có sương mù). Thêm cờ `lv`, `state`, `prog` (tiến độ xây).
- Thông tin tĩnh của căn cứ mình (vùng, thợ xây, việc đang làm, sức chứa) gửi trong `me.base` khi thay đổi.

## 7.5 Các bước làm

| Bước | Việc | Kiểm tra |
|---|---|---|
| B1 | Dữ liệu `BUILDINGS`, `TOWN_HALL`, lớp `build`; giới hạn tài nguyên (chưa cần căn cứ: dùng mức "chưa có") | Headless: thu nhập dừng ở sức chứa, người cũ không mất tài nguyên |
| B2 | Đặt Thành trì + công trình (server), ô chặn động, lưu / khôi phục | Đặt, khởi động lại server, căn cứ còn nguyên |
| B3 | Tháp bắn, công trình bị đánh / đổ nát / sửa, khiên, cướp 10% | Mô phỏng các trận ở 03 §3.5 |
| B4 | Lính đã cất giữ nhà, tướng xuất trận ở căn cứ | Chủ offline, bot đánh vào, lính ra giữ |
| B5 | Giao diện: tab Công trình, chế độ đặt, bảng chọn, thợ xây, nhật ký phòng thủ | Playwright |
| B6 | Mô hình pixel 5 loại × 5 cấp + đổ nát + giàn giáo | Xem trước |
| B7 | Bot lãnh chúa NPC biết đánh căn cứ (ít, để căn cứ có việc làm) | Headless |

Mỗi bước: sao lưu `data/state.json` trước khi khởi động lại server, giữ nguyên dữ liệu người chơi.

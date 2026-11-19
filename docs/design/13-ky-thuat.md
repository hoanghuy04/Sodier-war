# 13. Kỹ thuật và kế hoạch làm

## 13.1 Stack (dùng lại của Ant War)

| Phần | Công nghệ |
|---|---|
| Ngôn ngữ | TypeScript, pnpm workspace |
| Client | Vite, Canvas 2D (`imageSmoothingEnabled = false`), DOM thuần cho bảng |
| Server | Node.js, WebSocket (`ws`), **server quyết định mọi thứ** (client chỉ gửi lệnh) |
| Lưu trữ | SQLite: người chơi, điểm, seed bản đồ, ảnh chụp trạng thái mỗi 60 giây |
| Art | Sinh bằng code: `tools/mapgen/` (bản đồ, mỏ), `tools/unitgen/` (quân 8 hướng) |
| Chạy | tmux + trycloudflare tunnel như Ant War, cổng riêng (ví dụ 8790) |

## 13.2 Cấu trúc thư mục dự kiến

```
sodier-war/
├─ apps/
│  ├─ client/          # Vite + Canvas: render, camera, input, HUD, cửa hàng
│  └─ server/          # WebSocket, vòng tick, phiên người chơi, lưu SQLite
├─ packages/
│  ├─ rules/           # balance.ts (mọi con số), bảng khắc chế, công thức
│  └─ sim/             # mô phỏng tất định dùng chung server + headless:
│                      #   bản đồ, tìm đường, đội hình, bắt cặp, sát thương, mỏ
├─ tools/
│  ├─ mapgen/          # sinh + vẽ bản đồ, mỏ (đã có)
│  ├─ unitgen/         # quân 8 hướng, hoạt ảnh, GIF (đã có)
│  └─ headless/        # chạy trận thử cân bằng (mục 5.5)
├─ assets/preview/     # trang xem toàn bộ sprite + hoạt ảnh
├─ docs/design/        # tài liệu này
└─ scripts/            # up.sh / down.sh
```

## 13.3 Vòng mô phỏng

- **20 tick/giây** trên server.
- Thứ tự trong một tick:
  1. Nhận lệnh.
  2. Đi nhân vật (theo đường A*).
  3. Steering quân về ô đội hình.
  4. Phát hiện chạm quân (lưới băm không gian, ô 4×4).
  5. Bắt cặp (mỗi 5 tick).
  6. Đánh và đạn bay.
  7. Chết, tan rã.
  8. Chiếm mỏ.
  9. Cộng tài nguyên (mỗi 20 tick).
  10. Lính canh.
- **Tìm đường:** A* trên lưới 256×256, chi phí theo hệ số vùng đất. Chỉ nhân vật cần tìm đường dài. Quân dùng steering và A* ngắn (mục 7.6).
- **Ngẫu nhiên:** mỗi trận có seed riêng nên mô phỏng headless ra đúng kết quả của server.
- **Quy mô:** 10 người × 90 ô + 138 mỏ × tối đa 5 lính canh ≈ 1 600 thực thể. Bắt cặp tham lam chỉ chạy trong từng cụm giao chiến nên nhẹ.

## 13.4 Mạng

- **Client → server** (lệnh): `move(x, y)`, `chase(entityId)`, `stop`, `buy(unitType, count)`, `buyRing(n)`, `skill(x?, y?)`, `formationMode(mode)`, `dismiss(unitId)`, `respawn(heroId)`, `chat(text)`.
- **Server → client:** ảnh chụp trạng thái **10 lần/giây**, chỉ gồm thực thể trong tầm nhìn ([02-ban-do.md](02-ban-do.md) mục 2.8), gửi phần thay đổi so với lần trước. Trạng thái mỏ, kho của mình và bảng xếp hạng gửi riêng khi có thay đổi.
- Client vẽ **trễ 100 ms** và nội suy giữa hai ảnh chụp để chuyển động mượt. Nhân vật của mình được dự đoán trước theo lệnh vừa gửi.
- Sự kiện trận đánh (đòn trúng, chết, đạn) gửi kèm thời điểm, để client canh hoạt ảnh khớp khung Trúng.

## 13.5 Cột mốc

| Mốc | Nội dung | Xong khi |
|---|---|---|
| **M0** Bản đồ và camera | Chuyển `tools/mapgen` thành `packages/sim/src/map.ts` (256×256, 10 vùng), vẽ ô đất theo chunk, camera phóng ×1–×4, kéo bằng chuột giữa, nhân vật đi bằng chuột phải | Đi khắp bản đồ mượt, không kẹt |
| **M1** Mỏ và kinh tế | 138 mỏ, chiếm/cướp, sản lượng, thưởng giữ mỏ, hệ số quản lý, viền xanh/đỏ, thanh tài nguyên, minimap | Chiếm qua lại giữa 2 tab trình duyệt |
| **M2** Quân và đội hình | Cửa hàng, triệu tập, đội hình lục giác theo chiều kim đồng hồ, đi theo, dồn hàng, art 8 hướng cho Dân quân/Kiếm sĩ/Cung thủ | 36 quân đi theo nhân vật đẹp, đúng thứ tự |
| **M3** Chiến đấu | Chạm, bắt cặp tay đôi, tầm xa, sát thương, Hộ giá, rút lui, chết, tan rã, màn hình Thất bại và Bắt đầu lại | Hai người chơi đánh nhau trọn một trận |
| **M4** Đủ nội dung | Đủ 10 binh chủng, 5 nhân vật, lính canh, Rồng, bot lãnh chúa máy | Chơi một đời từ đầu tới Rồng |
| **M5** Hoàn thiện | Art mỏ chi tiết đủ hoạt ảnh (chương 11), hiệu ứng, âm thanh, bảng xếp hạng, chạy mô phỏng cân bằng (mục 5.5) và chỉnh số | Mọi trận thử nằm trong ±15% mục tiêu |

## 13.6 Câu hỏi còn mở

Những điểm dưới đây tài liệu đang chọn một hướng. Có thể đổi trước khi làm M0:

1. **Bot lãnh chúa máy** (M4): có cần không, hay chỉ chơi giữa người thật?
2. **Mùa server:** bản đồ cố định mãi, hay đổi seed định kỳ (ví dụ mỗi tuần) và xóa bảng xếp hạng?
3. **Đội hình xoay theo hướng đi:** tài liệu chọn **không xoay** (đỉnh trên luôn hướng Bắc). Xoay theo hướng đi trông "quân sự" hơn nhưng khó đoán vị trí.
4. **Tên game:** đang viết đúng như yêu cầu là "Sodier War", thư mục `sodier-war`. Nếu ý là "Soldier War" thì đổi tên lúc dựng M0 là dễ nhất.

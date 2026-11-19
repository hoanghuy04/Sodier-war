# 1. Tổng quan

## 1.1 Ý tưởng một câu

> Dẫn một nhân vật chính đi khắp bản đồ pixel, chiếm mỏ để lấy tài nguyên, mua quân xếp thành khối lục giác quanh mình, rồi đâm vào khối quân của người khác. Hai bên đánh nhau từng cặp. Ai mất nhân vật chính thì thua.

## 1.2 Trụ cột thiết kế

1. **Một nhân vật, một khối quân.** Người chơi chỉ ra lệnh cho nhân vật chính. Quân tự xếp hàng, tự đi theo, tự bắt cặp đánh. Không phải chọn từng lính như game RTS thường, nên dễ chơi và dễ nhìn.
2. **Mỏ là trung tâm.** Mọi tài nguyên đến từ mỏ. Mỏ hiếm thì nằm sâu trong bản đồ, có lính canh và đáng tranh giành. Mỏ đổi chủ liên tục. Viền xanh/đỏ cho biết ngay mỏ nào là của mình.
3. **Đánh nhau là một màn trình diễn.** Khi chạm quân, mỗi chiến binh lao vào một đối thủ và đánh tay đôi. Người xem thấy rõ từng cặp, từng nhát chém và từng con ngã xuống.
4. **Khối quân to dần.** Vòng lục giác dày lên theo mỗi lần mua quân. Rồng là phần thưởng cuối cho người giữ được mỏ Kim cương.
5. **Thua nhanh, chơi lại nhanh.** Chết là mất hết, nhưng chỉ cần bấm **Bắt đầu lại** là vào ván mới sau vài giây.

## 1.3 Đối tượng và quy mô

- Một nhóm bạn **2–10 người** trên một server (giống Ant War). Server chạy liên tục, ai vào lúc nào cũng được.
- Ít người thật thì server thêm **lãnh chúa máy** (bot) cho đủ khoảng 4 thế lực trên bản đồ (xem [13-ky-thuat.md](13-ky-thuat.md), cột mốc M4).
- Một "đời" của nhân vật thường kéo dài **20–60 phút**. Người giữ mỏ giỏi có thể sống lâu hơn và lên Rồng.

## 1.4 Vòng lặp chơi

```
          ┌──────────────────────────────────────────────┐
          │                                              │
   Chọn nhân vật ─► Xuất phát ở vùng ngoài ─► Chiếm mỏ Sắt/Than gần nhà
                                                  │
                                                  ▼
                          Tài nguyên chảy về kho theo thời gian
                                                  │
                                                  ▼
                       Mua quân ─► quân xếp lục giác quanh nhân vật
                                                  │
                                                  ▼
          Tiến vào vùng giữa: đánh lính canh, chiếm Vàng / Dầu / Pha lê
                                                  │
                                                  ▼
           Chạm đội quân người khác ─► đánh từng cặp ─► thắng: lấy chiến lợi phẩm
                                                  │              thua: nhân vật chết
                                                  ▼                      │
                 Giữ mỏ Kim cương + Dầu đen + Pha lê ─► mua Rồng         ▼
                                                              Màn hình THẤT BẠI
                                                                     │
                                                         Bấm BẮT ĐẦU LẠI ──┘
```

## 1.5 Một đời nhân vật diễn ra thế nào (mốc dự kiến)

| Thời điểm | Người chơi làm gì | Có trong tay |
|---|---|---|
| 0:00 | Chọn nhân vật, xuất hiện ở vùng ngoài, có khiên bảo vệ 60 giây | 200 Sắt, 60 Than, kho cơ bản +12 Sắt/phút, +4 Than/phút |
| 0:30 | Mua 3–4 Dân quân, đi chiếm mỏ Sắt gần nhất (6 giây đứng trong vòng) | 4 quân |
| 3:00 | Có 2 mỏ Sắt + 1 mỏ Than. Mua Kiếm sĩ, Cung thủ | 10–12 quân |
| 6:00 | Đánh lính canh mỏ Vàng đầu tiên ở rìa vùng giữa | 15 quân, có Vàng |
| 8–15 | Kỵ binh, Hiệp sĩ. Bắt đầu đụng độ người chơi khác. Mở vòng 4 của đội hình | 25–40 ô quân |
| 15–25 | Chiếm Dầu, Dầu đen, Pha lê. Mua Pháp sư, Máy bắn đá lửa, Sư thứu | 40–60 ô quân |
| 25–40 | Đánh Golem kim cương ở lõi, giữ mỏ Kim cương, mua Rồng đầu tiên | Rồng + đội hộ tống |

## 1.6 Thắng thua và điểm

- Không có "thắng ván". Server chạy liên tục. Người chơi cạnh tranh trên **bảng xếp hạng** (phím Tab):
  - **Điểm** = số phút-mỏ đang giữ (mỗi mỏ giữ được 1 phút cộng điểm bằng hệ số hiếm của mỏ, xem [03-khoang-san.md](03-khoang-san.md)) + giá trị quân địch đã giết / 10.
  - Bảng hiện: điểm đời hiện tại, điểm cao nhất mọi đời, số mỏ đang giữ, số Rồng.
- **Thua** khi nhân vật chính hết máu. Xem [08-chien-dau.md](08-chien-dau.md) mục 8.8 và [12-giao-dien.md](12-giao-dien.md) mục 12.8.

## 1.7 Ngoài phạm vi bản đầu

- Xây nhà, xây tường, nâng cấp công trình (game chỉ có mỏ và quân).
- Điều khiển từng lính riêng lẻ, chia đội.
- Liên minh chính thức (người chơi tự thỏa thuận ngoài game).
- Điện thoại, màn hình cảm ứng (bản đầu chỉ cho chuột và bàn phím).
- Sông, núi, nước nói chung.

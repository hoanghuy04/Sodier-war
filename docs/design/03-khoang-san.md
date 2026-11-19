# 3. Hệ thống khoáng sản

## 3.1 Bảy loại khoáng sản

| Mỏ | Tài nguyên | Độ hiếm | Sản lượng gốc (đơn vị/phút) | Giá trị quy đổi (theo Sắt) | Giá trị/phút | Hệ số điểm | Dùng chủ yếu cho |
|---|---|---|---|---|---|---|---|
| **Mỏ Sắt** | Sắt | Thường | **30** | 1,0 | 30 | 1 | Mọi quân bộ, vũ khí, giáp |
| **Mỏ Than** | Than | Thường | **25** | 1,3 | 32 | 1 | Rèn giáp, cung nỏ, Pháp sư |
| **Mỏ Vàng** | Vàng | Khá hiếm | **14** | 2,5 | 35 | 2 | Kỵ binh, Hiệp sĩ, Pháp sư, Rồng, mở vòng đội hình |
| **Giếng Dầu** | Dầu | Khá hiếm | **12** | 3,2 | 38 | 2 | Máy bắn đá lửa, Sư thứu |
| **Hố Dầu Đen** | Dầu đen (hắc ín) | Hiếm | **8** | 5,0 | 40 | 3 | Đạn lửa của Máy bắn đá, hơi thở lửa của Rồng |
| **Mỏ Pha lê** | Pha lê | Hiếm | **5** | 9,0 | 45 | 4 | Pháp sư, Sư thứu, Rồng, vòng 5 |
| **Mỏ Kim cương** | Kim cương | Rất hiếm | **3** | 18,0 | 54 | 6 | **Rồng** |

- **Dầu** là dầu thô bơm từ giếng (màu nâu hổ phách). **Dầu đen** là hắc ín đặc sôi lên từ hố tự nhiên (đen ánh tím), hiếm hơn, dùng làm chất cháy. Hai thứ là hai tài nguyên khác nhau.
- Giá trị/phút của mỏ tăng theo độ hiếm (30 → 54). Mỏ hiếm vừa cho thứ cần cho quân mạnh vừa đáng giá hơn, nên đáng đánh nhau để giành.
- **Cập nhật 11/11/2026:** sản lượng gốc của mọi loại mỏ giảm một nửa (Sắt 15, Than 12, Vàng 7, Dầu 6, Dầu đen 4, Pha lê 2,5, Kim cương 1,5 mỗi phút); bảng trên là số cũ trước khi giảm.
- **Giá trị quy đổi** chỉ dùng để cân bằng (xem [05-kinh-te-can-bang.md](05-kinh-te-can-bang.md)). Trong game không có chợ đổi tài nguyên.

## 3.2 Kho của người chơi

- Tài nguyên từ mỏ **chảy thẳng về kho chung** của người chơi mỗi giây (sản lượng/60). Không cần chở về.
- **Kho cơ bản (tự tăng, không cần mỏ):** mỗi nhân vật đang sống tự có mỗi phút **+20 Sắt, +10 Than, +5 Vàng, +4 Dầu, +2 Dầu đen, +1 Pha lê, +0,2 Kim cương** (cập nhật 11/11/2026; Kim cương giảm từ 0,5). Mất hết mỏ vẫn gây lại được quân, chỉ chậm hơn nhiều.
- **Offline vẫn có tài nguyên, bằng 50% tốc độ online:** mất kết nối mà tướng còn trên bản đồ thì thu nhập giảm một nửa; đã rời Thế giới mở / đăng xuất thì khi quay lại được cộng bù 50% thu nhập mỗi phút (lúc rời đi) × số phút vắng mặt, tối đa 24 giờ.
- **Vốn khởi đầu:** 200 Sắt, 60 Than.
- Kho **không có giới hạn**. Khi nhân vật chết, kho mất hết (25% rơi cho người giết, xem [08-chien-dau.md](08-chien-dau.md)).

## 3.3 Sản lượng thực tế

```
sản lượng thực = sản lượng gốc × (1 + thưởng giữ mỏ) × hệ số quản lý × buff nhân vật
```

**Thưởng giữ mỏ (khai thác ổn định):** giữ liên tục càng lâu thì mỏ chạy càng đều.

| Thời gian giữ liên tục | 0–2 phút | 2–4 | 4–6 | 6–8 | 8–10 | 10–12 | ≥ 12 |
|---|---|---|---|---|---|---|---|
| Thưởng | 0% | +5% | +10% | +15% | +20% | +25% | **+30%** |

Mỏ bị người khác chiếm thì thưởng về 0.

**Hệ số quản lý (chống một người ôm hết bản đồ):**

| Số mỏ đang giữ | 1–6 | 7 | 8 | 9 | 10 | 11 | ... | ≥ 16 |
|---|---|---|---|---|---|---|---|---|
| Hệ số (áp cho mọi mỏ) | 100% | 97% | 94% | 91% | 88% | 85% | −3%/mỏ | **70%** (sàn) |

HUD hiện hệ số này cạnh thanh tài nguyên khi nó dưới 100%.

## 3.4 Chiếm mỏ

**Vòng chiếm:** hình tròn bán kính **2,5 ô** tính từ tâm mỏ (Kim cương: **3 ô**). Khi mỏ được chọn hoặc đang bị chiếm, vòng hiện bằng nét đứt trên mặt đất.

**Điều kiện để thanh chiếm chạy:**

1. **Nhân vật chính** của người chiếm đứng trong vòng chiếm (quân lính không tự chiếm được).
2. Trong vòng chiếm **không có** quân hay nhân vật của người khác (kể cả chủ mỏ), và **không còn lính canh** sống.
3. ~~Đội không đang giao chiến.~~ (bỏ 11/11/2026: tướng đứng trong vòng mỏ thì thanh chiếm vẫn chạy kể cả khi đội đang đánh nhau. Có tướng/quân địch đứng trong vòng thì thanh **đứng yên**, không tụt.)

**Thời gian chiếm:**

| Mỏ | Mỏ trống | Mỏ của người khác (cướp) |
|---|---|---|
| Sắt, Than | 6 giây | 9 giây |
| Vàng | 9 giây | 13 giây |
| Dầu | 10 giây | 15 giây |
| Dầu đen | 12 giây | 18 giây |
| Pha lê | 14 giây | 21 giây |
| Kim cương | 20 giây | 30 giây |

- Cướp mỏ của người khác lâu gấp **1,5 lần**. Thanh chiếm chia hai nửa: nửa đầu **hạ cờ** (viền đỏ nhạt dần, mỏ vẫn cho chủ cũ tài nguyên), nửa sau **cắm cờ**. Chạy hết nửa đầu thì mỏ thành mỏ trống ngay cả khi người chiếm bỏ đi.
- Ra khỏi vòng hoặc bị chặn: thanh **không về 0 ngay** mà tụt với tốc độ 1/3 tốc độ chiếm. Quay lại sớm thì chiếm tiếp.
- Hai người cùng đứng trong vòng: không ai chiếm được (điều kiện 2), hai đội gần như chắc chắn chạm nhau và đánh.
- Chiếm xong: cờ cắm lên, viền đổi sang **xanh**, có thông báo "Đã chiếm Mỏ Vàng". Chủ cũ nhận cảnh báo "Mất Mỏ Vàng (x, y) vào tay <tên>".
- **Cảnh báo bị chiếm:** ngay khi thanh chiếm trên mỏ của mình bắt đầu chạy, chủ mỏ nhận cảnh báo đỏ và minimap nháy chấm ở mỏ đó (xem [12-giao-dien.md](12-giao-dien.md)).

## 3.5 Viền sở hữu

| Trạng thái mỏ | Viền quanh mô hình mỏ | Cờ trên mỏ |
|---|---|---|
| Của mình | **Xanh lá** `#3EE06B`, dày 2 px, nhịp sáng/mờ chu kỳ 1,6 giây | Cờ xanh, huy hiệu nhân vật của mình |
| Của người khác | **Đỏ** `#FF4A4A`, dày 2 px, cùng nhịp | Cờ đỏ, tên chủ mỏ khi rê chuột |
| Trống | Không viền. Rê chuột thì có viền trắng mờ 1 px | Không cờ |
| Đang bị hạ cờ | Viền nháy nhanh (chu kỳ 0,4 giây) | Cờ từ từ hạ xuống |

Cách vẽ viền: xem [11-mo-hinh-mo.md](11-mo-hinh-mo.md) mục 11.10.

## 3.6 Lính canh mỏ

Mỏ trống từ Vàng trở lên có **lính canh trung lập**. Phải đánh hết lính canh mới chiếm được. Lính canh đánh từng cặp như quân người chơi (xem [08-chien-dau.md](08-chien-dau.md)).

| Mỏ | Lính canh | Phần thưởng khi hạ hết |
|---|---|---|
| Sắt, Than | Không có | — |
| Vàng | 3 Thổ phỉ (như Dân quân) + 1 Cung thủ phỉ | 40 Vàng |
| Dầu | 4 Thổ phỉ + 2 Cung thủ phỉ | 30 Dầu |
| Dầu đen | 3 Kiếm sĩ đen + 2 Cung thủ phỉ + 1 **Thú hắc ín** (HP 400, đòn bôi chậm −20% tốc độ) | 25 Dầu đen |
| Pha lê | 4 **Tinh linh pha lê** (HP 160, đánh phép tầm 3, không giáp) | 15 Pha lê |
| Kim cương | 1 **Golem kim cương** (boss: HP 3000, ATK 70, giáp 40%, đòn dậm đất AoE 2 ô mỗi 6 giây) + 4 Tinh linh pha lê | 10 Kim cương + 150 Vàng |

- Lính canh **đứng thành cụm** trong vòng chiếm, quay mặt ra ngoài, không đuổi xa quá 6 ô rồi quay về và hồi đầy máu.
- Lính canh **sinh lại** khi mỏ đã là mỏ trống liên tục **4 phút** (mỏ vừa bị hạ cờ, hay vừa mất chủ vì chủ chết). Mỏ đã có chủ thì không có lính canh. Chủ mỏ tự lo giữ.
- Chỉ số lính canh trong [04-quan-doi.md](04-quan-doi.md) mục 4.7.

## 3.7 Khi chủ mỏ chết

- Mọi mỏ của người đó lập tức thành **mỏ trống**, viền biến mất, cờ đổ xuống (hoạt ảnh 0,6 giây).
- Lính canh **chưa** sinh lại ngay (chờ 4 phút như mục 3.6) để người khác có cơ hội nhặt mỏ.

## 3.8 Thông tin hiện khi chọn mỏ (chuột trái)

- Tên mỏ, tọa độ, chủ mỏ (hoặc "Trống"), sản lượng gốc và sản lượng thực của chủ hiện tại.
- Thời gian giữ liên tục và mức thưởng giữ mỏ.
- Lính canh còn sống (biểu tượng + số), thời gian tới khi lính canh sinh lại.
- Thời gian chiếm nếu là mình (đã tính buff nhân vật).
- Nút **Đi tới mỏ này** (cũng làm được bằng chuột phải lên mỏ).

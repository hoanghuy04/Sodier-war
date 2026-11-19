# 06. Tấn công và phòng thủ

## 6.1 Căn cứ tự phòng thủ

- Căn cứ **ở lại trên bản đồ cả khi chủ offline**, kể cả khi chủ rời Thế giới mở hoặc tướng chết.
- Tháp tự bắn kẻ địch trong tầm: tướng, quân, quân của bot lãnh chúa NPC. Không bắn quái hoang và boss (chúng không vào căn cứ).
- Ưu tiên bắn: kẻ đang đánh công trình → kẻ gần nhất. Tháp phép ưu tiên mục tiêu có giáp cao.

## 6.2 Lính đã cất giữ nhà

Nút **C (Cất binh)** đã có sẵn trong game. Khi người chơi có căn cứ:
- Lính đã cất **ở trong căn cứ** (đóng quân trong Thành trì).
- Có kẻ địch đánh vào bất kỳ công trình nào, **lính đã cất tự ra** quanh Thành trì và đánh, kể cả khi chủ đang offline hoặc đang ở xa.
- Lính giữ nhà chỉ đánh trong **vùng căn cứ + 3 ô**, không đuổi xa hơn.
- Hết trận 10 giây thì lính tự vào lại trong Thành trì, với máu còn lại, sau đó hồi máu dần (3%/giây) như quân đứng trong căn cứ.
- Lính chết khi giữ nhà là mất.
- Chủ bấm **C (Xuất binh)** ở **bất kỳ đâu**: lính trong căn cứ ra ngay quanh tướng (11/11/2026, theo yêu cầu: trước đây phải về tận căn cứ). Riêng lúc căn cứ đang bị đánh thì lính giữ nhà ở lại cho tới khi hết trận.
- Thành trì bị phá thì lính đã cất vẫn an toàn nhưng không ra giữ nhà được nữa cho tới khi sửa.

## 6.3 Tướng chết

- Căn cứ **vẫn đứng**.
- Lính đã cất trong căn cứ **không mất** (chỉ lính đang đi theo tướng mới chết theo như bây giờ).
- Bấm "Chiến tiếp" thì tướng **xuất trận lại ở Thành trì**. Thành trì đang bị phá thì xuất ở trại xuất phát như bây giờ.

## 6.4 Đánh căn cứ người khác

- **Chuột phải vào công trình địch**: tướng tiến tới, quân tự đánh công trình trong tầm (giống đánh mỏ có lính canh).
- Quân tự ưu tiên: lính giữ nhà đang đánh mình → tháp gần nhất → tường chắn đường → công trình khác.
- Tường chặn đường đi bộ. Tìm đường (A*) coi tường là ô đi được nhưng rất tốn (đập tường), nên quân chọn đi vòng nếu có đường ngắn hơn đập tường.
- Quân bay bỏ qua tường.
- Khi đang có khiên 30 phút thì không đánh được (rê chuột hiện "Căn cứ đang có khiên, còn 12 phút").

## 6.5 Thông báo

- Chủ căn cứ (online) nhận thông báo đỏ: "⚔ Hthw đang đánh căn cứ của bạn!", minimap nhấp nháy căn cứ.
- Chủ offline: khi quay lại thấy **nhật ký phòng thủ**: ai đánh, phá được gì, mất bao nhiêu tài nguyên, lính giữ nhà còn bao nhiêu.
- Có Telegram (tùy chọn sau): báo khi căn cứ bị đánh.

## 6.6 Chống lạm dụng

- Không xây công trình trong vùng căn cứ người khác hoặc trong 28 ô quanh Thành trì khác.
- Không đặt Thành trì ngay cạnh mỏ để biến tháp thành lính canh mỏ (cách mỏ tối thiểu 5 ô, tháp tầm 7,5 vẫn phủ được mỏ gần. Đây là chủ ý, giữ mỏ gần nhà dễ hơn).
- Người mới (chưa có Thành trì) không bị ảnh hưởng gì.

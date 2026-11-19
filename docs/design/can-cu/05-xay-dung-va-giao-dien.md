# 05. Xây dựng và giao diện

## 5.1 Mua trong cửa hàng

- Cửa hàng (phím **B**) có thêm tab **Công trình** cạnh tab Quân.
- Mỗi ô công trình hiện: hình, tên, giá cấp 1, số đã xây / tối đa (theo Thành trì), và lý do không mua được (thiếu tiền, hết suất, hết thợ xây, chưa có Thành trì).
- Chưa có Thành trì thì tab chỉ có Thành trì, các ô khác mờ với dòng "Cần Thành trì".

## 5.2 Đặt công trình

1. Bấm mua → tiền bị giữ lại, vào **chế độ đặt**.
2. Một khung theo chuột, **xanh** là đặt được, **đỏ** là không. Khung vùng căn cứ (13 ô quanh Thành trì) hiện viền vàng nhạt.
3. **Chuột trái** để đặt. Giữ **Shift** khi đặt Tường để đặt liên tục (kéo chuột thành hàng).
4. **Chuột phải** hoặc **Esc** để thôi: hoàn lại toàn bộ tiền.
5. Không đặt được nếu ô bị chặn (cây, đá, nước, mỏ, quân đang đứng), ra ngoài vùng căn cứ, hoặc chặn kín lối vào Thành trì (phải còn ít nhất 1 đường đi bộ từ ngoài vào sát Thành trì, để căn cứ luôn đánh được).

## 5.3 Chọn công trình của mình

Chuột trái vào công trình của mình mở một bảng nhỏ:
- Tên, cấp, máu, sát thương, tầm (vòng tầm bắn hiện trên bản đồ).
- **Nâng cấp** (giá, thời gian, hoặc lý do bị khóa: "Cần Thành trì cấp 3", "Hết thợ xây").
- **Sửa** nếu đang là đống đổ nát (30% tổng giá cấp hiện tại, nửa thời gian xây).
- **Dời** (miễn phí, công trình ngừng hoạt động 5 giây). **Phá bỏ** (không hoàn tiền).
- Tường có thêm **Nâng cả hàng**.

## 5.3b Dời công trình (đã làm)

- Bấm vào công trình → **Dời** → chuột trái vào một ô để "cầm lên", di chuột (khung xanh / đỏ hiện chỗ mới của mọi công trình đang dời) → chuột trái để đặt xuống. Chuột phải / Esc để thôi. Miễn phí, tháp ngừng bắn 3 giây.
- **Tường dời cả cụm:** bấm một đoạn tường → **Dời cả cụm tường**: mọi đoạn tường nối liền với nó (kể cả khác cấp) dời cùng nhau, giữ nguyên hình dạng.
- **Chọn tay nhiều đoạn:** Shift + chuột trái vào từng đoạn tường để thêm / bớt, rồi **Dời N đoạn đã chọn**.
- **Xây tường nhanh:** chọn Tường trong cửa hàng rồi giữ chuột trái và kéo: mỗi ô chuột đi qua thành một đoạn tường.
- Dời Thành trì: cả căn cứ dời theo (kiểm tra lại khoảng cách tới căn cứ khác, trại xuất phát, bãi quái).
- Không dời được khi căn cứ hoặc bạn đang giao chiến, và không được bịt kín lối vào Thành trì.

## 5.4 Thợ xây

- Số công trình xây hoặc nâng cấp cùng lúc = số thợ xây (1 / 2 / 2 / 2 / 3 theo cấp Thành trì).
- Thanh trên cùng hiện "Thợ xây 1/2" và danh sách việc đang làm với thời gian còn lại.
- Hết thợ thì nút mua / nâng cấp mờ, rê chuột thấy công trình nào xong sớm nhất.

## 5.5 Trên bản đồ

- Công trình của mình viền màu người chơi, của người khác viền màu của họ. Thanh máu hiện khi bị đánh.
- Đang xây: giàn giáo gỗ + thanh tiến độ. Đang nâng cấp: búa gõ nhỏ trên nóc.
- Đống đổ nát: gạch vụn xám, không chặn đường.
- Minimap: Thành trì là ô vuông màu người chơi, căn cứ của mình có viền trắng.
- Đứng trong vùng căn cứ của mình: góc màn hình hiện "🏰 Trong căn cứ · hồi máu".

## 5.6 Mô hình (art)

Công trình là mô hình pixel 3/4 giống mỏ (chương 11), mỗi cấp đổi vật liệu:
- Cấp 1–2: gỗ.
- Cấp 3: đá.
- Cấp 4: đá viền đồng.
- Cấp 5: đá trắng viền vàng, có cờ màu người chơi.

Làm bằng tools/mapgen (giống mỏ) hoặc tools/unitgen/beasts.mjs (khối SDF), xuất mỗi loại × 5 cấp + bản đổ nát + bản giàn giáo.

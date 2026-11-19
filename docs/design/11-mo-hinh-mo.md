# 11. Mô hình pixel art của các mỏ

## 11.1 Quy ước chung

| Mục | Quy ước |
|---|---|
| Kích thước nền | Mỏ thường chiếm **3 × 3 ô** (48 × 48 px). Kim cương **4 × 4 ô** (64 × 64 px) |
| Khung sprite | Cao hơn nền 16 px cho phần nhô lên (tháp, máy bơm, tinh thể): **48 × 64**, Kim cương **64 × 80**. Điểm neo ở giữa cạnh dưới |
| Ánh sáng | Từ **trên bên trái**. Mỗi chất liệu có 3–5 sắc độ: tối nhất làm viền, sáng nhất làm điểm bắt sáng |
| Viền | Viền chọn lọc: dùng màu tối nhất **của chính chất liệu đó** (không dùng đen chung). Viền ngoài cùng tối hơn viền trong |
| Bóng đổ | Elip bóng mờ 25% màu `#000000` về phía dưới bên phải, lệch 2 px |
| Nền đất quanh mỏ | Mỗi mỏ có **mảng nền 5 × 5 ô** vẽ dưới mô hình: đất bị giẫm, vụn quặng rơi, vết bánh xe. Mép mảng hòa dần vào vùng đất xung quanh bằng dither 2 px |
| Hoạt ảnh | **Máy móc chỉ chạy khi mỏ có chủ** (đó là dấu hiệu mỏ đang sản xuất). Mỏ trống chỉ có hiệu ứng tự nhiên ở mức yếu (bong bóng, lấp lánh, ánh sáng) |
| Cờ | Mỏ có chủ cắm cờ 8 × 12 px ở góc trên bên trái, màu người chơi, bay 4 khung |
| Số khung | Tối đa 12 khung cho một chuyển động. Chuyển động của các mỏ cùng loại lệch pha ngẫu nhiên để không chạy đồng loạt |

Năm trạng thái hiển thị của mỗi mỏ:

1. **Trống**: máy móc đứng yên, không cờ, không viền.
2. **Của mình**: máy chạy, cờ, **viền xanh**. Mỗi 10 giây (khi mỏ trong khung nhìn) bay lên biểu tượng tài nguyên kèm số, ví dụ "+5 ⛏".
3. **Của người khác**: máy chạy, cờ màu chủ mỏ, **viền đỏ**.
4. **Đang bị chiếm**: vòng chiếm nét đứt trên đất, thanh tiến độ vòng cung quanh mỏ (mục 11.11).
5. **Đào thần tốc** (kỹ năng Kim Hạ): máy chạy nhanh gấp đôi, hạt sáng vàng bốc lên.

---

## 11.2 Mỏ Sắt: "Cửa hầm đá xám"

```
            ▲▲▲▲▲▲▲▲▲▲
        ▲▲▲ đá xám xanh ▲▲▲        ← khối đá lộ thiên, vân gỉ cam chạy chéo
      ▲▲  ┌──────────┐  ▲▲▲
     ▲▲   │█ cửa hầm █│ ⚒ ▲▲       ← khung gỗ chống hầm, cuốc dựng bên cạnh
     ▲    │█ tối đen █│   ▲  ☼     ← đèn bão treo trên xà
          └═══╤══╤═══┘
   ░░░        ║  ║   [xe goòng]     ← đường ray đi ra, xe goòng đầy quặng
   ░ quặng ░  ║  ║    ▣▣▣
```

- **Chi tiết:** khối đá thấp màu xám xanh, mặt trên sáng, nhiều mặt cắt góc cạnh. Vân **gỉ sắt** đỏ cam chạy chéo qua đá, có 3–4 cục quặng lồi màu nâu đỏ. Cửa hầm có khung gỗ chống hình chữ Π, bên trong tối dần ba bậc. Hai thanh ray thép đi từ cửa hầm ra ngoài 1,5 ô. Xe goòng sắt chở quặng xám đỏ. Một cây cuốc dựng vào đá. Một đèn bão treo trên xà ngang.
- **Hoạt ảnh (có chủ):**
  - Xe goòng chạy ra khỏi hầm, dừng, rồi lùi vào (12 khung, chu kỳ 6 giây). Lúc xe dừng có cụm bụi 3 khung.
  - Đèn bão chập chờn 3 khung.
- **Hoạt ảnh (trống):** xe goòng nằm yên ở cuối ray, đèn tắt.

| Chất liệu | Màu (tối → sáng) |
|---|---|
| Đá | `#2B303B` `#3B4252` `#5B6577` `#8691A6` `#B7C0D1` |
| Gỉ sắt / quặng | `#5A2618` `#7A3A22` `#B5562E` `#E08A4F` |
| Gỗ chống | `#3A2314` `#4A2E1C` `#7A4F2E` `#A8743F` |
| Ray, xe goòng | `#3F4146` `#6D6F75` `#A9ADB5` |
| Đèn | `#FFB84D` `#FFD36B` `#FFF3C4` |

## 11.3 Mỏ Than: "Giàn tời than"

```
               ◎  ← bánh xe ròng rọc trên đỉnh (quay)
              /║\
             / ║ \     ← tháp tời gỗ hình chữ A, dây thừng thả xuống
            /  ║  \
           /   ▤   \   ← gàu than lên xuống theo dây
     ▓▓▓▓▓/▓▓▓▓▓▓▓▓▓\▓▓▓
   ▓▓ đống than đen bóng ▓▓▓    ← các mặt than lóe sáng tím lam
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  🔥 ← lò than đỏ, khói xám bốc lên
       [bao][bao]
```

- **Chi tiết:** đống than đen nhiều cục góc cạnh. Mỗi cục có mặt sáng màu xám lam và vài pixel **lóe sáng tím nhạt** như than antraxit. Tháp tời bằng gỗ hình chữ A cao 1 ô nhô lên trên nền, đỉnh có bánh xe ròng rọc 8 × 8 px với 4 nan hoa. Một gàu sắt treo trên dây. Hai bao tải than vá chằng chịt. Bên phải là lò than rực đỏ. Mặt đất xung quanh lấm bụi than đen loang lổ.
- **Hoạt ảnh (có chủ):**
  - Bánh xe quay 4 khung.
  - Gàu than lên xuống theo dây (chu kỳ 8 giây).
  - Lò than lập lòe 3 khung. Khói bốc lên thành 3 cụm, to dần và mờ dần.
  - Thỉnh thoảng một cục than lóe sáng.
- **Hoạt ảnh (trống):** lò tắt (chỉ còn than hồng mờ), không có khói.

| Chất liệu | Màu |
|---|---|
| Than | `#0C0C11` `#121218` `#22232D` `#3A3C4D` `#5E6278` |
| Lóe sáng | `#8FA0C9` `#C9C2FF` |
| Gỗ tháp | `#3A2314` `#5C3A22` `#8A5A34` `#B88550` |
| Lò, lửa | `#7A1F0A` `#FF7A1A` `#FFB347` `#FFE08A` |
| Khói | `#4A4A52` (độ mờ 60% → 0%) |

## 11.4 Mỏ Vàng: "Vách cát lộ vỉa vàng"

```
        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     ▒▒▒ ✦  vỉa vàng ✦ ▒▒▒     ← tảng đá cát thấp, vỉa vàng uốn lượn
    ▒▒  ●●     ✦    ●  ▒▒      ← cục vàng lồi lên, sao lấp lánh
    ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
   ══ máng đãi gỗ ══╗   [xe cút kít ●●●]
     ▤▤▤ thỏi vàng   ║        ← chồng 5 thỏi vàng hình thang
```

- **Chi tiết:** tảng đá cát nâu vàng nhiều lớp (mỗi lớp lệch 1 px, như đá trầm tích), cao khoảng 1 ô. Hai **vỉa vàng** uốn lượn dày 2 px, có 5–6 cục vàng lồi lên. Mỗi cục có điểm sáng gần trắng. Trước tảng đá là máng đãi bằng gỗ nghiêng. Một xe cút kít chở vàng cục. Một chồng **thỏi vàng** hình thang xếp 3–2.
- **Hoạt ảnh:**
  - Sao lấp lánh 4 cánh (5 khung: chấm → chữ thập → sao → chữ thập → tắt) hiện ngẫu nhiên trên điểm vàng. Có chủ: 3 sao mỗi giây. Trống: 1 sao mỗi 2 giây.
  - Có chủ: vệt sáng quét chéo qua chồng thỏi vàng mỗi 4 giây.

| Chất liệu | Màu |
|---|---|
| Đá cát | `#4A3220` `#6B4A2B` `#9C6B3C` `#C99A5B` `#E8C48A` |
| Vàng | `#5C3D06` `#7A5208` `#B8860B` `#F4C430` `#FFE680` `#FFFBE0` |
| Gỗ máng | `#4A2E1C` `#7A4F2E` `#A8743F` |

## 11.5 Giếng Dầu: "Máy bơm đầu ngựa"

```
             ___
   [cờ]     /   \_____________          ← "đầu ngựa" cong ở một đầu dầm
            \___/  dầm đu    ‖  ◯       ← dầm đu bập bênh, tay quay + đối trọng
                |     ‖‖     ‖‖
   ┌────┐       |     ‖‖   ┌─────┐
   │bồn │═══════╪═══════════│động │      ← đường ống từ giếng về bồn
   │dầu │ ống   | giếng     │ cơ  │
   └────┘      ▓▓▓          └─────┘
  (◉)(◉)(◉)       ≈≈ vũng dầu bóng ≈≈    ← 3 thùng phuy, vũng dầu loang
```

- **Chi tiết:** máy bơm kiểu đầu ngựa bằng thép, sơn **vàng đậm** có dải đen ở chân. Dầm đu dài 2 ô đặt trên giá chữ A. Đầu ngựa cong ở một đầu, tay quay và đối trọng hình bán nguyệt ở đầu kia. Một hộp động cơ nhỏ. Ống dẫn chạy về **bồn chứa** hình trụ gỉ đỏ có thang leo và vạch mức dầu. Ba thùng phuy (2 lam, 1 đỏ) có nắp tròn. Vũng dầu **nâu hổ phách tối**, có một vệt sáng phản chiếu.
- **Hoạt ảnh (có chủ):**
  - Dầm đu bập bênh 8 khung (chu kỳ 2,4 giây). Đầu ngựa lên xuống 6 px, tay quay quay tròn đồng bộ.
  - Mỗi chu kỳ có 1 giọt dầu nhỏ xuống từ van.
  - Vệt sáng trên vũng dầu trôi qua lại.
- **Hoạt ảnh (trống):** máy đứng yên ở vị trí giữa, vũng dầu vẫn có vệt sáng chậm.

| Chất liệu | Màu |
|---|---|
| Thép | `#1E2127` `#2B2F36` `#4A515C` `#7D8794` `#B0BAC6` |
| Sơn vàng | `#5E480C` `#8A6A12` `#C9A227` `#F0D060` |
| Dầu thô | `#1A0E05` `#2A1708` `#5A3210` `#A0642A` `#E0A85A` |
| Bồn gỉ | `#3E1C14` `#5C2A1E` `#8C4030` `#B8604A` |
| Thùng phuy | lam `#1F3F7A` `#3F6FC0`, đỏ `#7A1F1F` `#C04040` |

## 11.6 Hố Dầu Đen: "Hố hắc ín sôi"

```
      ░░ đất cháy nứt nẻ ░░░░░
    ░░  ╭───────────────╮  ░░       ← mép hố viền đất cháy đen
   ░   ╱  ●   ◦   hắc ín  ╲  ░  ~   ← bong bóng phồng lên rồi vỡ, khói đen
   ░  │  ☠≡≡≡  ánh cầu vồng │ ░     ← bộ xương thú cổ chìm một nửa (sọ + sườn)
   ░   ╲    ◦      ●     ╱   ░
    ░░  ╰──╥═══════╥────╯  ░░       ← cầu ván gỗ, xô múc treo dây
            [xô][xô]
```

- **Chi tiết:** hố hình bầu dục không đều chiếm khoảng 2,5 × 2 ô. **Hắc ín đen ánh tím**, bề mặt có những dải ánh cầu vồng rất nhạt (lam ngọc, vàng úa, tím). Chìm một nửa trong hố là **bộ xương thú cổ**: sọ có sừng và 4 xương sườn cong nhô lên. Mép hố là vòng đất cháy đen nứt nẻ. Một cầu ván gỗ thò ra giữa hố, có cọc và dây thừng. Hai xô gỗ đầy hắc ín, nhỏ giọt.
- **Hoạt ảnh (luôn có, có chủ thì mạnh gấp đôi):**
  - 3–5 bong bóng ở vị trí ngẫu nhiên: phồng lên (3 khung, 2 → 6 px), vỡ (2 khung), để lại vòng gợn tan dần (3 khung).
  - Dải ánh cầu vồng trôi chậm và đổi sắc 6 khung (chu kỳ 3 giây).
  - Khói đen mảnh bốc lên rồi tan.
  - Có chủ: thêm một xô được kéo lên bằng ròng rọc trên cầu ván.

| Chất liệu | Màu |
|---|---|
| Hắc ín | `#07050A` `#140D1C` `#261833` `#3D2A52` |
| Ánh dầu | `#5B4A8A` `#2F7F7A` `#8A7A2F` (dùng 1–2 px, độ mờ 70%) |
| Xương | `#6E6552` `#A89D82` `#D9D0B8` `#F2ECDA` |
| Đất cháy | `#1E1814` `#2E2420` `#4A3A30` `#6A5444` |
| Gỗ | `#3A2314` `#5C3A22` `#8A5A34` |

## 11.7 Mỏ Pha lê: "Cụm tinh thể tím"

```
                 ◇            ← mảnh pha lê nhỏ bay quanh theo hình elip
           ◆    /\     ◇
          /\   /  \  /\
         /  \ / ◆◆ \/  \      ← 5–7 trụ tinh thể tím, cao thấp khác nhau
        / ◆◆ \ ◆◆◆◆ / ◆◆\     ← mặt tinh thể 3 sắc + cạnh sáng trắng
     ◇ ◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣  ◇   ← tinh thể lam nhỏ ở chân
       ░░ đá gốc tím xám ░░
     (( quầng sáng tím nhịp thở ))
```

- **Chi tiết:** 5–7 trụ tinh thể lục giác cắm xiên từ một khối đá gốc tím xám. Trụ cao nhất cao 28 px. Mỗi trụ có 3 mặt (tối, vừa, sáng) và **một cạnh sáng trắng 1 px** phía bên trái. Đỉnh nhọn trong hơn, có pixel gần trắng. Chân cụm có vài tinh thể **lam ngọc** nhỏ để tương phản. Mặt đất có quầng sáng tím mờ hình elip.
- **Hoạt ảnh (luôn có):**
  - Quầng sáng thở (độ mờ 20% → 45%, chu kỳ 2 giây).
  - 3 mảnh pha lê nhỏ 3 × 4 px bay quanh cụm theo elip (12 khung, chu kỳ 4 giây). Mảnh nào ở phía sau thì vẽ sau cụm và tối hơn.
  - Có chủ: mỗi 3 giây một vệt sáng chạy dọc một trụ từ chân lên đỉnh, đỉnh lóe sao.

| Chất liệu | Màu |
|---|---|
| Pha lê tím | `#2A1040` `#4B1D73` `#7A35B0` `#B06BFF` `#E3C2FF` `#FFFFFF` |
| Pha lê lam (phụ) | `#1A4A6B` `#2F8FBF` `#8FE3FF` |
| Đá gốc | `#2A2536` `#3A3448` `#5A5070` `#7E7396` |
| Quầng sáng | `#B06BFF` (độ mờ 20–45%) |

## 11.8 Mỏ Kim cương: "Đền kim cương cổ" (4 × 4 ô)

```
     ▥                         ▥        ← hai cột đá cổ còn đứng, một cột gãy nằm
     ▥   ╔═══════════════════╗ ▥        ← nền đá lát hình bát giác, khắc ký tự
     ▥  ║  ᚱ    ‖ ‖ ‖ ‖    ᚦ  ║ ▥        ← các tia sáng lăng kính dựng đứng lên trời
        ║        ◇◇◇◇◇        ║
        ║   ◇   ◆◆◆◆◆◆◆   ◇   ║          ← viên kim cương lớn (giác cắt brilliant)
        ║       ◆◆◆◆◆◆◆       ║            cắm nửa chìm giữa miệng hố
        ║    ◇   ◆◆◆◆◆   ◇    ║          ← kim cương nhỏ rải quanh
        ║  ᚹ      ◆◆◆      ᛉ  ║
         ╚═══════════════════╝
   ▬▬▬ cột gãy ▬▬▬     rêu, cỏ mọc kẽ đá
```

- **Chi tiết:** nền đá cổ hình bát giác, mép vỡ, cỏ và rêu mọc ở kẽ đá. Bốn góc khắc **ký tự cổ**. Hai cột đá có hoa văn còn đứng (cao vượt nền 16 px), một cột gãy đổ nằm ngang phía trước. Giữa nền là miệng hố, trong đó một **viên kim cương lớn 24 × 20 px** giác cắt brilliant (mặt bàn trên, các mặt tam giác xung quanh), mỗi mặt một sắc lam trắng khác nhau. 6–8 viên kim cương nhỏ (3–5 px) rải quanh. Từ viên lớn tỏa lên **4 tia sáng lăng kính** mờ, mỗi tia lệch sắc hồng, vàng, xanh ngọc.
- **Hoạt ảnh (luôn có):**
  - Một **vệt ánh cầu vồng** quét qua các mặt viên kim cương (8 khung, mỗi 3 giây).
  - Tia sáng nhịp thở.
  - Lấp lánh 4 cánh trên các viên nhỏ.
  - Có chủ: ký tự khắc trên nền **phát sáng lam** và hạt sáng lăng kính bay lên từ hố.
- **Lính canh:** Golem kim cương đứng trước viên đá lớn. Golem chết thì nền đá có vết nứt 30 giây.

| Chất liệu | Màu |
|---|---|
| Kim cương | `#0E2A3A` `#2A6F8F` `#6FD3F0` `#C8F6FF` `#FFFFFF` |
| Ánh lăng kính | `#FF8AD8` `#FFE26A` `#8AFFC1` `#8AB8FF` |
| Đá đền | `#33302A` `#4A4638` `#6E6852` `#9A937A` `#C4BEA3` |
| Rêu, cỏ | `#2E4220` `#3F5A2A` `#5F7F3A` |
| Ký tự sáng | `#6FD3F0` (độ mờ 0% khi trống, 80% khi có chủ) |

## 11.9 Lính canh đứng ở mỏ

Lính canh được vẽ theo bảng màu "phe hoang dã": khăn đỏ đô `#7A1F2A`, da thuộc `#5C3A22`, thép xỉn `#5B6577`. Màu này không trùng màu người chơi nào. Thú hắc ín là khối hắc ín sệt có mắt vàng `#F4C430`, chảy nhỏ giọt khi đi. Tinh linh pha lê dùng đúng bảng màu Pha lê. Golem kim cương có thân đá đền và các khối kim cương ở vai, ngực, nắm đấm.

## 11.10 Viền sở hữu (xanh / đỏ)

Viền phải bám đúng **hình dáng mô hình** (kể cả cột, tháp, tinh thể nhô lên), không vẽ hình chữ nhật hay hình tròn.

Cách làm (dựng sẵn khi tải sprite, mỗi khung một lần):

1. Lấy **mặt nạ** từ kênh alpha của sprite mỏ (pixel nào có alpha > 0 là 1).
2. **Nở mặt nạ** ra 2 px theo 8 hướng (dilate).
3. Lấy phần nở trừ đi mặt nạ gốc. Phần còn lại là vành viền dày 2 px.
4. Tô vành: pixel ngoài cùng màu chính, pixel sát mô hình màu đậm.

| | Màu chính (ngoài) | Màu đậm (trong) | Quầng nền đất |
|---|---|---|---|
| **Của mình** | `#3EE06B` | `#1F7A3A` | Elip `#3EE06B` độ mờ 15% dưới mỏ |
| **Của người khác** | `#FF4A4A` | `#8A1F1F` | Elip `#FF4A4A` độ mờ 15% |
| Rê chuột vào mỏ trống | `#FFFFFF` độ mờ 50%, dày 1 px | — | — |

- **Nhịp:** độ mờ viền dao động 65% → 100% theo sin, chu kỳ 1,6 giây. Đang bị hạ cờ thì chu kỳ còn 0,4 giây.
- Ở mức phóng ×1 viền vẫn dày 2 px màn hình (không mỏng đi). Ở ×3–×4 viền to theo pixel như các pixel khác cho đồng bộ phong cách.
- **Minimap:** mỏ vẽ thành ô vuông 3 px màu tài nguyên, có khung 1 px xanh (của mình), đỏ (người khác) hoặc xám (trống).

## 11.11 Vòng chiếm và thanh tiến độ

- **Vòng chiếm:** đường tròn nét đứt (4 px nét, 4 px trống) bán kính 2,5 ô (Kim cương 3 ô), màu trắng độ mờ 60%. Nét đứt chạy chậm theo chiều kim đồng hồ.
- **Thanh tiến độ:** cung tròn dày 3 px ngay ngoài vòng chiếm, bắt đầu từ đỉnh trên, chạy **theo chiều kim đồng hồ**. Màu xanh khi mình đang chiếm, đỏ khi người khác đang chiếm mỏ của mình.
- Cướp mỏ có chủ: nửa đầu cung là "hạ cờ" (cung màu xám, cờ trên mỏ hạ dần), nửa sau là "cắm cờ" (cung màu người chiếm, cờ mới kéo lên).
- Chiếm xong: vòng nổ thành 12 hạt sáng màu viền mới, kêu "keng".

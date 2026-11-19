# 27. Thành trì cấp 6–8, công trình thủ thành mới, Vua Thành và Nữ hoàng Băng (đề xuất 16/11/2026)

Trạng thái: **đề xuất, chưa code**. Số liệu là điểm xuất phát, chỉnh lại sau mô phỏng (như docs/design/26).

## 1. Tóm tắt

- Thành trì lên tối đa **cấp 8** (hiện 5).
- Công trình đánh / giữ nhà cũ (Tháp cung, Pháo đá, Tháp phép, Tường, Kho, Hội thành, Doanh trại) lên tới cấp 8, theo luật cũ: không vượt cấp Thành trì. Học viện, Rương đồ, Lò nghiền, Lò rèn, Nhà thợ xây, bẫy giữ tối đa cấp 5.
- 6 công trình thủ thành mới, mỗi cái **3 cấp**:

| Mở ở | Công trình | Vai trò |
|---|---|---|
| TH6 | Cối pháo `coi-phao` (3×3) | Pháo vồng tầm 11, nổ vùng to, vùng chết 4 ô, không bắn quân bay |
| TH6 | Tháp phòng không `phong-khong` (3×3) | Chỉ bắn quân bay, sát thương rất cao |
| TH7 | Nỏ Thần `no-than` (3×3) | Nỏ liên thanh 4 mũi/giây, tầm 12, bắn bộ + bay |
| TH7 | Cột sét ẩn `cot-set` (2×2) | Ẩn như bẫy, trồi lên khi địch tới 6 ô, sét lan 2 mục tiêu |
| TH8 | Pháo chùm `phao-chum` (3×3) | Bình nổ vỡ thành chùm mảnh hình nón ra sau mục tiêu |
| TH8 | Tháp Hỏa Ngục `hoa-nguc` (2×2) | Tia lửa 1 mục tiêu, bám càng lâu càng đau (khắc tướng, boss) |

- 2 tướng giữ nhà (khác hẳn Nhà vua phía Bắc / Nữ hoàng Sa mạc trên bản đồ thế giới):
  - **Vua Thành** (TH6), đứng trên **Bệ Vua**: cận chiến, máu rất trâu, chiêu Nộ Vương (choáng vùng + hồi máu).
  - **Nữ hoàng Băng** (TH8), đứng trên **Bệ Nữ hoàng**: nỏ băng tầm xa làm chậm, chiêu Bão Tuyết (tàng hình + mũi băng xuyên).
  - Chỉ giữ nhà, không theo tướng đi đánh. Địch vào vùng canh thì xông ra, hết địch thì về bệ. Bị hạ thì nằm hồi máu trên bệ 10 phút (không mất).
  - Lên cấp tướng (1–20) bằng vàng + kim cương ở bệ, mỗi lần nâng tốn 1 thợ xây; tướng đang nâng cấp thì không ra đánh. Tối đa: TH6 → Vua 10; TH7 → Vua 15; TH8 → Vua 20, Nữ hoàng 10.

## 2. Thành trì cấp 6–8

| | TH5 (hiện tại) | TH6 | TH7 | TH8 |
|---|---|---|---|---|
| Máu | 10 500 | 13 500 | 17 000 | 21 000 |
| Giá | 3 600 sắt, 1 600 than, 1 500 vàng, 250 hắc ín, 120 pha lê, 25 kim cương | 5 500 / 2 500 / 2 500 / 400 / 220 / 50 | 8 000 / 3 600 / 3 800 / 600 / 350 / 90 | 11 000 / 5 000 / 5 500 / 900 / 500 / 150 |
| Thời gian (gốc, chưa ×2) | 5 400 s | 7 200 s | 10 800 s | 14 400 s |
| Sức chứa (×STORE_MULT) | 7 | 9 | 11,5 | 14 |

Số lượng tối đa mỗi loại:

| Công trình | TH5 | TH6 | TH7 | TH8 |
|---|---|---|---|---|
| Tháp cung | 6 | 7 | 7 | 8 |
| Pháo đá | 4 | 5 | 5 | 6 |
| Tháp phép | 3 | 4 | 4 | 5 |
| Tường | 300 | 350 | 400 | 450 |
| Bom / Lò xo / Bom khí | 6 / 3 / 3 | 7 / 3 / 4 | 8 / 4 / 4 | 8 / 4 / 5 |
| Kho | 3 | 3 | 4 | 4 |
| Doanh trại | 3 | 4 | 4 | 5 |
| Cối pháo | – | 1 | 2 | 2 |
| Tháp phòng không | – | 1 | 2 | 2 |
| Nỏ Thần | – | – | 1 | 2 |
| Cột sét ẩn | – | – | 2 | 3 |
| Pháo chùm | – | – | – | 1 |
| Tháp Hỏa Ngục | – | – | – | 1 |
| Bệ Vua / Bệ Nữ hoàng | – | 1 / – | 1 / – | 1 / 1 |

Cấp tối đa của công trình mới: cấp 2 ở Thành trì vừa mở nó, cấp 3 từ Thành trì kế tiếp (có cái nâng ngay khi vừa mở). Ví dụ Cối pháo: TH6 → 2, TH7 → 3. Pháo chùm / Hỏa Ngục (mở ở TH8) dừng ở cấp 2 cho tới khi có TH9.

## 3. Chỉ số công trình mới (cấp 1; mỗi cấp sau ×1,25 máu và sát thương)

| | Máu | Giáp | Sát thương | Hồi | Tầm | Đặc biệt |
|---|---|---|---|---|---|---|
| Cối pháo | 1 800 | 0,2 | 90 | 5 s | 4–11 | nổ vùng 1,8 ô, không bắn bay |
| Tháp phòng không | 1 600 | 0,2 | 160 | 1 s | 10 | chỉ bắn bay |
| Nỏ Thần | 2 500 | 0,3 | 22 | 0,25 s | 12 | bộ + bay |
| Cột sét ẩn | 900 | 0,1 | 80 | 1,6 s | 7 | ẩn tới khi địch vào 6 ô, lan 2 mục tiêu |
| Pháo chùm | 3 000 | 0,3 | 120 + mảnh 60 | 4 s | 3–10 | mảnh hình nón 4 ô sau mục tiêu |
| Tháp Hỏa Ngục | 2 200 | 0,25 | 20 → 200 /s | liên tục | 8 | sát thương ×10 sau 4 s bám 1 mục tiêu |

Cân bằng giữ mục tiêu của docs/design/26: quân tối đa của TH X thắng căn cứ tối đa TH X khoảng 75–90 %. Cần chạy lại mô phỏng sau khi có số.

## 4. Hình vẽ cần làm (prompts)

Công trình mới (`docs/design/samples/buildings/prompts/`):
- `15-coi-phao.md`, `16-phong-khong.md`, `17-no-than.md`, `18-cot-set.md`, `19-phao-chum.md`, `20-thap-hoa-nguc.md`: 3 cấp + đổ nát (Cột sét thêm hình "ẩn").
- `21-be-vua.md`, `22-be-nu-hoang.md`: bệ + đổ nát.
- `23-len-cap-6-8.md`: sheet thêm cấp 6–8 cho Thành trì, Tháp cung, Pháo đá, Tháp phép, Kho, Hội thành, Doanh trại, Tường.

Tướng (`docs/design/samples/army/prompts/`): `16-vua-thanh.md`, `17-nu-hoang-bang.md` (sheet 8 hướng × 6 tư thế; hoạt ảnh nhiều khung gửi sau).

Chất liệu: công trình mới cấp 1–3 = thép xanh đen → đá vỏ chai + pha lê tím → cẩm thạch + vàng + pha lê xanh trời (đã vẽ xong). Công trình cũ cấp 6–8 theo hệ (16/11/2026, yêu cầu chủ game): **cấp 6 nước** (đá xanh ngọc, xà cừ, san hô, thác nước), **cấp 7 dung nham** (đá bazan đen, khe dung nham cam đỏ), **cấp 8 sấm sét** (thép xám bão, pha lê vàng điện, tia sét). Màu khác hẳn cấp 1–5, dáng đồ sộ hơn (cao tới ~30% so với cấp 5, cùng chân đế).

## 5. Thứ tự làm đề xuất

1. Code TH6–8 + số lượng + cấp 6–8 công trình cũ (tạm dùng hình cấp 5 tô màu khác cho tới khi có hình).
2. Cối pháo, Phòng không, Vua Thành (TH6).
3. Nỏ Thần, Cột sét (TH7).
4. Pháo chùm, Hỏa Ngục, Nữ hoàng Băng (TH8).
5. Mô phỏng cân bằng công / thủ cho TH6–8, chỉnh số.

## 6. Lính: cấp 6–8 và 3 lính mới (16/11/2026)

### Cấp lính
Lính lên tối đa **cấp 8** (hiện 5), vẫn nghiên cứu ở Học viện (Học viện giữ cấp 5, mở cấp lính theo Thành trì). Hệ số máu / sát thương mỗi cấp: `UNIT_LV_MULT` thêm 1,75 / 1,9 / 2,05. Thời gian nghiên cứu cấp 6 / 7 / 8: 6 / 9 / 12 giờ.

| Lính | TH1–5 (hiện tại) | TH6 | TH7 | TH8 |
|---|---|---|---|---|
| Dân quân, Kiếm sĩ, Lính giáo, Cung thủ | 2 · 3 · 4 · 5 · 5 | 6 | 7 | 8 |
| Kỵ binh | 1 · 2 · 3 · 4 · 5 | 6 | 7 | 8 |
| Hiệp sĩ | 1 · 2 · 3 · 3 · 4 | 5 | 6 | 7 |
| Pháp sư | 0 · 1 · 2 · 3 · 4 | 5 | 6 | 7 |
| Máy bắn đá lửa | 0 · 0 · 1 · 2 · 3 | 4 | 5 | 6 |
| Sư thứu | 0 · 0 · 0 · 1 · 2 | 3 | 4 | 5 |
| Rồng | 0 · 0 · 0 · 0 · 2 | 3 | 4 | 5 |
| **Công binh** (mới) | – | 2 | 3 | 4 |
| **Y sư** (mới) | – | – | 2 | 3 |
| **Voi chiến** (mới) | – | – | – | 2 |

Doanh trại (chỗ ở) tăng theo: cấp 6 / 7 / 8 = 550 / 700 / 900 chỗ mỗi doanh trại.

### 3 lính mới

| | Mở | Chỗ ở | Máu | Giáp | Sát thương | Tầm | Tốc độ | Vai trò |
|---|---|---|---|---|---|---|---|---|
| Công binh `cong-binh` | TH6 | 2 | 90 | 0 | 300 một lần (nổ 1,5 ô, ×4 tường, ×2 công trình) | 0,8 | 2,6 | Lao vào tường gần nhất rồi tự nổ, mở đường |
| Y sư `y-su` | TH7 | 5 | 260 | 0,1 | hồi 18 máu/giây cho 3 lính yếu nhất trong 5 ô (tướng ½) | 5 | 2,0 | Không đánh, giữ quân sống trong trận dài |
| Voi chiến `voi-chien` | TH8 | 10 | 3 200 | 0,35 | 70 giẫm vùng 1,2 ô (×2 công trình) + tên 15 tầm 5 | 1,2 | 1,6 | Xe tăng phá nhà, chậm |

Giá đề xuất: Công binh 120 sắt, 60 than, 20 dầu · Y sư 150 vàng, 30 pha lê · Voi chiến 600 sắt, 300 vàng, 100 dầu, 15 kim cương.

Prompts: `docs/design/samples/army/prompts/18-cong-binh.md`, `19-y-su.md`, `20-voi-chien.md` (sheet 8 hướng × 6 tư thế; hoạt ảnh nhiều khung gửi sau khi duyệt).

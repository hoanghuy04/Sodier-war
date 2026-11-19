# Mẫu vẽ quái ở bãi quái (cấp 1–10)

Prompt "bước 1" cho từng loài, cùng phong cách với quân (`../army/`). Mỗi loài **1 ảnh**: 8 cột hướng × 5 hàng tư thế (Đứng, Đi, Đánh, Trúng đòn, Chết). Không có hàng "Chiến thắng" như quân vì quái không ăn mừng.

| Tệp prompt | Cấp bãi | Quái | Ô | Ảnh cần lưu |
|---|---|---|---|---|
| [prompts/01-chuot-khong-lo.md](prompts/01-chuot-khong-lo.md) | 1 | Chuột khổng lồ (Giant rat) | 128×128 | `sprite-pixels/chuot-khong-lo.png` |
| [prompts/02-soi-xam.md](prompts/02-soi-xam.md) | 2 | Sói xám (Grey wolf) | 128×128 | `sprite-pixels/soi-xam.png` |
| [prompts/03-goblin.md](prompts/03-goblin.md) | 3 | Goblin | 128×128 | `sprite-pixels/goblin.png` |
| [prompts/03b-goblin-cung.md](prompts/03b-goblin-cung.md) | 3 | Goblin cung (Goblin archer) | 128×128 | `sprite-pixels/goblin-cung.png` |
| [prompts/04-nhen-doc.md](prompts/04-nhen-doc.md) | 4 | Nhện độc (Poison spider) | 128×128 | `sprite-pixels/nhen-doc.png` |
| [prompts/05-gau-nau.md](prompts/05-gau-nau.md) | 5 | Gấu nâu (Brown bear) | 160×160 | `sprite-pixels/gau-nau.png` |
| [prompts/06-orc.md](prompts/06-orc.md) | 6 | Orc chiến binh (Orc warrior) | 160×160 | `sprite-pixels/orc.png` |
| [prompts/07-troll.md](prompts/07-troll.md) | 7 | Troll đá (Stone troll) | 192×192 | `sprite-pixels/troll.png` |
| [prompts/08-minotaur.md](prompts/08-minotaur.md) | 8 | Minotaur | 192×192 | `sprite-pixels/minotaur.png` |
| [prompts/09-wyvern.md](prompts/09-wyvern.md) | 9 | Wyvern | 192×192 | `sprite-pixels/wyvern.png` |
| [prompts/10-rong-co-dai.md](prompts/10-rong-co-dai.md) | 10 | Rồng cổ đại (Ancient dragon) | 256×256 | `sprite-pixels/rong-co-dai.png` |

Gửi ảnh dạng **File** (PNG gốc) để nét nhất. Nhập vào game: `node tools/spriteimport/import.mjs <ảnh> <mã quái> idle,walk,attack,hit,death --no-team` (mình làm khi bạn gửi ảnh).

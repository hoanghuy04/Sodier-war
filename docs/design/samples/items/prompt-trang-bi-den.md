# Mẫu vẽ 8 icon trang bị phẩm chất ĐEN (cấp cuối, sau Đỏ) — 12/11/2026

1 hàng × 8 cột (đúng thứ tự cột của game). Chủ đề **Hắc Long Hư Không**: kim loại đen tuyền, viền bạc, vết nứt rune phát sáng trắng xanh, lửa đen lõi trắng.
Vẽ **1 ảnh** 8 cột × 1 hàng.

**Gửi kèm:** `sprite-pixels/trang-bi.png` và `sprite-pixels/trang-bi-2.png` (2 bộ icon cũ), để giữ nét và cỡ.
Lưu thành `items/sprite-pixels/trang-bi-den.png`.

| Cột | Ô | Tên |
|---|---|---|
| 1 | Vũ khí | Kiếm Hắc Long |
| 2 | Mũ | Mũ Hắc Long |
| 3 | Giáp | Giáp Hắc Long |
| 4 | Giày | Hài Hắc Long |
| 5 | Nhẫn | Nhẫn Hắc Long |
| 6 | Bùa | Bùa Hắc Long |
| 7 | Khiên | Khiên Hắc Long |
| 8 | Găng tay | Găng Hắc Long |

```text
Pixel art icon sheet of 8 RPG equipment items of the ultimate "BLACK" rarity (above the blood-red Mythic tier), 8 columns × 1 row, one item per cell, each item seen at a 3/4 angle like an inventory icon. It must match the attached icon sheets exactly (same pixel size, outline, shading, light direction and item shapes per slot), but this is the most powerful, most epic and most menacing set in the game.

THEME "Void Black Dragon": pitch-black obsidian and void metal with mirror-like silver-white edges, a black dragon motif on every piece (horns, scales, fangs, wings), cracks and runes glowing in ghost-white and pale icy-violet (solid bright pixels, no soft glow), small black flames with white-hot cores, floating shards of black crystal. Big, sharp, heavy silhouettes that read clearly on a dark background.

Columns (equipment slot, same order and shape as the reference sheets):
Column 1 "Void Dragon Sword": a huge jagged black greatsword with a dragon-skull guard, a glowing white rune line along the blade.
Column 2 "Void Dragon Helm": a horned black dragon-head helm with glowing white eye slits and a crown of black spikes.
Column 3 "Void Dragon Armour": a black dragon-scale chest plate with folded wing pauldrons and a glowing white rune core in the centre.
Column 4 "Void Dragon Greaves": armoured black boots with dragon claws at the toes and small bone wings at the ankles.
Column 5 "Void Dragon Ring": a black ring shaped like a dragon biting its tail, holding a white-violet void gem.
Column 6 "Void Dragon Amulet": a black dragon-claw pendant gripping a glowing white-violet void orb, on a black chain.
Column 7 "Void Dragon Shield": a black tower shield with a roaring dragon head relief, silver rim, glowing white eyes and rune cracks.
Column 8 "Void Dragon Gauntlet": a black dragon-claw gauntlet with long silver talons, a void gem on the back of the hand, small black flames.

STYLE (match the attached reference sheets): chunky pixel art, crisp 1-pixel outline (#1b1726, use a 1-pixel silver-grey rim inside it on the black metal so the black items stay readable), 4-5 tone shading on the black metal (from #0e0c14 to steel grey), light from the top-left, bright white specular pixels on metal and gems. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the item.

CELLS & BACKGROUND: every cell exactly 128×128 px, each item centred and filling about 80% of its cell, the same scale as the same slot in the reference sheets. Background: one flat solid pure magenta #FF00FF everywhere; the item edge touches magenta directly. No frame, no rarity border, no glow, no grid lines, no text, no labels, no numbers.
```

## Cơ chế dự kiến (làm khi có ảnh)

- Phẩm chất thứ 8 **Đen** (`black`), chỉ số chính = Đỏ × 1.45 (giống bước Cam → Đỏ), 4 dòng phụ.
- Chỉ có từ **Lò rèn** (Đỏ → Đen). Không rơi từ quái; boss thế giới rơi rất hiếm (0,5%).
- Rèn Đỏ → Đen: 4 Bột Huyết Long, 6.000 vàng, 600 pha lê, 100 kim cương, Lò rèn cấp 5 (nghiền đồ Đen ra Bột Hư Không).
  Tỉ lệ **5%**, không cộng thêm theo cấp lò.
  Thất bại thì mất nguyên liệu, đồ Đỏ còn nguyên.
- Màu chữ / viền: đen ánh bạc (viền ô đen có ánh trắng nhấp nháy nhẹ).

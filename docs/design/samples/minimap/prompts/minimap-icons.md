# Icon bản đồ nhỏ: Nhà vua, Nữ hoàng, Cổng Địa Ngục (16/11/2026)

Sheet `minimap-icons` · 3 cột × 1 hàng · ô 64×64 px. Game thu nhỏ còn khoảng 18–24 px trên bản đồ nhỏ, nên hình phải rất đậm, ít chi tiết, đọc được khi nhỏ.

| Cột | Icon |
|---|---|
| 1 | Nhà vua phía Bắc |
| 2 | Nữ hoàng Sa mạc |
| 3 | Cổng Địa Ngục |

**Gửi kèm:** `docs/design/samples/army/sprite-pixels/kiem-si.png` + ảnh `icon-ky-nang` đã vẽ (để cùng nét). Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/minimap-icons.png`

```text
Pixel art MAP MARKER ICON SET for the minimap of a top-down RPG/RTS: 3 columns × 1 row, one bold marker per cell, read left → right. Each marker is a simple, chunky, instantly readable symbol inside a small round badge with a thick dark outline, so it still reads when shrunk to 20 px:
1 "Northern King": a gold royal crown with three points and a blue gem, on a round badge of icy blue-white with a gold rim, a tiny snowflake sparkle.
2 "Desert Queen": a terracotta-and-cream tribal tipi tent with a small feather on top, on a round badge of warm sand orange with a red-brown rim.
3 "Hell Gate": a dark obsidian arch with a glowing crimson-orange swirling portal inside and two small horns on top, on a round badge of dark red with an orange fiery rim.

STYLE: chunky pixel art icons matching the attached reference sprite and icon sheet: same palette richness, crisp 1-pixel dark navy outline (#1b1726) around every badge, 3-4 tone shading, light from the top-left, saturated colours, very few details (they are shown tiny). Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO soft glow, NO gradient outside the badge. Never use pink or magenta inside an icon.

CELLS & BACKGROUND: 3 columns × 1 row, every cell exactly 64×64 px, each badge centred and filling about 85% of the cell. Background: one flat solid pure magenta #FF00FF everywhere; the badge edge touches magenta directly. No text, no letters, no numbers, no grid lines, no border.
```

Cách gắn vào game: thay 2 icon vẽ bằng code của Nhà vua / Nữ hoàng trên bản đồ nhỏ và thêm icon Cổng Địa Ngục; bấm vào icon thì camera nhảy tới.

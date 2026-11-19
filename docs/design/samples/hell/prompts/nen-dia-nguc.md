# Nền đấu trường Địa Ngục (mẫu chất liệu + dung nham chảy)

Sheet `nen-dia-nguc` · 8 cột × 3 hàng · ô 128×128 px.

Nền map trong game do trình vẽ map (`tools/mapgen/scene.mjs`, 16 px/ô) vẽ. Sheet này là **mẫu màu và chất liệu** để chỉnh trình vẽ cho quần xã Địa Ngục, và hàng 2 (dung nham chảy) có thể dùng thẳng làm lớp dung nham động.

**Gửi kèm:** `docs/design/samples/army/sprite-pixels/kiem-si.png`. Gửi lại dạng **File PNG**.

Lưu thành `sprite-pixels/nen-dia-nguc.png`

```text
Pixel art GROUND TEXTURE sheet for a hell dungeon map of a top-down RPG/RTS: 8 columns × 3 rows of square ground swatches.
Row 1 (seamless ground textures, each must tile seamlessly with itself on all four sides): 1 "Basalt": dark brown-black volcanic rock ground with small pores. 2 "Crimson rock": deep red rocky ground with darker cracks. 3 "Obsidian": glossy black-violet glassy rock with sharp light glints. 4 "Ash": soft grey ash ground with a few small embers. 5 "Bone field": ash ground scattered with small white bones and a tiny skull. 6 "Lava-veined crust": black crust with thin glowing orange lava veins. 7 "Scorched ground": black-brown burnt ground with orange heat cracks near lava. 8 "Prison slabs": cracked dark stone floor slabs with rusty stains.
Row 2 "Flowing lava", 8 frames of ONE seamless lava surface, a looping animation left → right: bright orange and yellow molten lava with darker red flow lines and floating black crust flakes slowly moving, white-yellow hot spots; frame 8 must flow back into frame 1, and every frame must tile seamlessly.
Row 3 (edges and special floors): 1 "Lava shore, straight": rock in the top half, lava in the bottom half, a jagged glowing shoreline across the middle. 2 "Lava shore, outer corner". 3 "Lava shore, inner corner". 4 "Cliff face": the front face of a dark basalt cliff wall, vertical cracks. 5 "Cliff top edge": the top rim of the cliff seen from above with a dark drop below. 6 "Small lava pool": a round lava pool with a rocky rim on basalt ground. 7 "Altar floor": dark stone floor carved with a ring of abstract glowing red runes. 8 "Bone bridge": planks made of large bones tied with chains, seen from above, running left-right.

STYLE: pixel art ground tiles in the same palette richness as the attached reference sprite, seen straight from above (flat, no perspective on floors), 3-4 tone shading, light from the top-left, crisp pixels. NO dark outline on ground textures (outlines are only for standing objects). Glowing lava is drawn as hard-edged bands of 2-3 bright tones (white-yellow core → orange → deep red), never as a soft glow. Strict pixel grid, every pixel square and sharp: NO blur, NO anti-aliasing, NO gradient smoothing. Never use pink or magenta inside a tile.

CELLS: 8 columns × 3 rows, every cell exactly 128×128 px and completely filled by its texture; cells touch edge to edge on an exact 128 px grid, no gaps. This is the only sheet WITHOUT a magenta background: no magenta anywhere. No text, no labels, no numbers, no grid lines, no border.
```

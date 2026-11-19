// Minimap markers (docs/design/samples/minimap/prompts/minimap-icons.md, 16/11/2026): King, Queen, Hell Gate → client/assets/ui/minimap-icons.png (3 × 32 px)
import { Px, savePng } from '../mapgen/core.mjs';
import { loadImage, keyMagenta, shrinkBox, boxOf, closeBrowser } from './key.mjs';
const ROOT = new URL('../../', import.meta.url).pathname, S = 32;
const img = await loadImage(ROOT + 'docs/design/samples/minimap/sprite-pixels/minimap-icons.jpg');
const { mask } = keyMagenta(img, { pocket: 15 });
const out = new Px(S * 3, S), CW = Math.floor(img.w / 3);
for (let k = 0; k < 3; k++) {
  const box = boxOf(mask, img.w, k * CW, (k + 1) * CW - 1, 0, img.h - 1);
  const sz = Math.max(box[2] - box[0] + 1, box[3] - box[1] + 1), p = shrinkBox(img, mask, box, (S - 2) / sz);
  const ox = k * S + Math.floor((S - p.w) / 2), oy = Math.floor((S - p.h) / 2);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const v = p.d[y * p.w + x]; if ((v & 255) > 0) out.d[(y + oy) * out.w + x + ox] = v; }
}
savePng(out, ROOT + 'client/assets/ui/minimap-icons.png');
await closeBrowser();
console.log('saved client/assets/ui/minimap-icons.png');

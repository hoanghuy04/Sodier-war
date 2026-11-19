// one building picture → a 3-cell row (the same picture for levels 6, 7, 8) for buildlv.mjs: node tile3.mjs <in.jpg|png> <out.png>
import { Px, savePng } from '../mapgen/core.mjs';
import { loadImage, closeBrowser } from './key.mjs';
const [, , src, dst] = process.argv;
const img = await loadImage(src); await closeBrowser();
const o = new Px(img.w * 3, img.h);
for (let k = 0; k < 3; k++) for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) o.d[y * o.w + k * img.w + x] = img.d[y * img.w + x];
savePng(o, dst); console.log('tripled', src, '→', dst, o.w + '×' + o.h);

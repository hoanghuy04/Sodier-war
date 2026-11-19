// Convert JPG files (e.g. Telegram photos) to PNG using headless Chromium: node tools/spriteimport/jpg2png.mjs in.jpg out.png [in2.jpg out2.png …]
import fs from 'node:fs';
import { Px, savePng } from '../mapgen/core.mjs';
const { chromium } = await import('/home/huy/Main/unisage-web/node_modules/.pnpm/playwright-core@1.62.1/node_modules/playwright-core/index.mjs');
const b = await chromium.launch(), pg = await b.newPage();
const args = process.argv.slice(2);
for (let i = 0; i + 1 < args.length; i += 2) {
  const r = await pg.evaluate(async (src) => {
    const im = new Image(); im.src = src; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    return { w: im.width, h: im.height, d: Array.from(x.getImageData(0, 0, im.width, im.height).data) };
  }, 'data:image/jpeg;base64,' + fs.readFileSync(args[i]).toString('base64'));
  const px = new Px(r.w, r.h);
  for (let k = 0; k < r.w * r.h; k++) px.d[k] = ((r.d[k * 4] << 24) | (r.d[k * 4 + 1] << 16) | (r.d[k * 4 + 2] << 8) | 255) >>> 0;
  savePng(px, args[i + 1]);
  console.log(args[i + 1], r.w + '×' + r.h);
}
await b.close();

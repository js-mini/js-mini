const sharp = require('sharp');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../public/logo.png');

async function generateIcons() {
  // 512x512 maskable
  await sharp(LOGO_PATH)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('./public/icon512_maskable.png');

  // 512x512 rounded (any)
  await sharp(LOGO_PATH)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('./public/icon512_rounded.png');

  // 192x192
  await sharp(LOGO_PATH)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('./public/icon-192x192.png');

  // 512x512 standard
  await sharp(LOGO_PATH)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('./public/icon-512x512.png');

  console.log('Icons generated successfully from original logo.png!');
}

generateIcons().catch(console.error);

const fs = require('fs');
const sharp = require('sharp');

const svgText = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#111111;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="128" fill="url(#grad1)"/>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="#F3B820" text-anchor="middle" alignment-baseline="middle">J</text>
  <text x="50%" y="85%" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="#F3B820" text-anchor="middle" alignment-baseline="middle">SHOT</text>
</svg>
`;

async function generateIcons() {
    const buffer = Buffer.from(svgText);

    // 512x512
    await sharp(buffer)
        .resize(512, 512)
        .png()
        .toFile('./public/icon512_maskable.png');

    await sharp(buffer)
        .resize(512, 512)
        .png()
        .toFile('./public/icon512_rounded.png');

    // 192x192
    await sharp(buffer)
        .resize(192, 192)
        .png()
        .toFile('./public/icon-192x192.png');

    // 512x512 standard
    await sharp(buffer)
        .resize(512, 512)
        .png()
        .toFile('./public/icon-512x512.png');

    console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);

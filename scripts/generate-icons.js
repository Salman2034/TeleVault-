import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, colorR, colorG, colorB) {
  // Simple valid PNG generator without native dependencies
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with scanlines
  const rawRows = [];
  const cx = width / 2;
  const cy = height / 2;
  const rMax = Math.min(width, height) / 2;

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const offset = 1 + x * 4;
      const dx = (x - cx) / rMax;
      const dy = (y - cy) / rMax;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gradient background from sky-600 (#0284c7) to slate-900 (#0f172a)
      const grad = y / height;
      let r = Math.round(2 * (1 - grad) + 15 * grad);
      let g = Math.round(132 * (1 - grad) + 23 * grad);
      let b = Math.round(199 * (1 - grad) + 42 * grad);

      // Draw central shield / airplane white icon silhouette
      if (dist < 0.65) {
        // Inner icon shape
        const innerDx = (x - cx) / (rMax * 0.5);
        const innerDy = (y - cy) / (rMax * 0.5);
        if (Math.abs(innerDx) + Math.abs(innerDy) < 0.8) {
          r = Math.min(255, r + 180);
          g = Math.min(255, g + 210);
          b = 255;
        }
      }

      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = 255; // Alpha
    }
    rawRows.push(row);
  }

  const rawBuffer = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawBuffer);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(8 + length + 4);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);

  const crc = crc32(buffer.subarray(4, 8 + length));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

// Simple CRC32 implementation
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, 2, 132, 199));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, 2, 132, 199));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, 3, 105, 161));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, 2, 132, 199));
fs.writeFileSync('public/favicon.ico', createPng(64, 64, 2, 132, 199));

console.log('PWA icons created successfully in /public!');

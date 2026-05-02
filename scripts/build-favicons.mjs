// build-favicons.mjs — generate the full favicon / app-icon set from
// the canonical favicon.svg.
//
// Output:
//   public/favicons/favicon-16.png             — legacy browser tab
//   public/favicons/favicon-32.png             — most-used browser tab
//   public/favicons/apple-touch-icon.png       — 180×180, iOS home screen
//   public/favicons/icon-192.png               — 192×192, Android Chrome
//   public/favicons/icon-512.png               — 512×512, PWA standard
//   public/favicons/icon-512-maskable.png      — 512×512 with safe-zone
//                                                 padding (Android adaptive)
//
// The maskable icon expects content within an 80% center safe area;
// Android crops the corners into circles / squircles depending on the
// launcher. We add a 12% padding ring around the existing artwork so
// crops never bite into the "MR." mark.
//
// Re-run any time public/favicon.svg changes:
//   npm run build:favicons

import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const SRC = resolve(root, 'public/favicon.svg');
const OUT = resolve(root, 'public/favicons');

const variants = [
  { name: 'favicon-16.png',         size: 16,  pad: 0    },
  { name: 'favicon-32.png',         size: 32,  pad: 0    },
  { name: 'apple-touch-icon.png',   size: 180, pad: 0    },
  { name: 'icon-192.png',           size: 192, pad: 0    },
  { name: 'icon-512.png',           size: 512, pad: 0    },
  { name: 'icon-512-maskable.png',  size: 512, pad: 0.12 },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const svg = await readFile(SRC);

  for (const v of variants) {
    const inner = Math.round(v.size * (1 - v.pad * 2));
    // Render the SVG at the inner size, then place it centered on a
    // solid-colour canvas of the full target size. That gives us the
    // safe-zone padding for the maskable variant without distorting
    // the artwork. The non-maskable variants set pad: 0, so inner ===
    // size and the composite is just a passthrough.
    const inner_png = await sharp(svg, { density: 384 })
      .resize(inner, inner, { fit: 'contain', background: { r: 5, g: 5, b: 6, alpha: 1 } })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: v.size,
        height: v.size,
        channels: 4,
        background: { r: 5, g: 5, b: 6, alpha: 1 },
      },
    })
      .composite([{ input: inner_png, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(resolve(OUT, v.name));

    console.log(`✓ favicons/${v.name} — ${v.size}×${v.size}${v.pad ? ` (maskable, ${(v.pad * 200).toFixed(0)}% padding)` : ''}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

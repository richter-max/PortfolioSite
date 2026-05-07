#!/usr/bin/env node
// optimize-images.mjs
// Reads assets-src/img/*.{jpg,jpeg,png} (masters live outside `public/`
// so they aren't shipped to visitors) and emits responsive AVIF + WebP
// + JPG fallbacks into public/img/opt/.
// Usage: node scripts/optimize-images.mjs

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(process.cwd(), 'assets-src/img');
const OUT  = path.resolve(process.cwd(), 'public/img/opt');

const WIDTHS = [640, 1280, 1920, 2560];
const AVIF_QUALITY = 50;
const WEBP_QUALITY = 72;
const JPG_QUALITY = 78;

async function listSources() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((n) => /\.(jpe?g|png)$/i.test(n));
}

async function processOne(file) {
  const input = path.join(ROOT, file);
  const base = file.replace(/\.(jpe?g|png)$/i, '');

  // Read meta with rotation already applied so width/height reflect
  // what we'll actually output. iPhone portraits arrive with an EXIF
  // orientation flag and would otherwise report the storage dims —
  // misleading for the WIDTHS filter below.
  const meta = await sharp(input, { failOn: 'none' }).rotate().metadata();
  const maxW = meta.width ?? 1920;

  const widths = WIDTHS.filter((w) => w <= maxW);
  if (widths.length === 0) widths.push(maxW);

  const tasks = [];
  for (const w of widths) {
    // .rotate() with no args bakes EXIF orientation into the output
    // pixels. Browsers vary on how they honour the EXIF tag for
    // <img>; baking it removes the ambiguity and keeps the same
    // pixel data on every device.
    const pipeline = () => sharp(input, { failOn: 'none' }).rotate().resize({ width: w, withoutEnlargement: true });
    tasks.push(
      pipeline().avif({ quality: AVIF_QUALITY, effort: 6 }).toFile(path.join(OUT, `${base}-${w}.avif`)),
      pipeline().webp({ quality: WEBP_QUALITY, effort: 5 }).toFile(path.join(OUT, `${base}-${w}.webp`)),
      pipeline().jpeg({ quality: JPG_QUALITY, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${base}-${w}.jpg`)),
    );
  }
  await Promise.all(tasks);
  return { file, widths };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const files = await listSources();
  console.log(`Optimizing ${files.length} images → ${path.relative(process.cwd(), OUT)}`);

  const results = [];
  for (const f of files) {
    const start = Date.now();
    const r = await processOne(f);
    results.push(r);
    console.log(`  ✓ ${f}  (${r.widths.join(',')})  ${Date.now() - start}ms`);
  }
  console.log(`Done. ${results.length} sources processed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
// optimize-glb.mjs
// Compresses public/models/richter.glb → richter.opt.glb using Meshopt
// and resamples textures to WebP. The original file is left untouched.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  prune,
  weld,
  resample,
  textureCompress,
  draco,
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';

const IN = path.resolve(process.cwd(), 'public/models/richter.glb');
const OUT = path.resolve(process.cwd(), 'public/models/richter.opt.glb');

async function main() {
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });
  const doc = await io.read(IN);

  console.log('Applying transforms: dedup, prune, weld, resample, textureCompress, draco');
  await doc.transform(
    dedup(),
    prune(),
    weld(),
    resample(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [2048, 2048] }),
    draco(),
  );

  await io.write(OUT, doc);
  const inSize = (await fs.stat(IN)).size;
  const outSize = (await fs.stat(OUT)).size;
  const pct = (100 * (1 - outSize / inSize)).toFixed(1);
  console.log(`richter.glb     ${(inSize / 1048576).toFixed(2)} MB`);
  console.log(`richter.opt.glb ${(outSize / 1048576).toFixed(2)} MB  (-${pct}%)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

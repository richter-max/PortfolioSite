#!/usr/bin/env node
// optimize-glb.mjs
// Compresses assets-src/models/richter.glb → public/models/richter.opt.glb
// (Draco geometry compression). The 55 MB master lives outside `public/`
// so it isn't shipped to visitors; only the ~6 MB optimized output is
// served.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup,
  prune,
  weld,
  resample,
  draco,
} from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

const IN  = path.resolve(process.cwd(), 'assets-src/models/richter.glb');
const OUT = path.resolve(process.cwd(), 'public/models/richter.opt.glb');

async function main() {
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });
  const doc = await io.read(IN);

  // Geometry-only compression. Textures are passed through unchanged so
  // baseColor sRGB profiles, alpha, and exact pixel values are preserved
  // (re-encoding to WebP via sharp shifted colors visibly on the runner).
  console.log('Applying transforms: dedup, prune, weld, resample, draco (geometry only)');
  await doc.transform(
    dedup(),
    prune(),
    weld(),
    resample(),
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

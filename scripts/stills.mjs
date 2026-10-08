// Render half-res preview stills of chosen frames with a single bundle.
// usage: node scripts/stills.mjs <outdir> frame1 frame2 ...
// Set REMOTION_BROWSER to use a specific Chrome/headless-shell binary.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const [outDir, ...frames] = process.argv.slice(2);
const id = process.env.COMP ?? 'KitschIntro';
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const puppeteerInstance = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id, puppeteerInstance});
for (const f of frames) {
  const output = path.join(outDir, `f${String(f).padStart(3, '0')}.png`);
  await renderStill({composition, serveUrl, frame: Number(f), output, puppeteerInstance, scale: 0.5});
  console.log(output);
}
await puppeteerInstance.close({silent: true});

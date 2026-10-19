// Export every figure as standalone SVG + 2x PNG, the board in all five modes,
// and the master infographic as SVG, PNG and PDF.
//   node export.mjs   (needs playwright; set PLAYWRIGHT_MODULE to a path if it is installed globally)
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'export');
fs.mkdirSync(OUT, { recursive: true });

const names = {
  f01: '01-motherboard', f02: '02-usb-c-connector-cutaway', f03: '03-dock-g5-cutaway', f04: '04-normal-sequence', f05: '05-failure-state',
  f06: '06-restart-vs-hardware-reset', f07: '07-power-rail-map', f08: '08-off-is-not-zero-volts', f09: '09-power-button-path',
  f10: '10-voltage-decay', f11: '11-discharge-path', f12: '12-volatile-vs-nonvolatile', f13: '13-reset-depth', f14: '14-oem-reset-timeline',
  f15: '15-why-45-seconds', f16: '16-decision-tree', f17: '17-before-reset-after', f18: '18-exploded-view', f21: '21-hypothesis-map'
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('file://' + path.join(ROOT, 'index.html'));
await page.waitForTimeout(1500);

const svgs = await page.evaluate((names) => {
  const out = {};
  for (const id of Object.keys(names)) out[names[id]] = window.__standalone(document.querySelector(`[data-fig="${id}"] svg`).outerHTML);
  for (const m of Object.keys(BOARD_MODES)) out['19-board-' + m] = window.__standalone(boardSVG(m, { flow: false }));
  out['master-infographic'] = masterSVG(true);
  return out;
}, names);

const shot = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1200, height: 900 } });
for (const [name, svg] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(OUT, name + '.svg'), svg);
  const isMaster = name === 'master-infographic';
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const w = +vb[1], h = +vb[2];
  const sized = svg.replace(/<svg ([^>]*?)width="\d+"/, '<svg $1').replace('<svg ', `<svg width="${w}" height="${h}" `);
  await shot.setViewportSize({ width: Math.ceil(w), height: Math.ceil(h) });
  await shot.setContent(`<html><head><style>body{margin:0;background:#06100b}*{animation:none!important}</style></head><body>${sized}</body></html>`);
  await shot.waitForTimeout(isMaster ? 2500 : 600);
  await (await shot.$('svg')).screenshot({ path: path.join(OUT, name + '.png') });
  if (isMaster) {
    await shot.pdf({ path: path.join(OUT, name + '.pdf'), width: `${w}px`, height: `${Math.ceil(h) + 2}px`, printBackground: true, pageRanges: '1' });
  }
  console.log('exported', name);
}
await browser.close();

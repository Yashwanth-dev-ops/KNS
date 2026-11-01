// Smoke test for the built site. Run after `npm run build`, with `python3 -m http.server 4500` running in /tmp/sub:
//   NODE_PATH=$(npm root -g) node tests/smoke.mjs [check-name ...]
import { createRequire } from 'node:module';
import { cpSync, rmSync, mkdirSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const URL = 'http://localhost:4500/kns/';
const AXE = '/tmp/axe/node_modules/axe-core/axe.min.js';
const VPS = { phone: { width: 390, height: 844, isMobile: true, hasTouch: true }, laptop: { width: 1280, height: 800 } };
rmSync('/tmp/sub/kns', { recursive: true, force: true }); cpSync('out', '/tmp/sub/kns', { recursive: true }); mkdirSync('/tmp/shots', { recursive: true });

const fresh = async (b, vp, opts = {}) => {
  const ctx = await b.newContext({ viewport: { width: VPS[vp].width, height: VPS[vp].height }, isMobile: VPS[vp].isMobile, hasTouch: VPS[vp].hasTouch, ...opts });
  const page = await ctx.newPage(); page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && page.errors.push(m.text()));
  await page.goto(URL, { waitUntil: 'networkidle' });
  return page;
};
const skipIntro = async (page) => {
  const skip = page.locator('.intro-skip');
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await page.waitForFunction(() => !document.querySelector('.intro'), null, { timeout: 15000 });
};
const scrollThrough = async (page) => {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await page.mouse.wheel(0, 500); await page.waitForTimeout(60); }
};

// Shared checks run on every viewport.
async function shared(page, vp) {
  await skipIntro(page); await scrollThrough(page);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (over > 0) throw new Error(`horizontal overflow ${over}px`);
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
  await page.addScriptTag({ path: AXE });
  const v = await page.evaluate(async () => (await axe.run()).violations.map((x) => `${x.id}(${x.nodes.length})`));
  if (v.length) throw new Error(`axe: ${v.join(', ')}`);
  if (page.errors.length) throw new Error(`console: ${page.errors.join(' | ')}`);
  await page.screenshot({ path: `/tmp/shots/home-${vp}.png`, fullPage: true });
}

export const CHECKS = {
  'intro-hidden-on-reload': async (page) => {
    await skipIntro(page);
    await page.reload({ waitUntil: 'commit' });
    for (let i = 0; i < 20; i++) {
      const shown = await page.evaluate(() => { const e = document.querySelector('.intro'); return !!e && getComputedStyle(e).display !== 'none'; }).catch(() => false);
      if (shown) throw new Error('intro painted after reload');
      await page.waitForTimeout(50);
    }
  },
  'bottom-bar-no-overlap': async (page, vp) => {
    if (vp !== 'phone') return;
    await skipIntro(page);
    const bar = page.locator('[data-bottom-bar]');
    if (!(await bar.isVisible())) throw new Error('bottom bar not visible on phone');
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(400);
    const { last, top } = await page.evaluate(() => {
      const els = [...document.querySelectorAll('footer *')].filter((e) => e.getBoundingClientRect().height > 0);
      return { last: Math.max(...els.map((e) => e.getBoundingClientRect().bottom)), top: document.querySelector('[data-bottom-bar]').getBoundingClientRect().top };
    });
    if (last > top + 0.5) throw new Error(`footer content ends at ${last}, bar starts at ${top}`);
  },
  'no-bottom-bar-laptop': async (page, vp) => {
    if (vp !== 'laptop') return;
    if (await page.locator('[data-bottom-bar]').isVisible()) throw new Error('bottom bar visible on laptop');
  },
  'no-3d-links': async (page) => {
    const n = await page.locator('a[href*="world"], a[href*="house/"]').count();
    if (n) throw new Error(`${n} links to removed 3D pages`);
  },
  fonts: async (page) => {
    await skipIntro(page);
    const [h, b] = await page.evaluate(() => [getComputedStyle(document.querySelector('h1')).fontFamily, getComputedStyle(document.body).fontFamily]);
    if (!h.includes('Fraunces')) throw new Error(`h1 font: ${h}`);
    if (!b.includes('Hanken Grotesk')) throw new Error(`body font: ${b}`);
  },
  'reduced-motion-content': async (page, vp, b) => {
    const p = await fresh(b, vp, { reducedMotion: 'reduce' });
    await p.waitForTimeout(1500);
    await p.waitForFunction(() => !document.querySelector('.intro'), null, { timeout: 5000 });
    const op = await p.evaluate(() => getComputedStyle(document.querySelector('h1')).opacity);
    await p.context().close();
    if (op !== '1') throw new Error(`h1 opacity ${op} under reduced motion`);
  },
};

const only = process.argv.slice(2);
const b = await chromium.launch();
let failed = 0;
for (const vp of Object.keys(VPS)) {
  for (const [name, fn] of [['shared', shared], ...Object.entries(CHECKS)]) {
    if (only.length && name !== 'shared' && !only.includes(name)) continue;
    const page = await fresh(b, vp);
    try { await fn(page, vp, b); console.log(`PASS ${name} [${vp}]`); }
    catch (e) { failed++; console.log(`FAIL ${name} [${vp}]: ${e.message.split('\n')[0]}`); await page.screenshot({ path: `/tmp/shots/${name}-${vp}.png` }).catch(() => {}); }
    await page.context().close();
  }
}
await b.close();
console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);

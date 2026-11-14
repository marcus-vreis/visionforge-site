// Renders the link-preview images (public/images/social.png and social-en.png) from the site's own copy,
// fonts and colour tokens. Run it again whenever the hero title or the visual direction changes:
//   node scripts/social-image.mjs
// It needs the Chromium that Playwright uses for the tests (PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is honoured).
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// Fonts go in as data URLs: a page set from a string may not load file:// resources.
const font = (family, file) => 'data:font/woff2;base64,' + readFileSync(join(root, 'node_modules/@fontsource', family, 'files', file)).toString('base64');
const heroTitle = (lang) => {
  const match = /hero: \{\s*title: '([^']+)'/.exec(readFileSync(join(root, `src/content/${lang}.ts`), 'utf8'));
  if (!match) throw new Error(`hero.title not found in ${lang}.ts`);
  return match[1];
};

const text = {
  pt: { eyebrow: 'Código aberto · MIT · PyTorch', tasks: ['classificação', 'detecção', 'regressão', 'segmentação', 'anomalia'], terminal: 'Terminal' },
  en: { eyebrow: 'Open source · MIT · PyTorch', tasks: ['classification', 'detection', 'regression', 'segmentation', 'anomaly'], terminal: 'Terminal' },
};

const page = (lang) => `<!doctype html><html lang="${lang}"><meta charset="utf-8"><style>
@font-face { font-family: 'Plex Sans'; font-weight: 500; src: url('${font('ibm-plex-sans', 'ibm-plex-sans-latin-500-normal.woff2')}'); }
@font-face { font-family: 'Plex Sans'; font-weight: 600; src: url('${font('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff2')}'); }
@font-face { font-family: 'Plex Mono'; font-weight: 400; src: url('${font('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')}'); }
* { box-sizing: border-box; margin: 0; }
/* Tokens of the dark theme in src/styles/global.css. */
body { --bg: #0e0f11; --surface: #15171a; --text: #e9e7e1; --muted: #a6a8a2; --line: #2e3136; --accent: #ff6b57;
  width: 1200px; height: 630px; padding: 56px 64px 48px; display: grid; grid-template-rows: auto 1fr auto; background: var(--bg); color: var(--text); font-family: 'Plex Sans'; }
header { display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 600; letter-spacing: -.02em; }
.brand b { color: var(--accent); font-weight: 600; }
.brand svg { width: 34px; height: 34px; color: var(--accent); }
.mono { font: 400 17px/1.5 'Plex Mono'; color: var(--muted); }
main { display: grid; grid-template-columns: minmax(0, 1fr) 372px; gap: 56px; align-items: center; }
.eyebrow { font: 400 16px/1.5 'Plex Mono'; text-transform: uppercase; letter-spacing: .12em; color: var(--accent); }
h1 { margin-top: 18px; font-size: 53px; line-height: 1.13; font-weight: 600; letter-spacing: -.025em; text-wrap: balance; }
.terminal { border: 1px solid var(--line); border-radius: 6px; background: var(--surface); }
.terminal-bar { padding: 10px 16px; border-bottom: 1px solid var(--line); font: 400 14px/1.5 'Plex Mono'; color: var(--muted); }
.terminal pre { padding: 18px 16px 20px; font: 400 16px/2 'Plex Mono'; }
.terminal i { font-style: normal; color: var(--muted); }
.terminal u { text-decoration: none; color: var(--accent); }
footer { display: flex; justify-content: space-between; padding-top: 20px; border-top: 1px solid var(--text); }
</style><body>
<header>
  <span class="brand"><svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="5" stroke="currentColor" stroke-width="2"/><path d="M16 3v7m0 12v7M3 16h7m12 0h7" stroke="currentColor" stroke-width="2"/></svg><span>Vision<b>Forge</b></span></span>
  <span class="mono">marcus-vreis.github.io/visionforge-site</span>
</header>
<main>
  <div><p class="eyebrow">${text[lang].eyebrow}</p><h1>${heroTitle(lang)}</h1></div>
  <div class="terminal"><div class="terminal-bar">${text[lang].terminal}</div><pre><i>$ </i>pip install visionforge-studio
<i>$ </i>visionforge gui
<u>→ http://127.0.0.1:8000</u></pre></div>
</main>
<footer><span class="mono">${text[lang].tasks.join(' · ')}</span></footer>
</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
for (const [lang, file] of [['pt', 'social.png'], ['en', 'social-en.png']]) {
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await tab.setContent(page(lang));
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: join(root, 'public/images', file) });
  console.log(file);
}
await browser.close();

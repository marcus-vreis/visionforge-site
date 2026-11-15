import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { release } from '../src/content/release';

/** Waits for running CSS transitions (theme change, entrances) to end, so colours are read at rest. */
const settle = (page: Page) => page.evaluate(() => Promise.all(document.getAnimations().filter(item => item instanceof CSSTransition).map(item => item.finished.catch(() => undefined))).then(() => undefined));

for (const language of ['pt','en'] as const) {
  test(`${language}: real content, metadata, assets and navigation`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(language === 'pt' ? './' : './en/');
    await expect(page.locator('html')).toHaveAttribute('lang',language === 'pt' ? 'pt-BR' : 'en');
    await expect(page.locator('h1')).toContainText(language === 'pt' ? 'Plataforma local para treinar e comparar modelos' : 'A local platform for training and comparing');
    for (const line of ['pip install visionforge-studio', 'visionforge doctor', 'visionforge selftest --quick', 'visionforge gui']) await expect(page.locator('.hero-terminal .t-cmd', { hasText: line }).first()).toBeAttached();
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://marcus-vreis.github.io/visionforge-site/${language === 'en' ? 'en/' : ''}`);
    // The link preview is in the page's language and is served as a 1200 px wide PNG.
    const suffix = language === 'pt' ? '' : '-en';
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `https://marcus-vreis.github.io/visionforge-site/images/social${suffix}.png`);
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /visão computacional|computer-vision/);
    const preview = await page.request.get(`http://127.0.0.1:4322/visionforge-site/images/social${suffix}.png`);
    expect(preview.headers()['content-type']).toContain('image/png');
    expect((await preview.body()).readUInt32BE(16)).toBe(1200);
    await expect(page.locator('a[href$=".whl"]')).toHaveCount(1);
    await expect(page.locator('a[href$=".tar.gz"]')).toHaveCount(1);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('img').evaluateAll(nodes => nodes.forEach(node => { (node as HTMLImageElement).loading = 'eager'; }));
    await expect.poll(() => page.locator('img').evaluateAll(nodes => nodes.every(node => { const img = node as HTMLImageElement; return img.complete && img.naturalWidth > 0; }))).toBe(true);
    const images = await page.locator('img').evaluateAll(nodes => nodes.map(node => { const img = node as HTMLImageElement; return {src:img.src, loaded:img.complete && img.naturalWidth > 0}; }));
    expect(images.length).toBeGreaterThan(0);
    expect(images.filter(img => !img.loaded)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('installation tabs select correct platform and support keyboard', async ({ page }) => {
  await page.goto('./');
  const windows = page.getByRole('tab',{name:'Windows',exact:true});
  await expect(windows).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#code-windows')).toContainText('py -3.12 -m venv');
  await expect(page.locator('#code-windows')).toContainText('.\\.venv\\Scripts\\python.exe -m pip install visionforge-studio');
  await windows.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab',{name:'Linux',exact:true})).toBeFocused();
  await expect(page.locator('#panel-linux')).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab',{name:'macOS',exact:true})).toBeFocused();
  await expect(page.locator('#panel-macos')).toBeVisible();
  await expect(page.locator('#code-macos')).not.toContainText('--fix');
  await expect(page.locator('#panel-macos')).toContainText('CPU');
  await page.keyboard.press('Home');
  await expect(windows).toBeFocused();
});

test('task table lists the five tasks with their own models and metrics in both languages', async ({ page }) => {
  const expected: Record<string, string> = { classification: 'ResNet', detection: 'RT-DETR', regression: 'CSV', segmentation: 'DeepLabV3', anomaly: 'PatchCore' };
  for (const path of ['./', './en/']) {
    await page.goto(path);
    const rows = page.locator('#tasks table tbody tr');
    await expect(rows).toHaveCount(5);
    await expect(page.locator('#tasks table thead th')).toHaveCount(3);
    await expect(page.locator('#tasks table svg.glyph')).toHaveCount(5);
    for (const [id, model] of Object.entries(expected)) {
      const row = page.locator(`#task-${id}`);
      await expect(row.locator('th[scope=row]')).toBeVisible();
      await expect(row.locator('td[data-label]').first()).toContainText(model);
      await expect(row.locator('td[data-label]').last()).not.toBeEmpty();
    }
  }
});

test('tasks section stays accessible in light and dark themes', async ({ page }) => {
  await page.goto('./');
  for (const theme of ['dark','light']) {
    await page.locator(`[data-theme-option=${theme}]`).click();
    await settle(page);
    const result = await new AxeBuilder({page}).include('#tasks').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
  }
});

test('figures are numbered in order and the run.json file reads the same in both languages', async ({ page }) => {
  const lines: Record<string, string[]> = {};
  for (const language of ['pt', 'en'] as const) {
    await page.goto(language === 'pt' ? './' : './en/');
    expect(await page.locator('main figure figcaption b').allTextContents()).toEqual(['Fig. 1', 'Fig. 2', 'Fig. 3', 'Fig. 4']);
    expect(await page.locator('main table caption b').allTextContents()).toEqual([language === 'pt' ? 'Tabela 1' : 'Table 1']);
    lines[language] = await page.locator('.runjson .rj-line code').allTextContents();
    expect(lines[language].join('\n')).toContain('"dataset_fingerprint": {');
    // One note open at a time; clicking another block moves it, clicking the open one closes it.
    await expect(page.locator('.runjson .rj-note:visible')).toHaveCount(1);
    const environment = page.locator('.runjson [data-rj-group]').filter({ has: page.locator('#rj-note-environment') });
    await environment.locator('[data-rj-toggle]').click();
    await expect(page.locator('#rj-note-environment')).toBeVisible();
    await expect(page.locator('.runjson .rj-note:visible')).toHaveCount(1);
    await environment.locator('[data-rj-toggle]').click();
    await expect(page.locator('.runjson .rj-note:visible')).toHaveCount(0);
  }
  expect(lines.pt).toEqual(lines.en);
  expect(lines.pt).toHaveLength(47);
  // The file shown is valid JSON once the folded parts are filled in.
  expect(() => JSON.parse(lines.pt.join('\n').replaceAll('{ … }', '{}').replaceAll('[ … ]', '[]'))).not.toThrow();
});

test('interface replica: tabs, steps, strategy and the Train lock behave like the application', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [path, labels] of [['./', { reg: 'Regressão', review: 'Revisão', strategy: 'Estratégia', replicates: 'Réplicas', run: 'Rodar réplicas', train: 'Treinar' }], ['./en/', { reg: 'Regression', review: 'Review', strategy: 'Strategy', replicates: 'Replicates', run: 'Run replicates', train: 'Train' }]] as const) {
    await page.goto(path);
    const studio = page.locator('[data-studio] .studio-window');
    const train = studio.locator('[data-act=train]');
    await expect(studio.getByRole('tab')).toHaveCount(5);
    await expect(studio.locator('.vf-rail button')).toHaveCount(6);
    // The header carries the profile chip, as the application does since the profile menu moved there.
    await expect(studio.locator('.vf-profile')).toContainText('Researcher');
    // Classification starts with the sample dataset, but Train stays locked outside Review.
    await expect(train).toHaveAttribute('aria-disabled', 'true');
    await studio.locator('.vf-rail button', { hasText: labels.review }).click();
    await expect(train).toHaveAttribute('aria-disabled', 'false');
    await train.click();
    await expect(studio.getByRole('status')).toBeVisible();
    // Regression has no dataset: Review cannot unlock Train, and choosing Replicates renames the button.
    await studio.getByRole('tab', { name: labels.reg }).click();
    await expect(studio.locator('.vf-hero .vf-title')).toHaveText(labels.reg);
    await expect(train).toHaveAttribute('aria-disabled', 'true');
    await studio.locator('.vf-rail button', { hasText: labels.strategy }).click();
    await studio.locator('[data-act=strategy]', { hasText: labels.replicates }).click();
    await expect(train).toContainText(labels.run);
    await expect(studio.locator('.vf-rail button', { hasText: labels.strategy })).toContainText(labels.replicates);
    // The line under the selector says when the chosen strategy is the right one.
    await expect(studio.locator('.vf-when')).toHaveText(path === './' ? /^Quando usar\s*Quando o número vai para um relatório ou artigo/ : /^When to use\s*When the number goes into a report or a paper/);
    // Every task offers the replicated comparison, which renames the button too.
    await studio.locator('[data-act=strategy][data-value=replicatedComparison]').click();
    await expect(train).toContainText(path === './' ? 'Rodar comparação' : 'Run comparison');
    await studio.locator('[data-act=strategy]', { hasText: labels.replicates }).click();
    // Arrow keys move between task tabs.
    await studio.getByRole('tab', { name: labels.reg }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(studio.getByRole('tab').nth(3)).toHaveAttribute('aria-selected', 'true');
    await expect(train).toContainText(labels.train);
  }
});

test('the tour starts by itself over the replica, glides between stops and steps aside when asked', async ({ page }) => {
  await page.goto('./');
  const studio = page.locator('[data-studio]');
  const stage = studio.locator('[data-studio-stage]');
  const card = studio.locator('[data-tour-card]');
  const count = studio.locator('[data-tour-count]');
  await expect(studio.locator('[data-tour]')).toBeHidden();
  // Reaching the section is enough: no button has to be found first.
  await stage.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' }));
  await expect(studio).toHaveAttribute('data-touring', 'true');
  await expect(count).toHaveText('01 / 08');
  await expect(card).toBeVisible();
  // Left alone, it moves on to the next stop.
  await expect(count).toHaveText('02 / 08', { timeout: 12_000 });
  // The page is never held: the visitor can scroll past, and the tour steps aside on a click in the replica.
  await page.mouse.wheel(0, 1600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1500);
  await stage.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: 'instant' }));
  await studio.getByRole('tab').nth(2).evaluate((el: HTMLElement) => el.click());
  await expect(studio).not.toHaveAttribute('data-touring', 'true');
  await expect(studio.getByRole('tab').nth(2)).toHaveAttribute('aria-selected', 'true');
});

test('tour stops light the right part, keep the card inside the replica and the page explains it without JavaScript', async ({ page, browser }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const studio = page.locator('[data-studio]');
  const stage = studio.locator('[data-studio-stage]');
  const card = studio.locator('[data-tour-card]');
  const count = studio.locator('[data-tour-count]');
  const next = studio.locator('[data-tour-next]');
  // With reduced motion nothing opens uninvited; the header's guide button starts the same tour.
  await stage.scrollIntoViewIfNeeded();
  await expect(studio.locator('[data-tour]')).toBeHidden();
  await studio.locator('[data-act=tour]').click();
  await expect(count).toHaveText('01 / 08');
  await expect(studio.locator('[data-tour-prev]')).toBeHidden();
  const targets = ['tabs', 'dataset', 'rail', 'card', 'card', 'train', 'history', 'device'];
  for (let i = 0; i < targets.length; i++) {
    if (i > 0) await next.click();
    await expect(count).toHaveText(`0${i + 1} / 08`);
    const frame = (await stage.boundingBox())!;
    const box = (await card.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(frame.x);
    expect(box.x + box.width).toBeLessThanOrEqual(frame.x + frame.width + 1);
    expect(box.y).toBeGreaterThanOrEqual(frame.y);
    expect(box.y + box.height).toBeLessThanOrEqual(frame.y + frame.height + 1);
    // The ring sits on the stop's target and the card does not cover it.
    const target = (await studio.locator(`[data-spot=${targets[i]}]`).boundingBox())!;
    const ring = (await studio.locator('[data-tour-ring]').boundingBox())!;
    expect(Math.abs(ring.x - (target.x - 6))).toBeLessThanOrEqual(8);
    expect(Math.abs(ring.y - (target.y - 6))).toBeLessThanOrEqual(8);
    const apart = box.x >= target.x + target.width || box.x + box.width <= target.x || box.y >= target.y + target.height || box.y + box.height <= target.y;
    expect(apart, `card covers the target of stop ${i + 1}`).toBe(true);
    if (i === 4) {
      await expect(studio.getByRole('tab').nth(2)).toHaveAttribute('aria-selected', 'true');
      await expect(studio.locator('[data-act=train]')).toContainText('Rodar réplicas');
    }
    if (i === 5) await expect(studio.locator('[data-act=train]')).toHaveAttribute('aria-disabled', 'false');
  }
  await expect(next).toHaveText('Concluir');
  await next.click();
  await expect(studio).not.toHaveAttribute('data-touring', 'true');
  await expect(studio.locator('[data-tour]')).toBeHidden();
  // It can be opened again and skipped.
  await studio.locator('[data-act=tour]').click();
  await expect(count).toHaveText('01 / 08');
  await studio.locator('[data-tour-skip]').click();
  await expect(studio.locator('[data-tour]')).toBeHidden();

  const context = await browser.newContext({ javaScriptEnabled: false });
  const plain = await context.newPage();
  await plain.goto('http://127.0.0.1:4322/visionforge-site/');
  await expect(plain.locator('[data-studio] .vf-title')).toHaveText('Classificação');
  await expect(plain.locator('.studio-fallback li')).toHaveCount(8);
  await expect(plain.locator('[data-studio-stage]')).toHaveCSS('opacity', '1');
  await expect(plain.locator('[data-tour]')).toBeHidden();
  for (const note of await plain.locator('.runjson .rj-note').all()) await expect(note).toBeVisible();
  await expect(plain.locator('#features [data-updates-panel]:visible')).toHaveCount(2);
  await context.close();
});

test('custom-task section links each block of code to the form field it produces', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const form = page.locator('[data-codeform]');
  await expect(form.locator('.cf-code')).toContainText('research_weight: float = Field(');
  await form.locator('.cf-field', { hasText: 'n samples' }).click();
  await expect(form.locator('button.cf-block[data-active]')).toContainText('n_samples: int = Field(');
  await expect(form.locator('[data-cf-text]:visible')).toHaveCount(1);
  await form.locator('button.cf-block', { hasText: 'label="Research method"' }).click();
  await expect(form.locator('.cf-own')).toHaveAttribute('data-active', '');
});

test('terminal session shows every line when motion is reduced and can be replayed otherwise', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  for (const line of await page.locator('.hero-terminal .t-line').all()) await expect(line).toBeVisible();
  await expect(page.locator('.hero-terminal')).toContainText('5/5 cases passed');
  await expect(page.locator('[data-replay]')).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  await expect(page.locator('[data-replay]')).toBeVisible();
  await expect(page.locator('.hero-terminal .t-line').last()).toBeVisible({ timeout: 12000 });
  await page.locator('[data-replay]').click();
  await expect(page.locator('.hero-terminal .t-line').last()).toBeHidden();
});

test('updates are tabs: the release with its date, then the earlier releases', async ({ page }) => {
  const versions: Record<string, string[]> = {};
  for (const language of ['pt', 'en'] as const) {
    await page.goto(language === 'pt' ? './' : './en/');
    const tabs = page.locator('#features [data-updates-tab]');
    // Nothing is "in development" on the page once the release is out.
    await expect(tabs).toHaveCount(2);
    await expect(tabs.nth(0)).toContainText(`${release.version} · ${release.releasedOn}`);
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#features [role=tabpanel]:visible')).toHaveCount(1);
    await expect(page.locator('#updates-released')).toBeVisible();
    await expect(page.locator('#updates-planned')).toHaveCount(0);
    await expect(page.locator('.hero-live')).toContainText(release.version);
    await tabs.nth(0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(page.locator('#updates-earlier')).toBeVisible();
    await expect(page.locator('#updates-released')).toBeHidden();
    versions[language] = await page.locator('.release-log .release-version').allTextContents();
    for (const entry of await page.locator('.release-log li p').all()) await expect(entry).not.toBeEmpty();
    await expect(page.locator('.release-log a')).toHaveAttribute('href', release.changelog);
  }
  expect(versions.pt).toEqual(versions.en);
  expect(versions.pt).toEqual(['0.21.0', '0.21.0', '0.20.2', '0.20.1', '0.20.0']);
});

test('section links stay reachable on a phone-sized viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 760 });
  await page.goto('./');
  const nav = page.getByRole('navigation', { name: 'Navegação principal' });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link')).toHaveCount(4);
  await nav.getByRole('link', { name: 'Instalação' }).click();
  await expect(page).toHaveURL(/#install$/);
  await expect(page.locator('#install-title')).toBeInViewport();
});

test('copy succeeds and denied clipboard provides selectable fallback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('./');
  const button = page.locator('[data-copy="code-windows"]');
  await button.click();
  const displayed = await page.locator('#code-windows').textContent() ?? '';
  // Windows' native clipboard stores text with CRLF, even when writeText receives LF.
  const expected = process.platform === 'win32' ? displayed.replace(/\n/g,'\r\n') : displayed;
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
  await expect(page.locator('#panel-windows [role=status]')).toHaveText(await button.getAttribute('data-success') ?? '');
  await page.evaluate(() => { Object.defineProperty(navigator.clipboard,'writeText',{value:() => Promise.reject(new DOMException('Denied','NotAllowedError')),configurable:true}); });
  await button.click();
  await expect(page.locator('#panel-windows [role=status]')).toHaveText(await button.getAttribute('data-failure') ?? '');
  expect(await page.evaluate(() => window.getSelection()?.toString())).toContain('pip install visionforge-studio');
});

test('theme persists, tracks system changes, and survives blocked storage', async ({ page }) => {
  await page.emulateMedia({colorScheme:'light'});
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.emulateMedia({colorScheme:'dark'});
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('[data-theme-option=light]').click(); await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.addInitScript(() => { Object.defineProperty(window,'localStorage',{get(){throw new Error('Blocked');}}); });
  await page.reload(); await page.locator('[data-theme-option=light]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});

test('theme uses three icon buttons with keyboard selection', async ({ page }) => {
  await page.goto('./');
  const group = page.getByRole('group', { name: 'Tema', exact: true });
  await expect(group.getByRole('button')).toHaveCount(3);
  await expect(page.locator('select#theme')).toHaveCount(0);
  const system = group.locator('[data-theme-option=system]');
  const light = group.locator('[data-theme-option=light]');
  const dark = group.locator('[data-theme-option=dark]');
  await expect(system).toHaveAttribute('aria-pressed', 'true');
  await expect(group.locator('button svg')).toHaveCount(3);
  await system.focus();
  await page.keyboard.press('ArrowRight');
  await expect(light).toBeFocused();
  await expect(light).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.keyboard.press('End');
  await expect(dark).toBeFocused();
  await expect(dark).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(dark).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await dark.focus();
  await page.keyboard.press('Home');
  await expect(system).toBeFocused();
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(group.locator('[aria-pressed=true]')).toHaveCount(1);
});

for (const width of [360,768,1440]) {
  test(`responsive layout and contrast at ${width}px in both themes`, async ({ page }) => {
    await page.setViewportSize({width,height:1000});
    await page.goto('./');
    for (const theme of ['dark','light']) {
      await page.locator(`[data-theme-option=${theme}]`).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await settle(page);
      const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(result.violations).toEqual([]);
    }
  });
}

test('essential content works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/visionforge-site/');
  for (const platform of ['windows','linux','macos']) await expect(page.locator(`#code-${platform}`)).toBeVisible();
  for (const task of ['classification','detection','regression','segmentation','anomaly']) await expect(page.locator(`#task-${task}`)).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('link',{name:'English',exact:true})).toBeVisible();
  await context.close();
});

test('reduced motion and skip link', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('./');
  expect(await page.locator('html').evaluate(el => getComputedStyle(el).scrollBehavior)).toBe('auto');
  await page.keyboard.press('Tab'); await expect(page.locator('.skip')).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page).toHaveURL(/#main$/);
});

test.describe('version consistency', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const staleVersions = /(?<![\d.])0\.(?:17\.0|20\.1|20\.2)(?!\.?\d)/;
  // Provenance of assets that really come from older versions (screenshots, adapted scaffold).
  // updates.ts is a changelog: earlier versions are its content.
  const historicalLines = [/\{ version: '0\.\d+\.\d+', date: '\d{4}-\d{2}-\d{2}'/, /adapted from VisionForge v0\.17\.0/, /v0\.20\.1 GUI.*recaptured on 2026-11-03|recaptured on 2026-11-03.*v0\.20\.1 GUI|v0\.20\.1 GUI recaptured/];

  function filesUnder(directory: string): string[] {
    return readdirSync(join(root, directory), { withFileTypes: true }).flatMap(entry => {
      const relative = `${directory}/${entry.name}`;
      return entry.isDirectory() ? filesUnder(relative) : [relative];
    });
  }

  test('no stale release version outside intentional history', () => {
    const sources = [...filesUnder('src'), ...filesUnder('examples'), 'docs/ASSETS.md'];
    const offenders = sources
      .flatMap(file => readFileSync(join(root, file), 'utf8').split('\n')
        .map((line, index) => ({ where: `${file}:${index + 1}`, line }))
        .filter(({ line }) => staleVersions.test(line) && !historicalLines.some(pattern => pattern.test(line)))
        .map(({ where }) => where));
    expect(offenders).toEqual([]);
  });

  test('release.ts version drives links, requirements, citation and ZIP', async ({ page }) => {
    const { version } = release;
    expect(release.wheel).toContain(`/v${version}/visionforge_studio-${version}-py3-none-any.whl`);
    expect(release.source).toContain(`/v${version}/visionforge_studio-${version}.tar.gz`);
    expect(release.url.endsWith(`/tag/v${version}`)).toBe(true);
    expect(readFileSync(join(root, 'examples/digits-project/requirements.txt'), 'utf8').trim()).toBe(`visionforge-studio==${version}`);
    for (const path of ['./', './en/']) {
      await page.goto(path);
      await expect(page.locator(`a[href="${release.wheel}"]`)).toHaveCount(1);
      await expect(page.locator('.citation')).toContainText(`${version}: ${release.doi}`);
    }
  });
});

test('404 page is built with h1, links to home and English, and passes axe', async ({ page }) => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const html = readFileSync(join(root, 'dist/404.html'), 'utf8');
  expect(html).toContain('<h1');
  const response = await page.goto('./pagina-que-nao-existe/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main a[href="/visionforge-site/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/visionforge-site/en/"]')).toHaveCount(1);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex');
  await settle(page);
  const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations).toEqual([]);
});

test('JSON-LD SoftwareApplication parses and follows release.ts', async ({ page }) => {
  for (const [path, lang] of [['./', 'pt-BR'], ['./en/', 'en']] as const) {
    await page.goto(path);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks).toHaveLength(1);
    const data = JSON.parse(blocks[0]);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('SoftwareApplication');
    expect(data.softwareVersion).toBe(release.version);
    expect(data.inLanguage).toBe(lang);
    expect(data.identifier).toBe(`https://doi.org/${release.doi}`);
  }
});

test('twitter title and description mirror the page metadata', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', await page.title());
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', (await page.locator('meta[name=description]').getAttribute('content'))!);
});

test('landing: six workflow steps, exporters, Colab and release marks in both languages (issue 219)', async ({ page }) => {
  const shape: Record<string, { steps: number; cards: number; fresh: number }> = {};
  for (const language of ['pt', 'en'] as const) {
    await page.goto(language === 'pt' ? './' : './en/');
    const section = page.locator('#features');
    await expect(section).toContainText('Colab');
    for (const name of ['Zenodo', 'DVC', 'Hugging Face', 'MLflow', 'Weights & Biases', 'GitHub', 'Docker']) await expect(section).toContainText(name);
    // Every card carries the published version: either new in it or already there.
    const marks = await page.locator('#features [data-group=released] .feature-mark').allTextContents();
    const fresh = language === 'pt' ? `Novo na ${release.version}` : `New in ${release.version}`;
    const kept = `${language === 'pt' ? 'Versão' : 'Version'} ${release.version}`;
    for (const mark of marks) expect([fresh, kept]).toContain(mark);
    await expect(section).not.toContainText(language === 'pt' ? 'em desenvolvimento' : 'in development');
    shape[language] = { steps: await page.locator('#workflow .step').count(), cards: await page.locator('#features .feature-card').count(), fresh: marks.filter(mark => mark === fresh).length };
    expect(shape[language].fresh).toBe(5);
    expect(shape[language].steps).toBe(6);
    for (const theme of ['dark', 'light']) {
      await page.locator(`[data-theme-option=${theme}]`).click();
      await settle(page);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(result.violations).toEqual([]);
    }
  }
  expect(shape.pt).toEqual(shape.en);
});

test.describe('Colab, publishing and Code guides (issue 222)', () => {
  const slugs = ['colab', 'publicar', 'codigo'] as const;
  const site = 'https://marcus-vreis.github.io/visionforge-site/';
  const urlFor = (language: 'pt' | 'en', slug: string) => `${site}${language === 'en' ? 'en/' : ''}docs/${slug}/`;

  for (const slug of slugs) {
    test(`/docs/${slug}/ serves both languages with reciprocal hreflang and a version mark`, async ({ page }) => {
      for (const language of ['pt', 'en'] as const) {
        const response = await page.goto(`${language === 'en' ? 'en/' : ''}docs/${slug}/`);
        expect(response?.status()).toBe(200);
        await expect(page.locator('html')).toHaveAttribute('lang', language === 'pt' ? 'pt-BR' : 'en');
        await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', urlFor(language, slug));
        await expect(page.locator('link[hreflang=pt-BR]')).toHaveAttribute('href', urlFor('pt', slug));
        await expect(page.locator('link[hreflang=en]')).toHaveAttribute('href', urlFor('en', slug));
        await expect(page.locator('link[hreflang=x-default]')).toHaveAttribute('href', urlFor('pt', slug));
        // The three features are released: the mark is the published version, and the Colab guide also names the one that brought training.
        await expect(page.locator('.guide-version')).toContainText(release.version);
        if (slug === 'colab') await expect(page.locator('.guide-version')).toContainText('0.21.0');
        await expect(page.locator('.guide-sources a').first()).toHaveAttribute('href', new RegExp(`/blob/v${release.version}/docs/gui/`));
        for (const anchor of await page.locator('.docs-toc a').all()) await expect(page.locator((await anchor.getAttribute('href'))!)).toHaveCount(1);
        // The exporters still have no real capture; Colab and the Live code tab show one annotated capture each, in two themes.
        await expect(page.locator('article img')).toHaveCount(slug === 'publicar' ? 0 : 2);
      }
    });
  }

  test('the six routes are listed in the sitemap and link to each other in the sidebar', async ({ page, request }) => {
    const index = await request.get('sitemap-index.xml');
    expect(index.status()).toBe(200);
    expect(await index.text()).toContain('sitemap-0.xml');
    const sitemap = await (await request.get('sitemap-0.xml')).text();
    for (const language of ['pt', 'en'] as const) for (const slug of slugs) expect(sitemap).toContain(`<loc>${urlFor(language, slug)}</loc>`);
    await page.goto('docs/colab/');
    for (const slug of slugs) await expect(page.locator(`.docs-sidebar a[href$="/docs/${slug}/"]`)).toHaveCount(1);
  });

  test('Colab guide keeps the 0.21.0 and 0.22.0 boundary, and the Code guide quotes the real tour map', async ({ page }) => {
    await page.goto('docs/colab/');
    await expect(page.locator('#drive')).toContainText(`desde a ${release.version}`);
    await expect(page.locator('#drive')).toContainText('Na 0.21.0');
    await page.goto('en/docs/codigo/');
    await expect(page.locator('article')).toContainText('"classification": CLASSIFICATION,');
    await expect(page.locator('article')).toContainText('nn.BCEWithLogitsLoss()');
  });
});

test.describe('entry guides, one per reader (docs/guias of the product)', () => {
  const slugs = ['comecando-do-zero', 'ja-treino-modelos', 'o-que-o-visionforge-faz'] as const;
  const titles = { pt: ['Começando do zero', 'Já treino modelos: o VisionForge em dez minutos', 'O que o VisionForge faz'], en: ['Starting from zero', 'I already train models: VisionForge in ten minutes', 'What VisionForge does'] };
  // Sections and screenshots of each Markdown file; a guide that loses one fails here.
  const shape = { 'comecando-do-zero': { sections: 8, images: 5, tables: 10 }, 'ja-treino-modelos': { sections: 8, images: 2, tables: 4 }, 'o-que-o-visionforge-faz': { sections: 10, images: 15, tables: 2 } };

  for (const [index, slug] of slugs.entries()) {
    test(`/docs/${slug}/ renders the whole file in both languages`, async ({ page, request }) => {
      for (const language of ['pt', 'en'] as const) {
        const errors: string[] = [];
        page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
        const prefix = language === 'en' ? 'en/' : '';
        const response = await page.goto(`${prefix}docs/${slug}/`);
        expect(response?.status()).toBe(200);
        await expect(page.locator('h1')).toHaveText(titles[language][index]);
        await expect(page.locator('.guide-version')).toHaveText(`v${release.version}`);
        await expect(page.locator('.guide-sources a').first()).toHaveAttribute('href', `${release.repository}/blob/v${release.version}/docs/guias/${slug}.md`);
        await expect(page.locator('.docs-entries a')).toHaveCount(3);
        await expect(page.locator('.docs-sidebar a[aria-current=page]')).toHaveCount(1);
        await expect(page.locator('article .guide-section')).toHaveCount(shape[slug].sections);
        await expect(page.locator('article .guide-shot img')).toHaveCount(shape[slug].images);
        await expect(page.locator('article .guide-table')).toHaveCount(shape[slug].tables);
        for (const anchor of await page.locator('.docs-toc a').all()) await expect(page.locator((await anchor.getAttribute('href'))!)).toHaveCount(1);
        // Links inside the text: other entry guides stay on the site, the rest goes to the tagged repository or out.
        const hrefs = await page.locator('article .guide-section a, article .guide-intro a').evaluateAll(links => links.map(link => link.getAttribute('href') ?? ''));
        for (const href of hrefs) expect(href).toMatch(new RegExp(`^(#|https?://|/visionforge-site/${prefix}docs/)`));
        expect(hrefs.filter(href => href.includes('/blob/')).every(href => href.includes(`/blob/v${release.version}/docs/`))).toBe(true);
        expect(hrefs.some(href => href.endsWith('.md') && !href.startsWith('http'))).toBe(false);
        for (const href of hrefs.filter(item => item.startsWith('#'))) await expect(page.locator(href)).toHaveCount(1);
        await page.locator('img').evaluateAll(images => images.forEach(img => { (img as HTMLImageElement).loading = 'eager'; }));
        await expect.poll(() => page.locator('img').evaluateAll(images => images.every(node => { const img = node as HTMLImageElement; return img.complete && img.naturalWidth > 0; }))).toBe(true);
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        expect(result.violations).toEqual([]);
        expect(errors).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      }
      const sitemap = await (await request.get('sitemap-0.xml')).text();
      expect(sitemap).toContain(`<loc>https://marcus-vreis.github.io/visionforge-site/docs/${slug}/</loc>`);
      expect(sitemap).toContain(`<loc>https://marcus-vreis.github.io/visionforge-site/en/docs/${slug}/</loc>`);
    });
  }

  test('the Portuguese pages carry the text of the product files, and the landing lists the three guides', async ({ page }) => {
    await page.goto('docs/comecando-do-zero/');
    await expect(page.locator('#c1-o-que-e-treinar-um-modelo')).toContainText('Ninguém escreve as regras dessa resposta.');
    await expect(page.locator('#c5-o-resultado-quanto-o-modelo-acerta')).toContainText('18 + 16 + 17 = 51 em 60, acurácia de 85%');
    // The recording stays an animation, with a still for people who ask for less motion.
    await expect(page.locator('#c6-veja-um-treino-acontecer picture source')).toHaveAttribute('media', '(prefers-reduced-motion: reduce)');
    await expect(page.locator('#c6-veja-um-treino-acontecer img')).toHaveAttribute('src', /vf-training-film\.gif$/);
    await page.goto('docs/ja-treino-modelos/');
    await expect(page.locator('#instalar-e-abrir pre')).toContainText('pip install visionforge-studio');
    await page.locator('#onde-fica-o-que-voce-ja-faz a[href="#linha-de-comando"]').click();
    await expect(page).toHaveURL(/#linha-de-comando$/);
    for (const language of ['pt', 'en'] as const) {
      await page.goto(language === 'pt' ? './' : './en/');
      for (const slug of slugs) await expect(page.locator(`#resources .link-list a[href$="/docs/${slug}/"]`)).toHaveCount(1);
    }
  });
});

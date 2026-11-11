import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { release, plannedVersion } from '../src/content/release';

for (const language of ['pt','en'] as const) {
  test(`${language}: real content, metadata, assets and navigation`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(language === 'pt' ? './' : './en/');
    await expect(page.locator('html')).toHaveAttribute('lang',language === 'pt' ? 'pt-BR' : 'en');
    await expect(page.locator('h1')).toContainText(language === 'pt' ? 'Visão computacional.' : 'Computer vision.');
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`https://marcus-vreis.github.io/visionforge-site/${language === 'en' ? 'en/' : ''}`);
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

test('all five task panels expose their own models and keyboard navigation', async ({ page }) => {
  await page.goto('./');
  const tasks = page.locator('[data-task-tabs]');
  const tabs = tasks.getByRole('tab');
  await expect(tabs).toHaveCount(5);
  await tabs.first().focus();
  await page.keyboard.press('End');
  await expect(tabs.last()).toBeFocused();
  await expect(page.locator('#task-panel-anomaly')).toBeVisible();
  await expect(page.locator('#task-panel-anomaly')).toContainText('PatchCore');
  await page.keyboard.press('ArrowRight');
  await expect(tabs.first()).toBeFocused();
  for (let index = 0; index < 5; index++) {
    await tabs.nth(index).click();
    await expect(tabs.nth(index)).toHaveAttribute('aria-selected','true');
    await expect(tasks.getByRole('tabpanel')).toHaveCount(1);
  }
});

test('task diagrams render visible marks in every panel', async ({ page }) => {
  await page.goto('./');
  for (const tab of await page.locator('[data-task-tabs] [role=tab]').all()) {
    await tab.click();
    const marks = await page.locator('[data-task-tabs] [role=tabpanel]:visible svg').evaluate(svg => Array.from(svg.querySelectorAll('path,rect,circle,ellipse')).filter(el => { const style = getComputedStyle(el); return style.stroke !== 'none' || style.fill !== 'none'; }).length);
    expect(marks).toBeGreaterThan(0);
  }
});

test('each task accent remains accessible in light and dark themes', async ({ page }) => {
  await page.goto('./');
  for (const theme of ['dark','light']) {
    await page.locator(`[data-theme-option=${theme}]`).click();
    for (const tab of await page.locator('[data-task-tabs] [role=tab]').all()) {
      await tab.click();
      const result = await new AxeBuilder({page}).include('#tasks').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      expect(result.violations).toEqual([]);
    }
  }
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
  for (const task of ['classification','detection','regression','segmentation','anomaly']) await expect(page.locator(`#task-panel-${task}`)).toBeVisible();
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
  const historicalLines = [/adapted from VisionForge v0\.17\.0/, /v0\.20\.1 GUI.*recaptured on 2026-11-03|recaptured on 2026-11-03.*v0\.20\.1 GUI|v0\.20\.1 GUI recaptured/];

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

test('landing: six workflow steps, exporters, Colab and planned marks in both languages (issue 219)', async ({ page }) => {
  const shape: Record<string, { steps: number; cards: number; planned: number }> = {};
  for (const language of ['pt', 'en'] as const) {
    await page.goto(language === 'pt' ? './' : './en/');
    const section = page.locator('#features');
    await expect(section).toContainText('Colab');
    for (const name of ['Zenodo', 'DVC', 'Hugging Face', 'MLflow', 'Weights & Biases', 'GitHub', 'Docker']) await expect(section).toContainText(name);
    const planned = page.locator('#features [data-group=planned] .feature-card');
    const mark = language === 'pt' ? `A partir da ${plannedVersion}` : `From ${plannedVersion}`;
    for (const card of await planned.all()) await expect(card.locator('.feature-mark')).toHaveText(mark);
    await expect(page.locator('#features [data-group=released] .feature-mark').first()).toHaveText(`${language === 'pt' ? 'Versão' : 'Version'} ${release.version}`);
    shape[language] = { steps: await page.locator('#workflow .step').count(), cards: await page.locator('#features .feature-card').count(), planned: await planned.count() };
    expect(shape[language].steps).toBe(6);
    for (const theme of ['dark', 'light']) {
      await page.locator(`[data-theme-option=${theme}]`).click();
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
        // Unreleased features say so; the Colab guide also names the version that already has training.
        await expect(page.locator('.guide-version')).toContainText(plannedVersion);
        if (slug === 'colab') await expect(page.locator('.guide-version')).toContainText(release.version);
        await expect(page.locator('.guide-sources a').first()).toHaveAttribute('href', /\/blob\/development\/docs\/gui\//);
        for (const anchor of await page.locator('.docs-toc a').all()) await expect(page.locator((await anchor.getAttribute('href'))!)).toHaveCount(1);
        await expect(page.locator('img')).toHaveCount(0);
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

  test('Colab guide keeps the 0.21.0 and 0.22 boundary, and the Code guide quotes the real tour map', async ({ page }) => {
    await page.goto('docs/colab/');
    await expect(page.locator('#drive')).toContainText(`a partir da ${plannedVersion}`);
    await page.goto('en/docs/codigo/');
    await expect(page.locator('article')).toContainText('"classification": CLASSIFICATION,');
    await expect(page.locator('article')).toContainText('nn.BCEWithLogitsLoss()');
  });
});

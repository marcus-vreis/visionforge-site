import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const lang of ['pt', 'en'] as const) {
  test(`${lang}: guides navigate, retain locale and serve example files`, async ({ page, request }) => {
    const prefix = lang === 'pt' ? './' : './en/';
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(prefix);
    await page.locator('.guide-cards a').last().click();
    await expect(page).toHaveURL(/\/docs\/task\/$/);
    await expect(page.locator('h1')).toHaveText(lang === 'pt' ? 'Sua página de treinamento' : 'Your training page');
    await expect(page.locator('article')).toContainText('research_weight');
    const pt = 'https://marcus-vreis.github.io/visionforge-site/docs/task/';
    const en = 'https://marcus-vreis.github.io/visionforge-site/en/docs/task/';
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', lang === 'pt' ? pt : en);
    await expect(page.locator('link[hreflang=en]')).toHaveAttribute('href', en);
    await page.getByRole('link', { name: lang === 'pt' ? 'English' : 'Português', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(lang === 'pt' ? '/en/docs/task/$' : '/visionforge-site/docs/task/$'));
    for (const slug of ['', 'model/', 'task/']) {
      await page.goto(`${prefix}docs/${slug}`);
      await expect(page.locator('.docs-sidebar a[aria-current=page]')).toHaveCount(1);
      for (const anchor of await page.locator('.docs-toc a').all()) {
        const hash = await anchor.getAttribute('href');
        await expect(page.locator(hash!)).toHaveCount(1);
      }
      await page.locator('img').evaluateAll(images => images.forEach(img => { (img as HTMLImageElement).loading = 'eager'; }));
      await expect.poll(() => page.locator('img').evaluateAll(images => images.every(node => { const img = node as HTMLImageElement; return img.complete && img.naturalWidth > 0; }))).toBe(true);
      const download = page.locator('a[download]');
      if (slug) {
        await expect(download).toHaveCount(1);
        const response = await request.get((await download.getAttribute('href'))!);
        expect(response.status()).toBe(200);
        expect(await response.text()).toContain(slug === 'model/' ? '@register_model("research_cnn")' : '@register_task(');
      }
    }
    expect(errors).toEqual([]);
  });
}

test('guide code copies exact content and offers a keyboard fallback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./docs/model/');
  const block = page.locator('[data-guide-code]').first();
  const text = await block.locator('pre').textContent() ?? '';
  await block.getByRole('button').click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(process.platform === 'win32' ? text.replace(/\n/g, '\r\n') : text);
  await expect(block.getByRole('status')).toHaveText('Copiado.');
  await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { value: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')), configurable: true }); });
  await block.getByRole('button').click();
  await expect(block.getByRole('status')).toContainText('Código selecionado');
  await expect(block.locator('pre')).toBeFocused();
  expect(await page.evaluate(() => getSelection()?.toString())).toBe(text);
});

for (const width of [360, 768, 1440]) {
  test(`guides remain accessible at ${width}px in both themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const slug of ['', 'model/', 'task/']) {
      await page.goto(`./docs/${slug}`);
      for (const theme of ['light', 'dark']) {
        await page.selectOption('#theme', theme);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        expect(results.violations).toEqual([]);
      }
    }
  });
}

test('all tutorials and downloads work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const locale of ['', 'en/']) {
    for (const slug of ['', 'model/', 'task/']) {
      await page.goto(`http://127.0.0.1:4322/visionforge-site/${locale}docs/${slug}`);
      await expect(page.locator('article h1')).toBeVisible();
      expect(await page.locator('.guide-section').count()).toBeGreaterThanOrEqual(5);
      await expect(page.locator('[data-copy-code]:visible')).toHaveCount(0);
      if (slug) await expect(page.locator('a[download]')).toBeVisible();
    }
  }
  await context.close();
});

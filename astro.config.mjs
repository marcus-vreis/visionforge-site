import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://marcus-vreis.github.io',
  base: '/visionforge-site',
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap()],
});

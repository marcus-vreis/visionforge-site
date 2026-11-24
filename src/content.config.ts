import { defineCollection } from 'astro:content';
import { release } from './content/release';

/** Raw CHANGELOG.md of the product at the tag of the published version. */
export const changelogUrl = `https://raw.githubusercontent.com/marcus-vreis/VisionForge/v${release.version}/CHANGELOG.md`;

/** Relative links of the product's files lead to the same files at the published tag. */
const absolute = (html: string) => html.replace(/href="(?!https?:|#|mailto:)([^"]+)"/g, (_, path: string) => `href="${release.repository}/blob/v${release.version}/${path}"`);

/**
 * The product's CHANGELOG.md at the tag of release.ts, fetched at build time.
 * There is no fallback: a failed fetch fails the build, so the page can never show another version's changelog.
 */
const changelog = defineCollection({
  loader: {
    name: 'visionforge-changelog',
    async load({ store, renderMarkdown, generateDigest }) {
      let response: Response;
      try { response = await fetch(changelogUrl); }
      catch (error) { throw new Error(`Changelog: could not fetch ${changelogUrl} (${(error as Error).message}). The build needs network access to GitHub.`); }
      if (!response.ok) throw new Error(`Changelog: ${changelogUrl} answered ${response.status} ${response.statusText}. Check that tag v${release.version} exists and that src/content/release.ts is right.`);
      const text = await response.text();
      // The page supplies its own h1, so the file's own title is dropped.
      const body = text.replace(/^# Changelog\r?\n/, '');
      if (!text.includes(`## [${release.version}]`)) throw new Error(`Changelog: ${changelogUrl} has no "## [${release.version}]" heading.`);
      const rendered = await renderMarkdown(body);
      store.clear();
      store.set({ id: release.version, data: {}, body, rendered: { ...rendered, html: absolute(rendered.html) }, digest: generateDigest(body) });
    },
  },
});

export const collections = { changelog };

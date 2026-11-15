import type { Guide, GuideBlock, GuideSection } from './guide-types';
import type { Language } from './types';
import { release } from './release';
import images from './guias/images.json';
import zeroPt from './guias/pt/comecando-do-zero.md?raw';
import knowPt from './guias/pt/ja-treino-modelos.md?raw';
import tourPt from './guias/pt/o-que-o-visionforge-faz.md?raw';
import zeroEn from './guias/en/comecando-do-zero.md?raw';
import knowEn from './guias/en/ja-treino-modelos.md?raw';
import tourEn from './guias/en/o-que-o-visionforge-faz.md?raw';

/**
 * The three entry guides of the product (docs/guias at the published tag), one per kind of reader.
 * The Portuguese files are byte-for-byte copies; the English ones are translations of them. This module only
 * parses the subset of Markdown they use and rewrites their relative links, so no sentence is written here.
 */
type Slug = 'comecando-do-zero' | 'ja-treino-modelos' | 'o-que-o-visionforge-faz';
const slugs: Slug[] = ['comecando-do-zero', 'ja-treino-modelos', 'o-que-o-visionforge-faz'];
/** Pages of docs/gui that this site also has as a guide. */
const siteGuides: Record<string, string> = { '../gui/colab.md': 'colab', '../gui/codigo.md': 'codigo' };
const shots = images as Record<string, { file: string; still?: string; width: number; height: number }>;

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
/** Heading to id: lower case, no accents, hyphens; a leading digit gets a letter so the id is a valid CSS selector. */
export const slugify = (title: string) => {
  const slug = title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return /^\d/.test(slug) ? `c${slug}` : slug;
};
/** Plain text of a Markdown span, for descriptions and alt texts. */
const plain = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*|`/g, '');

function parse(source: string, lang: Language, slug: Slug): Guide {
  const home = `${import.meta.env.BASE_URL}${lang === 'pt' ? '' : 'en/'}`;
  const anchors: string[] = [];
  const href = (url: string) => {
    if (/^https?:/.test(url)) return url;
    if (url.startsWith('#')) { anchors.push(url.slice(1)); return url; }
    const [path, hash] = url.split('#');
    const own = slugs.find(item => path === `${item}.md`);
    if (own) return `${home}docs/${own}/${hash ? `#${hash}` : ''}`;
    if (siteGuides[path]) return `${home}docs/${siteGuides[path]}/`;
    if (path.startsWith('../')) return `${release.repository}/blob/v${release.version}/docs/${path.slice(3)}${hash ? `#${hash}` : ''}`;
    throw new Error(`${slug} (${lang}): link not handled: ${url}`);
  };
  const marks = (text: string) => text.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const inline = (text: string) => escape(text).split(/(\[[^\]]+\]\([^)]+\))/).map(part => {
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    return link ? `<a href="${href(link[2].replaceAll('&amp;', '&'))}">${marks(link[1])}</a>` : marks(part);
  }).join('');
  const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map(cell => inline(cell.trim()));

  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let title = '';
  const intro: GuideBlock[] = [];
  const sections: GuideSection[] = [];
  let target = intro;
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    if (line.startsWith('# ')) { title = line.slice(2).trim(); i += 1; continue; }
    if (line.startsWith('## ')) {
      const heading = line.slice(3).trim();
      const section: GuideSection = { id: slugify(heading), title: heading, paragraphs: [], blocks: [] };
      sections.push(section);
      target = section.blocks!;
      i += 1; continue;
    }
    if (line.startsWith('### ')) { const heading = line.slice(4).trim(); target.push({ kind: 'h3', id: slugify(heading), html: inline(heading) }); i += 1; continue; }
    if (line.startsWith('```')) {
      const label = line.slice(3).trim();
      const body: string[] = [];
      for (i += 1; i < lines.length && !lines[i].startsWith('```'); i += 1) body.push(lines[i]);
      target.push({ kind: 'code', code: body.join('\n'), label: label === 'bash' ? 'Terminal' : label });
      i += 1; continue;
    }
    const image = /^!\[([^\]]*)\]\(\.\.\/images\/([\w.-]+)\)$/.exec(line.trim());
    if (image) {
      const shot = shots[image[2]];
      if (!shot) throw new Error(`${slug} (${lang}): image missing from images.json: ${image[2]}`);
      target.push({ kind: 'image', alt: image[1], ...shot });
      i += 1; continue;
    }
    if (line.startsWith('|')) {
      const rows: string[] = [];
      for (; i < lines.length && lines[i].startsWith('|'); i += 1) rows.push(lines[i]);
      target.push({ kind: 'table', head: cells(rows[0]), rows: rows.slice(2).map(cells) });
      continue;
    }
    const bullet = /^(- |\d+\. )/.exec(line);
    if (bullet) {
      const ordered = bullet[1] !== '- ';
      const items: string[] = [];
      for (; i < lines.length && lines[i].trim(); i += 1) {
        const start = /^(- |\d+\. )(.*)$/.exec(lines[i]);
        if (start) items.push(start[2]);
        else if (/^\s+\S/.test(lines[i]) && items.length) items[items.length - 1] += ` ${lines[i].trim()}`;
        else break;
      }
      target.push({ kind: ordered ? 'ol' : 'ul', items: items.map(inline) });
      continue;
    }
    const text: string[] = [];
    for (; i < lines.length && lines[i].trim() && !/^(#|\||```|!\[|- |\d+\. )/.test(lines[i]); i += 1) text.push(lines[i].trim());
    target.push({ kind: 'p', html: inline(text.join(' ')) });
  }
  const first = intro.shift();
  if (!title || first?.kind !== 'p' || !sections.length) throw new Error(`${slug} (${lang}): expected a title, an opening paragraph and sections`);
  const ids = sections.flatMap(section => [section.id, ...section.blocks!.flatMap(block => block.kind === 'h3' ? [block.id] : [])]);
  for (const anchor of anchors) if (!ids.includes(anchor)) throw new Error(`${slug} (${lang}): no heading for #${anchor}`);
  if (new Set(ids).size !== ids.length) throw new Error(`${slug} (${lang}): duplicate heading ids`);
  // The lede is the file's opening paragraph, without its Markdown marks.
  const opening = /^.*$/m.exec(source.replace(/\r\n/g, '\n').split('\n\n')[1].replace(/\n/g, ' '))![0];
  return { lang, slug, entry: true, title, description: plain(opening), intro, sections, source: `docs/guias/${slug}.md` };
}

/** Entry guides in reading order: never trained a model, already trains models, what the product does. */
export const entryGuides: Guide[] = [
  parse(zeroPt, 'pt', 'comecando-do-zero'), parse(knowPt, 'pt', 'ja-treino-modelos'), parse(tourPt, 'pt', 'o-que-o-visionforge-faz'),
  parse(zeroEn, 'en', 'comecando-do-zero'), parse(knowEn, 'en', 'ja-treino-modelos'), parse(tourEn, 'en', 'o-que-o-visionforge-faz'),
];

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
type Shot = { file: string; still?: string; width: number; height: number };
/** What the block readers need from the guide being parsed. */
interface Context { label: string; inline: (text: string) => string }
/** A block reader: the block that starts at `index`, if it is its kind, and the index of the line after it. */
type Reader = (lines: string[], index: number, context: Context) => { block: GuideBlock; next: number } | null;

const slugs: Slug[] = ['comecando-do-zero', 'ja-treino-modelos', 'o-que-o-visionforge-faz'];
/** Pages of docs/gui that this site also has as a guide. */
const siteGuides: Record<string, string> = { '../gui/colab.md': 'colab', '../gui/codigo.md': 'codigo' };
const shots = images as Record<string, Shot>;
const IMAGE_PREFIX = '](../images/';
const LIST_ITEM = /^(- |\d+\. )/;

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
/** Heading to id: lower case, no accents, hyphens; a leading digit gets a letter so the id is a valid CSS selector. */
export const slugify = (title: string) => {
  const words = title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const slug = words.join('-');
  return /^\d/.test(slug) ? `c${slug}` : slug;
};

/** Splits a line into plain text and `[label](url)` links, scanning by hand: the labels and urls never nest. */
function spans(text: string): Array<{ text: string } | { label: string; url: string }> {
  const out: Array<{ text: string } | { label: string; url: string }> = [];
  let from = 0;
  while (from < text.length) {
    const open = text.indexOf('[', from);
    const middle = open < 0 ? -1 : text.indexOf('](', open);
    const close = middle < 0 ? -1 : text.indexOf(')', middle);
    if (close < 0) break;
    if (open > from) out.push({ text: text.slice(from, open) });
    out.push({ label: text.slice(open + 1, middle), url: text.slice(middle + 2, close) });
    from = close + 1;
  }
  if (from < text.length) out.push({ text: text.slice(from) });
  return out;
}
/** Code spans and bold, on text that is already escaped. */
const marks = (text: string) => text.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
/** Plain text of a Markdown span, for the page description. */
const plain = (text: string) => spans(text).map(span => 'url' in span ? span.label : span.text).join('').replaceAll('**', '').replaceAll('`', '');

/** Where a link of the product files leads on this site. */
function resolve(url: string, home: string, label: string): string {
  if (/^https?:/.test(url) || url.startsWith('#')) return url;
  const [path, hash] = url.split('#');
  const suffix = hash ? `#${hash}` : '';
  const own = slugs.find(item => path === `${item}.md`);
  if (own) return `${home}docs/${own}/${suffix}`;
  if (siteGuides[path]) return `${home}docs/${siteGuides[path]}/`;
  if (path.startsWith('../')) return `${release.repository}/blob/v${release.version}/docs/${path.slice(3)}${suffix}`;
  throw new Error(`${label}: link not handled: ${url}`);
}

const readHeading: Reader = (lines, index, { inline }) => {
  if (!lines[index].startsWith('### ')) return null;
  const heading = lines[index].slice(4).trim();
  return { block: { kind: 'h3', id: slugify(heading), html: inline(heading) }, next: index + 1 };
};
const readCode: Reader = (lines, index) => {
  if (!lines[index].startsWith('```')) return null;
  const label = lines[index].slice(3).trim();
  let end = index + 1;
  while (end < lines.length && !lines[end].startsWith('```')) end += 1;
  return { block: { kind: 'code', code: lines.slice(index + 1, end).join('\n'), label: label === 'bash' ? 'Terminal' : label }, next: end + 1 };
};
const readImage: Reader = (lines, index, { label }) => {
  const line = lines[index].trim();
  const middle = line.indexOf(IMAGE_PREFIX);
  if (!line.startsWith('![') || middle < 0 || !line.endsWith(')')) return null;
  const name = line.slice(middle + IMAGE_PREFIX.length, -1);
  const shot = shots[name];
  if (!shot) throw new Error(`${label}: image missing from images.json: ${name}`);
  return { block: { kind: 'image', alt: line.slice(2, middle), ...shot }, next: index + 1 };
};
const readTable: Reader = (lines, index, { inline }) => {
  if (!lines[index].startsWith('|')) return null;
  let end = index;
  while (end < lines.length && lines[end].startsWith('|')) end += 1;
  const cells = (row: string) => row.trim().split('|').slice(1, -1).map(cell => inline(cell.trim()));
  return { block: { kind: 'table', head: cells(lines[index]), rows: lines.slice(index + 2, end).map(cells) }, next: end };
};
const readList: Reader = (lines, index, { inline }) => {
  const first = LIST_ITEM.exec(lines[index]);
  if (!first) return null;
  const items: string[] = [];
  let end = index;
  for (; end < lines.length && lines[end].trim(); end += 1) {
    const start = LIST_ITEM.exec(lines[end]);
    if (start) items.push(lines[end].slice(start[0].length));
    else if (lines[end].startsWith(' ')) items[items.length - 1] += ` ${lines[end].trim()}`;
    else break;
  }
  return { block: { kind: first[0] === '- ' ? 'ul' : 'ol', items: items.map(inline) }, next: end };
};
const startsBlock = (line: string) => line.startsWith('#') || line.startsWith('|') || line.startsWith('```') || line.startsWith('![') || LIST_ITEM.test(line);
const readParagraph: Reader = (lines, index, { inline }) => {
  let end = index;
  while (end < lines.length && lines[end].trim() && (end === index || !startsBlock(lines[end]))) end += 1;
  return { block: { kind: 'p', html: inline(lines.slice(index, end).map(line => line.trim()).join(' ')) }, next: end };
};
const readers: Reader[] = [readHeading, readCode, readImage, readTable, readList, readParagraph];

/** Title, blocks before the first section and the sections of a file, in order. */
function outline(lines: string[], context: Context): { title: string; intro: GuideBlock[]; sections: GuideSection[] } {
  let title = '';
  const intro: GuideBlock[] = [];
  const sections: GuideSection[] = [];
  let target = intro;
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    if (line.startsWith('# ')) { title = line.slice(2).trim(); index += 1; continue; }
    if (line.startsWith('## ')) {
      const heading = line.slice(3).trim();
      target = [];
      sections.push({ id: slugify(heading), title: heading, paragraphs: [], blocks: target });
      index += 1; continue;
    }
    let read: ReturnType<Reader> = null;
    for (const reader of readers) { read = reader(lines, index, context); if (read) break; }
    target.push(read!.block);
    index = read!.next;
  }
  return { title, intro, sections };
}

function parse(source: string, lang: Language, slug: Slug): Guide {
  const label = `${slug} (${lang})`;
  const home = `${import.meta.env.BASE_URL}${lang === 'pt' ? '' : 'en/'}`;
  const anchors: string[] = [];
  const link = (text: string, url: string) => {
    if (url.startsWith('#')) anchors.push(url.slice(1));
    return `<a href="${escape(resolve(url, home, label))}">${marks(escape(text))}</a>`;
  };
  const inline = (text: string) => spans(text).map(span => 'url' in span ? link(span.label, span.url) : marks(escape(span.text))).join('');
  const lines = source.replaceAll('\r\n', '\n').split('\n');
  const { title, intro, sections } = outline(lines, { label, inline });

  const opening = lines.slice(1).join('\n').trim().split('\n\n')[0].replaceAll('\n', ' ');
  const first = intro.shift();
  if (!title || first?.kind !== 'p' || !sections.length) throw new Error(`${label}: expected a title, an opening paragraph and sections`);
  const ids = sections.flatMap(section => [section.id, ...section.blocks!.flatMap(block => block.kind === 'h3' ? [block.id] : [])]);
  const missing = anchors.find(anchor => !ids.includes(anchor));
  if (missing) throw new Error(`${label}: no heading for #${missing}`);
  if (new Set(ids).size !== ids.length) throw new Error(`${label}: duplicate heading ids`);
  // The lede is the file's opening paragraph, without its Markdown marks.
  return { lang, slug, entry: true, title, description: plain(opening), intro, sections, source: `docs/guias/${slug}.md` };
}

/** Entry guides in reading order: never trained a model, already trains models, what the product does. */
export const entryGuides: Guide[] = [
  parse(zeroPt, 'pt', 'comecando-do-zero'), parse(knowPt, 'pt', 'ja-treino-modelos'), parse(tourPt, 'pt', 'o-que-o-visionforge-faz'),
  parse(zeroEn, 'en', 'comecando-do-zero'), parse(knowEn, 'en', 'ja-treino-modelos'), parse(tourEn, 'en', 'o-que-o-visionforge-faz'),
];

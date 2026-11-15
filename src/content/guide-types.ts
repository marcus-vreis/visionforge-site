import type { Language } from './types';
import type { FigureId } from './figures';

/** One block of a guide parsed from a Markdown file of the product (entry-guides.ts). Text fields hold escaped HTML. */
export type GuideBlock =
  | { kind: 'p'; html: string }
  | { kind: 'h3'; id: string; html: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'code'; code: string; label: string }
  | { kind: 'image'; file: string; still?: string; alt: string; width: number; height: number };

/** A static tutorial section, with optional runnable or explicitly partial code. */
export interface GuideSection {
  id: string;
  title: string;
  paragraphs: string[];
  steps?: string[];
  list?: string[];
  code?: string;
  codeLabel?: string;
  note?: string;
  /** An annotated capture from figures.ts, shown after the section's paragraphs. */
  figure?: FigureId;
  /** Body parsed from Markdown; used by the entry guides instead of paragraphs, steps and list. */
  blocks?: GuideBlock[];
}

/** A localized guide sharing the same slug across languages. */
export interface Guide {
  lang: Language;
  slug: '' | 'model' | 'task' | 'project' | 'colab' | 'publicar' | 'codigo' | 'comecando-do-zero' | 'ja-treino-modelos' | 'o-que-o-visionforge-faz';
  /** Entry guides are listed apart, one per kind of reader. */
  entry?: boolean;
  /** Blocks between the lede and the first section. */
  intro?: GuideBlock[];
  title: string;
  description: string;
  sections: GuideSection[];
  source: string;
  /** Git ref of the source link; defaults to the published release tag. Use a branch for pages that only exist in development. */
  sourceRef?: string;
  /** Version mark shown under the title instead of the published version, for features not released yet. */
  availability?: string;
  references?: Array<{ label: string; url: string }>;
}

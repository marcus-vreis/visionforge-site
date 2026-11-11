import type { Language } from './types';

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
}

/** A localized guide sharing the same slug across languages. */
export interface Guide {
  lang: Language;
  slug: '' | 'model' | 'task' | 'project' | 'colab' | 'publicar' | 'codigo';
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

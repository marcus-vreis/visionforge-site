import type { Language } from './types';

/** A static tutorial section, with optional runnable or explicitly partial code. */
export interface GuideSection {
  id: string;
  title: string;
  paragraphs: string[];
  steps?: string[];
  code?: string;
  codeLabel?: string;
  note?: string;
}

/** A localized guide sharing the same slug across languages. */
export interface Guide {
  lang: Language;
  slug: '' | 'model' | 'task';
  title: string;
  description: string;
  sections: GuideSection[];
  source: string;
}

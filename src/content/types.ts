/** The two published website languages. */
export type Language = 'pt' | 'en';

/** Translated presentation content consumed by shared components. */
export interface SiteCopy {
  lang: Language;
  title: string;
  description: string;
  nav: { tasks: string; research: string; install: string; docs: string; skip: string; theme: string; system: string; light: string; dark: string };
  hero: { eyebrow: string; title: string; emphasis: string; description: string; install: string; github: string; caption: string; local: string; open: string; tasks: string };
  tasks: { eyebrow: string; title: string; intro: string; models: string; metrics: string; illustration: string; items: Array<{ id: string; name: string; short: string; description: string; models: string; metrics: string }> };
  workflow: { eyebrow: string; title: string; steps: Array<{ title: string; description: string }> };
  research: { eyebrow: string; title: string; intro: string; items: Array<{ title: string; description: string }>; note: string };
  install: { eyebrow: string; title: string; intro: string; requirements: string; osLabel: string; copy: string; copied: string; copyFailed: string; prerequisites: string; steps: string; gpu: string; cpu: string; mac: string; terminal: string; verified: string; guide: string; downloads: string; wheel: string; source: string; noExecutable: string; update: string };
  resources: { eyebrow: string; title: string; intro: string; items: Array<{ title: string; description: string; path: string }>; citation: string; citeLabel: string };
  footer: { description: string; source: string; release: string; made: string };
}

import type { Language } from '../content/types';
import { strategies, studioSteps, studioTasks, studioText, type StudioTask } from '../content/studio';

/** What the replica is showing: the task, the step and the choices made in each task. */
export interface StudioState {
  task: StudioTask['id'];
  step: (typeof studioSteps)[number]['id'];
  strategy: Record<string, keyof typeof strategies>;
  model: Record<string, string>;
  /** Tasks whose Data step has a dataset; classification starts with the application's sample dataset. */
  dataset: Record<string, boolean>;
  trained: boolean;
}

/** The state the page is built with and the script starts from. */
export function initialState(): StudioState {
  return {
    task: 'classification',
    step: 'data',
    strategy: Object.fromEntries(studioTasks.map(task => [task.id, 'simple'])),
    model: Object.fromEntries(studioTasks.map(task => [task.id, task.model])),
    dataset: { classification: true },
    trained: false,
  };
}

const escape = (value: string | number) => String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!);
const SAMPLE_PATH = String.raw`C:\vf-demo\datasets\exemplo-classificacao`;

/** Whether the Train button is unlocked: the Review step is open and the task has a dataset. */
export function canTrain(state: StudioState): boolean {
  return state.step === 'review' && Boolean(state.dataset[state.task]);
}

/** The inner HTML of the replica for a state. Used at build time and again in the browser after every click. */
export function renderStudio(state: StudioState, lang: Language, version: string): string {
  const t = (key: keyof typeof studioText) => escape(studioText[key][lang]);
  const task = studioTasks.find(item => item.id === state.task)!;
  const stepIndex = studioSteps.findIndex(item => item.id === state.step);
  const step = studioSteps[stepIndex];
  const strategy = strategies[state.strategy[task.id]];
  const model = state.model[task.id];
  const hasData = Boolean(state.dataset[task.id]);
  const changed = (count: number) => escape(count === 1 ? studioText.chipChangedOne[lang] : studioText.chipChanged[lang].replace('{n}', String(count)));
  const chip = (text: string, tone = '') => `<span class="vf-chip ${tone}">${text}</span>`;

  const summaries: Record<string, { text: string; chip: string }> = {
    data: { text: hasData ? 'exemplo-classificacao' : '', chip: hasData ? chip(changed(2), 'is-accent') : chip(t('chipMissing'), 'is-warn') },
    strategy: { text: escape(strategy.label[lang]), chip: state.strategy[task.id] === 'simple' ? chip(t('chipDefault')) : chip(changed(1), 'is-accent') },
    model: { text: escape(model), chip: model === task.model ? chip(t('chipDefault')) : chip(changed(1), 'is-accent') },
    training: { text: `e${task.epochs} · lr ${task.learningRate}`, chip: chip(t('chipDefault')) },
    image: { text: `${task.imageSize} px`, chip: chip(t('chipDefault')) },
    review: { text: '', chip: '' },
  };

  const field = (label: string, value: string | number) => `<div class="vf-field"><span class="vf-label">${label}</span><span class="vf-input">${escape(value)}</span></div>`;
  const panels: Record<string, () => string> = {
    data: () => `
      <div class="vf-card" data-spot="dataset">
        <span class="vf-kicker">// dataset</span>
        <div class="vf-field"><span class="vf-label">${t('dataset')}</span><span class="vf-help">${t('datasetHelp')}</span>
          <span class="vf-input ${hasData ? '' : 'is-empty'}">${hasData ? escape(SAMPLE_PATH) : t('datasetPlaceholder')}</span></div>
        ${task.id === 'classification' ? `<button type="button" class="vf-link" data-act="sample">${t('example')}</button>` : `<p class="vf-note">${t('formats')}</p>`}
        ${hasData ? `<p class="vf-ok">${t('splits')}</p>` : ''}
      </div>
      ${hasData ? `<div class="vf-card"><span class="vf-kicker">// ${t('distribution')}</span><div class="vf-dist">${(['train', 'val', 'test'] as const).map(split => `
        <div class="vf-split"><span class="vf-split-head"><span>${t(split)}</span><b>12</b></span>${['class_a', 'class_b'].map(name => `<span class="vf-bar-row"><span>${name}</span><span>6</span></span><span class="vf-meter"><i></i></span>`).join('')}</div>`).join('')}</div></div>` : ''}`,
    strategy: () => `
      <div class="vf-card" data-spot="card">
        <span class="vf-kicker">${t('strategy')}</span>
        <div class="vf-seg" role="group" aria-label="${t('mode')}">${task.strategies.map(id => `<button type="button" data-act="strategy" data-value="${id}" aria-pressed="${state.strategy[task.id] === id}">${escape(strategies[id].label[lang])}</button>`).join('')}</div>
        ${strategy.hint[lang] ? `<p class="vf-note">${escape(strategy.hint[lang])}</p>` : ''}
      </div>`,
    model: () => `
      <div class="vf-card" data-spot="card">
        <span class="vf-kicker">// ${t('architecture')}</span>
        <div class="vf-models" role="group" aria-label="${t('architecture')}">${task.models.map(name => `<button type="button" data-act="model" data-value="${escape(name)}" aria-pressed="${model === name}">${escape(name)}</button>`).join('')}</div>
      </div>`,
    training: () => `
      <div class="vf-card"><div class="vf-grid">
        ${field(t('epochs'), task.epochs)}${field(t('learningRate'), task.learningRate)}${field(t('batchSize'), task.batchSize)}${task.id === 'detection' ? field(t('seed'), 0) : field(t('seed'), 42)}
      </div></div>`,
    image: () => `
      <div class="vf-card"><span class="vf-kicker">// ${lang === 'pt' ? 'imagem' : 'image'}</span><div class="vf-grid">${field(t('imageSize'), `${task.imageSize} px`)}</div></div>
      ${task.id === 'classification' ? `<div class="vf-card"><span class="vf-kicker">// data augmentation</span><div class="vf-grid">${field('Flip horizontal', lang === 'pt' ? 'ligado' : 'on')}${field(lang === 'pt' ? 'Rotação (graus)' : 'Rotation (degrees)', 10)}${field('Color jitter', lang === 'pt' ? 'desligado' : 'off')}</div></div>` : ''}`,
    review: () => `
      <div class="vf-review">${studioSteps.slice(0, 5).map(item => `<div class="vf-card"><span class="vf-kicker">${escape(item.name[lang])}</span><p class="vf-review-value">${summaries[item.id].text || '—'}</p></div>`).join('')}</div>
      <p class="${hasData ? 'vf-ok' : 'vf-warn'}">${hasData ? t('ready') : t('blocked')}</p>
      ${state.trained ? `<p class="vf-demo-note" role="status">${t('trained')}</p>` : ''}`,
  };

  const unlocked = canTrain(state);
  const lockReason = state.step !== 'review' ? t('lockedStep') : t('lockedData');
  return `
  <div class="vf-head">
    <span class="vf-logo" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="5" stroke="currentColor" stroke-width="2"/><path d="M16 4v6m0 12v6M4 16h6m12 0h6" stroke="currentColor" stroke-width="2"/></svg></span>
    <span class="vf-brand"><span>Vision<b>Forge</b></span><small>${t('subtitle')} · v${escape(version)}</small></span>
    <span class="vf-head-chips" aria-hidden="true"><span class="vf-pill">${t('colab')}</span><span class="vf-pill"><b>${lang === 'pt' ? 'PT' : 'EN'}</b> ${lang === 'pt' ? 'EN' : 'PT'}</span></span>
    <button type="button" class="vf-pill" data-act="tour" title="${t('tourReplay')}">◎ ${t('guide')}</button>
  </div>
  <div class="vf-tabs" role="tablist" data-spot="tabs">${studioTasks.map(item => `<button type="button" role="tab" data-act="task" data-value="${item.id}" aria-selected="${item.id === task.id}" tabindex="${item.id === task.id ? 0 : -1}" style="--dot:${item.accent}"><i aria-hidden="true"></i>${escape(item.label[lang])}</button>`).join('')}</div>
  <div class="vf-hero">
    <div><span class="vf-kicker">// task / ${task.short}</span><p class="vf-title">${escape(task.label[lang])}</p><p class="vf-desc">${escape(task.description[lang])}</p></div>
    <span class="vf-taskchip"><small>task</small>${task.short}</span>
  </div>
  <div class="vf-body">
    <ol class="vf-rail" data-spot="rail">${studioSteps.map((item, i) => `<li><button type="button" data-act="step" data-value="${item.id}" aria-current="${item.id === step.id ? 'step' : 'false'}"><span class="vf-num">0${i + 1}</span><span class="vf-step-name">${escape(item.name[lang])}</span>${summaries[item.id].text ? `<span class="vf-step-sum">${summaries[item.id].text}</span>` : ''}${summaries[item.id].chip}</button></li>`).join('')}</ol>
    <div class="vf-panel">
      <span class="vf-kicker">${escape(studioText.stepOf[lang].replace('{i}', String(stepIndex + 1)))}</span>
      <p class="vf-step-title">${escape(step.name[lang])}</p>
      <p class="vf-desc">${escape(step.description[lang])}</p>
      ${panels[step.id]()}
      <div class="vf-nav">${stepIndex > 0 ? `<button type="button" class="vf-btn" data-act="step" data-value="${studioSteps[stepIndex - 1].id}">${t('back')}</button>` : '<span></span>'}${stepIndex < 5 ? `<button type="button" class="vf-btn is-accent" data-act="step" data-value="${studioSteps[stepIndex + 1].id}">${t('next')}</button>` : ''}</div>
    </div>
  </div>
  <div class="vf-bar">
    <span class="vf-bar-side" data-spot="history"><span class="vf-btn is-static">↶ ${t('history')}</span><span class="vf-btn is-static">⤓ ${t('datasets')}</span></span>
    <button type="button" class="vf-train" data-act="train" data-spot="train" aria-disabled="${!unlocked}" ${unlocked ? '' : `title="${lockReason}"`}>▶ ${escape(strategy.run[lang])}</button>
    <span class="vf-btn is-static vf-device" data-spot="device"><i aria-hidden="true"></i>${t('using')} <b>CPU</b></span>
  </div>`;
}

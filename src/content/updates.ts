/** One earlier release, summarised from the product's CHANGELOG.md at the published tag. */
export interface Update { version: string; date: string; pt: string; en: string }

/** Earlier releases shown under the current one; each line restates a CHANGELOG entry and adds nothing to it. */
export const updates: Update[] = [
  { version: '0.20.2', date: '2026-11-03', pt: 'A aba do navegador passa a mostrar o símbolo do VisionForge, e as capturas do README mostram o assistente de etapas.', en: 'The browser tab shows the VisionForge mark, and the README captures show the step wizard.' },
  { version: '0.20.1', date: '2026-11-02', pt: 'Fila na mesma aba: com um treino rodando ou esperando, o botão principal vira Colocar na fila.', en: 'Queue in the same tab: with a run in progress or waiting, the main button becomes Add to queue.' },
  { version: '0.20.0', date: '2026-11-02', pt: 'Learning rate sugerido por arquitetura na comparação de modelos e no grid search da classificação.', en: 'Suggested learning rate per architecture in model comparison and grid search for classification.' },
  { version: '0.19.0', date: '2026-11-01', pt: 'Todas as tarefas passam a ser configuradas em seis etapas, e o botão Treinar destrava na Revisão.', en: 'Every task is now configured in six steps, and the Train button unlocks at Review.' },
];

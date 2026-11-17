/** One earlier release, summarised from the product's CHANGELOG.md at the published tag; `kind` is the changelog heading it sits under. */
export interface Update { version: string; date: string; kind: 'added' | 'changed' | 'fixed'; pt: string; en: string }

/** Earlier releases shown under the current one; each line restates a CHANGELOG entry and adds nothing to it. */
export const updates: Update[] = [
  { version: '0.22.1', date: '2026-11-15', kind: 'fixed', pt: 'O detalhe de uma execução de regressão, segmentação ou anomalia mostra rótulos legíveis das métricas, em vez do nome cru do run.json.', en: 'The detail of a regression, segmentation or anomaly run shows readable metric labels instead of the raw run.json names.' },
  { version: '0.21.0', date: '2026-11-05', kind: 'added', pt: 'Treino de classificação no Google Colab: com o perfil conectado, o treino roda numa máquina do Colab e volta para esta máquina como uma execução do Histórico, marcada como Colab.', en: 'Classification training on Google Colab: with the profile connected, training runs on a Colab machine and comes back to this machine as a History run, marked Colab.' },
  { version: '0.21.0', date: '2026-11-05', kind: 'added', pt: 'Aba Resultados na tela de treino: curvas de loss e da métrica da tarefa durante o treino.', en: 'Results tab on the training screen: loss and task-metric curves during training.' },
  { version: '0.20.2', date: '2026-11-03', kind: 'changed', pt: 'A aba do navegador passa a mostrar o símbolo do VisionForge, e as capturas do README mostram o assistente de etapas.', en: 'The browser tab shows the VisionForge mark, and the README captures show the step wizard.' },
  { version: '0.20.1', date: '2026-11-02', kind: 'fixed', pt: 'Fila na mesma aba: com um treino rodando ou esperando, o botão principal vira Colocar na fila.', en: 'Queue in the same tab: with a run in progress or waiting, the main button becomes Add to queue.' },
  { version: '0.20.0', date: '2026-11-02', kind: 'added', pt: 'Learning rate sugerido por arquitetura na comparação de modelos e no grid search da classificação.', en: 'Suggested learning rate per architecture in model comparison and grid search for classification.' },
];

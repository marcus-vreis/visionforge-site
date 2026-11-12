import type { Language } from './types';

/**
 * A real run.json, written by `visionforge run` on 2026-11-12 for the handwritten-digits case of the guides:
 * 120 images, 1 epoch, CPU, product checkout 643902d (version 0.21.0). Lines are copied from the file.
 * Objects shown as `{ … }` or `[ … ]` are folded, and the start of `run_dir` is shortened; nothing else is changed.
 * The metrics of this one-epoch check are folded on purpose: they say nothing about the model.
 */
export const runJsonPath = 'outputs/models/digits_research_cnn/20261112_161628_505658/run.json';

/** One line of the file and, when it belongs to an explained group, the id of its note. */
export const runJsonLines: Array<[text: string, note?: string]> = [
  ['{'],
  ['  "id": "digits_research_cnn_20261112_161628_505658",', 'identity'],
  ['  "experiment": "digits_research_cnn",', 'identity'],
  ['  "timestamp": "2026-11-12T16:16:29.017213",', 'identity'],
  ['  "status": "completed",', 'status'],
  ['  "stopped": false,', 'status'],
  ['  "device_used": "cpu",', 'device'],
  ['  "environment": {', 'environment'],
  ['    "python": "3.13.16",', 'environment'],
  ['    "platform": "Windows-11-10.0.26300-SP0",', 'environment'],
  ['    "torch": "2.14.1+cu130",', 'environment'],
  ['    "torchvision": "0.29.1+cu130",', 'environment'],
  ['    "numpy": "2.4.3",', 'environment'],
  ['    "scipy": "1.17.1",', 'environment'],
  ['    "scikit-learn": "1.8.0",', 'environment'],
  ['    "ultralytics": "8.4.60",', 'environment'],
  ['    "timm": "1.0.27",', 'environment'],
  ['    "optuna": "4.9.0",', 'environment'],
  ['    "pillow": "12.1.1",', 'environment'],
  ['    "pydantic": "2.12.5",', 'environment'],
  ['    "visionforge": "0.21.0",', 'environment'],
  ['    "cuda": "13.0",', 'environment'],
  ['    "cudnn": "92400",', 'environment'],
  ['    "gpu": "none",', 'environment'],
  ['    "git_revision": "643902d55a9ed90263bdc8feef7220ee9ed72e71",', 'environment'],
  ['    "git_dirty": "true"', 'environment'],
  ['  },', 'environment'],
  ['  "runtime": { "loader_workers": { … } },', 'runtime'],
  ['  "dataset_fingerprint": {', 'fingerprint'],
  ['    "digest": "64507b5329935f66f5d341492121aa24cf04e0757884de7438c013142cc6e64a",', 'fingerprint'],
  ['    "method": "manifest",', 'fingerprint'],
  ['    "n_files": 121,', 'fingerprint'],
  ['    "total_bytes": 32115,', 'fingerprint'],
  ['    "root": "datasets\\\\digits",', 'fingerprint'],
  ['    "note": "paths+sizes only: a modification that preserves file size is not detected",', 'fingerprint'],
  ['    "encoding_version": 2', 'fingerprint'],
  ['  },', 'fingerprint'],
  ['  "run_dir": "…\\\\outputs\\\\models\\\\digits_research_cnn\\\\20261112_161628_505658",', 'run_dir'],
  ['  "class_names": [ … ],', 'classes'],
  ['  "config": { … },', 'config'],
  ['  "metrics": { … },', 'metrics'],
  ['  "history": [ … ],', 'history'],
  ['  "artifacts": { … },', 'artifacts'],
  ['  "tests": [],'],
  ['  "warnings": [ … ],', 'warnings'],
  ['  "metric_cis": { … }', 'cis'],
  ['}'],
];

/** What each group of lines records. */
export const runJsonNotes: Record<string, Record<Language, string>> = {
  identity: { pt: 'Nome do experimento, pasta da execução e data e hora de gravação.', en: 'Experiment name, run folder, and the date and time of writing.' },
  status: { pt: 'Se o treino terminou ou foi interrompido antes do fim.', en: 'Whether training finished or was stopped early.' },
  device: { pt: 'Dispositivo em que o treino rodou de fato.', en: 'The device training actually ran on.' },
  environment: { pt: 'Versões de Python, sistema e bibliotecas, do próprio VisionForge, o CUDA, cuDNN e GPU em uso e, num checkout do código-fonte, o commit.', en: 'Versions of Python, the platform and the libraries, of VisionForge itself, the CUDA, cuDNN and GPU in use and, in a source checkout, the commit.' },
  runtime: { pt: 'Número de workers de cada data loader.', en: 'Worker count of each data loader.' },
  fingerprint: { pt: 'Hash do dataset usado e como foi calculado; a retomada de um treino confere esse valor.', en: 'Hash of the dataset used and how it was computed; resuming a run checks this value.' },
  run_dir: { pt: 'Pasta local com checkpoints, histórico e relatórios.', en: 'Local folder with checkpoints, history and reports.' },
  classes: { pt: 'Nomes das classes, na ordem dos índices do modelo.', en: 'Class names, in the order of the model indices.' },
  config: { pt: 'A configuração completa do experimento, com a seed e o schema_version.', en: 'The full experiment configuration, with the seed and the schema_version.' },
  metrics: { pt: 'Melhor época, total de épocas e métricas no conjunto de teste.', en: 'Best epoch, total epochs and the metrics on the test set.' },
  history: { pt: 'Uma entrada por época.', en: 'One entry per epoch.' },
  artifacts: { pt: 'Caminho do checkpoint, dos gráficos e do relatório.', en: 'Paths of the checkpoint, the plots and the report.' },
  warnings: { pt: 'Avisos do treino. Neste, o de que o modelo previu uma única classe, esperado depois de uma só época.', en: 'Training warnings. Here, that the model predicted a single class, expected after a single epoch.' },
  cis: { pt: 'Intervalo de confiança bootstrap de 95% de cada métrica de teste.', en: '95% bootstrap confidence interval of each test metric.' },
};

import type { Language } from './types';

type Text = Record<Language, string>;

/** One task of the simplified interface: labels, colours and defaults read from the product's frontend at v0.21.0. */
export interface StudioTask {
  id: 'classification' | 'detection' | 'regression' | 'segmentation' | 'anomaly';
  /** Chip and breadcrumb value shown by the application. */
  short: string;
  /** Tab colour (types/tasks.ts); the light theme uses the hue of index.css, darkened so text in it meets contrast. */
  accent: string;
  accentLight: string;
  label: Text;
  description: Text;
  strategies: Array<keyof typeof strategies>;
  model: string;
  models: string[];
  epochs: number;
  learningRate: number;
  batchSize: number;
  imageSize: number;
}

/** Strategy labels, the hint shown beside them and the label the main button takes. */
export const strategies = {
  simple: { label: { pt: 'Treino simples', en: 'Single run' }, hint: { pt: 'um treino com a config abaixo (botão Treinar)', en: 'one run with the config below (Train button)' }, run: { pt: 'Treinar', en: 'Train' } },
  cv: { label: { pt: 'K-Fold (CV)', en: 'K-fold (CV)' }, hint: { pt: 'K folds sobre o treino → métricas fold a fold + média ± desvio', en: 'K folds over the training set → per-fold metrics + mean ± std' }, run: { pt: 'Rodar K-fold', en: 'Run K-fold' } },
  grid: { label: { pt: 'Grid search', en: 'Grid search' }, hint: { pt: '', en: '' }, run: { pt: 'Treinar', en: 'Train' } },
  random: { label: { pt: 'Random search', en: 'Random search' }, hint: { pt: '', en: '' }, run: { pt: 'Treinar', en: 'Train' } },
  sweep: { label: { pt: 'Sweep', en: 'Sweep' }, hint: { pt: 'grid / random / optuna sobre a config abaixo', en: 'grid / random / optuna over the config below' }, run: { pt: 'Rodar sweep', en: 'Run sweep' } },
  replicates: { label: { pt: 'Réplicas', en: 'Replicates' }, hint: { pt: 'mesma config, N seeds → média ± IC 95%', en: 'same config, N seeds → mean ± 95% CI' }, run: { pt: 'Rodar réplicas', en: 'Run replicates' } },
  compare: { label: { pt: 'Comparar arquiteturas', en: 'Compare architectures' }, hint: { pt: 'uma run por arquitetura, mesma config → tabela comparativa', en: 'one run per architecture, same config → comparison table' }, run: { pt: 'Comparar arquiteturas', en: 'Compare architectures' } },
} satisfies Record<string, { label: Text; hint: Text; run: Text }>;

export const studioTasks: StudioTask[] = [
  { id: 'classification', short: 'class', accent: '#f16363', accentLight: 'oklch(0.48 0.18 22)',
    label: { pt: 'Classificação', en: 'Classification' }, description: { pt: 'Categorize imagens em rótulos discretos.', en: 'Sort images into discrete classes.' },
    strategies: ['simple', 'cv', 'grid', 'random'], model: 'resnet18',
    models: ['resnet18', 'resnet34', 'resnet50', 'resnet101', 'efficientnet_b1', 'efficientnet_b7', 'vgg16', 'vgg19', 'alexnet', 'vit_b_16', 'swin_t', 'convnext_tiny'],
    epochs: 20, learningRate: 0.001, batchSize: 32, imageSize: 224 },
  { id: 'detection', short: 'detect', accent: '#48cf8e', accentLight: 'oklch(0.42 0.13 150)',
    label: { pt: 'Detecção de Objeto', en: 'Object detection' }, description: { pt: 'Localize e classifique objetos com bounding boxes.', en: 'Locate and classify objects with bounding boxes.' },
    strategies: ['simple', 'sweep', 'replicates'], model: 'yolo11n',
    models: ['yolo26n', 'yolo11n', 'yolo12n', 'Faster R-CNN (R50-FPN)', 'RetinaNet', 'SSD300', 'SSDLite320'],
    epochs: 100, learningRate: 0.01, batchSize: 16, imageSize: 640 },
  { id: 'regression', short: 'reg', accent: '#5b9fff', accentLight: 'oklch(0.45 0.16 240)',
    label: { pt: 'Regressão', en: 'Regression' }, description: { pt: 'Estime valores contínuos a partir das entradas.', en: 'Estimate continuous values from the inputs.' },
    strategies: ['simple', 'cv', 'sweep', 'replicates'], model: 'resnet18',
    models: ['resnet18', 'resnet34', 'resnet50', 'resnet101', 'efficientnet_b1', 'efficientnet_b7', 'vgg16', 'vgg19', 'alexnet', 'vit_b_16', 'swin_t', 'convnext_tiny'],
    epochs: 20, learningRate: 0.001, batchSize: 32, imageSize: 224 },
  { id: 'segmentation', short: 'seg', accent: '#b079ff', accentLight: 'oklch(0.45 0.18 305)',
    label: { pt: 'Segmentação', en: 'Segmentation' }, description: { pt: 'Máscaras a nível de pixel para cada categoria.', en: 'Pixel-level masks for each category.' },
    strategies: ['simple', 'cv', 'sweep', 'replicates'], model: 'unet',
    models: ['unet', 'DeepLabV3 · R50', 'DeepLabV3 · R101', 'FCN · R50', 'FCN · R101', 'LRASPP MobileNetV3-L'],
    epochs: 20, learningRate: 0.001, batchSize: 32, imageSize: 512 },
  { id: 'anomaly', short: 'anom', accent: '#f5a524', accentLight: 'oklch(0.43 0.11 75)',
    label: { pt: 'Anomalia', en: 'Anomaly' }, description: { pt: 'Detecte defeitos treinando só com imagens normais.', en: 'Detect defects by training on normal images only.' },
    strategies: ['simple', 'compare', 'replicates'], model: 'autoencoder',
    models: ['autoencoder', 'patchcore'],
    epochs: 30, learningRate: 0.001, batchSize: 32, imageSize: 256 },
];

/** The six configuration steps, with the title and one-line description the application shows. */
export const studioSteps = [
  { id: 'data', name: { pt: 'Dados', en: 'Data' }, description: { pt: 'De onde vêm as imagens e o que foi encontrado nelas.', en: 'Where the images come from and what was found in them.' } },
  { id: 'strategy', name: { pt: 'Estratégia', en: 'Strategy' }, description: { pt: 'Quantos treinos rodar e como compará-los.', en: 'How many runs and how to compare them.' } },
  { id: 'model', name: { pt: 'Modelo', en: 'Model' }, description: { pt: 'O que treina e de onde parte.', en: 'What trains and where it starts from.' } },
  { id: 'training', name: { pt: 'Treinamento', en: 'Training' }, description: { pt: 'Quanto e como treinar; o resto fica em Avançado.', en: 'How long and how to train; the rest is under Advanced.' } },
  { id: 'image', name: { pt: 'Imagem e aumento', en: 'Image & augmentation' }, description: { pt: 'Como cada imagem chega ao modelo, com preview.', en: 'How each image reaches the model, with a preview.' } },
  { id: 'review', name: { pt: 'Revisão', en: 'Review' }, description: { pt: 'Confira, dê um nome e treine pela barra abaixo.', en: 'Check it, name it and train from the bar below.' } },
] as const;

/** Interface strings of the replica, in the application's own wording where it has one. */
export const studioText = {
  subtitle: { pt: 'local ai studio', en: 'local ai studio' },
  colab: { pt: 'colab · desligado', en: 'colab · off' },
  guide: { pt: 'guia', en: 'guide' },
  stepOf: { pt: 'etapa {i} de 6', en: 'step {i} of 6' },
  chipDefault: { pt: 'padrão', en: 'default' },
  chipMissing: { pt: 'falta', en: 'missing' },
  chipChanged: { pt: '{n} ajustes', en: '{n} changes' },
  chipChangedOne: { pt: '1 ajuste', en: '1 change' },
  history: { pt: 'histórico', en: 'history' },
  datasets: { pt: 'datasets', en: 'datasets' },
  using: { pt: 'usando', en: 'using' },
  next: { pt: 'Próximo →', en: 'Next →' },
  back: { pt: '← Anterior', en: '← Back' },
  // Data
  dataset: { pt: 'Pasta base do dataset', en: 'Dataset base folder' },
  datasetHelp: { pt: 'Pasta raiz que contém treino, validação e teste.', en: 'Root folder that holds the train, validation and test sets.' },
  datasetPlaceholder: { pt: 'ex: C:/datasets/coffee', en: 'e.g. C:/datasets/coffee' },
  example: { pt: 'usar dataset de exemplo', en: 'use the sample dataset' },
  splits: { pt: "Splits detectados: treino='train', validação='val', teste='test'.", en: "Splits detectados: treino='train', validação='val', teste='test'." },
  distribution: { pt: 'distribuição do dataset', en: 'dataset distribution' },
  train: { pt: 'treino', en: 'train' },
  val: { pt: 'validação', en: 'validation' },
  test: { pt: 'teste', en: 'test' },
  formats: { pt: 'Cada tarefa tem o seu formato de dataset, descrito na referência de datasets.', en: 'Each task has its own dataset format, described in the datasets reference.' },
  // Strategy
  strategy: { pt: 'estratégia de experimento', en: 'experiment strategy' },
  mode: { pt: 'modo', en: 'mode' },
  // Model
  architecture: { pt: 'Arquitetura', en: 'Architecture' },
  // Training
  epochs: { pt: 'Épocas', en: 'Epochs' },
  learningRate: { pt: 'Learning rate', en: 'Learning rate' },
  batchSize: { pt: 'Batch size', en: 'Batch size' },
  seed: { pt: 'Seed', en: 'Seed' },
  // Image
  imageSize: { pt: 'Tamanho da imagem', en: 'Image size' },
  // Review
  ready: { pt: 'Tudo certo. O botão Treinar, na barra abaixo, está liberado.', en: 'All set. The Train button in the bar below is enabled.' },
  blocked: { pt: 'Falta escolher o dataset na etapa Dados para liberar o Treinar.', en: 'Choose the dataset in the Data step to enable Train.' },
  lockedStep: { pt: 'Abra a etapa Revisão para liberar o Treinar', en: 'Open the Review step to enable Train' },
  lockedData: { pt: 'Escolha o dataset na etapa Dados para liberar o Treinar', en: 'Choose the dataset in the Data step to enable Train' },
  // Words of the replica itself, not of the application.
  demo: { pt: 'Demonstração simplificada da interface, com os padrões da versão {version}. Não treina nem lê arquivos.', en: 'A simplified demonstration of the interface, with the defaults of version {version}. It does not train or read files.' },
  trained: { pt: 'Na aplicação, o treino começa aqui: a tela passa a mostrar o log, as curvas por época e a melhor época. Esta demonstração para neste ponto.', en: 'In the application, training starts here: the screen switches to the log, the per-epoch curves and the best epoch. This demonstration stops at this point.' },
  tourStart: { pt: 'Roteiro guiado', en: 'Guided tour' },
  tourStop: { pt: 'Sair do roteiro', en: 'Leave the tour' },
  tourPrev: { pt: 'Anterior', en: 'Back' },
  tourNext: { pt: 'Próximo', en: 'Next' },
  tourPause: { pt: 'Pausar', en: 'Pause' },
  tourPlay: { pt: 'Continuar', en: 'Resume' },
  tourIdle: { pt: 'Clique nas abas e nas etapas, ou siga o roteiro guiado.', en: 'Click the tabs and the steps, or follow the guided tour.' },
} satisfies Record<string, Text>;

/** Stops of the guided tour: what to show (task and step), which part to point at and what to say. */
export const studioTour: Array<{ target: string; task?: StudioTask['id']; step?: (typeof studioSteps)[number]['id']; title: Text; text: Text }> = [
  { target: 'tabs', task: 'classification', step: 'data', title: { pt: 'Uma aba por tarefa', en: 'One tab per task' }, text: { pt: 'Classificação, detecção, regressão, segmentação e anomalia. A cor da aba acompanha a tarefa pela tela inteira.', en: 'Classification, detection, regression, segmentation and anomaly. The tab colour follows the task across the whole screen.' } },
  { target: 'tabs', task: 'detection', step: 'data', title: { pt: 'A estrutura não muda', en: 'The structure stays' }, text: { pt: 'Trocar de tarefa muda os modelos, as estratégias e os padrões, mas as seis etapas e a barra inferior ficam no mesmo lugar.', en: 'Switching tasks changes the models, strategies and defaults, but the six steps and the bottom bar stay where they are.' } },
  { target: 'rail', task: 'classification', step: 'data', title: { pt: 'Seis etapas', en: 'Six steps' }, text: { pt: 'Cada etapa resume o que está definido. "padrão" vira "N ajustes" quando você muda algo, e "falta" aparece onde ainda há um valor obrigatório.', en: 'Each step summarises what is set. "default" becomes "N changes" once you edit something, and "missing" shows where a required value is still absent.' } },
  { target: 'panel', task: 'classification', step: 'data', title: { pt: 'Dados', en: 'Data' }, text: { pt: 'Você aponta uma pasta local. A interface detecta os splits e mostra a contagem por classe antes de qualquer treino.', en: 'You point at a local folder. The interface detects the splits and shows the count per class before any training.' } },
  { target: 'panel', task: 'regression', step: 'strategy', title: { pt: 'Estratégia', en: 'Strategy' }, text: { pt: 'Um treino, K-fold, sweep ou réplicas. Com réplicas, a mesma configuração roda com N seeds e o resultado sai como média ± IC 95%.', en: 'A single run, K-fold, a sweep or replicates. With replicates the same configuration runs with N seeds and the result is a mean ± 95% CI.' } },
  { target: 'panel', task: 'classification', step: 'model', title: { pt: 'Modelo', en: 'Model' }, text: { pt: 'As arquiteturas disponíveis para a tarefa. Um modelo seu, registrado em user_models/, é usado por YAML e pela CLI, como mostra o guia Sua arquitetura.', en: 'The architectures available for the task. A model of your own, registered in user_models/, is used through YAML and the CLI, as the Your architecture guide shows.' } },
  { target: 'panel', task: 'classification', step: 'training', title: { pt: 'Treinamento', en: 'Training' }, text: { pt: 'Épocas, learning rate, batch size e seed ficam à vista; otimizador, scheduler e o resto ficam em Avançado.', en: 'Epochs, learning rate, batch size and seed are in view; optimizer, scheduler and the rest sit under Advanced.' } },
  { target: 'train', task: 'classification', step: 'review', title: { pt: 'Revisão e Treinar', en: 'Review and Train' }, text: { pt: 'A Revisão lista a configuração inteira. O botão Treinar só é liberado aqui, com o dataset definido.', en: 'Review lists the whole configuration. The Train button only unlocks here, once the dataset is set.' } },
  { target: 'bar', task: 'classification', step: 'review', title: { pt: 'Barra inferior', en: 'Bottom bar' }, text: { pt: 'Histórico guarda as execuções, com diff de configuração. Datasets baixa benchmarks. À direita, a escolha entre GPU e CPU.', en: 'History keeps the runs, with a configuration diff. Datasets downloads benchmarks. On the right, the GPU or CPU choice.' } },
];

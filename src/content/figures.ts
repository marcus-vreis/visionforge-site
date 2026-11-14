import type { Language } from './types';

/** One numbered target on a capture: where it sits (percent of the image) and what it explains. */
export interface FigureTarget { x: number; y: number; title: Record<Language, string>; text: Record<Language, string> }

/** A real GUI capture with numbered targets. Provenance of every image is in docs/ASSETS.md. */
export interface AnnotatedFigure {
  /** File name stem under public/images/. */
  image: string;
  /** How the language enters the file name: 'suffix' adds -en for English only, 'infix' adds -pt or -en; absent for a single-language capture. */
  localized?: 'suffix' | 'infix';
  /** Whether -dark and -light files exist. */
  themed: boolean;
  /** Pixel size of the file; captures are taken at 2x. */
  width: number;
  height: number;
  /** Largest CSS width the capture is shown at. */
  displayWidth: number;
  caption: Record<Language, string>;
  targets: FigureTarget[];
}

/** Captures explained on the landing page and in the guides; positions must be rechecked when an image is recaptured. */
export const figures = {
  'data-step': {
    image: 'classification', localized: 'suffix', themed: true, width: 2560, height: 1840, displayWidth: 1280,
    caption: {
      pt: 'Interface real do VisionForge na etapa Dados de um treino de classificação, com o dataset de exemplo. Nenhum treino foi iniciado.',
      en: 'Real VisionForge interface at the Data step of a classification run, with the example dataset. No training was started.',
    },
    targets: [
      { x: 3.3, y: 12.6, title: { pt: 'Abas de tarefa', en: 'Task tabs' }, text: { pt: 'Cada aba é uma tarefa. Uma tarefa própria, registrada em user_tasks/, ganha a sua aba: é o caso de Research method nesta captura.', en: 'Each tab is a task. A custom task registered in user_tasks/ gets its own tab: that is Research method in this capture.' } },
      { x: 3.8, y: 33.7, title: { pt: 'Seis etapas', en: 'Six steps' }, text: { pt: 'Dados, Estratégia, Modelo, Treinamento, Imagem e aumento, e Revisão. Cada etapa resume o que está definido e marca o que saiu do padrão.', en: 'Data, Strategy, Model, Training, Image and augmentation, and Review. Each step summarises what is set and flags what differs from the default.' } },
      { x: 26.3, y: 52.1, title: { pt: 'Pasta do dataset', en: 'Dataset folder' }, text: { pt: 'Uma pasta local com as subpastas de treino, validação e teste. A interface detecta os splits, e "usar dataset de exemplo" preenche tudo sem escolher pasta.', en: 'A local folder with train, validation and test subfolders. The interface detects the splits, and "use the sample dataset" fills everything in without picking a folder.' } },
      { x: 25.3, y: 86.9, title: { pt: 'Distribuição', en: 'Distribution' }, text: { pt: 'A contagem de imagens por classe em cada split aparece antes de qualquer treino.', en: 'The image count per class in each split is shown before any training.' } },
      { x: 3.2, y: 91, title: { pt: 'Histórico e Datasets', en: 'History and Datasets' }, text: { pt: 'Histórico reúne as execuções anteriores, com diff de configuração. Datasets baixa benchmarks como CIFAR-10 pela interface.', en: 'History lists earlier runs with a configuration diff. Datasets downloads benchmarks such as CIFAR-10 from the interface.' } },
      { x: 47.2, y: 90.8, title: { pt: 'Treinar e dispositivo', en: 'Train and device' }, text: { pt: 'O botão Treinar é liberado na etapa Revisão, com o dataset definido. Ao lado fica a escolha entre GPU e CPU.', en: 'The Train button unlocks at the Review step, once the dataset is set. The GPU or CPU choice sits next to it.' } },
      { x: 75.5, y: 8.8, title: { pt: 'Perfil e integrações', en: 'Profile and integrations' }, text: { pt: 'O chip com o seu nome abre o menu do perfil: trocar o nome, criar outro perfil e ligar o envio dos próximos treinos ao MLflow local, ao Weights & Biases ou ao Comet.', en: 'The chip with your name opens the profile menu: change the name, create another profile and switch on sending the next runs to local MLflow, Weights & Biases or Comet.' } },
    ],
  },
  'custom-task': {
    image: 'custom-task', localized: 'suffix', themed: true, width: 2560, height: 1840, displayWidth: 1280,
    caption: {
      pt: 'Captura real da tarefa do tutorial carregada localmente, na etapa Treinamento. Dados sintéticos, sem resultado de pesquisa.',
      en: 'Actual capture of the tutorial task loaded locally, at the Training step. Synthetic data, no research result.',
    },
    targets: [
      { x: 69.6, y: 12.3, title: { pt: 'A aba da tarefa', en: 'The task tab' }, text: { pt: 'O label do decorador @register_task define o nome da aba, e accent define a cor.', en: 'The label in the @register_task decorator sets the tab name, and accent sets its colour.' } },
      { x: 25.2, y: 49.8, title: { pt: 'research_weight', en: 'research_weight' }, text: { pt: 'Vem do Field que você acrescentou ao Config: valor inicial 0.1, descrição e limites de 0 a 1.', en: 'It comes from the Field you added to the Config: initial value 0.1, a description and limits from 0 to 1.' } },
      { x: 48.9, y: 49.8, title: { pt: 'n_samples e hidden_units', en: 'n_samples and hidden_units' }, text: { pt: 'Os dois campos que o scaffold já traz no Config.', en: 'The two fields the scaffold already has in the Config.' } },
      { x: 25.2, y: 68.2, title: { pt: 'Campos compartilhados', en: 'Shared fields' }, text: { pt: 'Épocas, batch size, learning rate, otimizador e seed vêm da configuração base. Você não escreve esses campos.', en: 'Epochs, batch size, learning rate, optimizer and seed come from the base configuration. You do not write these fields.' } },
      { x: 85.1, y: 91.4, title: { pt: 'Dispositivo', en: 'Device' }, text: { pt: 'A escolha entre GPU e CPU também é compartilhada com as outras tarefas.', en: 'The GPU or CPU choice is also shared with the other tasks.' } },
    ],
  },
  'code-tab': {
    image: 'code-tab', localized: 'infix', themed: true, width: 2192, height: 1624, displayWidth: 1096,
    caption: {
      pt: 'Aba Código ao vivo depois de um treino de uma época com o dataset de exemplo, no passo Época de treino. Captura do ramo de desenvolvimento.',
      en: 'Live code tab after a one-epoch run on the sample dataset, at the Training epoch step. Captured from the development branch.',
    },
    targets: [
      { x: 28, y: 16.9, title: { pt: 'A aba', en: 'The tab' }, text: { pt: 'Código ao vivo é a terceira aba da tela de treino, depois de Log e Resultados. Ela junta as antigas "Como funciona" e "Código".', en: 'Live code is the third tab of the training screen, after Log and Results. It merges the former "How it works" and "Code" tabs.' } },
      { x: 3.6, y: 26.6, title: { pt: 'Animação', en: 'Animation' }, text: { pt: 'Um desenho da rede, em câmera lenta. A própria interface avisa que ele é ilustrativo: só o estágio e os números são reais.', en: 'A drawing of the network, in slow motion. The interface itself says it is illustrative: only the stage and the numbers are real.' } },
      { x: 26.5, y: 37.7, title: { pt: 'Passos do treino', en: 'Steps of the run' }, text: { pt: 'Na classificação: Dados, Modelo, Loss, Época de treino, Validação, e Teste e relatório. Cada passo tem uma frase do que faz; clicar mostra o código dele ao lado.', en: 'In classification: Data, Model, Loss, Training epoch, Validation, and Test and report. Each step has one sentence on what it does; clicking shows its code on the right.' } },
      { x: 69.5, y: 25.1, title: { pt: 'Origem', en: 'Source' }, text: { pt: 'O caminho do arquivo dentro do pacote, a função e a linha em que ela começa: aqui, Trainer._train_epoch em visionforge/core/trainer.py.', en: 'The file path inside the package, the function and the line where it starts: here, Trainer._train_epoch in visionforge/core/trainer.py.' } },
      { x: 30.9, y: 55, title: { pt: 'Linhas com nota', en: 'Lines with a note' }, text: { pt: 'A marca na margem indica uma linha com nota. Segundo a documentação do produto, clicar abre a nota no lugar; a nota aberta não aparece nesta captura.', en: 'The mark in the margin flags a line with a note. According to the product documentation, clicking opens the note in place; no open note appears in this capture.' } },
      { x: 89, y: 87.5, title: { pt: 'Ver resultados', en: 'View results' }, text: { pt: 'Fecha a tela de treino e abre a execução no Histórico, com as métricas e as curvas por época.', en: 'Closes the training screen and opens the run in History, with its metrics and per-epoch curves.' } },
    ],
  },
  colab: {
    image: 'colab', localized: 'infix', themed: true, width: 1800, height: 580, displayWidth: 900,
    caption: {
      pt: 'Canto do Colab aberto no cabeçalho, sem a CLI instalada nem conta Google conectada.',
      en: 'The Colab corner open in the header, with no CLI installed and no Google account connected.',
    },
    targets: [
      { x: 38.2, y: 14.8, title: { pt: 'Canto "colab"', en: 'The "colab" corner' }, text: { pt: 'Fica no cabeçalho e mostra o estado da conexão: aqui, desligado.', en: 'It sits in the header and shows the connection state: here, off.' } },
      { x: 5, y: 49.7, title: { pt: 'Como funciona', en: 'How it works' }, text: { pt: 'Abre a explicação do painel: a CLI oficial do Colab fica num ambiente só dela, o treino entra na mesma fila dos locais e a execução volta para o Histórico ao terminar.', en: 'Opens the explanation of the panel: the official Colab CLI lives in an environment of its own, the run joins the same queue as local ones and comes back to History when it ends.' } },
      { x: 5, y: 78.6, title: { pt: 'Instalar a CLI', en: 'Install the CLI' }, text: { pt: 'O primeiro passo da seção Conexão. Leva um ou dois minutos; depois o painel oferece o login.', en: 'The first step of the Connection section. It takes a minute or two; the panel then offers the login.' } },
    ],
  },
} satisfies Record<string, AnnotatedFigure>;

/** Names of the annotated captures a guide section can ask for. */
export type FigureId = keyof typeof figures;

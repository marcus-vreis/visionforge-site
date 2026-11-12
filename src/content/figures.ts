import type { Language } from './types';

/** One numbered target on a capture: where it sits (percent of the image) and what it explains. */
export interface FigureTarget { x: number; y: number; title: Record<Language, string>; text: Record<Language, string> }

/** A real GUI capture with numbered targets. Provenance of every image is in docs/ASSETS.md. */
export interface AnnotatedFigure {
  /** File name stem under public/images/. `variants` adds the -en / -dark / -light suffixes; a single file is used as is. */
  image: string;
  variants: boolean;
  width: number;
  height: number;
  caption: Record<Language, string>;
  targets: FigureTarget[];
}

/** Captures explained on the landing page and in the guides; positions must be rechecked when an image is recaptured. */
export const figures = {
  'data-step': {
    image: 'classification', variants: true, width: 1440, height: 1000,
    caption: {
      pt: 'Interface real do VisionForge na etapa Dados de um treino de classificação, com o dataset de exemplo. Nenhum treino foi iniciado.',
      en: 'Real VisionForge interface at the Data step of a classification run, with the example dataset. No training was started.',
    },
    targets: [
      { x: 7.6, y: 11.6, title: { pt: 'Abas de tarefa', en: 'Task tabs' }, text: { pt: 'Cada aba é uma tarefa. Uma tarefa própria, registrada em user_tasks/, ganha a sua aba: é o caso de Research method nesta captura.', en: 'Each tab is a task. A custom task registered in user_tasks/ gets its own tab: that is Research method in this capture.' } },
      { x: 7.4, y: 31.5, title: { pt: 'Seis etapas', en: 'Six steps' }, text: { pt: 'Dados, Estratégia, Modelo, Treinamento, Imagem e aumento, e Revisão. Cada etapa resume o que está definido e marca o que saiu do padrão.', en: 'Data, Strategy, Model, Training, Image and augmentation, and Review. Each step summarises what is set and flags what differs from the default.' } },
      { x: 27.2, y: 48.5, title: { pt: 'Pasta do dataset', en: 'Dataset folder' }, text: { pt: 'Uma pasta local com as subpastas de treino, validação e teste. A interface detecta os splits, e "usar dataset de exemplo" preenche tudo sem escolher pasta.', en: 'A local folder with train, validation and test subfolders. The interface detects the splits, and "use example dataset" fills everything in without picking a folder.' } },
      { x: 27.2, y: 80.5, title: { pt: 'Distribuição', en: 'Distribution' }, text: { pt: 'A contagem de imagens por classe em cada split aparece antes de qualquer treino.', en: 'The image count per class in each split is shown before any training.' } },
      { x: 5.6, y: 93.8, title: { pt: 'Histórico e Datasets', en: 'History and Datasets' }, text: { pt: 'Histórico reúne as execuções anteriores, com diff de configuração. Datasets baixa benchmarks como CIFAR-10 pela interface.', en: 'History lists earlier runs with a configuration diff. Datasets downloads benchmarks such as CIFAR-10 from the interface.' } },
      { x: 45.8, y: 93.8, title: { pt: 'Treinar e dispositivo', en: 'Train and device' }, text: { pt: 'O botão Treinar é liberado na etapa Revisão, com o dataset definido. Ao lado fica a escolha entre GPU e CPU.', en: 'The Train button unlocks at the Review step, once the dataset is set. The GPU or CPU choice sits next to it.' } },
    ],
  },
  'custom-task': {
    image: 'custom-task', variants: true, width: 1440, height: 1100,
    caption: {
      pt: 'Captura real da tarefa do tutorial carregada localmente, na etapa Treinamento. Dados sintéticos, sem resultado de pesquisa.',
      en: 'Actual capture of the tutorial task loaded locally, at the Training step. Synthetic data, no research result.',
    },
    targets: [
      { x: 67.4, y: 10.5, title: { pt: 'A aba da tarefa', en: 'The task tab' }, text: { pt: 'O label do decorador @register_task define o nome da aba, e accent define a cor.', en: 'The label in the @register_task decorator sets the tab name, and accent sets its colour.' } },
      { x: 26.6, y: 42.2, title: { pt: 'research_weight', en: 'research_weight' }, text: { pt: 'Vem do Field que você acrescentou ao Config: valor inicial 0.1, descrição e limites de 0 a 1.', en: 'It comes from the Field you added to the Config: initial value 0.1, a description and limits from 0 to 1.' } },
      { x: 47.7, y: 42.2, title: { pt: 'n_samples e hidden_units', en: 'n_samples and hidden_units' }, text: { pt: 'Os dois campos que o scaffold já traz no Config.', en: 'The two fields the scaffold already has in the Config.' } },
      { x: 26.6, y: 55, title: { pt: 'Campos compartilhados', en: 'Shared fields' }, text: { pt: 'Épocas, batch size, learning rate, otimizador e seed vêm da configuração base. Você não escreve esses campos.', en: 'Epochs, batch size, learning rate, optimizer and seed come from the base configuration. You do not write these fields.' } },
      { x: 80.6, y: 94.4, title: { pt: 'Dispositivo', en: 'Device' }, text: { pt: 'A escolha entre GPU e CPU também é compartilhada com as outras tarefas.', en: 'The GPU or CPU choice is also shared with the other tasks.' } },
    ],
  },
  'code-tab': {
    image: 'code-tab-pt-dark', variants: false, width: 760, height: 792,
    caption: {
      pt: 'Aba Código depois de uma época na CPU. Captura do ramo de desenvolvimento, interface em português, tema escuro.',
      en: 'Code tab after one epoch on CPU. Captured from the development branch, Portuguese interface, dark theme.',
    },
    targets: [
      { x: 37.2, y: 18.4, title: { pt: 'A aba', en: 'The tab' }, text: { pt: 'Código fica na tela de treino, depois de "Como funciona".', en: 'Code sits on the training screen, after "How it works".' } },
      { x: 3.4, y: 29.2, title: { pt: 'Roteiro', en: 'Tour' }, text: { pt: 'As seis seções da classificação: Dados, Modelo, Loss, Treino (uma época), Validação e Teste.', en: 'The six classification sections: Data, Model, Loss, Training (one epoch), Validation and Test.' } },
      { x: 63, y: 33.2, title: { pt: 'Origem', en: 'Source' }, text: { pt: 'O caminho do arquivo dentro do pacote, a função e a linha em que ela começa.', en: 'The file path inside the package, the function and the line where it starts.' } },
      { x: 90, y: 59.2, title: { pt: 'Trechos marcados', en: 'Marked lines' }, text: { pt: 'Os trechos marcados são o caminho que a configuração deste treino segue; os apagados são ramos que ele não usa.', en: 'Marked lines are the path the configuration of this run follows; dimmed ones are branches it does not take.' } },
      { x: 3.4, y: 84.7, title: { pt: 'Nota da linha', en: 'Line note' }, text: { pt: 'A nota explica a linha selecionada: aqui, a 622.', en: 'The note explains the selected line: here, line 622.' } },
    ],
  },
  colab: {
    image: 'colab-pt-dark', variants: false, width: 900, height: 290,
    caption: {
      pt: 'Canto do Colab aberto no cabeçalho, sem a CLI instalada nem conta Google conectada. Interface em português, tema escuro.',
      en: 'The Colab corner open in the header, with no CLI installed and no Google account connected. Portuguese interface, dark theme.',
    },
    targets: [
      { x: 42, y: 14.8, title: { pt: 'Canto "colab"', en: 'The "colab" corner' }, text: { pt: 'Fica no cabeçalho e mostra o estado da conexão: aqui, desligado.', en: 'It sits in the header and shows the connection state: here, off.' } },
      { x: 20.6, y: 37.2, title: { pt: 'O que será usado', en: 'What will be used' }, text: { pt: 'A sua conta Google e a GPU que ela tiver. A CLI oficial do Colab fica num ambiente só dela.', en: 'Your Google account and whatever GPU it has. The official Colab CLI lives in an environment of its own.' } },
      { x: 20.6, y: 60.3, title: { pt: 'Instalar a CLI', en: 'Install the CLI' }, text: { pt: 'O primeiro passo. Leva um ou dois minutos; depois o painel oferece o login.', en: 'The first step. It takes a minute or two; the panel then offers the login.' } },
    ],
  },
} satisfies Record<string, AnnotatedFigure>;

/** Names of the annotated captures a guide section can ask for. */
export type FigureId = keyof typeof figures;

import type { Guide } from './guide-types';

const tree = `digits-project/
  .gitignore
  LICENSE
  README.md
  README.en.md
  requirements.txt
  prepare_data.py
  inspect_run.py
  configs/
    digits.yaml
  user_models/
    research_cnn.py`;
const windows = `py -3.12 -m venv .venv
.\\.venv\\Scripts\\python.exe -m pip install -r requirements.txt
.\\.venv\\Scripts\\python.exe prepare_data.py
.\\.venv\\Scripts\\visionforge.exe doctor
.\\.venv\\Scripts\\visionforge.exe run configs/digits.yaml
.\\.venv\\Scripts\\python.exe inspect_run.py`;
const posix = `python3.12 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python prepare_data.py
./.venv/bin/visionforge doctor
./.venv/bin/visionforge run configs/digits.yaml
./.venv/bin/python inspect_run.py`;
const references = [
  { label: 'scikit-learn: load_digits', url: 'https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html' },
  { label: 'UCI: Optical Recognition of Handwritten Digits', url: 'https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits' },
];

/** Complete worked case using real handwriting data and the unchanged tutorial CNN. */
export const projectGuides: Guide[] = [
  {
    lang: 'pt', slug: 'project', title: 'Caso completo: dígitos manuscritos',
    description: 'Prepare imagens reais, treine a CNN do tutorial e leia os resultados. Todos os arquivos estão no guia e no projeto para download.',
    source: 'docs/custom/MODELS.md', references,
    sections: [
      { id: 'problem', title: '1. O que vamos classificar', paragraphs: [
        'O objetivo é reconhecer o dígito de 0 a 9 escrito em uma imagem. Usaremos load_digits(), do scikit-learn: 1.797 imagens reais de escrita manual, com 8 × 8 pixels e 10 classes. Esse conjunto já vem com a biblioteca, que é uma dependência do VisionForge.',
        'O projeto mantém a mesma research_cnn do exemplo anterior. Agora ela será usada com dados preparados em pastas e um YAML completo. A instalação precisa de internet; a preparação dos dados e o treino não baixam datasets nem pesos.',
      ], note: 'As imagens têm origem no dataset Optical Recognition of Handwritten Digits, distribuído pela UCI. As referências estão no final da página. Este caso ensina a executar um modelo próprio; não atribui um desempenho esperado à CNN.' },
      { id: 'folder', title: '2. Extraia e confira os arquivos', paragraphs: [
        'Baixe o ZIP e extraia a pasta digits-project. Abra o terminal dentro dela, onde estão requirements.txt e prepare_data.py. Todos os comandos deste caso usam essa pasta como diretório de trabalho.',
        'Crie um ambiente para o exemplo. Um VisionForge instalado em outra pasta não substitui a .venv usada pelos comandos abaixo. No Linux e no macOS Apple Silicon, siga também os pré-requisitos do guia de instalação por sistema.',
      ], code: tree, codeLabel: 'Conteúdo completo do ZIP' },
      { id: 'windows', title: '3. Execute no Windows', paragraphs: [
        'Use PowerShell com Python 3.12 instalado. A sequência cria a .venv, instala a versão indicada em requirements.txt, prepara as imagens e executa o treino em CPU. O último comando lê o resultado gravado.',
      ], code: windows, codeLabel: 'PowerShell · dentro de digits-project', note: 'O YAML já escolhe CPU. Este exemplo dispensa doctor --fix. Mantenha cada comando na ordem indicada e confira a saída antes de seguir para o próximo.' },
      { id: 'posix', title: '4. Execute no Linux ou macOS', paragraphs: [
        'Com Python 3.12 e os pré-requisitos do sistema instalados, use a sequência abaixo. Ela faz o mesmo treino em CPU, com os executáveis do ambiente virtual.',
      ], code: posix, codeLabel: 'Terminal · dentro de digits-project' },
      { id: 'data', title: '5. Entenda a preparação dos dados', paragraphs: [
        'prepare_data.py converte as imagens de 8 × 8 para PNGs RGB de 32 × 32. Assim elas têm os três canais que a CNN recebe. A divisão estratificada usa seed 42 e reserva 60% das imagens para treino, 20% para validação e 20% para teste, com arredondamento para quantidades inteiras.',
        'As pastas train, val e test têm subpastas de 0 a 9. O manifest.json registra os índices originais de cada imagem, para conferir quais amostras foram usadas. O script recusa um destino existente e preserva seus arquivos.',
        'Para uma primeira execução menor, use prepare_data.py --limit-per-class 12 em uma pasta de dados ainda inexistente. Para escolher outro destino, use --output datasets/digits-v2 e altere data.base_dir no YAML.',
      ], note: 'A separação é por imagem. O exemplo não assegura que os autores da escrita sejam distintos entre os splits. Um estudo de generalização entre pessoas exige dados com identificação de autor e uma divisão que respeite isso.' },
      { id: 'training', title: '6. Acompanhe o modelo e os resultados', paragraphs: [
        'model.custom_model: research_cnn faz o VisionForge importar o builder de user_models/. Com num_classes: 10, o builder cria dez saídas por imagem. O YAML configura três épocas, batch size 32 e seed 42. Augmentation fica desligada: um espelhamento horizontal, por exemplo, não é uma transformação adequada a todos os dígitos.',
        'O terminal mostra o andamento. Ao terminar, inspect_run.py localiza o run.json mais recente em outputs/models/ e imprime as métricas e os caminhos dos artefatos. Para ler uma execução específica, passe o caminho do run.json como argumento. Os valores vêm do seu treino.',
        'Abra a GUI pelo executável da .venv, nesta mesma pasta, e consulte digits_research_cnn no histórico. Para este caso, use o YAML e a CLI para escolher o modelo; o painel atual de classificação não tem um seletor dedicado para modelos registrados.',
      ], steps: [
        'Confira no resultado se config.model.custom_model é research_cnn e se a configuração registra CPU e dez classes.',
        'Abra a matriz de confusão e os outros gráficos pelos caminhos em artifacts. Eles ajudam a examinar quais classes o modelo confunde.',
        'Guarde o YAML, o código e manifest.json com o run.json. Para repetir o experimento, mantenha também as versões das dependências e os dados.',
      ], code: `# Windows\n.\\.venv\\Scripts\\visionforge.exe gui\n\n# Linux / macOS\n./.venv/bin/visionforge gui`, codeLabel: 'Terminal · abrir a GUI após o treino' },
      { id: 'files', title: '7. Leia todos os arquivos', paragraphs: [
        'Cada item abre o arquivo inteiro que está no ZIP. prepare_data.py cuida dos dados; a arquitetura fica em user_models/research_cnn.py; configs/digits.yaml reúne as opções de treino. inspect_run.py só lê os resultados.',
      ] },
      { id: 'adapt', title: '8. Substitua pelo seu problema', paragraphs: [
        'Para testar outra arquitetura, altere o builder mantendo o registro e a saída [batch, num_outputs]. Se trocar as imagens, organize-as no formato ImageFolder e ajuste o número de classes e as transformações. Use a mesma normalização do treino ao fazer inferência.',
        'Se seu método precisa de outra loss, loaders próprios ou campos adicionais no formulário, siga o guia Sua página de treinamento. Esse ponto de extensão permite definir a tarefa inteira.',
        'Antes de interpretar diferenças de desempenho, compare os métodos com os mesmos splits e métricas e repita os treinos com várias seeds. Este projeto é um ponto de partida para organizar a execução do seu método.',
      ] },
    ],
  },
  {
    lang: 'en', slug: 'project', title: 'Complete case: handwritten digits',
    description: 'Prepare real images, train the tutorial CNN and read its results. Every file is shown here and included in the downloadable project.',
    source: 'docs/custom/MODELS.md', references,
    sections: [
      { id: 'problem', title: '1. What we will classify', paragraphs: [
        'The goal is to recognize the digit from 0 to 9 written in an image. We will use scikit-learn load_digits(): 1,797 real handwriting images of 8 × 8 pixels, across 10 classes. The dataset is bundled with the library, which VisionForge already depends on.',
        'The project keeps the same research_cnn from the earlier example. Here it runs with prepared image folders and a complete YAML file. Installation needs internet access; data preparation and training do not download datasets or weights.',
      ], note: 'The images come from Optical Recognition of Handwritten Digits, distributed by UCI. References are at the end of this page. This case teaches how to run a custom model and does not claim an expected CNN score.' },
      { id: 'folder', title: '2. Extract and check the files', paragraphs: [
        'Download the ZIP and extract digits-project. Open a terminal inside it, where requirements.txt and prepare_data.py are located. Every command in this case uses that working directory.',
        'Create an environment for this example. A VisionForge installation elsewhere does not replace the .venv used below. On Linux and macOS Apple Silicon, also follow the system prerequisites in the installation guide.',
      ], code: tree, codeLabel: 'Complete ZIP contents' },
      { id: 'windows', title: '3. Run it on Windows', paragraphs: [
        'Use PowerShell with Python 3.12 installed. These commands create .venv, install the version in requirements.txt, prepare images and train on CPU. The final command reads the recorded result.',
      ], code: windows, codeLabel: 'PowerShell · inside digits-project', note: 'The YAML already selects CPU. This example does not need doctor --fix. Run the commands in order and check each output before continuing.' },
      { id: 'posix', title: '4. Run it on Linux or macOS', paragraphs: [
        'With Python 3.12 and your system prerequisites installed, run the commands below. They perform the same CPU training using the virtual environment executables.',
      ], code: posix, codeLabel: 'Terminal · inside digits-project' },
      { id: 'data', title: '5. Understand data preparation', paragraphs: [
        'prepare_data.py converts 8 × 8 images to 32 × 32 RGB PNGs with the three channels expected by the CNN. A stratified split with seed 42 allocates 60% of images to training, 20% to validation and 20% to testing, rounded to whole samples.',
        'The train, val and test folders contain class subfolders 0 through 9. manifest.json records the original image indices so you can check which samples were used. The script refuses an existing destination and preserves its files.',
        'For a smaller first run, use prepare_data.py --limit-per-class 12 with a data folder that does not yet exist. To choose another destination, use --output datasets/digits-v2 and update data.base_dir in YAML.',
      ], note: 'This split separates images. It does not ensure different writers across splits. A study of generalization across people needs data with writer identifiers and a split that respects them.' },
      { id: 'training', title: '6. Follow training and read results', paragraphs: [
        'model.custom_model: research_cnn tells VisionForge to import the builder from user_models/. With num_classes: 10, the builder creates ten outputs per image. YAML sets three epochs, batch size 32 and seed 42. Augmentation is disabled: horizontal reflection, for example, is unsuitable for some digits.',
        'The terminal shows progress. After training, inspect_run.py finds the latest run.json under outputs/models/ and prints recorded metrics and artifact paths. Pass a run.json path to select a specific run. Values come from your training run.',
        'Start the GUI through the .venv executable from this folder and find digits_research_cnn in History. Use YAML and the CLI to select the model in this case; the current classification panel has no dedicated selector for registered models.',
      ], steps: [
        'Check that the recorded config.model.custom_model is research_cnn, with CPU and ten classes in the configuration.',
        'Open the confusion matrix and other plots using the paths in artifacts. They help you examine which classes the model confuses.',
        'Keep YAML, code and manifest.json with run.json. Preserve dependency versions and data to repeat the experiment.',
      ], code: `# Windows\n.\\.venv\\Scripts\\visionforge.exe gui\n\n# Linux / macOS\n./.venv/bin/visionforge gui`, codeLabel: 'Terminal · open the GUI after training' },
      { id: 'files', title: '7. Read every file', paragraphs: [
        'Each item opens the full file included in the ZIP. prepare_data.py handles data; user_models/research_cnn.py defines the architecture; configs/digits.yaml contains training settings. inspect_run.py only reads results.',
      ] },
      { id: 'adapt', title: '8. Replace it with your problem', paragraphs: [
        'To try another architecture, change the builder while preserving its registration and [batch, num_outputs] output shape. For different images, keep the ImageFolder layout and adjust class count and transforms. Use the training normalization during inference too.',
        'If your method needs a different loss, custom loaders or additional form fields, follow Your training page. That extension lets you define the whole task.',
        'Before interpreting performance differences, compare methods on the same splits and metrics and repeat training with several seeds. This project is a starting point for organizing the execution of your method.',
      ] },
    ],
  },
];

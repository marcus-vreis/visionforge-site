import type { Guide } from './guide-types';
import { modelExample, taskFieldExample } from './examples';
import { projectGuides } from './project-guide';

const workspace = `my-research/
  .venv/
  user_models/
  user_tasks/
  datasets/
  outputs/`;
const launch = `# Windows · PowerShell, inside my-research
.\\.venv\\Scripts\\visionforge.exe doctor
.\\.venv\\Scripts\\visionforge.exe gui

# Linux / macOS · inside my-research
./.venv/bin/visionforge doctor
./.venv/bin/visionforge gui`;
const dataset = `datasets/two-classes/
  train/
    class_a/  # training images
    class_b/
  val/
    class_a/  # validation images
    class_b/
  test/
    class_a/  # held-out test images
    class_b/`;
const scaffold = `# Windows · PowerShell
.\\.venv\\Scripts\\visionforge.exe new-task research_method
.\\.venv\\Scripts\\visionforge.exe gui

# Linux / macOS
./.venv/bin/visionforge new-task research_method
./.venv/bin/visionforge gui`;
const modelConfig = `# Fragment only: merge into an exported classification config.
model:
  custom_model: research_cnn
  num_classes: 2`;
const taskConfig = `# Inside ResearchMethodConfig(BaseTaskConfig):
${taskFieldExample.split('\n').map(line => `    ${line}`).join('\n')}`;
const loss = `def compute_loss(self, model, batch, cfg):
    """Combine data fit with an illustrative parameter penalty."""
    device = next(model.parameters()).device
    inputs, targets = (tensor.to(device) for tensor in batch)
    fit = nn.functional.mse_loss(model(inputs), targets)
    penalty = torch.cat([
        parameter.flatten() for parameter in model.parameters()
    ]).square().mean()
    return fit + cfg.research_weight * penalty`;
const taskRegistration = `@register_task(
    key="research_method",
    label="Research method",
    accent="#2dd4bf",
    description="Synthetic regression with a research penalty",
    metrics={"mae": "lower"},
    primary_metric="mae",
)
class ResearchMethodTask(TaskSpec[ResearchMethodConfig]):
    """Four hooks connected to VisionForge's generic engine."""
    Config = ResearchMethodConfig
    # Keep the four generated hooks; edit them as shown in this guide.`;

/** Tutorials checked against the product source and its v0.17.0 extension API. */
export const guides: Guide[] = [
  {
    lang: 'pt', slug: '', title: 'Primeiro treino',
    description: 'Da pasta de pesquisa ao primeiro experimento: organize dados, configure o treino e encontre os resultados.',
    source: 'docs/QUICKSTART.md',
    sections: [
      { id: 'workspace', title: '1. Prepare sua pasta de pesquisa', paragraphs: [
        'Comece pela instalação por sistema, disponível no menu lateral. Este guia parte de um ambiente virtual com visionforge-studio instalado e selftest --quick concluído.',
        'Abra o terminal na pasta em que quer manter seus experimentos. O VisionForge procura user_models/ e user_tasks/ nessa pasta de trabalho; outputs/ guarda os resultados. Execute os comandos abaixo a partir dela. A GUI abre no endereço local informado pelo terminal, normalmente http://127.0.0.1:8000.',
      ], code: launch, codeLabel: 'Terminal · ambiente já instalado', note: 'No Windows, os exemplos usam diretamente o executável da .venv. No Linux e macOS, usam .venv/bin. Mantenha o terminal aberto enquanto usa a interface.' },
      { id: 'data', title: '2. Organize um dataset de classificação', paragraphs: [
        'Para começar, use duas classes com imagens RGB e pastas separadas para treino, validação e teste. O nome de cada subpasta identifica uma classe. A estrutura abaixo é um formato de entrada, não um dataset incluído no site.',
        'Use exemplos diferentes em cada split. Imagens do mesmo paciente, objeto ou sequência devem ficar no mesmo split quando houver essa dependência; copie esse critério para seu protocolo de pesquisa.',
      ], code: dataset, codeLabel: 'Estrutura de pastas · coloque suas imagens nas subpastas', note: 'O botão de datasets da aplicação também permite obter datasets de provedores integrados. Confira tamanho, licença e destino antes de baixar. As outras tarefas têm formatos próprios, descritos na referência de datasets do projeto.' },
      { id: 'configure', title: '3. Configure uma execução pequena', paragraphs: ['Na aba Classificação, selecione a pasta datasets/two-classes. Confira os splits e a contagem de classes detectados antes de treinar.'], steps: [
        'Aplique a quantidade de classes detectada: 2 neste exemplo. Escolha um nome que identifique seu experimento.',
        'Selecione uma arquitetura disponível. Para um teste sem baixar pesos, desative o uso de pesos pré-treinados; para transfer learning, os pesos podem precisar de download.',
        'Para conferir o fluxo em CPU, escolha CPU e comece com 1 época e batch size pequeno. Isso verifica a execução; não mede a qualidade final do modelo.',
        'Confira o diretório de saída e clique em Treinar. Depois ajuste orçamento de épocas, dados e hiperparâmetros ao objetivo do experimento.',
      ] },
      { id: 'results', title: '4. Acompanhe e encontre os resultados', paragraphs: [
        'Durante o treino, o monitor mostra os eventos e as métricas por época. Ao terminar, confira os resultados da tarefa e abra o histórico para recuperar a execução.',
        'O diretório de cada run contém run.json com configuração, seed, ambiente, métricas e histórico, além dos artefatos produzidos pela tarefa. O caminho padrão parte de outputs/models/. Guarde o código do método e a versão dos dados junto do protocolo: um JSON sozinho não recupera esses arquivos.',
      ] },
      { id: 'repeat', title: '5. Exporte e repita o experimento', paragraphs: [
        'Use Exportar YAML no cabeçalho do painel para salvar a configuração. Importar YAML restaura o formulário. Com os mesmos arquivos e dependências disponíveis, a CLI também executa essa configuração.',
        'Para um resultado de pesquisa, mantenha split e métrica comparáveis e reporte variação entre execuções. Tarefas próprias oferecem Réplicas com múltiplas seeds; a classificação tem estratégias como K-fold e buscas, além da comparação no histórico. As estratégias disponíveis variam por tarefa.',
        'Na classificação, o intervalo bootstrap do conjunto de teste mantém o modelo fixo. Ele descreve a incerteza associada às amostras de teste; não substitui treinar com várias seeds. Configuração e seed ajudam na reprodução, mas hardware e operações não determinísticas podem alterar resultados.',
      ], code: `# Windows\n.\\.venv\\Scripts\\visionforge.exe run experiment.yaml\n\n# Linux / macOS\n./.venv/bin/visionforge run experiment.yaml`, codeLabel: 'Terminal · substitua pelo nome do YAML exportado' },
      { id: 'next', title: '6. Leve seu método para a interface', paragraphs: [
        'Se a mudança é a arquitetura, siga o guia Sua arquitetura: registre um builder em user_models/ e aproveite uma tarefa existente.',
        'Se você precisa mudar dados, loss, métricas ou os parâmetros expostos ao usuário, siga Sua página de treinamento. Um Config em Python gera o formulário, e quatro hooks conectam seu método ao engine do VisionForge.',
      ], code: workspace, codeLabel: 'Uma pasta de trabalho para o projeto de pesquisa' },
    ],
  },
  {
    lang: 'pt', slug: 'model', title: 'Sua arquitetura',
    description: 'Registre um modelo PyTorch em user_models/ e configure seu uso por YAML, sem editar o pacote.',
    source: 'docs/custom/MODELS.md',
    sections: [
      { id: 'choose', title: '1. Escolha o ponto de extensão', paragraphs: [
        'Use um modelo próprio quando os dados, a loss e as métricas de uma tarefa existente já atendem ao problema. O registro custom_model está disponível em classificação, regressão e segmentação. Detecção e anomalia seguem caminhos próprios de modelo.',
        'O builder recebe num_outputs e retorna um torch.nn.Module. Para classificação, emita logits [batch, num_classes]; para regressão, valores [batch, num_targets]. Para segmentação, a arquitetura deve produzir logits espaciais [batch, num_classes, altura, largura] compatíveis com a tarefa.',
      ], note: 'A CNN deste tutorial retorna [batch, num_outputs]: serve como exemplo para classificação ou regressão. Para segmentação, troque a arquitetura por uma que preserve ou recupere a dimensão espacial.' },
      { id: 'code', title: '2. Salve o modelo em user_models/', paragraphs: [
        'Na sua pasta de pesquisa, crie user_models/research_cnn.py com o conteúdo abaixo. O arquivo completo também está disponível para download ao final do guia. O exemplo não depende de pesos pré-treinados nem de downloads.',
        'O decorador registra research_cnn. A camada final usa num_outputs para ajustar o número de saídas ao problema. Não aplique softmax no final deste exemplo de classificação: a tarefa espera logits para calcular sua loss.',
      ], code: modelExample, codeLabel: 'user_models/research_cnn.py · arquivo completo' },
      { id: 'select', title: '3. Configure o modelo por YAML', paragraphs: [
        'Configure os dados na GUI e exporte o YAML. Edite model.custom_model para research_cnn, conforme o fragmento da próxima seção. Execute o YAML completo pela CLI, na mesma pasta de pesquisa. O painel atual de classificação não tem um seletor dedicado para modelos registrados.',
        'A descoberta importa arquivos .py de user_models/ sob demanda. Arquivos cujo nome começa com _ são ignorados. Não é necessário reinstalar o pacote para adicionar o arquivo.',
      ], steps: ['Use o dataset do guia Primeiro treino e 2 classes para testar a classificação.', 'No YAML exportado, defina custom_model: research_cnn, training.epochs: 1 e device.kind: cpu. Execute com visionforge run, usando o caminho do executável da sua .venv.', 'Confira as métricas e o run.json; depois substitua a CNN pelo modelo do seu trabalho.'] },
      { id: 'yaml', title: '4. Identifique o modelo no YAML', paragraphs: [
        'Exporte a configuração pelo painel para obter um YAML completo. O trecho abaixo mostra apenas a parte que seleciona o modelo. Quando custom_model está definido, os campos name e pretrained da arquitetura embutida são ignorados.',
        'No exemplo de regressão, use o config próprio dessa tarefa e num_targets como dimensão de saída. Não transforme o fragmento abaixo em um arquivo completo de execução: dados e treinamento também precisam estar configurados.',
      ], code: modelConfig, codeLabel: 'YAML · fragmento de configuração de classificação' },
      { id: 'debug', title: '5. Se o modelo não aparecer', paragraphs: [
        'Execute doctor no mesmo diretório em que iniciou a GUI e confira o caminho de user_models/ e os modelos encontrados. Leia os avisos de importação no terminal: uma dependência ausente ou um erro no arquivo faz esse modelo ser ignorado.',
        'Confira o nome registrado e a forma da saída. O exemplo aceita três canais RGB. Uma arquitetura para imagens em escala de cinza ou segmentação precisa refletir o formato que os loaders da tarefa entregam.',
        'Para compartilhar o experimento, distribua também research_cnn.py e suas dependências. O nome do modelo no YAML não inclui o código Python dentro do pacote ou do checkpoint.',
      ], code: launch, codeLabel: 'Terminal · diagnóstico e abertura na pasta de pesquisa' },
    ],
  },
  {
    lang: 'pt', slug: 'task', title: 'Sua página de treinamento',
    description: 'Transforme um método de pesquisa em uma tarefa: campos gerados do Python, dados e loss próprios, monitor e histórico de experimentos.',
    source: 'docs/custom/TASKS.md',
    sections: [
      { id: 'generate', title: '1. Gere uma tarefa que já funciona', paragraphs: [
        'Use uma tarefa própria quando precisa controlar modelo, dados, loss, métricas e parâmetros do método. O VisionForge cria uma aba e um formulário a partir da sua definição em Python; você implementa quatro hooks que o engine chama durante o treinamento.',
        'Na pasta de pesquisa com o ambiente instalado, execute new-task research_method. O comando cria user_tasks/research_method.py. A opção --package cria user_tasks/research_method/task.py, útil para manter arquivos auxiliares junto da tarefa.',
        'O scaffold já executa uma regressão sintética: entradas com 8 características e um alvo escalar. Não precisa de dataset nem de pesos externos. O nome é apenas uma identificação do tutorial; a demonstração não é um método acadêmico novo.',
      ], code: scaffold, codeLabel: 'Terminal · execute a versão do seu sistema', note: 'Você pode partir do scaffold e aplicar os trechos abaixo, ou baixar research_method.py ao final e salvá-lo em user_tasks/. Use uma das opções para não sobrescrever seu trabalho.' },
      { id: 'form', title: '2. Faça um campo aparecer na página', paragraphs: [
        'Abra o arquivo gerado e acrescente research_weight à classe ResearchMethodConfig, mantendo n_samples e hidden_units. Field já está importado no scaffold.',
        'O JSON Schema dessa classe gera o formulário: o campo aparece com valor inicial 0.1, descrição e limites de 0 a 1. A validação rejeita valores fora do intervalo antes do treinamento. Campos compartilhados de dados, treino, saída e device vêm de BaseTaskConfig.',
        'No decorador @register_task, label define o nome da aba e accent define sua cor. A chave research_method identifica a tarefa e deve começar com letra minúscula, contendo apenas letras minúsculas, números e _. As chaves das cinco tarefas embutidas são reservadas.',
      ], code: taskConfig, codeLabel: 'Python · trecho dentro da classe Config gerada' },
      { id: 'loss', title: '3. Conecte o campo ao seu método', paragraphs: [
        'Troque compute_loss pelo trecho abaixo. Ele combina o erro quadrático da regressão com uma penalização média nos parâmetros do modelo, ponderada pelo valor do formulário. É uma demonstração de como conectar um hiperparâmetro ao cálculo, sem alegação de melhoria.',
        'O modelo já está no device escolhido. Mova os tensores do batch para esse mesmo device e retorne uma loss escalar com gradiente. Não use item() nem detach() na loss retornada ao engine.',
      ], code: loss, codeLabel: 'Python · método completo para substituir no scaffold' },
      { id: 'hooks', title: '4. Substitua os quatro hooks', paragraphs: [
        'Quando o fluxo estiver funcionando, substitua os componentes sintéticos pelos do seu problema. Importe as dependências no próprio arquivo e mantenha os nomes das métricas consistentes com o registro.',
      ], steps: [
        'build_model(cfg) retorna um nn.Module novo, construído com os parâmetros do Config.',
        'build_loaders(cfg) retorna (train_loader, val_loader, test_loader_ou_None). Faça os splits sem vazamento e aplique as transformações que seu modelo exige.',
        'compute_loss(model, batch, cfg) retorna uma loss escalar por batch. O engine cuida de backward, optimizer e execução por época.',
        'compute_metrics(model, loader, cfg) retorna um dict de números. Para MAE, some erros absolutos e divida pelo total de elementos avaliados; a média simples de médias por batch dá peso errado a um último batch menor.',
      ], code: taskRegistration, codeLabel: 'Python · registro e início da classe; os hooks continuam no arquivo', note: 'Datasets definidos no arquivo de tarefa precisam de DataLoader com num_workers=0. Para workers paralelos, coloque o Dataset em um pacote importável instalado. O arquivo completo do tutorial já usa 0.' },
      { id: 'run', title: '5. Abra a aba e rode em CPU', paragraphs: [
        'Abra ou recarregue a GUI e escolha a aba Research method. As tarefas são descobertas por requisição; adicionar o arquivo não exige reinstalar o pacote. Se houver erro de importação, confira o aviso no terminal e o diagnóstico de doctor.',
        'No exemplo baixado, o campo research_weight do formulário alimenta diretamente a loss. O monitor mostra a execução; ao terminar, encontre a run no histórico e seu run.json no diretório de saída configurado.',
      ], steps: [
        'Escolha CPU no device e 1 época, batch size 8 e n_samples 32. Mantenha hidden_units 32.',
        'Informe . no diretório base dos dados. BaseTaskConfig exige esse campo, embora o dataset sintético deste exemplo não leia imagens do disco. Use num_workers 0.',
        'Use research_weight 0.1 e clique em Treinar. Confira a execução e a métrica mae, cuja direção é lower.',
        'Depois exporte o YAML para guardar a configuração e experimente alterar research_weight. Uma execução curta verifica integração; resultados de pesquisa exigem um protocolo próprio.',
      ] },
      { id: 'research', title: '6. Compare hipóteses de pesquisa', paragraphs: [
        'Declare métricas como {"mae": "lower"} ou {"accuracy": "higher"} e escolha primary_metric entre elas. Essa direção controla a seleção do melhor checkpoint. Os nomes devem coincidir com o que compute_metrics devolve.',
        'Uma busca pode variar um campo do Config, como research_weight, para comparar alternativas. Réplicas executam múltiplas seeds da mesma configuração e resumem média, desvio padrão e intervalo de confiança de 95%. Não há endpoint /compare para tarefas próprias; use a busca em um eixo para esse tipo de comparação.',
        'No fluxo de quatro hooks, o engine fornece seeding, escolha de device, AMP quando aplicável, early stopping, checkpoint, eventos ao vivo, TensorBoard e registro da execução. O desenho do experimento, os splits e a implementação correta das métricas continuam sendo responsabilidade do autor.',
        'Para um laço que não segue épocas, há a extensão avançada run(cfg, ctx). Ela exige implementar o fluxo e os eventos necessários. Consulte a API da versão instalada antes de usá-la; não basta trocar o nome de um dos quatro hooks.',
      ] },
    ],
  },
  {
    lang: 'en', slug: '', title: 'First training run',
    description: 'From your research folder to a first experiment: organize data, configure training and find the results.',
    source: 'docs/QUICKSTART.md',
    sections: [
      { id: 'workspace', title: '1. Prepare your research folder', paragraphs: [
        'Start with the OS-specific installation linked in the sidebar. This guide assumes a virtual environment with visionforge-studio installed and a successful selftest --quick.',
        'Open a terminal in the folder where you want to keep experiments. VisionForge discovers user_models/ and user_tasks/ relative to this working directory; outputs/ holds results. Run the commands below from that folder. The GUI opens at the local address printed in the terminal, normally http://127.0.0.1:8000.',
      ], code: launch, codeLabel: 'Terminal · environment already installed', note: 'Windows examples call the .venv executable directly. Linux and macOS examples use .venv/bin. Keep the terminal running while using the interface.' },
      { id: 'data', title: '2. Organize a classification dataset', paragraphs: [
        'Start with two classes of RGB images and separate training, validation and test folders. Each class subfolder names one class. The tree below is an input format, not a dataset bundled with this website.',
        'Keep examples separate across splits. Images from the same patient, object or sequence should stay in one split when they share that dependency; record the rule in your research protocol.',
      ], code: dataset, codeLabel: 'Folder structure · put your images in the subfolders', note: 'The application also has a dataset downloader with integrated providers. Check size, license and destination before downloading. Other tasks have their own formats, described in the project dataset reference.' },
      { id: 'configure', title: '3. Configure a small run', paragraphs: ['In the Classification tab, select datasets/two-classes. Check detected splits and class counts before training.'], steps: [
        'Apply the detected class count: 2 in this example. Give the experiment a recognizable name.',
        'Select an available architecture. Disable pretrained weights for a test without weight downloads; transfer learning may need to download weights.',
        'Choose CPU, 1 epoch and a small batch size to check the workflow. This checks execution rather than final model quality.',
        'Check the output directory and press Train. Then adjust the epoch budget, data and hyperparameters for your experiment.',
      ] },
      { id: 'results', title: '4. Monitor training and find results', paragraphs: [
        'The live monitor displays events and per-epoch metrics. When training finishes, inspect the task results and use History to retrieve the run.',
        'Each run directory contains run.json with configuration, seed, environment, metrics and history, alongside task-specific artifacts. The default output root is outputs/models/. Keep method code and the data version with your protocol: a JSON file alone cannot recover those files.',
      ] },
      { id: 'repeat', title: '5. Export and repeat the experiment', paragraphs: [
        'Use Export YAML in the panel header to save the configuration. Import YAML restores the form. With the same files and dependencies available, the CLI can also execute that configuration.',
        'For research results, keep splits and metrics comparable and report variation across runs. Custom tasks support multi-seed Replicates; classification offers strategies such as K-fold and sweeps, plus history comparisons. Available strategies differ across tasks.',
        'Classification test-set bootstrap intervals hold the model fixed. They describe uncertainty associated with test samples and do not replace retraining with several seeds. Configuration and seeds help reproduction, but hardware and nondeterministic operations may change results.',
      ], code: `# Windows\n.\\.venv\\Scripts\\visionforge.exe run experiment.yaml\n\n# Linux / macOS\n./.venv/bin/visionforge run experiment.yaml`, codeLabel: 'Terminal · substitute the exported YAML filename' },
      { id: 'next', title: '6. Bring your method into the interface', paragraphs: [
        'If your change is the architecture, follow Your architecture: register a builder in user_models/ and use an existing task.',
        'If you need your own data, loss, metrics or user-facing parameters, follow Your training page. A Python Config generates the form, and four hooks connect the method to the VisionForge engine.',
      ], code: workspace, codeLabel: 'A working directory for a research project' },
    ],
  },
  {
    lang: 'en', slug: 'model', title: 'Your architecture',
    description: 'Register a PyTorch model in user_models/ and configure its use through YAML without editing the package.',
    source: 'docs/custom/MODELS.md',
    sections: [
      { id: 'choose', title: '1. Choose the extension point', paragraphs: [
        'Use a custom model when an existing task already provides the data handling, loss and metrics you need. The custom_model registry supports classification, regression and segmentation. Detection and anomaly use their own model paths.',
        'The builder receives num_outputs and returns a torch.nn.Module. Classification needs logits shaped [batch, num_classes]; regression needs values shaped [batch, num_targets]. Segmentation needs spatial logits [batch, num_classes, height, width] compatible with the task.',
      ], note: 'This tutorial CNN returns [batch, num_outputs] and demonstrates classification or regression. For segmentation, replace it with an architecture that preserves or reconstructs spatial dimensions.' },
      { id: 'code', title: '2. Save your model in user_models/', paragraphs: [
        'In your research folder, create user_models/research_cnn.py with the code below. The complete file is also available at the end of the guide. This example needs no pretrained weights or downloads.',
        'The decorator registers research_cnn. The final layer uses num_outputs to match the problem output dimension. Do not add softmax to this classification example: the task expects logits when computing its loss.',
      ], code: modelExample, codeLabel: 'user_models/research_cnn.py · complete file' },
      { id: 'select', title: '3. Configure the model through YAML', paragraphs: [
        'Configure data in the GUI and export YAML. Set model.custom_model to research_cnn as shown in the next section. Run the complete YAML through the CLI from the same research folder. The current classification panel has no dedicated selector for registered models.',
        'Discovery imports .py files from user_models/ on demand. Filenames starting with _ are ignored. Adding the file does not require reinstalling the package.',
      ], steps: ['Use the First training run dataset with 2 classes to test classification.', 'In the exported YAML, set custom_model: research_cnn, training.epochs: 1 and device.kind: cpu. Execute visionforge run using the executable in your .venv.', 'Check metrics and run.json, then replace the CNN with the model from your work.'] },
      { id: 'yaml', title: '4. Identify the model in YAML', paragraphs: [
        'Export the panel configuration to obtain a complete YAML file. The fragment below only selects the model. When custom_model is set, the built-in architecture name and pretrained fields are ignored.',
        'For regression, use its task-specific config and num_targets as the output dimension. Do not use this fragment as a complete run file: data and training also need configuration.',
      ], code: modelConfig, codeLabel: 'YAML · classification configuration fragment' },
      { id: 'debug', title: '5. If the model does not appear', paragraphs: [
        'Run doctor in the directory where you started the GUI and check the resolved user_models/ path and discovered models. Read terminal import warnings: a missing dependency or file error causes that model to be skipped.',
        'Check the registered name and output shape. This example accepts three RGB channels. An architecture for grayscale images or segmentation must match the tensors provided by that task loaders.',
        'When sharing the experiment, include research_cnn.py and its dependencies. Naming a model in YAML does not embed its Python code into the package or checkpoint.',
      ], code: launch, codeLabel: 'Terminal · diagnose and launch from your research folder' },
    ],
  },
  {
    lang: 'en', slug: 'task', title: 'Your training page',
    description: 'Turn a research method into a task: Python-generated fields, your own data and loss, live monitoring and experiment history.',
    source: 'docs/custom/TASKS.md',
    sections: [
      { id: 'generate', title: '1. Generate a working task', paragraphs: [
        'Use a custom task when you need control over model, data, loss, metrics and method parameters. VisionForge creates a tab and form from your Python definition; you implement four hooks called by the engine during training.',
        'In your research folder with the environment installed, run new-task research_method. It creates user_tasks/research_method.py. The --package option creates user_tasks/research_method/task.py, useful for keeping supporting files next to the task.',
        'The scaffold already runs synthetic regression with 8 input features and one scalar target. It needs no dataset or external weights. The name identifies this tutorial; the demonstration is not a new academic method.',
      ], code: scaffold, codeLabel: 'Terminal · use the commands for your OS', note: 'Either start with the scaffold and apply the changes below, or download research_method.py at the end and save it in user_tasks/. Choose one path to avoid overwriting your work.' },
      { id: 'form', title: '2. Make a field appear on the page', paragraphs: [
        'Open the generated file and add research_weight to ResearchMethodConfig, keeping n_samples and hidden_units. The scaffold already imports Field.',
        'The class JSON Schema generates the form: the field appears with initial value 0.1, help text and limits from 0 to 1. Validation rejects out-of-range values before training. Shared data, training, output and device settings come from BaseTaskConfig.',
        'In @register_task, label names the tab and accent sets its color. The key research_method identifies the task and must start with a lowercase letter and contain only lowercase letters, digits and _. The five built-in task keys are reserved.',
      ], code: taskConfig, codeLabel: 'Python · insert inside the generated Config class' },
      { id: 'loss', title: '3. Connect the field to your method', paragraphs: [
        'Replace compute_loss with the code below. It combines regression mean squared error with a mean parameter penalty weighted by the form value. This demonstrates how to connect a hyperparameter to a calculation, without claiming an improvement.',
        'The model is already on the selected device. Move batch tensors to that device and return a scalar loss with gradients. Do not call item() or detach() on the loss returned to the engine.',
      ], code: loss, codeLabel: 'Python · complete method to replace in the scaffold' },
      { id: 'hooks', title: '4. Replace the four hooks', paragraphs: [
        'Once the workflow runs, replace the synthetic components with your own problem. Import dependencies in the file and keep metric names consistent with registration.',
      ], steps: [
        'build_model(cfg) returns a fresh nn.Module built from Config parameters.',
        'build_loaders(cfg) returns (train_loader, val_loader, test_loader_or_None). Avoid leakage between splits and apply the transforms your model requires.',
        'compute_loss(model, batch, cfg) returns one scalar loss per batch. The engine handles backward, optimizer and epoch execution.',
        'compute_metrics(model, loader, cfg) returns a numeric dict. For MAE, sum absolute errors and divide by the number of evaluated elements; averaging batch means equally overweights a smaller last batch.',
      ], code: taskRegistration, codeLabel: 'Python · registration and class opening; keep the hooks in the file', note: 'Datasets defined inside a task file need DataLoader num_workers=0. For parallel workers, put the Dataset in an installed, importable package. The complete tutorial file already uses 0.' },
      { id: 'run', title: '5. Open the tab and run on CPU', paragraphs: [
        'Open or reload the GUI and choose Research method. Tasks are discovered on requests; adding a file does not require reinstalling the package. If import fails, inspect the terminal warning and doctor diagnostics.',
        'In the downloadable example, the research_weight field directly controls the loss. Watch the live monitor, then find the run in History and its run.json in the configured output directory.',
      ], steps: [
        'Select CPU, 1 epoch, batch size 8 and n_samples 32. Keep hidden_units 32.',
        'Set the data base directory to . . BaseTaskConfig requires this field, although the synthetic dataset does not read images from disk. Use num_workers 0.',
        'Set research_weight to 0.1 and press Train. Check the run and its mae metric, whose direction is lower.',
        'Export YAML to preserve the configuration and try changing research_weight. A short run checks integration; research results need their own experimental protocol.',
      ] },
      { id: 'research', title: '6. Compare research hypotheses', paragraphs: [
        'Declare metrics as {"mae": "lower"} or {"accuracy": "higher"} and select primary_metric from those names. This direction controls best-checkpoint selection. Names must match compute_metrics output.',
        'A sweep can vary a Config field such as research_weight to compare alternatives. Replicates execute the same configuration with several seeds and summarize mean, standard deviation and a 95% confidence interval. Custom tasks have no /compare endpoint; use a one-axis sweep for that comparison.',
        'With four hooks, the engine provides seeding, device selection, AMP where applicable, early stopping, checkpoints, live events, TensorBoard and run records. Experiment design, splits and correct metric implementation remain the responsibility of the author.',
        'For training that does not follow epochs, the advanced run(cfg, ctx) extension lets you own the loop. It requires implementing the necessary workflow and events. Check the installed version API before using it; renaming one of the four hooks is insufficient.',
      ] },
    ],
  },
  ...projectGuides,
];

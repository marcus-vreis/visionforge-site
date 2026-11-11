import type { Guide } from './guide-types';
import { release, plannedVersion } from './release';

const docs = `${release.repository}/blob/development/docs/gui/`;
const decisions = `${release.repository}/blob/development/docs/dev/DECISIONS.md`;

/** Excerpt of TOURS in src/visionforge/core/code_tour.py on the development branch, checked against that file. */
const toursSnippet = `TOURS: dict[str, tuple[Section, ...]] = {
    "classification": CLASSIFICATION,
    "regression": REGRESSION,
    "segmentation": SEGMENTATION,
    "anomaly": ANOMALY,
    "detection": DETECTION,
}`;
/** Body of Trainer._build_criterion in src/visionforge/core/trainer.py on the development branch, checked against that file. */
const criterionSnippet = `if self._config.task == "binary":
    return nn.BCEWithLogitsLoss()
return nn.CrossEntropyLoss()`;

const ptPlanned = `A partir da ${plannedVersion} (em desenvolvimento). A versão publicada é a ${release.version} e não tem este recurso.`;
const enPlanned = `From ${plannedVersion} (in development). The published version is ${release.version} and does not have this feature.`;

/** Guides for Colab training, exporters and the Code tab, written from the product documentation and ADRs. */
export const featureGuides: Guide[] = [
  {
    lang: 'pt', slug: 'colab', title: 'Treinar no Google Colab',
    description: 'Como o VisionForge treina uma classificação numa máquina do Colab, na sua conta Google, e traz o resultado de volta como uma execução local.',
    source: 'docs/gui/colab.md', sourceRef: 'development',
    availability: `Treino no Colab: desde a ${release.version}. Dataset no Drive e exportação para o Drive: a partir da ${plannedVersion}.`,
    references: [{ label: 'ADR-163 e ADR-164 (decisões)', url: decisions }],
    sections: [
      { id: 'overview', title: 'O que o treino no Colab faz', paragraphs: [
        'O VisionForge treina uma classificação numa máquina do Colab, na sua conta Google, e traz o resultado de volta como uma execução do Histórico. Só a classificação tem treino no Colab.',
        'O VisionForge não fala com o Colab diretamente: ele comanda a google-colab-cli, fixada na versão 0.7.5. Ela é instalada num ambiente virtual próprio, em ~/.visionforge/colab-cli/venv, e nunca no ambiente do seu projeto. O treino usa a mesma fila e a mesma aba Resultados de um treino local.',
        'Nada escuta na sua máquina e nenhum túnel é aberto. O Windows roda a CLI sem WSL.',
      ] },
      { id: 'connect', title: 'Conectar a conta', paragraphs: [
        'A conexão fica no canto "colab" do cabeçalho. Cada perfil entra com a sua conta: toda chamada da CLI roda com HOME e USERPROFILE apontando para ~/.visionforge/colab/<perfil>/, e o login fica em .config/colab-cli/token.json dentro dessa pasta. O VisionForge só confere se o arquivo existe. Ele não lê o token, não o grava em log e não o envia a lugar nenhum.',
      ], steps: [
        'Instale a CLI do Colab pelo botão do painel. Leva um ou dois minutos.',
        'Inicie o login. A interface mostra o endereço do Google; autorize no navegador e cole o código de volta na interface.',
        'Confira a conta mostrada. O e-mail vem do comando colab whoami.',
        'O painel mostra o saldo de compute units e, quando a conta informa esse saldo, as horas restantes: o saldo dividido pela taxa do acelerador escolhido.',
      ], note: 'Trocar de conta apaga o login daquele perfil. Isso remove a cópia neste computador e não revoga nada na conta Google.' },
      { id: 'train', title: 'Treinar', paragraphs: [
        'Configure a classificação como de costume. Com o perfil conectado, o botão "treinar no Colab" fica ativo; sem login, ele fica desligado.',
        'O pedido de treino leva a configuração do experimento, a origem do dataset e o acelerador. O servidor valida a configuração, exceto que a pasta data.base_dir exista neste computador, porque o dataset fica em outro lugar. A VM não recebe uploads desta máquina.',
      ], list: [
        'Origem por URL: um zip num endereço http(s) público, com as pastas de treino, validação e teste da configuração dentro.',
        'Origem por provedor: um dataset público que a VM baixa sozinha, como torchvision:<nome> ou hf:<dono/nome>. Nenhuma credencial sai deste computador.',
        'Acelerador: T4 (padrão), L4, A100, H100 ou G4.',
      ], note: 'Não foi conferido onde cada um desses campos aparece na tela. A lista acima vem do esquema do pedido e do registro de mudanças.' },
      { id: 'queue', title: 'Fila e resultado', paragraphs: [
        'A fila local continua com um treino por vez. O Colab tem uma fila por conta Google, porque a cota de sessões e as compute units pertencem à conta. Um treino local e um do Colab podem rodar ao mesmo tempo, e dois perfis na mesma conta dividem a fila dela. A folha da fila mostra uma seção por fila, e cada linha diz onde o treino roda.',
        'Os eventos de cada época chegam ao vivo na aba Resultados. O botão parar libera a VM na hora: a época em andamento se perde. A VM também é liberada quando o treino termina ou falha.',
        'No fim, antes de liberar a VM, o VisionForge empacota a execução como bundle de experimento e a baixa. O import confere o manifesto e os checksums, recusa nomes inseguros e arquivos acima de 2 GB, monta a execução numa pasta temporária fora de models/ e a move com um único rename. Se o download ou o import falhar, o treino termina com o motivo e nada fica pela metade.',
        'A execução entra em models/ do perfil como qualquer execução local, com device_used e o ambiente da VM (GPU, torch, Python). O Histórico a marca como Colab e o run.json ganha origin com kind "colab".',
      ], note: 'Os gráficos não fazem parte do formato do bundle. Uma execução importada traz o run.json e o checkpoint, sem os PNGs.' },
      { id: 'drive', title: 'Dataset no Google Drive', paragraphs: [
        'Disponível a partir da ' + plannedVersion + '. Na versão ' + release.version + ', use a origem por URL ou por provedor.',
        'Quando a pasta do dataset da configuração está no Google Drive para desktop, o treino pode lê-la sem upload. O servidor traduz data.base_dir para /content/drive/MyDrive/... e envia a contagem de arquivos local. A pasta "Meu Drive" ou "My Drive" é procurada nesta ordem: a pasta digitada, o DefaultMountPoint do Drive para desktop no registro, e um componente "My Drive" ou "Meu Drive" logo abaixo de uma letra de unidade ou da pasta pessoal. Uma pasta fora do Drive, ou vazia, é recusada antes de gastar uma máquina.',
        'O Google pede a permissão a cada máquina nova, e ela não é guardada. A folha de treino mostra "Permitir acesso ao Drive", que abre a página do Google numa aba nova. Ao voltar à janela, a interface avisa o servidor e o treino continua. "Já permiti" é o recurso quando o foco da janela não dispara. Ninguém precisa de um terminal.',
        'Se a montagem falha com erro 400, a CLI é reiniciada e tenta de novo com um endereço novo, até 3 vezes. A espera pela pessoa é de 600 s por tentativa, e o silêncio da CLI, de 120 s. Um treino na fila que chega à montagem sem ninguém na tela espera até 3 vezes 10 minutos, falha e libera a máquina.',
        'A VM copia a pasta para o disco dela e falha se achar menos arquivos do que este computador tem, o que costuma indicar uma pasta que o Drive ainda está enviando. Opcionalmente, o pacote da execução também é gravado em MyDrive/VisionForge/runs/. Uma falha nessa gravação não derruba o treino.',
      ] },
      { id: 'limits', title: 'Limites e cuidados', paragraphs: [
        'A CLI é nova e muda com frequência. A versão fixada e os testes do repositório, que usam uma CLI falsa, são a proteção. O código lê trechos em inglês da saída da CLI, como "Please visit" e "Mounted at", então outra versão pode quebrar o fluxo.',
        'O código de saída do colab exec não é confiável na versão fixada. Por isso o fim do treino é um evento próprio, e um treino que termina sem ele falha com a última saída.',
        'O painel lista as máquinas vivas da conta e marca as que o VisionForge abriu, para que um treino interrompido não deixe uma máquina ligada. As que foram abertas fora do VisionForge devem ser paradas em colab.research.google.com.',
      ] },
      { id: 'unverified', title: 'O que não foi verificado', paragraphs: [
        'Este guia vem da leitura do código e das decisões ADR-163 e ADR-164. Os testes do repositório usam uma CLI falsa.',
        'A medição da ADR-163 foi uma execução, numa conta paga: o T4 foi alocado em 4,1 s, 180 dos 180 ticks de 1 s chegaram e colab stop não deixou sessão. Contas gratuitas não foram testadas, e não se sabe se recebem uma GPU nem o que colab usage mostra para elas.',
        'A detecção do "Meu Drive" nunca rodou numa máquina com o Google Drive para desktop instalado.',
        'Este guia não tem capturas de tela. O site ainda não tem capturas reais desta parte da interface, e o guia não usa imagens reconstruídas.',
      ] },
    ],
  },
  {
    lang: 'pt', slug: 'publicar', title: 'Publicar e registrar execuções',
    description: 'O que o Histórico envia a Zenodo, Hugging Face Hub, GitHub, DVC, MLflow e Weights & Biases, o que não envia, e como tratar os tokens.',
    source: 'docs/gui/zenodo.md', sourceRef: 'development',
    availability: ptPlanned,
    references: [
      { label: 'Zenodo (guia do repositório)', url: `${docs}zenodo.md` },
      { label: 'Hugging Face Hub (guia do repositório)', url: `${docs}hugging-face-hub.md` },
      { label: 'GitHub (guia do repositório)', url: `${docs}github.md` },
      { label: 'DVC (guia do repositório)', url: `${docs}dvc.md` },
      { label: 'MLflow (guia do repositório)', url: `${docs}mlflow.md` },
      { label: 'Weights & Biases (guia do repositório)', url: `${docs}wandb.md` },
      { label: 'Tokens e chaves (guia do repositório)', url: `${docs}tokens.md` },
      { label: 'ADR-170 a ADR-176 (decisões)', url: decisions },
    ],
    sections: [
      { id: 'overview', title: 'Seis destinos, um padrão', paragraphs: [
        'A partir de uma execução do Histórico, o VisionForge pode enviar o registro a seis destinos. Cada um recebe uma parte diferente:',
      ], list: [
        'Zenodo: o bundle da execução, como rascunho não publicado.',
        'Hugging Face Hub: o checkpoint, um model card e as métricas, num repositório de modelo privado.',
        'GitHub: o relatório da execução, sem pesos, num repositório privado que já existe.',
        'DVC: o relatório no git de um repositório deste computador e os pesos sob o DVC.',
        'MLflow: parâmetros públicos, métricas por época e o run.json, num banco SQLite local.',
        'Weights & Biases: parâmetros públicos e métricas, num projeto privado.',
      ], note: 'Zenodo, Hub, GitHub e DVC são envios explícitos, feitos pelo Histórico depois de uma prévia local. MLflow e Weights & Biases são opções do perfil, aplicadas a treinos de classificação enviados depois de ativá-las. O Histórico repete uma exportação que falhou.' },
      { id: 'tokens', title: 'Tokens', paragraphs: [
        'O VisionForge guarda os tokens neste computador, em texto puro, em ~/.visionforge/ (a variável VISIONFORGE_HOME troca a pasta). Cada serviço tem uma pasta, como hub-tokens, wandb-tokens, zenodo-tokens, zenodo-sandbox-tokens e github-tokens, e o token é salvo por perfil. A interface só informa se existe um token salvo. Se a pasta de modelos do perfil mudar de caminho, o token deixa de ser encontrado e é preciso salvá-lo de novo.',
        'Crie sempre um token novo, dedicado ao VisionForge. O escopo mínimo que o repositório documenta:',
      ], list: [
        'Zenodo e Zenodo Sandbox: token de acesso pessoal só com deposit:write. Deixe deposit:actions de fora: sem ele o token não consegue publicar, e a publicação fica com você, no site. Os dois sites têm contas separadas e, por isso, dois tokens.',
        'GitHub: token fine-grained limitado ao repositório de experimentos, com a permissão Contents de leitura e escrita.',
        'Hugging Face Hub: token de escrita com o menor escopo possível.',
        'Weights & Biases: chave criada nas configurações da conta. O escopo mínimo não foi verificado, porque o código não o define.',
        'MLflow local e DVC: o VisionForge não guarda token. As credenciais do remoto do DVC são do próprio DVC.',
      ], note: 'Remover o token na interface apaga a cópia deste computador e não revoga nada. Para revogar, use a conta do serviço. Em servidor exposto na rede, perfis não são controle de acesso: quem alcança o servidor escolhe qualquer perfil e pode usar, trocar ou remover o token dele. Prefira HTTPS ou mantenha o servidor em localhost.' },
      { id: 'zenodo', title: 'Zenodo: rascunho com o bundle', paragraphs: [
        'No Histórico, abra uma execução e use "Criar rascunho no Zenodo". A prévia é local e não precisa de token: mostra o nome, o tamanho, os membros do arquivo e o que ficou de fora. O envio só aceita o bundle da prévia; se algo mudou, o servidor recusa e pede outra prévia.',
        'O bundle é um zip com o run.json, a configuração, o histórico e as predições selecionadas, o checkpoint e um manifesto com SHA-256 e tamanho de cada arquivo. O run.json do bundle é público: run_dir vira ".", os artefatos viram nomes de membros e os caminhos locais ficam só com o nome final, o que evita levar o nome da sua conta para um arquivo permanente. A execução no disco não muda.',
        'O VisionForge cria um depósito vazio e coloca o bundle nele. Ele nunca envia metadados e nunca publica: título, autores e licença ficam para você preencher no Zenodo. A página escolhe entre zenodo.org e sandbox.zenodo.org, e o token só vai, por HTTPS, a links do site escolhido.',
        'Cada envio cria um rascunho novo. Enviar duas vezes deixa dois rascunhos, e você guarda um e descarta o outro. Um registro publicado não pode ser apagado, só versionado. Os gráficos não vão no bundle, o checkpoint vai como foi gravado, e um caminho local dentro de um texto que não seja caminho de unidade, UNC ou da pasta do usuário não é reescrito: confira a prévia.',
      ] },
      { id: 'hub', title: 'Hugging Face Hub: modelo privado', paragraphs: [
        'Abra uma execução individual com checkpoint e selecione a exportação para o Hugging Face Hub. A prévia é local e funciona sem token: confira o model card, a lista de arquivos e a origem dos pesos. O ambiente do servidor precisa do extra visionforge-studio[hub].',
        'Informe o destino como usuário/modelo ou organização/modelo. Somente o botão de envio publica os arquivos. O servidor recusa um destino público ou de visibilidade desconhecida. Se o pacote mudar depois da prévia, abra outra prévia antes de confirmar. A visibilidade ainda pode mudar no Hub depois da última checagem.',
        'O checkpoint é copiado como foi gravado e pode conter classes, caminhos ou outros metadados internos. O arquivo de métricas é uma seleção do registro, não o run.json completo. A exportação não transforma os pesos em um modelo compatível com Transformers.',
        'O envio usa só o token salvo no perfil. Ele não herda HF_TOKEN nem o login do ambiente, e não usa a chave de download de datasets.',
      ] },
      { id: 'github', title: 'GitHub: relatório sem pesos', paragraphs: [
        'Use "Enviar o relatório ao GitHub" e informe usuário/repositório. O repositório precisa existir e ser privado: o VisionForge o lê antes de escrever e recusa um que não seja privado. Ele não cria repositórios. Só github.com é suportado, não o GitHub Enterprise.',
        'A execução vira uma pasta runs/<experimento>/<execução>/ com um README gerado do run.json (resumo, métricas finais, tabela por época de até 200 linhas e os gráficos), o run.json público, sem caminhos da máquina e com artifacts.model nulo, e os gráficos em figures/ (PNG e JPEG, até 5 MB cada, no máximo 20). Pesos não vão, nunca.',
        'Todos os arquivos entram num único commit na branch padrão, sem force, e o commit só sai se bater com a prévia. Enviar de novo troca os arquivos da pasta num commit novo; arquivos que saíram da execução continuam no repositório até você apagá-los.',
      ] },
      { id: 'dvc', title: 'DVC: pesos versionados ao lado do git', paragraphs: [
        'Use "Versionar com DVC" e informe uma pasta deste computador que seja um repositório git com o DVC iniciado na raiz. "Preparar pasta" cria isso: cria a pasta se a pasta-mãe existir, roda git init quando falta e dvc init, e faz commit só dos três arquivos que o dvc init escreve.',
        'A execução vira runs/<experimento>/<execução>/. O git recebe o README, o run.json público, os gráficos, params.yaml, metrics.json, history.csv, dvc.yaml (sem estágios) e model.<ext>.dvc. O DVC recebe os pesos, model.<ext>, por dvc add. Isso permite comparar execuções com dvc metrics show, dvc params diff e dvc plots show.',
        'O commit é "git commit -- <pasta>": o que você já tinha em stage fora dela continua em stage. Com um remoto padrão configurado, o dvc push da execução também roda. Se o push falhar, o commit permanece e a página avisa; exportar de novo repete o push. O VisionForge nunca roda git push, e a configuração do remoto (dvc remote add) é feita por você, fora da página.',
        'Roda o git e o DVC reais, sem terminal e com DVC_NO_ANALYTICS=1. O DVC vem do extra visionforge-studio[dvc] ou do PATH, e o git, do PATH. A saída deles fica no log do servidor. Os pesos ocupam o tamanho do checkpoint duas vezes em disco, na pasta e no cache do DVC. Como as rotas rodam git e DVC numa pasta do servidor, só respondem a um cliente local.',
      ] },
      { id: 'mlflow', title: 'MLflow local', paragraphs: [
        'Em Perfis, ative o MLflow. Vale para treinos de classificação enviados depois, a partir de um treino local. O servidor precisa do extra visionforge-studio[mlflow]; sem ele o treino roda normalmente e o Histórico mostra que a exportação ficou indisponível.',
        'Nada sai da máquina: os dados vão para um banco SQLite em outputs/mlflow/mlflow.db, sem servidor nem conta, agrupados por perfil. São enviados os parâmetros públicos da configuração, as métricas de cada época e o run.json final. Parâmetros cujo nome sugere segredo ou caminho (token, password, secret, credential, path, uri, url e chaves terminadas em _dir) ficam de fora. Dataset, pesos e gráficos não são copiados.',
        'O run.json anexado é o registro completo, com os caminhos da sua máquina. Não compartilhe a pasta outputs/mlflow sem olhar o conteúdo. Uma falha no MLflow nunca derruba o treino: o erro vai para o tracking.json da execução, e repetir pelo Histórico grava só as métricas que faltam, sem duplicar.',
      ] },
      { id: 'wandb', title: 'Weights & Biases privado', paragraphs: [
        'Em Perfis, ative o W&B, informe o projeto (padrão visionforge) e, se quiser, a organização; vazia, vale o usuário dono da chave. É opcional, vem desligado e vale para treinos de classificação. O servidor precisa do extra visionforge-studio[wandb].',
        'Antes do primeiro envio, o VisionForge cria o projeto como privado ou lê o que já existe. Se o projeto existente não for privado, recusa e não envia nada, sem alterá-lo. Um projeto criado privado pode ser tornado público depois, no site. Servidor W&B próprio não é suportado.',
        'São enviados os parâmetros públicos, as métricas de cada época e as métricas finais públicas como resumo. Não vão o run.json, o código, o git, o console, as estatísticas do sistema, o nome da máquina, o requirements.txt, a linha de comando, o dataset, os pesos nem os gráficos. O envio usa só a chave do perfil, não o wandb login do ambiente. O log logs/debug.log do W&B fica neste computador e cita a sua pasta.',
        'Se falhar, o erro vai para o wandb.json da execução e o treino segue. Repetir pelo Histórico reabre o mesmo run, e só as épocas que faltam são acrescentadas.',
      ] },
      { id: 'unverified', title: 'O que não foi verificado', paragraphs: [
        'O fluxo online de Zenodo e Zenodo Sandbox, as chamadas à API do GitHub e o caminho online do Weights & Biases (criar o projeto privado e enviar) têm testes com simulação e não foram conferidos com uma conta real. O dvc push para um remoto real, como S3 ou Google Drive, também não. O W&B foi conferido com o pacote real em modo offline, numa execução de uma época. O repositório não registra um teste do Hub com conta real.',
        'Este guia não tem capturas de tela. O site ainda não tem capturas reais desses painéis, e o guia não usa imagens reconstruídas.',
      ] },
    ],
  },
  {
    lang: 'pt', slug: 'codigo', title: 'A aba Código',
    description: 'A aba que mostra, na tela de treino, as funções reais que treinam, validam e testam o modelo, lidas do pacote instalado.',
    source: 'docs/gui/codigo.md', sourceRef: 'development',
    availability: ptPlanned,
    references: [{ label: 'ADR-173 e ADR-181 (decisões)', url: decisions }],
    sections: [
      { id: 'how', title: 'Como a aba funciona', paragraphs: [
        'Na tela de treino, a aba Código mostra as funções que o VisionForge executa para treinar, validar e testar o modelo, com notas em português ou inglês ao lado das linhas. Ela vem depois de "Como funciona".',
      ], list: [
        'Não é uma cópia. O servidor lê cada função do pacote instalado com inspect a cada pedido, então o texto que você vê é o que roda. A resposta traz o arquivo como caminho dentro do pacote, nunca o caminho absoluto da instalação.',
        'As notas apontam para o texto da linha, nunca para o número. Um teste confere que toda nota ainda encontra a sua linha; se o código mudar e a nota ficar sem linha, a CI falha em vez de apontar para o lugar errado.',
        'O caminho desta execução. Uma nota que depende de uma configuração, como binário ou multiclasse, precisão mista, aumento de dados, família do modelo, perda ou método de anomalia, aparece como o caminho que o seu treino segue ou como um ramo que ele não toma. Uma configuração que o formulário não decide fica sem marca, em vez de adivinhada.',
        'Sem acompanhamento linha a linha. O treino informa uma vez por época; a aba diz que caminho o código toma, não qual linha roda agora.',
      ] },
      { id: 'tasks', title: 'Um roteiro por tarefa', paragraphs: [
        'Classificação, regressão, segmentação, anomalia e detecção têm um roteiro cada. O mapa está em core/code_tour.py, e a lista de tarefas vem do servidor, então uma tarefa nova com roteiro aparece sem mudar a página.',
        'A detecção só tem roteiro com backend torchvision: o laço do Ultralytics é da biblioteca, e a aba explica por que não há código do VisionForge para mostrar. Uma execução que não diz o backend recebe a mesma explicação, porque Ultralytics é o padrão.',
      ], code: toursSnippet, codeLabel: `Python · core/code_tour.py, ramo development (a partir da ${plannedVersion})` },
      { id: 'classification', title: 'Classificação', paragraphs: ['Seis seções, na ordem em que aparecem na aba:'], list: [
        '_build_transforms (core/data.py): monta as transformações da imagem, com tamanho fixo, aumento de dados só no treino, tensor e normalização.',
        'replace_final_layer (models/factory.py): troca a última camada linear por uma com uma saída por classe do seu dataset; o ramo muda com a família do modelo.',
        'Trainer._build_criterion (core/trainer.py): escolhe a perda, BCEWithLogitsLoss no binário e CrossEntropyLoss no multiclasse.',
        'Trainer._train_epoch: uma época de treino, com forward, perda, backward, passo do otimizador e a contagem de acertos.',
        'Trainer._eval_epoch: a validação, em modo de avaliação e sem gradientes, que calcula a val_loss. A época de menor val_loss fica no best_model.pth.',
        'Evaluator.evaluate (core/evaluator.py): roda a inferência no conjunto de teste, uma vez, e devolve as métricas de classificação.',
      ], code: criterionSnippet, codeLabel: `Python · Trainer._build_criterion em core/trainer.py, ramo development (a partir da ${plannedVersion})` },
      { id: 'others', title: 'Regressão, segmentação, anomalia e detecção', paragraphs: [
        'Cada tarefa lista as funções reais que usa, e a aba as abre na mesma ordem. Os nomes abaixo são os de core/code_tour.py.',
      ], list: [
        'Regressão: RegressionCsvDataset.__getitem__, RegressionModelFactory.create, RegressionTrainer._build_criterion (MSE, MAE ou Huber), train_epoch (laço compartilhado), RegressionTrainer._eval_epoch e RegressionTrainer.evaluate_with_predictions.',
        'Segmentação: SegmentationDataset.__getitem__, SegmentationModelFactory._build, UNet.forward, SegmentationTrainer._build_criterion (cross-entropy, Dice ou a combinação), train_epoch, SegmentationTrainer._eval_epoch (a época de maior mIoU fica no best_model.pth), SegmentationTrainer.evaluate_with_confusion e SegmentationMetricAccumulator.compute.',
        'Anomalia: AnomalyDataModule.__init__, AnomalyModelFactory.create, AnomalyTrainer._train_autoencoder_epoch, PatchCore._greedy_coreset, score_images, PatchCore.score, compute_threshold, AnomalyTrainer.evaluate_with_scores e AnomalyTrainer._metrics (AUROC e F1).',
        'Detecção com torchvision: DetectionDataset.__getitem__, DetectionDataset._read_labels, detection_collate, build_torchvision_detector, _build_faster_rcnn, _build_ssd, _build_retinanet, DetectionTrainer._run_torchvision_epoch, DetectionTrainer._eval_torchvision_loss, DetectionTrainer._eval_torchvision_map (a época de maior mAP@0.5 fica no best_model.pth) e _ap_for_class.',
      ] },
      { id: 'routes', title: 'Rotas', paragraphs: [
        'GET /api/code-tour devolve as tarefas com roteiro e as configurações que cada uma lê. GET /api/code-tour/{task} devolve as seções da tarefa: fonte, primeira linha, arquivo dentro do pacote e as notas.',
        'A rota lê as configurações da consulta. Uma chave que a tarefa não conhece, ou um valor que ela não aceita, é descartado, e as notas dessa configuração ficam sem marca. Uma tarefa sem roteiro, ou um treino que não usa o código do projeto, devolve 404 com o motivo no idioma do pedido.',
      ] },
      { id: 'unverified', title: 'O que não foi verificado', paragraphs: [
        'A aba não foi aberta no navegador ao escrever o guia do repositório, e este guia também não foi conferido com ela aberta: as frases vêm do código, das notas do catálogo de mensagens e das ADR-173 e ADR-181. O teste test_docs_code_tab.py do repositório exige que cada função de cada roteiro esteja citada no guia de lá e que os trechos de código existam literalmente na fonte. Os dois trechos acima foram conferidos contra o ramo development.',
        'Este guia não tem capturas de tela. O site ainda não tem capturas reais da aba, e o guia não usa imagens reconstruídas.',
      ] },
    ],
  },
  {
    lang: 'en', slug: 'colab', title: 'Training on Google Colab',
    description: 'How VisionForge trains a classification on a Colab machine, under your Google account, and brings the result back as a local run.',
    source: 'docs/gui/colab.md', sourceRef: 'development',
    availability: `Colab training: since ${release.version}. Drive dataset and export to Drive: from ${plannedVersion}.`,
    references: [{ label: 'ADR-163 and ADR-164 (decisions)', url: decisions }],
    sections: [
      { id: 'overview', title: 'What Colab training does', paragraphs: [
        'VisionForge trains a classification on a Colab machine, under your Google account, and brings the result back as a History run. Only classification can train on Colab.',
        'VisionForge does not talk to Colab directly: it drives google-colab-cli, pinned to version 0.7.5. The CLI is installed in its own virtual environment, in ~/.visionforge/colab-cli/venv, and never in your project environment. Training uses the same queue and the same Results tab as a local run.',
        'Nothing listens on your machine and no tunnel is opened. On Windows the CLI runs without WSL.',
      ] },
      { id: 'connect', title: 'Connecting your account', paragraphs: [
        'The connection lives in the "colab" corner of the header. Each profile signs in with its own account: every CLI call runs with HOME and USERPROFILE pointing to ~/.visionforge/colab/<profile>/, and the login is kept in .config/colab-cli/token.json inside that folder. VisionForge only checks that the file exists. It does not read the token, write it to a log or send it anywhere.',
      ], steps: [
        'Install the Colab CLI from the panel button. It takes a minute or two.',
        'Start the login. The interface shows the Google address; authorize in the browser and paste the code back into the interface.',
        'Check the account shown. The e-mail comes from the colab whoami command.',
        'The panel shows the compute unit balance and, when the account reports one, the hours left: the balance divided by the rate of the chosen accelerator.',
      ], note: 'Switching accounts erases that profile login. This removes the copy on this computer and does not revoke anything in the Google account.' },
      { id: 'train', title: 'Training', paragraphs: [
        'Configure the classification as usual. With the profile connected, the "treinar no Colab" (train on Colab) button is active; without a login it is disabled.',
        'The training request carries the experiment configuration, the dataset source and the accelerator. The server validates the configuration, except that the data.base_dir folder must exist on this computer, because the dataset is somewhere else. Nothing is uploaded from this machine to the VM.',
      ], list: [
        'Source by URL: a zip at a public http(s) address, with the configuration training, validation and test folders inside.',
        'Source by provider: a public dataset the VM downloads by itself, such as torchvision:<name> or hf:<owner/name>. No credential leaves this computer.',
        'Accelerator: T4 (default), L4, A100, H100 or G4.',
      ], note: 'Where each of these fields appears on screen was not checked. The list comes from the request schema and the changelog.' },
      { id: 'queue', title: 'Queue and result', paragraphs: [
        'The local queue still runs one job at a time. Colab has one queue per Google account, because the session quota and the compute units belong to the account. A local run and a Colab run can go at the same time, and two profiles on the same account share its queue. The queue sheet has one section per queue, and each row says where its job runs.',
        'Events of each epoch arrive live in the Results tab. The stop button releases the VM at once: the epoch in progress is lost. The VM is also released when the job ends or fails.',
        'At the end, before releasing the VM, VisionForge packs the run as an experiment bundle and downloads it. The import checks the manifest and checksums, refuses unsafe names and files over 2 GB, builds the run in a temporary folder outside models/ and moves it with a single rename. If the download or the import fails, the job ends with the reason and nothing is left half done.',
        'The run goes into the profile models/ folder like any local run, with device_used and the VM environment (GPU, torch, Python). History marks it as Colab, and run.json gets an origin with kind "colab".',
      ], note: 'Plots are not part of the bundle format. An imported run has run.json and the checkpoint, without the PNGs.' },
      { id: 'drive', title: 'Dataset on Google Drive', paragraphs: [
        'Available from ' + plannedVersion + '. In version ' + release.version + ', use the URL or provider source.',
        'When the dataset folder of the configuration is in Google Drive for desktop, training can read it with no upload. The server translates data.base_dir to /content/drive/MyDrive/... and sends the local file count. The "My Drive" or "Meu Drive" folder is looked up in this order: the folder you typed, the DefaultMountPoint of Drive for desktop in the registry, and a "My Drive" or "Meu Drive" component right under a drive letter or the home folder. A folder outside the Drive, or an empty one, is refused before a machine is paid for.',
        'Google asks for permission for every new machine, and the permission is not kept. The training sheet shows "Permitir acesso ao Drive" (allow Drive access), which opens the Google page in a new tab. When you return to the window, the interface tells the server and training continues. "Já permiti" (I already allowed) is the fallback when window focus does not fire. Nobody needs a terminal.',
        'If the mount fails with a 400 error, the CLI is restarted and tries again with a new address, up to 3 times. The wait for the person is 600 s per attempt, and the CLI silence limit is 120 s. A queued job that reaches the mount with nobody at the screen waits up to 3 times 10 minutes, fails and releases the machine.',
        'The VM copies the folder to its own disk and fails if it finds fewer files than this computer has, which usually means a folder the Drive is still uploading. Optionally, the run bundle is also written to MyDrive/VisionForge/runs/. A failure there does not fail the run.',
      ] },
      { id: 'limits', title: 'Limits and care', paragraphs: [
        'The CLI is new and changes often. The pinned version and the repository tests, which use a fake CLI, are the safeguard. The code reads English fragments of the CLI output, such as "Please visit" and "Mounted at", so another version can break the flow.',
        'The exit code of colab exec is not reliable in the pinned version. Because of that, the end of the job is an event of its own, and a job that ends without it fails with the last output.',
        'The panel lists the live machines of the account and marks the ones VisionForge opened, so an interrupted job does not leave a machine on. Machines opened outside VisionForge must be stopped at colab.research.google.com.',
      ] },
      { id: 'unverified', title: 'What was not verified', paragraphs: [
        'This guide comes from reading the code and decisions ADR-163 and ADR-164. The repository tests use a fake CLI.',
        'The ADR-163 measurement was one run on a paid account: the T4 was granted in 4.1 s, 180 of 180 one-second ticks arrived and colab stop left no session behind. Free accounts were not tested, and it is not known whether they get a GPU or what colab usage shows for them.',
        'The "My Drive" detection never ran on a machine with Google Drive for desktop installed.',
        'This guide has no screenshots. The site does not yet have real screenshots of this part of the interface, and the guide uses no reconstructed images.',
      ] },
    ],
  },
  {
    lang: 'en', slug: 'publicar', title: 'Publishing and tracking runs',
    description: 'What History sends to Zenodo, Hugging Face Hub, GitHub, DVC, MLflow and Weights & Biases, what it does not send, and how to handle tokens.',
    source: 'docs/gui/zenodo.md', sourceRef: 'development',
    availability: enPlanned,
    references: [
      { label: 'Zenodo (repository guide, Portuguese)', url: `${docs}zenodo.md` },
      { label: 'Hugging Face Hub (repository guide, Portuguese)', url: `${docs}hugging-face-hub.md` },
      { label: 'GitHub (repository guide, Portuguese)', url: `${docs}github.md` },
      { label: 'DVC (repository guide, Portuguese)', url: `${docs}dvc.md` },
      { label: 'MLflow (repository guide, Portuguese)', url: `${docs}mlflow.md` },
      { label: 'Weights & Biases (repository guide, Portuguese)', url: `${docs}wandb.md` },
      { label: 'Tokens and keys (repository guide, Portuguese)', url: `${docs}tokens.md` },
      { label: 'ADR-170 to ADR-176 (decisions)', url: decisions },
    ],
    sections: [
      { id: 'overview', title: 'Six destinations, one pattern', paragraphs: [
        'From a History run, VisionForge can send the record to six destinations. Each one receives a different part:',
      ], list: [
        'Zenodo: the run bundle, as an unpublished draft.',
        'Hugging Face Hub: the checkpoint, a model card and the metrics, in a private model repository.',
        'GitHub: the run report, without weights, in a private repository that already exists.',
        'DVC: the report in the git of a repository on this computer, and the weights under DVC.',
        'MLflow: public parameters, per-epoch metrics and run.json, in a local SQLite database.',
        'Weights & Biases: public parameters and metrics, in a private project.',
      ], note: 'Zenodo, Hub, GitHub and DVC are explicit uploads, made from History after a local preview. MLflow and Weights & Biases are profile options, applied to classification trainings submitted after you turn them on. History retries an export that failed.' },
      { id: 'tokens', title: 'Tokens', paragraphs: [
        'VisionForge keeps tokens on this computer, in plain text, in ~/.visionforge/ (the VISIONFORGE_HOME variable changes the folder). Each service has a folder, such as hub-tokens, wandb-tokens, zenodo-tokens, zenodo-sandbox-tokens and github-tokens, and the token is saved per profile. The interface only says whether a token is saved. If the profile models folder changes path, the token is no longer found and must be saved again.',
        'Always create a new token dedicated to VisionForge. The minimum scope the repository documents:',
      ], list: [
        'Zenodo and Zenodo Sandbox: a personal access token with only deposit:write. Leave deposit:actions out: without it the token cannot publish, and publishing stays with you, on the site. The two sites have separate accounts and so two tokens.',
        'GitHub: a fine-grained token limited to the experiments repository, with the Contents permission for read and write.',
        'Hugging Face Hub: a write token with the smallest scope possible.',
        'Weights & Biases: a key created in the account settings. The minimum scope was not verified, because the code does not define it.',
        'Local MLflow and DVC: VisionForge keeps no token. The credentials of a DVC remote belong to DVC itself.',
      ], note: 'Removing the token in the interface deletes the copy on this computer and revokes nothing. To revoke it, use the service account. On a server exposed to the network, profiles are not access control: anyone who reaches the server picks any profile and can use, replace or remove its token. Prefer HTTPS or keep the server on localhost.' },
      { id: 'zenodo', title: 'Zenodo: a draft with the bundle', paragraphs: [
        'In History, open a run and use "Criar rascunho no Zenodo" (create a Zenodo draft). The preview is local and needs no token: it shows the name, the size, the archive members and what was left out. The upload only accepts the previewed bundle; if something changed, the server refuses and asks for another preview.',
        'The bundle is a zip with run.json, the config, the history and the selected predictions, the checkpoint and a manifest with the SHA-256 and size of each file. The run.json in the bundle is public: run_dir becomes ".", artifacts become bundle member names and local paths keep only the final name, which keeps your account name out of a permanent archive. The run on disk does not change.',
        'VisionForge creates an empty deposition and puts the bundle in it. It never sends metadata and never publishes: title, authors and license are left for you to fill in on Zenodo. The page picks between zenodo.org and sandbox.zenodo.org, and the token only goes, over HTTPS, to links on the chosen site.',
        'Each upload creates a new draft. Sending twice leaves two drafts, and you keep one and discard the other. A published record cannot be deleted, only versioned. Plots are not in the bundle, the checkpoint goes as it was saved, and a local path inside text that is not a drive, UNC or home-folder path is not rewritten: check the preview.',
      ] },
      { id: 'hub', title: 'Hugging Face Hub: a private model', paragraphs: [
        'Open a single run with a checkpoint and choose the Hugging Face Hub export. The preview is local and works without a token: check the model card, the file list and where the weights come from. The server environment needs the visionforge-studio[hub] extra.',
        'Enter the destination as user/model or organization/model. Only the send button uploads files. The server refuses a public destination or one of unknown visibility. If the package changes after the preview, open another preview before confirming. Visibility can still change on the Hub after the last check.',
        'The checkpoint is copied as it was saved and may contain classes, paths or other internal metadata. The metrics file is a selection from the record, not the full run.json. The export does not turn the weights into a Transformers-compatible model.',
        'The upload uses only the token saved in the profile. It does not inherit HF_TOKEN or the environment login, and it does not use the dataset download key.',
      ] },
      { id: 'github', title: 'GitHub: a report without weights', paragraphs: [
        'Use "Enviar o relatório ao GitHub" (send the report to GitHub) and enter user/repository. The repository must exist and be private: VisionForge reads it before writing and refuses one that is not private. It does not create repositories. Only github.com is supported, not GitHub Enterprise.',
        'The run becomes a runs/<experiment>/<run>/ folder with a README generated from run.json (summary, final metrics, a per-epoch table of up to 200 rows and the plots), the public run.json, without machine paths and with artifacts.model set to null, and the plots in figures/ (PNG and JPEG, up to 5 MB each, at most 20). Weights are never sent.',
        'All files go in a single commit on the default branch, without force, and the commit only happens if it matches the preview. Sending again replaces the folder files in a new commit; files that left the run stay in the repository until you delete them.',
      ] },
      { id: 'dvc', title: 'DVC: weights versioned beside git', paragraphs: [
        'Use "Versionar com DVC" (version with DVC) and enter a folder on this computer that is a git repository with DVC initialized at its root. "Preparar pasta" (prepare folder) makes one: it creates the folder if its parent exists, runs git init when needed and dvc init, and commits only the three files dvc init writes.',
        'The run becomes runs/<experiment>/<run>/. Git gets the README, the public run.json, the plots, params.yaml, metrics.json, history.csv, dvc.yaml (with no stages) and model.<ext>.dvc. DVC gets the weights, model.<ext>, through dvc add. This lets you compare runs with dvc metrics show, dvc params diff and dvc plots show.',
        'The commit is "git commit -- <folder>": whatever you had staged outside it stays staged. With a default remote configured, dvc push for the run also runs. If the push fails, the commit stays and the page says so; exporting again retries the push. VisionForge never runs git push, and you configure the remote (dvc remote add) outside the page.',
        'It runs the real git and DVC, without a terminal and with DVC_NO_ANALYTICS=1. DVC comes from the visionforge-studio[dvc] extra or from the PATH, and git from the PATH. Their output stays in the server log. The weights take the checkpoint size twice on disk, in the folder and in the DVC cache. Because the routes run git and DVC in a server folder, they answer only a local client.',
      ] },
      { id: 'mlflow', title: 'Local MLflow', paragraphs: [
        'In Profiles, turn on MLflow. It applies to classification trainings submitted afterwards, from a local run. The server needs the visionforge-studio[mlflow] extra; without it training runs normally and History shows that the export is unavailable.',
        'Nothing leaves the machine: data goes to a SQLite database in outputs/mlflow/mlflow.db, with no server or account, grouped by profile. What is sent is the public config parameters, the metrics of each epoch and the final run.json. Parameters whose name suggests a secret or a path (token, password, secret, credential, path, uri, url and keys ending in _dir) are left out. Dataset, weights and plots are not copied.',
        'The attached run.json is the full record, with your machine paths. Do not share the outputs/mlflow folder without checking its content. An MLflow failure never stops training: the error goes to the run tracking.json, and retrying from History writes only the missing metrics, without duplicates.',
      ] },
      { id: 'wandb', title: 'Private Weights & Biases', paragraphs: [
        'In Profiles, turn on W&B, enter the project (default visionforge) and, if you want, the organization; when empty, the key owner user is used. It is optional, off by default and applies to classification trainings. The server needs the visionforge-studio[wandb] extra.',
        'Before the first upload, VisionForge creates the project as private or reads the existing one. If an existing project is not private, it refuses and sends nothing, without changing the project. A project created as private can be made public later, on the site. A self-hosted W&B server is not supported.',
        'What is sent is the public parameters, the metrics of each epoch and the public final metrics as the summary. The run.json, code, git, console, system stats, host name, requirements.txt, command line, dataset, weights and plots are not sent. The upload uses only the profile key, not the environment wandb login. The W&B logs/debug.log stays on this computer and names your folder.',
        'If it fails, the error goes to the run wandb.json and training continues. Retrying from History reopens the same run, and only the missing epochs are added.',
      ] },
      { id: 'unverified', title: 'What was not verified', paragraphs: [
        'The online flow for Zenodo and Zenodo Sandbox, the GitHub API calls and the online Weights & Biases path (creating the private project and uploading) have tests with fakes and were not checked with a real account. Neither was dvc push to a real remote such as S3 or Google Drive. W&B was checked with the real package in offline mode, on a one-epoch run. The repository records no Hub test with a real account.',
        'This guide has no screenshots. The site does not yet have real screenshots of these panels, and the guide uses no reconstructed images.',
      ] },
    ],
  },
  {
    lang: 'en', slug: 'codigo', title: 'The Code tab',
    description: 'The tab that shows, on the training screen, the real functions that train, validate and test the model, read from the installed package.',
    source: 'docs/gui/codigo.md', sourceRef: 'development',
    availability: enPlanned,
    references: [{ label: 'ADR-173 and ADR-181 (decisions)', url: decisions }],
    sections: [
      { id: 'how', title: 'How the tab works', paragraphs: [
        'On the training screen, the Code tab shows the functions VisionForge runs to train, validate and test the model, with notes in Portuguese or English beside the lines. It comes after "How it works".',
      ], list: [
        'It is not a copy. The server reads each function from the installed package with inspect on every request, so the text you see is what runs. The response gives the file as a path inside the package, never the absolute install path.',
        'Notes point at the text of a line, never at its number. A test checks that every note still finds its line; if the code changes and a note loses its line, CI fails instead of pointing at the wrong place.',
        'This run path. A note that depends on a setting, such as binary or multiclass, mixed precision, augmentation, model family, loss or anomaly method, shows up as the path your training follows or as a branch it does not take. A setting the form does not decide is left unmarked rather than guessed.',
        'No line-by-line tracking. Training reports once per epoch; the tab says which path the code takes, not which line is running now.',
      ] },
      { id: 'tasks', title: 'One tour per task', paragraphs: [
        'Classification, regression, segmentation, anomaly and detection have one tour each. The map is in core/code_tour.py, and the task list comes from the server, so a new task with a tour shows up without changing the page.',
        'Detection has a tour only with the torchvision backend: the Ultralytics loop belongs to the library, and the tab explains why there is no VisionForge code to show. A run that does not state the backend gets the same explanation, because Ultralytics is the default.',
      ], code: toursSnippet, codeLabel: `Python · core/code_tour.py, development branch (from ${plannedVersion})` },
      { id: 'classification', title: 'Classification', paragraphs: ['Six sections, in the order they appear in the tab:'], list: [
        '_build_transforms (core/data.py): builds the image transforms, with fixed size, data augmentation only in training, tensor conversion and normalization.',
        'replace_final_layer (models/factory.py): swaps the last linear layer for one with an output per class in your dataset; the branch changes with the model family.',
        'Trainer._build_criterion (core/trainer.py): picks the loss, BCEWithLogitsLoss for binary and CrossEntropyLoss for multiclass.',
        'Trainer._train_epoch: one training epoch, with forward, loss, backward, optimizer step and the count of correct predictions.',
        'Trainer._eval_epoch: validation, in evaluation mode and without gradients, which computes val_loss. The epoch with the lowest val_loss is kept as best_model.pth.',
        'Evaluator.evaluate (core/evaluator.py): runs inference on the test set, once, and returns the classification metrics.',
      ], code: criterionSnippet, codeLabel: `Python · Trainer._build_criterion in core/trainer.py, development branch (from ${plannedVersion})` },
      { id: 'others', title: 'Regression, segmentation, anomaly and detection', paragraphs: [
        'Each task lists the real functions it uses, and the tab opens them in the same order. The names below are the ones in core/code_tour.py.',
      ], list: [
        'Regression: RegressionCsvDataset.__getitem__, RegressionModelFactory.create, RegressionTrainer._build_criterion (MSE, MAE or Huber), train_epoch (shared loop), RegressionTrainer._eval_epoch and RegressionTrainer.evaluate_with_predictions.',
        'Segmentation: SegmentationDataset.__getitem__, SegmentationModelFactory._build, UNet.forward, SegmentationTrainer._build_criterion (cross-entropy, Dice or both), train_epoch, SegmentationTrainer._eval_epoch (the epoch with the highest mIoU is kept as best_model.pth), SegmentationTrainer.evaluate_with_confusion and SegmentationMetricAccumulator.compute.',
        'Anomaly: AnomalyDataModule.__init__, AnomalyModelFactory.create, AnomalyTrainer._train_autoencoder_epoch, PatchCore._greedy_coreset, score_images, PatchCore.score, compute_threshold, AnomalyTrainer.evaluate_with_scores and AnomalyTrainer._metrics (AUROC and F1).',
        'Detection with torchvision: DetectionDataset.__getitem__, DetectionDataset._read_labels, detection_collate, build_torchvision_detector, _build_faster_rcnn, _build_ssd, _build_retinanet, DetectionTrainer._run_torchvision_epoch, DetectionTrainer._eval_torchvision_loss, DetectionTrainer._eval_torchvision_map (the epoch with the highest mAP@0.5 is kept as best_model.pth) and _ap_for_class.',
      ] },
      { id: 'routes', title: 'Routes', paragraphs: [
        'GET /api/code-tour returns the tasks that have a tour and the settings each one reads. GET /api/code-tour/{task} returns the task sections: source, first line, file inside the package and the notes.',
        'The route reads settings from the query. A key the task does not know, or a value it does not accept, is dropped, and the notes for that setting stay unmarked. A task with no tour, or a training that does not use the project code, returns 404 with the reason in the language of the request.',
      ] },
      { id: 'unverified', title: 'What was not verified', paragraphs: [
        'The tab was not opened in a browser when the repository guide was written, and this guide was not checked with it open either: the sentences come from the code, the message catalog notes and ADR-173 and ADR-181. The repository test test_docs_code_tab.py requires every function of every tour to be cited in its guide and the code snippets to exist literally in the source. The two snippets above were checked against the development branch.',
        'This guide has no screenshots. The site does not yet have real screenshots of the tab, and the guide uses no reconstructed images.',
      ] },
    ],
  },
];

# Classificar dígitos manuscritos com seu próprio modelo

Este projeto usa a CNN do tutorial para classificar os dígitos de 0 a 9. Os dados são imagens reais de escrita manual incluídas no scikit-learn, que já é uma dependência do VisionForge. A preparação dos dados e o treino funcionam sem baixar datasets ou pesos. A instalação do pacote exige internet.

O exemplo serve para executar uma arquitetura própria do começo ao fim. Ele não estabelece um resultado de referência ou a validade de um método novo.

## Arquivos

- `prepare_data.py`: converte as imagens em RGB e separa treino, validação e teste.
- `user_models/research_cnn.py`: registra a arquitetura `research_cnn`.
- `configs/digits.yaml`: configuração completa de treino em CPU.
- `inspect_run.py`: lê as métricas e os caminhos gravados no `run.json`.
- `requirements.txt`: fixa a versão do VisionForge usada no guia.
- `.gitignore`: exclui ambiente, dados gerados e resultados do Git.
- `README.en.md`: instruções em inglês.
- `LICENSE`: licença do código de exemplo.

## Windows (PowerShell)

Extraia o ZIP e abra o terminal na pasta `digits-project`, onde está este README. Crie um ambiente para este projeto, mesmo se já tiver o VisionForge em outra pasta.

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe prepare_data.py
.\.venv\Scripts\visionforge.exe doctor
.\.venv\Scripts\visionforge.exe run configs/digits.yaml
.\.venv\Scripts\python.exe inspect_run.py
```

## Linux / macOS Apple Silicon

Instale os pré-requisitos do seu sistema conforme o guia de instalação do VisionForge. Abra o terminal na pasta `digits-project` extraída.

```sh
python3.12 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python prepare_data.py
./.venv/bin/visionforge doctor
./.venv/bin/visionforge run configs/digits.yaml
./.venv/bin/python inspect_run.py
```

O YAML escolhe CPU. Não é necessário executar `doctor --fix` para este exemplo.

## O que acontece em cada etapa

`prepare_data.py` lê `load_digits()`, transforma cada imagem 8 × 8 em um PNG RGB de 32 × 32 e cria `datasets/digits/train`, `val` e `test`. As subpastas `0` a `9` identificam as classes. A divisão estratificada usa seed 42: 60% para treino e 20% para cada um dos outros splits, com arredondamento para quantidades inteiras. `manifest.json` guarda os índices de origem de cada imagem.

O script recusa um destino existente. Para usar outra pasta, execute `prepare_data.py --output datasets/digits-v2` e ajuste `data.base_dir` no YAML. Para conferir o fluxo com menos dados, comece em uma pasta nova e use `prepare_data.py --limit-per-class 12`.

O treino descobre `user_models/research_cnn.py` a partir da pasta atual e chama o builder com 10 saídas. A configuração desliga augmentation e usa batch size 32, 3 épocas e seed 42. A normalização do YAML também deve ser usada ao fazer inferência depois. O exemplo mantém a mesma CNN disponibilizada separadamente no site.

`inspect_run.py` lê a execução mais recente em `outputs/models/` e mostra os valores que ela gravou. Para escolher uma execução, passe o caminho do seu `run.json` como argumento. Abra os gráficos pelos caminhos registrados em `artifacts`.

## Conferir na interface

Depois do treino, execute `visionforge gui` pelo executável da `.venv`, nesta mesma pasta. Abra o histórico e procure `digits_research_cnn`. Para este caso, faça a seleção do modelo pelo YAML e rode pela CLI: o painel atual de classificação não tem um seletor dedicado para modelos registrados.

```powershell
# Windows
.\.venv\Scripts\visionforge.exe gui
```

```sh
# Linux / macOS
./.venv/bin/visionforge gui
```

## Adaptar à sua pesquisa

Substitua a arquitetura no builder mantendo o registro e o formato `[batch, num_outputs]`. Ao trocar os dados, mantenha a estrutura ImageFolder e ajuste `num_classes` e as transformações. Uma loss ou um loader próprio exige o ponto de extensão de tarefas, apresentado no outro guia.

Este split separa imagens, sem assegurar autores distintos entre os conjuntos. Para avaliar generalização entre pessoas, prepare uma divisão por autor com dados que forneçam essa identificação. Compare métodos com os mesmos splits e métricas e repita o treino com várias seeds antes de interpretar diferenças de desempenho.

## Dados e referência

`load_digits()` contém 1.797 imagens 8 × 8 e 10 classes. O scikit-learn distribui uma cópia do conjunto de teste do dataset Optical Recognition of Handwritten Digits, de E. Alpaydin e C. Kaynak (UCI). O exemplo gera as imagens localmente; elas não fazem parte do ZIP. A licença MIT deste código não substitui as condições de uso dos dados.

- https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html
- https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits

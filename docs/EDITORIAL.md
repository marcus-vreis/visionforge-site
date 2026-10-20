# Revisão de textos

Os textos do site usam a skill [Humanizer 3.1.0](https://github.com/blader/humanizer/blob/8c307f367c91bd974002f10f2be2965d642c13df/SKILL.md), sob licença MIT. Ela foi lida e aplicada à apresentação em PT/EN e à documentação de uso. O arquivo consultado nesta sessão está em `.capture/humanizer-SKILL.md`, fora do Git.

Antes de alterar textos, leia a skill e revise o texto inteiro. Preserve comandos, nomes de API, caminhos e referências. Corte repetições, elogios ao produto sem conteúdo e comparações que o leitor não precisa fazer. Prefira explicar o que o usuário executa e o que encontra no resultado. Um aviso fica quando muda uma decisão ou evita uma interpretação incorreta do exemplo.

A revisão não altera dados, resultados, limitações técnicas ou licenças para melhorar o tom. Os textos em inglês devem comunicar o mesmo que os textos em português. Uma formulação curta não pode apagar o escopo de uma métrica ou transformar um exemplo didático em método validado.

## Posicionamento

`Local-first computer-vision experimentation platform` é a descrição do produto em `../VisionForge/pyproject.toml`. No site, local-first significa que a interface e os experimentos rodam no computador do usuário, com dados e resultados em pastas locais. A instalação e downloads opcionais exigem internet.

O termo não afirma que o VisionForge foi a primeira plataforma do mercado. Essa afirmação exigiria outra evidência. A apresentação mantém a expressão local-first e explica seu significado no contexto do produto.

## Caso com dados reais

O caso de dígitos usa `sklearn.datasets.load_digits()`. A função e sua documentação foram consultadas no scikit-learn 1.8.0 instalado: 1.797 imagens 8 × 8, 10 classes, cópia do conjunto de teste da UCI. A API da UCI para o dataset 80 confirma E. Alpaydin e C. Kaynak como criadores e DOI `10.24432/C50P49`. O dataset completo da UCI tem 5.620 amostras; o guia identifica o subconjunto distribuído pelo scikit-learn.

Fontes:

- [scikit-learn: load_digits](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html)
- [UCI: Optical Recognition of Handwritten Digits](https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits)

O guia mostra todos os nove arquivos do projeto. Seu ZIP contém código e instruções; os dados são materializados no computador do usuário. As métricas exibidas por `inspect_run.py` vêm da execução local. O site não publica um valor de desempenho como promessa para esse exemplo.

# Verificação do site

Data: 20/10/2026.

## Evidências locais

- `npm.cmd run check`: 0 erros, 0 warnings e 0 hints.
- `npm.cmd run build`: 8 páginas estáticas geradas, com sitemap e base `/visionforge-site/`.
- `npm.cmd test`: 20 testes aprovados, em 9,7 s, usando Chromium headless já disponível no computador via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
- `& ../VisionForge/.venv/Scripts/python.exe tests/examples.py`: 2 testes aprovados. Modelo: registry real, formas de saída e gradientes. Tarefa: schema, limites do campo, efeito de `research_weight` na loss, MAE com batch final menor e 1 época real em CPU, checkpoint, eventos e `run.json` em pasta temporária.
- 12 links externos de distribuição, documentação, licença e evidência de instalação: HTTP 200 em verificação HEAD de 19/10/2026.
- Inspeção visual: desktop 1440 px e mobile 360 px, temas claro/escuro, screenshots reais e desenhos das tarefas. Layout em 768 px também coberto pelos testes.

Os testes incluem: idiomas/metadados/assets, seleção de sistema, cinco tarefas com teclado, desenhos SVG visíveis, contraste das cinco cores em ambos os temas, cópia real e recusa de clipboard, tema persistente/sistema/storage bloqueado, larguras 360/768/1440, conteúdo sem JavaScript e redução de movimento/skip link. A comparação do clipboard considera CRLF nativo do Windows sem alterar o texto dos comandos.

Os novos testes cobrem as seis rotas de guia, navegação entre idiomas na mesma página, canonical/hreflang, links do sumário, código copiável com recusa de clipboard, downloads Python e acessibilidade dos três guias nas três larguras e nos dois temas. Os asserts de imagens aguardam o carregamento dos assets lazy antes de verificar suas dimensões reais.

Fontes de extensão: código do produto em `a032359`, sem diferenças em relação a `v0.17.0` nos módulos de registry, scaffold, base e engine consultados. QUICKSTART.md e custom/MODELS.md responderam HTTP 200; custom/TASKS.md sofreu HTTP 429 na página do GitHub, mas sua existência no tag foi confirmada pela API autenticada (blob `59fda5127f8c75487d54ea962c5aad719bddbe9f`). O teste Python mostrou warnings existentes do Pydantic sobre defaults Path no JSON Schema; os testes passaram sem suprimi-los.

## Limites

Os testes de navegador são em Chromium. Não houve teste em Safari/Firefox ou em dispositivos móveis físicos. Houve somente o treino sintético curto da tarefa de tutorial em CPU; não foram executados treinos com dados reais, novas instalações do pacote ou testes de CUDA/MPS. O modelo próprio foi validado por forward/backward via registry; o guia orienta a execução por YAML/CLI. Nenhuma verificação atesta qualidade de modelos ou validade de um método acadêmico.

A CI instala a versão de Chromium correspondente ao Playwright travado em `package-lock.json` e repete check, build e testes antes de publicar. O histórico de Actions e Deployments no GitHub é a fonte para o estado de cada publicação.

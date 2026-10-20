# Verificação do site

Data: 20/10/2026.

## Evidências locais

- `npm.cmd run check`: 0 erros, 0 warnings e 0 hints.
- `npm.cmd run build`: 2 páginas estáticas geradas, com sitemap e base `/visionforge-site/`.
- `npm.cmd test`: 13 testes aprovados, em 4,3 s, usando Chromium headless já disponível no computador via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
- 12 links externos de distribuição, documentação, licença e evidência de instalação: HTTP 200 em verificação HEAD de 19/10/2026.
- Inspeção visual: desktop 1440 px e mobile 360 px, temas claro/escuro, screenshots reais e desenhos das tarefas. Layout em 768 px também coberto pelos testes.

Os testes incluem: idiomas/metadados/assets, seleção de sistema, cinco tarefas com teclado, desenhos SVG visíveis, contraste das cinco cores em ambos os temas, cópia real e recusa de clipboard, tema persistente/sistema/storage bloqueado, larguras 360/768/1440, conteúdo sem JavaScript e redução de movimento/skip link. A comparação do clipboard considera CRLF nativo do Windows sem alterar o texto dos comandos.

## Limites

Os testes são do site, em Chromium. Não houve teste em Safari/Firefox ou em dispositivos móveis físicos. Não foram executados treinamentos ou novas instalações do pacote VisionForge: as instruções foram conferidas contra o guia do produto e sua evidência de CI. Nenhum teste local do site atesta funcionamento de CUDA, MPS ou qualidade de modelos.

A CI instala a versão de Chromium correspondente ao Playwright travado em `package-lock.json` e repete check, build e testes antes de publicar. O histórico de Actions e Deployments no GitHub é a fonte para o estado de cada publicação.

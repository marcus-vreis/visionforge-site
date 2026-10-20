# VisionForge — site público

Apresentação e instalação do [VisionForge](https://github.com/marcus-vreis/VisionForge), em português e inglês.

**Site:** https://marcus-vreis.github.io/visionforge-site/

Astro gera HTML estático. Não há backend, autenticação, analytics ou requisições a APIs de release durante a visita. As fontes são servidas pelo próprio site.

## Desenvolvimento

Requisitos: Node.js 22.22+ (CI usa Node 24) e npm.

```sh
npm ci
npm run dev
```

Abra o endereço mostrado no terminal com o prefixo `/visionforge-site/`. No PowerShell use `npm.cmd` e `npx.cmd`.

## Verificação

```sh
npm run check
npm run build
npx playwright install chromium
npm test
```

Os testes cobrem PT/EN, comandos por sistema, teclado, clipboard (sucesso e recusa), persistência de tema, armazenamento bloqueado, conteúdo sem JavaScript, contraste e layout em 360/768/1440 px. O servidor de preview é iniciado pelo Playwright.

Para usar um Chromium já instalado, defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` com o caminho do executável. Na CI, o browser correspondente à versão travada do Playwright é instalado automaticamente.

## Conteúdo e releases

- `src/content/pt.ts` e `en.ts`: textos da apresentação.
- `src/content/release.ts`: versão publicada, links de download e fontes verificadas.
- `src/content/guides.ts`: guias completos de primeiro uso, arquitetura e tarefa própria em PT/EN.
- `src/layouts/Guide.astro`: navegação dos guias, sumário, código copiável e downloads.
- `public/examples/`: exemplos Python completos para os tutoriais; não são executados pelo site.
- `examples/digits-project/`: os nove arquivos do caso com imagens reais de dígitos manuscritos.
- `public/downloads/visionforge-digits-project.zip`: projeto completo para download.
- `docs/EDITORIAL.md`: skill Humanizer usada na revisão e fontes do posicionamento local-first.
- `src/components/Installer.astro`: comandos por sistema, derivados do guia de instalação do produto.
- `public/images/`: capturas reais da interface e imagem de compartilhamento.

Para atualizar uma versão:

1. Confira o release público e a mesma versão no PyPI; verifique os nomes dos arquivos de download.
2. Leia `docs/INSTALL.md` do produto e o resultado do workflow `install-smoke.yml` correspondente. Ajuste comandos e limitações apenas com evidência.
3. Atualize `release.ts`, incluindo a data de verificação e o link do teste. Mantenha PT/EN consistentes.
4. Se a interface mudou, capture novamente a GUI em um workspace vazio, sem nomes/caminhos pessoais ou resultados inventados; atualize `docs/ASSETS.md`.
5. Execute as verificações, revise o diff e faça o merge. O site preserva a versão anterior se o build ou os testes falharem.

Os downloads são pacotes Python (`.whl` e `.tar.gz`), não instaladores autônomos. O `pip install visionforge-studio` é a instalação recomendada. Os metadados de download são um snapshot revisado; o link de releases permite consultar versões mais recentes.

Os guias ficam em `/docs/`, `/docs/model/`, `/docs/task/` e `/docs/project/`, com equivalentes sob `/en/`. O último mostra o caso completo com todos os arquivos e um ZIP. Ao trocar a versão, confira também `docs/custom/` do produto, as assinaturas reais e os controles existentes na GUI. A API de `custom_model` não implica que o painel tenha um seletor dedicado; o guia usa YAML completo exportado e CLI.

Para verificar exemplos contra o ambiente local do VisionForge, sem baixar datasets ou pesos e usando somente CPU:

```powershell
& ../VisionForge/.venv/Scripts/python.exe tests/examples.py
```

Esse comando usa o produto instalado no ambiente indicado; não instala nem altera dependências. Ele verifica descoberta, dimensões/gradientes do modelo, schema e limites do campo próprio, efeito na loss, agregação da métrica e uma época completa com checkpoint e `run.json`. Também prepara um subconjunto de 120 imagens reais de dígitos, confere splits sem índices em comum, testa a recusa de sobrescrita e executa o YAML pela CLI em CPU. Ao alterar exemplos, rode essa verificação e atualize a procedência das capturas. Ela é local; a CI do site executa check, build e testes de navegador.

Ao alterar arquivos em `examples/digits-project/`, gere novamente o ZIP:

```powershell
& ../VisionForge/.venv/Scripts/python.exe scripts/package_example.py
& ../VisionForge/.venv/Scripts/python.exe scripts/package_example.py --check
```

O guia importa os próprios arquivos como texto. A CI usa o script com `--check` para conferir nomes e conteúdo do ZIP. O pacote contém somente os nove arquivos listados; datasets, runs e ambiente virtual ficam fora. Os arquivos `public/examples/research_cnn.py` e `research_method.py` continuam disponíveis separadamente.

## Publicação

O workflow `Site checks and deployment` valida PRs e publica pushes na `main`, além de permitir execução manual. Em Settings → Pages, a origem deve ser **GitHub Actions**. Não são necessários tokens pessoais no repositório; o deployment usa o token temporário do Actions e OIDC com permissões restritas.

O projeto usa `site: https://marcus-vreis.github.io` e `base: /visionforge-site`. Ao mudar o domínio, ajuste a configuração Astro e `public/robots.txt`, e confira canonical, alternates e sitemap após o build.

Para desfazer uma publicação, reverta o commit no Git e deixe o workflow publicar a versão corrigida. Dependabot abre atualizações mensais; não há merge automático.

## Licença

MIT, conforme [LICENSE](LICENSE). Fontes mantêm suas licenças SIL Open Font License distribuídas em `public/licenses/`.

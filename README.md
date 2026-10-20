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
- `src/components/Installer.astro`: comandos por sistema, derivados do guia de instalação do produto.
- `public/images/`: capturas reais da interface e imagem de compartilhamento.

Para atualizar uma versão:

1. Confira o release público e a mesma versão no PyPI; verifique os nomes dos arquivos de download.
2. Leia `docs/INSTALL.md` do produto e o resultado do workflow `install-smoke.yml` correspondente. Ajuste comandos e limitações apenas com evidência.
3. Atualize `release.ts`, incluindo a data de verificação e o link do teste. Mantenha PT/EN consistentes.
4. Se a interface mudou, capture novamente a GUI em um workspace vazio, sem nomes/caminhos pessoais ou resultados inventados; atualize `docs/ASSETS.md`.
5. Execute as verificações, revise o diff e faça o merge. O site preserva a versão anterior se o build ou os testes falharem.

Os downloads são pacotes Python (`.whl` e `.tar.gz`), não instaladores autônomos. O `pip install visionforge-studio` é a instalação recomendada. Os metadados de download são um snapshot revisado; o link de releases permite consultar versões mais recentes.

## Publicação

O workflow `Site checks and deployment` valida PRs e publica pushes na `main`, além de permitir execução manual. Em Settings → Pages, a origem deve ser **GitHub Actions**. Não são necessários tokens pessoais no repositório; o deployment usa o token temporário do Actions e OIDC com permissões restritas.

O projeto usa `site: https://marcus-vreis.github.io` e `base: /visionforge-site`. Ao mudar o domínio, ajuste a configuração Astro e `public/robots.txt`, e confira canonical, alternates e sitemap após o build.

Para desfazer uma publicação, reverta o commit no Git e deixe o workflow publicar a versão corrigida. Dependabot abre atualizações mensais; não há merge automático.

## Licença

MIT, conforme [LICENSE](LICENSE). Fontes mantêm suas licenças SIL Open Font License distribuídas em `public/licenses/`.

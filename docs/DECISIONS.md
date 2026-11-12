# Architecture decisions

## ADR-001 — Independent static presentation website

**Date:** 2026-10-19
**Status:** Accepted

**Decision:** Keep the website in a separate public repository. Use Astro static output with shared components, typed Portuguese/English content, and native browser interactions. Deploy on GitHub Pages through Actions after type checks, build and browser tests pass.

**Reason:** The site presents an existing local application and its published installation paths. It does not need a server, application accounts or a second React application. Static localized pages expose meaningful content without JavaScript and keep hosting free.

**Consequences:** All links and assets must respect the project URL prefix. Theme, platform selection and copying progressively enhance the generated HTML. No product API or package changes are required.

## ADR-002 — Reviewed release metadata and truthful installation paths

**Date:** 2026-10-19
**Status:** Accepted

**Decision:** Store verified release metadata in source. Link directly to existing wheel/source artifacts and PyPI. Use the product installation guide as command authority and identify the CPU-only scope of installation CI. Do not offer standalone executables until the product publishes and validates them.

**Reason:** A filename must refer to a real artifact, and an installation smoke test is not evidence of GPU support on every operating system or model quality. Visitor-time API requests would add unnecessary failures and disclose requests to additional services.

**Consequences:** A release update requires a reviewed content change. The latest-release link remains available when the metadata snapshot is older. No unattended release scraping or installer packaging is introduced.

## ADR-003 — Product identity with accessible presentation

**Date:** 2026-10-19
**Status:** Accepted

**Decision:** Use the product's graphite/coral identity, task colors and font families, with website-specific contrast adjustments. Follow the system theme initially and persist explicit changes locally. Use actual current GUI captures and original vector illustrations labeled as illustrations.

**Reason:** Visitors should recognize the product they will install. A marketing page needs readable text and useful narrative at small sizes rather than a reproduction of the application layout.

**Consequences:** Test light/dark colors and small viewports, host fonts locally, respect reduced motion and retain all essential content without JavaScript. Never present illustrative diagrams as experiment results.

## ADR-004 — Localized tutorials with executable extension examples

**Date:** 2026-10-20
**Status:** Accepted

**Decision:** Publish first-use, custom-model and custom-task tutorials in both languages. Share the document shell, navigation and typed tutorial structure. Teach the existing Python extension points; distribute a complete RGB model and a synthetic custom task alongside focused code excerpts. Use real custom-task screenshots from an isolated workspace.

**Reason:** Research users need to see how their Python method becomes a training page. A model builder and a full task have different contracts. The custom task's Pydantic field must demonstrably affect its loss, rather than merely decorate a mock form. The current classification panel has no dedicated custom-model selector, so the architecture tutorial uses exported YAML and the CLI.

**Consequences:** Keep example code, PT/EN instructions and captures in agreement with the supported product version. Exercise registry discovery, gradients, validation, loss weighting and a complete CPU epoch against VisionForge before changing examples. The small synthetic run proves integration only. It does not establish research quality or GPU compatibility. No product source changes or visitor-time training are introduced.

## ADR-005 — Complete project distributed from one set of source files

**Date:** 2026-10-20
**Status:** Accepted

**Decision:** Add a worked classification case using real handwritten digits bundled with scikit-learn. Keep its nine files under `examples/digits-project/`, display their entire contents in native disclosure elements and distribute them in a ZIP. Check the ZIP against source in CI. Preserve the earlier model and task downloads.

**Reason:** A model builder alone leaves data preparation, configuration and result retrieval to the reader. One complete project makes those steps executable. The guide must show the same files visitors download, including setup instructions and configuration.

**Consequences:** Data is materialized locally, without weight or dataset downloads. Verify one CPU epoch on a small real-data subset through the product CLI. Treat the experiment as a teaching case and document the image-level split's limits. Follow the Humanizer editorial workflow recorded in `EDITORIAL.md` while retaining technical scope and references.

## ADR-006 — Theme icon buttons matching the product

**Date:** 2026-10-20
**Status:** Accepted

**Decision:** Replace the select menu with three native icon buttons for system, light and dark, matching the product's monitor, sun and moon controls. Use a labeled group, individual accessible names and `aria-pressed`; support arrow keys as well as native button activation.

**Reason:** The website should use the same theme control visitors recognize in VisionForge. Icons keep the header compact while labels and pressed state expose the choice to assistive technology.

**Consequences:** Preserve system tracking, stored choice, blocked-storage handling and early theme application. Check all page types at 360, 768 and 1440 pixels in both themes. Hide the controls when JavaScript is unavailable.

## ADR-007 — Methods-paper presentation instead of a product landing page

**Date:** 2026-11-12
**Status:** Accepted. Supersedes the typography and decoration choices of ADR-003; its rules on real captures, themes and accessibility remain.

**Decision:** Present the landing page as a short methods document. Newsreader sets headings, IBM Plex Sans the text and IBM Plex Mono the data, labels and commands. Each theme has one neutral family (paper in light, graphite in dark) and a single vermilion accent. Sections carry a numbered margin label; screenshots are numbered figures with a caption stating what was captured; tasks and the common `run.json` header are real tables. The task tabs, the per-task accent colours, the conceptual SVG diagrams, the background grid, the glow behind the opening and the outlined numerals were removed. The opening states the version, licence, supported Python and DOI from `release.ts`, then the `pip` command.

**Reason:** The earlier page used the conventions of a generic dark product page: a two-line slogan at display size, card grids with pill marks, and decorative diagrams standing in for content. VisionForge's distinguishing trait is research discipline (seeds, confidence intervals, provenance), and a document that shows its own evidence in figures and tables says that directly. One accent keeps colour meaningful: it marks the current version, links under the pointer and what is still unreleased.

**Consequences:** A new figure needs a real capture and a provenance entry in `ASSETS.md`; a table row needs a source in the product (the `run.json` fields come from `run_json_header` and `capture_environment` at the published tag and must be rechecked on each release). The replicates and Code-tab captures exist only in Portuguese and dark theme, so both languages and themes show the same image. `social.png` still uses the previous typography and should be redrawn. Section links now stay visible on small screens as a scrolling row. The fonts remain self-hosted under the SIL OFL.

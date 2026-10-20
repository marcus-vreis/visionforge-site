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

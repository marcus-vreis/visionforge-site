# VisionForge website

Independent static marketing site; do not modify ../VisionForge.
Use English for code/comments, Portuguese Conventional Commits, PT/EN for visitor content.
Stack: Astro static, TypeScript, CSS. No React runtime or backend.
Never invent claims, benchmarks, testimonials or downloads. Installation truth: ../VisionForge/docs/INSTALL.md.
Check tutorial APIs against source and test the shown GUI path; upstream prose may describe controls absent from the current panel.
Apply the Humanizer skill to visitor prose in both languages; read docs/EDITORIAL.md for its pinned source and factual constraints. Local-first is a locality principle, not a market-first claim.
Keep data/content separate from presentation; all internal links respect /visionforge-site/.
Every public function/type has a concise description. Comments explain why.
Use npm.cmd / npx.cmd on Windows. Never run uv run, uv sync or uv pip; if Python is needed use ../VisionForge/.venv/Scripts/python.exe.
Agents are not alone: edit only assigned files, never revert someone else's work.
Before dispatching agy work, check `agy models`; provider model IDs can differ from names saved in older plans.
No package/GPU training, heavy downloads, source-project edits, commits or pushes by delegated agents.
Acceptance: npm run check, npm run build, npm test; responsive and keyboard QA; no secret/personal data in public assets.

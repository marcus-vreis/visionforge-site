# Asset provenance

- `classification-dark.webp`, `classification-light.webp` and their `classification-en-*` equivalents: screenshots of the real VisionForge v0.17.0 GUI on 2026-10-19, source checkout `a032359`, 1440 × 1000. Captured using an isolated empty workspace and a fresh browser context with the demonstration name “Researcher”. No training was started and no personal dataset or result was used. WebP encoding only; no UI reconstruction or fabricated values.
- `social.png`: website-specific typographic composition derived from its branding; not a product screenshot or experiment result.
- `favicon.svg`: original simplified crosshair mark based on the product header's circular mark; the frontend starter favicon was not reused.
- Task illustrations: original inline SVG diagrams, explicitly labeled illustrative.
- Fonts: Bricolage Grotesque, Familjen Grotesk and IBM Plex Mono from pinned Fontsource packages. SIL OFL license notices are included under `public/licenses/`.

The English variants were captured after switching the application's own PT/EN control; the light variants use its own theme control.

- `custom-task-dark.webp`, `custom-task-light.webp` and `custom-task-en-*`: actual v0.17.0 GUI captured on 2026-10-20 from source `a032359`, 1440 × 1100. Isolated workspace contains the downloadable `research_method.py` in `user_tasks/`; generated form shows `research_weight`, `n_samples=32`, `epochs=1`, `batch_size=8` and CPU selected. Demonstration name “Researcher”, experiment `tutorial_cpu`. No personal paths, datasets or experiment results are shown. Training was separately verified in a temporary directory on CPU.
- `public/examples/research_method.py`: adapted from VisionForge v0.17.0's MIT-licensed `tasks/scaffold.py`, adding a Pydantic field, an illustrative parameter penalty and sample-weighted MAE aggregation. The synthetic data and model are educational examples.
- `public/examples/research_cnn.py`: small RGB model built with PyTorch and the existing `register_model` decorator. The guide imports this exact file as text to avoid divergence between displayed and downloadable code.

# I already train models: VisionForge in ten minutes

For people who already write their own loop in PyTorch: VisionForge is a local
interface for five vision tasks (classification, regression, segmentation,
detection and anomaly) that builds the configuration, trains and records each
run on disk. It runs on your machine; nothing leaves it unless you ask. This
page says where the things you already do are and what the project does for
you.

If the terms on this page are new to you, start with
[Starting from zero](comecando-do-zero.md). To see every feature with the
screen of each one, [What VisionForge does](o-que-o-visionforge-faz.md).

## Install and open

```bash
pip install visionforge-studio
visionforge doctor --fix      # Windows and Linux with NVIDIA: swaps torch for the one for your GPU
visionforge gui               # opens http://127.0.0.1:8000
```

The step by step per system, with virtual environment and Mac, is in
[`../INSTALL.md`](../INSTALL.md). To check the installation without a dataset
or a GPU, `visionforge selftest --quick` trains each task with synthetic data.

## Where the things you already do are

Each task tab configures a training in six steps: **Data**, **Strategy**,
**Model**, **Training**, **Image & augmentation** and **Review**. The training
button (**▶ Train** in a single run, **▶ Run replicates** with replicates, and
so on) sits in the bottom bar, next to **history** and **datasets**.

| What you already do | Where it is | Page |
| --- | --- | --- |
| build the dataset and splits | **Data** step; **datasets** button in the bottom bar to download, explore, re-split, merge and convert | [Datasets in the interface](../gui/datasets.md) |
| choose architecture and pretrained weights | **Model** step: architecture, **Pretrained weights**, **Custom checkpoint (.pth)** | [Model and transfer learning](../gui/modelo-e-transfer-learning.md) |
| freeze the backbone or fine-tune | **Model** step, **Transfer learning** (`feature_extraction` or `fine_tuning`) | [Model and transfer learning](../gui/modelo-e-transfer-learning.md) |
| hyperparameters (epochs, learning rate, batch, optimizer, seed) | **Training** step | [First training](../gui/primeiro-treino.md) |
| augmentation, resolution, normalization, filters | **Image & augmentation** step | [Image and augmentation](../gui/imagem-e-aumento.md) |
| K-fold | **Strategy** step, **K-fold (CV)**; groups CSV in the Data step | [Strategies](../gui/estrategias.md) |
| grid, random search, sweep | **Strategy** step: **Grid search** and **Random search** in classification, **Sweep** in the others | [Strategies](../gui/estrategias.md) |
| replicates with several seeds | **Strategy** step, **Replicates** | [Strategies](../gui/estrategias.md) |
| compare variants with a paired test | **Strategy** step, **Replicated comparison** | [Strategies](../gui/estrategias.md) |
| follow the training | training panel: **Log**, **Results** and **Live code** tabs | [Code tab](../gui/codigo.md) |
| metrics and curves | **View results** at the end of training, or a run in **history** | [After training](../gui/depois-do-treino.md) |
| export to ONNX | run detail in history, **Export ONNX** | [After training](../gui/depois-do-treino.md) |
| batch inference | run detail, **Batch inference** (writes a CSV) | [After training](../gui/depois-do-treino.md) |
| Grad-CAM | run detail, **Grad-CAM** | [After training](../gui/depois-do-treino.md) |
| MLflow, W&B, Comet | **Profiles**: turns on the upload per profile | [MLflow](../gui/mlflow.md), [W&B](../gui/wandb.md), [Comet](../gui/comet.md) |
| publish (Hub, Zenodo, GitHub, DVC) | run detail, **Publish** group | [Hub](../gui/hugging-face-hub.md), [Zenodo](../gui/zenodo.md), [GitHub](../gui/github.md), [DVC](../gui/dvc.md) |
| train on Colab | the Colab button, classification only | [Colab](../gui/colab.md) |
| command line | `visionforge run` with the YAML exported in the Review step | [Command line](#command-line), below |

The strategies available change with the task; the
[Strategies](../gui/estrategias.md) page says which exist in each one.

![Strategy step of classification](../images/vf-strategy.png)

## What is different here

What is normally done by hand, or forgotten, VisionForge does in every
training:

- **Run record.** Each training writes `run.json` with the configuration, the
  seed, the per-epoch history, the metrics, the environment (versions of
  Python, torch, torchvision and the other libraries, CUDA, cuDNN, GPU and, in
  a git checkout of the package, the commit and whether there were local
  changes) and a fingerprint of the dataset.
- **Seed and determinism by default.** `training.seed` is 42 and
  `training.deterministic` comes on: it seeds Python, NumPy and PyTorch and
  turns on the deterministic kernels. What still varies between GPUs and
  versions is in [`../REPRODUCIBILITY.md`](../REPRODUCIBILITY.md).
- **Uncertainty in the result.** In classification, regression, segmentation
  and anomaly, the test metrics come with a 95% bootstrap interval over the
  test split. **Replicates** gives mean ± 95% CI across seeds; **Replicated
  comparison** trains each variant on the same seeds and applies a paired test
  (t or Wilcoxon) with Holm correction.
- **Report ready for the paper.** The strategies with several trainings write
  a summary in JSON, a ranking in CSV and a LaTeX table. In classification,
  regression, segmentation and anomaly, the figures come out as PNG, PDF or SVG
  (`output.figure_formats`).
- **Exportable configuration.** **↓ Export YAML**, in the Review step, writes
  the exact configuration the interface sends; `visionforge run` executes it
  again and **↑ Import YAML** returns it to the form.
- **Resume and evidence.** Resuming a training restores model, optimizer,
  scheduler and random states, and is refused if the fingerprint shows that the
  dataset changed. `visionforge bundle` packs the run with the SHA-256 of each
  file.
- **The code that ran.** The **Live code** tab shows the functions of the
  installed package at each step of the training, read on the spot, not a copy.

## The five tasks

| Task | Expected dataset | Main metric |
| --- | --- | --- |
| Classification | one folder per class inside `train/`, `val/` and `test/` | `accuracy` |
| Regression | `train.csv`, `val.csv` and `test.csv` with the columns `image,target` (one or more targets) and the images in `images/` | `r2` |
| Segmentation | `train/`, `val/` and `test/`, each with `images/` and `masks/`; the mask has one channel, pixel value = class id, and pairs by file name | `miou` |
| Detection | YOLO layout (`images/<split>` and `labels/<split>`, or `<split>/images` and `<split>/labels`) or a `data.yaml`; COCO is converted in the dataset lab | `map50_95` |
| Anomaly | MVTec AD style: `train/good/` with normal images only; `test/good/` and one subfolder per defect | `auroc` |

The main metric orders the ranking of the strategies when you do not choose
another. The column and folder names above are the defaults of the
configuration (`image_column`, `target_columns`, `normal_dir`, ...). Detection
has two backends, Ultralytics and torchvision; anomaly has two methods,
autoencoder and PatchCore. Layouts and download providers:
[`../DATASETS.md`](../DATASETS.md).

## Command line

| Command | What for |
| --- | --- |
| `visionforge gui` | opens the interface (`--host`, `--port`, `--no-browser`) |
| `visionforge run config.yaml` | runs an exported YAML; with `strategy:` + `config:`, runs replicates, comparison, sweep or K-fold |
| `visionforge doctor` | checks the environment and points to the right torch; `--fix` installs after confirming |
| `visionforge selftest` | trains each task with generated data; `--quick` only the single run |
| `visionforge audit-data FOLDER` | looks for exact duplicates across splits, unreadable images and, with `--groups`, groups that cross splits |
| `visionforge bundle RUN target.zip` | exports the run with a manifest of hashes |
| `visionforge verify-bundle target.zip` | checks the manifest without extracting the ZIP |
| `visionforge new-task KEY` | creates `user_tasks/KEY.py`, a task of yours that already trains |

`run` and `gui` accept `--offline`, which refuses every connection out of the
computer. `visionforge run --help` lists the options of each strategy, and the
format of each one is in [`../QUICKSTART.md`](../QUICKSTART.md), section 5.

## Where the files are

The paths are relative to the folder you ran `visionforge gui` from.

| Path | What it holds |
| --- | --- |
| `outputs/models/<name>/<date_time>/` | one run: `run.json`, `best_model.pth`, plots; `best_model.onnx` after exporting |
| `outputs/reports/` | reports of the strategies (`*_summary.json`, `*_ranking.csv`, `*_table.tex`) |
| `outputs/profiles/<profile>/` | the output folder of a profile |
| `~/.visionforge/` | tokens and keys ([Tokens](../gui/tokens.md)) |

![Detail of a run in history](../images/vf-run-detail.png)

## Extending

An architecture of yours for classification, regression or segmentation goes in
`user_models/`; a whole task, with your own data, loss and metrics, goes in
`user_tasks/`. Both folders sit next to where you run VisionForge, without
touching the package. `visionforge doctor` shows what it found in each one.
Details in [`../custom/README.md`](../custom/README.md).

## Where to go now

- [First training](../gui/primeiro-treino.md): the complete path in the
  interface, with the sample dataset.
- [Strategies](../gui/estrategias.md): K-fold, searches, replicates and
  comparison.
- [`../REPRODUCIBILITY.md`](../REPRODUCIBILITY.md): data audit, determinism,
  resume and bundle.
- [`../QUICKSTART.md`](../QUICKSTART.md): the same path in English, with the
  YAML of each strategy.
- [Interface guides](../gui/README.md): the index of all pages.

# What VisionForge does

This page shows, screen by screen, what VisionForge does. It does not teach how
to use it: each section says what the feature is, what it is for and where it
is, and leads to the detailed **How to use**. To train right away, start with
[First training](../gui/primeiro-treino.md).

VisionForge runs on your computer, in a local interface (`visionforge gui`).
Nothing leaves it unless you ask: dataset downloads, Colab and publications are
optional, and the publications have a local preview.

A training from start to finish, recorded in the interface: eight epochs on the
sample dataset, on the CPU, from the Review step to the result.

![Recording of an eight-epoch training, from the click on Train to the result](../images/vf-training-film.gif)

New to the field? Start with [Starting from zero](comecando-do-zero.md).
Already train models? Go to [I already train models](ja-treino-modelos.md).

## The tasks

Five computer vision tasks, each in a tab, all configured in the same six
steps: Data, Strategy, Model, Training, Image & augmentation and Review.

| Task | Models | Main metrics |
| --- | --- | --- |
| Classification | ResNet, EfficientNet, ViT, Swin, ConvNeXt, VGG, AlexNet, timm | accuracy, F1, AUC-ROC, confusion matrix |
| Object detection | YOLOv8 to v26, RT-DETR, Faster R-CNN, SSD, RetinaNet | mAP@50, mAP@50-95 |
| Image regression | CNN backbones with a linear head (CSV manifests) | MSE, RMSE, MAE, R² |
| Semantic segmentation | DeepLabV3, FCN, LR-ASPP, U-Net | mIoU, Dice, pixel accuracy |
| Anomaly detection | convolutional autoencoder, PatchCore | image AUROC, F1, threshold |

The YOLO and RT-DETR backends use Ultralytics (AGPL-3.0), which comes installed
with the package; the torchvision backend does not use it.

If your problem is none of the five, see [Extending](#extending).

## Preparing the data

### Sample dataset

In the **Data** step of each task, **use the sample dataset** creates a small
synthetic dataset, which trains on CPU. It is the way to test without having
data.

![Data step with the sample dataset loaded](../images/vf-classification.png)

How to use: [First training](../gui/primeiro-treino.md).

### Downloading from a provider

The **datasets** button, in the bottom bar, has the **Download** tab. It brings
a dataset from torchvision, Roboflow, Kaggle or Hugging Face already in the
layout the task expects. The key of each provider is typed once and stays saved
in the profile. How to use: [`../DATASETS.md`](../DATASETS.md).

### Dataset lab

The **Explore** tab opens a folder that is already on the computer
(classification or detection in YOLO), with a summary, a gallery and the image
sizes. The lab also redoes the split, adds images, merges datasets and converts
to and from COCO. No tool changes the original folder: the ones that transform
create a new folder next to it.

![Dataset lab on the Overview](../images/vf-datasets-explorer.png)

In the Data step of classification, **Audit images** looks for exact
duplicates, empty splits, unreadable images and, with a groups CSV, groups in
more than one split. How to use: [Datasets in the interface](../gui/datasets.md).

## Configuring the training

### Strategies

The **Strategy** step decides whether the button in the bar runs one training
or several: single run, K-fold, grid search, random search (or sweep, depending
on the task), replicates and replicated comparison. Under the selector, the
**When to use** line sums up the situation in which the selected strategy
fits.

![Strategy step of classification](../images/vf-strategy.png)

**Replicates** trains the same configuration with N seeds and gives each metric
as mean ± 95% CI. The **replicated comparison** trains variants on the same
seeds and applies a paired test with Holm correction.

![Replicates turned on in regression](../images/vf-replicates.png)

How to use: [Strategies](../gui/estrategias.md).

### Model and transfer learning

The **Model** step chooses the architecture and where it starts from:
pretrained weights, random initialization or a checkpoint of yours. Transfer
learning trains only the head (`feature_extraction`) or head and backbone with
different learning rates (`fine_tuning`).

![Transfer learning turned on in the Model step](../images/vf-transfer.png)

How to use: [Model and transfer learning](../gui/modelo-e-transfer-learning.md).

### Image and augmentation

The **Image & augmentation** step defines how each image reaches the model:
preprocessing filters (with **Preview**), size, normalization and data
augmentation (with an augmentation preview). Validation and test never receive
augmentation.

![An Unsharp mask filter with the preview](../images/vf-preprocessing.png)

How to use: [Image and augmentation](../gui/imagem-e-aumento.md).

### Review

The **Review** step shows everything that is going to run, suggests the name of
the experiment and unlocks the **Train** button. It is also where exporting and
importing the configuration in YAML are. How the name is built:
[Experiment names](../gui/nomes-de-experimentos.md).

![Review step with the summary of the configuration](../images/vf-review.png)

## Following the training

**Train** opens the training panel. The **Log** tab shows one line per epoch
and **Results** plots the curves while the training runs. **Minimize** gives
the screen back; the training continues.

![Training panel on the Log tab](../images/vf-training.png)

The **Live code** tab shows the training in steps (data, model, loss, training
epoch, validation, test and report) and the real code VisionForge executes in
each one, read from the installed package. The step being executed stays
marked.

![Live code tab after one epoch](../images/vf-code-tab.png)

How to use: [Code tab](../gui/codigo.md).

## Reading and using the result

**View results**, at the end of training, opens the run in **History**, with
the metrics, the training and validation curves per epoch and the recorded
plots (confusion matrix, ROC curve, Precision-Recall curve). Right below, the
**What next?** block suggests at most two next steps from what the run
recorded.

![The run open in History, with metrics and curves](../images/vf-results.png)

In the run detail you:

- reopen the configuration (**Load into the form**) or repeat with 3 seeds;
- download the **Experiment bundle** or the report in **Markdown**;
- use **Export ONNX**, with a numerical comparison against PyTorch and a
  latency measurement;
- run **Batch inference** over a folder of images and receive a CSV;
- generate **Grad-CAM** heat maps over sample images.

![Detail of a run in History](../images/vf-run-detail.png)

To compare or delete runs, **Select** marks several; **Ranking** orders the
runs of each dataset by a metric. How to use:
[After training](../gui/depois-do-treino.md).

## Reproducing

Each run writes to disk a `run.json` with the configuration, the seed, the
per-epoch history, the metrics and the environment (versions of Python, torch
and the other libraries, GPU, git commit).

- With `training.deterministic` on (the default), each training seeds Python,
  NumPy and PyTorch with the seed. The numbers may change between GPUs and
  versions of PyTorch/CUDA.
- In Review, **Export YAML** writes the exact configuration the interface
  sends, and **Import YAML** restores the form.
- The command line runs the same file: `visionforge run experimento.yaml`.
  The strategies (replicates, comparison, sweep, K-fold) also run this way.
- `visionforge bundle` and `visionforge verify-bundle` generate and check a ZIP
  with `run.json` and artifacts, with the SHA-256 of each file.
- `visionforge reproduce` retrains one seed of that ZIP and says whether the
  result falls within the 95% prediction interval of one seed, computed from
  the recorded replicates.

How to use: [`../REPRODUCIBILITY.md`](../REPRODUCIBILITY.md) and
[`../QUICKSTART.md`](../QUICKSTART.md).

## Recording and publishing

Everything is optional and comes turned off. The tokens stay saved per profile
([Tokens](../gui/tokens.md)).

| Service | What it is for | How to use |
| --- | --- | --- |
| MLflow | compare runs in a local SQLite database, with no server or account | [MLflow](../gui/mlflow.md) |
| Weights & Biases | send the trainings to a private project | [W&B](../gui/wandb.md) |
| Comet | send the trainings to Comet | [Comet](../gui/comet.md) |
| Hugging Face Hub | send checkpoint, model card and metrics | [Hugging Face Hub](../gui/hugging-face-hub.md) |
| Zenodo | create a draft with the bundle of the run | [Zenodo](../gui/zenodo.md) |
| GitHub | send the report to a repository | [GitHub](../gui/github.md) |
| DVC | version the run in a git repository on this computer | [DVC](../gui/dvc.md) |

MLflow, W&B and Comet are turned on in **Profiles**. Hugging Face Hub, Zenodo,
GitHub and DVC are buttons of the **Publish** group in the run detail.

## Training on Google Colab

A classification can train on a Colab machine, in your Google account. The
result comes back to History as a local run, marked with the origin `colab`.
The access is in the Colab corner, in the header, and the dataset can come from
an address, from a public provider or from Google Drive.

![Colab corner open](../images/vf-colab.png)

How to use: [Colab](../gui/colab.md).

## Help inside the interface

The **guide** button, in the header, has three entries. **Starting from zero**
is a page for people who have never trained a model: the concepts in eight
chapters, with figures, the recording of a training and where to study the
field. The **Interface tour** and the **First training** are walkthroughs that
run over the screen itself. Next to each field, the **i** explains what it
changes.

![Guide menu open in the header](../images/vf-guide-menu.png)

![The Starting from zero screen](../images/vf-learn.png)

How to use: [Starting from zero](comecando-do-zero.md), the same page in text.

Index of the pages: [Interface guides](../gui/README.md).

## Extending

Two extension points, without changing the package: VisionForge loads your code
from `user_models/` and `user_tasks/`, next to where you run it.

- **Your own model**: uses your architecture in classification, regression or
  segmentation ([Models](../custom/MODELS.md)).
- **Your own task**: defines a whole task family, with your own data, loss and
  metrics. `visionforge new-task minha_tarefa` generates a skeleton that
  already trains ([Tasks](../custom/TASKS.md)).

Overview: [`../custom/README.md`](../custom/README.md).

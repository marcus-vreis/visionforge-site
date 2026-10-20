# Classify handwritten digits with your own model

This project uses the tutorial CNN to classify digits from 0 to 9. It uses real handwriting images bundled with scikit-learn, which VisionForge already depends on. Data preparation and training need no dataset or weight downloads. Package installation requires internet access.

The example runs a custom architecture from data preparation to recorded results. It does not establish a benchmark score or validate a new method.

## Files

- `prepare_data.py`: converts images to RGB and creates training, validation and test splits.
- `user_models/research_cnn.py`: registers the `research_cnn` architecture.
- `configs/digits.yaml`: complete CPU training configuration.
- `inspect_run.py`: reads metrics and artifact paths from `run.json`.
- `requirements.txt`: pins the VisionForge version used by the guide.
- `.gitignore`: excludes the environment, generated data and results from Git.
- `README.md`: instructions in Portuguese.
- `LICENSE`: example code license.

## Windows (PowerShell)

Extract the ZIP and open a terminal in `digits-project`, the folder containing this README. Create an environment for this project even if VisionForge is installed elsewhere.

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe prepare_data.py
.\.venv\Scripts\visionforge.exe doctor
.\.venv\Scripts\visionforge.exe run configs/digits.yaml
.\.venv\Scripts\python.exe inspect_run.py
```

## Linux / macOS Apple Silicon

Install your system prerequisites from the VisionForge installation guide. Open a terminal in the extracted `digits-project` folder.

```sh
python3.12 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python prepare_data.py
./.venv/bin/visionforge doctor
./.venv/bin/visionforge run configs/digits.yaml
./.venv/bin/python inspect_run.py
```

The YAML selects CPU. This example does not need `doctor --fix`.

## What each step does

`prepare_data.py` reads `load_digits()`, converts each 8 × 8 image into a 32 × 32 RGB PNG and creates `datasets/digits/train`, `val` and `test`. Subfolders `0` through `9` identify the classes. A stratified split with seed 42 allocates 60% to training and 20% to each remaining split, rounded to whole samples. `manifest.json` records the source indices for each image.

The script refuses to overwrite an existing destination. To use a different folder, run `prepare_data.py --output datasets/digits-v2` and update `data.base_dir` in YAML. For a smaller initial run, start with a new destination and use `prepare_data.py --limit-per-class 12`.

Training discovers `user_models/research_cnn.py` from the current directory and calls its builder with 10 outputs. The configuration disables augmentation and uses batch size 32, 3 epochs and seed 42. Later inference must use the YAML normalization too. This is the same CNN available as a separate download on the website.

`inspect_run.py` reads the latest run in `outputs/models/` and prints its recorded values. To choose a run, pass its `run.json` path as an argument. Open plots using the paths in `artifacts`.

## Check the interface

After training, start `visionforge gui` through the `.venv` executable from this folder. Open History and find `digits_research_cnn`. Select this custom model through YAML and run it through the CLI: the current classification panel has no dedicated selector for registered models.

```powershell
# Windows
.\.venv\Scripts\visionforge.exe gui
```

```sh
# Linux / macOS
./.venv/bin/visionforge gui
```

## Adapt it to your research

Replace the architecture in the builder while keeping its registration and `[batch, num_outputs]` output shape. For different data, retain the ImageFolder layout and update `num_classes` and transforms. A custom loss or loader needs the task extension described in the other guide.

This split separates images without ensuring different writers across sets. To evaluate generalization across people, split by writer using data with writer identifiers. Compare methods on the same splits and metrics, and repeat training with several seeds before interpreting performance differences.

## Data and reference

`load_digits()` contains 1,797 images of 8 × 8 pixels and 10 classes. Scikit-learn distributes a copy of the test set from Optical Recognition of Handwritten Digits by E. Alpaydin and C. Kaynak (UCI). Images are generated locally and are not included in the ZIP. The MIT license for this code does not replace the data terms.

- https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html
- https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits

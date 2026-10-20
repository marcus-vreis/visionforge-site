"""Create ImageFolder splits from the real handwritten digits bundled with sklearn."""

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split


def prepare(destination: Path, limit_per_class: int | None = None) -> dict:
    """Write disjoint seeded splits and a manifest recording each source sample."""
    if destination.exists():
        raise FileExistsError(f"{destination} already exists; choose a new --output directory.")
    digits = load_digits()
    indices = np.arange(len(digits.target))
    if limit_per_class is not None:
        if limit_per_class < 10:
            raise ValueError("--limit-per-class must be at least 10.")
        indices = np.concatenate([
            indices[digits.target == label][:limit_per_class] for label in range(10)
        ])
    train_val, test = train_test_split(
        indices, test_size=0.2, stratify=digits.target[indices], random_state=42
    )
    train, val = train_test_split(
        train_val, test_size=0.25, stratify=digits.target[train_val], random_state=42
    )
    splits = {"train": train, "val": val, "test": test}
    manifest = {
        "source": "sklearn.datasets.load_digits",
        "reference": "https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html",
        "seed": 42,
        "split_unit": "image, not writer",
        "samples": {},
    }
    for split, selected in splits.items():
        manifest["samples"][split] = [int(index) for index in selected]
        for index in selected:
            label = str(int(digits.target[index]))
            directory = destination / split / label
            directory.mkdir(parents=True, exist_ok=True)
            pixels = np.rint(digits.images[index] * 255 / 16).astype(np.uint8)
            image = Image.fromarray(pixels).convert("RGB")
            image.resize((32, 32), Image.Resampling.NEAREST).save(directory / f"{index:04d}.png")
    (destination / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest


def main() -> None:
    """Prepare the full dataset, or a small subset for checking the training path."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("datasets/digits"))
    parser.add_argument("--limit-per-class", type=int, default=None)
    args = parser.parse_args()
    manifest = prepare(args.output, args.limit_per_class)
    print(json.dumps({split: len(rows) for split, rows in manifest["samples"].items()}))


if __name__ == "__main__":
    main()

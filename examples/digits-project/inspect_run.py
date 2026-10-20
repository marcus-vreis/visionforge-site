"""Print recorded metrics and artifact paths from a completed local experiment."""

import argparse
import json
from pathlib import Path


def inspect(path: Path | None = None) -> dict:
    """Read the supplied run.json, or the most recently modified local run."""
    if path is None:
        candidates = list(Path("outputs/models").glob("**/run.json"))
        if not candidates:
            raise FileNotFoundError("No run.json found. Run configs/digits.yaml first.")
        path = max(candidates, key=lambda item: item.stat().st_mtime_ns)
    record = json.loads(path.read_text(encoding="utf-8"))
    result = {
        "file": str(path),
        "task": record.get("task"),
        "model": record.get("config", {}).get("model", {}),
        "metrics": record.get("metrics", {}),
        "artifacts": record.get("artifacts", {}),
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return result


def main() -> None:
    """Inspect a chosen run without retraining or modifying its results."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path, nargs="?", default=None)
    inspect(parser.parse_args().path)


if __name__ == "__main__":
    main()

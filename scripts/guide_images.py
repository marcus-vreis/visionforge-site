"""Copy the screenshots the entry guides cite from the product repository into public/images/guias.

Usage: python scripts/guide_images.py <path to a VisionForge checkout> <git ref>

Reads every ``../images/<name>`` cited by ``src/content/guias/pt/*.md``, takes the file from ``docs/images`` at the
given ref with ``git show`` (the checkout's working tree is not touched), writes PNGs as WebP (quality 88) and
the animation unchanged plus a still of its first frame, and records the sizes in ``src/content/guias/images.json``.
Nothing is retouched or cropped.
"""

from __future__ import annotations

import io
import json
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
GUIDES = ROOT / "src" / "content" / "guias"
OUT = ROOT / "public" / "images" / "guias"


def main() -> None:
    repo, ref = sys.argv[1], sys.argv[2]
    names = sorted({m for md in (GUIDES / "pt").glob("*.md") for m in re.findall(r"\(\.\./images/([\w.-]+)\)", md.read_text("utf-8"))})
    OUT.mkdir(parents=True, exist_ok=True)
    sizes: dict[str, dict[str, object]] = {}
    for name in names:
        blob = subprocess.run(["git", "-C", repo, "show", f"{ref}:docs/images/{name}"], capture_output=True, check=True).stdout
        image = Image.open(io.BytesIO(blob))
        stem = Path(name).stem
        if name.endswith(".gif"):
            (OUT / name).write_bytes(blob)
            image.seek(0)
            image.convert("RGB").save(OUT / f"{stem}-still.webp", "WEBP", quality=88, method=6)
            sizes[name] = {"file": name, "still": f"{stem}-still.webp", "width": image.width, "height": image.height}
        else:
            image.convert("RGB").save(OUT / f"{stem}.webp", "WEBP", quality=88, method=6)
            sizes[name] = {"file": f"{stem}.webp", "width": image.width, "height": image.height}
        print(name, image.size, (OUT / str(sizes[name]["file"])).stat().st_size // 1024, "KB")
    (GUIDES / "images.json").write_text(json.dumps(sizes, indent=2) + "\n", "utf-8")


if __name__ == "__main__":
    main()

"""Fetch the screenshots the entry guides cite from the product repository into public/images/guias.

Usage: python scripts/guide_images.py

Reads every ``../images/<name>`` cited by ``src/content/guias/pt/*.md`` and downloads the file from ``docs/images``
of the product at ``TAG`` (edit the constant for a new release). PNGs are written as WebP (quality 88), the
animation unchanged plus a still of its first frame, and the sizes go to ``src/content/guias/images.json``.
Nothing is retouched or cropped. The script takes no arguments and sends nothing but the file requests.
"""

from __future__ import annotations

import io
import json
import re
import urllib.request
from pathlib import Path

from PIL import Image

TAG = "v0.22.2"
SOURCE = f"https://raw.githubusercontent.com/marcus-vreis/VisionForge/{TAG}/docs/images/"
ROOT = Path(__file__).resolve().parent.parent
GUIDES = ROOT / "src" / "content" / "guias"
OUT = ROOT / "public" / "images" / "guias"
CITED = re.compile(r"\(\.\./images/([A-Za-z0-9-]+\.(?:png|gif))\)")


def fetch(name: str) -> bytes:
    """Download one image of the product documentation at the pinned tag."""
    with urllib.request.urlopen(SOURCE + name, timeout=60) as response:  # noqa: S310 - fixed https origin
        body: bytes = response.read()
    return body


def main() -> None:
    names = sorted({name for md in (GUIDES / "pt").glob("*.md") for name in CITED.findall(md.read_text("utf-8"))})
    OUT.mkdir(parents=True, exist_ok=True)
    sizes: dict[str, dict[str, object]] = {}
    for name in names:
        blob = fetch(name)
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
    (GUIDES / "images.json").write_text(json.dumps(sizes, indent=2) + "\n", "utf-8", newline="\n")


if __name__ == "__main__":
    main()

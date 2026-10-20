"""Build or verify the downloadable tutorial ZIP using only the standard library."""

import argparse
from io import BytesIO
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT / "examples/digits-project"
ARCHIVE = ROOT / "public/downloads/visionforge-digits-project.zip"
FILES = (
    ".gitignore", "LICENSE", "README.en.md", "README.md", "configs/digits.yaml",
    "inspect_run.py", "prepare_data.py", "requirements.txt", "user_models/research_cnn.py",
)


def package() -> bytes:
    """Create an archive with stable filenames, timestamps and line endings."""
    result = BytesIO()
    with ZipFile(result, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for filename in FILES:
            item = ZipInfo(f"digits-project/{filename}", date_time=(1980, 1, 1, 0, 0, 0))
            item.compress_type = ZIP_DEFLATED
            item.external_attr = 0o100644 << 16
            content = (PROJECT / filename).read_bytes().replace(b"\r\n", b"\n")
            archive.writestr(item, content)
    return result.getvalue()


def main() -> None:
    """Write the ZIP, or verify that each archived file matches the source."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = package()
    if args.check:
        with ZipFile(BytesIO(expected)) as wanted, ZipFile(ARCHIVE) as actual:
            if wanted.namelist() != actual.namelist():
                raise SystemExit("Archive file list differs from the project.")
            for name in wanted.namelist():
                if wanted.read(name) != actual.read(name):
                    raise SystemExit(f"Archive is stale: {name}")
        print(f"Verified {len(FILES)} project files in the ZIP.")
    else:
        ARCHIVE.parent.mkdir(parents=True, exist_ok=True)
        ARCHIVE.write_bytes(expected)
        print(f"Packaged {len(FILES)} project files.")


if __name__ == "__main__":
    main()

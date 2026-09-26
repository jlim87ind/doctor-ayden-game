"""Stage only the browser game for static hosting."""
from pathlib import Path
from shutil import copy2, copytree, rmtree

root = Path(__file__).resolve().parents[1]
out = root / "dist"
if out.exists():
    rmtree(out)
out.mkdir()

for name in (
    "index.html",
    "icon.svg",
    "style.css",
    "app.js",
    "audio.js",
    "core.js",
    "data.js",
    "draw.js",
    "minigames.js",
):
    copy2(root / name, out / name)
copytree(root / "assets", out / "assets")
print(f"Staged {sum(1 for p in out.rglob('*') if p.is_file())} game files in {out}")

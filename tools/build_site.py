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
    "icons.js",
    "pwa.js",
    "sw.js",
    "manifest.webmanifest",
    "precache.json",
    "icon-180.png",
    "icon-192.png",
    "icon-512.png",
):
    src = root / name
    if src.exists():
        copy2(src, out / name)
copytree(root / "assets", out / "assets")
print(f"Staged {sum(1 for p in out.rglob('*') if p.is_file())} game files in {out}")

"""Generate precache.json: the single source of truth for every runtime file
the game needs to work fully offline. Re-run after adding/removing any asset
(new audio files, icons, etc.)."""
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]

ROOT_JS = [
    "app.js",
    "audio.js",
    "core.js",
    "data.js",
    "draw.js",
    "minigames.js",
    "icons.js",
    "pwa.js",
]

FIXED = [
    "index.html",
    "style.css",
    "icon.svg",
    "icon-180.png",
    "icon-192.png",
    "icon-512.png",
    "manifest.webmanifest",
]


def rel_posix(path):
    return path.relative_to(root).as_posix()


entries = []

for name in FIXED:
    p = root / name
    if p.exists():
        entries.append(name)

for name in ROOT_JS:
    p = root / name
    if p.exists():
        entries.append(name)

assets_dir = root / "assets"
for p in sorted(assets_dir.rglob("*")):
    if p.is_file():
        entries.append(rel_posix(p))

entries = sorted(set(entries))

out = root / "precache.json"
out.write_text(json.dumps(entries, indent=2) + "\n")
print(f"Wrote {len(entries)} entries to {out}")

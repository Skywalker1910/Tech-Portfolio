"""Fetch the authoritative game source and build the portfolio browser package."""
from pathlib import Path
import argparse
import ast
import json
import os
import re
import tempfile
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE_CONFIG = json.loads((ROOT / "games" / "alien-invasion.source.json").read_text(encoding="utf-8"))
REPOSITORY = SOURCE_CONFIG["repository"]
parser = argparse.ArgumentParser(description="Build Alien Invasion from its upstream repository.")
parser.add_argument("--source", type=Path, help="Use a local game checkout instead of fetching GitHub.")
parser.add_argument("--ref", default=os.environ.get("ALIEN_GAME_REF", SOURCE_CONFIG["ref"]), help="Upstream branch, tag, or commit (default: games/alien-invasion.source.json).")
args = parser.parse_args()
if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._/-]{0,199}", args.ref) or ".." in args.ref:
    raise SystemExit("Invalid ALIEN_GAME_REF: use a branch, tag, or commit SHA.")

build_root = ROOT / "games" / "build"
build_root.mkdir(parents=True, exist_ok=True)
checkout = tempfile.TemporaryDirectory(prefix="upstream-", dir=build_root)
if args.source:
    GAME = args.source.resolve()
    commit = "local"
else:
    GAME = Path(checkout.name)
    git_env = {**os.environ, "GIT_TERMINAL_PROMPT": "0"}
    subprocess.run(["git", "init", "--quiet", str(GAME)], check=True, env=git_env)
    subprocess.run(["git", "-C", str(GAME), "fetch", "--quiet", "--depth=1", REPOSITORY, args.ref], check=True, env=git_env)
    subprocess.run(["git", "-C", str(GAME), "checkout", "--quiet", "--detach", "FETCH_HEAD"], check=True, env=git_env)
    commit = subprocess.check_output(["git", "-C", str(GAME), "rev-parse", "HEAD"], text=True).strip()
    print(f"Building {REPOSITORY} at {commit}", flush=True)

for required in ("main.py", "invasion/game.py", "invasion/bridge.py", "invasion/storage.py", "assets/flags/countries.json"):
    if not (GAME / required).is_file():
        raise SystemExit(f"Upstream is missing required runtime file: {required}")

def constant(path, name):
    for node in ast.parse(path.read_text(encoding="utf-8-sig")).body:
        if isinstance(node, ast.Assign) and any(isinstance(target, ast.Name) and target.id == name for target in node.targets):
            return ast.literal_eval(node.value)
    raise SystemExit(f"Missing upstream constant: {name}")

version = constant(GAME / "invasion" / "game.py", "GAME_VERSION")
if not isinstance(version, str) or not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", version):
    raise SystemExit("Upstream GAME_VERSION must be a semantic version.")
if constant(GAME / "invasion" / "storage.py", "NAME_MAX") != 20:
    raise SystemExit("Upstream game must support 20-character names before publishing.")

# Keep the host's versioned score boards and country choices aligned with the bundle.
metadata = ROOT / "data" / "arcade"
(metadata / "game.json").write_text(json.dumps({"version": version}, indent=2) + "\n", encoding="utf-8")
countries = json.loads((GAME / "assets" / "flags" / "countries.json").read_text(encoding="utf-8"))
if countries != json.loads((metadata / "countries.json").read_text(encoding="utf-8")):
    (metadata / "countries.json").write_text(json.dumps(countries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

def clear_generated(path):
    # Deletion targets are fixed build/output paths, never the user-supplied source.
    if not path.resolve().is_relative_to(ROOT.resolve()) or path.is_symlink():
        raise SystemExit(f"Unsafe generated output path: {path}")
    if path.exists():
        shutil.rmtree(path)

STAGE = ROOT / "games" / "build" / "alien_invasion"
STAGE.mkdir(parents=True, exist_ok=True)
for name in ("main.py", "invasion", "assets"):
    source = GAME / name
    if source.is_dir():
        if any(item.is_symlink() for item in source.rglob("*")):
            raise SystemExit("Upstream runtime must not contain symbolic links.")
        clear_generated(STAGE / name)
        shutil.copytree(source, STAGE / name, dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
    else:
        shutil.copy2(source, STAGE / name)
clear_generated(STAGE / "build" / "web")
(STAGE / "build" / "web").mkdir(parents=True, exist_ok=True)
subprocess.run([
    sys.executable, "-m", "pygbag", "--build", "--no_opt", "--ume_block", "0",
    "--width", "960", "--height", "640", "--title", "Alien Invasion", str(STAGE),
], cwd=ROOT, check=True)
output = STAGE / "build" / "web"
index = output / "index.html"
if not index.is_file():
    raise SystemExit("Pygbag did not produce index.html. Check the build output.")
html = index.read_text(encoding="utf-8")
styles = """
<style>
html,body { margin:0; width:100%; height:100%; overflow:hidden; background:#0d1117 !important; }
/* The host fits this iframe to the logical 960x640 playfield. Pygbag's
   startup resize can capture the initial 1x1 buffer and keep a square canvas.
   Keep CSS sizing tied to the fitted viewport, independent of that race. */
#canvas { outline:none; display:block; width:100% !important; height:100% !important;
  position:absolute; inset:0; margin:0 !important; border:0; padding:0; }
#infobox { background:#161b22; color:#f0f6fc; font:14px system-ui;
  border-radius:12px; max-width:80vw; text-align:center; }
#crt,#pyconsole { display:none !important; }
</style>
"""
html = html.replace("</head>", f"{styles}</head>")
destination = ROOT / "public" / "games" / "alien-invasion"
clear_generated(destination)
destination.mkdir(parents=True, exist_ok=True)
shutil.copytree(output, destination, dirs_exist_ok=True)
(destination / "index.html").write_text(html, encoding="utf-8")
(destination / "source.json").write_text(json.dumps({"repository": REPOSITORY, "ref": args.ref if not args.source else "local", "commit": commit, "version": version}, indent=2) + "\n", encoding="utf-8")
clear_generated(ROOT / "public" / "arcade" / "flags")
shutil.copytree(GAME / "assets" / "flags", ROOT / "public" / "arcade" / "flags", dirs_exist_ok=True)
checkout.cleanup()
print(f"Player ready at {destination}")

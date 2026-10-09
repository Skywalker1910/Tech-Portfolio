"""Stage only upgraded runtime files, then build the portfolio player."""
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
GAME = ROOT / "games" / "alien-invasion"
STAGE = ROOT / "games" / "build" / "alien_invasion"
STAGE.mkdir(parents=True, exist_ok=True)
for name in ("main.py", "invasion", "assets"):
    source = GAME / name
    if source.is_dir():
        shutil.copytree(source, STAGE / name, dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
    else:
        shutil.copy2(source, STAGE / name)
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
html,body { margin:0; overflow:hidden; background:#0d1117 !important; }
#canvas { outline:none; }
#infobox { background:#161b22; color:#f0f6fc; font:14px system-ui;
  border-radius:12px; max-width:80vw; text-align:center; }
#crt,#pyconsole { display:none !important; }
</style>
"""
html = html.replace("</head>", f"{styles}</head>")
destination = ROOT / "public" / "games" / "alien-invasion"
destination.mkdir(parents=True, exist_ok=True)
shutil.copytree(output, destination, dirs_exist_ok=True)
(destination / "index.html").write_text(html, encoding="utf-8")
shutil.copytree(GAME / "assets" / "flags", ROOT / "public" / "arcade" / "flags", dirs_exist_ok=True)
print(f"Player ready at {destination}")

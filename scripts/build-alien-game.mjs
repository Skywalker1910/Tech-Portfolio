import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const localPython = resolve(root, process.platform === "win32" ? ".venv-game/Scripts/python.exe" : ".venv-game/bin/python");
const python = process.env.GAME_PYTHON || (existsSync(localPython) ? localPython : "python3");
const result = spawnSync(python, [resolve(root, "scripts/build-alien-game.py")], { cwd: root, stdio: "inherit" });
if (result.error) console.error("Create .venv-game and install games/requirements.txt before building:", result.error.message);
process.exit(result.status ?? 1);

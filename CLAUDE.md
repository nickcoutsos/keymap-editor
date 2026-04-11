# keymap-editor — CLAUDE.md

## Project Purpose
Local keymap editor for a Totem split keyboard (38 keys, ZMK firmware).
Edits `zmk-config/config/keymap.json` + `config/totem.keymap`, then git pushes to trigger GitHub Actions builds.

## Architecture
- **Frontend**: React (CRA) in `app/src/`, served on port 3000 in dev
- **Backend API**: Express in `api/`, listens on port 8080
- **zmk-config**: cloned at `D:/Programs/keymap-editor/zmk-config/` (GitHub: Meserlion/zmk-config-totem)

## Running the Dev Server (Windows)
- `npm run dev` — kills stale processes on 8080/3000, then starts API + React dev server
- Open at `http://127.0.0.1:3000` (not `localhost` — IPv6 conflicts on this machine)
- `ENABLE_DEV_SERVER=true` is in `.env` — do not use `cross-env` in scripts, it silently fails in PowerShell on this machine
- API and CRA both bind to `127.0.0.1` explicitly
- To manually kill port 8080: `powershell -command "Get-NetTCPConnection -LocalPort 8080 -State Listen | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }"`

## Important Files
| File | Purpose |
|------|---------|
| `index.js` | Entry point — starts Express on port 8080 |
| `api/index.js` | Express app setup, mounts routes, starts dev server if `ENABLE_DEV_SERVER` |
| `api/config.js` | Loads `.env` via dotenv, exports all config values |
| `api/routes/application.js` | Spawns the CRA dev server process |
| `api/routes/keyboards.js` | API routes: `GET/POST /keyboards/:id/keymap`, `GET /keyboards/:id/layout` |
| `api/services/zmk/local-source.js` | Reads/writes zmk-config files; falls back to totem.json if info.json missing |
| `api/services/zmk/data/zmk-behaviors.json` | **Single source of truth** for ZMK behaviors — do not duplicate |
| `app/src/App.js` | Main React component |
| `app/src/keymap.js` | `parseKeymap`, `parseKeyBinding`, `getBehaviourParams`, re-exports `loadKeymap` |
| `app/src/data/totem.json` | Totem 38-key layout (from keymap-editor-contrib) |
| `app/src/data/totem.keymap.json` | Default keymap (38 `&none` bindings) |

## Behaviors — Single Source of Truth
`api/services/zmk/data/zmk-behaviors.json` is the **only** behaviors file.
The frontend fetches behaviors at runtime via `GET /behaviors` — there is no frontend copy.
`app/src/data/zmk-behaviors.json` was intentionally deleted to prevent drift.

## Key Architectural Notes
- Layout array is at `layoutData.layouts.LAYOUT.layout` — don't pass the full JSON object
- Key bindings must be `{value, params}` objects (not raw strings) before passing to `<Keyboard>`
- `editingKeymap` (not `keymap`) is the in-progress state; it is always set on init via `parseKeymap()`
- Frontend fetches keymap, behaviors, macros, and combos at runtime from the API — no bundled copies

## ZMK Version — IMPORTANT
`west.yml` is pinned to commit `fee2404d5d886c455e3820f9ca624cf9275e9cb5` (Dec 30, 2025).
**Do NOT change `revision` back to `main`** — ZMK main (post-Dec 2025) has a regression that breaks BT advertising on the Totem/XIAO BLE. The keyboard boots and works over USB but never appears in the BT device list.
Working firmware is also stored in `D:/Programs/keymap-editor/working/` as a backup.

## Totem Layout Source
`https://raw.githubusercontent.com/nickcoutsos/keymap-editor-contrib/main/keyboard-data/totem.json`

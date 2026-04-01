# Running Locally

## Setup

1. Clone this repo into `D:/Programs/keymap-editor/`
2. Clone your zmk-config repo into `D:/Programs/keymap-editor/zmk-config/`
3. Copy `.env.template` to `.env` — the defaults work as-is
4. Run `npm install`

## Starting the dev server

```
npm run dev
```

This kills any stale processes on ports 8080 and 3000, then starts:
- Express API on `127.0.0.1:8080`
- React dev server on `127.0.0.1:3000`

Open **http://127.0.0.1:3000** in your browser.

> Use `127.0.0.1`, not `localhost` — IPv6 conflicts on Windows cause connection refused with `localhost`.

## Using the editor

Your keyboard layout loads automatically. Click a key to change its binding.

- **Save** — writes the keymap back to `zmk-config/config/`
- **Push** — commits the changes and pushes to GitHub, triggering a firmware build via GitHub Actions

## Manual port cleanup

If the server fails to start because a port is in use:

```powershell
powershell -command "Get-NetTCPConnection -LocalPort 8080,3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
```

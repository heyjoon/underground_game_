# GitHub Setup

This folder is ready to become a GitHub repository, but this PC currently does not expose `git` in PATH.

## Recommended Repository Name

```text
downlink
```

## Files To Commit

Commit source and docs:

- `index.html`
- `styles.css`
- `app.js`
- `server.cjs`
- `run_web.bat`
- `data/*.json`
- `docs/*.md`
- `AGENTS.md`
- `README.md`
- `tools/*.js`

Do not commit runtime files:

- `saves/`
- `__pycache__/`
- `.env`

These are already covered by `.gitignore`.

## If Git Is Installed Later

```powershell
cd "C:\Users\yongj\Documents\New project"
git init
git add .
git commit -m "Initial DOWNLINK web roguelike MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/downlink.git
git push -u origin main
```

## On Another PC

```powershell
git clone https://github.com/YOUR_USERNAME/downlink.git
cd downlink
run_web.bat
```

If `run_web.bat` cannot find the bundled Codex Node path on another PC, install Node.js or edit `run_web.bat` to call:

```powershell
node server.cjs
```

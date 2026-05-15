# Codex Project Rules

This project is a Korean text roguelike survival game titled **잔광 / DOWNLINK**.

## Current Direction

- The game is web-first.
- Keep `index.html`, `styles.css`, `app.js`, `server.js`, and `data/*.json` runnable without external libraries.
- The Python console MVP may remain as a reference, but new gameplay work should target the web version first.
- Do not add package dependencies unless the user explicitly asks.

## Design Rules

- The game should feel dry, cold, and quiet.
- Avoid over-explaining outcomes.
- Do not show hidden counters, conditions, flags, or exact stat deltas in normal UI.
- If a choice is unavailable, hide it instead of showing `[조건 미충족]`.
- Stats are shown as 3 pips:
  - `hp`
  - `food`
  - `battery`
  - `human`
  - `sanity`
- Hidden systems drive the game:
  - `dayCount`
  - `hungerPressure`
  - `oxygenPressure`
  - `mentalPressure`
  - `raiderThreat`
  - `diseaseThreat`
  - `systemFailure`
  - `hopeLevel`
  - `truthFlag`

## Gameplay Rules

- Main story is the skeleton, not the full path.
- Random events and random counters should dominate day-to-day play.
- CRITICAL events must be checked before ordinary random events.
- Recent events should not repeat immediately.
- Reaching 0 in a visible stat should usually create a crisis state first.
- A second hit while already in crisis can trigger a bad ending.

## Data Rules

- Event content belongs in JSON files under `data/`.
- Avoid hardcoding event text in `app.js`.
- Character definitions belong in `data/characters.json`.
- Random survival events belong in `data/random_events.json`.
- Ending conditions belong in `data/endings.json`.

## Code Style

- Keep the project dependency-free.
- Prefer clear, small functions.
- Preserve Korean text as UTF-8.
- After changing JS, run:

```powershell
C:\Users\yongj\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check app.js
```

- After changing JSON, parse it with Node or use the existing smoke scripts.

## Run

Web:

```powershell
run_web.bat
```

Manual:

```powershell
C:\Users\yongj\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe server.js
```

Open:

```text
http://127.0.0.1:4180/
```

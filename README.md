# 잔광 / DOWNLINK

Korean text roguelike survival game set in the underground shelter **Ark-7**.

The current version is web-first and dependency-free. It runs with a tiny local Node server and JSON data files.

## Run

Double-click:

```text
run_web.bat
```

Or run manually:

```powershell
cd "C:\Users\yongj\Documents\New project"
C:\Users\yongj\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe server.js
```

Open:

```text
http://127.0.0.1:4180/
```

## Current Game Structure

- Choose one of three characters.
- Visible stats use a 3-pip structure:
  - 체력
  - 식량
  - 배터리
  - 인간성
  - 정신
- Daily play is driven by random events.
- Hidden counters drive tension and CRITICAL events.
- Main story appears conditionally, not every day.
- Unavailable choices are hidden.
- Exact stat/counter deltas are hidden from normal UI.

## Main Files

```text
index.html
styles.css
app.js
server.js
run_web.bat
data/
  characters.json
  random_events.json
  endings.json
docs/
  story.md
  events.md
  git-setup.md
AGENTS.md
```

## Random Event System

The game loop:

```text
Start day
-> dayCount +1
-> CRITICAL check
-> random category selection
-> random event selection
-> player choice
-> stat/counter/flag changes
-> result screen
-> next day
```

Current random event count: 53.

## Development Notes

Read these before continuing work:

- [AGENTS.md](AGENTS.md)
- [docs/story.md](docs/story.md)
- [docs/events.md](docs/events.md)
- [docs/git-setup.md](docs/git-setup.md)

## Smoke Checks

JavaScript syntax:

```powershell
C:\Users\yongj\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check app.js
```

Random event data count:

```powershell
C:\Users\yongj\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('data/random_events.json','utf8')); console.log(data.length)"
```

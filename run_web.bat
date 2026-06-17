@echo off
chcp 65001 > nul
cd /d "%~dp0"
start "" http://127.0.0.1:4180
"C:\Users\yongj\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.cjs
pause

@echo off
chcp 65001 > nul
cd /d "%~dp0"
"C:\Users\yongj\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" main.py
pause

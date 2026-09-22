@echo off
chcp 65001 >nul
echo Качаю инструменты в папку portable...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0download-tools.ps1" %*
echo.
pause

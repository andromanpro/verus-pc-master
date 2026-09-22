@echo off
title Verus - dashboard
cd /d "%~dp0"

REM --- Admin probe via fltmc (built-in Filter Manager). errorlevel 0 = admin. ---
REM Redirect to >nul (Windows), NOT >/dev/null - cmd would make a literal file.
fltmc >nul 2>&1
if %errorlevel% equ 0 goto :run
if "%~1"=="--noadmin" goto :run

REM --- Not admin: elevate and launch server.ps1 DIRECTLY (not this .bat). ---
REM Launching the server (not re-running the .bat) avoids extra cmd windows.
REM server.ps1 uses $PSScriptRoot, so the elevated cwd (System32) does not matter -
REM no "file not found". Absolute path %~dp0server.ps1 is passed explicitly.
echo.
echo  Requesting administrator rights (UAC) for full mode...
echo  YES = full mode (restore point, heal, cleanup). NO = view-only mode.
echo.
powershell -NoProfile -Command "try { Start-Process powershell.exe -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','%~dp0server.ps1' -Verb RunAs -ErrorAction Stop; exit 0 } catch { exit 1 }"
if %errorlevel% equ 0 exit
echo  UAC declined or unavailable - starting in view-only mode (some actions disabled).
echo.

:run
REM Already admin (or view-only fallback): run server in THIS window.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause

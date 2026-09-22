@echo off
title PC Diagnostics
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0diagnostics.ps1"

@echo off
chcp 65001 >nul
title Museum Guide System - Stopping Servers

echo ========================================
echo   Museum Guide System - Stop Servers
echo ========================================
echo.

REM Find and kill Node.js processes (processes using ports 3000 and 5173)
echo [Info] Finding and stopping related processes...

REM Stop processes using port 3000 (backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo [Info] Stopping backend process (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Stop processes using port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo [Info] Stopping frontend process (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [Done] Servers stopped successfully
echo.
pause


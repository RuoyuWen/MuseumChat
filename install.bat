@echo off
chcp 65001 >nul
title Museum Guide System - Installing Dependencies

echo ========================================
echo   Museum Guide System - Install Dependencies
echo ========================================
echo.
echo [Info] Installing all dependencies, please wait...
echo [Tip] This may take a few minutes depending on your network speed
echo.

call npm run install:all

if errorlevel 1 (
    echo.
    echo [Error] Failed to install dependencies!
    echo [Tip] Please check:
    echo   1. Node.js is installed (version 18+)
    echo   2. Network connection is working
    echo   3. npm is working properly
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo [Success] All dependencies installed successfully!
    echo.
    echo [Next] Run "start.bat" to start the system
    echo.
    pause
)


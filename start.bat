@echo off
chcp 65001 >nul
title Museum Guide System - Starting...

echo ========================================
echo   Museum Guide System - Startup
echo ========================================
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo [Info] Dependencies not found, installing automatically...
    echo.
    call npm run install:all
    if errorlevel 1 (
        echo.
        echo [Error] Failed to install dependencies. Please check network connection and Node.js environment
        pause
        exit /b 1
    )
    echo.
    echo [Success] Dependencies installed successfully!
    echo.
)

REM Check server and client node_modules
if not exist "server\node_modules" (
    echo [Info] Backend dependencies not found, installing...
    cd server
    call npm install
    cd ..
    echo.
)

if not exist "client\node_modules" (
    echo [Info] Frontend dependencies not found, installing...
    cd client
    call npm install
    cd ..
    echo.
)

echo [Info] Starting development servers...
echo [Info] Frontend: http://localhost:5173
echo [Info] Backend: http://localhost:3000
echo.
echo [Tip] Browser will open automatically (in about 5 seconds)
echo [Tip] Press Ctrl+C to stop the servers
echo.
echo ========================================
echo.

REM Open browser after 5 seconds delay
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:5173"

REM Start development servers
call npm run dev

REM If startup failed, pause to show error message
if errorlevel 1 (
    echo.
    echo [Error] Failed to start. Please check the error messages above
    pause
)


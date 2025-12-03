@echo off
chcp 65001 >nul
title 博物馆导览系统 - 停止服务器

echo ========================================
echo   博物馆导览系统 - 停止服务器
echo ========================================
echo.

REM 查找并终止Node.js进程（占用3000和5173端口的进程）
echo [信息] 正在查找并停止相关进程...

REM 停止占用3000端口的进程（后端）
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo [信息] 停止后端进程 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM 停止占用5173端口的进程（前端）
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo [信息] 停止前端进程 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [完成] 服务器已停止
echo.
pause


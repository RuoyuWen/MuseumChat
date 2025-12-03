@echo off
chcp 65001 >nul
title 博物馆导览系统 - 启动中...

echo ========================================
echo   博物馆导览系统 - 启动程序
echo ========================================
echo.

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo [提示] 检测到未安装依赖，正在自动安装...
    echo.
    call npm run install:all
    if errorlevel 1 (
        echo.
        echo [错误] 依赖安装失败，请检查网络连接和Node.js环境
        pause
        exit /b 1
    )
    echo.
    echo [成功] 依赖安装完成！
    echo.
)

REM 检查server和client的node_modules
if not exist "server\node_modules" (
    echo [提示] 检测到后端依赖未安装，正在安装...
    cd server
    call npm install
    cd ..
    echo.
)

if not exist "client\node_modules" (
    echo [提示] 检测到前端依赖未安装，正在安装...
    cd client
    call npm install
    cd ..
    echo.
)

echo [信息] 正在启动开发服务器...
echo [信息] 前端地址: http://localhost:5173
echo [信息] 后端地址: http://localhost:3000
echo.
echo [提示] 启动后会自动打开浏览器（约5秒后）
echo [提示] 按 Ctrl+C 可以停止服务器
echo.
echo ========================================
echo.

REM 在后台延迟5秒后自动打开浏览器
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:5173"

REM 启动开发服务器
call npm run dev

REM 如果启动失败，暂停以便查看错误信息
if errorlevel 1 (
    echo.
    echo [错误] 启动失败，请检查错误信息
    pause
)


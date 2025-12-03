@echo off
chcp 65001 >nul
title 博物馆导览系统 - 安装依赖

echo ========================================
echo   博物馆导览系统 - 安装依赖
echo ========================================
echo.
echo [信息] 正在安装所有依赖包，请稍候...
echo [提示] 这可能需要几分钟时间，取决于网络速度
echo.

call npm run install:all

if errorlevel 1 (
    echo.
    echo [错误] 依赖安装失败！
    echo [提示] 请检查：
    echo   1. 是否已安装 Node.js (版本 18+)
    echo   2. 网络连接是否正常
    echo   3. npm 是否正常工作
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo [成功] 所有依赖安装完成！
    echo.
    echo [下一步] 运行"启动.bat"来启动系统
    echo.
    pause
)


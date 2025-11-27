@echo off
REM GitHub 上传脚本 (Windows)
REM 使用方法: 双击运行或在命令行执行 upload-to-github.bat

echo 🚀 开始上传项目到 GitHub...

REM 检查是否已初始化 git
if not exist ".git" (
    echo 📦 初始化 Git 仓库...
    git init
)

REM 添加所有文件
echo 📝 添加文件...
git add .

REM 提交代码
echo 💾 提交代码...
git commit -m "Initial commit: Museum Guide System with multi-AI chat - Features: Multi-AI model support, Three-role group chat, Smart conversation management, Parallel response generation, Suggested questions, Customizable prompts"

echo.
echo ✅ 本地提交完成！
echo.
echo 📋 下一步操作：
echo 1. 在 GitHub 上创建新仓库：https://github.com/new
echo 2. 复制仓库 URL（例如：https://github.com/yourusername/museum-guide-system.git）
echo 3. 运行以下命令连接并推送：
echo.
echo    git remote add origin YOUR_REPO_URL
echo    git branch -M main
echo    git push -u origin main
echo.
pause


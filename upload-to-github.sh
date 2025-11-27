#!/bin/bash

# GitHub 上传脚本
# 使用方法: bash upload-to-github.sh

echo "🚀 开始上传项目到 GitHub..."

# 检查是否已初始化 git
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git 仓库..."
    git init
fi

# 添加所有文件
echo "📝 添加文件..."
git add .

# 提交代码
echo "💾 提交代码..."
git commit -m "Initial commit: Museum Guide System with multi-AI chat

Features:
- Multi-AI model support (GPT-4.1, GPT-5, etc.)
- Three-role group chat (Artifact, Author, Guide)
- Smart conversation management
- Parallel response generation for performance
- Suggested questions based on context
- Customizable prompts"

echo ""
echo "✅ 本地提交完成！"
echo ""
echo "📋 下一步操作："
echo "1. 在 GitHub 上创建新仓库：https://github.com/new"
echo "2. 复制仓库 URL（例如：https://github.com/yourusername/museum-guide-system.git）"
echo "3. 运行以下命令连接并推送："
echo ""
echo "   git remote add origin YOUR_REPO_URL"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""


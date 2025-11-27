# GitHub 上传指南

## 准备工作

### 1. 确保你有 GitHub 账号
如果没有，请访问 https://github.com 注册

### 2. 安装 Git（如果还没有）
- Windows: 下载 Git for Windows https://git-scm.com/download/win
- Mac: `brew install git` 或从官网下载
- Linux: `sudo apt-get install git`

## 上传步骤

### 方法一：使用命令行（推荐）

#### 步骤 1: 初始化 Git 仓库
```bash
# 在项目根目录（Museum文件夹）执行
git init
```

#### 步骤 2: 添加所有文件
```bash
git add .
```

#### 步骤 3: 提交代码
```bash
git commit -m "Initial commit: Museum Guide System with multi-AI chat"
```

#### 步骤 4: 在 GitHub 上创建新仓库
1. 登录 GitHub
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `museum-guide-system` (或你喜欢的名字)
   - Description: `Multi-AI Museum Guide System with Role-based Chat`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"（因为我们已经有了）
4. 点击 "Create repository"

#### 步骤 5: 连接本地仓库到 GitHub
```bash
# 替换 YOUR_USERNAME 和 YOUR_REPO_NAME 为你的实际信息
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 例如：
# git remote add origin https://github.com/yourusername/museum-guide-system.git
```

#### 步骤 6: 推送代码
```bash
git branch -M main
git push -u origin main
```

### 方法二：使用 GitHub Desktop（图形界面）

1. 下载 GitHub Desktop: https://desktop.github.com/
2. 安装并登录你的 GitHub 账号
3. 点击 "File" → "Add Local Repository"
4. 选择项目文件夹（Museum）
5. 点击 "Publish repository"
6. 填写仓库名称和描述
7. 点击 "Publish Repository"

## 后续更新代码

当你修改代码后，使用以下命令更新 GitHub：

```bash
# 查看修改的文件
git status

# 添加修改的文件
git add .

# 提交修改
git commit -m "描述你的修改内容"

# 推送到 GitHub
git push
```

## 重要提示

### ⚠️ 不要上传敏感信息
- **不要**上传 `.env` 文件（已加入 .gitignore）
- **不要**在代码中硬编码 API Key
- 如果误上传了敏感信息，需要：
  1. 立即在 GitHub 上删除仓库
  2. 重新创建仓库
  3. 修改所有泄露的密钥

### 📝 推荐的 README 内容
项目已经包含了 README.md，你可以根据需要补充：
- 项目截图
- 演示视频链接
- 部署说明
- 贡献指南

### 🔒 保护 API Key
- 使用环境变量存储 API Key
- 在 README 中说明如何配置环境变量
- 不要在任何公开文件中包含真实的 API Key

## 常见问题

### Q: 如何忽略已提交的文件？
```bash
# 如果 node_modules 已经被提交了
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
```

### Q: 如何创建 .env.example 文件？
创建一个示例环境变量文件，供其他开发者参考：
```bash
# server/.env.example
PORT=3000
```

### Q: 如何添加 LICENSE？
1. 在 GitHub 仓库页面点击 "Add file" → "Create new file"
2. 文件名输入 `LICENSE`
3. GitHub 会自动提示选择许可证类型
4. 选择 MIT License（或其他适合的许可证）

## 下一步

上传成功后，你可以：
1. 添加项目描述和标签
2. 创建 Issues 跟踪问题和功能请求
3. 设置 GitHub Pages 部署前端（可选）
4. 添加 GitHub Actions 自动化部署（可选）


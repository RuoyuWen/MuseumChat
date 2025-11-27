# 🚀 下一步：上传到 GitHub

你的代码已经准备好上传了！按照以下步骤操作：

## 步骤 1: 在 GitHub 上创建新仓库

1. 访问：https://github.com/new
2. 登录你的账号（邮箱：rwe77@uclive.ac.nz）
3. 填写仓库信息：
   - **Repository name**: `museum-guide-system` （或你喜欢的名字）
   - **Description**: `Multi-AI Museum Guide System with Role-based Chat`
   - 选择 **Public** 或 **Private**
   - ⚠️ **不要**勾选 "Initialize this repository with a README"
   - ⚠️ **不要**添加 .gitignore 或 LICENSE（我们已经有了）
4. 点击 **"Create repository"** 按钮

## 步骤 2: 复制仓库 URL

创建仓库后，GitHub 会显示一个页面，复制 HTTPS URL，例如：
```
https://github.com/rwe77/museum-guide-system.git
```

## 步骤 3: 连接并推送代码

在项目文件夹中打开命令行，执行以下命令（替换 YOUR_REPO_URL 为你的实际URL）：

```bash
# 连接远程仓库
git remote add origin YOUR_REPO_URL

# 重命名分支为 main（GitHub 默认分支名）
git branch -M main

# 推送代码到 GitHub
git push -u origin main
```

**示例**（如果你的仓库名是 museum-guide-system）：
```bash
git remote add origin https://github.com/rwe77/museum-guide-system.git
git branch -M main
git push -u origin main
```

## 如果遇到问题

### 问题：需要身份验证
如果提示输入用户名和密码：
- **用户名**: 你的 GitHub 用户名
- **密码**: 使用 Personal Access Token（不是GitHub密码）

**如何生成 Token**:
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 选择权限：至少勾选 `repo`
4. 生成后复制 Token（只显示一次！）
5. 推送时密码处粘贴 Token

### 问题：已经存在远程仓库
如果之前已经添加过远程仓库：
```bash
# 查看当前远程仓库
git remote -v

# 如果存在，先删除
git remote remove origin

# 然后重新添加
git remote add origin YOUR_REPO_URL
```

## 完成！

上传成功后，你可以：
- ✅ 在 GitHub 上查看你的代码
- ✅ 添加项目描述和标签
- ✅ 分享仓库链接给其他人
- ✅ 继续开发并推送更新

## 后续更新代码

当你修改代码后，使用以下命令更新：
```bash
git add .
git commit -m "描述你的修改"
git push
```


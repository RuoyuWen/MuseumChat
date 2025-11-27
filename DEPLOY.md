# 部署指南

## 本地开发

```bash
# 安装所有依赖
npm run install:all

# 启动开发服务器（同时启动前端和后端）
npm run dev
```

前端: http://localhost:5173
后端: http://localhost:3000

## 生产构建

```bash
# 构建所有项目
npm run build

# 启动生产服务器
cd server
npm start
```

## 部署选项

### 1. Vercel（推荐前端）
- 连接 GitHub 仓库
- 选择 `client` 目录
- 自动部署

### 2. Railway / Render（推荐后端）
- 连接 GitHub 仓库
- 选择 `server` 目录
- 设置环境变量 `PORT`
- 自动部署

### 3. 传统服务器
- 使用 PM2 管理 Node.js 进程
- 使用 Nginx 作为反向代理
- 配置 SSL 证书


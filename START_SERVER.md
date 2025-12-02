# 启动服务器指南

## 问题：ECONNREFUSED 错误

如果你看到 `ECONNREFUSED` 错误，说明后端服务器没有运行。

## 解决方法

### 方法一：使用根目录命令（推荐）

在项目根目录（Museum文件夹）执行：

```bash
npm run dev
```

这会同时启动：
- 后端服务器：http://localhost:3000
- 前端服务器：http://localhost:5173

### 方法二：分别启动（如果方法一不行）

**终端1 - 启动后端：**
```bash
cd server
npm run dev
```

等待看到：
```
Server running on http://localhost:3000
```

**终端2 - 启动前端：**
```bash
cd client
npm run dev
```

等待看到：
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 方法三：检查后端是否在运行

**Windows:**
```powershell
netstat -ano | findstr :3000
```

**Mac/Linux:**
```bash
lsof -i :3000
```

如果端口被占用，需要先关闭占用端口的程序。

## 验证服务器运行

打开浏览器访问：
- 后端健康检查：http://localhost:3000/api/health
- 前端应用：http://localhost:5173

如果后端健康检查返回 `{"status":"ok",...}`，说明后端正常运行。

## 常见问题

### 1. 端口3000被占用

修改 `server/src/index.ts`：
```typescript
const PORT = process.env.PORT || 3001; // 改为3001或其他端口
```

然后修改 `client/vite.config.ts`：
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3001', // 改为对应的端口
    changeOrigin: true,
  },
}
```

### 2. 依赖未安装

```bash
npm run install:all
```

### 3. TypeScript编译错误

```bash
cd server
npm install
npm run build
```


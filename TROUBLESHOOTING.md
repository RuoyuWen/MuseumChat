# 故障排除指南

## 常见问题

### 1. 后端服务器连接失败 (ECONNREFUSED)

**错误信息：**
```
http proxy error: /api/config/models
AggregateError [ECONNREFUSED]
```

**原因：** 后端服务器没有运行

**解决方法：**

#### 方法一：使用根目录的启动命令（推荐）
```bash
# 在项目根目录执行
npm run dev
```
这会同时启动前端和后端。

#### 方法二：分别启动
```bash
# 终端1：启动后端
cd server
npm run dev

# 终端2：启动前端
cd client
npm run dev
```

#### 方法三：检查后端是否在运行
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

如果端口3000被占用，可以：
1. 关闭占用端口的程序
2. 或者修改 `server/src/index.ts` 中的端口号

### 2. 模型选择下拉框无法选择

**可能原因：**
- 后端API未加载成功
- 模型列表为空

**解决方法：**
1. 确保后端服务器正在运行
2. 检查浏览器控制台是否有错误
3. 刷新页面重新加载

### 3. API Key错误

**错误信息：**
```
AI请求失败: Invalid API Key
```

**解决方法：**
1. 检查API Key是否正确
2. 确认API Key有足够的余额
3. 检查API Key是否有权限访问所选模型

### 4. 端口冲突

**错误信息：**
```
Port 3000 is already in use
```

**解决方法：**

#### Windows
```bash
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（替换PID为实际进程ID）
taskkill /PID <PID> /F
```

#### Mac/Linux
```bash
# 查找占用端口的进程
lsof -i :3000

# 结束进程
kill -9 <PID>
```

或者修改端口：
1. 修改 `server/src/index.ts` 中的端口
2. 修改 `client/vite.config.ts` 中的代理目标

### 5. 依赖安装问题

**错误信息：**
```
Cannot find module 'xxx'
```

**解决方法：**
```bash
# 重新安装所有依赖
npm run install:all

# 或者分别安装
cd server && npm install
cd ../client && npm install
```

### 6. TypeScript编译错误

**解决方法：**
```bash
# 清理并重新构建
cd server
rm -rf dist node_modules
npm install
npm run build
```

## 检查清单

启动前请确认：
- [ ] Node.js已安装（版本18+）
- [ ] 已运行 `npm run install:all` 安装所有依赖
- [ ] 后端服务器正在运行（端口3000）
- [ ] 前端服务器正在运行（端口5173）
- [ ] 浏览器可以访问 http://localhost:5173

## 获取帮助

如果问题仍未解决：
1. 检查浏览器控制台的错误信息
2. 检查后端服务器的日志输出
3. 确认所有依赖都已正确安装


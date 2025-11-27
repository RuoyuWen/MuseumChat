# 博物馆导览系统 - Multi-AI Museum Guide System

一个基于多AI模型的博物馆导览系统，支持用户与三个不同角色的AI进行群聊：文物本身、文物作者、导览员。

## 功能特性

- 🤖 多AI模型支持（默认GPT-4.1，支持GPT-5、GPT-4.1 Mini/Nano等新模型）
- 🔑 API Key管理（首页输入）
- 👥 三角色群聊（文物、作者、导览员）
- 🎯 智能对话管理（自动选择合适的角色回复）
- 📝 历史背景输入
- ⚙️ Prompt自定义和调试

## 技术栈

- **前端**: React + TypeScript + Vite + TailwindCSS
- **后端**: Node.js + Express + TypeScript
- **AI**: OpenAI API（支持其他模型扩展）

## 快速开始

### 安装依赖

```bash
npm run install:all
```

### 开发模式

1. 启动开发服务器（同时启动前端和后端）：
```bash
npm run dev
```

或者分别启动：

```bash
# 终端1：启动后端
npm run dev:server

# 终端2：启动前端
npm run dev:client
```

- 前端运行在 http://localhost:5173
- 后端运行在 http://localhost:3000

### 使用步骤

1. 打开浏览器访问 http://localhost:5173
2. 在首页输入你的 OpenAI API Key
3. 选择AI模型（默认GPT-4.1，支持GPT-5等新模型）
4. 输入文物的历史背景信息
5. （可选）自定义各角色的Prompt
6. 点击"开始导览"进入聊天界面
7. 开始与三个AI角色（文物、作者、导览员）进行对话

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
├── client/          # 前端React应用
├── server/          # 后端Express API
└── package.json     # 根配置文件
```

## 使用说明

1. 在首页输入你的API Key
2. 选择AI模型（默认GPT-4.1，支持GPT-5等新模型）
3. 输入文物的历史背景信息
4. 开始与三个AI角色进行群聊
5. 可以在设置中自定义各角色的Prompt

## 环境配置

### 后端环境变量（可选）
创建 `server/.env` 文件：
```
PORT=3000
```

### API Key 配置
- 在应用首页输入你的 OpenAI API Key
- API Key 不会保存到服务器，每次会话使用

## 性能优化

- ✅ 并行预生成多个角色回复（点击"继续"几乎零延迟）
- ✅ 异步生成推荐问题（不阻塞主流程）
- ✅ 智能角色选择（根据问题自动选择合适的角色）

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT License


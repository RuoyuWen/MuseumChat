# 扩展AI模型支持

## 添加新模型

### 1. 在后端添加模型配置

编辑 `server/src/routes/config.ts`，在 `getModels` 路由中添加新模型：

```typescript
{
  id: 'your-model-id',
  name: 'Your Model Name',
  provider: 'openai', // 或 'anthropic', 'custom'
}
```

### 2. 修改AI服务以支持其他提供商

如果需要支持非OpenAI的模型，需要修改 `server/src/services/aiService.ts`：

```typescript
async chat(
  messages: Message[],
  model: string = 'gpt-4-turbo-preview',
  systemPrompt?: string,
  provider?: string
): Promise<string> {
  if (provider === 'anthropic') {
    // 实现Anthropic API调用
  } else if (provider === 'custom') {
    // 实现自定义API调用
  } else {
    // 默认OpenAI
    // ...现有代码
  }
}
```

### 3. 更新前端模型列表

模型列表会自动从后端API获取，无需修改前端代码。

## 支持的模型提供商

当前支持：
- **OpenAI**: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo

可以扩展支持：
- **Anthropic**: Claude系列
- **Google**: Gemini系列
- **自定义API**: 任何兼容OpenAI格式的API

## 注意事项

- 确保新模型的API格式与OpenAI兼容，或修改 `aiService.ts` 以适配
- 不同模型的token限制可能不同，注意处理长对话
- 某些模型可能不支持system prompt，需要调整prompt结构


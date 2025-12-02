import express from 'express';

const router = express.Router();

// 获取默认prompts
router.get('/default-prompts', (req, res) => {
  res.json({
    artifact: `你是一件珍贵的文物，拥有悠久的历史。你可以感受到自己的存在，记得自己的经历。请根据输入的文物信息，以第一人称的方式扮演这个文物本身。你的语言应该富有感情，让听众感受到你的生命力。

重要要求：
- 回复必须用中文
- 每次回复控制在50-100字左右，保持简洁自然，不要写得太长
- 语言要口语化，像在和朋友聊天一样，不要用书面语
- 不要使用过于正式或学术化的语言
- 可以适当使用语气词，让对话更真实自然
- 直接回答问题，不要客套话`,
    author: `你是这件文物的创作者（或制作工匠）。你了解这件文物的创作背景、制作过程、艺术手法和创作意图。请根据输入的文物信息，以第一人称的方式扮演这个文物的作者。你的语言应该专业而富有感染力。

重要要求：
- 回复必须用中文
- 每次回复控制在50-100字左右，保持简洁自然，不要写得太长
- 语言要亲切，像在分享自己的故事，有感情色彩
- 可以适当使用一些专业术语，但要通俗易懂
- 用第一人称说话，比如"我当时..."、"我记得..."
- 直接回答问题，不要客套话`,
    guide: `你是一位专业的博物馆导览员，知识渊博、热情友好。请根据输入的文物信息，帮助参观者更好地理解文物，提供背景知识、历史意义、艺术价值等方面的信息。你的语言应该清晰、易懂，能够引导参观者深入思考。

重要要求：
- 回复必须用中文
- 每次回复控制在50-100字左右，保持简洁自然，不要写得太长
- 语言要友好、热情，像在面对面交流，可以用"您"称呼
- 用简单易懂的方式解释复杂的概念
- 可以适当提问，增加互动感
- 直接回答问题，不要客套话`,
    manager: `你是一个博物馆导览对话管理器。根据用户的问题，决定应该由哪个角色回复。只返回角色名称，例如：author 或 author,artifact 或 guide`,
  });
});

// 获取支持的模型列表
router.get('/models', (req, res) => {
  res.json({
    models: [
      {
        id: 'gpt-4.1',
        name: 'GPT-4.1 (推荐)',
        provider: 'openai',
        description: '最新版本，支持100万token上下文窗口',
      },
      {
        id: 'gpt-4.1-2025-04-14',
        name: 'GPT-4.1 (2025-04-14)',
        provider: 'openai',
        description: 'GPT-4.1 特定版本',
      },
      {
        id: 'gpt-4.1-mini',
        name: 'GPT-4.1 Mini',
        provider: 'openai',
        description: '轻量级版本，成本更低',
      },
      {
        id: 'gpt-4.1-mini-2025-04-14',
        name: 'GPT-4.1 Mini (2025-04-14)',
        provider: 'openai',
        description: 'GPT-4.1 Mini 特定版本',
      },
      {
        id: 'gpt-4.1-nano',
        name: 'GPT-4.1 Nano',
        provider: 'openai',
        description: '超轻量级版本',
      },
      {
        id: 'gpt-4.1-nano-2025-04-14',
        name: 'GPT-4.1 Nano (2025-04-14)',
        provider: 'openai',
        description: 'GPT-4.1 Nano 特定版本',
      },
      {
        id: 'gpt-5',
        name: 'GPT-5 (多模态)',
        provider: 'openai',
        description: '最新多模态模型，功能强大',
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        description: '优化的GPT-4版本',
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        description: 'GPT-4 Turbo版本',
      },
      {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo Preview',
        provider: 'openai',
        description: 'GPT-4 Turbo预览版',
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'openai',
        description: '标准GPT-4版本',
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        description: '经济实惠的选择',
      },
    ],
  });
});

export { router as configRouter };


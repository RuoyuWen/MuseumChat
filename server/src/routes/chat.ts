import express from 'express';
import { ChatManager } from '../services/chatManager.js';
import { AIService } from '../services/aiService.js';
import { ChatRequest } from '../types.js';

const router = express.Router();
const aiService = new AIService();
const chatManager = new ChatManager(aiService);

router.post('/message', async (req, res) => {
  try {
    const request: ChatRequest = req.body;

    if (!request.apiKey) {
      return res.status(400).json({ error: 'API Key is required' });
    }

    if (!request.message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatManager.processMessage(request);
    res.json(response);
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/suggest-questions', async (req, res) => {
  try {
    const { history, artifactContext, model, apiKey } = req.body;

    if (!apiKey || !history) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const chatManager = new ChatManager(aiService);
    const suggestedQuestions = await chatManager.generateSuggestedQuestions(
      history,
      artifactContext || '',
      model || 'gpt-4.1',
      apiKey
    );

    res.json({ suggestedQuestions });
  } catch (error: any) {
    console.error('Suggest questions error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/continue', async (req, res) => {
  try {
    const {
      role,
      history,
      artifactContext,
      rolePrompt,
      model,
      apiKey,
      allSelectedRoles,
      currentRoleIndex,
      preGeneratedResponse, // 预生成的回复
      userInfo, // 用户信息
    } = req.body;

    if (!apiKey || !role || !rolePrompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await chatManager.continueWithRole(
      role,
      history,
      artifactContext,
      rolePrompt,
      model || 'gpt-4.1',
      apiKey,
      allSelectedRoles,
      currentRoleIndex,
      preGeneratedResponse, // 传递预生成的回复
      userInfo // 传递用户信息
    );

    res.json(result);
  } catch (error: any) {
    console.error('Continue error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/adjust-prompt', async (req, res) => {
  try {
    const {
      role,
      currentPrompt,
      userRequest,
      artifactContext,
      model,
      apiKey,
    } = req.body;

    if (!apiKey || !role || !currentPrompt || !userRequest) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    aiService.initialize(apiKey);

    // 使用AI分析用户要求并调整prompt
    const adjustmentPrompt = `你是一个prompt优化助手。用户想要调整一个AI角色的prompt。

当前角色：${role === 'artifact' ? '文物本身' : role === 'author' ? '文物的作者' : '导览员'}
当前prompt：
${currentPrompt}

用户的要求（自然语言）：
${userRequest}

文物背景信息：
${artifactContext}

请根据用户的要求，调整并优化这个prompt。要求：
1. 保持prompt的核心功能不变
2. 根据用户要求调整语气、风格或特点
3. 保持prompt的完整性和可执行性
4. 用中文回复
5. 只返回调整后的prompt，不要添加其他说明

调整后的prompt：`;

    const messages = [
      {
        id: 'adjust-1',
        role: 'user' as const,
        content: adjustmentPrompt,
        timestamp: Date.now(),
      },
    ];

    const adjustedPrompt = await aiService.chat(messages, model || 'gpt-4.1');

    res.json({
      adjustedPrompt: adjustedPrompt.trim(),
      role,
      userRequest,
    });
  } catch (error: any) {
    console.error('Adjust prompt error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.post('/chat-with-role', async (req, res) => {
  try {
    const {
      role,
      message,
      history,
      artifactContext,
      rolePrompt,
      model,
      apiKey,
    } = req.body;

    if (!apiKey || !role || !rolePrompt || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    aiService.initialize(apiKey);

    const response = await aiService.chatAsRole(
      role,
      message,
      history,
      artifactContext,
      rolePrompt,
      model || 'gpt-4.1'
    );

    res.json({ response });
  } catch (error: any) {
    console.error('Chat with role error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export { router as chatRouter };


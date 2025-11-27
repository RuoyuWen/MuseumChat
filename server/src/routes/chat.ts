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
      preGeneratedResponse // 传递预生成的回复
    );

    res.json(result);
  } catch (error: any) {
    console.error('Continue error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export { router as chatRouter };


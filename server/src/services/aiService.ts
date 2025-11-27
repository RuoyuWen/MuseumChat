import OpenAI from 'openai';
import { Message } from '../types.js';

export class AIService {
  private openai: OpenAI | null = null;

  initialize(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async chat(
    messages: Message[],
    model: string = 'gpt-4.1',
    systemPrompt?: string
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('AI Service not initialized. Please provide API key.');
    }

    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      formattedMessages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    for (const msg of messages) {
      let role: 'user' | 'assistant' | 'system' = 'assistant';
      if (msg.role === 'user') {
        role = 'user';
      } else if (msg.role === 'system') {
        role = 'system';
      }

      formattedMessages.push({
        role,
        content: msg.content,
      });
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages: formattedMessages,
        temperature: 0.8, // 提高温度使回复更自然
        max_tokens: 250, // 限制最大token数，确保回复控制在50-100字左右（中文约1.5-2字/token）
      });

      const response = completion.choices[0]?.message?.content || '抱歉，我无法生成回复。';
      
      // 确保回复是中文，如果包含太多英文，提示用中文
      return response;
    } catch (error: any) {
      console.error('AI Service Error:', error);
      throw new Error(`AI请求失败: ${error.message || '未知错误'}`);
    }
  }

  async chatAsRole(
    role: 'artifact' | 'author' | 'guide',
    userMessage: string,
    history: Message[],
    artifactContext: string,
    rolePrompt: string,
    model: string
  ): Promise<string> {
    // 只保留最近的对话历史，避免上下文过长
    const recentHistory = history.slice(-6);
    
    const systemPrompt = `${rolePrompt}

当前文物的历史背景：
${artifactContext}

${recentHistory.length > 0 ? `最近的对话历史：
${recentHistory.map(m => `${m.role === 'user' ? '用户' : m.role === 'artifact' ? '文物' : m.role === 'author' ? '作者' : '导览员'}: ${m.content}`).join('\n')}` : ''}

请以${role === 'artifact' ? '文物本身' : role === 'author' ? '文物的作者' : '导览员'}的身份，用中文自然、简洁地回复用户的问题。记住：回复要简短（50-100字），要像真实对话一样自然。`;

    const messages: Message[] = [
      ...recentHistory,
      {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      },
    ];

    return this.chat(messages, model, systemPrompt);
  }
}


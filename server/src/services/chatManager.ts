import { Message, ChatRequest, ChatResponse } from '../types.js';
import { AIService } from './aiService.js';

export class ChatManager {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    const { message, history, artifactContext, model, prompts, userInfo } = request;

    // 初始化AI服务
    this.aiService.initialize(request.apiKey);

    // 使用管理器prompt决定哪些角色应该回复
    const managerPrompt = `你是一个博物馆导览对话管理器。根据用户的问题，决定应该由哪个角色回复：
- artifact（文物本身）：当用户想了解文物的直接信息、感受、经历时
- author（作者）：当用户想了解创作背景、创作意图、艺术手法时
- guide（导览员）：当用户需要导览、解释、总结时

可以返回一个或多个角色，用逗号分隔。如果用户说"继续"或类似的话，返回之前应该继续的角色。

用户问题：${message}
历史背景：${artifactContext}

只返回角色名称，例如：author 或 author,artifact 或 guide。不要返回其他内容，只返回角色名称。`;

    const managerMessages: Message[] = [
      {
        id: 'manager-1',
        role: 'system',
        content: managerPrompt,
        timestamp: Date.now(),
      },
      {
        id: 'manager-2',
        role: 'user',
        content: message,
        timestamp: Date.now(),
      },
    ];

    let selectedRoles: string[] = [];
    try {
      const managerResponse = await this.aiService.chat(managerMessages, model);
      // 解析管理器返回的角色
      selectedRoles = managerResponse
        .toLowerCase()
        .split(',')
        .map(r => r.trim())
        .filter(r => ['artifact', 'author', 'guide'].includes(r));
    } catch (error) {
      console.error('Manager decision error:', error);
      // 默认选择导览员
      selectedRoles = ['guide'];
    }

    // 如果没有选择角色，默认选择导览员
    if (selectedRoles.length === 0) {
      selectedRoles = ['guide'];
    }

    const newMessages: Message[] = [...history];
    let shouldContinue = false;
    let nextRole: 'artifact' | 'author' | 'guide' | undefined = undefined;

    const firstRole = selectedRoles[0] as 'artifact' | 'author' | 'guide';

    // 并行生成所有角色的回复（优化：预生成后续角色的回复）
    const rolePromises = selectedRoles.map(async (role) => {
      try {
        const rolePrompt = prompts[role as 'artifact' | 'author' | 'guide'];
        const response = await this.aiService.chatAsRole(
          role as 'artifact' | 'author' | 'guide',
          message,
          history,
          artifactContext,
          rolePrompt,
          model,
          userInfo // 传递用户信息
        );

        return {
          role,
          message: {
            id: `${Date.now()}-${role}`,
            role: role as 'artifact' | 'author' | 'guide',
            content: response,
            timestamp: Date.now(),
          },
        };
      } catch (error) {
        console.error(`Error getting response from ${role}:`, error);
        return {
          role,
          message: {
            id: `${Date.now()}-${role}`,
            role: role as 'artifact' | 'author' | 'guide',
            content: '抱歉，我暂时无法回复。',
            timestamp: Date.now(),
          },
        };
      }
    });

    // 等待所有角色回复完成（并行执行）
    const roleResponses = await Promise.all(rolePromises);

    // 第一个角色立即添加到消息列表
    const firstRoleResponse = roleResponses.find(r => r.role === firstRole);
    if (firstRoleResponse) {
      newMessages.push(firstRoleResponse.message);
    }

    // 如果选择了多个角色，标记为待继续，等待用户点击"继续"按钮
    if (selectedRoles.length > 1) {
      shouldContinue = true;
      nextRole = selectedRoles[1] as 'artifact' | 'author' | 'guide';
    }

    // 预生成后续角色的回复（用于快速显示）
    const preGeneratedResponses = new Map<string, Message>();
    roleResponses.slice(1).forEach(({ role, message }) => {
      preGeneratedResponses.set(role, message);
    });

    // 异步生成推荐问题（不阻塞主流程）
    const suggestedQuestionsPromise = this.generateSuggestedQuestions(
      newMessages,
      artifactContext,
      model,
      request.apiKey,
      userInfo
    ).catch(error => {
      console.error('Error generating suggested questions:', error);
      return [];
    });

    // 等待推荐问题生成（但已经并行执行了）
    const suggestedQuestions = await suggestedQuestionsPromise;

    return {
      messages: newMessages,
      shouldContinue,
      nextRole,
      suggestedQuestions,
      allSelectedRoles: selectedRoles, // 返回所有选中的角色，供前端使用
      preGeneratedResponses: Object.fromEntries(preGeneratedResponses), // 预生成的回复
    };
  }

  // 判断是否应该自动继续多个角色的回复
  private shouldAutoContinueRoles(message: string, roleCount: number): boolean {
    // 如果用户明确要求多个角度或全面介绍
    const multiAngleKeywords = ['全面', '多角度', '都', '一起', '分别', '详细', '完整'];
    if (multiAngleKeywords.some(keyword => message.includes(keyword))) {
      return true;
    }

    // 如果问题比较开放，适合多个角色回复
    const openEndedKeywords = ['介绍', '说说', '了解', '知道', '什么', '如何', '为什么'];
    if (openEndedKeywords.some(keyword => message.includes(keyword)) && roleCount >= 2) {
      return true;
    }

    return false;
  }

  // 生成推荐问题
  async generateSuggestedQuestions(
    history: Message[],
    artifactContext: string,
    model: string,
    apiKey: string,
    userInfo?: { name?: string; [key: string]: any }
  ): Promise<string[]> {
    this.aiService.initialize(apiKey);

    const recentMessages = history.slice(-4);
    const conversationContext = recentMessages
      .map(m => `${m.role === 'user' ? '用户' : m.role === 'artifact' ? '文物' : m.role === 'author' ? '作者' : '导览员'}: ${m.content}`)
      .join('\n');

    const userInfoString = userInfo?.name ? `用户名字：${userInfo.name}\n` : '';

    const prompt = `你是一个博物馆导览助手。根据当前的对话内容，生成3-4个用户可能感兴趣的问题。
${userInfoString}
当前对话：
${conversationContext}

文物背景：${artifactContext}

要求：
1. 问题要简洁，每个问题10-15字左右
2. 问题要自然，像真实对话中的提问
3. 问题要多样化，可以从不同角度提问（历史、艺术、创作、感受等）
4. 问题要基于当前对话内容，有相关性
5. 用中文，口语化

只返回问题，每行一个问题，不要编号，不要其他说明文字。`;

    try {
      const response = await this.aiService.chat(
        [
          {
            id: 'suggest-1',
            role: 'user',
            content: prompt,
            timestamp: Date.now(),
          },
        ],
        model
      );

      // 解析推荐问题
      const questions = response
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0 && !q.match(/^\d+[\.、]/)) // 过滤掉编号
        .slice(0, 4); // 最多4个问题

      return questions.length > 0 ? questions : [
        '这个文物有什么特别之处？',
        '能详细介绍一下创作背景吗？',
        '这件文物现在在哪里？',
      ];
    } catch (error) {
      console.error('Error generating suggested questions:', error);
      // 返回默认推荐问题
      return [
        '这个文物有什么特别之处？',
        '能详细介绍一下创作背景吗？',
        '这件文物现在在哪里？',
      ];
    }
  }

  async continueWithRole(
    role: 'artifact' | 'author' | 'guide',
    history: Message[],
    artifactContext: string,
    rolePrompt: string,
    model: string,
    apiKey: string,
    allSelectedRoles?: string[],
    currentRoleIndex?: number,
    preGeneratedResponse?: Message,
    userInfo?: { name?: string; [key: string]: any }
  ): Promise<{ message: Message; shouldContinue: boolean; nextRole?: 'artifact' | 'author' | 'guide'; suggestedQuestions?: string[] }> {
    this.aiService.initialize(apiKey);

    let message: Message;

    // 如果有预生成的回复，直接使用（优化：避免重复API调用）
    if (preGeneratedResponse) {
      message = preGeneratedResponse;
    } else {
      // 否则生成新的回复
      const roleName = role === 'artifact' ? '文物本身' : role === 'author' ? '文物的作者' : '导览员';
      const continuePrompt = `请以${roleName}的身份，基于刚才的对话自然地补充你的观点或信息。记住：用中文回复，保持简洁（50-100字），要自然真实，像在群聊中讨论一样。`;

      try {
        const response = await this.aiService.chatAsRole(
          role,
          continuePrompt,
          history,
          artifactContext,
          rolePrompt,
          model,
          userInfo // 传递用户信息
        );

        message = {
          id: Date.now().toString(),
          role,
          content: response,
          timestamp: Date.now(),
        };
      } catch (error) {
        console.error(`Error continuing with ${role}:`, error);
        message = {
          id: Date.now().toString(),
          role,
          content: '抱歉，我暂时无法继续。',
          timestamp: Date.now(),
        };
      }
    }

    // 检查是否还有更多角色需要回复
    let shouldContinue = false;
    let nextRole: 'artifact' | 'author' | 'guide' | undefined = undefined;
    
    if (allSelectedRoles && currentRoleIndex !== undefined) {
      const nextIndex = currentRoleIndex + 1;
      if (nextIndex < allSelectedRoles.length) {
        shouldContinue = true;
        nextRole = allSelectedRoles[nextIndex] as 'artifact' | 'author' | 'guide';
      }
    }

    // 生成推荐问题
    const updatedHistory = [...history, message];
    const suggestedQuestions = await this.generateSuggestedQuestions(
      updatedHistory,
      artifactContext,
      model,
      apiKey,
      userInfo
    );

    return {
      message,
      shouldContinue,
      nextRole,
      suggestedQuestions,
    };
  }
}


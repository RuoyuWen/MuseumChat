import React, { useState, useRef, useEffect } from 'react';
import { Message, AppConfig, PromptAdjustment } from '../types';
import { apiClient } from '../api/client';

interface PromptDebugPageProps {
  config: AppConfig;
  onBack: () => void;
}

type Role = 'artifact' | 'author' | 'guide';

const ROLE_ORDER: Role[] = ['artifact', 'author', 'guide'];
const ROLE_NAMES: Record<Role, string> = {
  artifact: '文物',
  author: '作者',
  guide: '导览员',
};

export const PromptDebugPage: React.FC<PromptDebugPageProps> = ({ config, onBack }) => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [promptAdjustment, setPromptAdjustment] = useState('');
  const [loading, setLoading] = useState(false);
  const [adjustingPrompt, setAdjustingPrompt] = useState(false);
  const [adjustments, setAdjustments] = useState<PromptAdjustment[]>([]);
  const [finalPrompts, setFinalPrompts] = useState<Record<Role, string>>({
    artifact: '',
    author: '',
    guide: '',
  });
  // 存储每个角色的聊天记录
  const [chatHistories, setChatHistories] = useState<Record<Role, Message[]>>({
    artifact: [],
    author: [],
    guide: [],
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevRoleIndexRef = useRef<number>(-1);
  const messagesRef = useRef<Message[]>([]);
  const chatHistoriesRef = useRef<Record<Role, Message[]>>({
    artifact: [],
    author: [],
    guide: [],
  });

  const currentRole = ROLE_ORDER[currentRoleIndex];
  const isLastRole = currentRoleIndex === ROLE_ORDER.length - 1;

  // 同步messages和chatHistories到ref，以便在切换角色时访问最新值
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    chatHistoriesRef.current = chatHistories;
  }, [chatHistories]);

  useEffect(() => {
    // 当角色切换时，先保存上一个角色的聊天记录
    if (prevRoleIndexRef.current >= 0 && prevRoleIndexRef.current !== currentRoleIndex) {
      const prevRole = ROLE_ORDER[prevRoleIndexRef.current];
      const prevMessages = messagesRef.current;
      if (prevMessages.length > 0) {
        setChatHistories(prev => ({
          ...prev,
          [prevRole]: prevMessages,
        }));
      }
    }

    // 初始化当前角色的prompt和聊天记录
    if (config.prompts && currentRole) {
      setCurrentPrompt(config.prompts[currentRole]);
      
      // 检查该角色是否已有聊天记录
      const existingHistory = chatHistoriesRef.current[currentRole];
      if (existingHistory.length > 0) {
        setMessages(existingHistory);
      } else {
        setMessages([
          {
            id: 'welcome',
            role: 'system',
            content: `开始与${ROLE_NAMES[currentRole]}对话。你可以在左侧调整prompt，在右侧进行对话测试。`,
            timestamp: Date.now(),
          },
        ]);
      }
    }

    // 更新上一个角色索引
    prevRoleIndexRef.current = currentRoleIndex;
  }, [currentRoleIndex, config.prompts, currentRole]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading || adjustingPrompt) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 直接调用AI服务，只使用当前角色
      const response = await apiClient.chatWithRole(
        currentRole,
        input,
        messages,
        config.artifactContext,
        currentPrompt, // 使用当前调整后的prompt
        config.model,
        config.apiKey
      );

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: currentRole,
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Send message error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `错误: ${error.response?.data?.error || error.message || '发送消息失败'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPrompt = async () => {
    if (!promptAdjustment.trim() || adjustingPrompt) return;

    setAdjustingPrompt(true);

    try {
      const response = await apiClient.adjustPrompt(
        currentRole,
        currentPrompt,
        promptAdjustment,
        config.artifactContext,
        config.model,
        config.apiKey
      );

      const newPrompt = response.adjustedPrompt;
      const adjustment: PromptAdjustment = {
        role: currentRole,
        userRequest: promptAdjustment,
        oldPrompt: currentPrompt,
        newPrompt: newPrompt,
        timestamp: Date.now(),
      };

      setAdjustments((prev) => [...prev, adjustment]);
      setCurrentPrompt(newPrompt);
      setPromptAdjustment('');
    } catch (error: any) {
      console.error('Adjust prompt error:', error);
      alert(`调整失败: ${error.response?.data?.error || error.message || '未知错误'}`);
    } finally {
      setAdjustingPrompt(false);
    }
  };

  const handleComplete = () => {
    // 保存当前角色的最终prompt和聊天记录
    const updatedFinalPrompts = { ...finalPrompts };
    updatedFinalPrompts[currentRole] = currentPrompt;
    setFinalPrompts(updatedFinalPrompts);

    // 保存当前角色的聊天记录
    const updatedChatHistories = { ...chatHistories };
    updatedChatHistories[currentRole] = messages;
    setChatHistories(updatedChatHistories);

    if (isLastRole) {
      // 完成所有角色，生成文档并下载
      generateAndDownloadDocument(updatedFinalPrompts, updatedChatHistories);
    } else {
      // 进入下一个角色
      setCurrentRoleIndex(currentRoleIndex + 1);
    }
  };

  const generateAndDownloadDocument = (
    prompts: Record<Role, string>,
    chatHistories: Record<Role, Message[]>
  ) => {
    const timestamp = Date.now();
    const dateStr = new Date().toISOString();

    // 1. 生成Prompt调试文档
    const promptContent = `# Prompt调试文档

## 文物信息
${config.artifactContext}

## Prompt调整历史

${adjustments.map((adj, index) => `
### ${index + 1}. ${ROLE_NAMES[adj.role]} - ${new Date(adj.timestamp).toLocaleString('zh-CN')}

**用户要求：**
${adj.userRequest}

**调整前：**
${adj.oldPrompt}

**调整后：**
${adj.newPrompt}

---
`).join('\n')}

## 最终Prompts

### 文物 (Artifact)
${prompts.artifact}

### 作者 (Author)
${prompts.author}

### 导览员 (Guide)
${prompts.guide}

---
生成时间: ${dateStr}
`;

    // 2. 生成聊天记录文档
    const chatContent = `# 调试模式聊天记录

## 文物信息
${config.artifactContext}

## 对话记录

${ROLE_ORDER.map((role) => {
      const history = chatHistories[role];
      if (!history || history.length === 0) {
        return `### ${ROLE_NAMES[role]}\n\n*暂无对话记录*\n\n---\n`;
      }

      // 过滤掉纯系统消息，保留欢迎消息和所有用户/AI对话
      const conversationMessages = history.filter(
        (msg) => msg.role !== 'system' || msg.content.includes('开始与') || msg.content.includes('错误')
      );

      if (conversationMessages.length === 0) {
        return `### ${ROLE_NAMES[role]}\n\n*暂无对话记录*\n\n---\n`;
      }

      return `### ${ROLE_NAMES[role]}

${conversationMessages.map((msg) => {
        if (msg.role === 'system') {
          return `**系统提示：** ${msg.content}\n\n`;
        }
        const roleName = msg.role === 'user' ? '👤 用户' : `🤖 ${ROLE_NAMES[msg.role as Role]}`;
        const timeStr = new Date(msg.timestamp).toLocaleString('zh-CN');
        return `${roleName} (${timeStr})\n${msg.content}\n\n`;
      }).join('')}

---
`;
    }).join('\n')}

生成时间: ${dateStr}
`;

    // 下载Prompt调试文档
    const promptBlob = new Blob([promptContent], { type: 'text/markdown;charset=utf-8' });
    const promptUrl = URL.createObjectURL(promptBlob);
    const promptLink = document.createElement('a');
    promptLink.href = promptUrl;
    promptLink.download = `prompt-debug-${timestamp}.md`;
    document.body.appendChild(promptLink);
    promptLink.click();
    document.body.removeChild(promptLink);
    URL.revokeObjectURL(promptUrl);

    // 延迟一下再下载聊天记录文档，避免浏览器阻止多个下载
    setTimeout(() => {
      const chatBlob = new Blob([chatContent], { type: 'text/markdown;charset=utf-8' });
      const chatUrl = URL.createObjectURL(chatBlob);
      const chatLink = document.createElement('a');
      chatLink.href = chatUrl;
      chatLink.download = `chat-history-${timestamp}.md`;
      document.body.appendChild(chatLink);
      chatLink.click();
      document.body.removeChild(chatLink);
      URL.revokeObjectURL(chatUrl);

      // 返回首页
      setTimeout(() => {
        onBack();
      }, 500);
    }, 500);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Prompt Adjustment */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800">
              {ROLE_NAMES[currentRole]} Prompt调试
            </h2>
            <span className="text-sm text-gray-500">
              {currentRoleIndex + 1} / {ROLE_ORDER.length}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            当前角色：{ROLE_NAMES[currentRole]}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Prompt Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              当前Prompt
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 max-h-40 overflow-y-auto">
              {currentPrompt || '加载中...'}
            </div>
          </div>

          {/* Prompt Adjustment Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              调整要求（自然语言）
            </label>
            <textarea
              value={promptAdjustment}
              onChange={(e) => setPromptAdjustment(e.target.value)}
              placeholder='例如："说话变得更可爱"、"语气更专业一些"、"增加一些幽默感"'
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={adjustingPrompt}
            />
            <button
              onClick={handleAdjustPrompt}
              disabled={adjustingPrompt || !promptAdjustment.trim()}
              className="mt-2 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {adjustingPrompt ? '调整中...' : '应用调整'}
            </button>
          </div>

          {/* Adjustment History */}
          {adjustments.filter(a => a.role === currentRole).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                调整历史
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {adjustments
                  .filter(a => a.role === currentRole)
                  .map((adj, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                      <div className="font-semibold text-blue-800 mb-1">
                        调整 {index + 1}
                      </div>
                      <div className="text-blue-700 mb-1">
                        <strong>要求：</strong>{adj.userRequest}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Complete Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleComplete}
            disabled={adjustingPrompt}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLastRole ? '完成并下载文档' : `完成${ROLE_NAMES[currentRole]}，进入下一个`}
          </button>
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              💬 与{ROLE_NAMES[currentRole]}对话
            </h1>
            <button
              onClick={onBack}
              disabled={adjustingPrompt}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              返回
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => {
              if (message.role === 'system') {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 text-sm">
                      {message.content}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-lg p-4 border shadow-sm ${
                      message.role === 'user'
                        ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                        : 'bg-white text-gray-800 border-gray-200'
                    }`}
                  >
                    <div className="font-semibold mb-1 text-sm">
                      {message.role === 'user' ? '你' : ROLE_NAMES[message.role as Role]}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4">
          <div className="max-w-3xl mx-auto flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="输入你的消息..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading || adjustingPrompt}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || adjustingPrompt || !input.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


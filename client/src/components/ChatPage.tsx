import React, { useState, useRef, useEffect } from 'react';
import { Message, AppConfig } from '../types';
import { apiClient } from '../api/client';

interface ChatPageProps {
  config: AppConfig;
  onBack: () => void;
}

interface UserInfo {
  name?: string;
  preferences?: string[];
  [key: string]: any;
}

export const ChatPage: React.FC<ChatPageProps> = ({ config, onBack }) => {
  // 从localStorage加载用户信息
  const loadUserInfo = (): UserInfo => {
    try {
      const saved = localStorage.getItem('museum_userInfo');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: '欢迎来到博物馆导览系统！你可以与文物、作者和导览员进行对话。',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldContinue, setShouldContinue] = useState(false);
  const [nextRole, setNextRole] = useState<'artifact' | 'author' | 'guide' | undefined>();
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [allSelectedRoles, setAllSelectedRoles] = useState<string[]>([]);
  const [currentRoleIndex, setCurrentRoleIndex] = useState<number>(0);
  const [preGeneratedResponses, setPreGeneratedResponses] = useState<Record<string, Message>>({});
  const [userInfo, setUserInfo] = useState<UserInfo>(loadUserInfo());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 从消息中提取用户信息（名字等）
  const extractUserInfo = (message: string, currentInfo: UserInfo): UserInfo => {
    const updatedInfo = { ...currentInfo };
    
    // 提取名字的模式
    const namePatterns = [
      /(?:我|我的)?(?:名字|姓名|叫)(?:是|叫|为)?[：:，,，]?([^\s，,。！!？?]{2,10})/,
      /(?:我|我的)?(?:名字|姓名|叫)(?:是|叫|为)?([^\s，,。！!？?]{2,10})/,
      /(?:叫我|称呼我)([^\s，,。！!？?]{2,10})/,
      /(?:我是)([^\s，,。！!？?]{2,10})/,
    ];

    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // 过滤掉一些常见的非名字词汇
        if (!['用户', '游客', '参观者', '你', '您'].includes(name)) {
          updatedInfo.name = name;
          break;
        }
      }
    }

    return updatedInfo;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'artifact':
        return '文物';
      case 'author':
        return '作者';
      case 'guide':
        return '导览员';
      case 'user':
        return '你';
      default:
        return role;
    }
  };

  const getRoleAvatar = (role: string) => {
    switch (role) {
      case 'artifact':
        return '🏺';
      case 'author':
        return '👨‍🎨';
      case 'guide':
        return '👩‍🏫';
      case 'user':
        return '👤';
      default:
        return '💬';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'artifact':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'author':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'guide':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'user':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    // 提取用户信息（如名字）
    const updatedUserInfo = extractUserInfo(input, userInfo);
    if (updatedUserInfo.name !== userInfo.name) {
      setUserInfo(updatedUserInfo);
      // 保存到localStorage
      localStorage.setItem('museum_userInfo', JSON.stringify(updatedUserInfo));
    }

    // 先添加用户消息到界面
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setShouldContinue(false);
    setNextRole(undefined);
    setAllSelectedRoles([]);
    setCurrentRoleIndex(0);

    try {
      const response = await apiClient.sendMessage(
        input,
        messages, // 使用旧的messages，不包含刚添加的用户消息
        config.artifactContext,
        config.apiKey,
        config.model,
        config.prompts,
        updatedUserInfo // 传递用户信息
      );

      // 合并用户消息和AI回复
      const finalMessages = [...updatedMessages, ...response.messages.slice(messages.length)];
      setMessages(finalMessages);
      setShouldContinue(response.shouldContinue);
      setNextRole(response.nextRole);
      
      // 如果有多角色回复，保存角色列表和预生成的回复
      if (response.shouldContinue && response.nextRole) {
        if (response.allSelectedRoles && response.allSelectedRoles.length > 0) {
          // 使用后端返回的角色列表
          setAllSelectedRoles(response.allSelectedRoles);
          setCurrentRoleIndex(0);
          // 保存预生成的回复（优化：后续角色回复已准备好）
          if (response.preGeneratedResponses) {
            setPreGeneratedResponses(response.preGeneratedResponses);
          }
        } else {
          // 如果没有返回，从响应中推断
          const newAIMessages = response.messages.slice(messages.length);
          const firstRole = newAIMessages[0]?.role;
          if (firstRole && ['artifact', 'author', 'guide'].includes(firstRole)) {
            setAllSelectedRoles([firstRole, response.nextRole]);
            setCurrentRoleIndex(0);
          }
        }
      }
      
      // 更新推荐问题
      if (response.suggestedQuestions && response.suggestedQuestions.length > 0) {
        setSuggestedQuestions(response.suggestedQuestions);
      } else {
        // 如果没有返回推荐问题，主动获取
        loadSuggestedQuestions(finalMessages);
      }
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

  const loadSuggestedQuestions = async (currentMessages: Message[]) => {
    if (loadingSuggestions) return;
    
    setLoadingSuggestions(true);
    try {
      const response = await apiClient.getSuggestedQuestions(
        currentMessages,
        config.artifactContext,
        config.model,
        config.apiKey
      );
      setSuggestedQuestions(response.suggestedQuestions || []);
    } catch (error) {
      console.error('Failed to load suggested questions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    // 当消息更新且不是加载中时，更新推荐问题
    if (messages.length > 1 && !loading && !loadingSuggestions) {
      const lastMessage = messages[messages.length - 1];
      // 如果最后一条消息不是用户消息，更新推荐问题
      if (lastMessage.role !== 'user' && lastMessage.role !== 'system') {
        // 延迟一下，避免频繁请求
        const timer = setTimeout(() => {
          loadSuggestedQuestions(messages);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, loading]);

  const handleQuestionClick = (question: string) => {
    setInput(question);
    // 自动聚焦到输入框
    setTimeout(() => {
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  };

  const handleContinue = async () => {
    if (!nextRole || loading) return;

    // 优化：如果有预生成的回复，立即显示（几乎零延迟）
    const preGenerated = preGeneratedResponses[nextRole];
    if (preGenerated) {
      setMessages((prev) => [...prev, preGenerated]);
      setCurrentRoleIndex(currentRoleIndex + 1);
      
      // 检查是否还有更多角色
      const nextIndex = currentRoleIndex + 2;
      if (allSelectedRoles.length > nextIndex) {
        setShouldContinue(true);
        setNextRole(allSelectedRoles[nextIndex] as 'artifact' | 'author' | 'guide');
      } else {
        setShouldContinue(false);
        setNextRole(undefined);
      }
      
      // 移除已使用的预生成回复
      const updatedPreGenerated = { ...preGeneratedResponses };
      delete updatedPreGenerated[nextRole];
      setPreGeneratedResponses(updatedPreGenerated);
      
      // 异步更新推荐问题（不阻塞）
      setTimeout(async () => {
        try {
          const updatedMessages = [...messages, preGenerated];
          await loadSuggestedQuestions(updatedMessages);
        } catch (error) {
          console.error('Failed to update suggested questions:', error);
        }
      }, 0);
      
      return; // 直接返回，不需要API调用
    }

    // 如果没有预生成回复，调用API生成
    setLoading(true);

    try {
      const rolePrompt = config.prompts[nextRole];
      const newRoleIndex = currentRoleIndex + 1;
      
      const response = await apiClient.continueMessage(
        nextRole,
        messages,
        config.artifactContext,
        rolePrompt,
        config.model,
        config.apiKey,
        allSelectedRoles.length > 0 ? allSelectedRoles : undefined,
        newRoleIndex,
        undefined, // preGeneratedResponse
        userInfo // 传递用户信息
      );

      setMessages((prev) => [...prev, response.message]);
      setShouldContinue(response.shouldContinue || false);
      setNextRole(response.nextRole);
      setCurrentRoleIndex(newRoleIndex);
      
      // 更新推荐问题
      if (response.suggestedQuestions && response.suggestedQuestions.length > 0) {
        setSuggestedQuestions(response.suggestedQuestions);
      }
    } catch (error: any) {
      console.error('Continue error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `错误: ${error.response?.data?.error || error.message || '继续对话失败'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">🏛️ 博物馆导览</h1>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            返回设置
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => {
            // 系统消息居中显示
            if (message.role === 'system') {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 text-sm border border-gray-200">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role !== 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-2xl shadow-sm hover:scale-105 transition-transform">
                    {getRoleAvatar(message.role)}
                  </div>
                )}
                <div
                  className={`max-w-3xl rounded-lg p-4 border shadow-sm ${
                    message.role === 'user'
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                      : getRoleColor(message.role)
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.role === 'user' && (
                      <span className="text-lg">{getRoleAvatar(message.role)}</span>
                    )}
                    <span className="font-semibold text-sm">
                      {getRoleName(message.role)}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed text-base">
                    {message.content}
                  </div>
                  <div className="text-xs mt-2 opacity-60">
                    {new Date(message.timestamp).toLocaleTimeString('zh-CN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-2xl shadow-sm hover:scale-105 transition-transform">
                    {getRoleAvatar(message.role)}
                  </div>
                )}
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

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && !loading && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <span>💡</span>
                <span>推荐问题：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(question)}
                    className="px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-gray-700 transition-colors hover:border-indigo-300 hover:text-indigo-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {shouldContinue && nextRole && (
            <div className="mb-2">
              <button
                onClick={handleContinue}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                继续 - {getRoleName(nextRole)}的回复
              </button>
            </div>
          )}
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="输入你的问题..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



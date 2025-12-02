export interface Message {
  id: string;
  role: 'user' | 'artifact' | 'author' | 'guide' | 'system';
  content: string;
  timestamp: number;
}

export interface UserInfo {
  name?: string;
  preferences?: string[];
  [key: string]: any;
}

export interface ChatRequest {
  message: string;
  history: Message[];
  artifactContext: string;
  apiKey: string;
  model: string;
  prompts: {
    artifact: string;
    author: string;
    guide: string;
    manager: string;
  };
  userInfo?: UserInfo; // 用户信息（名字等）
}

export interface ChatResponse {
  messages: Message[];
  shouldContinue: boolean;
  nextRole?: 'artifact' | 'author' | 'guide';
  suggestedQuestions?: string[]; // 推荐的问题
  allSelectedRoles?: string[]; // 所有选中的角色列表
  preGeneratedResponses?: Record<string, Message>; // 预生成的回复（角色名 -> 消息）
}

export interface ModelConfig {
  name: string;
  provider: 'openai' | 'anthropic' | 'custom';
  defaultModel: string;
}


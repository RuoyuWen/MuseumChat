export interface Message {
  id: string;
  role: 'user' | 'artifact' | 'author' | 'guide' | 'system';
  content: string;
  timestamp: number;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export interface Prompts {
  artifact: string;
  author: string;
  guide: string;
  manager: string;
}

export interface AppConfig {
  apiKey: string;
  model: string;
  artifactContext: string;
  prompts: Prompts;
  mode?: 'normal' | 'debug'; // 模式：普通模式或调试模式
}

export interface PromptAdjustment {
  role: 'artifact' | 'author' | 'guide';
  userRequest: string; // 用户的调整要求
  oldPrompt: string; // 调整前的prompt
  newPrompt: string; // 调整后的prompt
  timestamp: number;
}

export interface DebugSession {
  artifactContext: string;
  adjustments: PromptAdjustment[];
  finalPrompts: Prompts;
}


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
}


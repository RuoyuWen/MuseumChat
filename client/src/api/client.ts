import axios from 'axios';
import { Message, Model, Prompts } from '../types';

const API_BASE_URL = '/api';

export const apiClient = {
  async sendMessage(
    message: string,
    history: Message[],
    artifactContext: string,
    apiKey: string,
    model: string,
    prompts: Prompts
  ) {
    const response = await axios.post(`${API_BASE_URL}/chat/message`, {
      message,
      history,
      artifactContext,
      apiKey,
      model,
      prompts,
    });
    return response.data;
  },

  async continueMessage(
    role: 'artifact' | 'author' | 'guide',
    history: Message[],
    artifactContext: string,
    rolePrompt: string,
    model: string,
    apiKey: string,
    allSelectedRoles?: string[],
    currentRoleIndex?: number,
    preGeneratedResponse?: Message
  ) {
    const response = await axios.post(`${API_BASE_URL}/chat/continue`, {
      role,
      history,
      artifactContext,
      rolePrompt,
      model,
      apiKey,
      allSelectedRoles,
      currentRoleIndex,
      preGeneratedResponse,
    });
    return response.data;
  },

  async getDefaultPrompts(): Promise<Prompts> {
    const response = await axios.get(`${API_BASE_URL}/config/default-prompts`);
    return response.data;
  },

  async getModels(): Promise<Model[]> {
    const response = await axios.get(`${API_BASE_URL}/config/models`);
    return response.data.models;
  },

  async getSuggestedQuestions(
    history: Message[],
    artifactContext: string,
    model: string,
    apiKey: string
  ) {
    const response = await axios.post(`${API_BASE_URL}/chat/suggest-questions`, {
      history,
      artifactContext,
      model,
      apiKey,
    });
    return response.data;
  },
};


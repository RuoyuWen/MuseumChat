import React, { useState, useEffect } from 'react';
import { Model, Prompts, AppConfig } from '../types';
import { apiClient } from '../api/client';

interface HomePageProps {
  onStart: (config: AppConfig) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4.1');
  const [artifactContext, setArtifactContext] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [prompts, setPrompts] = useState<Prompts | null>(null);
  const [showPromptSettings, setShowPromptSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [modelsData, defaultPrompts] = await Promise.all([
        apiClient.getModels(),
        apiClient.getDefaultPrompts(),
      ]);
      setModels(modelsData);
      setPrompts(defaultPrompts);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleStart = () => {
    if (!apiKey.trim()) {
      alert('请输入API Key');
      return;
    }
    if (!artifactContext.trim()) {
      alert('请输入文物的历史背景');
      return;
    }
    if (!prompts) {
      alert('正在加载配置，请稍候...');
      return;
    }

    onStart({
      apiKey,
      model,
      artifactContext,
      prompts,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            🏛️ 博物馆导览系统
          </h1>

          <div className="space-y-6">
            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入你的OpenAI API Key"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择AI模型
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {models.find(m => m.id === model)?.description && (
                <p className="mt-1 text-xs text-gray-500">
                  {models.find(m => m.id === model)?.description}
                </p>
              )}
            </div>

            {/* Artifact Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文物历史背景 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={artifactContext}
                onChange={(e) => setArtifactContext(e.target.value)}
                placeholder="请输入该文物的历史背景、基本信息等..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Prompt Settings Toggle */}
            <div>
              <button
                onClick={() => setShowPromptSettings(!showPromptSettings)}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {showPromptSettings ? '隐藏' : '显示'} Prompt 自定义设置
              </button>
            </div>

            {/* Prompt Settings */}
            {showPromptSettings && prompts && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700">自定义 Prompts</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文物角色 Prompt
                  </label>
                  <textarea
                    value={prompts.artifact}
                    onChange={(e) =>
                      setPrompts({ ...prompts, artifact: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    作者角色 Prompt
                  </label>
                  <textarea
                    value={prompts.author}
                    onChange={(e) =>
                      setPrompts({ ...prompts, author: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    导览员角色 Prompt
                  </label>
                  <textarea
                    value={prompts.guide}
                    onChange={(e) =>
                      setPrompts({ ...prompts, guide: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    对话管理器 Prompt
                  </label>
                  <textarea
                    value={prompts.manager}
                    onChange={(e) =>
                      setPrompts({ ...prompts, manager: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  />
                </div>
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={handleStart}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              开始导览
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


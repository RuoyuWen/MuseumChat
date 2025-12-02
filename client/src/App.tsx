import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { ChatPage } from './components/ChatPage';
import { PromptDebugPage } from './components/PromptDebugPage';
import { AppConfig } from './types';

function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [mode, setMode] = useState<'normal' | 'debug' | null>(null);

  const handleStart = (newConfig: AppConfig) => {
    console.log('App handleStart called with config:', { ...newConfig, apiKey: '***' });
    console.log('Mode:', newConfig.mode);
    setConfig(newConfig);
    setMode(newConfig.mode || 'normal');
    console.log('State updated - mode:', newConfig.mode || 'normal');
  };

  const handleBack = () => {
    setConfig(null);
    setMode(null);
  };

  return (
    <div className="App">
      {config ? (
        mode === 'debug' ? (
          <PromptDebugPage config={config} onBack={handleBack} />
        ) : (
          <ChatPage config={config} onBack={handleBack} />
        )
      ) : (
        <HomePage onStart={handleStart} onStartDebug={handleStart} />
      )}
    </div>
  );
}

export default App;


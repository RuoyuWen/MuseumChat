import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { ChatPage } from './components/ChatPage';
import { AppConfig } from './types';

function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  const handleStart = (newConfig: AppConfig) => {
    setConfig(newConfig);
  };

  const handleBack = () => {
    setConfig(null);
  };

  return (
    <div className="App">
      {config ? (
        <ChatPage config={config} onBack={handleBack} />
      ) : (
        <HomePage onStart={handleStart} />
      )}
    </div>
  );
}

export default App;


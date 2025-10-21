
import React, { useState } from 'react';
import Translator from './components/Translator';
import WelcomeScreen from './components/WelcomeScreen';

function App() {
  const [isAppStarted, setIsAppStarted] = useState(false);

  if (!isAppStarted) {
    return <WelcomeScreen onStart={() => setIsAppStarted(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Translator />
    </div>
  );
}

export default App;

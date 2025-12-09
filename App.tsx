import React from 'react';
import Experience from './components/Experience';
import UI from './components/UI';
import HandController from './components/HandController';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans selection:bg-white/30">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-10">
        <Experience />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <UI />
      </div>

      {/* Camera Logic (Invisible/Helper) */}
      <HandController />
      
    </div>
  );
};

export default App;

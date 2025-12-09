import React from 'react';
import { useStore } from '../store';
import { ShapeType } from '../types';

const UI: React.FC = () => {
  const { currentShape, setShape, showUI, toggleUI } = useStore();

  const menuItems = [
    { id: ShapeType.TEXT, label: '世界' },
    { id: ShapeType.HEART, label: 'Heart' },
    { id: ShapeType.SNOW, label: 'Snow' },
    { id: ShapeType.FIREWORKS, label: 'Firework' },
    { id: ShapeType.RABBIT, label: 'Rabbit' },
    { id: ShapeType.ROSE, label: 'Rose' },
  ];

  return (
    <>
      <button 
        onClick={toggleUI}
        className="fixed top-6 right-6 z-50 text-white/50 hover:text-white transition-colors p-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d={showUI ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
        </svg>
      </button>

      <div className={`fixed inset-0 z-40 pointer-events-none flex flex-col items-center justify-end pb-12 transition-opacity duration-500 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4 p-4 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 pointer-events-auto max-w-[90vw]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setShape(item.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300
                ${currentShape === item.id 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105' 
                  : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'}
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="text-white/30 text-xs mt-4 animate-pulse">
           Pinch & Hold, then Release to change shape
        </div>
      </div>
    </>
  );
};

export default UI;
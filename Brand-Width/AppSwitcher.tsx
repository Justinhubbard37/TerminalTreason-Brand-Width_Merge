import React, { useState, useCallback, useEffect } from 'react';
import BrandWidthApp from './App.tsx';
import TerminalTreasonApp from './components/TerminalTreason/App.tsx';

export default function AppSwitcher() {
  const [activeApp, setActiveApp] = useState<'brandwidth' | 'terminaltreason' | 'split'>('brandwidth');
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newRatio = (e.clientX / window.innerWidth) * 100;
    setSplitRatio(Math.max(10, Math.min(90, newRatio)));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="w-full h-screen flex flex-col bg-[#0A0C10]">
      {/* Universal Header / Toggle */}
      <div className="h-12 border-b border-[#2F3342] flex items-center justify-center gap-2 z-50 bg-[#141824] shadow-sm">
        <button
          onClick={() => setActiveApp('brandwidth')}
          className={`px-4 py-1.5 rounded-l-md text-sm font-medium transition-colors ${activeApp === 'brandwidth' ? 'bg-[#2F80ED] text-white' : 'bg-[#1E2330] text-[#8A94B0] hover:bg-[#2F3342]'}`}
        >
          Brand-Width
        </button>
        <button
          onClick={() => setActiveApp('split')}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${activeApp === 'split' ? 'bg-[#2F80ED] text-white' : 'bg-[#1E2330] text-[#8A94B0] hover:bg-[#2F3342]'}`}
        >
          Split View
        </button>
        <button
          onClick={() => setActiveApp('terminaltreason')}
          className={`px-4 py-1.5 rounded-r-md text-sm font-medium transition-colors ${activeApp === 'terminaltreason' ? 'bg-[#2F80ED] text-white' : 'bg-[#1E2330] text-[#8A94B0] hover:bg-[#2F3342]'}`}
        >
          TerminalTreason
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        {activeApp === 'brandwidth' && (
          <div className="w-full h-full"><BrandWidthApp /></div>
        )}

        {activeApp === 'terminaltreason' && (
          <div className="w-full h-full"><TerminalTreasonApp /></div>
        )}

        {activeApp === 'split' && (
          <div className="w-full h-full flex">
            <div style={{ width: `${splitRatio}%` }} className={`h-full overflow-hidden ${isDragging ? 'pointer-events-none select-none' : ''}`}>
              <BrandWidthApp />
            </div>

            <div
              className="w-2 h-full bg-[#2F3342] cursor-col-resize hover:bg-[#2F80ED] flex items-center justify-center relative z-10 transition-colors"
              onMouseDown={() => setIsDragging(true)}
            >
              <div className="w-1 h-8 bg-[#8A94B0] rounded-full"></div>
            </div>

            <div style={{ width: `${100 - splitRatio}%` }} className={`h-full overflow-hidden ${isDragging ? 'pointer-events-none select-none' : ''}`}>
              <TerminalTreasonApp />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

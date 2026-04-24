import React from 'react';
import { Shield, Settings, Cpu, Image } from 'lucide-react';
import { View } from '../types.ts';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'vault', label: 'Brand Vault', icon: <Shield size={18} /> },
    { id: 'growth', label: 'Growth Engine', icon: <Cpu size={18} /> },
    { id: 'assets', label: 'Asset Studio', icon: <Image size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="h-full py-4 pl-4 pr-2 flex flex-col">
        <aside className="w-64 bg-graphite-900/80 backdrop-blur-md flex flex-col h-full rounded-2xl border border-azure-mist-50/5 shadow-2xl overflow-hidden relative">
        {/* Glow effect at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cloudy-sky-500/50 to-transparent opacity-50"></div>

        <div className="p-6 mb-2">
            <h1 className="text-lg font-bold text-azure-mist-50 tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 bg-cloudy-sky-500 rounded-full shadow-[0_0_8px_rgba(50,122,205,1)]"></div>
                Brand<span className="text-cloudy-sky-400">-Width</span>
            </h1>
            <p className="text-[10px] text-graphite-400 mt-1 uppercase tracking-[0.2em] font-mono pl-4">Marketing_OS</p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
                <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                    ? 'bg-cloudy-sky-500 text-white shadow-lg shadow-cloudy-sky-500/20 translate-x-1'
                    : 'text-graphite-300 hover:text-azure-mist-50 hover:bg-white/5'
                }`}
                >
                {/* Icon */}
                <div className={`transition-colors ${isActive ? 'text-white' : 'text-graphite-400 group-hover:text-cloudy-sky-400'}`}>
                    {item.icon}
                </div>

                {/* Label */}
                <span className={`font-medium text-sm tracking-wide ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                )}
                </button>
            );
            })}
        </nav>

        <div className="p-4 border-t border-azure-mist-50/5 bg-black/20">
            <div className="text-[10px] text-graphite-500 font-mono text-center flex justify-between px-2">
                <span>SYS.ONLINE</span>
                <span>V2.1.0</span>
            </div>
        </div>
        </aside>
    </div>
  );
};

export default Sidebar;
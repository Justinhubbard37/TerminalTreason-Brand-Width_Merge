import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, Settings, MessageSquare, Terminal, Activity, Play, StopCircle,
  RefreshCw, Search, ChevronDown, MoreHorizontal, Cpu, Folder, Hash,
  AlertCircle, Zap, Shield, HardDrive, Database, Cloud, Plus,
  PanelLeft, PanelRight, Trash2, AlertTriangle
} from 'lucide-react';
import { Button, Input, Badge } from './Shared';
import { MOCK_SESSIONS, MOCK_MESSAGES, MOCK_LOGS, PROVIDERS } from './constants';
import { AppState, ViewMode, ComposerMode, Message, SettingsTab, Session } from './types';

// --- Components (Inline for single-file requirement/simplicity per constraints) ---

const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="group relative">
    {children}
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-panel border border-border text-xs text-platinum rounded whitespace-nowrap z-50 shadow-neon-sm">
      {text}
    </div>
  </div>
);

// 1. Sidebar (Sessions)
const Sidebar = ({
  className,
  sessions,
  onNewChat,
  onDeleteSession
}: {
  className?: string,
  sessions: Session[],
  onNewChat: () => void,
  onDeleteSession: (id: string) => void
}) => (
  <div className={`flex flex-col h-full bg-panel border-r border-border ${className}`}>
    <div className="p-4 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-2 text-neon font-bold tracking-wider">
        <Terminal size={18} />
        <span>Terminal<span className="text-platinum">Treason</span></span>
      </div>
      <Button variant="ghost" onClick={onNewChat}><MessageSquare size={16} /></Button>
    </div>

    <div className="p-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input placeholder="Search sessions..." className="pl-9 bg-void/50 border-border" />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-2 space-y-1">
      <div className="px-3 py-2 text-xs font-mono text-muted uppercase tracking-widest mt-2">Recent</div>
      {sessions.map(session => (
        <div key={session.id} className="group relative">
          <button className="w-full text-left px-3 py-2.5 rounded-md text-sm text-platinum hover:bg-white/5 hover:text-neon group-hover:pr-8 transition-colors flex items-center gap-3">
            {session.folder ? <Folder size={14} className="text-muted group-hover:text-neon" /> : <MessageSquare size={14} className="text-muted group-hover:text-neon" />}
            <div className="flex-1 truncate">
              <div className="truncate">{session.title}</div>
              <div className="text-[10px] text-muted opacity-60">{session.updatedAt}</div>
            </div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSession(session.id);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-white/10"
            title="Delete Session"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// 2. Right Panel (Logs/Inspector)
const InspectorPanel = ({
  className,
  logs,
  selectedMessage
}: {
  className?: string,
  logs: typeof MOCK_LOGS,
  selectedMessage: Message | null
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'vars' | 'trace'>('logs');

  return (
    <div className={`flex flex-col h-full bg-panel border-l border-border ${className}`}>
      <div className="flex border-b border-border">
        {['logs', 'vars', 'trace'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-neon text-neon bg-neon/5'
                : 'border-transparent text-muted hover:text-platinum'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
        {activeTab === 'logs' && (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex gap-2 opacity-80 hover:opacity-100">
                <span className="text-muted shrink-0">[{log.ts}]</span>
                <span className={`${
                  log.level === 'INFO' ? 'text-neon' :
                  log.level === 'WARN' ? 'text-warning' :
                  log.level === 'ERROR' ? 'text-danger' : 'text-muted'
                } font-bold shrink-0 w-10`}>{log.level}</span>
                <span className="text-platinum break-all">{log.message}</span>
              </div>
            ))}
            <div className="h-px bg-border my-4" />
            <div className="text-neon/50 italic text-center text-[10px]">-- End of Stream --</div>
          </div>
        )}

        {activeTab === 'vars' && selectedMessage?.meta && (
          <div className="space-y-4">
             <div className="p-3 border border-border bg-void rounded-md">
                <div className="text-muted mb-2 uppercase tracking-wider text-[10px]">Inspector Context</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted">ID:</div>
                  <div className="text-right text-platinum">{selectedMessage.id}</div>
                  <div className="text-muted">Role:</div>
                  <div className="text-right text-neon">{selectedMessage.role}</div>
                  <div className="text-muted">Model:</div>
                  <div className="text-right text-platinum">{selectedMessage.meta.model}</div>
                </div>
             </div>

             <div className="p-3 border border-border bg-void rounded-md">
                <div className="text-muted mb-2 uppercase tracking-wider text-[10px]">Metrics</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted">Latency:</div>
                  <div className="text-right text-success">{selectedMessage.meta.latency}ms</div>
                  <div className="text-muted">Tokens:</div>
                  <div className="text-right text-platinum">{selectedMessage.meta.tokens}</div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'vars' && !selectedMessage && (
          <div className="text-center text-muted mt-10">Select a message to inspect variables.</div>
        )}

        {activeTab === 'trace' && (
           <div className="text-center text-muted mt-10 flex flex-col items-center gap-2">
             <Activity className="opacity-20" size={32} />
             <span>Trace visualization coming soon</span>
           </div>
        )}
      </div>
    </div>
  );
};

// 3. Provider Settings View
const ProviderSettings = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('ollama');

  return (
    <div className="flex-1 flex h-full bg-void flex-col md:flex-row overflow-hidden">
      {/* Settings Sub-sidebar */}
      <div className="w-full md:w-56 bg-panel border-r border-border flex flex-col">
        <div className="p-4 border-b border-border text-neon font-bold flex items-center gap-2">
          <Settings size={18} /> Providers
        </div>
        <nav className="p-2 space-y-1">
          {[
            { id: 'ollama', icon: HardDrive, label: 'Ollama (Local)' },
            { id: 'lmstudio', icon: Cpu, label: 'LM Studio' },
            { id: 'cloud', icon: Cloud, label: 'Cloud APIs' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as SettingsTab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-neon/10 text-neon border border-neon/20'
                  : 'text-muted hover:text-platinum hover:bg-white/5'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4 md:hidden">
          <Button onClick={onClose} variant="secondary" className="w-full">Back to Chat</Button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <h2 className="text-2xl font-bold text-platinum mb-2 flex items-center gap-2">
          {activeTab === 'ollama' && <HardDrive className="text-neon" />}
          {activeTab === 'lmstudio' && <Cpu className="text-neon" />}
          {activeTab === 'cloud' && <Cloud className="text-neon" />}
          {activeTab === 'ollama' && 'Ollama Configuration'}
          {activeTab === 'lmstudio' && 'LM Studio Configuration'}
          {activeTab === 'cloud' && 'Cloud Providers'}
        </h2>
        <p className="text-muted mb-8">Configure your connection settings below.</p>

        <div className="max-w-2xl space-y-6">
          {activeTab !== 'cloud' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-platinum">Base URL</label>
                <div className="flex gap-2">
                  <Input defaultValue={activeTab === 'ollama' ? 'http://localhost:11434' : 'http://localhost:1234'} />
                </div>
              </div>
              <div className="p-4 rounded-md border border-border bg-panel flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-success shadow-neon-sm"></div>
                   <span className="text-sm text-platinum">Service Detected</span>
                 </div>
                 <span className="text-xs font-mono text-muted">v0.1.28</span>
              </div>
              <div className="flex gap-3">
                <Button>Test Connection</Button>
                <Button variant="ghost">Reset Defaults</Button>
              </div>
            </>
          ) : (
            <>
               <div className="space-y-4">
                  {['OpenAI', 'Anthropic', 'Google Gemini'].map(p => (
                    <div key={p} className="p-4 border border-border rounded-lg bg-panel hover:border-neon/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-platinum">{p}</span>
                        <Badge type="warning">Key Required</Badge>
                      </div>
                      <Input type="password" placeholder={`Enter ${p} API Key`} className="mb-3" />
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" className="text-xs py-1">Save</Button>
                        <Button variant="ghost" className="text-xs py-1">Test</Button>
                      </div>
                    </div>
                  ))}
               </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Main App
const App = () => {
  // State
  const [currentView, setCurrentView] = useState<ViewMode>('chat');
  const [composerMode, setComposerMode] = useState<ComposerMode>('chat');
  const [isStreaming, setIsStreaming] = useState(false);

  // Panel States
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Data State
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [tabs, setTabs] = useState<{id: string, title: string}[]>([{ id: '1', title: 'TerminalTreason' }]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [sessionMessages, setSessionMessages] = useState<Record<string, Message[]>>({
    '1': MOCK_MESSAGES
  });

  // Overlay/Modal States
  const [isMobileSessionOpen, setMobileSessionOpen] = useState(false);
  const [isMobileLogsOpen, setMobileLogsOpen] = useState(false);
  const [isModelPickerOpen, setModelPickerOpen] = useState(false);
  const [isHealthOpen, setHealthOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Mock Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const toggleStreaming = () => setIsStreaming(!isStreaming);

  const handleMessageDebug = (msg: Message) => {
    setSelectedMessage(msg);
    // On mobile, this would trigger a modal, on desktop just updates state
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    setTabs([...tabs, { id: newId, title: 'New Chat' }]);
    setSessionMessages(prev => ({
      ...prev,
      [newId]: [{
        id: `sys-${newId}`,
        role: 'system',
        content: 'System initialized. Environment: Production. Ready for input.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]
    }));
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Prevent closing the last tab

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }

    // Optional: Clean up messages for closed tab
    const newMessages = { ...sessionMessages };
    delete newMessages[tabId];
    setSessionMessages(newMessages);
  };

  const initiateDeleteSession = (id: string) => {
    setDeleteCandidateId(id);
  };

  const confirmDeleteSession = () => {
    if (deleteCandidateId) {
      setSessions(prev => prev.filter(s => s.id !== deleteCandidateId));
      setDeleteCandidateId(null);
    }
  };

  const currentMessages = sessionMessages[activeTabId] || [];

  return (
    <div className="flex h-screen w-screen bg-void text-platinum overflow-hidden font-sans selection:bg-neon/30">

      {/* LEFT COLUMN (Desktop) */}
      {isLeftSidebarOpen && (
        <div className="hidden lg:block w-64 shrink-0 h-full animate-in slide-in-from-left duration-200">
          <Sidebar
            sessions={sessions}
            onNewChat={handleNewChat}
            onDeleteSession={initiateDeleteSession}
            className="h-full"
          />
          <div className="border-t border-border bg-panel p-2">
            <Button variant="ghost" onClick={() => setCurrentView('settings')} className="w-full justify-start text-muted">
              <Settings size={16} /> Providers
            </Button>
          </div>
        </div>
      )}

      {/* CENTER COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full transition-all duration-300">

        {/* HEADER */}
        <header className="h-14 border-b border-border bg-void/90 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-20">

          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => setMobileSessionOpen(true)} className="text-muted hover:text-neon">
              <Menu size={20} />
            </button>
            <div className="text-neon font-bold">TerminalTreason</div>
          </div>

          {/* Desktop Left Toggle */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
              className="text-muted hover:text-neon p-2 rounded-md hover:bg-white/5 transition-colors"
              title={isLeftSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <PanelLeft size={18} />
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            {/* Model Pill */}
            <div className="relative">
              <button
                onClick={() => setModelPickerOpen(!isModelPickerOpen)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-panel border border-border hover:border-neon hover:shadow-neon-sm transition-all group"
              >
                <span className="w-2 h-2 rounded-full bg-success shadow-neon-sm"></span>
                <span className="text-sm font-medium text-platinum group-hover:text-neon transition-colors truncate max-w-[150px] md:max-w-none">
                  <span className="hidden md:inline text-muted">Ollama • </span>Llama-3-70b
                </span>
                <ChevronDown size={14} className="text-muted group-hover:text-neon" />
              </button>

              {/* Desktop Model Dropdown */}
              {isModelPickerOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setModelPickerOpen(false)}></div>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 bg-panel border border-border rounded-lg shadow-neon z-20 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Input placeholder="Search models..." className="mb-2 text-xs" autoFocus />
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      <div className="px-2 py-1 text-[10px] text-muted uppercase">Local</div>
                      {['Llama-3-70b', 'Mistral-7b', 'Gemma-2b'].map(m => (
                        <button key={m} className="w-full text-left px-2 py-1.5 text-sm hover:bg-white/5 rounded text-platinum">{m}</button>
                      ))}
                      <div className="px-2 py-1 text-[10px] text-muted uppercase mt-2">Cloud</div>
                      {['Gemini 3 Pro', 'GPT-4o', 'Claude 3.5'].map(m => (
                        <button key={m} className="w-full text-left px-2 py-1.5 text-sm hover:bg-white/5 rounded text-platinum">{m}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Health Indicator */}
            <div className="relative ml-3 flex items-center">
               <button onClick={() => setHealthOpen(!isHealthOpen)} className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-success transition-colors">
                  <Activity size={12} />
                  <span className="hidden md:inline">24ms</span>
               </button>

               {/* Health Popover (Desktop) */}
               {isHealthOpen && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setHealthOpen(false)}></div>
                   <div className="absolute top-full mt-2 left-0 w-48 bg-panel border border-border rounded-lg shadow-neon z-20 p-3">
                      <div className="text-xs font-bold text-platinum mb-2">System Health</div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-muted"><span>Latency</span> <span className="text-success">24ms</span></div>
                        <div className="flex justify-between text-muted"><span>Uptime</span> <span className="text-platinum">99.9%</span></div>
                        <div className="flex justify-between text-muted"><span>Errors</span> <span className="text-platinum">0</span></div>
                        <Button variant="secondary" className="w-full text-[10px] mt-2 h-7">Reconnect</Button>
                      </div>
                   </div>
                 </>
               )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button onClick={() => setMobileLogsOpen(true)} className="text-muted hover:text-neon p-1">
              <Terminal size={20} />
            </button>
            <button onClick={() => setCurrentView('settings')} className="text-muted hover:text-neon p-1">
              <Settings size={20} />
            </button>
          </div>

          {/* Desktop Right Toggle */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={() => setRightSidebarOpen(!isRightSidebarOpen)}
              className="text-muted hover:text-neon p-2 rounded-md hover:bg-white/5 transition-colors"
              title={isRightSidebarOpen ? "Collapse Inspector" : "Expand Inspector"}
            >
              <PanelRight size={18} />
            </button>
          </div>
        </header>

        {/* VIEW CONTENT */}
        {currentView === 'settings' ? (
          <ProviderSettings onClose={() => setCurrentView('chat')} />
        ) : (
          /* CHAT AREA */
          <div className="flex-1 flex flex-col overflow-hidden relative">

            {/* TABS BAR (Browser-like) */}
            <div className="flex items-center px-2 pt-2 bg-void border-b border-border gap-1 overflow-x-auto no-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`
                    group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs font-medium border-t border-l border-r border-b-0 min-w-[120px] max-w-[200px] truncate transition-all relative
                    ${activeTabId === tab.id
                      ? 'bg-panel border-border text-neon'
                      : 'bg-void border-transparent text-muted hover:bg-white/5 hover:text-platinum'}
                  `}
                >
                  <span className="flex-1 text-left truncate">{tab.title}</span>
                  <span
                    onClick={(e) => closeTab(e, tab.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded-full transition-opacity text-muted hover:text-danger"
                    title="Close Tab"
                  >
                    <X size={10} />
                  </span>
                  {/* Active tab bottom overlap to merge with panel */}
                  {activeTabId === tab.id && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-panel"></div>
                  )}
                </button>
              ))}
              <button onClick={handleNewChat} className="p-1.5 text-muted hover:text-neon rounded-md hover:bg-white/5 ml-1" title="New Tab">
                <Plus size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={chatContainerRef}>
              {currentMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] group relative ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>

                    {/* Role Label */}
                    <div className="text-[10px] text-muted mb-1 flex items-center gap-2 px-1">
                      <span className={`font-bold uppercase tracking-wider ${
                        msg.role === 'assistant' || msg.role === 'system' ? 'text-neon' : 'text-success'
                      }`}>
                        {msg.role === 'assistant' ? 'TerminalTreason' : (msg.role === 'system' ? 'SYSTEM' : 'Developer')}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Bubble */}
                    <div className={`
                      relative p-4 rounded-lg text-sm leading-relaxed border
                      ${msg.role === 'user'
                        ? 'bg-panel2 border-border text-platinum rounded-tr-sm'
                        : 'bg-void border-border text-platinum shadow-lg rounded-tl-sm'}
                    `}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Message Actions (Desktop & Mobile) */}
                      {msg.role === 'assistant' && (
                        <div className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                          <button
                            onClick={() => handleMessageDebug(msg)}
                            className="p-1 text-muted hover:text-neon hover:bg-white/5 rounded"
                            title="Inspect Message"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex justify-start">
                   <div className="bg-void border border-border p-3 rounded-lg flex items-center gap-2">
                     <span className="w-2 h-2 bg-neon rounded-full animate-pulse"></span>
                     <span className="text-xs text-neon font-mono">AI IS THINKING...</span>
                   </div>
                </div>
              )}
              <div className="h-12" /> {/* Spacer */}
            </div>

            {/* COMPOSER */}
            <div className="p-4 bg-void border-t border-border z-10">
               <div className="max-w-4xl mx-auto flex flex-col gap-2">

                 {/* Streaming Controls */}
                 {isStreaming && (
                   <div className="flex justify-center md:justify-start gap-3 mb-2 animate-in slide-in-from-bottom-2 fade-in">
                     <Button variant="danger" onClick={toggleStreaming} className="shadow-neon-sm">
                       <StopCircle size={16} /> Stop Generating
                     </Button>
                     <Button variant="secondary">
                       <RefreshCw size={16} /> Regenerate
                     </Button>
                   </div>
                 )}

                 <div className="relative flex items-end gap-2 bg-panel border border-border rounded-xl p-2 focus-within:border-neon focus-within:shadow-neon transition-all">
                    <button
                      onClick={() => setComposerMode(composerMode === 'chat' ? 'command' : 'chat')}
                      className={`p-2 rounded-lg transition-colors shrink-0 ${composerMode === 'command' ? 'text-success bg-success/10' : 'text-neon bg-neon/10'}`}
                      title="Toggle Mode"
                    >
                      {composerMode === 'command' ? <Terminal size={20} /> : <MessageSquare size={20} />}
                    </button>

                    <textarea
                      placeholder={composerMode === 'command' ? "Enter system command..." : "Type a message..."}
                      className="w-full bg-transparent border-none text-sm text-platinum placeholder-muted focus:ring-0 resize-none max-h-32 py-2"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          toggleStreaming();
                        }
                      }}
                    />

                    <button
                      onClick={toggleStreaming}
                      className={`p-2 rounded-lg transition-colors shrink-0 mb-0.5 ${isStreaming ? 'text-muted' : 'bg-neon text-white hover:bg-neon/80 shadow-neon'}`}
                    >
                      {isStreaming ? <Activity size={20} className="animate-spin" /> : <Play size={20} fill="currentColor" />}
                    </button>
                 </div>

                 <div className="flex justify-between items-center text-[10px] text-muted px-1">
                    <div className="flex gap-2">
                       <span>{composerMode === 'command' ? 'CMD MODE' : 'CHAT MODE'}</span>
                       <span className="hidden md:inline">|</span>
                       <span className="hidden md:inline">⌘ + Enter to execute</span>
                    </div>
                    <div>{isStreaming ? 'Processing...' : 'Ready'}</div>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN (Desktop) */}
      {isRightSidebarOpen && (
        <div className="hidden lg:block w-80 shrink-0 h-full animate-in slide-in-from-right duration-200">
          <InspectorPanel logs={MOCK_LOGS} selectedMessage={selectedMessage} className="h-full" />
        </div>
      )}

      {/* --- MOBILE OVERLAYS --- */}

      {/* 1. Session Drawer */}
      {isMobileSessionOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => setMobileSessionOpen(false)} />
          <div className="absolute top-0 bottom-0 left-0 w-4/5 max-w-sm bg-panel border-r border-border shadow-2xl animate-in slide-in-from-left duration-200">
             <div className="p-4 flex justify-between items-center border-b border-border">
                <span className="text-neon font-bold">Sessions</span>
                <button onClick={() => setMobileSessionOpen(false)}><X size={20} className="text-muted" /></button>
             </div>
             <div className="h-full pb-20 overflow-y-auto">
               <Sidebar sessions={sessions} onNewChat={handleNewChat} onDeleteSession={initiateDeleteSession} className="border-none" />
             </div>
          </div>
        </div>
      )}

      {/* 2. Logs Sheet */}
      {isMobileLogsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
           <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => setMobileLogsOpen(false)} />
           <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-panel border-t border-border rounded-t-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-center p-2">
                 <div className="w-12 h-1 bg-border rounded-full" />
              </div>
              <div className="p-4 border-b border-border flex justify-between items-center">
                 <span className="font-bold text-platinum flex items-center gap-2"><Terminal size={16} /> Logs & Inspector</span>
                 <button onClick={() => setMobileLogsOpen(false)}><X size={20} className="text-muted" /></button>
              </div>
              <div className="flex-1 overflow-hidden">
                 <InspectorPanel logs={MOCK_LOGS} selectedMessage={selectedMessage} className="border-none bg-transparent" />
              </div>
           </div>
        </div>
      )}

      {/* 3. Message Debug Modal (Mobile) */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-void/90 backdrop-blur-md" onClick={() => setSelectedMessage(null)} />
           <div className="relative bg-panel border border-border w-full max-w-sm rounded-xl shadow-neon p-4 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-neon font-bold text-sm uppercase">Message Debug</span>
                 <button onClick={() => setSelectedMessage(null)}><X size={18} className="text-muted" /></button>
              </div>

              <div className="space-y-3 text-sm">
                 <div className="grid grid-cols-2 gap-2 p-2 bg-void/50 rounded border border-border">
                    <span className="text-muted">ID</span>
                    <span className="text-right font-mono text-platinum">{selectedMessage.id}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2 p-2 bg-void/50 rounded border border-border">
                    <span className="text-muted">Model</span>
                    <span className="text-right text-platinum">{selectedMessage.meta?.model || 'N/A'}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2 p-2 bg-void/50 rounded border border-border">
                    <span className="text-muted">Latency</span>
                    <span className="text-right text-success">{selectedMessage.meta?.latency}ms</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2 p-2 bg-void/50 rounded border border-border">
                    <span className="text-muted">Provider</span>
                    <span className="text-right text-neon">{selectedMessage.meta?.provider || 'Unknown'}</span>
                 </div>
              </div>

              <Button onClick={() => setSelectedMessage(null)} className="w-full mt-4">Close Inspector</Button>
           </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal (Centered) */}
      {deleteCandidateId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => setDeleteCandidateId(null)} />
           <div className="relative bg-panel border border-border rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4 text-platinum">
                <div className="p-2 bg-danger/10 rounded-full text-danger border border-danger/20">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold">Delete Chat?</h3>
              </div>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                This action cannot be undone. Are you sure you want to permanently delete this session?
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setDeleteCandidateId(null)}>Cancel</Button>
                <Button variant="danger" onClick={confirmDeleteSession}>Delete Session</Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;
import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext.tsx';
import { ApiService, getMockMode } from '../services/api.ts';
import { StorageService, generateId } from '../services/storage.ts';
import { ChatMessage } from '../types.ts';
import { MessageSquare, X, Send, Cpu, Sparkles, ChevronDown, Minimize2, AlertCircle, ShieldCheck, PanelRightOpen, PanelRightClose, Copy, Check, ArrowLeftFromLine } from 'lucide-react';

interface BrandAssistantProps {
  isStudioMode: boolean;
  toggleStudioMode: () => void;
}

export const BrandAssistant: React.FC<BrandAssistantProps> = ({ isStudioMode, toggleStudioMode }) => {
  const { brandPolicy, protocols, injectionHandler } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProtocolId, setActiveProtocolId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Status Check
  const apiKey = StorageService.getApiKey();
  const isMock = getMockMode() || !apiKey;

  const activeProtocol = protocols.find(p => p.id === activeProtocolId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0) {
        setMessages([{
            id: 'init',
            role: 'model',
            content: 'Brand-Width Intelligence initialized. I am grounded in your Brand Vault. How can I assist with your engineering?',
            timestamp: Date.now()
        }]);
    }
  }, []);

  // Force open if docked
  useEffect(() => {
      if (isStudioMode && !isOpen) {
          setIsOpen(true);
      }
  }, [isStudioMode]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: inputValue,
        timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Format Protocols for Context
    const protocolList = protocols.map(p => `
    Protocol ID: ${p.id}
    Protocol Name: ${p.name}
    Trigger: ${p.intent_triggers?.join(', ') || 'Manual Selection'}
    Execution Logic: ${p.execution_logic}
    `).join('\n---\n');

    // Prepare Context from Brand Policy & Protocols
    const context = `
    You are the Brand-Width AI, a specialized marketing engineer.
    You strictly adhere to the following Brand Policy:

    PILLARS: ${brandPolicy.pillars.join(', ')}
    TONE RULES: ${brandPolicy.toneRules.join(', ')}
    BANNED TERMS (Replace key with value): ${JSON.stringify(brandPolicy.bannedTerms)}
    PREFERRED TERMS: ${brandPolicy.preferredTerms.join(', ')}
    DOs: ${brandPolicy.doAndDonts.do.join(', ')}
    DONTs: ${brandPolicy.doAndDonts.dont.join(', ')}

    ### OPERATIONAL PROTOCOLS
    The following workflows are available for execution.
    CRITICAL INSTRUCTION: If you decide to use one of these protocols based on the user's request, you MUST call the 'report_active_protocol' function with the corresponding Protocol ID before generating your response.

    ${protocolList}

    Your goal is to assist the user in building high-fidelity marketing assets.
    Be concise, structural, and authoritative.
    `;

    // Prepare History
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
    }));

    try {
        const responseText = await ApiService.chatWithBrandAgent({
            history,
            message: userMsg.content,
            context,
            thinking: isThinkingMode,
            onProtocolDetected: (pid) => setActiveProtocolId(pid)
        });

        const botMsg: ChatMessage = {
            id: generateId(),
            role: 'model',
            content: responseText || "System Error: No response received.",
            timestamp: Date.now(),
            isThinking: isThinkingMode && !isMock // Only show thinking indicator if truly active
        };
        setMessages(prev => [...prev, botMsg]);
    } catch (e) {
        setMessages(prev => [...prev, {
            id: generateId(),
            role: 'model',
            content: "Error executing protocol. Please check connectivity.",
            timestamp: Date.now()
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInject = (text: string) => {
      if (injectionHandler) {
          injectionHandler(text);
      }
  };

  const handleMinimize = () => {
      setIsOpen(false);
      // If we are minimizing while docked, we must undock to avoid leaving an empty column
      if (isStudioMode) {
          toggleStudioMode();
      }
  };

  return (
    <>
        {/* Toggle Button (Only when Closed AND Not Docked) */}
        {/* If Docked is true, isOpen is forced true effectively, so this button hides. */}
        {/* If Docked is false, and Closed, show this. */}
        {!isOpen && !isStudioMode && (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-cloudy-sky-500 hover:bg-cloudy-sky-400 text-white rounded-full shadow-[0_0_20px_rgba(50,122,205,0.4)] flex items-center justify-center z-50 transition-all transform hover:scale-110 animate-fade-in"
            >
                <Sparkles size={24} fill="currentColor" className="text-white"/>
            </button>
        )}

        {/* Chat Window */}
        {isOpen && (
            <div className={`
                flex flex-col z-50 overflow-hidden bg-graphite-900
                ${isStudioMode
                    ? 'relative w-[450px] h-full border-l border-white/5 shrink-0 transition-all duration-300'
                    : 'fixed bottom-6 right-6 w-[400px] h-[600px] border border-azure-mist-50/10 rounded-2xl shadow-2xl animate-slide-up ring-1 ring-white/10'
                }
            `}>

                {/* Header */}
                <div className="bg-gradient-to-r from-graphite-800 to-graphite-900 p-4 border-b border-white/5 flex flex-col gap-2 shrink-0 transition-all">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border ${isMock ? 'bg-graphite-700/50 border-white/10' : 'bg-cloudy-sky-500/10 border-cloudy-sky-500/20'}`}>
                                <Cpu size={18} className={isMock ? 'text-graphite-400' : 'text-cloudy-sky-400'}/>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-azure-mist-50 tracking-wide">Brand Agent</h3>
                                <div className="flex items-center gap-1">
                                    {isMock ? (
                                        <>
                                            <AlertCircle size={10} className="text-yellow-500"/>
                                            <p className="text-[10px] text-yellow-500/80 font-mono">MOCK MODE // OFFLINE</p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-1.5 h-1.5 bg-mint-leaf-500 rounded-full animate-pulse"></span>
                                            <p className="text-[10px] text-graphite-400">Online // gemini-3-pro</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={toggleStudioMode}
                                className={`p-2 rounded-lg transition-colors ${isStudioMode ? 'text-cloudy-sky-400 bg-cloudy-sky-500/10' : 'text-graphite-400 hover:text-white hover:bg-white/5'}`}
                                title={isStudioMode ? "Undock (Float)" : "Dock to Side (Studio Mode)"}
                            >
                                {isStudioMode ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                            </button>
                            <button
                                onClick={handleMinimize}
                                className="p-2 text-graphite-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                title="Minimize"
                            >
                                <Minimize2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Protocol Status Indicator */}
                    {activeProtocol && (
                        <div className="bg-mint-leaf-500/10 border border-mint-leaf-500/20 rounded-md p-2 flex items-center justify-between animate-fade-in">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <ShieldCheck size={14} className="text-mint-leaf-500 shrink-0"/>
                                <span className="text-xs font-bold text-mint-leaf-400 truncate tracking-wide">
                                    PROTOCOL: {activeProtocol.name}
                                </span>
                            </div>
                            <span className="text-[9px] text-mint-leaf-500/70 font-mono uppercase">ACTIVE</span>
                        </div>
                    )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-graphite-950/50 custom-scrollbar">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                group relative max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                                ${msg.role === 'user'
                                    ? 'bg-cloudy-sky-500/10 border border-cloudy-sky-500/20 text-azure-mist-50 rounded-tr-none'
                                    : 'bg-graphite-800 border border-white/5 text-graphite-200 rounded-tl-none shadow-sm pr-8'
                                }
                            `}>
                                {msg.isThinking && (
                                    <div className="text-[10px] font-mono text-cloudy-sky-400 mb-2 flex items-center gap-1 opacity-70">
                                        <Cpu size={10} /> DEEP THINKING
                                    </div>
                                )}
                                {msg.content}

                                {/* Actions for Model Messages */}
                                {msg.role === 'model' && (
                                    <div className={`absolute top-2 right-2 flex gap-1 transition-opacity ${injectionHandler ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {/* Inject Button - Only if handler exists */}
                                        {injectionHandler && (
                                            <button
                                                onClick={() => handleInject(msg.content)}
                                                className="p-1 text-mint-leaf-500 hover:text-white hover:bg-mint-leaf-500/20 rounded transition-colors"
                                                title="Inject Draft to Editor"
                                            >
                                                <ArrowLeftFromLine size={12}/>
                                            </button>
                                        )}

                                        {/* Copy Button */}
                                        <button
                                            onClick={() => copyToClipboard(msg.content, msg.id)}
                                            className="p-1 text-graphite-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                                            title="Copy to Clipboard"
                                        >
                                            {copiedId === msg.id ? <Check size={12} className="text-mint-leaf-500"/> : <Copy size={12}/>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                            <div className="bg-graphite-800 border border-white/5 text-graphite-400 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                                <Sparkles size={12} className="animate-spin text-cloudy-sky-400"/>
                                {isThinkingMode ? 'Thinking deeply...' : 'Processing...'}
                            </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer / Input */}
                <div className="p-4 bg-graphite-900 border-t border-white/5 shrink-0 space-y-3">
                    {/* Thinking Toggle */}
                    <div className="flex items-center gap-2">
                         <label className="flex items-center gap-2 cursor-pointer group">
                             <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isThinkingMode ? 'bg-cloudy-sky-500' : 'bg-graphite-700'}`}>
                                 <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${isThinkingMode ? 'translate-x-4' : ''}`}></div>
                             </div>
                             <input type="checkbox" className="hidden" checked={isThinkingMode} onChange={e => setIsThinkingMode(e.target.checked)} />
                             <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isThinkingMode ? 'text-cloudy-sky-400' : 'text-graphite-500 group-hover:text-graphite-400'}`}>
                                 Thinking Mode
                             </span>
                         </label>
                    </div>

                    <div className="relative">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Ask about strategy, copy, or protocol..."
                            className="w-full bg-graphite-950 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-azure-mist-50 focus:border-cloudy-sky-500 focus:ring-1 focus:ring-cloudy-sky-500/20 outline-none resize-none h-[50px] custom-scrollbar"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 top-2 p-1.5 bg-cloudy-sky-500 hover:bg-cloudy-sky-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-graphite-700"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};
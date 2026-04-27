export interface Session {
  id: string;
  title: string;
  updatedAt: string;
  tags?: string[];
  folder?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  meta?: {
    provider: string;
    model: string;
    tokens: number;
    latency: number;
  };
}

export interface LogEntry {
  id: string;
  ts: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}

export interface ProviderStatus {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  latency: number;
}

export type ViewMode = 'chat' | 'settings';
export type ComposerMode = 'chat' | 'command';
export type SettingsTab = 'ollama' | 'lmstudio' | 'cloud';

export interface AppState {
  currentView: ViewMode;
  activeSessionId: string;
  isStreaming: boolean;

  // Mobile/Overlay States
  isMobileSessionOpen: boolean;
  isMobileLogsOpen: boolean;
  isModelPickerOpen: boolean;
  isHealthOpen: boolean;

  // Selection
  selectedMessageId: string | null; // For debug inspector
}
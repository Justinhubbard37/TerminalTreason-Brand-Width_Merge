import { Session, Message, LogEntry, ProviderStatus } from './types';

export const MOCK_SESSIONS: Session[] = [
  { id: '1', title: 'Refactoring Auth Service', updatedAt: '10:42 AM', tags: ['dev', 'refactor'] },
  { id: '2', title: 'Python Data Analysis', updatedAt: 'Yesterday', folder: 'Work' },
  { id: '3', title: 'Creative Writing: Sci-Fi', updatedAt: '2 days ago', folder: 'Personal' },
  { id: '4', title: 'React Component Config', updatedAt: 'Last week' },
  { id: '5', title: 'Kubernetes Deployment', updatedAt: 'Last week', tags: ['devops'] },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    role: 'system',
    content: 'System initialized. Environment: Production. Ready for input.',
    timestamp: '10:41 AM'
  },
  {
    id: 'm2',
    role: 'user',
    content: 'I need to see a preview of how the message bubbles would look. Let\'s use Platinum White for the text and Charcoal Grey for secondary elements like timestamps.',
    timestamp: '10:42 AM'
  },
  {
    id: 'm3',
    role: 'assistant',
    content: 'That combination provides excellent contrast.\n\n```css\n.chat-bubble {\n  background: #2776EA;\n  color: #F5F0F0;\n}\n```\n\nI have updated the design tokens accordingly.',
    timestamp: '10:42 AM',
    meta: {
      provider: 'Ollama',
      model: 'Llama-3-70b',
      tokens: 142,
      latency: 240
    }
  }
];

export const MOCK_LOGS: LogEntry[] = [
  { id: 'l1', ts: '10:41:02', level: 'INFO', message: 'Initializing core-module...' },
  { id: 'l2', ts: '10:41:05', level: 'WARN', message: 'Deprecated API call detected in router.ts' },
  { id: 'l3', ts: '10:42:15', level: 'INFO', message: 'State hydration triggered by AI agent' },
  { id: 'l4', ts: '10:43:00', level: 'DEBUG', message: 'Simulating buffer sync: { status: 200 }' },
];

export const PROVIDERS: ProviderStatus[] = [
  { id: 'local', name: 'Ollama', status: 'connected', latency: 12 },
  { id: 'cloud', name: 'Gemini Pro', status: 'connected', latency: 145 },
];
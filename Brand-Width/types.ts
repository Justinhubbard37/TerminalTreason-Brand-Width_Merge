

// Domain Types

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface BrandPolicy {
  pillars: string[];
  toneRules: string[];
  bannedTerms: Record<string, string>; // term -> replacement
  preferredTerms: string[];
  ctaStyle: string;
  doAndDonts: { do: string[], dont: string[] };
}

export interface Protocol {
  id: string;
  name: string;
  intent_triggers: string[];
  system_role: string;
  execution_logic: string;
}

export interface Source {
  id: string;
  url: string;
  title: string;
  snippet: string;
  tags: string[];
  timestamp: number;
}

export interface Brief {
  id: string;
  title: string;
  content: string;
  type: 'evidence' | 'opportunity';
  sourcesCited: string[]; // IDs
  createdAt: number;
}

export interface Lead {
  id: string;
  company: string;
  site: string;
  niche: string;
  painSignal: string;
  contactChannels: string;
  notes: string;
  score: number;
  evidenceLinks: string[];
  status: 'new' | 'scored' | 'drafted' | 'archived';
  createdAt: number;
}

export interface OutreachDraft {
  id: string;
  leadId: string;
  type: 'email' | 'linkedin' | 'followup';
  content: string;
  complianceScore: number;
  flags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatterSignal {
  id: string;
  source: string;
  content: string;
  timestamp: number;
  clusterId?: string;
}

export interface OpportunityCluster {
  id: string;
  name: string;
  problem: string;
  frequency: 'low' | 'medium' | 'high';
  intensity: 'low' | 'medium' | 'high';
  existingSolutions: string;
  signals: string[]; // Signal IDs
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  url: string; // Base64 or Blob URL
  createdAt: number;
  meta: Record<string, any>;
}

// API Types

export interface RunnerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LLMRequest {
  task: string;
  context?: string;
  constraints?: string; // Stringified BrandPolicy constraints
  projectId: string;
}

export interface SearchRequest {
  query: string;
  recency_days?: number;
  sources?: string[];
  projectId: string;
}

export interface LeadFindRequest {
  query: string;
  filters: Record<string, any>;
  projectId: string;
}

export interface LeadScoreRequest {
  lead: Partial<Lead>;
  rubric: string;
  projectId: string;
}

export interface ChatterMineRequest {
  query: string;
  sources?: string[];
  recency_days?: number;
  projectId: string;
}

export type View = 'vault' | 'growth' | 'assets' | 'settings';
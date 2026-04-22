import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Project, BrandPolicy, Protocol, Source, Lead, Brief,
  OutreachDraft, OpportunityCluster, GeneratedAsset
} from '../types.ts';
import { StorageService, generateId } from '../services/storage.ts';
import { ApiService } from '../services/api.ts';
import { DEFAULT_BRAND_POLICY } from '../constants.ts';

interface ProjectContextType {
  projectId: string | null;

  // Data State
  leads: Lead[];
  sources: Source[];
  briefs: Brief[];
  drafts: OutreachDraft[];
  opportunities: OpportunityCluster[];
  protocols: Protocol[];
  brandPolicy: BrandPolicy;
  assets: GeneratedAsset[];

  // Actions
  refreshData: () => void;
  updatePolicy: (policy: BrandPolicy) => void;
  updateProtocols: (protocols: Protocol[]) => void;

  // Entity Actions
  saveSource: (source: Source) => void;
  saveBrief: (brief: Brief) => void;
  saveLead: (lead: Lead) => void;
  saveDraft: (draft: OutreachDraft) => void;
  saveOpportunity: (opp: OpportunityCluster) => void;
  saveOpportunities: (opps: OpportunityCluster[]) => void;
  saveAsset: (asset: GeneratedAsset) => void;

  // API Actions
  findLeads: (query: string) => Promise<void>;
  scoreLead: (lead: Lead) => Promise<void>;
  searchSources: (query: string) => Promise<Source[]>;
  generateBrief: () => Promise<void>;
  generateDraftContent: (leadId: string, protocolId?: string) => Promise<string | null>;
  mineOpportunities: (query: string) => Promise<void>;

  // UI/UX States
  injectionHandler: ((text: string) => void) | null;
  setInjectionHandler: (handler: ((text: string) => void) | null) => void;

  // Loading States
  isBusy: {
    leads: boolean;
    search: boolean;
    brief: boolean;
    draft: boolean;
    mining: boolean;
  }
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  projectId: string | null;
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ projectId, children }) => {
  const [brandPolicy, setBrandPolicy] = useState<BrandPolicy>(DEFAULT_BRAND_POLICY);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityCluster[]>([]);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);

  // Active Injection Handler (for Studio Mode)
  const [injectionHandler, setInjectionHandler] = useState<((text: string) => void) | null>(null);

  const [isBusy, setIsBusy] = useState({
    leads: false,
    search: false,
    brief: false,
    draft: false,
    mining: false
  });

  const refreshData = useCallback(() => {
    if (!projectId) return;
    setBrandPolicy(StorageService.getBrandPolicy(projectId));
    setProtocols(StorageService.getProtocols(projectId));
    setLeads(StorageService.getLeads(projectId));
    setSources(StorageService.getSources(projectId));
    setBriefs(StorageService.getBriefs(projectId));
    setDrafts(StorageService.getDrafts(projectId));
    setOpportunities(StorageService.getOpportunities(projectId));
    setAssets(StorageService.getAssets(projectId));
  }, [projectId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // -- Actions --

  const updatePolicy = (policy: BrandPolicy) => {
    if (!projectId) return;
    setBrandPolicy(policy);
    StorageService.saveBrandPolicy(projectId, policy);
  };

  const updateProtocols = (newProtocols: Protocol[]) => {
    if (!projectId) return;
    setProtocols(newProtocols);
    StorageService.saveProtocols(projectId, newProtocols);
  };

  const saveSource = (source: Source) => {
    if (!projectId) return;
    StorageService.saveSource(projectId, source);
    setSources(prev => [source, ...prev]);
  };

  const saveBrief = (brief: Brief) => {
      if (!projectId) return;
      StorageService.saveBrief(projectId, brief);
      setBriefs(prev => [brief, ...prev]);
  };

  const saveLead = (lead: Lead) => {
    if (!projectId) return;
    StorageService.saveLead(projectId, lead);
    setLeads(prev => {
        const idx = prev.findIndex(l => l.id === lead.id);
        if (idx >= 0) {
            const newLeads = [...prev];
            newLeads[idx] = lead;
            return newLeads;
        }
        return [lead, ...prev];
    });
  };

  const saveDraft = (draft: OutreachDraft) => {
    if (!projectId) return;
    StorageService.saveDraft(projectId, draft);
    setDrafts(prev => {
        const idx = prev.findIndex(d => d.id === draft.id);
        if (idx >= 0) {
            const newDrafts = [...prev];
            newDrafts[idx] = draft;
            return newDrafts;
        }
        return [draft, ...prev];
    });
  };

  const saveOpportunity = (opp: OpportunityCluster) => {
      if (!projectId) return;
      StorageService.saveOpportunity(projectId, opp);
      setOpportunities(prev => [opp, ...prev]);
  };

  const saveOpportunities = (newOpps: OpportunityCluster[]) => {
      if (!projectId || newOpps.length === 0) return;
      StorageService.saveOpportunities(projectId, newOpps);
      setOpportunities(prev => {
          const reversedNewOpps = [...newOpps].reverse();
          return [...reversedNewOpps, ...prev];
      });
  };

  const saveAsset = (asset: GeneratedAsset) => {
      if (!projectId) return;
      StorageService.saveAsset(projectId, asset);
      setAssets(prev => {
          const newAssets = [asset, ...prev];
          // Mirror limit from storage service for UI consistency
          if (newAssets.length > 10) newAssets.pop();
          return newAssets;
      });
  };

  // -- API Wrappers --

  const findLeads = async (query: string) => {
    if (!projectId) return;
    setIsBusy(prev => ({ ...prev, leads: true }));
    const res = await ApiService.findLeads({ query, filters: {}, projectId });
    setIsBusy(prev => ({ ...prev, leads: false }));

    if (res.success && res.data) {
        const newLeads = res.data.map(l => ({
            ...l,
            id: generateId(),
            score: 0,
            status: 'new',
            createdAt: Date.now()
        } as Lead));
        newLeads.forEach(l => StorageService.saveLead(projectId, l));
        setLeads(prev => [...newLeads, ...prev]);
    } else {
        throw new Error(res.error || 'Failed to find leads');
    }
  };

  const scoreLead = async (lead: Lead) => {
      if (!projectId) return;
      // Optimistic update could go here, but for now we wait
      const res = await ApiService.scoreLead({
          lead,
          rubric: "Score based on: Fit (tech stack), Urgency (complaints), Sovereignty Alignment (anti-vendor lock-in).",
          projectId
      });

      if (res.success && res.data) {
          const updatedLead: Lead = {
              ...lead,
              score: res.data.score,
              notes: lead.notes + '\n\nSCORING: ' + res.data.notes,
              status: 'scored'
          };
          saveLead(updatedLead);
      } else {
          throw new Error(res.error || 'Failed to score lead');
      }
  };

  const searchSources = async (query: string) => {
      if (!projectId) return [];
      setIsBusy(prev => ({ ...prev, search: true }));
      const res = await ApiService.search({ query, projectId });
      setIsBusy(prev => ({ ...prev, search: false }));

      if (res.success && res.data) {
          return res.data;
      } else {
          throw new Error(res.error || 'Search failed');
      }
  };

  const generateBrief = async () => {
      if (!projectId || sources.length === 0) throw new Error("No sources");
      setIsBusy(prev => ({ ...prev, brief: true }));

      const context = sources.map(s => `SOURCE: ${s.title} (${s.url})\n"${s.snippet}"`).join('\n\n');
      const res = await ApiService.generate({
          task: "Generate an Evidence-Backed Research Brief summarizing these findings. Focus on structural shifts and facts. Cite sources explicitly.",
          context: context,
          constraints: JSON.stringify(brandPolicy),
          projectId
      });

      setIsBusy(prev => ({ ...prev, brief: false }));

      if (res.success && res.data) {
          const newBrief: Brief = {
              id: generateId(),
              title: `Brief: ${new Date().toLocaleDateString()}`,
              content: res.data,
              type: 'evidence',
              sourcesCited: sources.map(s => s.id),
              createdAt: Date.now()
          };
          saveBrief(newBrief);
      } else {
          throw new Error(res.error);
      }
  };

  const generateDraftContent = async (leadId: string, protocolId?: string) => {
      if (!projectId) return null;
      const lead = leads.find(l => l.id === leadId);
      const protocol = protocols.find(p => p.id === protocolId);
      if (!lead) return null;

      setIsBusy(prev => ({ ...prev, draft: true }));

      let task = `Write a cold outreach email to ${lead.company} regarding ${lead.painSignal}.`;
      if (protocol) {
          task = `Execute Protocol: ${protocol.name}. \nLogic: ${protocol.execution_logic}. \nContext: Target is ${lead.company} facing ${lead.painSignal}.`;
      }

      const res = await ApiService.generate({
          task,
          constraints: JSON.stringify(brandPolicy),
          projectId,
          context: `Lead Notes: ${lead.notes}`
      });

      setIsBusy(prev => ({ ...prev, draft: false }));

      if (res.success && res.data) {
          return res.data;
      }
      return null;
  };

  const mineOpportunities = async (query: string) => {
      if (!projectId) return;
      setIsBusy(prev => ({ ...prev, mining: true }));
      const res = await ApiService.mineChatter({ query, projectId });
      setIsBusy(prev => ({ ...prev, mining: false }));

      if (res.success && res.data) {
          const newOpps = res.data.map(opp => ({ ...opp, id: generateId() }));
          saveOpportunities(newOpps);
      } else {
          throw new Error(res.error);
      }
  };

  return (
    <ProjectContext.Provider value={{
      projectId,
      leads,
      sources,
      briefs,
      drafts,
      opportunities,
      protocols,
      brandPolicy,
      assets,
      refreshData,
      updatePolicy,
      updateProtocols,
      saveSource,
      saveBrief,
      saveLead,
      saveDraft,
      saveOpportunity,
      saveOpportunities,
      saveAsset,
      findLeads,
      scoreLead,
      searchSources,
      generateBrief,
      generateDraftContent,
      mineOpportunities,
      injectionHandler,
      setInjectionHandler,
      isBusy
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
import { Project, BrandPolicy, Source, Lead, OutreachDraft, Brief, Protocol, OpportunityCluster, GeneratedAsset } from '../types.ts';
import { DEFAULT_BRAND_POLICY } from '../constants.ts';

const DB_PREFIX = 'marketing_os_';

export const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to get/set from localStorage (simulating DB for MVP complexity)
// In a real high-volume app, we'd use IndexedDB (idb keyval)
const getStorage = <T>(key: string, defaultVal: T): T => {
  const item = localStorage.getItem(key);
  if (!item) return defaultVal;
  try {
    return JSON.parse(item);
  } catch {
    return defaultVal;
  }
};

const setStorage = <T>(key: string, val: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn("Storage Quota Exceeded or Error", e);
    // In a real app, handle quota exceeded by cleaning up old assets
  }
};

export class StorageService {
  // Projects
  static getProjects(): Project[] {
    return getStorage<Project[]>(`${DB_PREFIX}projects`, []);
  }

  static createProject(name: string, description: string): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      id: generateId(),
      name,
      description,
      createdAt: Date.now(),
    };
    projects.push(newProject);
    setStorage(`${DB_PREFIX}projects`, projects);

    // Initialize default policy for new project
    this.saveBrandPolicy(newProject.id, DEFAULT_BRAND_POLICY);

    return newProject;
  }

  // Brand Policy
  static getBrandPolicy(projectId: string): BrandPolicy {
    return getStorage<BrandPolicy>(`${DB_PREFIX}${projectId}_policy`, DEFAULT_BRAND_POLICY);
  }

  static saveBrandPolicy(projectId: string, policy: BrandPolicy) {
    setStorage(`${DB_PREFIX}${projectId}_policy`, policy);
  }

  // Protocols
  static getProtocols(projectId: string): Protocol[] {
    return getStorage<Protocol[]>(`${DB_PREFIX}${projectId}_protocols`, []);
  }

  static saveProtocols(projectId: string, protocols: Protocol[]) {
    setStorage(`${DB_PREFIX}${projectId}_protocols`, protocols);
  }

  // Sources
  static getSources(projectId: string): Source[] {
    return getStorage<Source[]>(`${DB_PREFIX}${projectId}_sources`, []);
  }

  static saveSource(projectId: string, source: Source) {
    const sources = this.getSources(projectId);
    sources.unshift(source);
    setStorage(`${DB_PREFIX}${projectId}_sources`, sources);
  }

  // Leads
  static getLeads(projectId: string): Lead[] {
    return getStorage<Lead[]>(`${DB_PREFIX}${projectId}_leads`, []);
  }

  static saveLead(projectId: string, lead: Lead) {
    const leads = this.getLeads(projectId);
    const existingIndex = leads.findIndex(l => l.id === lead.id);
    if (existingIndex >= 0) {
      leads[existingIndex] = lead;
    } else {
      leads.unshift(lead);
    }
    setStorage(`${DB_PREFIX}${projectId}_leads`, leads);
  }

  // Drafts
  static getDrafts(projectId: string): OutreachDraft[] {
    return getStorage<OutreachDraft[]>(`${DB_PREFIX}${projectId}_drafts`, []);
  }

  static saveDraft(projectId: string, draft: OutreachDraft) {
    const drafts = this.getDrafts(projectId);
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    if (existingIndex >= 0) {
      drafts[existingIndex] = draft;
    } else {
      drafts.unshift(draft);
    }
    setStorage(`${DB_PREFIX}${projectId}_drafts`, drafts);
  }

  // Briefs
  static getBriefs(projectId: string): Brief[] {
    return getStorage<Brief[]>(`${DB_PREFIX}${projectId}_briefs`, []);
  }

  static saveBrief(projectId: string, brief: Brief) {
    const briefs = this.getBriefs(projectId);
    briefs.unshift(brief);
    setStorage(`${DB_PREFIX}${projectId}_briefs`, briefs);
  }

  // Opportunities
  static getOpportunities(projectId: string): OpportunityCluster[] {
      return getStorage<OpportunityCluster[]>(`${DB_PREFIX}${projectId}_opps`, []);
  }

  static saveOpportunity(projectId: string, opp: OpportunityCluster) {
      const opps = this.getOpportunities(projectId);
      opps.unshift(opp);
      setStorage(`${DB_PREFIX}${projectId}_opps`, opps);
  }

  // Assets
  static getAssets(projectId: string): GeneratedAsset[] {
      return getStorage<GeneratedAsset[]>(`${DB_PREFIX}${projectId}_assets`, []);
  }

  static saveAsset(projectId: string, asset: GeneratedAsset) {
      const assets = this.getAssets(projectId);
      assets.unshift(asset);

      // Limit to last 10 items to prevent LocalStorage explosion with Base64 strings
      // In a production app, these would be uploaded to cloud storage
      if (assets.length > 10) {
        assets.pop();
      }

      setStorage(`${DB_PREFIX}${projectId}_assets`, assets);
  }

  // API Settings
  static getRunnerUrl(): string {
    return localStorage.getItem(`${DB_PREFIX}runner_url`) || 'http://127.0.0.1:3000';
  }

  static setRunnerUrl(url: string) {
    localStorage.setItem(`${DB_PREFIX}runner_url`, url);
  }

  static getApiKey(): string {
    return localStorage.getItem(`${DB_PREFIX}api_key`) || '';
  }

  static setApiKey(key: string) {
    localStorage.setItem(`${DB_PREFIX}api_key`, key);
  }

  static removeApiKey() {
    localStorage.removeItem(`${DB_PREFIX}api_key`);
  }
}
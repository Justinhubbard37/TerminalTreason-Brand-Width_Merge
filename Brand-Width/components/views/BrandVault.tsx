import React, { useState, useEffect } from 'react';
import { Protocol } from '../../types.ts';
import { useProject } from '../../contexts/ProjectContext.tsx';
import { generateId } from '../../services/storage.ts';
import { Save, AlertTriangle, Upload, Plus, X, ArrowRight, Shield, Cpu, Trash2, AlertCircle, Database, Edit2, FileCode, ArrowLeftFromLine, Download } from 'lucide-react';

interface BrandVaultProps {
  projectId: string;
}

const BrandVault: React.FC<BrandVaultProps> = ({ projectId }) => {
  const { brandPolicy, protocols, updatePolicy, updateProtocols, setInjectionHandler } = useProject();
  const [activeTab, setActiveTab] = useState<'policy' | 'protocols'>('policy');

  // State for the new "Tactical Input Band"
  const [newBanned, setNewBanned] = useState('');
  const [newReplacement, setNewReplacement] = useState('');

  // Protocol Editor State
  const [editingProtocolId, setEditingProtocolId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<{name: string, triggers: string, logic: string}>({
      name: '', triggers: '', logic: ''
  });

  // Unified Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
      isOpen: boolean;
      type: 'protocol' | 'term' | null;
      id: string | null; // For terms, this is the key (banned term)
  }>({ isOpen: false, type: null, id: null });

  // Register Injection Handler when editor is active
  useEffect(() => {
      if (editingProtocolId !== null) {
          // Allow AI to inject directly into the Logic field
          setInjectionHandler((text: string) => {
              setEditorState(prev => {
                  // Append to bottom if text exists, otherwise set text
                  const newLogic = prev.logic ? `${prev.logic}\n\n${text}` : text;
                  return { ...prev, logic: newLogic };
              });
          });
      } else {
          setInjectionHandler(null);
      }
      return () => setInjectionHandler(null);
  }, [editingProtocolId, setInjectionHandler]);

  const handleSavePolicy = () => {
    updatePolicy(brandPolicy);
    alert('Policy updated in local vault.');
  };

  const handleExportVault = () => {
    const vaultData = {
        meta: {
            projectId,
            exportedAt: Date.now(),
            version: '1.0'
        },
        policy: brandPolicy,
        protocols: protocols
    };

    const data = JSON.stringify(vaultData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brand_vault_export_${projectId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddTerm = () => {
      if (!newBanned.trim()) return;
      const updatedTerms = { ...brandPolicy.bannedTerms, [newBanned.trim()]: newReplacement.trim() };
      const newPolicy = { ...brandPolicy, bannedTerms: updatedTerms };
      updatePolicy(newPolicy);
      setNewBanned('');
      setNewReplacement('');
  };

  const requestDeleteTerm = (term: string) => {
      setDeleteModal({ isOpen: true, type: 'term', id: term });
  };

  const requestDeleteProtocol = (protocolId: string) => {
      setDeleteModal({ isOpen: true, type: 'protocol', id: protocolId });
  };

  const confirmDelete = () => {
      if (deleteModal.type === 'protocol' && deleteModal.id) {
          const updatedProtocols = protocols.filter(p => p.id !== deleteModal.id);
          updateProtocols(updatedProtocols);
      } else if (deleteModal.type === 'term' && deleteModal.id) {
          const updatedTerms = { ...brandPolicy.bannedTerms };
          delete updatedTerms[deleteModal.id];
          const newPolicy = { ...brandPolicy, bannedTerms: updatedTerms };
          updatePolicy(newPolicy);
      }
      setDeleteModal({ isOpen: false, type: null, id: null });
  };

  const cancelDelete = () => {
      setDeleteModal({ isOpen: false, type: null, id: null });
  };

  // Protocol CRUD
  const startCreateProtocol = () => {
      setEditingProtocolId('new');
      setEditorState({ name: '', triggers: '', logic: '' });
  };

  const startEditProtocol = (p: Protocol) => {
      setEditingProtocolId(p.id);
      setEditorState({
          name: p.name,
          triggers: p.intent_triggers.join(', '),
          logic: p.execution_logic
      });
  };

  const saveProtocol = () => {
      if (!editorState.name.trim()) return;

      const newProtocol: Protocol = {
          id: editingProtocolId === 'new' ? generateId() : editingProtocolId!,
          name: editorState.name,
          intent_triggers: editorState.triggers.split(',').map(t => t.trim()).filter(Boolean),
          system_role: 'Architect', // Default for now
          execution_logic: editorState.logic
      };

      let updated;
      if (editingProtocolId === 'new') {
          updated = [...protocols, newProtocol];
      } else {
          updated = protocols.map(p => p.id === editingProtocolId ? newProtocol : p);
      }

      updateProtocols(updated);
      setEditingProtocolId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
          const imported = JSON.parse(text);
          // Handle both full vault export and simple JSONL-style protocol list
          if (imported.protocols && Array.isArray(imported.protocols)) {
             // Full Vault Import
             if (confirm('Overwrite current protocols with imported vault data?')) {
                 updateProtocols(imported.protocols);
             }
             if (imported.policy && confirm('Overwrite current policy with imported vault data?')) {
                 updatePolicy(imported.policy);
             }
          } else if (Array.isArray(imported)) {
             // Simple List Import
             updateProtocols(imported);
          } else {
             // JSONL fallback
             const lines = text.split('\n');
             const parsed: Protocol[] = [];
             lines.forEach(line => {
                if (line.trim()) {
                    try { parsed.push(JSON.parse(line)); } catch(e){}
                }
             });
             if (parsed.length > 0) updateProtocols(parsed);
          }
      } catch (err) {
          // Try JSONL if JSON parse fails
          const lines = text.split('\n');
          const parsed: Protocol[] = [];
          lines.forEach(line => {
            if (line.trim()) {
              try {
                parsed.push(JSON.parse(line));
              } catch (err) {
                console.error('Failed to parse line', line);
              }
            }
          });
          if (parsed.length > 0) {
              updateProtocols(parsed);
              alert(`Imported ${parsed.length} protocols successfully.`);
          } else {
              alert('Failed to parse file.');
          }
      }
    };
    reader.readAsText(file);
  };

  const handleSeedDefaults = () => {
    const defaults: Protocol[] = [
        {
            id: 'proto-alpha',
            name: 'Alpha Launch',
            intent_triggers: ['launch', 'alpha', 'deploy', 'go to market'],
            system_role: 'Architect',
            execution_logic: '1. Confirm objective. \n2. Assess assets against pillars. \n3. Execute release schedule.'
        },
        {
            id: 'proto-crisis',
            name: 'Crisis Comms',
            intent_triggers: ['panic', 'error', 'apology'],
            system_role: 'Sage',
            execution_logic: '1. Acknowledge fault. \n2. State corrective action. \n3. Reaffirm mission.'
        }
    ];
    updateProtocols([...protocols, ...defaults]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 relative">

      {/* Unified Custom Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-graphite-800 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100 relative">
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    <div className="p-2 bg-red-500/10 rounded-full">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                        {deleteModal.type === 'protocol' ? 'Delete Protocol?' : 'Remove Lexicon Rule?'}
                    </h3>
                </div>

                <p className="text-graphite-300 mb-8 leading-relaxed">
                    {deleteModal.type === 'protocol'
                        ? 'This action is irreversible. The protocol logic and its associated intent triggers will be permanently scrubbed from the vault.'
                        : `Are you sure you want to remove the restriction for "${deleteModal.id}"? This term will no longer be flagged in outreach drafts.`
                    }
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={cancelDelete}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-azure-mist-50 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-azure-mist-50 font-mono tracking-tight">BRAND_VAULT</h2>
                <p className="text-graphite-400 text-sm mt-1 flex items-center gap-2">
                    <Shield size={14} className="text-cloudy-sky-400"/> Governance Protocol
                    <span className="text-white/10">|</span>
                    <Cpu size={14} className="text-mint-leaf-400"/> Output Engineering
                </p>
            </div>
            <button
                onClick={handleExportVault}
                className="p-2 bg-graphite-800 hover:bg-cloudy-sky-500 hover:text-white text-graphite-400 rounded-lg border border-white/5 hover:border-cloudy-sky-500 transition-all shadow-sm"
                title="Export Vault JSON"
            >
                <Download size={20}/>
            </button>
        </div>

        {/* Floating Segmented Control */}
        <div className="flex bg-graphite-800 border border-azure-mist-50/5 rounded-lg p-1 shadow-lg">
            <button
                onClick={() => setActiveTab('policy')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    activeTab === 'policy'
                    ? 'bg-cloudy-sky-500 text-white shadow-md'
                    : 'text-graphite-300 hover:text-azure-mist-50 hover:bg-white/5'
                }`}
            >
                Policy Matrix
            </button>
            <button
                onClick={() => setActiveTab('protocols')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    activeTab === 'protocols'
                    ? 'bg-cloudy-sky-500 text-white shadow-md'
                    : 'text-graphite-300 hover:text-azure-mist-50 hover:bg-white/5'
                }`}
            >
                Protocol Library
            </button>
        </div>
      </div>

      {activeTab === 'policy' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ... Existing Policy UI ... */}
            {/* Banned Terms - Modular System */}
            <div className="lg:col-span-2 bg-graphite-800/50 backdrop-blur-sm p-6 rounded-2xl border border-azure-mist-50/5 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-mint-leaf-500/10 rounded-lg border border-mint-leaf-500/20">
                        <AlertTriangle className="w-5 h-5 text-mint-leaf-500"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-azure-mist-50">Lexicon Governance</h3>
                        <p className="text-xs text-graphite-400 uppercase tracking-widest">Enforced Constraints</p>
                    </div>
                </div>

                {/* Input Band */}
                <div className="flex flex-col md:flex-row gap-4 bg-graphite-950 p-4 rounded-xl border border-white/10 items-end mb-6">
                    <div className="flex-1 w-full space-y-1">
                        <label className="text-[10px] font-bold text-mint-leaf-500 uppercase tracking-wider ml-1">Restricted Term</label>
                        <input
                            className="w-full bg-graphite-900 border border-white/10 text-azure-mist-50 px-4 py-2.5 rounded-lg focus:border-mint-leaf-500 focus:outline-none transition-colors placeholder:text-white/20"
                            placeholder="e.g. 'magic'"
                            value={newBanned}
                            onChange={e => setNewBanned(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddTerm()}
                        />
                    </div>

                    <div className="hidden md:flex pb-3 text-white/20">
                        <ArrowRight size={20}/>
                    </div>

                    <div className="flex-1 w-full space-y-1">
                        <label className="text-[10px] font-bold text-cloudy-sky-400 uppercase tracking-wider ml-1">System Preferred</label>
                        <input
                            className="w-full bg-graphite-900 border border-white/10 text-azure-mist-50 px-4 py-2.5 rounded-lg focus:border-cloudy-sky-500 focus:outline-none transition-colors placeholder:text-white/20"
                            placeholder="e.g. 'engineering'"
                            value={newReplacement}
                            onChange={e => setNewReplacement(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddTerm()}
                        />
                    </div>

                    <button
                        onClick={handleAddTerm}
                        disabled={!newBanned}
                        className="w-full md:w-auto bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg border border-white/10 transition-all disabled:opacity-50 h-[46px] flex items-center justify-center"
                    >
                        <Plus size={20}/>
                    </button>
                </div>

                {/* Chip Grid */}
                <div className="flex flex-wrap gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(brandPolicy.bannedTerms).map(([banned, replacement]) => (
                        <div key={banned} className="group flex items-center bg-graphite-900 border border-white/5 rounded-md pl-4 pr-1 py-1 hover:border-white/20 transition-all hover:shadow-lg hover:shadow-mint-leaf-500/5 cursor-default">
                            {/* Restricted Term */}
                            <span className="text-sm font-medium mr-2 transition-colors duration-200 text-white/30 group-hover:text-mint-leaf-400">{banned}</span>

                            <ArrowRight size={12} className="text-white/20 mr-2"/>

                            {/* Preferred Term */}
                            <span className="text-sm font-bold mr-3 transition-colors duration-200 text-cloudy-sky-400 group-hover:text-white/30">{replacement}</span>

                            {/* X Button */}
                            <button
                                onClick={() => requestDeleteTerm(banned)}
                                className="p-1.5 rounded-md transition-colors duration-200 text-white/30 group-hover:text-red-500 hover:bg-white/10"
                            >
                                <X size={14}/>
                            </button>
                        </div>
                    ))}
                    {Object.keys(brandPolicy.bannedTerms).length === 0 && (
                        <div className="w-full text-center py-8 text-white/20 border-2 border-dashed border-white/5 rounded-xl">
                            No active constraints. Add terms above.
                        </div>
                    )}
                </div>
            </div>

            {/* Pillars */}
            <div className="bg-graphite-800/50 backdrop-blur-sm p-6 rounded-2xl border border-azure-mist-50/5 shadow-sm">
                <h3 className="font-bold text-azure-mist-50 mb-4 flex items-center">
                    <ShieldIcon className="w-4 h-4 mr-2 text-cloudy-sky-400"/>
                    Core Pillars
                </h3>
                <textarea
                    className="w-full h-48 p-4 text-sm bg-graphite-950/50 border border-white/10 text-azure-mist-50/90 rounded-xl font-mono focus:border-cloudy-sky-500 focus:outline-none resize-none leading-relaxed"
                    value={brandPolicy.pillars.join('\n')}
                    onChange={(e) => updatePolicy({...brandPolicy, pillars: e.target.value.split('\n')})}
                    placeholder="One pillar per line..."
                />
            </div>

             {/* Tone */}
             <div className="bg-graphite-800/50 backdrop-blur-sm p-6 rounded-2xl border border-azure-mist-50/5 shadow-sm">
                <h3 className="font-bold text-azure-mist-50 mb-4">Tone Rules</h3>
                <textarea
                    className="w-full h-48 p-4 text-sm bg-graphite-950/50 border border-white/10 text-azure-mist-50/90 rounded-xl font-mono focus:border-cloudy-sky-500 focus:outline-none resize-none leading-relaxed"
                    value={brandPolicy.toneRules.join('\n')}
                    onChange={(e) => updatePolicy({...brandPolicy, toneRules: e.target.value.split('\n')})}
                />
            </div>

            <div className="lg:col-span-2 flex justify-end pt-4 border-t border-azure-mist-50/5">
                <button
                    onClick={handleSavePolicy}
                    className="flex items-center px-8 py-3 bg-cloudy-sky-500 hover:bg-cloudy-sky-600 text-white rounded-xl shadow-lg shadow-cloudy-sky-500/20 transition-all transform hover:-translate-y-0.5"
                >
                    <Save className="w-4 h-4 mr-2"/> Save Configuration
                </button>
            </div>
          </div>
      ) : (
          <div className="space-y-6">

              {/* Protocol Editor Mode */}
              {editingProtocolId !== null ? (
                  <div className="bg-graphite-800 rounded-xl border border-white/5 overflow-hidden animate-slide-up">
                      <div className="p-4 border-b border-white/10 bg-graphite-950/50 flex justify-between items-center">
                          <h3 className="text-lg font-bold text-azure-mist-50 font-mono">
                              {editingProtocolId === 'new' ? 'NEW_PROTOCOL' : 'EDIT_PROTOCOL'}
                          </h3>
                          <div className="flex gap-2">
                             <span className="flex items-center gap-1.5 px-3 py-1 bg-mint-leaf-500/10 text-mint-leaf-400 rounded-full text-xs font-bold border border-mint-leaf-500/20">
                                 <ArrowLeftFromLine size={12}/>
                                 Injection Active
                             </span>
                          </div>
                      </div>

                      <div className="p-6 space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-xs font-bold text-graphite-400 uppercase mb-2">Protocol Name</label>
                                  <input
                                      className="w-full bg-graphite-950 border border-white/10 rounded-lg p-3 text-azure-mist-50 focus:border-cloudy-sky-500 outline-none"
                                      placeholder="e.g. 'Crisis Response Alpha'"
                                      value={editorState.name}
                                      onChange={e => setEditorState({...editorState, name: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-graphite-400 uppercase mb-2">Intent Triggers (Comma Separated)</label>
                                  <input
                                      className="w-full bg-graphite-950 border border-white/10 rounded-lg p-3 text-azure-mist-50 focus:border-cloudy-sky-500 outline-none"
                                      placeholder="e.g. 'panic, server down, error'"
                                      value={editorState.triggers}
                                      onChange={e => setEditorState({...editorState, triggers: e.target.value})}
                                  />
                              </div>
                          </div>

                          <div className="relative group">
                              <label className="block text-xs font-bold text-graphite-400 uppercase mb-2 flex justify-between">
                                  <span>Execution Logic (Instruction Chain)</span>
                                  <span className="text-[10px] text-cloudy-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                      AI Injection Target
                                  </span>
                              </label>
                              <textarea
                                  className="w-full h-64 bg-graphite-950 border border-white/10 rounded-lg p-4 font-mono text-sm text-azure-mist-50 focus:border-cloudy-sky-500 outline-none resize-none leading-relaxed"
                                  placeholder="1. Step one...&#10;2. Step two..."
                                  value={editorState.logic}
                                  onChange={e => setEditorState({...editorState, logic: e.target.value})}
                              />
                          </div>
                      </div>

                      <div className="p-4 bg-graphite-950/30 border-t border-white/10 flex justify-end gap-3">
                          <button
                              onClick={() => setEditingProtocolId(null)}
                              className="px-6 py-2 text-graphite-400 hover:text-white transition-colors"
                          >
                              Cancel
                          </button>
                          <button
                              onClick={saveProtocol}
                              className="px-6 py-2 bg-cloudy-sky-500 hover:bg-cloudy-sky-600 text-white rounded-lg font-bold shadow-lg shadow-cloudy-sky-500/20"
                          >
                              Save Protocol
                          </button>
                      </div>
                  </div>
              ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Import JSONL */}
                        <div className="bg-graphite-800/30 p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-cloudy-sky-500/30 transition-colors text-center group cursor-pointer relative overflow-hidden flex flex-col justify-center items-center h-48">
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-graphite-950 rounded-xl mx-auto mb-3 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                                    <Upload className="w-5 h-5 text-cloudy-sky-400"/>
                                </div>
                                <h3 className="font-bold text-sm text-azure-mist-50 mb-1">Import JSONL</h3>
                                <label className="inline-flex items-center px-3 py-1.5 mt-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-azure-mist-50 cursor-pointer transition-all">
                                    <input type="file" accept=".jsonl,.json" className="hidden" onChange={handleFileUpload} />
                                    Select File
                                </label>
                            </div>
                        </div>

                        {/* Seed Defaults */}
                        <div
                            onClick={handleSeedDefaults}
                            className="bg-graphite-800/30 p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-mint-leaf-500/30 transition-colors text-center group cursor-pointer relative overflow-hidden flex flex-col justify-center items-center h-48"
                        >
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-graphite-950 rounded-xl mx-auto mb-3 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                                    <Database className="w-5 h-5 text-mint-leaf-400"/>
                                </div>
                                <h3 className="font-bold text-sm text-azure-mist-50 mb-1">Seed Defaults</h3>
                                <button className="inline-flex items-center px-3 py-1.5 mt-2 bg-mint-leaf-500/10 hover:bg-mint-leaf-500/20 border border-mint-leaf-500/20 rounded-lg text-[10px] font-bold text-mint-leaf-400 cursor-pointer transition-all">
                                    Load "Alpha"
                                </button>
                            </div>
                        </div>

                        {/* Create Manual */}
                        <div
                            onClick={startCreateProtocol}
                            className="bg-graphite-800/30 p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-azure-mist-400/30 transition-colors text-center group cursor-pointer relative overflow-hidden flex flex-col justify-center items-center h-48"
                        >
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-graphite-950 rounded-xl mx-auto mb-3 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                                    <FileCode className="w-5 h-5 text-azure-mist-400"/>
                                </div>
                                <h3 className="font-bold text-sm text-azure-mist-50 mb-1">Manual Entry</h3>
                                <button className="inline-flex items-center px-3 py-1.5 mt-2 bg-azure-mist-500/10 hover:bg-azure-mist-500/20 border border-azure-mist-500/20 rounded-lg text-[10px] font-bold text-azure-mist-400 cursor-pointer transition-all">
                                    Create New
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {protocols.map((p, idx) => (
                            <div key={idx} className="bg-graphite-800 p-5 rounded-xl border border-white/5 hover:border-cloudy-sky-500/30 transition-all shadow-lg hover:shadow-cloudy-sky-500/5 group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold font-mono text-cloudy-sky-400 text-lg">{p.name || p.id}</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {p.intent_triggers?.map(t => (
                                                <span key={t} className="px-2 py-0.5 bg-cloudy-sky-500/10 text-cloudy-sky-400 border border-cloudy-sky-500/20 text-[10px] rounded uppercase tracking-wider">{t}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startEditProtocol(p); }}
                                            className="p-1.5 text-white/20 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                            title="Edit Protocol"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); requestDeleteProtocol(p.id); }}
                                            className="p-1.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                            title="Delete Protocol"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 bg-graphite-950/50 p-4 rounded-lg border border-white/5">
                                    <p className="text-xs font-mono text-graphite-300 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                                        {p.execution_logic?.substring(0, 300)}...
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                  </>
              )}
          </div>
      )}
    </div>
  );
};

const ShieldIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);

export default BrandVault;
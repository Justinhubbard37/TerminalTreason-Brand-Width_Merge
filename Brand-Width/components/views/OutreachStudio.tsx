import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../../contexts/ProjectContext.tsx';
import { OutreachDraft } from '../../types.ts';
import { Send, RefreshCw, Check, Download, AlertTriangle, Flag, X } from 'lucide-react';

interface OutreachProps {
  projectId: string;
}

const OutreachStudio: React.FC<OutreachProps> = ({ projectId }) => {
  const { leads, drafts, protocols, brandPolicy, generateDraftContent, saveDraft, isBusy } = useProject();

  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('');
  const [editorContent, setEditorContent] = useState('');

  // When projectId changes, reset selections (already handled by component unmount/remount usually, but good for safety)
  useEffect(() => {
    setSelectedLeadId('');
    setEditorContent('');
    setSelectedDraftId('');
  }, [projectId]);

  const handleGenerate = async () => {
    if (!selectedLeadId) return;
    const content = await generateDraftContent(selectedLeadId, selectedProtocolId);

    if (content) {
        setEditorContent(content);
        // Temporary draft state (not saved to store yet)
        setSelectedDraftId('');
    }
  };

  const handleSaveDraft = () => {
      if (!selectedLeadId) return;
      const draft: OutreachDraft = {
          id: selectedDraftId || Math.random().toString(36).substr(2, 9),
          leadId: selectedLeadId,
          type: 'email',
          content: editorContent,
          complianceScore: 100,
          flags: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
      };
      saveDraft(draft);
      setSelectedDraftId(draft.id);
      alert('Draft saved to local storage.');
  };

  const handleExport = () => {
      const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(drafts, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", data);
      downloadAnchorNode.setAttribute("download", `outreach_export_${projectId}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const bannedFound = useMemo(() => {
    const lowerContent = editorContent.toLowerCase();
    return Object.keys(brandPolicy.bannedTerms).filter(term => lowerContent.includes(term));
  }, [editorContent, brandPolicy.bannedTerms]);

  return (
    <div className="flex h-full gap-6">
       <div className="w-1/3 flex flex-col space-y-4">
           <h2 className="text-xl font-bold font-mono text-azure-mist-50">OUTREACH_STUDIO</h2>

           <div className="bg-graphite-800 p-4 rounded border border-graphite-600">
               <label className="block text-xs font-bold text-graphite-400 uppercase mb-2">Select Lead</label>
               <select
                  className="w-full bg-graphite-950 border border-graphite-600 rounded p-2 text-sm text-azure-mist-50 focus:border-cloudy-sky-500 outline-none"
                  value={selectedLeadId}
                  onChange={e => setSelectedLeadId(e.target.value)}
               >
                   <option value="">-- Choose Lead --</option>
                   {leads.map(l => <option key={l.id} value={l.id}>{l.company} ({l.score})</option>)}
               </select>
           </div>

           <div className="bg-graphite-800 p-4 rounded border border-graphite-600">
               <label className="block text-xs font-bold text-graphite-400 uppercase mb-2">Select Protocol (Optional)</label>
               <select
                  className="w-full bg-graphite-950 border border-graphite-600 rounded p-2 text-sm text-azure-mist-50 focus:border-cloudy-sky-500 outline-none"
                  value={selectedProtocolId}
                  onChange={e => setSelectedProtocolId(e.target.value)}
               >
                   <option value="">-- Standard Cold Outreach --</option>
                   {protocols.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
           </div>

           <button
              onClick={handleGenerate}
              disabled={!selectedLeadId || isBusy.draft}
              className="w-full bg-cloudy-sky-500 text-white py-3 rounded font-medium disabled:opacity-50 flex justify-center items-center gap-2 hover:bg-cloudy-sky-600 transition-colors"
           >
               {isBusy.draft ? <RefreshCw className="animate-spin w-4 h-4"/> : <Send className="w-4 h-4"/>}
               Generate Draft
           </button>

           <div className="mt-8 border-t border-graphite-600 pt-4">
               <button onClick={handleExport} className="text-sm text-graphite-300 flex items-center hover:text-cloudy-sky-400 transition-colors">
                   <Download className="w-4 h-4 mr-2"/> Export All Drafts (JSON)
               </button>
           </div>
       </div>

       <div className="flex-1 flex flex-col bg-graphite-800 border border-graphite-600 rounded-lg shadow-sm overflow-hidden relative">
           <div className="bg-graphite-950 border-b border-graphite-600 p-3 flex justify-between items-center">
               <span className="font-mono text-sm font-bold text-graphite-400">EDITOR_BUFFER</span>
               <div className="flex items-center space-x-2">
                   {bannedFound.length > 0 && (
                       <span className="text-red-400 text-xs font-bold flex items-center mr-4">
                           <AlertTriangle className="w-3 h-3 mr-1"/> {bannedFound.length} VIOLATIONS
                       </span>
                   )}
                   <button onClick={handleSaveDraft} className="text-xs bg-cloudy-sky-500 text-white px-3 py-1 rounded hover:bg-cloudy-sky-600 transition-colors">Save Draft</button>
               </div>
           </div>
           <textarea
               className="flex-1 p-6 font-mono text-sm text-azure-mist-50 bg-graphite-800 resize-none focus:outline-none leading-relaxed"
               placeholder="Draft content will appear here..."
               value={editorContent}
               onChange={e => setEditorContent(e.target.value)}
           />

           {/* Compliance Monitor Footer */}
           <div className="bg-graphite-950 border-t border-graphite-600 p-4 min-h-[60px] flex flex-col justify-center">
                {bannedFound.length === 0 ? (
                    <div className="flex items-center text-xs text-mint-leaf-500/80 font-mono">
                        <Check className="w-3 h-3 mr-2"/> COMPLIANCE PROTOCOLS: ACTIVE & CLEAR
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Governance Alerts</div>
                        <div className="flex flex-wrap gap-2">
                            {bannedFound.map(term => (
                                <div key={term} className="group relative flex items-center bg-red-500/10 border border-red-500/30 rounded-md pl-3 pr-2 py-1 transition-all hover:bg-red-500/20">
                                    <span className="text-xs font-bold text-red-400 mr-2">{term}</span>

                                    {/* The Flag Icon */}
                                    <div className="cursor-help bg-red-500 text-white rounded-sm p-0.5">
                                        <Flag size={10} fill="currentColor" />
                                    </div>

                                    {/* Tooltip - Appears on Hover */}
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-graphite-800 border border-white/10 rounded-lg shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="text-[10px] font-mono text-white/40 uppercase mb-1">Protocol Correction</div>
                                        <div className="flex items-center gap-2">
                                            <X size={12} className="text-red-500"/>
                                            <span className="text-sm text-graphite-400 line-through decoration-red-500">{term}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Check size={12} className="text-mint-leaf-400"/>
                                            <span className="text-sm font-bold text-cloudy-sky-400">{brandPolicy.bannedTerms[term]}</span>
                                        </div>
                                        {/* Triangle pointer */}
                                        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-graphite-800"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
           </div>
       </div>
    </div>
  );
};

export default OutreachStudio;
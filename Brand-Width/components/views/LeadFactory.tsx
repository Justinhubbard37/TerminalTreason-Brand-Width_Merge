import React, { useState } from 'react';
import { Lead } from '../../types.ts';
import { useProject } from '../../contexts/ProjectContext.tsx';
import { Search, Database, Terminal } from 'lucide-react';
import { LeadList } from '../leads/LeadList.tsx';
import { LeadDetail } from '../leads/LeadDetail.tsx';

interface LeadFactoryProps {
  projectId: string;
}

const LeadFactory: React.FC<LeadFactoryProps> = ({ projectId }) => {
  const { leads, findLeads, scoreLead, isBusy } = useProject();
  const [query, setQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const selectedLead = leads.find(l => l.id === selectedLeadId) || null;

  const handleFind = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    try {
        await findLeads(query);
    } catch (err: any) {
        alert(err.message);
    }
  };

  const handleScore = async (lead: Lead) => {
      try {
          await scoreLead(lead);
      } catch (err: any) {
          alert(err.message);
      }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
        {/* Top Command Bar */}
        <div className="flex justify-between items-center bg-graphite-800/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-cloudy-sky-500/10 rounded-lg">
                    <Database className="text-cloudy-sky-400" size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold font-mono text-azure-mist-50 leading-none">LEAD_FACTORY</h2>
                    <p className="text-[10px] text-graphite-400 font-mono mt-1 tracking-wider uppercase">Entity Acquisition & Analysis</p>
                </div>
            </div>

            <form onSubmit={handleFind} className="flex gap-2 w-1/2 max-w-lg">
                <div className="flex-1 relative">
                    <Terminal className="absolute left-3 top-2.5 text-graphite-500" size={16} />
                    <input
                        className="w-full bg-graphite-950 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-azure-mist-50 focus:border-cloudy-sky-500 focus:ring-1 focus:ring-cloudy-sky-500/50 outline-none transition-all placeholder:text-graphite-600 font-mono"
                        placeholder="cmd: find leads 'fintech cto'..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
                <button
                    disabled={isBusy.leads}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-azure-mist-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isBusy.leads ? 'Running...' : 'Execute'}
                </button>
            </form>
        </div>

        {/* Master-Detail Layout */}
        <div className="flex-1 flex gap-4 min-h-0">
            {/* Left: Explorer (LeadList) */}
            <div className="w-80 flex flex-col bg-graphite-800/30 rounded-xl border border-white/5 overflow-hidden">
                <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <span className="text-xs font-bold text-graphite-400 uppercase tracking-wider">Queue ({leads.length})</span>
                </div>
                <LeadList
                    leads={leads}
                    selectedLeadId={selectedLeadId}
                    onSelect={(l) => setSelectedLeadId(l.id)}
                />
            </div>

            {/* Right: Workbench (LeadDetail) */}
            <div className="flex-1 min-w-0">
                {selectedLead ? (
                    <LeadDetail
                        lead={selectedLead}
                        onScore={handleScore}
                        isBusy={isBusy.leads} // Reusing leads busy state for scoring for now
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-graphite-500 bg-graphite-800/10 rounded-xl border border-dashed border-white/5">
                        <Database size={48} className="mb-4 opacity-20" />
                        <p className="font-mono text-sm">Select an entity from the queue to refine.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default LeadFactory;
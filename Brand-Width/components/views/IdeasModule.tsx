import React, { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext.tsx';
import { Radio } from 'lucide-react';

interface IdeasProps {
  projectId: string;
}

const IdeasModule: React.FC<IdeasProps> = ({ projectId }) => {
  const { opportunities, mineOpportunities, isBusy } = useProject();
  const [query, setQuery] = useState('');

  const handleMine = async () => {
    if (!query) return;
    try {
        await mineOpportunities(query);
    } catch (err: any) {
        alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold font-mono text-azure-mist-50">IDEA_MINER</h2>
                <p className="text-graphite-400 text-sm">Scan chatter. Isolate signal. Cluster opportunities.</p>
            </div>
        </div>

        <div className="bg-graphite-800 p-6 rounded border border-graphite-600 shadow-sm flex gap-4 items-end">
            <div className="flex-1">
                <label className="block text-xs font-bold text-graphite-400 uppercase mb-2">Signal Query</label>
                <input
                    className="w-full bg-graphite-950 border border-graphite-600 rounded px-3 py-2 text-sm text-azure-mist-50 focus:border-cloudy-sky-500 outline-none"
                    placeholder="e.g. 'Complaints about enterprise CRM pricing'"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>
            <button
                onClick={handleMine}
                disabled={isBusy.mining}
                className="bg-cloudy-sky-500 text-white px-6 py-2 rounded font-medium disabled:opacity-50 h-10 flex items-center hover:bg-cloudy-sky-600 transition-colors"
            >
                {isBusy.mining ? 'Mining...' : 'Mine Signals'}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map(opp => (
                <div key={opp.id} className="bg-graphite-800 p-6 rounded border-l-4 border-cloudy-sky-500 shadow-sm hover:border-l-mint-leaf-500 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-azure-mist-50">{opp.name}</h3>
                        <span className="bg-cloudy-sky-500/10 text-cloudy-sky-400 text-xs px-2 py-1 rounded font-bold uppercase border border-cloudy-sky-500/20">{opp.frequency} Freq</span>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div>
                            <span className="font-bold text-graphite-400 uppercase text-xs">Core Problem</span>
                            <p className="text-azure-mist-50/90">{opp.problem}</p>
                        </div>
                        <div>
                            <span className="font-bold text-graphite-400 uppercase text-xs">Current Bad Fix</span>
                            <p className="text-azure-mist-50/70 italic border-l-2 border-graphite-600 pl-2">{opp.existingSolutions}</p>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-graphite-600 flex justify-end">
                        <button className="text-cloudy-sky-400 text-sm font-bold hover:text-white hover:underline flex items-center transition-colors">
                            Draft Opportunity Brief <Radio className="w-3 h-3 ml-2"/>
                        </button>
                    </div>
                </div>
            ))}
             {opportunities.length === 0 && (
                <div className="col-span-2 text-center py-10 text-graphite-400 border-2 border-dashed border-graphite-600 rounded">
                    No signals mined yet. Initialize scanner.
                </div>
            )}
        </div>
    </div>
  );
};

export default IdeasModule;
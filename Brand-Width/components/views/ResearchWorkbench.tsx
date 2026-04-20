import React, { useState } from 'react';
import { Source } from '../../types.ts';
import { useProject } from '../../contexts/ProjectContext.tsx';
import { Search, Plus, ExternalLink, FileText, Loader } from 'lucide-react';

interface ResearchProps {
  projectId: string;
}

const ResearchWorkbench: React.FC<ResearchProps> = ({ projectId }) => {
  const { sources, briefs, searchSources, saveSource, generateBrief, isBusy } = useProject();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Source[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    try {
        const data = await searchSources(query);
        setResults(data);
    } catch (err: any) {
        alert(err.message);
    }
  };

  const handleSaveSource = (src: Source) => {
    const newSrc = { ...src, id: src.id || Math.random().toString(36).substr(2, 9) };
    saveSource(newSrc);
  };

  const handleGenerateBrief = async () => {
    try {
        await generateBrief();
    } catch (err: any) {
        alert(err.message);
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left: Search & Results */}
      <div className="w-1/2 flex flex-col space-y-4">
        <h2 className="text-xl font-bold font-mono text-azure-mist-50">DATA_INGEST</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
            <input
                className="flex-1 bg-graphite-800 border border-graphite-600 rounded px-4 py-2 text-azure-mist-50 focus:border-cloudy-sky-500 focus:outline-none"
                placeholder="Enter research query..."
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
            <button disabled={isBusy.search} className="bg-cloudy-sky-500 text-white px-6 py-2 rounded font-medium disabled:opacity-50 hover:bg-cloudy-sky-600 transition-colors">
                {isBusy.search ? <Loader className="animate-spin"/> : <Search size={20}/>}
            </button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {results.length > 0 && <h3 className="text-xs font-bold text-graphite-400 uppercase tracking-wider">Live Results</h3>}
            {results.map((src, i) => (
                <div key={i} className="bg-graphite-800 p-4 rounded border border-graphite-600 shadow-sm hover:border-cloudy-sky-500 transition-colors group">
                    <div className="flex justify-between">
                        <a href={src.url} target="_blank" rel="noreferrer" className="text-cloudy-sky-400 font-bold hover:underline flex items-center gap-1">
                            {src.title} <ExternalLink size={12}/>
                        </a>
                        <button onClick={() => handleSaveSource(src)} className="text-graphite-400 group-hover:text-mint-leaf-500 transition-colors">
                            <Plus size={20}/>
                        </button>
                    </div>
                    <p className="text-sm text-graphite-300 mt-2 line-clamp-3">{src.snippet}</p>
                    <div className="mt-2 flex gap-2">
                        {src.tags?.map(t => <span key={t} className="text-xs bg-graphite-950 border border-graphite-600 px-2 py-0.5 rounded text-graphite-400">#{t}</span>)}
                    </div>
                </div>
            ))}

            {results.length === 0 && !isBusy.search && (
                <div className="text-center text-graphite-400 mt-10 text-sm font-mono">
                    Enter a query to initialize remote runner search.
                </div>
            )}
        </div>
      </div>

      {/* Right: Saved & Briefs */}
      <div className="w-1/2 flex flex-col space-y-4 border-l border-graphite-600 pl-6">
         <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold font-mono text-azure-mist-50">EVIDENCE_LOCKER</h2>
             <button
                onClick={handleGenerateBrief}
                disabled={isBusy.brief || sources.length === 0}
                className="bg-cloudy-sky-500 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 disabled:opacity-50 hover:bg-cloudy-sky-600"
             >
                 {isBusy.brief ? <Loader className="animate-spin w-4 h-4"/> : <FileText className="w-4 h-4"/>}
                 Generate Brief
             </button>
         </div>

         {/* Saved Sources List */}
         <div className="bg-graphite-800 p-4 rounded-lg max-h-60 overflow-y-auto border border-graphite-600">
             <h3 className="text-xs font-bold text-graphite-400 uppercase tracking-wider mb-2">Saved Sources ({sources.length})</h3>
             {sources.length === 0 ? <p className="text-sm text-graphite-400">No sources saved.</p> : (
                 <ul className="space-y-2">
                     {sources.map(s => (
                         <li key={s.id} className="text-sm bg-graphite-950 p-2 rounded border border-graphite-600 truncate hover:border-cloudy-sky-500/50 transition-colors">
                             <a href={s.url} target="_blank" className="hover:underline text-azure-mist-50/90">{s.title}</a>
                         </li>
                     ))}
                 </ul>
             )}
         </div>

         {/* Generated Briefs */}
         <div className="flex-1 overflow-y-auto space-y-4">
             <h3 className="text-xs font-bold text-graphite-400 uppercase tracking-wider">Project Briefs</h3>
             {briefs.map(b => (
                 <div key={b.id} className="bg-graphite-800 p-5 rounded border-l-4 border-cloudy-sky-500 shadow-sm">
                     <h4 className="font-bold text-azure-mist-50">{b.title}</h4>
                     <p className="text-xs text-graphite-400 mb-3">{new Date(b.createdAt).toLocaleString()}</p>
                     <div className="text-sm text-azure-mist-50/80 whitespace-pre-wrap font-mono bg-graphite-950 p-3 rounded border border-graphite-600">
                         {b.content}
                     </div>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
};

export default ResearchWorkbench;
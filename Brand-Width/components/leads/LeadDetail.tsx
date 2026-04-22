import React from 'react';
import { Lead } from '../../types.ts';
import { CheckCircle, AlertTriangle, Activity, Globe, Mail, Hash, Play, Clock, Shield } from 'lucide-react';

interface LeadDetailProps {
  lead: Lead;
  onScore: (lead: Lead) => void;
  isBusy?: boolean;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onScore, isBusy }) => {
  return (
    <div className="h-full flex flex-col bg-graphite-900 border border-white/5 rounded-xl overflow-hidden relative shadow-2xl">
      {/* Entity Header */}
      <div className="p-6 border-b border-white/5 bg-graphite-800/50 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
             <Shield size={120} />
         </div>

         <div className="relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-azure-mist-50 tracking-tight">{lead.company}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-graphite-300">
                        <a href={`https://${lead.site}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-cloudy-sky-400 transition-colors">
                            <Globe size={14} /> {lead.site}
                        </a>
                        <span className="text-white/10">|</span>
                        <span className="flex items-center gap-1">
                            <Hash size={14} /> {lead.niche}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-graphite-400 tracking-widest mb-1">Fit Score</div>
                    <div className="text-4xl font-mono font-bold text-azure-mist-50">
                        {lead.score > 0 ? lead.score : '--'}
                        <span className="text-sm text-graphite-500 ml-1">/100</span>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="mt-6 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    lead.status === 'new' ? 'bg-cloudy-sky-500/10 border-cloudy-sky-500/20 text-cloudy-sky-400' :
                    lead.status === 'scored' ? 'bg-mint-leaf-500/10 border-mint-leaf-500/20 text-mint-leaf-400' :
                    'bg-graphite-700/50 border-white/10 text-graphite-400'
                }`}>
                    {lead.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-graphite-950 border border-white/10 text-graphite-400 flex items-center gap-1">
                    <Clock size={12} /> {new Date(lead.createdAt).toLocaleDateString()}
                </span>
            </div>
         </div>
      </div>

      {/* Main Content Scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Pain Signal Analysis */}
          <div className="bg-graphite-800/30 border border-white/5 rounded-lg p-5">
              <h3 className="text-xs font-bold text-cloudy-sky-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity size={14} /> Detected Signal
              </h3>
              <p className="text-lg text-azure-mist-50/90 leading-relaxed font-medium">
                  "{lead.painSignal}"
              </p>
          </div>

          {/* Intelligence Brief */}
          <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                   <div>
                       <h3 className="text-xs font-bold text-graphite-500 uppercase tracking-widest mb-2">Contact Vector</h3>
                       <div className="bg-graphite-950 p-3 rounded border border-white/5 text-sm text-graphite-300 font-mono flex items-center gap-2">
                           <Mail size={14} /> {lead.contactChannels || 'Not detected'}
                       </div>
                   </div>
              </div>
              <div className="space-y-4">
                   <div>
                       <h3 className="text-xs font-bold text-graphite-500 uppercase tracking-widest mb-2">Evidence Trail</h3>
                       {lead.evidenceLinks.length > 0 ? (
                           <ul className="space-y-2">
                               {lead.evidenceLinks.map((link, i) => (
                                   <li key={i}>
                                       <a href={link} target="_blank" rel="noreferrer" className="block bg-graphite-950 p-2 rounded border border-white/5 text-xs text-cloudy-sky-400 hover:border-cloudy-sky-500/50 truncate transition-colors">
                                           {link}
                                       </a>
                                   </li>
                               ))}
                           </ul>
                       ) : (
                           <div className="text-xs text-graphite-600 italic">No direct links captured.</div>
                       )}
                   </div>
              </div>
          </div>

          {/* Notes / Dossier */}
          <div>
              <h3 className="text-xs font-bold text-graphite-500 uppercase tracking-widest mb-2">System Dossier</h3>
              <div className="bg-graphite-950 p-4 rounded-lg border border-white/5 font-mono text-sm text-azure-mist-50/80 whitespace-pre-wrap leading-relaxed">
                  {lead.notes || "No additional intelligence gathering."}
              </div>
          </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-graphite-950 border-t border-white/10 flex justify-end gap-3">
          {lead.status === 'new' && (
              <button
                onClick={() => onScore(lead)}
                disabled={isBusy}
                className="flex items-center gap-2 px-6 py-3 bg-cloudy-sky-500 hover:bg-cloudy-sky-600 text-white rounded-lg font-bold shadow-lg shadow-cloudy-sky-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
              >
                 {isBusy ? <Activity className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                 Execute Scoring Agent
              </button>
          )}
          {lead.status === 'scored' && (
              <div className="flex items-center gap-2 text-mint-leaf-400 text-sm font-bold bg-mint-leaf-500/10 px-4 py-2 rounded-lg border border-mint-leaf-500/20">
                  <CheckCircle size={16} /> Scoring Complete
              </div>
          )}
      </div>
    </div>
  );
};
import React from 'react';
import { Lead } from '../../types.ts';
import { Clock, CheckCircle, Circle } from 'lucide-react';

interface LeadListProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelect: (lead: Lead) => void;
}

export const LeadList: React.FC<LeadListProps> = ({ leads, selectedLeadId, onSelect }) => {
  if (leads.length === 0) {
      return (
          <div className="p-8 text-center text-graphite-400 text-sm border border-dashed border-white/10 rounded-lg mx-4 mt-4">
              Queue is empty. <br/> Run discovery to populate.
          </div>
      );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 space-y-1 py-2 custom-scrollbar">
      {leads.map(lead => {
          const isSelected = selectedLeadId === lead.id;
          return (
            <button
                key={lead.id}
                onClick={() => onSelect(lead)}
                className={`w-full text-left p-3 rounded-lg border transition-all group relative overflow-hidden ${
                    isSelected
                    ? 'bg-cloudy-sky-500/10 border-cloudy-sky-500/50 shadow-md'
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                }`}
            >
                {/* Selection Indicator */}
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cloudy-sky-500"></div>}

                <div className="flex justify-between items-start mb-1">
                    <span className={`font-bold text-sm truncate pr-2 ${isSelected ? 'text-azure-mist-50' : 'text-graphite-300 group-hover:text-azure-mist-50'}`}>
                        {lead.company}
                    </span>
                    {lead.score > 0 && (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            lead.score > 75 ? 'text-mint-leaf-400 bg-mint-leaf-500/10' : 'text-yellow-400 bg-yellow-500/10'
                        }`}>
                            {lead.score}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-graphite-500 truncate max-w-[120px]">
                        {lead.niche}
                    </span>

                    {/* Status Icon */}
                    <div className="text-graphite-600">
                        {lead.status === 'scored' ? <CheckCircle size={12} className="text-mint-leaf-500"/> : <Circle size={12} />}
                    </div>
                </div>
            </button>
          );
      })}
    </div>
  );
};
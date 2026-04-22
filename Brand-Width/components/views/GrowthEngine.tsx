import React, { useState } from 'react';
import ResearchWorkbench from './ResearchWorkbench.tsx';
import LeadFactory from './LeadFactory.tsx';
import OutreachStudio from './OutreachStudio.tsx';
import IdeasModule from './IdeasModule.tsx';
import { BookOpen, Database, Send, Lightbulb } from 'lucide-react';

interface GrowthEngineProps {
  projectId: string;
}

type SubView = 'research' | 'leads' | 'outreach' | 'ideas';

export const GrowthEngine: React.FC<GrowthEngineProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<SubView>('research');

  const renderSubView = () => {
     switch(activeTab) {
         case 'research': return <ResearchWorkbench projectId={projectId} />;
         case 'leads': return <LeadFactory projectId={projectId} />;
         case 'outreach': return <OutreachStudio projectId={projectId} />;
         case 'ideas': return <IdeasModule projectId={projectId} />;
         default: return <ResearchWorkbench projectId={projectId} />;
     }
  };

  const TabButton = ({ id, label, icon }: { id: SubView, label: string, icon: React.ReactNode }) => {
      const isActive = activeTab === id;
      return (
          <button
            onClick={() => setActiveTab(id)}
            className={`
                flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-200
                ${isActive
                    ? 'bg-cloudy-sky-500 text-white shadow-lg shadow-cloudy-sky-500/25'
                    : 'text-graphite-400 hover:text-white hover:bg-white/5'
                }
            `}
          >
              {icon}
              {label}
          </button>
      );
  };

  return (
    <div className="h-full flex flex-col relative">
        {/* Top Right Navigation Tabs */}
        {/* We position this absolutely to sit within the header area of the child components visually, or just above them */}
        <div className="flex justify-end mb-4 shrink-0">
            <div className="flex bg-graphite-950/80 backdrop-blur border border-white/5 p-1 rounded-lg">
                <TabButton id="research" label="Research" icon={<BookOpen size={14}/>} />
                <TabButton id="leads" label="Lead Factory" icon={<Database size={14}/>} />
                <TabButton id="outreach" label="Outreach" icon={<Send size={14}/>} />
                <TabButton id="ideas" label="Idea Miner" icon={<Lightbulb size={14}/>} />
            </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-hidden relative animate-fade-in">
            {renderSubView()}
        </div>
    </div>
  );
};

export default GrowthEngine;
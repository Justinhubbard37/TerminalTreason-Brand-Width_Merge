import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import { View, Project } from './types.ts';
import { StorageService } from './services/storage.ts';
import { ProjectProvider } from './contexts/ProjectContext.tsx';
import BrandVault from './components/views/BrandVault.tsx';
import GrowthEngine from './components/views/GrowthEngine.tsx';
import AssetStudio from './components/views/AssetStudio.tsx';
import SettingsView from './components/views/SettingsView.tsx';
import { BrandAssistant } from './components/BrandAssistant.tsx';
import { setMockMode, getMockMode } from './services/api.ts';
import { Plus, Folder } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('growth');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isMock, setIsMock] = useState(getMockMode());
  const [isStudioMode, setIsStudioMode] = useState(false);

  useEffect(() => {
    // Load projects on mount
    const storedProjects = StorageService.getProjects();
    setProjects(storedProjects);
    if (storedProjects.length > 0) {
      setCurrentProjectId(storedProjects[0].id);
    } else {
        // Create a demo project if none exist
        const p = StorageService.createProject("Demo Project", "Initial project workspace");
        setProjects([p]);
        setCurrentProjectId(p.id);
    }
  }, []);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const p = StorageService.createProject(newProjectName, "Custom Project");
    setProjects([...projects, p]);
    setCurrentProjectId(p.id);
    setNewProjectName('');
    setIsCreatingProject(false);
  };

  const toggleMock = () => {
    const newVal = !isMock;
    setMockMode(newVal);
    setIsMock(newVal);
  };

  const renderView = () => {
    if (!currentProjectId) return <div className="p-10 text-graphite-400 font-mono">Select or create a project.</div>;

    switch (currentView) {
      case 'vault': return <BrandVault projectId={currentProjectId} />;
      case 'growth': return <GrowthEngine projectId={currentProjectId} />;
      case 'assets': return <AssetStudio projectId={currentProjectId} />;
      case 'settings': return <SettingsView isMock={isMock} toggleMock={toggleMock} />;
      default: return <div>Unknown View</div>;
    }
  };

  return (
    <div className="flex h-screen bg-transparent font-sans text-azure-mist-50 selection:bg-cloudy-sky-500 selection:text-white">
      {/* Floating Sidebar Container */}
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />

      <main className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Top Bar - Now visually detached or blended */}
        <header className="h-16 flex items-center justify-between px-8 z-10 pt-4 pb-2 shrink-0">
            <div className="flex items-center space-x-4 bg-graphite-800/50 backdrop-blur border border-azure-mist-50/5 px-4 py-2 rounded-xl">
                <Folder className="text-cloudy-sky-400/80" size={18}/>
                <div className="relative group">
                    <select
                        value={currentProjectId || ''}
                        onChange={(e) => setCurrentProjectId(e.target.value)}
                        className="appearance-none bg-transparent text-azure-mist-50 font-medium pr-8 focus:outline-none cursor-pointer"
                    >
                        {projects.map(p => <option key={p.id} value={p.id} className="bg-graphite-800">{p.name}</option>)}
                    </select>
                </div>

                <button
                    onClick={() => setIsCreatingProject(!isCreatingProject)}
                    className="p-1 hover:bg-white/10 rounded-md text-graphite-400 hover:text-azure-mist-50 transition-colors"
                >
                    <Plus size={16} />
                </button>

                {isCreatingProject && (
                    <div className="flex items-center space-x-2 animate-fade-in pl-2 border-l border-white/10">
                        <input
                            type="text"
                            className="bg-graphite-950/50 border border-white/10 text-azure-mist-50 px-2 py-1 rounded-md text-xs w-32 focus:border-cloudy-sky-500 outline-none"
                            placeholder="Project Name"
                            value={newProjectName}
                            onChange={e => setNewProjectName(e.target.value)}
                        />
                        <button onClick={handleCreateProject} className="text-xs bg-cloudy-sky-500 text-white px-2 py-1 rounded hover:bg-cloudy-sky-600">Add</button>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-4">
                {isMock && (
                     <span className="px-3 py-1 bg-mint-leaf-500/10 text-mint-leaf-500 text-[10px] font-bold tracking-widest uppercase rounded-full border border-mint-leaf-500/20">
                         MOCK :: ACTIVE
                     </span>
                )}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-graphite-800 border border-azure-mist-50/5">
                    <div className="h-2 w-2 rounded-full bg-mint-leaf-500 shadow-[0_0_8px_rgba(32,189,144,0.6)]"></div>
                    <span className="text-[10px] font-mono text-graphite-400">ONLINE</span>
                </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
             <ProjectProvider projectId={currentProjectId}>
                {/* Main View Container - Flex Grow */}
                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    <div className="h-full w-full max-w-7xl mx-auto">
                        {renderView()}
                    </div>
                </div>

                {/* Global Brand Assistant - Context Aware & Dockable */}
                {/* Placed here as a flex sibling to allow layout shifts when docked */}
                <BrandAssistant
                    isStudioMode={isStudioMode}
                    toggleStudioMode={() => setIsStudioMode(!isStudioMode)}
                />
             </ProjectProvider>
        </div>
      </main>
    </div>
  );
}
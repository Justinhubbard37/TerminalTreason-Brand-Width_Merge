import React, { useState } from 'react';
import { ImageGenerator } from './assets/ImageGenerator.tsx';
import { VideoGenerator } from './assets/VideoGenerator.tsx';
import { Image, Video, Film } from 'lucide-react';

interface AssetStudioProps {
  projectId: string;
}

type AssetTab = 'image' | 'video';

const AssetStudio: React.FC<AssetStudioProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<AssetTab>('image');

  return (
    <div className="h-full flex flex-col relative">
        {/* Navigation Tabs - Top Right */}
        <div className="flex justify-end mb-4 shrink-0">
            <div className="flex bg-graphite-950/80 backdrop-blur border border-white/5 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('image')}
                    className={`
                        flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-200
                        ${activeTab === 'image'
                            ? 'bg-cloudy-sky-500 text-white shadow-lg shadow-cloudy-sky-500/25'
                            : 'text-graphite-400 hover:text-white hover:bg-white/5'
                        }
                    `}
                >
                    <Image size={14}/>
                    Visual Foundry
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    className={`
                        flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all duration-200
                        ${activeTab === 'video'
                            ? 'bg-cloudy-sky-500 text-white shadow-lg shadow-cloudy-sky-500/25'
                            : 'text-graphite-400 hover:text-white hover:bg-white/5'
                        }
                    `}
                >
                    <Film size={14}/>
                    Motion Lab
                </button>
            </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-hidden relative animate-fade-in">
            {activeTab === 'image' ? (
                <ImageGenerator />
            ) : (
                <VideoGenerator />
            )}
        </div>
    </div>
  );
};

export default AssetStudio;
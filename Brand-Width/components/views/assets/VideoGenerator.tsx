import React, { useState } from 'react';
import { useProject } from '../../../contexts/ProjectContext.tsx';
import { ApiService } from '../../../services/api.ts';
import { GeneratedAsset } from '../../../types.ts';
import { generateId } from '../../../services/storage.ts';
import { Film, Download, Loader, Sparkles, Layers, Zap } from 'lucide-react';

export const VideoGenerator: React.FC = () => {
  const { brandPolicy, assets, saveAsset } = useProject();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [modelType, setModelType] = useState<'fast' | 'quality'>('fast');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null);

  // Filter assets for this view
  const generatedAssets = assets.filter(a => a.type === 'video');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // API Key Check for Veo
    const aistudio = (window as any).aistudio;
    if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
            try {
                await aistudio.openSelectKey();
                // Assume success as per instructions and proceed immediately
            } catch (e) {
                alert('Billing enabled API Key is required for Veo models.');
                return;
            }
        }
    }

    setIsGenerating(true);
    setStatusMessage('Initializing Veo Protocol...');

    // Inject Brand Context
    const structuralPrompt = `
      Cinematic video.
      Subject: ${prompt}
      Style Guidelines: ${brandPolicy.toneRules.join(', ')}.
      Aesthetic: Professional, high-fidelity, structural.
      Movement: Smooth, steady, purposeful.
    `;

    try {
        const loadingMessages = [
            "Aligning vector space...",
            "Synthesizing frames...",
            "Checking brand alignment...",
            "Finalizing render..."
        ];

        // Simple interval to rotate messages while waiting
        const msgInterval = setInterval(() => {
            setStatusMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        }, 4000);

        const res = await ApiService.generateVideo(structuralPrompt, modelType, aspectRatio);

        clearInterval(msgInterval);

        if (res.success && res.data) {
            const newAsset: GeneratedAsset = {
                id: generateId(),
                type: 'video',
                prompt: prompt,
                url: res.data, // Data URL
                createdAt: Date.now(),
                meta: { aspectRatio, model: modelType }
            };
            saveAsset(newAsset);
            setSelectedAsset(newAsset);
        } else {
            alert('Generation failed: ' + res.error);
        }
    } catch (e: any) {
        alert('System Error: ' + e.message);
    } finally {
        setIsGenerating(false);
        setStatusMessage('');
    }
  };

  const handleDownload = (asset: GeneratedAsset) => {
      const link = document.createElement('a');
      link.href = asset.url;
      link.download = `brand_motion_${asset.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="flex h-full gap-6">
        {/* Left: Controls - Expanded to w-1/2 for better utilization of space */}
        <div className="w-1/2 flex flex-col space-y-6">
            <div>
                <h2 className="text-xl font-bold font-mono text-azure-mist-50">MOTION_LAB</h2>
                <p className="text-graphite-400 text-sm mt-1">Generative video powered by Veo.</p>
            </div>

            <div className="bg-graphite-800 p-5 rounded-xl border border-graphite-600 shadow-sm space-y-5">

                {/* Model Selector */}
                <div>
                    <label className="block text-xs font-bold text-graphite-400 uppercase mb-2">Model Architecture</label>
                    <div className="flex bg-graphite-950 p-1 rounded-lg border border-white/5">
                        <button
                            onClick={() => setModelType('fast')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${
                                modelType === 'fast'
                                ? 'bg-graphite-800 text-mint-leaf-400 shadow-sm border border-white/5'
                                : 'text-graphite-500 hover:text-white'
                            }`}
                        >
                            <Zap size={12} /> Veo Fast
                        </button>
                        <button
                            onClick={() => setModelType('quality')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold transition-all ${
                                modelType === 'quality'
                                ? 'bg-graphite-800 text-cloudy-sky-400 shadow-sm border border-white/5'
                                : 'text-graphite-500 hover:text-white'
                            }`}
                        >
                            <Sparkles size={12} /> Veo Pro
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-graphite-400 uppercase mb-2">Motion Prompt</label>
                    <textarea
                        className="w-full bg-graphite-950 border border-graphite-600 rounded-lg p-3 text-sm text-azure-mist-50 focus:border-cloudy-sky-500 outline-none resize-y h-48 leading-relaxed placeholder:text-graphite-600"
                        placeholder="Describe the motion and subject..."
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-graphite-400 uppercase mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                        {['16:9', '9:16'].map((ratio: any) => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`flex-1 py-1.5 rounded text-xs font-mono font-bold border transition-all ${
                                    aspectRatio === ratio
                                    ? 'bg-cloudy-sky-500/20 border-cloudy-sky-500 text-cloudy-sky-400'
                                    : 'bg-graphite-950 border-white/10 text-graphite-400 hover:bg-white/5'
                                }`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={12} className="text-mint-leaf-400"/>
                        <span className="text-[10px] font-bold text-mint-leaf-400 uppercase tracking-wide">Brand Policy Active</span>
                    </div>
                    <p className="text-xs text-graphite-500 leading-snug">
                        System automatically injects structural tone rules into video generation pipeline.
                    </p>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className="w-full bg-cloudy-sky-500 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-cloudy-sky-600 transition-all shadow-lg shadow-cloudy-sky-500/20 disabled:opacity-50 disabled:shadow-none"
                >
                    {isGenerating ? <Loader className="animate-spin w-4 h-4"/> : <Film className="w-4 h-4"/>}
                    {isGenerating ? 'Fabricating...' : 'Generate Video'}
                </button>
            </div>
        </div>

        {/* Right: Gallery & Preview */}
        <div className="flex-1 flex flex-col bg-graphite-800/50 rounded-xl border border-white/5 overflow-hidden">
             {selectedAsset ? (
                 <div className="flex-1 relative flex items-center justify-center bg-graphite-950/50 p-6">
                     <video
                        src={selectedAsset.url}
                        controls
                        autoPlay
                        loop
                        className="max-w-full max-h-full rounded shadow-2xl border border-white/5"
                     />

                     <div className="absolute bottom-6 right-6 flex gap-2">
                         <button
                            onClick={() => handleDownload(selectedAsset)}
                            className="p-3 bg-graphite-900/90 backdrop-blur text-white rounded-lg border border-white/10 hover:bg-cloudy-sky-500 hover:border-cloudy-sky-500 transition-all shadow-xl"
                            title="Download MP4"
                         >
                             <Download size={20} />
                         </button>
                     </div>
                 </div>
             ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-graphite-500">
                     {isGenerating ? (
                         <div className="text-center animate-pulse">
                             <Loader size={48} className="mb-4 mx-auto animate-spin text-cloudy-sky-400"/>
                             <h3 className="text-lg font-bold text-azure-mist-50 mb-1">Generating Video</h3>
                             <p className="font-mono text-sm text-cloudy-sky-400">{statusMessage}</p>
                             <p className="text-xs text-graphite-500 mt-4">This process may take 1-2 minutes.</p>
                         </div>
                     ) : (
                         <>
                            <Layers size={48} className="mb-4 opacity-20"/>
                            <p className="font-mono text-sm">Awaiting motion parameters.</p>
                         </>
                     )}
                 </div>
             )}

             {/* History Strip */}
             <div className="h-24 bg-graphite-900 border-t border-white/5 p-3 flex gap-3 overflow-x-auto custom-scrollbar">
                 {generatedAssets.map(asset => (
                     <button
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`relative aspect-video h-full rounded-lg overflow-hidden border transition-all bg-black ${
                            selectedAsset?.id === asset.id ? 'border-cloudy-sky-500 ring-2 ring-cloudy-sky-500/20' : 'border-white/5 hover:border-white/20'
                        }`}
                     >
                         <video src={asset.url} className="w-full h-full object-cover pointer-events-none" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                             <Film size={12} className="text-white/50" />
                         </div>
                     </button>
                 ))}
             </div>
        </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useProject } from '../../../contexts/ProjectContext.tsx';
import { ApiService } from '../../../services/api.ts';
import { GeneratedAsset } from '../../../types.ts';
import { generateId } from '../../../services/storage.ts';
import { Wand2, Download, Maximize2, Loader, Image as ImageIcon, Sparkles, Layers } from 'lucide-react';

export const ImageGenerator: React.FC = () => {
  const { brandPolicy, assets, saveAsset, isBusy: projectBusy } = useProject();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null);

  // Filter assets for this view
  const generatedAssets = assets.filter(a => a.type === 'image');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    // Inject Brand Context into prompt structure
    // We append branding to ensure style consistency without user needing to type it
    const structuralPrompt = `
      Create a high-fidelity marketing image.
      Subject: ${prompt}
      Style Guidelines: ${brandPolicy.toneRules.join(', ')}.
      Brand Aesthetic: Professional, structural, engineered, clear.
      Avoid: ${brandPolicy.doAndDonts.dont.join(', ')}.
    `;

    try {
        const res = await ApiService.generateImage(structuralPrompt, aspectRatio);
        if (res.success && res.data) {
            const newAsset: GeneratedAsset = {
                id: generateId(),
                type: 'image',
                prompt: prompt,
                url: `data:image/png;base64,${res.data}`,
                createdAt: Date.now(),
                meta: { aspectRatio }
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
    }
  };

  const handleDownload = (asset: GeneratedAsset) => {
      const link = document.createElement('a');
      link.href = asset.url;
      link.download = `brand_asset_${asset.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="flex h-full gap-6">
        {/* Left: Controls - Expanded to w-1/2 for better utilization of space */}
        <div className="w-1/2 flex flex-col space-y-6">
            <div>
                <h2 className="text-xl font-bold font-mono text-azure-mist-50">VISUAL_FOUNDRY</h2>
                <p className="text-graphite-400 text-sm mt-1">Generative media aligned with Brand Policy.</p>
            </div>

            <div className="bg-graphite-800 p-5 rounded-xl border border-graphite-600 shadow-sm space-y-4">
                <div>
                    <label className="block text-xs font-bold text-graphite-400 uppercase mb-2">Core Concept</label>
                    <textarea
                        className="w-full bg-graphite-950 border border-graphite-600 rounded-lg p-3 text-sm text-azure-mist-50 focus:border-cloudy-sky-500 outline-none resize-y h-48 leading-relaxed placeholder:text-graphite-600"
                        placeholder="Describe the structural subject..."
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-graphite-400 uppercase mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                        {['1:1', '16:9', '9:16', '3:4', '4:3'].map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-all ${
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
                        System will automatically enforce tone rules: <span className="text-graphite-400 italic">{brandPolicy.toneRules.slice(0,3).join(', ')}...</span>
                    </p>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className="w-full bg-cloudy-sky-500 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-cloudy-sky-600 transition-all shadow-lg shadow-cloudy-sky-500/20 disabled:opacity-50 disabled:shadow-none"
                >
                    {isGenerating ? <Loader className="animate-spin w-4 h-4"/> : <Wand2 className="w-4 h-4"/>}
                    Render Asset
                </button>
            </div>
        </div>

        {/* Right: Gallery & Preview */}
        <div className="flex-1 flex flex-col bg-graphite-800/50 rounded-xl border border-white/5 overflow-hidden">
             {selectedAsset ? (
                 <div className="flex-1 relative flex items-center justify-center bg-graphite-950/50 p-6">
                     <img
                        src={selectedAsset.url}
                        alt={selectedAsset.prompt}
                        className="max-w-full max-h-full object-contain rounded shadow-2xl border border-white/5"
                     />

                     <div className="absolute bottom-6 right-6 flex gap-2">
                         <button
                            onClick={() => handleDownload(selectedAsset)}
                            className="p-3 bg-graphite-900/90 backdrop-blur text-white rounded-lg border border-white/10 hover:bg-cloudy-sky-500 hover:border-cloudy-sky-500 transition-all shadow-xl"
                            title="Download PNG"
                         >
                             <Download size={20} />
                         </button>
                     </div>
                 </div>
             ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-graphite-500">
                     <Layers size={48} className="mb-4 opacity-20"/>
                     <p className="font-mono text-sm">Awaiting fabrication parameters.</p>
                 </div>
             )}

             {/* History Strip */}
             <div className="h-24 bg-graphite-900 border-t border-white/5 p-3 flex gap-3 overflow-x-auto custom-scrollbar">
                 {generatedAssets.map(asset => (
                     <button
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`relative aspect-square h-full rounded-lg overflow-hidden border transition-all ${
                            selectedAsset?.id === asset.id ? 'border-cloudy-sky-500 ring-2 ring-cloudy-sky-500/20' : 'border-white/5 hover:border-white/20'
                        }`}
                     >
                         <img src={asset.url} className="w-full h-full object-cover" />
                     </button>
                 ))}
             </div>
        </div>
    </div>
  );
};
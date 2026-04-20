import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage.ts';
import { Lock, Server, Save, Trash2, Eye, EyeOff, Check } from 'lucide-react';

interface SettingsProps {
  isMock: boolean;
  toggleMock: () => void;
}

const SettingsView: React.FC<SettingsProps> = ({ isMock, toggleMock }) => {
  const [runnerUrl, setRunnerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setRunnerUrl(StorageService.getRunnerUrl());
    const k = StorageService.getApiKey();
    // Load the key into state so it appears in the input (masked by default)
    setApiKey(k || '');
    setHasKey(!!k);
  }, []);

  const handleSave = () => {
    StorageService.setRunnerUrl(runnerUrl);

    // Only save if key is present
    if (apiKey.trim()) {
        StorageService.setApiKey(apiKey.trim());
        setHasKey(true);
    }
  };

  const handleDeleteKey = () => {
      // Immediate deletion without confirmation or alerts
      StorageService.removeApiKey();
      setHasKey(false);
      setApiKey('');
  };

  const isSaveDisabled = !apiKey.trim();

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
         <div>
            <h2 className="text-2xl font-bold font-mono text-azure-mist-50">SYSTEM_CONFIG</h2>
            <p className="text-graphite-400 text-sm mt-1">Local runner configuration and secure key storage.</p>
        </div>

        <div className="bg-graphite-800 p-6 rounded border border-graphite-600 shadow-sm space-y-6">
            <div>
                <h3 className="font-bold text-cloudy-sky-400 flex items-center mb-4">
                    <Server className="w-4 h-4 mr-2"/> Local Runner Endpoint
                </h3>
                <input
                    className="w-full bg-graphite-950 border border-graphite-600 text-azure-mist-50 p-2 rounded font-mono text-sm focus:border-cloudy-sky-500 outline-none"
                    value={runnerUrl}
                    onChange={e => setRunnerUrl(e.target.value)}
                    placeholder="http://127.0.0.1:3000"
                />
                <p className="text-xs text-graphite-400 mt-2">
                    Must point to a localhost instance. External remote calls are blocked by policy.
                </p>
            </div>

            <div className="pt-6 border-t border-graphite-600">
                <h3 className="font-bold text-cloudy-sky-400 flex items-center mb-4">
                    <Lock className="w-4 h-4 mr-2"/> BYOK Configuration
                </h3>
                <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                        <input
                            type={isVisible ? "text" : "password"}
                            className="w-full bg-graphite-950 border border-graphite-600 text-azure-mist-50 p-2 pr-10 rounded font-mono text-sm focus:border-cloudy-sky-500 outline-none transition-all"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                            placeholder="Enter Gemini API Key"
                        />
                        <button
                            type="button"
                            onClick={() => setIsVisible(!isVisible)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-graphite-400 hover:text-white transition-colors"
                            title={isVisible ? "Hide Key" : "Show Key"}
                        >
                            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {hasKey && (
                        <button
                            type="button"
                            onClick={handleDeleteKey}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded transition-colors flex-shrink-0"
                            title="Delete API Key"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
                {hasKey && <span className="text-mint-leaf-500 text-xs font-bold mt-2 inline-block animate-fade-in">✓ KEY PRESENT IN LOCAL STORAGE</span>}
            </div>

             <div className="pt-6 border-t border-graphite-600 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-azure-mist-50/70">Mock Mode</span>
                    <button
                        type="button"
                        onClick={toggleMock}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${isMock ? 'bg-mint-leaf-500' : 'bg-graphite-600'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${isMock ? 'translate-x-6' : ''}`}></div>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaveDisabled}
                    className={`px-6 py-2 rounded flex items-center font-medium transition-colors ${
                        isSaveDisabled
                        ? 'bg-graphite-700 text-graphite-400 cursor-not-allowed'
                        : hasKey
                            ? 'bg-mint-leaf-500 text-white'
                            : 'bg-cloudy-sky-500 text-white hover:bg-cloudy-sky-600'
                    }`}
                >
                    {hasKey ? (
                        <><Check className="w-4 h-4 mr-2"/> Saved</>
                    ) : (
                        <><Save className="w-4 h-4 mr-2"/> Save Configuration</>
                    )}
                </button>
            </div>
        </div>
    </div>
  );
};

export default SettingsView;
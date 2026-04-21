import { StorageService, generateId } from './storage.ts';
import { LLMRequest, RunnerResponse, SearchRequest, LeadFindRequest, Lead, Source, LeadScoreRequest, ChatterMineRequest, OpportunityCluster } from '../types.ts';
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";

// Mock Mode Flag
let MOCK_MODE = false;

export const setMockMode = (enabled: boolean) => {
  MOCK_MODE = enabled;
};

export const getMockMode = () => MOCK_MODE;

// Safe API Key Retrieval Helper
const getSafeApiKey = (): string => {
  const localKey = StorageService.getApiKey();
  if (localKey) return localKey;

  try {
    // Safe check for process.env (Node/Bundler) or window.process (Polyfill)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceErrors
  }

  return '';
};

// Tool Definition for Protocol State Reporting
const reportActiveProtocolTool: FunctionDeclaration = {
  name: 'report_active_protocol',
  description: 'Call this function to report when you have identified and are executing a specific protocol from the library.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      protocol_id: {
        type: Type.STRING,
        description: 'The exact ID of the protocol being executed.'
      },
      reasoning: {
        type: Type.STRING,
        description: 'Brief reason for selecting this protocol.'
      }
    },
    required: ['protocol_id']
  }
};

const callRunner = async <T>(endpoint: string, body: any): Promise<RunnerResponse<T>> => {
  const runnerUrl = StorageService.getRunnerUrl();
  const apiKey = getSafeApiKey();

  if (MOCK_MODE) {
    console.log(`[MOCK API] POST ${endpoint}`, body);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
    return handleMock(endpoint, body);
  }

  try {
    const response = await fetch(`${runnerUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey // Pass key to runner
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Runner Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("API Call Failed", err);
    // Auto-fallback to mock could be dangerous if unintended, but for dev UX we might just throw or return error
    return { success: false, error: err.message || 'Connection failed. Ensure Runner is active or switch to Mock Mode.' };
  }
};

const handleMock = (endpoint: string, body: any): RunnerResponse<any> => {
  switch (endpoint) {
    case '/api/llm/generate':
      return {
        success: true,
        data: `[MOCK GENERATION]\n\nBased on the task "${body.task}" and constraints:\n\nThis is a structured response following the Architect protocol. We have analyzed the input and determined a path forward.\n\n1. Analysis: The system is functional.\n2. Protocol: Deploy assets immediately.\n\nEnd of Line.`
      };
    case '/api/web/search':
      return {
        success: true,
        data: [
          {
            url: 'https://example.com/industry-report',
            title: '2025 Industry Structural Analysis',
            snippet: 'The market is shifting from growth-at-all-costs to unit-economics sovereignty...',
            timestamp: Date.now(),
            tags: ['market', 'analysis']
          },
          {
            url: 'https://example.com/competitor-fail',
            title: 'Why Generic Wrappers Are Failing',
            snippet: 'Customers are churning from template-based tools in favor of custom infrastructure...',
            timestamp: Date.now(),
            tags: ['competitor', 'weakness']
          }
        ]
      };
    case '/api/leads/find':
      return {
        success: true,
        data: [
          {
            company: 'Alpha Structures',
            site: 'alphastruct.io',
            niche: 'SaaS Infrastructure',
            painSignal: 'Complaining about cloud vendor lock-in',
            contactChannels: 'founder@alphastruct.io',
            notes: 'High intent signal detected.',
            score: 0,
            evidenceLinks: [],
            status: 'new'
          }
        ]
      };
    case '/api/leads/score':
      return {
        success: true,
        data: {
          score: 85,
          notes: 'High fit. Demonstrates urgent need for sovereignty. Budget likely available.'
        }
      };
    case '/api/chatter/mine':
        return {
            success: true,
            data: [
                 {
                    id: 'clust-1',
                    name: 'API Fatigue',
                    problem: 'Developers are tired of breaking changes in major APIs.',
                    frequency: 'high',
                    intensity: 'medium',
                    existingSolutions: 'Manual migration scripts (fragile)',
                    signals: []
                 }
            ]
        }
    default:
      return { success: false, error: 'Endpoint not mocked' };
  }
};

export const ApiService = {
  generate: (req: LLMRequest) => callRunner<string>('/api/llm/generate', req),
  search: (req: SearchRequest) => callRunner<Source[]>('/api/web/search', req),
  findLeads: (req: LeadFindRequest) => callRunner<Partial<Lead>[]>('/api/leads/find', req),
  scoreLead: (req: LeadScoreRequest) => callRunner<{score: number, notes: string}>('/api/leads/score', req),
  mineChatter: (req: ChatterMineRequest) => callRunner<OpportunityCluster[]>('/api/chatter/mine', req),

  // Gemini Chat
  chatWithBrandAgent: async (params: {
    history: {role: string, parts: {text: string}[]}[],
    message: string,
    context: string,
    thinking: boolean,
    onProtocolDetected?: (protocolId: string) => void
  }) => {
    // Check if we have a key locally to use Gemini directly
    const apiKey = getSafeApiKey();

    // Fallback to Mock if no key or MOCK_MODE is forced
    if (MOCK_MODE || !apiKey) {
       console.log('[MOCK CHAT] No API Key or Mock Mode enabled.');
       await new Promise(r => setTimeout(r, 1000));

       // SIMULATE HANDSHAKE FOR TESTING
       // If the message looks like a protocol trigger, we manually fire the callback
       const lowerMsg = params.message.toLowerCase();
       if (lowerMsg.includes('protocol') || lowerMsg.includes('launch') || lowerMsg.includes('deploy')) {
           console.log('[MOCK AGENT] Simulating protocol detection...');
           if (params.onProtocolDetected) {
               // We assume a 'proto-alpha' ID exists for testing (added via Seed Defaults)
               params.onProtocolDetected('proto-alpha');
           }
           return "ACKNOWLEDGED. \n\nI have identified the 'Alpha Launch' protocol in your request. State reporting is active. \n\nPHASE 1: INITIALIZATION\nSystem is ready to execute defined logic.";
       }

       return "I am the Brand-Width Agent (Mock). I can help you structure your marketing assets. \n\n*Note: Add a valid Gemini API Key in Settings to enable the live gemini-3-pro-preview model.*";
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const config: any = {
            systemInstruction: params.context,
            tools: [{ functionDeclarations: [reportActiveProtocolTool] }]
        };

        if (params.thinking) {
            // Enable thinking mode with max budget for Gemini 3 Pro
            config.thinkingConfig = { thinkingBudget: 32768 };
        }

        const chat = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config,
            history: params.history
        });

        let result = await chat.sendMessage({ message: params.message });

        // Handle Function Calls (State Reporting Handshake)
        if (result.functionCalls && result.functionCalls.length > 0) {
            const functionResponses = [];

            for (const call of result.functionCalls) {
                if (call.name === 'report_active_protocol') {
                    const pid = call.args['protocol_id'];
                    console.log(`[AGENT HANDSHAKE] Protocol Identified: ${pid}`);

                    if (pid && params.onProtocolDetected) {
                        params.onProtocolDetected(pid as string);
                    }

                    functionResponses.push({
                        functionResponse: {
                            name: 'report_active_protocol',
                            id: call.id, // Explicitly map the Call ID to the Response ID
                            response: { status: 'acknowledged', action: 'ui_updated' }
                        }
                    });
                }
            }

            // If we processed function calls, we must send the results back to get the final text response
            if (functionResponses.length > 0) {
                 // Fix: Wrap functionResponses in a message object as required by the SDK
                 result = await chat.sendMessage({ message: functionResponses });
            }
        }

        return result.text;
    } catch (e: any) {
        console.error("Gemini Chat Error", e);
        return `Error: ${e.message}`;
    }
  },

  // Image Generation
  generateImage: async (prompt: string, aspectRatio: string = "1:1") => {
    const apiKey = getSafeApiKey();
    if (MOCK_MODE || !apiKey) {
        console.log('[MOCK IMAGE] Generating image...');
        await new Promise(r => setTimeout(r, 2000));
        // Return a placeholder structure
        return {
            success: true,
            data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" // 1x1 pixel transparent
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview', // High quality model
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: "1K"
                }
            }
        });

        // Parse response to find image data
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return { success: true, data: part.inlineData.data };
            }
        }
        return { success: false, error: "No image data returned." };
    } catch (e: any) {
        console.error("Image Gen Error", e);
        return { success: false, error: e.message };
    }
  },

  // Video Generation
  generateVideo: async (prompt: string, model: 'fast' | 'quality' = 'fast', aspectRatio: '16:9' | '9:16' = '16:9'): Promise<RunnerResponse<string>> => {
      const apiKey = getSafeApiKey();
      if (MOCK_MODE || !apiKey) {
          console.log('[MOCK VIDEO] Generating video...');
          await new Promise(r => setTimeout(r, 4000));
          return { success: false, error: "Mock mode enabled. Real video requires active Veo API Key." };
      }

      const modelName = model === 'quality'
          ? 'veo-3.1-generate-preview'
          : 'veo-3.1-fast-generate-preview';

      try {
          // Re-instantiate with latest key to ensure fresh context from key selection
          const ai = new GoogleGenAI({ apiKey });

          console.log(`[VIDEO] Starting generation with ${modelName}`);

          let operation = await ai.models.generateVideos({
              model: modelName,
              prompt: prompt,
              config: {
                  numberOfVideos: 1,
                  resolution: '720p', // Safe default for both models
                  aspectRatio: aspectRatio
              }
          });

          // Polling Loop
          while (!operation.done) {
              await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
              operation = await ai.operations.getVideosOperation({ operation: operation });
          }

          const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
          if (!videoUri) {
              return { success: false, error: "Operation completed but no video URI returned." };
          }

          // Fetch the actual video bytes using the key
          const videoResponse = await fetch(`${videoUri}&key=${apiKey}`);
          if (!videoResponse.ok) {
              return { success: false, error: "Failed to download generated video." };
          }

          const blob = await videoResponse.blob();

          // Convert to base64 for local storage compatibility in this app architecture
          // In a real app, you'd store the blob or upload to cloud storage
          return new Promise<{success: boolean, data?: string, error?: string}>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  resolve({ success: true, data: reader.result as string });
              };
              reader.onerror = () => {
                  resolve({ success: false, error: "Failed to process video data." });
              };
              reader.readAsDataURL(blob);
          });

      } catch (e: any) {
          console.error("Video Gen Error", e);
          return { success: false, error: e.message };
      }
  },

  // Basic check to see if runner is up (optional)
  health: async () => {
      try {
          if (MOCK_MODE) return true;
          const runnerUrl = StorageService.getRunnerUrl();
          await fetch(runnerUrl);
          return true; // Any response is good enough for health check usually
      } catch {
          return false;
      }
  }
};
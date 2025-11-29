import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import type { ChatMessage, Transaction, Account, Goal } from '../types';
import { getFinancialAdvice, generateSpeech } from '../services/geminiService';

interface CoachChatProps {
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
}

const QUICK_ACTIONS = [
  "Why is my balance low?",
  "How can I save $200?",
  "Analyze my food spending",
  "Set a budget plan"
];

// Audio Utils for Live API
const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
};

const base64ToUint8Array = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const CoachChat: React.FC<CoachChatProps> = ({ transactions, accounts, goals }) => {
  const [mode, setMode] = useState<'text' | 'live'>('text');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hello! I'm FinLume Coach. How can I help you manage your income today?",
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  
  // Live API State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveVolume, setLiveVolume] = useState(0);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const inputContextRef = useRef<AudioContext | null>(null);
  const audioSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  
  // TTS Audio Context
  const ttsAudioCtxRef = useRef<AudioContext | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if(mode === 'text') scrollToBottom();
  }, [messages, mode]);

  // Cleanup Live API on unmount or mode switch
  useEffect(() => {
    return () => {
       disconnectLiveSession();
       if(ttsAudioCtxRef.current) ttsAudioCtxRef.current.close();
    };
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Call API
    const responseText = await getFinancialAdvice(
        text, 
        transactions, 
        goals, 
        accounts, 
        isThinkingMode
    );
    
    setIsTyping(false);
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: responseText || "Sorry, I couldn't process that.",
      timestamp: Date.now(),
      isThinking: isThinkingMode
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  const handlePlayTTS = async (messageId: string, text: string) => {
      // Initialize or resume TTS Audio Context
      if (!ttsAudioCtxRef.current) {
         ttsAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (ttsAudioCtxRef.current.state === 'suspended') {
          await ttsAudioCtxRef.current.resume();
      }

      setPlayingMessageId(messageId);
      // Clean text for speech (remove asterisks)
      const spokenText = text.replace(/\*\*/g, '').replace(/\*/g, '');
      const audioData = await generateSpeech(spokenText);
      
      if (audioData) {
          try {
            const ctx = ttsAudioCtxRef.current;
            const buffer = await ctx.decodeAudioData(base64ToUint8Array(audioData).buffer);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.onended = () => {
                setPlayingMessageId(null);
            };
            source.start(0);
          } catch(e) {
              console.error("Audio Playback Error", e);
              setPlayingMessageId(null);
          }
      } else {
          setPlayingMessageId(null);
      }
  };

  // --- Live API Logic ---
  const connectLiveSession = async () => {
    if (isLiveConnected) return;

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key missing");

        const ai = new GoogleGenAI({ apiKey });
        
        // Setup Audio Output
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        nextStartTimeRef.current = 0;
        audioSourcesRef.current = [];

        // Setup Audio Input
        inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = inputContextRef.current.createMediaStreamSource(stream);
        
        // Worklet/Processor for recording
        const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Calculate volume for visualizer
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            const rms = Math.sqrt(sum / inputData.length);
            setLiveVolume(Math.min(100, rms * 400)); // Scale for UI

            const pcm16 = floatTo16BitPCM(inputData);
            
            // Encode to base64
            let binary = '';
            const len = pcm16.byteLength;
            const bytes = new Uint8Array(pcm16.buffer);
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);

            if(liveSessionRef.current) {
                 liveSessionRef.current.sendRealtimeInput({
                    media: {
                        mimeType: 'audio/pcm;rate=16000',
                        data: base64
                    }
                });
            }
        };

        source.connect(processor);
        processor.connect(inputContextRef.current.destination);

        // Connect to Gemini Live
        const session = await ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                systemInstruction: `You are FinLume, a helpful financial assistant. Keep responses brief and conversational. The user is a freelancer.`
            },
            callbacks: {
                onopen: () => {
                    console.log("Live Session Open");
                    setIsLiveConnected(true);
                },
                onmessage: async (msg: any) => {
                    // Handle Interruption
                    const interrupted = msg.serverContent?.interrupted;
                    if (interrupted) {
                         audioSourcesRef.current.forEach(s => {
                             try { s.stop(); } catch(e) {}
                         });
                         audioSourcesRef.current = [];
                         nextStartTimeRef.current = 0;
                         return;
                    }

                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData && audioContextRef.current) {
                        const ctx = audioContextRef.current;
                        const bytes = base64ToUint8Array(audioData);
                        
                        // Decode raw PCM 24kHz
                        const dataInt16 = new Int16Array(bytes.buffer);
                        const float32 = new Float32Array(dataInt16.length);
                        for(let i=0; i<dataInt16.length; i++) {
                            float32[i] = dataInt16[i] / 32768.0;
                        }
                        
                        const buffer = ctx.createBuffer(1, float32.length, 24000);
                        buffer.copyToChannel(float32, 0);

                        const source = ctx.createBufferSource();
                        source.buffer = buffer;
                        source.connect(ctx.destination);
                        
                        const currentTime = ctx.currentTime;
                        const startTime = Math.max(currentTime, nextStartTimeRef.current);
                        source.start(startTime);
                        nextStartTimeRef.current = startTime + buffer.duration;
                        
                        // Track source for interruption handling
                        audioSourcesRef.current.push(source);
                        source.onended = () => {
                            audioSourcesRef.current = audioSourcesRef.current.filter(s => s !== source);
                        };
                    }
                },
                onclose: () => {
                    console.log("Live Session Closed");
                    setIsLiveConnected(false);
                },
                onerror: (err: any) => {
                    console.error("Live Session Error", err);
                    setIsLiveConnected(false);
                }
            }
        });
        
        liveSessionRef.current = session;

    } catch (err) {
        console.error("Failed to connect live", err);
        setIsLiveConnected(false);
    }
  };

  const disconnectLiveSession = () => {
      if (liveSessionRef.current) {
          try {
             // Try to close nicely
          } catch(e) {} 
          liveSessionRef.current = null;
      }
      if (inputContextRef.current) {
          inputContextRef.current.close();
          inputContextRef.current = null;
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }
      audioSourcesRef.current = [];
      setIsLiveConnected(false);
      setLiveVolume(0);
  };

  const toggleLive = () => {
      if (isLiveConnected) {
          disconnectLiveSession();
      } else {
          connectLiveSession();
      }
  };

  // Helper to format text with simple markdown (bold)
  const formatMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-brand-600 text-white shadow-md z-10">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-robot text-lg"></i>
                </div>
                <div>
                    <h3 className="font-bold text-lg">FinLume Coach</h3>
                    <p className="text-xs text-brand-100 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full block ${isLiveConnected ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></span> 
                    {isLiveConnected ? 'Live Audio' : 'Online'}
                    </p>
                </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex px-4 pb-0 gap-1">
              <button 
                onClick={() => { setMode('text'); disconnectLiveSession(); }}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
                    mode === 'text' ? 'bg-white text-brand-600' : 'bg-brand-700 text-brand-200 hover:text-white'
                }`}
              >
                  <i className="fa-solid fa-message mr-2"></i>Text Chat
              </button>
              <button 
                onClick={() => { setMode('live'); }}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
                    mode === 'live' ? 'bg-white text-brand-600' : 'bg-brand-700 text-brand-200 hover:text-white'
                }`}
              >
                  <i className="fa-solid fa-microphone-lines mr-2"></i>Live Voice
              </button>
          </div>
      </div>

      {mode === 'text' ? (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
                {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-line group relative ${
                    msg.role === 'user' 
                        ? 'bg-brand-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                    {msg.role === 'model' && (
                        <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-2">
                             <div className="flex items-center gap-2">
                                <i className="fa-solid fa-sparkles text-brand-500"></i>
                                {msg.isThinking && (
                                    <span className="text-[10px] uppercase font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded">Deep Think</span>
                                )}
                             </div>
                             <button 
                                onClick={() => handlePlayTTS(msg.id, msg.content)}
                                className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:bg-brand-50 hover:text-brand-600 flex items-center justify-center transition-colors"
                                title="Read Aloud"
                             >
                                <i className={`fa-solid ${playingMessageId === msg.id ? 'fa-spinner fa-spin' : 'fa-volume-high'}`}></i>
                             </button>
                        </div>
                    )}
                    {formatMessageText(msg.content)}
                    </div>
                </div>
                ))}
                {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-3">
                         {isThinkingMode && <span className="text-xs font-bold text-purple-600 animate-pulse">Thinking...</span>}
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                {/* Thinking Mode Toggle */}
                <div className="flex items-center justify-end mb-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors">
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${isThinkingMode ? 'bg-purple-600' : 'bg-slate-300'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isThinkingMode ? 'left-4.5' : 'left-0.5'}`} style={{ left: isThinkingMode ? '18px' : '2px' }}></div>
                        </div>
                        <input type="checkbox" className="hidden" checked={isThinkingMode} onChange={(e) => setIsThinkingMode(e.target.checked)} />
                        <i className="fa-solid fa-brain"></i> Deep Thinking
                    </label>
                </div>

                {messages.length < 3 && (
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                        {QUICK_ACTIONS.map((action, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSend(action)}
                                className="whitespace-nowrap px-4 py-2 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 rounded-full text-xs font-medium text-slate-600 transition-colors border border-slate-200"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex gap-2 relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                    placeholder={isThinkingMode ? "Ask a complex financial question..." : "Ask anything about your finances..."}
                    className={`flex-1 p-4 pr-12 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:bg-white transition-all shadow-inner ${isThinkingMode ? 'focus:ring-purple-500' : 'focus:ring-brand-500'}`}
                />
                <button 
                    onClick={() => handleSend(inputValue)}
                    disabled={!inputValue.trim() || isTyping}
                    className={`absolute right-2 top-2 bottom-2 aspect-square text-white rounded-lg transition-colors flex items-center justify-center shadow-md ${isThinkingMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-brand-600 hover:bg-brand-700'} disabled:bg-slate-300`}
                >
                    <i className="fa-solid fa-paper-plane"></i>
                </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                    {isThinkingMode ? 'Thinking mode analyzes deeper but takes longer.' : 'AI can make mistakes. Please verify important financial decisions.'}
                </p>
            </div>
          </>
      ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 relative overflow-hidden">
               {/* Visualizer Background */}
               {isLiveConnected && (
                   <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                       <div className="w-64 h-64 bg-brand-500 rounded-full blur-3xl animate-pulse" style={{ transform: `scale(${1 + liveVolume/50})` }}></div>
                   </div>
               )}

               <div className="z-10 text-center space-y-8">
                   <div className="relative">
                       <button 
                            onClick={toggleLive}
                            className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all duration-300 ${
                                isLiveConnected 
                                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                                    : 'bg-brand-600 text-white hover:scale-105 hover:bg-brand-700'
                            }`}
                       >
                           <i className={`fa-solid ${isLiveConnected ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                       </button>
                       {isLiveConnected && (
                           <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping opacity-50 pointer-events-none"></div>
                       )}
                   </div>

                   <div>
                       <h2 className="text-2xl font-bold text-slate-800">
                           {isLiveConnected ? "Listening..." : "Tap to Speak"}
                       </h2>
                       <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                           {isLiveConnected 
                             ? "Have a natural conversation. I'm listening to your questions." 
                             : "Start a real-time voice session to discuss your finances hands-free."}
                       </p>
                   </div>
               </div>
          </div>
      )}
    </div>
  );
};

export default CoachChat;
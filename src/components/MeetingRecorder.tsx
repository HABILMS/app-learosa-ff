import { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, Square, Save, RotateCcw, Languages, Sparkles, Loader2, Brain } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useTranscription } from '../hooks/useTranscription';
import { cn } from '../lib/utils';
import { TranscriptSegment } from '../types';

const LANGUAGES = [
  { code: 'pt-BR', name: 'Português' },
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'it-IT', name: 'Italiano' },
];

interface MeetingRecorderProps {
  onSave: (segments: TranscriptSegment[], audioUrl?: string | null) => void;
}

export function MeetingRecorder({ onSave }: MeetingRecorderProps) {
  const [lang, setLang] = useState(() => localStorage.getItem('pro_lang') || 'pt-BR');
  const { isRecording, segments, setSegments, interimText, audioUrl, audioBlob, startRecording, stopRecording, captureMode, setCaptureMode } = useTranscription(lang);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('pro_lang', newLang);
  };

  const handleTranscribeWithAI = async () => {
    if (!audioBlob) return;
    setIsProcessingAI(true);
    
    try {
        const blobToBase64 = (blob: Blob): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              resolve(base64String.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        };

        const base64Audio = await blobToBase64(audioBlob);
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            {
              inlineData: {
                mimeType: audioBlob.type || 'audio/webm',
                data: base64Audio
              }
            },
            { text: `Transcribe this audio precisely. Important: Provide ONLY the transcription text without any markdown or formatting blocks like \`\`\`. The audio language is likely ${lang || 'pt-BR'}, so return the transcription in that language. Add paragraph breaks for natural pauses or speaker changes.` }
          ]
        });
        
        if (response.text) {
          // Create a new segment representing the full AI transcription
          setSegments([{
            id: Math.random().toString(36).substr(2, 9),
            text: response.text,
            timestamp: Date.now(),
          }]);
        }
    } catch (err) {
      console.error(err);
      alert('Erro ao processar áudio com IA. Tente novamente.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleSummarizeWithNvidia = async () => {
    if (segments.length === 0) return;
    setIsProcessingAI(true);
    try {
      const fullText = segments.map(s => s.text).join('\n\n');
      
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, lang })
      });
      
      if (!res.ok) {
        throw new Error('Falha na API da NVIDIA');
      }
      
      const data = await res.json();
      
      if (data.summary) {
        setSegments(prev => [
          ...prev, 
          {
            id: Math.random().toString(36).substr(2, 9),
            text: `=== RESUMO (NVIDIA AI) ===\n\n${data.summary}`,
            timestamp: Date.now(),
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao resumir transcrição. Verifique se a NVIDIA_API_KEY está configurada.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto py-8">
      {/* Header with Selectors */}
      <div className="flex items-center justify-between px-6 mb-4 flex-wrap gap-4">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", isRecording ? "bg-red-500 animate-pulse" : "bg-white/10")} />
          {isRecording ? "Gravando" : "Pronto para gravar"}
        </h2>

        <div className="flex items-center gap-2">
          {/* Capture Mode Toggle */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setCaptureMode('mic')}
                disabled={isRecording}
                className={cn(
                  "px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all",
                  captureMode === 'mic' ? "bg-white text-black" : "text-white/40 hover:text-white/60"
                )}
              >
                Mic
              </button>
              <button
                onClick={() => setCaptureMode('system')}
                disabled={isRecording}
                className={cn(
                  "px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all",
                  captureMode === 'system' ? "bg-white text-black" : "text-white/40 hover:text-white/60"
                )}
              >
                Meeting
              </button>
            </div>
            {captureMode === 'system' && !isRecording && (
              <span className="text-[9px] text-blue-400 font-medium animate-pulse">
                Marque "Compartilhar áudio" ao iniciar
              </span>
            )}
          </div>

          <div className="relative group">
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white/60 focus-within:border-white/20 transition-all">
              <Languages className="w-4 h-4" />
              <select 
                value={lang} 
                onChange={(e) => handleLangChange(e.target.value)}
                disabled={isRecording}
                className="bg-transparent outline-none cursor-pointer disabled:cursor-not-allowed pr-4"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#050505]">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 px-4 scrollbar-hide py-10">
        {segments.length === 0 && !interimText && !isRecording && (
          <div className="h-full flex flex-col items-center justify-center text-white/20 text-center space-y-4">
            <Mic className="w-16 h-16 opacity-10" />
            <p className="text-xl font-medium">Toque no microfone para começar</p>
          </div>
        )}

        {isProcessingAI && (
          <div className="h-full flex flex-col items-center justify-center text-white/50 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
            <p className="text-lg font-medium animate-pulse">Processando áudio com IA. Isso pode levar alguns minutos...</p>
          </div>
        )}

        {!isProcessingAI && segments.map((segment) => (
          <motion.div
            key={segment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-1"
          >
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              {new Date(segment.timestamp).toLocaleTimeString()}
            </span>
            <p className="text-xl md:text-2xl font-light text-white/90 leading-relaxed whitespace-pre-wrap">
              {segment.text}
            </p>
          </motion.div>
        ))}

        {interimText && (
          <div className="flex flex-col gap-1 opacity-50">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              Em tempo real {captureMode === 'system' && '(Apenas seu microfone)'}
            </span>
            <p className="text-xl md:text-2xl font-light text-white leading-relaxed italic">
              {interimText}
            </p>
          </div>
        )}
      </div>

      <div className="p-8 glass-card bg-black/40 border-white/5 rounded-t-[40px] flex items-center justify-between gap-8">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex-1 btn-primary py-6 rounded-3xl group"
          >
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold">Iniciar Gravação</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 bg-red-500 text-white flex items-center justify-center gap-4 py-6 rounded-3xl active:scale-95 transition-all shadow-xl shadow-red-500/20"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
              <Square className="w-6 h-6 fill-white" />
            </div>
            <span className="text-xl font-bold">Parar Gravação</span>
          </button>
        )}

        {audioBlob && !isRecording && (
          <button
            onClick={handleTranscribeWithAI}
            disabled={isProcessingAI}
            className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-400/10 transition-colors disabled:opacity-50 relative"
            title="Transcrever Reunião com IA do Gemini"
          >
            {isProcessingAI ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          </button>
        )}

        {segments.length > 0 && !isRecording && (
          <button
            onClick={handleSummarizeWithNvidia}
            disabled={isProcessingAI}
            className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-purple-400 hover:bg-purple-400/10 transition-colors disabled:opacity-50"
            title="Organizar e Resumir com IA da NVIDIA"
          >
            {isProcessingAI ? <Loader2 className="w-6 h-6 animate-spin" /> : <Brain className="w-6 h-6" />}
          </button>
        )}

        {segments.length > 0 && !isRecording && (
          <button
            onClick={() => onSave(segments, audioUrl)}
            className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-green-400 hover:bg-green-400/10 transition-colors"
            title="Salvar Módulo"
          >
            <Save className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
}

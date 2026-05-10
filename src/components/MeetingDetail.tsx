import { motion } from 'motion/react';
import { ArrowLeft, Download, Sparkles, Share2, Trash2, FileAudio } from 'lucide-react';
import { Meeting } from '../types';
import ReactMarkdown from 'react-markdown';

interface MeetingDetailProps {
  meeting: Meeting;
  onBack: () => void;
  onDelete: (id: string) => void;
  onSummarize: (id: string) => void;
  isSummarizing: boolean;
}

export function MeetingDetail({ meeting, onBack, onDelete, onSummarize, isSummarizing }: MeetingDetailProps) {
  const exportTranscription = () => {
    const text = meeting.transcript.map(s => `[${new Date(s.timestamp).toLocaleTimeString()}] ${s.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcricao-${meeting.title || 'reuniao'}.txt`;
    a.click();
  };

  const exportAudio = () => {
    if (!meeting.audioUrl) return;
    const a = document.createElement('a');
    a.href = meeting.audioUrl;
    a.download = `audio-${meeting.title || 'reuniao'}.webm`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-8 h-full flex flex-col">
      <header className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 glass rounded-2xl hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex gap-2">
          {meeting.audioUrl && (
            <button onClick={exportAudio} className="btn-secondary text-blue-400">
              <FileAudio className="w-5 h-5" />
              Áudio
            </button>
          )}
          <button 
            onClick={() => onSummarize(meeting.id)}
            disabled={isSummarizing || !!meeting.summary}
            className="btn-secondary disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Resumo
          </button>
          <button onClick={exportTranscription} className="btn-secondary">
            <Download className="w-5 h-5" />
            Exportar
          </button>
          <button onClick={() => onDelete(meeting.id)} className="p-3 glass rounded-2xl text-red-400 hover:bg-red-400/10 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-12 pb-20 scrollbar-hide">
        <section className="space-y-2">
          <h1 className="text-4xl font-serif italic text-white leading-tight">
            {meeting.title || 'Nova Reunião'}
          </h1>
          <div className="flex items-center gap-4 text-white/40 font-mono text-xs uppercase tracking-widest">
            <span>{new Date(meeting.createdAt).toLocaleString()}</span>
            <span>•</span>
            <span>{Math.floor(meeting.duration / 60)}min {meeting.duration % 60}s</span>
          </div>
        </section>

        {isSummarizing && (
          <div className="glass-card bg-purple-500/10 border-purple-500/20 p-8 flex flex-col items-center gap-4 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-purple-400" />
            </motion.div>
            <p className="text-purple-200 font-medium tracking-wide">A IA está processando o resumo da sua reunião...</p>
          </div>
        )}

        {meeting.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card bg-purple-500/5 border-purple-500/10 p-8 space-y-4"
          >
            <div className="flex items-center gap-2 text-purple-400 mb-4">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-xs">AI Resumo Executivo</h3>
            </div>
            <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:text-white">
              <ReactMarkdown>{meeting.summary}</ReactMarkdown>
            </div>
          </motion.div>
        )}

        <section className="space-y-8">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-white/20">Transcrição Completa</h3>
          <div className="space-y-10">
            {meeting.transcript.map((segment) => (
              <div key={segment.id} className="flex gap-8 group">
                <span className="text-[10px] font-mono text-white/20 w-12 pt-2 shrink-0">
                  {new Date(segment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <p className="text-xl font-light text-white/80 leading-relaxed group-hover:text-white transition-colors">
                  {segment.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

import { useState, useCallback, useRef, useEffect } from 'react';
import { TranscriptSegment } from '../types';

export function useTranscription(lang: string = 'pt-BR') {
  const [isRecording, setIsRecording] = useState(false);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [interimText, setInterimText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [captureMode, setCaptureMode] = useState<'mic' | 'system'>('mic');
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event: any) => {
        let interimTranscription = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            const newSegment: TranscriptSegment = {
              id: Math.random().toString(36).substr(2, 9),
              text: transcript.trim(),
              timestamp: Date.now(),
            };
            setSegments((prev) => [...prev, newSegment]);
          } else {
            interimTranscription += transcript;
          }
        }
        setInterimText(interimTranscription);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Acesso ao microfone negado.');
          setIsRecording(false);
        } else if (event.error === 'no-speech' || event.error === 'network') {
          // Ignore, onend will restart if isRecording is true
        } else {
          // For other errors, we might want to stop or just log
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          try { recognitionRef.current.start(); } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [lang, isRecording]);

  const startRecording = useCallback(async () => {
    try {
      let stream: MediaStream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const destination = audioContext.createMediaStreamDestination();

      if (captureMode === 'system') {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          alert('Seu navegador não suporta a captura de tela/reunião.');
          setIsRecording(false);
          return;
        }

        // Capture system/tab audio
        // IMPORTANT: User must check "Share audio" in the popup
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        if (screenStream.getAudioTracks().length === 0) {
          alert("Atenção: Você não selecionou 'Compartilhar Áudio'. A reunião não será gravada.");
        } else {
          const systemSource = audioContext.createMediaStreamSource(screenStream);
          systemSource.connect(destination);
        }

        // Always also get mic to mix
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const micSource = audioContext.createMediaStreamSource(micStream);
          micSource.connect(destination);
        } catch (e) {
          console.warn("Mic not available for meeting mix", e);
        }

        stream = destination.stream;
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      await audioContext.resume();
      streamRef.current = stream;
      setAudioUrl(null);
      setAudioBlob(null);
      setSegments([]);
      setInterimText('');

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const generatedBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(generatedBlob);
        setAudioBlob(generatedBlob);
        setAudioUrl(url);
        audioContext.close();
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);

      if (recognitionRef.current) {
        setIsRecording(true);
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Speech recognition already started or failed", e);
        }
      }
    } catch (err) {
      console.error("Failed to start recording:", err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          if (err.message.includes('Permission denied by user')) {
            // User likely cancelled the screen share prompt, no need to alert aggressively
            console.log('Captura cancelada pelo usuário.');
          } else {
            alert("Permissão negada. Por favor, permita o acesso ao microfone/tela.");
          }
        } else if (err.name === 'AbortError') {
          // User cancelled
        } else {
          alert("Erro ao iniciar gravação: " + err.message);
        }
      }
      setIsRecording(false);
    }
  }, [captureMode]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (recognitionRef.current) {
      setIsRecording(false);
      try { recognitionRef.current.stop(); } catch(e) {}
      setInterimText('');
    }
  }, []);

  return {
    isRecording,
    segments,
    setSegments, // Add this to allow overwriting with API result
    interimText,
    audioUrl,
    audioBlob,
    startRecording,
    stopRecording,
    captureMode,
    setCaptureMode,
  };
}

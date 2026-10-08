import React, { useEffect, useRef, useState } from 'react';
import { Mic, ArrowRight, X, Sparkles } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';
import { NyxalState, NyxalMessage, ModuleWindowId } from '../../types/nyxos';

interface NyxalQuickSummonProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModule: (id: ModuleWindowId) => void;
  onStateChange: (state: NyxalState) => void;
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const NyxalQuickSummon: React.FC<NyxalQuickSummonProps> = ({
  isOpen,
  onClose,
  onStateChange,
  onNotify,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<NyxalMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => () => {
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query) return;

    const userMsg: NyxalMessage = {
      id: \`usr-\${Date.now()}\`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const reply = await nyxosApi.converseWithNyxal(query, onStateChange);
      setMessages((prev) => [...prev, reply]);

      try {
        onStateChange('EXECUTANDO');
        await nyxosApi.speakText(reply.text);
        onStateChange('CONCLUIDO');
      } catch (error) {
        onStateChange('CONCLUIDO');
        onNotify(
          'warning',
          'TTS indisponível',
          error instanceof Error ? error.message : 'O Nyxal Core não conseguiu gerar o áudio.',
        );
      }
    } catch (error) {
      onStateChange('ERRO');
      onNotify(
        'alert',
        'Nyxal indisponível',
        error instanceof Error ? error.message : 'Falha ao comunicar com o Nyxal Core.',
      );
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      onNotify('warning', 'STT indisponível', 'Este ambiente não fornece MediaRecorder.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstart = () => {
        setIsListening(true);
        onStateChange('OUVINDO');
      };

      recorder.onerror = () => {
        setIsListening(false);
        onStateChange('ERRO');
        onNotify('alert', 'Falha no microfone', 'O gravador não conseguiu iniciar.');
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsListening(false);
        onStateChange('PROCESSANDO');

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];

        try {
          const transcript = await nyxosApi.transcribeAudio(blob);
          setInput(transcript);
          onStateChange('ONLINE');
        } catch (error) {
          onStateChange('ERRO');
          onNotify(
            'alert',
            'STT indisponível',
            error instanceof Error ? error.message : 'O Nyxal Core não conseguiu transcrever o áudio.',
          );
        } finally {
          recorderRef.current = null;
        }
      };

      recorderRef.current = recorder;
      recorder.start();
    } catch (error) {
      setIsListening(false);
      onStateChange('ERRO');
      onNotify(
        'alert',
        'Microfone recusado',
        error instanceof Error ? error.message : 'Não foi possível acessar o microfone.',
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-xl border border-white/10 bg-[#0d0e16]/95 shadow-2xl backdrop-blur-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5 bg-black/30">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-300 uppercase">NYXAL CONVERSA · CORE</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white" title="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 min-h-48 overflow-y-auto p-5 space-y-3.5 select-text">
          {messages.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>Conversa direta com o Nyxal Core.</span>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={\`flex flex-col \${message.sender === 'nyxal' ? 'items-start' : 'items-end'}\`}>
              <div className={\`max-w-[85%] rounded-lg px-4 py-2.5 text-xs leading-relaxed \${message.sender === 'nyxal' ? 'bg-black/40 border border-white/5 text-zinc-200' : 'bg-violet-600/90 text-white font-medium'}\`}>
                <p>{message.text}</p>
              </div>
              <span className="mt-1 text-[10px] font-mono text-zinc-600 px-1">{message.timestamp}</span>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex items-center gap-2 px-5 py-2 border-t border-white/5 bg-black/20 overflow-x-auto text-[11px] font-mono">
          {['Qual o status da VPS?', 'Como estão os recursos?', 'Verificar relatório delta', 'Provisionar nova VM'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setInput(suggestion);
                setTimeout(() => void handleSubmit(), 0);
              }}
              className="rounded bg-black/50 border border-white/5 px-2 py-0.5 text-zinc-400 hover:text-white whitespace-nowrap"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="flex items-center gap-2 border-t border-white/5 bg-black/50 p-3">
          <button
            type="button"
            onClick={() => {
              if (isListening) recorderRef.current?.stop();
              else void startRecording();
            }}
            className={\`p-2 rounded \${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
            title={isListening ? 'Parar gravação' : 'Gravar áudio para o Nyxal Core'}
          >
            <Mic className="h-4 w-4" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Digite ou grave sua mensagem..."
            className="flex-1 bg-transparent px-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />

          <button type="submit" disabled={!input.trim()} className="flex h-8 w-8 items-center justify-center rounded bg-violet-600 text-white disabled:opacity-30" title="Enviar">
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

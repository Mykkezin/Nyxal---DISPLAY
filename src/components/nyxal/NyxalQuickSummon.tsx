import React, { useState, useEffect, useRef } from 'react';
import { Mic, ArrowRight, X, Sparkles, Terminal, Volume2 } from 'lucide-react';
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
  onOpenModule,
  onStateChange,
  onNotify,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<NyxalMessage[]>([
    {
      id: 'welcome',
      sender: 'nyxal',
      text: 'O que você precisa?',
      timestamp: 'Agora',
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query) return;

    const userMsg: NyxalMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Trigger conversational response
    const reply = await nyxosApi.converseWithNyxal(query, onStateChange);
    setMessages((prev) => [...prev, reply]);

    // Optional TTS auto-play if supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(reply.text);
      u.lang = 'pt-BR';
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      onStateChange('ONLINE');
      return;
    }

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsListening(true);
          onStateChange('OUVINDO');
        };

        recognition.onresult = (evt: any) => {
          const transcript = evt.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          onStateChange('ONLINE');
        };

        recognition.onerror = () => {
          setIsListening(false);
          onStateChange('ONLINE');
        };

        recognition.onend = () => {
          setIsListening(false);
          onStateChange('ONLINE');
        };

        recognition.start();
      } catch {
        setIsListening(false);
      }
    } else {
      // Simulate quick voice capture
      setIsListening(true);
      onStateChange('OUVINDO');
      setTimeout(() => {
        setInput('Verificar status da VPS e serviços');
        setIsListening(false);
        onStateChange('ONLINE');
      }, 1500);
    }
  };

  const handleActionClick = (target: string) => {
    if (target === 'vps' || target === 'delta' || target === 'residencia' || target === 'gateway' || target === 'presenca' || target === 'dataset') {
      onOpenModule(target as ModuleWindowId);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-white/10 bg-[#0d0e16]/95 shadow-2xl backdrop-blur-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5 bg-black/30">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              NYXAL CONVERSA
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-500">ESC para fechar</span>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message Flow */}
        <div className="max-h-80 min-h-48 overflow-y-auto p-5 space-y-3.5 select-text">
          {messages.map((m) => {
            const isNyxal = m.sender === 'nyxal';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isNyxal ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2.5 text-xs leading-relaxed ${
                    isNyxal
                      ? 'bg-black/40 border border-white/5 text-zinc-200'
                      : 'bg-violet-600/90 text-white font-medium'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Contextual Action recommendation */}
                  {m.suggestedAction && (
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleActionClick(m.suggestedAction!.target)}
                        className="flex items-center gap-1.5 text-[11px] font-mono text-violet-300 hover:text-white transition-colors"
                      >
                        <ArrowRight className="h-3 w-3" />
                        <span>{m.suggestedAction.label}</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="mt-1 text-[10px] font-mono text-zinc-600 px-1">
                  {m.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="flex items-center gap-2 px-5 py-2 border-t border-white/5 bg-black/20 overflow-x-auto text-[11px] font-mono">
          <span className="text-zinc-600 whitespace-nowrap">Sugestões:</span>
          {[
            'Qual o status da VPS?',
            'Como estão os recursos?',
            'Verificar relatório delta',
            'Provisionar nova VM',
          ].map((s) => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
                setTimeout(() => handleSubmit(), 20);
              }}
              className="rounded bg-black/50 border border-white/5 px-2 py-0.5 text-zinc-400 hover:text-white hover:border-white/20 whitespace-nowrap transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-white/5 bg-black/50 p-3"
        >
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2 rounded transition-colors ${
              isListening
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Ativar reconhecimento de voz"
          >
            <Mic className="h-4 w-4" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite ou fale com a Nyxal..."
            className="flex-1 bg-transparent px-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-30 disabled:hover:bg-violet-600"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

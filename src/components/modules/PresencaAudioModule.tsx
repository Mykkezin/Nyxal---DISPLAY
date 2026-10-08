import React, { useState } from 'react';
import { Volume2, Mic, Sparkles, Play, Sliders } from 'lucide-react';
import { NyxalState } from '../../types/nyxos';

interface PresencaAudioModuleProps {
  currentNyxalState: NyxalState;
  onSetState: (s: NyxalState) => void;
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const PresencaAudioModule: React.FC<PresencaAudioModuleProps> = ({
  currentNyxalState,
  onSetState,
  onNotify,
}) => {
  const [ttsSpeed, setTtsSpeed] = useState(1.0);
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [testPhrase, setTestPhrase] = useState('Sistemas prontos. Estou pronta para operar o computador.');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTestTts = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(testPhrase);
      utterance.rate = ttsSpeed;
      utterance.pitch = ttsPitch;
      utterance.lang = 'pt-BR';

      // Find a natural Portuguese voice if available
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find((v) => v.lang.startsWith('pt'));
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        onSetState('EXECUTANDO');
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        onSetState('ONLINE');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onSetState('ONLINE');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      onNotify('info', 'TTS Áudio', 'Simulação de fala executada.');
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <div className="text-xs">
            <span className="font-medium text-zinc-200">Dashboard de Presença & Síntese Vocal (TTS/STT)</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono">Motor Acústico Local</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* State Simulator */}
        <div className="rounded border border-white/5 bg-black/30 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono mb-3">
            Estado da Presença Nyxal
          </div>
          <div className="flex flex-wrap gap-2">
            {(['ONLINE', 'OUVINDO', 'PROCESSANDO', 'EXECUTANDO', 'CONCLUIDO', 'ERRO'] as NyxalState[]).map((st) => (
              <button
                key={st}
                onClick={() => onSetState(st)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  currentNyxalState === st
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 font-semibold'
                    : 'bg-black/50 border border-white/5 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                ● {st}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Synthesis Controls */}
        <div className="rounded border border-white/5 bg-black/30 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 font-mono">
              <Volume2 className="h-4 w-4 text-violet-400" />
              <span>Configuração da Voz (TTS Integrado)</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">pt-BR Neural</span>
          </div>

          <div>
            <label className="text-[11px] font-mono text-zinc-400">Frase de Teste</label>
            <input
              type="text"
              value={testPhrase}
              onChange={(e) => setTestPhrase(e.target.value)}
              className="mt-1 w-full rounded border border-white/10 bg-black/50 px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Velocidade (Rate)</span>
                <span className="tabular-nums text-zinc-200">{ttsSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.1"
                value={ttsSpeed}
                onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                className="mt-2 w-full accent-violet-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Tom (Pitch)</span>
                <span className="tabular-nums text-zinc-200">{ttsPitch.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={ttsPitch}
                onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                className="mt-2 w-full accent-violet-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              onClick={handleTestTts}
              disabled={isSpeaking}
              className="flex items-center gap-2 rounded bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-medium text-white transition-colors disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isSpeaking ? 'Sintetizando...' : 'Executar Voz Nyxal'}</span>
            </button>
          </div>
        </div>

        {/* Audio Spectrogram Simulator */}
        <div className="rounded border border-white/5 bg-black/30 p-5">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-3">
            <span className="flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 text-violet-400" />
              <span>Espectro Acústico / Microfone STT</span>
            </span>
            <span className="text-[11px] text-zinc-500">Sensibilidade 48kHz</span>
          </div>

          <div className="flex h-12 items-end justify-between gap-1 rounded bg-black/60 p-2 border border-white/5">
            {Array.from({ length: 32 }).map((_, i) => {
              const height = isSpeaking || currentNyxalState === 'OUVINDO'
                ? Math.sin(i * 0.4 + Date.now() * 0.005) * 40 + 50
                : 15 + (i % 5) * 4;
              return (
                <div
                  key={i}
                  className="w-full rounded-t bg-violet-500/60 transition-all duration-150"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

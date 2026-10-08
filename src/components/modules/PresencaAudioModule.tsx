import React, { useEffect, useState } from 'react';
import { Volume2, Sparkles, Play, RefreshCw } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';
import { NyxalState } from '../../types/nyxos';

interface Props {
  currentNyxalState: NyxalState;
  onSetState: (state: NyxalState) => void;
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const PresencaAudioModule: React.FC<Props> = ({ currentNyxalState, onSetState, onNotify }) => {
  const [phrase, setPhrase] = useState('Sistemas prontos.');
  const [speaking, setSpeaking] = useState(false);
  const [presence, setPresence] = useState<Record<string, unknown> | null>(null);

  const refresh = async () => {
    try {
      setPresence(await nyxosApi.getPresenceContext());
    } catch (err) {
      onNotify('alert', 'Presença indisponível', err instanceof Error ? err.message : 'Falha ao consultar a presença.');
    }
  };

  useEffect(() => { void refresh(); }, []);

  const speak = async () => {
    if (!phrase.trim()) return;
    try {
      setSpeaking(true);
      onSetState('EXECUTANDO');
      await nyxosApi.speakText(phrase);
      onSetState('CONCLUIDO');
    } catch (err) {
      onSetState('ERRO');
      onNotify('alert', 'TTS indisponível', err instanceof Error ? err.message : 'Falha no TTS do Nyxal Core.');
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-violet-400" /><span className="text-xs font-medium">Presença & Voz · Core Nyxal</span></div>
        <button onClick={() => void refresh()} className="flex items-center gap-1.5 rounded border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/5"><RefreshCw className="h-3 w-3" /> Atualizar</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="rounded border border-white/5 bg-black/30 p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Estado visual atual</div>
          <div className="mt-2 font-mono text-sm text-violet-300">{currentNyxalState}</div>
          <div className="mt-2 text-xs text-zinc-500">O estado é controlado pelo fluxo de conversa e TTS reais.</div>
        </div>

        <div className="rounded border border-white/5 bg-black/30 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 font-mono"><Volume2 className="h-4 w-4 text-violet-400" /> TTS retornado pelo Nyxal Core</div>
          <input value={phrase} onChange={(e) => setPhrase(e.target.value)} className="w-full rounded border border-white/10 bg-black/50 px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none" />
          <button onClick={() => void speak()} disabled={speaking} className="flex items-center gap-2 rounded bg-violet-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
            <Play className="h-3.5 w-3.5 fill-current" /> {speaking ? 'Reproduzindo…' : 'Executar Voz Nyxal'}
          </button>
        </div>

        <div className="rounded border border-white/5 bg-black/30 p-4">
          <div className="text-xs font-mono text-zinc-400">Presença da máquina</div>
          <pre className="mt-2 whitespace-pre-wrap text-[11px] text-zinc-500">{presence ? JSON.stringify(presence, null, 2) : 'Consultando…'}</pre>
        </div>
      </div>
    </div>
  );
};

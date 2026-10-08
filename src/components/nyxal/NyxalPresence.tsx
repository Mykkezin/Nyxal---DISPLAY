import React from 'react';
import { NyxalState } from '../../types/nyxos';

interface NyxalPresenceProps {
  state: NyxalState;
  onSummon: () => void;
  subtitle?: string;
}

export const NyxalPresence: React.FC<NyxalPresenceProps> = ({
  state,
  onSummon,
  subtitle = 'Sistema pronto.',
}) => {
  const getStateColor = () => {
    switch (state) {
      case 'OUVINDO':
        return 'text-sky-400 border-sky-400/40 shadow-sky-500/30';
      case 'PROCESSANDO':
        return 'text-amber-400 border-amber-400/40 shadow-amber-500/30 animate-spin';
      case 'EXECUTANDO':
        return 'text-indigo-400 border-indigo-400/40 shadow-indigo-500/30';
      case 'ERRO':
        return 'text-rose-400 border-rose-400/40 shadow-rose-500/30';
      case 'CONCLUIDO':
        return 'text-emerald-400 border-emerald-400/40 shadow-emerald-500/30';
      case 'ONLINE':
      default:
        return 'text-violet-400 border-violet-400/30 shadow-violet-500/20';
    }
  };

  const getStateSymbol = () => {
    switch (state) {
      case 'OUVINDO':
        return '◉';
      case 'PROCESSANDO':
        return '◌';
      case 'EXECUTANDO':
        return '◈';
      case 'ERRO':
        return '▲';
      case 'CONCLUIDO':
        return '✓';
      case 'ONLINE':
      default:
        return '●';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Central Interactive Holographic Orb */}
      <button
        onClick={onSummon}
        className="group relative flex items-center justify-center p-6 focus:outline-none cursor-pointer"
        title="Clique ou pressione Super+Space para falar com a Nyxal"
      >
        {/* Outer ambient aura */}
        <div className="absolute h-36 w-36 rounded-full bg-violet-600/10 blur-2xl group-hover:bg-violet-600/20 transition-all duration-700 pointer-events-none" />

        {/* Faint rotating rings */}
        <div
          className={`absolute h-28 w-28 rounded-full border border-violet-500/20 transition-all duration-1000 ${
            state === 'PROCESSANDO'
              ? 'animate-spin border-t-violet-400'
              : 'group-hover:scale-105 group-hover:border-violet-500/40'
          }`}
        />

        <div className="absolute h-20 w-20 rounded-full border border-violet-400/20 transition-transform duration-700 group-hover:scale-110" />

        {/* Center luminous core */}
        <div
          className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-900/60 via-[#10121d] to-[#07080d] border ${getStateColor()} backdrop-blur-md shadow-2xl transition-all duration-500 group-hover:shadow-violet-500/40 group-active:scale-95`}
        >
          {/* Inner core particle */}
          <div className="h-3.5 w-3.5 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(167,139,250,0.9)] animate-pulse" />
        </div>
      </button>

      {/* Nyxal Identification */}
      <div className="mt-1 flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono tracking-[0.25em] font-semibold text-zinc-300 uppercase">
            NYXAL
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-[11px] font-mono tracking-wider text-violet-400 font-medium">
            {getStateSymbol()} {state}
          </span>
        </div>

        {/* Dynamic Contextual Greeting / Thought */}
        <p className="mt-2.5 max-w-sm text-sm text-zinc-300/90 font-light tracking-wide transition-opacity duration-300">
          "{subtitle}"
        </p>
      </div>
    </div>
  );
};

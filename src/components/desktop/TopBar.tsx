import React, { useState, useEffect } from 'react';
import { Sliders } from 'lucide-react';
import { NyxalState } from '../../types/nyxos';

interface TopBarProps {
  nyxalState: NyxalState;
  onOpenControlCenter: () => void;
  onSummonNyxal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  nyxalState,
  onOpenControlCenter,
  onSummonNyxal,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-9 items-center justify-between border-b border-white/5 bg-[#07080b]/80 px-4 text-xs select-none backdrop-blur-xl">
      {/* Left: OS Brand & Nyxal fast trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSummonNyxal}
          className="flex items-center gap-2 text-zinc-200 hover:text-white transition-colors cursor-pointer"
        >
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-white">
            NYXOS
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-[11px] font-mono text-zinc-400">
            SHELL RESIDENTE
          </span>
        </button>
      </div>

      {/* Center: Quiet Contextual Status */}
      <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
        <span>NYXAL {nyxalState}</span>
      </div>

      {/* Right: Clock, Weather, Control Center Toggle */}
      <div className="flex items-center gap-4">
        {/* Weather & Clock */}
        <div className="flex items-center gap-2 font-mono text-zinc-300 tabular-nums text-xs">
          <span className="font-medium text-white">{timeStr || '--:--'}</span>
        </div>

        {/* Quick Indicators & Control Center button */}
        <div className="flex items-center gap-2 border-l border-white/10 pl-3">
          <button
            onClick={onOpenControlCenter}
            className="flex items-center gap-1.5 rounded px-1.5 py-1 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Abrir Central de Controle"
          >
            <Sliders className="h-3.5 w-3.5 text-violet-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

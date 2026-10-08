import React, { useEffect, useState } from 'react';
import { Sliders, Server } from 'lucide-react';
import { NyxalState, NyxosPublicStatus } from '../../types/nyxos';

interface TopBarProps {
  nyxalState: NyxalState;
  coreStatus: NyxosPublicStatus | null;
  onOpenControlCenter: () => void;
  onSummonNyxal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  nyxalState,
  coreStatus,
  onOpenControlCenter,
  onSummonNyxal,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => setTimeStr(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  const resources = coreStatus?.habitat?.recursos;
  const cpu = resources && typeof resources === 'object'
    ? (resources as Record<string, any>).cpu?.uso_percentual
    : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-9 items-center justify-between border-b border-white/5 bg-[#07080b]/80 px-4 text-xs select-none backdrop-blur-xl">
      <button onClick={onSummonNyxal} className="flex items-center gap-2 text-zinc-200 hover:text-white">
        <span className="font-mono text-xs font-bold tracking-[0.2em] text-white">NYXOS</span>
        <span className="text-zinc-600">·</span>
        <span className="text-[11px] font-mono text-zinc-400">DISPLAY</span>
      </button>

      <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
        <span className={coreStatus ? 'h-1.5 w-1.5 rounded-full bg-emerald-400' : 'h-1.5 w-1.5 rounded-full bg-red-400'} />
        <span>{coreStatus ? 'CORE ONLINE' : 'CORE OFFLINE'}</span>
        <span className="text-zinc-700">·</span>
        <span>NYXAL {nyxalState}</span>
        {cpu != null && <>
          <span className="text-zinc-700">·</span>
          <span>CPU {Number(cpu).toFixed(1)}%</span>
        </>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-mono text-zinc-300 tabular-nums text-xs">
          <Server className="h-3 w-3 text-zinc-400" />
          <span>{coreStatus?.identidade?.nome || 'NyxOS'}</span>
          <span className="text-zinc-600">·</span>
          <span className="font-medium text-white">{timeStr}</span>
        </div>
        <button onClick={onOpenControlCenter} className="rounded px-1.5 py-1 text-zinc-400 hover:text-white hover:bg-white/5" title="Abrir Central de Controle">
          <Sliders className="h-3.5 w-3.5 text-violet-400" />
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { X, Cpu, HardDrive, Server, Layers, Settings, AlertCircle } from 'lucide-react';
import { NyxosPublicStatus } from '../../types/nyxos';

interface ControlCenterProps {
  isOpen: boolean;
  coreStatus: NyxosPublicStatus | null;
  onClose: () => void;
  onOpenResidencia: () => void;
}

function metric(resource: unknown, field: string): number | null {
  if (!resource || typeof resource !== 'object') return null;
  const value = (resource as Record<string, unknown>)[field];
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  isOpen,
  coreStatus,
  onClose,
  onOpenResidencia,
}) => {
  if (!isOpen) return null;

  const resources = coreStatus?.habitat?.recursos && typeof coreStatus.habitat.recursos === 'object'
    ? coreStatus.habitat.recursos as Record<string, unknown>
    : {};
  const cpu = metric(resources.cpu, 'uso_percentual');
  const memory = metric(resources.memoria, 'uso_percentual');
  const storage = metric(resources.armazenamento, 'uso_percentual');

  return (
    <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="fixed top-11 right-4 w-80 rounded-xl border border-white/10 bg-[#0d0e16]/95 backdrop-blur-2xl shadow-2xl p-5 text-zinc-100">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2"><Settings className="h-4 w-4 text-violet-400" /><span className="font-mono text-xs font-semibold tracking-wider text-zinc-200">CENTRAL DE CONTROLE</span></div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-4 space-y-3">
          {[[Cpu, 'CPU', cpu], [HardDrive, 'RAM', memory], [Server, 'DISCO', storage]].map(([Icon, label, value]) => (
            <div key={label as string} className="rounded-lg border border-white/5 bg-black/30 p-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">{React.createElement(Icon as React.ElementType, { className: 'h-3 w-3 text-violet-400' })} {label as string}</span>
                <span className="text-white">{value == null ? '—' : `${Number(value).toFixed(1)}%`}</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.max(0, Math.min(Number(value) || 0, 100))}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => { onOpenResidencia(); onClose(); }} className="flex items-center gap-2 rounded-lg p-2.5 bg-black/40 border border-white/5 hover:border-violet-500/20 text-zinc-300">
            <Layers className="h-4 w-4 text-violet-400" /><span className="font-mono text-[11px]">Residência</span>
          </button>
          <div className="flex items-center gap-2 rounded-lg p-2.5 bg-black/40 border border-white/5 text-zinc-400">
            <AlertCircle className="h-4 w-4" /><span className="font-mono text-[11px]">{coreStatus ? 'Core conectado' : 'Core offline'}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Nyxal Core</span><span className={coreStatus ? 'text-emerald-400' : 'text-red-400'}>{coreStatus ? 'CONECTADO' : 'OFFLINE'}</span>
        </div>
      </div>
    </div>
  );
};

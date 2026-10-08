import React from 'react';
import { X, Layers, Settings, Info } from 'lucide-react';

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
  onOpenResidencia: () => void;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  isOpen,
  onClose,
  onNotify,
  onOpenResidencia,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-11 right-4 w-80 rounded-xl border border-white/10 bg-[#0d0e16]/95 backdrop-blur-2xl shadow-2xl p-5 text-zinc-100 select-none animate-in fade-in slide-in-from-top-2 duration-150"
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-violet-400" />
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-200">
              CENTRAL DE CONTROLE
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors" title="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-white/5 bg-black/30 p-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-200 font-mono">
            <Info className="h-3.5 w-3.5 text-violet-400" />
            <span>CONTROLE REAL DO HOST</span>
          </div>
          <p className="mt-2 leading-relaxed">
            Os controles de Wi-Fi, Bluetooth, áudio e hardware só devem aparecer aqui quando
            estiverem expostos por uma API real do NyxOS. Nenhum estado fictício é apresentado.
          </p>
        </div>

        <button
          onClick={() => {
            onOpenResidencia();
            onClose();
          }}
          className="mt-3 w-full flex items-center gap-2 rounded-lg p-2.5 bg-black/40 border border-white/5 hover:border-violet-500/20 text-zinc-300 transition-colors"
        >
          <Layers className="h-4 w-4 text-violet-400" />
          <span className="font-mono text-[11px]">Abrir Residência</span>
        </button>

        <button
          onClick={() => onNotify('info', 'Integração pendente', 'Os controles físicos do host ainda não estão expostos pela API NyxOS.')}
          className="mt-2 w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
        >
          VER CAPACIDADES DISPONÍVEIS
        </button>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Target: nyxos.target</span>
          <span className="text-emerald-400">RESIDENTE</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  Server,
  Activity,
  Brain,
  Sparkles,
  Database,
  Layers,
  ShieldAlert,
  ChevronDown,
  X,
  GripHorizontal,
} from 'lucide-react';
import { ModuleWindowId } from '../../types/nyxos';

interface InfinityLauncherProps {
  onOpenModule: (id: ModuleWindowId) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const InfinityLauncher: React.FC<InfinityLauncherProps> = ({
  onOpenModule,
  isOpen,
  onToggle,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  const shortcuts: Array<{
    id: ModuleWindowId;
    num: string;
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'vps',
      num: '01',
      label: 'VPS',
      desc: 'Hipervisor KVM, VMs e Cloud-Init',
      icon: Server,
    },
    {
      id: 'delta',
      num: '02',
      label: 'RELATÓRIO DELTA',
      desc: 'Cadeia de auditoria e evolução LLC',
      icon: Activity,
    },
    {
      id: 'presenca',
      num: '03',
      label: 'DASHBOARD DE PRESENÇA',
      desc: 'Síntese vocal e estados acústicos',
      icon: Sparkles,
    },
    {
      id: 'dataset',
      num: '04',
      label: 'COLETA DUAL DE DATASET',
      desc: 'Registros higienizados de aprendizado',
      icon: Database,
    },
    {
      id: 'residencia',
      num: '05',
      label: 'RESIDÊNCIA GERENCIADA',
      desc: 'Supervisão de serviços systemd',
      icon: Layers,
    },
    {
      id: 'gateway',
      num: '06',
      label: 'GATEWAY DE ATUAÇÃO',
      desc: 'Fronteira restrita e contenção',
      icon: ShieldAlert,
    },
    {
      id: 'integracoes',
      num: '07',
      label: 'AGENTE E INTEGRAÇÕES',
      desc: 'Gemini, Hermes, Letta, Gmail e sistema',
      icon: Brain,
    },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.posX + dx,
        y: dragRef.current.posY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      className="relative z-40 select-none transition-transform duration-75"
    >
      {/* Discreet Trigger button if collapsed */}
      {!isOpen ? (
        <button
          onClick={onToggle}
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-1.5 backdrop-blur-xl hover:border-violet-500/40 hover:bg-black/80 transition-all duration-300 shadow-lg cursor-pointer"
          title="Abrir Infinity (Ações Rápidas)"
        >
          <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 font-mono tracking-widest">
            ──
          </span>
          <span className="text-base text-zinc-300 group-hover:text-violet-400 font-sans transition-colors">
            ∞
          </span>
          <span className="text-[11px] font-mono tracking-widest text-zinc-400 group-hover:text-zinc-200">
            INFINITY
          </span>
          <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 font-mono tracking-widest">
            ──
          </span>
        </button>
      ) : (
        /* Expanded Floating Infinity Capsule */
        <div className="w-80 rounded-xl border border-white/10 bg-[#0d0e16]/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Draggable Title Header */}
          <div
            onMouseDown={handleMouseDown}
            className="flex items-center justify-between border-b border-white/5 px-4 py-2.5 bg-black/40 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-violet-400 font-sans">∞</span>
              <span className="text-xs font-mono font-semibold tracking-wider text-zinc-200">
                INFINITY AÇÕES RÁPIDAS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <GripHorizontal className="h-3.5 w-3.5 text-zinc-600" />
              <button
                onClick={onToggle}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Actions List */}
          <div className="p-2 space-y-1">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onOpenModule(item.id);
                  }}
                  className="w-full group flex items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-violet-950/30 hover:border-violet-500/20 border border-transparent"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-black/60 border border-white/5 text-zinc-400 group-hover:text-violet-400 group-hover:border-violet-500/30 transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-zinc-200 group-hover:text-violet-200 transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-500">
                        {item.num}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="border-t border-white/5 px-4 py-2 bg-black/30 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
            <span>MODO OPERACIONAL</span>
            <span>KVM · SYSTEMD · AUDIT</span>
          </div>
        </div>
      )}
    </div>
  );
};

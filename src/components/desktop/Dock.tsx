import React from 'react';
import {
  Server,
  Terminal,
  Folder,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ModuleWindowId, WindowState } from '../../types/nyxos';

interface DockProps {
  onSummonNyxal: () => void;
  onToggleInfinity: () => void;
  onOpenModule: (id: ModuleWindowId) => void;
  onToggleControlCenter: () => void;
  windows: WindowState[];
  isInfinityOpen: boolean;
}

export const Dock: React.FC<DockProps> = ({
  onSummonNyxal,
  onToggleInfinity,
  onOpenModule,
  onToggleControlCenter,
  windows,
  isInfinityOpen,
}) => {
  const isWindowActive = (id: ModuleWindowId) => {
    return windows.some((w) => w.id === id && w.isOpen);
  };

  const dockItems: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    active: boolean;
  }> = [
    {
      id: 'nyxal',
      label: 'Nyxal',
      icon: (
        <span className="flex h-5 w-5 items-center justify-center text-lg text-violet-400 group-hover:text-violet-300">
          ◉
        </span>
      ),
      onClick: onSummonNyxal,
      active: true,
    },
    {
      id: 'infinity',
      label: 'Infinity (Ações)',
      icon: (
        <span className="flex h-5 w-5 items-center justify-center text-lg font-sans text-zinc-300 group-hover:text-violet-400">
          ∞
        </span>
      ),
      onClick: onToggleInfinity,
      active: isInfinityOpen,
    },
    {
      id: 'vps',
      label: 'VPS (KVM)',
      icon: <Server className="h-5 w-5 text-zinc-300 group-hover:text-violet-400" />,
      onClick: () => onOpenModule('vps'),
      active: isWindowActive('vps'),
    },
    {
      id: 'terminal',
      label: 'Terminal Shell',
      icon: <Terminal className="h-5 w-5 text-zinc-300 group-hover:text-violet-400" />,
      onClick: () => onOpenModule('terminal'),
      active: isWindowActive('terminal'),
    },
    {
      id: 'arquivos',
      label: 'Discos e Imagens',
      icon: <Folder className="h-5 w-5 text-zinc-300 group-hover:text-violet-400" />,
      onClick: () => onOpenModule('arquivos'),
      active: isWindowActive('arquivos'),
    },
    {
      id: 'residencia',
      label: 'Systemd Residência',
      icon: <Layers className="h-5 w-5 text-zinc-300 group-hover:text-violet-400" />,
      onClick: () => onOpenModule('residencia'),
      active: isWindowActive('residencia'),
    },
    {
      id: 'control',
      label: 'Central de Controle',
      icon: <Sliders className="h-5 w-5 text-zinc-300 group-hover:text-violet-400" />,
      onClick: onToggleControlCenter,
      active: false,
    },
  ];

  return (
    <div className="nyxos-dock fixed bottom-2.5 left-1/2 -translate-x-1/2 z-30 select-none">
      <div className="nyxos-dock-surface flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#07080b]/75 px-3 py-1.5 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:border-white/20 hover:bg-[#07080b]/90">
        {dockItems.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className="nyxos-dock-item group relative flex h-10 w-10 flex-col items-center justify-center rounded-xl p-1 text-zinc-400 transition-all duration-200 hover:-translate-y-1 hover:bg-white/5 active:translate-y-0"
            title={item.label}
          >
            {item.icon}

            {/* Running app indicator dot */}
            {item.active && (
              <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-violet-400" />
            )}

            {/* Hover Tooltip */}
            <span className="pointer-events-none absolute -top-8 hidden rounded bg-black/90 px-2 py-0.5 text-[10px] font-mono text-zinc-200 shadow-lg border border-white/10 whitespace-nowrap group-hover:block">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

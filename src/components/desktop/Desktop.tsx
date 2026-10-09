import React, { useState, useEffect, useCallback } from 'react';
import {
  NyxalState,
  ModuleWindowId,
  WindowState,
  NotificationToast,
} from '../../types/nyxos';
import { TopBar } from './TopBar';
import { Dock } from './Dock';
import { ControlCenter } from './ControlCenter';
import { Notifications } from './Notifications';
import { NyxalPresence } from '../nyxal/NyxalPresence';
import { NyxalQuickSummon } from '../nyxal/NyxalQuickSummon';
import { InfinityLauncher } from '../infinity/InfinityLauncher';
import { WindowManager } from '../windows/WindowManager';
import { nyxosApi } from '../../services/nyxosApi';

// Modules
import { VPSModule } from '../modules/VPSModule';
import { RelatorioDeltaModule } from '../modules/RelatorioDeltaModule';
import { PresencaAudioModule } from '../modules/PresencaAudioModule';
import { ColetaDatasetModule } from '../modules/ColetaDatasetModule';
import { ResidenciaModule } from '../modules/ResidenciaModule';
import { GatewayModule } from '../modules/GatewayModule';
import { TerminalModule } from '../modules/TerminalModule';
import { ArquivosModule } from '../modules/ArquivosModule';

// Wallpaper generated asset
import desktopBackdrop from '../../assets/images/nyxos_desktop_backdrop_1791463881307.jpg';

const INITIAL_WINDOWS: WindowState[] = [
  {
    id: 'vps',
    title: 'VPS · Hipervisor KVM / libvirt',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 120, y: 70 },
    size: { width: 920, height: 560 },
    zIndex: 10,
  },
  {
    id: 'delta',
    title: 'Relatório Delta · Cadeia de Auditoria LLC',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 180, y: 90 },
    size: { width: 840, height: 520 },
    zIndex: 10,
  },
  {
    id: 'presenca',
    title: 'Presença & Síntese Vocal (TTS/STT)',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 220, y: 100 },
    size: { width: 780, height: 500 },
    zIndex: 10,
  },
  {
    id: 'dataset',
    title: 'Coleta Dual de Dataset',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 160, y: 80 },
    size: { width: 840, height: 520 },
    zIndex: 10,
  },
  {
    id: 'residencia',
    title: 'Residência Gerenciada · Systemd Supervisor',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 200, y: 90 },
    size: { width: 820, height: 520 },
    zIndex: 10,
  },
  {
    id: 'gateway',
    title: 'Gateway de Atuação · Fronteira de Contenção',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 150, y: 85 },
    size: { width: 800, height: 520 },
    zIndex: 10,
  },
  {
    id: 'terminal',
    title: 'Terminal · Shell NyxOS',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 140, y: 80 },
    size: { width: 780, height: 480 },
    zIndex: 10,
  },
  {
    id: 'arquivos',
    title: 'Storage & Discos QCOW2',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    position: { x: 190, y: 95 },
    size: { width: 780, height: 480 },
    zIndex: 10,
  },
];

export const Desktop: React.FC = () => {
  const [nyxalState, setNyxalState] = useState<NyxalState>('ONLINE');
  const [nyxalSubtitle, setNyxalSubtitle] = useState('Sistema pronto. Ambiente operacional ativo.');
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<ModuleWindowId | null>(null);
  const [topZ, setTopZ] = useState(20);

  // Overlays
  const [isQuickSummonOpen, setIsQuickSummonOpen] = useState(false);
  const [isInfinityOpen, setIsInfinityOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<NotificationToast[]>([
    {
      id: 'init-toast',
      type: 'info',
      title: 'NyxOS Shell Inicializado',
      message: 'Unidades de residência ativas no nyxos.target.',
      timestamp: 'Agora',
    },
  ]);

  const addNotification = useCallback(
    (type: NotificationToast['type'], title: string, message: string) => {
      const newToast: NotificationToast = {
        id: `toast-${Date.now()}-${Math.random()}`,
        type,
        title,
        message,
        timestamp: 'Agora',
      };
      setToasts((prev) => [newToast, ...prev].slice(0, 4));

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const status = await nyxosApi.getPublicStatus();
        if (!mounted) return;
        const active = Boolean(status?.presenca?.ativa);
        setNyxalState(active ? 'ONLINE' : 'ERRO');
        const identidade = status?.identidade?.nome || 'Nyxal';
        const ciclos = status?.presenca?.ciclos;
        setNyxalSubtitle(ciclos != null ? `${identidade} online · ${ciclos} ciclos observados.` : `${identidade} online. Estado operacional sincronizado.`);
      } catch {
        if (mounted) { setNyxalState('ERRO'); setNyxalSubtitle('API Nyxal indisponível.'); }
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  // Global Keyboard Shortcuts (Super+Space / Cmd+Space / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Super / Cmd + Space -> Summon Nyxal
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        setIsQuickSummonOpen((prev) => !prev);
      }
      // Super / Cmd + I -> Toggle Infinity
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsInfinityOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Window Management Actions
  const focusWindow = (id: ModuleWindowId) => {
    setActiveWindowId(id);
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w))
    );
  };

  const openWindow = (id: ModuleWindowId) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setActiveWindowId(id);
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              isOpen: true,
              isMinimized: false,
              zIndex: nextZ,
            }
          : w
      )
    );
  };

  const closeWindow = (id: ModuleWindowId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: ModuleWindowId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const toggleMaximizeWindow = (id: ModuleWindowId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  const updateWindowPosition = (id: ModuleWindowId, pos: { x: number; y: number }) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position: pos } : w))
    );
  };

  const renderModuleContent = (id: ModuleWindowId) => {
    switch (id) {
      case 'vps':
        return <VPSModule onNotify={addNotification} />;
      case 'delta':
        return <RelatorioDeltaModule />;
      case 'presenca':
        return (
          <PresencaAudioModule
            currentNyxalState={nyxalState}
            onSetState={setNyxalState}
            onNotify={addNotification}
          />
        );
      case 'dataset':
        return <ColetaDatasetModule onNotify={addNotification} />;
      case 'residencia':
        return <ResidenciaModule onNotify={addNotification} />;
      case 'gateway':
        return <GatewayModule onNotify={addNotification} />;
      case 'terminal':
        return <TerminalModule />;
      case 'arquivos':
        return <ArquivosModule />;
      default:
        return null;
    }
  };

  return (
    <div className="nyxos-shell relative h-screen w-screen overflow-hidden bg-[#07080b] font-sans text-zinc-100 select-none">
      {/* Cinematic Wallpaper Backdrop with measured dark scrim */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src={desktopBackdrop}
          alt="NyxOS Ambient Wallpaper"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-60 mix-blend-screen"
        />
        {/* Deep vignette gradient to focus attention on Nyxal center */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-transparent to-[#07080b]/90" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#07080b]/50 to-[#07080b]/90" />
      </div>

      {/* Top Bar (Header) */}
      <TopBar
        nyxalState={nyxalState}
        onOpenControlCenter={() => setIsControlCenterOpen(true)}
        onSummonNyxal={() => setIsQuickSummonOpen(true)}
      />

      {/* Main Desktop Canvas Area */}
      <main className="nyxos-workspace relative z-10 flex h-full w-full flex-col items-center justify-between pt-16 pb-20 px-6">
        {/* Subtle breathing room top spacer */}
        <div className="h-6" />

        {/* Central Nyxal Core Intelligence Presence */}
        <div className="flex flex-col items-center my-auto">
          <NyxalPresence
            state={nyxalState}
            subtitle={nyxalSubtitle}
            onSummon={() => setIsQuickSummonOpen(true)}
          />

          {/* Infinity Launcher (Discreet floating center or summonable) */}
          <div className="mt-8">
            <InfinityLauncher
              isOpen={isInfinityOpen}
              onToggle={() => setIsInfinityOpen(!isInfinityOpen)}
              onOpenModule={(id) => {
                openWindow(id);
                setIsInfinityOpen(false);
              }}
            />
          </div>
        </div>

        {/* Statuso mínimo; métricas reais entram somente quando expostas pela API. */}
        <div className="nyxos-system-status flex items-center gap-2 text-xs font-mono text-zinc-400/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>NYXOS ONLINE</span>
        </div>
      </main>

      {/* Desktop Windows Layer */}
      <WindowManager
        windows={windows}
        activeWindowId={activeWindowId}
        onFocus={focusWindow}
        onClose={closeWindow}
        onMinimize={minimizeWindow}
        onToggleMaximize={toggleMaximizeWindow}
        onUpdatePosition={updateWindowPosition}
        renderContent={renderModuleContent}
      />

      {/* Floating Bottom Dock */}
      <Dock
        onSummonNyxal={() => setIsQuickSummonOpen(true)}
        onToggleInfinity={() => setIsInfinityOpen(!isInfinityOpen)}
        onOpenModule={openWindow}
        onToggleControlCenter={() => setIsControlCenterOpen(!isControlCenterOpen)}
        windows={windows}
        isInfinityOpen={isInfinityOpen}
      />

      {/* Nyxal Fast Summon HUD (Super+Space) */}
      <NyxalQuickSummon
        isOpen={isQuickSummonOpen}
        onClose={() => setIsQuickSummonOpen(false)}
        onOpenModule={openWindow}
        onStateChange={setNyxalState}
        onNotify={addNotification}
      />

      {/* Control Center Slide-over */}
      <ControlCenter
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
        onNotify={addNotification}
        onOpenResidencia={() => openWindow('residencia')}
      />

      {/* Discreet Toast Notifications */}
      <Notifications toasts={toasts} onDismiss={dismissNotification} />
    </div>
  );
};

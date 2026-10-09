import React, { useCallback, useEffect, useState } from 'react';
import {
  NyxalState, ModuleWindowId, WindowState, NotificationToast, NyxosPublicStatus,
} from '../../types/nyxos';
import { nyxosApi } from '../../services/nyxosApi';
import { TopBar } from './TopBar';
import { Dock } from './Dock';
import { ControlCenter } from './ControlCenter';
import { Notifications } from './Notifications';
import { NyxalPresence } from '../nyxal/NyxalPresence';
import { NyxalQuickSummon } from '../nyxal/NyxalQuickSummon';
import { InfinityLauncher } from '../infinity/InfinityLauncher';
import { WindowManager } from '../windows/WindowManager';
import { VPSModule } from '../modules/VPSModule';
import { RelatorioDeltaModule } from '../modules/RelatorioDeltaModule';
import { PresencaAudioModule } from '../modules/PresencaAudioModule';
import { ColetaDatasetModule } from '../modules/ColetaDatasetModule';
import { ResidenciaModule } from '../modules/ResidenciaModule';
import { GatewayModule } from '../modules/GatewayModule';
import { TerminalModule } from '../modules/TerminalModule';
import { ArquivosModule } from '../modules/ArquivosModule';
import { IntegracoesModule } from '../modules/IntegracoesModule';
import { DesignModule } from '../modules/DesignModule';
import desktopBackdrop from '../../assets/images/nyxos_desktop_backdrop_1791463881307.jpg';

const INITIAL_WINDOWS: WindowState[] = [
  { id: 'vps', title: 'VPS · Hipervisor KVM / libvirt', isOpen: false, isMinimized: false, isMaximized: false, position: { x: 120, y: 70 }, size: { width: 920, height: 560 }, zIndex: 10 },
  { id: 'delta', title: 'Relatório Delta · Cadeia de Auditoria LLC', isOpen: false, isMinimized: false, isMaximized: false, position: { x: 180, y: 90 }, size: { width: 840, height: 520 }, zIndex: 10 },
  { id: 'presenca', title: 'Presença & Síntese Vocal (TTS/STT)', isOpen: false, isMinimized: false, isMaximized: false, position: { x: 220, y: 100 }, size: { width: 780, height: 500 }, zIndex: 10 },
  { id: 'dataset', title: 'Coleta Dual de Dataset', isOpen: false, isMinimized: false, isMaximized: false, position: { x: 160, y: 80 }, size: { width: 840, height: 520 }, zIndex: 10 },
  { id: 'residencia', title: 'Residência · Systemd', isOpen: false, isMinimized: false, isMaximized: false, position: { x: 200, y: 90 }, size: { width: 820, height: 520 }, zIndex: 10 },
  { id: 'gateway', title: 'Gateway de Atuação · Contenção', isOpen: false, isMinimized: false, isMaximized: false, position: { x: 150, y: 85 }, size: { width: 800, height: 520 }, zIndex: 10 },
  { id: 'terminal', title: 'Terminal · Nyxal Core', isOpen: false, isMinimized: false, isMaximized: false, position: { x: 140, y: 80 }, size: { width: 780, height: 480 }, zIndex: 10 },
  { id: 'arquivos', title: 'Recursos · Nyxal Core', isOpen: false, isMinimized: false, isMaximized: false, position: { x: 190, y: 95 }, size: { width: 780, height: 480 }, zIndex: 10 },
  { id: 'integracoes', title: 'Agente e Integrações · Nyxal', isOpen: false, isMinimized: false, isMaximized: false, position: { x: 90, y: 55 }, size: { width: 980, height: 640 }, zIndex: 10 },
  { id: 'design', title: 'Nyxal Studio · Design e edição', isOpen: false, isMinimized: false, isMaximized: false, position: { x: 70, y: 50 }, size: { width: 1050, height: 680 }, zIndex: 10 },
];

function numberValue(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function resourcesFrom(status: NyxosPublicStatus | null): Record<string, any> {
  return status?.habitat?.recursos && typeof status.habitat.recursos === 'object'
    ? status.habitat.recursos as Record<string, any>
    : {};
}

export const Desktop: React.FC = () => {
  const [nyxalState, setNyxalState] = useState<NyxalState>('ERRO');
  const [nyxalSubtitle, setNyxalSubtitle] = useState('Conectando ao Nyxal Core…');
  const [coreStatus, setCoreStatus] = useState<NyxosPublicStatus | null>(null);
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<ModuleWindowId | null>(null);
  const [topZ, setTopZ] = useState(20);
  const [isQuickSummonOpen, setIsQuickSummonOpen] = useState(false);
  const [isInfinityOpen, setIsInfinityOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const refreshCore = useCallback(async () => {
    try {
      const status = await nyxosApi.getPublicStatus();
      setCoreStatus(status);
      setNyxalState('ONLINE');
      setNyxalSubtitle(status.estado?.status ? String(status.estado.status) : 'Nyxal Core conectado.');
    } catch (error) {
      setCoreStatus(null);
      setNyxalState('ERRO');
      setNyxalSubtitle(error instanceof Error ? error.message : 'Nyxal Core indisponível.');
    }
  }, []);

  useEffect(() => {
    void refreshCore();
    const id = window.setInterval(() => void refreshCore(), 5000);
    return () => window.clearInterval(id);
  }, [refreshCore]);

  const addNotification = useCallback((type: NotificationToast['type'], title: string, message: string) => {
    const toast: NotificationToast = { id: `${Date.now()}-${Math.random()}`, type, title, message, timestamp: 'Agora' };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
    window.setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== toast.id)), 4500);
  }, []);

  const dismissNotification = useCallback((id: string) => setToasts((prev) => prev.filter((toast) => toast.id !== id)), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.code === 'Space') { event.preventDefault(); setIsQuickSummonOpen((prev) => !prev); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'i') { event.preventDefault(); setIsInfinityOpen((prev) => !prev); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const focusWindow = (id: ModuleWindowId) => {
    const nextZ = topZ + 1; setTopZ(nextZ); setActiveWindowId(id);
    setWindows((prev) => prev.map((item) => item.id === id ? { ...item, zIndex: nextZ, isMinimized: false } : item));
  };
  const openWindow = (id: ModuleWindowId) => {
    const nextZ = topZ + 1; setTopZ(nextZ); setActiveWindowId(id);
    setWindows((prev) => prev.map((item) => item.id === id ? { ...item, isOpen: true, isMinimized: false, zIndex: nextZ } : item));
  };
  const closeWindow = (id: ModuleWindowId) => { setWindows((prev) => prev.map((item) => item.id === id ? { ...item, isOpen: false } : item)); if (activeWindowId === id) setActiveWindowId(null); };
  const minimizeWindow = (id: ModuleWindowId) => { setWindows((prev) => prev.map((item) => item.id === id ? { ...item, isMinimized: true } : item)); if (activeWindowId === id) setActiveWindowId(null); };
  const toggleMaximizeWindow = (id: ModuleWindowId) => setWindows((prev) => prev.map((item) => item.id === id ? { ...item, isMaximized: !item.isMaximized } : item));
  const updateWindowPosition = (id: ModuleWindowId, position: { x: number; y: number }) => setWindows((prev) => prev.map((item) => item.id === id ? { ...item, position } : item));

  const renderModuleContent = (id: ModuleWindowId) => {
    switch (id) {
      case 'vps': return <VPSModule onNotify={addNotification} />;
      case 'delta': return <RelatorioDeltaModule />;
      case 'presenca': return <PresencaAudioModule currentNyxalState={nyxalState} onSetState={setNyxalState} onNotify={addNotification} />;
      case 'dataset': return <ColetaDatasetModule onNotify={addNotification} />;
      case 'residencia': return <ResidenciaModule onNotify={addNotification} />;
      case 'gateway': return <GatewayModule onNotify={addNotification} />;
      case 'terminal': return <TerminalModule />;
      case 'arquivos': return <ArquivosModule />;
      case 'integracoes': return <IntegracoesModule />;
      case 'design': return <DesignModule />;
      default: return null;
    }
  };

  const resources = resourcesFrom(coreStatus);
  const cpu = numberValue(resources.cpu?.uso_percentual);
  const memory = numberValue(resources.memoria?.uso_percentual);
  const storage = numberValue(resources.armazenamento?.uso_percentual);
  const gpu = Array.isArray(resources.gpu) ? numberValue(resources.gpu[0]?.uso_percentual) : null;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#07080b] font-sans text-zinc-100 select-none">
      <div className="absolute inset-0 pointer-events-none z-0">
        <img src={desktopBackdrop} alt="NyxOS Ambient Wallpaper" className="h-full w-full object-cover opacity-60 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080b] via-transparent to-[#07080b]/90" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#07080b]/50 to-[#07080b]/90" />
      </div>
      <TopBar nyxalState={nyxalState} coreStatus={coreStatus} onOpenControlCenter={() => setIsControlCenterOpen(true)} onSummonNyxal={() => setIsQuickSummonOpen(true)} />
      <main className="relative z-10 flex h-full w-full flex-col items-center justify-between pt-16 pb-20 px-6">
        <div className="h-6" />
        <div className="flex flex-col items-center my-auto">
          <NyxalPresence state={nyxalState} subtitle={nyxalSubtitle} onSummon={() => setIsQuickSummonOpen(true)} />
          <div className="mt-8"><InfinityLauncher isOpen={isInfinityOpen} onToggle={() => setIsInfinityOpen(!isInfinityOpen)} onOpenModule={(id) => { openWindow(id); setIsInfinityOpen(false); }} /></div>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-zinc-400/80 tabular-nums">
          <span>CPU {cpu == null ? '—' : `${cpu.toFixed(1)}%`}</span><span className="text-zinc-600">·</span>
          <span>RAM {memory == null ? '—' : `${memory.toFixed(1)}%`}</span><span className="text-zinc-600">·</span>
          <span>GPU {gpu == null ? '—' : `${gpu.toFixed(1)}%`}</span><span className="text-zinc-600">·</span>
          <span>DISCO {storage == null ? '—' : `${storage.toFixed(1)}%`}</span><span className="text-zinc-600">·</span>
          <span className={coreStatus ? 'text-emerald-400' : 'text-red-400'}>CORE {coreStatus ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </main>
      <WindowManager windows={windows} activeWindowId={activeWindowId} onFocus={focusWindow} onClose={closeWindow} onMinimize={minimizeWindow} onToggleMaximize={toggleMaximizeWindow} onUpdatePosition={updateWindowPosition} renderContent={renderModuleContent} />
      <Dock onSummonNyxal={() => setIsQuickSummonOpen(true)} onToggleInfinity={() => setIsInfinityOpen(!isInfinityOpen)} onOpenModule={openWindow} onToggleControlCenter={() => setIsControlCenterOpen(!isControlCenterOpen)} windows={windows} isInfinityOpen={isInfinityOpen} />
      <NyxalQuickSummon isOpen={isQuickSummonOpen} onClose={() => setIsQuickSummonOpen(false)} onOpenModule={openWindow} onStateChange={setNyxalState} onNotify={addNotification} />
      <ControlCenter isOpen={isControlCenterOpen} coreStatus={coreStatus} onClose={() => setIsControlCenterOpen(false)} onOpenResidencia={() => openWindow('residencia')} />
      <Notifications toasts={toasts} onDismiss={dismissNotification} />
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Bluetooth,
  Moon,
  Sun,
  Monitor,
  Power,
  RotateCw,
  Cpu,
  Layers,
  Settings,
} from 'lucide-react';

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
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [wifiOn, setWifiOn] = useState(true);
  const [bluetoothOn, setBluetoothOn] = useState(true);
  const [nightLight, setNightLight] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-transparent"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-11 right-4 w-80 rounded-xl border border-white/10 bg-[#0d0e16]/95 backdrop-blur-2xl shadow-2xl p-5 text-zinc-100 select-none animate-in fade-in slide-in-from-top-2 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-violet-400" />
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-200">
              CENTRAL DE CONTROLE NYXOS
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* System Meters */}
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3 w-3 text-violet-400" />
                <span>CPU Host (16t)</span>
              </span>
              <span className="text-white tabular-nums">12%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: '12%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>RAM (32 GB)</span>
              <span className="text-white tabular-nums">38% (12.1 GB)</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-violet-400 rounded-full" style={{ width: '38%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>GPU Acústica/Vocal</span>
              <span className="text-white tabular-nums">4%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '4%' }} />
            </div>
          </div>
        </div>

        {/* Toggles Grid */}
        <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => {
              setWifiOn(!wifiOn);
              onNotify('info', 'Rede Wi-Fi', wifiOn ? 'Wi-Fi desativado' : 'Wi-Fi conectado');
            }}
            className={`flex items-center gap-2 rounded-lg p-2.5 transition-colors border ${
              wifiOn
                ? 'bg-violet-950/30 border-violet-500/30 text-violet-200'
                : 'bg-black/40 border-white/5 text-zinc-500'
            }`}
          >
            {wifiOn ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className="font-mono text-[11px]">{wifiOn ? 'Wi-Fi Ativo' : 'Wi-Fi Deslig.'}</span>
          </button>

          <button
            onClick={() => {
              setBluetoothOn(!bluetoothOn);
              onNotify('info', 'Bluetooth', bluetoothOn ? 'Bluetooth desconectado' : 'Bluetooth ativo');
            }}
            className={`flex items-center gap-2 rounded-lg p-2.5 transition-colors border ${
              bluetoothOn
                ? 'bg-violet-950/30 border-violet-500/30 text-violet-200'
                : 'bg-black/40 border-white/5 text-zinc-500'
            }`}
          >
            <Bluetooth className="h-4 w-4" />
            <span className="font-mono text-[11px]">{bluetoothOn ? 'Bluetooth' : 'BT Deslig.'}</span>
          </button>

          <button
            onClick={() => {
              setNightLight(!nightLight);
              onNotify('info', 'Filtro Noturno', nightLight ? 'Luz noturna desativada' : 'Luz noturna ativada');
            }}
            className={`flex items-center gap-2 rounded-lg p-2.5 transition-colors border ${
              nightLight
                ? 'bg-violet-950/30 border-violet-500/30 text-violet-200'
                : 'bg-black/40 border-white/5 text-zinc-500'
            }`}
          >
            {nightLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="font-mono text-[11px]">{nightLight ? 'Modo Noturno' : 'Luz Padrão'}</span>
          </button>

          <button
            onClick={() => {
              onOpenResidencia();
              onClose();
            }}
            className="flex items-center gap-2 rounded-lg p-2.5 bg-black/40 border border-white/5 hover:border-violet-500/20 text-zinc-300 transition-colors"
          >
            <Layers className="h-4 w-4 text-violet-400" />
            <span className="font-mono text-[11px]">Residência</span>
          </button>
        </div>

        {/* Volume Slider */}
        <div className="mt-4 rounded-lg bg-black/40 border border-white/5 p-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-3.5 w-3.5 text-zinc-500" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-violet-400" />
                )}
              </button>
              <span>Saída de Áudio NyxOS</span>
            </span>
            <span className="tabular-nums text-zinc-200">{isMuted ? 0 : volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="mt-2 w-full accent-violet-500 cursor-pointer"
          />
        </div>

        {/* Kiosk / Target Status */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Target: nyxos.target</span>
          <span className="text-emerald-400">RESIDENTE</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Layers, RotateCw, CheckCircle, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';
import { SystemService } from '../../types/nyxos';

interface ResidenciaModuleProps {
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const ResidenciaModule: React.FC<ResidenciaModuleProps> = ({ onNotify }) => {
  const [services, setServices] = useState<SystemService[]>(nyxosApi.getSystemServices());
  const [reloading, setReloading] = useState<string | null>(null);

  const handleRestart = async (name: string) => {
    setReloading(name);
    try {
      await nyxosApi.restartService(name);
      setServices(nyxosApi.getSystemServices());
      onNotify('info', 'Systemd Reload', `Serviço ${name} reiniciado com sucesso.`);
    } catch {
      onNotify('alert', 'Erro', `Falha ao reiniciar ${name}`);
    } finally {
      setTimeout(() => {
        setReloading(null);
        setServices(nyxosApi.getSystemServices());
      }, 800);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 text-violet-400" />
          <div className="text-xs">
            <span className="font-medium text-zinc-200">Residência Gerenciada (Systemd Supervisor)</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-emerald-400 font-mono">Target: nyxos.target [ACTIVE]</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Architecture overview card */}
        <div className="rounded border border-white/5 bg-black/30 p-4 text-xs text-zinc-400 leading-relaxed">
          <div className="font-mono text-zinc-200 font-medium mb-1 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-violet-400" />
            <span>Arquitetura de Residência Operacional</span>
          </div>
          O NyxOS opera através de unidades systemd independentes com supervisão contínua, watchdog e reinicialização automática sob falha transitória.
        </div>

        {/* Services List */}
        <div className="space-y-3">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="rounded border border-white/5 bg-black/40 p-4 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-white">{svc.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        svc.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {svc.subState.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{svc.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  {svc.pid && (
                    <div className="text-right text-[11px] font-mono text-zinc-400 tabular-nums">
                      <div>PID {svc.pid}</div>
                      <div className="text-zinc-500">{svc.memoryUsageMb} MB · {svc.cpuUsagePct}% CPU</div>
                    </div>
                  )}

                  <button
                    onClick={() => handleRestart(svc.name)}
                    disabled={reloading === svc.name}
                    className="flex items-center gap-1.5 rounded border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    <RotateCw className={`h-3 w-3 ${reloading === svc.name ? 'animate-spin' : ''}`} />
                    <span>Restart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

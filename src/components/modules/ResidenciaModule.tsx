import React, { useEffect, useState } from 'react';
import { Layers, RefreshCw, ShieldCheck } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';
import { SystemService } from '../../types/nyxos';

interface Props {
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const ResidenciaModule: React.FC<Props> = ({ onNotify }) => {
  const [services, setServices] = useState<SystemService[]>([]);
  const [error, setError] = useState('');

  const refresh = async () => {
    try {
      setError('');
      setServices(await nyxosApi.getSystemServices());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao consultar a residência.';
      setError(message);
      onNotify('alert', 'Residência indisponível', message);
    }
  };

  useEffect(() => { void refresh(); }, []);

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 text-violet-400" />
          <div className="text-xs">
            <span className="font-medium text-zinc-200">Residência NyxOS · Systemd</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono">observação real do Core</span>
          </div>
        </div>
        <button onClick={() => void refresh()} className="flex items-center gap-1.5 rounded border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/5">
          <RefreshCw className="h-3 w-3" /> Atualizar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && <div className="rounded border border-red-500/20 bg-red-950/10 p-4 text-xs text-red-300">{error}</div>}
        {!error && services.length === 0 && <div className="text-xs text-zinc-500">Consultando o Nyxal Core…</div>}

        {services.map((svc) => (
          <div key={svc.name} className="rounded border border-white/5 bg-black/40 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-white">{svc.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${svc.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {svc.status.toUpperCase()} / {svc.subState.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">{svc.description || 'Sem descrição fornecida pelo systemd.'}</p>
              </div>
              <div className="text-right text-[11px] font-mono text-zinc-500">
                <div>{svc.pid ? `PID ${svc.pid}` : 'sem PID'}</div>
                <div>{svc.enabled ? 'enabled' : 'não habilitado'}</div>
                {svc.memoryUsageMb != null && <div>{svc.memoryUsageMb} MB</div>}
              </div>
            </div>
          </div>
        ))}

        <div className="rounded border border-white/5 bg-black/20 p-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-200 font-mono"><ShieldCheck className="h-4 w-4 text-violet-400" /> Somente leitura</div>
          <p className="mt-1">O Display não simula restart nem executa comandos systemd arbitrários. O estado acima vem do Nyxal Core.</p>
        </div>
      </div>
    </div>
  );
};

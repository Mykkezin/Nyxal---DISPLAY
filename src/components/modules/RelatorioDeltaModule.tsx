import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Shield } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';
import { DeltaReportItem } from '../../types/nyxos';

export const RelatorioDeltaModule: React.FC = () => {
  const [reports, setReports] = useState<DeltaReportItem[]>([]);
  const [error, setError] = useState('');

  const refresh = async () => {
    try {
      setError('');
      setReports(await nyxosApi.getDeltaReports());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao consultar Delta.');
    }
  };

  useEffect(() => { void refresh(); }, []);

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3"><Activity className="h-4 w-4 text-violet-400" /><span className="text-xs font-medium">Relatório Delta · Nyxal Core</span></div>
        <button onClick={() => void refresh()} className="flex items-center gap-1.5 rounded border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/5"><RefreshCw className="h-3 w-3" /> Atualizar</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {error && <div className="rounded border border-red-500/20 bg-red-950/10 p-4 text-xs text-red-300">{error}</div>}
        {!error && reports.length === 0 && <div className="text-xs text-zinc-500">Nenhum último evento Delta está disponível.</div>}
        {reports.map((item) => (
          <div key={item.id} className="rounded border border-white/5 bg-black/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-semibold text-violet-400">{item.category}</span>
              <span className="text-[11px] font-mono text-zinc-500">{item.timestamp}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-200"><Shield className="h-3.5 w-3.5 text-emerald-400" />{item.summary}</div>
            <p className="mt-2 text-xs text-zinc-400">{item.details}</p>
            <div className="mt-3 text-[11px] font-mono text-zinc-600">ID {item.id} · estado {item.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

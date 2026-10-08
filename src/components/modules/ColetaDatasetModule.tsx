import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, ShieldCheck } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';

interface Props {
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const ColetaDatasetModule: React.FC<Props> = ({ onNotify }) => {
  const [summary, setSummary] = useState<{ qwen: number; kernel: number; automaticTraining: boolean } | null>(null);

  const refresh = async () => {
    try {
      setSummary(await nyxosApi.getDatasetSummary());
    } catch (err) {
      onNotify('alert', 'Dataset indisponível', err instanceof Error ? err.message : 'Falha ao consultar AE5.');
    }
  };

  useEffect(() => { void refresh(); }, []);

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3"><Database className="h-4 w-4 text-violet-400" /><span className="text-xs font-medium">Coleta Dual · AE5</span></div>
        <button onClick={() => void refresh()} className="flex items-center gap-1.5 rounded border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/5"><RefreshCw className="h-3 w-3" /> Atualizar</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {summary ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded border border-white/5 bg-black/30 p-4"><div className="text-[11px] text-zinc-500">Qwen</div><div className="mt-2 text-2xl font-mono">{summary.qwen}</div></div>
              <div className="rounded border border-white/5 bg-black/30 p-4"><div className="text-[11px] text-zinc-500">Kernel</div><div className="mt-2 text-2xl font-mono">{summary.kernel}</div></div>
              <div className="rounded border border-white/5 bg-black/30 p-4"><div className="text-[11px] text-zinc-500">Treinamento automático</div><div className="mt-2 text-sm font-mono">{summary.automaticTraining ? 'ATIVO' : 'DESATIVADO'}</div></div>
            </div>
            <div className="rounded border border-white/5 bg-black/20 p-4 text-xs text-zinc-400"><ShieldCheck className="inline h-4 w-4 mr-2 text-violet-400" />Contagens fornecidas pelo Nyxal Core. O Display não cria nem finge registros.</div>
          </>
        ) : <div className="text-xs text-zinc-500">Consultando AE5…</div>}
      </div>
    </div>
  );
};

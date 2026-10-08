import React, { useEffect, useState } from 'react';
import { ShieldAlert, Lock, RefreshCw } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';

interface Props {
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const GatewayModule: React.FC<Props> = ({ onNotify }) => {
  const [context, setContext] = useState<Record<string, unknown> | null>(null);

  const refresh = async () => {
    try {
      setContext(await nyxosApi.getGatewayContext());
    } catch (err) {
      onNotify('alert', 'Gateway indisponível', err instanceof Error ? err.message : 'Falha ao consultar o Core.');
    }
  };

  useEffect(() => { void refresh(); }, []);

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3"><ShieldAlert className="h-4 w-4 text-violet-400" /><span className="text-xs font-medium">Gateway de Atuação · Nyxal Core</span></div>
        <button onClick={() => void refresh()} className="flex items-center gap-1.5 rounded border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/5"><RefreshCw className="h-3 w-3" /> Atualizar</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="rounded border border-emerald-500/20 bg-emerald-950/10 p-4 text-xs text-zinc-300">
          <div className="flex items-center gap-2 font-mono text-emerald-400 font-semibold"><Lock className="h-4 w-4" /> Estado observado</div>
          <p className="mt-1">Este painel não executa comandos arbitrários. Ele apresenta o contexto de atuação que o Nyxal Core publicou.</p>
        </div>
        <pre className="whitespace-pre-wrap rounded border border-white/5 bg-black/50 p-4 text-[11px] leading-relaxed text-zinc-300">
          {context ? JSON.stringify(context, null, 2) : 'Consultando o Nyxal Core…'}
        </pre>
      </div>
    </div>
  );
};

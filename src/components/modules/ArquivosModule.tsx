import React, { useEffect, useState } from 'react';
import { Folder, RefreshCw, Boxes } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';

type CoreModule = { nome?: string; arquivo?: string; tipo?: string; observavel?: boolean };

export const ArquivosModule: React.FC = () => {
  const [modules, setModules] = useState<CoreModule[]>([]);
  const [storage, setStorage] = useState<string>('');
  const [error, setError] = useState('');

  const refresh = async () => {
    try {
      setError('');
      const [status, vps] = await Promise.all([nyxosApi.getPublicStatus(), nyxosApi.getVpsStatus()]);
      const catalog = status.recursos_habitat?.modulos;
      setModules(Array.isArray(catalog) ? catalog.slice(0, 100) as CoreModule[] : []);
      setStorage(vps.storage || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao consultar recursos.');
    }
  };

  useEffect(() => { void refresh(); }, []);

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3"><Folder className="h-4 w-4 text-violet-400" /><span className="text-xs font-medium">Recursos do Nyxal Core</span></div>
        <button onClick={() => void refresh()} className="flex items-center gap-1.5 rounded border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/5"><RefreshCw className="h-3 w-3" /> Atualizar</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && <div className="rounded border border-red-500/20 bg-red-950/10 p-4 text-xs text-red-300">{error}</div>}
        <div className="rounded border border-white/5 bg-black/30 p-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-200 font-mono"><Boxes className="h-4 w-4 text-violet-400" /> Catálogo declarado</div>
          <div className="mt-2 font-mono break-all">{storage || 'Storage VPS não exposto.'}</div>
        </div>
        {modules.length === 0 && !error && <div className="text-xs text-zinc-500">Nenhum módulo foi publicado pelo Core.</div>}
        {modules.map((module) => (
          <div key={module.arquivo || module.nome} className="rounded border border-white/5 bg-black/30 p-3">
            <div className="font-mono text-xs text-white">{module.nome || 'módulo'}</div>
            <div className="mt-1 text-[11px] text-zinc-500">{module.arquivo || 'arquivo não informado'} · {module.tipo || 'tipo não informado'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

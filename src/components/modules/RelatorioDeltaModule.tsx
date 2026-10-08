import React, { useState } from 'react';
import { Activity, Shield, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';
import { DeltaReportItem } from '../../types/nyxos';

export const RelatorioDeltaModule: React.FC = () => {
  const [reports, setReports] = useState<DeltaReportItem[]>(nyxosApi.getDeltaReports());
  const [filter, setFilter] = useState<'ALL' | 'LLC' | 'VPS' | 'RESIDENCE' | 'CONTAINMENT'>('ALL');

  const filtered = reports.filter((r) => filter === 'ALL' || r.category === filter);

  const handleRefresh = () => {
    setReports(nyxosApi.getDeltaReports());
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-violet-400" />
          <div className="text-xs">
            <span className="font-medium text-zinc-200">Relatório Delta & Cadeia Operacional Auditável</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono">LLC / Contenção Ativa</span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 rounded border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/5 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/5 bg-black/10 text-xs">
        <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono mr-2">Filtro:</span>
        {(['ALL', 'LLC', 'VPS', 'RESIDENCE', 'CONTAINMENT'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              filter === cat
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Report Items List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded border border-white/5 bg-black/30 p-4 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-violet-400">{item.category}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs text-zinc-300">{item.summary}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <span>{item.actor}</span>
                <span className="text-zinc-600">·</span>
                <span>{item.timestamp}</span>
              </div>
            </div>

            <p className="mt-2 text-xs text-zinc-400 leading-relaxed font-sans">{item.details}</p>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5 text-emerald-400/90">
                <CheckCircle2 className="h-3 w-3" />
                <span>Auditoria Verificada</span>
              </span>
              <span>ID: {item.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

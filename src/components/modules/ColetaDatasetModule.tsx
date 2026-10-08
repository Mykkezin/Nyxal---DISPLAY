import React, { useState } from 'react';
import { Database, Download, ShieldCheck, Check, Search } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';
import { DatasetItem } from '../../types/nyxos';

interface ColetaDatasetModuleProps {
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const ColetaDatasetModule: React.FC<ColetaDatasetModuleProps> = ({ onNotify }) => {
  const [dataset, setDataset] = useState<DatasetItem[]>(nyxosApi.getDataset());
  const [search, setSearch] = useState('');

  const filtered = dataset.filter((d) =>
    d.content.toLowerCase().includes(search.toLowerCase()) ||
    d.channel.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataset, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `nyxos_dual_dataset_${Date.now()}.json`);
    dlAnchorElem.click();
    onNotify('success', 'Dataset Exportado', 'Arquivo JSON com pares higienizados gerado.');
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3">
          <Database className="h-4 w-4 text-violet-400" />
          <div className="text-xs">
            <span className="font-medium text-zinc-200">Coleta Dual de Dataset</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono">Pares Entrada-Saída com Higienização Pessoal</span>
          </div>
        </div>

        <button
          onClick={handleExportJson}
          className="flex items-center gap-1.5 rounded bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-medium text-white transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Exportar JSON</span>
        </button>
      </div>

      {/* Filter and stats */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/5 bg-black/10">
        <div className="flex items-center gap-2 rounded bg-black/50 border border-white/10 px-2.5 py-1 text-xs w-64">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar registros..."
            className="w-full bg-transparent text-white focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 tabular-nums">
          <span>Total: {dataset.length} registros</span>
          <span className="text-zinc-600">·</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% Higienizado
          </span>
        </div>
      </div>

      {/* Table list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded border border-white/5 bg-black/30 p-3.5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span
                className={`font-semibold ${
                  item.channel === 'USER_INPUT'
                    ? 'text-indigo-400'
                    : item.channel === 'NYXAL_RESPONSE'
                    ? 'text-violet-400'
                    : 'text-zinc-400'
                }`}
              >
                {item.channel}
              </span>
              <span className="text-zinc-500 tabular-nums">{item.timestamp} · {item.tokens} tokens</span>
            </div>

            <p className="mt-2 text-xs text-zinc-300 font-mono leading-relaxed bg-black/40 p-2.5 rounded border border-white/5">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

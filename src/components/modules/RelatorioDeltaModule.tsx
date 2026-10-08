import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, CheckCircle2 } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';
import { DeltaReportItem } from '../../types/nyxos';

export const RelatorioDeltaModule: React.FC = () => {
  const [reports,setReports]=useState<DeltaReportItem[]>([]);
  const [filter,setFilter]=useState<'ALL'|'LLC'|'VPS'|'RESIDENCE'|'CONTAINMENT'>('ALL');
  const [loading,setLoading]=useState(true);
  const refresh=async()=>{setLoading(true);try{setReports(await nyxosApi.getDeltaReports());}finally{setLoading(false);}};
  useEffect(()=>{refresh();},[]);
  const filtered=reports.filter(r=>filter==='ALL'||r.category===filter);
  return <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
    <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
      <div className="flex items-center gap-3"><Activity className="h-4 w-4 text-violet-400"/><div className="text-xs"><span className="font-medium text-zinc-200">Relatório Delta & Cadeia Operacional Auditável</span><span className="mx-2 text-zinc-600">·</span><span className="text-zinc-400 font-mono">{reports.length} eventos observados</span></div></div>
      <button onClick={refresh} className="flex items-center gap-1.5 rounded border border-white/10 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/5"><RefreshCw className={`h-3 w-3 ${loading?'animate-spin':''}`}/><span>Atualizar</span></button>
    </div>
    <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/5 bg-black/10 text-xs"><span className="text-[11px] uppercase text-zinc-500 font-mono mr-2">Filtro:</span>{(['ALL','LLC','VPS','RESIDENCE','CONTAINMENT'] as const).map(cat=><button key={cat} onClick={()=>setFilter(cat)} className={`px-2.5 py-1 rounded text-xs font-mono ${filter===cat?'bg-violet-600/30 text-violet-300 border border-violet-500/30':'text-zinc-400 hover:text-zinc-200'}`}>{cat}</button>)}</div>
    <div className="flex-1 overflow-y-auto p-6 space-y-3">
      {!loading&&!filtered.length&&<div className="rounded border border-white/5 bg-black/30 p-5 text-xs text-zinc-500">Nenhum evento Delta disponível no backend.</div>}
      {filtered.map(item=><div key={item.id} className="rounded border border-white/5 bg-black/30 p-4">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="font-mono text-xs font-semibold text-violet-400">{item.category}</span><span className="text-zinc-600">·</span><span className="text-xs text-zinc-300">{item.summary}</span></div><span className="text-[11px] font-mono text-zinc-500">{item.timestamp}</span></div>
        <pre className="mt-3 whitespace-pre-wrap text-[11px] text-zinc-400 leading-relaxed">{item.details}</pre>
        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-white/5 text-[11px] font-mono text-emerald-400/90"><CheckCircle2 className="h-3 w-3"/> Observado e auditável · {item.id}</div>
      </div>)}
    </div>
  </div>;
};
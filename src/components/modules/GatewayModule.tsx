import React from 'react';
import { ShieldAlert, Lock, Info } from 'lucide-react';

interface GatewayModuleProps {
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const GatewayModule: React.FC<GatewayModuleProps> = ({ onNotify }) => (
  <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
    <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
      <div className="flex items-center gap-3">
        <ShieldAlert className="h-4 w-4 text-violet-400" />
        <div className="text-xs">
          <span className="font-medium text-zinc-200">Gateway de Atuação & Fronteira de Contenção</span>
          <span className="mx-2 text-zinc-600">·</span>
          <span className="text-emerald-400 font-mono">Contenção Restrita</span>
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-6">
      <div className="rounded border border-emerald-500/20 bg-emerald-950/10 p-4 text-xs text-zinc-300">
        <div className="flex items-center gap-2 font-mono text-emerald-400 font-semibold">
          <Lock className="h-4 w-4" />
          <span>EXECUÇÃO ARBITRÁRIA BLOQUEADA</span>
        </div>
        <p className="mt-2 leading-relaxed">
          Este módulo não envia comandos livres ao host. O Gateway só deve executar capacidades
          explícitas quando houver uma rota de API real e autorização correspondente.
        </p>
      </div>

      <div className="mt-4 rounded border border-white/5 bg-black/30 p-4 text-xs text-zinc-400">
        <div className="flex items-center gap-2 text-zinc-200 font-mono">
          <Info className="h-4 w-4 text-violet-400" />
          <span>API DE ATUAÇÃO</span>
        </div>
        <p className="mt-2">
          A API atual não expõe um dispatcher genérico de comandos. O painel permanece somente
          informativo até que capacidades específicas sejam publicadas pelo NyxOS.
        </p>
      </div>

      <button
        onClick={() => onNotify('info', 'Gateway protegido', 'Nenhum comando livre foi enviado ao host.')}
        className="mt-4 rounded border border-white/10 px-3 py-2 text-[11px] font-mono text-zinc-400 hover:text-white"
      >
        VERIFICAR PROTEÇÃO
      </button>
    </div>
  </div>
);

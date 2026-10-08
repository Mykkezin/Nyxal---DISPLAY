import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Lock, Terminal as TerminalIcon } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';
import { GatewayAction } from '../../types/nyxos';

interface GatewayModuleProps {
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const GatewayModule: React.FC<GatewayModuleProps> = ({ onNotify }) => {
  const [actions, setActions] = useState<GatewayAction[]>(nyxosApi.getGatewayActions());
  const [customCommand, setCustomCommand] = useState('');

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCommand.trim()) return;

    nyxosApi.recordGatewayAction(customCommand.trim(), 'SYSTEMD', 'LOW');
    setActions(nyxosApi.getGatewayActions());
    setCustomCommand('');
    onNotify('success', 'Comando Auditado', 'Executado e assinado no Gateway de Atuação.');
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-4 w-4 text-violet-400" />
          <div className="text-xs">
            <span className="font-medium text-zinc-200">Gateway de Atuação & Fronteira de Contenção</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-emerald-400 font-mono">Contenção Restrita Ativa</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Security status banner */}
        <div className="rounded border border-emerald-500/20 bg-emerald-950/10 p-4 text-xs text-zinc-300">
          <div className="flex items-center gap-2 font-mono text-emerald-400 font-semibold mb-1">
            <Lock className="h-4 w-4" />
            <span>Fronteira Operacional Verificada</span>
          </div>
          Nenhuma instrução da Nyxal executa no host sem validação pelo Gateway. Ações KVM, modificações em discos e serviços systemd requerem assinatura criptográfica auditável.
        </div>

        {/* Audited command dispatcher */}
        <form onSubmit={handleExecute} className="space-y-2">
          <label className="text-[11px] font-mono text-zinc-400">
            Executar Operação Supervisionada
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 font-mono text-xs text-violet-400">nyxos&gt;</span>
              <input
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                placeholder="virsh list --all / systemctl status nyxal-api..."
                className="w-full rounded border border-white/10 bg-black/60 pl-20 pr-4 py-2 font-mono text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-medium text-white transition-colors"
            >
              Auditar e Enviar
            </button>
          </div>
        </form>

        {/* Execution History */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            Trilha de Auditoria Recente
          </div>

          <div className="space-y-2">
            {actions.map((act) => (
              <div
                key={act.id}
                className="rounded border border-white/5 bg-black/40 p-3 text-xs font-mono"
              >
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-violet-400 font-semibold">[{act.domain}]</span>
                  <span className="text-zinc-500">{act.executedAt}</span>
                </div>
                <div className="mt-1 text-zinc-200 bg-black/40 p-2 rounded border border-white/5 truncate">
                  <code>{act.command}</code>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>STATUS: {act.status}</span>
                  </span>
                  <span>Assinatura: {act.auditorSignature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

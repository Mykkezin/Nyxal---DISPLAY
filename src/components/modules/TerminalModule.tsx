import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';

export const TerminalModule: React.FC = () => {
  const [history, setHistory] = useState<Array<{ command: string; output: string }>>([
    {
      command: 'nyxos-shell --init',
      output: 'NyxOS Shell v2.4 (x86_64-pc-linux-gnu)\nNyxal Core: Residente (Unix Socket /run/nyxal.sock)\nTarget: nyxos.target [ACTIVE]\nDigite "help" para ver os comandos disponíveis.',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    let output = '';
    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      output = `Comandos do NyxOS:
  help                     Exibe esta lista
  clear                    Limpa a tela do terminal
  virsh list --all         Lista instâncias KVM do hipervisor
  systemctl status         Exibe status dos serviços residentes
  nyxal status             Exibe telemetria do núcleo Nyxal
  vps status               Exibe estado das VMs
  uname -a                 Informações do kernel Linux
  exit                     Fecha o shell`;
    } else if (lower === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (lower.startsWith('virsh') || lower.startsWith('vps')) {
      const vms = await nyxosApi.getVpsInstances();
      output = ` Id   Nome                Estado     IP\n----------------------------------------------------\n` +
        vms.map((v, i) => ` ${i + 1}    ${v.name.padEnd(19)} ${v.status.padEnd(10)} ${v.ip || '-'}`).join('\n');
    } else if (lower.startsWith('systemctl')) {
      const svcs = nyxosApi.getSystemServices();
      output = svcs.map((s) => `● ${s.name} - ${s.description}\n   Loaded: active (${s.subState})`).join('\n\n');
    } else if (lower.startsWith('nyxal')) {
      output = `Nyxal Core Daemon\nEstado: ONLINE\nResidência: Contínua\nAuditoria LLC: 0 anomalias\nModelo de Contexto: Sincronizado`;
    } else if (lower === 'uname -a') {
      output = 'Linux nyxos-workstation 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
    } else {
      output = `nyxos-sh: comando não encontrado: ${cmd}. Digite "help" para ver as opções.`;
    }

    setHistory((prev) => [...prev, { command: cmd, output }]);
    setInputVal('');
  };

  return (
    <div className="flex h-full flex-col bg-[#07080b] font-mono text-xs text-zinc-300 select-text">
      {/* Top bar info */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 bg-black/40 text-[11px] text-zinc-500">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-3.5 w-3.5 text-violet-400" />
          <span>nyxal@nyxos-host: ~</span>
        </div>
        <span>bash 5.2.21</span>
      </div>

      {/* Output area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.map((h, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2 text-violet-400">
              <span className="text-zinc-500">nyxal@nyxos:~$</span>
              <span className="text-white">{h.command}</span>
            </div>
            <pre className="whitespace-pre-wrap text-zinc-400 text-[11px] leading-relaxed pl-2 border-l border-white/10">
              {h.output}
            </pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Command prompt */}
      <form onSubmit={handleCommand} className="flex items-center gap-2 border-t border-white/5 bg-black/60 px-4 py-2.5">
        <span className="text-violet-400">nyxal@nyxos:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Digite um comando..."
          autoFocus
          className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs"
        />
      </form>
    </div>
  );
};

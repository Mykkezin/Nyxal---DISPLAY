import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, RefreshCw } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';

type Entry = { command: string; output: string };

export const TerminalModule: React.FC = () => {
  const [history, setHistory] = useState<Entry[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  const run = async (command: string) => {
    const cmd = command.trim();
    if (!cmd) return;

    if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    let output: string;
    try {
      if (cmd === 'help') {
        output = 'Comandos expostos pelo Display:\\n  help\\n  nyxal status\\n  vps status\\n  systemctl status\\n  clear\\n\\nExecução shell arbitrária não é exposta pela API do Nyxal Core.';
      } else if (cmd === 'nyxal status') {
        output = JSON.stringify(await nyxosApi.getPublicStatus(), null, 2);
      } else if (cmd === 'vps status') {
        const [status, instances] = await Promise.all([nyxosApi.getVpsStatus(), nyxosApi.getVpsInstances()]);
        output = JSON.stringify({ status, instances }, null, 2);
      } else if (cmd === 'systemctl status') {
        output = JSON.stringify(await nyxosApi.getSystemServices(), null, 2);
      } else {
        output = 'Comando não exposto pelo Nyxal Core. O Display não simula execução de shell.';
      }
    } catch (error) {
      output = JSON.stringify({
        sucesso: false,
        motivo: error instanceof Error ? error.message : 'Falha ao consultar o Nyxal Core.',
      }, null, 2);
    }

    setHistory((prev) => [...prev, { command: cmd, output }]);
    setInput('');
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    void run(input);
  };

  return (
    <div className="flex h-full flex-col bg-[#07080b] font-mono text-xs text-zinc-300 select-text">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 bg-black/40 text-[11px] text-zinc-500">
        <div className="flex items-center gap-2"><TerminalIcon className="h-3.5 w-3.5 text-violet-400" /><span>nyxal@nyxos · API terminal</span></div>
        <button onClick={() => void run('nyxal status')} className="flex items-center gap-1 text-zinc-400 hover:text-white"><RefreshCw className="h-3 w-3" /> status</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 && <pre className="whitespace-pre-wrap text-zinc-500">{'NyxOS Display conectado ao Nyxal Core.\\nDigite "help" para os comandos de consulta disponíveis.'}</pre>}
        {history.map((item, index) => (
          <div key={index} className="space-y-1">
            <div><span className="text-zinc-500">nyxos$</span> <span className="text-white">{item.command}</span></div>
            <pre className="whitespace-pre-wrap pl-2 border-l border-white/10 text-zinc-400">{item.output}</pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/5 bg-black/60 px-4 py-2.5">
        <span className="text-violet-400">nyxos$</span>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="help" className="flex-1 bg-transparent text-white focus:outline-none" />
      </form>
    </div>
  );
};

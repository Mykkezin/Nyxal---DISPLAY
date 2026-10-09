import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Bot, CalendarDays, CheckCircle2, Clock, Contact, FolderOpen, Mail, RefreshCw, Server, ShieldCheck, Volume2, WifiOff } from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';

type Data = Record<string, unknown>;

function objectValue(value: unknown): Data {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Data : {};
}

function textValue(value: unknown, fallback = '—'): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

function percentValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(1) + '%' : '—';
}

function StatePill({ ready, children }: { ready: boolean; children: React.ReactNode }) {
  return (
    <span className={'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono ' +
      (ready ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-300')}>
      {ready ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {children}
    </span>
  );
}

export const IntegracoesModule: React.FC = () => {
  const [agentStatus, setAgentStatus] = useState<Data | null>(null);
  const [context, setContext] = useState<Data | null>(null);
  const [gmailStatus, setGmailStatus] = useState<Data | null>(null);
  const [messages, setMessages] = useState<Data[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<Data[]>([]);
  const [contacts, setContacts] = useState<Data[]>([]);
  const [driveFiles, setDriveFiles] = useState<Data[]>([]);
  const [emailQuery, setEmailQuery] = useState('is:unread newer_than:7d');
  const [selectedMessage, setSelectedMessage] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gmailError, setGmailError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    setGmailError('');
    const [agentResult, contextResult, gmailResult] = await Promise.allSettled([
      nyxosApi.getAgentStatus(),
      nyxosApi.getAgentContext(),
      nyxosApi.getGmailStatus(),
    ]);

    if (agentResult.status === 'fulfilled') setAgentStatus(agentResult.value);
    else {
      setAgentStatus(null);
      setError(agentResult.reason instanceof Error ? agentResult.reason.message : 'Falha ao consultar o agente.');
    }

    if (contextResult.status === 'fulfilled') setContext(contextResult.value);
    else {
      setContext(null);
      setError((current) => current || (contextResult.reason instanceof Error ? contextResult.reason.message : 'Falha ao observar o sistema.'));
    }

    if (gmailResult.status === 'fulfilled') {
      setGmailStatus(gmailResult.value);
      if (gmailResult.value.estado === 'configurado') {
        const [mailResult, calendarResult, contactsResult, driveResult] = await Promise.allSettled([
          nyxosApi.getGmailMessages(emailQuery),
          nyxosApi.getGoogleCalendarEvents(12, 14),
          nyxosApi.getGoogleContacts(25),
          nyxosApi.getGoogleDriveFiles(25),
        ]);
        if (mailResult.status === 'fulfilled') {
          const rows = Array.isArray(mailResult.value.mensagens) ? mailResult.value.mensagens.filter((item): item is Data => Boolean(item) && typeof item === 'object') : [];
          setMessages(rows);
        } else {
          setMessages([]);
          setGmailError(mailResult.reason instanceof Error ? mailResult.reason.message : 'Não foi possível consultar o Gmail.');
        }
        if (calendarResult.status === 'fulfilled') {
          const rows = Array.isArray(calendarResult.value.eventos) ? calendarResult.value.eventos.filter((item): item is Data => Boolean(item) && typeof item === 'object') : [];
          setCalendarEvents(rows);
        } else setCalendarEvents([]);
        if (contactsResult.status === 'fulfilled') {
          const rows = Array.isArray(contactsResult.value.contatos) ? contactsResult.value.contatos.filter((item): item is Data => Boolean(item) && typeof item === 'object') : [];
          setContacts(rows);
        } else setContacts([]);
        if (driveResult.status === 'fulfilled') {
          const rows = Array.isArray(driveResult.value.arquivos) ? driveResult.value.arquivos.filter((item): item is Data => Boolean(item) && typeof item === 'object') : [];
          setDriveFiles(rows);
        } else setDriveFiles([]);
      } else {
        setMessages([]);
        setCalendarEvents([]);
        setContacts([]);
        setDriveFiles([]);
      }
    } else {
      setGmailStatus(null);
      setMessages([]);
      setGmailError(gmailResult.reason instanceof Error ? gmailResult.reason.message : 'Status do Gmail indisponível.');
    }
    setLoading(false);
  }, [emailQuery]);

  useEffect(() => { void refresh(); }, [refresh]);

  const providers = objectValue(agentStatus?.provedores);
  const whatsapp = objectValue(agentStatus?.whatsapp);
  const voice = objectValue(agentStatus?.voz);
  const visual = objectValue(agentStatus?.criacao_visual);
  const observability = objectValue(context?.observabilidade);
  const host = objectValue(observability.host);
  const memory = objectValue(observability.memoria);
  const storage = objectValue(observability.armazenamento_home);
  const processes = objectValue(observability.processos);
  const units = objectValue(observability.servicos_usuario);
  const unitRows = Array.isArray(units.unidades) ? units.unidades.filter((item): item is Data => Boolean(item) && typeof item === 'object') : [];
  const processRows = Array.isArray(processes.top_cpu) ? processes.top_cpu.filter((item): item is Data => Boolean(item) && typeof item === 'object') : [];
  const agentProvider = textValue(agentStatus?.provedor_resolvido, 'desconhecido');
  const gmailConfigured = gmailStatus?.estado === 'configurado';

  return (
    <div className="h-full overflow-y-auto bg-[#0b0c13] p-4 text-zinc-100">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold"><Bot className="h-4 w-4 text-violet-400" /> Agente Nyxal</div>
          <p className="mt-1 text-[11px] text-zinc-500">Conectores, memória e observabilidade real do Core</p>
        </div>
        <button onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-50">
          <RefreshCw className={'h-3.5 w-3.5 ' + (loading ? 'animate-spin' : '')} /> Atualizar
        </button>
      </div>

      {error && <div className="mb-3 rounded border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">{error}</div>}

      <section className="mb-4 rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Roteamento do agente</h3>
          <span className="rounded bg-violet-500/10 px-2 py-1 font-mono text-[10px] text-violet-300">{agentProvider.toUpperCase()}</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(providers).map(([name, raw]) => {
            const provider = objectValue(raw);
            const ready = provider.configurado === true;
            return (
              <div key={name} className="flex items-center justify-between gap-2 rounded border border-white/5 bg-white/[0.02] px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-xs text-zinc-200">{name.replaceAll('_', ' ')}</div>
                  <div className="mt-0.5 truncate text-[10px] text-zinc-500">{textValue(provider.papel, 'provedor')}</div>
                </div>
                <StatePill ready={ready}>{ready ? 'CONFIGURADO' : 'PENDENTE'}</StatePill>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
          <span>Memória Letta: {objectValue(agentStatus?.memoria_letta).configurada === true ? 'configurada' : 'pendente'}</span>
          <span>·</span>
          <span>Imagem Gemini: {visual.configurado === true ? 'configurada' : 'pendente'}</span>
          <span>·</span>
          <span>Voz: {textValue(voice.voz_configurada, 'indisponível')}</span>
          <span>·</span>
          <span>WhatsApp: {textValue(whatsapp.estado, 'não configurado')}</span>
        </div>
      </section>

      <section className="mb-4 rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
          <Activity className="h-4 w-4 text-violet-400" /> Observabilidade local · somente leitura
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <div className="rounded border border-white/5 bg-white/[0.02] p-3"><div className="text-[10px] text-zinc-500">Host</div><div className="mt-1 truncate text-xs">{textValue(host.hostname)}</div><div className="mt-1 text-[10px] text-zinc-500">{textValue(host.sistema)} {textValue(host.release, '')}</div></div>
          <div className="rounded border border-white/5 bg-white/[0.02] p-3"><div className="text-[10px] text-zinc-500">Memória RAM</div><div className="mt-1 text-lg font-mono">{percentValue(memory.uso_percentual)}</div></div>
          <div className="rounded border border-white/5 bg-white/[0.02] p-3"><div className="text-[10px] text-zinc-500">Armazenamento /home</div><div className="mt-1 text-lg font-mono">{percentValue(storage.uso_percentual)}</div></div>
          <div className="rounded border border-white/5 bg-white/[0.02] p-3"><div className="text-[10px] text-zinc-500">Processos observados</div><div className="mt-1 text-lg font-mono">{textValue(processes.total_observado, '—')}</div></div>
        </div>
        <div className="mb-2 flex items-center gap-2 text-[11px] text-zinc-400"><Server className="h-3.5 w-3.5" /> Serviços da sessão do usuário</div>
        <div className="max-h-36 space-y-1 overflow-y-auto">
          {unitRows.slice(0, 20).map((unit, index) => (
            <div key={textValue(unit.unidade, String(index))} className="flex items-center justify-between gap-3 rounded bg-white/[0.02] px-2.5 py-1.5 text-[10px]">
              <span className="truncate font-mono text-zinc-300">{textValue(unit.unidade)}</span>
              <span className={unit.active === 'active' ? 'shrink-0 text-emerald-300' : 'shrink-0 text-zinc-500'}>{textValue(unit.active)} / {textValue(unit.sub)}</span>
            </div>
          ))}
          {unitRows.length === 0 && <div className="rounded bg-white/[0.02] p-3 text-[11px] text-zinc-500">Serviços não observados. Atualize para tentar novamente.</div>}
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-600"><ShieldCheck className="h-3 w-3" /> O módulo não executa comandos nem altera serviços.</div>

        <div className="mb-2 mt-4 flex items-center gap-2 text-[11px] text-zinc-400"><Activity className="h-3.5 w-3.5" /> Processos por CPU</div>
        <div className="max-h-36 space-y-1 overflow-y-auto">
          {processRows.slice(0, 10).map((process, index) => (
            <div key={textValue(process.pid, String(index))} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded bg-white/[0.02] px-2.5 py-1.5 text-[10px]">
              <span className="truncate font-mono text-zinc-300">{textValue(process.nome)}</span>
              <span className="font-mono text-violet-300">CPU {percentValue(process.cpu_percentual)}</span>
              <span className="font-mono text-zinc-500">RAM {percentValue(process.memoria_percentual)}</span>
            </div>
          ))}
          {processRows.length === 0 && <div className="rounded bg-white/[0.02] p-3 text-[11px] text-zinc-500">A lista de processos não foi retornada.</div>}
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300"><Mail className="h-4 w-4 text-violet-400" /> Google Workspace · OAuth</div>
          <StatePill ready={gmailConfigured}>{gmailConfigured ? 'AUTORIZADO · LEITURA' : 'PENDENTE'}</StatePill>
        </div>
        <p className="mb-2 text-[11px] text-zinc-400">{gmailConfigured ? 'Acesso somente leitura. Nenhum e-mail será enviado, apagado ou alterado.' : textValue(gmailStatus?.proximo_passo, 'Autorize o Gmail seguindo docs/NYXAL_AGENT_STACK.md.')}</p>
        {gmailError && <div className="mb-2 rounded border border-amber-500/20 bg-amber-500/5 p-2 text-[10px] text-amber-300">{gmailError}</div>}
        <div className="mb-2 flex gap-2">
          <input value={emailQuery} onChange={(event) => setEmailQuery(event.target.value)} aria-label="Consulta Gmail" className="min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-3 py-2 text-[11px] text-zinc-200 outline-none focus:border-violet-500/40" placeholder="Pesquisa Gmail: is:unread newer_than:7d" />
          <button onClick={() => void refresh()} disabled={loading || !gmailConfigured} className="rounded border border-white/10 px-3 py-2 text-[10px] text-zinc-300 hover:bg-white/5 disabled:opacity-40">Buscar</button>
        </div>
        <div className="space-y-2">
          {messages.map((message, index) => (
            <button key={textValue(message.id, String(index))} onClick={() => {
              const id = textValue(message.id, '');
              if (!id) return;
              void nyxosApi.getGmailMessage(id).then(setSelectedMessage).catch((reason) => setGmailError(reason instanceof Error ? reason.message : 'Falha ao ler a mensagem.'));
            }} className="block w-full rounded border border-white/5 bg-white/[0.02] p-3 text-left hover:border-violet-500/30">
              <div className="flex items-start justify-between gap-3"><span className="line-clamp-1 text-xs font-medium text-zinc-200">{textValue(message.assunto, '(sem assunto)')}</span><span className="shrink-0 text-[9px] text-zinc-600">{textValue(message.data, '')}</span></div>
              <div className="mt-1 truncate text-[10px] text-zinc-400">{textValue(message.remetente)}</div>
              <div className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-zinc-500">{textValue(message.trecho, '')}</div>
            </button>
          ))}
          {gmailConfigured && !gmailError && messages.length === 0 && <div className="rounded bg-white/[0.02] p-3 text-[11px] text-zinc-500">Nenhuma mensagem não lida recente foi retornada.</div>}
          {!gmailConfigured && <div className="rounded bg-white/[0.02] p-3 text-[11px] text-zinc-500">O leitor de e-mail aparece aqui depois da autorização OAuth local.</div>}
        </div>
        {selectedMessage && (
          <div className="mt-3 rounded border border-violet-500/20 bg-violet-500/5 p-3">
            <div className="mb-2 flex items-center justify-between gap-2"><h4 className="text-xs font-semibold">{textValue(selectedMessage.assunto)}</h4><button onClick={() => setSelectedMessage(null)} className="text-[10px] text-violet-300">Fechar</button></div>
            <div className="mb-2 text-[10px] text-zinc-400">{textValue(selectedMessage.remetente)} · {textValue(selectedMessage.data, '')}</div>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-zinc-300">{textValue(selectedMessage.corpo_texto, 'Corpo vazio ou formato não suportado.')}</pre>
          </div>
        )}
      </section>

      <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300"><CalendarDays className="h-4 w-4 text-violet-400" /> Agenda · próximos 14 dias</div>
        <div className="space-y-2">
          {calendarEvents.map((event, index) => (
            <div key={textValue(event.id, String(index))} className="rounded border border-white/5 bg-white/[0.02] p-3">
              <div className="text-xs font-medium text-zinc-200">{textValue(event.titulo, '(sem título)')}</div>
              <div className="mt-1 text-[10px] text-zinc-500">{textValue(event.inicio)} {event.fim ? '→ ' + textValue(event.fim, '') : ''}</div>
              {typeof event.local === 'string' && <div className="mt-1 text-[10px] text-zinc-500">{event.local}</div>}
            </div>
          ))}
          {gmailConfigured && calendarEvents.length === 0 && <div className="text-[11px] text-zinc-500">Nenhum evento retornado na janela consultada.</div>}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300"><Contact className="h-4 w-4 text-violet-400" /> Contatos Google</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {contacts.slice(0, 25).map((contact, index) => (
            <div key={textValue(contact.id, String(index))} className="rounded border border-white/5 bg-white/[0.02] p-3">
              <div className="text-xs text-zinc-200">{textValue(contact.nome, '(sem nome)')}</div>
              {Array.isArray(contact.emails) && contact.emails.slice(0, 3).map((email, eIndex) => <div key={eIndex} className="mt-1 break-all text-[10px] text-zinc-400">{String(email)}</div>)}
              {Array.isArray(contact.telefones) && contact.telefones.slice(0, 2).map((phone, pIndex) => <div key={pIndex} className="mt-1 text-[10px] text-zinc-500">{String(phone)}</div>)}
            </div>
          ))}
          {gmailConfigured && contacts.length === 0 && <div className="text-[11px] text-zinc-500">Nenhum contato retornado.</div>}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300"><FolderOpen className="h-4 w-4 text-violet-400" /> Google Drive · metadados</div>
        <div className="space-y-1">
          {driveFiles.map((file, index) => (
            <div key={textValue(file.id, String(index))} className="flex items-center justify-between gap-3 rounded bg-white/[0.02] px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-xs text-zinc-200">{textValue(file.nome, '(sem nome)')}</div>
                <div className="mt-1 text-[10px] text-zinc-500">{textValue(file.tipo)} · {textValue(file.modificado_em, 'data desconhecida')}</div>
              </div>
              {typeof file.link === 'string' && file.link.startsWith('https://') && <a href={file.link} target="_blank" rel="noreferrer" className="shrink-0 text-[10px] text-violet-300 hover:text-violet-200">Abrir</a>}
            </div>
          ))}
          {gmailConfigured && driveFiles.length === 0 && <div className="text-[11px] text-zinc-500">Nenhum arquivo retornado.</div>}
        </div>
        <div className="mt-3 text-[10px] text-zinc-600">O Display lê metadados do Drive; não baixa nem modifica os arquivos.</div>
      </section>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-600"><Volume2 className="h-3 w-3" /> Voz feminina local: Kokoro pf_dora · <WifiOff className="h-3 w-3" /> WhatsApp depende de pareamento no Hermes.</div>
    </div>
  );
};

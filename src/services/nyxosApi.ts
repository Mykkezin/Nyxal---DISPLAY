import {
  VpsInstance,
  SystemService,
  DeltaReportItem,
  DatasetItem,
  GatewayAction,
  NyxalState,
  NyxalMessage,
} from '../types/nyxos';

const configuredApiRoot = (import.meta.env.VITE_NYXAL_API_URL as string | undefined)?.trim().replace(/\/+$/, '') ?? '';
const API_BASE_URL = configuredApiRoot
  ? (configuredApiRoot.endsWith('/api') ? configuredApiRoot : configuredApiRoot + '/api')
  : '/api';

type ApiErrorPayload = { motivo?: string; erro?: string; estado?: string };

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });
  let payload: unknown = null;
  try { payload = await response.json(); } catch {}
  if (!response.ok) {
    const errorPayload = (payload ?? {}) as ApiErrorPayload;
    throw new Error(errorPayload.motivo || errorPayload.erro || errorPayload.estado || `HTTP ${response.status}`);
  }
  return payload as T;
}

function normalizarVps(item: any): VpsInstance {
  const info = item?.info ?? {};
  const estado = String(item?.estado ?? '').toLowerCase();
  return {
    id: String(item?.nome ?? info?.name ?? ''),
    name: String(item?.nome ?? info?.name ?? 'VPS'),
    status: estado === 'running' ? 'RUNNING' : estado === 'paused' ? 'PAUSED' : estado === 'shut off' || estado === 'shutoff' ? 'SHUTOFF' : 'ERROR',
    ip: Array.isArray(item?.ips) && item.ips.length ? String(item.ips[0]).split('/')[0] : null,
    os: item?.os ? String(item.os) : null,
    vcpu: Number.parseInt(String(info?.cpu_s ?? info?.['cpu(s)'] ?? '0'), 10) || 0,
    memoryMb: Math.round(Number.parseInt(String(info?.used_memory ?? '0'), 10) / 1024) || 0,
    diskGb: item?.disk_gb == null ? null : Number(item.disk_gb),
    autostart: String(info?.autostart ?? '').toLowerCase() === 'enable',
    qemuGuestAgent: item?.qemu_guest_agent == null ? null : Boolean(item.qemu_guest_agent),
    sshPort: 22,
    createdAt: item?.created_at ?? null,
    uptime: item?.uptime ?? null,
  };
}

function normalizarDelta(item: any): DeltaReportItem {
  const tipo = String(item?.tipo ?? 'sistema').toUpperCase();
  const category: DeltaReportItem['category'] =
    tipo === 'VPS' ? 'VPS' :
    tipo === 'CONTENIMENTO' || tipo === 'ARQUITETURA' ? 'CONTAINMENT' :
    tipo === 'CONHECIMENTO' || tipo === 'MEMORIA' ? 'KNOWLEDGE' :
    tipo === 'CICLO' || tipo === 'SISTEMA' || tipo === 'PROCESSO' ? 'LLC' :
    'LLC';
  return {
    id: String(item?.delta_id ?? item?.id ?? 'delta'),
    timestamp: String(item?.criado_em ?? item?.timestamp ?? ''),
    category,
    actor: 'Systemd',
    summary: String(item?.causa ?? 'Evento Delta observado'),
    details: JSON.stringify({
      estado_anterior: item?.estado_anterior,
      estado_novo: item?.estado_novo,
      evidencias: item?.evidencias,
      ciclo: item?.ciclo,
      resultado: item?.resultado,
    }, null, 2),
    status: item?.integracao_executada ? 'PENDING' : 'AUDITED',
  };
}

class NyxosApiService {
  private sessaoId: string | null = null;

  private getSessionId(): string | undefined {
    if (typeof window === 'undefined') return this.sessaoId ?? undefined;
    this.sessaoId = this.sessaoId || window.localStorage.getItem('nyxal_sessao');
    return this.sessaoId ?? undefined;
  }

  private saveSessionId(id: string | null | undefined) {
    if (!id) return;
    this.sessaoId = id;
    if (typeof window !== 'undefined') window.localStorage.setItem('nyxal_sessao', id);
  }

  async getPublicStatus() { return requestJson<any>('/public/status'); }

  async getAgentStatus() { return requestJson<any>('/agent/status'); }
  async getAgentContext() { return requestJson<any>('/agent/contexto'); }
  async getGmailStatus() { return requestJson<any>('/integracoes/gmail/status'); }
  async getGmailMessages(query = 'is:unread newer_than:7d', limit = 10) {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    return requestJson<any>('/integracoes/gmail/mensagens?' + params.toString());
  }
  async getGmailMessage(id: string) {
    return requestJson<any>('/integracoes/gmail/mensagem?' + new URLSearchParams({ id }).toString());
  }

  async getGoogleWorkspaceStatus() { return requestJson<any>('/integracoes/google/status'); }
  async getGoogleCalendarEvents(limit = 12, days = 14) {
    return requestJson<any>('/integracoes/google/agenda?' + new URLSearchParams({ limit: String(limit), days: String(days) }).toString());
  }
  async getGoogleContacts(limit = 25) {
    return requestJson<any>('/integracoes/google/contatos?' + new URLSearchParams({ limit: String(limit) }).toString());
  }
  async getGoogleDriveFiles(limit = 25) {
    return requestJson<any>('/integracoes/google/drive?' + new URLSearchParams({ limit: String(limit) }).toString());
  }
  async generateOrEditImage(payload: { prompt: string; imageBase64?: string; mimeType?: string }) {
    return requestJson<any>('/agent/image', {
      method: 'POST',
      body: JSON.stringify({
        prompt: payload.prompt,
        ...(payload.imageBase64 ? { imagem_base64: payload.imageBase64 } : {}),
        ...(payload.mimeType ? { mime_type: payload.mimeType } : {}),
      }),
    });
  }
  async getNyxosContexto() { return requestJson<any>('/public/nyxos/contexto'); }
  async getResidencia() { return requestJson<any>('/public/residencia'); }
  async getDeltaReports(): Promise<DeltaReportItem[]> {
    const raw = await requestJson<any>('/public/delta');
    return Array.isArray(raw?.eventos) ? raw.eventos.map(normalizarDelta) : [];
  }
  async getDatasetContext() { return requestJson<any>('/public/dataset'); }
  async getPresenca() { return requestJson<any>('/public/presenca'); }
  async getRecursos() { return requestJson<any>('/public/recursos'); }
  async getOperacional() { return requestJson<any>('/public/operacional'); }
  async getGatewayContext() { return requestJson<any>('/public/gateway'); }
  async getAe5() { return requestJson<any>('/public/ae5'); }

  async getVpsStatus() {
    const raw = await requestJson<any>('/vps/status');
    const host = raw?.host ?? {};
    const instances = await this.getVpsInstances();
    return {
      hypervisor: raw?.backend ?? 'libvirt/KVM',
      connected: Boolean(raw?.operacional),
      totalVms: Number(raw?.dominios ?? instances.length),
      runningVms: instances.filter(v => v.status === 'RUNNING').length,
      hostThreads: Number(host?.['cpu(s)'] ?? host?.cpu_s ?? 0) || 0,
      hostRamTotalGb: Number(host?.memory_size ?? 0) / 1024 / 1024 || 0,
      hostRamUsedGb: 0,
      imagePath: null,
      cloudImageReady: null,
    };
  }

  async getVpsInstances(): Promise<VpsInstance[]> {
    const raw = await requestJson<any>('/vps/instances');
    return Array.isArray(raw?.instancias) ? raw.instancias.map(normalizarVps) : [];
  }

  async getVpsContexto() { return requestJson<any>('/vps/contexto'); }

  async vpsAction(instanceId: string, action: 'iniciar'|'desligar'|'reiniciar'|'destruir'|'autostart_toggle') {
    const instances = await this.getVpsInstances();
    const current = instances.find(item => item.id === instanceId);
    const acao = action === 'autostart_toggle'
      ? (current?.autostart ? 'autostart_off' : 'autostart')
      : ({ iniciar:'start', desligar:'shutdown', reiniciar:'reboot', destruir:'destroy' } as Record<string,string>)[action];
    return requestJson<any>('/vps/action', { method:'POST', body:JSON.stringify({ nome:instanceId, acao }) });
  }

  async provisionarVps(payload: {name:string; vcpu:number; memoryMb:number; diskGb:number; user:string; sshKey:string; imagePath?:string; autostart?:boolean}): Promise<VpsInstance> {
    if (!payload.sshKey.trim()) throw new Error('A chave SSH pública é obrigatória.');
    const result = await requestJson<any>('/vps/provisionar', {
      method:'POST',
      body:JSON.stringify({
        nome:payload.name,
        image_path:payload.imagePath || '/home/nyxal/NyxOS/VPS/ubuntu-24.04-server-cloudimg-amd64.img',
        username:payload.user,
        ssh_public_key:payload.sshKey.trim(),
        memory_mb:payload.memoryMb,
        vcpus:payload.vcpu,
        disk_gb:payload.diskGb,
        autostart:payload.autostart ?? true,
      }),
    });
    return { id:String(result?.nome ?? payload.name), name:String(result?.nome ?? payload.name), status:'PROVISIONING', ip:null, os:'Ubuntu 24.04', vcpu:Number(result?.vcpus ?? payload.vcpu), memoryMb:Number(result?.memory_mb ?? payload.memoryMb), diskGb:Number(result?.disk_gb ?? payload.diskGb), autostart:Boolean(result?.autostart ?? true), qemuGuestAgent:null, sshPort:22, createdAt:null, uptime:null };
  }

  async converseWithNyxal(query:string,onStateChange?:(state:NyxalState)=>void):Promise<NyxalMessage> {
    onStateChange?.('PROCESSANDO');
    try {
      const raw = await requestJson<any>('/agent/chat',{method:'POST',body:JSON.stringify({mensagem:query,sessao:this.getSessionId()})});
      this.saveSessionId(raw?.sessao);
      onStateChange?.(raw?.estado === 'execucao_concluida' ? 'EXECUTANDO' : 'CONCLUIDO');
      return { id:`msg-${Date.now()}`, sender:'nyxal', text:String(raw?.resposta ?? raw?.erro ?? 'A Nyxal não retornou uma resposta.'), timestamp:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}), stateTrigger:'CONCLUIDO' };
    } catch (error) {
      onStateChange?.('ERRO');
      throw error;
    }
  }

  async speak(texto:string):Promise<void> {
    const response=await fetch(`${API_BASE_URL}/tts`,{method:'POST',headers:{Accept:'audio/wav','Content-Type':'application/json'},body:JSON.stringify({texto})});
    if(!response.ok) throw new Error(`TTS HTTP ${response.status}`);
    const blob=await response.blob();
    const url=URL.createObjectURL(blob);
    const audio=new Audio(url);
    try { await audio.play(); await new Promise<void>(resolve=>{audio.addEventListener('ended',()=>resolve(),{once:true});audio.addEventListener('error',()=>resolve(),{once:true});}); }
    finally { URL.revokeObjectURL(url); }
  }

  async transcribe(blob:Blob):Promise<string> {
    const response=await fetch(`${API_BASE_URL}/stt`,{method:'POST',headers:{Accept:'application/json',...(blob.type?{'Content-Type':blob.type}:{})},body:blob});
    let payload:any=null; try{payload=await response.json();}catch{}
    if(!response.ok) throw new Error(payload?.motivo || payload?.erro || `STT HTTP ${response.status}`);
    return String(payload?.texto ?? '');
  }

  async getSystemServices():Promise<SystemService[]> {
    const raw=await this.getResidencia();
    return Array.isArray(raw?.unidades) ? raw.unidades : [];
  }

  async restartService():Promise<boolean> {
    throw new Error('A residência é somente leitura pela API pública; reinicialização continua sob o supervisor systemd.');
  }

  async getGatewayActions():Promise<GatewayAction[]> {
    const raw=await this.getGatewayContext();
    const gateway=raw?.gateway ?? {};
    return Array.isArray(gateway?.historico) ? gateway.historico : [];
  }

  async getDataset():Promise<DatasetItem[]> {
    const raw=await this.getDatasetContext();
    return [];
  }
}

export const nyxosApi = new NyxosApiService();

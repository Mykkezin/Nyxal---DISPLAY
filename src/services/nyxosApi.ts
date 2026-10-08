import {
  DeltaReportItem,
  DatasetItem,
  GatewayAction,
  NyxalMessage,
  NyxosPublicStatus,
  NyxosSystemSnapshot,
  SystemService,
  VpsInstance,
  VpsStatus,
  NyxalState,
} from '../types/nyxos';

const API_BASE_URL = ((import.meta.env.VITE_NYXAL_API_URL as string | undefined) || '').trim().replace(/\/$/, '');

function apiUrl(path: string): string {
  return API_BASE_URL ? \`\${API_BASE_URL}\${path}\` : path;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });

  const raw = await response.text();
  let payload: unknown = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    // respostas não-JSON são tratadas pelo status HTTP
  }

  if (!response.ok) {
    const reason =
      payload &&
      typeof payload === 'object' &&
      'motivo' in payload &&
      typeof payload.motivo === 'string'
        ? payload.motivo
        : \`Nyxal API HTTP \${response.status}\`;
    throw new Error(reason);
  }

  return payload as T;
}

function assertSuccess<T extends { sucesso?: boolean; motivo?: string; estado?: string }>(payload: T): T {
  if (payload.sucesso === false) {
    throw new Error(payload.motivo || payload.estado || 'Operação recusada pelo Nyxal Core');
  }
  return payload;
}

function numberFromDomInfo(info: Record<string, unknown>, key: string): number {
  const match = String(info[key] ?? '').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function mapVps(item: Record<string, unknown>): VpsInstance {
  const info = (item.info && typeof item.info === 'object' ? item.info : {}) as Record<string, unknown>;
  const state = String(item.estado || '').toLowerCase();

  return {
    id: String(item.nome || ''),
    name: String(item.nome || ''),
    status:
      state === 'running' ? 'RUNNING' :
      state === 'shut off' || state === 'shutoff' ? 'SHUTOFF' :
      state === 'paused' ? 'PAUSED' : 'UNKNOWN',
    ip: Array.isArray(item.ips) ? String(item.ips[0] || '').replace(/\/\d+$/, '') : '',
    os: String(info.os_type || info.os_variant || 'desconhecido'),
    vcpu: numberFromDomInfo(info, 'cpu(s)'),
    memoryMb: Math.round(numberFromDomInfo(info, 'max_memory') / 1024),
    diskGb: 0,
    autostart: false,
    qemuGuestAgent: false,
    sshPort: 22,
    createdAt: '',
    uptime: '',
  };
}

class NyxosApiClient {
  private statusCache: NyxosPublicStatus | null = null;
  private sessionId: string | undefined;
  private servicesCache: SystemService[] = [];
  private deltaCache: DeltaReportItem[] = [];

  async getPublicStatus(): Promise<NyxosPublicStatus> {
    const status = await request<NyxosPublicStatus>('/api/public/status');
    this.statusCache = status;
    return status;
  }

  async getSystemServices(): Promise<SystemService[]> {
    const snapshot = assertSuccess(
      await request<NyxosSystemSnapshot>('/api/public/residencia'),
    );
    this.servicesCache = snapshot.unidades || [];
    return [...this.servicesCache];
  }

  getCachedSystemServices(): SystemService[] {
    return [...this.servicesCache];
  }

  async getVpsStatus(): Promise<VpsStatus> {
    return assertSuccess(await request<VpsStatus>('/api/vps/status'));
  }

  async getVpsInstances(): Promise<VpsInstance[]> {
    const result = assertSuccess(
      await request<{ sucesso?: boolean; instancias?: Record<string, unknown>[]; motivo?: string }>(
        '/api/vps/instances',
      ),
    );
    return (result.instancias || []).map(mapVps);
  }

  async getVpsContexto(): Promise<Record<string, unknown>> {
    return assertSuccess(await request<Record<string, unknown>>('/api/vps/contexto'));
  }

  async vpsAction(
    instanceId: string,
    action: 'iniciar' | 'desligar' | 'reiniciar' | 'destruir' | 'autostart_toggle',
  ): Promise<Record<string, unknown>> {
    const current = await this.getVpsInstances();
    const currentInstance = current.find((item) => item.id === instanceId);
    const actions = {
      iniciar: 'start',
      desligar: 'shutdown',
      reiniciar: 'reboot',
      destruir: 'destroy',
    } as const;

    let acao: string;
    if (action === 'autostart_toggle') {
      acao = currentInstance?.autostart ? 'autostart_off' : 'autostart';
    } else {
      acao = actions[action];
    }

    return assertSuccess(
      await request<Record<string, unknown>>('/api/vps/action', {
        method: 'POST',
        body: JSON.stringify({ nome: instanceId, acao }),
      }),
    );
  }

  async provisionarVps(payload: {
    name: string;
    vcpu: number;
    memoryMb: number;
    diskGb: number;
    user: string;
    imagePath: string;
    sshKey: string;
    autostart: boolean;
  }): Promise<VpsInstance> {
    assertSuccess(
      await request<Record<string, unknown>>('/api/vps/provisionar', {
        method: 'POST',
        body: JSON.stringify({
          nome: payload.name,
          image_path: payload.imagePath,
          memory_mb: payload.memoryMb,
          vcpus: payload.vcpu,
          disk_gb: payload.diskGb,
          autostart: payload.autostart,
          username: payload.user,
          ssh_public_key: payload.sshKey,
        }),
      }),
    );

    const instances = await this.getVpsInstances();
    const created = instances.find((item) => item.id === payload.name);
    if (!created) {
      throw new Error('VPS criada mas ausente na listagem do Nyxal Core');
    }
    return created;
  }

  async converseWithNyxal(
    query: string,
    onStateChange?: (state: NyxalState) => void,
    sessao?: string,
  ): Promise<NyxalMessage> {
    onStateChange?.('PROCESSANDO');

    const result = await request<Record<string, unknown>>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        mensagem: query,
        sessao: sessao || this.sessionId,
      }),
    });

    const failed = result.sucesso === false;
    if (typeof result.sessao === 'string' && result.sessao.trim()) {
      this.sessionId = result.sessao;
    }
    onStateChange?.(failed ? 'ERRO' : 'CONCLUIDO');

    return {
      id: \`msg-\${Date.now()}\`,
      sender: 'nyxal',
      text: typeof result.resposta === 'string'
        ? result.resposta
        : typeof result.erro === 'string'
          ? result.erro
          : 'O Nyxal Core não retornou uma resposta textual.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      stateTrigger: failed ? 'ERRO' : 'CONCLUIDO',
    };
  }

  async speakText(text: string): Promise<void> {
    const response = await fetch(apiUrl('/api/tts'), {
      method: 'POST',
      headers: { Accept: 'audio/wav', 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: text }),
    });

    if (!response.ok) {
      let reason = \`Nyxal TTS HTTP \${response.status}\`;
      try {
        const data = await response.json() as { motivo?: string };
        reason = data.motivo || reason;
      } catch {
        // mantém o erro HTTP
      }
      throw new Error(reason);
    }

    const url = URL.createObjectURL(await response.blob());
    try {
      const audio = new Audio(url);
      await audio.play();
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Falha na reprodução do áudio do Nyxal Core'));
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async transcribeAudio(blob: Blob): Promise<string> {
    const response = await fetch(apiUrl('/api/stt'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': blob.type || 'application/octet-stream',
      },
      body: blob,
    });

    const data = await response.json() as { texto?: string; motivo?: string };
    if (!response.ok) {
      throw new Error(data.motivo || \`Nyxal STT HTTP \${response.status}\`);
    }
    return data.texto || '';
  }

  async getDeltaReports(): Promise<DeltaReportItem[]> {
    const status = this.statusCache || await this.getPublicStatus();
    const last = status.delta?.ultimo;
    this.deltaCache = last ? [{
      id: String(last.delta_id || 'delta'),
      timestamp: String(last.criado_em || ''),
      category: this.mapDeltaCategory(last.tipo),
      actor: 'Nyxal',
      summary: String(last.causa || 'Evento Delta observado'),
      details: typeof last.resultado === 'string'
        ? last.resultado
        : 'Evento Delta disponível no núcleo Nyxal.',
      status: last.autorizacao_explicita ? 'PENDING' : 'CONTAINED',
    }] : [];
    return [...this.deltaCache];
  }

  async getDatasetSummary(): Promise<{ qwen: number; kernel: number; automaticTraining: boolean }> {
    const status = this.statusCache || await this.getPublicStatus();
    return {
      qwen: Number(status.datasets_ae5?.qwen_registros || 0),
      kernel: Number(status.datasets_ae5?.kernel_registros || 0),
      automaticTraining: Boolean(status.datasets_ae5?.treinamento_automatico),
    };
  }

  async getGatewayContext(): Promise<Record<string, unknown>> {
    const status = this.statusCache || await this.getPublicStatus();
    return status.gateway_atuacao && typeof status.gateway_atuacao === 'object'
      ? status.gateway_atuacao
      : {};
  }

  async getPresenceContext(): Promise<Record<string, unknown>> {
    const status = this.statusCache || await this.getPublicStatus();
    return status.presenca_maquina && typeof status.presenca_maquina === 'object'
      ? status.presenca_maquina
      : {};
  }

  private mapDeltaCategory(tipo: unknown): DeltaReportItem['category'] {
    switch (String(tipo || 'sistema')) {
      case 'conhecimento':
      case 'memoria':
        return 'KNOWLEDGE';
      case 'projeto':
      case 'objetivo':
        return 'LLC';
      case 'processo':
      case 'sistema':
      case 'estado':
        return 'SYSTEM';
      default:
        return 'CONTAINMENT';
    }
  }
}

export const nyxosApi = new NyxosApiClient();

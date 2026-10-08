/**
 * Cliente da API real do NyxOS.
 *
 * Em desenvolvimento, o Vite faz proxy de /api para 127.0.0.1:8010.
 * Em produção, o shell do NyxOS serve a aplicação no mesmo host da API.
 *
 * Não existe estado operacional simulado aqui: se a API não responder,
 * a operação falha explicitamente.
 */
import {
  VpsInstance,
  SystemService,
  DeltaReportItem,
  DatasetItem,
  GatewayAction,
  NyxalState,
  NyxalMessage,
} from '../types/nyxos';

const API_BASE_URL = '/api';

type ApiErrorPayload = {
  motivo?: string;
  erro?: string;
  estado?: string;
};

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
  try {
    payload = await response.json();
  } catch {
    // Mantém payload nulo para respostas sem JSON.
  }

  if (!response.ok) {
    const errorPayload = (payload ?? {}) as ApiErrorPayload;
    throw new Error(
      errorPayload.motivo ||
      errorPayload.erro ||
      errorPayload.estado ||
      `HTTP ${response.status}`
    );
  }

  return payload as T;
}

function normalizarVps(item: any): VpsInstance {
  const info = item?.info ?? {};
  const estado = String(item?.estado ?? '').toLowerCase();

  return {
    id: String(item?.nome ?? info?.name ?? ''),
    name: String(item?.nome ?? info?.name ?? 'VPS'),
    status:
      estado === 'running' ? 'RUNNING' :
      estado === 'paused' ? 'PAUSED' :
      estado === 'shut off' || estado === 'shutoff' ? 'SHUTOFF' :
      'ERROR',
    ip: Array.isArray(item?.ips) && item.ips.length > 0 ? String(item.ips[0]).split('/')[0] : null,
    os: null,
    vcpu: Number.parseInt(String(info?.cpu_s ?? info?.['cpu(s)'] ?? '0'), 10) || 0,
    memoryMb: Math.round(
      Number.parseInt(String(info?.used_memory ?? '0'), 10) / 1024
    ) || 0,
    diskGb: null,
    autostart: String(info?.autostart ?? '').toLowerCase() === 'enable',
    qemuGuestAgent: null,
    sshPort: 22,
    createdAt: null,
    uptime: null,
  };
}

class NyxosApiService {
  private sessaoId: string | null = null;

  private getSessionId(): string | undefined {
    if (typeof window === 'undefined') return this.sessaoId ?? undefined;
    this.sessaoId = this.sessaoId || window.localStorage.getItem('nyxal_sessao');
    return this.sessaoId ?? undefined;
  }

  private saveSessionId(id: string | null | undefined): void {
    if (!id) return;
    this.sessaoId = id;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('nyxal_sessao', id);
    }
  }

  async getVpsStatus() {
    const raw = await requestJson<any>('/vps/status');
    const host = raw?.host ?? {};
    return {
      hypervisor: raw?.backend ?? 'libvirt/KVM',
      connected: Boolean(raw?.operacional),
      totalVms: Number(raw?.dominios ?? 0),
      runningVms: undefined,
      hostThreads: Number(host?.['cpu(s)'] ?? host?.cpu_s ?? 0) || 0,
      hostRamTotalGb: Number(host?.['memory_size'] ?? 0) / 1024 / 1024 || 0,
      hostRamUsedGb: 0,
      imagePath: null,
      cloudImageReady: null,
    };
  }

  async getVpsInstances(): Promise<VpsInstance[]> {
    const raw = await requestJson<any>('/vps/instances');
    if (!Array.isArray(raw?.instancias)) return [];
    return raw.instancias.map(normalizarVps);
  }

  async getVpsContexto() {
    return requestJson<any>('/vps/contexto');
  }

  async vpsAction(
    instanceId: string,
    action: 'iniciar' | 'desligar' | 'reiniciar' | 'destruir' | 'autostart_toggle'
  ) {
    const mapped: Record<typeof action, string> = {
      iniciar: 'start',
      desligar: 'shutdown',
      reiniciar: 'reboot',
      destruir: 'destroy',
      autostart_toggle: 'autostart',
    };

    const instances = await this.getVpsInstances();
    const current = instances.find((item) => item.id === instanceId);
    const acao = action === 'autostart_toggle'
      ? (current?.autostart ? 'autostart_off' : 'autostart')
      : mapped[action];

    return requestJson<any>('/vps/action', {
      method: 'POST',
      body: JSON.stringify({
        nome: instanceId,
        acao,
      }),
    });
  }

  async provisionarVps(payload: {
    name: string;
    vcpu: number;
    memoryMb: number;
    diskGb: number;
    user: string;
    sshKey: string;
    imagePath?: string;
    autostart?: boolean;
  }): Promise<VpsInstance> {
    if (!payload.sshKey.trim()) {
      throw new Error('A chave SSH pública é obrigatória.');
    }

    const result = await requestJson<any>('/vps/provisionar', {
      method: 'POST',
      body: JSON.stringify({
        nome: payload.name,
        image_path:
          payload.imagePath ||
          '/home/nyxal/NyxOS/VPS/ubuntu-24.04-server-cloudimg-amd64.img',
        username: payload.user,
        ssh_public_key: payload.sshKey.trim(),
        memory_mb: payload.memoryMb,
        vcpus: payload.vcpu,
        disk_gb: payload.diskGb,
        autostart: payload.autostart ?? true,
      }),
    });

    return {
      id: String(result?.nome ?? payload.name),
      name: String(result?.nome ?? payload.name),
      status: 'PROVISIONING',
      ip: null,
      os: 'Ubuntu 24.04',
      vcpu: Number(result?.vcpus ?? payload.vcpu),
      memoryMb: Number(result?.memory_mb ?? payload.memoryMb),
      diskGb: Number(result?.disk_gb ?? payload.diskGb),
      autostart: Boolean(result?.autostart ?? true),
      qemuGuestAgent: null,
      sshPort: 22,
      createdAt: null,
      uptime: null,
    };
  }

  async getSystemServices(): Promise<SystemService[]> {
    throw new Error('O backend ainda não expõe a listagem de serviços systemd pela API.');
  }

  async restartService(_name: string): Promise<boolean> {
    throw new Error('O backend ainda não expõe restart de serviços systemd pela API.');
  }

  async getDeltaReports(): Promise<DeltaReportItem[]> {
    throw new Error('O backend ainda não expõe o relatório Delta pela API.');
  }

  async getDataset(): Promise<DatasetItem[]> {
    const raw = await requestJson<any>('/ae5/datasets');
    return [];
  }

  async getGatewayActions(): Promise<GatewayAction[]> {
    throw new Error('O backend ainda não expõe o histórico do Gateway pela API.');
  }

  async converseWithNyxal(
    query: string,
    onStateChange?: (state: NyxalState) => void
  ): Promise<NyxalMessage> {
    onStateChange?.('PROCESSANDO');

    const raw = await requestJson<any>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        mensagem: query,
        sessao: this.getSessionId(),
      }),
    });

    this.saveSessionId(raw?.sessao);

    onStateChange?.('CONCLUIDO');

    return {
      id: `msg-${Date.now()}`,
      sender: 'nyxal',
      text: String(raw?.resposta ?? raw?.erro ?? 'A Nyxal não retornou uma resposta.'),
      timestamp: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      stateTrigger: 'CONCLUIDO',
    };
  }

  async speak(texto: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tts`, {
      method: 'POST',
      headers: {
        Accept: 'audio/wav',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texto }),
    });

    if (!response.ok) {
      throw new Error(`TTS HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    try {
      await audio.play();
      await new Promise<void>((resolve) => {
        audio.addEventListener('ended', () => resolve(), { once: true });
        audio.addEventListener('error', () => resolve(), { once: true });
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

export const nyxosApi = new NyxosApiService();

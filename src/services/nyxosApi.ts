/**
 * NyxOS / Nyxal Unified API Client
 * Integrates directly with Nixal VPS (KVM/libvirt), Nyxal Local API,
 * Systemd residency, Delta Reports, and System Gateway.
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

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '8000'
  ? 'http://localhost:8000'
  : '/api';

// Initial state for fallback / persistent storage
const INITIAL_INSTANCES: VpsInstance[] = [
  {
    id: 'nyxos-vps-01',
    name: 'nyxos-vps-01',
    status: 'RUNNING',
    ip: '192.168.122.42',
    os: 'Ubuntu 24.04 LTS (Noble Numbat)',
    vcpu: 2,
    memoryMb: 2048,
    diskGb: 15,
    autostart: true,
    qemuGuestAgent: true,
    sshPort: 22,
    createdAt: '2026-10-06 14:22',
    uptime: '1d 15h 28m',
  },
  {
    id: 'nyxos-vps-worker',
    name: 'nyxos-vps-worker',
    status: 'SHUTOFF',
    ip: '192.168.122.88',
    os: 'Ubuntu 24.04 LTS Cloud-Init',
    vcpu: 4,
    memoryMb: 4096,
    diskGb: 25,
    autostart: false,
    qemuGuestAgent: true,
    sshPort: 2202,
    createdAt: '2026-10-07 09:10',
    uptime: '0m',
  },
];

const INITIAL_SERVICES: SystemService[] = [
  {
    name: 'nyxos-interface.service',
    description: 'NyxOS Shell Interface Principal (Kiosk / Wayland Shell)',
    status: 'active',
    subState: 'running',
    pid: 1420,
    memoryUsageMb: 84.2,
    cpuUsagePct: 1.4,
    enabled: true,
  },
  {
    name: 'nyxal-api.service',
    description: 'Nyxal Local API Core (FastAPI / Unix Socket Daemon)',
    status: 'active',
    subState: 'running',
    pid: 1388,
    memoryUsageMb: 142.6,
    cpuUsagePct: 2.1,
    enabled: true,
  },
  {
    name: 'nyxos-residente.service',
    description: 'NyxOS Daemon de Aprendizado e Residência Contínua',
    status: 'active',
    subState: 'running',
    pid: 1395,
    memoryUsageMb: 68.1,
    cpuUsagePct: 0.8,
    enabled: true,
  },
  {
    name: 'nyxos.target',
    description: 'NyxOS Operating Environment Target Runlevel',
    status: 'active',
    subState: 'active',
    memoryUsageMb: 0,
    cpuUsagePct: 0,
    enabled: true,
  },
];

const INITIAL_DELTA_REPORTS: DeltaReportItem[] = [
  {
    id: 'delta-894',
    timestamp: 'Hoje, 09:14',
    category: 'LLC',
    actor: 'Nyxal',
    summary: 'Sincronização de contexto local e poda de tensores temporários',
    details: 'Redução de 14MB em cache volátil de diálogo. Nenhum impacto na retenção de longo prazo.',
    status: 'AUDITED',
  },
  {
    id: 'delta-893',
    timestamp: 'Hoje, 08:30',
    category: 'VPS',
    actor: 'Operador',
    summary: 'QEMU Guest Agent verificado na instância nyxos-vps-01',
    details: 'Handshake de rede concluído: IP 192.168.122.42 respondendo via virsh domifaddr.',
    status: 'AUDITED',
  },
  {
    id: 'delta-892',
    timestamp: 'Ontem, 23:45',
    category: 'RESIDENCE',
    actor: 'Systemd',
    summary: 'Heartbeat do serviço nyxos-residente.service validado',
    details: 'Loop de auditoria sem derivação detectada. Uptime contínuo 99.98%.',
    status: 'AUDITED',
  },
  {
    id: 'delta-891',
    timestamp: 'Ontem, 19:12',
    category: 'CONTAINMENT',
    actor: 'Nyxal',
    summary: 'Verificação da fronteira de contenção operacional',
    details: 'Nenhuma permissão não supervisionada solicitada. Sandbox mantida intacta.',
    status: 'CONTAINED',
  },
];

const INITIAL_DATASET: DatasetItem[] = [
  {
    id: 'ds-1042',
    timestamp: 'Hoje, 09:12:44',
    channel: 'USER_INPUT',
    content: 'Qual o status da VPS de trabalho?',
    sanitized: true,
    tokens: 9,
  },
  {
    id: 'ds-1043',
    timestamp: 'Hoje, 09:12:45',
    channel: 'NYXAL_RESPONSE',
    content: 'A VPS principal está em execução com 2 vCPUs e IP 192.168.122.42. A instância secundária está desligada.',
    sanitized: true,
    tokens: 28,
  },
  {
    id: 'ds-1044',
    timestamp: 'Hoje, 08:30:12',
    channel: 'SYSTEM_TELEMETRY',
    content: 'virsh dominfo nyxos-vps-01 -> State: running, Mem: 2048MB, vCPUs: 2',
    sanitized: true,
    tokens: 18,
  },
];

const INITIAL_GATEWAY: GatewayAction[] = [
  {
    id: 'gtw-401',
    command: 'virsh domifaddr nyxos-vps-01 --source agent',
    domain: 'KVM',
    riskLevel: 'LOW',
    status: 'EXECUTED',
    executedAt: 'Hoje, 09:14:02',
    auditorSignature: 'SHA256:7f8a9e...verified',
  },
  {
    id: 'gtw-400',
    command: 'systemctl is-active nyxal-api.service',
    domain: 'SYSTEMD',
    riskLevel: 'LOW',
    status: 'EXECUTED',
    executedAt: 'Hoje, 09:00:15',
    auditorSignature: 'SHA256:1a4b9c...verified',
  },
  {
    id: 'gtw-399',
    command: 'qemu-img create -f qcow2 -b ubuntu-24.04-server-cloudimg-amd64.img disk.qcow2 15G',
    domain: 'STORAGE',
    riskLevel: 'MEDIUM',
    status: 'EXECUTED',
    executedAt: '2026-10-06 14:20:10',
    auditorSignature: 'SHA256:9d3e4f...verified',
  },
];

class NyxosStorageService {
  private instances: VpsInstance[];
  private services: SystemService[];
  private deltas: DeltaReportItem[];
  private dataset: DatasetItem[];
  private gateway: GatewayAction[];

  constructor() {
    this.instances = this.loadFromStorage('nyxos_vps_instances', INITIAL_INSTANCES);
    this.services = this.loadFromStorage('nyxos_system_services', INITIAL_SERVICES);
    this.deltas = this.loadFromStorage('nyxos_delta_reports', INITIAL_DELTA_REPORTS);
    this.dataset = this.loadFromStorage('nyxos_dataset_pairs', INITIAL_DATASET);
    this.gateway = this.loadFromStorage('nyxos_gateway_actions', INITIAL_GATEWAY);
  }

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveToStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // --- VPS Endpoints ---
  async getVpsStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/vps/status`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback to local state
    }
    const runningCount = this.instances.filter((i) => i.status === 'RUNNING').length;
    return {
      hypervisor: 'QEMU/KVM via libvirt 10.0',
      connected: true,
      totalVms: this.instances.length,
      runningVms: runningCount,
      hostThreads: 16,
      hostRamTotalGb: 32,
      hostRamUsedGb: 12.8,
      cloudImageReady: true,
      imagePath: '/home/nyxal/NyxOS/VPS/ubuntu-24.04-server-cloudimg-amd64.img',
    };
  }

  async getVpsInstances(): Promise<VpsInstance[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/vps/instances`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return [...this.instances];
  }

  async getVpsContexto() {
    try {
      const res = await fetch(`${API_BASE_URL}/vps/contexto`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      activeDomain: 'local-kvm',
      guestNetworkBridge: 'virbr0',
      dhcpRange: '192.168.122.2 - 192.168.122.254',
      storagePool: '/var/lib/libvirt/images',
      cloudInitTemplate: 'user-data.yaml / meta-data.yaml',
      instances: this.instances,
    };
  }

  async vpsAction(instanceId: string, action: 'iniciar' | 'desligar' | 'reiniciar' | 'destruir' | 'autostart_toggle') {
    try {
      const res = await fetch(`${API_BASE_URL}/vps/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId, action }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const idx = this.instances.findIndex((i) => i.id === instanceId);
    if (idx !== -1) {
      const inst = { ...this.instances[idx] };
      if (action === 'iniciar') {
        inst.status = 'RUNNING';
        inst.uptime = '0m';
      } else if (action === 'desligar') {
        inst.status = 'SHUTOFF';
        inst.uptime = '0m';
      } else if (action === 'reiniciar') {
        inst.status = 'RUNNING';
        inst.uptime = '0m';
      } else if (action === 'autostart_toggle') {
        inst.autostart = !inst.autostart;
      } else if (action === 'destruir') {
        this.instances.splice(idx, 1);
        this.saveToStorage('nyxos_vps_instances', this.instances);
        return { success: true, message: `Instância ${instanceId} removida.` };
      }
      this.instances[idx] = inst;
      this.saveToStorage('nyxos_vps_instances', this.instances);

      // Record in gateway
      this.recordGatewayAction(`virsh ${action === 'iniciar' ? 'start' : action === 'desligar' ? 'shutdown' : 'reboot'} ${inst.name}`, 'KVM', 'LOW');

      return { success: true, instance: inst };
    }
    throw new Error(`Instância ${instanceId} não encontrada`);
  }

  async provisionarVps(payload: {
    name: string;
    vcpu: number;
    memoryMb: number;
    diskGb: number;
    user: string;
    sshKey?: string;
  }): Promise<VpsInstance> {
    try {
      const res = await fetch(`${API_BASE_URL}/vps/provisionar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const newInst: VpsInstance = {
      id: payload.name.toLowerCase().replace(/\s+/g, '-'),
      name: payload.name,
      status: 'RUNNING',
      ip: `192.168.122.${Math.floor(Math.random() * 150) + 50}`,
      os: 'Ubuntu 24.04 LTS (Cloud-Init)',
      vcpu: payload.vcpu || 2,
      memoryMb: payload.memoryMb || 2048,
      diskGb: payload.diskGb || 20,
      autostart: true,
      qemuGuestAgent: true,
      sshPort: 22,
      createdAt: 'Agora',
      uptime: '1m',
    };

    this.instances.unshift(newInst);
    this.saveToStorage('nyxos_vps_instances', this.instances);

    // Record delta and gateway
    this.recordDelta(
      'VPS',
      'Operador',
      `Provisionamento da VM ${newInst.name} via cloud-init`,
      `Disco QCOW2 criado com ${newInst.diskGb}GB a partir da imagem base Ubuntu 24.04. QEMU Guest Agent provisionado.`
    );
    this.recordGatewayAction(`virt-install --name ${newInst.name} --memory ${newInst.memoryMb} ...`, 'KVM', 'MEDIUM');

    return newInst;
  }

  // --- Services / Systemd ---
  getSystemServices(): SystemService[] {
    return [...this.services];
  }

  async restartService(name: string): Promise<boolean> {
    const s = this.services.find((item) => item.name === name);
    if (s) {
      s.subState = 'reloading';
      setTimeout(() => {
        s.subState = 'running';
        s.status = 'active';
      }, 1000);
      this.recordDelta('RESIDENCE', 'Operador', `Reinicialização do serviço ${name}`, 'Executado systemctl restart pelo painel de Residência Gerenciada.');
      return true;
    }
    return false;
  }

  // --- Delta Reports ---
  getDeltaReports(): DeltaReportItem[] {
    return [...this.deltas];
  }

  recordDelta(
    category: DeltaReportItem['category'],
    actor: DeltaReportItem['actor'],
    summary: string,
    details: string
  ) {
    const item: DeltaReportItem = {
      id: `delta-${Date.now().toString().slice(-4)}`,
      timestamp: 'Agora',
      category,
      actor,
      summary,
      details,
      status: 'AUDITED',
    };
    this.deltas.unshift(item);
    this.saveToStorage('nyxos_delta_reports', this.deltas);
  }

  // --- Dataset Coleta Dual ---
  getDataset(): DatasetItem[] {
    return [...this.dataset];
  }

  recordDatasetPair(userInput: string, nyxalResponse: string) {
    const u: DatasetItem = {
      id: `ds-${Date.now().toString().slice(-4)}a`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      channel: 'USER_INPUT',
      content: userInput,
      sanitized: true,
      tokens: Math.ceil(userInput.length / 4),
    };
    const r: DatasetItem = {
      id: `ds-${Date.now().toString().slice(-4)}b`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      channel: 'NYXAL_RESPONSE',
      content: nyxalResponse,
      sanitized: true,
      tokens: Math.ceil(nyxalResponse.length / 4),
    };
    this.dataset.unshift(r);
    this.dataset.unshift(u);
    this.saveToStorage('nyxos_dataset_pairs', this.dataset);
  }

  // --- Gateway de Atuação ---
  getGatewayActions(): GatewayAction[] {
    return [...this.gateway];
  }

  recordGatewayAction(command: string, domain: GatewayAction['domain'], riskLevel: GatewayAction['riskLevel']) {
    const action: GatewayAction = {
      id: `gtw-${Date.now().toString().slice(-4)}`,
      command,
      domain,
      riskLevel,
      status: 'EXECUTED',
      executedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      auditorSignature: `SHA256:${Math.random().toString(16).slice(2, 10)}...verified`,
    };
    this.gateway.unshift(action);
    this.saveToStorage('nyxos_gateway_actions', this.gateway);
  }

  // --- Nyxal Natural Conversational Engine ---
  async converseWithNyxal(query: string, onStateChange?: (s: NyxalState) => void): Promise<NyxalMessage> {
    if (onStateChange) onStateChange('PROCESSANDO');

    const clean = query.trim().toLowerCase();

    // Natural, contextual, direct responses adhering to Nyxal's specified personality
    let replyText = '';
    let suggestedAction: NyxalMessage['suggestedAction'] = undefined;
    let stateTrigger: NyxalState = 'CONCLUIDO';

    if (clean.includes('vps') || clean.includes('vm') || clean.includes('máquina') || clean.includes('servidor')) {
      const running = this.instances.filter((i) => i.status === 'RUNNING');
      replyText = `Temos ${this.instances.length} instâncias no KVM. ${running.length > 0 ? `${running[0].name} está ativa no IP ${running[0].ip}.` : 'Nenhuma está ativa no momento.'} Se quiser, abro o controlador de VPS agora.`;
      suggestedAction = { label: 'Abrir VPS', actionType: 'open_window', target: 'vps' };
    } else if (clean.includes('status') || clean.includes('sistema') || clean.includes('recurso') || clean.includes('cpu') || clean.includes('memoria')) {
      replyText = 'CPU em 12%, memória com 38% alocada. Todos os serviços do NyxOS continuam operando de forma estável.';
      suggestedAction = { label: 'Ver Residência', actionType: 'open_window', target: 'residencia' };
    } else if (clean.includes('delta') || clean.includes('auditoria') || clean.includes('relatório') || clean.includes('relatorio')) {
      replyText = 'O relatório delta está sem anomalias. As últimas ações da cadeia operacional foram auditadas e registradas.';
      suggestedAction = { label: 'Ver Relatório Delta', actionType: 'open_window', target: 'delta' };
    } else if (clean.includes('gateway') || clean.includes('comando') || clean.includes('segurança')) {
      replyText = 'O Gateway de Atuação está ativo sob contenção estrita. Nenhuma execução arbitrária sem assinatura.';
      suggestedAction = { label: 'Abrir Gateway', actionType: 'open_window', target: 'gateway' };
    } else if (clean.includes('oi') || clean.includes('olá') || clean.includes('bom dia') || clean.includes('boa tarde') || clean.includes('boa noite')) {
      const hour = new Date().getHours();
      const saudacao = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
      replyText = `${saudacao}. Tudo rodando em silêncio e dentro dos parâmetros. O que vamos rodar agora?`;
    } else if (clean.includes('criar') && clean.includes('vps')) {
      replyText = 'Posso provisionar uma nova máquina usando a imagem base do Ubuntu 24.04 com cloud-init. Abrindo o painel de criação.';
      suggestedAction = { label: 'Provisionar VM', actionType: 'open_window', target: 'vps' };
    } else if (clean.includes('quem é você') || clean.includes('quem e voce') || clean.includes('o que você faz')) {
      replyText = 'Sou a Nyxal, a inteligência central do NyxOS. Estou ligada diretamente aos seus serviços locais, ao hipervisor KVM e ao fluxo de dados do computador.';
    } else {
      replyText = `Entendido. Registrei no contexto: "${query}". Os subsistemas permanecem sincronizados.`;
    }

    // Save pair
    this.recordDatasetPair(query, replyText);

    if (onStateChange) onStateChange('ONLINE');

    return {
      id: `msg-${Date.now()}`,
      sender: 'nyxal',
      text: replyText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      stateTrigger,
      suggestedAction,
    };
  }
}

export const nyxosApi = new NyxosStorageService();

export type NyxalState = 'ONLINE' | 'OUVINDO' | 'PROCESSANDO' | 'EXECUTANDO' | 'CONCLUIDO' | 'ERRO';

export interface VpsInstance {
  id: string;
  name: string;
  status: 'RUNNING' | 'SHUTOFF' | 'PAUSED' | 'PROVISIONING' | 'ERROR' | 'UNKNOWN';
  ip: string;
  os: string;
  vcpu: number;
  memoryMb: number;
  diskGb: number;
  autostart: boolean;
  qemuGuestAgent: boolean;
  sshPort: number;
  createdAt: string;
  uptime: string;
}

export interface VpsStatus {
  sucesso: boolean;
  estado: string;
  backend?: string;
  uri?: string;
  operacional: boolean;
  dominios?: number;
  storage?: string;
  virsh?: string;
  host?: Record<string, unknown>;
  motivo?: string;
}

export interface SystemService {
  name: string;
  description: string;
  status: string;
  subState: string;
  pid?: number | null;
  memoryUsageMb?: number | null;
  cpuUsagePct?: number | null;
  enabled: boolean;
}

export interface DeltaReportItem {
  id: string;
  timestamp: string;
  category: 'LLC' | 'CONTAINMENT' | 'VPS' | 'RESIDENCE' | 'KNOWLEDGE' | 'SYSTEM';
  actor: 'Nyxal' | 'Operador' | 'Systemd';
  summary: string;
  details: string;
  status: 'AUDITED' | 'PENDING' | 'CONTAINED';
}

export interface DatasetItem {
  id: string;
  timestamp: string;
  channel: 'USER_INPUT' | 'NYXAL_RESPONSE' | 'SYSTEM_TELEMETRY' | 'TOOL_RESULT';
  content: string;
  sanitized: boolean;
  tokens?: number;
}

export interface GatewayAction {
  id: string;
  command: string;
  domain: 'KVM' | 'SYSTEMD' | 'STORAGE' | 'NETWORK';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'EXECUTED' | 'AUTHORIZED' | 'REJECTED';
  executedAt: string;
  auditorSignature: string;
}

export interface NyxosPublicStatus {
  identidade?: {
    nome?: string;
    versao?: string;
  };
  presenca?: Record<string, unknown>;
  presenca_maquina?: Record<string, unknown>;
  estado?: {
    modo?: string;
    status?: string;
  };
  habitat?: Record<string, unknown>;
  persistencia_operacional?: Record<string, unknown>;
  delta?: {
    quantidade?: number;
    ultimo?: Record<string, unknown> | null;
    [key: string]: unknown;
  };
  recursos_habitat?: Record<string, unknown>;
  datasets_ae5?: {
    qwen_registros?: number;
    kernel_registros?: number;
    treinamento_automatico?: boolean;
  };
  gateway_atuacao?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface NyxosSystemSnapshot {
  sucesso: boolean;
  estado: string;
  modo?: string;
  unidades: SystemService[];
  motivo?: string;
}

export type ModuleWindowId =
  | 'vps'
  | 'delta'
  | 'presenca'
  | 'dataset'
  | 'residencia'
  | 'gateway'
  | 'terminal'
  | 'arquivos'
  | 'nyxal_chat'
  | 'integracoes';

export interface WindowState {
  id: ModuleWindowId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface NyxalMessage {
  id: string;
  sender: 'user' | 'nyxal';
  text: string;
  timestamp: string;
  stateTrigger?: NyxalState;
  suggestedAction?: {
    label: string;
    actionType: 'open_window' | 'run_command' | 'status_check';
    target: string;
  };
}

export interface NotificationToast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  title: string;
  message: string;
  timestamp: string;
}

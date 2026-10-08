export type NyxalState = 'ONLINE' | 'OUVINDO' | 'PROCESSANDO' | 'EXECUTANDO' | 'CONCLUIDO' | 'ERRO';

export interface VpsInstance {
  id: string;
  name: string;
  status: 'RUNNING' | 'SHUTOFF' | 'PAUSED' | 'PROVISIONING' | 'ERROR';
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

export interface SystemService {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'failed' | 'reloading';
  subState: string;
  pid?: number;
  memoryUsageMb: number;
  cpuUsagePct: number;
  enabled: boolean;
}

export interface DeltaReportItem {
  id: string;
  timestamp: string;
  category: 'LLC' | 'CONTAINMENT' | 'VPS' | 'RESIDENCE' | 'KNOWLEDGE';
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
  tokens: number;
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

export type ModuleWindowId =
  | 'vps'
  | 'delta'
  | 'presenca'
  | 'dataset'
  | 'residencia'
  | 'gateway'
  | 'terminal'
  | 'arquivos'
  | 'nyxal_chat';

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

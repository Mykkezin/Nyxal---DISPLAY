import React from 'react';
import {
  Activity,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Network,
  Server,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { NyxalState } from '../../types/nyxos';

export interface HostTelemetry {
  apiState: 'CONNECTING' | 'ONLINE' | 'OFFLINE';
  cpuPercent: number | null;
  memoryPercent: number | null;
  storagePercent: number | null;
  gpuPercent: number | null;
  hostSystem: string | null;
  apiLatencyMs: number | null;
  uptimeSeconds: number | null;
  sampledAt: string | null;
}

interface SystemHudProps {
  telemetry: HostTelemetry;
  nyxalState: NyxalState;
}

function percentLabel(value: number | null): string {
  return value === null ? 'N/D' : `${Math.round(value)}%`;
}

function uptimeLabel(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return 'N/D';
  const totalMinutes = Math.floor(seconds / 60);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface MetricRowProps {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  accent: 'cyan' | 'violet' | 'blue' | 'green';
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, icon, accent }) => (
  <div className="nyxos-hud-metric">
    <div className="nyxos-hud-metric-header">
      <span className={`nyxos-hud-metric-icon nyxos-hud-accent-${accent}`}>{icon}</span>
      <span className="nyxos-hud-metric-label">{label}</span>
      <span className="nyxos-hud-metric-value">{percentLabel(value)}</span>
    </div>
    <div className="nyxos-hud-meter-track" aria-hidden="true">
      <span
        className={`nyxos-hud-meter-fill nyxos-hud-meter-fill-${accent}`}
        style={{ width: value === null ? '0%' : `${value}%` }}
      />
    </div>
  </div>
);

function apiStatusClass(state: HostTelemetry['apiState']): string {
  if (state === 'ONLINE') return 'nyxos-hud-status-online';
  if (state === 'OFFLINE') return 'nyxos-hud-status-offline';
  return 'nyxos-hud-status-checking';
}

export const SystemHud: React.FC<SystemHudProps> = ({ telemetry, nyxalState }) => (
  <>
    <aside className="nyxos-hud-panel nyxos-hud-system" aria-label="Métricas reais do host">
      <header className="nyxos-hud-panel-header">
        <div className="nyxos-hud-panel-heading">
          <Activity className="h-3.5 w-3.5" />
          <span>SYS METRICS</span>
        </div>
        <span className={`nyxos-hud-live-tag ${apiStatusClass(telemetry.apiState)}`}>
          <span className="nyxos-hud-status-dot" />
          {telemetry.apiState === 'ONLINE' ? 'LIVE' : telemetry.apiState === 'OFFLINE' ? 'NO LINK' : 'SYNC'}
        </span>
      </header>

      <div className="nyxos-hud-panel-subtitle">HOST RESOURCE TELEMETRY</div>

      <div className="nyxos-hud-metrics-list">
        <MetricRow label="CPU LOAD" value={telemetry.cpuPercent} icon={<Cpu />} accent="cyan" />
        <MetricRow label="MEMORY" value={telemetry.memoryPercent} icon={<Database />} accent="violet" />
        <MetricRow label="STORAGE" value={telemetry.storagePercent} icon={<HardDrive />} accent="blue" />
        <MetricRow label="GPU LOAD" value={telemetry.gpuPercent} icon={<Gauge />} accent="green" />
      </div>

      <footer className="nyxos-hud-panel-footer">
        <span>READ-ONLY SOURCE</span>
        <span>{telemetry.sampledAt ? new Date(telemetry.sampledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}</span>
      </footer>
    </aside>

    <aside className="nyxos-hud-panel nyxos-hud-network" aria-label="Estado de rede e conexão da API">
      <header className="nyxos-hud-panel-header">
        <div className="nyxos-hud-panel-heading">
          <Network className="h-3.5 w-3.5" />
          <span>NETWORK</span>
        </div>
        <span className={`nyxos-hud-live-tag ${apiStatusClass(telemetry.apiState)}`}>
          <span className="nyxos-hud-status-dot" />
          {telemetry.apiState === 'ONLINE' ? 'LINK UP' : telemetry.apiState === 'OFFLINE' ? 'LINK DOWN' : 'CONNECTING'}
        </span>
      </header>

      <div className="nyxos-hud-panel-subtitle">BROWSER ↔ NYXOS CORE API</div>

      <div className="nyxos-hud-network-list">
        <div className="nyxos-hud-network-row">
          <span className="nyxos-hud-network-icon">
            {telemetry.apiState === 'ONLINE' ? <Wifi /> : telemetry.apiState === 'OFFLINE' ? <WifiOff /> : <Network />}
          </span>
          <div className="nyxos-hud-network-copy">
            <span className="nyxos-hud-metric-label">API LINK</span>
            <span className="nyxos-hud-network-detail">{telemetry.apiState}</span>
          </div>
          <span className={`nyxos-hud-link-indicator ${apiStatusClass(telemetry.apiState)}`} />
        </div>

        <div className="nyxos-hud-network-row">
          <span className="nyxos-hud-network-icon"><Activity /></span>
          <div className="nyxos-hud-network-copy">
            <span className="nyxos-hud-metric-label">API LATENCY</span>
            <span className="nyxos-hud-network-detail">
              {telemetry.apiLatencyMs === null ? 'N/D' : `${telemetry.apiLatencyMs} ms`}
            </span>
          </div>
        </div>

        <div className="nyxos-hud-network-row">
          <span className="nyxos-hud-network-icon"><Server /></span>
          <div className="nyxos-hud-network-copy">
            <span className="nyxos-hud-metric-label">HOST OS</span>
            <span className="nyxos-hud-network-detail">{telemetry.hostSystem ?? 'N/D'}</span>
          </div>
        </div>

        <div className="nyxos-hud-network-row">
          <span className="nyxos-hud-network-icon"><Gauge /></span>
          <div className="nyxos-hud-network-copy">
            <span className="nyxos-hud-metric-label">HOST UPTIME</span>
            <span className="nyxos-hud-network-detail">{uptimeLabel(telemetry.uptimeSeconds)}</span>
          </div>
        </div>

        <div className="nyxos-hud-network-row">
          <span className="nyxos-hud-network-icon"><Activity /></span>
          <div className="nyxos-hud-network-copy">
            <span className="nyxos-hud-metric-label">NYXAL STATE</span>
            <span className="nyxos-hud-network-detail">{nyxalState}</span>
          </div>
        </div>
      </div>

      <footer className="nyxos-hud-panel-footer">
        <span>NO SYNTHETIC METRICS</span>
        <span>5s POLL</span>
      </footer>
    </aside>
  </>
);

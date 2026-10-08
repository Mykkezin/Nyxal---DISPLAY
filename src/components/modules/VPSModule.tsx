import React, { useState, useEffect } from 'react';
import {
  Server,
  Play,
  Square,
  RotateCw,
  Trash2,
  Plus,
  Cpu,
  HardDrive,
  Network,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';
import { VpsInstance } from '../../types/nyxos';

interface VPSModuleProps {
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const VPSModule: React.FC<VPSModuleProps> = ({ onNotify }) => {
  const [instances, setInstances] = useState<VpsInstance[]>([]);
  const [statusInfo, setStatusInfo] = useState<{
    hypervisor: string;
    connected: boolean;
    totalVms: number;
    runningVms: number;
    hostThreads: number;
    hostRamTotalGb: number;
    hostRamUsedGb: number;
    imagePath: string;
  } | null>(null);
  const [selectedVm, setSelectedVm] = useState<VpsInstance | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showProvisionModal, setShowProvisionModal] = useState(false);

  // Form for new VM
  const [formName, setFormName] = useState('nyxos-vps-02');
  const [formVcpu, setFormVcpu] = useState(2);
  const [formRam, setFormRam] = useState(2048);
  const [formDisk, setFormDisk] = useState(20);
  const [formUser, setFormUser] = useState('nyxal');
  const [formSshKey, setFormSshKey] = useState('');

  const refreshData = async () => {
    try {
      const [insts, st] = await Promise.all([
        nyxosApi.getVpsInstances(),
        nyxosApi.getVpsStatus(),
      ]);
      setInstances(insts);
      setStatusInfo(st);
      if (insts.length > 0 && !selectedVm) {
        setSelectedVm(insts[0]);
      } else if (selectedVm) {
        const found = insts.find((i) => i.id === selectedVm.id);
        if (found) setSelectedVm(found);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAction = async (instanceId: string, action: 'iniciar' | 'desligar' | 'reiniciar' | 'destruir' | 'autostart_toggle') => {
    setLoadingAction(`${instanceId}-${action}`);
    try {
      const res = await nyxosApi.vpsAction(instanceId, action);
      await refreshData();
      if (action === 'iniciar') {
        onNotify('success', 'VPS Iniciada', `A instância ${instanceId} está online no KVM.`);
      } else if (action === 'desligar') {
        onNotify('info', 'VPS Desligada', `A instância ${instanceId} foi desligada com segurança.`);
      } else if (action === 'reiniciar') {
        onNotify('info', 'VPS Reiniciada', `Reinicialização do domínio concluída.`);
      } else if (action === 'destruir') {
        onNotify('warning', 'VPS Removida', `A VM ${instanceId} foi desprovisionada.`);
      }
    } catch (e: any) {
      onNotify('alert', 'Falha na Operação', e.message || 'Erro ao executar ação KVM');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    try {
      setLoadingAction('provisioning');
      const created = await nyxosApi.provisionarVps({
        name: formName,
        vcpu: formVcpu,
        memoryMb: formRam,
        diskGb: formDisk,
        user: formUser,
        sshKey: formSshKey,
      });
      setShowProvisionModal(false);
      await refreshData();
      setSelectedVm(created);
      onNotify('success', 'VPS Provisionada', `${created.name} criada com Ubuntu 24.04 via Cloud-Init.`);
    } catch (err: any) {
      onNotify('alert', 'Erro no Provisionamento', err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      {/* Module Header / Overview */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3">
          <Server className="h-4 w-4 text-violet-400" />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-zinc-200">KVM / libvirt Hypervisor</span>
            <span className="text-zinc-600">·</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono tabular-nums">
              {statusInfo?.runningVms ?? 1}/{statusInfo?.totalVms ?? instances.length} ativas
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowProvisionModal(true)}
          className="flex items-center gap-1.5 rounded bg-violet-600/90 hover:bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Provisionar VM</span>
        </button>
      </div>

      {/* Main split view: VM list on left, Details & Actions on right */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column: Instances */}
        <div className="w-72 border-r border-white/5 bg-black/10 flex flex-col">
          <div className="px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500 border-b border-white/5">
            Instâncias KVM ({instances.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {instances.map((vm) => {
              const isSelected = selectedVm?.id === vm.id;
              const isRunning = vm.status === 'RUNNING';
              return (
                <div
                  key={vm.id}
                  onClick={() => setSelectedVm(vm)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-violet-950/25 border-l-2 border-violet-400' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-zinc-200 truncate">
                      {vm.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono tabular-nums ${
                        isRunning ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {vm.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400 font-mono tabular-nums">
                    <span>{vm.ip || 'sem ip'}</span>
                    <span className="text-zinc-600">·</span>
                    <span>{vm.vcpu} vCPU</span>
                    <span className="text-zinc-600">·</span>
                    <span>{(vm.memoryMb / 1024).toFixed(1)} GB</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cloud image indicator */}
          <div className="p-3 border-t border-white/5 bg-black/30 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />
              <span>Ubuntu 24.04 Cloud Image</span>
            </div>
            <div className="mt-0.5 truncate font-mono text-[10px] text-zinc-500">
              {statusInfo?.imagePath || '/home/nyxal/NyxOS/VPS/...img'}
            </div>
          </div>
        </div>

        {/* Right column: Selected VM dashboard */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#0b0c13] to-[#090a0f]">
          {selectedVm ? (
            <div className="space-y-6">
              {/* VM Title & Power Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-white font-mono">{selectedVm.name}</h2>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        selectedVm.status === 'RUNNING'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {selectedVm.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{selectedVm.os}</p>
                </div>

                {/* Direct Action Controls */}
                <div className="flex items-center gap-2">
                  {selectedVm.status === 'RUNNING' ? (
                    <>
                      <button
                        onClick={() => handleAction(selectedVm.id, 'reiniciar')}
                        disabled={loadingAction !== null}
                        className="flex items-center gap-1.5 rounded border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                        <span>Reiniciar</span>
                      </button>
                      <button
                        onClick={() => handleAction(selectedVm.id, 'desligar')}
                        disabled={loadingAction !== null}
                        className="flex items-center gap-1.5 rounded border border-amber-500/20 bg-amber-950/20 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-950/40 transition-colors disabled:opacity-50"
                      >
                        <Square className="h-3.5 w-3.5" />
                        <span>Desligar</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAction(selectedVm.id, 'iniciar')}
                      disabled={loadingAction !== null}
                      className="flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs text-white transition-colors disabled:opacity-50 font-medium"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Iniciar VM</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleAction(selectedVm.id, 'destruir')}
                    disabled={loadingAction !== null}
                    className="flex items-center gap-1.5 rounded border border-red-500/20 bg-red-950/10 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-50"
                    title="Excluir máquina"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Hardware Allocation Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded border border-white/5 bg-black/30 p-3.5">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <Cpu className="h-4 w-4 text-violet-400" />
                    <span>vCPU</span>
                  </div>
                  <div className="mt-2 text-lg font-mono font-semibold text-white tabular-nums">
                    {selectedVm.vcpu} <span className="text-xs text-zinc-500 font-normal">threads</span>
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">Host: KVM Passthrough</div>
                </div>

                <div className="rounded border border-white/5 bg-black/30 p-3.5">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <HardDrive className="h-4 w-4 text-violet-400" />
                    <span>Memória</span>
                  </div>
                  <div className="mt-2 text-lg font-mono font-semibold text-white tabular-nums">
                    {(selectedVm.memoryMb / 1024).toFixed(1)} <span className="text-xs text-zinc-500 font-normal">GB RAM</span>
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">Alocada sob demanda</div>
                </div>

                <div className="rounded border border-white/5 bg-black/30 p-3.5">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <Network className="h-4 w-4 text-violet-400" />
                    <span>IP / Rede</span>
                  </div>
                  <div className="mt-2 text-sm font-mono font-semibold text-white truncate">
                    {selectedVm.ip || 'Aguardando DHCP'}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500 font-mono">Bridge: virbr0</div>
                </div>

                <div className="rounded border border-white/5 bg-black/30 p-3.5">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>QEMU Guest Agent</span>
                  </div>
                  <div className="mt-2 text-sm font-mono font-semibold text-emerald-400">
                    {selectedVm.qemuGuestAgent ? 'CONECTADO' : 'INATIVO'}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500 font-mono">SSH Porta: {selectedVm.sshPort}</div>
                </div>
              </div>

              {/* SSH Quick Command Box */}
              <div className="rounded border border-white/5 bg-black/40 p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span className="font-mono text-zinc-300">Conexão SSH Direta</span>
                  <span className="text-[11px] text-zinc-500">Chave injetada via Cloud-Init</span>
                </div>
                <div className="flex items-center justify-between rounded bg-black/60 px-3 py-2 font-mono text-xs text-violet-300 border border-white/5">
                  <code>ssh nyxal@{selectedVm.ip || '192.168.122.x'} -p {selectedVm.sshPort}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`ssh nyxal@${selectedVm.ip} -p ${selectedVm.sshPort}`);
                      onNotify('info', 'Copiado', 'Comando SSH copiado para a área de transferência.');
                    }}
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              {/* Autostart & Systemd Integration */}
              <div className="flex items-center justify-between rounded border border-white/5 bg-black/20 p-4">
                <div>
                  <div className="text-xs font-medium text-zinc-200">Autostart no Boot do NyxOS</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Habilita o início desta máquina virtual quando o target <code className="font-mono text-violet-400">nyxos.target</code> for ativado.
                  </div>
                </div>
                <button
                  onClick={() => handleAction(selectedVm.id, 'autostart_toggle')}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors ${
                    selectedVm.autostart
                      ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40 hover:bg-violet-600/40'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {selectedVm.autostart ? 'HABILITADO' : 'DESABILITADO'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-500 text-xs">
              Selecione uma máquina virtual para visualizar parâmetros operacionais.
            </div>
          )}
        </div>
      </div>

      {/* Provision VM Modal */}
      {showProvisionModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#10121a] p-6 shadow-2xl">
            <h3 className="text-sm font-semibold text-white font-mono">Provisionar Nova VPS KVM</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Instanciação com Ubuntu 24.04 LTS, QCOW2 e configuração de usuário via Cloud-Init.
            </p>

            <form onSubmit={handleProvision} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-mono text-zinc-400">Nome da Instância</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1 w-full rounded border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs text-white focus:border-violet-500 focus:outline-none"
                  placeholder="nyxos-vps-02"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400">vCPUs</label>
                  <select
                    value={formVcpu}
                    onChange={(e) => setFormVcpu(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value={1}>1 vCPU</option>
                    <option value={2}>2 vCPUs (Recomendado)</option>
                    <option value={4}>4 vCPUs</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400">Memória RAM</label>
                  <select
                    value={formRam}
                    onChange={(e) => setFormRam(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value={1024}>1024 MB</option>
                    <option value={2048}>2048 MB (Padrão)</option>
                    <option value={4096}>4096 MB</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400">Disco QCOW2</label>
                  <input
                    type="number"
                    value={formDisk}
                    onChange={(e) => setFormDisk(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400">Usuário Cloud-Init</label>
                  <input
                    type="text"
                    value={formUser}
                    onChange={(e) => setFormUser(e.target.value)}
                    className="mt-1 w-full rounded border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400">Chave SSH pública</label>
                <textarea
                  value={formSshKey}
                  onChange={(e) => setFormSshKey(e.target.value)}
                  className="mt-1 w-full min-h-16 rounded border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[10px] text-white focus:border-violet-500 focus:outline-none"
                  placeholder="ssh-ed25519 AAAA... usuario@Nyxal"
                  required
                />
                <p className="mt-1 text-[10px] text-zinc-600">Somente a chave pública. A chave privada nunca é enviada à API.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="rounded border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction !== null}
                  className="rounded bg-violet-600 hover:bg-violet-500 px-3.5 py-1.5 text-xs font-medium text-white transition-colors"
                >
                  {loadingAction === 'provisioning' ? 'Provisionando...' : 'Criar Instância'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

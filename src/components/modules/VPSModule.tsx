import React, { useEffect, useMemo, useState } from 'react';
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
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { nyxosApi } from '../../services/nyxosApi';
import { VpsInstance, VpsStatus } from '../../types/nyxos';

interface Props {
  onNotify: (type: 'info' | 'success' | 'warning' | 'alert', title: string, message: string) => void;
}

export const VPSModule: React.FC<Props> = ({ onNotify }) => {
  const [instances, setInstances] = useState<VpsInstance[]>([]);
  const [statusInfo, setStatusInfo] = useState<VpsStatus | null>(null);
  const [selectedVm, setSelectedVm] = useState<VpsInstance | null>(null);
  const [loading, setLoading] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formVcpu, setFormVcpu] = useState(2);
  const [formRam, setFormRam] = useState(2048);
  const [formDisk, setFormDisk] = useState(20);
  const [formUser, setFormUser] = useState('ubuntu');
  const [formImagePath, setFormImagePath] = useState('');
  const [formSshKey, setFormSshKey] = useState('');

  const refreshData = async () => {
    try {
      const [insts, status] = await Promise.all([
        nyxosApi.getVpsInstances(),
        nyxosApi.getVpsStatus(),
      ]);
      setInstances(insts);
      setStatusInfo(status);
      setSelectedVm((current) => current ? insts.find((item) => item.id === current.id) || null : insts[0] || null);
    } catch (error) {
      onNotify('alert', 'VPS indisponível', error instanceof Error ? error.message : 'Falha ao consultar o Nyxal Core.');
    }
  };

  useEffect(() => { void refreshData(); }, []);

  const running = useMemo(() => instances.filter((item) => item.status === 'RUNNING').length, [instances]);

  const handleAction = async (instanceId: string, action: 'iniciar' | 'desligar' | 'reiniciar' | 'destruir') => {
    setLoading(true);
    try {
      await nyxosApi.vpsAction(instanceId, action);
      await refreshData();
      onNotify(
        action === 'destruir' ? 'warning' : 'success',
        'VPS atualizada',
        `${instanceId}: ${action} confirmado pelo Nyxal Core.`,
      );
    } catch (error) {
      onNotify('alert', 'Falha na operação', error instanceof Error ? error.message : 'Operação VPS recusada.');
    } finally {
      setLoading(false);
    }
  };

  const handleProvision = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formName.trim() || !formImagePath.trim() || !formSshKey.trim()) {
      onNotify('warning', 'Dados incompletos', 'Nome, imagem base e chave SSH são obrigatórios pelo Core.');
      return;
    }

    setProvisioning(true);
    try {
      const created = await nyxosApi.provisionarVps({
        name: formName.trim(),
        vcpu: formVcpu,
        memoryMb: formRam,
        diskGb: formDisk,
        user: formUser.trim(),
        imagePath: formImagePath.trim(),
        sshKey: formSshKey.trim(),
        autostart: true,
      });
      setShowProvisionModal(false);
      await refreshData();
      setSelectedVm(created);
      onNotify('success', 'VPS criada', `${created.name} foi criada pelo Nyxal Core.`);
    } catch (error) {
      onNotify('alert', 'Provisionamento falhou', error instanceof Error ? error.message : 'O Core recusou o provisionamento.');
    } finally {
      setProvisioning(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3">
          <Server className="h-4 w-4 text-violet-400" />
          <div className="text-xs">
            <span className="font-medium text-zinc-200">VPS · libvirt/KVM · Nyxal Core</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className={`font-mono ${statusInfo?.operacional ? 'text-emerald-400' : 'text-red-400'}`}>
              {statusInfo?.operacional ? 'ONLINE' : statusInfo ? 'INDISPONÍVEL' : 'CONSULTANDO'}
            </span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="font-mono text-zinc-400">{running}/{instances.length} ativas</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void refreshData()} className="rounded border border-white/10 p-2 text-zinc-400 hover:text-white" title="Atualizar">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setShowProvisionModal(true)} className="flex items-center gap-1.5 rounded bg-violet-600 px-3 py-1.5 text-xs font-medium text-white">
            <Plus className="h-3.5 w-3.5" /> Provisionar VM
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 border-r border-white/5 bg-black/10 flex flex-col">
          <div className="px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500 border-b border-white/5">
            Instâncias ({instances.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {instances.map((vm) => (
              <button key={vm.id} onClick={() => setSelectedVm(vm)} className={`w-full text-left px-4 py-3 ${selectedVm?.id === vm.id ? 'bg-violet-950/25 border-l-2 border-violet-400' : 'hover:bg-white/[0.02]'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-medium truncate">{vm.name}</span>
                  <span className={`text-[10px] font-mono ${vm.status === 'RUNNING' ? 'text-emerald-400' : 'text-zinc-500'}`}>{vm.status}</span>
                </div>
                <div className="mt-1 text-[11px] text-zinc-400 font-mono">{vm.ip || 'sem IP'} · {vm.vcpu || '?'} vCPU</div>
              </button>
            ))}
            {instances.length === 0 && <div className="p-4 text-xs text-zinc-500">O Core não retornou instâncias.</div>}
          </div>
          <div className="border-t border-white/5 p-3 text-[11px] text-zinc-500">
            <div className="font-mono text-zinc-300">{statusInfo?.backend || 'libvirt_kvm'}</div>
            <div className="mt-1 break-all">{statusInfo?.storage || 'Storage não exposto'}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedVm ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="font-mono text-base font-semibold">{selectedVm.name}</h2>
                  <p className="mt-1 text-xs text-zinc-400">{selectedVm.status} · {selectedVm.ip || 'IP não observado'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedVm.status === 'RUNNING' ? (
                    <>
                      <button disabled={loading} onClick={() => void handleAction(selectedVm.id, 'reiniciar')} className="flex items-center gap-1.5 rounded border border-white/10 px-3 py-1.5 text-xs disabled:opacity-40"><RotateCw className="h-3.5 w-3.5" /> Reiniciar</button>
                      <button disabled={loading} onClick={() => void handleAction(selectedVm.id, 'desligar')} className="flex items-center gap-1.5 rounded border border-amber-500/20 px-3 py-1.5 text-xs text-amber-300 disabled:opacity-40"><Square className="h-3.5 w-3.5" /> Desligar</button>
                    </>
                  ) : (
                    <button disabled={loading} onClick={() => void handleAction(selectedVm.id, 'iniciar')} className="flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium disabled:opacity-40"><Play className="h-3.5 w-3.5" /> Iniciar VM</button>
                  )}
                  <button disabled={loading} onClick={() => void handleAction(selectedVm.id, 'destruir')} className="rounded border border-red-500/20 p-2 text-red-400 disabled:opacity-40" title="Destruir VM"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded border border-white/5 bg-black/30 p-4"><div className="text-xs text-zinc-400 flex items-center gap-2"><Cpu className="h-4 w-4 text-violet-400" /> vCPU</div><div className="mt-2 font-mono text-xl">{selectedVm.vcpu || '—'}</div></div>
                <div className="rounded border border-white/5 bg-black/30 p-4"><div className="text-xs text-zinc-400 flex items-center gap-2"><HardDrive className="h-4 w-4 text-violet-400" /> Memória</div><div className="mt-2 font-mono text-xl">{selectedVm.memoryMb ? `${(selectedVm.memoryMb / 1024).toFixed(1)} GB` : '—'}</div></div>
                <div className="rounded border border-white/5 bg-black/30 p-4"><div className="text-xs text-zinc-400 flex items-center gap-2"><Network className="h-4 w-4 text-violet-400" /> IP</div><div className="mt-2 font-mono text-sm break-all">{selectedVm.ip || 'Não observado'}</div></div>
              </div>

              <div className="rounded border border-white/5 bg-black/30 p-4 text-xs text-zinc-400">
                <div className="flex items-center gap-2 text-zinc-200 font-mono"><ShieldCheck className="h-4 w-4 text-violet-400" /> Contrato real</div>
                <p className="mt-2">A interface exibe apenas propriedades que o endpoint de VPS do Nyxal Core realmente retorna. Autostart, QEMU Guest Agent e disco detalhado não são inventados quando o Core não os expõe.</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500"><AlertCircle className="mr-2 h-4 w-4" /> Nenhuma instância selecionada.</div>
          )}
        </div>
      </div>

      {showProvisionModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={(event) => void handleProvision(event)} className="w-full max-w-lg rounded-lg border border-white/10 bg-[#10121a] p-6 space-y-3">
            <h3 className="text-sm font-semibold font-mono">Provisionar via Nyxal Core</h3>
            <input required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nome da VPS" className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-xs" />
            <input required value={formImagePath} onChange={(e) => setFormImagePath(e.target.value)} placeholder="/caminho/para/ubuntu-cloud.img" className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono" />
            <textarea required value={formSshKey} onChange={(e) => setFormSshKey(e.target.value)} placeholder="ssh-ed25519 AAAA..." rows={3} className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-xs font-mono" />
            <div className="grid grid-cols-3 gap-3">
              <input type="number" min={1} max={64} value={formVcpu} onChange={(e) => setFormVcpu(Number(e.target.value))} className="rounded border border-white/10 bg-black/40 px-3 py-2 text-xs" />
              <input type="number" min={512} value={formRam} onChange={(e) => setFormRam(Number(e.target.value))} className="rounded border border-white/10 bg-black/40 px-3 py-2 text-xs" />
              <input type="number" min={8} value={formDisk} onChange={(e) => setFormDisk(Number(e.target.value))} className="rounded border border-white/10 bg-black/40 px-3 py-2 text-xs" />
            </div>
            <input value={formUser} onChange={(e) => setFormUser(e.target.value)} placeholder="ubuntu" className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-xs" />
            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
              <button type="button" onClick={() => setShowProvisionModal(false)} className="rounded border border-white/10 px-3 py-1.5 text-xs">Cancelar</button>
              <button type="submit" disabled={provisioning} className="rounded bg-violet-600 px-3.5 py-1.5 text-xs font-medium disabled:opacity-40">{provisioning ? 'Provisionando…' : 'Criar VPS'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

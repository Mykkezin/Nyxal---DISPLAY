import React, { useState } from 'react';
import { Folder, HardDrive, FileText, CheckCircle, Eye, Download } from 'lucide-react';

export const ArquivosModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'images' | 'disks' | 'scripts'>('images');

  const files = {
    images: [
      {
        name: 'ubuntu-24.04-server-cloudimg-amd64.img',
        path: '/home/nyxal/NyxOS/VPS/ubuntu-24.04-server-cloudimg-amd64.img',
        size: '2.4 GB',
        type: 'Base Cloud Image (Ubuntu Noble)',
        status: 'READY',
      },
    ],
    disks: [
      {
        name: 'nyxos-vps-01-disk.qcow2',
        path: '/var/lib/libvirt/images/nyxos-vps-01.qcow2',
        size: '15.0 GB',
        type: 'QCOW2 Volume (Copy-on-Write)',
        status: 'ATTACHED',
      },
      {
        name: 'nyxos-vps-worker-disk.qcow2',
        path: '/var/lib/libvirt/images/nyxos-vps-worker.qcow2',
        size: '25.0 GB',
        type: 'QCOW2 Volume',
        status: 'DETACHED',
      },
    ],
    scripts: [
      {
        name: 'iniciar_nyxos_shell.sh',
        path: 'deploy/systemd/iniciar_nyxos_shell.sh',
        size: '1.2 KB',
        type: 'Kiosk Shell Launcher',
        status: 'EXECUTABLE',
      },
      {
        name: 'nixal_vps.py',
        path: 'services/vps/nixal_vps.py',
        size: '18.4 KB',
        type: 'KVM/libvirt Python Controller',
        status: 'RESIDENT',
      },
    ],
  };

  return (
    <div className="flex h-full flex-col bg-[#0b0c13] text-zinc-100 select-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 bg-black/20">
        <div className="flex items-center gap-3">
          <Folder className="h-4 w-4 text-violet-400" />
          <div className="text-xs">
            <span className="font-medium text-zinc-200">Storage & Discos do Sistema NyxOS</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono">Pool /var/lib/libvirt/images</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-6 py-2 border-b border-white/5 bg-black/10 text-xs">
        <button
          onClick={() => setSelectedCategory('images')}
          className={`px-3 py-1 rounded font-mono text-xs transition-colors ${
            selectedCategory === 'images' ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Imagens Cloud ({files.images.length})
        </button>
        <button
          onClick={() => setSelectedCategory('disks')}
          className={`px-3 py-1 rounded font-mono text-xs transition-colors ${
            selectedCategory === 'disks' ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Discos QCOW2 ({files.disks.length})
        </button>
        <button
          onClick={() => setSelectedCategory('scripts')}
          className={`px-3 py-1 rounded font-mono text-xs transition-colors ${
            selectedCategory === 'scripts' ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Scripts de Inicialização ({files.scripts.length})
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {files[selectedCategory].map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between rounded border border-white/5 bg-black/30 p-4 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-violet-400" />
              <div>
                <div className="font-mono text-xs font-medium text-white">{file.name}</div>
                <div className="mt-0.5 font-mono text-[11px] text-zinc-500">{file.path}</div>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-zinc-400">
              <div className="text-white tabular-nums">{file.size}</div>
              <div className="text-[11px] text-emerald-400">{file.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

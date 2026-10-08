import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';
import { NotificationToast } from '../../types/nyxos';

interface NotificationsProps {
  toasts: NotificationToast[];
  onDismiss: (id: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-11 right-4 z-50 flex flex-col gap-2 pointer-events-none select-none max-w-sm w-full">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />;
            case 'warning':
              return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />;
            case 'alert':
              return <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />;
            case 'info':
            default:
              return <Info className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />;
          }
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-[#0d0e16]/95 p-3.5 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-start gap-2.5">
              {getIcon()}
              <div>
                <div className="font-mono text-xs font-semibold text-white">
                  {toast.title}
                </div>
                <div className="mt-0.5 text-xs text-zinc-300 leading-snug">
                  {toast.message}
                </div>
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-500 hover:text-white transition-colors p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

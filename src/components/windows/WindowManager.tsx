import React, { useRef, useState } from 'react';
import { Minus, Square, X, Move } from 'lucide-react';
import { ModuleWindowId, WindowState } from '../../types/nyxos';

interface WindowManagerProps {
  windows: WindowState[];
  activeWindowId: ModuleWindowId | null;
  onFocus: (id: ModuleWindowId) => void;
  onClose: (id: ModuleWindowId) => void;
  onMinimize: (id: ModuleWindowId) => void;
  onToggleMaximize: (id: ModuleWindowId) => void;
  onUpdatePosition: (id: ModuleWindowId, pos: { x: number; y: number }) => void;
  renderContent: (id: ModuleWindowId) => React.ReactNode;
}

export const WindowManager: React.FC<WindowManagerProps> = ({
  windows,
  activeWindowId,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onUpdatePosition,
  renderContent,
}) => {
  const [draggingId, setDraggingId] = useState<ModuleWindowId | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const handleHeaderMouseDown = (e: React.MouseEvent, win: WindowState) => {
    if (win.isMaximized) return;
    onFocus(win.id);
    setDraggingId(win.id);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: win.position.x,
      initialY: win.position.y,
    };

    const handleMouseMove = (moveEvt: MouseEvent) => {
      const dx = moveEvt.clientX - dragStartRef.current.startX;
      const dy = moveEvt.clientY - dragStartRef.current.startY;
      onUpdatePosition(win.id, {
        x: Math.max(10, dragStartRef.current.initialX + dx),
        y: Math.max(36, dragStartRef.current.initialY + dy),
      });
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      {windows
        .filter((w) => w.isOpen && !w.isMinimized)
        .map((win) => {
          const isActive = activeWindowId === win.id;

          const style: React.CSSProperties = win.isMaximized
            ? {
                top: '36px',
                left: '0px',
                right: '0px',
                bottom: '56px',
                width: '100vw',
                height: 'calc(100vh - 92px)',
                zIndex: win.zIndex,
                position: 'fixed',
              }
            : {
                top: `${win.position.y}px`,
                left: `${win.position.x}px`,
                width: `${win.size.width}px`,
                height: `${win.size.height}px`,
                zIndex: win.zIndex,
                position: 'fixed',
              };

          return (
            <div
              key={win.id}
              style={style}
              onMouseDown={() => onFocus(win.id)}
              className={`nyxos-window flex flex-col rounded-lg border backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-150 ${
                isActive
                  ? 'border-white/15 bg-[#0b0c14]/95 shadow-[0_12px_40px_rgba(0,0,0,0.8)] ring-1 ring-violet-500/20'
                  : 'border-white/5 bg-[#0b0c14]/85 shadow-[0_8px_24px_rgba(0,0,0,0.6)] opacity-95'
              }`}
            >
              {/* Window Header */}
              <div
                onMouseDown={(e) => handleHeaderMouseDown(e, win)}
                className={`nyxos-window-header flex h-9 shrink-0 items-center justify-between border-b px-3.5 select-none ${
                  isActive
                    ? 'border-white/10 bg-black/40 text-zinc-100 cursor-grab active:cursor-grabbing'
                    : 'border-white/5 bg-black/20 text-zinc-400 cursor-grab'
                }`}
              >
                {/* Title */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isActive ? 'bg-violet-400' : 'bg-zinc-600'
                    }`}
                  />
                  <span className="truncate font-mono text-xs font-semibold tracking-wider uppercase">
                    {win.title}
                  </span>
                </div>

                {/* Window Controls: Minimize, Maximize, Close */}
                <div className="flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onMinimize(win.id)}
                    className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                    title="Minimizar"
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <button
                    onClick={() => onToggleMaximize(win.id)}
                    className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                    title={win.isMaximized ? 'Restaurar' : 'Maximizar'}
                  >
                    <Square className="h-2.5 w-2.5" />
                  </button>

                  <button
                    onClick={() => onClose(win.id)}
                    className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-rose-500/80 hover:text-white transition-colors"
                    title="Fechar"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Window Content */}
              <div className="flex-1 overflow-hidden relative">
                {renderContent(win.id)}
              </div>
            </div>
          );
        })}
    </>
  );
};

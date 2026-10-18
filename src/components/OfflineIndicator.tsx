import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-xl border border-amber-400 animate-in fade-in slide-in-from-bottom-2 duration-200 no-print">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Modo Offline — O AutoGestão está funcionando com os dados locais salvos.</span>
    </div>
  );
};

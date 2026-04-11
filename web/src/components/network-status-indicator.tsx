import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function NetworkStatusIndicator({ isSocketConnected = false }: { isSocketConnected?: boolean }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isFullyConnected = isOnline && isSocketConnected;

  return (
    <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-slate-100/50">
      <span
        className={cn(
          'h-2 w-2 rounded-full relative',
          isFullyConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
        )}
      />
      <span className={cn(
        isFullyConnected ? 'text-emerald-700' : 'text-rose-600 font-black'
      )}>
        {isFullyConnected ? 'En Línea' : (isOnline ? 'Reconectando...' : 'Sin Red')}
      </span>
    </div>
  );
}

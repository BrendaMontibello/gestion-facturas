import { useOnlineStatus } from '@/lib/hooks/use-online-status';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const isOnline = useOnlineStatus();

  return (
    <div className="flex items-center gap-2 px-4">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-500">Conectado</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-yellow-500">Modo sin conexión</span>
        </>
      )}
    </div>
  );
}
import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from '@/lib/swalert';
import { SOCKET_PATH, SOCKET_URL } from '@/lib/runtime-config';

export const useRealTimeEvents = (storeId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  const isRelevantEvent = useCallback(
    (event: any) => {
      if (!storeId || !event?.storeId) {
        return true;
      }

      return event.storeId === storeId;
    },
    [storeId],
  );

  const handleNotification = useCallback((event: any) => {
    switch (event.type) {
      case 'NEW_ORDER':
        toast.success(
          '¡Nuevo Pedido!',
          `Se ha recibido una orden por C$ ${event.payload.total.toFixed(2)}`
        );
        break;
      case 'NEW_VISIT':
        toast.info(
          'Nueva Visita en Ruta',
          `El vendedor ha registrado una visita en: ${event.payload.clientId}`
        );
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      path: SOCKET_PATH,
    });

    const handleRealtimeEvent = (data: any) => {
      if (!isRelevantEvent(data)) {
        return;
      }

      setLastEvent(data);
      handleNotification(data);
    };

    newSocket.on('connect', () => {
      setConnected(true);
      if (storeId) {
        newSocket.emit('join_store', storeId);
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('sync_update', handleRealtimeEvent);
    newSocket.on('store_update', handleRealtimeEvent);

    setSocket(newSocket);

    return () => {
      newSocket.off('sync_update', handleRealtimeEvent);
      newSocket.off('store_update', handleRealtimeEvent);
      newSocket.close();
    };
  }, [handleNotification, isRelevantEvent, storeId]);

  return { socket, lastEvent, connected };
};

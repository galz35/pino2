import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from '@/lib/swalert';
import { clearCache } from '@/services/api-client';
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
          `Se ha recibido una orden por C$ ${Number(event.payload?.total || 0).toFixed(2)}`
        );
        break;
      case 'NEW_VISIT':
        toast.info(
          'Nueva Visita en Ruta',
          `El vendedor ha registrado una visita en: ${event.payload?.clientId || 'Cliente desconocido'}`
        );
        break;
      case 'NOTIFICATION':
        toast.info(
          event.payload?.title || 'Notificación',
          event.payload?.message || 'Tienes un nuevo aviso.'
        );
        break;
      case 'ORDER_STATUS_CHANGE':
        toast.info(
          `Pedido ${event.payload?.orderId?.substring(0, 8)}`,
          `Ha cambiado de estado a: ${event.payload?.status?.replace('_', ' ')}`
        );
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    // Append namespace to the URL
    const namespaceUrl = `${SOCKET_URL}/events`.replace(/\/\//g, '/').replace(':/', '://');
    const newSocket = io(namespaceUrl, {
      transports: ['websocket'],
      autoConnect: true,
      path: SOCKET_PATH,
    });

    const handleRealtimeEvent = (data: any) => {
      if (!isRelevantEvent(data)) {
        return;
      }

      clearCache();
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

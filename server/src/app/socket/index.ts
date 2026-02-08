import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Location } from '../modules/location/location.model';
type LocationPayload = {
  busId: string;
  routeId: string;
  lat: number;
  lng: number;
  speed?: number;
  status?: 'running' | 'paused' | 'stopped';
};

type StatusPayload = {
  busId: string;
  routeId: string;
  status: 'running' | 'paused' | 'stopped';
};

export const initSocket = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }, // Security-r jonno production e eta specific url hobe
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);
    socket.on('joinRoute', ({ routeId }) => {
      socket.join(routeId);
      console.log(`Socket ${socket.id} joined route room: ${routeId}`);
    });

    socket.on('sendLocation', async (data: LocationPayload) => {
      try {
        // console.log(' Location received:', data.busId);

        // Database-e update kora
        const saved = await Location.findOneAndUpdate(
          { busId: data.busId },
          {
            busId: data.busId,
            routeId: data.routeId,
            lat: data.lat,
            lng: data.lng,
            speed: data.speed || 0, // Default 0
            time: new Date(),
            status: data.status || 'running',
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        io.emit('receiveLocation', saved);

      } catch (err) {
        console.error('MongoDB Save Error:', err);
      }
    });
    socket.on('busStatus', async (data: StatusPayload) => {
      try {
        console.log('🚦 Status Update:', data);

        const updated = await Location.findOneAndUpdate(
          { busId: data.busId },
          {
            status: data.status,
            time: new Date(),
          },
          { new: true }
        );

        io.emit('receiveBusStatus', updated);
      } catch (err) {
        console.error('Status Update Error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });

  return io;
};
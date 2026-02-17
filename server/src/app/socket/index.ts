import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Location } from '../modules/location/location.model';
import User from '../modules/User/user.model';
 

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

  // Tracking active sessions
  const activeSessions = new Map<string, any>();

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    socket.on('registerUser', async (userData) => {
      // Store user data associated with this socket ID
      if (userData && userData.id) {
        try {
          // Fetch full user data to get "other info" like assigned bus
          const user = await User.findById(userData.id).select('name role profileImage assignedBusName').lean();
          
          if (user) {
            activeSessions.set(socket.id, {
              id: user._id,
              name: user.name,
              role: user.role,
              profileImage: user.profileImage,
              assignedBusName: user.assignedBusName || 'N/A'
            });

            // Broadcast updated sessions
            io.emit('activeSessionsUpdate', Array.from(activeSessions.values()));
            console.log(`👤 User registered: ${user.name} (${user.role})`);
          }
        } catch (err) {
          console.error('Socket Register Search Error:', err);
        }
      }
    });

    socket.on('joinRoute', ({ routeId }) => {
      socket.join(routeId);
      console.log(`Socket ${socket.id} joined route room: ${routeId}`);
    });

    socket.on('sendLocation', async (data: LocationPayload) => {
      try {
        const saved = await Location.findOneAndUpdate(
          { busId: data.busId },
          {
            busId: data.busId,
            routeId: data.routeId,
            lat: data.lat,
            lng: data.lng,
            speed: data.speed || 0,
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
      if (activeSessions.has(socket.id)) {
        const user = activeSessions.get(socket.id);
        activeSessions.delete(socket.id);
        // Broadcast updated sessions
        io.emit('activeSessionsUpdate', Array.from(activeSessions.values()));
        console.log(`❌ User disconnected: ${user.name}`);
      }
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });

  return io;
};

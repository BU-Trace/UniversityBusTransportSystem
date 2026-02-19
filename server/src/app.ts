import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import os from 'os';

import globalErrorHandler from './app/middleware/globalErrorHandler';
import notFound from './app/middleware/notFound';
import config from './app/config';
import router from './app/routes';

const app: Application = express();

// ---------------- Middleware ----------------
app.use(
  cors({
    origin: [
      config.client_url || 'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081', // Expo dev server
      'http://192.168.0.106:19000',
      '*'
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- API Routes ----------------

// Handle direct /api/v1 access
app.get('/api/v1', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the API v1 root. Please use a specific endpoint.',
  });
});
app.use('/api/v1', router);

// ---------------- Test Route ----------------
app.get('/', (req: Request, res: Response) => {
  const now = new Date();
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;

  const uptimeSeconds = os.uptime();

  res.status(200).json({
    success: true,
    message: '🎓 Barishal University Campus Connect API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: now.toISOString(),

    client: {
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'],
      language: req.headers['accept-language'],
    },

    server: {
      hostname: os.hostname(),
      platform: os.platform(),
      architecture: os.arch(),
      cpuCores: os.cpus().length,
      memory: {
        total: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        free: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      },
      uptime: {
        seconds: uptimeSeconds,
        readable: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor(
          (uptimeSeconds % 3600) / 60
        )}m`,
      },
    },

    api: {
      documentation: '/docs',
      healthCheck: '/health',
      status: '🟢 Operational',
    },

    developer: {
      name: 'Md. Imam Hosen',
      email: 'mimam22.cse@bu.ac.bd',
      github: 'https://github.com/mdimamhosen',
    },
  });
});

// ---------------- Error Handling ----------------
app.use(globalErrorHandler);
app.use(notFound);

export default app;

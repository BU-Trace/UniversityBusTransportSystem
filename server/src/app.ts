import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import os from 'os';
import { StatusCodes } from 'http-status-codes';

import globalErrorHandler from './app/middleware/globalErrorHandler';
import notFound from './app/middleware/notFound';
import config from './app/config';
import router from './app/routes';

const app: Application = express();

// ---------------- Middleware ----------------
app.use(cors({ origin: config.client_url || 'http://localhost:3000', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- API Routes ----------------
app.use('/api/v1', router);

// ---------------- Test Route ----------------
app.get('/', (req: Request, res: Response, _next: NextFunction) => {
  const currentDateTime = new Date().toISOString();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const serverHostname = os.hostname();
  const serverPlatform = os.platform();
  const serverUptime = os.uptime();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Welcome to the Next Mart',
    version: '1.0.0',
    clientDetails: {
      ipAddress: clientIp,
      accessedAt: currentDateTime,
    },
    serverDetails: {
      hostname: serverHostname,
      platform: serverPlatform,
      uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor(
        (serverUptime / 60) % 60
      )} minutes`,
    },
    developerContact: {
      email: 'your-email@example.com',
      github: 'mdimamhosen',
    },
  });
});

// ---------------- Error Handling ----------------
app.use(globalErrorHandler);
app.use(notFound);

export default app;

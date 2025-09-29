import { Request, Response, NextFunction } from 'express';
import { UAParser } from 'ua-parser-js';

// -------------------- ClientInfo Interface --------------------
export interface ClientInfo {
  device: 'pc' | 'mobile';
  browser: string;
  ipAddress: string;
  pcName?: string;
  os?: string;
  userAgent: string;
}

// -------------------- Extend Express Request --------------------
declare module 'express-serve-static-core' {
  interface Request {
    clientInfo?: ClientInfo;
  }
}

// -------------------- Middleware --------------------
const clientInfoParser = (req: Request, _res: Response, next: NextFunction) => {
  // Get User-Agent header
  const userAgent = req.headers['user-agent'] || 'Unknown';

  // Parse the user-agent string
  const parser = new UAParser();
  parser.setUA(userAgent);
  const parsedUA = parser.getResult();

  // Detect client IP
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || // First in X-Forwarded-For
    req.socket.remoteAddress || // Fallback to socket IP
    'Unknown';

  // Attach parsed client info to req.clientInfo
  req.clientInfo = {
    device: parsedUA.device.type === 'mobile' ? 'mobile' : 'pc', // default to 'pc'
    browser: parsedUA.browser.name || 'Unknown',
    ipAddress: clientIp,
    pcName: (req.headers['host'] as string) || '', // optional
    os: parsedUA.os.name || 'Unknown',
    userAgent: userAgent,
  };

  next();
};

export default clientInfoParser;

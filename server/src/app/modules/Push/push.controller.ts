import { RequestHandler } from 'express';
import { PushService } from './push.service';
import config from '../../config';

const subscribe: RequestHandler = async (req, res) => {
  const { subscription, deviceInfo } = req.body;
  const userId = (req as any).user?.userId;

  const result = await PushService.subscribe({
    user: userId,
    subscription,
    deviceInfo,
  });

  res.status(201).json({
    success: true,
    message: 'Subscribed successfully',
    data: result,
  });
};

const getPublicKey: RequestHandler = async (_req, res) => {
  res.status(200).json({
    success: true,
    data: config.vapid.public_key,
  });
};

export const PushController = {
  subscribe,
  getPublicKey,
};

import Push from './push.model';
import { IPush } from './push.interface';

const subscribe = async (payload: Partial<IPush>) => {
  // Use endpoint as unique identifier to avoid duplicate subscriptions from same browser
  const existing = await Push.findOne({ 'subscription.endpoint': payload.subscription?.endpoint });

  if (existing) {
    existing.user = payload.user || existing.user;
    existing.deviceInfo = payload.deviceInfo || existing.deviceInfo;
    return await existing.save();
  }

  return await Push.create(payload);
};

const getAllSubscriptions = async () => {
  return await Push.find().lean();
};

const unsubscribe = async (endpoint: string) => {
  return await Push.findOneAndDelete({ 'subscription.endpoint': endpoint });
};

export const PushService = {
  subscribe,
  getAllSubscriptions,
  unsubscribe,
};

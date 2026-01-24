import { Bus } from './bus.model';
import { IBus } from './bus.interface';

export const createBus = async (payload: IBus) => {
  const bus = await Bus.create(payload);
  return bus;
};

export const updateBus = async (id: string, payload: Partial<IBus>) => {
  const bus = await Bus.findByIdAndUpdate(id, payload, { new: true });
  return bus;
};

export const deleteBus = async (id: string) => {
  return await Bus.findByIdAndDelete(id);
};

export const getAllBuses = async () => {
  return await Bus.find();
};

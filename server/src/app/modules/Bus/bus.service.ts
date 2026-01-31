import { Types } from 'mongoose';

import { Bus } from './bus.model';
import { IBus } from './bus.interface';
import { busCreateSchema, busUpdateSchema, BusCreateInput, BusUpdateInput } from './bus.validation';

//generator Stopage
const generateNextBusId = async (): Promise<string> => {
  const latest = await Bus.findOne({}, {}, { sort: { bus_id: -1 } });
  let nextId = 1;

  if (latest?.bus_id) {
    const match = latest.bus_id.match(/bus_(\d+)/);
    if (match) nextId = parseInt(match[1], 10) + 1;
  }

  return `bus_${nextId}`;
};

export const createBus = async (payload: IBus) => {
  const data: BusCreateInput = busCreateSchema.parse(payload);

  const bus_id = await generateNextBusId();

  const bus = await Bus.create({
    ...data,
    route: new Types.ObjectId(data.route),
    bus_id,
  });

  return bus;
};

export const updateBus = async (id: string, payload: Partial<IBus>) => {
  if (Object.keys(payload).length === 0) return await Bus.findById(id);

  const data: BusUpdateInput = busUpdateSchema.parse(payload);

  const existing = await Bus.findById(id);
  if (!existing) return null;

  const updated = await Bus.findByIdAndUpdate(
    id,
    {
      ...data,
      route: data.route ? new Types.ObjectId(data.route) : existing.route,
    },
    { new: true }
  );
  if (!updated) return null;

  return updated;
};
// Delete bus by ID
export const deleteBus = async (id: string) => {
  return await Bus.findByIdAndDelete(id);
};

export const getAllBuses = async () => {
  return await Bus.find().populate('route');
};

export const getSingleBus = async (id: string) => {
  return await Bus.findById(id).populate('route');
};

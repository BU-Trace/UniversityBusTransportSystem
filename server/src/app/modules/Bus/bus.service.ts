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
    route: data.route ? new Types.ObjectId(data.route) : undefined,
    driverId: data.driverId ? new Types.ObjectId(data.driverId) : undefined,
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
      driverId: data.driverId ? new Types.ObjectId(data.driverId) : existing.driverId,
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
  const buses = await Bus.find().populate('route').populate('driverId');

  // Fallback: also fetch users whose assignedBus matches each bus,
  // since the driver-bus relationship is written to User.assignedBus
  // by the user management flow (not necessarily to Bus.driverId).
  const User = (await import('../User/user.model')).default;
  const drivers = await User.find({ assignedBus: { $ne: null }, role: 'driver' })
    .select('_id name assignedBus profileImage')
    .lean();

  const driverByBusId = new Map<string, { _id: string; name: string }>();
  for (const d of drivers) {
    if (d.assignedBus) {
      driverByBusId.set(d.assignedBus.toString(), { _id: d._id.toString(), name: d.name });
    }
  }

  // Attach assignedDriver to each bus (prefer User.assignedBus over Bus.driverId populate)
  const enriched = buses.map((bus) => {
    const busObj = bus.toObject() as Record<string, unknown>;
    const fromUser = driverByBusId.get(bus._id.toString());
    if (fromUser) {
      busObj.assignedDriver = fromUser;
    } else if (busObj.driverId && typeof busObj.driverId === 'object') {
      // driverId was populated successfully via Bus.driverId ref
      busObj.assignedDriver = busObj.driverId;
    }
    return busObj;
  });

  return enriched;
};

export const getSingleBus = async (id: string) => {
  return await Bus.findById(id).populate('route');
};

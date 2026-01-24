import { z } from 'zod';
import { Bus } from './bus.model';
import { IBus } from './bus.interface';
import { Route } from '../Route/route.model';

const busCreateSchema = z
  .object({
    name: z.string().min(1),
    plateNumber: z.string().min(1),
    route: z.any(), // mongoose ObjectId
    photo: z.string().min(5), //cloudinary

    activeHoursComing: z.array(z.string().min(1)).max(20),
    activeHoursGoing: z.array(z.string().min(1)).max(20),

    isActive: z.boolean().optional(),
  })
  .refine((d) => d.activeHoursComing.length === d.activeHoursGoing.length, {
    message: 'activeHoursComing and activeHoursGoing must have same length',
  });

const busUpdateSchema = busCreateSchema.partial();

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

const mergeUnique = (a: string[] = [], b: string[] = []) => Array.from(new Set([...a, ...b]));

const updateRouteHoursFromBus = async (routeId: string, coming: string[], going: string[]) => {
  const route = await Route.findById(routeId);
  if (!route) return;

  route.activeHoursComing = mergeUnique(route.activeHoursComing, coming);

  route.activeHoursGoing = mergeUnique(route.activeHoursGoing, going);

  await route.save();
};

export const createBus = async (payload: IBus) => {
  busCreateSchema.parse(payload);

  const bus_id = await generateNextBusId();

  const bus = await Bus.create({
    ...payload,
    bus_id,
  });

  await updateRouteHoursFromBus(
    String(payload.route),
    payload.activeHoursComing,
    payload.activeHoursGoing
  );

  return bus;
};

export const updateBus = async (id: string, payload: Partial<IBus>) => {

  if (
    payload.name !== undefined ||
    payload.plateNumber !== undefined ||
    payload.route !== undefined ||
    payload.photo !== undefined ||
    payload.activeHoursComing !== undefined ||
    payload.activeHoursGoing !== undefined ||
    payload.isActive !== undefined
  ) {
    busUpdateSchema.parse(payload);
  }

  const existing = await Bus.findById(id);
  if (!existing) return null;

  const updated = await Bus.findByIdAndUpdate(id, payload, { new: true });
  if (!updated) return null;

  const routeId = payload.route ? String(payload.route) : String(existing.route);

  const coming = payload.activeHoursComing ?? existing.activeHoursComing ?? [];
  const going = payload.activeHoursGoing ?? existing.activeHoursGoing ?? [];

  await updateRouteHoursFromBus(routeId, coming, going);

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

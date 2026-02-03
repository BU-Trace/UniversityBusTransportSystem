import { Types } from 'mongoose';

import { IRoute } from './route.interface';
import { Route } from './route.model';

const generateNextRouteId = async (): Promise<string> => {
  const latest = await Route.findOne({}, {}, { sort: { route_id: -1 } });
  let nextId = 1;

  if (latest?.route_id) {
    const match = latest.route_id.match(/route_(\d+)/);
    if (match) nextId = parseInt(match[1], 10) + 1;
  }

  return `route_${nextId}`;
};

export const createRoute = async (payload: IRoute) => {
  const route_id = payload.route_id ?? (await generateNextRouteId());

  const bus = (payload.bus ?? []).map((id) => new Types.ObjectId(id));
  const stopages = (payload.stopages ?? []).map((id) => new Types.ObjectId(id));

  const route = await Route.create({
    ...payload,
    route_id,
    bus,
    stopages,
  });

  return route;
};

export const updateRoute = async (id: string, payload: Partial<IRoute>) => {
  // Fetch the current route
  const route = await Route.findById(id);
  if (!route) return null;

  // If stopages is provided, handle add/remove logic
  if (payload.stopages) {
    route.stopages = payload.stopages.map((id) => new Types.ObjectId(id));
  }

  // Update other fields if provided
  if (payload.name !== undefined) route.name = payload.name;
  if (payload.isActive !== undefined) route.isActive = payload.isActive;

  // Update bus field if provided
  if (payload.bus) route.bus = payload.bus.map((id) => new Types.ObjectId(id));

  await route.save();
  return route;
};

export const deleteRoute = async (id: string) => {
  return await Route.findByIdAndDelete(id);
};

export const getAllRoutes = async () => {
  return await Route.find();
};

// Placeholder for Google Distance Matrix API integration
export const getDistanceAndDuration = async (
  _stopageIds: string[]
): Promise<{ distance: number; duration: number }> => {
  // TODO: Fetch stopage coordinates from DB, call Google API, return total distance/duration
  return { distance: 0, duration: 0 };
};

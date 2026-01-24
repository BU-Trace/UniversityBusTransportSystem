import { IRoute } from './route.interface';
import { Route } from './route.model';

export const createRoute = async (payload: IRoute) => {
  // TODO: Call Google Distance Matrix API to calculate total distance and duration
  // and assign to payload.distance and payload.duration
  // Example: const { distance, duration } = await getDistanceAndDuration(payload.stopages)
  // payload.distance = distance; payload.duration = duration;
  // Ensure bus field is present (default to empty array if not provided)
  if (!payload.bus) payload.bus = [];
  const route = await Route.create(payload);
  return route;
};

export const updateRoute = async (id: string, payload: Partial<IRoute>) => {
  // Fetch the current route
  const route = await Route.findById(id);
  if (!route) return null;

  // If stopages is provided, handle add/remove logic
  if (payload.stopages) {
    // If payload.stopages is the full new array, just set it
    route.stopages = payload.stopages;
  }

  // Update other fields if provided
  if (payload.name !== undefined) route.name = payload.name;
  if (payload.isActive !== undefined) route.isActive = payload.isActive;

  // Update bus field if provided
  if (payload.bus) route.bus = payload.bus;

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

import { z } from 'zod';
import { Location } from './location.model';
import { ILocation } from './location.interface';

const locationSchema = z.object({
  bus: z.any(),
  latitude: z.number(),
  longitude: z.number(),
  capturedAt: z.coerce.date().optional(),
});

const updateSchema = locationSchema.partial();

export const createLocation = async (payload: ILocation) => {
  const data = locationSchema.parse(payload);
  const location = await Location.create(data);
  return location;
};

export const updateLocation = async (id: string, payload: Partial<ILocation>) => {
  if (Object.keys(payload).length) updateSchema.parse(payload);
  const location = await Location.findByIdAndUpdate(id, payload, { new: true });
  return location;
};

export const deleteLocation = async (id: string) => {
  return await Location.findByIdAndDelete(id);
};

export const getAllLocations = async () => {
  return await Location.find().populate('bus');
};

export const getLocation = async (id: string) => {
  return await Location.findById(id).populate('bus');
};

export const getLatestLocationByBus = async (busId: string) => {
  return await Location.findOne({ bus: busId }).sort({ capturedAt: -1 }).populate('bus');
};

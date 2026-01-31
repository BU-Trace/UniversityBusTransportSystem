import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid route id');

export const busCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  plateNumber: z.string().min(1, 'Plate number is required'),
  route: objectId,
  photo: z.string().min(1, 'Photo is required'),
  isActive: z.boolean().optional(),
  status: z.enum(['running', 'paused', 'stopped']).optional(),
});

export const busUpdateSchema = busCreateSchema.partial();

export type BusCreateInput = z.infer<typeof busCreateSchema>;
export type BusUpdateInput = z.infer<typeof busUpdateSchema>;

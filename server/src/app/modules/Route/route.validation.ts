import { z } from 'zod';

export const routeCreateSchema = z.object({
  name: z.string().min(1, 'Route name cannot be empty'),
  stopages: z.array(z.string()).optional(),
  bus: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  activeHoursComing: z.array(z.object({ time: z.string(), bus: z.string() })).optional(),
  activeHoursGoing: z.array(z.object({ time: z.string(), bus: z.string() })).optional(),
});

export const routeUpdateSchema = z.object({
  name: z.string().optional(),
  stopages: z.array(z.string()).optional(),
  bus: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  activeHoursComing: z.array(z.object({ time: z.string(), bus: z.string() })).optional(),
  activeHoursGoing: z.array(z.object({ time: z.string(), bus: z.string() })).optional(),
});

export type RouteCreateInput = z.infer<typeof routeCreateSchema>;
export type RouteUpdateInput = z.infer<typeof routeUpdateSchema>;

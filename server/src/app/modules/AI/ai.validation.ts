import { z } from 'zod';

export const chatHistoryItemSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string().trim().min(1, 'History text is required'),
});

export const chatRequestSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt is required'),
  history: z.array(chatHistoryItemSchema).optional(),
  model: z.string().trim().optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

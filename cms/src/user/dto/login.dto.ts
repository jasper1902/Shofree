import { z } from 'zod';

export const loginSchema = z.object({
  password: z.string().min(6).max(64),
  email: z.string().email(),
});

export type LoginDto = z.infer<typeof loginSchema>;

import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(4).max(32),
  password: z.string().min(6).max(64),
  email: z.string().email(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

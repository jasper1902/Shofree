import { z } from 'zod';

export const UserResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  balance: z.number(),
  accessToken: z.string().optional()
});

export type UserResponseDto = z.infer<typeof UserResponseSchema>;
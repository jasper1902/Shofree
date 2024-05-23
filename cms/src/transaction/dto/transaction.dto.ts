import { z } from 'zod';

export const transactionSchema = z.object({
  userId: z.string(),
  limit: z.number().positive(),
  page: z.number().positive(),
});

export type TransactionDto = z.infer<typeof transactionSchema>;

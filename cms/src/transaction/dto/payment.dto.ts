import { z } from 'zod';

export const paymentSchema = z.object({
  amount: z.number().positive(),
});

export type PaymentDto = z.infer<typeof paymentSchema>;

import { z } from 'zod';

export const productSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    category: z.string(),
    brand: z.string().optional(),
    quantity: z.number().positive(),
    price: z.number().positive(),
  }),
);

export type ProductDto = z.infer<typeof productSchema>;

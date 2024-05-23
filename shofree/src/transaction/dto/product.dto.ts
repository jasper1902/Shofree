import { z } from 'zod';

export const productSchema = z.object({
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.number(),
      brand: z.string(),
      category: z.string(),
      quantity: z.number(),
    }),
  ),
});

export type ProductDto = z.infer<typeof productSchema>;

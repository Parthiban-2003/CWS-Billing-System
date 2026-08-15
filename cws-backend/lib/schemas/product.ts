import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Name required'),
  category: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0).default(0),
})
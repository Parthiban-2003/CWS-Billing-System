import { z } from 'zod'

export const ingredientSchema = z.object({
    name: z.string().min(1),
    unit: z.string().min(1).default('kg'),
    stock: z.coerce.number().min(0).default(0),
    lowStockAt: z.coerce.number().min(0).default(5),
    costPerUnit: z.coerce.number().min(0).default(0),
})
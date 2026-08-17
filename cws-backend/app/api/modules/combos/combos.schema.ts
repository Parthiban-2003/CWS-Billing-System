import { z } from 'zod'

export const comboSchema = z.object({
    name: z.string().min(1),
    price: z.coerce.number().min(0),
    items: z.array(z.object({ productId: z.string(), qty: z.coerce.number().int().min(1) })).min(1),
})

export const comboUpdateSchema = z.object({ isActive: z.boolean() })
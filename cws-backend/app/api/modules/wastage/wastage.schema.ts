import { z } from 'zod'

export const wastageSchema = z.object({
    itemType: z.enum(['INGREDIENT', 'PRODUCT']),
    ingredientId: z.string().optional(),
    productId: z.string().optional(),
    qty: z.coerce.number().positive(),
    reason: z.enum(['EXPIRED', 'DAMAGED', 'SPOILED', 'OTHER']),
    note: z.string().optional(),
})
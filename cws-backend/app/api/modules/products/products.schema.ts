import { z } from 'zod'

export const productSchema = z.object({
    name: z.string().min(1),
    category: z.string().optional(),
    barcode: z.string().optional(),
    price: z.coerce.number().min(0),
    stock: z.coerce.number().min(0).default(0),
    isAvailable: z.boolean().default(true),
    variants: z.array(z.object({ name: z.string().min(1), delta: z.coerce.number().default(0) })).optional(),
    modifiers: z.array(z.object({ name: z.string().min(1), delta: z.coerce.number().default(0) })).optional(),
})

export const bulkSchema = z.object({ pct: z.coerce.number() })
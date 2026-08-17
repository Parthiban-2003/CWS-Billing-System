import { z } from 'zod'

export const createKotSchema = z.object({
    table: z.string().min(1),
    items: z.array(z.object({ name: z.string(), qty: z.number().int().min(1) })).min(1),
})

export const kotStatusSchema = z.object({
    status: z.enum(['NEW', 'PREPARING', 'READY', 'COMPLETED']),
})
import { z } from 'zod'

export const createTableSchema = z.object({
    name: z.string().min(1),
    seats: z.coerce.number().min(1).default(4),
})

export const statusSchema = z.object({
    status: z.enum(['FREE', 'OCCUPIED', 'RESERVED', 'CLEANING']),
})
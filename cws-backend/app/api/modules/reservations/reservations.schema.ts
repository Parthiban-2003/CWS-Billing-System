import { z } from 'zod'

export const reservationSchema = z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    date: z.string().min(8),
    time: z.string().min(4),
    guests: z.coerce.number().int().min(1).default(2),
    table: z.string().optional(),
    note: z.string().optional(),
})

export const reservationUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
    guests: z.coerce.number().int().min(1).optional(),
    table: z.string().optional(),
    note: z.string().optional(),
    status: z.enum(['BOOKED', 'SEATED', 'COMPLETED', 'CANCELLED']).optional(),
})
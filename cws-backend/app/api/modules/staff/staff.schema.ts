import { z } from 'zod'

export const ROLES = ['OWNER', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN']

export const staffSchema = z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    role: z.enum(['OWNER', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN']).default('CASHIER'),
    salary: z.coerce.number().min(0).default(0),
    pin: z
        .string()
        .refine((v) => !v || /^\d{4}$/.test(v), { message: 'PIN must be 4 digits' })
        .optional(),
    joinDate: z.string().optional(),
    isActive: z.boolean().optional(),
})
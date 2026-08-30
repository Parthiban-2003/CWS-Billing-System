import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'
import { z } from 'zod'
import { hashPin } from '@/lib/auth'

export const staffSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional().nullable(),
    role: z.string().default('CASHIER'),
    roleId: z.string().uuid().optional().nullable(),
    salary: z.union([z.string(), z.number()]).transform((val) => Number(val) || 0),
    payrollType: z.enum(['FIXED', 'ATTENDANCE']).default('FIXED'),
    pin: z.string().length(4, 'PIN must be 4 digits').optional().nullable(),
    joinDate: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
})

const clean = (s: any) => ({
    ...s,
    salary: Number(s.salary),
})

export const list = async () => {
    const staff = await prisma.staff.findMany({
        where: { tenantId: DEV_TENANT_ID },
        include: { role: true },
        orderBy: { createdAt: 'desc' },
    })
    return staff.map(clean)
}

export const create = async (data: z.infer<typeof staffSchema>) => {
    let pinHash: string | null = null

    if (data.pin) {
        pinHash = await hashPin(data.pin)
    }

    // Find roleId if role string is provided
    let finalRoleId = data.roleId || null
    if (!finalRoleId && data.role) {
        const foundRole = await prisma.role.findFirst({
            where: { roleCode: data.role.toUpperCase() }
        })
        if (foundRole) finalRoleId = foundRole.id
    }

    const staff = await prisma.staff.create({
        data: {
            tenantId: DEV_TENANT_ID,
            name: data.name,
            phone: data.phone || null,
            roleId: finalRoleId,
            salary: data.salary,
            payrollType: data.payrollType || 'FIXED',
            pinHash: pinHash,
            pin: data.pin || null,
            joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
            isActive: data.isActive,
        },
        include: { role: true },
    })

    return clean(staff)
}

// 🔥 UPDATE FUNCTION - Handles 'role' string to 'roleId' conversion safely
export const update = async (id: string, data: Partial<z.infer<typeof staffSchema>>) => {
    const updateData: any = { ...data }

    // 🔐 If PIN is provided, hash it
    if (data.pin && data.pin.length > 0) {
        updateData.pinHash = await hashPin(data.pin)
    }

    // Remove plain pin from update (we use pinHash)
    delete updateData.pin

    // 🔥 FIX: Handle 'role' string -> convert to 'roleId'
    if (data.role && typeof data.role === 'string') {
        const foundRole = await prisma.role.findFirst({
            where: { roleCode: data.role.toUpperCase() }
        })
        if (foundRole) {
            updateData.roleId = foundRole.id
        }
        // Remove the string so Prisma doesn't try to save it to the relation field
        delete updateData.role
    }

    // Convert joinDate to Date if provided
    if (data.joinDate) {
        updateData.joinDate = new Date(data.joinDate)
    }

    // Ensure salary is a number
    if (data.salary !== undefined) {
        updateData.salary = Number(data.salary) || 0
    }

    console.log('📝 Update data:', updateData)

    try {
        const staff = await prisma.staff.update({
            where: { id },
            data: updateData,
            include: { role: true },
        })

        return clean(staff)
    } catch (error: any) {
        console.error('❌ Database update error:', error)
        throw new Error(`Failed to update staff: ${error.message}`)
    }
}

export const remove = async (id: string) => {
    await prisma.staff.delete({ where: { id } })
    return { ok: true }
}
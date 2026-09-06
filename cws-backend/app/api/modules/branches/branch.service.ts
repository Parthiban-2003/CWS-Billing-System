import { prisma } from '@/lib/prisma' // Adjust path to your prisma client
import { DEV_TENANT_ID } from '@/config/tenant' // Adjust path to your tenant config
import { z } from 'zod'

// 1. Zod Validation Schema
export const branchSchema = z.object({
    branchCode: z.string().min(1, 'Branch code is required'),
    branchName: z.string().min(1, 'Branch name is required'),
    branchNameTamil: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    pincode: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email('Invalid email').optional().nullable(),
    contactPerson: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
})

// Helper to clean response
const clean = (b: any) => ({
    branchId: b.id, // Alias id to branchId for frontend consistency
    branchCode: b.branchCode,
    branchName: b.branchName,
    branchNameTamil: b.branchNameTamil,
    address: b.address,
    city: b.city,
    state: b.state,
    pincode: b.pincode,
    phone: b.phone,
    email: b.email,
    contactPerson: b.contactPerson,
    isActive: b.isActive,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
})

// 2. List Branches
export const list = async () => {
    const branches = await prisma.branch.findMany({
        where: { tenantId: DEV_TENANT_ID },
        orderBy: { createdAt: 'desc' },
    })
    return branches.map(clean)
}

// 3. Create Branch
export const create = async (data: z.infer<typeof branchSchema>) => {
    const branch = await prisma.branch.create({
        data: {
            tenantId: DEV_TENANT_ID,
            branchCode: data.branchCode.toUpperCase(),
            branchName: data.branchName,
            branchNameTamil: data.branchNameTamil || null,
            address: data.address || null,
            city: data.city || null,
            state: data.state || null,
            pincode: data.pincode || null,
            phone: data.phone || null,
            email: data.email || null,
            contactPerson: data.contactPerson || null,
            isActive: data.isActive,
        },
    })
    return clean(branch)
}

// 4. Update Branch
export const update = async (id: string, data: Partial<z.infer<typeof branchSchema>>) => {
    const updateData: any = { ...data }

    if (data.branchCode) {
        updateData.branchCode = data.branchCode.toUpperCase()
    }

    const branch = await prisma.branch.update({
        where: { id },
        data: updateData,
    })
    return clean(branch)
}

// 5. Delete Branch
export const remove = async (id: string) => {
    await prisma.branch.delete({ where: { id } })
    return { ok: true }
}
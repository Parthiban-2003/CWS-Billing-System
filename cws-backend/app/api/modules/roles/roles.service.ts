import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'
import { z } from 'zod'

// Zod Schema for Role Validation
export const roleSchema = z.object({
    roleCode: z.string().min(1, 'Role code is required'),
    roleName: z.string().min(1, 'Role name is required'),
    roleNameTamil: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    roleLevel: z.number().min(0).max(100).default(0),
    isSystemRole: z.boolean().default(false),
    isActive: z.boolean().default(true),
})

const clean = (r: any) => ({
    roleId: r.id,
    roleCode: r.roleCode,
    roleName: r.roleName,
    roleNameTamil: r.roleNameTamil,
    description: r.description,
    roleLevel: r.roleLevel,
    isSystemRole: r.isSystemRole,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
})

// List all roles
export const list = async () => {
    const roles = await prisma.role.findMany({
        where: { tenantId: DEV_TENANT_ID },
        orderBy: { roleLevel: 'desc' },
    })
    return roles.map(clean)
}

// Create role
export const create = async (data: z.infer<typeof roleSchema>) => {
    const role = await prisma.role.create({
        data: {
            tenantId: DEV_TENANT_ID,
            roleCode: data.roleCode.toUpperCase(),
            roleName: data.roleName,
            roleNameTamil: data.roleNameTamil || null,
            description: data.description || null,
            roleLevel: data.roleLevel || 0,
            isSystemRole: data.isSystemRole || false,
            isActive: data.isActive !== false,
        },
    })
    return clean(role)
}

// Update role
export const update = async (id: string, data: Partial<z.infer<typeof roleSchema>>) => {
    const updateData: any = { ...data }

    if (data.roleCode) {
        updateData.roleCode = data.roleCode.toUpperCase()
    }

    const role = await prisma.role.update({
        where: { id },
        data: updateData,
    })

    return clean(role)
}

// Delete role
export const remove = async (id: string) => {
    // Check if role is system role
    const role = await prisma.role.findUnique({ where: { id } })
    if (!role) {
        throw new Error('Role not found')
    }
    if (role.isSystemRole) {
        throw new Error('System roles cannot be deleted')
    }

    await prisma.role.delete({ where: { id } })
    return { ok: true }
}
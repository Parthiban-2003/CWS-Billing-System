import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

const clean = (r: any) => ({
    roleId: r.id,
    roleCode: r.roleCode,
    roleName: r.roleName,
    roleNameTamil: r.roleNameTamil,
    description: r.description,
    roleLevel: r.roleLevel,
    isSystemRole: r.isSystemRole,
    isActive: r.isActive,
})

export const listRoles = async () => {
    const roles = await prisma.role.findMany({
        where: { tenantId: DEV_TENANT_ID },
        orderBy: { roleLevel: 'desc' },
    })
    return roles.map(clean)
}

export const createRole = async (data: any) => {
    const role = await prisma.role.create({
        data: {
            tenantId: DEV_TENANT_ID,
            roleCode: data.roleCode.toUpperCase(),
            roleName: data.roleName,
            roleNameTamil: data.roleNameTamil || null,
            description: data.description || null,
            roleLevel: Number(data.roleLevel) || 0,
            isSystemRole: data.isSystemRole || false,
            isActive: data.isActive !== false,
        },
    })
    return clean(role)
}

export const updateRole = async (id: string, data: any) => {
    const role = await prisma.role.update({
        where: { id },
        data: {
            ...(data.roleCode && { roleCode: data.roleCode.toUpperCase() }),
            ...(data.roleName && { roleName: data.roleName }),
            ...(data.roleNameTamil !== undefined && { roleNameTamil: data.roleNameTamil || null }),
            ...(data.description !== undefined && { description: data.description || null }),
            ...(data.roleLevel !== undefined && { roleLevel: Number(data.roleLevel) }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
    })
    return clean(role)
}

export const deleteRole = async (id: string) => {
    const role = await prisma.role.findUnique({ where: { id } })
    if (!role) throw new Error('Role not found')
    if (role.isSystemRole) throw new Error('System roles cannot be deleted')
    await prisma.role.delete({ where: { id } })
    return { ok: true }
}
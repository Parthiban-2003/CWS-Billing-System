import { prisma } from '@/database/client'

const clean = (rp: any) => ({
    id: rp.id,
    roleId: rp.roleId,
    permissionId: rp.permissionId,
    permissionCode: rp.permission?.code,
    permissionName: rp.permission?.name,
    module: rp.permission?.module,
    action: rp.permission?.action,
    isAllowed: rp.isAllowed,
})

export const listRolePermissions = async (roleId?: string) => {
    const where: any = {}
    if (roleId) where.roleId = roleId

    const rps = await prisma.rolePermission.findMany({
        where,
        include: { permission: true },
        orderBy: { createdAt: 'asc' },
    })
    return rps.map(clean)
}

export const assignPermissions = async (roleId: string, permissions: any[]) => {
    // Delete existing permissions for this role
    await prisma.rolePermission.deleteMany({ where: { roleId } })

    // Create new permissions
    if (permissions.length > 0) {
        await prisma.rolePermission.createMany({
            data: permissions.map((p) => ({
                roleId,
                permissionId: p.permissionId,
                isAllowed: Boolean(p.isAllowed),
            })),
        })
    }

    return { ok: true, count: permissions.length }
}

export const togglePermission = async (roleId: string, permissionId: string, isAllowed: boolean) => {
    const existing = await prisma.rolePermission.findUnique({
        where: { roleId_permissionId: { roleId, permissionId } },
    })

    if (existing) {
        if (isAllowed) {
            await prisma.rolePermission.update({
                where: { id: existing.id },
                data: { isAllowed },
            })
        } else {
            await prisma.rolePermission.delete({ where: { id: existing.id } })
        }
    } else if (isAllowed) {
        await prisma.rolePermission.create({
            data: { roleId, permissionId, isAllowed },
        })
    }

    return { ok: true }
}
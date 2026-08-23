import { prisma } from '@/database/client'

const clean = (p: any) => ({
    permissionId: p.id,
    permissionCode: p.code,
    permissionName: p.name,
    module: p.module,
    action: p.action,
    description: p.description,
})

export const listPermissions = async () => {
    const permissions = await prisma.permission.findMany({
        orderBy: [{ module: 'asc' }, { action: 'asc' }],
    })
    return permissions.map(clean)
}
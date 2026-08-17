import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

export const list = () =>
    prisma.kot.findMany({
        where: { tenantId: DEV_TENANT_ID },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
    })

export const create = async (d: { table: string; items: { name: string; qty: number }[] }) => {
    const count = await prisma.kot.count({ where: { tenantId: DEV_TENANT_ID } })
    return prisma.kot.create({
        data: {
            tenantId: DEV_TENANT_ID,
            number: 101 + count,
            table: d.table,
            items: { create: d.items.map((i) => ({ name: i.name, qty: i.qty })) },
        },
        include: { items: true },
    })
}

export const move = (id: string, status: string) =>
    prisma.kot.update({ where: { id }, data: { status } })
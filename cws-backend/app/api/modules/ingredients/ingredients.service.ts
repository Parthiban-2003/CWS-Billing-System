import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

const num = (v: unknown) => Number(v) || 0

const clean = (x: any) => ({
    ...x,
    stock: Number(x.stock),
    lowStockAt: Number(x.lowStockAt),
    costPerUnit: Number(x.costPerUnit),
})

export const list = async () =>
    (await prisma.ingredient.findMany({
        where: { tenantId: DEV_TENANT_ID },
        orderBy: { name: 'asc' },
    })).map(clean)

export const create = async (d: any) =>
    clean(await prisma.ingredient.create({ data: { ...d, tenantId: DEV_TENANT_ID } }))

export const update = async (id: string, d: any) =>
    clean(await prisma.ingredient.update({ where: { id }, data: d }))

export const remove = (id: string) => prisma.ingredient.delete({ where: { id } })
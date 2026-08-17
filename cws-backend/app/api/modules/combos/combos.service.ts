import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

const num = (v: unknown) => Number(v) || 0

const clean = (c: any) => ({
    ...c,
    price: Number(c.price),
    items: c.items?.map((i: any) => ({ ...i, product: i.product && { ...i.product, price: Number(i.product.price) } })),
})

export const list = async () =>
    (await prisma.combo.findMany({
        where: { tenantId: DEV_TENANT_ID },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
    })).map(clean)

export const create = async (d: any) =>
    clean(await prisma.combo.create({
        data: {
            tenantId: DEV_TENANT_ID, name: d.name, price: num(d.price),
            items: { create: (d.items || []).map((i: any) => ({ productId: i.productId, qty: num(i.qty) || 1 })) },
        },
        include: { items: { include: { product: true } } },
    }))

export const update = async (id: string, d: any) =>
    clean(await prisma.combo.update({ where: { id }, data: d }))

export const remove = (id: string) => prisma.combo.delete({ where: { id } })
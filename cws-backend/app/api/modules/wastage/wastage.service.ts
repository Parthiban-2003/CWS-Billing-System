import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

const num = (v: unknown) => Number(v) || 0

const clean = (w: any) => ({
    ...w,
    qty: Number(w.qty),
    ingredient: w.ingredient && { ...w.ingredient, stock: Number(w.ingredient.stock) },
    product: w.product && { ...w.product, price: Number(w.product.price) },
})

export const list = async () =>
    (await prisma.wastage.findMany({
        where: { tenantId: DEV_TENANT_ID },
        include: { ingredient: true, product: true },
        orderBy: { date: 'desc' },
        take: 100,
    })).map(clean)

export const create = async (d: any) => {
    const w = await prisma.wastage.create({
        data: {
            tenantId: DEV_TENANT_ID,
            itemType: d.itemType,
            ingredientId: d.ingredientId ?? null,
            productId: d.productId ?? null,
            qty: num(d.qty),
            reason: d.reason,
            note: d.note ?? null,
        },
        include: { ingredient: true, product: true },
    })

    // 📉 Stock auto-decrement
    if (d.itemType === 'INGREDIENT' && d.ingredientId) {
        await prisma.ingredient
            .update({ where: { id: d.ingredientId }, data: { stock: { decrement: num(d.qty) } } })
            .catch(() => { })
    }
    if (d.itemType === 'PRODUCT' && d.productId) {
        await prisma.product
            .update({ where: { id: d.productId }, data: { stock: { decrement: num(d.qty) } } })
            .catch(() => { })
    }
    return clean(w)
}
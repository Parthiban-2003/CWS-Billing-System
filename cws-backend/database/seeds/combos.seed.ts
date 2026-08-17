import { prisma } from '../client'

export async function seedCombos(tenantId: string) {
    await prisma.combo.deleteMany({ where: { tenantId } })
    const products = await prisma.product.findMany({ where: { tenantId } })
    const bir = products.find((p) => p.name === 'Chicken Biryani')
    const wat = products.find((p) => p.name === 'Water Bottle')
    if (bir && wat) {
        await prisma.combo.create({
            data: {
                tenantId, name: 'Biryani Combo', price: 190,
                items: { create: [{ productId: bir.id, qty: 1 }, { productId: wat.id, qty: 1 }] },
            },
        })
    }
    console.log('✅ Combos seeded')
}
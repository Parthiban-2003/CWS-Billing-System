import { prisma } from '../client'

const ING = [
    { name: 'Rice', unit: 'kg', stock: 25, lowStockAt: 10, costPerUnit: 60 },
    { name: 'Chicken', unit: 'kg', stock: 12, lowStockAt: 5, costPerUnit: 220 },
    { name: 'Mutton', unit: 'kg', stock: 6, lowStockAt: 3, costPerUnit: 650 },
    { name: 'Vegetables', unit: 'kg', stock: 8, lowStockAt: 4, costPerUnit: 45 },
    { name: 'Onion', unit: 'kg', stock: 3, lowStockAt: 5, costPerUnit: 40 },
    { name: 'Tomato', unit: 'kg', stock: 6, lowStockAt: 4, costPerUnit: 35 },
    { name: 'Cooking Oil', unit: 'ltr', stock: 15, lowStockAt: 5, costPerUnit: 140 },
    { name: 'Spices & Masala', unit: 'kg', stock: 2, lowStockAt: 2, costPerUnit: 400 },
    { name: 'Milk', unit: 'ltr', stock: 10, lowStockAt: 4, costPerUnit: 55 },
    { name: 'Tea Powder', unit: 'kg', stock: 4, lowStockAt: 1, costPerUnit: 300 },
]

export async function seedIngredients(tenantId: string) {
    await prisma.recipeItem.deleteMany({})
    await prisma.ingredient.deleteMany({ where: { tenantId } })

    for (const m of ING) {
        await prisma.ingredient.create({ data: { ...m, tenantId } })
    }

    //  Chicken Biryani recipe (per 1 plate)
    const bir = await prisma.product.findFirst({ where: { tenantId, name: 'Chicken Biryani' } })
    if (bir) {
        const get = async (n: string) => await prisma.ingredient.findFirst({ where: { tenantId, name: n } })
        const rice = await get('Rice')
        const chicken = await get('Chicken')
        const onion = await get('Onion')
        const oil = await get('Cooking Oil')
        const spices = await get('Spices & Masala')
        const recipe = [
            rice && { ingredientId: rice.id, qty: 0.25 },
            chicken && { ingredientId: chicken.id, qty: 0.2 },
            onion && { ingredientId: onion.id, qty: 0.05 },
            oil && { ingredientId: oil.id, qty: 0.05 },
            spices && { ingredientId: spices.id, qty: 0.02 },
        ].filter(Boolean)
        await prisma.recipeItem.createMany({ data: recipe.map((r: any) => ({ ...r, productId: bir.id })) })
    }
    console.log('✅ Ingredients + recipes seeded')
}
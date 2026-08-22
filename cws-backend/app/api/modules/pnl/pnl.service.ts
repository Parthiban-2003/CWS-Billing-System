import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

const num = (v: unknown) => Number(v) || 0

export const getPnl = async (days: number) => {
    const from = new Date()
    from.setDate(from.getDate() - (days - 1))
    from.setHours(0, 0, 0, 0)

    // 💰 1. REVENUE
    const invoices = await prisma.invoice.findMany({
        where: {
            tenantId: DEV_TENANT_ID,
            createdAt: { gte: from },
            status: { not: 'CANCELLED' },
        },
        include: { items: true },
    })
    const revenue = invoices.reduce((s, v) => s + num(v.total), 0)

    // 🥬 2. FOOD COST (Recipe-based exact cost!)
    const productIds = [
        ...new Set(
            invoices.flatMap((invoice) =>
                invoice.items
                    .map((item) => item.productId)
                    .filter((id): id is string => id !== null)
            )
        ),
    ]
    const recipes = await prisma.recipeItem.findMany({
        where: { productId: { in: productIds } },
        include: { ingredient: true },
    })

    // Calculate cost per plate for each sold product
    const costPerPlate: Record<string, number> = {}
    for (const r of recipes) {
        costPerPlate[r.productId] =
            (costPerPlate[r.productId] || 0) +
            Number(r.qty) * num(r.ingredient?.costPerUnit)
    }

    let foodCost = 0
    for (const v of invoices) {
        for (const i of v.items) {
            if (i.productId && costPerPlate[i.productId]) {
                foodCost += i.qty * costPerPlate[i.productId]
            }
        }
    }

    // 🗑️ 3. WASTAGE COST (add to food cost)
    const wastage = await prisma.wastage.findMany({
        where: { tenantId: DEV_TENANT_ID, date: { gte: from } },
        include: { ingredient: true, product: true },
    })
    const wastageCost = wastage.reduce((s, w) => {
        if (w.itemType === 'INGREDIENT') return s + num(w.qty) * num(w.ingredient?.costPerUnit)
        // If product was wasted, use recipe cost (approx)
        return s + num(w.qty) * (costPerPlate[w.productId || ''] || 0)
    }, 0)
    foodCost += wastageCost

    // 💵 4. EXPENSES (Staff + OpEx)
    const expenses = await prisma.expense.findMany({
        where: { tenantId: DEV_TENANT_ID, date: { gte: from } },
    })
    const staffCost = expenses
        .filter((e) => e.category === 'SALARY' || e.category === 'PAYROLL')
        .reduce((s, e) => s + num(e.amount), 0)
    const opex = expenses
        .filter((e) => e.category !== 'SALARY' && e.category !== 'PAYROLL')
        .reduce((s, e) => s + num(e.amount), 0)

    // 📊 5. PROFITS & MARGINS
    const gross = revenue - foodCost
    const net = gross - staffCost - opex
    const margin = revenue > 0 ? (net / revenue) * 100 : 0
    const foodPct = revenue > 0 ? (foodCost / revenue) * 100 : 0
    const staffPct = revenue > 0 ? (staffCost / revenue) * 100 : 0

    return {
        days,
        revenue: Math.round(revenue),
        foodCost: Math.round(foodCost),
        wastageCost: Math.round(wastageCost),
        staffCost: Math.round(staffCost),
        expenses: Math.round(opex),
        grossProfit: Math.round(gross),
        netProfit: Math.round(net),
        margin: Math.round(margin * 10) / 10,
        foodPct: Math.round(foodPct * 10) / 10,
        staffPct: Math.round(staffPct * 10) / 10,
        bills: invoices.length,
    }
}
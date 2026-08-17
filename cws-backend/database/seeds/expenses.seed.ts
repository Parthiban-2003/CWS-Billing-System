import { prisma } from '../client'

const EXP = [
    { category: 'VEG', note: 'Vegetables - local market', party: 'Market', amount: 850, method: 'CASH' },
    { category: 'GROCERY', note: 'Rice 25kg + dal', party: 'Kumar Stores', amount: 2400, method: 'UPI' },
    { category: 'GAS', note: 'Commercial cylinder', party: 'Gas agency', amount: 1900, method: 'CASH' },
    { category: 'SALARY', note: 'Cook salary', party: 'Muthu', amount: 12000, method: 'BANK' },
    { category: 'EB', note: 'EB bill', party: 'TNEB', amount: 3200, method: 'UPI' },
    { category: 'FURNITURE', note: 'New dining tables (2)', party: 'Wood works', amount: 6500, method: 'CASH' },
]

export async function seedExpenses(tenantId: string) {
    await prisma.expense.deleteMany({ where: { tenantId } })
    for (const x of EXP) await prisma.expense.create({ data: { ...x, tenantId } })
    console.log('✅ Expenses seeded')
}
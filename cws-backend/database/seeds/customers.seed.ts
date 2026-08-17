import { prisma } from '../client'

const CUSTOMERS = [
    { id: 'cust-0001', name: 'Kumar Stores', phone: '98400 11111' },
    { id: 'cust-0002', name: 'Anand Office', phone: '98400 22222' },
    { id: 'cust-0003', name: 'Meena Aunt', phone: '98400 33333' },
]

export async function seedCustomers(tenantId: string) {
    for (const c of CUSTOMERS) {
        await prisma.customer.upsert({ where: { id: c.id }, update: {}, create: { ...c, tenantId } })
    }
    console.log('✅ Customers seeded')
}
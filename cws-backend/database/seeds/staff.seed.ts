import { prisma } from '../client'

export async function seedStaff(tenantId: string) {
    await prisma.staff.deleteMany({ where: { tenantId } })
    await prisma.staff.createMany({
        data: [
            { tenantId, name: 'Admin (Owner)', role: 'OWNER', pin: '1234', salary: 0 },
            { tenantId, name: 'Ravi', role: 'CASHIER', pin: '2345', salary: 12000 },
            { tenantId, name: 'Muthu', role: 'KITCHEN', pin: '3456', salary: 15000 },
            { tenantId, name: 'Senthil', role: 'WAITER', pin: '4567', salary: 10000 },
        ],
    })
    console.log('✅ Staff seeded (PINs: 1234/2345/3456/4567)')
}
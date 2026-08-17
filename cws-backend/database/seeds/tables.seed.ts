import { prisma } from '../client'

export async function seedTables(tenantId: string) {
    await prisma.restTable.deleteMany({ where: { tenantId } })
    for (let i = 1; i <= 12; i++) {
        await prisma.restTable.create({ data: { tenantId, name: `T${i}` } })
    }
    console.log('✅ 12 tables seeded')
}
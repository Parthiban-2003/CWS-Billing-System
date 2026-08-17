import { prisma } from '../client'

export async function seedTenant() {
    return prisma.tenant.upsert({
        where: { slug: 'demo-hotel' },
        update: {},
        create: { id: 'demo-tenant-0001', name: 'Demo Hotel', slug: 'demo-hotel' },
    })
}
import { prisma } from '../client'

export async function seedSettings(tenantId: string) {
    await prisma.tenantSetting.upsert({
        where: { tenantId },
        update: {},
        create: {
            tenantId,
            companyName: 'Demo Hotel',
            gstin: '33ABCDE1234F1Z5',
            address: '12, Main Road, Chennai',
            phone: '98765 43210',
            footerMsg: 'Thank you! Visit again 🙏',
            taxPct: 5,
        },
    })
    console.log('✅ Settings seeded')
}
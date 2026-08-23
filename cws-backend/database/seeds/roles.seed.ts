import { prisma } from '../client'

export async function seedRoles(tenantId: string) {
    const roles = [
        {
            tenantId,
            roleCode: 'OWNER',
            roleName: 'Owner',
            roleNameTamil: 'உரிமையாளர்',
            description: 'Full system access - controls everything',
            roleLevel: 100,
            isSystemRole: true,
            isActive: true,
        },
        {
            tenantId,
            roleCode: 'MANAGER',
            roleName: 'Manager',
            roleNameTamil: 'மேலாளர்',
            description: 'Manage operations, staff, and reports',
            roleLevel: 80,
            isSystemRole: true,
            isActive: true,
        },
        {
            tenantId,
            roleCode: 'CASHIER',
            roleName: 'Cashier',
            roleNameTamil: 'கணக்காளர்',
            description: 'Handle POS and billing',
            roleLevel: 50,
            isSystemRole: true,
            isActive: true,
        },
        {
            tenantId,
            roleCode: 'WAITER',
            roleName: 'Waiter',
            roleNameTamil: 'வேலைக்காரர்',
            description: 'Serve tables and manage orders',
            roleLevel: 30,
            isSystemRole: true,
            isActive: true,
        },
        {
            tenantId,
            roleCode: 'KITCHEN',
            roleName: 'Kitchen Staff',
            roleNameTamil: 'சமையல்காரர்',
            description: 'Prepare food and manage kitchen',
            roleLevel: 30,
            isSystemRole: true,
            isActive: true,
        },
    ]

    for (const role of roles) {
        await prisma.role.upsert({
            where: { tenantId_roleCode: { tenantId, roleCode: role.roleCode } },
            update: {},
            create: role,
        })
    }

    console.log('✅ Roles seeded (5 default roles)')
}
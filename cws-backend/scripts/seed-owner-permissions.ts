import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔑 Seeding OWNER permissions...')

    // 1. Find OWNER role
    const ownerRole = await prisma.role.findFirst({
        where: { roleCode: 'OWNER' }
    })

    if (!ownerRole) {
        console.error('❌ OWNER role not found! Run main seeds first.')
        return
    }

    // 2. Get ALL permissions
    const allPermissions = await prisma.permission.findMany()
    console.log(`📋 Found ${allPermissions.length} permissions`)

    // 3. Assign all to OWNER
    for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: ownerRole.id,
                    permissionId: perm.id,
                }
            },
            update: { isAllowed: true },
            create: {
                roleId: ownerRole.id,
                permissionId: perm.id,
                isAllowed: true,
            },
        })
    }

    console.log(`✅ OWNER role granted all ${allPermissions.length} permissions!`)

    // 4. Also seed other roles with basic READ permissions
    const roles = ['MANAGER', 'CASHIER', 'WAITER', 'KITCHEN']
    for (const roleCode of roles) {
        const role = await prisma.role.findFirst({ where: { roleCode } })
        if (!role) continue

        const readPerms = allPermissions.filter(p =>
            p.action === 'READ' || p.action === 'VIEW' || p.module === 'DASHBOARD'
        )

        for (const perm of readPerms) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: role.id,
                        permissionId: perm.id,
                    }
                },
                update: {},
                create: {
                    roleId: role.id,
                    permissionId: perm.id,
                    isAllowed: true,
                },
            })
        }
        console.log(`✅ ${roleCode} granted ${readPerms.length} READ permissions`)
    }
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })
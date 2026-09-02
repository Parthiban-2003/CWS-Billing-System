import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting RBAC Seeding...')

    // 1. Get or Create a default tenant
    let tenant = await prisma.tenant.findFirst()
    if (!tenant) {
        tenant = await prisma.tenant.create({
            data: {
                name: 'Default Tenant',
                slug: 'default',
                plan: 'trial',
            },
        })
        console.log('✅ Created default tenant:', tenant.id)
        console.log('⚠️ Note: Update your DEV_TENANT_ID in config to match this:', tenant.id)
    } else {
        console.log('✅ Using existing tenant:', tenant.id)
    }

    const tenantId = tenant.id

    // 2. Seed Roles
    const rolesToSeed = [
        { roleCode: 'OWNER', roleName: 'Owner', roleNameTamil: 'உரிமையாளர்', description: 'Full system access', roleLevel: 100, isSystemRole: true },
        { roleCode: 'MANAGER', roleName: 'Manager', roleNameTamil: 'மேலாளர்', description: 'Manage operations and staff', roleLevel: 80, isSystemRole: true },
        { roleCode: 'CASHIER', roleName: 'Cashier', roleNameTamil: 'கணக்காளர்', description: 'Handle POS and billing', roleLevel: 50, isSystemRole: true },
        { roleCode: 'WAITER', roleName: 'Waiter', roleNameTamil: 'வேலைக்காரர்', description: 'Serve tables and manage orders', roleLevel: 30, isSystemRole: true },
        { roleCode: 'KITCHEN', roleName: 'Kitchen Staff', roleNameTamil: 'சமையல்காரர்', description: 'Prepare food and manage kitchen', roleLevel: 30, isSystemRole: true },
    ]

    for (const r of rolesToSeed) {
        await prisma.role.upsert({
            where: { tenantId_roleCode: { tenantId, roleCode: r.roleCode } },
            update: {},
            create: { ...r, tenantId },
        })
    }
    console.log('✅ Roles seeded/updated')

    // 3. Seed Permissions
    const permissionsToSeed = [
        { module: 'DASHBOARD', action: 'READ', code: 'DASHBOARD.READ', name: 'View Dashboard' },
        { module: 'POS', action: 'CREATE', code: 'POS.CREATE', name: 'Create Bills' },
        { module: 'POS', action: 'READ', code: 'POS.READ', name: 'View POS' },
        { module: 'POS', action: 'DELETE', code: 'POS.DELETE', name: 'Void Bills' },
        { module: 'MENU', action: 'CREATE', code: 'MENU.CREATE', name: 'Add Menu Items' },
        { module: 'MENU', action: 'READ', code: 'MENU.READ', name: 'View Menu' },
        { module: 'MENU', action: 'UPDATE', code: 'MENU.UPDATE', name: 'Edit Menu Items' },
        { module: 'MENU', action: 'DELETE', code: 'MENU.DELETE', name: 'Delete Menu Items' },
        { module: 'INVENTORY', action: 'READ', code: 'INVENTORY.READ', name: 'View Inventory' },
        { module: 'INVENTORY', action: 'UPDATE', code: 'INVENTORY.UPDATE', name: 'Update Stock' },
        { module: 'CUSTOMERS', action: 'CREATE', code: 'CUSTOMERS.CREATE', name: 'Add Customers' },
        { module: 'CUSTOMERS', action: 'READ', code: 'CUSTOMERS.READ', name: 'View Customers' },
        { module: 'CUSTOMERS', action: 'UPDATE', code: 'CUSTOMERS.UPDATE', name: 'Edit Customers' },
        { module: 'INVOICES', action: 'READ', code: 'INVOICES.READ', name: 'View Invoices' },
        { module: 'STAFF', action: 'CREATE', code: 'STAFF.CREATE', name: 'Add Staff' },
        { module: 'STAFF', action: 'READ', code: 'STAFF.READ', name: 'View Staff' },
        { module: 'STAFF', action: 'UPDATE', code: 'STAFF.UPDATE', name: 'Edit Staff' },
        { module: 'STAFF', action: 'DELETE', code: 'STAFF.DELETE', name: 'Delete Staff' },
        { module: 'ATTENDANCE', action: 'READ', code: 'ATTENDANCE.READ', name: 'View Attendance' },
        { module: 'ATTENDANCE', action: 'UPDATE', code: 'ATTENDANCE.UPDATE', name: 'Mark Attendance' },
        { module: 'PAYROLL', action: 'READ', code: 'PAYROLL.READ', name: 'View Payroll' },
        { module: 'PAYROLL', action: 'UPDATE', code: 'PAYROLL.UPDATE', name: 'Process Payroll' },
        { module: 'REPORTS', action: 'READ', code: 'REPORTS.READ', name: 'View Reports' },
        { module: 'PNL', action: 'READ', code: 'PNL.READ', name: 'View P&L' },
        { module: 'SETTINGS', action: 'READ', code: 'SETTINGS.READ', name: 'View Settings' },
        { module: 'SETTINGS', action: 'UPDATE', code: 'SETTINGS.UPDATE', name: 'Update Settings' },
        { module: 'ROLES', action: 'CREATE', code: 'ROLES.CREATE', name: 'Create Roles' },
        { module: 'ROLES', action: 'READ', code: 'ROLES.READ', name: 'View Roles' },
        { module: 'ROLES', action: 'UPDATE', code: 'ROLES.UPDATE', name: 'Edit Roles' },
        { module: 'ROLES', action: 'DELETE', code: 'ROLES.DELETE', name: 'Delete Roles' },
    ]

    for (const p of permissionsToSeed) {
        await prisma.permission.upsert({
            where: { code: p.code },
            update: {},
            create: p,
        })
    }
    console.log(`✅ ${permissionsToSeed.length} Permissions seeded/updated`)

    // 4. Assign Permissions to Roles
    const allPermissions = await prisma.permission.findMany()

    // OWNER gets EVERYTHING
    const ownerRole = await prisma.role.findUnique({
        where: { tenantId_roleCode: { tenantId, roleCode: 'OWNER' } }
    })

    if (ownerRole) {
        for (const perm of allPermissions) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: ownerRole.id, permissionId: perm.id } },
                update: { isAllowed: true },
                create: { roleId: ownerRole.id, permissionId: perm.id, isAllowed: true },
            })
        }
        console.log(`✅ OWNER role granted all ${allPermissions.length} permissions`)
    } else {
        console.error('❌ OWNER role not found!')
    }

    // Other roles get READ permissions
    const otherRoles = ['MANAGER', 'CASHIER', 'WAITER', 'KITCHEN']
    for (const roleCode of otherRoles) {
        const role = await prisma.role.findUnique({
            where: { tenantId_roleCode: { tenantId, roleCode } }
        })
        if (!role) continue

        const readPerms = allPermissions.filter(p =>
            p.action === 'READ' || p.action === 'VIEW' || p.module === 'DASHBOARD'
        )

        for (const perm of readPerms) {
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
                update: {},
                create: { roleId: role.id, permissionId: perm.id, isAllowed: true },
            })
        }
        console.log(`✅ ${roleCode} granted ${readPerms.length} READ permissions`)
    }

    // 5. Link existing Admin/Owner staff to the OWNER role (if any)
    const adminStaff = await prisma.staff.findFirst({
        where: { roleId: null, name: { contains: 'Admin', mode: 'insensitive' } }
    })

    if (adminStaff && ownerRole) {
        await prisma.staff.update({
            where: { id: adminStaff.id },
            data: { roleId: ownerRole.id }
        })
        console.log(`✅ Linked existing Admin staff to OWNER role`)
    }

    console.log('🎉 RBAC Seeding Completed Successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
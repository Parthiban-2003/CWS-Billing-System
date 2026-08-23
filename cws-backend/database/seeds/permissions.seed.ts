import { prisma } from '../client'

export async function seedPermissions() {
    const permissions = [
        // DASHBOARD
        { module: 'DASHBOARD', action: 'READ', code: 'DASHBOARD.READ', name: 'View Dashboard' },

        // POS
        { module: 'POS', action: 'CREATE', code: 'POS.CREATE', name: 'Create Bills' },
        { module: 'POS', action: 'READ', code: 'POS.READ', name: 'View POS' },
        { module: 'POS', action: 'DELETE', code: 'POS.DELETE', name: 'Void Bills' },

        // MENU
        { module: 'MENU', action: 'CREATE', code: 'MENU.CREATE', name: 'Add Menu Items' },
        { module: 'MENU', action: 'READ', code: 'MENU.READ', name: 'View Menu' },
        { module: 'MENU', action: 'UPDATE', code: 'MENU.UPDATE', name: 'Edit Menu Items' },
        { module: 'MENU', action: 'DELETE', code: 'MENU.DELETE', name: 'Delete Menu Items' },

        // INVENTORY
        { module: 'INVENTORY', action: 'READ', code: 'INVENTORY.READ', name: 'View Inventory' },
        { module: 'INVENTORY', action: 'UPDATE', code: 'INVENTORY.UPDATE', name: 'Update Stock' },

        // CUSTOMERS
        { module: 'CUSTOMERS', action: 'CREATE', code: 'CUSTOMERS.CREATE', name: 'Add Customers' },
        { module: 'CUSTOMERS', action: 'READ', code: 'CUSTOMERS.READ', name: 'View Customers' },
        { module: 'CUSTOMERS', action: 'UPDATE', code: 'CUSTOMERS.UPDATE', name: 'Edit Customers' },

        // INVOICES
        { module: 'INVOICES', action: 'READ', code: 'INVOICES.READ', name: 'View Invoices' },

        // STAFF
        { module: 'STAFF', action: 'CREATE', code: 'STAFF.CREATE', name: 'Add Staff' },
        { module: 'STAFF', action: 'READ', code: 'STAFF.READ', name: 'View Staff' },
        { module: 'STAFF', action: 'UPDATE', code: 'STAFF.UPDATE', name: 'Edit Staff' },
        { module: 'STAFF', action: 'DELETE', code: 'STAFF.DELETE', name: 'Delete Staff' },

        // ATTENDANCE
        { module: 'ATTENDANCE', action: 'READ', code: 'ATTENDANCE.READ', name: 'View Attendance' },
        { module: 'ATTENDANCE', action: 'UPDATE', code: 'ATTENDANCE.UPDATE', name: 'Mark Attendance' },

        // PAYROLL
        { module: 'PAYROLL', action: 'READ', code: 'PAYROLL.READ', name: 'View Payroll' },
        { module: 'PAYROLL', action: 'UPDATE', code: 'PAYROLL.UPDATE', name: 'Process Payroll' },

        // REPORTS
        { module: 'REPORTS', action: 'READ', code: 'REPORTS.READ', name: 'View Reports' },

        // PROFIT & LOSS
        { module: 'PNL', action: 'READ', code: 'PNL.READ', name: 'View P&L' },

        // SETTINGS
        { module: 'SETTINGS', action: 'READ', code: 'SETTINGS.READ', name: 'View Settings' },
        { module: 'SETTINGS', action: 'UPDATE', code: 'SETTINGS.UPDATE', name: 'Update Settings' },

        // ROLES & PERMISSIONS
        { module: 'ROLES', action: 'CREATE', code: 'ROLES.CREATE', name: 'Create Roles' },
        { module: 'ROLES', action: 'READ', code: 'ROLES.READ', name: 'View Roles' },
        { module: 'ROLES', action: 'UPDATE', code: 'ROLES.UPDATE', name: 'Edit Roles' },
        { module: 'ROLES', action: 'DELETE', code: 'ROLES.DELETE', name: 'Delete Roles' },
    ]

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { code: perm.code },
            update: {},
            create: perm,
        })
    }

    console.log('✅ Permissions seeded')
}
import { prisma } from '../client'
import { seedTenant } from './tenant.seed'
import { seedProducts } from './products.seed'
import { seedCustomers } from './customers.seed'
import { seedExpenses } from './expenses.seed'
import { seedTables } from './tables.seed'
import { seedSettings } from './settings.seed'
import { seedCombos } from './combos.seed'
import { seedIngredients } from './ingredients.seed'
import { seedStaff } from './staff.seed'
import { seedPermissions } from './permissions.seed'
import { seedRoles } from './roles.seed'

async function main() {
    const tenant = await seedTenant()
    await seedProducts(tenant.id)
    await seedCustomers(tenant.id)
    await seedExpenses(tenant.id)
    await seedTables(tenant.id)
    await seedSettings(tenant.id)
    await seedCombos(tenant.id)
    await seedIngredients(tenant.id)
    await seedStaff(tenant.id)
    await seedPermissions()
    await seedRoles(tenant.id)
    console.log('🎉 ALL SEEDS COMPLETE!')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
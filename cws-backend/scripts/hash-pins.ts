import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('🔐 Hashing staff PINs...')

    const staff = await prisma.staff.findMany({
        where: { pinHash: null, pin: { not: null } },
    })

    for (const s of staff) {
        if (s.pin) {
            const pinHash = await hash(s.pin, 10)
            await prisma.staff.update({
                where: { id: s.id },
                data: { pinHash },
            })
            console.log(`✅ ${s.name} PIN hashed`)
        }
    }

    console.log(`\n✅ Done! ${staff.length} staff PINs hashed.`)
    console.log('🔒 Now you can safely remove the `pin` column from Staff model.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
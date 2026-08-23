import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

const num = (v: unknown) => Number(v) || 0

const clean = (s: any) => ({
    ...s,
    salary: Number(s.salary),
})

export const list = async () =>
    (
        await prisma.staff.findMany({
            where: { tenantId: DEV_TENANT_ID },
            orderBy: { createdAt: 'asc' },
        })
    ).map(clean)

export const create = async (d: any) =>
    clean(
        await prisma.staff.create({
            data: {
                tenantId: DEV_TENANT_ID,
                name: d.name,
                phone: d.phone ?? null,
                role: d.role || 'CASHIER',
                salary: num(d.salary),
                pin: d.pin || null,
                joinDate: d.joinDate ? new Date(d.joinDate) : new Date(),
            },
        })
    )

export const update = async (id: string, d: any) => {
    const data: any = { ...d }
    if ('pin' in data) data.pin = data.pin === '' ? null : data.pin
    if ('salary' in data) data.salary = num(data.salary)
    if ('joinDate' in data && data.joinDate) data.joinDate = new Date(data.joinDate)
    return clean(await prisma.staff.update({ where: { id }, data }))
}

export const remove = (id: string) => prisma.staff.delete({ where: { id } })
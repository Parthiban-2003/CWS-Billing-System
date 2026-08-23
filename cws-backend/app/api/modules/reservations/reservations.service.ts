import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'
import { notify } from '@modules/notifications'

export const list = async () =>
    prisma.reservation.findMany({
        where: { tenantId: DEV_TENANT_ID },
        orderBy: [{ date: 'desc' }, { time: 'asc' }],
        take: 200,
    })

export const create = async (d: any) => {
    const r = await prisma.reservation.create({
        data: { ...d, tenantId: DEV_TENANT_ID },
    })
    await notify(
        'RESERVATION',
        `📅 New booking: ${r.name} · ${r.date} ${r.time} · ${r.guests} guests${r.table ? ` · ${r.table}` : ''}`
    )
    return r
}

export const update = async (id: string, d: any) =>
    prisma.reservation.update({ where: { id }, data: d })

export const remove = (id: string) => prisma.reservation.delete({ where: { id } })
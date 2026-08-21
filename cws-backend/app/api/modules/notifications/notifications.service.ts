import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

// 🔔 Simple notify
export const notify = async (
    type: string,
    message: string,
    priority: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO'
) => {
    await prisma.notification
        .create({ data: { tenantId: DEV_TENANT_ID, type, message, priority } })
        .catch(() => { })
}

// 🔕 Dedup notify — same key-ku oru naal-ku oru alert mattum
export const notifyOnce = async (
    type: string,
    message: string,
    priority: 'INFO' | 'WARNING' | 'CRITICAL' = 'WARNING',
    key = ''
) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exists = await prisma.notification
        .findFirst({
            where: { tenantId: DEV_TENANT_ID, type, itemKey: key, createdAt: { gte: today } },
        })
        .catch(() => null)
    if (exists) return
    await prisma.notification
        .create({ data: { tenantId: DEV_TENANT_ID, type, message, priority, itemKey: key } })
        .catch(() => { })
}

export const list = async () =>
    prisma.notification.findMany({
        where: { tenantId: DEV_TENANT_ID },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })

export const markRead = (id: string) =>
    prisma.notification.update({ where: { id }, data: { read: true } })

export const markAllRead = () =>
    prisma.notification.updateMany({
        where: { tenantId: DEV_TENANT_ID, read: false },
        data: { read: true },
    })
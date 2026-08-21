import { NextResponse } from 'next/server'
import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'
import { notify } from '@modules/notifications'

export async function GET() {
    const kots = await prisma.kot.findMany({
        where: { tenantId: DEV_TENANT_ID },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
    })
    return NextResponse.json(kots)
}

export async function POST(req: Request) {
    const body = await req.json()
    const count = await prisma.kot.count({ where: { tenantId: DEV_TENANT_ID } })
    const kot = await prisma.kot.create({
        data: {
            tenantId: DEV_TENANT_ID,
            number: 101 + count,
            table: body.table || '—',
            items: { create: (body.items || []).map((i: any) => ({ name: i.name, qty: num(i.qty) })) },
        },
        include: { items: true },
    })
    await notify('NEW_ORDER', `🆕 New order #${kot.number} · Table ${kot.table}`)
    return NextResponse.json(kot, { status: 201 })
}

const num = (v: unknown) => Number(v) || 1
import { NextResponse } from 'next/server'
import { prisma } from '@/database/client'
import { notify } from '@modules/notifications'

const VALID = ['NEW', 'PREPARING', 'READY', 'COMPLETED']

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await req.json()
    if (!VALID.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    const kot = await prisma.kot.update({
        where: { id },
        data: { status: body.status },
        include: { items: true },
    })
    if (body.status === 'READY') {
        await notify('ORDER_READY', `🔔 Order #${kot.number} ready · Table ${kot.table} — serve pannu!`)
    }
    return NextResponse.json(kot)
}
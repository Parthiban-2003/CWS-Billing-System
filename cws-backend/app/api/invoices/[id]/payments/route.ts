import { NextResponse } from 'next/server'
import { prisma } from '@/database/client'
import { notify } from '@modules/notifications'

const num = (v: unknown) => Number(v) || 0

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await req.json()

    const inv = await prisma.invoice.findUnique({ where: { id } })
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    const wasDue = Number(inv.paid) < Number(inv.total)

    await prisma.payment.create({
        data: { invoiceId: id, amount: num(body.amount), method: body.method || 'CASH' },
    })

    const paid = Number(inv.paid) + num(body.amount)
    const status = paid >= Number(inv.total) ? 'PAID' : 'PARTIAL'
    await prisma.invoice.update({ where: { id }, data: { paid, status } })

    if (wasDue && status === 'PAID') {
        await notify('PAYMENT', `💰 Due cleared! Inv #${inv.number} fully paid (₹${num(body.amount)} received)`)
    } else if (wasDue) {
        await notify('PAYMENT', `💰 Payment ₹${num(body.amount)} received · Inv #${inv.number} (due: ₹${Number(inv.total) - paid})`)
    }

    return NextResponse.json({ ok: true, paid, status })
}
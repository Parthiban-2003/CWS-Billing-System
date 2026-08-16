import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const num = (v: unknown) => Number(v) || 0

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await req.json()
    const amount = num(body.amount)

    const inv = await prisma.invoice.findUnique({ where: { id } })
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.payment.create({ data: { invoiceId: id, amount, method: body.method || 'CASH' } })

    const paid = Number(inv.paid) + amount
    const status = paid >= Number(inv.total) ? 'PAID' : 'PARTIAL'
    await prisma.invoice.update({ where: { id }, data: { paid, status } })

    return NextResponse.json({ ok: true, paid, status })
}
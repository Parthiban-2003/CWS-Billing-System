import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const inv = await prisma.invoice.update({
        where: { id }, data: { status: 'CANCELLED' }, include: { items: true },
    })
    for (const i of inv.items) {
        if (i.productId) await prisma.product.update({ where: { id: i.productId }, data: { stock: { increment: i.qty } } }).catch(() => { })
    }
    return NextResponse.json({ ok: true })
}
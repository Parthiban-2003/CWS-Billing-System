import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEV_TENANT_ID } from '@/lib/tenant'

const num = (v: unknown) => Number(v) || 0
const clean = (e: any) => ({ ...e, amount: Number(e.amount) })

export async function GET() {
    const list = await prisma.expense.findMany({
        where: { tenantId: DEV_TENANT_ID }, orderBy: { date: 'desc' }, take: 200,
    })
    return NextResponse.json(list.map(clean))
}

export async function POST(req: Request) {
    const b = await req.json()
    if (!b.category || num(b.amount) <= 0) {
        return NextResponse.json({ error: 'category & amount required' }, { status: 400 })
    }
    const e = await prisma.expense.create({
        data: {
            tenantId: DEV_TENANT_ID, category: b.category, note: b.note,
            party: b.party, method: b.method || 'CASH', amount: num(b.amount),
        },
    })
    return NextResponse.json(clean(e), { status: 201 })
}
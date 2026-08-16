import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEV_TENANT_ID } from '@/lib/tenant'
import { calcTotals } from '@/utils/totals'

const num = (v: unknown) => Number(v) || 0

const clean = (inv: any) => ({
  ...inv,
  subtotal: Number(inv.subtotal), discount: Number(inv.discount),
  service: Number(inv.service), roundOff: Number(inv.roundOff), total: Number(inv.total),
  items: inv.items?.map((i: any) => ({ ...i, price: Number(i.price), amount: Number(i.amount) })),
})

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    where: { tenantId: DEV_TENANT_ID },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 100,
  })
  return NextResponse.json(invoices.map(clean))
}

export async function POST(req: Request) {
  const body = await req.json()
  const count = await prisma.invoice.count({ where: { tenantId: DEV_TENANT_ID } })

  // 🔐 Server dhaan totals calc pannum — client illa!
  const t = calcTotals(
    (body.items || []).map((i: any) => ({ price: num(i.price), qty: num(i.qty) })),
    { discountPct: body.discountPct, servicePct: body.servicePct, taxPct: body.taxPct },
  )

  const paid = num(body.paid)
  const status = paid >= t.total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID'

  const invoice = await prisma.invoice.create({
    data: {
      tenantId: DEV_TENANT_ID,
      number: 1001 + count,
      orderType: body.orderType,
      table: body.table,
      method: body.method,
      subtotal: t.subtotal,
      discount: t.discount,
      service: t.service,
      roundOff: t.roundOff,
      total: t.total,
      paid,
      status,
      customerId: body.customerId ?? null,
      items: {
        create: (body.items || []).map((i: any) => ({
          productId: i.id, name: i.name, qty: num(i.qty),
          price: num(i.price), amount: num(i.price) * num(i.qty),
        })),
      },
    },
    include: { items: true },
  })

  for (const i of body.items || []) {
    await prisma.product
      .update({ where: { id: i.id }, data: { stock: { decrement: num(i.qty) } } })
      .catch(() => {})
  }

  return NextResponse.json(clean(invoice), { status: 201 })
}
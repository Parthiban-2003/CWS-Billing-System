import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEV_TENANT_ID } from '@/lib/tenant'

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

  const invoice = await prisma.invoice.create({
    data: {
      tenantId: DEV_TENANT_ID,
      number: 1001 + count,
      orderType: body.orderType, table: body.table, method: body.method,
      subtotal: num(body.totals.subtotal), discount: num(body.totals.discount),
      service: num(body.totals.service), roundOff: num(body.totals.roundOff),
      total: num(body.totals.total),
      items: {
        create: body.items.map((i: any) => ({
          productId: i.id, name: i.name, qty: i.qty, price: num(i.price), amount: num(i.price) * i.qty,
        })),
      },
    },
    include: { items: true },
  })

  for (const i of body.items) {
    await prisma.product.update({ where: { id: i.id }, data: { stock: { decrement: i.qty } } }).catch(() => {})
  }

  return NextResponse.json(clean(invoice), { status: 201 })
}
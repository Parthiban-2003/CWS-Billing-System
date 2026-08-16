import { NextResponse } from 'next/server'
import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'
import { isHappyHour } from '@/utils/happy'

const num = (v: unknown) => Number(v) || 0

const clean = (inv: any) => ({
  ...inv,
  subtotal: Number(inv.subtotal),
  discount: Number(inv.discount),
  service: Number(inv.service),
  roundOff: Number(inv.roundOff),
  total: Number(inv.total),
  paid: Number(inv.paid),
  redeemed: inv.redeemed ?? 0,
  pointsEarned: inv.pointsEarned ?? 0,
  items: inv.items?.map((i: any) => ({
    ...i,
    price: Number(i.price),
    amount: Number(i.amount),
  })),
  payments: inv.payments?.map((p: any) => ({
    ...p,
    amount: Number(p.amount),
  })),
  customer: inv.customer ? {
    id: inv.customer.id,
    name: inv.customer.name,
    phone: inv.customer.phone,
    points: inv.customer.points ?? 0,
    totalSpent: Number(inv.customer.totalSpent || 0),
  } : null,
})

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { tenantId: DEV_TENANT_ID },
      orderBy: { createdAt: 'desc' },
      include: { items: true, payments: true, customer: true },
      take: 100,
    })
    return NextResponse.json(invoices.map(clean))
  } catch (e: any) {
    console.error('INVOICE GET ERROR:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const settings = await prisma.tenantSetting.findUnique({
      where: { tenantId: DEV_TENANT_ID },
    })

    const happy =
      isHappyHour(settings?.happyStart, settings?.happyEnd) &&
      Number(settings?.happyPct || 0) > 0

    const items = Array.isArray(body.items) ? body.items : []
    const subtotal = items.reduce(
      (s: number, i: any) => s + num(i.price) * num(i.qty),
      0
    )

    // 💰 Server-side totals
    const manualDisc = subtotal * (num(body.discountPct) / 100)
    const happyDisc = happy
      ? (subtotal - manualDisc) * (Number(settings?.happyPct || 0) / 100)
      : 0
    const discount = manualDisc + happyDisc
    const service = (subtotal - discount) * (num(body.servicePct) / 100)
    const tax = (subtotal - discount + service) * (num(body.taxPct) / 100)
    const gross = subtotal - discount + service + tax
    const roundOff = Math.round(gross) - gross
    let total = Math.round(gross)

    // ⭐ Loyalty redeem (1 point = ₹1)
    let redeemPts = 0
    if (body.customerId && num(body.redeemPoints) > 0 && settings?.loyaltyEnabled) {
      const cust = await prisma.customer.findUnique({
        where: { id: body.customerId },
      })
      redeemPts = Math.min(num(body.redeemPoints), cust?.points || 0)
      total = Math.max(0, total - redeemPts)
    }

    // ⭐ Loyalty earn compute (snapshot value save pannanum)
    const earned =
      body.customerId && settings?.loyaltyEnabled
        ? Math.floor((num(body.paid) || total) / 100)
        : 0

    // 💳 Split payments support
    const payments =
      Array.isArray(body.payments) && body.payments.length
        ? body.payments
        : [{ method: body.method || 'CASH', amount: num(body.paid) || total }]
    const paid = payments.reduce((s: number, p: any) => s + num(p.amount), 0)
    const status = paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID'
    const method = payments.length > 1 ? 'SPLIT' : payments[0].method

    const count = await prisma.invoice.count({
      where: { tenantId: DEV_TENANT_ID },
    })

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: DEV_TENANT_ID,
        number: 1001 + count,
        orderType: body.orderType || 'TAKEAWAY',
        table: body.table || null,
        method,
        subtotal,
        discount,
        service,
        roundOff,
        total,
        paid,
        status,
        customerId: body.customerId ?? null,
        redeemed: redeemPts,
        pointsEarned: earned,
        payments: {
          create: payments.map((p: any) => ({
            method: p.method || 'CASH',
            amount: num(p.amount),
          })),
        },
        items: {
          create: items.map((i: any) => ({
            productId: i.id || null,
            name: i.name || 'Item',
            qty: num(i.qty) || 1,
            price: num(i.price),
            amount: num(i.price) * num(i.qty),
            variantName: i.variantName ?? null,
            modifiers: i.modifiers ?? null,
          })),
        },
      },
      include: { items: true, payments: true, customer: true },
    })

    // ⭐ Loyalty earn — customer-ula update
    if (body.customerId && settings?.loyaltyEnabled) {
      await prisma.customer.update({
        where: { id: body.customerId },
        data: {
          points: { increment: earned - redeemPts },
          totalSpent: { increment: paid },
        },
      })
    }

    // 📦 Stock decrement (real products mattum — combos skip)
    for (const i of items) {
      if (i.id && !i.isCombo) {
        await prisma.product
          .update({
            where: { id: i.id },
            data: { stock: { decrement: num(i.qty) } },
          })
          .catch(() => { })
      }
    }

    return NextResponse.json(clean(invoice), { status: 201 })
  } catch (e: any) {
    console.error('INVOICE POST ERROR:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'
import { isHappyHour } from '@/utils/happy'
import { notify, notifyOnce } from '@modules/notifications'

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
  pointsBefore: inv.pointsBefore ?? 0,
  pointsAfter: inv.pointsAfter ?? 0,
  items: inv.items?.map((i: any) => ({ ...i, price: Number(i.price), amount: Number(i.amount) })),
  payments: inv.payments?.map((p: any) => ({ ...p, amount: Number(p.amount) })),
  customer: inv.customer
    ? {
      id: inv.customer.id,
      name: inv.customer.name,
      phone: inv.customer.phone,
      gstin: inv.customer.gstin,
      points: inv.customer.points ?? 0,
      totalSpent: Number(inv.customer.totalSpent || 0),
    }
    : null,
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
    const settings = await prisma.tenantSetting.findUnique({ where: { tenantId: DEV_TENANT_ID } })

    const happy =
      isHappyHour(settings?.happyStart, settings?.happyEnd) &&
      Number(settings?.happyPct || 0) > 0

    const items = Array.isArray(body.items) ? body.items : []
    const subtotal = items.reduce((s: number, i: any) => s + num(i.price) * num(i.qty), 0)

    const manualDisc = subtotal * (num(body.discountPct) / 100)
    const happyDisc = happy ? (subtotal - manualDisc) * (Number(settings?.happyPct || 0) / 100) : 0
    const discount = manualDisc + happyDisc
    const service = (subtotal - discount) * (num(body.servicePct) / 100)
    const tax = (subtotal - discount + service) * (num(body.taxPct) / 100)
    const gross = subtotal - discount + service + tax
    const roundOff = Math.round(gross) - gross
    let total = Math.round(gross)

    let cust: any = null
    if (body.customerId) {
      cust = await prisma.customer.findUnique({ where: { id: body.customerId } })
    }
    const pointsBefore = cust?.points ?? 0

    let redeemPts = 0
    if (cust && num(body.redeemPoints) > 0 && settings?.loyaltyEnabled) {
      redeemPts = Math.min(num(body.redeemPoints), pointsBefore)
      total = Math.max(0, total - redeemPts)
    }

    const earned = cust && settings?.loyaltyEnabled ? Math.floor(total / 100) : 0
    const pointsAfter = pointsBefore + earned - redeemPts

    const payments =
      Array.isArray(body.payments) && body.payments.length
        ? body.payments
        : [{ method: body.method || 'CASH', amount: num(body.paid) || total }]
    const paid = payments.reduce((s: number, p: any) => s + num(p.amount), 0)
    const status = paid >= total ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID'
    const method = payments.length > 1 ? 'SPLIT' : payments[0].method

    const count = await prisma.invoice.count({ where: { tenantId: DEV_TENANT_ID } })

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
        pointsBefore,
        pointsAfter,
        payments: { create: payments.map((p: any) => ({ method: p.method || 'CASH', amount: num(p.amount) })) },
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

    if (cust && settings?.loyaltyEnabled) {
      await prisma.customer.update({
        where: { id: cust.id },
        data: { points: { increment: earned - redeemPts }, totalSpent: { increment: paid } },
      })
    }

    // 📦 Product stock decrement + ⚠️ low stock alert
    for (const i of items) {
      if (i.id && !i.isCombo) {
        await prisma.product
          .update({ where: { id: i.id }, data: { stock: { decrement: num(i.qty) } } })
          .catch(() => { })
        const p = await prisma.product.findUnique({ where: { id: i.id } }).catch(() => null)
        if (p && Number(p.stock) <= Number(p.lowStockAt)) {
          await notifyOnce(
            'LOW_STOCK',
            `⚠️ ${p.name} low stock: ${Number(p.stock)} left (min ${Number(p.lowStockAt)})`,
            Number(p.stock) <= 0 ? 'CRITICAL' : 'WARNING',
            `product-${p.id}`
          )
        }
      }
    }

    // 🥬 Ingredient decrement + ⚠️ low stock alert
    for (const i of items) {
      if (!i.id || i.isCombo) continue
      const recipe = await prisma.recipeItem.findMany({ where: { productId: i.id } })
      for (const r of recipe) {
        await prisma.ingredient
          .update({
            where: { id: r.ingredientId },
            data: { stock: { decrement: Number(r.qty) * num(i.qty) } },
          })
          .catch(() => { })
        const ing = await prisma.ingredient.findUnique({ where: { id: r.ingredientId } }).catch(() => null)
        if (ing && Number(ing.stock) <= Number(ing.lowStockAt)) {
          await notifyOnce(
            'LOW_STOCK',
            `⚠️ ${ing.name} low: ${Number(ing.stock)}${ing.unit} left (min ${Number(ing.lowStockAt)})`,
            Number(ing.stock) <= 0 ? 'CRITICAL' : 'WARNING',
            `ing-${ing.id}`
          )
        }
      }
    }

    // 💵 Big bill alert
    if (total >= 2000) {
      await notify('BIG_BILL', `💵 Big bill #${invoice.number}: ₹${total} (${body.orderType})`)
    }

    return NextResponse.json(clean(invoice), { status: 201 })
  } catch (e: any) {
    console.error('INVOICE POST ERROR:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
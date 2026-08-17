import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'
import { num } from '@/utils/receipt'

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
const sum = (arr: any[], f: (x: any) => number) => arr.reduce((s, x) => s + f(x), 0)

export async function getDashboard() {
    const invoices = await prisma.invoice.findMany({ where: { tenantId: DEV_TENANT_ID }, include: { items: true } })
    const products = await prisma.product.findMany({ where: { tenantId: DEV_TENANT_ID } })

    const live = invoices.filter((v) => v.status !== 'CANCELLED')
    const today = live.filter((v) => sameDay(new Date(v.createdAt), new Date()))

    const days = [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return {
            day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
            sales: sum(live.filter((v) => sameDay(new Date(v.createdAt), d)), (v) => num(v.total)),
        }
    })

    const methods = ['CASH', 'UPI', 'CARD', 'CREDIT']
        .map((m) => ({ name: m, value: sum(live.filter((v) => v.method === m), (v) => num(v.paid)) }))
        .filter((x) => x.value > 0)

    const channels = ['DINE_IN', 'TAKEAWAY']
        .map((c) => ({ name: c, value: sum(today.filter((v) => v.orderType === c), (v) => num(v.total)) }))

    const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {}
    live.forEach((v) => v.items.forEach((i) => {
        itemMap[i.name] = itemMap[i.name] || { name: i.name, qty: 0, revenue: 0 }
        itemMap[i.name].qty += i.qty
        itemMap[i.name].revenue += num(i.amount)
    }))

    return {
        todaySales: sum(today, (v) => num(v.total)),
        todayCollection: sum(today, (v) => num(v.paid)),
        outstanding: sum(live, (v) => num(v.total) - num(v.paid)),
        lowStock: products.filter((p) => num(p.stock) <= num(p.lowStockAt)).length,
        totalProducts: products.length,
        todayInvoices: today.length,
        days,
        methods,
        channels,
        topItems: Object.values(itemMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    }
}
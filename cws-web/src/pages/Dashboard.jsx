import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { IndianRupee, Wallet, Clock, PackageX, Package, Receipt } from 'lucide-react'
import { api } from '@/lib/api'
import StatCard from '@/components/dashboard/StatCard'
import SalesChart from '@/components/dashboard/SalesChart'
import PaymentDonut from '@/components/dashboard/PaymentDonut'
import Card from '@/components/ui/Card'

const sameDay = (a, b) => new Date(a).toDateString() === b.toDateString()

export default function Dashboard() {
    const { t } = useTranslation()
    const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => api.get('/api/invoices') })
    const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => api.get('/api/products') })

    const live = invoices.filter((v) => v.status !== 'CANCELLED')
    const today = live.filter((v) => sameDay(v.createdAt, new Date()))
    const todaySales = today.reduce((s, v) => s + v.total, 0)

    const days = [...Array(7)].map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i))
        return {
            day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
            sales: live.filter((v) => sameDay(v.createdAt, d)).reduce((s, v) => s + v.total, 0),
        }
    })

    const donut = ['CASH', 'UPI', 'CARD'].map((m) => ({ name: m, value: live.filter((v) => v.method === m).reduce((s, v) => s + v.total, 0) })).filter((d) => d.value > 0)

    const stats = [
        { key: 'todaySales', value: todaySales, prefix: '₹', icon: IndianRupee, tint: 'bg-blue-500' },
        { key: 'todayCollection', value: todaySales, prefix: '₹', icon: Wallet, tint: 'bg-emerald-500' },
        { key: 'outstanding', value: 0, prefix: '₹', icon: Clock, tint: 'bg-rose-500' },
        { key: 'lowStock', value: products.filter((p) => p.stock <= p.lowStockAt).length, icon: PackageX, tint: 'bg-amber-500' },
        { key: 'totalProducts', value: products.length, icon: Package, tint: 'bg-purple-500' },
        { key: 'todayInvoices', value: today.length, icon: Receipt, tint: 'bg-sky-500' },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-extrabold">{t('dashboard')} 👋</h1>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                {stats.map((s) => <StatCard key={s.key} label={t(s.key)} {...s} />)}
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
                <Card className="p-4"><p className="font-extrabold text-sm mb-2">📈 Sales — Last 7 Days</p><SalesChart data={days} /></Card>
                <Card className="p-4"><p className="font-extrabold text-sm mb-2">💳 Payment Split</p>{donut.length ? <PaymentDonut data={donut} /> : <p className="text-mut text-sm py-16 text-center">No payments yet</p>}</Card>
            </div>
        </div>
    )
}
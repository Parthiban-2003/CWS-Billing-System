import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { IndianRupee, Wallet, Clock, PackageX, Package, Receipt } from 'lucide-react'
import { api } from '@/lib/api'
import StatCard from '@/components/dashboard/StatCard'
import SalesChart from '@/components/dashboard/SalesChart'
import PaymentDonut from '@/components/dashboard/PaymentDonut'
import Card from '@/components/ui/Card'
import { inr } from '@/lib/utils'

export default function Dashboard() {
    const { t } = useTranslation()
    const { data: d, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/api/dashboard') })

    if (isLoading || !d) {
        return <div className="text-mut p-10">Loading dashboard…</div>
    }

    const stats = [
        { key: 'todaySales', value: d.todaySales, prefix: '₹', icon: IndianRupee, tint: 'bg-blue-500' },
        { key: 'todayCollection', value: d.todayCollection, prefix: '₹', icon: Wallet, tint: 'bg-emerald-500' },
        { key: 'outstanding', value: d.outstanding, prefix: '₹', icon: Clock, tint: 'bg-rose-500' },
        { key: 'lowStock', value: d.lowStock, icon: PackageX, tint: 'bg-amber-500' },
        { key: 'totalProducts', value: d.totalProducts, icon: Package, tint: 'bg-purple-500' },
        { key: 'todayInvoices', value: d.todayInvoices, icon: Receipt, tint: 'bg-sky-500' },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-extrabold">{t('dashboard')} 👋</h1>

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
                {stats.map((s) => <StatCard key={s.key} label={t(s.key)} {...s} />)}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                <Card className="p-4">
                    <p className="font-extrabold text-sm mb-2">📈 Sales — Last 7 Days</p>
                    <SalesChart data={d.days} />
                </Card>
                <Card className="p-4">
                    <p className="font-extrabold text-sm mb-2">💳 Payment Split</p>
                    {d.methods.length > 0
                        ? <PaymentDonut data={d.methods} />
                        : <p className="text-mut text-sm py-16 text-center">No payments yet</p>}
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                <Card className="p-4">
                    <p className="font-extrabold text-sm mb-3">🔥 Top Items</p>
                    <div className="space-y-2">
                        {d.topItems.slice(0, 5).map((i, idx) => (
                            <div key={i.name} className="flex justify-between items-center text-sm">
                                <span><b className="text-primary mr-2">#{idx + 1}</b>{i.name}</span>
                                <span className="text-mut">{i.qty}× · <b className="text-ink">{inr(i.revenue)}</b></span>
                            </div>
                        ))}
                        {d.topItems.length === 0 && <p className="text-mut text-xs text-center py-4">No sales yet</p>}
                    </div>
                </Card>
                <Card className="p-4">
                    <p className="font-extrabold text-sm mb-3">🍽 vs 🥡 Channel Split</p>
                    {d.channels.length > 0
                        ? <PaymentDonut data={d.channels} />
                        : <p className="text-mut text-sm py-16 text-center">No orders yet</p>}
                </Card>
            </div>
        </div>
    )
}
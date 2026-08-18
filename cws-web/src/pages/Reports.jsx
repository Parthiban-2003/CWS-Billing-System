import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import RangePicker from '@/components/reports/RangePicker'
import ReportTable from '@/components/reports/ReportTable'
import { inr, cn } from '@/lib/utils'

const TABS = ['Summary', 'Daily', 'Hourly', 'Items', 'Categories', 'Payments', 'GST', 'Voids']

export default function Reports() {
    const [range, setRange] = useState('7')
    const [tab, setTab] = useState('Summary')

    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices'],
        queryFn: () => api.get('/api/invoices'),
    })
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => api.get('/api/products'),
    })
    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: () => api.get('/api/settings'),
    })

    // ✅ GST rate DB-la irundhu (hardcoded ILLA!)
    const taxPct = Number(settings?.taxPct || 0)

    const live = useMemo(() => {
        const from = new Date()
        from.setDate(from.getDate() - (Number(range) - 1))
        from.setHours(0, 0, 0, 0)
        return invoices.filter((v) => new Date(v.createdAt) >= from)
    }, [invoices, range])

    const ok = live.filter((v) => v.status !== 'CANCELLED')
    const sales = ok.reduce((s, v) => s + v.total, 0)
    const due = ok.reduce((s, v) => s + (v.total - v.paid), 0)

    const catOf = useMemo(
        () => Object.fromEntries(products.map((p) => [p.id, p.category || 'Other'])),
        [products]
    )

    const { cols, rows, right } = useMemo(() => {
        switch (tab) {
            case 'Daily': {
                const m = {}
                ok.forEach((v) => {
                    const d = new Date(v.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                    })
                    m[d] = m[d] || [d, 0, 0, 0]
                    m[d][1]++
                    m[d][2] += v.discount
                    m[d][3] += v.total
                })
                return {
                    cols: ['Date', 'Bills', 'Discount', 'Sales'],
                    right: ['Bills', 'Discount', 'Sales'],
                    rows: Object.values(m).map((r) => [r[0], r[1], inr(r[2]), inr(r[3])]),
                }
            }
            case 'Hourly': {
                const m = {}
                ok.forEach((v) => {
                    const k = `${String(new Date(v.createdAt).getHours()).padStart(2, '0')}:00`
                    m[k] = m[k] || [k, 0, 0]
                    m[k][1]++
                    m[k][2] += v.total
                })
                return {
                    cols: ['Hour', 'Bills', 'Sales'],
                    right: ['Bills', 'Sales'],
                    rows: Object.values(m)
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map((r) => [r[0], r[1], inr(r[2])]),
                }
            }
            case 'Items': {
                const m = {}
                ok.forEach((v) =>
                    v.items.forEach((i) => {
                        m[i.name] = m[i.name] || [i.name, 0, 0]
                        m[i.name][1] += i.qty
                        m[i.name][2] += i.amount
                    })
                )
                return {
                    cols: ['Item', 'Qty', 'Revenue'],
                    right: ['Qty', 'Revenue'],
                    rows: Object.values(m)
                        .sort((a, b) => b[2] - a[2])
                        .map((r) => [r[0], r[1], inr(r[2])]),
                }
            }
            case 'Categories': {
                const m = {}
                ok.forEach((v) =>
                    v.items.forEach((i) => {
                        const c = catOf[i.productId] || 'Other'
                        m[c] = m[c] || [c, 0, 0]
                        m[c][1] += i.qty
                        m[c][2] += i.amount
                    })
                )
                return {
                    cols: ['Category', 'Qty', 'Revenue'],
                    right: ['Qty', 'Revenue'],
                    rows: Object.values(m)
                        .sort((a, b) => b[2] - a[2])
                        .map((r) => [r[0], r[1], inr(r[2])]),
                }
            }
            case 'Payments': {
                const m = {}
                ok.forEach((v) => {
                    m[v.method] = m[v.method] || [v.method, 0, 0]
                    m[v.method][1]++
                    m[v.method][2] += v.paid
                })
                return {
                    cols: ['Method', 'Bills', 'Collected'],
                    right: ['Bills', 'Collected'],
                    rows: Object.values(m).map((r) => [r[0], r[1], inr(r[2])]),
                }
            }
            case 'GST': {
                const total = ok.reduce((s, v) => s + v.total, 0)
                const rate = taxPct > 0 ? taxPct : 5
                const taxable = total / (1 + rate / 100)
                return {
                    cols: ['Rate', 'Taxable', 'Tax', 'Total'],
                    right: ['Taxable', 'Tax', 'Total'],
                    rows: [[`${rate}%`, inr(taxable), inr(total - taxable), inr(total)]],
                }
            }
            case 'Voids': {
                const voids = live
                    .filter((v) => v.status === 'CANCELLED')
                    .map((v) => [
                        `#${v.number}`,
                        new Date(v.createdAt).toLocaleDateString('en-IN'),
                        'Cancelled',
                        inr(v.total),
                    ])
                const discs = ok
                    .filter((v) => v.discount > 0)
                    .map((v) => [
                        `#${v.number}`,
                        new Date(v.createdAt).toLocaleDateString('en-IN'),
                        `Discount ${inr(v.discount)}`,
                        inr(v.total),
                    ])
                return {
                    cols: ['Inv', 'Date', 'Type', 'Amount'],
                    right: ['Amount'],
                    rows: [...voids, ...discs],
                }
            }
            default:
                return { cols: [], rows: [], right: [] }
        }
    }, [tab, ok, catOf, taxPct])

    const exportCsv = () => {
        const csv = [cols, ...rows].map((r) => r.join(',')).join('\n')
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
        a.download = `${tab}-report.csv`
        a.click()
        toast.success('Report exported 📥')
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-extrabold">📈 Reports</h1>
                <div className="flex gap-2 items-center">
                    <RangePicker range={range} setRange={setRange} />
                    <Button variant="soft" onClick={exportCsv}>
                        <Download size={15} className="inline mr-1" />
                        CSV
                    </Button>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border',
                            tab === t
                                ? 'bg-primary text-bg border-primary'
                                : 'bg-card text-mut border-line'
                        )}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Summary' ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                    <Sum label="Sales" v={inr(sales)} />
                    <Sum label="Bills" v={ok.length} />
                    <Sum label="Avg Bill" v={inr(ok.length ? sales / ok.length : 0)} />
                    <Sum label="Discount Given" v={inr(ok.reduce((s, v) => s + v.discount, 0))} />
                    <Sum label="Cancelled" v={live.length - ok.length} />
                    <Sum label="Outstanding" v={inr(due)} red />
                </div>
            ) : (
                <ReportTable cols={cols} rows={rows} right={right} />
            )}
        </div>
    )
}

function Sum({ label, v, red }) {
    return (
        <Card className="p-4">
            <p className="text-xs font-bold text-mut">{label}</p>
            <p className={cn('mt-1 text-xl font-extrabold', red && 'text-rose-400')}>{v}</p>
        </Card>
    )
}
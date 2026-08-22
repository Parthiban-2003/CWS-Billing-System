import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import { inr, cn } from '@/lib/utils'

const RANGES = [
    { id: '7', l: '7 Days' },
    { id: '30', l: '30 Days' },
    { id: '90', l: '90 Days' },
]

export default function ProfitLoss() {
    const [range, setRange] = useState('30')
    const { data: p, isLoading } = useQuery({
        queryKey: ['pnl', range],
        queryFn: () => api.get(`/api/pnl?days=${range}`),
    })

    if (isLoading || !p) {
        return <div className="text-mut p-10 text-center">Calculating P&L…</div>
    }

    const health =
        p.margin >= 20
            ? { l: 'HEALTHY 🟢', c: 'text-emerald-400 bg-emerald-500/15' }
            : p.margin >= 10
                ? { l: 'TIGHT 🟠', c: 'text-amber-400 bg-amber-500/15' }
                : { l: 'DANGER 🔴', c: 'text-rose-400 bg-rose-500/15' }

    return (
        <div className="space-y-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-extrabold">💰 Profit & Loss</h1>
                <div className="flex gap-2">
                    {RANGES.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => setRange(r.id)}
                            className={cn(
                                'rounded-full px-3.5 py-1.5 text-xs font-bold border transition',
                                range === r.id
                                    ? 'bg-primary text-bg border-primary'
                                    : 'bg-card text-mut border-line hover:border-primary/40'
                            )}
                        >
                            {r.l}
                        </button>
                    ))}
                </div>
            </div>

            {/* 📊 P&L STATEMENT */}
            <Card className="p-6 space-y-2 text-sm">
                <Row l={`Revenue (${p.bills} bills)`} v={inr(p.revenue)} bold />
                <Row
                    l="− Food Cost (Ingredients + Wastage)"
                    v={'− ' + inr(p.foodCost)}
                    red
                    sub={`(${p.foodPct}% of sales)`}
                />
                <div className="border-t border-line my-2" />
                <Row l="= GROSS PROFIT" v={inr(p.grossProfit)} bold green />

                <Row l="− Staff Cost" v={'− ' + inr(p.staffCost)} red sub={`(${p.staffPct}%)`} />
                <Row l="− Operating Expenses" v={'− ' + inr(p.expenses)} red />

                <div className="border-t-2 border-ink my-3" />

                <div className="flex justify-between items-center text-lg font-extrabold">
                    <span>NET PROFIT</span>
                    <span className={p.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {inr(p.netProfit)}
                    </span>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <span className="text-mut text-xs font-bold">PROFIT MARGIN</span>
                    <span className={cn('text-xs font-extrabold rounded-full px-3 py-1', health.c)}>
                        {p.margin}% · {health.l}
                    </span>
                </div>
            </Card>

            {/* 💡 INSIGHTS */}
            <div className="grid sm:grid-cols-3 gap-3">
                <Card className="p-4 text-center">
                    <p className="text-xs font-bold text-mut">Avg Bill Value</p>
                    <p className="text-xl font-extrabold mt-1">
                        {inr(p.bills ? p.revenue / p.bills : 0)}
                    </p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-xs font-bold text-mut">Daily Revenue</p>
                    <p className="text-xl font-extrabold mt-1">{inr(p.revenue / p.days)}</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-xs font-bold text-mut">Daily Profit</p>
                    <p className="text-xl font-extrabold mt-1 text-emerald-400">
                        {inr(p.netProfit / p.days)}
                    </p>
                </Card>
            </div>
        </div>
    )
}

function Row({ l, v, bold, red, green, sub }) {
    return (
        <div className="flex justify-between items-center">
            <span className={cn(bold && 'font-extrabold')}>
                {l} {sub && <span className="text-[10px] text-mut ml-1">{sub}</span>}
            </span>
            <span
                className={cn(
                    bold && 'font-extrabold',
                    red && 'text-rose-400',
                    green && 'text-emerald-400'
                )}
            >
                {v}
            </span>
        </div>
    )
}
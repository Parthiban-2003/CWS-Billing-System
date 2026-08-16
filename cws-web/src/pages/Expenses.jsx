import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ExpenseModal from '@/components/expenses/ExpenseModal'
import { EXPENSE_CATS } from '@/config/expenseCats'
import { inr, cn } from '@/lib/utils'

const catOf = (id) => EXPENSE_CATS.find((c) => c.id === id) ?? { label: id, icon: '📦' }

export default function Expenses() {
    const [addOpen, setAddOpen] = useState(false)
    const [filter, setFilter] = useState('ALL')
    const [del, setDel] = useState(null)
    const qc = useQueryClient()
    const { data: expenses = [] } = useQuery({ queryKey: ['expenses'], queryFn: () => api.get('/api/expenses') })

    const monthStart = useMemo(() => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d }, [])
    const monthExp = expenses.filter((e) => new Date(e.date) >= monthStart)
    const monthTotal = monthExp.reduce((s, e) => s + e.amount, 0)
    const todayTotal = expenses
        .filter((e) => new Date(e.date).toDateString() === new Date().toDateString())
        .reduce((s, e) => s + e.amount, 0)

    const byCat = useMemo(() => {
        const m = {}
        monthExp.forEach((e) => { m[e.category] = (m[e.category] || 0) + e.amount })
        return m
    }, [monthExp])
    const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]

    const list = filter === 'ALL' ? expenses : expenses.filter((e) => e.category === filter)

    const remove = async () => {
        await api.delete(`/api/expenses/${del}`)
        toast('Expense deleted 🗑')
        qc.invalidateQueries({ queryKey: ['expenses'] })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold">💸 Expenses</h1>
                <Button onClick={() => setAddOpen(true)}><Plus size={16} className="inline mr-1" />Add Expense</Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <Card className="p-4"><p className="text-xs font-bold text-mut">Today</p><p className="text-xl font-extrabold text-rose-400 mt-1">{inr(todayTotal)}</p></Card>
                <Card className="p-4"><p className="text-xs font-bold text-mut">This Month</p><p className="text-xl font-extrabold mt-1">{inr(monthTotal)}</p></Card>
                <Card className="p-4"><p className="text-xs font-bold text-mut">Top Category</p><p className="text-sm font-extrabold mt-1">{topCat ? `${catOf(topCat[0]).icon} ${catOf(topCat[0]).label}` : '—'}</p></Card>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setFilter('ALL')}
                    className={cn('shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border', filter === 'ALL' ? 'bg-primary text-bg border-primary' : 'bg-card text-mut border-line')}>
                    All
                </button>
                {EXPENSE_CATS.map((c) => (
                    <button key={c.id} onClick={() => setFilter(c.id)}
                        className={cn('shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border', filter === c.id ? 'bg-primary text-bg border-primary' : 'bg-card text-mut border-line')}>
                        {c.icon} {c.label}{byCat[c.id] ? ` · ${Math.round(byCat[c.id])}` : ''}
                    </button>
                ))}
            </div>

            <Card className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-bg text-mut">
                        <tr>
                            <th className="text-left px-4 py-3">Date</th>
                            <th className="text-left px-4 py-3">Category</th>
                            <th className="text-left px-4 py-3">Description</th>
                            <th className="text-left px-4 py-3">Method</th>
                            <th className="text-right px-4 py-3">Amount</th>
                            <th className="text-right px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((e) => (
                            <tr key={e.id} className="border-t border-line">
                                <td className="px-4 py-3 text-mut">{new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                                <td className="px-4 py-3 font-bold">{catOf(e.category).icon} {catOf(e.category).label}</td>
                                <td className="px-4 py-3">{e.note || '—'}{e.party && <span className="text-mut text-xs"> · {e.party}</span>}</td>
                                <td className="px-4 py-3"><span className="text-[10px] font-extrabold bg-primary-soft text-primary rounded-full px-2 py-0.5">{e.method}</span></td>
                                <td className="px-4 py-3 text-right font-extrabold text-rose-400">{inr(e.amount)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => setDel(e.id)} className="text-mut hover:text-rose-400"><Trash2 size={14} /></button>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-mut">No expenses — add first one! 💸</td></tr>}
                    </tbody>
                </table>
            </Card>

            <ExpenseModal open={addOpen} onClose={() => setAddOpen(false)} />
            <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove}
                title="Delete expense?" message="This expense record will be removed." />
        </div>
    )
}
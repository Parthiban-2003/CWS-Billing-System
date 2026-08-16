import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Pencil } from 'lucide-react'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import AddCustomerModal from '@/components/customers/AddCustomerModal'
import CustomerModal from '@/components/customers/CustomerModal'
import { inr, cn } from '@/lib/utils'

const FILTERS = [
    { id: 'ALL', l: 'All' },
    { id: 'DUE', l: '📒 Due' },
    { id: 'POINTS', l: '⭐ Points' },
    { id: 'CLEARED', l: '✅ Cleared' },
]

export default function Customers() {
    const [addOpen, setAddOpen] = useState(false)
    const [edit, setEdit] = useState(null)
    const [sel, setSel] = useState(null)
    const [q, setQ] = useState('')
    const [filter, setFilter] = useState('ALL')
    const { data: customers = [], refetch } = useQuery({ queryKey: ['customers'], queryFn: () => api.get('/api/customers') })
    const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => api.get('/api/invoices') })

    const dueOf = (id) =>
        invoices.filter((v) => v.customerId === id && v.status !== 'CANCELLED')
            .reduce((s, v) => s + (v.total - v.paid), 0)

    const list = customers
        .filter((c) => `${c.name} ${c.phone || ''}`.toLowerCase().includes(q.toLowerCase()))
        .filter((c) => {
            if (filter === 'DUE') return dueOf(c.id) > 0
            if (filter === 'POINTS') return (c.points || 0) > 0
            if (filter === 'CLEARED') return dueOf(c.id) === 0
            return true
        })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-extrabold">👥 Customers</h1>
                <Button onClick={() => setAddOpen(true)}><Plus size={16} className="inline mr-1" />Add</Button>
            </div>

            {/* 🔍 SEARCH + FILTERS */}
            <div className="flex gap-2 flex-wrap items-center">
                <div className="relative flex-1 min-w-[220px]">
                    <Search size={15} className="absolute left-3 top-3 text-mut" />
                    <input value={q} onChange={(e) => setQ(e.target.value)}
                        placeholder="Search name / mobile…"
                        className="w-full rounded-lg bg-card border border-line pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                <div className="flex gap-2">
                    {FILTERS.map((f) => (
                        <button key={f.id} onClick={() => setFilter(f.id)}
                            className={cn('rounded-full px-3.5 py-1.5 text-xs font-bold border',
                                filter === f.id ? 'bg-primary text-bg border-primary' : 'bg-card text-mut border-line')}>
                            {f.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {list.map((c) => {
                    const due = dueOf(c.id)
                    return (
                        <button key={c.id} onClick={() => setSel(c)}
                            className="text-left bg-card border border-line rounded-xl p-4 hover:border-primary/50 transition">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary-soft text-primary grid place-items-center font-extrabold">
                                    {c.name[0]}
                                </div>
                                <div className="flex-1">
                                    <p className="font-extrabold">{c.name}</p>
                                    <p className="text-[11px] text-mut">{c.phone || '—'}</p>
                                </div>
                                <span onClick={(e) => { e.stopPropagation(); setEdit(c) }}
                                    className="text-mut hover:text-primary"><Pencil size={14} /></span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className={due > 0 ? 'text-rose-400 font-extrabold text-sm' : 'text-emerald-400 text-xs font-bold'}>
                                    {due > 0 ? `Due: ${inr(due)}` : 'No dues ✅'}
                                </p>
                                <p className="text-xs font-extrabold text-primary">⭐ {c.points || 0}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
            {list.length === 0 && <p className="text-mut text-center py-12">No customers match 🔍</p>}

            <AddCustomerModal open={addOpen || !!edit} initial={edit} onSaved={refetch}
                onClose={() => { setAddOpen(false); setEdit(null) }} />
            <CustomerModal c={sel} onClose={() => setSel(null)} />
        </div>
    )
}
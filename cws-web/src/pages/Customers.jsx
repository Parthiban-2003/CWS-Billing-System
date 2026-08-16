import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import AddCustomerModal from '@/components/customers/AddCustomerModal'
import CustomerModal from '@/components/customers/CustomerModal'
import { inr } from '@/lib/utils'

export default function Customers() {
    const [addOpen, setAddOpen] = useState(false)
    const [sel, setSel] = useState(null)
    const { data: customers = [], refetch } = useQuery({ queryKey: ['customers'], queryFn: () => api.get('/api/customers') })
    const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => api.get('/api/invoices') })

    const dueOf = (id) =>
        invoices.filter((v) => v.customerId === id && v.status !== 'CANCELLED')
            .reduce((s, v) => s + (v.total - v.paid), 0)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold">👥 Customers</h1>
                <Button onClick={() => setAddOpen(true)}><Plus size={16} className="inline mr-1" />Add</Button>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {customers.map((c) => {
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
                            </div>
                            <p className={due > 0 ? 'text-rose-400 font-extrabold text-sm mt-2' : 'text-emerald-400 text-xs font-bold mt-2'}>
                                {due > 0 ? `Due: ${inr(due)}` : 'No dues ✅'}
                            </p>
                        </button>
                    )
                })}
            </div>

            <AddCustomerModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={refetch} />
            <CustomerModal c={sel} onClose={() => setSel(null)} />
        </div>
    )
}
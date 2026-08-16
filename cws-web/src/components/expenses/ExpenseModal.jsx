import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'
import { EXPENSE_CATS } from '@/config/expenseCats'
import { cn } from '@/lib/utils'

const BLANK = { category: 'GROCERY', amount: '', method: 'CASH', note: '', party: '' }

export default function ExpenseModal({ open, onClose, initial }) {
    const [f, setF] = useState(BLANK)
    const qc = useQueryClient()

    useEffect(() => {
        if (open) {
            setF(initial
                ? { category: initial.category, amount: String(initial.amount), method: initial.method, note: initial.note || '', party: initial.party || '' }
                : BLANK)
        }
    }, [open, initial])

    const save = async () => {
        if (initial) await api.patch(`/api/expenses/${initial.id}`, f)
        else await api.post('/api/expenses', f)
        toast.success(initial ? 'Expense updated ✏️' : 'Expense saved ✅')
        qc.invalidateQueries({ queryKey: ['expenses'] })
        onClose()
    }

    return (
        <Modal open={open} onClose={onClose} title={initial ? '✏️ Edit Expense' : '💸 Add Expense'} wide>
            <div className="space-y-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {EXPENSE_CATS.map((c) => (
                        <button key={c.id} onClick={() => setF({ ...f, category: c.id })}
                            className={cn('rounded-lg border p-2 text-center text-[10px] font-bold transition',
                                f.category === c.id ? 'border-primary bg-primary-soft text-primary' : 'border-line text-mut')}>
                            <span className="block text-lg mb-0.5">{c.icon}</span>{c.label}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Amount ₹" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
                    <select value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}
                        className="rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none">
                        {['CASH', 'UPI', 'BANK'].map((m) => <option key={m}>{m}</option>)}
                    </select>
                </div>
                <Input placeholder="Description" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
                <Input placeholder="Party / Supplier (optional)" value={f.party} onChange={(e) => setF({ ...f, party: e.target.value })} />
                <Button className="w-full" disabled={!f.amount} onClick={save}>{initial ? 'Update' : 'Save'}</Button>
            </div>
        </Modal>
    )
}
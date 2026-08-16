import { useState } from 'react'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Banknote, QrCode, CreditCard, BookMinus } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useCartStore } from '@/stores/useCartStore'
import { api } from '@/lib/api'
import { inr, cn } from '@/lib/utils'

const METHODS = [
    { id: 'CASH', label: 'Cash', icon: Banknote },
    { id: 'UPI', label: 'UPI', icon: QrCode },
    { id: 'CARD', label: 'Card', icon: CreditCard },
    { id: 'CREDIT', label: 'Udhaar', icon: BookMinus },
]

export default function PaymentModal({ open, onClose, totals }) {
    const [method, setMethod] = useState('CASH')
    const [received, setReceived] = useState('')
    const [customerId, setCustomerId] = useState('')
    const clear = useCartStore((s) => s.clear)
    const qc = useQueryClient()
    const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: () => api.get('/api/customers') })

    const recv = received === '' ? (method === 'CREDIT' ? 0 : totals.total) : Number(received)
    const paid = Math.min(recv, totals.total)
    const due = totals.total - paid
    const change = method === 'CASH' ? Math.max(0, recv - totals.total) : 0

    const confirm = async () => {
        if (due > 0 && !customerId) {
            toast.error('Udhaar/partial-ku customer select pannanum! 👤')
            return
        }
        const { items, table, orderType } = useCartStore.getState()
        try {
            await api.post('/api/invoices', { items, orderType, table, method, totals, paid, customerId: customerId || null })
            if (orderType === 'DINE_IN' && items.length)
                if (orderType === 'DINE_IN' && items.length) {
                    await api.post('/api/kots', {
                        table: table || '—',
                        items: items.map((i) => ({ name: i.name, qty: i.qty })),
                    })
                }
            qc.invalidateQueries({ queryKey: ['products'] })
            qc.invalidateQueries({ queryKey: ['invoices'] })
            qc.invalidateQueries({ queryKey: ['customers'] })
            toast.success(due > 0 ? `Saved · Due ${inr(due)} 📒` : `Invoice saved · ${inr(totals.total)} ✅`)
            clear(); setReceived(''); setCustomerId(''); onClose()
        } catch (e) {
            console.error(e)
            toast.error('Invoice save failed ❌')
        }
    }

    return (
        <Modal open={open} onClose={onClose} title="💳 Payment">
            <p className="text-center text-3xl font-extrabold text-primary mb-4">{inr(totals.total)}</p>

            <div className="grid grid-cols-4 gap-2 mb-4">
                {METHODS.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setMethod(id)}
                        className={cn('rounded-xl border p-2.5 flex flex-col items-center gap-1 text-[11px] font-bold transition',
                            method === id ? 'border-primary bg-primary-soft text-primary' : 'border-line text-mut')}>
                        <Icon size={17} /> {label}
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                <label className="text-[11px] font-bold text-mut">Amount received ₹
                    <input type="number" value={received} onChange={(e) => setReceived(e.target.value)}
                        placeholder={method === 'CREDIT' ? '0 (full udhaar)' : String(totals.total)}
                        className="mt-1 w-full rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </label>
                <div className="flex gap-2">
                    {[totals.total, 500, 1000, 2000].map((v, i) => (
                        <button key={i} onClick={() => setReceived(String(v))}
                            className="flex-1 rounded-lg bg-card border border-line py-1.5 text-xs font-bold hover:border-primary">
                            {v === totals.total ? 'Exact' : `₹${v}`}
                        </button>
                    ))}
                </div>

                {change > 0 && <p className="text-sm font-bold text-emerald-400">Change: {inr(change)}</p>}
                {due > 0 && (
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-rose-400">Due (udhaar): {inr(due)}</p>
                        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none">
                            <option value="">👤 Select customer… *</option>
                            {customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <Button className="w-full mt-4" onClick={confirm}>Confirm Payment ✅</Button>
        </Modal>
    )
}
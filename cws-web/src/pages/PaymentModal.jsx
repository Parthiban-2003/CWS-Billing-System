import { useState } from 'react'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Banknote, QrCode, CreditCard, BookMinus, Plus, X, Search, UserPlus } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
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
    const [custSearch, setCustSearch] = useState('')
    const [showList, setShowList] = useState(false)
    const [quickAdd, setQuickAdd] = useState(false)
    const [qa, setQa] = useState({ name: '', phone: '' })
    const [split, setSplit] = useState(false)
    const [rows, setRows] = useState([{ method: 'CASH', amount: '' }, { method: 'UPI', amount: '' }])
    const [redeem, setRedeem] = useState('')
    const clear = useCartStore((s) => s.clear)
    const qc = useQueryClient()
    const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: () => api.get('/api/customers') })
    const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => api.get('/api/settings') })

    const customer = customers.find((c) => c.id === customerId)
    const maxPts = customer?.points || 0
    const redeemPts = Math.min(Number(redeem) || 0, maxPts)
    const finalTotal = Math.max(0, totals.total - redeemPts)

    const filtered = customers.filter((c) =>
        `${c.name} ${c.phone || ''}`.toLowerCase().includes(custSearch.toLowerCase())
    )

    const recv = received === '' ? (method === 'CREDIT' ? 0 : finalTotal) : Number(received)
    const paid = split ? rows.reduce((s, r) => s + (Number(r.amount) || 0), 0) : Math.min(recv, finalTotal)
    const due = finalTotal - paid
    const change = !split && method === 'CASH' ? Math.max(0, recv - finalTotal) : 0

    const quickSave = async () => {
        const c = await api.post('/api/customers', qa)
        toast.success(`${c.name} added ✅`)
        qc.invalidateQueries({ queryKey: ['customers'] })
        setCustomerId(c.id)
        setQuickAdd(false)
        setQa({ name: '', phone: '' })
        setShowList(false)
    }

    const confirm = async () => {
        if (due > 0 && !customerId) { toast.error('Udhaar/partial-ku customer select pannanum! 👤'); return }
        if (split && Math.abs(paid - finalTotal) > 0.5) { toast.error(`Split total ${inr(paid)} ≠ ${inr(finalTotal)}!`); return }
        const { items, table, orderType, itemDiscount, serviceCharge } = useCartStore.getState()
        try {
            await api.post('/api/invoices', {
                items: items.map((i) => ({
                    id: i.isCombo ? null : i.id, name: i.name, qty: i.qty, price: i.unitPrice,
                    variantName: i.variant?.name || null,
                    modifiers: i.modifiers.map((m) => m.name).join(', ') || null,
                    isCombo: i.isCombo,
                })),
                orderType, table, method,
                payments: split ? rows.map((r) => ({ method: r.method, amount: Number(r.amount) || 0 })) : [{ method, amount: paid }],
                paid,
                customerId: customerId || null,
                redeemPoints: redeemPts,
                discountPct: itemDiscount,
                servicePct: serviceCharge,
                taxPct: settings?.taxPct || 0,
            })
            if (orderType === 'DINE_IN' && items.length) {
                await api.post('/api/kots', { table: table || '—', items: items.map((i) => ({ name: i.name, qty: i.qty })) }).catch(() => { })
            }
            qc.invalidateQueries({ queryKey: ['products'] })
            qc.invalidateQueries({ queryKey: ['invoices'] })
            qc.invalidateQueries({ queryKey: ['customers'] })
            toast.success(due > 0 ? `Saved · Due ${inr(due)} 📒` : `Invoice saved · ${inr(finalTotal)} ✅`)
            clear(); setReceived(''); setCustomerId(''); setRedeem(''); setCustSearch('')
            onClose()
        } catch (e) {
            console.error(e)
            toast.error('Invoice save failed ❌ — backend terminal paaru')
        }
    }

    return (
        <Modal open={open} onClose={onClose} title="💳 Payment">
            <p className="text-center text-3xl font-extrabold text-primary mb-1">{inr(finalTotal)}</p>
            {redeemPts > 0 && <p className="text-center text-xs font-bold text-emerald-400 mb-2">⭐ {redeemPts} points redeemed</p>}

            <div className="grid grid-cols-4 gap-2 mb-3">
                {METHODS.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setMethod(id)}
                        className={cn('rounded-xl border p-2.5 flex flex-col items-center gap-1 text-[11px] font-bold transition',
                            method === id ? 'border-primary bg-primary-soft text-primary' : 'border-line text-mut')}>
                        <Icon size={17} /> {label}
                    </button>
                ))}
            </div>

            {/* 👤 CUSTOMER PICKER (search + quick add) */}
            <div className="space-y-2 mb-3">
                {customer ? (
                    <div className="flex items-center justify-between rounded-lg bg-primary-soft border border-primary/30 px-3 py-2">
                        <div>
                            <p className="text-sm font-extrabold">👤 {customer.name}</p>
                            <p className="text-[10px] text-mut">{customer.phone || '—'} · ⭐ {maxPts} points</p>
                        </div>
                        <button onClick={() => setCustomerId('')} className="text-mut hover:text-rose-400"><X size={14} /></button>
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-3 text-mut" />
                            <input value={custSearch}
                                onChange={(e) => { setCustSearch(e.target.value); setShowList(true) }}
                                onFocus={() => setShowList(true)}
                                placeholder="Customer search (name / mobile)…"
                                className="w-full rounded-lg bg-bg border border-line pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary" />
                        </div>
                        {showList && filtered.length > 0 && (
                            <div className="max-h-32 overflow-y-auto rounded-lg border border-line bg-card divide-y divide-line">
                                {filtered.map((c) => (
                                    <button key={c.id}
                                        onClick={() => { setCustomerId(c.id); setShowList(false); setCustSearch('') }}
                                        className="w-full flex justify-between px-3 py-2 text-sm hover:bg-primary-soft">
                                        <span className="font-bold">{c.name}</span>
                                        <span className="text-mut text-xs">{c.phone} · ⭐{c.points}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <button onClick={() => setQuickAdd(!quickAdd)}
                            className="text-[11px] font-bold text-primary hover:underline">
                            <UserPlus size={12} className="inline mr-1" />New customer? Quick add
                        </button>
                        {quickAdd && (
                            <div className="flex gap-2">
                                <Input placeholder="Name" value={qa.name} onChange={(e) => setQa({ ...qa, name: e.target.value })} />
                                <Input placeholder="Mobile" value={qa.phone} onChange={(e) => setQa({ ...qa, phone: e.target.value })} />
                                <Button disabled={!qa.name} onClick={quickSave}>Add</Button>
                            </div>
                        )}
                    </>
                )}

                {/* ⭐ REDEEM */}
                {customer && settings?.loyaltyEnabled && maxPts > 0 && (
                    <div>
                        <p className="text-xs font-bold text-mut mb-1">⭐ {maxPts} points available (1 pt = ₹1)</p>
                        <Input type="number" placeholder="Redeem points" value={redeem} onChange={(e) => setRedeem(e.target.value)} />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                {!split && (
                    <>
                        <input type="number" value={received} onChange={(e) => setReceived(e.target.value)}
                            placeholder={method === 'CREDIT' ? '0 (full udhaar)' : String(finalTotal)}
                            className="w-full rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none focus:border-primary" />
                        <div className="flex gap-2">
                            {[finalTotal, 500, 1000, 2000].map((v, i) => (
                                <button key={i} onClick={() => setReceived(String(v))}
                                    className="flex-1 rounded-lg bg-card border border-line py-1.5 text-xs font-bold hover:border-primary">
                                    {v === finalTotal ? 'Exact' : `₹${v}`}
                                </button>
                            ))}
                        </div>
                        {change > 0 && <p className="text-sm font-bold text-emerald-400">Change: {inr(change)}</p>}
                    </>
                )}

                {split && (
                    <div className="space-y-1.5">
                        {rows.map((r, i) => (
                            <div key={i} className="flex gap-2">
                                <select value={r.method} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, method: e.target.value } : x)))}
                                    className="rounded-lg bg-bg border border-line px-2 py-2 text-xs font-bold outline-none">
                                    {['CASH', 'UPI', 'CARD'].map((m) => <option key={m}>{m}</option>)}
                                </select>
                                <Input type="number" placeholder="Amount" value={r.amount}
                                    onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} />
                                <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-mut hover:text-rose-400"><X size={14} /></button>
                            </div>
                        ))}
                        <button onClick={() => setRows([...rows, { method: 'CASH', amount: '' }])}
                            className="text-[11px] font-bold text-primary hover:underline"><Plus size={12} className="inline" /> Add row</button>
                        <p className={cn('text-xs font-bold', Math.abs(paid - finalTotal) < 0.5 ? 'text-emerald-400' : 'text-rose-400')}>
                            Split: {inr(paid)} / {inr(finalTotal)}
                        </p>
                    </div>
                )}

                <label className="flex items-center gap-2 text-xs font-bold text-mut">
                    <input type="checkbox" checked={split} onChange={(e) => setSplit(e.target.checked)} />
                    💳 Split payment
                </label>

                {due > 0 && <p className="text-sm font-bold text-rose-400">Due (udhaar): {inr(due)}</p>}
            </div>

            <Button className="w-full mt-4" onClick={confirm}>Confirm Payment ✅</Button>
        </Modal>
    )
}
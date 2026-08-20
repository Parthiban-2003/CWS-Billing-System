import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const REASONS = ['EXPIRED', 'DAMAGED', 'SPOILED', 'OTHER']

const REASON_STYLE = {
    EXPIRED: 'bg-rose-500/15 text-rose-400',
    DAMAGED: 'bg-amber-500/15 text-amber-400',
    SPOILED: 'bg-purple-500/15 text-purple-400',
    OTHER: 'bg-sky-500/15 text-sky-400',
}

export default function WastageTab() {
    const { data: wastage = [] } = useQuery({
        queryKey: ['wastage'],
        queryFn: () => api.get('/api/wastage'),
    })
    const { data: ingredients = [] } = useQuery({
        queryKey: ['ingredients'],
        queryFn: () => api.get('/api/ingredients'),
    })
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => api.get('/api/products'),
    })
    const qc = useQueryClient()

    const [open, setOpen] = useState(false)
    const [f, setF] = useState({
        itemType: 'INGREDIENT',
        ingredientId: '',
        productId: '',
        qty: '',
        reason: 'EXPIRED',
        note: '',
    })

    const save = async () => {
        await api.post('/api/wastage', {
            ...f,
            qty: Number(f.qty),
            ingredientId: f.itemType === 'INGREDIENT' ? f.ingredientId || null : null,
            productId: f.itemType === 'PRODUCT' ? f.productId || null : null,
        })
        toast.success('Wastage recorded 🗑 — stock auto-decrement aayidhu!')
        qc.invalidateQueries({ queryKey: ['wastage'] })
        qc.invalidateQueries({ queryKey: ['ingredients'] })
        qc.invalidateQueries({ queryKey: ['products'] })
        setOpen(false)
        setF({ itemType: 'INGREDIENT', ingredientId: '', productId: '', qty: '', reason: 'EXPIRED', note: '' })
    }

    const valid =
        f.qty &&
        (f.itemType === 'INGREDIENT' ? f.ingredientId : f.productId)

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button variant="danger" onClick={() => setOpen(true)}>
                    <Plus size={15} className="inline mr-1" /> Record Wastage
                </Button>
            </div>

            <Card className="p-4 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-mut text-xs border-b border-line">
                            <th className="py-2">Date</th>
                            <th>Item</th>
                            <th>Type</th>
                            <th className="text-right">Qty</th>
                            <th>Reason</th>
                            <th>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wastage.map((w) => (
                            <tr key={w.id} className="border-b border-line/50">
                                <td className="py-2.5 text-mut">
                                    {new Date(w.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                </td>
                                <td className="font-bold">
                                    {w.itemType === 'INGREDIENT' ? `🥬 ${w.ingredient?.name || '—'}` : `📦 ${w.product?.name || '—'}`}
                                </td>
                                <td className="text-mut text-xs">{w.itemType}</td>
                                <td className="text-right font-extrabold">
                                    {w.qty} {w.itemType === 'INGREDIENT' ? w.ingredient?.unit : ''}
                                </td>
                                <td>
                                    <span className={cn('text-[10px] font-extrabold rounded-full px-2 py-0.5', REASON_STYLE[w.reason])}>
                                        {w.reason}
                                    </span>
                                </td>
                                <td className="text-mut text-xs">{w.note || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {wastage.length === 0 && (
                    <p className="text-mut text-sm text-center py-8">No wastage recorded ✅ (nalla vishayam! 😄)</p>
                )}
            </Card>

            <Modal open={open} onClose={() => setOpen(false)} title="🗑 Record Wastage">
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        {['INGREDIENT', 'PRODUCT'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setF({ ...f, itemType: t })}
                                className={cn(
                                    'rounded-lg border p-2.5 text-xs font-bold',
                                    f.itemType === t ? 'border-primary bg-primary-soft text-primary' : 'border-line text-mut'
                                )}
                            >
                                {t === 'INGREDIENT' ? '🥬 Ingredient' : '📦 Product'}
                            </button>
                        ))}
                    </div>

                    {f.itemType === 'INGREDIENT' ? (
                        <select
                            value={f.ingredientId}
                            onChange={(e) => setF({ ...f, ingredientId: e.target.value })}
                            className="w-full rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none"
                        >
                            <option value="">Select ingredient…</option>
                            {ingredients.map((i) => (
                                <option key={i.id} value={i.id}>
                                    {i.name} ({i.stock} {i.unit})
                                </option>
                            ))}
                        </select>
                    ) : (
                        <select
                            value={f.productId}
                            onChange={(e) => setF({ ...f, productId: e.target.value })}
                            className="w-full rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none"
                        >
                            <option value="">Select product…</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.stock})
                                </option>
                            ))}
                        </select>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder="Qty" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} />
                        <select
                            value={f.reason}
                            onChange={(e) => setF({ ...f, reason: e.target.value })}
                            className="rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none"
                        >
                            {REASONS.map((r) => (
                                <option key={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <Input placeholder="Note (optional)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />

                    <Button className="w-full" disabled={!valid} onClick={save}>
                        Record Wastage 🗑
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
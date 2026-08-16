import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { inr, cn } from '@/lib/utils'

export default function CombosTab() {
    const { data: combos = [] } = useQuery({ queryKey: ['combos'], queryFn: () => api.get('/api/combos') })
    const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => api.get('/api/products') })
    const qc = useQueryClient()
    const [open, setOpen] = useState(false)
    const [f, setF] = useState({ name: '', price: '', items: [] })

    const addItem = (pid) => setF((cur) => {
        const ex = cur.items.find((x) => x.productId === pid)
        return {
            ...cur,
            items: ex ? cur.items.map((x) => (x.productId === pid ? { ...x, qty: x.qty + 1 } : x)) : [...cur.items, { productId: pid, qty: 1 }],
        }
    })

    const save = async () => {
        await api.post('/api/combos', { name: f.name, price: Number(f.price), items: f.items })
        toast.success(`Combo "${f.name}" created 🎁`)
        qc.invalidateQueries({ queryKey: ['combos'] })
        setOpen(false)
        setF({ name: '', price: '', items: [] })
    }

    const toggle = async (c) => {
        await api.patch(`/api/combos/${c.id}`, { isActive: !c.isActive })
        qc.invalidateQueries({ queryKey: ['combos'] })
    }

    const del = async (c) => {
        await api.delete(`/api/combos/${c.id}`)
        toast('Combo deleted')
        qc.invalidateQueries({ queryKey: ['combos'] })
    }

    return (
        <Card className="p-5 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-extrabold">🎁 Combo Offers</h3>
                <Button onClick={() => setOpen(true)}><Plus size={15} className="inline mr-1" />New Combo</Button>
            </div>

            <div className="space-y-2">
                {combos.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-bg border border-line rounded-lg p-3">
                        <div>
                            <p className="font-bold text-sm">🎁 {c.name} · <span className="text-primary">{inr(c.price)}</span></p>
                            <p className="text-[11px] text-mut">{c.items.map((i) => `${i.qty}× ${i.product?.name}`).join(' + ')}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <button onClick={() => toggle(c)}
                                className={cn('text-[10px] font-extrabold rounded-full px-2.5 py-1', c.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400')}>
                                {c.isActive ? 'ACTIVE' : 'OFF'}
                            </button>
                            <button onClick={() => del(c)} className="text-mut hover:text-rose-400"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
                {combos.length === 0 && <p className="text-mut text-sm text-center py-6">No combos yet — create first offer! 🎁</p>}
            </div>

            <Modal open={open} onClose={() => setOpen(false)} title="🎁 Create Combo" wide>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Combo name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                        <Input type="number" placeholder="Combo price ₹" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-mut mb-2">Add products (click to add)</p>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                            {products.map((p) => (
                                <button key={p.id} onClick={() => addItem(p.id)}
                                    className="text-[10px] font-bold bg-card border border-line rounded-full px-2.5 py-1 hover:border-primary">
                                    + {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    {f.items.length > 0 && (
                        <div className="space-y-1 bg-bg border border-line rounded-lg p-3">
                            {f.items.map((x) => {
                                const p = products.find((pp) => pp.id === x.productId)
                                return <p key={x.productId} className="text-xs font-bold">• {x.qty}× {p?.name}</p>
                            })}
                        </div>
                    )}
                    <Button className="w-full" disabled={!f.name || !f.price || f.items.length === 0} onClick={save}>Create Combo</Button>
                </div>
            </Modal>
        </Card>
    )
}
import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2, Pencil, Copy, BookOpen } from 'lucide-react'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { inr, cn } from '@/lib/utils'

export default function ItemCard({ p, onDeleted, onEdit, onRecipe }) {
    const [delOpen, setDelOpen] = useState(false)
    const available = p.isAvailable !== false

    const toggle86 = async () => {
        await api.patch(`/api/products/${p.id}`, { isAvailable: !available })
        toast.success(!available ? `${p.name} available ✅` : `${p.name} marked 86 🚫`)
        onDeleted()
    }

    const duplicate = async () => {
        await api.post('/api/products', {
            name: `${p.name} (Copy)`,
            category: p.category,
            price: p.price,
            stock: p.stock,
            variants: (p.variants || []).map((v) => ({ name: v.name, delta: v.delta })),
            modifiers: (p.modifiers || []).map((m) => ({ name: m.name, delta: m.delta })),
        })
        toast.success(`${p.name} duplicated 📋`)
        onDeleted()
    }

    return (
        <Card className={cn('p-4 space-y-2 transition', !available && 'opacity-50')}>
            {/* HEADER — name + actions */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-extrabold">{p.name}</p>
                    <p className="text-[11px] text-mut">
                        {p.category} · {p.stock} in stock
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* 📖 RECIPE */}
                    <button onClick={onRecipe} title="Recipe" className="text-mut hover:text-accent">
                        <BookOpen size={15} />
                    </button>
                    {/* 📋 DUPLICATE */}
                    <button onClick={duplicate} title="Duplicate" className="text-mut hover:text-accent">
                        <Copy size={15} />
                    </button>
                    {/* ✏️ EDIT */}
                    <button onClick={onEdit} title="Edit" className="text-mut hover:text-primary">
                        <Pencil size={15} />
                    </button>
                    {/* 🗑 DELETE */}
                    <button onClick={() => setDelOpen(true)} title="Delete" className="text-mut hover:text-rose-400">
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* VARIANTS + MODIFIERS CHIPS */}
            {(p.variants?.length > 0 || p.modifiers?.length > 0) && (
                <div className="flex gap-1.5 flex-wrap">
                    {p.variants?.map((v) => (
                        <span
                            key={v.id}
                            className="text-[10px] font-bold bg-primary-soft text-primary rounded-full px-2 py-0.5"
                        >
                            {v.name} {inr(p.price + Number(v.delta))}
                        </span>
                    ))}
                    {p.modifiers?.map((m) => (
                        <span
                            key={m.id}
                            className="text-[10px] font-bold bg-card border border-line text-mut rounded-full px-2 py-0.5"
                        >
                            + {m.name}
                        </span>
                    ))}
                </div>
            )}

            {/* PRICE + 86 TOGGLE */}
            <div className="flex justify-between items-center pt-1">
                <span className="text-primary font-extrabold">{inr(p.price)}</span>
                <button
                    onClick={toggle86}
                    className={cn(
                        'text-[10px] font-extrabold rounded-full px-2.5 py-1',
                        available
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                    )}
                >
                    {available ? 'AVAILABLE' : '86 · OFF'}
                </button>
            </div>

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                open={delOpen}
                onClose={() => setDelOpen(false)}
                onConfirm={async () => {
                    await api.delete(`/api/products/${p.id}`)
                    toast('Item deleted')
                    onDeleted()
                }}
                title="Delete item?"
                message={`${p.name} permanent-ah delete aagum.`}
            />
        </Card>
    )
}
import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2, Pencil } from 'lucide-react'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useMenuStore } from '@/stores/useMenuStore'
import { inr, cn } from '@/lib/utils'

const VARIANTS = { Biryani: ['Small', 'Medium', 'Large'], Beverages: ['Regular', 'Large'] }

export default function ItemCard({ p, onDeleted }) {
    const { unavailable, toggle } = useMenuStore()
    const [delOpen, setDelOpen] = useState(false)
    const isOff = unavailable.includes(p.id)

    return (
        <Card className={cn('p-4 space-y-2 transition', isOff && 'opacity-50')}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-extrabold">{p.name}</p>
                    <p className="text-[11px] text-mut">{p.category} · {p.stock} in stock</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onEdit} className="text-mut hover:text-primary"><Pencil size={15} /></button>
                    <button onClick={() => setDelOpen(true)} className="text-mut hover:text-rose-400"><Trash2 size={15} /></button>
                </div>            </div>

            {VARIANTS[p.category] && (
                <div className="flex gap-1.5">
                    {VARIANTS[p.category].map((v) => (
                        <span key={v} className="text-[10px] font-bold bg-primary-soft text-primary rounded-full px-2 py-0.5">{v}</span>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center pt-1">
                <span className="text-primary font-extrabold">{inr(p.price)}</span>
                <button onClick={() => { toggle(p.id); toast(isOff ? `${p.name} available ✅` : `${p.name} marked 86 (unavailable) 🚫`) }}
                    className={cn('text-[10px] font-extrabold rounded-full px-2.5 py-1',
                        isOff ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400')}>
                    {isOff ? '86 · OFF' : 'AVAILABLE'}
                </button>
            </div>

            <ConfirmDialog open={delOpen} onClose={() => setDelOpen(false)}
                onConfirm={async () => { await api.delete(`/api/products/${p.id}`); toast('Item deleted'); onDeleted() }}
                title="Delete item?" message={`${p.name} permanent-ah delete aagum.`} />
        </Card>
    )
}
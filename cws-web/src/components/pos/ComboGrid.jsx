import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useCartStore } from '@/stores/useCartStore'
import { inr } from '@/lib/utils'

export default function ComboGrid() {
    const add = useCartStore((s) => s.add)
    const { data: combos = [] } = useQuery({ queryKey: ['combos'], queryFn: () => api.get('/api/combos') })
    const active = combos.filter((c) => c.isActive)

    if (active.length === 0) return null

    return (
        <div className="space-y-2">
            <p className="text-xs font-extrabold text-mut">🎁 COMBO OFFERS</p>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {active.map((c) => (
                    <button key={c.id}
                        onClick={() => add({ id: c.id, name: c.name, price: Number(c.price), isCombo: true, comboItems: c.items })}
                        className="text-left bg-gradient-to-br from-primary-soft to-transparent border-2 border-primary/40 rounded-xl p-3.5 hover:border-primary transition active:scale-95">
                        <p className="font-extrabold text-sm">🎁 {c.name}</p>
                        <p className="text-[10px] text-mut mt-1">{c.items.map((i) => `${i.qty}× ${i.product?.name}`).join(' + ')}</p>
                        <p className="text-primary font-extrabold mt-1">{inr(c.price)}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}
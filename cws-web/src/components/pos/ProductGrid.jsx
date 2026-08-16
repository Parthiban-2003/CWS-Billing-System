import { useCartStore } from '@/stores/useCartStore'
import { inr } from '@/lib/utils'

export default function ProductGrid({ products }) {
    const add = useCartStore((s) => s.add)
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((p) => (
                <button key={p.id} onClick={() => add(p)}
                    className="text-left bg-card border border-line rounded-xl p-3.5 hover:border-primary/50 hover:-translate-y-0.5 transition active:scale-95">
                    <div className="h-9 w-9 rounded-lg bg-primary-soft grid place-items-center text-lg mb-2">🍽</div>
                    <p className="font-bold text-sm truncate">{p.name}</p>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-primary font-extrabold text-sm">{inr(p.price)}</span>
                        <span className="text-[10px] text-mut">{p.stock} left</span>
                    </div>
                </button>
            ))}
            {products.length === 0 && <p className="col-span-full text-center text-mut py-10">No items found</p>}
        </div>
    )
}
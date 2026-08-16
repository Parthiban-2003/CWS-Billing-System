import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import OrderBar from '@/components/pos/OrderBar'
import ComboGrid from '@/components/pos/ComboGrid'
import ProductGrid from '@/components/pos/ProductGrid'
import CartPanel from '@/components/pos/CartPanel'
import { useCartStore } from '@/stores/useCartStore'

export default function POS() {
    const [search, setSearch] = useState('')
    const [cat, setCat] = useState('All')
    const add = useCartStore((s) => s.add)
    const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => api.get('/api/products') })
    const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => api.get('/api/invoices') })

    const cats = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))]
    const list = products
        .filter((p) => p.isAvailable !== false)
        .filter((p) =>
            (cat === 'All' || p.category === cat) && p.name.toLowerCase().includes(search.toLowerCase())
        )

    // ⚡ Recent / best sellers (last 50 bills-la irundhu)
    const recent = useMemo(() => {
        const freq = {}
        invoices.slice(0, 50).forEach((v) =>
            (v.items || []).forEach((i) => { if (i.productId) freq[i.productId] = (freq[i.productId] || 0) + i.qty })
        )
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([id]) => products.find((p) => p.id === id && p.isAvailable !== false))
            .filter(Boolean)
    }, [invoices, products])

    return (
        <div className="grid lg:grid-cols-[1fr_380px] gap-4">
            <div className="space-y-4">
                <OrderBar search={search} setSearch={setSearch} cats={cats} cat={cat} setCat={setCat} />

                {recent.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-extrabold text-mut">⚡ QUICK PICK (frequent)</p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {recent.map((p) => (
                                <button key={p.id} onClick={() => add(p)}
                                    className="shrink-0 rounded-full bg-primary-soft text-primary border border-primary/30 px-3.5 py-2 text-xs font-extrabold hover:brightness-110 active:scale-95">
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <ComboGrid />
                <ProductGrid products={list} />
            </div>
            <CartPanel />
        </div>
    )
}
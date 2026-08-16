import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import OrderBar from '@/components/pos/OrderBar'
import ProductGrid from '@/components/pos/ProductGrid'
import CartPanel from '@/components/pos/CartPanel'

export default function POS() {
    const [search, setSearch] = useState('')
    const [cat, setCat] = useState('All')
    const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => api.get('/api/products') })

    const cats = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))]
    const list = products
        .filter((p) => p.isAvailable !== false)
        .filter((p) =>
            (cat === 'All' || p.category === cat) && p.name.toLowerCase().includes(search.toLowerCase())
        )

    return (
        <div className="grid lg:grid-cols-[1fr_380px] gap-4">
            <div className="space-y-3">
                <OrderBar search={search} setSearch={setSearch} cats={cats} cat={cat} setCat={setCat} />
                <ProductGrid products={list} />
            </div>
            <CartPanel />
        </div>
    )
}
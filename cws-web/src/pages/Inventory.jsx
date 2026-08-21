import { useState } from 'react'
import ProductsTab from '@/components/inventory/ProductsTab'
import IngredientsTab from '@/components/inventory/IngredientsTab'
import LowStockTab from '@/components/inventory/LowStockTab'
import WastageTab from '@/components/inventory/WastageTab'
import { cn } from '@/lib/utils'

const TABS = [
    { id: 'PRODUCTS', l: '📦 Products' },
    { id: 'INGREDIENTS', l: '🥬 Ingredients' },
    { id: 'LOW', l: '⚠️ Low Stock' },
    { id: 'WASTAGE', l: '🗑️ Wastage' },
]

export default function Inventory() {
    const [tab, setTab] = useState('PRODUCTS')

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-extrabold">📦 Inventory</h1>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cn(
                            'shrink-0 rounded-full px-4 py-2 text-xs font-bold border transition',
                            tab === t.id
                                ? 'bg-primary text-bg border-primary'
                                : 'bg-card text-mut border-line hover:border-primary/40'
                        )}
                    >
                        {t.l}
                    </button>
                ))}
            </div>

            {tab === 'PRODUCTS' && <ProductsTab />}
            {tab === 'INGREDIENTS' && <IngredientsTab />}
            {tab === 'LOW' && <LowStockTab />}
            {tab === 'WASTAGE' && <WastageTab />}
        </div>
    )
}
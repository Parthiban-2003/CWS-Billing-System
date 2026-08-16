import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import AdjustModal from '@/components/inventory/AdjustModal'
import { inr, cn } from '@/lib/utils'

export default function Inventory() {
    const [adjust, setAdjust] = useState(null)
    const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => api.get('/api/products') })

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-extrabold">📦 Inventory</h1>
            <Card className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-bg text-mut">
                        <tr>
                            <th className="text-left px-4 py-3">Item</th>
                            <th className="text-left px-4 py-3">Category</th>
                            <th className="text-right px-4 py-3">Price</th>
                            <th className="text-right px-4 py-3">Stock</th>
                            <th className="text-right px-4 py-3">Status</th>
                            <th className="text-right px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => {
                            const low = p.stock <= p.lowStockAt
                            return (
                                <tr key={p.id} className="border-t border-line">
                                    <td className="px-4 py-3 font-bold">{p.name}</td>
                                    <td className="px-4 py-3 text-mut">{p.category}</td>
                                    <td className="px-4 py-3 text-right text-primary font-bold">{inr(p.price)}</td>
                                    <td className="px-4 py-3 text-right font-extrabold">{p.stock}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={cn('text-[10px] font-extrabold rounded-full px-2 py-0.5', low ? 'bg-rose-500/10 text-rose-400 animate-pulse' : 'bg-emerald-500/10 text-emerald-400')}>
                                            {low ? 'LOW STOCK' : 'OK'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setAdjust(p)} className="text-[11px] font-bold text-primary hover:underline">Adjust</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </Card>
            <AdjustModal p={adjust} onClose={() => setAdjust(null)} />
        </div>
    )
}
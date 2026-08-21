import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function LowStockTab() {
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => api.get('/api/products'),
    })
    const { data: ingredients = [] } = useQuery({
        queryKey: ['ingredients'],
        queryFn: () => api.get('/api/ingredients'),
    })

    const lowP = products.filter((p) => p.stock <= p.lowStockAt)
    const lowI = ingredients.filter((i) => i.stock <= i.lowStockAt)

    return (
        <div className="space-y-4">
            {/* 🥬 INGREDIENTS LOW */}
            <div>
                <p className="font-extrabold text-sm mb-2">🥬 Ingredients — Low Stock ({lowI.length})</p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {lowI.map((i) => (
                        <Card key={i.id} className="p-4 border-rose-500/40">
                            <div className="flex justify-between items-center">
                                <p className="font-extrabold">🥬 {i.name}</p>
                                <span className="text-[10px] font-extrabold bg-rose-500/15 text-rose-400 rounded-full px-2 py-0.5">
                                    ORDER NOW
                                </span>
                            </div>
                            <p className="text-xs text-mut mt-1">
                                Stock: <b className="text-rose-400">{i.stock} {i.unit}</b> / min {i.lowStockAt} {i.unit}
                            </p>
                            <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
                                <div
                                    className="h-full bg-rose-500"
                                    style={{ width: `${Math.min(100, (i.stock / (i.lowStockAt * 2)) * 100)}%` }}
                                />
                            </div>
                        </Card>
                    ))}
                    {lowI.length === 0 && (
                        <p className="text-mut text-sm col-span-full text-center py-6">
                            Ellam ingredients nalla stock-la irukku ✅
                        </p>
                    )}
                </div>
            </div>

            {/* 📦 PRODUCTS LOW */}
            <div>
                <p className="font-extrabold text-sm mb-2">📦 Products — Low Stock ({lowP.length})</p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {lowP.map((p) => (
                        <Card key={p.id} className="p-4 border-amber-500/40">
                            <div className="flex justify-between items-center">
                                <p className="font-extrabold">📦 {p.name}</p>
                                <span className="text-[10px] font-extrabold bg-amber-500/15 text-amber-400 rounded-full px-2 py-0.5">
                                    RESTOCK
                                </span>
                            </div>
                            <p className="text-xs text-mut mt-1">
                                Stock: <b className="text-amber-400">{p.stock}</b> / min {p.lowStockAt}
                            </p>
                        </Card>
                    ))}
                    {lowP.length === 0 && (
                        <p className="text-mut text-sm col-span-full text-center py-6">
                            Ellam products nalla stock-la irukku ✅
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
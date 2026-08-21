import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export default function ProductsTab() {
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: () => api.get('/api/products'),
    })
    const qc = useQueryClient()
    const [adj, setAdj] = useState(null)
    const [amt, setAmt] = useState('')

    const save = async () => {
        const newStock = Math.max(0, Number(adj.stock) + Number(amt || 0))
        await api.patch(`/api/products/${adj.id}`, { stock: newStock })
        toast.success(`${adj.name} stock → ${newStock}`)
        qc.invalidateQueries({ queryKey: ['products'] })
        setAdj(null)
        setAmt('')
    }

    return (
        <Card className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-mut text-xs border-b border-line">
                        <th className="py-2">Item</th>
                        <th>Category</th>
                        <th className="text-right">Stock</th>
                        <th className="text-right">Low at</th>
                        <th>Status</th>
                        <th className="text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => {
                        const low = p.stock <= p.lowStockAt
                        return (
                            <tr key={p.id} className="border-b border-line/50">
                                <td className="py-2.5 font-bold">{p.name}</td>
                                <td className="text-mut">{p.category}</td>
                                <td className="text-right font-extrabold">{p.stock}</td>
                                <td className="text-right text-mut">{p.lowStockAt}</td>
                                <td>
                                    <span
                                        className={cn(
                                            'text-[10px] font-extrabold rounded-full px-2 py-0.5',
                                            low
                                                ? 'bg-rose-500/15 text-rose-400'
                                                : 'bg-emerald-500/15 text-emerald-400'
                                        )}
                                    >
                                        {low ? 'LOW' : 'OK'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <Button variant="soft" onClick={() => setAdj(p)}>
                                        Adjust
                                    </Button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <Modal open={!!adj} onClose={() => setAdj(null)} title={`📦 ${adj?.name}`}>
                <div className="space-y-3">
                    <p className="text-sm text-mut">
                        Current stock: <b className="text-ink">{adj?.stock}</b>
                    </p>
                    <Input
                        type="number"
                        placeholder="+ add / − remove (e.g. 10 or -2)"
                        value={amt}
                        onChange={(e) => setAmt(e.target.value)}
                    />
                    <Button className="w-full" disabled={!amt} onClick={save}>
                        Update Stock
                    </Button>
                </div>
            </Modal>
        </Card>
    )
}
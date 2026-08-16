import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import ItemCard from '@/components/menu/ItemCard'
import AddItemModal from '@/components/menu/AddItemModal'
import { cn } from '@/lib/utils'

export default function Menu() {
    const [cat, setCat] = useState('All')
    const [addOpen, setAddOpen] = useState(false)
    const { data: products = [], refetch } = useQuery({ queryKey: ['products'], queryFn: () => api.get('/api/products') })

    const cats = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))]
    const list = cat === 'All' ? products : products.filter((p) => p.category === cat)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold">🍽 Menu Management</h1>
                <Button onClick={() => setAddOpen(true)}><Plus size={16} className="inline mr-1" />Add Item</Button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {cats.map((c) => (
                    <button key={c} onClick={() => setCat(c)}
                        className={cn('shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border',
                            cat === c ? 'bg-primary text-bg border-primary' : 'bg-card text-mut border-line')}>
                        {c}
                    </button>
                ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {list.map((p) => <ItemCard key={p.id} p={p} onDeleted={refetch} />)}
            </div>

            <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={refetch} />
        </div>
    )
}
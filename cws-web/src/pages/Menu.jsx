import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import ItemCard from '@/components/menu/ItemCard'
import AddItemModal from '@/components/menu/AddItemModal'
import BulkPriceModal from '@/components/menu/BulkPriceModal'
import RecipeModal from '@/components/menu/RecipeModal'
import { cn } from '@/lib/utils'

export default function Menu() {
  const [cat, setCat] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [edit, setEdit] = useState(null)
  const [recipeFor, setRecipeFor] = useState(null)

  const { data: products = [], refetch } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/api/products'),
  })

  const cats = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))]
  const list = cat === 'All' ? products : products.filter((p) => p.category === cat)

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-extrabold">🍽 Menu Management</h1>
        <div className="flex gap-2">
          <Button variant="soft" onClick={() => setBulkOpen(true)}>
            <TrendingUp size={15} className="inline mr-1" />
            Bulk Price
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} className="inline mr-1" />
            Add Item
          </Button>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border',
              cat === c
                ? 'bg-primary text-bg border-primary'
                : 'bg-card text-mut border-line'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ITEMS GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {list.map((p) => (
          <ItemCard
            key={p.id}
            p={p}
            onDeleted={refetch}
            onEdit={() => setEdit(p)}
            onRecipe={() => setRecipeFor(p)}
          />
        ))}
      </div>
      {list.length === 0 && (
        <p className="text-mut text-center py-12">No items in this category</p>
      )}

      {/* MODALS */}
      <AddItemModal
        open={addOpen || !!edit}
        initial={edit}
        onSaved={refetch}
        onClose={() => {
          setAddOpen(false)
          setEdit(null)
        }}
      />

      <BulkPriceModal open={bulkOpen} onClose={() => setBulkOpen(false)} />

      <RecipeModal product={recipeFor} onClose={() => setRecipeFor(null)} />
    </div>
  )
}
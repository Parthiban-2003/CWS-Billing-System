import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'

export default function RecipeModal({ product, onClose }) {
    const { data: ingredients = [] } = useQuery({
        queryKey: ['ingredients'],
        queryFn: () => api.get('/api/ingredients'),
    })
    const { data: recipe = [] } = useQuery({
        queryKey: ['recipe', product?.id],
        queryFn: () => api.get(`/api/recipes/${product?.id}`),
        enabled: !!product,
    })
    const qc = useQueryClient()
    const [rows, setRows] = useState([])

    useEffect(() => {
        if (product) {
            setRows(recipe.map((r) => ({ ingredientId: r.ingredientId, qty: String(r.qty) })))
        }
    }, [recipe, product])

    if (!product) return null

    const save = async () => {
        await api.put(`/api/recipes/${product.id}`, {
            items: rows
                .filter((r) => r.ingredientId)
                .map((r) => ({ ingredientId: r.ingredientId, qty: Number(r.qty) || 0 })),
        })
        toast.success(`${product.name} recipe saved 📖`)
        qc.invalidateQueries({ queryKey: ['recipe', product.id] })
        onClose()
    }

    return (
        <Modal open={!!product} onClose={onClose} title={`📖 Recipe — ${product.name}`}>
            <div className="space-y-3">
                <p className="text-xs text-mut">
                    1 plate-ku evlo ingredients venum-nu set pannu. Bill aagum podhu **auto-decrement** aagum! 🪄
                </p>

                <div className="space-y-1.5">
                    {rows.map((r, i) => {
                        const ing = ingredients.find((x) => x.id === r.ingredientId)
                        return (
                            <div key={i} className="flex gap-2 items-center">
                                <select
                                    value={r.ingredientId}
                                    onChange={(e) =>
                                        setRows(rows.map((x, j) => (j === i ? { ...x, ingredientId: e.target.value } : x)))
                                    }
                                    className="flex-1 rounded-lg bg-bg border border-line px-2 py-2 text-xs font-bold outline-none"
                                >
                                    <option value="">Select…</option>
                                    {ingredients.map((x) => (
                                        <option key={x.id} value={x.id}>
                                            {x.name} ({x.stock} {x.unit})
                                        </option>
                                    ))}
                                </select>
                                <Input
                                    type="number"
                                    placeholder="Qty"
                                    className="w-24"
                                    value={r.qty}
                                    onChange={(e) =>
                                        setRows(rows.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))
                                    }
                                />
                                {ing && <span className="text-[10px] text-mut w-8">{ing.unit}</span>}
                                <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-mut hover:text-rose-400">
                                    <X size={14} />
                                </button>
                            </div>
                        )
                    })}
                </div>

                <button
                    onClick={() => setRows([...rows, { ingredientId: '', qty: '' }])}
                    className="text-[11px] font-bold text-primary hover:underline"
                >
                    <Plus size={12} className="inline" /> Add ingredient
                </button>

                <Button className="w-full" onClick={save}>
                    Save Recipe 📖
                </Button>
            </div>
        </Modal>
    )
}
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil } from 'lucide-react'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { inr, cn } from '@/lib/utils'

const BLANK = { name: '', unit: 'kg', stock: '', lowStockAt: '5', costPerUnit: '' }

export default function IngredientsTab() {
    const { data: ingredients = [] } = useQuery({
        queryKey: ['ingredients'],
        queryFn: () => api.get('/api/ingredients'),
    })
    const qc = useQueryClient()
    const [open, setOpen] = useState(false)
    const [edit, setEdit] = useState(null)
    const [f, setF] = useState(BLANK)

    const startAdd = () => {
        setEdit(null)
        setF(BLANK)
        setOpen(true)
    }

    const startEdit = (i) => {
        setEdit(i)
        setF({
            name: i.name,
            unit: i.unit,
            stock: String(i.stock),
            lowStockAt: String(i.lowStockAt),
            costPerUnit: String(i.costPerUnit),
        })
        setOpen(true)
    }

    const save = async () => {
        const body = {
            name: f.name,
            unit: f.unit,
            stock: Number(f.stock) || 0,
            lowStockAt: Number(f.lowStockAt) || 0,
            costPerUnit: Number(f.costPerUnit) || 0,
        }
        if (edit) await api.patch(`/api/ingredients/${edit.id}`, body)
        else await api.post('/api/ingredients', body)
        toast.success(`${f.name} saved ✅`)
        qc.invalidateQueries({ queryKey: ['ingredients'] })
        setOpen(false)
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <Button onClick={startAdd}>
                    <Plus size={15} className="inline mr-1" /> Add Ingredient
                </Button>
            </div>

            <Card className="p-4 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-mut text-xs border-b border-line">
                            <th className="py-2">Ingredient</th>
                            <th>Unit</th>
                            <th className="text-right">Stock</th>
                            <th className="text-right">Low at</th>
                            <th className="text-right">Cost/Unit</th>
                            <th>Status</th>
                            <th className="text-right">Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredients.map((i) => {
                            const low = i.stock <= i.lowStockAt
                            return (
                                <tr key={i.id} className="border-b border-line/50">
                                    <td className="py-2.5 font-bold">🥬 {i.name}</td>
                                    <td className="text-mut">{i.unit}</td>
                                    <td className="text-right font-extrabold">{i.stock}</td>
                                    <td className="text-right text-mut">{i.lowStockAt}</td>
                                    <td className="text-right">{inr(i.costPerUnit)}</td>
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
                                        <button onClick={() => startEdit(i)} className="text-mut hover:text-primary">
                                            <Pencil size={14} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {ingredients.length === 0 && (
                    <p className="text-mut text-sm text-center py-8">No ingredients — add pannu!</p>
                )}
            </Card>

            <Modal open={open} onClose={() => setOpen(false)} title={edit ? '✏️ Edit Ingredient' : '➕ Add Ingredient'}>
                <div className="space-y-3">
                    <Input placeholder="Name (Rice, Chicken…)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Unit (kg/ltr/pcs)" value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} />
                        <Input type="number" placeholder="Current stock" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder="Low stock alert at" value={f.lowStockAt} onChange={(e) => setF({ ...f, lowStockAt: e.target.value })} />
                        <Input type="number" placeholder="Cost per unit ₹" value={f.costPerUnit} onChange={(e) => setF({ ...f, costPerUnit: e.target.value })} />
                    </div>
                    <Button className="w-full" disabled={!f.name} onClick={save}>
                        Save Ingredient
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, X, Sparkles } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'
import { suggestFor } from '@/config/variantTemplates'

const BLANK = { name: '', category: '', price: '', stock: '' }

export default function AddItemModal({ open, onClose, onSaved, initial }) {
    const [f, setF] = useState(BLANK)
    const [variants, setVariants] = useState([])
    const [modifiers, setModifiers] = useState([])

    useEffect(() => {
        if (open) {
            if (initial) {
                setF({ name: initial.name, category: initial.category || '', price: String(initial.price), stock: String(initial.stock) })
                setVariants((initial.variants || []).map((v) => ({ name: v.name, delta: String(v.delta) })))
                setModifiers((initial.modifiers || []).map((m) => ({ name: m.name, delta: String(m.delta) })))
            } else {
                setF(BLANK)
                setVariants([])
                setModifiers([])
            }
        }
    }, [open, initial])

    const suggestion = suggestFor(f.name, f.category)

    const applySuggestion = () => {
        if (!suggestion) return
        setVariants(suggestion.variants.map((v) => ({ name: v, delta: '0' })))
        setModifiers(suggestion.modifiers.map((m) => ({ name: m, delta: '0' })))
        toast('Suggestions applied ✨ — prices adjust panniko!')
    }

    const save = async () => {
        const body = {
            name: f.name,
            category: f.category,
            price: Number(f.price),
            stock: Number(f.stock || 0),
            variants: variants.filter((v) => v.name).map((v) => ({ name: v.name, delta: Number(v.delta) || 0 })),
            modifiers: modifiers.filter((m) => m.name).map((m) => ({ name: m.name, delta: Number(m.delta) || 0 })),
        }
        if (initial) await api.patch(`/api/products/${initial.id}`, body)
        else await api.post('/api/products', body)
        toast.success(initial ? `${f.name} updated ✏️` : `${f.name} added ✅`)
        onSaved()
        onClose()
    }

    return (
        <Modal open={open} onClose={onClose} title={initial ? '✏️ Edit Item' : '➕ Add Menu Item'} wide>
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Item name (Dosa, Idli…)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                    <Input placeholder="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Base price ₹" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
                    <Input type="number" placeholder="Stock" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} />
                </div>

                {suggestion && (
                    <button onClick={applySuggestion}
                        className="w-full rounded-lg border border-dashed border-primary/50 bg-primary-soft p-2.5 text-xs font-bold text-primary hover:brightness-110">
                        <Sparkles size={13} className="inline mr-1" />
                        Smart Suggest: {suggestion.variants.join(' / ') || '—'} + {suggestion.modifiers.length} modifiers (1 click apply)
                    </button>
                )}

                {/* VARIANTS EDITOR */}
                <div>
                    <p className="text-xs font-extrabold text-mut mb-1.5">📏 Variants (size/type — custom names!)</p>
                    <div className="space-y-1.5">
                        {variants.map((v, i) => (
                            <div key={i} className="flex gap-2">
                                <Input placeholder="Name (Small, 4 pcs…)" value={v.name}
                                    onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                                <Input type="number" placeholder="+₹" className="w-24" value={v.delta}
                                    onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, delta: e.target.value } : x)))} />
                                <button onClick={() => setVariants(variants.filter((_, j) => j !== i))} className="text-mut hover:text-rose-400"><X size={15} /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setVariants([...variants, { name: '', delta: '0' }])}
                        className="mt-1.5 text-[11px] font-bold text-primary hover:underline">+ Add variant</button>
                </div>

                {/* MODIFIERS EDITOR */}
                <div>
                    <p className="text-xs font-extrabold text-mut mb-1.5"> Modifiers (extras/options)</p>
                    <div className="space-y-1.5">
                        {modifiers.map((m, i) => (
                            <div key={i} className="flex gap-2">
                                <Input placeholder="Name (Extra raita, No onion…)" value={m.name}
                                    onChange={(e) => setModifiers(modifiers.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                                <Input type="number" placeholder="+₹" className="w-24" value={m.delta}
                                    onChange={(e) => setModifiers(modifiers.map((x, j) => (j === i ? { ...x, delta: e.target.value } : x)))} />
                                <button onClick={() => setModifiers(modifiers.filter((_, j) => j !== i))} className="text-mut hover:text-rose-400"><X size={15} /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setModifiers([...modifiers, { name: '', delta: '0' }])}
                        className="mt-1.5 text-[11px] font-bold text-primary hover:underline">+ Add modifier</button>
                </div>

                <Button className="w-full" disabled={!f.name || !f.price} onClick={save}>
                    {initial ? 'Update Item' : 'Save Item'}
                </Button>
            </div>
        </Modal>
    )
}
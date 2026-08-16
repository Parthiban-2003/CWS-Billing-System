import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'

const BLANK = { name: '', category: '', price: '', stock: '' }

export default function AddItemModal({ open, onClose, onSaved, initial }) {
    const [f, setF] = useState(BLANK)

    useEffect(() => {
        if (open) {
            setF(initial
                ? { name: initial.name, category: initial.category || '', price: String(initial.price), stock: String(initial.stock) }
                : BLANK)
        }
    }, [open, initial])

    const save = async () => {
        const body = { name: f.name, category: f.category, price: Number(f.price), stock: Number(f.stock || 0) }
        if (initial) await api.patch(`/api/products/${initial.id}`, body)
        else await api.post('/api/products', body)
        toast.success(initial ? `${f.name} updated ✏️` : `${f.name} added ✅`)
        onSaved()
        onClose()
    }

    return (
        <Modal open={open} onClose={onClose} title={initial ? '✏️ Edit Item' : '➕ Add Menu Item'}>
            <div className="space-y-3">
                <Input placeholder="Item name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                <Input placeholder="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Price ₹" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
                    <Input type="number" placeholder="Stock" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} />
                </div>
                <Button className="w-full" disabled={!f.name || !f.price} onClick={save}>{initial ? 'Update' : 'Save'}</Button>
            </div>
        </Modal>
    )
}
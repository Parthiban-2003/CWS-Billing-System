import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'

export default function AdjustModal({ p, onClose }) {
    const [delta, setDelta] = useState('')
    const [reason, setReason] = useState('PURCHASE')
    const qc = useQueryClient()

    const save = async () => {
        const d = Number(delta) || 0
        await api.patch(`/api/products/${p.id}`, { ...p, stock: Math.max(0, p.stock + d) })
        toast.success(`${p.name} stock ${d >= 0 ? '+' : ''}${d} (${reason}) ✅`)
        qc.invalidateQueries({ queryKey: ['products'] })
        setDelta('')
        onClose()
    }

    return (
        <Modal open={!!p} onClose={onClose} title={`📦 Adjust — ${p?.name ?? ''}`}>
            <div className="space-y-3">
                <p className="text-sm text-mut">Current stock: <b className="text-ink">{p?.stock}</b></p>
                <select value={reason} onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none">
                    <option value="PURCHASE"> Purchase (stock in)</option>
                    <option value="DAMAGE">🗑 Damage (stock out)</option>
                    <option value="ADJUST">🔧 Manual adjustment</option>
                </select>
                <Input type="number" placeholder="+50 / -5" value={delta} onChange={(e) => setDelta(e.target.value)} />
                <Button className="w-full" onClick={save}>Save Adjustment</Button>
            </div>
        </Modal>
    )
}
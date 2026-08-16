import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'

export default function BulkPriceModal({ open, onClose }) {
    const [pct, setPct] = useState('')
    const qc = useQueryClient()

    const apply = async () => {
        const res = await api.patch('/api/products/bulk', { pct: Number(pct) })
        toast.success(`${res.updated} items prices updated ${pct > 0 ? '+' : ''}${pct}% 📈`)
        qc.invalidateQueries({ queryKey: ['products'] })
        setPct('')
        onClose()
    }

    return (
        <Modal open={open} onClose={onClose} title="📈 Bulk Price Update">
            <div className="space-y-3">
                <p className="text-xs text-mut">Ellam items-oda price-um one shot-la change aagum (festival rate, rate hike…)</p>
                <div className="flex gap-2">
                    {['5', '10', '-5'].map((v) => (
                        <button key={v} onClick={() => setPct(v)}
                            className="flex-1 rounded-lg bg-card border border-line py-2 text-xs font-bold hover:border-primary">
                            {v.startsWith('-') ? '' : '+'}{v}%
                        </button>
                    ))}
                </div>
                <Input type="number" placeholder="Custom % (e.g. 7.5)" value={pct} onChange={(e) => setPct(e.target.value)} />
                <Button className="w-full" disabled={!pct} onClick={apply}>Apply to All Items</Button>
            </div>
        </Modal>
    )
}
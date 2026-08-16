import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'
import { inr } from '@/lib/utils'

export default function CustomerModal({ c, onClose }) {
    const qc = useQueryClient()
    const [pay, setPay] = useState(null)
    const [amt, setAmt] = useState('')
    const { data: invoices = [] } = useQuery({ queryKey: ['invoices'], queryFn: () => api.get('/api/invoices') })

    const mine = invoices.filter((v) => v.customerId === c?.id && v.status !== 'CANCELLED')

    const receive = async (invId) => {
        await api.post(`/api/invoices/${invId}/payments`, { amount: Number(amt), method: 'CASH' })
        toast.success(`Payment ${inr(amt)} received ✅`)
        setPay(null)
        setAmt('')
        qc.invalidateQueries({ queryKey: ['invoices'] })
        qc.invalidateQueries({ queryKey: ['customers'] })
    }

    return (
        <Modal open={!!c} onClose={onClose} title={`👤 ${c?.name ?? ''}`} wide>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {mine.map((v) => {
                    const due = v.total - v.paid
                    return (
                        <div key={v.id} className="bg-bg border border-line rounded-lg p-3 space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span>#{v.number} · {new Date(v.createdAt).toLocaleDateString('en-IN')}</span>
                                <span>{inr(v.total)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-mut">
                                <span>Paid: {inr(v.paid)}</span>
                                <span className={due > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                                    {due > 0 ? `Due: ${inr(due)}` : 'Cleared ✅'}
                                </span>
                            </div>
                            {due > 0 && (pay === v.id ? (
                                <div className="flex gap-2">
                                    <Input type="number" placeholder="Amount" value={amt} onChange={(e) => setAmt(e.target.value)} />
                                    <Button onClick={() => receive(v.id)}>Receive</Button>
                                </div>
                            ) : (
                                <Button variant="soft" className="w-full" onClick={() => setPay(v.id)}>💰 Receive Payment</Button>
                            ))}
                        </div>
                    )
                })}
                {mine.length === 0 && <p className="text-mut text-sm text-center py-8">No bills yet</p>}
            </div>
        </Modal>
    )
}
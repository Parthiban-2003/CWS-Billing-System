import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function BusinessTab() {
    const { data: s, isLoading } = useQuery({ queryKey: ['settings'], queryFn: () => api.get('/api/settings') })
    const qc = useQueryClient()
    const [f, setF] = useState({ gstin: '', address: '', phone: '', taxPct: 0, servicePct: 0, footerMsg: '', invoicePrefix: 'INV' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (s) setF({
            gstin: s.gstin || '', address: s.address || '', phone: s.phone || '',
            taxPct: s.taxPct || 0, servicePct: s.servicePct || 0,
            footerMsg: s.footerMsg || '', invoicePrefix: s.invoicePrefix || 'INV',
        })
    }, [s])

    const save = async () => {
        setSaving(true)
        await api.put('/api/settings', f)
        qc.invalidateQueries({ queryKey: ['settings'] })
        toast.success('Business settings saved ✅')
        setSaving(false)
    }

    if (isLoading) return <Card className="p-5">Loading…</Card>

    return (
        <Card className="p-5 space-y-4">
            <h3 className="font-extrabold">🏪 Business Details</h3>
            <Input placeholder="GSTIN (33ABCDE1234F1Z5)" value={f.gstin} onChange={(e) => setF({ ...f, gstin: e.target.value })} />
            <Input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <div>
                <label className="text-xs font-bold text-mut">Address</label>
                <textarea value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })}
                    className="w-full rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none focus:border-primary" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-bold text-mut">Tax %
                    <Input type="number" value={f.taxPct} onChange={(e) => setF({ ...f, taxPct: e.target.value })} />
                </label>
                <label className="text-xs font-bold text-mut">Service %
                    <Input type="number" value={f.servicePct} onChange={(e) => setF({ ...f, servicePct: e.target.value })} />
                </label>
            </div>
            <Input placeholder="Invoice prefix (INV, BILL…)" value={f.invoicePrefix} onChange={(e) => setF({ ...f, invoicePrefix: e.target.value })} />
            <div>
                <label className="text-xs font-bold text-mut">Receipt footer message</label>
                <Input value={f.footerMsg} onChange={(e) => setF({ ...f, footerMsg: e.target.value })} />
            </div>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Business'}</Button>
        </Card>
    )
}
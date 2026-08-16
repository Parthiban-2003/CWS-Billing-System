import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function BrandingTab() {
    const { data: s, isLoading } = useQuery({ queryKey: ['settings'], queryFn: () => api.get('/api/settings') })
    const qc = useQueryClient()
    const [f, setF] = useState({ companyName: '', logo: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (s) setF({ companyName: s.companyName || '', logo: s.logo || '' })
    }, [s])

    const onLogo = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const r = new FileReader()
        r.onload = () => setF({ ...f, logo: r.result })
        r.readAsDataURL(file)
    }

    const save = async () => {
        setSaving(true)
        await api.put('/api/settings', f)
        qc.invalidateQueries({ queryKey: ['settings'] })
        toast.success('Branding saved ✅')
        setSaving(false)
    }

    if (isLoading) return <Card className="p-5">Loading…</Card>

    return (
        <Card className="p-5 space-y-4">
            <h3 className="font-extrabold">🏢 Branding</h3>
            <div>
                <label className="text-xs font-bold text-mut">Company Name</label>
                <Input value={f.companyName} onChange={(e) => setF({ ...f, companyName: e.target.value })} />
            </div>
            <div>
                <label className="text-xs font-bold text-mut">Logo</label>
                <input type="file" accept="image/*" onChange={onLogo} className="text-xs mt-1" />
                {f.logo && <img src={f.logo} alt="logo" className="mt-2 h-10 w-10 rounded-lg object-cover" />}
            </div>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Branding'}</Button>
        </Card>
    )
}
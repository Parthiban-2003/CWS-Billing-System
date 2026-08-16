import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'

export default function AddCustomerModal({ open, onClose, onSaved, initial }) {
    const [f, setF] = useState({ name: '', phone: '' })

    useEffect(() => {
        if (open) setF(initial ? { name: initial.name, phone: initial.phone || '' } : { name: '', phone: '' })
    }, [open, initial])

    const save = async () => {
        if (initial) await api.patch(`/api/customers/${initial.id}`, f)
        else await api.post('/api/customers', f)
        toast.success(initial ? 'Customer updated ✏️' : `${f.name} added ✅`)
        onSaved()
        onClose()
    }

    return (
        <Modal open={open} onClose={onClose} title={initial ? '✏️ Edit Customer' : '👤 Add Customer'}>
            <div className="space-y-3">
                <Input placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                <Input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                <Button className="w-full" disabled={!f.name} onClick={save}>{initial ? 'Update' : 'Save'}</Button>
            </div>
        </Modal>
    )
}
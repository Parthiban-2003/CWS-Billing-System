import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { api } from '@/lib/api'

const localToday = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const BLANK = { name: '', phone: '', date: localToday(), time: '19:00', guests: '2', table: '', note: '' }

export default function ReservationModal({ open, onClose, initial, onSaved }) {
    const [f, setF] = useState(BLANK)
    const qc = useQueryClient()
    const { data: tables = [] } = useQuery({ queryKey: ['tables'], queryFn: () => api.get('/api/tables') })

    useEffect(() => {
        if (open) {
            if (initial) {
                setF({
                    name: initial.name,
                    phone: initial.phone || '',
                    date: initial.date,
                    time: initial.time,
                    guests: String(initial.guests),
                    table: initial.table || '',
                    note: initial.note || '',
                })
            } else {
                setF(BLANK)
            }
        }
    }, [open, initial])

    const save = async () => {
        const body = {
            name: f.name,
            phone: f.phone || null,
            date: f.date,
            time: f.time,
            guests: Number(f.guests) || 2,
            table: f.table || null,
            note: f.note || null,
        }
        if (initial) {
            await api.patch(`/api/reservations/${initial.id}`, body)
            toast.success('Reservation updated ✏️')
        } else {
            await api.post('/api/reservations', body)
            toast.success(`${f.name} booked 📅`)
        }
        qc.invalidateQueries({ queryKey: ['reservations'] })
        onSaved?.()
        onClose()
    }

    return (
        <Modal open={open} onClose={onClose} title={initial ? '✏️ Edit Reservation' : '📅 New Reservation'}>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Customer name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                    <Input placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
                    <Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
                    <Input type="number" placeholder="Guests" value={f.guests} onChange={(e) => setF({ ...f, guests: e.target.value })} />
                </div>
                <select
                    value={f.table}
                    onChange={(e) => setF({ ...f, table: e.target.value })}
                    className="w-full rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                    <option value="">Table assign pannala (walk-in decide)</option>
                    {tables.map((t) => (
                        <option key={t.id} value={t.name}>
                            {t.name} ({t.seats} seats)
                        </option>
                    ))}
                </select>
                <Input placeholder="Note (birthday, window seat…)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
                <Button className="w-full" disabled={!f.name || !f.date || !f.time} onClick={save}>
                    {initial ? 'Update' : 'Book Table 📅'}
                </Button>
            </div>
        </Modal>
    )
}
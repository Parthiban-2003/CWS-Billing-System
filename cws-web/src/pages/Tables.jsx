import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { useNow } from '@/hooks/useNow'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export default function Tables() {
    const [addOpen, setAddOpen] = useState(false)
    const [f, setF] = useState({ name: '', seats: '4' })
    const qc = useQueryClient()
    const now = useNow(10000)

    // 🪑 LIVE TABLES
    const { data: tables = [] } = useQuery({
        queryKey: ['tables'],
        queryFn: () => api.get('/api/tables'),
        refetchInterval: 5000,
    })

    // 📅 RESERVATIONS (today badge-ku)
    const { data: reservations = [] } = useQuery({
        queryKey: ['reservations'],
        queryFn: () => api.get('/api/reservations'),
    })

    const d = new Date()
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    const resFor = (tableName) =>
        reservations.find(
            (r) => r.status === 'BOOKED' && r.table === tableName && r.date === today
        )

    const setStatus = async (t, status) => {
        await api.patch(`/api/tables/${t.id}`, { status })
        toast(status === 'OCCUPIED' ? `${t.name} seated 🪑` : `${t.name} freed ✅`)
        qc.invalidateQueries({ queryKey: ['tables'] })
    }

    const addTable = async () => {
        await api.post('/api/tables', { name: f.name, seats: Number(f.seats) || 4 })
        toast.success(`${f.name} added 🪑`)
        qc.invalidateQueries({ queryKey: ['tables'] })
        setAddOpen(false)
        setF({ name: '', seats: '4' })
    }

    const occupied = tables.filter((t) => t.status === 'OCCUPIED').length

    return (
        <div className="space-y-4">
            {/* HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h1 className="text-2xl font-extrabold">🪑 Tables</h1>
                    <p className="text-xs text-mut font-bold mt-0.5">
                        {occupied}/{tables.length} occupied ·{' '}
                        {reservations.filter((r) => r.date === today && r.status === 'BOOKED').length}{' '}
                        bookings today
                    </p>
                </div>
                <Button onClick={() => setAddOpen(true)}>
                    <Plus size={16} className="inline mr-1" /> Add Table
                </Button>
            </div>

            {/* TABLES GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {tables.map((t) => {
                    const busy = t.status === 'OCCUPIED'
                    const res = resFor(t.name)
                    const mins = busy
                        ? Math.floor((now - new Date(t.since)) / 60000)
                        : 0

                    return (
                        <Card
                            key={t.id}
                            className={cn(
                                'p-4 space-y-2 border-2 transition',
                                busy ? 'border-rose-500/40' : 'border-emerald-500/30'
                            )}
                        >
                            {/* NAME + STATUS */}
                            <div className="flex justify-between items-start">
                                <p className="font-extrabold text-lg">{t.name}</p>
                                <span
                                    className={cn(
                                        'text-[10px] font-extrabold rounded-full px-2 py-0.5',
                                        busy
                                            ? 'bg-rose-500/15 text-rose-400'
                                            : 'bg-emerald-500/15 text-emerald-400'
                                    )}
                                >
                                    {busy ? 'OCCUPIED' : 'FREE'}
                                </span>
                            </div>

                            <p className="text-[11px] text-mut">👥 {t.seats} seats</p>

                            {/* ⏱ OCCUPIED DURATION */}
                            {busy && (
                                <p className="text-[11px] font-bold text-rose-400">
                                    ⏱ {mins} min
                                </p>
                            )}

                            {/* 📅 RESERVATION BADGE (today) */}
                            {res && (
                                <p className="text-[10px] font-bold text-amber-400 bg-amber-500/10 rounded-md px-2 py-1">
                                    📅 {res.time} · {res.name} ({res.guests})
                                </p>
                            )}

                            {/* ACTION */}
                            <Button
                                variant={busy ? 'soft' : 'primary'}
                                className="w-full"
                                onClick={() => setStatus(t, busy ? 'FREE' : 'OCCUPIED')}
                            >
                                {busy ? 'Free Table ✅' : 'Seat Walk-in 🪑'}
                            </Button>
                        </Card>
                    )
                })}
            </div>

            {tables.length === 0 && (
                <p className="text-mut text-center py-12">No tables — add pannu! 🪑</p>
            )}

            {/* ADD TABLE MODAL */}
            <Modal open={addOpen} onClose={() => setAddOpen(false)} title="🪑 Add Table">
                <div className="space-y-3">
                    <Input
                        placeholder="Table name (T1, T2…)"
                        value={f.name}
                        onChange={(e) => setF({ ...f, name: e.target.value })}
                    />
                    <Input
                        type="number"
                        placeholder="Seats"
                        value={f.seats}
                        onChange={(e) => setF({ ...f, seats: e.target.value })}
                    />
                    <Button className="w-full" disabled={!f.name} onClick={addTable}>
                        Add Table
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil } from 'lucide-react'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ReservationModal from '@/components/reservations/ReservationModal'
import { cn } from '@/lib/utils'

const FILTERS = [
    { id: 'TODAY', l: '📅 Today' },
    { id: 'UPCOMING', l: '⏳ Upcoming' },
    { id: 'ALL', l: '📋 All' },
]

const STATUS_STYLE = {
    BOOKED: 'bg-amber-500/15 text-amber-400',
    SEATED: 'bg-sky-500/15 text-sky-400',
    COMPLETED: 'bg-emerald-500/15 text-emerald-400',
    CANCELLED: 'bg-rose-500/15 text-rose-400',
}

const localToday = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Reservations() {
    const [filter, setFilter] = useState('TODAY')
    const [open, setOpen] = useState(false)
    const [edit, setEdit] = useState(null)
    const qc = useQueryClient()

    const { data: reservations = [] } = useQuery({
        queryKey: ['reservations'],
        queryFn: () => api.get('/api/reservations'),
        refetchInterval: 10000,
    })

    const today = localToday()

    const list = reservations
        .filter((r) => {
            if (filter === 'TODAY') return r.date === today && r.status !== 'CANCELLED'
            if (filter === 'UPCOMING') return r.date >= today && r.status === 'BOOKED'
            return true
        })
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))

    const setStatus = async (r, status) => {
        await api.patch(`/api/reservations/${r.id}`, { status })
        toast(
            status === 'SEATED'
                ? `${r.name} seated 🪑`
                : status === 'COMPLETED'
                    ? `${r.name} completed ✅`
                    : `${r.name} cancelled ❌`
        )
        qc.invalidateQueries({ queryKey: ['reservations'] })
    }

    return (
        <div className="space-y-4">
            {/* HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-extrabold">📅 Reservations</h1>
                <Button onClick={() => setOpen(true)}>
                    <Plus size={16} className="inline mr-1" /> New Booking
                </Button>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2">
                {FILTERS.map((fl) => (
                    <button
                        key={fl.id}
                        onClick={() => setFilter(fl.id)}
                        className={cn(
                            'rounded-full px-3.5 py-1.5 text-xs font-bold border',
                            filter === fl.id
                                ? 'bg-primary text-bg border-primary'
                                : 'bg-card text-mut border-line'
                        )}
                    >
                        {fl.l}
                    </button>
                ))}
            </div>

            {/* RESERVATION CARDS */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {list.map((r) => (
                    <Card
                        key={r.id}
                        className={cn('p-4 space-y-2', r.status === 'CANCELLED' && 'opacity-50')}
                    >
                        {/* NAME + STATUS */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-extrabold">📅 {r.name}</p>
                                <p className="text-[11px] text-mut">{r.phone || '—'}</p>
                            </div>
                            <span
                                className={cn(
                                    'text-[10px] font-extrabold rounded-full px-2 py-0.5',
                                    STATUS_STYLE[r.status] || 'bg-card text-mut'
                                )}
                            >
                                {r.status}
                            </span>
                        </div>

                        {/* DETAILS */}
                        <div className="text-xs text-mut space-y-0.5">
                            <p>
                                {r.date} ·  {r.time}
                            </p>
                            <p>
                                👥 {r.guests} guests {r.table && `· 🪑 ${r.table}`}
                            </p>
                            {r.note && <p className="italic">"{r.note}"</p>}
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-1.5 pt-1 flex-wrap">
                            {r.status === 'BOOKED' && (
                                <>
                                    <Button variant="soft" onClick={() => setStatus(r, 'SEATED')}>
                                        Seat 🪑
                                    </Button>
                                    <Button variant="danger" onClick={() => setStatus(r, 'CANCELLED')}>
                                        Cancel
                                    </Button>
                                </>
                            )}
                            {r.status === 'SEATED' && (
                                <Button variant="soft" onClick={() => setStatus(r, 'COMPLETED')}>
                                    Done ✅
                                </Button>
                            )}
                            <button
                                onClick={() => setEdit(r)}
                                className="ml-auto text-mut hover:text-primary self-center"
                            >
                                <Pencil size={14} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {list.length === 0 && (
                <p className="text-mut text-center py-12">No reservations in this view 📅</p>
            )}

            {/* MODAL */}
            <ReservationModal
                open={open || !!edit}
                initial={edit}
                onSaved={() => qc.invalidateQueries({ queryKey: ['reservations'] })}
                onClose={() => {
                    setOpen(false)
                    setEdit(null)
                }}
            />
        </div>
    )
}
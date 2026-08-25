import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Fingerprint, Pencil, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { roleInfo } from '@/config/roles'
import { cn } from '@/lib/utils'

const localToday = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const STATUS_STYLE = {
    PRESENT: 'bg-emerald-500/15 text-emerald-400',
    LATE: 'bg-amber-500/15 text-amber-400',
    LEAVE: 'bg-sky-500/15 text-sky-400',
    ABSENT: 'bg-rose-500/15 text-rose-400',
}

export default function Attendance() {
    const [tab, setTab] = useState('TODAY')
    const [date, setDate] = useState(localToday())
    const [month, setMonth] = useState(localToday().slice(0, 7))
    const [staffId, setStaffId] = useState('')
    const [pin, setPin] = useState('')
    const [editRec, setEditRec] = useState(null)
    const [delRec, setDelRec] = useState(null)

    const qc = useQueryClient()


    const { data: staff = [] } = useQuery({
        queryKey: ['staff'],
        queryFn: () => api.get('/api/staff'),
    })

    const { data: rows = [] } = useQuery({
        queryKey: ['attendance', date],
        queryFn: () => api.get(`/api/attendance?date=${date}`),
    })

    const { data: monthlyRows = [] } = useQuery({
        queryKey: ['attendance-month', month],
        queryFn: () => api.get(`/api/attendance?month=${month}`),
        enabled: tab === 'MONTHLY',
    })

    const activeStaff = staff.filter((s) => s.isActive)

    const punch = async () => {
        try {
            const r = await api.post('/api/attendance/punch', { staffId, pin })
            if (r.action === 'CHECK_IN') toast.success(`${r.staff?.name} checked in ⏰ (${r.status})`)
            else toast.success(`${r.staff?.name} checked out 🌙 (${r.hours}h worked)`)
            setPin('')
            qc.invalidateQueries({ queryKey: ['attendance'] })
            qc.invalidateQueries({ queryKey: ['attendance-month'] })
        } catch (e) {
            toast.error(e?.message || 'Punch failed ❌')
        }
    }

    const markLeave = async (sid) => {
        await api.post('/api/attendance/leave', { staffId: sid, date })
        toast.success('Marked as leave 🌴')
        qc.invalidateQueries({ queryKey: ['attendance'] })
    }

    const formatTime = (iso) =>
        iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'

    const handleUpdate = async () => {
        if (!editRec) return
        try {
            await api.patch(`/api/attendance/${editRec.id}`, editRec)
            toast.success('Attendance updated ️')
            setEditRec(null)
            qc.invalidateQueries({ queryKey: ['attendance'] })
        } catch (e) {
            toast.error('Update failed ❌')
        }
    }

    const handleDelete = async () => {
        if (!delRec) return
        try {
            await api.delete(`/api/attendance/${delRec.id}`)
            toast.success('Record deleted 🗑')
            setDelRec(null)
            qc.invalidateQueries({ queryKey: ['attendance'] })
        } catch (e) {
            toast.error('Delete failed ❌')
        }
    }

    return (
        <div className="space-y-4">
            {/* HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-extrabold"> Attendance</h1>
                <div className="flex gap-2">
                    {['TODAY', 'MONTHLY'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={cn(
                                'rounded-full px-3.5 py-1.5 text-xs font-bold border',
                                tab === t ? 'bg-primary text-bg border-primary' : 'bg-card text-mut border-line'
                            )}
                        >
                            {t === 'TODAY' ? '📅 Daily' : '📊 Monthly'}
                        </button>
                    ))}
                </div>
            </div>

            {/* 🖐 PUNCH PANEL */}
            <Card className="p-4">
                <p className="font-extrabold text-sm mb-2">🖐 Staff Punch (PIN)</p>
                <div className="grid sm:grid-cols-3 gap-2">
                    <select
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        className="rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none focus:border-primary"
                    >
                        <option value="">Select staff…</option>
                        {activeStaff.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({roleInfo(s.role).l})
                            </option>
                        ))}
                    </select>
                    <Input
                        type="password"
                        maxLength={4}
                        placeholder="•••• PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    />
                    <Button onClick={punch} disabled={!staffId || pin.length !== 4}>
                        <Fingerprint size={15} className="inline mr-1" /> Punch
                    </Button>
                </div>
                <p className="text-[10px] text-mut mt-2">
                    1st punch = check-in ⏰ · 2nd punch = check-out 🌙 · After 10:00 AM = LATE
                </p>
            </Card>

            {tab === 'TODAY' && (
                <>
                    <div className="flex justify-end">
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
                    </div>

                    <Card className="p-4 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-mut text-xs border-b border-line">
                                    <th className="py-2">Staff</th>
                                    <th>Status</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Hours</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.id} className="border-b border-line/50">
                                        <td className="py-2.5 font-bold">{r.staff?.name}</td>
                                        <td>
                                            <span className={cn('text-[10px] font-extrabold rounded-full px-2 py-0.5', STATUS_STYLE[r.status])}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="text-mut">{formatTime(r.checkIn)}</td>
                                        <td className="text-mut">{formatTime(r.checkOut)}</td>
                                        <td className="font-extrabold">{r.hours || '—'}</td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => setEditRec(r)}
                                                    className="h-7 w-7 rounded-md bg-bg border border-line text-mut hover:text-primary hover:border-primary grid place-items-center"
                                                    title="Edit"
                                                >
                                                    <Pencil size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setDelRec(r)}
                                                    className="h-7 w-7 rounded-md bg-bg border border-line text-mut hover:text-rose-500 hover:border-rose-500 grid place-items-center"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-mut">
                                            No attendance records for {date}. Use punch panel above!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </>
            )}

            {tab === 'MONTHLY' && (
                <>
                    <div className="flex justify-end">
                        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />
                    </div>

                    <Card className="p-4 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-mut text-xs border-b border-line">
                                    <th className="py-2">Staff</th>
                                    <th>Role</th>
                                    <th className="text-right">Present</th>
                                    <th className="text-right">Late</th>
                                    <th className="text-right">Leave</th>
                                    <th className="text-right">Total Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyRows.map((r) => (
                                    <tr key={r.staffId} className="border-b border-line/50">
                                        <td className="py-2.5 font-bold">{r.name}</td>
                                        <td className="text-mut">{roleInfo(r.role)?.l}</td>
                                        <td className="text-right font-extrabold text-emerald-400">{r.present}</td>
                                        <td className="text-right font-extrabold text-amber-400">{r.late}</td>
                                        <td className="text-right font-extrabold text-sky-400">{r.leave}</td>
                                        <td className="text-right font-extrabold">{r.hours}h</td>
                                    </tr>
                                ))}
                                {monthlyRows.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-mut">
                                            No data for {month}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Card>
                </>
            )}

            {/* ✏️ EDIT MODAL */}
            {editRec && (
                <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={() => setEditRec(null)}>
                    <div className="bg-card border border-line rounded-xl p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
                        <p className="font-extrabold text-lg">✏️ Edit Attendance — {editRec.staff?.name}</p>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-[10px] text-mut font-bold mb-1">Check In</p>
                                <input
                                    type="datetime-local"
                                    value={editRec.checkIn ? editRec.checkIn.slice(0, 16) : ''}
                                    onChange={(e) => setEditRec({ ...editRec, checkIn: e.target.value })}
                                    className="w-full rounded-lg bg-bg border border-line px-3 py-2 text-sm outline-none"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] text-mut font-bold mb-1">Check Out</p>
                                <input
                                    type="datetime-local"
                                    value={editRec.checkOut ? editRec.checkOut.slice(0, 16) : ''}
                                    onChange={(e) => setEditRec({ ...editRec, checkOut: e.target.value })}
                                    className="w-full rounded-lg bg-bg border border-line px-3 py-2 text-sm outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] text-mut font-bold mb-1">Status</p>
                            <select
                                value={editRec.status}
                                onChange={(e) => setEditRec({ ...editRec, status: e.target.value })}
                                className="w-full rounded-lg bg-bg border border-line px-3 py-2 text-sm outline-none"
                            >
                                <option value="PRESENT">PRESENT</option>
                                <option value="LATE">LATE</option>
                                <option value="LEAVE">LEAVE</option>
                                <option value="ABSENT">ABSENT</option>
                            </select>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button variant="soft" className="flex-1" onClick={() => setEditRec(null)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleUpdate}>Save Changes</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🗑 DELETE CONFIRM */}
            {delRec && (
                <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={() => setDelRec(null)}>
                    <div className="bg-card border border-line rounded-xl p-5 w-full max-w-sm space-y-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="text-4xl">🗑</div>
                        <p className="font-extrabold">Delete this record?</p>
                        <p className="text-xs text-mut">
                            {delRec.staff?.name}'s attendance on {delRec.date} will be permanently removed.
                        </p>
                        <div className="flex gap-2 pt-2">
                            <Button variant="soft" className="flex-1" onClick={() => setDelRec(null)}>Cancel</Button>
                            <Button variant="danger" className="flex-1" onClick={handleDelete}>Yes, Delete</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
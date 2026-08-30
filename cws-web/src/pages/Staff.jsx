import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Eye, EyeOff, Trash2, Power } from 'lucide-react'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import StaffModal from '@/components/staff/StaffModal'
import { ROLES, roleInfo } from '@/config/roles'
import { inr, cn } from '@/lib/utils'

export default function Staff() {
    const [filter, setFilter] = useState('ALL')
    const [open, setOpen] = useState(false)
    const [edit, setEdit] = useState(null)
    const [del, setDel] = useState(null)
    const [showPin, setShowPin] = useState({})

    const qc = useQueryClient()

    // 1. Fetch data (Rename 'data' to 'response' to avoid confusion)
    const {
        data: response,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['staff'],
        queryFn: () => api.get('/api/staff'),
    })

    // 🔥 2. FIX: Safely extract the array from the response
    // Backend returns { data: [...] }, so we check nested structures
    const rawStaff = response?.data?.data || response?.data || []
    const staff = Array.isArray(rawStaff) ? rawStaff : []

    // 3. Now filter is safe
    const active = staff.filter((s) => s.isActive)

    const monthlyTotal = active.reduce(
        (sum, s) => sum + (Number(s.salary) || 0),
        0
    )

    // 🔥 4. FIX: Handle role as object (s.role?.roleCode)
    const list = staff.filter(
        (s) => filter === 'ALL' || s.role?.roleCode === filter
    )

    const toggleActive = async (s) => {
        // Never allow owner to be disabled
        if (s.role?.roleCode === 'OWNER') {
            toast.error('Owner cannot be deactivated 🔒')
            return
        }

        try {
            await api.patch(`/api/staff/${s.id}`, {
                isActive: !s.isActive,
            })

            toast.success(
                !s.isActive
                    ? `${s.name} active ✅`
                    : `${s.name} inactive 🌴`
            )

            qc.invalidateQueries({ queryKey: ['staff'] })
        } catch (e) {
            toast.error('Failed to update staff status')
        }
    }

    const requestDelete = (s) => {
        // OWNER DELETE PROTECTION
        if (s.role?.roleCode === 'OWNER') {
            toast.error('Owner account cannot be deleted 🔒')
            return
        }

        setDel(s)
    }

    const doDelete = async () => {
        if (!del) return

        // Double protection
        if (del.role?.roleCode === 'OWNER') {
            toast.error('Owner account cannot be deleted 🔒')
            setDel(null)
            return
        }

        try {
            await api.delete(`/api/staff/${del.id}`)

            toast.success(`${del.name} removed 🗑`)

            qc.invalidateQueries({ queryKey: ['staff'] })
            setDel(null)
        } catch (e) {
            toast.error(
                e?.response?.data?.message ||
                e?.message ||
                'Failed to remove staff'
            )
        }
    }

    const openAdd = () => {
        setEdit(null)
        setOpen(true)
    }

    const openEdit = (s) => {
        setEdit(s)
        setOpen(true)
    }

    const closeModal = () => {
        setOpen(false)
        setEdit(null)
    }

    const togglePin = (id) => {
        setShowPin((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    return (
        <div className="space-y-4">
            {/* HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h1 className="text-2xl font-extrabold">
                        👥 Staff & Employees
                    </h1>

                    <p className="text-xs text-mut font-bold mt-0.5">
                        {active.length} active · Monthly payroll:{' '}
                        {inr(monthlyTotal)}
                    </p>
                </div>

                <Button onClick={openAdd}>
                    <Plus size={16} className="inline mr-1" />
                    Add Staff
                </Button>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                    onClick={() => setFilter('ALL')}
                    className={cn(
                        'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border',
                        filter === 'ALL'
                            ? 'bg-primary text-bg border-primary'
                            : 'bg-card text-mut border-line'
                    )}
                >
                    All ({staff.length})
                </button>

                {ROLES.map((r) => (
                    <button
                        key={r.id}
                        onClick={() => setFilter(r.id)}
                        className={cn(
                            'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border',
                            filter === r.id
                                ? 'bg-primary text-bg border-primary'
                                : 'bg-card text-mut border-line'
                        )}
                    >
                        {r.l} (
                        {staff.filter((s) => s.role?.roleCode === r.id).length}
                        )
                    </button>
                ))}
            </div>

            {/* LOADING */}
            {isLoading && (
                <p className="text-mut text-center py-12">
                    Loading staff…
                </p>
            )}

            {/* ERROR */}
            {isError && !isLoading && (
                <Card className="p-8 text-center">
                    <p className="font-bold text-red-500">
                        Failed to load staff.
                    </p>

                    <Button
                        variant="soft"
                        className="mt-3"
                        onClick={() =>
                            qc.invalidateQueries({ queryKey: ['staff'] })
                        }
                    >
                        Try Again
                    </Button>
                </Card>
            )}

            {/* EMPTY */}
            {!isLoading && !isError && list.length === 0 && (
                <Card className="p-10 text-center">
                    <div className="text-4xl mb-2">👥</div>

                    <p className="font-extrabold">
                        No staff found
                    </p>

                    <p className="text-xs text-mut mt-1">
                        {filter === 'ALL'
                            ? 'Add your first staff member.'
                            : 'No staff in this role yet.'}
                    </p>

                    {filter === 'ALL' && (
                        <Button className="mt-4" onClick={openAdd}>
                            <Plus size={16} className="mr-1" />
                            Add Staff
                        </Button>
                    )}
                </Card>
            )}

            {/* STAFF GRID */}
            {!isLoading && !isError && list.length > 0 && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {list.map((s) => {
                        // 🔥 5. FIX: Pass roleCode to roleInfo, not the whole object
                        const role = roleInfo(s.role?.roleCode)
                        const isOwner = s.role?.roleCode === 'OWNER'

                        return (
                            <Card
                                key={s.id}
                                className={cn(
                                    'p-4 space-y-3',
                                    !s.isActive && 'opacity-55'
                                )}
                            >
                                {/* PROFILE */}
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-full bg-primary-soft text-primary grid place-items-center font-extrabold text-lg">
                                        {s.name?.[0]?.toUpperCase() || '?'}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-extrabold truncate">
                                            {s.name}
                                        </p>

                                        <p className="text-xs text-mut font-bold truncate">
                                            {role?.l || s.role?.roleCode || 'No Role'}
                                            {s.phone ? ` · ${s.phone}` : ''}
                                        </p>
                                    </div>

                                    <span
                                        className={cn(
                                            'text-[10px] font-extrabold rounded-full px-2 py-1',
                                            isOwner
                                                ? 'bg-primary/10 text-primary'
                                                : s.isActive
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-red-500/10 text-red-500'
                                        )}
                                    >
                                        {isOwner
                                            ? 'OWNER'
                                            : s.isActive
                                                ? 'ACTIVE'
                                                : 'INACTIVE'}
                                    </span>
                                </div>

                                {/* DETAILS */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg bg-bg border border-line p-2">
                                        <p className="text-[10px] text-mut font-bold">
                                            Monthly Salary
                                        </p>

                                        <p className="text-sm font-extrabold mt-0.5">
                                            {inr(Number(s.salary) || 0)}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-bg border border-line p-2">
                                        <p className="text-[10px] text-mut font-bold">
                                            Join Date
                                        </p>

                                        <p className="text-sm font-extrabold mt-0.5">
                                            {s.joinDate
                                                ? new Date(
                                                    s.joinDate
                                                ).toLocaleDateString('en-IN')
                                                : '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* PIN */}
                                <div className="flex items-center justify-between rounded-lg bg-bg border border-line px-3 py-2">
                                    <div>
                                        <p className="text-[10px] text-mut font-bold">
                                            Login / Attendance PIN
                                        </p>

                                        <p className="text-sm font-extrabold tracking-widest mt-0.5">
                                            {s.pin
                                                ? showPin[s.id]
                                                    ? s.pin
                                                    : '••••'
                                                : 'Not set'}
                                        </p>
                                    </div>

                                    {s.pin && (
                                        <button
                                            type="button"
                                            onClick={() => togglePin(s.id)}
                                            className="h-8 w-8 rounded-lg grid place-items-center text-mut hover:text-primary hover:bg-primary-soft"
                                        >
                                            {showPin[s.id] ? (
                                                <EyeOff size={16} />
                                            ) : (
                                                <Eye size={16} />
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* ACTIONS */}
                                <div className="flex gap-2 pt-1">
                                    <Button
                                        variant="soft"
                                        className="flex-1"
                                        onClick={() => openEdit(s)}
                                    >
                                        <Pencil size={15} className="mr-1" />
                                        Edit
                                    </Button>

                                    {!isOwner && (
                                        <Button
                                            variant="soft"
                                            onClick={() => toggleActive(s)}
                                            title={
                                                s.isActive
                                                    ? 'Make inactive'
                                                    : 'Make active'
                                            }
                                        >
                                            <Power size={15} />
                                        </Button>
                                    )}

                                    {!isOwner && (
                                        <Button
                                            variant="soft"
                                            onClick={() => requestDelete(s)}
                                            title="Delete staff"
                                        >
                                            <Trash2
                                                size={15}
                                                className="text-red-500"
                                            />
                                        </Button>
                                    )}
                                </div>

                                {isOwner && (
                                    <p className="text-[10px] text-mut font-bold text-center">
                                        🔒 Owner account is protected
                                    </p>
                                )}
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* STAFF MODAL */}
            <StaffModal
                open={open}
                onClose={closeModal}
                initial={edit}
                onSaved={() => {
                    qc.invalidateQueries({
                        queryKey: ['staff'],
                    })
                }}
            />

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                open={!!del}
                onClose={() => setDel(null)}
                onConfirm={doDelete}
                title="Delete Staff?"
                message={
                    del
                        ? `Are you sure you want to remove ${del.name}? This action cannot be undone.`
                        : ''
                }
                confirmText="Delete"
            />
        </div>
    )
}
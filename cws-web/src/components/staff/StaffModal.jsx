import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ROLES } from '@/config/roles'

const BLANK = {
    name: '',
    phone: '',
    role: '',
    salary: '',
    payrollType: 'FIXED', 
    pin: '',
    joinDate: new Date().toISOString().split('T')[0],
}

const generatePin = () => String(Math.floor(1000 + Math.random() * 9000))

export default function StaffModal({ open, onClose, initial, onSaved }) {
    const [f, setF] = useState(BLANK)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            if (initial) {
                setF({
                    name: initial.name || '',
                    phone: initial.phone || '',
                    role: initial.role || 'CASHIER',
                    salary: String(initial.salary || ''),
                    payrollType: initial.payrollType || 'FIXED', // 👈 Load existing type
                    pin: initial.pin === '••••' ? '' : (initial.pin || ''),
                    joinDate: initial.joinDate
                        ? new Date(initial.joinDate).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0],
                })
            } else {
                setF({ ...BLANK, pin: generatePin() })
            }
        }
    }, [open, initial])

    const save = async () => {
        if (!f.name.trim()) {
            toast.error('Name required')
            return
        }
        if (f.pin && !/^\d{4}$/.test(f.pin)) {
            toast.error('PIN must be 4 digits')
            return
        }

        setLoading(true)
        try {
            const body = {
                name: f.name.trim(),
                phone: f.phone.trim() || null,
                role: f.role,
                salary: Number(f.salary) || 0,
                payrollType: f.payrollType, // 👈 Send to backend
                pin: f.pin || null,
                joinDate: f.joinDate,
            }

            if (initial) {
                await api.patch(`/api/staff/${initial.id}`, body)
                toast.success(`${f.name} updated ✏️`)
            } else {
                await api.post('/api/staff', body)
                toast.success(`${f.name} added 👥`)
            }

            onSaved?.()
            onClose()
        } catch (e) {
            toast.error(e?.message || 'Failed to save staff')
        } finally {
            setLoading(false)
        }
    }

    // 🧮 Auto calculate Daily Wage for Admin view
    const dailyWage = f.payrollType === 'ATTENDANCE' && f.salary
        ? (Number(f.salary) / 30).toFixed(0)
        : 0

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={initial ? '✏️ Edit Staff' : '➕ Add Staff'}
        >
            <div className="space-y-3">
                {/* NAME + PHONE */}
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        placeholder="Name"
                        value={f.name}
                        onChange={(e) => setF({ ...f, name: e.target.value })}
                    />
                    <Input
                        placeholder="Phone"
                        value={f.phone}
                        onChange={(e) => setF({ ...f, phone: e.target.value })}
                    />
                </div>

                {/* ROLE + SALARY */}
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={f.role}
                        onChange={(e) => setF({ ...f, role: e.target.value })}
                        className="rounded-lg bg-bg border border-line px-3 py-2.5 text-sm outline-none focus:border-primary"
                    >
                        {ROLES.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.l}
                            </option>
                        ))}
                    </select>
                    <Input
                        type="number"
                        placeholder="Monthly Base ₹"
                        value={f.salary}
                        onChange={(e) => setF({ ...f, salary: e.target.value })}
                    />
                </div>

                {/* 👇 NEW: PAYROLL TYPE (Admin Only) */}
                <div className="rounded-lg bg-bg border border-line p-3 space-y-2">
                    <p className="text-[10px] font-bold text-mut uppercase tracking-wider">
                        💰 Payroll Mode (Admin Decision)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setF({ ...f, payrollType: 'FIXED' })}
                            className={`rounded-lg border p-2 text-xs font-bold transition ${f.payrollType === 'FIXED'
                                    ? 'bg-primary text-bg border-primary'
                                    : 'bg-card text-mut border-line'
                                }`}
                        >
                            🏢 Fixed Salary
                        </button>
                        <button
                            type="button"
                            onClick={() => setF({ ...f, payrollType: 'ATTENDANCE' })}
                            className={`rounded-lg border p-2 text-xs font-bold transition ${f.payrollType === 'ATTENDANCE'
                                    ? 'bg-primary text-bg border-primary'
                                    : 'bg-card text-mut border-line'
                                }`}
                        >
                            Attendance Based
                        </button>
                    </div>

                    {/* Smart Hint for Admin */}
                    {f.payrollType === 'ATTENDANCE' && f.salary > 0 && (
                        <p className="text-[11px] text-amber-400 font-bold bg-amber-500/10 rounded px-2 py-1">
                            💡 Daily Wage: ₹{dailyWage} (₹{f.salary} / 30 days)
                        </p>
                    )}
                </div>

                {/* PIN + JOIN DATE */}
                <div className="grid grid-cols-3 gap-2">
                    <Input
                        type="text"
                        maxLength={4}
                        placeholder="4-digit PIN"
                        value={f.pin}
                        onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, '') })}
                    />
                    <Button
                        variant="soft"
                        onClick={() => setF({ ...f, pin: generatePin() })}
                        title="Generate random PIN"
                    >
                        <RefreshCw size={14} className="mr-1" />
                        Gen
                    </Button>
                    <Input
                        type="date"
                        value={f.joinDate}
                        onChange={(e) => setF({ ...f, joinDate: e.target.value })}
                    />
                </div>

                <Button
                    className="w-full"
                    onClick={save}
                    disabled={loading || !f.name.trim()}
                >
                    {loading ? 'Saving…' : initial ? 'Update Staff' : 'Add Staff 👥'}
                </Button>
            </div>
        </Modal>
    )
}
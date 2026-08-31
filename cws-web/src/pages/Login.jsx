import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Lock, User, Fingerprint, Loader2, Shield, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthProvider'
import { cn } from '@/lib/utils'

export default function Login() {
    const [staffList, setStaffList] = useState([])
    const [staffId, setStaffId] = useState('')
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingStaff, setLoadingStaff] = useState(true)
    const { login, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/app', { replace: true })
        }
    }, [isAuthenticated, navigate])

    // 🔥 FIX: Load active staff list with proper response handling
    useEffect(() => {
        const loadStaff = async () => {
            try {
                setLoadingStaff(true)
                const response = await api.get('/api/staff')

                // 🔥 Handle different response structures
                let staffData = []
                if (response?.data?.data) {
                    staffData = response.data.data
                } else if (response?.data) {
                    staffData = response.data
                } else if (Array.isArray(response)) {
                    staffData = response
                }

                // Filter only active staff
                const activeStaff = Array.isArray(staffData)
                    ? staffData.filter((s) => s.isActive !== false)
                    : []

                console.log('📋 Loaded staff:', activeStaff.length, 'members')
                setStaffList(activeStaff)

                if (activeStaff.length === 0) {
                    toast.warning('No active staff found in database')
                }
            } catch (error) {
                console.error('Failed to load staff:', error)
                toast.error('Failed to load staff list')
                setStaffList([])
            } finally {
                setLoadingStaff(false)
            }
        }
        loadStaff()
    }, [])

    const handleLogin = async (e) => {
        e?.preventDefault()

        if (!staffId) {
            toast.error('Please select a staff member')
            return
        }
        if (pin.length !== 4) {
            toast.error('PIN must be exactly 4 digits')
            return
        }

        setLoading(true)
        try {
            const device = `${navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'} / ${navigator.platform}`
            const res = await login(staffId, pin, device)

            if (res?.success) {
                toast.success(`Welcome back, ${res.user?.name || 'User'}! 👋`)
                navigate('/app', { replace: true })
            }
        } catch (err) {
            console.error('Login error:', err)
            const errorMsg = err?.response?.data?.error || err?.message || 'Login failed'
            toast.error(errorMsg)
            setPin('') // Clear PIN on failure
        } finally {
            setLoading(false)
        }
    }

    const handlePinInput = (value) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 4)
        setPin(cleaned)
    }

    const selectedStaff = staffList.find((s) => s.id === staffId)

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-primary/30 mb-4">
                        <Shield className="text-bg" size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-ink">CWS Billing</h1>
                    <p className="text-sm text-mut mt-1">Sign in to continue</p>
                </div>

                {/* Login Card */}
                <div className="bg-card border border-line rounded-2xl shadow-xl p-6 space-y-5">
                    {/* Staff Selector */}
                    <div>
                        <label className="block text-[10px] font-bold text-mut uppercase tracking-wider mb-2">
                            Select Staff
                        </label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mut" />
                            <select
                                value={staffId}
                                onChange={(e) => setStaffId(e.target.value)}
                                disabled={loadingStaff || loading}
                                className="w-full pl-10 pr-4 py-3 bg-bg border border-line rounded-xl focus:outline-none focus:border-primary text-sm text-ink transition disabled:opacity-50"
                            >
                                <option value="">
                                    {loadingStaff ? 'Loading staff...' : '— Choose staff —'}
                                </option>
                                {staffList.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.role?.roleCode ? `(${s.role.roleCode})` : s.roleId ? '' : '(No Role)'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedStaff && !selectedStaff.roleId && (
                            <p className="text-[10px] text-amber-400 mt-1.5 flex items-center gap-1">
                                <AlertCircle size={10} />
                                This staff has no role assigned. Contact admin.
                            </p>
                        )}
                    </div>

                    {/* PIN Input */}
                    <div>
                        <label className="block text-[10px] font-bold text-mut uppercase tracking-wider mb-2">
                            4-Digit PIN
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mut" />
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => handlePinInput(e.target.value)}
                                disabled={loading || !staffId}
                                placeholder="••••"
                                className="w-full pl-10 pr-4 py-3 bg-bg border border-line rounded-xl focus:outline-none focus:border-primary text-center text-2xl font-extrabold tracking-[0.5em] text-ink transition disabled:opacity-50"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && pin.length === 4) handleLogin(e)
                                }}
                            />
                        </div>

                        {/* PIN Dots Indicator */}
                        <div className="flex justify-center gap-2 mt-3">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        'w-2.5 h-2.5 rounded-full transition-all',
                                        pin.length > i ? 'bg-primary scale-110' : 'bg-line'
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        disabled={loading || !staffId || pin.length !== 4}
                        className={cn(
                            'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all',
                            'bg-primary text-bg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed',
                            'shadow-lg shadow-primary/20 hover:shadow-primary/30'
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                <Fingerprint size={16} />
                                Sign In
                            </>
                        )}
                    </button>

                    {/* Help Text */}
                    <p className="text-[10px] text-mut text-center pt-2 border-t border-line">
                        Forgot PIN? Contact system administrator
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] text-mut mt-6">
                    CWS Billing System v1.0 · Secure Login
                </p>
            </div>
        </div>
    )
}
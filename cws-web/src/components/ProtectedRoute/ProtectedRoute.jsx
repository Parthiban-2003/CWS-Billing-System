import { Navigate, useLocation } from 'react-router-dom'
import { useAuth , AuthProvider } from '@/contexts/AuthProvider'
import { ShieldAlert } from 'lucide-react'

export default function ProtectedRoute({ children, permission }) {
    const { user, loading, hasPermission } = useAuth()
    const location = useLocation()

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-mut font-bold text-sm">Loading...</p>
                </div>
            </div>
        )
    }

    // Not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Permission check
    if (permission && !hasPermission(permission)) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="bg-card border border-rose-500/30 rounded-2xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="text-rose-400" size={32} />
                    </div>
                    <h2 className="text-xl font-extrabold text-ink mb-2">Access Denied</h2>
                    <p className="text-sm text-mut mb-4">
                        You don't have permission to access this page.
                    </p>
                    <p className="text-[10px] text-mut font-bold bg-bg border border-line rounded-lg p-2">
                        Required: <code className="text-primary">{permission}</code>
                    </p>
                </div>
            </div>
        )
    }

    return children
}
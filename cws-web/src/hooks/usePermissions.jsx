import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthProvider'

export function usePermissions() {
    const { user, permissions, hasPermission, hasAnyPermission } = useAuth()

    // Get user roles as array
    const roles = useMemo(() => {
        if (!user?.role) return []
        return [user.role.toUpperCase()]
    }, [user?.role])

    // Check if user is OWNER (super admin equivalent)
    const isOwner = roles.includes('OWNER')
    const isManager = roles.includes('MANAGER')
    const isCashier = roles.includes('CASHIER')
    const isWaiter = roles.includes('WAITER')
    const isKitchen = roles.includes('KITCHEN')

    // Helper: Check specific permission
    const can = (module, action) => {
        const code = `${module.toUpperCase()}.${action.toUpperCase()}`
        return hasPermission(code)
    }

    // Shorthand helpers (like uploaded example)
    const canView = (module) => can(module, 'READ') || can(module, 'VIEW')
    const canCreate = (module) => can(module, 'CREATE')
    const canUpdate = (module) => can(module, 'UPDATE')
    const canDelete = (module) => can(module, 'DELETE')
    const canManage = (module) => can(module, 'MANAGE')

    return {
        user,
        roles,
        permissions,
        isOwner,
        isManager,
        isCashier,
        isWaiter,
        isKitchen,
        hasPermission,
        hasAnyPermission,
        can,
        canView,
        canCreate,
        canUpdate,
        canDelete,
        canManage,
    }
}
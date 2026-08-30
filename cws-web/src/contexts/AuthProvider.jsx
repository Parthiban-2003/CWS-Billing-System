import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    decodeToken,
    isTokenExpired,
} from '@/lib/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [permissions, setPermissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshTimer, setRefreshTimer] = useState(null)

    useEffect(() => {
        const token = getAccessToken()
        if (token && !isTokenExpired(token)) {
            const payload = decodeToken(token)
            setUser(payload)
            setPermissions(payload.permissions || [])
            scheduleRefresh(token)
        }
        setLoading(false)
    }, [])

    const scheduleRefresh = useCallback((token) => {
        if (refreshTimer) clearTimeout(refreshTimer)
        const payload = decodeToken(token)
        if (!payload?.exp) return

        const expiresIn = payload.exp * 1000 - Date.now()
        const refreshIn = Math.max(expiresIn - 60000, 10000)

        const timer = setTimeout(async () => {
            try {
                const refreshToken = getRefreshToken()
                if (!refreshToken) {
                    logout()
                    return
                }
                const res = await api.post('/api/auth/refresh', { refreshToken })
                if (res?.accessToken) {
                    setTokens(res.accessToken, null)
                    const newPayload = decodeToken(res.accessToken)
                    setUser(newPayload)
                    setPermissions(newPayload.permissions || [])
                    scheduleRefresh(res.accessToken)
                }
            } catch (e) {
                console.error('Refresh failed:', e)
                logout()
            }
        }, refreshIn)

        setRefreshTimer(timer)
    }, [refreshTimer])

    const login = async (staffId, pin, device) => {
        const res = await api.post('/api/auth/login', { staffId, pin, device })
        if (res?.accessToken) {
            setTokens(res.accessToken, res.refreshToken)
            const payload = decodeToken(res.accessToken)
            setUser(payload)
            setPermissions(payload.permissions || [])
            scheduleRefresh(res.accessToken)
            return { success: true, user: payload }
        }
        throw new Error(res?.error || 'Login failed')
    }

    const logout = async () => {
        try {
            const refreshToken = getRefreshToken()
            if (refreshToken) {
                await api.post('/api/auth/logout', { refreshToken }).catch(() => { })
            }
        } finally {
            clearTokens()
            setUser(null)
            setPermissions([])
            if (refreshTimer) clearTimeout(refreshTimer)
        }
    }

    // 🔐 Robust permission check
    const hasPermission = useCallback(
        (perm) => {
            if (!user) return false

            // OWNER always has access
            const role = user.role?.toUpperCase() || ''
            if (role === 'OWNER' || role === 'ADMIN') return true

            // Safety fallback
            if (!permissions || permissions.length === 0) {
                console.warn('⚠️ No permissions loaded for user:', user.name, user.role)
                return true
            }

            return permissions.includes(perm)
        },
        [user, permissions]
    )

    const hasAnyPermission = useCallback(
        (perms) => {
            if (!user) return false
            const role = user.role?.toUpperCase() || ''
            if (role === 'OWNER' || role === 'ADMIN') return true
            if (!permissions || permissions.length === 0) return true
            return perms.some((p) => permissions.includes(p))
        },
        [user, permissions]
    )

    const value = {
        user,
        permissions,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
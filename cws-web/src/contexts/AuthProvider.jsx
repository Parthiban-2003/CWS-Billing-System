"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { api } from "@/lib/api";
import {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    decodeToken,
    isTokenExpired,
} from "@/lib/auth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshTimerRef = useRef(null);

    const scheduleRefresh = useCallback((token) => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }

        const payload = decodeToken(token);

        if (!payload?.exp) {
            return;
        }

        const expiresIn = payload.exp * 1000 - Date.now();

        // Refresh 1 minute before expiry. Minimum delay: 10 seconds.
        const refreshIn = Math.max(expiresIn - 60000, 10000);

        refreshTimerRef.current = setTimeout(async () => {
            try {
                const refreshToken = getRefreshToken();

                if (!refreshToken) {
                    await logout();
                    return;
                }

                const res = await api.post("/api/auth/refresh", {
                    refreshToken,
                });

                if (!res?.accessToken) {
                    throw new Error("No access token returned");
                }

                setTokens(res.accessToken, res.refreshToken ?? null);

                const newPayload = decodeToken(res.accessToken);

                setUser(newPayload);
                setPermissions(
                    Array.isArray(newPayload?.permissions)
                        ? newPayload.permissions
                        : []
                );

                scheduleRefresh(res.accessToken);
            } catch (error) {
                console.error("Refresh failed:", error);
                await logout();
            }
        }, refreshIn);
    }, []);

    useEffect(() => {
        const token = getAccessToken();

        if (token && !isTokenExpired(token)) {
            const payload = decodeToken(token);

            setUser(payload);

            setPermissions(
                Array.isArray(payload?.permissions)
                    ? payload.permissions
                    : []
            );

            scheduleRefresh(token);
        }

        setLoading(false);

        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
            }
        };
    }, [scheduleRefresh]);

    const login = async (staffId, pin, device) => {
        const res = await api.post("/api/auth/login", {
            staffId,
            pin,
            device,
        });

        if (!res?.accessToken) {
            throw new Error(res?.error || "Login failed");
        }

        setTokens(res.accessToken, res.refreshToken);

        const payload = decodeToken(res.accessToken);

        setUser(payload);

        setPermissions(
            Array.isArray(payload?.permissions)
                ? payload.permissions
                : []
        );

        scheduleRefresh(res.accessToken);

        return {
            success: true,
            user: payload,
        };
    };

    const logout = async () => {
        try {
            const refreshToken = getRefreshToken();

            if (refreshToken) {
                await api
                    .post("/api/auth/logout", { refreshToken })
                    .catch(() => { });
            }
        } finally {
            clearTokens();

            setUser(null);
            setPermissions([]);

            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
        }
    };

    // 🔥 FIX: Add hasPermission function
    const hasPermission = useCallback(
        (perm) => {
            if (!user) return false;
            const role = user.role?.toUpperCase() || "";

            // OWNER / ADMIN / SUPERADMIN have full access
            if (role === "OWNER" || role === "ADMIN" || role === "SUPERADMIN") {
                return true;
            }

            // Safety fallback: if permissions array is empty but user is logged in, allow
            if (!permissions || permissions.length === 0) {
                console.warn("⚠️ No permissions loaded for user:", user.name, user.role);
                return true;
            }

            return permissions.includes(perm);
        },
        [user, permissions]
    );

    // 🔥 FIX: Add hasAnyPermission function
    const hasAnyPermission = useCallback(
        (perms) => {
            if (!user) return false;
            const role = user.role?.toUpperCase() || "";

            if (role === "OWNER" || role === "ADMIN" || role === "SUPERADMIN") {
                return true;
            }

            if (!permissions || permissions.length === 0) return true;

            return perms.some((p) => permissions.includes(p));
        },
        [user, permissions]
    );

    const value = {
        user,
        permissions,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,      // 🔥 ADDED
        hasAnyPermission,   // 🔥 ADDED
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return ctx;
};
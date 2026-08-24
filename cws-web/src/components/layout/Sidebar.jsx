import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { PanelLeftClose, PanelLeftOpen, LogOut, User } from 'lucide-react'
import { NAV } from '@/config/nav'
import { useUIStore } from '@/stores/useUIStore'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function Sidebar() {
    const collapsed = useUIStore((s) => s.collapsed)
    const toggle = useUIStore((s) => s.toggle)
    const { hasPermission, user, logout } = useAuth()

    const { data: brand } = useQuery({
        queryKey: ['settings'],
        queryFn: () => api.get('/api/settings'),
    })

    // 🔐 FILTER NAV BASED ON PERMISSIONS (Like uploaded example)
    const visibleNav = NAV.filter((item) => {
        // If no permission field, show to everyone
        if (!item.permission) return true
        // Check if user has permission
        return hasPermission(item.permission)
    })

    return (
        <aside
            className={cn(
                'hidden lg:flex flex-col border-r border-line bg-card transition-all',
                collapsed ? 'w-16' : 'w-60'
            )}
        >
            {/* BRAND HEADER */}
            <div className="flex items-center gap-2.5 px-4 h-16 border-b border-line shrink-0">
                {brand?.logo ? (
                    <img src={brand.logo} alt="logo" className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                    <span className="text-xl">🚀</span>
                )}
                {!collapsed && (
                    <p className="font-extrabold text-sm truncate">
                        {brand?.companyName || 'CWS Billing'}
                    </p>
                )}
            </div>

            {/* 👤 USER INFO */}
            {!collapsed && user && (
                <div className="px-3 py-2.5 border-b border-line bg-primary/5">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-primary text-bg grid place-items-center font-extrabold text-sm shrink-0">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-ink truncate">{user.name}</p>
                            <p className="text-[10px] text-mut font-bold truncate">
                                {user.role}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔐 NAV — FILTERED BY PERMISSIONS */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                {visibleNav.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        title={item.label}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition',
                                isActive
                                    ? 'bg-primary text-bg'
                                    : 'text-mut hover:bg-bg hover:text-ink',
                                collapsed && 'justify-center px-0'
                            )
                        }
                    >
                        <item.icon size={18} />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}

                {/* Empty state */}
                {visibleNav.length === 0 && !collapsed && (
                    <div className="text-center py-6 px-2">
                        <p className="text-[10px] text-mut font-bold">
                            No permissions assigned
                        </p>
                    </div>
                )}
            </nav>

            {/* 🚪 LOGOUT */}
            <div className="p-3 border-t border-line">
                <button
                    onClick={logout}
                    className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition',
                        collapsed && 'justify-center px-0'
                    )}
                    title="Logout"
                >
                    <LogOut size={18} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>

            {/*  COLLAPSE TOGGLE */}
            <button
                onClick={toggle}
                className="flex items-center justify-center gap-2 border-t border-line py-3 text-xs font-bold text-mut hover:text-ink shrink-0"
            >
                {collapsed ? (
                    <PanelLeftOpen size={16} />
                ) : (
                    <>
                        <PanelLeftClose size={16} /> Collapse
                    </>
                )}
            </button>
        </aside>
    )
}
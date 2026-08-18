import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NAV } from '@/config/nav'
import { useUIStore } from '@/stores/useUIStore'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function Sidebar() {
    const collapsed = useUIStore((s) => s.collapsed)
    const toggle = useUIStore((s) => s.toggle)

    const { data: brand } = useQuery({
        queryKey: ['settings'],
        queryFn: () => api.get('/api/settings'),
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

            {/* NAV */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                {NAV.map((item) => (
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
            </nav>

            {/* COLLAPSE */}
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
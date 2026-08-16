import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Rocket, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NAV } from '@/config/nav'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/useUIStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

export default function Sidebar() {
    const { t } = useTranslation()
    const { collapsed, toggle } = useUIStore()
    const companyName = useSettingsStore((s) => s.companyName)
    const logo = useSettingsStore((s) => s.logo)

    return (
        <aside className={cn(
            'fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col bg-card border-r border-line transition-all',
            collapsed ? 'w-20' : 'w-64'
        )}>
            <div className="flex items-center gap-2.5 h-16 px-4 border-b border-line">
                {logo ? <img src={logo} alt="logo" className="h-8 w-8 rounded-lg object-cover" /> : <Rocket className="text-primary" />}
                {!collapsed && <span className="font-extrabold truncate">{companyName}</span>}
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV.map(({ to, key, icon: Icon, end }) => (
                    <NavLink key={to} to={to} end={end} title={t(key)}
                        className={({ isActive }) => cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition',
                            isActive ? 'bg-primary text-bg shadow-lg' : 'text-mut hover:bg-primary-soft hover:text-ink'
                        )}>
                        <Icon size={18} className="shrink-0" />
                        {!collapsed && <span className="truncate">{t(key)}</span>}
                    </NavLink>
                ))}
            </nav>

            <button onClick={toggle}
                className="m-3 flex items-center justify-center gap-2 rounded-lg py-2 text-mut hover:text-ink hover:bg-primary-soft text-xs font-bold">
                {collapsed ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} /> Collapse</>}
            </button>
        </aside>
    )
}
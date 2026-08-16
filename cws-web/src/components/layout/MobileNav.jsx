import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NAV } from '@/config/nav'
import { cn } from '@/lib/utils'

export default function MobileNav() {
    const { t } = useTranslation()
    return (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-line flex">
            {NAV.slice(0, 5).map(({ to, key, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end}
                    className={({ isActive }) => cn(
                        'flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold',
                        isActive ? 'text-primary' : 'text-mut'
                    )}>
                    <Icon size={19} />
                    {t(key)}
                </NavLink>
            ))}
        </nav>
    )
}
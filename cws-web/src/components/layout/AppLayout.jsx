import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import { useUIStore } from '@/stores/useUIStore'
import { cn } from '@/lib/utils'

export default function AppLayout() {
    const collapsed = useUIStore((s) => s.collapsed)
    return (
        <div className="min-h-screen bg-bg text-ink">
            <Sidebar />
            <div className={cn('flex flex-col min-h-screen transition-all', collapsed ? 'lg:pl-20' : 'lg:pl-64')}>
                <Topbar />
                <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
                    <Outlet />
                </main>
            </div>
            <MobileNav />
        </div>
    )
}
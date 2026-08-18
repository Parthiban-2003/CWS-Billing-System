import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'

export default function AppLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-bg text-ink">
            {/* LEFT — SIDEBAR (fixed full height) */}
            <Sidebar />

            {/* RIGHT — TOPBAR + CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
                    <Outlet />
                </main>
            </div>

            {/* MOBILE BOTTOM NAV */}
            <MobileNav />
        </div>
    )
}
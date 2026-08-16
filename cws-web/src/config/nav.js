import { LayoutDashboard, ShoppingCart, Receipt, Package, UtensilsCrossed, Armchair, Users, BarChart3, Wallet, Settings } from 'lucide-react'

export const NAV = [
    { to: '/app', key: 'dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/pos', key: 'pos', icon: ShoppingCart },
    { to: '/app/menu', key: 'menu', icon: UtensilsCrossed },
    { to: '/app/tables', key: 'tables', icon: Armchair },
    { to: '/app/invoices', key: 'invoices', icon: Receipt },
    { to: '/app/inventory', key: 'inventory', icon: Package },
    { to: '/app/customers', key: 'customers', icon: Users },
    { to: '/app/reports', key: 'reports', icon: BarChart3 },
    { to: '/app/expenses', key: 'expenses', icon: Wallet },
    { to: '/app/settings', key: 'settings', icon: Settings },
]
import {
    LayoutDashboard,
    ShoppingCart,
    Utensils,
    Armchair,
    ReceiptText,
    Package,
    Users,
    BarChart3,
    Wallet,
    Settings,
    TrendingUp,
} from 'lucide-react'

export const NAV = [
    { path: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/app/pos', label: 'POS', icon: ShoppingCart },
    { path: '/app/menu', label: 'Menu', icon: Utensils },
    { path: '/app/tables', label: 'Tables', icon: Armchair },
    { path: '/app/invoices', label: 'Invoices', icon: ReceiptText },
    { path: '/app/inventory', label: 'Inventory', icon: Package },
    { path: '/app/customers', label: 'Customers', icon: Users },
    { path: '/app/reports', label: 'Reports', icon: BarChart3 },
    { path: '/app/profit-loss', label: 'Profit & Loss', icon: TrendingUp },
    { path: '/app/expenses', label: 'Expenses', icon: Wallet },
    { path: '/app/settings', label: 'Settings', icon: Settings },
]
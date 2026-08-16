import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Settings from '@/pages/Settings'
import Placeholder from '@/pages/Placeholder'
import POS from '@/pages/POS'
import Menu from '@/pages/Menu'
import Tables from '@/pages/Tables'
import Kitchen from '@/pages/Kitchen'
import Waiter from '@/pages/Waiter'
import Invoices from '@/pages/Invoices'
import Inventory from '@/pages/Inventory'
import Customers from '@/pages/Customers'
import Reports from '@/pages/Reports'
import Expenses from '@/pages/Expenses'

export const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/app" replace /> },
    {
        path: '/app',
        element: <AppLayout />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'pos', element: <POS /> },
            { path: 'menu', element: <Menu /> },
            { path: 'tables', element: <Tables /> },
            { path: 'invoices', element: <Invoices /> },
            { path: 'inventory', element: <Inventory /> },
            { path: 'customers', element: <Customers /> },
            { path: 'reports', element: <Reports /> },
            { path: 'expenses', element: <Expenses /> },
            { path: 'settings', element: <Settings /> },
        ],
    },
    { path: '/kitchen', element: <Kitchen /> },
    { path: '/waiter', element: <Waiter /> },
])
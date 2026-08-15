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

export const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/app" replace /> },
    {
        path: '/app', element: <AppLayout />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'pos', element: <POS /> },
            { path: 'menu', element: <Menu /> },
            { path: 'tables', element: <Tables /> },
            { path: 'invoices', element: <Placeholder title="Invoices" /> },
            { path: 'inventory', element: <Placeholder title="Inventory" /> },
            { path: 'customers', element: <Placeholder title="Customers" /> },
            { path: 'reports', element: <Placeholder title="Reports" /> },
            { path: 'expenses', element: <Placeholder title="Expenses" /> },
            { path: 'users', element: <Placeholder title="Users & Roles" /> },
            { path: 'settings', element: <Settings /> },
        ],
    },
])
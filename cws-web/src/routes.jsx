import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// Auth
import { AuthProvider } from '@/contexts/AuthProvider'
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute'

// Pages
import AppLayout from '@/components/layout/AppLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Settings from '@/pages/Settings'
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
import ProfitLoss from '@/pages/ProfitLoss'
import Reservations from '@/pages/Reservations'
import Staff from '@/pages/Staff'
import Attendance from '@/pages/Attendance'
import Payroll from '@/pages/Payroll'
import UserPermissionsPage from '@/pages/UserPermissions'

const queryClient = new QueryClient()

// 🔐 Router Definition
export const router = createBrowserRouter([
    // 🌐 PUBLIC ROUTE
    { path: '/login', element: <Login /> },

    // 🔒 PROTECTED APP ROUTES
    {
        path: '/app',
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute permission="DASHBOARD.READ">
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'pos',
                element: (
                    <ProtectedRoute permission="POS.READ">
                        <POS />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu',
                element: (
                    <ProtectedRoute permission="MENU.READ">
                        <Menu />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'tables',
                element: (
                    <ProtectedRoute permission="POS.READ">
                        <Tables />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'invoices',
                element: (
                    <ProtectedRoute permission="INVOICES.READ">
                        <Invoices />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'inventory',
                element: (
                    <ProtectedRoute permission="INVENTORY.READ">
                        <Inventory />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'customers',
                element: (
                    <ProtectedRoute permission="CUSTOMERS.READ">
                        <Customers />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'staff',
                element: (
                    <ProtectedRoute permission="STAFF.READ">
                        <Staff />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'user-permissions',
                element: (
                    <ProtectedRoute permission="ROLES.READ">
                        <UserPermissionsPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'reports',
                element: (
                    <ProtectedRoute permission="REPORTS.READ">
                        <Reports />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'expenses',
                element: (
                    <ProtectedRoute permission="PAYROLL.READ">
                        <Expenses />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'settings',
                element: (
                    <ProtectedRoute permission="SETTINGS.READ">
                        <Settings />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'profit-loss',
                element: (
                    <ProtectedRoute permission="PNL.READ">
                        <ProfitLoss />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'reservations',
                element: (
                    <ProtectedRoute permission="POS.READ">
                        <Reservations />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'attendance',
                element: (
                    <ProtectedRoute permission="ATTENDANCE.READ">
                        <Attendance />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'payroll',
                element: (
                    <ProtectedRoute permission="PAYROLL.READ">
                        <Payroll />
                    </ProtectedRoute>
                ),
            },
        ],
    },

    // 🍳 KITCHEN / 🤵 WAITER (Separate auth — PIN only, no sidebar)
    { path: '/kitchen', element: <Kitchen /> },
    { path: '/waiter', element: <Waiter /> },

    // 🔄 DEFAULT REDIRECT
    { path: '/', element: <Navigate to="/app" replace /> },
    { path: '*', element: <Navigate to="/app" replace /> },
])

// 🎯 ROOT APP COMPONENT (wraps all providers)
export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
                <Toaster position="top-right" richColors />
            </AuthProvider>
        </QueryClientProvider>
    )
}
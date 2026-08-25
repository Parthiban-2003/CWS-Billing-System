import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// 1. AuthProvider-ah import pannu
import { AuthProvider } from '@/contexts/AuthProvider'

// 2. Unga main App component-ah import pannu
import App from './App'
import './index.css'

const queryClient = new QueryClient()

// 3. Root element-ah get pannu
const rootElement = document.getElementById('root')

// 4. Null check pannu (TypeScript error fix)
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  )
} else {
  console.error('Root element not found!')
}
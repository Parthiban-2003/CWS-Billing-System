import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from './routes'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { applyTheme } from '@/theme/applyTheme'

export default function App() {
  const settings = useSettingsStore()

  useEffect(() => { applyTheme(settings) }, [settings])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{ style: { background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' } }}
      />
    </>
  )
}
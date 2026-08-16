import { useKotStore } from '@/stores/useKotStore'
import { api } from '@/lib/api'

const confirm = async () => {
    const { items, table, orderType } = useCartStore.getState()
    try {
        await api.post('/api/invoices', { items, orderType, table, method, totals })
    } catch { /* offline queue — later */ }
    if (orderType === 'DINE_IN' && items.length) useKotStore.getState().addKot(items, table || '—')
    toast.success(`Invoice saved · ${inr(totals.total)} via ${method} ✅`)
    clear()
    setTendered('')
    onClose()
}
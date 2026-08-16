import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Monitor, ChefHat } from 'lucide-react'
import { useTablesStore } from '@/stores/useTablesStore'
import { useNow } from '@/hooks/useNow'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const STYLES = {
    FREE: 'border-emerald-500/30 text-emerald-400',
    OCCUPIED: 'border-primary bg-primary-soft text-primary',
    RESERVED: 'border-sky-500/40 text-sky-400',
    CLEANING: 'border-amber-500/40 text-amber-400',
}

export default function Tables() {
    const { tables, setStatus } = useTablesStore()
    const now = useNow()
    const [sel, setSel] = useState(null)
    const nav = useNavigate()

    const act = (status, msg) => { setStatus(sel.id, status); toast(msg); setSel(null) }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-extrabold">🪑 Tables</h1>
                <div className="flex gap-2">
                    <a href="/kitchen" target="_blank"><Button variant="soft"><ChefHat size={15} className="inline mr-1" />Kitchen TV</Button></a>
                    <a href="/waiter" target="_blank"><Button variant="ghost"><Monitor size={15} className="inline mr-1" />Waiter View</Button></a>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                {tables.map((t) => (
                    <button key={t.id} onClick={() => setSel(t)}
                        className={cn('rounded-xl border-2 p-4 text-center transition hover:scale-105 active:scale-95', STYLES[t.status])}>
                        <p className="text-lg font-extrabold">{t.id}</p>
                        <p className="text-[10px] font-bold mt-1">{t.status}</p>
                        {t.status === 'OCCUPIED' && <p className="text-[10px] mt-0.5 opacity-80">{Math.floor((now - t.since) / 60000)} min</p>}
                    </button>
                ))}
            </div>

            <Modal open={!!sel} onClose={() => setSel(null)} title={`🪑 Table ${sel?.id}`}>
                <div className="grid grid-cols-2 gap-2">
                    {sel?.status !== 'OCCUPIED' && <Button onClick={() => act('OCCUPIED', `Table ${sel.id} occupied 🍽`)}>Seat Customer</Button>}
                    {sel?.status === 'OCCUPIED' && <Button onClick={() => { useCartStoreSet(sel.id); nav('/app/pos') }}>Open Order →</Button>}
                    {sel?.status !== 'RESERVED' && <Button variant="soft" onClick={() => act('RESERVED', `Table ${sel.id} reserved 📅`)}>Reserve</Button>}
                    {sel?.status !== 'CLEANING' && <Button variant="soft" onClick={() => act('CLEANING', `Table ${sel.id} cleaning 🧽`)}>Cleaning</Button>}
                    {sel?.status !== 'FREE' && <Button variant="ghost" onClick={() => act('FREE', `Table ${sel.id} free ✅`)}>Mark Free</Button>}
                </div>
            </Modal>
        </div>
    )
}

function useCartStoreSet(tableId) {
    import('@/stores/useCartStore').then((m) => m.useCartStore.getState().setMeta({ table: tableId, orderType: 'DINE_IN' }))
}
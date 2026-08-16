import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ChefHat, Monitor } from 'lucide-react'
import { api } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useNow } from '@/hooks/useNow'
import { useCartStore } from '@/stores/useCartStore'
import { cn } from '@/lib/utils'

const STYLES = {
    FREE: 'border-emerald-500/30 text-emerald-400',
    OCCUPIED: 'border-primary bg-primary-soft text-primary',
    RESERVED: 'border-sky-500/40 text-sky-400',
    CLEANING: 'border-amber-500/40 text-amber-400',
}

export default function Tables() {
    const { data: tables = [], isError } = useQuery({ queryKey: ['tables'], queryFn: () => api.get('/api/tables') })
    const qc = useQueryClient()
    const now = useNow()
    const [sel, setSel] = useState(null)
    const nav = useNavigate()

    const act = async (status, msg) => {
        await api.patch(`/api/tables/${sel.id}`, { status })
        toast(msg)
        qc.invalidateQueries({ queryKey: ['tables'] })
        setSel(null)
    }

    const openOrder = (t) => {
        useCartStore.getState().setMeta({ table: t.name, orderType: 'DINE_IN' })
        nav('/app/pos')
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-extrabold">🪑 Tables</h1>
                <div className="flex gap-2">
                    <a href="/kitchen" target="_blank"><Button variant="soft"><ChefHat size={15} className="inline mr-1" />Kitchen TV</Button></a>
                    <a href="/waiter" target="_blank"><Button variant="ghost"><Monitor size={15} className="inline mr-1" />Waiter View</Button></a>
                </div>
            </div>

            {isError && (
                <p className="text-rose-400 text-sm font-bold">❌ /api/tables fail — backend terminal paaru!</p>
            )}

            <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                {tables.map((t) => (
                    <button key={t.id} onClick={() => setSel(t)}
                        className={cn('rounded-xl border-2 p-4 text-center transition hover:scale-105 active:scale-95', STYLES[t.status])}>
                        <p className="text-lg font-extrabold">{t.name}</p>
                        <p className="text-[10px] font-bold mt-1">{t.status}</p>
                        {t.status === 'OCCUPIED' && (
                            <p className="text-[10px] mt-0.5 opacity-80">{Math.floor((now - new Date(t.since)) / 60000)} min</p>
                        )}
                    </button>
                ))}
            </div>

            {tables.length === 0 && !isError && (
                <p className="text-mut text-center py-16">No tables — `pnpm exec prisma db seed` run pannu 🌱</p>
            )}

            <Modal open={!!sel} onClose={() => setSel(null)} title={`🪑 Table ${sel?.name}`}>
                <div className="grid grid-cols-2 gap-2">
                    {sel?.status !== 'OCCUPIED' && <Button onClick={() => act('OCCUPIED', `Table ${sel.name} occupied 🍽`)}>Seat Customer</Button>}
                    {sel?.status === 'OCCUPIED' && <Button onClick={() => openOrder(sel)}>Open Order →</Button>}
                    {sel?.status !== 'RESERVED' && <Button variant="soft" onClick={() => act('RESERVED', `Table ${sel.name} reserved 📅`)}>Reserve</Button>}
                    {sel?.status !== 'CLEANING' && <Button variant="soft" onClick={() => act('CLEANING', `Table ${sel.name} cleaning 🧽`)}>Cleaning</Button>}
                    {sel?.status !== 'FREE' && <Button variant="ghost" onClick={() => act('FREE', `Table ${sel.name} free ✅`)}>Mark Free</Button>}
                </div>
            </Modal>
        </div>
    )
}
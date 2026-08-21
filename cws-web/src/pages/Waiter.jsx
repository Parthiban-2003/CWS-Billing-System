import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function Waiter() {
    const { data: kots = [] } = useQuery({
        queryKey: ['kots'],
        queryFn: () => api.get('/api/kots'),
        refetchInterval: 2000,      // ✅ 2 sec — super fast
        staleTime: 0,                // ✅ Cache bypass — always fresh
        gcTime: 0,                   // ✅ Memory-la hold pannadhu
    })
    const qc = useQueryClient()

    const ready = kots.filter((k) => k.status === 'READY')
    const preparing = kots.filter((k) => k.status === 'PREPARING')

    const serve = async (k) => {
        await api.patch(`/api/kots/${k.id}`, { status: 'COMPLETED' })
        toast(`Order #${k.number} served ✅`)
        qc.invalidateQueries({ queryKey: ['kots'] })
    }

    return (
        <div className="min-h-screen bg-bg text-ink p-4 max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-extrabold">🤵 Waiter — Ready to Serve</h1>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 rounded-full px-2.5 py-1">
                    🟢 LIVE ({kots.length} orders)
                </span>
            </div>

            {ready.map((k) => (
                <Card
                    key={k.id}
                    className="p-4 flex items-center justify-between border-emerald-500/40 animate-pulse"
                >
                    <div>
                        <p className="font-extrabold">🔔 #{k.number} · Table {k.table}</p>
                        <p className="text-xs text-mut">
                            {k.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                        </p>
                    </div>
                    <Button onClick={() => serve(k)}>Served ✅</Button>
                </Card>
            ))}
            {ready.length === 0 && (
                <p className="text-mut text-center py-10">
                    No ready orders — kitchen-la prepare aagudhu 🍳
                </p>
            )}

            {preparing.length > 0 && (
                <>
                    <p className="text-xs font-extrabold text-mut pt-2">
                        ⏳ IN PROGRESS ({preparing.length})
                    </p>
                    {preparing.map((k) => (
                        <Card key={k.id} className="p-3 flex justify-between items-center opacity-70">
                            <p className="text-sm font-bold">#{k.number} · Table {k.table}</p>
                            <span className="text-[10px] font-bold text-amber-400">PREPARING…</span>
                        </Card>
                    ))}
                </>
            )}
        </div>
    )
}
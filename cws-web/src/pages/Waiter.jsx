import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function Waiter() {
    const { data: kots = [] } = useQuery({ queryKey: ['kots'], queryFn: () => api.get('/api/kots'), refetchInterval: 5000 })
    const qc = useQueryClient()
    const ready = kots.filter((k) => k.status === 'READY')

    const serve = async (k) => {
        await api.patch(`/api/kots/${k.id}`, { status: 'COMPLETED' })
        toast(`Order #${k.number} served ✅`)
        qc.invalidateQueries({ queryKey: ['kots'] })
    }

    return (
        <div className="min-h-screen bg-bg text-ink p-4 max-w-xl mx-auto space-y-4">
            <h1 className="text-xl font-extrabold">🤵 Waiter — Ready to Serve</h1>
            {ready.map((k) => (
                <Card key={k.id} className="p-4 flex items-center justify-between border-emerald-500/30">
                    <div>
                        <p className="font-extrabold">#{k.number} · Table {k.table}</p>
                        <p className="text-xs text-mut">{k.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</p>
                    </div>
                    <Button onClick={() => serve(k)}>Served ✅</Button>
                </Card>
            ))}
            {ready.length === 0 && <p className="text-mut text-center py-16">No ready orders — kitchen-la check pannu 🍳</p>}
        </div>
    )
}
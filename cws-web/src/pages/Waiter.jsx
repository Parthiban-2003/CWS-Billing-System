import { toast } from 'sonner'
import { useKotStore } from '@/stores/useKotStore'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function Waiter() {
    const { kots, move } = useKotStore()
    const ready = kots.filter((k) => k.status === 'READY')

    return (
        <div className="min-h-screen bg-bg text-ink p-4 max-w-xl mx-auto space-y-4">
            <h1 className="text-xl font-extrabold">🤵 Waiter — Ready to Serve</h1>
            {ready.map((k) => (
                <Card key={k.id} className="p-4 flex items-center justify-between border-emerald-500/30">
                    <div>
                        <p className="font-extrabold">#{k.id} · Table {k.table}</p>
                        <p className="text-xs text-mut">{k.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</p>
                    </div>
                    <Button onClick={() => { move(k.id, 'COMPLETED'); toast(`Order #${k.id} served ✅`) }}>Served ✅</Button>
                </Card>
            ))}
            {ready.length === 0 && <p className="text-mut text-center py-16">No ready orders — kitchen-la check pannu 🍳</p>}
        </div>
    )
}
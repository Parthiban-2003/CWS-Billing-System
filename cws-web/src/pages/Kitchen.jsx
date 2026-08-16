import { useKotStore } from '@/stores/useKotStore'
import { useNow } from '@/hooks/useNow'
import { cn } from '@/lib/utils'

const COLS = [
    { id: 'NEW', label: '🆕 NEW', btn: 'Start 🔥', next: 'PREPARING' },
    { id: 'PREPARING', label: '🍳 PREPARING', btn: 'Ready ✅', next: 'READY' },
    { id: 'READY', label: '🔔 READY', btn: 'Served 🤵', next: 'COMPLETED' },
    { id: 'COMPLETED', label: '✅ DONE', btn: null },
]

export default function Kitchen() {
    const { kots, move } = useKotStore()
    const now = useNow(10000)

    return (
        <div className="min-h-screen bg-bg text-ink p-4">
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-extrabold">🍳 KITCHEN DISPLAY</h1>
                <p className="text-mut text-sm font-bold">{new Date(now).toLocaleTimeString()}</p>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {COLS.map((c) => (
                    <div key={c.id} className="bg-card border border-line rounded-xl p-3 space-y-2 min-h-[70vh]">
                        <p className="font-extrabold text-sm text-mut">{c.label} ({kots.filter((k) => k.status === c.id).length})</p>
                        {kots.filter((k) => k.status === c.id).map((k) => {
                            const wait = Math.floor((now - k.at) / 60000)
                            return (
                                <div key={k.id} className={cn('rounded-lg border-2 p-3 space-y-1',
                                    wait < 5 ? 'border-emerald-500/40' : wait < 10 ? 'border-amber-500/50' : 'border-rose-500/60 animate-pulse')}>
                                    <div className="flex justify-between font-extrabold text-sm">
                                        <span>#{k.id} · {k.table}</span><span>{wait}m</span>
                                    </div>
                                    {k.items.map((i) => (
                                        <p key={i.id} className="text-sm"><b className="text-primary">{i.qty}×</b> {i.name}</p>
                                    ))}
                                    {c.btn && (
                                        <button onClick={() => move(k.id, c.next)}
                                            className="w-full mt-1 rounded-lg bg-primary text-bg text-xs font-extrabold py-2 active:scale-95">
                                            {c.btn}
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}
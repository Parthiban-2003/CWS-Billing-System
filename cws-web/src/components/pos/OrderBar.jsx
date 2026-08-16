import { useCartStore } from '@/stores/useCartStore'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const TABLES = Array.from({ length: 12 }, (_, i) => `T${i + 1}`)

export default function OrderBar({ search, setSearch, cats, cat, setCat }) {
    const { orderType, table, setMeta } = useCartStore()
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
                <div className="flex rounded-lg bg-card border border-line p-1">
                    {['DINE_IN', 'TAKEAWAY'].map((t) => (
                        <button key={t} onClick={() => setMeta({ orderType: t })}
                            className={cn('px-3 py-1.5 rounded-md text-xs font-bold', orderType === t ? 'bg-primary text-bg' : 'text-mut')}>
                            {t === 'DINE_IN' ? '🍽 Dine-in' : '🥡 Takeaway'}
                        </button>
                    ))}
                </div>
                {orderType === 'DINE_IN' && (
                    <select value={table} onChange={(e) => setMeta({ table: e.target.value })}
                        className="rounded-lg bg-card border border-line px-3 py-2 text-xs font-bold outline-none">
                        <option value="">Select table…</option>
                        {TABLES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                )}
                <Input placeholder="🔍 Search / scan barcode…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
                {cats.map((c) => (
                    <button key={c} onClick={() => setCat(c)}
                        className={cn('shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border transition',
                            cat === c ? 'bg-primary text-bg border-primary' : 'bg-card text-mut border-line hover:border-primary/40')}>
                        {c}
                    </button>
                ))}
            </div>
        </div>
    )
}
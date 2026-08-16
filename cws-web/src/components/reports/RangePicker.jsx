import { cn } from '@/lib/utils'

const OPTS = [{ id: '1', l: 'Today' }, { id: '7', l: '7 Days' }, { id: '30', l: '30 Days' }]

export default function RangePicker({ range, setRange }) {
    return (
        <div className="flex rounded-lg bg-card border border-line p-1">
            {OPTS.map((o) => (
                <button key={o.id} onClick={() => setRange(o.id)}
                    className={cn('px-3 py-1.5 rounded-md text-xs font-bold', range === o.id ? 'bg-primary text-bg' : 'text-mut')}>
                    {o.l}
                </button>
            ))}
        </div>
    )
}
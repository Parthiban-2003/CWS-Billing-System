import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function ReportTable({ cols, rows, right = [] }) {
    return (
        <Card className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-bg text-mut">
                    <tr>
                        {cols.map((c) => (
                            <th key={c} className={cn('px-4 py-3', right.includes(c) ? 'text-right' : 'text-left')}>{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} className="border-t border-line">
                            {r.map((cell, j) => (
                                <td key={j} className={cn('px-4 py-2.5', right.includes(cols[j]) && 'text-right font-bold')}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr><td colSpan={cols.length} className="px-4 py-8 text-center text-mut">No data in this range</td></tr>
                    )}
                </tbody>
            </table>
        </Card>
    )
}
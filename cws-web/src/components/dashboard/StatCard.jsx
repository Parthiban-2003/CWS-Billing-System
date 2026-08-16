import { useCountUp } from '@/hooks/useCountUp'
import Card from '@/components/ui/Card'

export default function StatCard({ label, value, icon: Icon, prefix = '', tint }) {
    const n = useCountUp(Number(value) || 0)
    return (
        <Card className="p-4 lg:p-5 relative overflow-hidden">
            <div className={`absolute inset-0 opacity-10 ${tint}`} />
            <div className="flex items-center justify-between relative">
                <p className="text-xs font-bold text-mut">{label}</p>
                <Icon size={17} className="text-primary" />
            </div>
            <p className="mt-2 text-2xl font-extrabold relative">{prefix}{n.toLocaleString('en-IN')}</p>
        </Card>
    )
}
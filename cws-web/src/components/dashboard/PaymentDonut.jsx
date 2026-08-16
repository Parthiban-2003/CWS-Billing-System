import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = { CASH: '#10b981', UPI: '#38bdf8', CARD: '#a78bfa' }

export default function PaymentDonut({ data }) {
    return (
        <div className="h-56 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4}>
                        {data.map((d) => <Cell key={d.name} fill={COLORS[d.name] ?? 'var(--primary)'} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs font-bold">
                {data.map((d) => (
                    <p key={d.name} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ background: COLORS[d.name] }} /> {d.name} ₹{d.value.toLocaleString('en-IN')}
                    </p>
                ))}
            </div>
        </div>
    )
}
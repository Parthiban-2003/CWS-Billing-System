import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function SalesChart({ data }) {
    return (
        <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <XAxis dataKey="day" stroke="var(--mut)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--mut)" fontSize={11} tickLine={false} axisLine={false} width={50} />
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={2.5} fill="var(--primary-soft)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
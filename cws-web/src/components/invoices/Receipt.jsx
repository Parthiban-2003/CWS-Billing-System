import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { inr } from '@/lib/utils'
import { RECEIPT_CSS } from '@/lib/receiptCss'

export default function Receipt({ inv }) {
    const { data: s } = useQuery({ queryKey: ['settings'], queryFn: () => api.get('/api/settings') })
    const d = new Date(inv.createdAt)

    return (
        <div id="receipt-print" className="rc">
            <style>{RECEIPT_CSS}</style>

            <div className="rc-head">
                {s?.logo && <img src={s.logo} alt="logo" className="rc-logo" />}
                <div className="rc-name">{s?.companyName || 'Business'}</div>
                <div className="rc-sub">
                    {s?.gstin && `GSTIN: ${s.gstin} · `}
                    {s?.phone && `Ph: ${s.phone}`}
                    {s?.address && <><br />{s.address}</>}
                </div>
                <span className="rc-badge">{inv.status}</span>
            </div>

            <hr className="rc-div" />

            <div className="rc-meta"><b>{s?.invoicePrefix || 'INV'} #{inv.number}</b><span>{d.toLocaleDateString('en-IN')}</span></div>
            <div className="rc-meta rc-mut">
                <span>{inv.orderType === 'DINE_IN' ? `Dine-in · Table ${inv.table || '—'}` : 'Takeaway'}</span>
                <span>{inv.method}</span>
            </div>
            <div className="rc-meta rc-mut">
                <span>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>Cashier: Admin</span>
            </div>

            <hr className="rc-div" />

            <table className="rc-table">
                <thead><tr><th>Item</th><th className="c">Qty</th><th className="r">Amount</th></tr></thead>
                <tbody>
                    {inv.items.map((i) => (
                        <tr key={i.id}><td>{i.name}</td><td className="c">{i.qty}</td><td className="r">{inr(i.amount)}</td></tr>
                    ))}
                </tbody>
            </table>

            <hr className="rc-div" />

            <div className="rc-row rc-mut"><span>Subtotal</span><span>{inr(inv.subtotal)}</span></div>
            {inv.discount > 0 && <div className="rc-row rc-mut"><span>Discount</span><span>− {inr(inv.discount)}</span></div>}
            {inv.service > 0 && <div className="rc-row rc-mut"><span>Service charge</span><span>+ {inr(inv.service)}</span></div>}
            <div className="rc-row rc-mut"><span>Round-off</span><span>{inr(inv.roundOff)}</span></div>
            <div className="rc-total"><span>GRAND TOTAL</span><span>{inr(inv.total)}</span></div>

            <div className="rc-foot">
                <div className="rc-thanks">{s?.footerMsg || 'Thank you! 🙏'}</div>
                <div className="rc-powered">Powered by CWS Smart Billing</div>
            </div>
        </div>
    )
}
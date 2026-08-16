import { useState } from 'react'
import { toast } from 'sonner'
import { Minus, Plus, X } from 'lucide-react'
import { useCartStore } from '@/stores/useCartStore'
import { calcTotals } from '@/lib/totals'
import { inr } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import PaymentModal from './PaymentModal'

export default function CartPanel() {
    const cart = useCartStore()
    const { items, orderType, table } = cart
    const [payOpen, setPayOpen] = useState(false)
    const [clearOpen, setClearOpen] = useState(false)
    const [heldOpen, setHeldOpen] = useState(false)
    const t = calcTotals(items, { discountPct: cart.itemDiscount, servicePct: cart.serviceCharge })

    return (
        <>
            <Card className="flex flex-col lg:sticky lg:top-20 max-lg:h-[70vh]">
                <div className="flex items-center justify-between p-4 border-b border-line">
                    <p className="font-extrabold text-sm">🧾 {orderType === 'DINE_IN' ? `Table ${table || '—'}` : 'Takeaway'}</p>
                    <button onClick={() => setHeldOpen(true)} className="text-xs font-bold text-primary bg-primary-soft rounded-full px-3 py-1">
                        ⏸ Held ({cart.held.length})
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {items.map((i) => (
                        <div key={i.id} className="flex items-center gap-2 bg-bg rounded-lg p-2.5 border border-line">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{i.name}</p>
                                <p className="text-[11px] text-mut">{inr(i.price)}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => cart.dec(i.id)} className="h-6 w-6 rounded-md bg-card border border-line grid place-items-center hover:border-primary"><Minus size={12} /></button>
                                <span className="w-6 text-center text-sm font-extrabold">{i.qty}</span>
                                <button onClick={() => cart.add(i)} className="h-6 w-6 rounded-md bg-primary-soft text-primary grid place-items-center"><Plus size={12} /></button>
                            </div>
                            <p className="w-16 text-right text-sm font-extrabold">{inr(i.price * i.qty)}</p>
                            <button onClick={() => { cart.remove(i.id); toast('Item removed') }} className="text-mut hover:text-rose-400"><X size={14} /></button>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-center text-mut text-sm py-10">Cart empty — items add pannu 👈</p>}
                </div>

                <div className="grid grid-cols-2 gap-2 px-4 pb-2">
                    <label className="text-[11px] font-bold text-mut">Discount %
                        <input type="number" value={cart.itemDiscount} onChange={(e) => cart.setMeta({ itemDiscount: e.target.value })}
                            className="mt-1 w-full rounded-lg bg-bg border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-primary" />
                    </label>
                    <label className="text-[11px] font-bold text-mut">Service %
                        <input type="number" value={cart.serviceCharge} onChange={(e) => cart.setMeta({ serviceCharge: e.target.value })}
                            className="mt-1 w-full rounded-lg bg-bg border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-primary" />
                    </label>
                </div>

                <div className="px-4 pb-3 space-y-1 text-sm">
                    <Row l="Subtotal" v={inr(t.subtotal)} />
                    {t.discount > 0 && <Row l="Discount" v={'− ' + inr(t.discount)} red />}
                    {t.service > 0 && <Row l="Service charge" v={'+ ' + inr(t.service)} />}
                    <Row l="Round-off" v={`${t.roundOff >= 0 ? '+' : '−'} ₹${Math.abs(t.roundOff).toFixed(2)}`} />
                    <div className="flex justify-between pt-2 border-t border-line text-base font-extrabold">
                        <span>TOTAL</span><span className="text-primary">{inr(t.total)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-4 pt-0">
                    <Button variant="soft" onClick={() => { cart.hold(); toast('Bill held ⏸') }}>Hold</Button>
                    <Button variant="danger" onClick={() => setClearOpen(true)}>Clear</Button>
                    <Button disabled={!items.length} onClick={() => setPayOpen(true)}>PAY</Button>
                </div>
            </Card>

            <ConfirmDialog open={clearOpen} onClose={() => setClearOpen(false)}
                onConfirm={() => { cart.clear(); toast('Cart cleared') }}
                title="Clear cart?" message="Current bill-oda ellam items-um remove aagum." confirmText="Clear" />

            <Modal open={heldOpen} onClose={() => setHeldOpen(false)} title="⏸ Held Bills">
                <div className="space-y-2">
                    {cart.held.map((h) => (
                        <div key={h.id} className="flex items-center justify-between bg-bg border border-line rounded-lg p-3">
                            <p className="text-sm font-bold">{h.table ? `Table ${h.table}` : 'Takeaway'} · {h.items.length} items · {h.at}</p>
                            <Button variant="soft" onClick={() => { cart.resume(h.id); setHeldOpen(false); toast('Bill resumed ▶') }}>Resume</Button>
                        </div>
                    ))}
                    {cart.held.length === 0 && <p className="text-mut text-sm text-center py-6">No held bills</p>}
                </div>
            </Modal>

            <PaymentModal open={payOpen} onClose={() => setPayOpen(false)} totals={t} />
        </>
    )
}

function Row({ l, v, red }) {
    return (
        <div className="flex justify-between text-mut">
            <span>{l}</span>
            <span className={red ? 'text-rose-400' : 'text-ink'}>{v}</span>
        </div>
    )
}
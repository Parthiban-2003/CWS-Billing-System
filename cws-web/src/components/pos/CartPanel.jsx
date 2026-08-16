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
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { isHappyNow } from '@/lib/happy'

export default function CartPanel() {
    const cart = useCartStore()
    const items = Array.isArray(cart.items) ? cart.items : []
    const held = Array.isArray(cart.held) ? cart.held : []
    const { orderType, table } = cart

    const [payOpen, setPayOpen] = useState(false)
    const [clearOpen, setClearOpen] = useState(false)
    const [heldOpen, setHeldOpen] = useState(false)

    const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => api.get('/api/settings') })
    const happyActive = isHappyNow(settings?.happyStart, settings?.happyEnd) && Number(settings?.happyPct || 0) > 0

    // ✅ SINGLE totals calc with happy + tax
    const t = calcTotals(items, {
        discountPct: cart.itemDiscount ?? 0,
        servicePct: cart.serviceCharge ?? 0,
        happyPct: happyActive ? Number(settings?.happyPct || 0) : 0,
        taxPct: settings?.taxPct || 0,
    })

    return (
        <>
            <Card className="flex flex-col lg:sticky lg:top-20 max-lg:h-[70vh]">
                {/* HEADER */}
                <div className="flex items-center justify-between p-4 border-b border-line">
                    <p className="font-extrabold text-sm">
                        🧾 {orderType === 'DINE_IN' ? `Table ${table || '—'}` : 'Takeaway'}
                    </p>
                    <button onClick={() => setHeldOpen(true)}
                        className="text-xs font-bold text-primary bg-primary-soft rounded-full px-3 py-1">
                        ⏸ Held ({held.length})
                    </button>
                </div>

                {/* HAPPY HOUR BANNER */}
                {happyActive && (
                    <div className="mx-4 mt-3 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-2 text-xs font-extrabold text-amber-400 flex items-center gap-2">
                        ⏰ Happy Hour Active — {settings.happyPct}% OFF auto-applied!
                    </div>
                )}

                {/* CART ITEMS */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {items.map((i) => {
                        const modifiers = Array.isArray(i.modifiers) ? i.modifiers : []
                        const comboItems = Array.isArray(i.comboItems) ? i.comboItems : []

                        return (
                            <div key={i.key} className="bg-bg rounded-lg p-2.5 border border-line">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">
                                            {i.isCombo && '🎁 '}{i.name}{i.variant && ` (${i.variant.name})`}
                                        </p>
                                        {modifiers.map((m, index) => (
                                            <p key={m.id ?? `${i.key}-modifier-${index}`} className="text-[10px] text-mut">
                                                + {m.name}{Number(m.delta) > 0 && ` (+${inr(Number(m.delta))})`}
                                            </p>
                                        ))}
                                        {i.isCombo && comboItems.map((ci, index) => (
                                            <p key={ci.id ?? `${i.key}-combo-${index}`} className="text-[10px] text-mut">
                                                · {ci.qty ?? 1}× {ci.product?.name ?? ci.name ?? 'Item'}
                                            </p>
                                        ))}
                                        <p className="text-[11px] text-mut">{inr(Number(i.unitPrice) || 0)}</p>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button onClick={() => cart.dec(i.key)}
                                            className="h-6 w-6 rounded-md bg-card border border-line grid place-items-center hover:border-primary">
                                            <Minus size={12} />
                                        </button>
                                        <span className="w-6 text-center text-sm font-extrabold">{i.qty}</span>
                                        <button onClick={() => cart.add(i)}
                                            className="h-6 w-6 rounded-md bg-primary-soft text-primary grid place-items-center">
                                            <Plus size={12} />
                                        </button>
                                    </div>

                                    <p className="w-16 text-right text-sm font-extrabold">
                                        {inr((Number(i.unitPrice) || 0) * (Number(i.qty) || 0))}
                                    </p>

                                    <button onClick={() => { cart.remove(i.key); toast('Item removed') }}
                                        className="text-mut hover:text-rose-400"><X size={14} /></button>
                                </div>
                            </div>
                        )
                    })}
                    {items.length === 0 && (
                        <p className="text-center text-mut text-sm py-10">Cart empty — items add pannu 👈</p>
                    )}
                </div>

                {/* DISCOUNT + SERVICE */}
                <div className="grid grid-cols-2 gap-2 px-4 pb-2">
                    <label className="text-[11px] font-bold text-mut">
                        Discount %
                        <input type="number" min="0" value={cart.itemDiscount ?? 0}
                            onChange={(e) => cart.setMeta({ itemDiscount: e.target.value })}
                            className="mt-1 w-full rounded-lg bg-bg border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-primary" />
                    </label>
                    <label className="text-[11px] font-bold text-mut">
                        Service %
                        <input type="number" min="0" value={cart.serviceCharge ?? 0}
                            onChange={(e) => cart.setMeta({ serviceCharge: e.target.value })}
                            className="mt-1 w-full rounded-lg bg-bg border border-line px-2 py-1.5 text-sm text-ink outline-none focus:border-primary" />
                    </label>
                </div>

                {/* TOTALS */}
                <div className="px-4 pb-3 space-y-1 text-sm">
                    <Row l="Subtotal" v={inr(t.subtotal)} />
                    {t.discount > 0 && !happyActive && <Row l="Discount" v={'− ' + inr(t.discount)} red />}
                    {happyActive && t.discount > 0 && (
                        <>
                            <Row l="Discount" v={'− ' + inr(t.discount - (t.happy || 0))} red />
                            <Row l={`⏰ Happy Hour −${settings.happyPct}%`} v={'− ' + inr(t.happy || 0)} red />
                        </>
                    )}
                    {t.service > 0 && <Row l="Service charge" v={'+ ' + inr(t.service)} />}
                    {t.tax > 0 && <Row l={`Tax ${settings?.taxPct || 0}%`} v={'+ ' + inr(t.tax)} />}
                    <Row l="Round-off" v={`${t.roundOff >= 0 ? '+' : '−'} ₹${Math.abs(t.roundOff).toFixed(2)}`} />
                    <div className="flex justify-between pt-2 border-t border-line text-base font-extrabold">
                        <span>TOTAL</span>
                        <span className="text-primary">{inr(t.total)}</span>
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-3 gap-2 p-4 pt-0">
                    <Button variant="soft" disabled={!items.length}
                        onClick={() => { cart.hold(); toast('Bill held ⏸') }}>Hold</Button>
                    <Button variant="danger" disabled={!items.length} onClick={() => setClearOpen(true)}>Clear</Button>
                    <Button disabled={!items.length} onClick={() => setPayOpen(true)}>PAY</Button>
                </div>
            </Card>

            <ConfirmDialog open={clearOpen} onClose={() => setClearOpen(false)}
                onConfirm={() => { cart.clear(); setClearOpen(false); toast('Cart cleared') }}
                title="Clear cart?" message="Current bill-oda ellam items-um remove aagum." confirmText="Clear" />

            <Modal open={heldOpen} onClose={() => setHeldOpen(false)} title="⏸ Held Bills">
                <div className="space-y-2">
                    {held.map((h, index) => {
                        const heldItems = Array.isArray(h.items) ? h.items : []
                        return (
                            <div key={h.id ?? `held-${index}`} className="flex items-center justify-between bg-bg border border-line rounded-lg p-3">
                                <p className="text-sm font-bold">
                                    {h.table ? `Table ${h.table}` : 'Takeaway'} · {heldItems.length} items · {h.at ?? ''}
                                </p>
                                <Button variant="soft" onClick={() => { cart.resume(h.id); setHeldOpen(false); toast('Bill resumed ▶') }}>
                                    Resume
                                </Button>
                            </div>
                        )
                    })}
                    {held.length === 0 && <p className="text-mut text-sm text-center py-6">No held bills</p>}
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
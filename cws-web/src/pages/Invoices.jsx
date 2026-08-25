import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import InvoiceDetail from '@/components/invoices/InvoiceDetail'
import { inr, cn } from '@/lib/utils'

const METHOD_CLR = {
    CREDIT: 'text-rose-400 bg-rose-500/10',
    CASH: 'text-emerald-400 bg-emerald-500/10',
    UPI: 'text-sky-400 bg-sky-500/10',
    CARD: 'text-purple-400 bg-purple-500/10',
    SPLIT: 'text-amber-400 bg-amber-500/10',
}

export default function Invoices() {
    const [filter, setFilter] = useState('ALL')
    const [view, setView] = useState(null)
    const [voidId, setVoidId] = useState(null)

    const qc = useQueryClient()

    const {
        data: invoicesData = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['invoices'],
        queryFn: () => api.get('/api/invoices'),
    })

    const invoices = Array.isArray(invoicesData)
        ? invoicesData
        : Array.isArray(invoicesData?.data)
            ? invoicesData.data
            : []

    const list = invoices.filter(
        (v) => filter === 'ALL' || v.status === filter
    )

    // NEW: WhatsApp Handler
    const sendWhatsApp = async (inv) => {
        if (!inv.customer?.phone) {
            toast.error('Customer phone number missing! ❌')
            return
        }
        toast.loading('Sending WhatsApp...')
        try {
            const res = await api.post('/api/whatsapp/send', { invoiceId: inv.id })
            if (res.success) {
                toast.success(`Receipt sent to ${inv.customer.phone} 📱`)
            } else {
                toast.error(res.error || 'Failed to send ')
            }
        } catch (e) {
            toast.error('Failed to send WhatsApp ❌')
        }
    }

    const doVoid = async () => {
        if (!voidId) return

        try {
            await api.post(`/api/invoices/${voidId}/void`, {})

            toast.success('Invoice cancelled + stock restored ↩️')

            setVoidId(null)

            qc.invalidateQueries({
                queryKey: ['invoices'],
            })

            qc.invalidateQueries({
                queryKey: ['products'],
            })
        } catch (err) {
            console.error('Void invoice error:', err)

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to cancel invoice'
            )
        }
    }

    return (
        <div className="space-y-4">
            {/* HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-extrabold">
                    🧾 Invoices
                </h1>

                <div className="flex gap-2 flex-wrap">
                    {['ALL', 'PAID', 'PARTIAL', 'UNPAID', 'CANCELLED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                'rounded-full px-3.5 py-1.5 text-xs font-bold border',
                                filter === f
                                    ? 'bg-primary text-bg border-primary'
                                    : 'bg-card text-mut border-line'
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* ERROR */}
            {isError && (
                <Card className="p-4 border-rose-500/30">
                    <p className="text-sm font-bold text-rose-400">
                        Failed to load invoices
                    </p>
                    <p className="text-xs text-mut mt-1">
                        {error?.message || 'Please try again.'}
                    </p>
                </Card>
            )}

            {/* TABLE */}
            <Card className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-bg text-mut">
                        <tr>
                            <th className="text-left px-4 py-3">#</th>
                            <th className="text-left px-4 py-3">Time</th>
                            <th className="text-left px-4 py-3">Type</th>
                            <th className="text-left px-4 py-3">Method</th>
                            <th className="text-right px-4 py-3">Total</th>
                            <th className="text-right px-4 py-3">Status</th>
                            <th className="text-right px-4 py-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* LOADING */}
                        {isLoading && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-mut">
                                    Loading invoices...
                                </td>
                            </tr>
                        )}

                        {/* INVOICES */}
                        {!isLoading &&
                            list.map((v) => {
                                const total = Number(v.total) || 0
                                const paid = Number(v.paid) || 0
                                const due = Math.max(total - paid, 0)
                                const methodClass = METHOD_CLR[v.method] || 'text-mut bg-bg'

                                return (
                                    <tr
                                        key={v.id}
                                        className="border-t border-line hover:bg-primary-soft/40 cursor-pointer"
                                        onClick={() => setView(v)}
                                    >
                                        {/* NUMBER */}
                                        <td className="px-4 py-3 font-extrabold text-primary">
                                            #{v.number}
                                        </td>

                                        {/* TIME */}
                                        <td className="px-4 py-3 text-mut">
                                            {v.createdAt
                                                ? new Date(v.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })
                                                : '—'}
                                        </td>

                                        {/* ORDER TYPE */}
                                        <td className="px-4 py-3">
                                            {v.orderType === 'DINE_IN'
                                                ? `🍽 ${v.table || '—'}`
                                                : '🥡 Takeaway'}
                                        </td>

                                        {/* PAYMENT METHOD */}
                                        <td className="px-4 py-3">
                                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-extrabold', methodClass)}>
                                                {v.method || '—'}
                                            </span>
                                        </td>

                                        {/* TOTAL */}
                                        <td className="px-4 py-3 text-right font-extrabold">
                                            {inr(total)}
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={cn(
                                                    'text-[10px] font-extrabold',
                                                    v.status === 'PAID'
                                                        ? 'text-emerald-400'
                                                        : v.status === 'PARTIAL'
                                                            ? 'text-amber-400'
                                                            : v.status === 'UNPAID'
                                                                ? 'text-rose-400'
                                                                : v.status === 'CANCELLED'
                                                                    ? 'text-mut'
                                                                    : 'text-mut'
                                                )}
                                            >
                                                {v.status || 'UNKNOWN'}
                                                {due > 0 && v.status !== 'CANCELLED' && ` · due ${inr(due)}`}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2 items-center">
                                                {/* 👇 NEW: WhatsApp Button */}
                                                <button
                                                    onClick={() => sendWhatsApp(v)}
                                                    className="h-7 w-7 rounded-md bg-bg border border-line text-green-500 hover:bg-green-500/10 grid place-items-center transition"
                                                    title="Send WhatsApp Receipt"
                                                >
                                                    <MessageCircle size={14} />
                                                </button>

                                                {v.status === 'PAID' && (
                                                    <button
                                                        onClick={() => setVoidId(v.id)}
                                                        className="text-[11px] font-bold text-rose-400 hover:underline px-2"
                                                    >
                                                        Void
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}

                        {/* EMPTY */}
                        {!isLoading && list.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center text-mut">
                                    No invoices yet — POS-la first bill adichu! ☝️
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            {/* INVOICE DETAIL */}
            <InvoiceDetail inv={view} onClose={() => setView(null)} />

            {/* VOID CONFIRMATION */}
            <ConfirmDialog
                open={!!voidId}
                onClose={() => setVoidId(null)}
                onConfirm={doVoid}
                title="Void invoice?"
                message="Invoice cancel aagi, stock auto-ah restore aagum."
                confirmText="Void"
            />
        </div>
    )
}
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { timeAgo } from '@/lib/timeago'
import { playAlert } from '@/lib/alert'
import { cn } from '@/lib/utils'

const PRIORITY_STYLE = {
    INFO: 'border-sky-500/40',
    WARNING: 'border-amber-500/50',
    CRITICAL: 'border-rose-500/60',
}

const PRIORITY_DOT = {
    INFO: 'bg-sky-400',
    WARNING: 'bg-amber-400',
    CRITICAL: 'bg-rose-500',
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false)
    const qc = useQueryClient()
    const seenIds = useRef(null)

    const { data: notifs = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => api.get('/api/notifications'),
        refetchInterval: 5000,
        staleTime: 0,
    })

    const unread = notifs.filter((n) => !n.read)

    // 🔔 Pudhu CRITICAL vandha → sound + toast
    useEffect(() => {
        if (seenIds.current !== null) {
            const fresh = notifs.filter((n) => !seenIds.current.has(n.id))
            fresh
                .filter((n) => n.priority === 'CRITICAL')
                .forEach((n) => {
                    playAlert()
                    toast.error(n.message)
                })
        }
        seenIds.current = new Set(notifs.map((n) => n.id))
    }, [notifs])

    const markAll = async () => {
        await api.patch('/api/notifications')
        qc.invalidateQueries({ queryKey: ['notifications'] })
    }

    const markOne = async (id) => {
        await api.patch(`/api/notifications/${id}`)
        qc.invalidateQueries({ queryKey: ['notifications'] })
    }

    return (
        <div className="relative">
            {/* 🔔 BELL + UNREAD BADGE */}
            <button onClick={() => setOpen(!open)} className="relative text-mut hover:text-ink p-1">
                <Bell size={18} />
                {unread.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold grid place-items-center">
                        {unread.length}
                    </span>
                )}
            </button>

            {/* 📋 DROPDOWN */}
            {open && (
                <>
                    {/* outside click close */}
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

                    <div className="absolute right-0 top-10 w-80 max-h-96 overflow-y-auto rounded-xl border border-line bg-card shadow-xl z-40">
                        {/* HEADER */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-line sticky top-0 bg-card">
                            <p className="font-extrabold text-sm">🔔 Notifications</p>
                            {unread.length > 0 && (
                                <button
                                    onClick={markAll}
                                    className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                                >
                                    <CheckCheck size={12} /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* LIST */}
                        <div className="p-2 space-y-1.5">
                            {notifs.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => !n.read && markOne(n.id)}
                                    className={cn(
                                        'w-full text-left rounded-lg border border-line border-l-4 bg-bg px-3 py-2',
                                        PRIORITY_STYLE[n.priority] || 'border-l-line',
                                        !n.read && 'ring-1 ring-primary/30'
                                    )}
                                >
                                    <div className="flex items-start gap-2">
                                        <span
                                            className={cn(
                                                'mt-1 h-2 w-2 rounded-full shrink-0',
                                                PRIORITY_DOT[n.priority] || 'bg-sky-400',
                                                n.read && 'opacity-30'
                                            )}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={cn('text-xs', n.read ? 'text-mut' : 'font-bold text-ink')}>
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-mut mt-0.5">{timeAgo(n.createdAt)}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {notifs.length === 0 && (
                                <p className="text-mut text-xs text-center py-8">No notifications yet ✅</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
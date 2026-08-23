export const ROLES = [
    { id: 'OWNER', l: '👑 Owner', c: 'bg-purple-500/15 text-purple-400' },
    { id: 'MANAGER', l: '📋 Manager', c: 'bg-sky-500/15 text-sky-400' },
    { id: 'CASHIER', l: '💵 Cashier', c: 'bg-emerald-500/15 text-emerald-400' },
    { id: 'WAITER', l: '🤵 Waiter', c: 'bg-amber-500/15 text-amber-400' },
    { id: 'KITCHEN', l: '🍳 Kitchen', c: 'bg-rose-500/15 text-rose-400' },
]

export const roleInfo = (id) => ROLES.find((r) => r.id === id) || ROLES[2]
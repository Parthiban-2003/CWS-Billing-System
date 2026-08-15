import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            orderType: 'DINE_IN',
            table: '',
            itemDiscount: 0,
            serviceCharge: 0,
            held: [],

            add: (p) => set((s) => {
                const ex = s.items.find((i) => i.id === p.id)
                return { items: ex ? s.items.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)) : [...s.items, { id: p.id, name: p.name, price: Number(p.price), qty: 1 }] }
            }),
            dec: (id) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0) })),
            remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
            clear: () => set({ items: [], itemDiscount: 0, serviceCharge: 0 }),
            setMeta: (patch) => set(patch),

            hold: () => {
                const s = get()
                if (!s.items.length) return
                set({ held: [...s.held, { id: Date.now(), items: s.items, table: s.table, at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }], items: [], table: '' })
            },
            resume: (id) => {
                const s = get()
                const h = s.held.find((x) => x.id === id)
                if (!h) return
                set({ items: h.items, table: h.table, held: s.held.filter((x) => x.id !== id) })
            },
        }),
        { name: 'cws-cart' }
    )
)
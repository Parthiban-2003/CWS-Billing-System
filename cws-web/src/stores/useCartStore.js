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

            add: (p, opts = {}) => set((s) => {
                const unitPrice =
                    Number(p.price) +
                    Number(opts.variant?.delta || 0) +
                    (opts.modifiers || []).reduce((sum, m) => sum + Number(m.delta || m.price || 0), 0)
                const key = `${p.id}|${opts.variant?.id || ''}|${(opts.modifiers || []).map((m) => m.id).join(',')}`
                const ex = s.items.find((i) => i.key === key)
                if (ex) return { items: s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i)) }
                return {
                    items: [...s.items, {
                        key, id: p.id, name: p.name, price: Number(p.price), unitPrice, qty: 1,
                        variant: opts.variant || null,
                        modifiers: opts.modifiers || [],
                        isCombo: !!p.isCombo,
                        comboItems: p.comboItems || [],
                    }],
                }
            }),
            dec: (key) => set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0) })),
            remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
            clear: () => set({ items: [], itemDiscount: 0, serviceCharge: 0 }),
            setMeta: (patch) => set(patch),

            hold: () => {
                const s = get()
                if (!s.items.length) return
                set({
                    held: [...s.held, { id: Date.now(), items: s.items, table: s.table, at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
                    items: [], table: '',
                })
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
import { create } from 'zustand'

export const useKotStore = create((set) => ({
    kots: [],
    seq: 101,
    addKot: (items, table) =>
        set((s) => ({ kots: [{ id: s.seq, table, items, status: 'NEW', at: Date.now() }, ...s.kots], seq: s.seq + 1 })),
    move: (id, status) => set((s) => ({ kots: s.kots.map((k) => (k.id === id ? { ...k, status } : k)) })),
}))

import { create } from 'zustand'

const initial = Array.from({ length: 12 }, (_, i) => ({
    id: `T${i + 1}`,
    status: i === 1 ? 'OCCUPIED' : i === 4 ? 'RESERVED' : i === 7 ? 'CLEANING' : 'FREE',
    since: Date.now(),
}))

export const useTablesStore = create((set) => ({
    tables: initial,
    setStatus: (id, status) =>
        set((s) => ({ tables: s.tables.map((t) => (t.id === id ? { ...t, status, since: Date.now() } : t)) })),
}))
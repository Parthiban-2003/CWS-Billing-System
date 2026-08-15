import { create } from 'zustand'

export const useMenuStore = create((set) => ({
    unavailable: [],
    toggle: (id) =>
        set((s) => ({
            unavailable: s.unavailable.includes(id)
                ? s.unavailable.filter((x) => x !== id)
                : [...s.unavailable, id],
        })),
}))
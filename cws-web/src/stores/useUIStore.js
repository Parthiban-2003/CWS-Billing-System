import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
    persist((set) => ({ collapsed: false, toggle: () => set((s) => ({ collapsed: !s.collapsed })) }),
        { name: 'cws-ui' })
)
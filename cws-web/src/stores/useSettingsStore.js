import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
    persist(
        (set) => ({
            companyName: 'CWS Smart Billing',
            logo: null,
            font: 'Manrope',
            palette: 'Midnight Gold',
            custom: {},
            set: (patch) => set(patch),
        }),
        { name: 'cws-settings' }
    )
)
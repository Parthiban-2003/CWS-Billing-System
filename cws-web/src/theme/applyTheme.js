import { PALETTES } from '@/config/themes'

function hexToRgba(hex, a = 0.12) {
    const n = hex.replace('#', '')
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16))
    return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function applyTheme(s) {
    const base = PALETTES[s.palette] ?? PALETTES['Midnight Gold']
    const t = { ...base, ...(s.custom || {}) }
    const r = document.documentElement.style
    r.setProperty('--primary', t.primary)
    r.setProperty('--primary-soft', t.primary.startsWith('#') ? hexToRgba(t.primary) : t.primary)
    r.setProperty('--accent', t.accent)
    r.setProperty('--bg', t.bg)
    r.setProperty('--card', t.card)
    r.setProperty('--ink', t.ink)
    r.setProperty('--mut', t.mut)
    r.setProperty('--line', t.line)
    r.setProperty('--app-font', `'${s.font}', sans-serif`)
    document.title = s.companyName || 'CWS Smart Billing'
}
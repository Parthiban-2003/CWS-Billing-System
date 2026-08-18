import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Bell, Languages } from 'lucide-react'
import { api } from '@/lib/api'

export default function Topbar() {
    const { i18n } = useTranslation()
    const [lang, setLang] = useState(i18n.language || 'en')

    // ✅ DB branding
    const { data: brand } = useQuery({
        queryKey: ['settings'],
        queryFn: () => api.get('/api/settings'),
    })

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })

    const toggleLang = () => {
        const next = lang === 'en' ? 'ta' : 'en'
        i18n.changeLanguage(next)
        setLang(next)
    }

    return (
        <header className="flex items-center justify-between px-6 h-16 shrink-0 border-b border-line bg-card/60 backdrop-blur z-20">            {/* DATE + TITLE */}
            <div>
                <p className="text-[11px] text-mut font-bold">{today}</p>
                <h1 className="font-extrabold text-lg truncate">
                    {brand?.companyName || 'CWS Smart Billing System'}
                </h1>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleLang}
                    className="flex items-center gap-1.5 rounded-full bg-bg border border-line px-3 py-1.5 text-xs font-extrabold hover:border-primary"
                >
                    <Languages size={14} /> {lang.toUpperCase()}
                </button>

                <button className="relative text-mut hover:text-ink">
                    <Bell size={18} />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                </button>

                <div className="h-9 w-9 rounded-full bg-primary text-bg grid place-items-center font-extrabold">
                    {(brand?.companyName || 'A')[0]}
                </div>
            </div>
        </header>
    )
}
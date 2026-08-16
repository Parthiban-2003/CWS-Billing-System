import { useTranslation } from 'react-i18next'
import { Languages, Bell } from 'lucide-react'
import { useSettingsStore } from '@/stores/useSettingsStore'

export default function Topbar() {
    const { i18n } = useTranslation()
    const companyName = useSettingsStore((s) => s.companyName)

    const switchLang = () => {
        const next = i18n.language === 'en' ? 'ta' : 'en'
        i18n.changeLanguage(next)
        localStorage.setItem('lang', next)
    }

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-card/70 backdrop-blur border-b border-line sticky top-0 z-30">
            <div>
                <p className="text-[11px] text-mut">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h1 className="font-extrabold text-sm lg:text-base truncate">{companyName}</h1>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={switchLang}
                    className="flex items-center gap-1.5 rounded-full bg-primary-soft text-primary px-3 py-1.5 text-xs font-bold">
                    <Languages size={14} /> {i18n.language === 'en' ? 'தமிழ்' : 'EN'}
                </button>
                <button className="relative rounded-full p-2 text-mut hover:text-ink hover:bg-primary-soft">
                    <Bell size={17} />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                </button>
                <div className="h-8 w-8 rounded-full bg-primary text-bg grid place-items-center text-xs font-extrabold">A</div>
            </div>
        </header>
    )
}
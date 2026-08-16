import { useState } from 'react'
import BrandingTab from '@/components/settings/BrandingTab'
import AppearanceTab from '@/components/settings/AppearanceTab'
import BusinessTab from '@/components/settings/BusinessTab'
import PreviewCard from '@/components/settings/PreviewCard'
import { cn } from '@/lib/utils'

const TABS = ['Branding', 'Business', 'Appearance']

export default function Settings() {
    const [tab, setTab] = useState('Branding')
    return (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
            <div className="space-y-4">
                <div className="flex gap-2">
                    {TABS.map((t) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={cn('rounded-full px-4 py-2 text-xs font-bold transition',
                                tab === t ? 'bg-primary text-bg' : 'bg-card text-mut border border-line')}>
                            {t}
                        </button>
                    ))}
                </div>
                {tab === 'Branding' && <BrandingTab />}
                {tab === 'Business' && <BusinessTab />}
                {tab === 'Appearance' && <AppearanceTab />}
            </div>
            <PreviewCard />
        </div>
    )
}
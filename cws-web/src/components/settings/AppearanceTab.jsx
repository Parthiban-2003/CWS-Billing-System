import { PALETTES, FONTS } from '@/config/themes'
import { useSettingsStore } from '@/stores/useSettingsStore'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function AppearanceTab() {
    const { palette, font, custom, set } = useSettingsStore()

    return (
        <Card className="p-5 space-y-5">
            <h3 className="font-extrabold">🎨 Appearance</h3>

            <div>
                <p className="text-xs font-bold text-mut mb-2">Theme Palette</p>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PALETTES).map(([name, p]) => (
                        <button key={name} onClick={() => set({ palette: name, custom: {} })}
                            className={cn('rounded-lg border p-3 text-left text-xs font-bold transition',
                                palette === name ? 'border-primary bg-primary-soft' : 'border-line hover:border-primary/40')}>
                            <span className="flex gap-1 mb-2">
                                {[p.primary, p.accent, p.bg].map((c, i) => (
                                    <span key={i} className="h-4 w-4 rounded-full border border-white/20" style={{ background: c }} />
                                ))}
                            </span>
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs font-bold text-mut mb-2">Font Family</p>
                <div className="flex flex-wrap gap-2">
                    {FONTS.map((f) => (
                        <button key={f} onClick={() => set({ font: f })}
                            className={cn('rounded-full px-3 py-1.5 text-xs font-bold border transition',
                                font === f ? 'border-primary bg-primary text-bg' : 'border-line text-mut')}
                            style={{ fontFamily: `'${f}', sans-serif` }}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs font-bold text-mut mb-2">Custom Primary Color</p>
                <input type="color"
                    value={custom.primary ?? PALETTES[palette]?.primary ?? '#f59e0b'}
                    onChange={(e) => set({ custom: { ...custom, primary: e.target.value } })}
                    className="h-9 w-16 rounded cursor-pointer bg-transparent border border-line" />
            </div>
        </Card>
    )
}
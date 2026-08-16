import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { useSettingsStore } from '@/stores/useSettingsStore'

export default function BrandingTab() {
    const { companyName, logo, set } = useSettingsStore()

    const onLogo = (e) => {
        const f = e.target.files?.[0]
        if (!f) return
        const reader = new FileReader()
        reader.onload = () => set({ logo: reader.result })
        reader.readAsDataURL(f)
    }

    return (
        <Card className="p-5 space-y-4">
            <h3 className="font-extrabold">🏢 Branding</h3>
            <div>
                <label className="text-xs font-bold text-mut">Company Name</label>
                <Input value={companyName} onChange={(e) => set({ companyName: e.target.value })} />
            </div>
            <div>
                <label className="text-xs font-bold text-mut">Logo</label>
                <input type="file" accept="image/*" onChange={onLogo} className="text-xs mt-1" />
                {logo && <img src={logo} alt="logo" className="mt-2 h-10 w-10 rounded-lg object-cover" />}
            </div>
            <p className="text-xs text-mut">Sidebar, topbar, title — ellam live-ah update aagum ✨</p>
        </Card>
    )
}
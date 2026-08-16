import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useSettingsStore } from '@/stores/useSettingsStore'

export default function PreviewCard() {
    const { companyName, font } = useSettingsStore()
    return (
        <Card className="p-5 h-fit lg:sticky lg:top-20 space-y-4">
            <h3 className="font-extrabold">👁 Live Preview</h3>
            <div className="rounded-lg border border-line p-4 space-y-3" style={{ fontFamily: `'${font}', sans-serif` }}>
                <p className="font-extrabold">{companyName}</p>
                <div className="flex gap-2">
                    <Button>Primary</Button>
                    <Button variant="soft">Soft</Button>
                </div>
                <div className="rounded-lg bg-primary-soft p-3 text-xs">
                    <div className="flex justify-between"><span>Tea × 2</span><span>₹40.00</span></div>
                    <div className="flex justify-between font-extrabold mt-1">
                        <span>Total</span><span className="text-primary">₹40.00</span>
                    </div>
                </div>
            </div>
            <p className="text-[11px] text-mut">Whole app instant-ah update aagum — sidebar, buttons, cards 🎯</p>
        </Card>
    )
}
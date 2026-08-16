import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function PreviewCard() {
    const { data: s } = useQuery({ queryKey: ['settings'], queryFn: () => api.get('/api/settings') })

    return (
        <Card className="p-5 h-fit lg:sticky lg:top-20 space-y-4">
            <h3 className="font-extrabold">👁 Live Preview</h3>
            <div className="rounded-lg border border-line p-4 space-y-3">
                {s?.logo && <img src={s.logo} alt="logo" className="h-8 w-8 rounded object-cover" />}
                <p className="font-extrabold">{s?.companyName || 'Your Business'}</p>
                <p className="text-[11px] text-mut">{s?.address}</p>
                <div className="flex gap-2">
                    <Button>Primary</Button>
                    <Button variant="soft">Soft</Button>
                </div>
                <div className="rounded-lg bg-primary-soft p-3 text-xs space-y-1">
                    <div className="flex justify-between"><span>{s?.invoicePrefix || 'INV'} #1001</span><span>{new Date().toLocaleDateString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>Tea × 2</span><span>₹40.00</span></div>
                    {s?.taxPct > 0 && <div className="flex justify-between text-mut"><span>Tax {s.taxPct}%</span><span>₹2.00</span></div>}
                    <div className="flex justify-between font-extrabold mt-1 border-t border-line pt-1">
                        <span>Total</span><span className="text-primary">₹42.00</span>
                    </div>
                </div>
                <p className="text-[10px] text-mut text-center">{s?.footerMsg}</p>
            </div>
            <p className="text-[11px] text-mut">Ellam DB-la save — receipt, invoices, branding ellam live update! 🎯</p>
        </Card>
    )
}
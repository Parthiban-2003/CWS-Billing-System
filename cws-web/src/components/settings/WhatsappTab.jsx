import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MessageCircle, Save } from 'lucide-react'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function WhatsappTab() {
    const qc = useQueryClient()

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: () => api.get('/api/settings'),
    })

    const [f, setF] = useState({
        whatsappEnabled: false,
        whatsappApiKey: '',
        ownerPhone: '',
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (settings) {
            setF({
                whatsappEnabled: settings.whatsappEnabled || false,
                whatsappApiKey: settings.whatsappApiKey || '',
                ownerPhone: settings.ownerPhone || '',
            })
        }
    }, [settings])

    const save = async () => {
        setLoading(true)
        try {
            await api.patch('/api/settings', {
                whatsappEnabled: f.whatsappEnabled,
                whatsappApiKey: f.whatsappApiKey || null,
                ownerPhone: f.ownerPhone || null,
            })
            toast.success('WhatsApp settings saved ✅')
            qc.invalidateQueries({ queryKey: ['settings'] })
        } catch (e) {
            console.error('Save error:', e)
            toast.error(e?.response?.data?.error || e?.message || 'Failed to save ❌')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="p-6 space-y-4 border-green-500/30">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageCircle className="text-green-500" size={24} />
                    <h3 className="font-bold text-lg">WhatsApp Integration</h3>
                </div>
                <Button onClick={save} variant="soft" disabled={loading}>
                    <Save size={16} className="inline mr-1" />
                    {loading ? 'Saving...' : 'Save'}
                </Button>
            </div>

            <div className="space-y-4">
                {/* Enable Toggle */}
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-bg rounded-lg border border-line hover:border-green-500/50 transition">
                    <input
                        type="checkbox"
                        checked={f.whatsappEnabled}
                        onChange={(e) => setF({ ...f, whatsappEnabled: e.target.checked })}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div>
                        <p className="font-bold text-sm">Enable Auto WhatsApp Receipts</p>
                        <p className="text-xs text-mut">Auto-send bill receipt to customer after payment</p>
                    </div>
                </label>

                {/* Owner Phone */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-mut uppercase">Owner Phone (For Alerts)</label>
                    <Input
                        value={f.ownerPhone}
                        onChange={(e) => setF({ ...f, ownerPhone: e.target.value })}
                        placeholder="+91 98765 43210"
                    />
                </div>

                {/* API Key */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-mut uppercase">API Key (Fast2SMS / Twilio)</label>
                    <Input
                        type="password"
                        value={f.whatsappApiKey}
                        onChange={(e) => setF({ ...f, whatsappApiKey: e.target.value })}
                        placeholder="Enter your API key here"
                    />
                    <p className="text-[11px] text-mut bg-amber-500/10 text-amber-400 p-2 rounded border border-amber-500/20">
                        💡 Currently in <b>Simulation Mode</b>. Messages will print in the backend console. Add a real API key to enable live sending.
                    </p>
                </div>
            </div>
        </Card>
    )
}
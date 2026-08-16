import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { inr, cn } from '@/lib/utils'

export default function VariantModal({ product, onClose, onAdd }) {
    const [variant, setVariant] = useState(null)
    const [mods, setMods] = useState([])

    useEffect(() => {
        if (product) {
            setVariant(product.variants?.find((v) => Number(v.delta) === 0) || product.variants?.[0] || null)
            setMods([])
        }
    }, [product])

    if (!product) return null

    const toggleMod = (m) =>
        setMods((cur) => (cur.some((x) => x.id === m.id) ? cur.filter((x) => x.id !== m.id) : [...cur, m]))

    const total =
        Number(product.price) + Number(variant?.delta || 0) + mods.reduce((s, m) => s + Number(m.delta), 0)

    return (
        <Modal open={!!product} onClose={onClose} title={`🍽 ${product.name}`}>
            <div className="space-y-4">
                {product.variants?.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-mut mb-2">Select size</p>
                        <div className="grid grid-cols-3 gap-2">
                            {product.variants.map((v) => (
                                <button key={v.id} onClick={() => setVariant(v)}
                                    className={cn('rounded-lg border p-2.5 text-center text-xs font-bold transition',
                                        variant?.id === v.id ? 'border-primary bg-primary-soft text-primary' : 'border-line text-mut')}>
                                    {v.name}
                                    <span className="block mt-0.5">{inr(Number(product.price) + Number(v.delta))}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {product.modifiers?.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-mut mb-2">Modifiers (optional)</p>
                        <div className="space-y-1.5">
                            {product.modifiers.map((m) => (
                                <label key={m.id} className="flex items-center justify-between bg-bg border border-line rounded-lg px-3 py-2 text-sm cursor-pointer">
                                    <span className="flex items-center gap-2">
                                        <input type="checkbox" checked={mods.some((x) => x.id === m.id)} onChange={() => toggleMod(m)} />
                                        {m.name}
                                    </span>
                                    {Number(m.delta) > 0 && <span className="text-primary text-xs font-bold">+{inr(m.delta)}</span>}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <Button className="w-full" onClick={() => { onAdd({ variant, modifiers: mods }); onClose() }}>
                    Add to Cart · {inr(total)}
                </Button>
            </div>
        </Modal>
    )
}
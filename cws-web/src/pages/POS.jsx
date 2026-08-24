import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, ShoppingCart, Trash2, Edit } from 'lucide-react'
import { api } from '@/lib/api'
import { usePermissions } from '@/hooks/usePermissions'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function POS() {
    // 🔐 USE PERMISSIONS HOOK (Like uploaded example)
    const { canView, canCreate, canUpdate, canDelete, isOwner } = usePermissions()

    const [cart, setCart] = useState([])
    const [search, setSearch] = useState('')

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => api.get('/api/products'),
    })

    // 🔐 ACCESS DENIED CHECK (Like uploaded Events page)
    if (!canView('POS')) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h2 className="text-xl font-semibold text-ink">Access Denied</h2>
                    <p className="text-sm text-mut mt-2">
                        You do not have permission to access POS.
                    </p>
                </div>
            </div>
        )
    }

    const addToCart = (product) => {
        // 🔐 PERMISSION CHECK BEFORE ACTION
        if (!canCreate('POS')) {
            toast.error('You cannot create bills ❌')
            return
        }
        setCart([...cart, { ...product, qty: 1 }])
    }

    const removeFromCart = (index) => {
        // 🔐 PERMISSION CHECK
        if (!canUpdate('POS')) {
            toast.error('You cannot modify bills ❌')
            return
        }
        setCart(cart.filter((_, i) => i !== index))
    }

    const checkout = async () => {
        if (!canCreate('POS')) {
            toast.error('Permission denied ')
            return
        }
        try {
            await api.post('/api/invoices', { items: cart })
            toast.success('Bill created! ✅')
            setCart([])
        } catch (e) {
            toast.error('Failed to create bill ❌')
        }
    }

    return (
        <div className="space-y-4">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold">🛒 POS</h1>

                {/* 🔐 CONDITIONAL RENDERING (Like uploaded example) */}
                {canCreate('POS') && (
                    <Button onClick={checkout} disabled={cart.length === 0}>
                        <Plus size={16} className="inline mr-1" />
                        Checkout
                    </Button>
                )}
            </div>

            {/* PRODUCTS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {products.map((product) => (
                    <Card
                        key={product.id}
                        className="p-4 cursor-pointer hover:border-primary transition"
                        onClick={() => addToCart(product)}
                    >
                        <p className="font-bold truncate">{product.name}</p>
                        <p className="text-sm text-mut">₹{product.price}</p>
                    </Card>
                ))}
            </div>

            {/* CART */}
            <Card className="p-4">
                <h3 className="font-bold mb-3">️ Cart ({cart.length})</h3>
                <div className="space-y-2">
                    {cart.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-bg rounded-lg">
                            <span className="text-sm">{item.name} × {item.qty}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">₹{item.price * item.qty}</span>

                                {/* 🔐 CONDITIONAL DELETE BUTTON */}
                                {canUpdate('POS') && (
                                    <button
                                        onClick={() => removeFromCart(index)}
                                        className="text-rose-400 hover:bg-rose-500/10 p-1 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Search,
    Users,
    Utensils,
    Package,
    CreditCard,
    Wallet,
    IndianRupee,
    Percent,
    Printer,
    Save,
    X,
    ChevronRight,
    Receipt,
    Clock,
    MapPin,
    Phone,
    Mail,
    Filter,
    Grid3x3,
    List,
    RefreshCw,
    AlertCircle,
    CheckCircle,
} from 'lucide-react'
import { api } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

// Order Types
const ORDER_TYPES = {
    DINE_IN: 'DINE_IN',
    TAKEAWAY: 'TAKEAWAY',
    DELIVERY: 'DELIVERY',
}

// Payment Methods
const PAYMENT_METHODS = {
    CASH: 'CASH',
    CARD: 'CARD',
    UPI: 'UPI',
    WALLET: 'WALLET',
}

export default function POS() {
    const qc = useQueryClient()

    // State
    const [cart, setCart] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const [orderType, setOrderType] = useState(ORDER_TYPES.DINE_IN)
    const [selectedTable, setSelectedTable] = useState(null)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [discount, setDiscount] = useState(0)
    const [discountType, setDiscountType] = useState('FIXED') // FIXED or PERCENT
    const [notes, setNotes] = useState('')
    const [viewMode, setViewMode] = useState('GRID') // GRID or LIST
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH)
    const [paidAmount, setPaidAmount] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    })

    // Fetch Data
    const { data: products = [], isLoading: productsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => api.get('/api/products'),
    })

    const { data: tables = [] } = useQuery({
        queryKey: ['tables'],
        queryFn: () => api.get('/api/tables'),
    })

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => api.get('/api/customers'),
    })

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category).filter(Boolean))
        return ['ALL', ...Array.from(cats)]
    }, [products])

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory
            const isAvailable = product.isAvailable !== false && product.stock > 0
            return matchesSearch && matchesCategory && isAvailable
        })
    }, [products, searchTerm, selectedCategory])

    // Cart Calculations
    const cartSummary = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
        const discountAmount = discountType === 'PERCENT'
            ? (subtotal * discount) / 100
            : discount
        const total = Math.max(0, subtotal - discountAmount)
        const change = paidAmount - total

        return {
            subtotal,
            discount: discountAmount,
            total,
            change,
            itemCount: cart.reduce((sum, item) => sum + item.qty, 0),
        }
    }, [cart, discount, discountType, paidAmount])

    // Add to cart
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, qty: item.qty + 1 }
                        : item
                )
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                qty: 1,
                category: product.category,
            }]
        })
    }

    // Update cart quantity
    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.qty + delta)
                return { ...item, qty: newQty }
            }
            return item
        }))
    }

    // Remove from cart
    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId))
    }

    // Clear cart
    const clearCart = () => {
        setCart([])
        setDiscount(0)
        setNotes('')
        setSelectedTable(null)
        setSelectedCustomer(null)
    }

    // Create new customer
    const handleCreateCustomer = async () => {
        if (!newCustomer.name || !newCustomer.phone) {
            toast.error('Name and Phone are required')
            return
        }

        try {
            const res = await api.post('/api/customers', newCustomer)
            setSelectedCustomer(res.data)
            setShowCustomerModal(false)
            setNewCustomer({ name: '', phone: '', email: '', address: '' })
            toast.success('Customer created successfully')
            qc.invalidateQueries({ queryKey: ['customers'] })
        } catch (error) {
            toast.error('Failed to create customer')
        }
    }

    // Process payment
    const handlePayment = async () => {
        if (cart.length === 0) {
            toast.error('Cart is empty')
            return
        }

        if (paidAmount < cartSummary.total) {
            toast.error('Paid amount is less than total')
            return
        }

        setIsProcessing(true)

        try {
            const invoiceData = {
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    amount: item.price * item.qty,
                })),
                subtotal: cartSummary.subtotal,
                discount: cartSummary.discount,
                total: cartSummary.total,
                paid: paidAmount,
                orderType,
                table: selectedTable?.name || null,
                customerId: selectedCustomer?.id || null,
                paymentMethod,
                notes,
            }

            await api.post('/api/invoices', invoiceData)

            toast.success('Invoice created successfully!')

            // Print receipt (optional)
            // handlePrintReceipt(invoiceData)

            setShowPaymentModal(false)
            clearCart()
            setPaidAmount(0)

            // Invalidate queries to refresh data
            qc.invalidateQueries({ queryKey: ['invoices'] })
            qc.invalidateQueries({ queryKey: ['products'] })

        } catch (error) {
            console.error('Payment error:', error)
            toast.error(error?.response?.data?.error || 'Failed to process payment')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="h-[calc(100vh-2rem)] flex gap-4">
            {/* LEFT SIDE - Products */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Header */}
                <Card className="p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'ALL' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex bg-muted rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('GRID')}
                                className={cn(
                                    'p-2 rounded-md transition',
                                    viewMode === 'GRID' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                                )}
                            >
                                <Grid3x3 size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('LIST')}
                                className={cn(
                                    'p-2 rounded-md transition',
                                    viewMode === 'LIST' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                                )}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Products Grid */}
                <Card className="flex-1 overflow-y-auto p-4">
                    {productsLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <RefreshCw className="animate-spin text-primary" size={32} />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Package size={48} className="mb-2 opacity-50" />
                            <p className="text-sm font-medium">No products found</p>
                        </div>
                    ) : viewMode === 'GRID' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="group relative bg-card border border-border rounded-xl p-4 hover:border-primary hover:shadow-lg transition-all duration-200 text-left"
                                >
                                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                                        <Utensils className="text-muted-foreground" size={32} />
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-primary">₹{product.price}</span>
                                        <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                                    </div>
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="w-full group flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary hover:shadow-md transition-all duration-200"
                                >
                                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Utensils className="text-muted-foreground" size={24} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-semibold mb-1">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground">{product.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-primary block">₹{product.price}</span>
                                        <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                                    </div>
                                    <Plus className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
                                </button>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* RIGHT SIDE - Cart */}
            <div className="w-96 flex flex-col gap-4">
                {/* Order Info Card */}
                <Card className="p-4 space-y-3">
                    {/* Order Type */}
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(ORDER_TYPES).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => setOrderType(value)}
                                className={cn(
                                    'px-3 py-2 rounded-lg text-xs font-bold transition-all',
                                    orderType === value
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                )}
                            >
                                {key.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Table Selection (for Dine-in) */}
                    {orderType === ORDER_TYPES.DINE_IN && (
                        <select
                            value={selectedTable?.id || ''}
                            onChange={(e) => setSelectedTable(tables.find(t => t.id === e.target.value))}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                        >
                            <option value="">Select Table</option>
                            {tables.filter(t => t.status === 'FREE').map(table => (
                                <option key={table.id} value={table.id}>
                                    {table.name} ({table.seats} seats)
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Customer Selection */}
                    <div className="flex gap-2">
                        <select
                            value={selectedCustomer?.id || ''}
                            onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value))}
                            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                        >
                            <option value="">Walk-in Customer</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCustomerModal(true)}
                        >
                            <Plus size={16} />
                        </Button>
                    </div>

                    {/* Selected Customer Info */}
                    {selectedCustomer && (
                        <div className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded-lg">
                            <Users size={14} className="text-muted-foreground" />
                            <span className="font-medium">{selectedCustomer.name}</span>
                            {selectedCustomer.phone && (
                                <span className="text-muted-foreground">• {selectedCustomer.phone}</span>
                            )}
                        </div>
                    )}
                </Card>

                {/* Cart Items */}
                <Card className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <ShoppingCart size={20} />
                            Order Items
                        </h3>
                        <span className="text-sm text-muted-foreground">
                            {cartSummary.itemCount} items
                        </span>
                    </div>

                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <ShoppingCart size={48} className="mb-2 opacity-50" />
                            <p className="text-sm font-medium">Cart is empty</p>
                            <p className="text-xs">Add products to start billing</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground">{item.price} each</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center hover:border-primary transition-colors"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center hover:border-primary transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <div className="text-right min-w-[60px]">
                                        <p className="font-bold text-sm">{item.price * item.qty}</p>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Cart Summary */}
                <Card className="p-4 space-y-3">
                    {/* Discount */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                type="number"
                                placeholder="Discount"
                                value={discount || ''}
                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                className="text-sm"
                            />
                        </div>
                        <select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value)}
                            className="px-3 py-2 bg-background border border-border rounded-lg text-sm font-medium"
                        >
                            <option value="FIXED"> Fixed</option>
                            <option value="PERCENT">%</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <Input
                        placeholder="Order notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-sm"
                    />

                    {/* Summary */}
                    <div className="space-y-2 pt-3 border-t border-border">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">₹{cartSummary.subtotal.toFixed(2)}</span>
                        </div>
                        {cartSummary.discount > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span>Discount</span>
                                <span>-₹{cartSummary.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                            <span>Total</span>
                            <span className="text-primary">₹{cartSummary.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={clearCart}
                            disabled={cart.length === 0}
                            className="text-destructive hover:bg-destructive/10"
                        >
                            <X size={16} className="mr-1" />
                            Clear
                        </Button>
                        <Button
                            onClick={() => setShowPaymentModal(true)}
                            disabled={cart.length === 0}
                            className="bg-primary hover:bg-primary/90"
                        >
                            <CreditCard size={16} className="mr-1" />
                            Payment
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Payment Modal */}
            <Modal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Process Payment"
                className="max-w-2xl"
            >
                <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                        </div>
                        {cartSummary.discount > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span>Discount</span>
                                <span>-₹{cartSummary.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Total Amount</span>
                            <span className="text-primary">₹{cartSummary.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => setPaymentMethod(value)}
                                    className={cn(
                                        'p-3 rounded-lg border-2 transition-all flex items-center gap-2',
                                        paymentMethod === value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                    )}
                                >
                                    {value === PAYMENT_METHODS.CASH && <Wallet size={18} />}
                                    {value === PAYMENT_METHODS.CARD && <CreditCard size={18} />}
                                    {value === PAYMENT_METHODS.UPI && <Phone size={18} />}
                                    {value === PAYMENT_METHODS.WALLET && <IndianRupee size={18} />}
                                    <span className="font-medium">{key}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Paid Amount */}
                    <div>
                        <label className="text-sm font-semibold mb-2 block">Amount Received</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                type="number"
                                value={paidAmount || ''}
                                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                                className="pl-10 text-lg font-bold"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Change */}
                    {paidAmount > 0 && (
                        <div className={cn(
                            'p-3 rounded-lg flex justify-between items-center',
                            cartSummary.change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive'
                        )}>
                            <span className="font-medium">Change to Return</span>
                            <span className="text-xl font-bold">₹{Math.max(0, cartSummary.change).toFixed(2)}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowPaymentModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePayment}
                            disabled={isProcessing || paidAmount < cartSummary.total}
                            className="flex-1 bg-primary hover:bg-primary/90"
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw size={16} className="mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} className="mr-2" />
                                    Confirm Payment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Customer Modal */}
            <Modal
                open={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                title="Add New Customer"
            >
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-semibold mb-1 block">Name *</label>
                        <Input
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            placeholder="Customer name"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-1 block">Phone *</label>
                        <Input
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            placeholder="Phone number"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-1 block">Email</label>
                        <Input
                            type="email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-1 block">Address</label>
                        <Input
                            value={newCustomer.address}
                            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                            placeholder="Address"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowCustomerModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleCreateCustomer} className="flex-1">
                            Create Customer
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
export default function Modal({ open, onClose, title, children, wide }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} bg-card border border-line rounded-2xl p-5 shadow-2xl`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold">{title}</h3>
                    <button onClick={onClose} className="text-mut hover:text-ink">✕</button>
                </div>
                {children}
            </div>
        </div>
    )
}
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Receipt from './Receipt'
import { printReceipt } from '@/lib/print'

export default function InvoiceDetail({ inv, onClose }) {
    return (
        <Modal open={!!inv} onClose={onClose} title={`🧾 Invoice #${inv?.number ?? ''}`} wide>
            {inv && (
                <div className="space-y-4">
                    <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-line bg-white/10 p-4">
                        <Receipt inv={inv} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => printReceipt('thermal')}>🖨 Print · 80mm</Button>
                        <Button variant="soft" onClick={() => printReceipt('a4')}>📄 PDF · A4 GST</Button>
                    </div>
                </div>
            )}
        </Modal>
    )
}
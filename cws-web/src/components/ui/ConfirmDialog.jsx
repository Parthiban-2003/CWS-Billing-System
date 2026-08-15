import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Delete', danger = true }) {
    return (
        <Modal open={open} onClose={onClose} title={title}>
            <p className="text-sm text-mut">{message}</p>
            <div className="flex gap-2 mt-5 justify-end">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose() }}>
                    {confirmText}
                </Button>
            </div>
        </Modal>
    )
}
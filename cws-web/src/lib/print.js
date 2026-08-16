import { RECEIPT_CSS } from './receiptCss'

export function printReceipt(mode = 'thermal') {
    const node = document.getElementById('receipt-print')
    if (!node) return

    const pageSize =
        mode === 'thermal'
            ? '@page { size: 80mm auto; margin: 0; } .rc { width: 76mm; border-radius: 0; }'
            : '@page { size: A4; margin: 12mm; } .rc { width: 100%; max-width: 720px; border-radius: 0; }'

    const w = window.open('', '_blank')
    w.document.write(`<!doctype html><html><head><title>Receipt</title>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet" />
    <style>${RECEIPT_CSS} ${pageSize}</style>
  </head><body>${node.innerHTML}</body></html>`)
    w.document.close()

    setTimeout(() => { w.focus(); w.print() }, 400)
}
import { NextResponse } from 'next/server'
import { sendWhatsApp, formatBillReceipt } from '@modules/whatsapp'
import { prisma } from '@/database/client'

export async function POST(req: Request) {
    try {
        const { invoiceId, phone, message } = await req.json()

        let finalPhone = phone
        let finalMessage = message

        // If invoiceId is provided, fetch and format receipt
        if (invoiceId) {
            const invoice = await prisma.invoice.findUnique({
                where: { id: invoiceId },
                include: { items: true, customer: true },
            })
            if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

            finalPhone = invoice.customer?.phone || phone
            finalMessage = formatBillReceipt(invoice)
        }

        if (!finalPhone || !finalMessage) {
            return NextResponse.json({ error: 'Phone and message required' }, { status: 400 })
        }

        const result = await sendWhatsApp(finalPhone, finalMessage)
        return NextResponse.json(result)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
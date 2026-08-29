import { prisma } from '@/database/client'
import { DEV_TENANT_ID } from '@/config/tenant'

// 📱 WhatsApp Sender Service (Fast2SMS / Twilio format)
export const sendWhatsApp = async (phone: string, message: string) => {
    if (!phone || phone.length < 10) {
        return { success: false, error: 'Invalid phone number' }
    }

    // Fetch settings to check if enabled and get API key
    const settings = await prisma.tenantSetting.findUnique({ where: { tenantId: DEV_TENANT_ID } })
    const isEnabled = settings?.whatsappEnabled === true
    const apiKey = settings?.whatsappApiKey || process.env.FAST2SMS_API_KEY

    if (!isEnabled || !apiKey) {
        console.log('⚠️ WhatsApp disabled or API key missing. Message:', message)
        return { success: false, error: 'WhatsApp not configured' }
    }

    try {
        // 🧪 SIMULATION MODE (Development)
        if (process.env.NODE_ENV === 'development') {
            console.log(`\n [SIMULATED WHATSAPP] To: ${phone}\nMessage:\n${message}\n`)
            return { success: true, simulated: true }
        }

        // 🚀 REAL API CALL (Fast2SMS Example)
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
                authorization: apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                route: 'q', // WhatsApp route
                message: message,
                language: 'english',
                numbers: phone.replace(/\D/g, ''), // Remove non-digits
            }),
        })
        const data = await response.json()
        return data
    } catch (error: any) {
        console.error('WhatsApp Error:', error)
        return { success: false, error: error.message }
    }
}

// 🧾 Format Bill Receipt
export const formatBillReceipt = (invoice: any) => {
    let msg = `🧾 *Bill Receipt - #${invoice.number}*\n`
    msg += `📅 Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}\n\n`
    msg += `*Items:*\n`

    invoice.items.forEach((item: any) => {
        msg += `• ${item.name} x${item.qty} = ₹${item.amount}\n`
    })

    if (invoice.discount > 0) msg += `\nDiscount: -₹${invoice.discount}`
    if (invoice.service > 0) msg += `\nService: +₹${invoice.service}`

    msg += `\n\n💰 *Total: ₹${invoice.total}*\n`
    msg += `Status: ${invoice.status}\n\n`
    msg += `Thank you for visiting! `

    return msg
}

// ️ Format Owner Alert
export const formatOwnerAlert = (type: string, data: any) => {
    if (type === 'LOW_STOCK') {
        return `⚠️ *Low Stock Alert*\n\nItem: ${data.name}\nCurrent: ${data.stock}\nMin: ${data.min}\n\nOrder soon! 🛒`
    }
    if (type === 'DAILY_SUMMARY') {
        return `📊 *Daily Summary*\n\nBills: ${data.bills}\nRevenue: ₹${data.revenue}\n\nGreat job! 💪`
    }
    return `🔔 Alert: ${type}`
}
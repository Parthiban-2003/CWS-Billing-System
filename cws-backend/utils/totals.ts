export function calcTotals(
    items: { price: number; qty: number }[],
    opts: { discountPct?: number; servicePct?: number; taxPct?: number } = {},
) {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    const discount = subtotal * ((Number(opts.discountPct) || 0) / 100)
    const service = (subtotal - discount) * ((Number(opts.servicePct) || 0) / 100)
    const tax = (subtotal - discount + service) * ((Number(opts.taxPct) || 0) / 100)
    const gross = subtotal - discount + service + tax
    return { subtotal, discount, service, tax, roundOff: Math.round(gross) - gross, total: Math.round(gross) }
}
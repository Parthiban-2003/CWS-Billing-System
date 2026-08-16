export function calcTotals(items, { discountPct = 0, servicePct = 0, taxPct = 0 } = {}) {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    const discount = subtotal * (Number(discountPct) / 100)
    const service = (subtotal - discount) * (Number(servicePct) / 100)
    const tax = (subtotal - discount + service) * (Number(taxPct) / 100)
    const gross = subtotal - discount + service + tax
    return { subtotal, discount, service, tax, roundOff: Math.round(gross) - gross, total: Math.round(gross) }
}
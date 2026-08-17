export function calcTotals(items, { discountPct = 0, servicePct = 0, taxPct = 0, happyPct = 0 } = {}) {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    const manual = subtotal * (Number(discountPct) / 100)
    const happy = (subtotal - manual) * (Number(happyPct) / 100)
    const discount = manual + happy
    const service = (subtotal - discount) * (Number(servicePct) / 100)
    const tax = (subtotal - discount + service) * (Number(taxPct) / 100)
    const gross = subtotal - discount + service + tax
    return { subtotal, discount, happy, service, tax, roundOff: Math.round(gross) - gross, total: Math.round(gross) }
}
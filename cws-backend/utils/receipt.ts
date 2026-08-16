export const num = (v: unknown) => Number(v) || 0

export const cleanMoney = (obj: any, fields: string[]) => {
    const out = { ...obj }
    fields.forEach((f) => { if (out[f] !== undefined) out[f] = Number(out[f]) })
    return out
}
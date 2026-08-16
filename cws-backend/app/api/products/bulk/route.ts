import { NextResponse } from 'next/server'
import { bulkPrice } from '@modules/products'
import { bulkSchema } from '@modules/products'

export async function PATCH(req: Request) {
    const p = bulkSchema.safeParse(await req.json())
    if (!p.success) return NextResponse.json({ error: p.error.issues }, { status: 400 })
    const count = await bulkPrice(p.data.pct)
    return NextResponse.json({ ok: true, updated: count })
}
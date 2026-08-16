import { NextResponse } from 'next/server'
import { update, remove, productSchema } from '@modules/products'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const p = productSchema.partial().safeParse(await req.json())
    if (!p.success) return NextResponse.json({ error: p.error.issues }, { status: 400 })
    return NextResponse.json(await update(id, p.data))
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    await remove(id)
    return NextResponse.json({ ok: true })
}
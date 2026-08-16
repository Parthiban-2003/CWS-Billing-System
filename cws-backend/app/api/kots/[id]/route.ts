import { NextResponse } from 'next/server'
import { move, kotStatusSchema } from '@modules/kots'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const p = kotStatusSchema.safeParse(await req.json())
    if (!p.success) return NextResponse.json({ error: p.error.issues }, { status: 400 })
    return NextResponse.json(await move(id, p.data.status))
}
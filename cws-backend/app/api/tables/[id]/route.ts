import { NextResponse } from 'next/server'
import { setStatus, statusSchema } from '@modules/tables'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const p = statusSchema.safeParse(await req.json())
    if (!p.success) return NextResponse.json({ error: p.error.issues }, { status: 400 })
    return NextResponse.json(await setStatus(id, p.data.status))
}
import { NextResponse } from 'next/server'
import { markRead } from '@modules/notifications'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    await markRead(id)
    return NextResponse.json({ ok: true })
}
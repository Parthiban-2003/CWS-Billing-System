import { NextResponse } from 'next/server'
import { list, markAllRead } from '@modules/notifications'

export async function GET() {
    return NextResponse.json(await list())
}

export async function PATCH() {
    await markAllRead()
    return NextResponse.json({ ok: true })
}